# Foundation 01 — Runtime: Bun

**Status**: Locked (ADR-0007) · **Updated**: 2026-09-08 · **Docset**: v0.3

Bun is the primary runtime; Node is a compatible output target via presets. App code is written against Web Standards (`Request`, `Response`, `fetch`, `WebSocket`) so runtime differences stay in the framework.

## Execution model

| Phase | Runtime | Why |
|---|---|---|
| `kwiva dev` | Bun | native TS, `Bun.serve` dev server, HMR |
| `kwiva test` | Bun (`bun test`) | native TS test runner, fast |
| `kwiva console` | Bun REPL | app context loaded |
| `kwiva build` (bun preset) | Bun | `Bun.serve` production, SO_REUSEPORT |
| `kwiva build` (node preset) | Node | portable `.mjs` output |
| `kwiva build --binary` | Bun compiled | single-file executable |
| edge presets | isolates (V8) | via Nitro unenv shims |

## Bun capabilities the framework uses

| Capability | Framework use |
|---|---|
| Native TS/JSX execution | dev server runs app sources without transpile |
| `Bun.serve` | dev server + bun-preset production server, routes, WebSockets |
| `Bun.sql` (Postgres) | fast-path driver inside `@kwiva/data` engine wiring |
| Bun Redis/S3 clients | storage/cache engine backends (via unstorage drivers where sensible) |
| `bun build --compile` | standalone single-binary mode |
| `bun test` | `@kwiva/testing` harness runner |
| Bun install | workspace/package management for the monorepo |
| SO_REUSEPORT | multi-process production listening (bun preset) |

## Runtime-agnostic app contract

- Web `Request`/`Response` everywhere (framework context wraps them).
- `fetch` for outbound HTTP (service layer) — no `node:http`.
- Web `WebSocket` / CrossWS channels — no `ws` package in app code.
- Web `crypto`, `URL`, `TextEncoder/Decoder`.
- File storage via `storage` API — never `fs` paths in app code.

The `no-engine-imports` + runtime-gates in oxlint flag `node:*` and `bun:*` imports in app code; the framework owns those touch points.

## Fallbacks

| Concern | Bun path | Node path |
|---|---|---|
| Dev server | `Bun.serve` + oxc transform | same server via Node http adapter (`adapter/web-standard`) |
| SQL driver | `Bun.sql` | postgres driver via Drizzle |
| Test runner | `bun test` | `bun test` still runs (Bun binary is a dev dependency for the repo); CI matrix includes Node-only consumers of built output |
| Binary artifact | `bun build --compile` | Docker image + `node .output/server/index.mjs` |

## Cluster & performance (production)

- `kwiva build --preset bun` + cluster mode (v1.x, SO_REUSEPORT): workers per core.
- Health/readiness endpoints for orchestrators; graceful shutdown hooks via `defineApp` providers.
- Compile flags follow research: `--minify-syntax` (not full `--minify`) when OTel is enabled — preserves function names for tracing.
