# 03 — Architecture Overview

**Status**: Overview · **Updated**: 2026-09-08 · **Docset**: v0.3

## Core Architectural Rule

> **The app depends only on the framework. The framework depends on engines and the oxc toolchain. App code never imports an engine or a reference by name. Every app-facing construct is a `defineX` factory.**

```
┌────────────────────────────────────────────────────────────────────────┐
│ APP (src/) — models, http, routes, services, jobs, events, ui, config  │
│   writes defineX(...) only · imports only @kwiva/*                  │
├────────────────────────────────────────────────────────────────────────┤
│ FRAMEWORK API (@kwiva/*)                                            │
│   core · config · schema · data · http · router · react · client ·     │
│   services · queue · events · auth · studio · mcp · ui-kit · cli ·      │
│   testing                                                              │
├──────────────────────────────────────┬─────────────────────────────────┤
│ ENGINES (internal, sealed)           │ TOOLCHAIN (deeply integrated)   │
│  nitropack/h3 (server carrier,       │  oxc.rs (https://oxc.rs):       │
│    presets, storage, cache, tasks)   │   rolldown (bundler)            │
│  drizzle-orm (SQL)                   │   oxlint (lint)                 │
│  better-auth (authN)                 │   oxfmt (format)                │
│  tanstack-query (client cache)       │   transformer (TS/JSX)          │
│  crossws (websockets)                │   resolver · minifier           │
│  unstorage (kv/blob)                 │   isolated declarations         │
├──────────────────────────────────────┴─────────────────────────────────┤
│ REFERENCES (inspire only, zero dependency)                             │
│  elysia → @kwiva/http structure & lifecycle                         │
│  tanstack router → @kwiva/router ergonomics                         │
│  vite+ / vite → CLI pipeline shape & dev-server DX                     │
│  laravel → app structure, config, console, queue, events DX            │
│  questpie → one-schema model derivation pattern                        │
├────────────────────────────────────────────────────────────────────────┤
│ RUNTIME: Bun (primary) · Node (compatible) · edge (via presets)        │
└────────────────────────────────────────────────────────────────────────┘
```

## Layers in Detail

### App Layer
- **Lowercase filesystem** (see `application/01`): `src/app/models`, `src/app/http/controllers`, `src/app/http/middleware`, `src/app/services`, `src/app/jobs`, `src/app/events`, `src/app/console`, `src/routes`, `src/config`, `src/database/{migrations,seeders,factories}`, `src/bootstrap/app.ts`, `src/ui/pages`.
- Writes only framework APIs; no direct engine imports (lint gate `no-engine-imports`, powered by oxlint).

### Framework API Layer (`@kwiva/*`)

| Package | Exposes | Backed by |
|---|---|---|
| `@kwiva/core` | `defineApp`, context, DI, `config()`, errors, `definePolicy` | own + nitropack |
| `@kwiva/config` | `defineConfig`, config-folder loader, typed env | own |
| `@kwiva/schema` | field DSL, model IR, validation | own (Standard Schema; Valibot default) |
| `@kwiva/data` | `defineModel`, query builder, transactions, relations, factories | drizzle-orm (engine) |
| `@kwiva/http` | `defineController`, `defineMiddleware`, `defineServerRoute`, lifecycle, guards, macros, WS, tasks | own (Elysia reference) + nitropack (engine) |
| `@kwiva/router` | file-based router core, loaders, typed navigation | own (TanStack Router reference) |
| `@kwiva/react` | `definePage`, SSR renderer, providers, `Link`, `useNavigate` | router + nitropack + preact-compat |
| `@kwiva/client` | generated typed RPC SDK (Eden-like) | own (from controller/model IR) |
| `@kwiva/react` (data hooks) | `useResource`, `useList`, `useMutation`, infinite/prefetch/devtools | tanstack-query (engine) |
| `@kwiva/services` | `defineService` (typed injection) | own |
| `@kwiva/queue` | `defineJob`, workers, retries/backoff/DLQ | own transport (Redis/DB) |
| `@kwiva/events` | `defineEvent`, listeners, outbox | own |
| `@kwiva/auth` | `defineAuth`, `requireAuth`, sessions, OAuth/passkeys | better-auth (engine) |
| `@kwiva/studio` | generated Studio screens | react + ui-kit |
| `@kwiva/mcp` | MCP server from IR | own |
| `@kwiva/ui-kit` | components | base-ui + tailwind v4 |
| `@kwiva/cli` | `kwiva` binary: dev/build/check/test/console/deploy/make:* | **oxc** (rolldown, oxlint, oxfmt, transformer, resolver, minifier, isolated declarations) |
| `@kwiva/testing` | app test harness, fixtures | bun test |

### Engine Layer (sealed)
- **Nitro (nitropack/h3)** — the server carrier: deploy presets (Node, Bun, Cloudflare, Vercel, Netlify, Lambda, static…), unstorage mounts, route rules (SWR/ISR/cache/redirect/proxy), tasks + cron, WebSockets via CrossWS, prerendering.
- **Drizzle ORM** — the SQL engine inside `@kwiva/data` (SQLite dev / Postgres prod).
- **Better Auth** — sessions/OAuth/passkeys/orgs behind `@kwiva/auth`.
- **TanStack Query** — the client cache behind `@kwiva/react` data hooks (keys, caching, invalidation, optimistic updates, devtools).

### Reference Layer (zero dependency)
- **Elysia** — models the structure and API philosophy of `@kwiva/http`: lifecycle events, guards, macros, typed context, OpenAPI; the package's internal `src/` tree mirrors the elysiajs/elysia repo.
- **TanStack Router** — models the ergonomics of `@kwiva/router`: typed routes/params/search, loaders, beforeLoad guards, preloading.
- **Vite+ / Vite** — models the CLI pipeline (`dev/build/check/test`) and dev-server DX (HMR). The actual machinery is oxc (ADR-0021).
- **Laravel** — models the app shape (artisan-style CLI, config folder, migrations/seeders/factories, queue/events/schedule/broadcasting).
- **Questpie** — models the one-schema derivation (model → API/client/Studio/mcp), independently implemented.

### Toolchain Layer (oxc, deeply integrated)
- **rolldown** — programmatic bundling for client + server builds (code splitting, tree shaking).
- **oxc transformer** — TS/JSX transform and target lowering.
- **oxc resolver** — module resolution for the module graph and dev server.
- **oxc minifier** — production minification (also used inside rolldown).
- **oxlint** — lint engine, including the `no-engine-imports` convention gate (ADR-0013).
- **oxfmt** — formatting.
- **isolated declarations** — fast `.d.ts` emission for package builds.
- **Codemods** — `kwiva upgrade` recipes built on the transformer.

## Request Flow (one page through the stack)

```
client ─► Nitro preset/adapter ─► @kwiva/http pipeline
           └─ framework middleware (request id, tracing, cookies/session, tenancy)
              ├─ page route  → @kwiva/router match → @kwiva/react SSR
              │                 (loaders → data hooks hydrate → React tree → stream HTML)
              └─ api route   → defineController handlers
                                (validation → service/model → JSON)
                                └─ defineModel → Drizzle → Postgres/SQLite
```

Whatever the preset, the app sees the same framework API surface — deploy differences stay in the engine.

## Derived Artifacts (from models)

```
src/app/models/*.ts ──► IR (typed intermediate representation)
 ├─► DB schema + migrations + seeders      (@kwiva/data)
 ├─► typed REST API (route registration)   (@kwiva/http + @kwiva/data)
 ├─► typed RPC client SDK                  (@kwiva/client)
 ├─► Studio screens                         (@kwiva/studio)
 ├─► OpenAPI spec                          (@kwiva/http)
 └─► MCP tools (optional)                  (@kwiva/mcp)
```

## Tenancy & Security Enforcements

| Concern | Where enforced |
|---|---|
| Tenant scoping (`tenantField` in model options) | model resolver — injected into every query (ADR-0015) |
| Authorization (`definePolicy`) | model resolver + controller guards |
| AuthN (sessions) | `@kwiva/auth` middleware (`requireAuth`) |
| Rate limiting / headers / caching | framework middleware + route rules (engine) |
| Error taxonomy | `@kwiva/core` errors → HTTP mapping (server/04) |

## Monitoring & Observability

- OpenTelemetry woven at the framework surface (request, handler, model query spans) — see `engineering/03`.

## ADRs (summary)

ADR-0001 Canonical stack · 0002 Nitro server carrier · 0003 Framework HTTP API (owned, Elysia reference) · 0004 Model layer (`defineModel`) · 0005 Owned router (TanStack Router reference) · 0006 Kwiva owns SSR · 0007 Bun runtime · 0008 Vite+ toolchain (superseded by 0021) · 0009 Better Auth engine · 0010 Modules · 0011 CLI-first · 0012 Single config source · 0013 Lint gates (oxlint) · 0014 OTel · 0015 Tenancy-first · 0016 Engines hidden, references zero-dependency · 0017 Elysia-style repo/package structure · 0018 Function-based model DSL · 0019 defineX convention · 0020 Config folder + inline overrides · 0021 oxc toolchain, Vite+ reference-only. See [ADR index](adr/README.md).
