# Response Caching (/docs/http/caching)



# Response Caching [#response-caching]

## Route caching [#route-caching]

`ctx.response.set({cache: {ttl, swr}})` on handler → cytokine.

## Model caching (future) [#model-caching-future]

Model-level caching via `ctx.bound.store` (evlog-style?) — see advanced.

## Client caching [#client-caching]

TanStack Query cache in `@kwiva/client` — see [Data Hooks](/docs/frontend/data-hooks).

> \[!TIP]
> For full cache implementation docs, see [Cache & KV](/docs/data/cache) + [Cache & KV (core)](/api/core#cache-advisory).
