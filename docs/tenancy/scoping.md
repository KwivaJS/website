# Tenant Scoping (/docs/tenancy/scoping)



Scoping is where tenancy does its heaviest lifting. Once a tenant is resolved for a request, the data layer guarantees that every operation on a scoped model stays inside that tenant's boundary. The mechanics are simple and the enforcement is structural: &#x2A;*you do not remember to scope queries, because the query engine scopes them for you.**

## Opting a Model In [#opting-a-model-in]

A model participates in scoping through the `tenantField` option:

```ts title="opting-a-model-in.ts"
defineModel('projects', (f) => ({ ... }), { tenantField: 'tenantId' })
```

The field can be set globally in the tenancy configuration or per model; per-model wins. When a model opts in, its `tenantField` column becomes the boundary for every query touchpoint.

Scoping is secure-by-construction at the data layer rather than convention-by-handlers. The predicate is injected by the query engine itself, so there is no helper you can forget to call and no where-clause you can accidentally omit — the boundary is part of the query's own construction.

## The Scoping Rules [#the-scoping-rules]

Scoping is enforced across the full lifecycle of a model's data:

| Operation | Rule                                                                      |
| --------- | ------------------------------------------------------------------------- |
| List      | every query auto-injects `where tenantId = ctx.tenant.id`                 |
| Get       | single-row reads carry the same predicate                                 |
| Update    | loads and updates only within the tenant                                  |
| Delete    | deletes only within the tenant                                            |
| Write     | `tenantId` is stamped from context; the client payload cannot override it |

Because the predicate is injected by the query engine, handlers written against scoped models simply work:

```ts title="the-scoping-rules.ts"
// list returns only this tenant's rows — nothing special written here
const projects = await Project.query()
  .where('status', 'active')
  .page(page ?? 1, 20)
```

The handler expresses intent; the tenant boundary is applied underneath. The same holds for relations: queries that join or load related scoped models stay inside the tenant boundary, so a tenant can never walk into another tenant's data through a relationship.

## Writes Are Stamped, Not Trusted [#writes-are-stamped-not-trusted]

The write path is where accidental cross-tenant leaks usually start, so Kwiva removes the possibility rather than exhorting discipline:

* On create, `tenantId` is stamped from the request context
* On every write, `tenantId` is stripped from the client payload — the server treats it as non-authoritative
* A crafted request that supplies a different `tenantId` cannot claim a row it does not own

This is the same posture as the rest of the data layer: the framework enforces invariants so application code cannot accidentally violate them. The client never supplies its own tenancy — identity is derived from the resolved context, and a payload field attempting to override it is discarded before the write proceeds.

## Generated Routes Respect the Tenant [#generated-routes-respect-the-tenant]

The five generated routes per model — list, get, create, update, delete — all run inside the tenant boundary along with any custom controller actions you write against scoped models. There is no separate "tenant routes" and "public routes" split for the same model; scoping applies uniformly to the generated API, the typed client, and Studio screens, because all of them read through the same query path.

That uniformity is what makes the guarantee verifiable: &#x2A;*a cross-tenant read or write is prevented by construction, not by testing discipline.** A custom controller action, an agent MCP tool, and a Studio screen all reach the model through the same scoped query layer.

## Indistinguishable From 404 [#indistinguishable-from-404]

Scoping is deliberately non-disclosing. When a request targets a row that exists but belongs to another tenant:

```plaintext title="indistinguishable-from-404.txt"
GET /api/projects/xyz   (xyz belongs to tenant B, request is tenant A)
→ 404
```

The response is indistinguishable from a missing row. The caller cannot distinguish "not found" from "not yours" — there is no existence leak. This protects tenant data from enumeration attacks and keeps error surfaces consistent across the API. Cross-tenant writes follow the same discipline: a write to another tenant's row fails as if the row did not exist, so an attacker cannot probe a boundary by observing error codes.

## The Escape Hatch: Policies Only [#the-escape-hatch-policies-only]

Legitimate platform operations sometimes need to cross tenant boundaries — support staff viewing a customer's account, an admin repairing a broken tenant. That is what the policy-level escape hatch is for:

```ts title="the-escape-hatch-policies-only.ts"
// inside a policy only
const rows = await tenant.asAdmin(() => Project.query().all())
```

Three properties matter here:

1. **It lives in policies** — `tenant.asAdmin()` is callable from policy code only, not from arbitrary handlers
2. **It is explicit** — every cross-tenant access names itself as an admin-scope operation
3. **It is gated** — the policy still evaluates the calling user's abilities before the escape hatch runs

The escape hatch mirrors the `withTrashed` concept from soft deletes: the framework hides a category of data by default, and the elevated view is a named, deliberate action rather than a flag on the normal query.

> \[!WARNING]
> `tenant.asAdmin()` is the one place tenancy can be widened — and only from policies. If you find yourself reaching for it in a handler, the operation is over-privileged: move the decision into a policy so the elevated scope stays gated by the user's actual abilities.

### What the hatch is not [#what-the-hatch-is-not]

`tenant.asAdmin()` is not a backdoor. It is callable only from policy code, it is explicitly named, and it runs after the policy has already evaluated the actor. Raw SQL remains the other escape route, and it is held to the same discipline: labeled and audited, precisely because it sits outside the query engine's automatic predicates.

## Scoping and Policies [#scoping-and-policies]

Scoping and authorization compose rather than overlap:

* **Scoping** answers "which tenant's data may this request touch?" by injecting the tenant predicate
* **Policies** answer "may this user perform this action?" through `definePolicy` and the `permission` namespace

Both run on generated routes. A request passes the tenant boundary and the ability check — or fails either one — and neither check can be bypassed by calling the other surface. Studio screens, channels, and MCP tools inherit the same combined enforcement.

The two boundaries are orthogonal and both enforced. A request can hold the ability and still be stopped by scope; a request inside the tenant can still be stopped by policy. Defense-in-depth means the two checks are not interchangeable.

## Indexing and Performance [#indexing-and-performance]

The injected predicate is only as fast as its index. The `tenantId` column is generated and indexed as part of the migration for scoped models, so the automatic `where tenantId = ctx.tenant.id` on every operation is an indexed lookup rather than a scan. Compose the tenant predicate with the rest of the filter, and list queries stay fast as both tenant count and per-tenant row count grow.

## Testing Scoping [#testing-scoping]

The harness treats cross-tenant behavior as an assertable property:

```ts title="testing-scoping.ts"
withApp(async (app) => {
  const acme = app.asTenant('acme')
  const globex = app.asTenant('globex')
  const acmeClient = createTestClient(app, { tenant: acme })

  await acmeClient.projects.create({ name: 'Acme project' })

  const globexClient = createTestClient(app, { tenant: globex })
  // reading acme's project as globex asserts 404
})
```

The same factories seed rows for both tenants, and the assertion is the 404 rule itself: cross-tenant reads never succeed. The tenancy invariant suite (`kwiva test --tenancy`) runs this shape over a real two-tenant setup, so isolation is verified end-to-end rather than only in isolated unit assertions.

## What's Next [#whats-next]

* [Resolution](/docs/tenancy/resolution) — where the tenant that scopes queries comes from
* [Isolation](/docs/tenancy/isolation) — scoping applied to storage, cache, and queue
* [Policies](/docs/authorization/policies) — the policy-only `asAdmin` escape hatch
* [Queries](/docs/data/queries) — the query builder every scoped operation flows through
* [Models](/docs/data/models) — the `tenantField` model option
