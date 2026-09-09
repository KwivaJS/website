# 04 — Stack Decision

**Status**: Locked via ADR-0001 (amended by 0016–0021) · **Updated**: 2026-09-08 · **Docset**: v0.3

This document records **why** each canonical choice was made and what was rejected. Per-choice rationale, tradeoffs, and escape hatches. The engine/reference split (ADR-0016) classifies every choice as **engine** (hidden, powering a package), **reference** (inspiration-only, zero dependency), **toolchain** (deeply integrated), or **owned** (written by Kwiva).

## 1. Runtime: Bun (primary), Node (compatible) — engine

**Chosen** · [ADR-0007](adr/0007-bun-primary-runtime.md)

**Why**
- Native TypeScript execution (no build step for dev), fast startup, first-class WebSockets, `Bun.serve`.
- Built-in `bun test`, `Bun.sql`, Redis & S3 clients, single-file executables (`bun build --compile`) — key for the "Laravel artifact" experience.
- SO_REUSEPORT; one tool for install/test/build; strong funding/stability signals.

**Rejected**: Pure Node-first (loses single-binary path & startup speed); Deno (incompatible with the Nitro/Vite tooling momentum).

**Escape hatch**: Nitro presets abstract runtime specifics; the app is written runtime-agnostic (Web `Request`/`Response`). Node remains a supported production output.

## 2. Toolchain: oxc.rs, deeply integrated — toolchain

**Chosen** · [ADR-0021](adr/0021-oxc-toolchain.md) (supersedes ADR-0008)

**Why**
- oxc (https://oxc.rs) is the fastest TS/JS toolchain: Rust parser, transformer, resolver, minifier, plus **rolldown** (Rollup-compatible bundler), **oxlint** (50–100× ESLint speed), **oxfmt** (Prettier-grade formatter), **isolated declarations** (instant `.d.ts`).
- The `kwiva` CLI calls oxc components directly (napi bindings + rolldown JS API): `kwiva dev` (own dev server on Bun.serve + oxc resolver/transformer + HMR), `kwiva build` (rolldown + oxc minifier), `kwiva check` (oxlint + oxfmt + typecheck), `kwiva upgrade` (oxc codemods).
- One vendor axis (oxc), one language (Rust) for all static machinery — consistent performance and roadmap.
- Vite+ is a **reference**: its `create/install/dev/check/test/build/pack` CLI shape and dev-server DX guided our pipeline design; we do not depend on `viteplus` or `vite` at runtime for the framework pipeline.

**Rejected**: Vite+ as engine (excellent, but the framework's pipeline should be owned end-to-end and oxc-native — wraps re-introduce an opaque layer); pure Vite (same reason); webpack/esbuild pipelines; Nx/Turborepo (task-runner not needed at our scope).

**Escape hatch**: rolldown's Rollup-compatible plugin API; the build config surface in `kwiva.config.ts > build` exposes full inline rolldown options (ADR-0020).

## 3. Server Foundation: Nitro — engine

**Chosen** · [ADR-0002](adr/0002-nitro-foundation.md)

**Why**
- The mature portable runtime: unstorage, route rules (SWR/ISR/cache/redirect/proxy), tasks + cron, WebSockets/SSE, OpenAPI; deploy presets for Node, Bun, Cloudflare, Vercel, Netlify, Lambda, static, etc.
- **Positioning**: Nitro is the server carrier/portability layer. Deploying = picking a preset at build time.

**Rejected**: Building our own portable server layer (huge duplication); Hono-as-foundation (HTTP-focused; lacks storage/tasks/ISR/cache lifecycle).

## 4. HTTP Layer: `@kwiva/http` (owned) — Elysia reference

**Chosen** · [ADR-0003](adr/0003-framework-http-api.md) (amended)

**Why**
- Kwiva implements its own HTTP pipeline: typed context, full lifecycle (`onRequest → onParse → onTransform → onBeforeHandle → onAfterHandle → onResponse → onError`), guards, macros, state/decorate/resolve, body/query/params/headers/cookies validation, WebSocket routes, OpenAPI generation.
- **Elysia is the reference**: its repo structure (src `adapter/`, `type-system/`, `universal/`, `ws/` + flat core) is mirrored inside `packages/http`; its API philosophy (end-to-end type inference, macros, Eden) shapes `defineController` and the generated RPC client.
- Zero runtime dependency on `elysia` — roadmap, API shape, and bundling stay Kwiva's.

**Rejected**: Elysia as hidden engine (was v0.1; demoted to reference so the framework owns its HTTP foundation); Hono/Fastify/Express (typing/DX).

## 5. Data Foundation: Kwiva model layer — owned (Drizzle engine)

**Chosen** · [ADR-0004](adr/0004-model-layer.md) (amended)

**Why**
- `defineModel` (function-based, per-model files) → IR → typed REST, typed RPC client, Kwiva Studio, migrations/seeders/factories, MCP tools.
- Kills type drift: resolver, client, Studio all derive from one declaration — the pattern proven by Questpie (reference only, zero dependency).
- Drizzle is the SQL engine inside `@kwiva/data`, not the app-facing API.

**Rejected**: depending on Questpie; Prisma/Drizzle as app-facing APIs (query builders still need API/client/Studio authored by hand); PostgREST/Supabase (DB-coupled, loses type derivation & app-layer auth).

## 6. UI Framework & Routing: React + owned router — TanStack Router reference

**Chosen** · [ADR-0005](adr/0005-tanstack-router-reference-only.md)

**Why**
- `@kwiva/router` implements file-based, fully-typed routing with TanStack Router ergonomics: typed params/search, loaders (parallel + deferred), `beforeLoad` guards, preloading, scroll restoration.
- Kwiva owns SSR orchestration (ADR-0006) rather than delegating to TanStack Start.
- React by default; Preact via `preact/compat` opt-in.

**Rejected**: Next.js (locked deploy model); React Router 7 (less typed route data); TanStack Start as default; Qwik/Solid (ecosystem).

Tailwind v4 + Base UI chosen for styling/UI primitives (see `frontend/04-ui-library.md`).

## 7. Auth: Better Auth — engine

**Chosen** · [ADR-0009](adr/0009-better-auth.md)

**Why**
- Modern cross-framework auth: typed sessions, server+client helpers, plugins (email/password, OAuth, passkeys, admin, orgs).

**Rejected**: rolling our own auth; Auth.js; hosted-only providers as default.

## 8. Client Cache & RPC: TanStack Query (engine) + Eden-like client (owned)

**Chosen** · `@kwiva/client` + `@kwiva/react` data hooks

**Why**
- The generated RPC client gives Eden-Treaty-style end-to-end typing: `client.users.list()` with zero codegen at the type level (app types flow from `defineController`/`defineModel`).
- Data hooks wrap TanStack Query and expose its full surface (staleTime, gcTime, invalidation, optimistic updates, infinite queries, prefetch, suspense, devtools) with keys auto-derived from model/controller identity — apps never import `@tanstack/react-query`.

**Rejected**: SWR (smaller surface); raw fetch in loaders (lint-gated); codegen steps (Eden-style type-level inference instead).

## 9. Configuration & Env

**Chosen**: all config in `src/config/*.ts` + `kwiva.config.ts` entry (`defineConfig`), typed env access (Valibot/Standard Schema), inline overrides allowed in every `defineX` (ADR-0012/0020).
**Rejected**: scattered ad-hoc config files; untyped `process.env` reads everywhere.

## 10. Testing

**Chosen**: `bun test` (unit + integration, native TS speed) with `@kwiva/testing` harness; Playwright for e2e. Vitest is a **reference** for test DX (filtering, watch mode, browser mode) — not a dependency.
**Rejected**: Jest (slow, TS friction); Cypress as default; Vitest-as-engine (would re-introduce a Vite dependency).

## 11. Observability

**Chosen**: OpenTelemetry foundation (request/handler/query spans via the framework surface), structured logs, metrics via OTel.

## Canonical Stack Summary Table

| Concern | Selected | Class | Rejected (why) |
|---|---|---|---|
| Language | TypeScript strict | — | JS (no) |
| Runtime | Bun (+Node compat) | engine | Deno, pure Node |
| Toolchain | **oxc.rs** (rolldown, oxlint, oxfmt, transformer, resolver, minifier, isolated declarations) | toolchain | Vite+ (reference now), Vite, webpack, Nx |
| Bundler | rolldown | toolchain | esbuild pipelines, turbo |
| Lint/Format | oxlint / oxfmt | toolchain | ESLint/Prettier (speed) |
| Test | bun test + Playwright | owned/engine | Jest, Vitest (reference), Cypress |
| Server foundation | Nitro | engine | bespoke; Hono |
| HTTP | `@kwiva/http` | owned | elysia (reference), Hono, Fastify, Express |
| Data | `defineModel` model layer (Drizzle inside) | owned+engine | Prisma/Drizzle app-facing; PostgREST |
| UI | React (Preact opt-in) | — | Solid/Qwik |
| Routing | `@kwiva/router` | owned | TanStack Router (reference), Next, RR7 |
| Server-state | TanStack Query | engine | SWR |
| RPC client | `@kwiva/client` (Eden-like) | owned | codegen steps, raw fetch |
| UI primitives | Base UI | engine | Radix |
| Styling | Tailwind v4 | engine | CSS-modules-only |
| Auth | Better Auth | engine | Auth.js, hosted, custom |
| Studio (ops UI) | Kwiva Studio (`@kwiva/studio`) | owned | bespoke CRUD scaffolds |
| Realtime | CrossWS (via Nitro) | engine | Socket.io |
| Jobs/Queue | `@kwiva/queue` | owned | BullMQ-as-API |
| Storage | unstorage | engine | direct fs/memory |
| Observability | OTel | engine | bespoke logging |

## Decision-Making Rules Going Forward

1. Changes to the canonical stack require an ADR.
2. When ecosystems conflict — **prefer the boundary Kwiva controls** (owned DSL + generators over vendored frameworks).
3. When two candidates are equal on capability, choose: (a) fewer moving parts, (b) type-derivation strength, (c) portability of output, (d) ecosystem momentum on the oxc/Bun/Cloudflare axis.
