# Platform 04 — Kwiva Studio

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

**Kwiva Studio** (`@kwiva/studio`) — the generated operations UI: schema-derived CRUD over every model (Questpie reference: Studio derives entirely from the model IR; Laravel Nova reference: instant ops-UI ergonomics; Filament-style instantness). Policy- and tenant-aware by default.

## Enable

```ts
// src/config/app.ts
export default defineConfig('app', {
  defaults: { studio: { enabled: true, route: '/studio', guard: 'admin-role' } },
})
```

Mounts at `/studio`; requires `role === 'admin'` (or a custom gate).

## Generated per model

| Screen | URL | Contents |
|---|---|---|
| List | `/studio/posts` | DataTable: typed columns, enum filters, full-text search, pagination, row + bulk actions |
| Detail | `/studio/posts/:id` | field groups, relations previews |
| Create | `/studio/posts/new` | schema-derived form |
| Edit | `/studio/posts/:id/edit` | same form, prefilled |

Everything derives from the model IR: columns (field types → cell renderers), filters (enums/relations), form fields (validation + labels), actions (policies).

## Customization

```tsx
// src/app/studio/posts.tsx — override a model's Studio screens
import { defineStudioScreen } from '@kwiva/studio'
import { PostsTable } from '../ui/components/posts-table'

export default defineStudioScreen('posts', {
  table: PostsTable,                      // custom DataTable component
  fields: { title: { readonly: true } },  // per-field overrides
  actions: [{ label: 'Publish', ability: 'posts.publish', run: p => client.posts.publish(p.id) }],
  navigation: { group: 'Content', icon: 'document' },
})
```

- Partial overrides: change one field, keep the rest generated.
- Fully custom screens via ui-kit patterns (`CrudPage`).
- Navigation tree auto-generated from models; custom pages add sections.

## Built-in Studio screens (v1/v1.x)

| Screen | Purpose |
|---|---|
| Users & sessions | engine user management (ban, impersonate, force sign-out) — v1.x |
| Tenants | tenant list/plan/owner (when tenancy on) |
| Queue | job table: pending/failed/DLQ, retry — v1.x |
| Schedule | task runs + trigger — v1.x |
| Audit | `{ audit: true }` models: change history — v1.x |
| Settings | model-backed settings tables |
| Addons | installed addons: contributions, versions, update — v1.x |

## Guarantees

- **Policy enforcement**: every action checks abilities — Studio is not a bypass.
- **Tenant scoping**: Studio sees only the resolved tenant (platform staff can `asAdmin`).
- **No drift**: screens regenerate from IR — model changes flow to Studio without code.
- **Soft-delete aware**: trashed rows shown with restore/purge actions.

## Implementation notes

- Studio is a client of the same generated REST routes + typed client — no separate API.
- Built with `@kwiva/react` + `@kwiva/ui-kit` (DataTable/Form/patterns — frontend/04).
- `studio: { branding }` config: logo/title/theme; fully themeable (brand it as your product's back office).
- Studio bundle is a separate route chunk (rolldown split) — never ships to public pages.
- Distinct from `kwiva db:browse` (dev-time data browser): Studio is the runtime operations UI.
