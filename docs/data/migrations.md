# Migrations (/docs/data/migrations)



Migrations evolve your database schema over time. Kwiva's approach is diff-driven: `kwiva db:diff` compares the model IR against the live database and proposes a migration; `kwiva db:migrate` applies pending migrations forward; `kwiva db:rollback` reverses them. Every migration is a **typed, hand-editable SQL-step file** — generated where possible, authored freely when a change is too nuanced for a diff.

## The Workflow [#the-workflow]

```bash title="terminal"
kwiva make:model invoice    # model + migration + factory stub
kwiva db:diff               # model IR vs live DB → migration proposal
kwiva db:migrate            # apply pending
kwiva db:rollback --steps=1 # reverse the last N applied
kwiva db:status             # applied vs pending
kwiva db:reset              # drop + migrate + seed
```

| Command                       | Purpose                                                          |
| ----------------------------- | ---------------------------------------------------------------- |
| `kwiva make:model invoice`    | Scaffold a model, its initial migration, and a factory stub      |
| `kwiva db:diff`               | Compute the delta between schema and live database as a proposal |
| `kwiva db:migrate`            | Apply pending migrations in order                                |
| `kwiva db:rollback --steps=n` | Reverse the last `n` migrations via their `down` steps           |
| `kwiva db:status`             | Report applied and pending migrations                            |
| `kwiva db:reset`              | Drop all objects, re-migrate, re-seed — destructive, dev only    |
| `kwiva db:browse`             | Interactive data browser (`v1.x`)                                |

## Defining a Migration [#defining-a-migration]

A migration is a pair of typed SQL steps:

```ts title="src/database/migrations/0001_create_posts.ts"
// src/database/migrations/0001_create_posts.ts
import { defineMigration } from '@kwiva/data'

export default defineMigration({
  up:   (sql) => sql`create table posts (...)`,
  down: (sql) => sql`drop table posts`,
})
```

| Shape  | Meaning                                                                     |
| ------ | --------------------------------------------------------------------------- |
| `up`   | The forward step, applied by `db:migrate`                                   |
| `down` | The reverse step, applied by `db:rollback`                                  |
| `sql`  | A typed template-literal helper with parameterization and dialect awareness |

The `sql` tag typechecks the statement and keeps the migration dialect-correct for the configured driver, so the same file shape works on the SQLite dev database and the Postgres production database.

> \[!NOTE]
> Diff-generated migrations are complete but generic. Hand-editing is expected: rename with the data preserved, backfill columns, rewrite a constraint — the file is yours after generation.

## Generated Migrations and Model Diffs [#generated-migrations-and-model-diffs]

When a model changes, `kwiva db:diff` inspects what changed — a new field, a dropped field, an index, a unique constraint, a soft-delete flag — and writes a proposal migration. Accept it, review it, and it becomes the next numbered file. This keeps the model file as the source of truth and the migration files as the auditable changelog.

## Numbering and Application Order [#numbering-and-application-order]

Migration files are numbered (`0001_`, `0002_`) and applied in **lexicographic order**. `db:status` reads both the file list and a tracking table, so:

| State       | Meaning                                                            |
| ----------- | ------------------------------------------------------------------ |
| Applied     | The migration exists in the tracking table and matches its file    |
| Pending     | A file exists that has not been applied                            |
| Rolled back | A migration was reversed by `db:rollback` and can be applied again |

Idempotency is a property of the tracking step, not of the SQL: `db:migrate` applies only pending files, so running it twice is a no-op; re-applying a rolled-back migration runs only its `up` again.

## Editing Generated Migrations [#editing-generated-migrations]

Diff-generated migrations are complete but generic, and hand-editing is expected. The two guards are:

* `up` then `down` must restore the prior state — the reversibility contract.
* Columns that carry existing data need data-preserving statements (backfill before type change, rename rather than drop-and-recreate).

A common edit is renaming a column: the diff proposes drop-and-add, but the data-preserving version is `ALTER TABLE ... RENAME COLUMN` followed by the new definition. Write it in the `sql` template, review the diff, migrate.

## Data Migrations (Backfills) [#data-migrations-backfills]

Schema changes are only half the job. Data migrations run arbitrary typed SQL against the live database:

```ts title="src/database/migrations/0007_backfill_post_slugs.ts"
// src/database/migrations/0007_backfill_post_slugs.ts
import { defineMigration } from '@kwiva/data'

export default defineMigration({
  up: async ({ db, logger }) => {
    const posts = await db.raw<Post>('select id, title from posts where slug is null')
    for (const p of posts) {
      await db.execute('update posts set slug = $1 where id = $2', [slugify(p.title), p.id])
    }
    logger.info({ updated: posts.length }, 'backfilled slugs')
  },
  down: async ({ db }) => {
    await db.execute('update posts set slug = null')
  },
})
```

| Capability      | Detail                                                                           |
| --------------- | -------------------------------------------------------------------------------- |
| `db.raw`        | Typed read against the live database                                             |
| `db.execute`    | Parameterized write (never interpolate values)                                   |
| `db.chunk`      | `db.chunk('posts', 1000, async (rows) => ...)` — process large tables in batches |
| `logger`        | Structured logging in the migration context                                      |
| Default wrapper | Migrations run transactionally; a failure rolls back the step                    |

For very large backfills, chunk with `db.chunk` and pair the migration with a scheduled task for zero-downtime runs — see [Background Work: Scheduling](/docs/background-work/scheduling).

## Reversible by Default [#reversible-by-default]

Every migration carries a `down` step so rollbacks are real operations, not fiction. `db:rollback --steps=1` reverses schema via `down`; `db:reset` is a full drop-and-rerun for development. The contract: `up` then `down` must restore the previous state, which is why hand-written backfills include both directions.

## Deploy-Time Strategy [#deploy-time-strategy]

Schema changes land with the release, not after it. The supported patterns:

| Scenario                              | Pattern                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| Additive (new table, nullable column) | Migrate **before** deploy — old code stays compatible                          |
| Backfill                              | Expand columns → backfill via task → tighten contract in a later release       |
| Destructive (drop column/table)       | Double-write window → migrate consumers → drop in a later release              |
| Rollback                              | `db:rollback --steps=n` for schema; data rollbacks via each migration's `down` |

Releases that change routes or columns must run against both old and new shapes for one deploy cycle — the compatibility window documented per release. The same discipline applies to the framework's own engine upgrades, where migration is a first-class CLI operation. See [Advanced: Architecture Internals](/docs/advanced/architecture-internals) and [Deployment: Production Checklist](/docs/deployment/production-checklist) for the surrounding release process.

## Tenant-Aware Migrations [#tenant-aware-migrations]

Multi-tenant schemas sometimes need per-tenant strategies — shared tables with a tenant column (the default), or per-tenant schema/table layouts for compliance-heavy cases. Tenant-aware migration modes are configured in `src/config/tenancy.ts` and are `v1.x`. Until then, tenant-scoped models use row-level tenancy with a single shared schema. See [Tenancy](/docs/tenancy).

## What's Next [#whats-next]

1. [Models](/docs/data/models) — the model IR that `db:diff` compares against
2. [Database Config](/docs/data/database-config) — drivers, connections, and pools migrations run on
3. [Seeders](/docs/data/seeders) — what `db:reset` runs after migrating
4. [CLI: Database Commands](/docs/cli/database-commands) — every migration-related flag
