# Multi-Tenancy (/docs/tenancy)



Multi-tenancy in Kwiva is not an add-on you bolt on after the fact. It is a design posture: **tenancy-first data access**. Tenant resolution, query scoping, and per-tenant state isolation are on by design and, in the common case, invisible in your application code. The framework treats multi-tenant data leakage as a catastrophic failure class and engineers against it structurally — not with review checklists but with query scoping that cannot be forgotten.

## Overview [#overview]

Kwiva's tenancy answers three questions for every request:

1. **Which tenant is this?** — resolved once per request from the domain, path, or header
2. **What can this tenant see?** — every model query scoped to the resolved tenant, by construction
3. **What must stay separate?** — storage paths, cache keys, queue payloads, and broadcast channels isolated per tenant

The design principle is deliberately strict: &#x2A;*data access is scoped at the query boundary, not passed around by convention.** An unscoped query is not a style violation — it is close to impossible, because the query engine injects the tenant predicate automatically whenever a model opts in.

```ts title="src/config/tenancy.ts"
// src/config/tenancy.ts
export default defineConfig('tenancy', {
  defaults: {
    mode: 'domain',            // 'domain' | 'path' | 'header' | 'fixed' | 'org' (v1.x) | 'none'
    tenantField: 'tenantId',
    models: '*',
    cache: { scoped: true },
    storage: { scoped: true },
  },
})
```

## What Tenancy Gives You [#what-tenancy-gives-you]

| Concern                        | Mechanism                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| Resolve the tenant per request | `tenant` middleware over domain, path, or header strategy                          |
| Scope every query              | `tenantField` auto-injects the tenant predicate into list, get, update, and delete |
| Constrain writes               | the server stamps `tenantId` and strips it from client payloads                    |
| Hide cross-tenant data         | access attempts are indistinguishable from 404s — no existence leak                |
| Isolate derived state          | cache keys, storage paths, queue payloads, and broadcast channels are tenant-aware |
| Escape for platform staff      | `tenant.asAdmin()` inside policies only                                            |

## Key Components [#key-components]

| Component                                    | Description                                                         |
| -------------------------------------------- | ------------------------------------------------------------------- |
| [Configuration](/docs/tenancy/configuration) | The `tenancy` config module, resolution strategy, and `tenantField` |
| [Resolution](/docs/tenancy/resolution)       | How the tenant is resolved from domain, path, or header per request |
| [Scoping](/docs/tenancy/scoping)             | The automatic injection of tenant predicates into every query       |
| [Isolation](/docs/tenancy/isolation)         | Tenant-aware storage, cache, queue, and broadcast separation        |

## The Tenant Model [#the-tenant-model]

Tenancy expects a tenant record to resolve against. The scaffolded shape includes a slug for domain lookup, an owner, and a plan:

```ts title="the-tenant-model.ts"
defineModel('tenants', (f) => ({
  id: f.id(),
  name: f.string(),
  slug: f.string().unique(),          // domain mode lookup
  ownerId: f.uuid(),
  plan: f.enum('free', 'pro').default('free'),
}), { permission: 'tenants' })
```

The provisioning flow is scaffolded too: sign up, create the tenant plus an owner membership, then open the tenant's Studio at `/studio`. Resolution strategies point at this data — a subdomain resolves to the tenant whose `slug` matches.

## Deployment Models [#deployment-models]

Tenancy supports three deployment shapes with one consistent boundary layer:

| Model               | Layout                                      | Default?                         |
| ------------------- | ------------------------------------------- | -------------------------------- |
| Shared schema       | One database, rows carry `tenantId`         | Default                          |
| Database-per-tenant | A database per tenant                       | Optional, compliance-heavy cases |
| Hybrid              | Mixed — shared schema plus isolated tenants | Optional                         |

The default is &#x2A;*single database, shared schema, rows carrying `tenantId`** — the cheapest model with the strongest tooling, because the query engine scopes every access regardless of which row is involved. For compliance-heavy cases, **database-per-tenant** mode is supported and documented — and it never bypasses the row-level checks. Even a dedicated database is treated as an additional boundary, not a substitute for query scoping, so the security model does not weaken when tenants are physically separated. Hybrid deployments mix both where specific tenants need isolation while the rest share.

Whatever the physical layout, the application-facing contract is the same: scale models by `tenantField`, resolve a tenant per request, and let the framework enforce the boundary.

## Migrations and Seeding [#migrations-and-seeding]

Migrations treat tenancy as a first-class concern. Models declaring `tenantField` generate the column and its index alongside every other field, so the predicate the query engine injects is always backed by an indexed column — scoping stays fast as a tenant's row count grows. Tenant data seeding follows the normal seeder path and composes with the test harness:

```ts title="migrations-and-seeding.ts"
withApp(async (app) => {
  const acme = app.asTenant('acme')
  const globex = app.asTenant('globex')
  // seed both tenants through their scoped clients
})
```

The invariant test suite (`kwiva test --tenancy`) seeds two tenants and asserts isolation end-to-end — cross-tenant reads must 404, cross-tenant writes must be rejected, and derived state must stay prefixed. Isolation is a tested property, not a hopeful convention.

## Multi-Instance Correctness [#multi-instance-correctness]

Tenancy is built for the scalability pillar — stateless multi-instance operation from day one:

* All state is externalized: rows carry `tenantId`, cache keys are prefixed, storage lives in tenant paths
* Instances are interchangeable, because no instance holds tenant-local state
* Schedule locks with `onOneServer` prevent per-tenant cron duplication
* Per-tenant rate limits are planned as `rateLimit: { per: 'tenant' }` (v1.x)

Because every piece of state is addressable by tenant-scoped key, any instance can serve any tenant. The scalability promise — add instances, not locks — holds because there is nothing tenant-local to migrate when a request lands on a different node.

## Cross-Tenant Hazards [#cross-tenant-hazards]

The hazards tenancy guards against, and what closes each one:

| Hazard                                 | Closed by                                                         |
| -------------------------------------- | ----------------------------------------------------------------- |
| Cross-tenant read via crafted id       | Injected query predicate; missing rows are 404s                   |
| Cross-tenant write via crafted payload | Server stamps `tenantId`; client payloads are stripped            |
| Cache collision between tenants        | Tenant-prefixed cache keys                                        |
| Job operating on the wrong tenant      | `tenantId` carried in payload, context re-hydrated before handler |
| Realtime leakage                       | Policy-checked, tenant-scoped channel membership                  |
| Unscoped raw SQL                       | Escape-hatch discipline — raw SQL is labeled and audited          |

The escape hatch for legitimate platform staff is `tenant.asAdmin()`, and it is callable from policies only — every cross-tenant access names itself as an explicit elevated operation. See [Scoping](/docs/tenancy/scoping) for the hatch in detail.

## Solo Apps [#solo-apps]

Not every application is multi-tenant. The `none` mode turns scoping off entirely — solo apps keep the model without paying resolution or scoping cost. The same tenancy guarantees that protect multi-tenant deployments simply do not apply to a single-tenant app that opted out.

## What's Next [#whats-next]

* [Configuration](/docs/tenancy/configuration) — modes, `tenantField`, and scoped storage flags
* [Resolution](/docs/tenancy/resolution) — domain, path, and header resolution in detail
* [Scoping](/docs/tenancy/scoping) — how every query is scoped by construction
* [Isolation](/docs/tenancy/isolation) — storage, cache, queue, and audit separation
* [Models](/docs/data/models) — the `tenantField` model option and the model IR
