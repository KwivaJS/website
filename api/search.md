# @kwiva/search (/api/search)



# @kwiva/search [#kwivasearch]

Search package: declarative Postgres full-text search over model IR + federated multi-model search.

## Config [#config]

| Symbol                                                | Kind     | Signature                                       |
| ----------------------------------------------------- | -------- | ----------------------------------------------- |
| `validateSearchConfig(input)`                         | function | → `SearchConfig{engine: "postgres", language?}` |
| Types: `SearchConfig`, `SearchConfigSection{search?}` | types    | —                                               |

## Model integration [#model-integration]

Search-ready models set `search: {fields: [{field, weight?}], language?}` in `defineModel` options. FTS column: `search_vector`. Weight enum: `SearchWeight = "A" \| "B" \| "C" \| "D"` (Postgres config weight semantics).

## Federated search [#federated-search]

| Symbol                               | Kind     | Signature                                                     |
| ------------------------------------ | -------- | ------------------------------------------------------------- |
| `searchAcross(models, term, limit?)` | function | → `SearchHit[]{model, row, rank}` sorted by `searchRank` desc |
| Type: `SearchHit{model, row, rank}`  | type     | —                                                             |

## Reindex [#reindex]

| Symbol                                                                         | Kind      | Signature                                               |
| ------------------------------------------------------------------------------ | --------- | ------------------------------------------------------- |
| `probeSearch(db, table)` / `reindexSearch(db, table)` / `searchCapability(db)` | functions | per-table ops (verified in CLI, `kwiva search:reindex`) |

> \[!TIP]
> `kwiva search:reindex [model]` prints `reindexed N searchable model(s)` or per-model result; requires `database` section.
