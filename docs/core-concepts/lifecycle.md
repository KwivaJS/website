# Lifecycle (/docs/core-concepts/lifecycle)



Kwiva applications run two distinct lifecycles. The **boot lifecycle** runs once per process: it loads config, discovers capabilities, assembles the kernel, and starts serving. The **request lifecycle** runs for every request that arrives afterwards: a fixed, ordered pipeline that every API call, rendered page, and WebSocket upgrade traverses. Understanding both tells you exactly when your code runs, what is available to it, and in what order.

## Application Boot Lifecycle [#application-boot-lifecycle]

Boot is composed by `defineApp` in a fixed order (see [Applications](/docs/core-concepts/applications) for the kernel):

1. **Configuration loading** — `src/config/*.ts` modules are loaded and merged through `kwiva.config.ts`.
2. **Environment validation** — declared env vars are checked; missing or invalid values fail fast.
3. **Module contribution merge** — models, config, and migrations from `defineModule` packages join the app.
4. **Model scan to IR** — model definitions become the model IR, with a migration drift check that warns in development.
5. **Route registration** — generated model routes, controllers, server routes, and module routes mount into the pipeline.
6. **Middleware stack assembly** — middleware runs in the order declared in `src/config/app.ts > middleware[]`.
7. **Provider boot** — telemetry, queue, storage, and custom providers initialize.
8. **Engine init** — storage mounts, cache, task scheduler, and realtime channels start.
9. **Listen** — the preset adapter begins accepting requests.

Shutdown inverts the order: providers stop, the queue drains, and the engine layer stops. Hooks on `defineModule` and `definePlugin` (see [Modules](/docs/core-concepts/modules) and [Plugins](/docs/core-concepts/plugins)) run at the points where the kernel hands control to them — booting, setup, starting, and stopping.

A boot failure is intentionally loud: because config and env validate first, a misconfigured application never starts in a half-working state.

## The Request Pipeline [#the-request-pipeline]

Every request flows through one ordered pipeline. The same pipeline serves API routes, rendered pages, WebSocket upgrades, and server routes — there is no separate processing path for each kind of work. The full request pipeline runs fourteen ordered steps between the client and the engine writing the response:

```plaintext title="the-request-pipeline.txt"
   1. client request
   2. preset adapter                     → Web Request normalization
   3. pipeline entry
        request ID assigned              (x-request-id: set or forwarded)
        server span begins               (http method, route)
        onRequest middleware             (security headers, rate limit, CORS)
   4. route manifest match               (generated, controller, server routes)
   5. route rules apply                  (cache hit → serve + bypass pipeline)
   6. context assembly
        parse query / parse body         (json, form, multipart)
        cookies decode, session load     (engine-agnostic store)
        tenant resolution                (domain, path, or header)
        state / decorate / resolve       (typed app context)
   7. onTransform                       → mutate parsed values
   8. validation                        → body/query/params/headers/cookies
   9. onBeforeHandle                    → guards: auth, tenant, policy checks
  10. handler
       ├─ API route   → controller action (service → model query → response)
       └─ page route  → SSR render (beforeLoad → loaders → stream)
  11. onAfterHandle                     → response shaping, cache tags
  12. error path (any throw)            → taxonomy mapping → error response/page
  13. onResponse                        → final headers, span close, metrics
  14. engine writes response            → preset adapter
```

Steps 3 through 13 run inside `@kwiva/http`; steps 2 and 14 happen at the adapter boundary. Whatever runtime you deploy on, the normalization contract is the same — a Web `Request` in, a Web `Response` out.

The full sequence, including the error path that can replace step 13 on any throw, is documented on [Request Lifecycle](/docs/http/lifecycle). The sections below cover the parts most relevant to application code.

## Lifecycle Events and Hook Points [#lifecycle-events-and-hook-points]

The pipeline is expressed as eight named events. Middleware attaches to any of them; guards attach to `onBeforeHandle`:

| Event            | Runs       | Purpose                                        |
| ---------------- | ---------- | ---------------------------------------------- |
| `onRequest`      | Entry      | Request ID, security headers, rate limit, CORS |
| `onParse`        | Parsing    | Body parsing: JSON, form, multipart            |
| `onTransform`    | Transform  | Mutate parsed values before validation         |
| `onBeforeHandle` | Guards     | Auth, tenant, policy checks                    |
| `onAfterHandle`  | Response   | Response shaping, cache tags                   |
| `onResponse`     | Completion | Final headers, span close, metrics             |
| `onError`        | Any throw  | Error taxonomy mapping                         |
| `onStop`         | Shutdown   | Server shutdown hooks                          |

The first six run in order for every request. `onError` runs only when a stage throws or returns an error. `onStop` fires at shutdown, not per request.

## Middleware Lifecycle [#middleware-lifecycle]

Middleware is a named, reusable pipeline stage. The base form wraps the rest of the pipeline:

```ts title="middleware-lifecycle.ts"
import { defineMiddleware } from '@kwiva/http'

export default defineMiddleware('timing', async (ctx, next) => {
  const start = performance.now()
  const response = await next()
  console.log(`request took ${performance.now() - start}ms`)
  return response
})
```

Because middleware can attach to any event, scoping to a specific moment is explicit:

```ts title="middleware-lifecycle-2.ts"
export default defineMiddleware.on('onRequest', async (ctx, next) => {
  // earliest touchpoint — before routing and parsing
  return next()
})
```

```ts title="middleware-lifecycle-3.ts"
export default defineMiddleware.on('onResponse', async (ctx, next) => {
  // final headers, after the handler and error stages
  return next()
})
```

## Scoping [#scoping]

Hooks and middleware apply in three scopes, so shared behavior lands close to what it protects:

| Scope      | Declared on                                                       | Applies to                    |
| ---------- | ----------------------------------------------------------------- | ----------------------------- |
| App        | `defineApp`                                                       | Every request                 |
| Controller | `defineController` options and mount guards                       | Every route in the controller |
| Route      | `c.get(path, handler, options)` and route-level middleware arrays | The single route              |

A request through a guarded controller accumulates app middleware, controller middleware, guard `beforeHandle` hooks, and route middleware — in that order — before the handler runs.

## Ordering Guarantees [#ordering-guarantees]

Four guarantees always hold, and user code can rely on them:

* Middleware run in `src/config/app.ts > middleware[]` order, before guards.
* Guard `beforeHandle` runs after validation — the validated body and query are available to policy checks.
* Route rules short-circuit before session load — public cached pages skip auth entirely.
* Error mapping is the only code that can run after `onResponse`, and it only records span error attributes.

## Timing Budgets [#timing-budgets]

The pipeline is designed to be cheap at every stage. Representative p50 targets for a typical list endpoint:

| Stage                         | Budget                    |
| ----------------------------- | ------------------------- |
| Adapter to pipeline entry     | under 1 ms                |
| Session and tenant resolve    | under 2 ms on a store hit |
| Validation (compiled schema)  | under 0.5 ms              |
| Handler (model list, 20 rows) | under 5 ms                |
| Full API round-trip (local)   | under 15 ms               |
| SSR shell (stream start)      | under 50 ms               |

Each stage is a trace span, so the pipeline is observable end to end — see [Observability: tracing](/docs/observability/tracing).

## Session and Tenant Propagation [#session-and-tenant-propagation]

Two cross-cutting values resolve during context assembly and ride through the request:

* **Session** — the session id from the cookie loads a typed session onto the context (`ctx.session`), backed by the session store configured in `src/config/session.ts`. See [Sessions](/docs/auth/sessions).
* **Tenant** — resolution strategies live in `src/config/tenancy.ts` (`subdomain`, `path`, `header`, `fixed` for single-tenant). The resolved tenant flows into model query scoping, cache keys, storage prefixes, queue payloads, and log and trace attributes. See [Tenancy](/docs/tenancy).

## Work After the Response [#work-after-the-response]

Two patterns handle work that must not block the response:

* Event emission and queue dispatch happen inside handlers transaction-aware but acknowledge in-band — the client sees the response and the work is durable.
* Post-response tasks defer with `ctx.waitUntil(promise)`, which is edge-safe and keeps the connection alive only as long as the work needs. See [Context](/docs/core-concepts/context).

## What's Next [#whats-next]

1. [Request Lifecycle](/docs/http/lifecycle) — the complete pipeline, scoping, and guarantees
2. [Middleware](/docs/http/middleware) — creating and scoping pipeline stages
3. [Context](/docs/core-concepts/context) — the object assembled once, then threaded through every stage
4. [Applications](/docs/core-concepts/applications) — the boot sequence the kernel runs
5. [Architecture: Request Lifecycle](/architecture/request-lifecycle) — the lifecycle in system terms
