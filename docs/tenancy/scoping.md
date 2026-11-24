# Scoping (/docs/tenancy/scoping)



# Scoping [#scoping]

## Reads [#reads]

`Model.all()` — auto-applies `tenant_id = currentTenant().id` when:

* Model has `tenancy` option, OR
* Model configured in `database.tenancy.defaults.models`

## Writes [#writes]

Stamping via `ctx.user.id` for audit fields (`createdBy/updatedBy`).

## Cross-tenant prevention [#cross-tenant-prevention]

* Queries with `tenantId` from another tenant return 404, not 403 (anti-enumeration)
* `Model.get(id)` — same 404 behavior

## Opt-out [#opt-out]

`Model.withoutTenantScope()`, `withoutGlobalScopes()`.

## `currentTenant()` + `tenantPrefix()` [#currenttenant--tenantprefix]

Prefixes storage, cache, and broadcast keys.
