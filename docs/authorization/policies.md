# Policies (/docs/authorization/policies)



# Policies [#policies]

## `definePolicy(rules, options?)` [#definepolicyrules-options]

```ts title="src/app/policies/post.ts"
import { definePolicy } from "@kwiva/auth";

export const PostPolicy = definePolicy({
  delete(user, post) { return post.authorId === user.id; },
  edit(user, post) { return post.authorId === user.id && !post.published; },
}, {
  before(user, resource) { return user?.admin === true; },
});
```

Policies are frozen at runtime. Default deny.

## `defineGate(check)` [#definegatecheck]

```ts title="src/app/policies/admin.ts"
import { defineGate } from "@kwiva/auth";
export const AdminGate = defineGate((user) => user?.role === "admin");
```

## APIs [#apis]

| API                                          | Notes                                |
| -------------------------------------------- | ------------------------------------ |
| `can(policy, user, action, resource?)`       | explicit; throws ForbiddenError      |
| `cannot`                                     | —                                    |
| `authorize(policy, user, action, resource?)` | throws on deny                       |
| `authorizeGate(gate, user, resource?)`       | —                                    |
| `whereCan(...)`                              | boolean variant (ambient + explicit) |

## Ambient (ALS) usage [#ambient-als-usage]

```ts
import { can } from "@kwiva/auth";
can("edit"); // uses currentAuth() scope
```

> \[!TIP]
> Register via `src/app/policies/` — discovered automatically by the policies folder convention.
