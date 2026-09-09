# Application 02 — Package Architecture

**Status**: Locked (ADR-0017, ADR-0021) · **Updated**: 2026-09-08 · **Docset**: v0.3

The Kwiva monorepo: **many equal `@kwiva/*` packages**, repo-level layout mirroring elysiajs/elysia, and the HTTP package's internal tree mirroring Elysia's `src/`.

## Repo layout (mirrors https://github.com/elysiajs/elysia)

```
kwiva/                          # github.com/kwiva-dev/kwiva
├─ packages/                       # many equal packages (vs elysia's single package)
│  ├─ core/                        # @kwiva/core
│  ├─ config/                      # @kwiva/config
│  ├─ schema/                      # @kwiva/schema
│  ├─ data/                        # @kwiva/data
│  ├─ http/                        # @kwiva/http
│  ├─ router/                      # @kwiva/router
│  ├─ react/                       # @kwiva/react
│  ├─ client/                      # @kwiva/client
│  ├─ services/                    # @kwiva/services
│  ├─ queue/                       # @kwiva/queue
│  ├─ events/                      # @kwiva/events
│  ├─ auth/                        # @kwiva/auth
│  ├─ studio/                       # @kwiva/studio — Kwiva Studio (generated operations UI)
│  ├─ mcp/                         # @kwiva/mcp
│  ├─ ui-kit/                      # @kwiva/ui-kit
│  ├─ cli/                         # @kwiva/cli (the `kwiva` binary)
│  └─ testing/                     # @kwiva/testing
├─ example/                        # demo app (like elysia example/) — the dogfood app
├─ test/
│  ├─ functionality/               # integration tests across packages (bun test)
│  ├─ types/                       # type-level tests (expect-type)
│  ├─ node/                        # node-preset output smoke tests
│  └─ cloudflare/                  # worker-preset output smoke tests
├─ build.ts                        # package build orchestration (rolldown + isolated declarations)
├─ knip.json                       # dead-code detection (like elysia)
├─ AGENTS.md                       # agent/contributor conventions (like elysia)
├─ tsconfig.json / tsconfig.test.json
└─ package.json                    # workspaces (bun)
```

Why mirror Elysia's repo: proven minimal layout for a typed framework project — `src` + `example` + split test suites + knip. Kwiva deviates in one way: **many equal packages** instead of one, so each concern versions and fails independently (ADR-0017).

## Package dependency graph (strict, acyclic)

```
cli ──► http · react · data · auth · studio · cli-tooling (oxc)
studio ──► react · ui-kit · data
react ──► router · client · query(engine, sealed)
client ──► core (types only)
http  ──► core · schema · data (peer: nitro engine)
data  ──► core · schema (engine: drizzle, sealed)
auth  ──► core · http (engine: better-auth, sealed)
queue ──► core · events
events ──► core · data
services ──► core
config ──► core
schema ──► (nothing — leaf)
core  ──► (nothing — leaf)
```

Rules: `core` and `schema` are leaves; nothing imports `cli`; app-facing packages never re-export engine APIs.

## `packages/http` internal tree (mirrors elysia src/)

```
packages/http/src/
├─ context.ts             # typed request context (Elysia context.ts parallel)
├─ compose.ts             # route composition → handler tree
├─ dynamic-handle.ts      # runtime registration (model-generated routes)
├─ manifest.ts            # route manifest IR (client/OpenAPI/MCP source)
├─ schema.ts              # per-route validation wiring
├─ error.ts               # error() helpers + taxonomy mapping
├─ cookies.ts             # cookie parsing/serialization
├─ parse-query.ts         # fast query parsing
├─ formats.ts             # content negotiation
├─ trace.ts               # OTel interop hooks
├─ types.ts  utils.ts
├─ controller/            # defineController + guard/macro/group
├─ middleware/            # defineMiddleware pipeline
├─ routes/                # defineServerRoute + route rules mapping (→ Nitro)
├─ tasks/                 # defineTask + schedule mapping
├─ ws/                    # channels + ws route types (elysia src/ws parallel)
├─ type-system/           # route typing internals (elysia type-system parallel)
├─ universal/             # server · env · file helpers (elysia universal parallel)
└─ adapter/               # bun · web-standard · cloudflare-worker
```

The adapter/universal/ws/type-system split is the Elysia structural pattern applied to Kwiva's owned pipeline: one Web-Standard core, per-runtime adapters, typed edges.

## Package exports (subpaths, mirroring elysia's exports map)

```jsonc
// packages/http/package.json (excerpt)
{
  "name": "@kwiva/http",
  "exports": {
    ".":            "./dist/index.js",
    "./controller": "./dist/controller/index.js",
    "./middleware": "./dist/middleware/index.js",
    "./ws":         "./dist/ws/index.js",
    "./universal":  "./dist/universal/index.js",
    "./adapter/bun":              "./dist/adapter/bun.js",
    "./adapter/web-standard":     "./dist/adapter/web-standard.js",
    "./adapter/cloudflare-worker":"./dist/adapter/cloudflare-worker.js",
    "./error":      "./dist/error.js",
    "./types":      "./dist/types.d.ts"
  }
}
```

## Versioning & publishing

- Independent semver per package; a shared changeset repo tool (`changesets`-style) drives releases.
- Compatibility contract: peer ranges for engines (nitropack, drizzle-orm, better-auth, @tanstack/query, react, tailwind) documented per release.
- `build.ts` produces per-package `dist/` via **rolldown** + **oxc isolated declarations** (`.d.ts` without typecheck) — the oxc deep integration (ADR-0021).
- `knip.json` + oxlint keep the monorepo dead-code-free (like elysia's `deadcode` script).

## Testing structure (mirrors elysia test/ split)

| Suite | Runner | What |
|---|---|---|
| `test/functionality` | bun test | real app boot, HTTP round-trips, DB (SQLite), queue in-memory |
| `test/types` | tsc + expect-type | end-to-end type inference: model → client → hooks |
| `test/node` | node | node-preset built output smoke tests |
| `test/cloudflare` | wrangler/vitest-workers | worker-preset output smoke tests |
