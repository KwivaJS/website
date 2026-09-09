# Performance (/docs/advanced/performance)



Performance in Kwiva is designed in, not bolted on. Four engineering decisions carry most of the weight: static machinery built on a Rust-speed toolchain, a native TypeScript runtime, streaming-first server rendering, and caching at three layers. On top of that, all type inference is done at the type level with zero runtime code generation, which keeps both compile-time and runtime costs low.

## The Performance Story [#the-performance-story]

| Pillar                      | What it does for you                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------ |
| Rust-speed static machinery | Sub-second checks, fast cold builds, incremental builds in about two seconds         |
| Native TypeScript runtime   | No compile step in development; native execution, fast startup, single-binary output |
| Streaming-first SSR         | The page shell streams in under 50 ms while slow queries resolve in the background   |
| Layered caching             | Route rules at the edge, model cache in the server, client cache in the browser      |
| Type-level inference        | End-to-end types with zero runtime codegen                                           |

These pillars are chosen to reinforce each other rather than each taking a turn at the top of the profile. Native execution removes the dev-time compile tax, the toolchain removes the build-time tax, streaming removes the block-on-slowest-loader tax, and caching removes the repeat-request tax. The result is a system where no single stage is the habitual bottleneck.

## Rust-Speed Static Machinery [#rust-speed-static-machinery]

The `kwiva` CLI is built directly on a Rust-speed toolchain — the components are native and bound into the CLI, not emulated. The bundler pipeline produces client and server production builds with code splitting and tree shaking; the TS/JSX transformer lower targets and powers upgrade codemods; the resolver serves the development module graph; the minifier shrinks production output; and the built-in linter and formatter gate every conventional rule your code must satisfy.

The CI-gated budgets on the example application:

| Command                         | Budget                     |
| ------------------------------- | -------------------------- |
| `kwiva check` (lint and format) | Under 1 second             |
| `kwiva build` cold              | Under 10 seconds           |
| `kwiva build` incremental       | Under 2 seconds            |
| Dev server boot                 | Under 500 ms to first byte |

Because the machinery is native and statically linked into the CLI, the numbers come from the compiler, not from warm caches and optimism. `kwiva check` (lint and format) runs under a second, so the convention gates can be a part of every local save, not a pre-merge ritual.

## Native TypeScript Runtime [#native-typescript-runtime]

Kwiva's primary runtime executes TypeScript directly — no separate compile step in development. The dev server serves native modules on the fly, transforming TS and JSX only as needed and caching the result. The practical effects:

* **Instant startup** — the dev server is ready in well under a second
* **Hot module replacement** — page changes hot-swap components, controller and model changes reload routes without dropping session state, and config changes prompt a full reload
* **Single-binary output** — `kwiva build --binary` produces a standalone artifact from the same codebase when you need it

Server code is not bundled in development at all; it executes through the same pipeline that a production server runs, which means dev behavior matches prod behavior. Because there is no development-only module graph for server code, there is no class of "works in dev, breaks in the bundle" bugs to chase.

## Streaming-First SSR [#streaming-first-ssr]

Page rendering is streaming-first. Loaders run in parallel, and a loader can defer a slow promise with the stream primitive so the HTML shell streams immediately while the deferred data arrives later. The tree hydrates in place, and route-level rules let you move any page to static, ISR, or SWR output.

The result on the example application is an SSR shell that begins streaming in under 50 ms, with the slowest parts — typically comments or secondary lists — arriving as streaming chunks rather than blocking the first paint.

Streaming matters more than the shell numbers suggest: it moves the performance conversation from "how fast is the whole page" to "how fast is the first useful paint." Loaders race in parallel, deferred promises surrender their placeholder, and the shell — not the slowest query — sets the perceived latency.

## Layered Caching [#layered-caching]

Caching is layered by design, with each layer answering a different question:

| Layer        | Controlled by                                                                                        | Answers                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Route rules  | Route rules on paths — `cache`, `swr`, `isr`, `static`, `prerender`                                  | Is this page actually cached at the edge or in the server? |
| Model cache  | The cache API — `cache.get`, `cache.set`, `cache.wrap`, `cache.invalidate`, TTL and tag invalidation | Can we skip the database query?                            |
| Client cache | Data hooks — `staleTime`, `gcTime`, `refetchOnWindowFocus`, optimistic updates                       | Do we even need to refetch in the browser?                 |

Tags make invalidation surgical: `invalidateTags(['posts'])` evicts exactly the entries labeled for that tag, across the edges that honor it. The cache backends are configured entirely through `src/config/cache.ts`, and the same pluggable session store uses the storage mounts underneath.

The three layers compose naturally. An ISR page might serve from the route-rule layer for visitors, hit the model cache for the warm data, and no-op the client cache because hydration already received the loader data. Each layer is a check that can be skipped — the winner is whichever cache answers first.

## The Response Budget [#the-response-budget]

The pipeline is budgeted at every stage, and the budgets are trace spans you can read in production:

| Stage                         | Budget (p50, example application) |
| ----------------------------- | --------------------------------- |
| Adapter to pipeline entry     | Under 1 ms                        |
| Session and tenant resolution | Under 2 ms on a store hit         |
| Validation (compiled schema)  | Under 0.5 ms                      |
| Handler (model list, 20 rows) | Under 5 ms                        |
| Full API round-trip (local)   | Under 15 ms                       |
| SSR shell (stream start)      | Under 50 ms                       |

Every stage is a span in the request trace, so a response that misses its budget points at its own span: adapter, session, validation, handler, or rendering. In development the overlay renders the per-request waterfall; in production the same spans flow through the observability layer.

## Type-Level Inference with Zero Runtime Codegen [#type-level-inference-with-zero-runtime-codegen]

Shipping end-to-end types usually means running a code generator and remembering to run it again. Kwiva does the opposite: types flow through the stack at the type level, from `defineModel` through `defineController` to `@kwiva/client`, page loaders, and data hooks — no codegen for types, no manual annotations, no generated declaration files to keep fresh.

The model IR and route manifest written into `src/.kwiva/` are compiled once and reused by the client, OpenAPI, and MCP, so the type graph and the runtime artifacts agree without a second generation pass. Because types are an inference product rather than a generated file, they can never be stale — you cannot forget to run a step that does not exist.

## A Production Performance Checklist [#a-production-performance-checklist]

Before you ship, walk this list:

1. **Choose the right preset** — output for your target host (node, Bun, edge, static) via the engine presets; the application code does not change.
2. **Set route rules deliberately** — decide which pages are static, ISR, or SWR; public pages that skip auth entirely should be cached early in the pipeline.
3. **Use the query builder deliberately** — select only the columns you need, rely on indexes declared on the model, and enable `withCount` and relation loading rather than N+1 loops.
4. **Leverage the client cache** — set sane `staleTime` values and use optimistic updates for mutations so most interactions never hit the network.
5. **Watch the metrics** — keep an eye on request latency, model query duration, and cache hit rate via the observability layer.
6. **Confirm the budgets** — `kwiva check` under a second, cold builds under ten, streaming shells under 50 ms.

The checklist is ordered by leverage: the preset decides the whole serving model, route rules decide how much of the fleet's traffic never reaches the server, and the query builder decides how much work each warmed-up request does. Metrics then tell you which assumption broke first.

## What's Next [#whats-next]

* [Streaming SSR](/docs/rendering/streaming) — Suspense-aware streaming and deferred loaders
* [Caching Strategies](/docs/rendering/caching) — Route rules: static, ISR, SWR, prerender
* [HTTP Caching](/docs/http/caching) — Route rules and response cache tags on the API side
* [Metrics](/docs/observability/metrics) — Request, query, queue, and cache metrics for production
* [Production Checklist](/docs/deployment/production-checklist) — Hardening and tuning before you deploy
