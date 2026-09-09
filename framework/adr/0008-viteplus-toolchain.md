# ADR-0008 — Vite+ as the Toolchain

**Status**: Superseded by ADR-0021 (oxc toolchain; Vite+ reference-only) · **Updated**: 2026-09-08

## Context

Kwiva needs a build/dev toolchain: bundler, HMR, env, plugins, recipes, and script runner — balancing ecosystem (Vite) with a batteries-included workflow.

## Decision (historical)

Use **Vite+** (`vp`) as the toolchain layer for Kwiva: `vp` commands wrapped/aliased by the `kwiva` CLI; React + TS plugins wiring published in the app template; Vitest/Oxlint configured via Kwiva presets; Rollup/Vite ecosystem available; server-side code passed to Nitro build.

## Supersession

ADR-0021 replaces this: the pipeline is **oxc-native** (rolldown bundling, oxc transformer/resolver/minifier, oxlint, oxfmt, isolated declarations, codemods) with Bun-native runtime management; Vite+ and Vite are **references** for CLI pipeline shape (`create/install/dev/check/test/build/pack`) and dev-server DX. Rationale: server dev needs native TS execution (Bun), the client build needs only oxc components, and owning the pipeline removes double-toolchain upgrades. See `research/02-vite.md`, `research/03-viteplus.md`.

**Related**: ADR-0001, ADR-0011, ADR-0021, `docs/framework/research/03-viteplus.md`, `docs/framework/foundation/02-build-pipeline-oxc.md`
