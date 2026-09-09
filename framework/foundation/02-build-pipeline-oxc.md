# Foundation 02 — Build Pipeline: oxc Toolchain

**Status**: Locked (ADR-0021, supersedes ADR-0008) · **Updated**: 2026-09-08 · **Docset**: v0.3

The `kwiva` CLI pipeline is built on **deep oxc.rs integration** (https://oxc.rs). Vite+ is a **reference** — its CLI shape (`create/install/dev/check/test/build/pack`) and dev-server DX guided the design; the framework does not depend on `viteplus` or `vite` for its pipeline.

## The oxc stack (as integrated)

| oxc component | What Kwiva uses it for | Surface |
|---|---|---|
| **rolldown** (Rollup-compatible Rust bundler) | client + server production builds; package `dist/` builds in the monorepo | `kwiva build`, `build.ts` |
| **oxc transformer** | TS/JSX transform, target lowering; **codemods** for `kwiva upgrade` | dev server, upgrade recipes |
| **oxc resolver** | module resolution for dev module graph | dev server |
| **oxc minifier** | production minification | `kwiva build` |
| **oxlint** | lint engine + Kwiva convention gates | `kwiva check` |
| **oxfmt** | formatter | `kwiva check --fix` |
| **isolated declarations** | fast `.d.ts` emission for package builds | `build.ts` |

Bindings: napi-rs packages (oxc-transform, oxc-resolver, isolated-declarations, oxlint API) + rolldown's JS API — called from the Bun-based CLI.

## Pipeline per command

### `kwiva dev`

```
Bun.serve (dev server, port 3000)
 ├─ static: public/ + ui/assets passthrough
 ├─ modules: resolve via oxc-resolver → serve native ESM
 │   (TS/JSX transformed on the fly by oxc-transformer, cached)
 ├─ HMR: framework-aware channels
 │   ├─ ui change  → component/page hot-swap (react refresh protocol)
 │   ├─ controller/model change → route reload without losing session state
 │   └─ config change → full reload prompt
 ├─ SSR: render through the same pipeline (no separate bundle in dev)
 └─ API: app server (defineApp) in-process
```

Why not Vite's dev server: Kwiva's dev server must be runtime-native (Bun executes TS directly — no bundling required for server code), and the client module graph only needs transform + resolve, which oxc provides at Rust speed. Vite+ remains the reference for DX polish (error overlays, overlays for typed errors — v1.x).

### `kwiva build`

```
1. collect: app scan (models, controllers, pages, config, routes)
2. IR: model IR + route manifest → src/.kwiva/ (typed artifacts)
3. client: rolldown build (pages → route chunks, code splitting per route,
   shared vendor chunking, oxc minifier, sourcemaps)
4. server: rolldown build → server bundle → Nitro build (preset output .output/)
5. prerender: crawl or explicit list (route rules static/isr)
6. binary (optional): bun build --compile over the server entry
```

### `kwiva check`

```
1. oxfmt        — format check (+ --fix)
2. oxlint       — lint incl. Kwiva gates:
    no-engine-imports, no-raw-fetch-in-loaders, no-secrets-in-client,
    defineX-file-conventions (one factory per file type), lowercase-paths
3. typecheck    — tsc --noEmit (or tsgo when stable)
```

### `kwiva test`

- `bun test` with `@kwiva/testing` harness (see `engineering/02`).
- `--e2e`: Playwright against `kwiva dev` or a built preview.

### `kwiva upgrade`

- oxc-transformer **codemod recipes** per release (renames, API shifts), then `kwiva check` verifies.

## Build config surface

Full inline rolldown options live in `kwiva.config.ts > build` (ADR-0020 escape hatch):

```ts
export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    minify: true,               // oxc minifier
    chunks: 'per-route',        // kwiva strategy on top of rolldown manualChunks
    external: [],               // server externals (e.g. instrumented pg)
  },
})
```

## What the reference (Vite+/Vite) contributes

| Vite+ idea | Kwiva's parallel |
|---|---|
| `vp create/install/dev/check/test/build/pack` | `kwiva new/dev/check/test/build/deploy` |
| unified task runner + caching | `kwiva` commands; rolldown incremental cache |
| managed runtime/package-manager | Bun-native; `kwiva doctor` (v1.x) |
| dev overlay DX | v1.x: typed-error overlay on the dev server |
| library build via tsdown | package builds via rolldown + isolated declarations |

## Performance budget (CI-gated)

- `kwiva check` on the example app: < 1s (oxlint + oxfmt), typecheck excluded.
- `kwiva build` cold: < 10s for the example app; incremental: < 2s.
- Dev server boot: < 500ms to first byte.
