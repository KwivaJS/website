# Authorization (/docs/authorization)



# Authorization [#authorization]

Three layers:

1. **Policies** (`definePolicy`) — per-resource logic (`can(post, user, "delete")`)
2. **Gates** (`defineGate`) — standalone allow/deny hooks
3. **Permissions** (`resource.action` strings) — used by generated routes (`ctx.can`)

## Entry points [#entry-points]

| Topic                               | Page                                           |
| ----------------------------------- | ---------------------------------------------- |
| Policies                            | [Policies](/docs/authorization/policies)       |
| Permissions (`{resource}.{action}`) | [Permissions](/docs/authorization/permissions) |
| Roles                               | [RBAC](/docs/authorization/roles)              |
| Enforcement points                  | [Enforcement](/docs/authorization/enforcement) |
