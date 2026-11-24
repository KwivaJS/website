# Protecting Routes (/docs/auth/protecting-routes)



# Protecting Routes [#protecting-routes]

## `requireAuth()` — wraps handlers; puts `ctx.session`/`ctx.user` on context. [#requireauth--wraps-handlers-puts-ctxsessionctxuser-on-context]

```ts title="src/app/http/controllers/private.ts"
export const PrivateController = defineController({
  prefix: "/api/private",
  middleware: [requireAuth()],
  routes(api) {
    api.get("/", async (ctx) => ({ user: ctx.user?.email }));
  },
});
```

## `guestOnly({redirectTo})` — redirects authed users. [#guestonlyredirectto--redirects-authed-users]

## Verify flows [#verify-flows]

* 403 `FORBIDDEN` for unverified emails (`verified()` middleware).
* 401 `UNAUTHORIZED` on missing session.

## Client [#client]

`useSession()` — returns `{session, user, isLoading, refresh}`.

> \[!TIP]
> 401 vs 403: Kwiva uses 401 for missing sessions (UNAUTHORIZED), 403 for verified-required/missing session.
