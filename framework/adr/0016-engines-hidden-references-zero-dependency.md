# ADR-0016 — Engines Hidden, References Zero-Dependency

**Status**: Accepted · **Updated**: 2026-09-08

## Context

Kwiva's surface must stay stable while the ecosystem moves. Two coupling risks exist: app code importing foundation libraries directly (upgrade pain, lock-in), and Kwiva's roadmap being coupled to another project's release cadence. The original design hid all libraries as "engines"; the v0.3 revision splits that into two classes.

## Decision

Every underlying library is classified:

**Engines (hidden, sealed internals)** — configured by Kwiva, never imported by app code:
- nitropack/h3 (server carrier, presets, storage, cache, tasks, ws)
- drizzle-orm (SQL)
- better-auth (authN)
- @tanstack/query (client cache behind data hooks)
- crossws (websockets), unstorage (kv/blob), Base UI + Tailwind (styling)

**References (inspiration-only, zero dependency)** — shape APIs and internals, never in the dependency tree:
- elysia → `@kwiva/http` structure + lifecycle + macro model (ADR-0003)
- tanstack router → `@kwiva/router` ergonomics (ADR-0005)
- vite+ / vite → CLI pipeline shape + dev DX (ADR-0021)
- laravel → app shape, config folder, console/queue/events grammar
- questpie → one-schema derivation pattern (ADR-0004)

Enforcement:
- `no-engine-imports` oxlint gate bans engine AND reference imports in app code (ADR-0013).
- Feature parity is a first-class contract: each `defineX` exposes the full feature surface of its engine/reference (catalog `07-feature-catalog.md` parity tables).
- Engine upgrades ride Kwiva releases via peer ranges; reference evolution is adopted as ideas through ADRs.

## Consequences

- App code is portable across engine majors (Kwiva absorbs breaking changes).
- Owning HTTP + router + toolchain pipeline is significant engineering surface (risks R1–R3) — accepted for control and stability.
- The parity tables become the scope ledger; gaps are tracked as risks, not surprises.

**Related**: ADR-0001, ADR-0003, ADR-0005, ADR-0009, ADR-0021, `docs/framework/03-architecture-overview.md`, `docs/framework/05-responsibility-matrix.md`
