# Auth Providers (/docs/auth/providers)



# Auth Providers [#auth-providers]

## Built-in providers [#built-in-providers]

| Provider       | Factory                   | Flow                                         |
| -------------- | ------------------------- | -------------------------------------------- |
| Email/password | `emailPassword()`         | register, login, reset via email             |
| Magic link     | `magicLink()`             | `POST /auth/login` sends link                |
| OAuth          | `oauth(provider, hooks?)` | PKCE, redirect to provider, `/auth/callback` |

Provider descriptors: `{kind, resolveUser?, verify?}` — customize user resolution per provider.

## Routes [#routes]

Providers create controllers on the fly; see [Client-Side Auth](/docs/auth/client-usage).

## Status codes [#status-codes]

* 401 `UNAUTHORIZED` for missing/invalid session
* 403 `FORBIDDEN` for failed login (don't leak if email invalid? — Kwiva says 403)

## Identity flows [#identity-flows]

* Password reset: `createPasswordReset` → verify + reset
* Email verification: `createEmailVerifier`, `isEmailVerified`
* Magic links: `createMagicLink`
* TOTP + recovery codes: `generateTotpSecret`, `totpCode`, `generateRecoveryCodes`
* PKCE OAuth: `createPkcePair`, `createOAuthClient`

## When to use [#when-to-use]

* Social login for B2B/ecommerce
* Password for forms (Kwiva primary)
