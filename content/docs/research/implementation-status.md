---
title: Implementation Status
description: "Audit: Kwiva implementation status for every documented claim — implemented / internal / experimental / partial / planned (kwivajs @ 552115f). Snapshot of verification results."
status: implemented
---

# Implementation Status Audit

**Method:** every feature/API documented (or intended) on quiva-docs was checked against Kwiva source at `kwivajs @ 552115f`. Column = status found in Kwiva.

| Area | Status | Notes |
|---|---|---|
| Kwiva core (`defineApp`, config loader, context/ALS, error taxonomy, logger, model IR, cache, kv, store) | Implemented | `@kwiva/core` 0.2.0 |
| `defineService`/services composition | Implemented | `@kwiva/core` |
| `@kwiva/data` models (defineModel, fields, relations, query builder, ORM) | Implemented | 0.2.0 |
| `defineContract` / `defineRoute` / route builder | Implemented | `@kwiva/http` (route builder verified in bundles: verbs `get/post/put/patch/delete/ws`, `guard`, `group`) |
| `defineMiddleware`, `cors`/`csrf`/`rateLimit` | Implemented | verified |
| WebSocket channels/presence/broadcast/event bridge | Implemented | verified |
| SSE `stream`/`toSSEResponse` | Implemented | verified |
| OpenAPI auto-gen (`mountOpenAPI`, Scalar, `/docs`) | Implemented | verified (`@elysia/openapi`, `@scalar/types`) |
| `defineController`, route manifest | Implemented | verified |
| `kwiva dev/build/test` CLI commands | Implemented | verified |
| `make:*` generators (19 kinds) | Implemented | verified |
| `kwiva create` scaffold | Implemented | verified (writes `bootstrap/`, `src/config/*`) |
| `kwiva migrate`, `migrate:status`, `migrate:down`, `migrate:generate` | Implemented | verified |
| `kwiva seed`, `kwiva task`, `kwiva route:list`, `kwiva key:generate` | Implemented | verified |
| `kwiva storage:sync`, `kwiva storage:clear` | Implemented | verified |
| `kwiva search:reindex` | Implemented | verified |
| `kwiva mcp`, `kwiva mcp:print-config` | Implemented | verified (MCP v2) |
| `kwiva doctor` | Implemented | verified |
| `kwiva defineCommand` app commands | Implemented | verified |
| Auth providers, sessions, identity flows | Implemented | verified (password reset, email verify, TOTP, API tokens, PKCE OAuth) |
| `definePolicy`/`defineGate`/`authorize`/`whereCan`/`can` | Implemented | verified |
| `withBetterAuthScope`/`createBetterAuthServer` | Implemented | `@kwiva/auth-better-auth` 0.0.1 |
| `useSession`/`AbilitiesProvider`/client hooks | Implemented | `@kwiva/auth` client hooks (React) |
| `definePage`, `defineIsland`, `hydrateApp`, `Link`, SEO helpers, `streamPage` | Implemented | `@kwiva/ui` |
| SSR/streaming/hydration | Implemented | `@kwiva/ui` + `@kwiva/http` SSE |
| Data validation/serialization (Standard Schema, field DSL, raw DB maps) | Implemented | verified |
| Jobs (`defineJob`, `defineTask`, queue, scheduler, outbox) | Implemented | verified |
| Events (`defineEvent`, queued listeners, broadcast bridge) | Implemented | verified |
| Mail (`defineMail`, SMTP/Resend transports) | Implemented | verified |
| MCP v2 (model + controller tools, custom tools, auth/tenant/audit) | Implemented | `@kwiva/mcp` 0.1.0 |
| Search (Postgres FTS, `searchAcross`) | Implemented | `@kwiva/search` |
| Storage (files-sdk disks, uploads, signed URLs, fakes) | Implemented | `@kwiva/storage` |
| `@kwiva/testing` (`withApp`, `createTestClient`, `bootAppFromRoot`) | Implemented | 0.1.0 |
| Cache + KV (Keyv v6) | Implemented | `@kwiva/core` |
| Store drivers (sqlite, redis, postgres) | Implemented (keyv) + opt-in (store-redis) | |
| Studio | **Not implemented** (framework-side roadmap) | SKIP page per user |
| Addons (registry/search/publish) | **Not implemented** (roadmap) | SKIP page per user |
| Cloud hosting | **Not implemented** (roadmap) | SKIP page per user |
| `@kwiva/auth-better-auth`, `@kwiva/jobs-pg-boss`, `@kwiva/mail-smtp`, `@kwiva/mail-resend`, `@kwiva/store-redis` | Implemented | engine/transport packages |
| Docs feature "prefetchRoute/on-site third-party warnings" | Partially implemented | verify at Phase H |
| Docs claim "feature gates (oxlint) — `no-engine-imports`" | Implemented | root/package lint scripts (oxlint) |

**Version note:** `@kwiva/*` packages: `cli 0.3.0`, `core/data/http/ui/client/auth/jobs/events/mail/testing 0.2.0`, `mcp/search/storage 0.1.0`, engine/transport 0.0.1. Root `kwiva` workspace: `0.0.0`. No git tags (track `main`).
