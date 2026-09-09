# ADR-0017 — Elysia-Style Repo & Package Structure; Many Equal Packages

**Status**: Accepted · **Updated**: 2026-09-08

## Context

Kwiva must organize its monorepo and npm packaging. Elysia's repo (github.com/elysiajs/elysia) is a proven minimal layout for a typed framework; its single-package + subpath-exports model keeps internals cohesive. Kwiva also needs React/CLI/Studio satellites that version independently.

## Decision

- **Repo layout mirrors elysiajs/elysia**: `packages/` (instead of Elysia's single `src/`), `example/` (dogfood app), `test/{functionality,types,node,cloudflare}` (four-way split), `build.ts` (rolldown + isolated declarations), `knip.json`, `AGENTS.md`, `tsconfig*.json`, Bun workspaces.
- **Many equal `@kwiva/*` packages** (not one core with subpaths): core, config, schema, data, http, router, react, client, services, queue, events, auth, studio, mcp, ui-kit, cli, testing — each owning one concern, with an acyclic dependency graph (`core`/`schema` are leaves; nothing imports `cli`).
- **`packages/http` internal tree mirrors Elysia's `src/`**: flat core modules (`context.ts`, `compose.ts`, `cookies.ts`, `error.ts`, `manifest.ts`, `parse-query.ts`, `formats.ts`, `trace.ts`, `types.ts`, `utils.ts`) + `adapter/{bun,web-standard,cloudflare-worker}`, `type-system/`, `universal/{server,env,file}`, `ws/` — plus Kwiva-specific dirs (`controller/`, `middleware/`, `routes/`, `tasks/`).
- Each package exposes deep subpath exports mirroring Elysia's exports map (e.g. `@kwiva/http/context`, `@kwiva/http/adapter/bun`, `@kwiva/http/ws`).
- Test suite split mirrors Elysia's: functionality (bun test), types (tsc + expect-type), node + cloudflare preset smoke tests.

## Consequences

- Independent versioning and failure isolation per concern; apps depend on exactly what they use.
- Elysia's structural pattern (Web-Standard core + runtime adapters + typed edges) is inherited as organization wisdom, not code.
- More packages to release/coordinate (changesets-style release orchestration; compatibility matrix documented per release).

**Related**: ADR-0003, ADR-0016, ADR-0021, `docs/framework/application/02-package-architecture.md`, `docs/framework/research/07-elysia.md`
