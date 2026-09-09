# How do I paginate results? (/guides/pagination)



This guide covers the two pagination strategies built into the query builder — offset pagination with `.page()` and cursor pagination with `.cursor()` — and how to use them in a controller.

## Prerequisites [#prerequisites]

* A model defined with `defineModel`
* A controller using `defineController`
* Data in the table to paginate

## Offset pagination with `.page()` [#offset-pagination-with-page]

Offset pagination uses page numbers and page sizes. It's the simplest approach and works well for most use cases:

```ts title="offset-pagination-with.ts"
const result = await Post.query()
  .where('status', 'published')
  .page(1, 20)
```

The result carries the current page plus totals:

```ts title="offset-pagination-with-2.ts"
{
  data: Post[],
  total: number,
  page: number,
  lastPage: number,
}
```

For example, with 1500 matching records, `.page(3, 10)` returns `{ data: [...], total: 1500, page: 3, lastPage: 150 }`.

## Cursor pagination with `.cursor()` [#cursor-pagination-with-cursor]

Cursor pagination uses a cursor value (typically `id` or `createdAt`) for stable, efficient pagination — ideal for infinite scroll feeds and high-concurrency lists:

```ts title="cursor-pagination-with.ts"
const result = await Post.query()
  .where('status', 'published')
  .cursor('createdAt', 'desc', 'cursor-value')
```

The response carries the next page cursor instead of totals:

```ts title="cursor-pagination-with-2.ts"
{
  data: Post[],
  nextCursor: string | null,
  hasMore: boolean,
}
```

`nextCursor` is `null` when there are no more pages. Cursor pagination avoids the page-shifting problem that offset pagination has when records are inserted or deleted between fetches.

## Choosing a strategy [#choosing-a-strategy]

| Scenario                  | Offset | Cursor |
| ------------------------- | ------ | ------ |
| Admin dashboards          | ✓      |        |
| Reports with exact counts | ✓      |        |
| Search results            |        | ✓      |
| Infinite scroll feeds     |        | ✓      |
| High-concurrency lists    |        | ✓      |

## Reading page params in a controller [#reading-page-params-in-a-controller]

Generated list endpoints accept pagination as query parameters — `page` and `size` for offset mode, `cursor` and `direction` for cursor mode. Pass them straight through to the query builder:

```ts title="reading-page-params-in-a-controller.ts"
list: c.get('/', async ({ query }) => {
  return Post.query()
    .where('status', 'published')
    .page(query.page ?? 1, 20)
})
```

The default page size is 20. Configure it globally in `src/config/app.ts`:

```ts title="reading-page-params-in-a-controller-2.ts"
export default defineConfig('app', {
  pagination: { defaultPageSize: 25, maxPageSize: 100 },
})
```

## Infinite lists client-side [#infinite-lists-client-side]

For infinite scroll, use cursor mode and let the `nextCursor`/`hasMore` contract drive the next fetch. The response shape pairs directly with `useInfiniteList` for client-side data fetching.

## Verify it works [#verify-it-works]

Start the dev server and request a page:

```bash title="terminal"
curl "http://localhost:3000/posts?page=1&size=20"
```

This returns `{ data, total, page, lastPage }`. For cursor mode:

```bash title="terminal"
curl "http://localhost:3000/posts?cursor=abc123&direction=next"
```

This returns `{ data, nextCursor, hasMore }`.

## Related Documentation [#related-documentation]

* [Pagination](/docs/data/pagination) — The full pagination reference
* [Query Builder](/docs/data/queries) — `.page()`, `.cursor()`, and filters
* [Relations](/docs/data/relations) — Combine pagination with `.with()` and `.withCount()`
* [Your First API](/docs/getting-started/first-api) — Pagination in a controller
