# Middleware (/docs/http/middleware)



Middleware are named, reusable pipeline stages. Each middleware runs at a specific point of the request lifecycle, can inspect and mutate the request before the handler, and can shape or short-circuit the response after it. Middleware is where cross-cutting concerns live: request IDs, sessions, tenant resolution, security headers, rate limiting, CORS, and compression.

Middleware is the composition layer of the HTTP pipeline. The framework ships the most common stages as zero-config built-ins, and your custom stages sit alongside them in the same arrays — there is no separate mechanism for framework middleware and application middleware.

## Defining Middleware [#defining-middleware]

Middleware follows the `defineX` convention — one middleware per file in `src/app/http/middleware/`, discovered by convention:

```ts title="src/app/http/middleware/request-id.ts"
// src/app/http/middleware/request-id.ts
import { defineMiddleware } from '@kwiva/http'

export default defineMiddleware('request-id', async (ctx, next) => {
  const id = ctx.headers['x-request-id'] ?? crypto.randomUUID()
  ctx.set.headers['x-request-id'] = id
  ctx.store.requestId = id            // typed via the app state declaration
  return next()
})
```

The middleware receives the typed context and a `next` function. Code before `next` runs on the way in; code after it runs on the way out; the resolved response is returned up the chain.

```ts title="src/app/http/middleware/logger.ts"
// src/app/http/middleware/logger.ts
import { defineMiddleware } from '@kwiva/http'

export default defineMiddleware('request-logger', async (ctx, next) => {
  const start = performance.now()

  const response = await next()

  console.log(`request to ${ctx.path} took ${performance.now() - start}ms`)
  return response
})
```

The name registers the stage in the ordered stack. The same name is what you list in a controller option or a route option to attach it at that scope.

## The Global Stack [#the-global-stack]

The global middleware stack is the ordered list in `src/config/app.ts`:

```ts title="src/config/app.ts"
// src/config/app.ts
import { defineConfig } from '@kwiva/config'

export default defineConfig('app', {
  defaults: {
    middleware: [
      'request-id',
      'session',
      'tenant',
      'security-headers',
      'rate-limit',
      'cors',
      'compression',
    ],
  },
})
```

The order of this array is the order of execution on the way in. Middleware runs before guards, and guards run before the handler.

> \[!NOTE]
> Order matters on the way in and on the way out. The last stage in the array is the outermost wrapper: it runs last before the handler on the way in and first after the handler on the way out. When you add a stage, consider both directions.

## Scoping [#scoping]

Middleware applies at three levels:

| Scope      | Declaration                                                 | Applies to                    |
| ---------- | ----------------------------------------------------------- | ----------------------------- |
| Global     | `src/config/app.ts > middleware`                            | Every request                 |
| Controller | `defineController(..., { middleware: ['auth', 'tenant'] })` | Every route in the controller |
| Route      | `c.get('/:id', handler, { middleware: ['rate-limit'] })`    | The single route              |

```ts title="scoping.ts"
defineController('admin', (c) => ({ ... }), {
  middleware: ['auth', 'tenant'],
})

c.get('/dashboard', handler, { middleware: ['rate-limit'] })
```

Scopes compose. A route inherits the global stack, adds its controller's middleware, and then its own. Inline declarations always win over config defaults — controller middleware does not replace the global stack, it extends it at that scope.

## Short-Circuit and Mutate [#short-circuit-and-mutate]

Middleware can decide the request never reaches the handler. Returning a response instead of calling `next` short-circuits the pipeline — this is how authentication failures and rate limits are returned:

```ts title="src/app/http/middleware/auth.ts"
// src/app/http/middleware/auth.ts
import { defineMiddleware, error } from '@kwiva/http'

export default defineMiddleware('auth', async (ctx, next) => {
  if (!ctx.session.user) {
    return error('UNAUTHORIZED', { message: 'a session is required' })
  }
  return next()
})
```

Short-circuiting is a return, not a throw: the stage returns a response value that the pipeline adopts, and the response continues through the remaining lifecycle stages — headers still finalize and the trace span still closes. The error taxonomy applies, so a short-circuited auth failure carries `requestId` and types exactly like a failure produced anywhere else. See [Error Handling](/docs/http/errors).

Mutating the context before `next` affects the handler; mutating after affects the response. The `set` surface covers status, headers, and cookies:

```ts title="short-circuit-and-mutate.ts"
export default defineMiddleware('no-store', async (ctx, next) => {
  const response = await next()
  ctx.set.headers['cache-control'] = 'no-store'
  return response
})
```

## Lifecycle-Scoped Middleware [#lifecycle-scoped-middleware]

Middleware can attach directly to any lifecycle event with the `.on` variant, in addition to the default request/response wrapper:

```ts title="lifecycle-scoped-middleware.ts"
import { defineMiddleware } from '@kwiva/http'

export default defineMiddleware.on('onTransform', async (ctx, next) => {
  ctx.body.content = ctx.body.content.trim()
  return next()
})
```

```ts title="lifecycle-scoped-middleware-2.ts"
import { defineMiddleware } from '@kwiva/http'

export default defineMiddleware.on('onAfterHandle', async (ctx, next) => {
  ctx.set.headers['x-frame-options'] = 'DENY'
  return next()
})
```

Available events are `onRequest`, `onParse`, `onTransform`, `onBeforeHandle`, `onAfterHandle`, `onResponse`, and `onStop`. See [Request Lifecycle](/docs/http/lifecycle) for where each one runs and what it is for.

### Scoping by lifecycle [#scoping-by-lifecycle]

Lifecycle-scoped middleware still respects the global, controller, and route scopes. The config stack lists names; `defineMiddleware.on` files are discovered by convention and executed at their declared event, so the pipeline composes middleware that runs at multiple stages from one ordered configuration.

> \[!TIP]
> Prefer event-scoped stages for single-purpose work — a header added in `onAfterHandle` or an input trimmed in `onTransform` — and reserve the default wrapper for concerns that genuinely span the whole request, like logging or timing.

## Built-In Middleware [#built-in-middleware]

The framework ships the most common stages as zero-config built-ins:

| Name               | Role                                                           |
| ------------------ | -------------------------------------------------------------- |
| `request-id`       | Assigns or forwards the `x-request-id` header                  |
| `session`          | Decodes cookies and loads the typed session into `ctx.session` |
| `tenant`           | Resolves the tenant from subdomain, path, or header            |
| `cors`             | Applies CORS headers from `src/config/cors.ts`                 |
| `rate-limit`       | Enforces request limits per route or globally                  |
| `security-headers` | Applies CSP, HSTS, and header defaults                         |
| `compression`      | Compresses eligible responses                                  |
| `csrf`             | Session-based protection on form routes                        |

You can list any of these in the global stack, a controller option, or a route option by name — no code required. Custom middleware sits alongside them in the same arrays.

The security-oriented built-ins are behaviorally rich: `security-headers` applies `x-content-type-options`, `x-frame-options`, `referrer-policy`, HSTS, and a nonce-based CSP; `cors` negotiates preflight and credential-safe origins; `csrf` protects form and state-changing routes with session-token double-submit. Each is documented in [CORS & Security Headers](/docs/http/cors) and [Security](/docs/security).

## Middleware vs Guards [#middleware-vs-guards]

Middleware and guards overlap at the edges: both can short-circuit a request, and both run before the handler. The distinction is staging. Middleware is ordered pipeline logic — it runs in stack order and composes around the rest of the pipeline. Guards are grouping constructs — they attach requirements to a tree of routes and run in `onBeforeHandle` after validation.

The practical rule:

* Cross-cutting transforms and enforcement that apply to every request, or every route in a scope → middleware
* Checks that need validated input and that authorize a group → guard `beforeHandle`
* Per-operation ability checks → route `permission`

Middleware sees a request before validation; a guard sees validated input. If your logic needs to reason about `body` or `query` shape, it belongs on the guard side. See [Guards](/docs/http/guards).

## Observability in Middleware [#observability-in-middleware]

Middleware is a natural place to attach observability: a timing stage measures the pipeline, a header stage carries `x-request-id`, and a custom stage can add span attributes. The request ID assigned at pipeline entry is populated before the first custom middleware runs, so later stages and the handler all read the same ID.

Any structured data you add to `ctx.store` is available to later middleware, guards, the handler, and the response stages — which is how the log-child pattern in the lifecycle's `resolve` example picks up `store.requestId`. Each lifecycle stage is a trace span, so a middleware that misbehaves shows up in the request waterfall as the stage it overran. See [Observability](/docs/observability).

## Ordering Guarantees [#ordering-guarantees]

Two guarantees matter when composing middleware:

* Middleware runs in `src/config/app.ts > middleware` array order, before guards.
* Cache and route rules short-circuit before session loading, so public cached pages never touch the session store. See [Response Caching](/docs/http/caching).

A third holds for error handling: middleware that throws any typed error, or returns one, streams into the same `onError` mapping as handler failures — there is no special error path for middleware.

## What's Next [#whats-next]

1. [Request Lifecycle](/docs/http/lifecycle) — where each middleware stage runs
2. [Guards](/docs/http/guards) — checks that run after middleware, before the handler
3. [Validation](/docs/http/validation) — the validation stage middleware sits around
4. [CORS & Security Headers](/docs/http/cors) — the `cors` and `security-headers` built-ins
5. [Tenancy: resolution](/docs/tenancy/resolution) — how the `tenant` middleware resolves tenants
