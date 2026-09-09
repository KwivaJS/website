# DIRECTORY GUIDE — README for docs/framework/

**Status**: Living · **Updated**: 2026-09-08 · **Docset**: v0.3

Kwiva is a batteries-included TypeScript application framework with a Laravel-shaped, framework-owned architecture — built on four pillars: **expressive syntax** (one `defineX` grammar, model-derived everything), **developer experience** (CLI-first, one config folder, auto-discovery), **performance** (oxc toolchain + Bun runtime + streaming SSR), and **scalability** (tenancy-first, stateless scale, deploy-anywhere). One name, one CLI, one config folder, one `defineX` convention. Everything needed to understand its design lives in this directory.

## How to read these docs

1. **Start here** — `01-executive-summary.md`, `03-architecture-overview.md`, `04-stack-decision.md`.
2. **Scope** — `07-feature-catalog.md` (every feature, mapped to its `defineX` factory and parity source) and `08-use-cases.md` (end-to-end scenarios from a todo app to a multi-tenant realtime SaaS).
3. **Boundaries** — `05-responsibility-matrix.md` (app vs framework vs engines) and `06-adapter-matrix.md` (deploy targets).
4. **Conventions** — the `application/`, `foundation/`, `frontend/`, `server/`, `data/`, `platform/`, `engineering/` folders are grouped by concern and are the contract for how apps are written.
5. **Why** — `research/` contains engine/reference dives (these are **not** app-facing; they document the libraries Kwiva's design is modeled on). `adr/` records every architectural decision.

## The core rule

> **App code imports only `@kwiva/*`. Every app-facing construct is a `defineX` factory. Engines are sealed internals; references inspire the shape but ship zero dependencies.**

## Index

### Overview
| Doc | Description |
|---|---|
| [01-executive-summary](01-executive-summary.md) | What, why, who, and the elevator pitch |
| [02-naming-and-brand.md](02-naming-and-brand.md) | Branding, naming rationale, terminology |
| [03-architecture-overview.md](03-architecture-overview.md) | The full architecture diagram and layers |
| [04-stack-decision.md](04-stack-decision.md) | Why each technology was chosen + rejected |
| [05-responsibility-matrix.md](05-responsibility-matrix.md) | Who owns what (app vs framework vs engines) |
| [06-adapter-matrix.md](06-adapter-matrix.md) | Deploy targets, presets, adapters |
| [07-feature-catalog.md](07-feature-catalog.md) | Exhaustive feature outline + parity mapping (Laravel, Elysia, Nitro, TanStack Router, TanStack Query, Bun) |
| [08-use-cases.md](08-use-cases.md) | Use cases from simple to complex, with code |

### Research (engine/libraries — reference, not app-facing)
| Doc | Description |
|---|---|
| `research/01-nitro.md` | Nitro v3 deep dive: entry, lifecycle, storage, cache, tasks, route rules |
| `research/02-vite.md` | Vite 8 / Rolldown (reference only — models dev-server/HMR ergonomics) |
| `research/03-viteplus.md` | Vite+ `vp` CLI surface (reference only — models CLI pipeline shape) |
| `research/04-tanstack-router.md` | TanStack Router v1 (reference for the owned router) |
| `research/05-tanstack-start.md` | TanStack Start (reference; not adopted) |
| `research/06-tanstack-query.md` | TanStack Query v5 (hidden engine behind data hooks) |
| `research/07-elysia.md` | Elysia (reference only — models the HTTP package's structure and API shape) |
| `research/08-bun.md` | Bun runtime capabilities |
| `research/09-better-auth.md` | Better Auth (hidden engine behind `@kwiva/auth`) |
| `research/10-questpie.md` | Questpie one-schema pattern (architectural inspiration only, zero dependency) |
| `research/11-laravel.md` | Laravel DX patterns Kwiva adapts (shaped uniquely) |
| `research/12-ecosystem.md` | Ecosystem landscape, adjacent frameworks |

### Foundation (what the framework itself provides)
| Doc | Description |
|---|---|
| `foundation/01-runtime-bun.md` | Runtime selection & execution model (Bun first, cross-runtime adapters) |
| `foundation/02-build-pipeline-oxc.md` | Build pipeline: oxc toolchain (rolldown, oxlint, oxfmt, transformer, resolver, minifier) — Vite+ reference only |
| `foundation/03-data-layer-models.md` | Model layer (`defineModel`) — the data foundation |
| `foundation/04-framework-http.md` | Framework HTTP API (`defineController`, `defineMiddleware`, `defineServerRoute`) |
| `foundation/05-server-foundation.md` | Framework server core (Nitro engine encapsulated) |

### Application (what an app looks like)
| Doc | Description |
|---|---|
| `application/01-project-structure.md` | Laravel-shaped, lowercase filesystem conventions |
| `application/02-package-architecture.md` | Elysia-style repo layout & `@kwiva/*` package topology |
| `application/03-configuration.md` | Config folder (`src/config/*.ts` + `kwiva.config.ts`) |
| `application/04-environment.md` | Env, secrets, typed env access |

### Frontend (`@kwiva/react` + `@kwiva/router`)
| Doc | Description |
|---|---|
| `frontend/01-routing.md` | Owned router (`definePage`) — TanStack Router-grade ergonomics |
| `frontend/02-ssr.md` | SSR orchestration (streaming, hydration, ISR) |
| `frontend/03-frontend-foundation.md` | React/Preact, data hooks (TanStack Query hidden), RPC client |
| `frontend/04-ui-library.md` | Design system & component library strategy |

### Server (framework server API)
| Doc | Description |
|---|---|
| `server/01-request-lifecycle.md` | Full request lifecycle across layers |
| `server/02-server-capabilities.md` | Middleware, guards, macros, plugins, WebSockets |
| `server/03-api-design.md` | REST conventions, validation, OpenAPI, typed RPC client |
| `server/04-error-handling.md` | Error taxonomy & handling strategy |
| `server/05-caching.md` | SWR/ISR/cache strategy |

### Data (models & runtime data plane)
| Doc | Description |
|---|---|
| `data/01-database.md` | Models, migrations, seeders, factories, query builder |
| `data/02-storage.md` | Storage, file/object storage |
| `data/03-queue-jobs.md` | Queue & job system (`defineJob`) |
| `data/04-realtime.md` | WebSockets & SSE (channels) |
| `data/05-tasks-scheduling.md` | Tasks (`defineTask`) & schedule (cron) |

### Platform (capabilities)
| Doc | Description |
|---|---|
| `platform/01-auth.md` | `@kwiva/auth` surface (Better Auth engine hidden) |
| `platform/02-authorization.md` | RBAC/tenancy-aware permissions (`definePolicy`) |
| `platform/03-tenancy.md` | Multi-tenancy model |
| `platform/04-studio.md` | Kwiva Studio — model-generated operations UI (`@kwiva/studio`) |
| `platform/05-ai-mcp.md` | AI & MCP integration |
| `platform/06-modules.md` | Module system (`defineModule`) |
| `platform/07-application-composition.md` | Composing capabilities into apps (`defineApp`) |

### Engineering
| Doc | Description |
|---|---|
| `engineering/01-cli.md` | `kwiva` CLI reference |
| `engineering/02-testing.md` | Testing strategy (unit/integration/e2e) |
| `engineering/03-observability.md` | Logging, tracing, metrics |
| `engineering/04-security.md` | Security posture |
| `engineering/05-migration.md` | Upgrades + data migrations |
| `engineering/06-roadmap.md` | Phased delivery plan |
| `engineering/07-risks.md` | Risks, mitigations, open questions |

### Architecture Decision Records
`adr/` — see [ADR index](adr/README.md) for all 21 decisions.

## The `defineX` convention at a glance

| Factory | File | Package | Parity source |
|---|---|---|---|
| `defineApp` | `src/bootstrap/app.ts` | `@kwiva/core` | Laravel bootstrap + Elysia instance |
| `defineConfig` | `kwiva.config.ts`, `src/config/*.ts` | `@kwiva/config` | Laravel `config/*.php` |
| `defineModel` | `src/app/models/*.ts` | `@kwiva/data` | Eloquent + Drizzle query surface |
| `defineController` | `src/app/http/controllers/*.ts` | `@kwiva/http` | Elysia routes/lifecycle/validation |
| `defineMiddleware` | `src/app/http/middleware/*.ts` | `@kwiva/http` | Elysia lifecycle + Laravel middleware |
| `defineServerRoute` | `src/routes/*.ts` | `@kwiva/http` | Nitro server routes + route rules |
| `defineService` | `src/app/services/*.ts` | `@kwiva/services` | Laravel service container |
| `defineJob` | `src/app/jobs/*.ts` | `@kwiva/queue` | Laravel queues (BullMQ-grade transport) |
| `defineEvent` | `src/app/events/*.ts` | `@kwiva/events` | Laravel events/listeners + outbox |
| `defineCommand` | `src/app/console/*.ts` | `@kwiva/cli` | Laravel Artisan commands |
| `defineTask` | `src/app/tasks/*.ts` | `@kwiva/http` | Nitro tasks + Laravel scheduler |
| `definePage` | `src/ui/pages/**` | `@kwiva/react` | TanStack Router (file-based, typed) |
| `definePolicy` | `src/app/policies/*.ts` | `@kwiva/core` | Laravel policies/gates |
| `defineAuth` | `src/app/http/auth.ts` | `@kwiva/auth` | Better Auth |
| `definePlugin` | packages | `@kwiva/core` | Elysia plugins |
| `defineModule` | packages | `@kwiva/core` | Laravel modules + package composition |

## Status & Next Steps

- [x] Architectural direction: Laravel-shaped app, `@kwiva/*` API surface, engines hidden, references (Elysia, TanStack Router) inspire only
- [x] Model layer: `defineModel` (function-based, per-model files) as the data foundation
- [x] Owned HTTP layer (`@kwiva/http`, Elysia-mirroring structure) and owned router (`@kwiva/router`)
- [x] Toolchain: deep oxc.rs integration (rolldown, oxlint, oxfmt, transformer/resolver/minifier, isolated declarations); Vite+ is reference-only (ADR-0021)
- [x] Typed RPC client (`@kwiva/client`, Eden-like) + TanStack Query-backed data hooks (hidden engine)
- [x] `defineX` convention for every app-facing construct (ADR-0019)
- [x] Config folder: all configuration in `src/config/` + `kwiva.config.ts`, inline overrides allowed (ADR-0012/0020)
- [x] Deep research on engines and references (Nitro, Elysia, Drizzle, Better Auth, TanStack, Vite+, Bun, Questpie, Laravel)
- [x] Architecture documentation (this docset, v0.3)
- [x] Naming & brand: Kwiva chosen, conventions documented
- [ ] Validation spike: skeleton app (model layer + HTTP + SSR + data hooks + RPC client)
- [ ] Package scaffolding (`packages/core`, `packages/http`, `packages/data`, `packages/react`, CLI)
- [ ] MVP release

## Contributing / Discussion

Open questions and unresolved tradeoffs are tracked in [engineering/07-risks.md](engineering/07-risks.md). Architecture changes require an ADR.
