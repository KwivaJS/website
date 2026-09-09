# Research — Nitro (v3)

**Source**: https://nitro.build (docs, config), live research 2026-09-08
**Relevance**: Kwiva's hidden **engine** — server carrier, presets, storage, cache, tasks, WebSockets (ADR-0002, ADR-0016). App code never imports it.

## What Nitro Is

Nitro is a server toolkit and **portable runtime** from the unjs ecosystem. It compiles a project's server code into a deployable artifact for any major hosting provider, from the same source. It powers Nuxt's server, TanStack Start's server, and many others.

Key positioning for Kwiva: **Nitro is the foundational runtime/deployment layer — not a "deployment adapter."** All server capabilities ride on Nitro; deployment is a build-time preset switch.

## Server Entry Model (the crux)

Nitro separates the **runtime server** (adapters) from the app. The modern model uses a `server.ts` server entry:

- Default entry points at `nitro/h3` and composes a handler from scanned filesystem routes.
- Override with `serverEntry` to provide a custom entry:

```ts
// .kwiva/server.ts (generated) — Kwiva composes everything here
import { app } from '../src/bootstrap/app'
import { compose } from '@kwiva/http'
export default compose(app)     // web-standard handler Nitro can use
```

- Related: `renderer` config points at a render handler (default export = event handler) used for `<!--ssr-outlet-->` injection. `renderer: { handler: '~/renderer' }`.

This is exactly where the owned HTTP pipeline and the SSR renderer mount: **the server entry is where Kwiva composes everything**.

## Lifecycle

Documented request flow:
1. Request hook (plugins, `runtimeHooks`)
2. Route rules (SWR/ISR/cache/redirect/headers/cors/proxy/prerender) — applied before routing
3. Static assets (if `serveStatic`)
4. Middleware (`middleware/` scan)
5. Server routes / API (`routes/`,`api/` scan)
6. Server entry (custom `server.ts`) — the composed handler
7. Renderer (HTML template with `<!--ssr-outlet-->`)

`features.runtimeHooks` enables request/response lifetime hooks (auto-enabled if any plugin exists).

## Config Surface (captured)

### General
- `preset` (build target; default `node_server`; `NITRO_PRESET` env); auto-detection in known CI providers (amplify, azure, cloudflare, firebase, netlify, stormkit, vercel, zeabur).
- `compatibilityDate` (`YYYY-MM-DD`, opt-in preset features).
- `runtimeConfig` (`{ app: {}, nitro: {} }` reserved; `NITRO_*` env overrides) — how Kwiva's config folder snapshots into runtime.

### Features
- `features.websocket: true` → CrossWS support everywhere (Node/Bun/Deno/Vercel/CF).
- `experimental`: `openAPI`, `typescriptBundlerResolution`, `asyncContext` (`useRequest()`), `envExpansion`, `database` (SQLite/db0), `tasks`, `tracingLogger`.
- `openAPI` top-level: `_/scalar`, `_/swagger`, `_/openapi.json`; disabled in prod by default.

### Storage & Cache
- `storage`, `devStorage`: unstorage drivers (fs, memory, redis, cloudflare-kv, etc.). `useStorage()` at runtime — behind Kwiva's `cache`/`storage` APIs.
- Route rules `cache`/`swr` wrap handlers automatically with `defineCachedHandler`.
- `future.nativeSWR` for Vercel/Netlify native SWR.

### Database
- `experimental.database: true` + connectors (sqlite, etc.) — Kwiva uses its own model layer (Drizzle engine) instead; native fallback documented.

### Tasks & Scheduling
- `tasks`: `{ name: { description, handler } }`; `defineTask`. Files scanned from `server/tasks/` — behind Kwiva's `defineTask` + schedule config.
- `scheduledTasks`: cron → task name(s).

### Plugins & Modules
- `plugins` (execute order) + auto-scan; `modules` (setup hook surface); `virtual` modules; `handlers`/`routes`/`devHandlers` programmatic registration.

### Routing
- `baseURL`, `apiBaseURL` (`/api` default).
- `routeRules`: `swr`, `static`, `cache`, `headers`, `redirect` (307 default/301), `proxy`, `cors`, `prerender` — surfaced 1:1 via `defineServerRoute`.
- `prerender`: routes/`crawlLinks`/`autoSubfolderIndex`/`concurrency`/`interval`/`retry`.
- `errorHandler` via `defineErrorHandler` (Kwiva maps its taxonomy instead).

### Directories & Build
- `serverDir`, `scanDirs`, `apiDir`, `routesDir`, `buildDir`, `output`.
- `builder`: `"rollup" | "rolldown" | "vite"` — Kwiva selects **rolldown** (oxc alignment, ADR-0021); `oxc` minify/transform options apply to rolldown builds directly.
- `unenv`, `node: false` for non-node targets; `noExternals`, `traceDeps`.

### Dev
- `devServer` (`port`, `hostname`, `watch`); dev uses isolated `nitro-dev` preset matching prod behavior.
- Kwiva dev uses its own Bun.serve pipeline in dev (same composed handler) — Nitro dev server is the build-preview path.

### Advanced
- `tracingChannel` (`srvx`/`h3` channels — OTel integration point); `framework: { name: 'kwiva', version }`; `manifest.deploymentId`.
- Preset-specific: `awsLambda.streaming`, `azure.config`, `firebase.region`, `netlify.config`, `vercel.config`, `cloudflare.wrangler`, `zephyr`.

## Route Rules (Kwiva-relevant patterns)

```js
routeRules: {
  '/blog/**': { swr: true },
  '/feed/**': { swr: 600 },
  '/docs/**': { static: true },
  '/api/v1/**': { cors: true, headers: { 'access-control-allow-methods': 'GET' } },
  '/old-page': { redirect: '/new-page' },          // 307
  '/old-page2': { redirect: { to: '/new-page2', statusCode: 301 } },
  '/proxy/example': { proxy: 'https://example.com' },
}
```

## WebSockets (CrossWS)

- `features.websocket: true`; `defineWebSocketHandler` in route files.
- Hooks: `upgrade` (auth/context), `open`, `message`, `close`, `error`.
- `peer` API: `send`, `subscribe(topic)`, `publish`, props (id, context, topics).
- Namespaces: default = URL pathname → natural per-route isolation.
- Works across Node, Bun, Deno, Vercel, Cloudflare Workers (Durable Objects for stateful CF) — Kwiva's channel API sits on this.
- SSE: `createEventStream(event)` + `stream.push()` + `onClosed`.

## Implications & Gaps Kwiva Fills

1. **Server entry is our surface**: `compose(app)` — the owned pipeline plugs in at the exact boundary Nitro provides (web-standard `Request → Response`).
2. **Route rules are our ISR/caching primitive** — exposed via `defineServerRoute` with per-route inline overrides.
3. **Developer ergonomics**: Nitro is low-level (unjs-style). Kwiva's job is the DX layer: config folder, generators, commands, conventions.
4. **`asyncContext`** enables `useRequest()` anywhere in server code — Kwiva uses it for tenancy/request context propagation.
5. **`experimental.*` maturity**: tasks/database flagged experimental — kept behind config so upgrades are safe.
6. **rolldown builder**: aligned with the oxc toolchain decision — one bundler story for client + server + packages.
