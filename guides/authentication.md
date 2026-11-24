# How do I add authentication? (/guides/authentication)



Adding authentication means declaring an auth surface once with `defineAuth` and letting the framework-owned engine wire up the flows, sessions, and route handlers behind it.

## Prerequisites [#prerequisites]

* A project scaffolded with `kwiva new`
* A `users` model that declares the auth fields the engine maps onto
* Standard Schema validation available for input shaping

## Add a users model [#add-a-users-model]

The model declares the columns auth reads back, like `email`, `name`, and `role`. The engine adds its own managed columns, such as password hashes and session references, automatically at migration time:

```ts title="add-a-users-model.ts"
import { defineModel } from "@kwiva/data"

export default defineModel("users", (f) => ({
  id: f.id(),
  email: f.string().unique(),
  name: f.string(),
  role: f.enum("user", "admin").default("user").indexed(),
}), { timestamps: true })
```

## Configure defineAuth [#configure-defineauth]

```ts title="configure-defineauth.ts"
import { defineAuth } from "@kwiva/auth"

export default defineAuth({
  providers: {
    password: { enabled: true, minLength: 10 },
    oauth: { google: { clientId: env("GOOGLE_CLIENT_ID"), secret: env("GOOGLE_SECRET") }, github: true },
  },
  session: { strategy: "database", expiresIn: 60 * 60 * 24 * 7 },
  user: { model: "users", fields: { email: "email", name: "name", role: "role" } },
})
```

Sessions default to the `database` store with sliding expiry; switch to `redis` or `cookie` from the session config. Hooks such as `onSignUp` and `onSignIn` can dispatch work when users join. Enabling auth also registers the sign-up, sign-in, sign-out, and OAuth callback routes under `/auth/*`, plus `GET /auth/session` for the typed current session.

## Read the session on the client [#read-the-session-on-the-client]

`useSession` exposes the signed-in user, a sign-out action, and a pending flag. Sessions load from the cookie during SSR and hydrate on the client:

```tsx title="read-the-session-on-the-client.tsx"
export default function AuthStatus() {
  const { user, signOut, isPending } = useSession()

  if (isPending) return <p>Loading…</p>
  if (!user) return <a href="/auth/sign-in">Sign in</a>
  return (
    <div>
      <span>{user.email}</span>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}
```

Provider screens (the ready-made `AuthScreen` pattern) can render the forms for you, or you can post to the generated `/auth/*` routes from your own pages.

## Protect the rest of your app [#protect-the-rest-of-your-app]

With sessions flowing, lock down routes and pages — see [How do I protect a route?](/guides/protect-routes) and [How do I add a policy?](/guides/policies). A signed-in requirement on a route looks like this:

```ts title="protect-the-rest-of-your-app.ts"
c.get("/account", handler).guard({ beforeHandle: requireAuth })
```

## Verify it works [#verify-it-works]

* Start the dev server with `kwiva dev`.
* Sign up with `POST /auth/sign-up`, then `GET /auth/session` returns the signed-in user.
* Render `AuthStatus`: the user appears after sign-in and the sign-out button clears the session.
* Hit a `requireAuth` route without a cookie and the request returns `401`.

## Related Documentation [#related-documentation]

* [Configuration](/docs/auth/configuration)
* [Sessions](/docs/auth/sessions)
* [Client Usage](/docs/auth/client-usage)
* [Protecting Routes](/docs/auth/protecting-routes)
