# RBAC (/docs/authorization/roles)



Role-based access control in Kwiva rests on a simple rule: **roles are data, policies interpret them**. The `role` and `permission` fields on the user record carry identity, `definePolicy` files decide what any role may do, and application code never checks roles directly — it checks abilities, letting one policy change propagate everywhere.

Roles are deliberately unmagical. They are enum values on a model column, stored like any other data, queried like any other data, and interpreted in exactly one place: policies. Everything else in the framework — routes, Studio screens, client hooks, MCP tools — asks "can this user do X?" and never "is this user role Y?". That indirection is the entire point of the design: role meaning lives in one file, not scattered through handlers.

## Roles as Data [#roles-as-data]

A role is a value on the user record, nothing more magical:

```ts title="roles-as-data.ts"
defineModel('users', (f) => ({
  id: f.id(),
  email: f.string().unique(),
  name: f.string(),
  role: f.enum('user', 'admin').default('user').indexed(),
  // engine-managed columns (added automatically at migration time):
  // password_hash, session references, oauth accounts, passkey credentials
}), { timestamps: true, permission: 'users' })
```

The `role` field is a typed enum with a default, and the `permission` field holds explicit grants. Together they answer "what is this person" (`role`) and "what extra can they do" (`permission`). Because both live on the model, they come with queryability, uniqueness, and indexing for free — filtering by role or building an admin list is a normal query.

> \[!NOTE]
> The exact role names are yours. The common scaffolded set is `user` and `admin`; teams with editorial needs add `editor`; tenancy adds `owner` semantics through the tenant record's `ownerId`. What stays constant is the mechanism — roles are enum data, and policies give them meaning.

### Common role shapes [#common-role-shapes]

| Role     | Typical meaning                                      | Where it shows up                        |
| -------- | ---------------------------------------------------- | ---------------------------------------- |
| `user`   | Default sign-up bucket, minimal abilities            | Default on the `role` field              |
| `admin`  | Broad authority, short-circuits policies             | `if (user.role === 'admin') return true` |
| `editor` | Content capability beyond the standard verbs         | `case 'publish'` in content policies     |
| `owner`  | Tenant ownership, from the tenant record's `ownerId` | Tenant-scoped policies and gates         |

The `permission` field complements the role with explicit grants — a user can hold a role bundle of expected abilities plus named extras. Policies interpret both together.

## Assigning and Defaulting Roles [#assigning-and-defaulting-roles]

Roles are assigned like any data: written at creation, updated over the user's life, seeded for tests and staging.

* **Default roles** — the `default('user')` on the field means every sign-up lands in the safe bucket until explicitly elevated; no code path can forget to set a role.
* **Manual assignment** — an admin action updates the `role` field on the specific record.
* **Assignment by seed** — seeders assign roles during development and test setup so fixtures have the right expectations baked in.

Upgrading a user to admin is a single field update, and it is immediately visible to every policy in the next request — no cache to flush, no redeploy. Because policies read the field at decision time, the change takes effect with zero propagation steps.

## Seeding Strategies [#seeding-strategies]

Seeding roles follows the same conventions as seeding any data. Because role data is just enum values on user records, factories and seeders compose naturally:

```ts title="seeding-strategies.ts"
// src/database/seeders/
Admin.factory().create({ role: 'admin', email: 'admin@example.com' })
Standard.factory().count(10).create({ role: 'user' })
```

A common strategy is to seed a small fixed set — one admin, a couple of editors, a handful of standard users — so that every environment has known identities with known capabilities, and policies can be exercised realistically from the first run. Test setups that need isolation rely on the same factories, so role-bearing fixtures are consistent between local development and CI.

## The role, Permission Field, and Policies [#the-role-permission-field-and-policies]

The division of labor is strict:

| Where            | What lives there                                       |
| ---------------- | ------------------------------------------------------ |
| User record      | `role` and `permission` data                           |
| Policy files     | The interpretation of that data into abilities         |
| Application code | Only ability checks — `ctx.can`, `authorize`, `useCan` |

Policies read role values and translate them into decisions:

```ts title="the-role-permission-field-and-policies.ts"
export default definePolicy('posts', (user, ability, resource) => {
  if (user.role === 'admin') return true
  switch (ability) {
    case 'publish':   return user.role === 'editor'
    default:          return false
  }
})
```

The `admin` short-circuit and the `editor` publish case are where roles mean anything. Move the role out of the policy and the same admin is suddenly locked out of every surface at once — consistently, because it is the same policy everywhere.

### Permission grants beyond roles [#permission-grants-beyond-roles]

Roles bundle expected behavior, but they are not exhaustive. The `permission` field exists for explicit, per-user grants that do not fit a role bundle. Both feed the same resolution: a user's effective ability is the policy's answer given their role data and explicit grants. Assigning or revoking a permission is a field update, exactly like a role change.

## Why Application Code Never Checks Roles [#why-application-code-never-checks-roles]

Direct role checks in handlers are a drift hazard: one route checks `user.role === 'admin'`, another checks `user.role !== 'user'`, and before long "admin" means different things in different places. Kwiva enforces the discipline with a lint gate — `no-role-checks` (v1.x) — flagging role comparisons outside policies. The rule is the reason `ctx.can('posts.publish')` reads as a product question while `user.role === 'editor'` reads as a data detail.

The payback appears when product rules change. If "editor can publish" becomes "editor can publish only within their workspace", the change lives in one policy file and propagates to every surface — a route, a Studio screen, an MCP tool — on the next decision. A role comparison scattered across handlers would require hunting down every occurrence.

## Organizations as Roles (v1.x) [#organizations-as-roles-v1x]

In v1.x, the org membership model maps onto RBAC directly: each organization membership has roles, and those membership roles are policy roles. Combined with tenancy in `org` mode, a user's role becomes tenant-scoped — admin in one tenant, standard user in another — and policies interpret the membership role for the active tenant. Same policy engine, one more axis.

The model is the same as plain RBAC: membership rows carry the role data, and policies read it. The only difference is which membership is consulted — the one for the active tenant — so the same user genuinely holds different authority in different workspaces without any field juggling.

## Role Visibility (v1.x) [#role-visibility-v1x]

Role matrices inside Studio are generated from the policies themselves, showing which roles hold which abilities. Because the matrix derives from policy source rather than a duplicated table, it can never drift from actual enforcement — what the matrix says an editor can publish is exactly what the policy enforces.

This is the payoff of "roles are data, policies interpret them" made visible: the admin UI for role management is a projection of the policy source, not a second system that can disagree with it.

## What's Next [#whats-next]

* [Policies](/docs/authorization/policies) — the only place roles should be read
* [Permissions](/docs/authorization/permissions) — the ability strings roles translate into
* [Enforcement Points](/docs/authorization/enforcement) — how role-derived decisions run on every surface
* [Models](/docs/data/models) — declaring the `role` and `permission` fields
* [Seeders](/docs/data/seeders) — seeding known identities and roles
