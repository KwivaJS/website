# Data 01 — Database

**Status**: Baseline (foundation/03 is the model spec) · **Updated**: 2026-09-08 · **Docset**: v0.3

Database lifecycle: connections, migrations, seeders, factories, and the runtime query plane. Engine: Drizzle (hidden) over Bun.sql/Postgres.

## Connections

```ts
// src/config/database.ts
export default defineConfig('database', {
  defaults: {
    driver: 'sqlite',                        // dev default
    url: 'sqlite://storage/database.db',
    pool: { max: 10, idleTimeout: 30_000 },
    logging: false,
  },
  env: { url: 'DATABASE_URL', driver: 'DB_DRIVER' },
})
```

- SQLite dev / Postgres prod (Questpie-influenced split).
- Multiple named connections (v1.x) + read replicas (v2).
- Query logging with trace correlation when `logging: true`.

## Migrations

```bash
kwiva make:model invoice        # model + migration + factory stub
kwiva db:diff                   # model IR vs live DB → proposed migration
kwiva db:migrate                # apply pending
kwiva db:rollback --steps=1
kwiva db:status                 # applied/pending
kwiva db:reset                  # drop + migrate + seed
```

```ts
// src/database/migrations/0001_create_posts.ts
import { defineMigration } from '@kwiva/data'

export default defineMigration({
  up:   (sql) => sql`create table posts (...)`,
  down: (sql) => sql`drop table posts`,
})
```

- Migrations are typed SQL-step files — generated from model diffs, hand-editable.
- Tenant-aware migrations (v1.x): per-tenant schema/table strategies from `src/config/tenancy.ts`.

## Seeders

```ts
// src/database/seeders/01-users.ts
import { defineSeeder } from '@kwiva/data'

export default defineSeeder('users', async ({ factory }) => {
  await factory(User).count(10).create()
  await factory(User).create({ email: 'admin@acme.dev', role: 'admin' })
})
```

Ordered by filename; `kwiva db:seed [--seeder=users]`; idempotency contract: safe to re-run (upsert-based defaults).

## Factories

```ts
import { defineFactory } from '@kwiva/data'

export const PostFactory = defineFactory(Post, (f) => ({
  title: f.fake(fake => fake.lorem.sentence()),
  status: f.pick('draft', 'published'),
  author: f.relation(User),
}))
```

- Used by tests and seeders — model-aware (respects required fields, enums, relations).
- `Post.factory().count(5).create()` runtime sugar.

## The query plane at runtime

Full builder documented in [foundation/03](../foundation/03-data-layer-models.md): where/join/select/limit/aggregate/groupBy/having/transaction/raw, relations (`with`, `withCount`), pagination, soft-delete, tenant scoping (injected, ADR-0015), audit fields, hooks.

## Transactions + outbox

```ts
await db.transaction(async (tx) => {
  const order = await Order.create(payload, { tx })
  await OrderPlaced.emit({ orderId: order.id }, { tx })   // outbox: delivered post-commit
})
```

Transactional events (v1.x outbox) prevent lost emits — see [data/03-queue-jobs](03-queue-jobs.md).

## Observability

- Every query: OTel span with SQL text (normalized), duration, rows.
- Slow-query log threshold in `src/config/telemetry.ts`.
- N+1 detection in dev: relation loads outside `with()` get flagged in the overlay (v1.x).
