# Frontend 02 — SSR

**Status**: Locked (ADR-0006) · **Updated**: 2026-09-08 · **Docset**: v0.3

Kwiva owns SSR orchestration (`@kwiva/react`). The engine (Nitro) serves; the framework renders. Streaming-first, hydration-safe, ISR-capable.

## Render pipeline

```
request (page route)
  → router match (owned router)
  → beforeLoad guards (session → login redirects)
  → loaders execute in parallel (server-side, via typed client — in-process)
  → React tree renderToReadableStream
      ├─ Suspense boundaries stream as they resolve (stream(promise) deferreds)
      └─ data hooks dehydrate into <script id="kwiva:state"> at stream tail
  → response stream (http status, headers, set-cookies from pipeline)
hydration (client)
  → state rehydrates into the data-hook cache (no refetch of loader data)
  → router picks up at the same route with same search state
```

## Streaming & deferred data

```tsx
// loader
loader: async ({ params, client }) => ({
  post: await client.posts.get(params.id),                          // blocking
  comments: stream(client.comments.list({ postId: params.id })),    // streams in
})
```

- Blocking shell renders immediately; deferred chunks hydrate into Suspense boundaries.
- Works with route rules: `isr` caches the **full stream**, `swr` serves stale while revalidating.

## Hydration contract

- Loader data + deferred promises serialize with a typed reviver (Dates, class instances like model rows).
- Client cache is keyed identically on server and client → hydration is a cache transfer, not a re-fetch.
- Preact-compat mode: same pipeline; smaller bundle.

## Caching behaviors (per route rule)

| Rule | Behavior |
|---|---|
| (default) | dynamic SSR each request |
| `cache: n` | full response cached n seconds |
| `swr: n` | stale-while-revalidate (purge-in-background) |
| `isr: n` | static page regenerated on interval (or on-demand via `revalidateTag`) |
| `static` | built once at `kwiva build` (prerender) |
| `prerender: true` | crawl/prerender at build |

```ts
// src/routes/rules.ts
defineServerRoute('/products/**', { isr: 300, cache: { tags: ['catalog'] } })
```

On-demand invalidation: `invalidateTags(['catalog'])` from any job/task/event handler — the framework calls the engine's purge.

## Personalization with cached shells

- Public shell cached (`isr`), user-specific fragments load client-side via data hooks (`useResource`) — session-scoped, never cached.
- `head` is serialized per route; SEO tags come from loader data.

## Error handling during SSR

- Loader/guard throws → `errorComponent` for that route (or root boundary).
- Deferred rejections → boundary fallback with retry.
- Dev overlay attaches the loader stack + OTel trace id.

## SPA fallback

`api+spa` mode: pages render client-only from the same `definePage` files; the server serves the shell + API. Route rules still apply to the API surface.

## Metrics

- SSR wall time, time-to-first-byte of stream, shell time, hydration time — all OTel spans (`engineering/03`).
