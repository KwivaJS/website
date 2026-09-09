# Platform 01 — Auth

**Status**: Baseline (engine: Better Auth, hidden) · **Updated**: 2026-09-08 · **Docset**: v0.3

`defineAuth` — the auth surface. Better Auth is a sealed engine; apps see only Kwiva APIs.

## Definition

```ts
// src/app/http/auth.ts
import { defineAuth } from '@kwiva/auth'

export default defineAuth({
  providers: {
    password: { enabled: true, minLength: 10 },
    oauth: {
      google: { clientId: env('GOOGLE_CLIENT_ID'), secret: env('GOOGLE_SECRET') },
      github: true,
    },
    passkeys: { enabled: true },           // v1.x
    magicLink: { enabled: true },          // v1.x (needs mail)
  },
  session: {
    strategy: 'database',                  // database | cookie | jwt
    expiresIn: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, sameSite: 'lax', secure: true },
  },
  user: {
    model: 'users',                        // model must define auth fields
    fields: { email: 'email', name: 'name', role: 'role' },
    verifyEmail: true,                     // v1.x (needs mail)
  },
  hooks: {
    onSignUp: async ({ user }) => SendWelcome.dispatch({ userId: user.id }),
    onSignIn: async ({ user }) => SignedIn.emit({ userId: user.id }),
    onDeleteUser: async ({ user }) => { ... },
  },
})
```

## Generated surface

| Endpoint | Purpose |
|---|---|
| `POST /auth/sign-up` · `/sign-in` · `/sign-out` | credential flows |
| `GET /auth/oauth/:provider` · callback | OAuth |
| `GET /auth/session` | current session (typed) |
| `POST /auth/passkeys/*` | WebAuthn registration/authentication (v1.x) |
| Middleware `auth` | `requireAuth` semantics → 401 |

## Server usage

```ts
const { session } = ctx                          // typed: { user: { id, email, role } | null }

defineMiddleware('auth', async (ctx, next) => {
  if (!ctx.session.user) return error('UNAUTHORIZED')
  return next()
})

// pages
beforeLoad: ({ session }) => { if (!session.user) throw redirect({ to: '/login' }) }
```

## Client usage

```tsx
const { user, signOut, isPending } = useSession()
```

Providers render ready-made screens (ui-kit `AuthScreen` pattern) or custom pages.

## User model contract

The referenced model declares the auth fields the engine maps onto:

```ts
defineModel('users', (f) => ({
  id: f.id(),
  email: f.string().unique(),
  name: f.string(),
  role: f.enum('user', 'admin').default('user').indexed(),
  // engine-managed columns (added automatically at migration time):
  // password_hash, session references, oauth accounts, passkey credentials
}), { timestamps: true, permission: 'users' })
```

## Sessions

- Store backends via `src/config/session.ts`: database (default), redis, cookie.
- Sliding expiry; device/session listing in Studio (v1.x).
- CSRF: session-token double-submit on form routes (`csrf` middleware, default-on).

## Organizations (v1.x)

- Better Auth orgs plugin mapped to Kwiva tenancy: org = tenant, membership roles = policy roles.
- `orgs: { enabled: true }` in `defineAuth` + `src/config/tenancy.ts > mode: 'org'`.

## Security notes

- Passwords: argon2id (engine policy + config min length).
- Rate-limited auth routes by default (`src/config/api.ts`).
- Enumeration-safe errors (UNAUTHORIZED for both bad email and bad password).
- Full posture in `engineering/04-security.md`.
