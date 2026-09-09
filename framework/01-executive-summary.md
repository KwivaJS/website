# 01 — Executive Summary

**Status**: Overview · **Updated**: 2026-09-08 · **Docset**: v0.3

## One Line

Kwiva is a **batteries-included TypeScript application framework** — focused on **expressive syntax, developer experience, performance, and scalability** — with a Laravel-shaped project structure, a framework-owned `@kwiva/*` API surface where **every construct is a `defineX` factory**, hidden engines (Nitro, Drizzle, Better Auth, TanStack Query), reference-only inspirations (Elysia, TanStack Router, Vite+, Laravel, Questpie), and an **oxc-powered toolchain** on the Bun runtime.

## Design Pillars

1. **Expressive syntax** — one `defineX` grammar for every construct; models as the single source of truth derive the whole stack; minimal boilerplate with plain, serializable definitions (no decorators, no classes, no config sprawl). Reading app code should feel like reading a description of the product.
2. **Developer experience** — CLI-first with generators for everything; a typed config folder with sensible defaults; auto-discovery over manual registration; friendly errors (did-you-mean, field-mapped validation, request correlation); one cohesive narrative instead of scattered library docs.
3. **Performance** — Rust-speed static machinery (oxc: sub-second checks, fast builds), Bun runtime (native TS, fast startup, single-binary), streaming-first SSR, layered caching (route rules → model cache → client cache), and type-level inference with zero runtime codegen.
4. **Scalability** — stateless multi-instance by construction (externalized state), tenancy-first data access, queue/tasks/schedule for background scale, edge presets, and deploy-anywhere outputs from one codebase.

## What is Kwiva

Kwiva delivers Laravel-grade developer experience on the modern JS/TS stack: one CLI (`kwiva`), a predictable lowercase filesystem, one config folder, typed end-to-end RPC, and a data layer derived from a single model definition — where the whole app deploys to any host via engine presets.

```
Model → database, migrations, seeders, REST API, typed RPC client, Studio, OpenAPI, MCP tools
```

## The Big Ideas

1. **The app is shaped like Laravel, but it is Kwiva's shape.** `src/app/` (models, http, services, jobs, events, console), `src/routes/`, `src/config/`, `src/database/`, `src/bootstrap/`, `src/ui/` — familiar separation of concerns, adapted to TypeScript, lowercased, enforced by the CLI. Nothing is copied; conventions are unique to Kwiva.

2. **Everything app-facing is a `defineX` factory.** `defineModel`, `defineController`, `defineMiddleware`, `defineServerRoute`, `defineService`, `defineJob`, `defineEvent`, `defineCommand`, `defineTask`, `definePage`, `definePolicy`, `defineAuth`, `defineConfig`, `defineApp` — one consistent convention (ADR-0019). Each factory exposes the **full feature surface of the underlying engine or reference** (see [07-feature-catalog](07-feature-catalog.md)).

3. **Engines are hidden; references inspire only.** App code imports only `@kwiva/*`. Nitro, Drizzle, Better Auth, and TanStack Query are sealed engines configured by the framework. Elysia, TanStack Router, and Vite+ are **reference-only**: they shape APIs and internals (Elysia's lifecycle and repo structure mirror into `@kwiva/http`; TanStack Router's ergonomics mirror into `@kwiva/router`; Vite+'s pipeline shape mirrors into the CLI) but ship zero dependencies (ADR-0016).

4. **Models are the single source of truth.** `defineModel('users', (f) => ({...}))` in `src/app/models/*.ts` derives the database schema, migrations, seeders, a typed REST API, an Eden-like typed RPC client, Kwiva Studio (generated operations UI), OpenAPI, and MCP tools. No drift between types, API, and database.

5. **Typed RPC + Query-grade data hooks, fully integrated.** The generated `@kwiva/client` gives Eden-Treaty-style `client.users.list()` end-to-end types from controllers; `@kwiva/react` data hooks (`useResource`, `useList`, `useMutation`) expose the complete TanStack Query feature set (caching, invalidation, optimistic updates, prefetch, infinite, suspense, devtools) with keys derived automatically from model/controller identity.

6. **The toolchain is oxc, deeply integrated.** The `kwiva` CLI is built directly on the oxc stack — rolldown (bundler), oxlint (lint), oxfmt (format), oxc transformer (TS/JSX), oxc resolver, oxc minifier, isolated declarations (d.ts). Vite+ is a reference for pipeline ergonomics, not a dependency (ADR-0021). Bun is the primary runtime (ADR-0007).

7. **All configuration lives in the config folder.** `src/config/*.ts` modules (typed, defaulted, env-aware) loaded through `kwiva.config.ts`; every `defineX` also accepts **full inline config**, and inline wins (ADR-0020).

## Who

- **App developers** — write models, controllers, and pages with `defineX`; the framework handles the rest.
- **Framework contributors** — own `@kwiva/*`, the engine wiring, and the oxc/Bun toolchain.
- **Platform teams** — deploy via Nitro presets (Node, Bun, Netlify, Vercel, Cloudflare, Lambda, static, single-binary) without code changes.

## Elevator Pitch

> Define your models once. Write controllers, services, jobs, and pages with one `defineX` convention. Call your API with a fully typed RPC client. Deploy anywhere — fast at every scale. Kwiva is the application layer you wish your stack shipped with.

## Scope

- **In**: framework API (`@kwiva/*`), model layer + generators, owned HTTP + router + SSR, hidden auth/RBAC/tenancy, Kwiva Studio, MCP, queue/cache/storage/schedule/events, modules, CLI on oxc, RPC client, data hooks, observability/security posture.
- **Explicitly out (v1)**: visual CMS drag-drop, hosted cloud, native mobile, non-TS app languages.

## Pointers

- Full feature outline with parity mapping → [07-feature-catalog.md](07-feature-catalog.md)
- Use cases, simple → complex, with code → [08-use-cases.md](08-use-cases.md)
- Naming & brand → [02-naming-and-brand.md](02-naming-and-brand.md)
- Architecture → [03-architecture-overview.md](03-architecture-overview.md)
- Risk register → [engineering/07-risks.md](engineering/07-risks.md)
- Decisions → [adr/README.md](adr/README.md)
