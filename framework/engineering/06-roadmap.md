# Engineering 06 — Roadmap

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

Phased delivery plan. Each phase ends with a verifiable milestone (all tests green on the example app). Feature status keys match [07-feature-catalog.md](../07-feature-catalog.md).

## Phase 0 — Spike (validation)

**Goal**: prove the core type path end-to-end.

- `@kwiva/schema` + `@kwiva/data`: `defineModel` → IR → SQLite tables → query builder (where/relations/pagination)
- `@kwiva/http` minimal: 5 generated routes per model + typed context
- `@kwiva/client` type-level inference from the route manifest (no network needed)
- `kwiva dev` v0: Bun.serve + native ESM (no oxc integration yet)
- Example: UC-2 (todo app) in `example/`

**Milestone**: todo app CRUD with typed client + tests, no engine leaks.

## Phase 1 — MVP kernel

**Goal**: the full `defineX` surface, v1-scoped.

- HTTP: full lifecycle, guards, macros, middleware, error taxonomy, validation
- Router + React: file-based pages, loaders, beforeLoad, SSR streaming
- Data hooks (Query engine wired), `useResource`/`useList`/`useMutation`
- Auth (password + OAuth), policies, tenancy (domain mode)
- CLI: new/dev/build/check/test/make:*/db:*/queue/schedule
- oxc integration: check (oxlint+oxfmt), build (rolldown+minifier), dev server transform
- Studio v0 (generated CRUD for one model)
- Deploy: node_server + bun presets

**Milestone**: UC-1/2/3/5 in `example/`; e2e suites green.

## Phase 2 — Realtime + ops

- Events + channels (WS via CrossWS) + broadcasting; SSE
- Queue (redis + database transports), DLQ, `queue:*` CLI
- Tasks + schedule + scheduler controls
- Cache tags + ISR/SWR route rules; storage disks (local/s3)
- Observability v1: OTel spans/metrics/log schema; health endpoints
- Studio v1 (all models, filters, actions); MCP v0 (model tools, bearer auth)

**Milestone**: UC-4 (realtime chat) + UC-6 (MCP) in `example/`.

## Phase 3 — Ecosystem & polish

- Modules (`defineModule`, `add`, `module:build`) + first-party modules (auth-kit, blog)
- Upgrade codemods + `doctor` + `config:cache`
- Edge preset hardening + `test/cloudflare` smoke suite
- Mail + notifications (v1.x catalog items); passkeys; MFA; orgs
- Dev overlay (spans, cache, route tree); DB studio
- Docs site + addons registry at **kwiva.js.org** (js.org subdomain via GitHub Pages) + public beta

**Milestone**: UC-7/UC-8; public 1.0.

## Phase 4 — v2 candidates

- Multi-database + read replicas; org tenancy mode; presence at scale
- Analytics module; localized fields; per-tenant rate limits
- tsgo typecheck integration when stable; wasm-oxc probes for editor tooling

## Tracking

- Catalog sections ↔ phases: §1–§9 → P0/P1; §12–§16 → P2; §17–§18 → P2/P3; §21 → P3.
- Risk register drives sequencing: any risk that materializes → re-plan before expanding surface.
- The `example/` app is the acceptance bar: every phase ships with its use cases green.
