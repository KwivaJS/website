# Queries (/docs/data/queries)



# Queries [#queries]

`Model.query()` (via `Model.<method>` static methods or `QueryBuilder`).

## Common builders [#common-builders]

| API                                                 | Notes                                                                             |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `.where(col, op, value)` / `.where(col, value)`     | operator forms: `=, !=, >, <, >=, <=, like, ilike, in, notIn, between, is, isNot` |
| `.orWhere(...)`                                     | —                                                                                 |
| `.whereIn(col, arr)`                                | —                                                                                 |
| `.whereNull(col)` / `.whereNotNull(col)`            | —                                                                                 |
| `.orderBy(col, "asc"/"desc")` / `.orderByDesc(col)` | —                                                                                 |
| `.limit(n)` / `.offset(n)`                          | —                                                                                 |
| `.select(...cols)`                                  | —                                                                                 |
| `.with("relation")`                                 | eager load (see [Relations](/docs/data/relations))                                |
| `.having(col, op, value)`                           | aggregates with groups                                                            |
| `.useCursor()`                                      | —                                                                                 |
| `.useLocks()`                                       | `SELECT ... FOR UPDATE`                                                           |

## Terminals [#terminals]

| API                                                                                                               | Notes      |
| ----------------------------------------------------------------------------------------------------------------- | ---------- |
| `.get()`, `.all()`, `.first()`, `.firstOrFail()`, `.firstOrNull()`, `.firstOrCreate(where)`, `.firstOrNew(where)` | —          |
| `.value(col)`, `.pluck(col)`                                                                                      | —          |
| `.count()`, `.max(col)`, `.min(col)`, `.avg(col)`, `.sum(col)`                                                    | aggregates |
| `.chunk(n)`, `.chunkById(n, col)`                                                                                 | streaming  |

## Transactions [#transactions]

```ts
await db.transaction(async (tx) => {
  // tx.execute / tx.insert etc.
});
```

## `db` access [#db-access]

```ts
import { db } from "@kwiva/data";
db.execute(sql`SELECT ...`); // from core?
```

See [Transactions](/docs/data/transactions) for `db`, `upsert`, savepoints.
