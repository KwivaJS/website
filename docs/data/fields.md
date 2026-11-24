# Fields (/docs/data/fields)



# Fields [#fields]

`defineModel` takes `(f) => ({...})` — every value is a field builder.

## Scalar types [#scalar-types]

| Method                      | Type      | Column                |
| --------------------------- | --------- | --------------------- |
| `f.id()`                    | `id`      | `integer, primaryKey` |
| `f.uuid()`                  | `uuid`    | `uuid, primaryKey`    |
| `f.string(len?)`            | `string`  | `varchar(len=255)`    |
| `f.text()`                  | `text`    | `text`                |
| `f.integer()`, `f.bigint()` | integers  | —                     |
| `f.float()`                 | float     | —                     |
| `f.boolean()`               | bool      | —                     |
| `f.date()`, `f.time()`      | date/time | —                     |
| `f.dateTime()`              | timestamp | —                     |
| `f.json<T>()`               | json      | —                     |

## Modifiers [#modifiers]

| Method                      | Notes                                      |
| --------------------------- | ------------------------------------------ |
| `.nullable()`, `.notNull()` | nullability (default: nullable)            |
| `.indexed()`, `.unique()`   | index/unique constraint                    |
| `.default(value)`           | DB-level default                           |
| `.validation(v => v)`       | field-level validator (Error → VALIDATION) |
| `.description(text)`        | docs/openapi metadata                      |
| `.as(alias)`                | alias for SQL                              |

## Enums [#enums]

`f.enum("a", "b")` — creates a check constraint + zod/enum reflection. `enumValues` exposed on `FieldDefinition`.

## Relations [#relations]

See [Relations](/docs/data/relations).

## Query validation [#query-validation]

Relations participate in queries (`whereHas`, `withCount`); see [Relations](/docs/data/relations).

## Internal note [#internal-note]

`defineModel` compiles to core `ModelDefinition` via `compileIR`. Field kinds: `id, uuid, string, text, integer, bigint, float, boolean, date, time, dateTime, enum, json`.
