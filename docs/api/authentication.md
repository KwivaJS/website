# API Authentication (/docs/api/authentication)



# API Authentication [#api-authentication]

## Surface [#surface]

* `POST /auth/login` — `{email, password}` → cookie + session
* `POST /auth/register`
* `GET /session` — reads cookie
* `GET /auth/logout` (with requireAuth)

## Middleware [#middleware]

`requireAuth({secret?, maxAge?, cookie?, store?, users?})` — attaches `ctx.session/ctx.user/ctx.can`.
`apiTokenAuth({header?, can?})` — Bearer tokens (`parseBearer`, `authorizeHeader`).
`verified()` — 403 unless email verified.
`passwordConfirmation()` — double-submit.

## Sessions [#sessions]

HMAC-signed cookies; `Session{id, userId, expiresAt, remember?}`.

## Enumeration safety [#enumeration-safety]

401 `UNAUTHORIZED` for missing, 403 `FORBIDDEN` for unauthorized — same as unknown.

## Client [#client]

`useSession(endpoint="/session")` — returns `{session, user, isLoading, refresh}`.

## Rate limiting (built-in) [#rate-limiting-built-in]

Login rate limit: `DEFAULT_LOGIN_RATE_LIMIT{max:5, windowMs:60000}` — per-`5/60s` per key (`login:ip:email`).

> \[!TIP]
> For MFA, PKCE OAuth, magic links: see [Auth Providers](/docs/auth/providers).
