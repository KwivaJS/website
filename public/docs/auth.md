# Authentication (/docs/auth)



Authentication in Kwiva is built around `defineAuth`. A single file in `src/app/http/auth.ts` describes every sign-in path your application exposes — email and password, OAuth, passkeys, and magic links — plus how sessions behave, which model stores users, and what happens at key lifecycle moments like sign-up and sign-in. The machinery behind it all is a sealed, framework-owned session engine: your application code only ever imports `@kwiva/auth` and the conventions it exports. No engine wiring, no hand-rolled password hashing, no session tables to maintain by hand, and no drift between the auth surface you configure and the routes, middleware, and client hooks the framework generates from it.

The auth engine is deliberately opaque. The framework owns the protocol details — credential verification, token signing, session bookkeeping, OAuth handshakes — so the decision surface you interact with stays small and stable. What you configure in `defineAuth` is the complete contract: which providers exist, how long sessions live, which model holds users, and what the framework should do at the moments the identity lifecycle changes. Everything downstream, from the typed `ctx.session` in a controller to the `useSession()` hook in a page, is derived from that one definition.

## Overview [#overview]

Everything auth-shaped flows from one declarative definition:

```plaintext title="overview.txt"
src/app/http/auth.ts  →  defineAuth({ providers, session, user, hooks })
```

* **Providers** — enable password, OAuth, passkeys, and magic-link sign-in. Each provider is independent, toggled with `enabled`, and stackable onto a single unified identity.
* **Sessions** — choose a store backend, lifetime, and cookie policy; a typed `ctx.session` is injected into every handler and page. Expiry is sliding, revocation is instant, and the concrete store never changes how application code reads the session.
* **User model** — point auth at any model that declares the auth fields; the engine adds its own managed columns automatically at migration time. Password hashes, session references, OAuth accounts, and passkey credentials all appear without you writing them.
* **Hooks** — react to `onSignUp`, `onSignIn`, and `onDeleteUser` with jobs, events, or records. Hooks fire consistently across every provider, so a framework-managed sign-in flow invokes your code exactly once per lifecycle event.
* **Generated surface** — from this one file the framework generates the complete credential API (`/auth/sign-up`, `/auth/sign-in`, `/auth/sign-out`, `/auth/session`), wires auth-ready middleware into the HTTP pipeline, and exposes a `useSession()` hook to the frontend.

The remainder of this page walks the pieces, and the sibling pages go deep on configuration, providers, sessions, protection, and client usage.

## The Provider Model [#the-provider-model]

`defineAuth` composes providers independently. Every provider can be toggled with `enabled`, configured with provider-specific options, and stacked together — a user can sign in with a password today and a passkey tomorrow, all through the same session machinery:

| Provider            | Example config                               | Status |
| ------------------- | -------------------------------------------- | ------ |
| Password            | `password: { enabled: true, minLength: 10 }` | v1     |
| OAuth               | `oauth: { google: {...}, github: true }`     | v1     |
| Passkeys (WebAuthn) | `passkeys: { enabled: true }`                | v1.x   |
| Magic link / email  | `magicLink: { enabled: true }`               | v1.x   |

Unlisted providers are simply absent — no routes registered, no dependencies pulled in, no UI to account for. Because every provider funnels into the same session machinery, the method a user chose does not change what `ctx.session` looks like: a Google sign-in and a password sign-in produce the same typed identity, the same policy decisions, and the same `role`.

> \[!TIP]
> Start with the password provider and add OAuth (or later, passkeys and magic links) when the product needs them. Providers are additive — enabling a new one extends the generated surface without touching existing session or policy code.

## Configured Once, Use Everywhere [#configured-once-use-everywhere]

`defineAuth` follows the same configuration rules as every `defineX` factory: it accepts full inline configuration, inline options win over the config folder, and the surface shrinks to match whatever you declare. Leave out OAuth and no OAuth routes exist; leave out passkeys and no WebAuthn endpoints are mounted. The framework derives four things from the definition that every other layer consumes:

1. **Routes** — the generated credential endpoints, mounted by the engine behind the owned HTTP pipeline.
2. **Middleware** — the `auth` middleware, applying `requireAuth` semantics to the requests it protects.
3. **Type inference** — the session user shape flows from the `fields` mapping into controllers, loaders, and hooks.
4. **Sessions** — the strategy (`database`, `cookie`, or `jwt`), lifetime, and cookie policy your product wants.

Secrets never live in the definition file. OAuth credentials are read through `env(...)`, the typed environment accessor that validates every key at boot, and `kwiva key:generate` provisions the signing keys the auth layer needs.

## Where Auth Runs in the Pipeline [#where-auth-runs-in-the-pipeline]

Authentication slots into the request lifecycle at a well-defined point. During context assembly, cookies are decoded and the session is loaded by the engine's store — the step responsible for turning a session cookie into a typed identity. Then, at the guard stage, middleware such as `auth` decides whether the request may continue:

```plaintext title="where-auth-runs-in-the-pipeline.txt"
request
  → context assembly: session load from database/redis store
  → validation
  → beforeHandle: auth guard, tenant resolution, policy checks
  → handler
```

The session is resolved once per request and reused by everything downstream — tenant resolution, request logging, audit fields, and permission checks all draw on the same identity. Session plus tenant resolution together carry a target of under 2ms on a warm database or Redis hit, so the auth layer is not a meaningful contributor to base latency when the store is well-configured. Route caching short-circuits before session load, so public ISR pages skip authentication entirely and never pay for what they do not need.

## Sessions, Typed End to End [#sessions-typed-end-to-end]

The session is the contract between the auth layer and everything else in the framework. On the server it arrives as `ctx.session` — fully typed as either a user payload or `null` — inside controllers, middleware, loaders, and services. On the client the `useSession()` hook exposes the same identity reactively. Revocation, expiry, and cookie behavior are configured once in `defineAuth` and honored by every surface, including the typed RPC client, whose session cookies flow automatically on every call.

Because the session shape is inferred from the `fields` mapping, renaming a model field surfaces type errors at every touchpoint rather than allowing stringly-typed lookups to drift. The store backend — database, Redis, or cookie — is chosen in `src/config/session.ts` and never changes application code: `ctx.session` looks identical no matter where the session actually lives. Expiry is sliding, so active users stay signed in while idle sessions age out, and revocation is immediate because the store is shared and externalized across instances.

## Built-In Route Protection [#built-in-route-protection]

Authentication alone is not authorization. Kwiva gives you two complementary guards: the `auth` middleware, which implements `requireAuth` semantics and returns a `401` when no session exists, and page-level `beforeLoad` guards, which redirect unauthenticated visitors before a page renders. Combine them with policy-backed permission checks for full, layered protections — identity first, then capability, then tenant scope. See [Protecting Routes](/docs/auth/protecting-routes) for the layering guidance and [Authorization](/docs/authorization) for what happens after identity is established.

## Generated Endpoints [#generated-endpoints]

Toggling a provider is all it takes to expose its routes:

| Endpoint                                                  | Purpose                                         |
| --------------------------------------------------------- | ----------------------------------------------- |
| `POST /auth/sign-up` · `/auth/sign-in` · `/auth/sign-out` | Credential flows                                |
| `GET /auth/oauth/:provider` · callback                    | OAuth handshake                                 |
| `GET /auth/session`                                       | Current session (typed)                         |
| `POST /auth/passkeys/*`                                   | WebAuthn registration and authentication (v1.x) |
| Middleware `auth`                                         | `requireAuth` semantics, returns `401`          |

Auth routes are rate-limited by default through `src/config/api.ts`, so brute-force attempts on credential endpoints are throttled without configuration.

## Security Posture [#security-posture]

Auth ships hardened without extra work:

* **Password hashing** — an engine-level argon2id policy, combined with the configurable `minLength` floor.
* **Enumeration resistance** — `UNAUTHORIZED` is returned for both an unknown email and a wrong password, so sign-in responses never leak which accounts exist.
* **CSRF protection** — session-token double-submit via the `csrf` middleware, enabled by default on form routes.
* **Cookie hardening** — `httpOnly`, `sameSite: 'lax'`, and `secure` are the defaults for the session cookie.
* **Rate limiting** — auth endpoints are throttled by default, with the shared config as the tuning point.

## Quick Start [#quick-start]

```ts title="src/app/http/auth.ts"
// src/app/http/auth.ts
import { defineAuth } from '@kwiva/auth'

export default defineAuth({
  providers: {
    password: { enabled: true, minLength: 10 },
  },
  user: {
    model: 'users',
    fields: { email: 'email', name: 'name', role: 'role' },
  },
})
```

Point it at a model that declares the auth fields (`email`, `name`, `role`) — the engine-managed columns such as password hashes, session references, and OAuth accounts are added automatically at migration time. Run `kwiva db:migrate`, then sign up at `POST /auth/sign-up` and read the session back at `GET /auth/session`. From there, `ctx.session` is available in every handler and `useSession()` in every page.

## What's Next [#whats-next]

* [Auth Configuration](/docs/auth/configuration) — full `defineAuth` reference for providers, sessions, and hooks
* [Sessions](/docs/auth/sessions) — session lifetime, stores, and revocation
* [Auth Providers](/docs/auth/providers) — each provider in depth
* [Protecting Routes](/docs/auth/protecting-routes) — `requireAuth` middleware and page guards
* [Client-Side Auth](/docs/auth/client-usage) — `useSession()` in the frontend
* [Default Protections](/docs/security/default-protections) — the security posture auth participates in
