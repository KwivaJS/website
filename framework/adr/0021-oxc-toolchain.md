# ADR-0021 — oxc Toolchain, Deeply Integrated; Vite+ Reference-Only

**Status**: Accepted (supersedes ADR-0008) · **Updated**: 2026-09-08

## Context

Kwiva needs a build/dev toolchain: bundler, transform, lint, format, typecheck acceleration, codemods. Vite+ (via Vite/Rolldown) was the original choice (ADR-0008). Reviewing the actual requirements: the dev server must execute server TS natively (Bun), the client build needs transform + resolve + bundle + minify, and the CLI needs lint/format/codemods at speed. Every one of those is an oxc.rs component; a Vite+ wrapper adds an opaque layer and a second release-cadence to track.

## Decision

**The `kwiva` CLI integrates the oxc stack (https://oxc.rs) directly; Vite+ and Vite are references (zero dependency).**

| oxc component | CLI use |
|---|---|
| rolldown (Rollup-compatible bundler) | `kwiva build` client+server; package `dist/` builds |
| oxc transformer | TS/JSX transform + target lowering; `kwiva upgrade` codemods |
| oxc resolver | dev-server module graph resolution |
| oxc minifier | production minification |
| oxlint | `kwiva check` lint + convention gates (ADR-0013) |
| oxfmt | formatting (`--fix`) |
| isolated declarations | package `.d.ts` emission (`build.ts`) |

- `kwiva dev` = Bun.serve + oxc resolver/transformer, native ESM, framework-aware HMR (no bundling of server code in dev — Bun executes TS).
- Vite+ remains the reference for CLI pipeline shape (`create/dev/check/test/build/pack` verbs, check-in-one-command, task caching) and dev DX (error overlay — v1.x).
- Build config surface: `kwiva.config.ts > build` exposes full inline rolldown options (ADR-0020 escape hatch).
- Full typechecking stays on tsc (tsgo when stable); isolated declarations accelerate package builds.

## Consequences

- One vendor axis (oxc, Rust) for all static machinery — consistent performance; `kwiva check` targets sub-second on the example app.
- No Vite+/Vite upgrade coupling; plugin escape hatch via rolldown's Rollup-compatible API.
- Deep integration is an engineering commitment (bindings, HMR protocol — risk R3); fallback documented (full-reload HMR for v1 if hot-swap flakes).
- Testing uses bun test + Playwright (Vitest is a DX reference, not a dependency).

**Related**: ADR-0008 (superseded), ADR-0001, ADR-0011, ADR-0013, `docs/framework/foundation/02-build-pipeline-oxc.md`, `docs/framework/research/02-vite.md`, `docs/framework/research/03-viteplus.md`
