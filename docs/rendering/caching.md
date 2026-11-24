# Caching Strategies (/docs/rendering/caching)



# Caching Strategies [#caching-strategies]

| Layer        | Where                                   | Details                                 |
| ------------ | --------------------------------------- | --------------------------------------- |
| Route rules  | `ctx.response.set({cache: {ttl, swr}})` | —                                       |
| Model cache  | core `Cache` (Keyv)                     | `getCache/initCache`                    |
| Client cache | TanStack Query                          | [Data Hooks](/docs/frontend/data-hooks) |
| CDN          | —                                       | via route rules + public mode           |

## invalidation [#invalidation]

`cache.invalidateTags([...])` — invalidates by tag (model: `invalidateModel` helper).
