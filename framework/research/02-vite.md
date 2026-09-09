# Research — Vite (v8 / Rolldown)

**Relevance**: **Reference only** — the dev-server/bundler DX lineage that informed Kwiva's toolchain design. Not a dependency: the pipeline is oxc/rolldown native (ADR-0021).

## What's New in Vite 8

- Powered by **Rolldown** (Rust-based bundler) as the default, replacing Rollup for the bundling engine.
- Faster cold starts, smaller installs, better watch performance.
- Continued alignment with the VoidZero roadmap; VoidZero joined Cloudflare in 2025.
- Vite+ (see `03-viteplus.md`) wraps Vite 8 as its dev/build brain.

## What Kwiva Takes From Vite (reference, not dependency)

| Vite idea | Kwiva equivalent (oxc-native) |
|---|---|
| Dev server + native ESM module graph | Bun.serve + oxc resolver/transformer (TS on the fly, no bundling in dev) |
| HMR protocol + error overlay ergonomics | framework-aware HMR channels (v1.x typed-error overlay) |
| `build.rollupOptions` surface | `kwiva.config.ts > build` (full inline rolldown options) |
| Environments API / CSS handling | rolldown css plugin + Tailwind v4 engine |
| Vite ecosystem plugins convention | rolldown's Rollup-compatible plugin API |

## Why Not Vite as Engine

- The server side needs **no bundling in dev** (Bun executes TS natively) — a Vite dev server would be a redundant layer.
- The client build only needs transform + resolve + bundle + minify — all oxc components at Rust speed.
- Owning the pipeline end-to-end keeps the CLI fast, coherent, and free of double toolchain upgrades (ADR-0021 rationale).

## Implications

- Vite's plugin ecosystem (plugins-vite) is accessible via rolldown's Rollup-compatible plugin API where needed — escape hatch, not default.
- Dev/prod parity is preserved by construction (same composed handler; only the carrier differs).
- Keep the Kwiva surface small: bundler internals are never app-facing.
