# 05 — Responsibility Matrix

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

A crisp ownership map: **what Kwiva controls**, **what it delegates to engines/tools**, and **what belongs to the application**. Prevents both "framework does too little" and "framework does too much".

## Ownership Legend

| Owner | Meaning |
|---|---|
| **Kwiva** | `@kwiva/*` package code (the frame/glue). Conventions this docset enforces. |
| **Engine** | A hidden dependency Kwiva configures and adapts (Nitro, Drizzle, Better Auth, TanStack Query). |
| **Toolchain** | oxc components the CLI integrates directly (rolldown, oxlint, oxfmt, transformer, resolver, minifier). |
| **Reference** | Inspiration-only library with zero dependency (Elysia, TanStack Router, Vite+, Laravel, Questpie). |
| **Application** | Code the end-developer writes in their project. |

## The Frame vs. The Parts

| Capability | Owner | Notes |
|---|---|---|
| Scaffold / project boot | **Kwiva (`kwiva new`)** | Own scaffolder, oxc-formatted output |
| Dev server, HMR | **Kwiva CLI** | Bun.serve + oxc resolver/transformer; Vite+ reference for DX |
| Production build | **Kwiva CLI → rolldown + Nitro** | `kwiva build` |
| Lint / format | **Toolchain (oxlint/oxfmt)** | `kwiva check`; includes `no-engine-imports` gate (ADR-0013) |
| TS transform / minify / d.ts | **Toolchain (oxc transformer/minifier/isolated declarations)** | Codemods power `kwiva upgrade` |
| Typecheck | **TypeScript (tsc/tsgo)** | Full typechecking stays on TS; isolated declarations for package d.ts |
| App configuration | **Kwiva (`@kwiva/config`)** | `src/config/*.ts` + `kwiva.config.ts`; inline overrides (ADR-0020) |
| Server portability (presets, storage, tasks) | **Engine (Nitro)** | Configured by Kwiva (ADR-0002) |
| HTTP pipeline, controllers, middleware, validation | **Kwiva (`@kwiva/http`)** | Owned; Elysia-mirroring internals (ADR-0003) |
| REST conventions (naming, status codes) | **Kwiva** | `server/03-api-design.md` |
| OpenAPI generation | **Kwiva (`@kwiva/http`)** | From controller/model IR |
| Typed RPC client | **Kwiva (`@kwiva/client`)** | Eden-like, generated from IR |
| Data schema (source of truth) | **Kwiva (`@kwiva/schema` + `@kwiva/data`)** | App writes `defineModel` files; Drizzle engine inside |
| DB migrations / seeds / factories | **Kwiva (`@kwiva/data`)** | model diff → SQL; seeders/factories Laravel-style |
| Kwiva Studio (ops UI) | **Kwiva (`@kwiva/studio`)** | Generated; mount route + auth |
| AuthN (sessions, plugins) | **Engine (Better Auth)** | Wired into HTTP + SSR by `@kwiva/auth` |
| Authorization (RBAC/policies) | **Kwiva (`definePolicy`)** | Conventions + model resolver enforcement |
| Tenancy | **Kwiva (`tenantField` + context)** | Bootstrap model, request ctx, scoping (ADR-0015) |
| UI routing | **Kwiva (`@kwiva/router`)** | Owned; TanStack Router reference |
| SSR orchestration | **Kwiva (`@kwiva/react`)** | Owns hydration/dehydration/streaming (ADR-0006) |
| Server-state cache (client) | **Engine (TanStack Query)** | Surfaced via data hooks; never imported directly |
| Styling | **Tailwind v4 + Base UI** | `@kwiva/ui-kit` adds token presets |
| Prerender/ISR/SWR route behavior | **Engine (Nitro route rules)** | Kwiva presets + per-route override via `defineServerRoute` |
| Cache & storage | **Engine (unstorage)** | Kwiva presets + config |
| Queue/jobs | **Kwiva (`@kwiva/queue`)** | Own transport (Redis/DB); `defineJob` |
| Events/listeners/outbox | **Kwiva (`@kwiva/events`)** | `defineEvent` |
| Tasks & cron | **Kwiva + Nitro** | `defineTask` + schedule config; engine executes |
| WebSockets/SSE | **Engine (CrossWS) + Kwiva channels API** | Pattern documented in `data/04-realtime.md` |
| CLI generators | **Kwiva (`kwiva make:*`)** | Templates emit Kwiva conventions |
| Console/REPL | **Kwiva (`kwiva console`)** | Bun REPL + app context |
| Module system | **Kwiva (`@kwiva/modules`)** | `defineModule` (ADR-0010) |
| Error taxonomy | **Kwiva (`@kwiva/core`)** | Maps domain errors → HTTP |
| Logging/tracing | **OTel + Kwiva (shape)** | Kwiva defines log schema & trace naming |
| Security headers/CSP | **Kwiva (defaults)** | Route rules, app overrides |
| Rate limiting | **Kwiva preset + engine route rules** | Config-driven |
| Testing harness | **Kwiva (`@kwiva/testing`)** | On `bun test`; Playwright e2e |
| Deployment CLI | **Kwiva (`kwiva deploy`)** | Build (rolldown + Nitro preset) + provider deploy |

## Boundary Rules

1. **Kwiva code must not duplicate engine capability.** If a feature exists upstream (Nitro storage, CrossWS), Kwiva only *configures & documents* it. Exceptions are deliberate and ADR-backed: the HTTP pipeline (Elysia is reference-only), the router (TanStack Router is reference-only), the toolchain pipeline (Vite+ is reference-only), and the data foundation.
2. **Application code must not re-architect framework layers.** Applications write `defineX` files; they don't build their own request pipeline, router, or query cache.
3. **Engine choices are Kwiva's; version pins are the app's.** Kwiva ships `peerDependencies` ranges; apps pin exact versions.
4. **Extension over replacement.** Want a different validator? Standard Schema abstracts it. Want Hono instead of the owned HTTP layer? That is a full stack change (ADR required) — not a per-app choice.
5. **The framework has veto power on conventions.** Loaders fetch via the typed RPC client, not raw fetch; enforced by lint (ADR-0013).

## When Kwiva "Adds Value" vs "Gets in the Way"

| Scenario | Behavior |
|---|---|
| "I want a classic API + SPA" | `kwiva new --mode=api+spa` → no SSR, full type-safety + RPC client |
| "I want SSR everywhere" | default mode; route rules per page |
| "I want a static site" | `kwiva new --mode=static` → prerender, no server code |
| "I need edge WebSockets" | Cloudflare preset + channels API (CrossWS underneath) |
| "I need a custom build step" | `kwiva.config.ts > build` exposes rolldown options + hooks |
| "I need a library Kwiva doesn't wrap" | Use it directly; open an ADR/issue for first-class adoption |

## Versioning & Support Contract

- Packages follow **semver**.
- Compatibility matrix (`package.json` peer ranges) documents which Nitro/Drizzle/Better-Auth/Query/Bun/oxc versions each release supports.
- Security fixes: priority on `@kwiva/core`, `@kwiva/http`, `@kwiva/cli`.
- Deprecation policy: 2-major-version window with codemods (`kwiva upgrade` runs oxc-powered recipes — see `engineering/05-migration.md`).
