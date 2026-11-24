# Permissions (/docs/authorization/permissions)



# Permissions [#permissions]

## Grammar [#grammar]

`{resource}.{action}` — e.g. `posts.read`, `todos.create`. Defined at policies: `definePolicy({...})` or `PolicyRule`.

## Gating [#gating]

* Generated routes: `model.options.permission` → gates via `ctx.can(permission)` at runtime (against `ctx.user`).
* `ctx.can` — ambient ALS scope; `can(permission, resource?)` boolean; `authorize`/`authorizeGate` throw.

## API [#api]

| API                                          | Notes                                            |
| -------------------------------------------- | ------------------------------------------------ |
| `ctx.can(permission, resource?)`             | boolean                                          |
| `ctx.canOrThrow()` / `authorize(permission)` | throws ForbiddenError                            |
| `PolicyRegistry{register, resolve}`          | `getDefaultRegistry/policyFor/normalizeRegistry` |

> \[!TIP]
> See [Policies](/docs/authorization/policies) for the definition.
