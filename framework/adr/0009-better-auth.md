# ADR-0009 — Better Auth for Authentication

**Status**: Accepted (amended by ADR-0016: engine classification) · **Updated**: 2026-09-08

## Context

Kwiva needs auth out of the box: email+password, OAuth, sessions, organizations (drives tenancy), admin, and (optionally) passkeys — while staying portable across runtimes and avoiding vendor lock.

## Decision

Integrate **Better Auth** as the default authentication engine (hidden behind `@kwiva/auth`):
- Server: the auth handler mounts behind the owned HTTP pipeline (`defineAuth` in `src/app/http/auth.ts`); typed `ctx.session` and `useSession()` client hook; `requireAuth` middleware + `beforeLoad` page guard.
- Organizations plugin = tenant primitive (see ADR-0015); roles RBAC (owner/admin/member/viewer).
- Config via `src/config/auth.ts` (`defineAuth` options; providers, session strategy, admin plugin (engine), paths).
- Secrets: `AUTH_SECRET`, rotation workflow, vault recipes (security docs).

## Consequences

- First-class sessions/OAuth/orgs with verified ecosystem maintenance, reduced custom auth code.
- Better Auth is a dependency to track — seams kept thin (session contract) with a hosted-auth (Clerk) recipe as fallback.
- Some advanced flows (phone, 2FA, passkeys) remain opt-in rather than default.

**Related**: ADR-0001, ADR-0015, ADR-0016, `docs/framework/platform/01-auth.md`, `docs/framework/research/09-better-auth.md`
