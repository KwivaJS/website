# Pagination (/docs/data/pagination)



Pagination shapes every list — API responses, Studio tables, and client pages. Kwiva provides two modes with a shared philosophy: the envelope is stable, the defaults come from config, and the generated endpoints validate pagination parameters like any other input. Choose offset for random access and admin views; choose cursor for infinite feeds where order must never shift.

## Offset Pagination [#offset-pagination]

Offset pagination is the default list mode: page number plus page size, with a deterministic envelope.

```ts title="offset-pagination.ts"
const posts = await Post.query().page(3, 20)
```

```ts title="offset-pagination-2.ts"
GET /api/posts?page=3&limit=20
```

```json title="offset-pagination-3.json"
{
  "data": [...],
  "total": 142,
  "page": 3,
  "lastPage": 8
}
```

| Key        | Meaning                                   |
| ---------- | ----------------------------------------- |
| `data`     | This page's rows                          |
| `total`    | Total rows across all pages               |
| `page`     | Current 1-based page                      |
| `lastPage` | Page count, derived from `total` and size |

Offset is a pure function of numbers, which makes it ideal for tables, deep links, and "jump to page N" controls. The trade-off is visibility into the total: computing `total` costs one aggregate query per list, and deep offsets cost `offset` skipped rows each time — page 50 of 20 costs 1,000 discarded rows before the first result.

## Offset Limits and Validation [#offset-limits-and-validation]

The generated list endpoint is strict about pagination input:

```ts title="offset-limits-and-validation.ts"
GET /api/posts?page=1&limit=20          // ok
GET /api/posts?page=0&limit=20          // 400 — pages are 1-based
GET /api/posts?limit=100000             // clamped to maxLimit
GET /api/posts?page=abc                 // 400 — not a number
```

`page` and `limit` are schema-checked like every other query parameter, so oversized responses and malformed input never reach the handler.

## Cursor Pagination [#cursor-pagination]

Cursor pagination walks a stable position instead of counting rows: the client passes an opaque cursor and receives the next one. Results cannot shift between pages because the cursor is bound to ordering keys, not to the number of skipped rows.

```ts title="cursor-pagination.ts"
const posts = await Post.query().cursorPaginate(20, { cursor: 'abc123' })
```

```ts title="cursor-pagination-2.ts"
GET /api/posts?cursor=abc123&limit=20
```

```json title="cursor-pagination-3.json"
{
  "data": [...],
  "nextCursor": "def456",
  "hasMore": true
}
```

| Key          | Meaning                                                |
| ------------ | ------------------------------------------------------ |
| `data`       | This page's rows                                       |
| `nextCursor` | Opaque cursor for the next page; absent when exhausted |
| `hasMore`    | Whether another page exists                            |

Internally a cursor records the ordering key values of the last row on the page; the next page fetches rows strictly after those keys. That is why the "stable under inserts" property holds: a new row inserted between pages never duplicates or skips a row, because the position is a value comparison, not a cardinality count.

## Cursor Ordering Requirements [#cursor-ordering-requirements]

Cursor pagination runs on an ordered query — the cursor encodes where the previous page stopped:

```ts title="cursor-ordering-requirements.ts"
Post.query().orderBy({ createdAt: 'desc' }).cursorPaginate(20, { cursor })
```

| Requirement          | Why                                                         |
| -------------------- | ----------------------------------------------------------- |
| A deterministic sort | The cursor must encode a unique position per row            |
| Ties broken by key   | Add the primary key to the sort when `createdAt` can repeat |
| Stable key values    | A row whose key mutates between pages can appear twice      |

Ordering defaults to the model's `orderable` setting or `createdAt` when no explicit `orderBy` is given; for feeds, add `id` as a tiebreaker so two same-timestamp rows still have a strict order.

> \[!NOTE]
> Cursors are opaque identifiers. Clients should treat them as strings to echo back, never decode or construct them.

## Offset vs. Cursor [#offset-vs-cursor]

| Feature                      | Offset                    | Cursor                            |
| ---------------------------- | ------------------------- | --------------------------------- |
| Random access (jump to page) | Yes                       | No                                |
| Stable under inserts/deletes | No                        | Yes                               |
| Performance at depth         | Degrades with offset      | Consistent regardless of depth    |
| Natural fit                  | Tables, admin, dashboards | Feeds, timelines, infinite scroll |
| Client hook                  | `useList`                 | `useInfiniteList`                 |

The "performance at depth" row is the deciding factor at scale: offset pagination scans and discards `offset` rows on every page, while cursor pagination always reads only the needed window around the cursor.

## Defaults [#defaults]

The API config controls the envelope defaults:

```ts title="defaults.ts"
export default defineConfig('api', {
  defaults: {
    pagination: {
      defaultLimit: 20,
      maxLimit: 100,
    },
  },
})
```

| Option         | Default | Meaning                                           |
| -------------- | ------- | ------------------------------------------------- |
| `defaultLimit` | `20`    | Page size when the client omits `limit`           |
| `maxLimit`     | `100`   | Ceiling on requested `limit`; larger values clamp |

Generated endpoints validate `page`, `limit`, and `cursor` against these bounds, so a client cannot force a million-row response.

## Pagination with Eager Loading [#pagination-with-eager-loading]

Pagination composes with the rest of the builder: eager loads run per-page (not across all pages), and aggregates like `total` are computed without paginating the whole set:

```ts title="pagination-with-eager-loading.ts"
const page = await Post.query()
  .where('status', 'published')
  .with('author', 'comments')
  .page(1, 20)
```

Constraints applied before `.page()` shape the count; constraints you might be tempted to apply after it will not. This also means tenant scoping and soft-delete filtering are already reflected in `total`.

## List Endpoints and Client Hooks [#list-endpoints-and-client-hooks]

Generated list routes accept `page`/`limit` or `cursor`/`limit`, and the typed client and React hooks consume the same envelopes:

* `useList` — offset-driven listings with filtering and page state.
* `useInfiniteList` — cursor-driven infinite scroll, appending pages as `nextCursor` arrives.

See [Frontend: Data Hooks](/docs/frontend/data-hooks) for the full hook API and cache behavior.

## What's Next [#whats-next]

1. [Queries](/docs/data/queries) — the builder behind pagination
2. [Models](/docs/data/models) — `orderable` fields that pagination sorts by
3. [Frontend: Data Hooks](/docs/frontend/data-hooks) — consuming envelopes on the client
4. [Guides: Pagination](/guides/pagination) — end-to-end paginated listing
