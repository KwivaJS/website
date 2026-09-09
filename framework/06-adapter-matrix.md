# 06 — Adapter Matrix

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

Kwiva inherits Nitro deployment presets wholesale. This matrix documents every target, what Nitro produces, and Kwiva-specific notes (env vars, commands). Deploying is **build-time only** — no application code changes.

## How Deployment Works

1. `kwiva build` runs the rolldown client build (oxc minifier) + Nitro server build, configured by `@kwiva/core`.
2. Nitro emits `.output/` (`server/` + `public/`) for the selected **preset**.
3. `NITRO_PRESET` env var, `--preset` flag, `kwiva.config.ts > deploy.preset`, or CI auto-detection picks the preset.
4. `kwiva deploy` is a thin wrapper that runs the provider's deploy path (`wrangler`, `vercel`, `netlify`, `serverless`, plain rsync, `bun build --compile`, …).

## Zero-Config Auto-Detected Providers (Nitro)

| Provider | Preset | Output | Notes |
|---|---|---|---|
| AWS Amplify | `aws-amplify` | server output + static | hosts server via function |
| Azure Static Web Apps | `azure-swa` | API runtime + static | `azure.config` for apiRuntime |
| Cloudflare Pages / Workers | `cloudflare_pages` / `cloudflare_worker` | worker script(s) | requires `compatibility_date` |
| Firebase App Hosting | `firebase` | gen2 functions | `firebase.region` etc. |
| Netlify | `netlify` | functions + edge functions | `netlify.config` (headers/redirects/functions) |
| Stormkit | `stormkit` | server output | — |
| Vercel | `vercel` | serverless functions | `vercel.config` (runtime nodejs20.x…) |
| Zeabur | `zeabur` | server output | — |

## Explicit Presets (common + long tail)

| Preset | Class | Notes |
|---|---|---|
| `node_server` | Node HTTP/HTTPS server | default production preset |
| `node` / `node_cluster` | Node with cluster | multi-core |
| `bun-server` / `bun` | Bun server | ideal single-binary path |
| `deno-server` / `deno` | Deno | — |
| `cloudflare-module` | Worker (module) | — |
| `vercel-edge` | Edge function | — |
| `netlify-edge`, `netlify-lambda` | Edge / lambda | — |
| `aws-lambda`, `aws-lambda-sst` | Lambda | `awsLambda.streaming` for streaming |
| `fastly-edge` | Fastly Compute | — |
| `static` | Static HTML | prerender everything |
| `service-worker` | Service worker | offline PWA style |
| `cleavr`, `digitalocean`, `render-com`, `railway`, `heroku` (via node preset), `zephyr`, `iis`, `azure-functions`, `deno-server` | PaaS/Hosted | env `PORT` respected |

Self-host any preset by running the generated entry:
```bash
node .output/server/index.mjs          # node_server artifact
bun .output/server/index.mjs           # bun-server artifact
./server                               # bun --compile binary (kwiva build --binary)
```

## Kwiva Mode Presets (choose at scaffold time)

| Mode | Nitro preset (default) | What changes |
|---|---|---|
| `fullstack` (default) | `node_server` (auto-detect in CI) | SSR + API |
| `api+spa` | `node_server` + client build only | no SSR renderer; SPA served |
| `static` | `static` | prerender; no server needed |
| `standalone` (binary) | `bun-server` + `bun build --compile` | single file, zero-dep artifact |
| `edge` | `cloudflare_worker` (recommended default) | edge-safe constraint set documented |

## Edge-Safe Constraint Set (for edge presets)

Nitro's unenv + presets smooth most Node APIs, but Kwiva documents the **small writeable surface**:

- Loaders/handlers must be static-importable (no dynamic import of `node:*` at runtime).
- No long-lived in-memory state across requests (use storage/cache APIs).
- No raw sockets/`net` (use channels/WebSockets via CrossWS).
- DB access via the model layer over env-defined connector.
- Avoid `process.env` reads beyond startup (inject via typed env/config).
- Don't use exclusive `Bun.*` APIs (use platform web APIs + unenv).

## Deployment Metadata (build manifest)

- `NITRO_PRESET` → artifacts include `nitro.json` manifest (deploymentId injectable).
- `kwiva deploy` prints artifact digest + provider deploy command.
- Rolling back: keep N builds; providers (Vercel/Cloudflare/Netlify) handle env-based rollback; self-hosters keep a tar of `.output/`.

## Env Vars That Matter

| Var | Purpose |
|---|---|
| `NITRO_PRESET` | force preset in CI |
| `NITRO_APP_BASE_URL` / `baseURL` | subpath serving |
| `PORT` | PaaS port (Railway, Render, DigitalOcean) |
| `NITRO_API_SECRET` | runtime config override pattern |
| provider vars | `CLOUDFLARE_API_TOKEN`, `VERCEL_TOKEN`, etc. (for deploy CLI) |
| `KWIVA_TENANT_MODE`, `KWIVA_DB_URL`, `KWIVA_CACHE_URL` | app-level defaults |

## Testing Deploys Locally

- `kwiva preview` → runs the built preset locally.
- `kwiva build --preset <x> && node .output/server/index.mjs` — raw smoke test per preset.

## Provider-Specific Gotchas (captured during research)

- **Cloudflare**: set `compatibilityDate`; Workers have no CPU-affine features — use `waitUntil`, KV/R2, Durable Objects for stateful WS.
- **Vercel**: streaming requires `vercel.config` streaming function runtime; edge presets need `vercel-edge`.
- **Netlify**: use `netlify.config` for headers/redirects; edge functions distinct from serverless.
- **Bun binary**: requires AVX2 CPU; `--minify-syntax` not full `--minify` to keep OTel fn names; target `bun-linux-x64-musl`/generic when deploying to distroless/scratch. Windows targets limited.
- **AWS**: enable `awsLambda.streaming` explicitly for response streaming; multi-core not automatic (scale out).
- **Route rules & ISR**: `swr`/`static` route rules behave per provider; `future.nativeSWR` only for Vercel/Netlify.

## Adapter Decision Flow

```
Is SSR/edge required?
 ├─ no → static mode
 ├─ yes → is provider auto-detected in CI?
 │    ├─ no → NITRO_PRESET=<preset> or kwiva.config.ts > deploy.preset
 │    └─ yes → nothing to do
 └─ special cases?
      - passthrough caching    → route rule swr
      - per-page static        → route rule static
      - websockets on edge     → cloudflare durable + channels pattern
      - single binary internal → standalone (bun --compile)
```
