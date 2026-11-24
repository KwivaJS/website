# CORS & Security Headers (/docs/http/cors)



Cross-origin access and response security headers are handled by built-in middleware with sensible defaults, configurable presets, and per-route overrides. The `cors` middleware enforces the cross-origin policy you configure; the `security-headers` middleware applies CSP, HSTS, and the standard protection headers.

Both share the same model: a baseline from the config folder, tightened or widened by inline options, and always applied before the handler runs. Server routes can override both at matched-path granularity through route rules.

## CORS Presets [#cors-presets]

CORS is configured centrally in `src/config/cors.ts`:

```ts title="src/config/cors.ts"
// src/config/cors.ts
import { defineConfig } from '@kwiva/config'

export default defineConfig('cors', {
  defaults: {
    origins: ['https://acme.dev'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
```

* `origins` — the allowed origins list
* `methods` — the allowed HTTP methods
* `credentials` — whether credentials are allowed in cross-origin requests

When the `cors` middleware is on the global stack, this preset is applied to every request. See [Middleware](/docs/http/middleware) for how the stack is assembled.

> \[!NOTE]
> The config folder is the single source of origin defaults. The same pattern that drives the API, cache, and app configs drives CORS — inline declarations at the controller or route scope override the preset, never fork it.

## Per-Route Overrides [#per-route-overrides]

Inline options win over config values, so a controller or route can override the global preset:

```ts title="per-route-overrides.ts"
defineController('posts', (c) => ({ ... }), {
  prefix: '/posts',
  tags: ['posts'],
  cors: { origins: ['https://acme.dev'] },
})
```

Server routes apply CORS at the rule level, including combined rules:

```ts title="src/routes/rules.ts"
// src/routes/rules.ts
defineServerRoute('/api/**', { cors: true, rateLimit: { max: 600, per: 60 } })
```

The inner resolution for a request is: route rule, then controller option, then the global preset. The most specific declaration wins.

## The CORS Middleware [#the-cors-middleware]

The `cors` built-in handles both sides of the cross-origin exchange:

* **Preflight** — an `OPTIONS` request is answered with the negotiated headers, or denied when the origin is not allowed.
* **Actual requests** — the negotiated headers are attached to the response; requests from disallowed origins fail before reaching the handler.
* **Credentials** — when `credentials: true`, an explicit `origins` list is required; wildcard origins are refused, because a wildcard cannot carry credentials safely.

## Security Headers [#security-headers]

The `security-headers` middleware applies the default protection set to every response:

| Header                    | Default role                                                |
| ------------------------- | ----------------------------------------------------------- |
| Content Security Policy   | Restrictive baseline policy with nonce-based script support |
| Strict-Transport-Security | Enforce HTTPS for the domain                                |
| X-Content-Type-Options    | Disable MIME sniffing                                       |
| X-Frame-Options           | Deny framing by default                                     |
| Referrer-Policy           | Limit referrer leakage                                      |

The defaults are applied out of the box; no configuration is needed to get a reasonable baseline. The CSP is nonce-based, so inline scripts the application legitimately emits are allowed through per-request nonces while attacker-injected inline scripts remain blocked. See [Security: default protections](/docs/security/default-protections).

## CSP Configuration [#csp-configuration]

Content Security Policy is where you refine the baseline for your application — script sources, style sources, and frame ancestors. The defaults are overridable per route through the `headers` route rule, so embedded or standalone surfaces get their own policy:

```ts title="src/routes/rules-2.ts"
// src/routes/rules.ts
defineServerRoute('/embed/**', {
  headers: {
    'content-security-policy': "frame-ancestors 'self' https://embed.acme.dev",
  },
})
```

The `headers` rule applies arbitrary response headers to matched paths and composes with other rules on the same route. See [Security: headers](/docs/security/headers) for the full policy surface.

## Resolution Order [#resolution-order]

CORS plus header resolution follows specificity:

| Declaration                       | Wins over                        |
| --------------------------------- | -------------------------------- |
| Route-level `cors` rule or option | Controller option, global preset |
| Controller `cors` option          | Global preset                    |
| `src/config/cors.ts` preset       | Defaults                         |

Inline options always win over config folder values, consistent with the rest of the framework — see [Configuration](/docs/core-concepts/configuration).

## CORS on Server Routes [#cors-on-server-routes]

Server routes can enforce CORS at matched-path granularity, including combined rules:

```ts title="src/routes/rules-3.ts"
// src/routes/rules.ts
defineServerRoute('/api/public/**', {
  cors: { origins: ['https://app.acme.dev'], credentials: true },
})
defineServerRoute('/api/admin/**', { cors: true, rateLimit: { max: 120, per: 60 } })
```

A rule with `cors: true` applies the configured preset to that path. A rule with an explicit `cors` object overrides it for that path only — other paths keep their own configuration.

## Supporting Concerns [#supporting-concerns]

* **Rate limiting** pairs with CORS at the rule level, as shown above, and is documented in [Response Caching](/docs/http/caching) and [Security](/docs/security).
* **Sessions and credentials** — CORS presets that allow credentials require matching cookie behavior; the session middleware is documented under [Auth: sessions](/docs/auth/sessions).
* **Production posture** — header and origin decisions differ between environments; see [Security: production](/docs/security/production).

## Origin Matching [#origin-matching]

Origins are compared exactly — scheme, host, and port. `https://app.acme.dev` and `https://app.acme.dev:8443` are different origins, and `https://acme.dev` does not cover `.acme.dev` subdomains unless listed. List each origin a real client will present; wildcard origins are refused when credentials are enabled.

## Preflight and Caching [#preflight-and-caching]

A cross-origin request that sends non-simple headers or methods triggers an `OPTIONS` preflight. The middleware answers it with the negotiated allow-headers and allow-methods and sets `access-control-max-age` so the browser caches the preflight. Simple GET and POST requests can bypass preflight entirely yet still receive the negotiated response headers — an origin never seen in a preflight can still arrive as a regular CORS request.

## CSP Nonces [#csp-nonces]

The default CSP is nonce-based: each response carries a `nonce` on its script-src, and framework-emitted inline scripts are stamped with it. Content the application controls is authorized by the nonce; content it does not control has no nonce and is blocked. The `headers` rule can tighten or relax the policy for a path without touching the global baseline. See [Security: headers](/docs/security/headers).

## Troubleshooting Matrix [#troubleshooting-matrix]

| Symptom                                    | Likely cause                                                 |
| ------------------------------------------ | ------------------------------------------------------------ |
| Preflight blocked, no headers on `OPTIONS` | Origin not in `origins`, or CORS middleware not on the stack |
| Credentials refused                        | Wildcard origin combined with `credentials: true`            |
| Headers present but no cookies sent        | `credentials` disabled, or cookie `sameSite` mismatch        |
| One path behaves differently               | A more specific route rule overrides the preset              |

## Combined Rules [#combined-rules]

`cors` composes with other rules on the same server route — `rateLimit`, `headers`, `cache` — and rules on more specific paths override broader ones. A public API path can carry a permissive origin and a stricter limit in one declaration while the admin path keeps tighter origins. See [Response Caching](/docs/http/caching).

## Non-Browser Clients and Reflection [#non-browser-clients-and-reflection]

CORS is a browser mechanism. Native apps, servers, and CLI tools send requests without origin checks and ignore the returned headers entirely — for them the middleware is harmless but unneeded. The framework never reflects the request `Origin` back into `Access-Control-Allow-Origin` (that is a cross-origin data-exfiltration pattern); it only echoes origins you listed explicitly. Credentialed requests are matched against `origins` and fail the preflight when absent.

## When CORS Rules Apply [#when-cors-rules-apply]

A route is CORS-protected only when the `cors` rule is attached to it — the preset applies everywhere by default, and a route that sets `cors: false` exposes the endpoint to browsers without CORS enforcement. Disabling CORS does not relax authentication: the `auth` middleware and guards still run. CORS governs which origins a browser may call; authentication governs who may succeed.

## What's Next [#whats-next]

1. [Security: default protections](/docs/security/default-protections) — the baseline security surfaces
2. [Security: headers](/docs/security/headers) — header configuration and CSP details
3. [Middleware](/docs/http/middleware) — the `cors` and `security-headers` built-ins on the stack
4. [Routes & Routing](/docs/http/routes) — server routes and the `headers` rule
5. [Security: production](/docs/security/production) — production hardening
