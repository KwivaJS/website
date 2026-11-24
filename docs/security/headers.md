# Headers (/docs/security/headers)



# Security Headers [#security-headers]

## Default headers (auto-set by Kwiva) [#default-headers-auto-set-by-kwiva]

* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: DENY`
* `Strict-Transport-Security` (HSTS)
* `Permissions-Policy` (restricted: geolocation, camera, microphone...)
* `Referrer-Policy: strict-origin-when-cross-origin`
* `X-Content-Type-Options` (again)

## CSP [#csp]

Route-level via `ctx.setHeaders()` or global middleware.

## Overrides [#overrides]

`src/app/http/middleware/headers.ts` — custom via `defineMiddleware`.

## Examples [#examples]

```ts
export const SecurityHeaders = defineMiddleware((ctx, next) => {
  ctx.setHeaders({
    "X-Frame-Options": "SAMEORIGIN",
    "Strict-Transport-Security": 'max-age=31536000; includeSubDomains',
  });
  return next(ctx);
});
```

> \[!TIP]
> Kwiva sets these via built-in middleware in dev/prod — see [Default Protections](/docs/security/default-protections).
