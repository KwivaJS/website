# Middleware (/docs/http/middleware)



# Middleware [#middleware]

```ts title="src/app/http/middleware/logger.ts"
import { defineMiddleware } from "@kwiva/http";

export const Logger = defineMiddleware((ctx, next) => {
  const start = performance.now();
  try {
    return await next(ctx);
  } finally {
    ctx.logger.info("request.done", { ms: performance.now() - start });
  }
});
```

## Middleware lifecycle [#middleware-lifecycle]

```
Global → Group → Route (stack order) → handler
```

## MiddlewareStep [#middlewarestep]

```ts
type MiddlewareStep = (ctx: HttpContext, next: MiddlewareNext) => unknown;
```

* `await next(ctx)` — run downstream (may return response, or throw).
* Short-circuit: return `Response` (or `undefined` = pass through).
* `CONTINUE` symbol — with for-middleware helpers.

## Resolver binding [#resolver-binding]

```ts
export const BindPosts = defineMiddleware((ctx, next) => {
  ctx.bound.store = await resolvePosts(ctx);
  return next(ctx);
});
```

Resolvers: `resolveMiddlewareRefs(refs, groups)`, `resolveBindings(route, ctx)` — used in pipeline (`buildCtx`, `wrapHandler`).

## Scoping [#scoping]

| Scope      | Applied via                                      | Notes                 |
| ---------- | ------------------------------------------------ | --------------------- |
| Global     | `AppServer.mountPlugin(mw)` / `middlewareGroups` | —                     |
| Controller | `controller.middleware`                          | applies to all routes |
| Group      | `api.group({ middleware: [...] })`               | scoped sub-stacks     |
| Route      | `route.middleware`                               | per route             |

## Conditional/short-circuit [#conditionalshort-circuit]

* `ctx.request.method === "GET"` checks; return early without `await next()`.

## Built-in middleware [#built-in-middleware]

| Name                  | Purpose         | Notes                                                                                    |
| --------------------- | --------------- | ---------------------------------------------------------------------------------------- |
| `cors(options?)`      | CORS            | `CorsOptions{origin, methods, headers, expose, credentials, maxAge}` — preflight support |
| `csrf(options?)`      | CSRF protection | `CsrfOptions{cookie, header, field, exempt, sameSite}` — double-submit or HMAC cookie    |
| `rateLimit(options?)` | Throttle        | `RateLimitOptions{max, windowMs, key, message}` — throws `RATE_LIMITED` (429)            |

`resetRateLimits()` clears internal state.

## Testing middleware [#testing-middleware]

`ctx.logger.info(...)`, `ctx.bound(key)` — middleware is testable via `withApp().handler(new Request("/"))` or `createTestClient`.

## Full reference [#full-reference]

`Middleware` type: `{step, preflight?}`; `resolveMiddleware(registry, ref)`; `MiddlewareGroupOptions{name, middleware[]}`.
