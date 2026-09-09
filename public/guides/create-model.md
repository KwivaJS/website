# How do I create a model? (/guides/create-model)



This guide walks through creating a model from scaffold to applied migration. In Kwiva the model is the single source of truth — from one `defineModel` declaration the framework derives the database table, migrations, REST routes, typed client, and validation.

## Prerequisites [#prerequisites]

* A Kwiva project scaffolded with `bun create kwiva my-app`
* The `@kwiva/data` package installed (it ships with new projects)
* A running local development setup

## Generate the model [#generate-the-model]

`kwiva make:model` scaffolds a model file plus a migration and factory stub:

```bash title="terminal"
kwiva make:model posts
```

This creates `src/app/models/posts.ts` alongside a migration file in `src/database/migrations/`.

## Define fields and relations [#define-fields-and-relations]

Open the generated file and define your fields with the field DSL. Relation fields use lazy references (arrow functions) to avoid circular imports:

```ts title="src/app/models/posts.ts"
// src/app/models/posts.ts
import { defineModel } from '@kwiva/data'

export default defineModel('posts', (f) => ({
  id: f.id(),
  title: f.string().validation((s) => s.min(1).max(200)),
  body: f.text().optional(),
  status: f.enum('draft', 'published', 'archived').default('draft').indexed(),
  publishedAt: f.timestamp().optional(),
  authorId: f.uuid().indexed(),
  author: f.belongsTo(() => User),
  comments: f.hasMany(() => Comment),
}), {
  timestamps: true,
  permission: 'posts',
})
```

`timestamps: true` adds `createdAt` and `updatedAt` columns. The `permission` option gates all generated routes and Studio screens by policy.

## Preview and run the migration [#preview-and-run-the-migration]

Kwiva generates migrations by diffing the model definition against the live database. Preview the proposal first, then apply it:

```bash title="terminal"
kwiva db:diff
kwiva db:migrate
```

The migration creates the `posts` table and indexes derived from your field definitions.

## Verify it works [#verify-it-works]

Confirm the migration was applied, then start the dev server and hit the generated route:

```bash title="terminal"
kwiva db:status
kwiva dev
```

```bash title="terminal"
curl http://localhost:3000/posts
```

The list route is derived from the model and returns an empty page:

```json title="verify-it-works.json"
{ "data": [], "total": 0, "page": 1, "lastPage": 0 }
```

Create a record through the generated `POST /posts` route, and `GET /posts` reflects it on the next call.

## Related Documentation [#related-documentation]

* [Models](/docs/data/models) — The `defineModel` factory and options
* [Fields & DSL](/docs/data/fields) — All field types and modifiers
* [Relations](/docs/data/relations) — `belongsTo`, `hasMany`, `hasOne`, `belongsToMany`
* [Migrations](/docs/data/migrations) — `db:diff`, `db:migrate`, `db:rollback`
* [Your First Model](/docs/getting-started/first-model) — Hands-on walkthrough
