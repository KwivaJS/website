# ADR-0001 — Canonical Stack

**Status**: Accepted (amended by ADR-0016, ADR-0021) · **Updated**: 2026-09-08

## Context

Kwiva must pick a default, coherent stack that maximizes DX, type-safety, portability, and long-term viability — while keeping adaptation possible for teams with different priorities.

## Decision

Kwiva's canonical stack (v1), with the engine/reference/toolchain split (ADR-0016):

| Area | Choice | Class |
|---|---|---|
| Language | TypeScript (strict), Bun as runtime | runtime |
| Frontend | React (Preact opt-in), **owned router**, TanStack Query | router = owned; query = engine |
| Styling | Tailwind CSS v4 + Base UI | engine |
| Server | Nitro (carrier) hosting the **owned HTTP pipeline** + Kwiva renderer | Nitro = engine; HTTP = owned |
| Data | Kwiva model layer (`defineModel`, `@kwiva/schema` + `@kwiva/data`, Drizzle engine) | owned + engine |
| Auth | Better Auth (behind `@kwiva/auth`) | engine |
| Tooling | **oxc.rs** (rolldown, oxlint, oxfmt, transformer, resolver, minifier, isolated declarations); bun test + Playwright | toolchain |

References shaping owned surfaces (zero dependency): Elysia (HTTP), TanStack Router (router), Vite+ (CLI pipeline), Laravel (DX grammar), Questpie (one-schema derivation).

## Consequences

- Teams inherit a proven, combinable toolset; Kwiva differentiates on the model layer + owned surfaces + DX, not novel runtimes.
- The overlap problem (engine routing vs owned pipeline) is resolved by `compose(app)` at the server entry (ADR-0002/0003).
- Non-default substitutions (Next.js-style SSR, alternative DB) are explicitly second-class; no runtime dependency on Questpie or Elysia packages.

**Related**: ADR-0002, ADR-0003, ADR-0004, ADR-0005, ADR-0007, ADR-0016, ADR-0021, `docs/framework/04-stack-decision.md`
