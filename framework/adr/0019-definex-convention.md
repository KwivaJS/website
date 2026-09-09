# ADR-0019 — The `defineX` Convention

**Status**: Accepted · **Updated**: 2026-09-08

## Context

Kwiva apps compose many construct types (models, controllers, middleware, pages, jobs, events, commands, tasks, policies, config, services, auth, modules, plugins). Without a single convention, each API invents its own authoring shape — class vs function vs object — and the learning surface fragments.

## Decision

**Every app-facing construct is a `defineX` factory.** One mental model, one authoring grammar:

| Factory | File | Package |
|---|---|---|
| `defineApp` | `src/bootstrap/app.ts` | `@kwiva/core` |
| `defineConfig` | `kwiva.config.ts` + `src/config/*.ts` | `@kwiva/config` |
| `defineModel` | `src/app/models/*.ts` | `@kwiva/data` |
| `defineController` | `src/app/http/controllers/*.ts` | `@kwiva/http` |
| `defineMiddleware` | `src/app/http/middleware/*.ts` | `@kwiva/http` |
| `defineAuth` | `src/app/http/auth.ts` | `@kwiva/auth` |
| `defineServerRoute` | `src/routes/*.ts` | `@kwiva/http` |
| `defineService` | `src/app/services/*.ts` | `@kwiva/services` |
| `defineJob` | `src/app/jobs/*.ts` | `@kwiva/queue` |
| `defineEvent` | `src/app/events/*.ts` | `@kwiva/events` |
| `definePolicy` / `defineGate` | `src/app/policies/*.ts` | `@kwiva/core` |
| `defineTask` | `src/app/tasks/*.ts` | `@kwiva/http` |
| `defineCommand` | `src/app/console/*.ts` | `@kwiva/cli` |
| `definePage` | `src/ui/pages/**` | `@kwiva/react` |
| `defineSeeder` / `defineFactory` / `defineMigration` | `src/database/**` | `@kwiva/data` |
| `defineModule` | packages | `@kwiva/core` |
| `definePlugin` | packages | `@kwiva/core` |
| `defineMcpTool` | `src/app/mcp/*.ts` | `@kwiva/mcp` |
| `defineStudioScreen` | `src/app/studio/*.tsx` | `@kwiva/studio` |

Rules:
- **Parity mandate**: each `defineX` exposes the full feature surface of its underlying engine or reference — the catalog (`07-feature-catalog.md`) is the parity ledger, verified by QA.
- **Inline options accepted**: every factory takes an options object that can override folder config (ADR-0020).
- **File conventions enforced**: one factory per file type, discovery-based registration, lowercase naming — oxlint gates (ADR-0013).
- Definitions are plain data + functions (no classes) — serializable into IR, statically analyzable.

## Consequences

- Uniform DX: learn the grammar once, apply everywhere; generators (`kwiva make:*`) emit the same shape.
- Static analysis (codemods, IR generation, lint rules) works uniformly across constructs.
- New constructs must ship with a `defineX` + a `make:` generator — a DoD rule for framework features.

**Related**: ADR-0011, ADR-0013, ADR-0018, ADR-0020, `docs/framework/07-feature-catalog.md`, `docs/framework/application/01-project-structure.md`
