# Platform 03 — Tenancy

**Status**: Locked (ADR-0015) · **Updated**: 2026-09-08 · **Docset**: v0.3

Tenancy-first data access: tenant resolution, query scoping, and per-tenant state isolation — on by design, invisible in app code.

## Config

```ts
// src/config/tenancy.ts
export default defineConfig('tenancy', {
  defaults: {
    mode: 'domain',            // 'domain' | 'path' | 'header' | 'fixed' | 'org' (v1.x) | 'none'
    tenantField: 'tenantId',   // model column used for scoping
    models: '*',               // or ['projects', 'invoices'] — scoped models only
    cache: { scoped: true },   // tenant-prefixed cache keys
    storage: { scoped: true }, // tenant-prefixed paths
  },
})
```

## Resolution strategies

| Mode | Resolution | Example |
|---|---|---|
| `domain` | subdomain → Tenant lookup | `acme.app.dev` → tenant `acme` |
| `path` | first path segment | `/t/acme/...` |
| `header` | `x-tenant-id` (API clients) | internal tools |
| `fixed` | single configured tenant | single-tenant app with the same guarantees |
| `org` | auth org membership (v1.x) | orgs = tenants via auth engine |
| `none` | disabled | solo apps — scoping off, zero overhead |

Resolved once per request (`tenant` middleware) → `ctx.tenant` (typed: `{ id, name, ownerId }`).

## Scoping enforcement

Models opted in via `tenantField` (or global via config):

```ts
defineModel('projects', (f) => ({ ... }), { tenantField: 'tenantId' })
```

- **Every** query (list/get/update/delete) auto-injects `where tenantId = ctx.tenant.id`.
- Writes stamp `tenantId` from context (un-overridable from client payloads — server strips it).
- Cross-tenant access attempts are indistinguishable from 404s (no existence leak).
- `withTrashed`-style escape hatch for admin scopes: `tenant.asAdmin()` in policies only.

## Storage & cache isolation

- Cache keys: `{tenantId}:{key}` — automatic.
- Storage paths: `storage/{tenantId}/...` — automatic.
- Queue payloads carry `tenantId`; workers re-hydrate tenant context before running handlers.
- Broadcast channels: membership policy-checked per tenant.

## The tenant model

```ts
defineModel('tenants', (f) => ({
  id: f.id(),
  name: f.string(),
  slug: f.string().unique(),          // domain mode lookup
  ownerId: f.uuid(),
  plan: f.enum('free', 'pro').default('free'),
}), { permission: 'tenants' })
```

Provisioning flow (scaffolded): sign-up → create tenant + owner membership → tenant Studio at `/studio`.

## Multi-instance correctness

- All state externalized (Postgres rows carry `tenantId`; Redis keys prefixed) — instances are interchangeable.
- `onOneServer` schedule locks prevent per-tenant cron duplication.
- Per-tenant rate limits: `rateLimit: { per: 'tenant' }` (v1.x).

## Testing

```ts
withApp(async (app) => {
  const acme = app.asTenant('acme')
  const client = createTestClient(app, { tenant: acme })
  // requests are scoped; cross-tenant asserts 404
})
```
