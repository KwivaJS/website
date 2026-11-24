# Default Protections (/docs/security/default-protections)



# Default Protections [#default-protections]

Kwiva ships with sane defaults.

## Built-in middleware (verified) [#built-in-middleware-verified]

* `cors(options)` — CORS defaults
* `csrf(options)` — CSRF on state-changing routes (default-on, must exclude exempt routes)
* `rateLimit(options)` — 429 threshold
* `requireAuth()` — auth default-on for routes that need it

## Cookie defaults [#cookie-defaults]

* Session: `httpOnly`, `secure: false`, `sameSite: "lax"`
* Remember cookie: `httpOnly`

## Tenant isolation [#tenant-isolation]

* Auto-scoped by default (`tenancy.defaults.models = "*"`)
* Cross-tenant reads return 404

## Input validation [#input-validation]

Field-level DSL + route-level Standard Schema contracts (auto-generated errors, 422).

> \[!TIP]
> See [Input Validation](/docs/security/input-validation).
