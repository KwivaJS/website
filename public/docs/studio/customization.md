# Customization (/docs/studio/customization)



Generated UI covers the common operations surface out of the box: list, detail, create, edit, delete, with search, filters, and pagination driven by the model. When a screen needs more — a domain-specific table, a read-only field, a publish button, a bulk workflow — Studio lets you override at every level of granularity without abandoning the pipeline that keeps the rest of the back office in sync with your models.

Customization is additive and incremental. There is no fork of Studio to maintain, no second schema to keep in sync. Every override sits on top of the derived screen; the model IR remains the source of truth for types, validation, relations, and permissions.

## The Override Hierarchy [#the-override-hierarchy]

Studio exposes three scopes of customization, each wider than the last:

| Scope          | Hook                 | Typical use                             |
| -------------- | -------------------- | --------------------------------------- |
| Per field      | `fields` map         | `readonly`, label, visibility           |
| Per model      | `defineStudioScreen` | Custom table, actions, navigation group |
| Whole instance | Config + branding    | Theme, logo, title                      |

Start at the narrowest scope that solves the problem. A readonly field is two lines and leaves everything else generated; a custom table is one override but assumes you want to own that screen's rendering.

## Overrides by Model [#overrides-by-model]

The primary customization hook is `defineStudioScreen`, one file per model, composed on top of the generated screen:

```tsx title="src/app/studio/posts.tsx"
// src/app/studio/posts.tsx — override a model's Studio screens
import { defineStudioScreen } from '@kwiva/studio'
import { PostsTable } from '../ui/components/posts-table'

export default defineStudioScreen('posts', {
  table: PostsTable,                      // custom DataTable component
  fields: { title: { readonly: true } },  // per-field overrides
  actions: [
    { label: 'Publish', ability: 'posts.publish', run: (p) => client.posts.publish(p.id) },
  ],
  navigation: { group: 'Content', icon: 'document' },
})
```

Each hook is a slice of the generated screen:

| Option        | What it overrides                                                            |
| ------------- | ---------------------------------------------------------------------------- |
| `table`       | The DataTable component for the list screen                                  |
| `fields`      | Per-field settings, such as `readonly`, across forms and tables              |
| `actions`     | Custom actions attached to rows, each with a label, ability, and run handler |
| `bulkActions` | Selection-level workflows on the list screen (v1.x)                          |
| `navigation`  | Where the model appears in the generated navigation tree                     |

Overrides are &#x2A;*partial by design.** Override one field and the rest of the form stays generated. Declare one custom action and the standard actions remain. You are patching the derived screen, not replacing the pipeline.

## Per-Field Overrides [#per-field-overrides]

The `fields` map addresses individual fields by name. The common use cases:

* **Readonly fields** — freeze a field on the create or edit form, for example a system-assigned key or a computed value
* **Label overrides** — present the field to operators with a domain term instead of the model name
* **Visibility** — hide a field from the table or form while keeping it in the API

Since the underlying field type, validation, and relation wiring still come from the model, a readonly override does not loosen validation — it only changes how the field renders. Operators cannot type into a readonly field, but the API still enforces the field's chain.

## Custom Actions [#custom-actions]

Custom actions let you attach operations that go beyond the five standard CRUD actions, and each one is policy-gated:

```tsx title="custom-actions.tsx"
actions: [
  { label: 'Archive', ability: 'posts.archive', run: (p) => client.posts.archive(p.id) },
  { label: 'Restore', ability: 'posts.restore', run: (p) => client.posts.restore(p.id) },
]
```

* `label` is what operators see
* `ability` names the policy ability that gates the action; without the ability the action is hidden or disabled, never shown and rejected
* `run` receives the row and calls your typed client — which routes through the same generated API your controllers use

Custom abilities come from controller actions; the route manifest registers them so they are typed and discoverable, not strings floating in app code. Define `archive` on the `posts` controller, name it in the Route Manifest, and the ability `posts.archive` is real: typed in the action definition and checked by the policy engine at runtime.

## Bulk Actions [#bulk-actions]

Bulk workflows build on the list screen's selection model (v1.x):

```tsx title="bulk-actions.tsx"
bulkActions: [
  { label: 'Mark published', ability: 'posts.publish',
    run: (rows) => client.posts.publishMany(rows.map((r) => r.id)) },
]
```

A bulk action receives the selected rows and must respect per-row abilities — Studio filters the selection against each row's policy before invoking the handler, so an operator cannot bulk-launch an action on rows they could only read. Bulk delete and bulk update are built in; everything else is this hook.

## Fully Custom Screens [#fully-custom-screens]

When a model's operations genuinely diverge from CRUD, drop below the screen override and build a page with the UI kit patterns — the same components Studio uses internally:

* `DataTable` for list-style pages
* Form patterns that mirror the schema-derived forms
* `CrudPage` layout that composes table, filters, and actions

Custom pages live in your app code, import the typed client directly, and mount through the same navigation system. They are first-class Studio surfaces: policy checks, tenant scoping, and the generated navigation tree still apply because those run on the routes and typed client they call.

A custom screen useful for genuinely divergent workflows:

```tsx title="src/app/studio/moderation.tsx"
// src/app/studio/moderation.tsx
import { CrudPage, DataTable } from '@kwiva/studio'
import { defineStudioScreen } from '@kwiva/studio'

export default defineStudioScreen('moderation', {
  render: () => (
    <CrudPage title="Moderation queue">
      <DataTable model="posts" filter={{ status: 'pending' }} />
    </CrudPage>
  ),
  navigation: { group: 'Operations', icon: 'shield' },
})
```

`render` replaces the generated screen body wholesale while keeping the Studio shell, navigation, and guards — the escape hatch for screens that are not list/detail CRUD but still belong inside Studio.

Custom pages that are not per-model CRUD — dashboards, cross-model workflows, settings — mount through `defineStudioScreen` with a `navigation` entry just like model screens do.

## The UI Kit [#the-ui-kit]

`@kwiva/studio` ships the components Studio renders with, exported for your own pages. The kit keeps a custom surface visually consistent with the generated one: the same form primitives, the same table behavior, the same shell. Using the kit for custom pages is how Studio stays a single coherent back office instead of a patchwork of generated screens and hand-built islands.

## Guards and Access [#guards-and-access]

Every Studio page — generated or custom — is subject to the same access rules:

1. **Instance guard** — the `guard` configured on Studio decides who enters the namespace at all
2. **Page-level roles** — `defineStudioScreen` accepts `access: { roles: ['staff'] }` (v1.x) to restrict a screen further
3. **Action abilities** — the per-action `ability` check on every button

Custom screens do not bypass any of these. A custom page is reached through the same navigation, guarded by the same session, and its calls run through the same policy engine — because it calls the typed client, and the typed client call is checked server-side.

## Theming and Dark Mode [#theming-and-dark-mode]

The Studio shell and the generated screens are themeable through the same theming system as the public UI. From config:

```ts title="theming-and-dark-mode.ts"
studio: {
  enabled: true,
  branding: { logo: '/logo.svg', title: 'Acme Admin', theme: 'dark' },
}
```

The theme key switches the generated surface between light and dark without CSS overrides of its own, and the UI kit components inherit the same theme tokens. Because Studio is derived UI, theming is configuration rather than restyling — operators get a coherent branded admin experience that matches your product's visual language. See [Configuration](/docs/studio/configuration) for the full `branding` block.

## The Navigation Tree [#the-navigation-tree]

Studio builds its navigation automatically from your models:

* Each model becomes a section entry unless you override its `navigation` group or icon
* Custom `defineStudioScreen` files can place models into domain groups, for example `Content` and `Commerce`
* Fully custom pages register as additional sections alongside the generated ones

Tenant and access shaping applies to navigation as well — models the current user cannot read do not advertise screens they cannot open.

## What Customization Does Not Touch [#what-customization-does-not-touch]

Customization stops at presentation. It never loosens the guarantees the generated surface carries:

* **No schema drift** — overrides do not re-declare types; the model remains the source
* **No validation bypass** — readonly and hidden fields still validate at the API boundary
* **No permission bypass** — every custom action and page is policy-checked
* **No tenant bypass** — custom screens render the resolved tenant and nothing else

If a customization depends on bypassing one of these, the model or policy belongs elsewhere.

## Generated Versus Custom [#generated-versus-custom]

The trade-off is consistent with the rest of the framework: &#x2A;*keep what your model naturally expresses, and override only the divergence.**

Keep generated when:

* The surface is plain CRUD on a model
* Operators need search, filters, and pagination without bespoke behavior
* Field-level tweaks such as readonly or labels cover the gap

Move to custom when:

* A table needs domain-specific rendering, sorting, or grouping the model cannot express
* The workflow spans models — a multi-step form that writes several rows
* Actions are inherently UI-driven, such as drag-and-drop ordering or canvas-style editors

Because overrides are partial and custom pages reuse the typed client, migrating a screen from generated to custom is incremental. You can also reverse it: a custom experiment that turns out to be plain CRUD can go back to generated with a single `defineStudioScreen` removal.

## What's Next [#whats-next]

* [Generated UI](/docs/studio/generated-ui) — the screens you are overriding
* [Policies](/docs/authorization/policies) — abilities and the `permission` namespace behind every action
* [RPC Client](/docs/frontend/rpc-client) — the typed client custom actions and pages call
* [Controllers](/docs/http/controllers) — where custom abilities and actions are defined
* [Multi-Tenancy](/docs/tenancy) — how tenant scoping constrains custom screens
