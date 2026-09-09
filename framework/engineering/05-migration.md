# Engineering 05 — Migration & Upgrades

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

Two kinds of migration: **framework upgrades** (code) and **data migrations** (database). Both are first-class CLI operations.

## Framework upgrades

```bash
kwiva upgrade                 # detect version, plan, apply
kwiva upgrade --to 1.4.0      # target a specific version
kwiva upgrade --dry-run       # show planned codemods only
```

Flow:

```
read current version (package.json) → load release recipe(s)
→ oxc-transformer codemods (renames, API changes — AST-level, no regex)
→ dependency bumps (peer ranges)
→ kwiva check (lint + types) → report remaining manual steps
```

- Recipes are declarative AST transforms shipped per release (like React codemods, powered by the oxc transformer — ADR-0021).
- Anything not automatable is printed as a checklist with file:line pointers.
- Major versions: 2-major-version support window; codemods cover every breaking change where feasible.

## Data migrations

Beyond schema changes (which `db:diff` handles from model IR):

```ts
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

- Typed SQL escape hatch; parameterized; transactional by default.
- Large backfills: chunk with `db.chunk('posts', 1000, async rows => ...)`; pair with a `defineTask` for zero-downtime runs.

## Deploy-time migration strategy

| Scenario | Pattern |
|---|---|
| Additive (new table/column nullable) | migrate before deploy — old code compatible |
| Backfill | expand → task backfill → contract migration later |
| Destructive | double-write window → migrate consumers → drop in a later release |
| Rollback | `db:rollback --steps=n` for schema; data rollbacks via the migration's `down` |

Compatible-with-both-versions rule: releases that change routes/columns must run against both old/new shapes for one deploy cycle (standard practice; documented per recipe).

## Engine upgrades

- Engines (nitropack, drizzle-orm, better-auth, @tanstack/query) are peer-ranged; `kwiva upgrade` bumps them within range, tests run, breaking engine majors get their own release + recipes.
- oxc toolchain bumps are internal to the CLI (no app impact beyond performance).

## State of the art checklist (per release)

- [ ] codemod recipe written for every breaking change
- [ ] `upgrade --dry-run` output reviewed on the example app + dogfood apps
- [ ] migrations forward/backward tested (SQLite + Postgres)
- [ ] deprecation warnings ship one minor before removal
