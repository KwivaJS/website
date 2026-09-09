# Application 03 — Configuration

**Status**: Locked (ADR-0012, ADR-0020) · **Updated**: 2026-09-08 · **Docset**: v0.3

**All configuration lives in the config folder**: `src/config/*.ts` modules loaded through `kwiva.config.ts`. Every `defineX` factory also accepts **full inline config**, and inline wins.

## Precedence (low → high)

```
defineConfig defaults  →  src/config/*.ts module values  →  defineX inline options  →  env (runtime overrides)
```

## The entry file

```ts
// kwiva.config.ts
import { defineConfig } from '@kwiva/config'

export default defineConfig({
  load: './src/config',          // the config folder
  deploy: { preset: 'node_server' },
  build: {                       // full inline rolldown options (ADR-0021 escape hatch)
    // sourcemap: true, target: 'es2022', ...
  },
  modules: [],
})
```

## A config module

```ts
// src/config/database.ts
import { defineConfig } from '@kwiva/config'

export default defineConfig('database', {
  defaults: {
    driver: 'sqlite',
    url: 'sqlite://storage/database.db',
    pool: { max: 10 },
    migrations: { table: 'kwiva_migrations' },
  },
  env: {                          // env var → config key mapping (typed + validated)
    url: 'DATABASE_URL',
    driver: 'DB_DRIVER',
  },
})
```

## The full config folder

| Module | Owns | Key keys (excerpt) |
|---|---|---|
| `app.ts` | app identity, mode, middleware stack, timezone/locale | `name`, `env`, `url`, `middleware[]` |
| `database.ts` | connections, pool, migrations | `driver`, `url`, `connections{}` |
| `auth.ts` | providers, session, password policy | `providers`, `session{}` |
| `session.ts` | session store + cookie shape | `driver`, `cookie{}` |
| `api.ts` | API surface, versioning, rate limits, docs | `prefix`, `rateLimit`, `docs` |
| `queue.ts` | connections, retries, DLQ | `driver` (redis/db), `default` |
| `cache.ts` | mounts, TTLs, tag strategy | `mounts{}`, `defaultTtl` |
| `storage.ts` | disks/drivers, signed URLs | `disks{ local, s3 }` |
| `schedule.ts` | timezone, tasks cron table | `tz`, `tasks{}` |
| `tenancy.ts` | mode, resolution, tenant field | `mode`, `tenantField` |
| `cors.ts` | CORS policy | `origins`, `methods`, `headers` |
| `security.ts` | headers, CSP, CSRF | `csp`, `csrf` |
| `ui.ts` | renderer (react/preact), theme, i18n | `runtime`, `theme` |
| `telemetry.ts` | OTel exporters, sampling | `exporter`, `sampleRate` |
| `modules.ts` | module registry | `modules[]` |
| `mail.ts` (v1.x) | mailers, from-address | `mailers{}` |

## Reading config anywhere

```ts
import { config } from '@kwiva/core'

const url = config('database.url')        // typed: string
const pool = config('database.pool.max')  // typed: number
```

Types flow from each module's `defaults` + schema — no `any` config.

## Inline overrides in `defineX` (full inline allowed — ADR-0020)

```ts
export default defineModel('posts', (f) => ({ ... }), {
  cache: { ttl: 120, tags: ['posts'] },       // overrides src/config/cache.ts defaults for this model
  rateLimit: { max: 100, per: 60 },           // overrides api defaults for generated routes
})

export default defineController('reports', (c) => ({ ... }), {
  prefix: '/reports',
  cors: { origins: ['https://acme.dev'] },    // inline beats folder
})

export default defineJob('cleanup', handler, {
  queue: 'maintenance',                       // routes to a queue declared in src/config/queue.ts
  attempts: 3,
})
```

Rule of thumb: the folder centralizes and defaults; inline tunes per-construct. Nothing can be configured from a third place.

## Typed env access

```ts
import { env } from '@kwiva/core'

const dbUrl = env('DATABASE_URL')            // declared in a module's `env` map — string
// env('NOT_DECLARED') → compile-time + boot-time error
```

Env is validated at boot; fail-fast with a table of missing vars.

## Runtime vs build-time

- Build-time: `kwiva.config.ts`, `build`, `deploy.preset`, module list.
- Runtime: everything in `src/config/` (overridable by env) — snapshotted into the Nitro runtime config channel.
- `kwiva config:cache` (v1.x): merges + snapshots the folder for zero-IO cold starts.

## Anti-patterns (rejected)

- Config scattered across packages/defineX as the primary home — no single source of truth.
- Untyped `process.env` reads in app code — lint-gated.
- `.env` values baked into client bundles — only `KWIVA_PUBLIC_*` flow to the client.
