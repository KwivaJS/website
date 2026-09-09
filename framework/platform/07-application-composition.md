# Platform 07 — Application Composition

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

`defineApp` — the kernel that composes everything (config, models, HTTP, modules, providers) into one runnable application.

## The kernel

```ts
// src/bootstrap/app.ts
import { defineApp } from '@kwiva/core'
import auth from '../app/http/auth'

export const app = defineApp({
  auth,

  // discovered (scan-based; explicit override possible)
  models, controllers, middleware, jobs, events, tasks, policies, pages,

  // explicit composition
  providers: [
    telemetryProvider,           // OTel init (from src/config/telemetry.ts)
    queueProvider,               // queue transport (from src/config/queue.ts)
    storageProvider,             // disks (from src/config/storage.ts)
  ],

  // app-level context
  state: { startTime: Date.now() },
  decorate: { /* singletons */ },
  resolve: [/* per-request derivations */],

  // route-level reusable keys
  macros: { auth, cache, rateLimit },
})
```

## Composition order (boot)

```
1. config folder load + env validation        (fail-fast)
2. module contributions merge (models/config/migrations)
3. model scan → IR → migrations drift check (dev warn)
4. route registration: generated model routes + controllers + server routes + module routes
5. middleware stack assembly (config order)
6. providers boot (telemetry, queue, storage, custom services)
7. engine init (storage mounts, cache, task scheduler, ws)
8. listen (preset adapter)
```

Shutdown inverts: providers stop → queue drain → engine stop.

## Adding capabilities = adding defineX files

The composition story: capabilities are files in the standard tree. There is no "register the router" step, no "add the cache plugin" step — discovery + config does it:

| I want… | I add… |
|---|---|
| a new resource | `src/app/models/x.ts` (+ optional controller) |
| authenticated pages | `src/app/http/auth.ts` + middleware in stack |
| background processing | `src/app/jobs/x.ts` + queue config |
| realtime | event + channel policy |
| Kwiva Studio | `studio: { enabled: true }` |
| agent access | `src/config/mcp.ts` |
| reusable capability | a module |
| envs/deploy targets | presets — zero code changes |

## Per-mode composition

| Mode | Kernel assembly |
|---|---|
| `fullstack` | everything |
| `api+spa` | no pages SSR; SPA shell |
| `static` | pages + prerender only; no http/jobs |
| `standalone` | fullstack + binary output |
| `edge` | fullstack under the edge constraint set |

## Testing composition

`withApp` boots the real kernel (in-memory adapters where possible) — tests compose exactly like production; `createTestClient(app)` speaks to it in-process.

## Size/complexity ladder

1. Static site: model-less pages — kernel still required (config + pages + prerender).
2. CRUD app: + one model, zero controllers.
3. SaaS: + auth/policies/tenancy/Studio.
4. Realtime: + events/channels/jobs.
5. Platform: + modules, MCP, multi-preset deploys.

The kernel shape never changes — only which `defineX` files exist.
