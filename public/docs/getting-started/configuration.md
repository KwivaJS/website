# Configuration (/docs/getting-started/configuration)



Kwiva keeps configuration in exactly one place. Every setting your application cares about lives in the config folder — `src/config/*.ts` modules loaded through `kwiva.config.ts` — and every `defineX` factory accepts full inline options that override it. The result is a typed, discoverable configuration surface with a single precedence rule: **the more specific value wins**.

## The Precedence Model [#the-precedence-model]

Configuration is resolved low to high:

```plaintext title="the-precedence-model.txt"
defineConfig defaults  →  src/config/*.ts module values  →  defineX inline options  →  env (runtime overrides)
```

In practice this means:

1. **Defaults** come from each config module's `defaults` block
2. **The config folder** is the centralized home for every value
3. **Inline options** pass directly to `defineX` calls and win over the folder
4. **Environment variables** provide runtime overrides for deployment differences

Because types flow from each module's defaults and schema, there is no untyped config access anywhere in the system.

## The Entry File [#the-entry-file]

`kwiva.config.ts` at the project root is the build-time entry — it declares what to load, how to build, and how to deploy:

```ts title="kwiva.config.ts"
// kwiva.config.ts
import { defineConfig } from '@kwiva/config'

export default defineConfig({
  load: './src/config',          // the config folder
  deploy: { preset: 'node_server' },
  build: {
    // full inline build options (sourcemap, target, and friends)
  },
  modules: [],
})
```

`kwiva` reads this file for every command; the values set here are build-time concerns (deploy preset, module list, output options), while everything in `src/config/` is runtime configuration.

## The Config Folder [#the-config-folder]

Configuration lives in `src/config/` — one file per domain:

```plaintext title="the-config-folder.txt"
src/config/
├─ app.ts
├─ database.ts
├─ auth.ts
├─ session.ts
├─ api.ts
├─ queue.ts
├─ cache.ts
├─ storage.ts
├─ schedule.ts
├─ tenancy.ts
├─ cors.ts
├─ security.ts
├─ ui.ts
├─ telemetry.ts
└─ modules.ts
```

| Module         | Owns                                                  | Key keys (excerpt)                   |
| -------------- | ----------------------------------------------------- | ------------------------------------ |
| `app.ts`       | app identity, mode, middleware stack, timezone/locale | `name`, `env`, `url`, `middleware[]` |
| `database.ts`  | connections, pool, migrations                         | `driver`, `url`, `connections{}`     |
| `auth.ts`      | providers, session, password policy                   | `providers`, `session{}`             |
| `session.ts`   | session store + cookie shape                          | `driver`, `cookie{}`                 |
| `api.ts`       | API surface, versioning, rate limits, docs            | `prefix`, `rateLimit`, `docs`        |
| `queue.ts`     | connections, retries, dead-letter queue               | `driver`, `default`                  |
| `cache.ts`     | mounts, TTLs, tag strategy                            | `mounts{}`, `defaultTtl`             |
| `storage.ts`   | disks/drivers, signed URLs                            | `disks{}`                            |
| `schedule.ts`  | timezone, tasks cron table                            | `tz`, `tasks{}`                      |
| `tenancy.ts`   | mode, resolution, tenant field                        | `mode`, `tenantField`                |
| `cors.ts`      | CORS policy                                           | `origins`, `methods`, `headers`      |
| `security.ts`  | headers, CSP, CSRF                                    | `csp`, `csrf`                        |
| `ui.ts`        | renderer, theme, i18n                                 | `runtime`, `theme`                   |
| `telemetry.ts` | OTel exporters, sampling                              | `exporter`, `sampleRate`             |
| `modules.ts`   | module registry                                       | `modules[]`                          |

A `mail.ts` module for mailers is on the roadmap (v1.x).

## Defining a Config Module [#defining-a-config-module]

Each file uses `defineConfig` from `@kwiva/config`:

```ts title="src/config/database.ts"
// src/config/database.ts
import { defineConfig } from '@kwiva/config'

export default defineConfig('database', {
  defaults: {
    driver: 'sqlite',
    url: 'sqlite://storage/database.db',
    pool: { max: 10 },
    migrations: { table: 'kwiva_migrations' },
  },
  env: {
    url: 'DATABASE_URL',
    driver: 'DB_DRIVER',
  },
})
```

The `env` map declares which environment variables feed which keys — typed and validated at boot.

## Reading Configuration [#reading-configuration]

Use `config()` from `@kwiva/core` anywhere in your application. The key path is typed against the merged config:

```ts title="reading-configuration.ts"
import { config } from '@kwiva/core'

const url = config('database.url')         // typed: string
const pool = config('database.pool.max')   // typed: number
```

Typed environment access works the same way, restricted to variables declared in a module's `env` map:

```ts title="reading-configuration-2.ts"
import { env } from '@kwiva/core'

const dbUrl = env('DATABASE_URL')          // string — declared in database.ts
// env('NOT_DECLARED') → compile-time + boot-time error
```

Undeclared reads fail at compile time (ambient types) and at boot (validation) — so secrets and connection strings can't be silently typed as `any` or silently missing in production.

## Inline Overrides in `defineX` [#inline-overrides-in-definex]

Every `defineX` factory accepts full inline options, and inline always wins (the rule of thumb: the folder centralizes and defaults; inline tunes per-construct; nothing can be configured from a third place):

```ts title="inline-overrides-in-definex.ts"
export default defineModel('posts', (f) => ({ ... }), {
  cache: { ttl: 120, tags: ['posts'] },   // overrides src/config/cache.ts for this model
  rateLimit: { max: 100, per: 60 },       // overrides api defaults for generated routes
})

export default defineController('reports', (c) => ({ ... }), {
  prefix: '/reports',
  cors: { origins: ['https://acme.dev'] },  // inline beats folder
})

export default defineJob('cleanup', handler, {
  queue: 'maintenance',                     // routes to a queue in src/config/queue.ts
  attempts: 3,
})
```

## Environment Variables [#environment-variables]

The `.env` family provides runtime values: `.env` (always), `.env.local` (developer overrides, gitignored), `.env.example` (the committed template), and `.env.production` (loaded in production builds, never committed). A few conventions:

* `KWIVA_*` — framework-level knobs
* `KWIVA_PUBLIC_*` — safe to embed in client bundles, exposed via `env.public` from `@kwiva/react`
* `DATABASE_URL`, `REDIS_URL`, and similar — common service vars, mapped by their config modules
* Only `KWIVA_PUBLIC_*` flows to the client; referencing a non-public var from UI code is a lint error

Client-safe exposure is explicit and typed:

```tsx title="environment-variables.tsx"
// src/ui/** — only KWIVA_PUBLIC_* is legal here
import { env } from '@kwiva/react'

const apiUrl = env.public('KWIVA_PUBLIC_API_URL')
```

Environment modes follow the toolchain: `development` by default, `production` set by `kwiva build`, and `test` set by `kwiva test`. `config('app.env')` is the canonical read, and `NODE_ENV` maps onto it — so one read gives you the mode everywhere.

## Runtime vs Build-Time [#runtime-vs-build-time]

* **Build-time**: `kwiva.config.ts`, `build` options, `deploy.preset`, and the module list
* **Runtime**: everything in `src/config/` (overridable by env), snapshotted into the runtime config channel at deploy
* **Caching (v1.x)**: `kwiva config:cache` merges and snapshots the folder for near-zero cold-start config IO

## Anti-Patterns [#anti-patterns]

Kwiva deliberately rejects configuration that escapes the system:

* Config scattered across packages or `defineX` calls as the *primary* home — there is no single source of truth then
* Untyped `process.env` reads in app code — lint-gated
* `.env` values baked into client bundles — only `KWIVA_PUBLIC_*` is allowed

## What to Read Next [#what-to-read-next]

* [The defineX Convention](/docs/core-concepts/definex) — the pattern behind `defineConfig`
* [Configuration Model](/docs/core-concepts/configuration) — deep dive into config architecture
* [Development Server](/docs/getting-started/development-server) — how config and env load at boot
