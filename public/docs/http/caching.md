# Response Caching (/docs/http/caching)



Caching in Kwiva is layered. At the HTTP layer, route rules cache whole responses; below that, model caches reuse query results; and the explicit cache API handles keyed values. All layers share one invalidation model built on tags and model identity.

The decisions combine into a rule of thumb: the closer the cache sits to the client, the bigger the win and the more public it must be. A route rule can make a marketing page serve like a static file; the model cache removes repeated database reads; the cache API stores derived values that no query layer produces.

## The Layers [#the-layers]

```plaintext title="the-layers.txt"
route rules   whole responses: default / cache / swr / isr / static / prerender
model cache   query results per model, TTL + tags
data hooks    client cache, keyed by model and query
cache API     explicit key/value with TTL + tags
```

Each layer answers a different question. Route rules make a public page or endpoint fast; the model cache makes repeated reads cheap; the cache API stores derived values; the client cache keeps data fresh for interactive users. See [Frontend: data hooks](/docs/frontend/data-hooks) for the client layer.

## Route Rules [#route-rules]

Route rules are declared on server routes in `src/routes/rules.ts`:

```ts title="src/routes/rules.ts"
// src/routes/rules.ts
defineServerRoute('/products/**', { isr: 300, cache: { tags: ['catalog'] } })
defineServerRoute('/pricing/**',  { static: true })
defineServerRoute('/news/**',     { swr: 60 })
```

| Rule        | Behavior                                              |
| ----------- | ----------------------------------------------------- |
| `default`   | Dynamic — always fresh, no cache layer involved       |
| `cache: n`  | Serve the cached response for `n` seconds             |
| `swr: n`    | Stale-while-revalidate — serve, refresh in background |
| `isr: n`    | Regenerate the static page on an interval             |
| `static`    | Build-time output, never regenerated at runtime       |
| `prerender` | Crawled and rendered at build time                    |

`default` is the implicit behavior of any path without a rule: fully dynamic. Choosing a caching rule is therefore an explicit act — every matched path either declares its freshness contract or stays fresh by default.

Rules apply **before** context assembly — a cache hit serves the response and bypasses the pipeline, including session loading. That makes cached routes fast even under load, and it means only public, non-personalized routes belong here. The framework refuses to cache responses that set `Set-Cookie`.

> \[!WARNING]
> A route rule bypasses middleware, guards, and session loading. Only paths deliberately public — public pages, public endpoints, shared assets — should carry a caching rule. Anything that varies per user must stay `default`.

## Cache Tags on Rules [#cache-tags-on-rules]

Rules can attach tags to their cached output:

```ts title="cache-tags-on-rules.ts"
defineServerRoute('/products/**', { cache: { tags: ['catalog'] } })
```

A later `invalidateTags(['catalog'])` purges these tagged caches along with any tagged model and cache-API entries. See the invalidation table below.

## Model Cache [#model-cache]

Models declare caching per model — list and get responses are cached per query signature:

```ts title="model-cache.ts"
defineModel('products', (f) => ({ ... }), {
  cache: { ttl: 120, tags: ['catalog'], swr: true },
})
```

The cache key combines the model, the query signature, and the tenant. Model writes — create, update, delete — invalidate the model's keys automatically, so reads never go stale after a write on the same model. Tenancy folds into the key, so two tenants reading the same model never share cached rows. See [Models](/docs/data/models).

## The Cache API [#the-cache-api]

The explicit cache API handles keyed values that no other layer covers:

```ts title="the-cache-api.ts"
import { cache } from '@kwiva/core'

await cache.set('stats:overview', value, { ttl: 300, tags: ['stats'] })
const cached = await cache.get('stats:overview')
const fresh = await cache.wrap('stats:overview', async () => compute(), { ttl: 300 })

await cache.invalidateTags(['stats'])
```

* `set` stores a value with TTL and tags
* `get` reads a value
* `wrap` memoizes a computation — on a miss, runs it, stores it, returns it
* `invalidateTags` purges every tagged entry across layers

Backends are mounted in `src/config/cache.ts`: memory in development, a shared store in production, and a distributed key-value mount on the edge.

## Invalidation [#invalidation]

Invalidation is the contract that keeps layers consistent:

| Trigger                           | Effect                                          |
| --------------------------------- | ----------------------------------------------- |
| Model write (automatic)           | Purges that model's keys                        |
| `invalidateTags([...])`           | Purges tagged keys and tagged route-rule caches |
| `invalidate(Model)` on the client | Refreshes data-hook queries for the model       |
| Deploy                            | Build ID busts static assets                    |

Model writes purge without manual calls. Tags offer cross-layer coordination — one tag can connect a route-rule cache, a model cache, and explicit cache entries. Client-side invalidation refreshes the data hooks the user is actively viewing. See [Frontend: data hooks](/docs/frontend/data-hooks).

### On-demand invalidation [#on-demand-invalidation]

`invalidateTags` is the on-demand lever. It calls the route-rule purge in the same breath as the model and cache-API purges, so publishing a catalog update can refresh a server-cached product grid, a cached catalog query, and derived analytics in one call:

```ts title="on-demand-invalidation.ts"
// after a product publish or price change
await cache.invalidateTags(['catalog'])
```

This is the bridge between the layers: one tag, one call, and every layer that declared it is coherent again.

## Choosing Between Rules [#choosing-between-rules]

The rule you pick trades freshness for cost:

| Situation                                           | Rule                               |
| --------------------------------------------------- | ---------------------------------- |
| Content changes rarely, latency matters             | `static` or `prerender`            |
| Content changes on a schedule or at publish time    | `isr` with a regeneration interval |
| Content may go stale briefly, availability matters  | `swr`                              |
| Content changes and you want a strict TTL           | `cache`                            |
| Personal, session-dependent, or frequently changing | `default`                          |

ISR and SWR both serve stale content while refreshing; the difference is the trigger. SWR refreshes on demand when a request arrives, ISR regenerates on an interval regardless of traffic. `static` and `prerender` are build-time: `static` writes known output, `prerender` crawls and renders routes during the build.

## Streaming Routes Stay Dynamic [#streaming-routes-stay-dynamic]

A route that returns a stream cannot be served from a whole-response cache — the cached body would be a buffered snapshot, not a live stream. Streaming routes therefore behave as `default`, and the framework does not attempt to cache them. See [Streaming & SSE](/docs/http/streaming).

## Caching and Tenancy [#caching-and-tenancy]

The model cache folds the tenant into its key, so cross-tenant reads never collide. Route-rule caches are tenant-agnostic by design: they serve public, non-personalized content only. For tenant-scoped data, cache through the model layer or the cache API with per-tenant keys rather than a public route rule. See [Tenancy](/docs/tenancy).

## Session and Personalization Rules [#session-and-personalization-rules]

Two rules keep personalization correct:

* Session-dependent responses stay dynamic. A cached public shell plus `useResource`-driven private fragments is the supported pattern.
* The framework refuses to cache responses carrying `Set-Cookie`, so a cached page can never leak a session cookie to another user.

## Development Behavior [#development-behavior]

In development, route caching is disabled by default and the model cache logs each decision:

* `cache:miss` and `cache:hit` are logged per model query
* `kwiva dev --cache` simulates production caching locally
* The development overlay shows per-request cache decisions

## Metrics [#metrics]

Every layer reports into observability: hit and miss ratios per layer, invalidation counts, and purge latency. See [Observability: metrics](/docs/observability/metrics).

## What's Next [#whats-next]

1. [Rendering: caching](/docs/rendering/caching) — page-level caching and ISR
2. [Rendering: prerendering](/docs/rendering/prerendering) — build-time output and crawling
3. [Routes & Routing](/docs/http/routes) — where route rules are declared
4. [Models](/docs/data/models) — the `cache` model option
5. [Frontend: data hooks](/docs/frontend/data-hooks) — client-scope caching and invalidation
