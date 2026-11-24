# Performance (/docs/advanced/performance)



# Performance [#performance]

## Runtime [#runtime]

* **Bun** — fast startup, isolated modules
* **Node** — compatible target

## SSR [#ssr]

* Streaming SSR (Suspense-based, see [Streaming SSR](/docs/rendering/streaming))

## Caching (layered) [#caching-layered]

1. **Route rules** — `ctx.response.set({cache, swr})`
2. **Model cache** — `@kwiva/core` `Cache`
3. **Client cache** — TanStack Query persistence

## Type-level inference [#type-level-inference]

Full type flow from model → route tree → client, zero runtime codegen.

## Startup [#startup]

Kwiva dev is fast (Rust-speed, oxc); Bun runtime.

## Tips [#tips]

* Use `cache.wrap` for expensive operations
* `useUpload` with presigned URLs for large files
