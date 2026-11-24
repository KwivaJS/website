# Studio Configuration (/docs/studio/configuration)



Studio is off by default. Enabling it is a single block in your app configuration, but a handful of related switches control how it mounts, who can reach it, and how much operational history it exposes. Because Studio is generated from the same model IR as everything else, configuration is about enabling and gating — not about describing the interface.

## Enabling Studio [#enabling-studio]

Studio lives under the `studio` key of the app config module:

```ts title="src/config/app.ts"
// src/config/app.ts
export default defineConfig('app', {
  defaults: {
    studio: { enabled: true, route: '/studio', guard: 'admin-role' },
  },
})
```

Three settings matter up front:

| Key       | Purpose                                 | Default      |
| --------- | --------------------------------------- | ------------ |
| `enabled` | Turns the Studio route bundle on or off | `false`      |
| `route`   | The base path Studio mounts at          | `/studio`    |
| `guard`   | The gate a user must pass to enter      | `admin-role` |

With `enabled: true`, Studio is mounted at `route` and protected by `guard`. Both the mount and the gate are config, so a deployment can run Studio on a private path with a staff-only gate while the public app stays untouched.

## Where It Mounts [#where-it-mounts]

Studio mounts as a single path namespace under the configured `route`. With the default config that is:

```plaintext title="where-it-mounts.txt"
/studio              → landing / navigation
/studio/posts        → list screen
/studio/posts/:id    → detail screen
/studio/posts/new    → create screen
/studio/posts/:id/edit → edit screen
```

Because every model contributes screens under `route`, the whole surface is one predictable namespace. That keeps routing, guarding, network rules, and link generation simple — one prefix to protect, one prefix to document.

Because the Studio bundle is emitted as a separate route chunk at build time, it is never shipped to public pages. The operations UI and your customer-facing app are distinct artifacts served from the same codebase; Studio code never loads for a visitor who does not enter the Studio namespace.

## Who Can Enter [#who-can-enter]

The `guard` option gates access to the Studio namespace. The default value requires the `admin` role, and the check runs through the policy engine — the same `definePolicy` rules that protect your generated routes, controller routes, channels, and MCP tools.

You can supply any gate that your authorization layer accepts, so the guard can express things like a staff-only role, a tenant-owner check, or a custom role matrix. Whatever you choose, the rule is uniform: &#x2A;*the gate admits a user to Studio, and then every individual action inside Studio is still checked against its own ability.**

The access gate is admission; it is not a blanket bypass of action-level permissions. See [Roles](/docs/authorization/roles) for role configuration and [Policies](/docs/authorization/policies) for the ability model.

## Which Models Appear [#which-models-appear]

Every model you define with `defineModel` is a candidate for a Studio screen. The screens are generated from the model IR — there is no separate list of admin "resources" to maintain. Models that carry a `permission` option surface their screens under that permission namespace, and the generated actions are gated by the matching policy.

This means:

* A model with a `permission` setting appears in Studio with actions governed by its policy
* Models whose configuration you extend inline (for example caching or rate limits) keep those settings on their Studio screens too
* Renaming or removing a model updates Studio on the next load — no manual sync

If a model should not appear in Studio at all, the lever is its `permission` configuration rather than a Studio-specific denylist — the same policy that gates its routes gates its admin surface.

## Permission Gating [#permission-gating]

Studio is a client of the same generated REST routes and typed client your API uses, so the permission story carries over unchanged:

| Surface        | Rule                                                                 |
| -------------- | -------------------------------------------------------------------- |
| List screen    | only rows the user can read render; `read` ability                   |
| Create screen  | hidden without the `create` ability                                  |
| Edit screen    | `update` ability, checked per row                                    |
| Delete action  | `delete` ability, checked per row                                    |
| Custom actions | the `ability` you declare on the action, for example `posts.publish` |

Actions a user lacks the ability for are hidden or disabled — never shown and rejected. Cross-tenant rows are invisible to the resolved tenant, so Studio enforces the same scoping as your routes.

## Audit Visibility [#audit-visibility]

Two layers of audit are available, and which one you see depends on your models:

1. **Model audit trail** — models declared with `{ audit: true }` record `createdBy` and `updatedBy` on every row from the session. Studio exposes the change history for these models.
2. **Studio audit screen** — the built-in Audit screen (v1.x) lists change history across audited models in one place.

Audit is additive: models without `audit: true` get no change history, and enabling audit on a model later applies from the point of enablement. The recorded actor always comes from the session, so impersonation and background jobs show their responsible identities rather than a free-form string.

## Tenant Scoping [#tenant-scoping]

When tenancy is configured, Studio inherits the tenant context of the current request. The relationship-aware Studio renders only the resolved tenant's rows, applies the same storage and cache scoping as your routes, and treats cross-tenant access identically to a missing record.

Platform staff who need a cross-tenant view use the same `asAdmin` escape hatch available in policies — scoped to your platform-user roles, never to ordinary Studio access. See [Tenancy](/docs/tenancy) and [Tenant Scoping](/docs/tenancy/scoping).

## Branding [#branding]

`studio: { branding }` controls the visible identity of the back office:

| Key     | Purpose                                       |
| ------- | --------------------------------------------- |
| `logo`  | The mark shown in the Studio shell            |
| `title` | The product name in the Studio header         |
| `theme` | The visual theme applied to generated screens |

Because the whole surface is themeable, Studio can be branded as your product's back office rather than an internal tool that leaks the framework's look. The theme key feeds the same theming system the public UI uses, so a dark-mode admin experience is a theme choice, not a fork of Studio. See [Customization](/docs/studio/customization) for theming detail.

## Environment-Shaped Configuration [#environment-shaped-configuration]

Configuration is overridable per environment through the typed environment binding, exactly like every other config module. A common shape: Studio enabled and reachable at `/studio` in development, mounted on a restricted path with a stricter guard in production, and disabled entirely on staging instances that should not accept operator traffic. The `guard` and `enabled` keys change per environment without touching model or screen code.

## What's Next [#whats-next]

* [Generated UI](/docs/studio/generated-ui) — what Studio derives from each model
* [Policies](/docs/authorization/policies) — how abilities gate every Studio action
* [Multi-Tenancy](/docs/tenancy) — how tenant scoping applies to Studio
* [Models](/docs/data/models) — the model options that drive Studio screens
* [Configuration](/docs/core-concepts/configuration) — the config folder and precedence rules
