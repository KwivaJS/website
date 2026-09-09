# Server 05 — Caching

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

Route-level caching (SWR/ISR/static via route rules), data caching (model cache options + `cache` API), and cache tags for invalidation. Engine: unstorage mounts (hidden); surfaces: route rules, `cache` API, `invalidateTags`.

## Layers

```
route rules  (whole responses: cache / swr / isr / static / prerender)
model cache  (query results per model, TTL + tags)
data hooks   (client cache — TanStack Query engine, hidden)
cache API    (explicit key/value with TTL + tags)
```

## Route rules (response cache)

```ts
// src/routes/rules.ts
defineServerRoute('/products/**', { isr: 300, cache: { tags: ['catalog'] } })
defineServerRoute('/pricing/**',  { static: true })
defineServerRoute('/news/**',     { swr: 60 })
```

| Rule | Behavior |
|---|---|
| `cache: n` | serve cached response n seconds |
| `swr: n` | stale-while-revalidate — serve, refresh in background |
| `isr: n` | regenerate static page on interval |
| `static` / `prerender` | build-time |
| (none) | dynamic |

Public pages only — never session-bearing responses (personalized fragments ride on client hooks).

## Model cache

```ts
defineModel('products', (f) => ({ ... }), {
  cache: { ttl: 120, tags: ['catalog'], swr: true },   // list/get cached per query signature
})
```

Cache key = model + query signature (+ tenant). Invalidated on model writes automatically (`create/update/delete` → purge model keys), or manually via tags.

## The cache API

```ts
import { cache } from '@kwiva/core'

await cache.set('stats:overview', value, { ttl: 300, tags: ['stats'] })
const cached = await cache.get('stats:overview')
const fresh = await cache.wrap('stats:overview', async () => compute(), { ttl: 300 })
await cache.invalidateTags(['stats'])
```

Backends via `src/config/cache.ts > mounts` (memory dev, redis prod, kv on edge).

## Invalidation

| Trigger | Effect |
|---|---|
| model write (auto) | purge that model's keys |
| `invalidateTags([...])` | purge tagged keys + tagged route-rule caches (calls engine purge) |
| `invalidate(Model)` (client) | refresh data-hook queries for the model |
| deploy | build id busts static assets |

## Session/personalization rules

- Session-dependent responses must stay dynamic (framework refuses to cache `Set-Cookie` responses).
- Pattern: cached public shell + `useResource`-driven private fragments (frontend/02).

## Dev behavior

- Dev default: no route caching, model cache logged (`cache:miss/hit`), `kwiva dev --cache` to simulate.
- Dev overlay shows per-request cache decisions (v1.x).

## Metrics

- Hit/miss ratios per layer, invalidation counts, purge latency — OTel metrics (`engineering/03`).
