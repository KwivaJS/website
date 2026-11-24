# Tenant Resolution (/docs/tenancy/resolution)



# Tenant Resolution [#tenant-resolution]

`ctx.tenant` — typed tenant id from current request.

## Flow [#flow]

```
incoming request
├── middleware reads tenant (path/header/org/domain)
├── runWithTenant({tenantId})
├── middleware `bind()`
└── handler: ctx.tenant.id + ALS scope
```

## `runWithTenant({tenantId}, fn)` / `currentTenant()` [#runwithtenanttenantid-fn--currenttenant]

From `@kwiva/core` (ALS scopes).

## Custom resolution [#custom-resolution]

Middleware: `runWithTenant(await resolveFromRequest(ctx), () => next(ctx))`.

> \[!TIP]
> For ORG mode, tenant is an array (hierarchy).
