# Studio (/api/studio)



Kwiva Studio is the generated operations UI. Given your models, it produces list, detail, create, and edit screens automatically — every column, filter, form field, and action derives from the model's intermediate representation. Studio is a client of the same generated REST routes and typed client your app uses; there is no separate API to maintain.

## Enable [#enable]

Studio is configured through the app config:

```ts title="src/config/app.ts"
// src/config/app.ts
import { defineConfig } from '@kwiva/config'

export default defineConfig('app', {
  defaults: { studio: { enabled: true, route: '/studio', guard: 'admin-role' } },
})
```

Mounts at `/studio` and requires `role === 'admin'` (or a custom gate).

## Generated Screens [#generated-screens]

Per model:

| Screen | URL                      | Contents                                                                           |
| ------ | ------------------------ | ---------------------------------------------------------------------------------- |
| List   | `/studio/posts`          | Typed data table, enum filters, full-text search, pagination, row and bulk actions |
| Detail | `/studio/posts/:id`      | Field groups, relation previews                                                    |
| Create | `/studio/posts/new`      | Schema-derived form                                                                |
| Edit   | `/studio/posts/:id/edit` | Same form, prefilled                                                               |

Everything derives from the model IR: columns (field types → cell renderers), filters (enums and relations), form fields (validation and labels), and actions (policies).

## Customization [#customization]

Override a model's screens with `defineStudioScreen`:

```tsx title="src/app/studio/posts.tsx"
// src/app/studio/posts.tsx
import { defineStudioScreen } from '@kwiva/studio'
import { PostsTable } from '../ui/components/posts-table'

export default defineStudioScreen('posts', {
  table: PostsTable,                       // custom data table component
  fields: { title: { readonly: true } },   // per-field overrides
  actions: [
    { label: 'Publish', ability: 'posts.publish', run: (p) => client.posts.publish(p.id) },
  ],
  navigation: { group: 'Content', icon: 'document' },
})
```

* **Partial overrides** — change one field or action; the rest stays generated.
* **Fully custom screens** — built with `@kwiva/react` and `@kwiva/ui-kit` patterns.
* **Navigation** — the tree is auto-generated from models; custom pages add sections.

## Built-In Screens [#built-in-screens]

Beyond per-model CRUD, Studio ships operational screens (several v1.x):

| Screen           | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| Users & sessions | User management — ban, impersonate, force sign-out (v1.x) |
| Tenants          | Tenant list, plan, owner (when tenancy is enabled)        |
| Queue            | Job table — pending/failed/dead-letter, retry (v1.x)      |
| Schedule         | Task runs and manual trigger (v1.x)                       |
| Audit            | Change history for `{ audit: true }` models (v1.x)        |
| Settings         | Model-backed settings tables                              |
| Addons           | Installed addons — contributions, versions, update (v1.x) |

## Guarantees [#guarantees]

* **Policy enforcement** — every action checks abilities; Studio is not a bypass of authorization.
* **Tenant scoping** — Studio sees only the resolved tenant; platform staff can operate as admin.
* **No drift** — screens regenerate from the IR, so model changes flow into Studio without code.
* **Soft-delete aware** — trashed rows are shown with restore and purge actions.

## Theming [#theming]

`studio: { branding }` config accepts a logo, title, and theme. Studio is fully themeable — it can be branded as your product's back office.

Studio's bundle is a separate route chunk, so it never ships to public pages. It's distinct from `kwiva db:browse`, the dev-time data browser — Studio is the runtime operations UI.

## What to Read Next [#what-to-read-next]

* [Studio Overview](/docs/studio) — What Studio is and how it's generated
* [Studio Configuration](/docs/studio/configuration) — Enabling, routes, and branding
* [Generated UI](/docs/studio/generated-ui) — The schema-derived screens
* [Customization](/docs/studio/customization) — `defineStudioScreen` and custom screens
