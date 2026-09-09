# Research — Elysia

**Source**: https://elysiajs.com (docs: patterns, plugins, integrations, deploy) + https://github.com/elysiajs/elysia (repo tree, live research 2026-09-08)
**Relevance**: **Reference only** (ADR-0003, ADR-0016) — models the structure and API philosophy of `@kwiva/http` (owned, zero dependency). Kwiva never imports `elysia`.

## Positioning

Elysia is a Bun-first, cross-runtime HTTP framework (runs Bun, Node, Deno, Cloudflare Workers, Vercel, Netlify). Killer feature: **end-to-end type inference** — `typeof app` gives complete route types; the Eden Treaty client consumes them with zero codegen. Elysia 2.0 (beta) introduces **Standard Schema** support uniformly (TypeBox, Zod, Valibot, ArkType, Effect).

## Repo Structure (what `packages/http` mirrors — ADR-0017)

Captured from https://github.com/elysiajs/elysia/tree/main (v1.4.30):

```
elysia/
├─ src/
│  ├─ adapter/            # bun · cloudflare-worker · web-standard · utils
│  ├─ type-system/        # format · utils · types (validation typing internals)
│  ├─ universal/          # server · env · file (runtime-agnostic helpers)
│  ├─ ws/                 # bun · types (WebSocket surfaces)
│  └─ flat core: context.ts · compose.ts · cookies.ts · dynamic-handle.ts ·
│     error.ts · formats.ts · index.ts · manifest.ts · parse-query.ts ·
│     replace-schema.ts · schema.ts · sucrose.ts · trace.ts · types.ts · utils.ts
├─ example/               # demo app
├─ test/                  # functionality · types · node · cloudflare (split suites)
├─ build.ts · knip.json · package.json · tsconfig*.json · AGENTS.md · CLAUDE.md
```

- Single package with deep subpath exports (`elysia/context`, `elysia/error`, `elysia/adapter/bun`, `elysia/universal`, `elysia/ws`, …); plugins are separate `@elysiajs/*` packages.
- Kwiva mirrors the **tree** inside `packages/http/src` (context/compose/cookies/error/manifest/parse-query/formats/trace + controller/ middleware/ routes/ tasks/ ws/ type-system/ universal/ adapter/) and the **repo shape** (`example/`, `test/{functionality,types,node,cloudflare}`, `build.ts`, `knip.json`) — with many equal `@kwiva/*` packages instead of one (ADR-0017).
- kwiva test-suite split adopts the same four-way structure (`application/02`).

## Core Concepts (what `defineController` mirrors)

- **Instance/state/macro**: `.state()`, `.decorate()`, `.resolve()` per-request context; `.use()` for plugins. → Kwiva: `defineApp` state/decorate/resolve; `definePlugin`.
- **Lifecycle**: `onRequest`, `onParse`, `onTransform`, `onBeforeHandle`, `onAfterHandle`, `onResponse`, `onError`, `onStop` — the exact lifecycle `@kwiva/http` reimplements (app/controller/route scoped).
- **Validation**: body/query/params/headers/cookie schemas via Standard Schema; typed `this` in handlers. → Kwiva: same stages, Valibot default (switchable).
- **Macro**: reusable accessor bundles. → Kwiva: `defineApp > macros` + route-level keys.
- **Mounting**: express-style and adapter mount patterns; `app.compile()` yields a web-standard handler. → Kwiva: `compose(app)` produces the `(Request) => Response` the engine consumes.
- **OpenAPI**: `@elysiajs/openapi` auto-generates from route schemas + meta. → Kwiva: route manifest → OpenAPI 3.1.
- **Eden**: treaty typed client, zero codegen, works server- & client-side. → Kwiva: `@kwiva/client` — same zero-codegen, type-level inference from the route manifest.

## Plugins (official — inform our plugin surface)

bearer, cors, cron, graphql-apollo/graphql-yoga, html, jwt, openapi, opentelemetry, server-timing, static. Kwiva ships equivalents as first-party plugins/config (`server/02`).

## Deploy Patterns (captured from docs — still valid for our Bun engine runtime)

- **Cluster mode**: `node:cluster` fork per CPU core; Bun uses SO_REUSEPORT (Linux).
- **Compile to binary**: `bun build --compile --minify-whitespace --minify-syntax --target bun --outfile server src/index.ts` — 2-3x memory reduction; no Bun needed on host; per-platform targets; requires AVX2; **don't use full `--minify`** if using OpenTelemetry (silently breaks tracing fn names).
- **Compile to JS**: `bun build --outfile ./dist/index.js src/index.ts`; run `NODE_ENV=production bun ./dist/index.js`.
- **Docker**: distroless base + binary; bake `--external pg` for instrumented libs; keep prod `node_modules`.
- **Railway**: listen on `process.env.PORT ?? 3000`; hostname auto-0.0.0.0.

## Better Auth Integration (pattern our `@kwiva/auth` mirrors)

`app.mount(auth.handler)` + macro exposing session/context — Kwiva wires the Better Auth engine behind `defineAuth` + `requireAuth` middleware + typed `ctx.session`.

## How Kwiva Composes (owned pipeline, Elysia-shaped)

```ts
// .kwiva/server.ts (generated) — the owned composition replaces Elysia's compile()
import { app } from '../src/bootstrap/app'
import { compose } from '@kwiva/http'

export default compose(app)   // (Request) => Response — consumed by the Nitro server entry
```

## Version Signals

1.x stable; 2.0 beta (Standard Schema central; breaking changes tracked in changelog). As a reference (not a dependency), Kwiva tracks its API evolution for ideas — no version pin, no upgrade coupling.
