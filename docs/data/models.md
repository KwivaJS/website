# Models (/docs/data/models)



# Models [#models]

```ts title="src/app/models/post.ts"
import { defineModel } from "@kwiva/data";

export const Post = defineModel("posts", (f) => ({
  id: f.id(),
  title: f.string(),
  status: f.enum("draft", "published"),
  author: f.belongsTo(() => User),
  tags: f.manyToMany(() => Tag),
}), {
  timestamps: true,
  routes: true,
  fillable: ["title", "status"],
  hidden: ["password"],
  permission: "posts",
});
```

## Options [#options]

| Option                 | Type                                      | Notes                                                                                                                                |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `timestamps`           | bool                                      | adds `createdAt`/`updatedAt` (or provided names)                                                                                     |
| `softDelete`           | bool                                      | adds `deletedAt`                                                                                                                     |
| `audit`                | bool                                      | adds `createdBy`/`updatedBy` (uses `ctx.user.id`)                                                                                    |
| `tenantField`          | string                                    | auto-scopes this model by current tenant                                                                                             |
| `permission`           | string                                    | permission namespace (gates generated routes)                                                                                        |
| `fillable` / `guarded` | string\[]                                 | write whitelist/blacklist                                                                                                            |
| `hidden` / `visible`   | string\[]                                 | toJSON serialization                                                                                                                 |
| `routes`               | bool                                      | generate 5 REST routes                                                                                                               |
| `primaryKey`           | string                                    | override default `id`                                                                                                                |
| `hooks`                | object                                    | `beforeCreate`, `afterCreate`, `beforeSave`, `beforeUpdate`, `afterUpdate`, `beforeDelete`, `afterDelete`, `beforeFind`, `afterFind` |
| `indexes`              | array                                     | `[{columns, unique?, name?}]`                                                                                                        |
| `uniques`              | array                                     | composite unique constraints                                                                                                         |
| `search`               | `{fields: [{field, weight?}], language?}` | enables Postgres FTS on this model                                                                                                   |

## Field DSL [#field-dsl]

See [Fields](/docs/data/fields). Types: `id, uuid, string, text, integer, bigint, float, boolean, date, dateTime, time, enum, json, belongsTo, hasOne, hasMany, manyToMany, hasOneThrough, hasManyThrough, morphTo, morphMany, morphToMany`.

## Instance API [#instance-api]

| Member                                                                            | Notes                                      |
| --------------------------------------------------------------------------------- | ------------------------------------------ |
| `model.save()`                                                                    | insert or update (not-null check via `id`) |
| `model.update(data)`                                                              | —                                          |
| `model.delete()`                                                                  | (soft delete if enabled)                   |
| `model.forceDelete()`, `model.restore()`, `model.trashed`                         | soft-delete API                            |
| `model.refresh()`                                                                 | reload from DB                             |
| `model.replicate(except?)`                                                        | clone → new instance                       |
| `model.loadMissing(rel)`, `model.associate(rel, id)`, `model.dissociate(rel)`     | relations                                  |
| `model.isDirty`, `model.isClean`, `model.wasChanged`, `model.getOriginal(field?)` | change tracking                            |
| `model.toJSON()`                                                                  | —                                          |

## Generated REST surface [#generated-rest-surface]

```plaintext
GET    /api/{model}         list (validated where/page/orderBy/with)
GET    /api/{model}/:id     get
POST   /api/{model}         create (validated)
PATCH  /api/{model}/:id     update
DELETE /api/{model}/:id     remove
```

> \[!TIP]
> FTS search: `Post.search("term", {includeRank: true})` — see [Search](/docs/data/search).
