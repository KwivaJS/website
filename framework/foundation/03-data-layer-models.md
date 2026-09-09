# Foundation 03 — Data Layer: Models

**Status**: Locked (ADR-0004, ADR-0018) · **Updated**: 2026-09-08 · **Docset**: v0.3

`defineModel` — the function-based model DSL. One file per model in `src/app/models/`. The model is the **single source of truth**: database, migrations, seeders, REST API, RPC client, Kwiva Studio, OpenAPI, and MCP tools all derive from it.

## The factory

```ts
defineModel(name, fields, options?)
```

- `name` — table/resource name, lowercase plural (`'users'`, `'posts'`)
- `fields` — `(f) => ({ ... })` field factory (function-based, not class-based — ADR-0018)
- `options` — model-level behavior (see below)

## Field DSL

```ts
import { defineModel } from '@kwiva/data'

export default defineModel('posts', (f) => ({
  // identity
  id: f.id(),                                   // uuid pk by default; f.id('autoincrement')
  // scalars
  title: f.string().validation(s => s.min(1).max(200)),
  body: f.text().optional(),
  views: f.integer().default(0),
  score: f.float().optional(),
  isPinned: f.boolean().default(false).indexed(),
  status: f.enum('draft', 'published', 'archived').default('draft').indexed(),
  publishedAt: f.timestamp().optional(),
  metadata: f.json<{ readingTime: number }>().optional(),
  // relations — lazy refs avoid circular imports
  author: f.belongsTo(() => User),
  comments: f.hasMany(() => Comment),
  coverImage: f.hasOne(() => CoverImage),
  tags: f.belongsToMany(() => Tag, () => PostTag),
}), {
  // options
  timestamps: true,                // createdAt / updatedAt
  softDelete: true,                // deletedAt + query filtering
  audit: true,                     // createdBy / updatedBy from session
  tenantField: 'tenantId',         // auto-scoping (ADR-0015)
  permission: 'posts',             // policy namespace for generated routes/Studio
  uniques: [['authorId', 'title']],
  indexes: [{ columns: ['status', 'publishedAt'] }],
  hooks: {
    onCreating: (row, { session }) => { row.slug = slugify(row.title) },
    onDeleting: async (row) => { if (row.isPinned) throw new Error('cannot delete pinned') },
  },
  computed: {                      // v1.x — derived, read-only in API
    excerpt: (row) => row.body?.slice(0, 140) ?? '',
  },
})
```

## Model API (Eloquent-grade, Drizzle-powered)

```ts
import { Post, User, db } from '@kwiva/data'

// query builder — full Drizzle surface, typed
const posts = await Post.query()
  .where('status', 'published')
  .where('views', '>', 100)
  .orderBy({ createdAt: 'desc' })
  .with('author', 'comments')            // eager loads
  .page(1, 20)                           // { data, total, page, lastPage }

// find
const post = await Post.findOrFail(id)   // throws NotFoundError → 404 mapping
const draft = await Post.first({ where: { status: 'draft' } })

// write
const created = await Post.create({ title: 'Hello', authorId })
await post.update({ status: 'published' })
await post.delete()                      // soft when enabled
await Post.restore(id)                   // soft-delete restore
await Post.withTrashed().first(...)      // include trashed

// aggregates
const count = await Post.query().where(...).count()

// transactions (nested → savepoints)
await db.transaction(async (tx) => {
  const user = await User.create({ email }, { tx })
  await Post.create({ title, authorId: user.id }, { tx })
})

// raw escape hatch
const rows = await db.raw<{ n: number }>('select count(*) n from posts')
```

## Relations

| Relation | Definition | Load |
|---|---|---|
| belongsTo | `f.belongsTo(() => User)` | `with('author')` |
| hasMany | `f.hasMany(() => Comment)` | `with('comments')`, `withCount('comments')` |
| hasOne | `f.hasOne(() => CoverImage)` | `with('coverImage')` |
| belongsToMany | `f.belongsToMany(() => Tag, () => PostTag)` | `with('tags')` |

Nested: `.with('comments.author')`. Lazy refs (`() => User`) keep models circular-import-free.

## Derivation pipeline (the IR)

```
defineModel files ──scan──► model IR (src/.kwiva/model-ir.json)
 ├─► Drizzle table definitions + migrations (src/database/migrations/*.sql.ts)
 ├─► REST routes: list/get/create/update/delete (+ relations endpoints)
 │    validation · pagination · filters · policy checks · tenant scoping
 ├─► RPC client types (@kwiva/client)
 ├─► Studio screens (@kwiva/studio)
 ├─► OpenAPI components/schemas
 └─► MCP tools (@kwiva/mcp)
```

Generated REST surface (per model, unless `routes: false`):

| Route | Handler | Extras |
|---|---|---|
| `GET /api/posts` | list | `where`, `page`, `orderBy`, `with` (validated) |
| `GET /api/posts/:id` | get | policy `posts.read` |
| `POST /api/posts` | create | body validation, hooks, audit |
| `PATCH /api/posts/:id` | update | policy, optimistic concurrency (v1.x) |
| `DELETE /api/posts/:id` | delete | policy, soft-delete |
| `POST /api/posts/:id/:action` | custom actions | via `defineController` extensions |

## Migrations, seeders, factories

```bash
kwiva make:model invoice          # src/app/models/invoice.ts + migration + factory stub
kwiva db:diff                     # model vs DB → migration proposal
kwiva db:migrate                  # apply pending
kwiva db:rollback --steps=1
kwiva db:seed                     # run seeders
kwiva db:browse                   # data browser (v1.x)
```

```ts
// src/database/seeders/users.ts
import { defineSeeder } from '@kwiva/data'
export default defineSeeder('users', async ({ factory }) => {
  await factory(User).count(10).create()
  await factory(User).create({ email: 'admin@acme.dev', role: 'admin' })
})
```

## Validation

Field-level `validation()` uses Standard Schema (Valibot default — switchable to Zod/ArkType/TypeBox via `src/config/app.ts > validator`). Generated routes validate body **and** query (`where`/`orderBy` shapes are schema-checked against the model).

## What parity means here

- Query surface: Drizzle's full builder (where/join/select/limit/aggregate/groupBy/having/transaction/raw).
- Lifecycle DX: Eloquent's (find/create/update/delete, relations, with/withCount, soft delete, factories, seeders, hooks).
- Derivation: Questpie's full one-schema surface (reference-only, independently implemented):

| Questpie feature | Here |
|---|---|
| one-schema single source of truth | `defineModel` files → model IR |
| 5 typed routes per collection | generated `list/get/create/update/delete` (deterministic shape) |
| typed client SDK | `@kwiva/client`, types from the same IR |
| generated Studio UI | `@kwiva/studio`, schema-derived |
| collection-level permissions | `permission` option → policy-gated routes/Studio |
| field-type-driven validation | field DSL is the validation source |
| job infra aligned to collections | `defineJob` payloads typed from model IR |
| MCP connector | `@kwiva/mcp` tools from the IR |
| Postgres prod / SQLite dev | connector split in `src/config/database.ts` |

Questpie is a **reference, not a dependency**: no `@questpie/*` import exists anywhere in `@kwiva/*` or generated app code.
