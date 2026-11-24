# How do I add authentication? (/guides/authentication)



# Add Authentication [#add-authentication]

## 1. Users model [#1-users-model]

```ts title="src/app/models/user.ts"
import { defineModel } from "@kwiva/data";
export const User = defineModel("users", (f) => ({
  id: f.id(),
  email: f.string().validation((s) => s.min(3).max(255)),
  name: f.string().optional(),
}), { timestamps: true });
```

## 2. Config [#2-config]

```ts title="src/config/auth.ts"
import { defineAuth, emailPassword } from "@kwiva/auth";
export default defineAuth({
  providers: [emailPassword()],
  session: { secret: process.env.AUTH_SECRET, maxAge: 604800 },
  register: { createUser: async ({ email, password }) => ({ email, password }) },
});
```

## 3. Protect routes [#3-protect-routes]

`middleware: [requireAuth()]`.

## 4. Client usage [#4-client-usage]

```tsx
import { useSession } from "@kwiva/auth";
const { session, user } = useSession();
```

## Session management [#session-management]

* Cookie: `kwiva_session`
* Store: in-memory by default

> \[!TIP]
> Add social login: `oauth({ id: "google", clientId, clientSecret })`.
