# Queries (/docs/data/queries)



Models expose a comprehensive, fully typed query builder. You start from the model with `.query()` — it is scoped to the model's table, tenant, and soft-delete behavior automatically — and chain clauses to constrain, shape, aggregate, and paginate the result. Every clause is typechecked against the model's fields: `where('status', ...)` compiles, `where('stauts', ...)` does not.

## Basic Querying [#basic-querying]

```ts title="basic-querying.ts"
const allPosts = await Post.query().get()
const post = await Post.findOrFail(id)          // throws NotFoundError → 404 mapping
const post = await Post.first({ where: { slug: 'hello' } })
const created = await Post.create({ title: 'Hello' })
await post.update({ title: 'Updated' })
await post.delete()
```

| Helper                   | Behavior                                            |
| ------------------------ | --------------------------------------------------- |
| `.query().get()`         | Execute and return all matching rows                |
| `.query().first()`       | First matching row, or `null`                       |
| `findOrFail(id)`         | Row by primary key, throws `NotFoundError`          |
| `.query().firstOrFail()` | First row, throws when absent                       |
| `create(attrs)`          | Insert with defaults, validation, and hooks applied |
| `row.update(attrs)`      | Update a loaded row                                 |
| `row.delete()`           | Delete; soft when the model enables it              |

## Where Clauses [#where-clauses]

The three-argument form — `.where(field, operator, value)` — and the shorthand `.where(field, value)` treat any scalar value as equality:

```ts title="where-clauses.ts"
Post.query()
  .where('status', 'published')                  // shorthand equality
  .where('views', '>', 100)                      // operator form
  .whereBetween('createdAt', [start, end])
  .whereIn('authorId', [1, 2, 3])
  .whereNull('deletedAt')
  .whereNotNull('publishedAt')
  .whereDate('createdAt', '2024-01-01')
  .whereMonth('createdAt', 1)
  .whereYear('createdAt', 2024)
  .orWhere('status', 'draft')
```

| Clause                                   | Signature                                | Semantics                             |
| ---------------------------------------- | ---------------------------------------- | ------------------------------------- |
| `where`                                  | `(field, value)` or `(field, op, value)` | Equality or comparison                |
| `whereBetween`                           | `(field, [min, max])`                    | Inclusive range                       |
| `whereIn`                                | `(field, values[])`                      | Membership                            |
| `whereNull` / `whereNotNull`             | `(field)`                                | NULL checks                           |
| `whereDate` / `whereMonth` / `whereYear` | `(field, value)`                         | Temporal extraction                   |
| `whereRaw`                               | `(sql, ...params)`                       | Raw predicate, parameterized          |
| `whereExists`                            | `(subquery)`                             | Subquery existence                    |
| `orWhere`                                | `(field, value)`                         | OR grouping with the previous `where` |

Operators accepted by the three-argument form: `=`, `!=`, `>`, `>=`, `<`, `<=`, `LIKE`, and `ILIKE` variants.

### Logical Grouping [#logical-grouping]

Compose complex predicates with a nested function form so AND/OR precedence is explicit:

```ts title="logical-grouping.ts"
Post.query()
  .where((q) => q.where('status', 'draft').orWhere('status', 'archived'))
  .where('authorId', authorId)
```

## Selects and Joins [#selects-and-joins]

```ts title="selects-and-joins.ts"
Post.query()
  .join('users', 'users.id', '=', 'posts.authorId')
  .select('posts.*', 'users.name as authorName')
  .distinct()
```

* `join` joins another table on a condition; `select` narrows the returned columns; `distinct` deduplicates rows.
* Selected aliases are typed, so `rows[0].authorName` is a known string, not `any`.
* For row-shaped reads prefer eager loading (see [Relations](/docs/data/relations)); joins are for reporting-style projections.

## Aggregation and Grouping [#aggregation-and-grouping]

```ts title="aggregation-and-grouping.ts"
const count = await Post.query().count()
const sum = await Post.query().sum('views')
const avg = await Post.query().avg('views')
const max = await Post.query().max('views')
const min = await Post.query().min('views')

const stats = await Post.query()
  .groupBy('status')
  .select('status')
  .count()
  .having('count', '>', 10)
```

| Aggregate                     | Returns                 |
| ----------------------------- | ----------------------- |
| `.count()`                    | Row count               |
| `.sum(field)`                 | Sum over the field      |
| `.avg(field)`                 | Mean over the field     |
| `.max(field)` / `.min(field)` | Extremes over the field |

`groupBy` partitions results; `having` filters grouped rows the way `where` filters raw rows. Aggregates combine with every other clause — `where`, `tenantField` scoping, and soft-delete filtering all still apply.

## Ordering and Pagination [#ordering-and-pagination]

```ts title="ordering-and-pagination.ts"
Post.query()
  .orderBy('createdAt', 'desc')
  .orderBy({ createdAt: 'desc', views: 'desc' })
  .latest()                       // createdAt desc
  .inRandomOrder()
  .limit(20)
  .offset(40)
  .page(1, 20)                    // { data, total, page, lastPage }
  .cursorPaginate(20, { cursor }) // stable cursor mode
```

Ordering accepts a field/operator pair or an object map. `.page()` and `.cursorPaginate()` return the paginated envelope described on [Pagination](/docs/data/pagination); `.limit(n)` and `.offset(n)` are available for bare slicing. Only `orderable` fields may be ordered by generated endpoints.

Clauses are chainable all the way down, and a scoped builder can be factored into a helper so the same constraint set is reused across call sites:

```ts title="ordering-and-pagination-2.ts"
function published(q: ReturnType<typeof Post.query>) {
  return q.where('status', 'published')
}

const featured = await published(Post.query()).with('author').limit(3).get()
const archive  = await published(Post.query()).orderBy({ createdAt: 'desc' }).get()
```

The builder accumulates constraints and executes once on `get()` — build lazily wherever it is convenient, execute at the end.

## Raw SQL [#raw-sql]

The escape hatch keeps you inside typed tooling while breaking free of the builder:

```ts title="raw-sql.ts"
const rows = await db.raw<{ n: number }>('select count(*) n from posts')

await db.insert({ title: 'Test' }).into('posts')
await db.update({ title: 'Updated' }).table('posts').where('id', id)
await db.delete().from('posts').where('id', id)
```

* `db.raw<T>(sql)` runs arbitrary SQL with schema hinting.
* The builder forms (`insert().into`, `update().table().where`, `delete().from().where`) cover ad-hoc writes without string interpolation.
* Parameters are always parameterized — never concatenate values into SQL.
* Raw SQL does **not** get tenant scoping or soft-delete filtering automatically; keep tenant constraints explicit in escape-hatch queries. See [Tenancy: Scoping](/docs/tenancy/scoping).

## Locks [#locks]

For correctness under contention, `SELECT` can take row locks:

```ts title="locks.ts"
await Post.query().where('id', id).forUpdate().get()
await Post.query().where('id', id).sharedLock().get()
```

| Lock           | Effect                                                      |
| -------------- | ----------------------------------------------------------- |
| `forUpdate()`  | Exclusive write lock; blocks other writers and lock readers |
| `sharedLock()` | Shared read lock; allows other readers, blocks writers      |

Locks pair naturally with [transactions](/docs/data/transactions) — lock a row, mutate it, and commit atomically.

## Scoping: Tenancy, Soft Deletes, Permissions [#scoping-tenancy-soft-deletes-permissions]

`.query()` is not a blank slate. A model with `tenantField` injects the current tenant's scope into the SQL; a model with `softDelete: true` filters trashed rows unless `.withTrashed()` is appended; `permission` gates the derived endpoints at the route layer. Every example above already runs inside those guarantees.

## Observability [#observability]

Every query produces an OTel span with normalized SQL text, duration, and row count; slow queries are logged above the threshold configured in `src/config/telemetry.ts`. See [Observability: Tracing](/docs/observability/tracing) to connect a slow query to the request and tenant that triggered it.

## What's Next [#whats-next]

1. [Pagination](/docs/data/pagination) — offset vs. cursor envelopes
2. [Transactions](/docs/data/transactions) — atomic multi-statement work
3. [Relations](/docs/data/relations) — eager loading and joins for relations
4. [Soft Deletes](/docs/data/soft-deletes) — trashed-row semantics
5. [Models](/docs/data/models) — the model API that underpins the builder
