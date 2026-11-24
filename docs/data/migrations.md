# Migrations (/docs/data/migrations)



# Migrations [#migrations]

Kwiva uses **schema-diff driven migrations**: the model IR is the source of truth; `kwiva migrate` diffs models against the live DB.

## `defineMigration` [#definemigration]

```ts title="src/database/migrations/20260101000000_create_posts.ts"
import { defineMigration } from "@kwiva/data";

export const CreatePosts = defineMigration("20260101000000_create_posts", (db) =>
  db.createTable("posts", (t) => {
    t.id();
    t.string("title").nullable(false);
    t.dateTime("createdAt").notNull().defaultNow();
  }),
);
```

`Migration` struct: `{name, up, down?}` — timestamped names (`YYYYMMDDHHMMSS_*`); rollback to last batch; migrations without `down` throw on `migrate:down`.

## CLI commands [#cli-commands]

| Command                  | Purpose                                                       |
| ------------------------ | ------------------------------------------------------------- |
| `kwiva migrate`          | apply all migrations in order                                 |
| `kwiva migrate:status`   | `applied: ...` / `pending: ...`                               |
| `kwiva migrate:down`     | roll back last batch                                          |
| `kwiva migrate:generate` | generate diffs from model IR (drift → `operations`, `source`) |

`migrateGenerate(models, db?)` returns `{operations, source, extra}`.

## Searchable migrations [#searchable-migrations]

`db.searchable()` — writes FTS triggers + index for `@kwiva/search`.

## Custom Migrations [#custom-migrations]

Full `MigrationSchema`: `createTable, addColumn, dropTable, addIndex, dropColumn, addComment, searchable`. Type exports: `TableBuilder, ColumnBuilder, ColumnTypeBuilder, DdlOp...`.
