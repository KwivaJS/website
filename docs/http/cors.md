# CORS & Security Headers (/docs/http/cors)



# CORS & Security Headers [#cors--security-headers]

## `cors` middleware [#cors-middleware]

```ts title="src/app/http/middleware/cors.ts"
import { cors, defineMiddleware } from "@kwiva/http";
export const GlobalCors = defineMiddleware((ctx, next) => {
  return cors({ origin: "https://example.com", credentials: true })(ctx, next);
});
```

## `csrf` middleware [#csrf-middleware]

Double-submit / cookie HMAC check; `exempt` for auth-exempt routes.

## `rateLimit` middleware [#ratelimit-middleware]

Throws `RATE_LIMITED` (429) on exceed; `key` configurable; `resetRateLimits()` to clear.

## Default security headers [#default-security-headers]

`x-content-type-options: nosniff`, `x-frame-options: DENY`, `strict-transport-security`, `cross-origin-resource-policy: same-origin`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy` (restricted), `x-goog-results`, no-store for non-CDN.

## CSP [#csp]

See [Security → Headers](/docs/security/headers).

> \[!TIP]
> For local dev, set `x-content-type-options: nosniff` off — dev-only setting via `secure`/`env`.
