# Database Configuration (/docs/data/database-config)



# Database Configuration [#database-configuration]

File: `src/config/database.ts`.

```ts
export default defineConfig({
  driver: "pglite",
  // or "postgres": url / host+port+database+username+password
  pool: { max: 10, idleTimeout: 60_000, connectionTimeout: 30_000 },
  tenancy: {
    defaults: { mode: "path", tenantField: "tenant_id", models: "*", cache: { scoped: true }, storage: { scoped: true } },
  },
});
```

## Drivers [#drivers]

* `"pglite"` — in-memory PGLite (dev/test). `dataDir` for file-backed.
* `"postgres"` — real Postgres; `url` (else `DATABASE_URL`/`PG*` env), or `host/port/database/username/password`.

## Pool [#pool]

`pool: {max?, idleTimeout?, connectionTimeout?, maxLifetime?}` — all optional.

## Tenancy [#tenancy]

`TenancyConfig.defaults` — `{mode, tenantField, models, cache.scoped, storage.scoped}`.

## CLI [#cli]

`kwiva db: ...`? No — migrations only: `kwiva migrate`, `kwiva migrate:status`, `kwiva migrate:down`, `kwiva migrate:generate`, `kwiva seed`.
