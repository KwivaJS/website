# Research — Better Auth

**Source**: better-auth docs/research 2026-09-08
**Relevance**: **Hidden engine** (ADR-0009, ADR-0016) — authN behind `@kwiva/auth` (`defineAuth`). App code never imports `better-auth`.

## What It Is

Better Auth is a framework-agnostic TypeScript authentication library with a typed, plugin-driven core. Works across Bun, Node, Deno, and edge runtimes. Designed to fix Auth.js's complexity and middleware-based pain.

## Core Features (what the engine provides)

- **Typed sessions**: session/user types flow through the whole app; server + client helpers.
- **Plugins**: email/password (with rate limiting), OAuth/OIDC (Google, GitHub, >20 providers), phone, passkeys, anonymous, organization/tenants, admin, two-factor, account linking, username, magic link.
- **Framework-agnostic API**: works with Elysia, Hono, Express, Next, and more; session via cookies or headers — mounts behind any web-standard handler (our owned pipeline's boundary).
- **Client**: `createAuthClient` typed client mirroring server config; hooks for subscription.
- **Server helpers**: `auth.api.*` endpoints; route mounting (`auth.handler`).

## Integration Pattern (what `@kwiva/auth` mirrors)

The Elysia integration is the documented pattern Kwiva's wiring follows (conceptually — with the owned pipeline):

```ts
// reference pattern (Elysia docs) — Kwiva equivalent is @kwiva/auth internals
const auth = betterAuth({ appName, emailAndPassword: { enabled: true }, ... })
app
  .mount('/api/auth', auth.handler)          // routes
  // + session resolution into typed context
```

- Session context becomes typed `ctx.session` inside Kwiva handlers.
- The auth handler mounts under the generated `/auth/*` routes; session resolves into the owned pipeline's context assembly (`server/01`).

## Kwiva Integration Points

1. **Wiring**: `@kwiva/auth` configures Better Auth with Kwiva defaults (app name, session strategy, cookie names, base redirects) inside `defineAuth` (`src/app/http/auth.ts`).
2. **SSR**: Kwiva injects session into router context so loaders/pages see `session` (protect routes declaratively via `beforeLoad`).
3. **Launching**: `kwiva make:auth` scaffolds the auth definition + login/register pages conforming to Kwiva conventions.
4. **Tenancy**: sync with the orgs/tenant plugin → `mode: 'org'` in `src/config/tenancy.ts` (`platform/03-tenancy.md`).
5. **Secrets**: `AUTH_SECRET` env (`.env` management in `application/04-environment.md`).

## Guards / Risks

- Faster-moving nightly releases; pin stable tags (peer ranges).
- Edge compatibility requires cookie/session web-standard APIs (Better Auth supports it).
- Email throttling must be configured for prod default (rate-limit on password resets).
- Kwiva exposes switching to hosted providers (Clerk, AuthKit) as opt-in — not default.

## Version Guidance

Use latest stable; watch the "organizations" plugin API for multi-tenant alignment with Kwiva tenancy. Engine upgrades ride Kwiva releases (compatibility matrix).
