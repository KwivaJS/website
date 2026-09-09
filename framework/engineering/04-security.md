# Engineering 04 — Security

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

Security posture: defaults that are safe without configuration, overridable per route.

## Default-on protections

| Protection | Where |
|---|---|
| Typed validation on every input | models, controllers, jobs, channels (Standard Schema) |
| CSRF (double-submit token) | session auth + form routes (`csrf` middleware) |
| Security headers | `security-headers` middleware: `x-content-type-options`, `x-frame-options: DENY`, `referrer-policy`, HSTS (https), `Permissions-Policy` |
| CSP | nonce-based strict CSP in prod; report-only in dev; `src/config/security.ts` |
| Rate limiting | auth routes (strict) + API default (`src/config/api.ts`) |
| Cookie hardening | `httpOnly`, `sameSite=lax`, `secure` on session |
| Auth enumeration safety | identical 401 for bad email/password |
| Tenant isolation | query scoping + 404-masking (platform/03) |
| Secrets | typed env only; `KWIVA_PUBLIC_*` is the only client-safe prefix (lint gate) |

```ts
// src/config/security.ts
export default defineConfig('security', {
  defaults: {
    csp: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "'nonce'"], styleSrc: ["'self'", "'unsafe-inline'"] },
    hsts: { maxAge: 31536000, includeSubdomains: true },
    rateLimit: { auth: { max: 5, per: 60 }, api: { max: 600, per: 60 } },
  },
})
```

## AuthN/AuthZ

- Sessions: argon2id passwords, database/redis store, sliding expiry, device listing (v1.x).
- Policies on every generated route/Studio screen/channel/MCP tool (platform/02).
- OAuth/passkeys flows handled by the auth engine (hidden), surfaced typed.

## Input surface inventory

| Surface | Validation |
|---|---|
| model REST routes | body/query/where schemas from field DSL |
| controller routes | body/query/params/headers/cookies schemas |
| jobs | payload schema on `defineJob` |
| events | payload schema on `defineEvent` |
| channels | message schemas + subscribe policy |
| MCP tools | input schemas from route schemas |
| uploads | size + type allowlists at route level |
| search params | `validateSearch` on pages |

## Escape hatches (explicit, auditable)

- `defineServerRoute` with raw handler: marked `raw: true` — flagged by lint to force acknowledgement.
- `db.raw`: parameterized only (string interpolation is a lint error).
- CORS opt-in per route; never `*` with credentials.

## Dependencies

- Engines pinned via peer ranges; `kwiva check --audit` (v1.x) surfaces advisories (Bun/oxc-driven).
- SBOM emitted at `kwiva build --sbom` (v1.x).

## Threat notes

| Threat | Mitigation |
|---|---|
| SQL injection | parameterized engine queries; raw is lint-gated |
| XSS | CSP + React escaping; `dangerouslySetInnerHTML` lint-flagged |
| CSRF | token middleware default-on |
| SSRF | outbound HTTP only via service layer `http` client with allowlist config (v1.x) |
| IDOR | tenant scoping + policies on resource routes |
| Brute force | auth rate limits + lockout (v1.x) |
| Secret leakage | typed env + client-prefix lint gate |
| Replays | request-id + nonce CSP; signed URLs for storage |

## Incident runbook (summary)

1. Revoke: `kwiva key:generate --rotate` (invalidates sessions).
2. Contain: rate-limit route rule override deploy (config-only change).
3. Inspect: logs by `requestId`/`traceId`; audit screens for `{ audit: true }` models.
4. Patch: engines upgrade via peer ranges (`engineering/05`).
