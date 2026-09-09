# Studio (/docs/studio)



Kwiva Studio (`@kwiva/studio`) is the generated operations UI for your application. Point it at your models and it produces a complete set of list, filter, create, edit, and delete screens — no drag-and-drop CMS, no hand-built admin boilerplate, and above all no drift. It is the runtime back office: the trustworthy operations surface for user management, moderation, inventory, invoicing, and tenant administration that ships with every app that opts in.

Studio is generated from the same definitions as the rest of your stack. Because it derives its screens from the model IR — the same intermediate representation that produces your database, REST routes, and typed client — the operations UI and your public API can never disagree about a field, a validation rule, or a permission.

## Overview [#overview]

Studio is built on one idea: &#x2A;*screens derive from the model definition.** Every `defineModel` in `src/app/models/` becomes a first-class administrative surface:

* **Columns** are inferred from field types
* **Filters** are inferred from enums and relations
* **Form fields** are inferred from field validation and labels
* **Actions** are derived from your authorization policies

There is no Studio-side schema. That means when you change a model, Studio changes with it — regeneration is not a step you run, it is the artifact itself. Add a field in development and it appears in the form and the table on the next load; tighten a validation chain and the form enforces it immediately.

Studio is also a client of the same generated REST routes and typed client your application already uses. It has no separate API, which keeps three guarantees simple to reason about:

1. **Policy enforcement** — every action checks abilities through the policy engine; Studio is not a bypass.
2. **Tenant scoping** — Studio sees only the resolved tenant, so the rule that protects your public routes protects your admin screens identically.
3. **No drift** — screens regenerate from the model IR, so schema changes flow into Studio without a line of UI code.

## Key Components [#key-components]

| Component                                   | Description                                                           |
| ------------------------------------------- | --------------------------------------------------------------------- |
| [Configuration](/docs/studio/configuration) | Enabling Studio, the mount route, the access guard, and branding      |
| [Generated UI](/docs/studio/generated-ui)   | The list, detail, create, and edit screens derived per model          |
| [Customization](/docs/studio/customization) | Overriding screens per model with `defineStudioScreen` and the UI kit |

## The Mental Model [#the-mental-model]

```plaintext title="the-mental-model.txt"
Controller stays slim                     Studio stays generated
       │                                        │
defineModel ──► model IR ──► REST routes ──► @kwiva/client ──► Studio screens
       │                                        │
       └─► migrations, seeders, OpenAPI, MCP    └─► policy checks on every action
```

Studio is one more consumer of the same derivation pipeline that feeds migrations, OpenAPI, and MCP tooling. There is exactly one source of truth — the model — and every downstream artifact, including the admin UI, is a projection of it.

## What Studio Generates [#what-studio-generates]

For every model you define, Studio derives four screens under a deterministic URL scheme:

| Screen | URL                      | What it gives you                                        |
| ------ | ------------------------ | -------------------------------------------------------- |
| List   | `/studio/posts`          | Table, filters, search, pagination, row and bulk actions |
| Detail | `/studio/posts/:id`      | Field groups, relation previews, change history          |
| Create | `/studio/posts/new`      | A schema-derived form                                    |
| Edit   | `/studio/posts/:id/edit` | The same form, prefilled                                 |

Add `defineStudioScreen` overrides or build fully custom pages in your app code, and they mount through the same navigation and guards as the generated screens. See [Generated UI](/docs/studio/generated-ui) for the full surface and [Customization](/docs/studio/customization) for the override hooks.

## What Makes It Trustworthy [#what-makes-it-trustworthy]

The word to notice about Studio is not "generated" — it is "derived." Because every screen is a projection of the model, the properties you already trust about your API are properties of the back office by construction:

* **Validation** — the form enforces the exact field chains your routes validate against
* **Permissions** — the same abilities that gate your routes gate every Studio action
* **Tenancy** — the resolved tenant constrains list, detail, create, and edit identically
* **Audit** — audited models record `createdBy` and `updatedBy` from the session, surfaced in the UI
* **Soft deletes** — trashed rows appear distinctly with restore and purge actions

There is no mode in which Studio is a bypass. It is a client of the same generated routes and typed client your application uses, so it inherits every runtime guarantee without re-implementing any of them.

## Quick Start [#quick-start]

Enable Studio in your app configuration, then open it from the CLI. The fastest path:

```bash title="terminal"
kwiva db:studio
```

Before that works, turn it on in `src/config/app.ts`:

```ts title="src/config/app.ts"
// src/config/app.ts
export default defineConfig('app', {
  defaults: {
    studio: { enabled: true, route: '/studio', guard: 'admin-role' },
  },
})
```

Studio now mounts at `/studio`, requires the configured gate (an admin role by default), and renders an operations screen for every model you have defined. Each model gets four screens automatically — list, detail, create, and edit — served under deterministic URLs like `/studio/posts`, `/studio/posts/:id`, `/studio/posts/new`, and `/studio/posts/:id/edit`.

## When to Use Studio [#when-to-use-studio]

Reach for Studio whenever you need a trustworthy back office: user management, moderation queues, inventory, invoicing, tenant administration. It ships with the same guarantees as your API — policy checks, tenant scoping, audit trails on audited models — so it is the safe default for internal operations before you invest in custom admin screens.

Studio's operating envelope:

* **Every model by default** — any `defineModel` becomes an operations surface without additional code.
* **Policy-aware** — screens show and hide actions according to the abilities of whoever is logged in.
* **Tenant-scoped** — users see only their tenant's rows; platform staff can operate across tenants through the `asAdmin` escape hatch.
* **Soft-delete aware** — trashed rows are shown with restore and purge actions.
* **Obvious to operate** — the generated navigation groups models, and custom pages can extend it.

## Studio vs Other Surfaces [#studio-vs-other-surfaces]

Studio is the runtime operations UI, but it is not the only window into your data. It is distinct from the dev-time data browser (`kwiva db:browse`), which is a read-mostly inspection tool for development. It also differs from the generated REST API and MCP tools: those are machine surfaces, while Studio is the human surface for the same models. All four derive from the same IR, so the answers they give never disagree.

| Surface           | Audience            | Primary use                       | Mutates?            |
| ----------------- | ------------------- | --------------------------------- | ------------------- |
| Studio            | Operators and staff | Full CRUD back office             | Yes, policy-checked |
| `kwiva db:browse` | Developers          | Dev-time data inspection          | Read-mostly         |
| REST / RPC API    | Application code    | Machine access to the same models | Yes, policy-checked |
| MCP tools         | AI agents           | Programmatic agent access         | Config-throttled    |

The distinction is audience and environment, not schema. One `defineModel` feeds all four, so the canonical shape of a record is never maintained in four places.

## The Studio Development Loop [#the-studio-development-loop]

Studio fits into the normal dev workflow without added ritual:

1. **Enable it** — add the `studio` config block to `src/config/app.ts`.
2. **Open it** — `kwiva db:studio` (or visit the configured route, `/studio` by default).
3. **Iterate on models** — add or change fields in `src/app/models/` and the screens update on the next load; no Studio code changes.
4. **Override when needed** — swap in a `defineStudioScreen` file or a custom page only where the generated surface does not cover the workflow.
5. **Ship it** — Studio rides the same process and route as every other HTTP surface, and its bundle is separate from the public app, so operations UI never leaks into customer pages.

Because the loop is driven by model changes, Studio shows up in the same diffs your data layer shows up in — there is no separate admin module to version, keyboard-away from the product.

## What's Next [#whats-next]

* [Generated UI](/docs/studio/generated-ui) — what Studio produces for each model
* [Configuration](/docs/studio/configuration) — mounting, guarding, and auditing Studio
* [Customization](/docs/studio/customization) — swap in custom screens per model
* [Models](/docs/data/models) — the definitions that drive every Studio screen
* [Policies](/docs/authorization/policies) — how abilities gate Studio actions
