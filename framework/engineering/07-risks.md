# Engineering 07 — Risks

**Status**: Living · **Updated**: 2026-09-08 · **Docset**: v0.3

Risk register: what could sink or hurt Kwiva, with mitigations and triggers for re-planning.

## High risks

| # | Risk | Impact | Mitigation | Trigger to act |
|---|---|---|---|---|
| R1 | **Owned HTTP layer scope** (Elysia-parity reimplemented) | high | strict parity table (catalog §4); spike proves the 80% path first; the adapter layer is small (Web-Standard core) | spike > 2 weeks over |
| R2 | **Owned router scope** (TanStack-parity) | high | type-first design; route-tree codegen is well-understood; matchers are the hard part — start with score-based | type tests unstable |
| R3 | **oxc integration depth** (dev server, HMR, codemods) | high | napi bindings are stable; HMR protocol is the risk — fallback: full-reload for v1, hot-swap for v1.x | HMR flakes on example app |
| R4 | **TanStack Query wrapping** leaks | medium | hooks are the only surface; key derivation is model-identity — escape hatch `useApi` | apps needing raw Query APIs |
| R5 | **End-to-end type inference complexity** (model→route→client→hooks) | high | IR is a typed contract; type tests in CI; isolated declarations keep package types fast | typecheck > 10s on example |

## Medium risks

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R6 | Drizzle engine pin vs Bun.sql fast paths | medium | driver abstraction inside `@kwiva/data`; test both paths in CI |
| R7 | Nitro preset breakage on majors | medium | peer ranges + smoke suites (`test/node`, `test/cloudflare`) |
| R8 | Better Auth API drift | medium | thin `defineAuth` surface; integration tests per release |
| R9 | Studio scope creep (becoming Retool) | medium | generated-only + override points; no custom-builder ambition |
| R10 | Queue correctness (exactly-once illusions) | medium | document at-least-once + idempotency keys; DLQ first-class |
| R11 | Windows dev experience (Bun/oxc) | medium | WSL2 documented as primary; CI on windows runner |
| R12 | Config precedence confusion (folder vs inline) | medium | one rule (inline wins), surfaced in error messages when conflicts detected |

## Low / accepted

- **Naming collision** (Kwiva) — verified at publish; backups chosen.
- **Module ecosystem cold start** — first-party modules prove the pattern.
- **MCP security surface** — token abilities scoped; readOnly default documented.
- **Preact compat gaps** — CI matrix runs example app in both runtimes.

## Open questions

| Question | Current lean | Decide by |
|---|---|---|
| `bun test` vs custom harness runner | bun test + harness sugar | Phase 0 |
| Query devtools shipping in prod builds | dev-only flag, opt-in | Phase 1 |
| Cursor pagination in v1 (vs offset only) | include both — small cost | Phase 0 |
| Event outbox in v1 or v1.x | v1.x (design now, ship later) | Phase 2 |
| Edge WS via Durable Objects default? | cloudflare preset convention | Phase 3 |

## Re-planning triggers

1. Any phase milestone slips > 2 weeks → cut scope to catalog v1 rows, move the rest to v1.x (catalog is the scope ledger).
2. Any parity row proves structurally impossible (not just costly) → ADR to amend the catalog, with the gap documented.
3. Engine security incident → emergency release process (`engineering/04` runbook).

## What we are explicitly NOT doing

- No visual page builders/CMS drag-drop.
- No hosted Kwiva cloud.
- No framework-level LLM features (MCP exposure only).
- No second app language (TS only) — no PHP/Python runtime bridges.
- No bespoke bundler/parser work beyond oxc integration.
