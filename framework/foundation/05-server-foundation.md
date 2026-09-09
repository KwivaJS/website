# Foundation 05 — Server Foundation

**Status**: Locked (ADR-0002, ADR-0016) · **Updated**: 2026-09-08 · **Docset**: v0.3

The server core: how the owned HTTP pipeline and the app kernel ride on the **Nitro engine** (hidden). App code never sees `nitropack`, `h3`, or presets by name.

## Composition

```
defineApp (kernel: models, controllers, middleware, providers, config)
   │
   ▼
@kwiva/http compose()                    (owned pipeline, Elysia-shaped)
   │  route manifest → handler tree (context → lifecycle → validation → handler)
   ▼
adapter/web-standard                        (Request → Response)
   │
   ▼
Nitro server build (engine)                 (entry, route rules, tasks, storage, ws, presets)
   │
   ▼
preset output (.output/)                    node · bun · cloudflare · vercel · netlify · lambda · static
```

## What the engine provides (hidden)

| Engine capability | Framework surface |
|---|---|
| Deploy presets (20+) | `kwiva build --preset` / `kwiva deploy` |
| Route rules (swr/isr/cache/redirect/proxy/headers) | `defineServerRoute` options |
| unstorage mounts | `cache` / `storage` / session store APIs |
| Tasks + cron execution | `defineTask` + `src/config/schedule.ts` |
| WebSockets (CrossWS) | channels API (`channel(...)`), `c.ws(...)` |
| Prerender crawler | `kwiva build` prerender step |
| Runtime config channel | config folder → runtime overrides |
| OpenAPI helpers | manifest-rendered spec (own) |

## What Kwiva owns on top

- The request pipeline (context, lifecycle, guards, macros) — ADR-0003.
- The route manifest (IR) and everything derived from it (client, OpenAPI, MCP, Studio).
- SSR orchestration (ADR-0006) — the engine serves; the framework renders.
- Error taxonomy, security defaults, tenancy scoping.

## Server entry (generated, never written by apps)

```ts
// .kwiva/server.ts (generated at build)
import { app } from '../src/bootstrap/app'
import { compose } from '@kwiva/http'

const handler = compose(app)          // web-standard (req) => Response
export default handler                 // consumed by the engine server entry
```

## Lifecycle

```
boot:
  config folder load + env validation
  → engine init (storage mounts, cache, task scheduler)
  → model scan → IR → migrations check (dev warns on drift)
  → route registration (generated + controllers + server routes)
  → providers boot (services, queue workers if in-process)
  → listen (preset adapter)

request: pipeline (foundation/04) → response

shutdown:
  providers stop → queue drain → engine stop → process exit
```

## Scaling model

| Deployment | How |
|---|---|
| Single process | default presets |
| Multi-core | `node_cluster` preset / bun SO_REUSEPORT (v1.x `--cluster`) |
| Multiple instances | stateless app + externalized state (Postgres, Redis cache/queue, object storage) — enforced defaults |
| Edge | worker presets; constraint set in [06-adapter-matrix](../06-adapter-matrix.md) |
| Binary | `kwiva build --binary` (Bun compile) |

## Dev vs prod parity

`kwiva dev` runs the **same composed handler** in-process on `Bun.serve` (no bundling of server code — Bun executes TS natively). Production builds target the preset. The pipeline is identical; only the carrier differs.
