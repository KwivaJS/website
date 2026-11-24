# Guards (/docs/http/guards)



# Guards [#guards]

Guards are middleware-typed authorization checks — defined inline or named, applied at route level.

## `api.guard(scope, setup)` [#apiguardscope-setup]

```ts title="src/app/http/controllers/admin.ts"
export const AdminController = defineController({
  prefix: "/api/admin",
  routes(api) {
    api.guard(
      { name: "is-admin", beforeHandle: async () => {
          if (!ctx.user?.role === "admin") throw new ForbiddenError("Admins only");
        } },
      (api) => {
        api.get("/stats", async () => ({ ok: true }));
      },
    );
  },
});
```

## Standalone `guard(builder, options, setup)` [#standalone-guardbuilder-options-setup]

```ts
import { guard, defineMiddleware } from "@kwiva/http";
const RequireRights = guard(defineMiddleware((ctx, next) => next(ctx)), {
  name: "posts-reader",
  allow: ["posts.read"],
}, (api) => api.get("/posts", async () => ({ items: [] })));
```

## Guard options [#guard-options]

| Option         | Notes                          |
| -------------- | ------------------------------ |
| `name`         | guard scope name               |
| `beforeHandle` | middleware runs before handler |
| `middleware`   | additional middleware          |
| `bind`         | resolvers                      |
| `nest`         | deeper scoping                 |

## Nesting/composition [#nestingcomposition]

* Guards compose: outer + inner run in order.
* `api.guard` can be used inside `api.group`.

## Access via `ctx` [#access-via-ctx]

* `ctx.user.id`, `ctx.can`, `ctx.authorize(...)`? — `can(policy, user, action, resource?)` from `@kwiva/auth`; `ctx.can` ambient.
* `ctx.permission` — controller-level permission string.

## Guard policies are per-route [#guard-policies-are-per-route]

`api.post("/", handler, { permission: "posts.create" })` → framework checks `ctx.can("posts.create")` if configured.

> \[!TIP]
> Guards with `policy: "name"` reference `src/app/policies/<name>.ts` — see [Policies](/docs/authorization/policies).
