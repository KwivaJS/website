# ADR-0007 — Bun as the Primary Runtime (Node/Hosted Compatible)

**Status**: Accepted · **Updated**: 2026-09-08

## Context

Kwiva must pick how apps run during dev/build/prod, balancing speed, DX, and deployment reach (hosts commonly support Node; serverless edge runs Web/Workers).

## Decision

- **Bun** is the primary runtime: `bun install`, `bun run`, dev server (`kwiva dev`), and default build target — fastest installs/tests and native TS execution for model-layer tooling.
- Node compatibility maintained: `@kwiva/*` ships to run on Node (npm/bun-installed Node users) without code changes at runtime layer; Nitro presets abstract the deploy target.
- Edge presets (Cloudflare Workers/Deno/Web) supported with documented runtime budgets and capsule audit (`--edge`), where they differ from Bun/Node.
- Build: single-binary (`bun build --compile`) recipe for lean self-hosting; Nitro output standard for everything else.

## Consequences

- Faster DX and simpler toolchain defaults, with a documented Node fallback.
- Some libs assume Node globals — guarded in `doctor` (Node globals detection) and documented.
- Edge differences handled by presets, not by forking app code; `--edge` audits dropped features.

**Related**: ADR-0001, ADR-0008, `docs/framework/foundation/01-runtime-bun.md`, `docs/framework/research/08-bun.md`