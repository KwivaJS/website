# Pagination (/docs/data/pagination)



# Pagination [#pagination]

Two strategies: offset (`page(page, perPage)`) and cursor (`cursor(col, table, limit)`).

## Offset pagination [#offset-pagination]

```ts
await Post.page(1, { size: 20 }).where("status", "=", "published").orderBy("id", "desc").all();
```

Response: `{ items, page, size, total, pages }`.

## Cursor pagination [#cursor-pagination]

```ts
await Post.cursor("id", "posts", { limit: 50 }).all();
```

Response: `{ items, cursor, hasMore }` (stable keysets; use unique col, e.g. `id` or `createdAt`).

## Config (`src/config/app.ts` or similar) [#config-srcconfigappts-or-similar]

```ts
export default defineConfig({ defaultPerPage: 20, maxPerPage: 100 });
```

## Client side [#client-side]

`useInfiniteList` hooks handle both automatically.
