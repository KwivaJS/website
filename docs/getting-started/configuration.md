# Configuration (/docs/getting-started/configuration)



# Configuration [#configuration]

Kwiva is typed-config-first: every behavior knob lives in `src/config/*.ts` as a section.

## Precedence [#precedence]

1. **Built-in defaults** (core): `app: {port: 3000, host: "localhost"}`, `logger: {level: "info", sink: "console"}`, `cache: {driver: "memory", prefix: "kwiva", defaultTtl: 60000, tags: true, swrGraceMs: 60000}`, `kv: {driver: "memory", namespace: "app", defaultTtl: 300000}`.
2. **Files** — `src/config/app.ts`, `database.ts`, `auth.ts`, `client.ts`, `jobs.ts`, `events.ts`, `mail.ts`, `storage.ts`, `mcp.ts`, `cache.ts`, `kv.ts`, `search.ts` — section name = filename.
3. **Environment overrides** — `SECTION_KEY` in upper-snake (`APP_PORT`, `DATABASE_URL`, `DATABASE_POOL_MAX`, `AUTH_SESSION_SECRET`, `MCP_ROUTE`).

## File form [#file-form]

```ts title="src/config/database.ts"
import { defineConfig } from "@kwiva/core";

export default defineConfig({
  driver: "pglite",
  // or "postgres" + url/host/port/username/password/pool
});
```

Sections whose `validate*` runs in `applyConfigSections` (boot seam): `auth`, `jobs`, `client`, `events`, `storage`, `mail`, `mcp`, `search`. `database` → `configureDatabase`.

## Key sections table [#key-sections-table]

| Section    | Owner   | Shape                                                                             |
| ---------- | ------- | --------------------------------------------------------------------------------- |
| `app`      | core    | `{name?, port?, host?}`                                                           |
| `logger`   | core    | `{level?, sink?}`                                                                 |
| `cache`    | core    | `{driver?, prefix?, defaultTtl?, tags?, swrGraceMs?}`                             |
| `kv`       | core    | `{driver?, namespace?, defaultTtl?}`                                              |
| `database` | data    | `DatabaseConfig{driver: "pglite"\|"postgres", url?, dataDir?, pool?}` + `tenancy` |
| `auth`     | auth    | `AuthConfig` (providers/session)                                                  |
| `client`   | client  | `ClientConfig{baseUrl, credentials?, fetch?, onError?}`                           |
| `jobs`     | jobs    | `JobsConfig{driver, defaultQueue?, concurrency?, scheduler?}`                     |
| `events`   | events  | `EventsConfig{driver?, prefix?}`                                                  |
| `mail`     | mail    | `MailConfig{transport?, from?}`                                                   |
| `storage`  | storage | `StorageConfig{default?, disks?, tenant?}`                                        |
| `mcp`      | mcp     | `McpConfig{enabled?, route?, transport?, auth?, models?, ...}`                    |
| `search`   | search  | `SearchConfig{engine: "postgres"}`                                                |

Environment variable names are derived by `envVarFor(section, keyPath)` — e.g. `client.baseUrl` → `CLIENT_BASE_URL`.

## Loading (from `@kwiva/core`) [#loading-from-kwivacore]

`loadConfig("src/config", root, env(), validators?)` → `Promise<ConfigDefinition>` (frozen). Validators run after merge; section `validateX` functions are invoked via `applyConfigSections`.
