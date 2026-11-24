# Your First Deployment (/docs/getting-started/first-deployment)



Deployment in Kwiva is build-time only: one production build produces deployable output for your target runtime, and the same codebase deploys to a Node server, a serverless platform, an edge runtime, a static host — or as a single binary. No application code changes between targets; the differences live in the deploy preset.

## Build for Production [#build-for-production]

```bash title="terminal"
kwiva build
```

`kwiva build` runs the full pipeline — bundling, transforming, type-checked declarations, and minification — and emits:

* **Server bundle** — the server runtime for the selected preset, written to `.output/`
* **Client bundle** — optimized JavaScript with code splitting and tree shaking
* **Static assets** — optimized, fingerprinted, and emitted alongside the server output
* **Route rules** — caching, ISR, and prerendering applied per route

Optional build flags:

| Flag              | Purpose                                                 |
| ----------------- | ------------------------------------------------------- |
| `--preset <name>` | Select the deploy preset explicitly                     |
| `--binary`        | Compile a single standalone executable                  |
| `--docs`          | Emit the OpenAPI/REST documentation alongside the build |

## How Deployment Works [#how-deployment-works]

1. `kwiva build` produces the client output (tree-shaken, minified) and the server output for one preset
2. The preset is chosen from, in order of precedence: the `deploy.preset` value in `kwiva.config.ts`, a `--preset` flag, a preselect env variable, or **CI auto-detection** for known providers
3. `kwiva deploy` runs that provider's deploy path — uploading serverless functions, publishing a worker, pushing static files, or producing a compiled binary
4. Self-hosting is equally supported: run the emitted server entry directly from `.output/`

Because presets emit a standard server entry, you can smoke-test any target locally:

```bash title="terminal"
bun .output/server/index.mjs
```

## Modes and Their Deploy Defaults [#modes-and-their-deploy-defaults]

The scaffold-time mode controls the default preset:

| Mode         | Default preset                      | What ships                         |
| ------------ | ----------------------------------- | ---------------------------------- |
| `fullstack`  | `node_server` (auto-detected in CI) | SSR + API                          |
| `api+spa`    | `node_server` + client build        | API with an SPA shell              |
| `static`     | `static`                            | Prerendered HTML; no server needed |
| `standalone` | `bun-server` + compiled binary      | Single zero-dependency file        |
| `edge`       | `cloudflare_worker`                 | Edge-safe worker                   |

## Zero-Config Auto-Detection [#zero-config-auto-detection]

Most providers are auto-detected in CI — nothing to configure:

```bash title="terminal"
kwiva build
kwiva deploy
```

Auto-detected targets include AWS Amplify, Azure Static Web Apps, Cloudflare Pages and Workers, Firebase App Hosting, Netlify, Stormkit, Vercel, and Zeabur. When auto-detection isn't possible, pick a preset explicitly:

```bash title="terminal"
# Explicit provider
kwiva deploy cloudflare
kwiva deploy vercel
kwiva deploy netlify

# Explicit preset at build time
kwiva build --preset=cloudflare_worker
kwiva build --preset=aws-lambda
```

You can also pin the preset in `kwiva.config.ts`:

```ts title="zero-config-auto-detection.ts"
export default defineConfig({
  load: './src/config',
  deploy: { preset: 'node_server' },
})
```

### Common Presets [#common-presets]

| Preset                                   | Class                                  |
| ---------------------------------------- | -------------------------------------- |
| `node_server`                            | Default production server              |
| `bun-server` / `bun`                     | Bun runtime, ideal for the binary path |
| `static`                                 | Fully prerendered static output        |
| `cloudflare_worker` / `cloudflare_pages` | Edge / worker deployment               |
| `vercel` / `vercel-edge`                 | Serverless functions or edge functions |
| `netlify` / `netlify-edge`               | Functions and edge functions           |
| `aws-lambda`                             | Lambda functions                       |
| `service-worker`                         | Offline / PWA style                    |

## Single Binary [#single-binary]

```bash title="terminal"
kwiva build --binary
# Produces a standalone executable — copy it onto any host
```

The standalone output runs the whole application as one file, which is ideal for internal tools, microservices, and background workers.

## Edge Presets [#edge-presets]

Edge targets ship the same application under a small set of edge-safe constraints:

* Loaders and handlers must be statically importable — no dynamic `node:*` imports at runtime
* No long-lived in-memory state across requests — use the framework's storage and cache APIs
* No raw sockets — use channels and WebSockets through the framework's realtime surface
* Database access goes through the model layer over an env-defined connector
* Config and env reads happen at startup, then flow through the injected typed context
* Prefer platform web APIs over runtime-exclusive ones

Provider-specific notes worth knowing:

| Provider   | Note                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| Cloudflare | Set `compatibility_date`; use `waitUntil` for post-response work and the platform's KV/R2 for stateful sockets |
| Vercel     | Streaming may require a streaming-capable function runtime; edge presets use `vercel-edge`                     |
| Netlify    | Headers and redirects are configured via the `netlify.config` surface                                          |
| AWS        | Enable response streaming explicitly on Lambda; scale horizontally rather than multi-core                      |
| Bun binary | Target the right platform triplet for your host (musl/glibc/Windows support varies)                            |

## Preview Locally [#preview-locally]

Preview the production build exactly as it will behave when deployed:

```bash title="terminal"
kwiva preview
```

For a raw smoke test of a specific preset:

```bash title="terminal"
kwiva build --preset=node_server
bun .output/server/index.mjs
```

## Environment Variables for Production [#environment-variables-for-production]

The same typed env system used in development applies to production — declare variables once in `src/config/`, provide values per environment:

```bash title="terminal"
# .env.production
DATABASE_URL=postgresql://...
APP_KEY=your-signing-key
```

Two rules to remember:

* Only `KWIVA_PUBLIC_*` variables are safe to embed in client bundles; everything else must stay server-side
* `kwiva build` sets the environment to `production` and fails fast on missing required variables

Platform secret stores (the provider's built-in env config) feed runtime env into the config modules at deploy time — no `.env` files end up in your images.

## Rollback [#rollback]

Deployment is reproducible per build. Keep recent `.output/` artifacts; provider-based deployments (Vercel, Cloudflare, Netlify) support env-based rollback to a previous build, and self-hosters can restore a kept artifact directly.

## Production Checklist [#production-checklist]

Before you ship:

1. Run `kwiva check` — format, lint, and typecheck are clean
2. Run `kwiva test` — the full suite passes (unit, integration, API, e2e)
3. Run `kwiva db:migrate` — the database is up to date
4. Set all required environment variables and verify with boot-time validation
5. Build and smoke-test with `kwiva preview`
6. Deploy with `kwiva deploy <provider>` or your CI auto-detection

> \[!WARNING]
> Run `kwiva check` and `kwiva test` before any production build. The lint gates also enforce the project conventions (lowercase files, `@kwiva/*`-only imports), so a clean `kwiva check` is your guarantee that the codebase is deploy-conformant.

## What to Read Next [#what-to-read-next]

* [Deployment Overview](/docs/deployment) — the complete deployment guide
* [Runtime Adapters](/docs/deployment/adapters) — every supported runtime
* [Production Checklist](/docs/deployment/production-checklist) — pre-deployment verification
* [Serverless](/docs/deployment/serverless) — serverless functions and providers
* [Containers](/docs/deployment/containers) — containerized deployment
