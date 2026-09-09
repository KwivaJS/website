# Runtime Adapters (/docs/deployment/adapters)



## What Is a Runtime Adapter? [#what-is-a-runtime-adapter]

A **runtime adapter** — also called a **deploy preset** — is a build-time transformation that packages the composed server into the shape a target runtime expects. Adapting is the last step of `kwiva build` and involves no application code.

Everything resolves through one pipeline:

```text title="what-is-a-runtime-adapter.txt"
defineApp kernel
   ├─ composed web-standard handler
   ├─ server build (framework-owned engine)
   └─ preset output (.output/)  → node · bun · serverless · edge · static · binary
```

The application never changes between targets. Adapters are a property of the build, not of the code: `src/bootstrap/app.ts` composes the kernel once, and the selected adapter only decides how that kernel gets boxed, shipped, and started on a host. The same controllers, models, middleware, and pages build for a shared Node server, a serverless function platform, an edge worker, a container image, and a single binary without a single `defineX` file changing.

## How Adapters Work [#how-adapters-work]

`kwiva build` runs the client build and the server build, then emits `.output/` with `server/` and `public/`. The adapter decides how that output is presented to the runtime. For hosted and PaaS targets the adapter is most often selected by **auto-detection in CI** — build once and your continuous-integration runner picks the right adapter. The preset is otherwise selected in one of four ways:

| Mechanism       | Where                           | Notes                                           |
| --------------- | ------------------------------- | ----------------------------------------------- |
| `--preset` flag | `kwiva build --preset <preset>` | Explicit, per-build                             |
| preset env var  | Build environment               | Force a preset in CI                            |
| `deploy.preset` | `kwiva.config.ts`               | Committed default                               |
| Auto-detection  | CI                              | Recognized platforms are selected automatically |

Explicit selection always wins over auto-detection, so a pinned `deploy.preset` in your committed config is the safest way to make a non-automatable or self-hosted target reproducible across machines.

## The Adapter Matrix [#the-adapter-matrix]

| Category             | Preset identifiers                                                                                                  | Use when                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Node runtime         | `node_server`                                                                                                       | The default production preset; any host that can run Node           |
| Node multi-core      | `node`, `node_cluster`                                                                                              | One process with cluster support across cores                       |
| Bun runtime          | `bun-server`, `bun`                                                                                                 | The primary runtime; the path to single-binary output               |
| Deno runtime         | `deno-server`, `deno`                                                                                               | A Deno-based host                                                   |
| Serverless functions | `aws-lambda`, `aws-lambda-sst`                                                                                      | Function-based serverless platforms; enable streaming explicitly    |
| Edge                 | `cloudflare-module`, `vercel-edge`, `netlify-edge`, `fastly-edge`                                                   | Edge runtimes; the edge-safe constraint set applies                 |
| Static               | `static`                                                                                                            | Prerender everything; no server needed                              |
| Single binary        | `standalone`                                                                                                        | `kwiva build --binary` — one executable, zero external dependencies |
| Hosted / PaaS        | `cleavr`, `digitalocean`, `render-com`, `railway`, `heroku` via the Node preset, `zephyr`, `iis`, `azure-functions` | Managed hosts; the `PORT` env var is respected                      |

Recognized serverless and edge platforms, host their own build integrations, and are **auto-detected in CI** — including AWS Amplify, Azure Static Web Apps, Cloudflare Pages and Workers, Firebase App Hosting, Netlify, Stormkit, Vercel, and Zeabur. When a provider is auto-detected, nothing needs to be configured: the build output is shaped for that platform automatically.

## Adapters per Scaffold Mode [#adapters-per-scaffold-mode]

The mode chosen at scaffold time picks a sensible default:

| Mode                  | Default adapter                                   | What changes                                        |
| --------------------- | ------------------------------------------------- | --------------------------------------------------- |
| `fullstack` (default) | Node runtime (`node_server`, auto-detected in CI) | SSR + API                                           |
| `api+spa`             | Node runtime + client build only                  | No SSR renderer; SPA served                         |
| `static`              | `static`                                          | Prerender; no server needed                         |
| `standalone`          | `bun-server` + compile                            | Single-file, zero-dependency artifact               |
| `edge`                | Edge worker adapter                               | Edge-safe constraint set is enforced and documented |

## Choosing an Adapter [#choosing-an-adapter]

The adapter decision flow:

```text title="choosing-an-adapter.txt"
Is SSR/edge required?
 ├─ no → static mode
 ├─ yes → is the platform auto-detected in CI?
 │    ├─ no → set the preset env var or kwiva.config.ts > deploy.preset
 │    └─ yes → nothing to do
 └─ special cases?
      - passthrough caching    → route rule swr
      - per-page static        → route rule static
      - websockets on edge     → durable storage + channels pattern
      - single binary internal → standalone (kwiva build --binary)
```

Special cases bend the adapter choice but never the application code:

* **Passthrough caching** — a `swr` route rule on the paths you want cached, so the host serves warm copies with stale-while-revalidate semantics.
* **Per-page static** — a `static` route rule turns selected pages into prerendered output while the rest of the app stays dynamic.
* **WebSockets on edge** — edge workers hold no connection state, so the channels pattern over durable storage carries stateful connections.
* **A single binary for internal tooling** — `standalone` mode compiles the entire fullstack app into one executable for lean self-hosting.

## Zero-Code-Change Swapping [#zero-code-change-swapping]

Because the application is written against Web Standards and imports only `@kwiva/*`, swapping adapters is a rebuild, not a refactor:

```bash title="terminal"
kwiva build --preset node_server
kwiva preview               # run it locally

kwiva build --preset static # or go fully static
kwiva preview
```

Validate locally with `kwiva preview`, or smoke-test a specific preset by building and running the generated entry directly:

```bash title="terminal"
kwiva build --preset node_server
node .output/server/index.mjs
```

The request pipeline is identical on every adapter — only the carrier differs. This is the same guarantee that makes `kwiva dev` and production behave alike: `kwiva dev` runs the same composed handler in-process, and production builds target the adapter; the pipeline between dev and prod is unchanged.

## Edge-Safe Constraint Set [#edge-safe-constraint-set]

Edge presets smooth most runtime differences for you, but Kwiva documents a small writeable surface to keep in mind when targeting an edge adapter:

* Loaders and handlers must be statically importable — no runtime dynamic imports of platform internals.
* No long-lived in-memory state across requests — use the `cache` and `storage` APIs.
* No raw sockets — use the channels and WebSocket APIs.
* Database access goes through the model layer over an env-defined connector.
* Avoid reading `process.env` beyond startup — inject via typed env and config.
* Do not use exclusive runtime-only APIs — prefer platform Web APIs.

## Provider-Specific Gotchas [#provider-specific-gotchas]

A few behaviors differ per platform and are worth knowing before you commit to one:

| Platform           | Gotcha                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Cloudflare Workers | Set a compatibility date; stateful WebSockets use durable storage plus the channels pattern                  |
| Vercel             | Streaming requires a streaming function runtime; edge presets use the edge function output                   |
| Netlify            | Headers and redirects go through the platform's function config; edge functions are distinct from serverless |
| AWS Lambda         | Response streaming must be enabled explicitly; multi-core is not automatic — scale out by instance count     |
| Bun binary         | Requires an AVX2-capable CPU; use syntax-only minification so function names survive for tracing             |

## Testing Deploys Locally [#testing-deploys-locally]

Two workflows cover local validation:

* `kwiva preview` — runs the built preset locally, exactly as a host would. The fastest feedback loop before pushing.
* `kwiva build --preset <preset>` then `node .output/server/index.mjs` — a raw smoke test of a specific preset's generated entry.

The build also produces a deployment manifest with a printable artifact digest, so `kwiva deploy` can report the exact artifact and command it pushed. Rolling back is a pointer swap: keep N builds, and managed hosts roll back by environment while self-hosters keep a tar of `.output/`.

## What's Next [#whats-next]

* [Node/Bun Deployment](/docs/deployment/node-bun) — run the Node, Bun, and binary presets
* [Serverless Deployment](/docs/deployment/serverless) — function-based targets and constraints
* [Container Deployment](/docs/deployment/containers) — image-based hosting at scale
* [Production Checklist](/docs/deployment/production-checklist) — pre-deploy and operational checks
* [First Deployment](/docs/getting-started/first-deployment) — see the loop on a fresh project
