# ADR-0013 — Convention Enforcement via Lint Gates (Oxlint)

**Status**: Accepted · **Updated**: 2026-09-08

## Context

Kwiva codifies conventions in docs; but conventions only stick if enforced mechanically. We need a lint story that's part of DX, not an afterthought.

## Decision

Enforce conventions with **Oxlint** gates configured by Kwiva presets (deep oxc integration — ADR-0021):
- Kwiva default ruleset shipped in the app template: React rules, `no-engine-imports` (never import engines/references: `elysia`, `nitropack`, `drizzle-orm`, `better-auth`, `@tanstack/*`, `vite`, `@questpie/*`), module boundary lint, import/order, no-secrets markers, `no-raw-fetch-in-loaders`, `no-secrets-in-client`, `defineX` file conventions, lowercase-path conventions.
- `kwiva check` runs oxfmt + oxlint + typecheck; CI hook `pre-build`/pre-commit gate (turn-off-able but default-on).
- Security ruleset additions (injection/SSRF heuristics) opt-in in the security suite.
- Infrastructure notes: Oxlint is fast and extensible via plugins; migratable to ESLint if teams prefer.

## Consequences

- Convention drift reduced at commit time; `doctor` flags rule overrides that weaken gates.
- Teammates get instant feedback; codemods (oxc transformer) keep rules in sync on `upgrade`.
- Slight overhead to author rule exceptions — intentional friction.

**Related**: ADR-0011, ADR-0014, ADR-0016, ADR-0021, `docs/framework/engineering/02-testing.md`, `docs/framework/engineering/04-security.md`
