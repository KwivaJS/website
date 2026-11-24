# Database Commands (/docs/cli/database-commands)



The database commands own the lifecycle between your models and your database. Kwiva's data layer is model-first: migrations are generated from model definitions rather than hand-written SQL in isolation. The CLI applies, reverts, seeds, inspects, and diffs that schema — and lets you push model changes straight to the database in development when migration files would be overkill.

## Full Reference [#full-reference]

| Command                       | Action                                                               |
| ----------------------------- | -------------------------------------------------------------------- |
| `kwiva db:migrate`            | Apply pending migrations                                             |
| `kwiva db:rollback --steps=n` | Revert the last `n` migrations                                       |
| `kwiva db:status`             | List applied and pending migrations                                  |
| `kwiva db:diff`               | Show the model-to-database diff proposal                             |
| `kwiva db:seed [--seeder]`    | Run seeders, optionally one                                          |
| `kwiva db:reset`              | Drop the database, migrate, seed                                     |
| `kwiva db:push`               | Push the model schema to the database without migration files (v1.x) |
| `kwiva db:browse`             | Open the data browser (v1.x)                                         |
| `kwiva db:studio`             | Open Studio against the generated model schema                       |

## The Model-First Model [#the-model-first-model]

The reason the command set looks the way it does is the data model's source of truth: your `defineModel` files. Migrations, factories, seeders, typed queries, and Studio screens all derive from the field DSL — so the schema you migrate is the schema you wrote as types.

```text title="the-model-first-model.txt"
defineModel('posts', ...) ──▶ migration (from model diff)
                          ──▶ typed client  (list/get/create/update/delete)
                          ──▶ Studio screens
                          ──▶ OpenAPI + MCP tool schemas
```

That is why `db:diff` exists: the database is always compared against the models, never treated as an independent artifact.

## Migrate and Rollback [#migrate-and-rollback]

```bash title="terminal"
kwiva db:migrate
kwiva db:rollback          # revert the most recent batch
kwiva db:rollback --steps=3
```

`kwiva db:migrate` applies every pending migration in `src/database/migrations/`. Because migrations are generated from model diffs, the sequence stays in lockstep with your `defineModel` definitions. `kwiva db:rollback` reverts the most recent batch, or `--steps=n` rolls back the last `n` migrations. The migrations table tracks what has been applied, so both commands operate on the exact current state — rollback knows precisely which batch it is undoing.

Migrations from installed modules participate in the same sequence: module migrations are ordered **before** application migrations and versioned by module version, so `db:migrate` applies the composed schema in one deterministic pass.

## Status and Diff [#status-and-diff]

```bash title="terminal"
kwiva db:status      # applied / pending table
kwiva db:diff        # model vs database — proposed changes
```

`kwiva db:status` shows which migrations have been applied and which are pending — the test before a deploy to check nothing is dangling. `kwiva db:diff` compares the live database against the model definitions and prints a diff proposal: the changes a new migration would capture. Its flow is write-model, preview-diff, accept:

1. Change a `defineModel` field, relation, index, or constraint.
2. Run `kwiva db:diff` and review the proposed schema change.
3. Apply via the normal migration path.

This diff-first discipline is what keeps the model the single source of truth. A schema change is always reviewed twice — once as a diff against the live database, once as the migration that captures it. See [Migrations](/docs/data/migrations).

## Seed and Reset [#seed-and-reset]

```bash title="terminal"
kwiva db:seed
kwiva db:seed --seeder=posts   # run one seeder
kwiva db:reset                 # drop → migrate → seed
```

`kwiva db:seed` runs the seeders in `src/database/seeders/` in their declared order. Seeders are idempotent by convention, so re-running them does not duplicate data. `--seeder` runs a single seeder in isolation — useful when you add one seeder to an existing database and only want its rows.

`kwiva db:reset` performs the full cycle — drop the database, re-apply migrations, re-seed — giving you a known-good state for fresh environments and CI runs. It is the "start over clean" command, which is exactly what makes it safe: it is explicit about destroying and rebuilding the entire schema. See [Seeders](/docs/data/seeders).

## Push: Model Straight to Database [#push-model-straight-to-database]

```bash title="terminal"
kwiva db:push      # v1.x
```

`db:push` synchronizes the database schema to match your model definitions without generating migration files. The model remains the source of truth — the database is brought to match it directly. This is the right tool in early development, where migrations would be pure churn and every field experiment would otherwise produce a migration file to delete. Once a schema stabilizes, switch to the migration path so the history is captured — `db:push` is a development tool, not a deployment path.

## Studio [#studio]

```bash title="terminal"
kwiva db:studio
```

`kwiva db:studio` opens Studio against the generated model schema — list, filter, create, edit, and delete screens derived from the model IR, with the same policy gating as the API. It is the operational view of what your models define: the same authorization that governs a request governs the Studio screen, so a role that cannot call the delete route cannot delete from Studio either. See [Studio](/docs/studio/).

## Configuration [#configuration]

Connections come from `src/config/database.ts` — driver, URL, pool, and migration table — with environment overrides validated at boot. The CLI reads the same config, so what `db:migrate` touches is exactly what the app connects to:

```ts title="src/config/database.ts"
// src/config/database.ts
export default defineConfig('database', {
  defaults: {
    driver: 'postgres',            // driver, URL, pool, migration table
    url: env('DATABASE_URL'),
  },
})
```

The environment mapping is declared here once; `DATABASE_URL` must exist before boot or the app fails fast with a table of what is missing. There is no second place where the connection is defined that could drift from what the CLI operates against. See [Database Configuration](/docs/data/database-config).

## Verify Before a Deploy [#verify-before-a-deploy]

A minimal pre-deploy sequence:

```bash title="terminal"
kwiva db:status        # confirm no unexpected pending migrations
kwiva db:diff          # confirm the schema matches your models
kwiva check            # confirm the exec/lint/format gate passes
```

`db:status` tells you nothing is dangling, `db:diff` tells you the live schema matches the models (or what a new migration would change), and `check` confirms the code that will use the schema is clean. Combine with the deployment pipeline for a schema that arrives in lockstep with the code that uses it. See [Deployment](/docs/deployment/).

## Common Workflows [#common-workflows]

* **A model has changed** — edit the field DSL, run `kwiva db:diff` to review, generate the migration, `kwiva db:migrate`.
* **Fresh environment or CI** — `kwiva db:reset` for a deterministic known-good database.
* **A seeder needs review** — `kwiva db:seed --seeder=<name>` to run it alone against existing data.
* **Early prototype, unstable schema** — `kwiva db:push` (v1.x) to sync without migration files until the shape settles.

## What's Next [#whats-next]

* [Migrations](/docs/data/migrations) — model-diff-driven SQL migrations
* [Seeders](/docs/data/seeders) — ordered, idempotent data seeding
* [Factories](/docs/data/factories) — model-aware factories for seeds and tests
* [Database Configuration](/docs/data/database-config) — connections, drivers, and pools
* [CLI](/docs/cli/) — the rest of the command surface
