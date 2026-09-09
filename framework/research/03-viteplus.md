# Research — Vite+ (VoidZero)

**Source**: https://viteplus.dev (guide/config), live research 2026-09-08
**Relevance**: **Reference only** (ADR-0021 supersedes ADR-0008) — Vite+ models the CLI pipeline shape and dev ergonomics that Kwiva's oxc-native CLI mirrors. Not a dependency.

## What Vite+ Is

"The unified toolchain and entry point for web development." One tool managing **runtime, package manager, and frontend toolchain** by combining:

- Vite (dev/build)
- Vitest (test)
- Rolldown (bundler engine)
- tsdown (library builds)
- Oxlint (lint), Oxfmt (format)
- Vite Task (task runner with caching)

Ship: `vp` (global CLI) + `vite-plus` (local package). `vp create`, `vp migrate` to onboard; `vp env off` to opt out; `vp implode` to remove.

## Install (researched facts)

- macOS/Linux: `curl -fsSL https://vite.plus | bash`
- Windows: `irm https://vite.plus/ps1 | iex` (or `vp-setup.exe`, not code-signed — SmartScreen warning expected)
- Alpine/musl: requires `libstdc++`.

## Command Surface (the reference model for `kwiva`)

| Vite+ command | Kwiva equivalent |
|---|---|
| `vp create` | `kwiva new` |
| `vp dev` | `kwiva dev` (Bun.serve + oxc) |
| `vp check` (fmt + lint + types) | `kwiva check` (oxfmt + oxlint + tsc) |
| `vp test` | `kwiva test` (bun test + Playwright) |
| `vp build` | `kwiva build` (rolldown + Nitro) |
| `vp pack` | `kwiva build --binary` / `module:build` |
| `vp preview` | `kwiva preview` |
| `vp run` (task caching) | `kwiva` commands (rolldown incremental cache) |
| `vp env` (runtime mgmt) | Bun-native; `kwiva doctor` (v1.x) |
| `vp migrate` | `kwiva new --from-vite` (v1.x onboarding path) |
| `vp staged`/`vp hooks` | git hook integration (v1.x) |

## What Was Adopted (as ideas)

- **One CLI for the whole lifecycle** with check/dev/test/build/pack verbs (ADR-0011 CLI-first).
- **Check = format + lint + types in one command** — mirrored exactly.
- **Oxlint/Oxfmt as first-class** — Kwiva goes further and integrates the full oxc stack directly (transformer, resolver, minifier, isolated declarations, codemods).
- **Task caching semantics** — informs `kwiva` incremental behavior.

## Why Reference, Not Engine (ADR-0021)

- Beta-phase tool with a moving surface — pinning the app pipeline to it couples Kwiva's roadmap to Vite+'s release cadence.
- The server needs native-TS execution (Bun), which Vite+'s browser-first dev server doesn't serve.
- All the machinery Kwiva needs (rolldown, oxlint, oxfmt) is available directly from oxc — the wrapper adds an opaque layer without adding capability.

## Risks Noted (for the reference relationship)

- `vp setup.exe` unsigned (Windows SmartScreen friction) — informs Kwiva's installer plans.
- Oxlint/Oxfmt are newer than ESLint/Prettier — teams with complex ESLint setups need migration recipes (documented in `engineering/05-migration.md`).
- VoidZero → Cloudflare consolidation — watch for Workers coupling that Kwiva's Nitro presets already cover.
