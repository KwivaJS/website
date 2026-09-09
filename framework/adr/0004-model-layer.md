# ADR-0004 — Model Layer: `defineModel` (Questpie-Inspired, Independent)

**Status**: Accepted (amended by ADR-0018) · **Updated**: 2026-09-08

## Context

Kwiva wants Laravel/OneSchema-class DX: express the entire data model (fields, relations, permissions, tenancy, indexes, audit) once, and derive DB schema, REST APIs, typed clients, migrations, Kwiva Studio (operations UI), and MCP tools from it. The *one-schema* architectural pattern was popularized by Questpie. Kwiva is inspired by that architecture while remaining completely independent.

## Decision

- Adopt the one-schema architectural pattern for **Kwiva's own data foundation**, implemented from scratch in Kwiva-owned packages:
  - `@kwiva/schema` — field DSL + model IR (validation via Standard Schema).
  - `@kwiva/data` — `defineModel` runtime: query builder, transactions, relations, migrations, seeders, factories; Drizzle engine (SQLite dev, Postgres prod).
  - `@kwiva/client` — typed RPC SDK; `@kwiva/studio` — Kwiva Studio (generated operations UI); `@kwiva/mcp` — optional MCP server.
- Models are **function-based** (`defineModel(...)`) in **per-model files** (`src/app/models/*.ts`) — see ADR-0018.
- **No runtime dependency** on `@questpie/*`: Questpie remains only an architectural reference (see `research/10-questpie.md`).
- Deterministic derived surface: exactly 5 generated REST routes per model (list/get/create/update/delete), plus custom actions via `defineController`.
- IR lives in `src/.kwiva/` (generated, gitignored) and feeds every consumer (routes, client, Studio, OpenAPI, MCP).

## Consequences

- Kwiva owns the model plane end-to-end (DSL, IR, generators, Studio) — unique differentiator, full control, no licensing/version coupling to Questpie.
- We trade Questpie's maturity for engineering surface: codegen correctness, migrations, and permission integration all become Kwiva deliverables (roadmap P0–P1).
- Teams get true end-to-end typing (model → DB → API → client → Studio → MCP) and standardized CRUD/tenancy/validation.
- Escape hatches (raw SQL via `db.raw`, hand-authored controllers) keep flexibility.

**Related**: ADR-0001, ADR-0012, ADR-0015, ADR-0018, `docs/framework/foundation/03-data-layer-models.md`, `docs/framework/data/*`
