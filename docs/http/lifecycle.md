# Request Lifecycle (/docs/http/lifecycle)



Every HTTP request in a Kwiva application flows through one ordered pipeline. The same pipeline serves API routes, rendered pages, WebSocket upgrades, and server routes. Understanding it tells you exactly when middleware, guards, validation, and your handler run — and in what order.

The pipeline is framework-owned end to end. Its surface — middleware, guards, lifecycle events — is stable and documented; its internals are free to evolve without changing the guarantees app code relies on. This page walks the complete sequence, then the events, scoping, ordering guarantees, and timing budgets.

## The Full Sequence [#the-full-sequence]

The pipeline runs fourteen ordered steps between the client and the engine writing the response:

```plaintext title="the-full-sequence.txt"
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

Steps 3 through 13 run inside `@kwiva/http`; steps 2 and 14 happen at the adapter boundary that normalizes incoming requests and writes the final response. Whatever runtime you deploy on — the local server, an edge worker — the normalization contract is the same: a Web `Request` in, a Web `Response` out.

## Lifecycle Events [#lifecycle-events]

The pipeline is expressed as eight named events that middleware and guards can hook into:

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

The first six run in order for every request. `onError` runs only when a stage throws or returns an error. `onStop` fires when the server shuts down, not per request.

## Lifecycle-Scoped Middleware [#lifecycle-scoped-middleware]

Middleware can attach to any event, not just the overall request/response wrapper:

```ts title="lifecycle-scoped-middleware.ts"
import { defineMiddleware } from '@kwiva/http'

export default defineMiddleware.on('onRequest', async (ctx, next) => {
  // earliest touchpoint — before routing and parsing
  return next()
})
```

```ts title="lifecycle-scoped-middleware-2.ts"
import { defineMiddleware } from '@kwiva/http'

export default defineMiddleware.on('onResponse', async (ctx, next) => {
  // final headers, after the handler and error stages
  return next()
})
```

Event-scoped middleware gives you a stage without the request/response wrapper. Config arrays still reference middleware by name, and the `defineMiddleware.on` files run at their declared event in the configured order.

## Scoping [#scoping]

Middleware and guard hooks are scoped so shared behavior lands close to the routes it protects:

| Scope      | Declared on                                                      | Applies to                    |
| ---------- | ---------------------------------------------------------------- | ----------------------------- |
| App        | `defineApp`                                                      | Every request                 |
| Controller | `defineController` options and mount guards                      | Every route in the controller |
| Route      | `c.get.path, handler, options` and route-level middleware arrays | The single route              |

A request through a guarded controller accumulates app middleware, controller middleware, guard `beforeHandle` hooks, and route middleware — in that order — before the handler runs.

## State, Decorate, Resolve [#state-decorate-resolve]

The context is assembled from three app-level declarations in `defineApp`:

```ts title="state-decorate-resolve.ts"
export default defineApp({
  state: { startTime: Date.now() },          // app-wide mutable store types
  decorate: { client: createClient() },      // singletons available on ctx
  resolve: [
    ['tenant', async ({ headers }) => resolveTenant(headers)],   // per-request async
    ['logger', ({ store }) => logger.child({ requestId: store.requestId })],
  ],
})
```

* `state` declares typed fields on `ctx.store`.
* `decorate` attaches singletons that appear on the context.
* `resolve` derives per-request values asynchronously during context assembly.

Handlers see the assembled result — `ctx.tenant`, `ctx.logger`, `ctx.store.requestId` — all typechecked. Assembly happens once per request, during step 6, so every later stage reads the same resolved objects. See [Core Concepts: context](/docs/core-concepts/context).

## Where Guards Hook In [#where-guards-hook-in]

Guards run in `onBeforeHandle`, after validation. This ordering is a guarantee: a guard's `beforeHandle` receives the validated body and query, so policy checks can reason about the input the handler is about to receive. Guards also run after the middleware stack, so session and tenant are already resolved on the context.

## Ordering Guarantees [#ordering-guarantees]

Four guarantees are always true:

* Middleware run in `src/config/app.ts > middleware` array order, before guards.
* Guard `beforeHandle` runs after validation, with validated values available.
* Route rules short-circuit before session load — public cached pages skip auth entirely.
* Error mapping is the only code that can run after `onResponse`, and it only records span error attributes.

The cache short-circuit in step 5 is why public static and ISR pages can behave like static files: a cache hit never assembles the session, never runs middleware, and never reaches the handler. Anything cached must therefore be safe to serve without per-request identity.

## Timing Budgets [#timing-budgets]

The pipeline is designed to be cheap at every stage. Example p50 targets for a typical list endpoint:

| Stage                         | Budget                    |
| ----------------------------- | ------------------------- |
| Adapter to pipeline entry     | under 1 ms                |
| Session and tenant resolve    | under 2 ms on a store hit |
| Validation (compiled schema)  | under 0.5 ms              |
| Handler (model list, 20 rows) | under 5 ms                |
| Full API round-trip (local)   | under 15 ms               |
| SSR shell (stream start)      | under 50 ms               |

Each stage is a trace span, so the pipeline is observable from end to end — see [Observability](/docs/observability/tracing). The `kwiva dev` overlay renders the per-request waterfall, showing where each budget holds and where a slow query or a heavy policy sits in the sequence.

## Work After the Response [#work-after-the-response]

Two patterns handle work that should not block the response:

* Event emission and queue dispatch happen inside handlers transaction-aware, but acknowledge in-band — the client sees the response, the work is durable.
* Post-response tasks can defer with `ctx.waitUntil(promise)`, which is edge-safe and keeps the connection alive only as long as the task needs.

`waitUntil` is the mechanism for cleanup, metrics flushing, and best-effort work that must outlive the response with a bounded lifetime. See [Background Work](/docs/background-work) for durable, retried work like queues and jobs.

## What's Next [#whats-next]

1. [Middleware](/docs/http/middleware) — creating and scoping pipeline stages
2. [Guards](/docs/http/guards) — checks that run between validation and the handler
3. [Validation](/docs/http/validation) — the validation stage, in detail
4. [Core Concepts: Lifecycle](/docs/core-concepts/lifecycle) — boot lifecycle and the request pipeline together
5. [Observability](/docs/observability) — tracing every stage
