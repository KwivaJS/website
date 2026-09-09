# Platform 02 — Authorization

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

`definePolicy` — Laravel policies/gates parity, wired into every generated route, Studio screen, channel, and MCP tool.

## Define a policy

```ts
// src/app/policies/posts.ts
import { definePolicy } from '@kwiva/core'

export default definePolicy('posts', (user, ability, resource) => {
  if (user.role === 'admin') return true
  switch (ability) {
    case 'read':      return true
    case 'create':    return user.id != null
    case 'update':
    case 'delete':    return resource ? resource.authorId === user.id : false
    case 'publish':   return user.role === 'editor'
    default:          return false
  }
})
```

- One file per resource namespace (`permission` on the model/controller).
- Signature: `(user, ability, resource?) => boolean | Promise<boolean>`.
- Policies are pure logic — no HTTP concerns; they run in routes, Studio, jobs, MCP alike.

## Checking

```ts
// server
ctx.can('posts.publish')                       // ability check (resource-less)
ctx.can('posts.update', post)                  // resource check
await authorize('posts.update', post)          // throws ForbiddenError

// models (query-level scoping)
Post.query().whereCan('posts.update')          // policy-filtered result set (v1.x)

// client
const canPublish = useCan('posts.publish')
```

## Enforcement points

| Surface | Rule |
|---|---|
| Generated model routes | `{permission}.{action}` checked in onBeforeHandle |
| Controller routes | `permission` option → policy |
| Studio screens | actions hidden/disabled without ability |
| Channels | subscribe policy |
| MCP tools | per-tool ability |
| Seeders/tasks | explicit `authorize()` calls |

## Abilities naming

`{resource}.{action}` where action ∈ `read | create | update | delete` + custom (`publish`, `archive`, …). Custom abilities come from controller actions — the manifest registers them.

## Roles vs policies

- Roles are data (`users.role` enum / org membership), policies interpret them.
- No role checks in app code — always `can(...)` (lint gate: `no-role-checks`, v1.x).

## Gates (one-off abilities)

```ts
// src/app/policies/gates.ts
import { defineGate } from '@kwiva/core'

export const onlyEditors = defineGate((user) => user.role === 'editor')
export const tenantOwner = defineGate((user, tenant) => tenant.ownerId === user.id)
```

Usage in routes/pages: `gate: onlyEditors` — composable single-purpose checks.

## Wildcards & inheritance (v1.x)

- `posts.*` ability in a policy covers all actions.
- Role→ability maps generated from policies for Studio UX (role matrix screen).
