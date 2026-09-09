# Serverless Deployment (/docs/deployment/serverless)



## Overview [#overview]

Serverless adapters reinterpret the built application as **function output**: instead of a long-lived server process, each request is handled by an ephemeral, elastically-scaled function. The same models, controllers, middleware, and pages you wrote for a Node runtime deploy to a serverless host unchanged.

Kwiva's serverless story is deliberately platform-agnostic. One build pipeline produces `.output/` and the adapter shapes it for the target function runtime — with the serverless constraints baked into the docs so you know exactly what to design for.

The platform-agnosticism has a second payoff: the same artifact builds for edge runtimes (worker-style output that runs close to the user) and for classic region-based functions. Your code does not know or care which one it became — the differences live in the adapter and the constraint set.

## Build for Serverless [#build-for-serverless]

```bash title="terminal"
kwiva build --preset aws-lambda
kwiva build --preset aws-lambda-sst
```

The output is still `.output/` with `server/` and `public/`; the adapter packages the server entry as a function. Response streaming is available but must be enabled explicitly on the function runtime — check the adapter's configuration, because streaming is not automatic everywhere. On Lambda-family targets that means opting into the streaming response mode explicitly; if you need it, set it before you rely on streaming anywhere in the app.

### Selection [#selection]

Most serverless platforms are auto-detected when your continuous-integration runner deploys. When one is not, or you want to pin a target, choose explicitly:

```bash title="terminal"
kwiva build                      # auto-detected in CI
KWIVA_PRESET=aws-lambda kwiva build   # forced in the build environment
```

Or set `deploy.preset` in `kwiva.config.ts` as the committed default:

```ts title="selection.ts"
export default defineConfig({
  deploy: {
    preset: 'aws-lambda',
  },
})
```

`kwiva preview` runs any built preset locally, so you can validate the exact serverless artifact before pushing.

> \[!TIP]
> Pin the preset explicitly when you deploy from your own machines or a generic runner. Auto-detection is a convenience for platforms that publish their own build pipeline signals; a committed `deploy.preset` is reproducible everywhere.

## The Deploy Command Flow [#the-deploy-command-flow]

```bash title="terminal"
kwiva deploy [provider]
```

`kwiva deploy` is a thin wrapper around the provider's deploy path:

1. It runs the built artifact through the provider's own deploy tooling (functions upload, plain artifact sync, or platform API calls).
2. It honors provider-specific credentials supplied as environment tokens to the deploy CLI.
3. It prints the **artifact digest** and the deploy command it executed, so builds are traceable.

Self-hosting is always an option: keep the build, upload the artifact yourself, and run it however your serverless host expects.

### Rollback [#rollback]

Keep N previous builds. Managed serverless platforms handle env-based rollback for you; self-hosters keep a tar of `.output/`. Rolling back is therefore a pointer swap, not a code change. Because each deploy is a discrete artifact rather than an in-place mutation, reverting to the previous behavior is always one repoint away.

## Stateless Constraints [#stateless-constraints]

Serverless functions are ephemeral and elastic. Design for these rules:

* **No long-lived in-memory state across requests.** Use the `cache` and `storage` APIs instead of process-level singletons.
* **Database access goes through the model layer** over an env-defined connector — never raw sockets or connection pooling hacks in app code.
* **Read `process.env` only at startup.** Inject via typed env and config so functions stay pure between invocations.
* **Avoid exclusive runtime-only APIs** — prefer platform Web APIs.
* **Multi-core is not automatic** — serverless scales out by number of instances, not cores.
* **Loaders and handlers must be statically importable** — no dynamic imports at runtime.

The app kernel is **stateless by construction**: sessions, cache, queue, and storage are externalized by default. That is what makes elastic scaling safe. An instance is never assumed to survive a single request, so the fleet can grow and shrink with traffic without any correctness loss.

## Cold Starts and Externalized State [#cold-starts-and-externalized-state]

Functions may go idle and start cold on the next request. Mitigate in three ways:

1. **Keep the function lean** — heavy initialization (like telemetry or queue transport setup) belongs in providers that run once at boot, not per request. If boot time is dominated by per-request work, move that work into the model and cache layers.
2. **Externalize session state** — the session store is pluggable (cookie, shared broker, or database backends). When a request lands on any instance, the session must resolve from a shared store, not instance memory.
3. **Externalize everything shared** — cache hits and queued jobs come from shared cache and queue infrastructure, and uploaded files live in object storage, so any instance can serve any request.

Cold starts are a platform property, not a framework property — Kwiva cannot eliminate them, but it removes every reason a cold function would behave incorrectly. A fresh instance boots, reads typed configuration, resolves a session from the shared store, and serves the request identically to a warm one.

## Streaming and Connections [#streaming-and-connections]

Serverless adapters support response streaming where the runtime permits it. Long-lived connections are a different story:

* **WebSockets** on serverless use the channels API, backed by durable storage for stateful connections.
* **SSE** is available as a fallback when WebSockets are unavailable on the host.
* Route rules that control caching semantics (swr, static, passthrough) behave per provider — check how your platform handles cache headers and invalidation.

Streaming-first SSR works on function targets as long as the platform supports streaming responses; the SSR shell streams under 50 ms on the example application, while deferred loaders resolve in the background. Verdict first, bytes later — but only on runtimes that honor the streaming contract.

## Edge Variants [#edge-variants]

Several serverless adapters target **edge runtimes**: worker-style output that runs close to the user. The edge-safe constraint set applies in full — and the payoff is route rules like per-page static and passthrough caching that behave close to CDN semantics. WebSockets on the edge use the channels pattern over durable storage.

| Function vs edge | Functions                     | Edge workers                        |
| ---------------- | ----------------------------- | ----------------------------------- |
| Runtime location | Regional datacenters          | Points of presence, close to users  |
| Connection model | Request-scoped                | Request-scoped                      |
| Caching payoff   | Route rules honored           | Route rules behave near-CDN         |
| WebSockets       | Channels over durable storage | Channels over durable storage       |
| State allowed    | Externalized only             | Externalized only, no local storage |

Whether you deploy functions or edge workers, the constraint discipline is identical and the app code is unchanged — the adapter is the only difference.

## What's Next [#whats-next]

* [Runtime Adapters](/docs/deployment/adapters) — the full adapter matrix and selection flow
* [Node/Bun Deployment](/docs/deployment/node-bun) — the always-available alternative
* [Container Deployment](/docs/deployment/containers) — image-based hosting with the same artifact
* [Production Checklist](/docs/deployment/production-checklist) — stateless and externalized-state checks
* [Background Work](/docs/background-work) — where queue workers and tasks run
