# Applications (/docs/core-concepts/applications)



## What is defineApp? [#what-is-defineapp]

`defineApp` is the application kernel. It lives in `src/bootstrap/app.ts` and is the single place where the pieces of your application are wired together: configuration, models, controllers, middleware, pages, modules, providers, and per-request context behavior. It is also a `defineX` factory, so it follows the same grammar as everything else — plain options, no classes, types inferred automatically.

The kernel does the composition work that other frameworks scatter across service providers, route files, and DI registries: it merges module contributions, registers discovered constructs, assembles the middleware stack, boots providers, and starts the server.

## The Bootstrap File [#the-bootstrap-file]

```ts title="src/bootstrap/app.ts"
// src/bootstrap/app.ts
import { defineApp } from '@kwiva/core'
import auth from '../app/http/auth'

export const app = defineApp({
  auth,

  // discovered (scan-based; explicit override possible)
  models, controllers, middleware, jobs, events, tasks, policies, pages,

  // explicit composition — providers boot with the kernel
  providers: [
    telemetryProvider,           // observability init (from src/config/telemetry.ts)
    queueProvider,               // queue transport (from src/config/queue.ts)
    storageProvider,             // storage disks (from src/config/storage.ts)
  ],

  // app-level context
  state: { startTime: Date.now() },
  decorate: { /* singletons */ },
  resolve: [ /* per-request derivations */ ],

  // route-level reusable keys
  macros: { auth, cache, rateLimit },
})
```

Most of the fields are optional. The kernel picks up discovered constructs like models and controllers from the standard directories; `providers`, `state`, `decorate`, `resolve`, and `macros` are where you make explicit contributions. `middleware` may also be declared here as an explicit stack, though the canonical home is `src/config/app.ts > middleware[]`.

## Boot Lifecycle [#boot-lifecycle]

When the application starts, the kernel runs a fixed composition order:

1. Config folder load and env validation — fail-fast on missing or invalid values
2. Module contribution merge — models, config, and migrations from `defineModule` packages
3. Model scan to IR — the model intermediate representation is built, with a migration drift check that warns in development
4. Route registration — generated model routes, controllers, server routes, and module routes
5. Middleware stack assembly — in the order declared in config
6. Provider boot — telemetry, queue, storage, or any custom provider
7. Engine init — storage mounts, cache, the task scheduler, and realtime channels
8. Listen — the deployment preset adapter starts accepting requests

Shutdown inverts the sequence: providers stop, the queue drains, then the engine layer stops. Nothing below the framework layer is shut down from app code directly — the kernel owns the ordering.

Boot failures are loud. Env validation and config merging happen first, so misconfiguration surfaces before the server starts, not on the first request.

## Composition by Addition [#composition-by-addition]

The composition story is simple: capabilities are files in the standard tree. There is no "register the router" step and no "add the cache plugin" step — discovery plus configuration does it.

| I want…                    | I add…                                              |
| -------------------------- | --------------------------------------------------- |
| a new resource             | `src/app/models/x.ts` plus an optional controller   |
| authenticated pages        | `src/app/http/auth.ts` plus middleware in the stack |
| background processing      | `src/app/jobs/x.ts` plus queue config               |
| realtime                   | an event plus a channel policy                      |
| Kwiva Studio               | `studio: { enabled: true }`                         |
| agent access               | `src/config/mcp.ts`                                 |
| a reusable capability      | a module                                            |
| new envs or deploy targets | a preset — zero code changes                        |

This is the concrete form of [auto-discovery](/docs/core-concepts/auto-discovery): the kernel never needs to know about a file until it exists.

## Per-Mode Composition [#per-mode-composition]

The same kernel assembles differently depending on the application mode, chosen when you create the project:

| Mode         | Kernel assembly                                   |
| ------------ | ------------------------------------------------- |
| `fullstack`  | everything — API, SSR pages, jobs, realtime       |
| `api+spa`    | no page SSR; a SPA shell with the API behind it   |
| `static`     | pages plus prerender only; no HTTP server or jobs |
| `standalone` | fullstack plus a binary output                    |
| `edge`       | fullstack under the edge constraint set           |

The kernel shape never changes — only which `defineX` files exist. A static site still boots the kernel (config, pages, prerender); a serverless API just prunes the page and job layers.

## Context and Macros [#context-and-macros]

Three options in `defineApp` shape what handlers receive, all fully typed:

* `state` — declares typed fields on the per-request store.
* `decorate` — attaches singletons that appear on the context unchanged.
* `resolve` — derives per-request values asynchronously during context assembly.

`macros` define reusable route-level option keys. Each macro is a function that inspects its option value and pushes into lifecycle arrays:

```ts title="context-and-macros.ts"
defineApp({
  macros: {
    auth: (options: boolean, { beforeHandle }) => {
      if (options) beforeHandle.push(requireAuth)
    },
    cache: (seconds: number, { afterHandle }) => afterHandle.push(setCache(seconds)),
  },
})
```

With the macros declared, a route can author `{ auth: true, cache: 60 }` and both behaviors typecheck. See [Context](/docs/core-concepts/context) for the full picture of state, decoration, and derivation.

## Testing Composition [#testing-composition]

The kernel is not a production-only concern — tests boot the real thing. `withApp` boots the kernel with in-memory adapters where possible, so tests compose exactly like production. `createTestClient(app)` speaks to the running kernel in-process, giving you typed API tests without a network hop.

```ts title="testing-composition.ts"
import { withApp, createTestClient } from '@kwiva/testing'

const { client } = await withApp(async (app) => {
  return createTestClient(app)
})
```

See [Testing](/docs/testing) for the supported harnesses.

## The Complexity Ladder [#the-complexity-ladder]

Because the kernel is fixed, growing the app means growing the set of `defineX` files, not the architecture:

1. **Static site** — model-less pages; the kernel still runs (config, pages, prerender).
2. **CRUD app** — add one model; zero controllers needed.
3. **SaaS** — add auth, policies, tenancy, and Studio.
4. **Realtime** — add events, channels, and jobs.
5. **Platform** — add modules, MCP, and multi-preset deploys.

At every step the bootstrap file stays roughly the same size; the difference is which files exist in `src/`.

## What's Next [#whats-next]

* [Modules](/docs/core-concepts/modules) — `defineModule` adds feature packages to the kernel
* [Plugins](/docs/core-concepts/plugins) — `definePlugin` changes framework behavior
* [Lifecycle](/docs/core-concepts/lifecycle) — boot order and the request pipeline in detail
* [Context](/docs/core-concepts/context) — the typed request context the kernel assembles
* [Application Composition](/docs/modules-plugins/composition) — modules joining the kernel
