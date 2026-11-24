# Public API Inventory (/docs/research/public-api-inventory)



# Public API Inventory [#public-api-inventory]

**Per-package inventories, generated from the Kwiva framework repo source (`packages/*` at `552115f`).** This is the source of truth: every documented signature below exists in the code.

***

## 1. Package map (19 packages) [#1-package-map-19-packages]

| Package                   | Version | Description                                                                                                |
| ------------------------- | ------: | ---------------------------------------------------------------------------------------------------------- |
| `@kwiva/core`             |   0.2.0 | Kwiva — defineApp, defineConfig, loadConfig, context, logger, errors, model IR, cache, kv, store.          |
| `@kwiva/data`             |   0.2.0 | Kwiva — defineModel, fluent typed query builder, migrations, seeders, factories, db runtime, Postgres FTS. |
| `@kwiva/http`             |   0.2.0 | Kwiva — Elysia server, route engine, pipeline, WebSocket, OpenAPI.                                         |
| `@kwiva/ui`               |   0.2.0 | Kwiva — definePage, layout resolution, SSR, hydration, islands, navigation, SEO helpers, `./server`.       |
| `@kwiva/client`           |   0.2.0 | Kwiva — config-built client, typed reads/mutations/upload hooks, cache, token refresh, WS.                 |
| `@kwiva/auth`             |   0.2.0 | Kwiva — sessions, `requireAuth`, `definePolicy`, identity flows, controllers.                              |
| `@kwiva/jobs`             |   0.2.0 | Kwiva — `defineJob`/`defineTask`, dispatch, workers, scheduler, outbox, metrics.                           |
| `@kwiva/events`           |   0.2.0 | Kwiva — `defineEvent`, pub/sub, queued listeners, broadcast, outbox, fakes.                                |
| `@kwiva/mail`             |   0.2.0 | Kwiva — `defineMail`, transports (memory/console/smtp/resend), templates, config.                          |
| `@kwiva/mcp`              |   0.1.0 | Kwiva — MCP v2, model/controller tool generation, server handler, stdio, in-process client.                |
| `@kwiva/search`           |   0.1.0 | Kwiva — config validation, Postgres FTS, federated `searchAcross`.                                         |
| `@kwiva/storage`          |   0.1.0 | Kwiva — files-sdk disks API, uploads, signed URLs, assets, fakes, errors.                                  |
| `@kwiva/testing`          |   0.1.0 | Kwiva — `withApp` boot, in-process test client, DB lifecycle, `./boot`.                                    |
| `@kwiva/cli`              |   0.3.0 | Kwiva — `kwiva` binary: dev/build/test/migrate/seed/make:\*/`defineCommand`.                               |
| `@kwiva/auth-better-auth` |   0.0.1 | Kwiva — sealed Better Auth identity provider, `./server`.                                                  |
| `@kwiva/mail-smtp`        |   0.0.1 | Kwiva — SMTP (Nodemailer) transport.                                                                       |
| `@kwiva/mail-resend`      |   0.0.1 | Kwiva — Resend API transport.                                                                              |
| `@kwiva/jobs-pg-boss`     |   0.0.1 | Kwiva — opt-in pg-boss queue transport.                                                                    |
| `@kwiva/store-redis`      |   0.0.1 | Kwiva — opt-in Redis StoreDriver adapter.                                                                  |

All are `"type": "module"`, publish `dist/*`, engines `bun >= 1.4.0`.

### Exports map (subpath → target) [#exports-map-subpath--target]

| Package                                                            | Subpath           | Target                                     |
| ------------------------------------------------------------------ | ----------------- | ------------------------------------------ |
| `@kwiva/core`                                                      | `.`               | `./src/index.ts` (bun) / `./dist/index.js` |
| `@kwiva/core`                                                      | `./helpers`       | `src/helpers/index.ts`                     |
| `@kwiva/core`                                                      | `./collection`    | `src/collection/index.ts`                  |
| `@kwiva/core`                                                      | `./guards`        | `src/guards.ts`                            |
| `@kwiva/core`                                                      | `./html`          | `src/html.ts`                              |
| `@kwiva/data`                                                      | `.` + `./testing` | `src/index.ts` + `src/tests/index.ts`      |
| `@kwiva/http`                                                      | `.`               | `src/index.ts`                             |
| `@kwiva/auth`                                                      | `.`               | `src/index.ts`                             |
| `@kwiva/client`                                                    | `.`               | `src/index.ts`                             |
| `@kwiva/ui`                                                        | `.` + `./server`  | `src/index.ts` + `src/server.ts`           |
| `@kwiva/jobs`                                                      | `.`               | `src/index.ts`                             |
| `@kwiva/events`                                                    | `.`               | `src/index.ts`                             |
| `@kwiva/mail`                                                      | `.`               | `src/index.ts`                             |
| `@kwiva/mcp`                                                       | `.` + `./server`  | `src/index.ts` + `src/server/index.ts`     |
| `@kwiva/search`                                                    | `.`               | `src/index.ts`                             |
| `@kwiva/storage`                                                   | `.`               | `src/index.ts`                             |
| `@kwiva/testing`                                                   | `.` + `./boot`    | `src/index.ts` + `src/boot/index.ts`       |
| `@kwiva/cli`                                                       | `.`               | `src/index.ts`                             |
| `@kwiva/auth-better-auth`                                          | `.` + `./server`  | `src/index.ts` + `src/server/index.ts`     |
| others (`mail-smtp`, `mail-resend`, `jobs-pg-boss`, `store-redis`) | `.`               | `src/index.ts`                             |

***

## 2. `@kwiva/core` (v0.2.0) — `./helpers`, `./collection`, `./guards`, `./html` [#2-kwivacore-v020--helpers-collection-guards-html]

### App domain (`./app`) [#app-domain-app]

| Symbol                                                                                                                                                                                                                                                                   | Kind      | Signature                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineApp(options)`                                                                                                                                                                                                                                                     | function  | `(options: AppDefinition): AppDefinition` — `{name, models?, controllers?, middleware?, services?, policies?, pages?, jobs?, events?, commands?, macros?, state?, decorate?, resolve?}`; additive arrays |
| `assembleApp(app, root?)`                                                                                                                                                                                                                                                | function  | `Promise<UnitRegistry>`                                                                                                                                                                                  |
| `defineService(factory)`                                                                                                                                                                                                                                                 | function  | `(factory: (ctx: {context: AppContext}) => T) => ServiceFactory<T>`                                                                                                                                      |
| `instantiateServices(factories, app)`                                                                                                                                                                                                                                    | function  | `(factories, app) => Record<string, unknown>`                                                                                                                                                            |
| `discoverUnits(root)` / `discoverKind(root, kind)`                                                                                                                                                                                                                       | functions | `Promise<UnitRegistry>` / `Promise<RegisteredUnit[]>`                                                                                                                                                    |
| `derivePageRoute(rel)`                                                                                                                                                                                                                                                   | function  | `(rel: string) => string` — `index.tsx`→dir root, `$param`→`:param`, `$`→`*`                                                                                                                             |
| `DEFAULT_FOLDERS`                                                                                                                                                                                                                                                        | const     | `Record<UnitKind, string>` — see feature inventory                                                                                                                                                       |
| Types: `AppDefinition, ModelUnit, ServiceDefinition, PolicyDefinition, ControllerDefinition, MiddlewareDefinition, JobDefinition, EventDefinition, TaskDefinition, CommandDefinition, PageDefinition, MacroDefinition, Resolver, UnitKind, RegisteredUnit, UnitRegistry` | types     | —                                                                                                                                                                                                        |

### Async domain (`./async`) [#async-domain-async]

| Symbol                                             | Kind      | Signature                                      |
| -------------------------------------------------- | --------- | ---------------------------------------------- |
| `afterResponse(task)`                              | function  | `(task: () => void \| Promise<void>) => void`  |
| `flushAfterResponse()` / `hasAfterResponseScope()` | functions | —                                              |
| `runWithAfterResponse(fn)`                         | function  | `<T>(fn: () => Promise<T> \| T) => Promise<T>` |
| Type: `AfterResponseTask`                          | type      | `() => void \| Promise<void>`                  |

### Cache domain (`./cache`) — ADR-0019 [#cache-domain-cache--adr-0019]

| Symbol                                                    | Kind      | Signature                                                                                                                                |
| --------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `class Cache`                                             | class     | `constructor(driver, config?)`; `get(key)`, `set(key, value, opts?)`, `delete(key)`, `wrap(key, factory, opts?)`, `invalidateTags(tags)` |
| `initCache(config?)` / `getCache()` / `resetCache()`      | functions | —                                                                                                                                        |
| Types: `CacheSetOptions{ttl?, tags?}`, `CacheWrapOptions` | types     | —                                                                                                                                        |

### Collection domain (`./collection`) — ADR-0023 [#collection-domain-collection--adr-0023]

| Symbol                | Kind     | Signature                                                                                                                                                                                                                             |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `class Collection<T>` | class    | `constructor(items: T[])`; `.items`, `.size`; statics `of/fromJson/times/range`; many methods (`all/toArray/toJson/first/last/sole/where/groupBy/keyBy/pluck/chunk/sliding/unique/diff/sortBy/tap/pipe/dot/undot/collapse/pad/range`) |
| `collect(items?)`     | function | —                                                                                                                                                                                                                                     |

### Config domain (`./config`) [#config-domain-config]

| Symbol                                                                                                                                             | Kind     | Signature                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `defineConfig<T>(section): T`                                                                                                                      | function | pass-through validator                                                                   |
| `loadConfig(dir?, root?, env?, validators?)`                                                                                                       | function | `Promise<ConfigDefinition>` — discovers `src/config/*.ts`, merges defaults → files → env |
| `envVarFor(section, keyPath)`                                                                                                                      | function | `(section, keyPath) => string`                                                           |
| Types: `AppConfig{name?, port?, host?}`, `LoggerConfig{level?, sink?}`, `ConfigDefinition{app?, logger?, cache?, kv?, [section: string]: unknown}` | types    | —                                                                                        |

### Context domain (`./context`) [#context-domain-context]

| Symbol                                                                                                                              | Kind      | Signature                                                |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------- |
| `createAppContext(...)`, `createContext(request, app)`                                                                              | functions | —                                                        |
| `runWithAuth(scope, fn)` / `currentAuth()`                                                                                          | functions | ALS scope `{user: User \| null \| undefined, policies?}` |
| `stashAuthScope(ctx, scope)` / `authScopeOf(ctx)`                                                                                   | functions | `authScopeKey = Symbol.for("kwiva.authScope")`           |
| `runWithRequest(req, fn)` / `currentRequest()`                                                                                      | functions | ALS twin                                                 |
| `runWithBatch({batchId}, fn)` / `currentBatchId()`                                                                                  | functions | ALS                                                      |
| `runWithTenant({tenantId}, fn)` / `currentTenant()` / `tenantPrefix()`                                                              | functions | ALS                                                      |
| `runInTransaction(id, fn)` / `currentTransaction()` / `currentTransactionId()`                                                      | functions | ALS                                                      |
| `onTransactionCommit(cb)` / `onTransactionRollback(cb)` / `flushTransactionCommit(onError?)` / `flushTransactionRollback(onError?)` | functions | —                                                        |
| Types: `AppContext, RequestContext, RequestContextWith<T>, Session{id, userId, expiresAt, remember?}, User{id}`                     | types     | —                                                        |

### Errors domain (`./errors`) — 8-code taxonomy [#errors-domain-errors--8-code-taxonomy]

| Symbol                                                                                                                                                                      | Kind     | Signature                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------- |
| `class KwivaError`                                                                                                                                                          | class    | `(code: ErrorCode, message, options?: KwivaErrorOptions)` |
| `NotFoundError, ForbiddenError, UnauthorizedError, ConflictError, ValidationError, RateLimitedError`                                                                        | classes  | —                                                         |
| `error(code, message, data?)`                                                                                                                                               | function | → `KwivaError`                                            |
| Types: `ErrorCode` (`BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, VALIDATION, RATE_LIMITED, STORAGE_*, SEARCH_NOT_CONFIGURED, INTERNAL`), `KwivaErrorOptions` | types    | —                                                         |

### Helpers domain (`./helpers`) — Laravel-shaped (ADR-0023) [#helpers-domain-helpers--laravel-shaped-adr-0023]

| Symbol                                                                                                              | Kind      | Signature                                    |
| ------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------- |
| `blank/filled/value/withValue/tap/transform/when/retry/throwIf/throwUnless/rescue`                                  | functions | HTTP-status mapping via `CODE_MAP`           |
| `abort/abortIf/abortUnless`                                                                                         | functions | status codes 400/401/403/404/409/422/429/500 |
| `auth()`                                                                                                            | function  | ambient (ALS)                                |
| `config(path?, default?)`                                                                                           | function  | ALS config                                   |
| `env(key, default?, options?)`                                                                                      | function  | `EnvOptions`                                 |
| `now()` / `today()`                                                                                                 | functions | —                                            |
| `provideConfig(config, fn)`                                                                                         | function  | ALS run                                      |
| `dump(...)` / `dd(...)` / `info(msg, data?)` / `logger(msg, data?)`                                                 | functions | evlog-routed; `DumpError`                    |
| `parsePath/walkPath/getPath/setPath/hasPath/forgetPath/dataGet/dataSet/dataFill/dataForget/dataHas/head/last`       | functions | dot paths with `*`/`{first}`/`{last}`        |
| Types: `Path = string \| readonly (string\|number)[]`, `PathSegment{key, kind: "key"\|"wildcard"\|"first"\|"last"}` | types     | —                                            |

### KV domain (`./kv`) — ADR-0019 [#kv-domain-kv--adr-0019]

| Symbol                                      | Kind      | Signature                                                                                            |
| ------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `class Kv`                                  | class     | `constructor(driver, config?)`; `get/set/delete/has/clear/namespace(name)/qualifyNamespace(ns, key)` |
| `class KvView`                              | class     | namespaced facade                                                                                    |
| `initKv(config?)` / `getKv()` / `resetKv()` | functions | —                                                                                                    |
| Type: `KvSetOptions{ttl?}`                  | type      | —                                                                                                    |

### Logger domain (`./logger`) [#logger-domain-logger]

| Symbol                                                      | Kind      | Signature                                                        |
| ----------------------------------------------------------- | --------- | ---------------------------------------------------------------- |
| `class Logger`                                              | class     | interface-ish (`info/warn/error(msg, data?)`, `child(bindings)`) |
| `createLogger(options?)` / `createContextLogger(requestId)` | functions | evlog-backed                                                     |
| Type: `LoggerOptions{level?}`                               | type      | —                                                                |

### Model IR domain (`./model`) [#model-ir-domain-model]

Types only (frozen at runtime):

| Symbol                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Kind     | Signature |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------- |
| `MODEL_IR_VERSION`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | const    | `1`       |
| Types: `ModelDefinition{irVersion, fields, relations, indexes, options, hooks, scopes}`, `FieldDefinition{name, column, kind, nullable, hasDefault, default?, unique, indexed, primaryKey, enumValues?, description?}`, `RelationDefinition{name, type, target, nullable, through?, foreignKey?, localKey?, onDelete?, throughModel?, morphName?, firstKey?, secondKey?}`, `IndexDefinition{columns, unique, name?}`, `HookDefinition{name: ModelHook}`, `ScopeDefinition{name}`, `FieldKind` (id, uuid, string, text, integer, bigint, float, boolean, date, time, dateTime, enum, json), `RelationKind` (belongsTo, hasOne, hasMany, manyToMany, hasOneThrough, hasManyThrough, morphTo, morphMany, morphToMany), `OnDeleteAction`, `ModelOptions{timestamps, softDelete, audit, tenantField?, permission?, fillable?, guarded?, hidden?, visible?, appends?, computed?, uniques?, routes, primaryKey?, search?}`, `ModelSearchOptions{fields, language?}`, `ModelSearchField{field, weight?}`, `SearchWeight` ("A"\|"B"\|"C"\|"D"), `SEARCH_LANGUAGE_PATTERN` | types    | —         |
| `toSnakeCase(name)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | function | —         |

### Store domain (`./store`) — sealed StoreDriver seam [#store-domain-store--sealed-storedriver-seam]

| Symbol                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Kind      | Signature                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| `class KeyvStore`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | class     | `constructor(config: KeyvStoreConfig, purpose)`; `get/set/delete/has/clear/keys/disconnect` |
| `createKeyvDriver(config?, purpose?)` / `createStore(config?, purpose?)` / `registerStoreDriver(name, factory)` / `unregisterStoreDriver(name)`                                                                                                                                                                                                                                                                                                                                                                                                                                                | functions | —                                                                                           |
| `serializeValue/deserializeValue`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | functions | —                                                                                           |
| Types: `StoreDriver{get/set/delete/has/clear/keys}`, `StoreEntry{value, expiresAt?}`, `StoreDriverName` ("memory"\|"file"\|"sqlite"\|"redis"\|"postgres"), `CacheConfig{driver?, prefix?, defaultTtl?, tags?, file?, url?, swrGraceMs?, waitUntil?}`, `KvConfig{driver?, namespace?, defaultTtl?, file?, url?}`, `DEFAULT_CACHE_CONFIG{driver:"memory", prefix:"kwiva", defaultTtl:60000, tags:true, file:{dir:"./var/cache"}, swrGraceMs:60000}`, `DEFAULT_KV_CONFIG{driver:"memory", namespace:"app", defaultTtl:300000, file:{dir:"./var/kv"}}`, `StoreDriverFactory`, `StoreSectionConfig` | types     | —                                                                                           |

### Standard Schema domain (`./standard-schema`) [#standard-schema-domain-standard-schema]

| Symbol                                                                 | Kind       | Signature                     |
| ---------------------------------------------------------------------- | ---------- | ----------------------------- |
| `validateStandard<T>(schema, value)`                                   | function   | → `StandardResult<T>`         |
| `issuesToFields(issues)`                                               | function   | → `Record<string, string[]>`  |
| `getDotPath`, `SchemaError`                                            | re-exports | from `@standard-schema/utils` |
| Types: `StandardIssue`, `StandardResult<T>`, `StandardSchema<TOutput>` | types      | —                             |

### Subpath exports [#subpath-exports]

| Subpath    | Symbol                                              |
| ---------- | --------------------------------------------------- |
| `./guards` | `isRecord(value): value is Record<string, unknown>` |
| `./html`   | `escapeHtml(value: string): string`                 |

**Not exported:** `pagination.ts` internals (`parsePagination`, `DEFAULT_PER_PAGE=20`, `MAX_PER_PAGE=100`) — HTTP/data seam.

***

## 3. `@kwiva/data` (v0.2.0) — `.` + `./testing` [#3-kwivadata-v020----testing]

### Model domain [#model-domain]

| Symbol                                                                                         | Kind      | Signature                                                                          |
| ---------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------- |
| `defineModel<F, O>(factory: (f: FieldsApi) => F, options?)`                                    | function  | → `Model<SystemFields<F,O>, ScopeMapOf<F,O>>`                                      |
| `boundOf(model)`                                                                               | function  | → `BoundModel \| undefined` (caches per model)                                     |
| `registerModel(name, model)` / `resolveModel(name)` / `registeredModels()` / `resetRegistry()` | functions | exact + case-insensitive registry; `tableFor(name) = toSnakeCase(pluralize(name))` |
| `onModelEvent(handler)` / `clearModelEventHandlers()`                                          | functions | global observers; `onModelEvent` returns unsubscribe                               |

### Fields DSL (`FieldsApi` on the `f` factory argument) [#fields-dsl-fieldsapi-on-the-f-factory-argument]

`id, uuid, string, text, integer, bigint, float, boolean, date, dateTime, time, enum(...values), json<T>, belongsTo, hasOne, hasMany, manyToMany, hasOneThrough, hasManyThrough, morphTo, morphMany, morphToMany` — each returns a `FieldBuilder`/`RelationBuilder`.

### Query domain [#query-domain]

| Symbol                                     | Kind      | Signature                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `QueryBuilder<F,R>`                        | class     | fluent: `where/orWhere/whereIn/whereNotIn/whereNull/whereNotNull/whereBetween/whereLike/search/orderBy/limit/offset/select/distinct/with/withTrashed/onlyTrashed/tenant/scope/withoutGlobalScopes/whereRecord` + relation predicates `has/orHas/whereHas/orWhereHas/whereDoesntHave/orWhereDoesntHave/withCount/withAggregate` + terminals `all/get/first/firstOrFail/find/findOrFail/findMany/firstOrCreate/firstOrNew/updateOrCreate/create/insert/destroy/count/exists/value/chunk/chunkById/lazy/cursor/max/sum/avg/pluck` |
| `createRepository(bound)`                  | function  | → `Repository<F>{find(opts?), get(id), getOrFail(id), create, update, remove, transaction}`                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `restRoutes(model)` / `restBasePath(name)` | functions | 5 REST specs per model (list/get/create/update/remove); path = `/api/{plural}`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### Instance domain (public API on model instances) [#instance-domain-public-api-on-model-instances]

`save/update/delete/forceDelete/restore: Promise<...>`, `refresh(): Promise<this>`, `replicate(except?)`, `loadMissing(rel)`, `associate(rel, id\|null)/dissociate(rel)`, `trashed`, `isDirty/isClean/wasChanged/getOriginal(field?)`, `toJSON()`, typed relation handles, `InstanceRow` type. Internal impl: `InstanceBase` prototype.

### Migrations domain [#migrations-domain]

| Symbol                                                                                                                                                                                                                                                                                                            | Kind      | Signature                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------ |
| `defineMigration(name, up, down?)`                                                                                                                                                                                                                                                                                | function  | → `Migration`                                          |
| `migrate(migrations, db?)`                                                                                                                                                                                                                                                                                        | function  | per-file tx; `kwiva_migrations` ledger; batch tracking |
| `migrateStatus(migrations, db?)`                                                                                                                                                                                                                                                                                  | function  | → `{applied, pending}`                                 |
| `migrateDown(migrations, db?)`                                                                                                                                                                                                                                                                                    | function  | rolls back last batch; migrations without `down` throw |
| `migrateGenerate(models, db?)`                                                                                                                                                                                                                                                                                    | function  | → `{operations, source, extra}` (DDL diff vs DB)       |
| `probeSearch(db, table)` / `reindexSearch(db, table)` / `searchCapability(db)`                                                                                                                                                                                                                                    | functions | Postgres FTS probe/reindex                             |
| Types: `Migration`, `MigrationSchema{createTable, addColumn, dropTable, addIndex, dropColumn, addComment, searchable}`, `TableBuilder/ColumnBuilder/ColumnTypeBuilder`, `DdlOp` variants (createTable/addColumn/addIndex/rewriteCheck/searchable), `ColumnType/TableSpec`, `SEARCH_VECTOR_COLUMN="search_vector"` | types     | —                                                      |

### Seeders domain [#seeders-domain]

| Symbol                                | Kind     | Signature                                                                                                           |
| ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `defineSeeder(handler)`               | function | `handler(ctx: SeederContext{db}) => void\|Promise<void>` → `Seeder`                                                 |
| `seed(entries: SeederEntry[], only?)` | function | idempotent upsert-by-key via `db.upsert`                                                                            |
| `defineFactory(model, generator)`     | function | `Factory<F>` (`make/makeMany/create/createMany`); `FactoryApi{sequence, lorem, date, uuid, pick, integer, boolean}` |

### Runtime domain [#runtime-domain]

| Symbol                                                                                                                                                                                                                                                                                                                                                       | Kind             | Signature                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ---------------------------------------------------- |
| `db`, `getDb()`, `transaction(fn)`, `upsert(model, match, values)`                                                                                                                                                                                                                                                                                           | values/functions | `transaction` supports nested savepoints             |
| `configureDatabase(config)` / `getKysely()` / `closeDatabase()`                                                                                                                                                                                                                                                                                              | functions        | dialect: pglite \| postgres \| bun-sql; pool options |
| Types: `DatabaseConfig{driver: "pglite"\|"postgres", dataDir?, url?, host?, port?, database?, username?, password?, pool?: PoolConfig{max?, idleTimeout?, connectionTimeout?, maxLifetime?}}`, `TenancyConfig{defaults: {mode: "domain"\|"path"\|"header"\|"fixed"\|"org"\|"none", tenantField, models: "*"\|string[], cache: {scoped}, storage: {scoped}}}` | types            | —                                                    |

### `./testing` subpath (`setupTestDb/teardownTestDb/truncateAll/syncSchema/registerFixtures`) [#testing-subpath-setuptestdbteardowntestdbtruncateallsyncschemaregisterfixtures]

`setupTestDb(models)` — fresh in-memory PGLite + register + sync; `teardownTestDb()` — close + reset; `truncateAll()`; `syncSchema()`; `registerFixtures(models: {name, model}[])` — reset + register in order.

***

## 4. `@kwiva/http` (v0.2.0) — `.` [#4-kwivahttp-v020--]

### Controller domain [#controller-domain]

| Symbol                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Kind     | Signature                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineController(options)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | function | `ControllerOptions{prefix?, middleware?, middlewareGroups?, routes(api): void}` → `Controller{prefix, middleware, routes: RouteDefinition[]}` |
| `bindRouteIds(name, controller)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | function | → `RouteDefinition[]` (throws on dup ids)                                                                                                     |
| `routeDetail(route)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | function | → docs object                                                                                                                                 |
| `deriveRouteId(name, method, path)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | function | → `ControllerName.verb` string                                                                                                                |
| `defineRoute(options)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | function | reusable standalone route                                                                                                                     |
| Types: `ControllerBuilder` (verb methods `get/post/put/patch/delete/ws(path, options, macros?)`, `guard`, `group`, all returning `RouteDefinition`), `RouteDefinition{method, path, fullPath, routeId?, name?, namePrefix?, bind?, input?, output?, contract?, middleware[], beforeHandle[], afterHandle[], handler?, ws?, summary?, description?, tags?, deprecated?, openAPI?, permission?, macros?}`, `RouteOptions{input?, output?, contract?, middleware?, bind?, name?, summary?, description?, tags?, deprecated?, openAPI?}`, `GuardOptions/GuardScope`, `MiddlewareGroupOptions`, `ModelFinder{find(id): Promise<unknown>}` | types    | —                                                                                                                                             |

### Contract domain [#contract-domain]

| Symbol                                                                                                                                                                                                                                                                                                           | Kind     | Signature               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------- |
| `defineContract(options)`                                                                                                                                                                                                                                                                                        | function | → `Contract`            |
| `guard(builder, options, setup)`                                                                                                                                                                                                                                                                                 | function | standalone scope helper |
| `expandMacros(registry, options)`                                                                                                                                                                                                                                                                                | function | → `MacroExpansion`      |
| `resolveMiddlewareRefs(refs, groups)`                                                                                                                                                                                                                                                                            | function | → `Middleware[]`        |
| Types: `Contract{request, response, input: SectionedInputSchema{entries}, output?}`, `ContractRequestOptions{body?, query?, params?, headers?, cookie?, authorize?, prepare?}`, `ContractResponseOptions{schema?, status?, transform?}`, `ContractContext`, `SectionedInputSchema`, `DefineContractRouteOptions` | types    | —                       |

### Middleware domain (`defineMiddleware`, built-ins: `cors`, `csrf`, `rateLimit`, `resetRateLimits`) [#middleware-domain-definemiddleware-built-ins-cors-csrf-ratelimit-resetratelimits]

| Symbol                                                                                                               | Kind     | Signature                                                                              |
| -------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `defineMiddleware(step)`                                                                                             | function | → `Middleware{step, preflight?}`                                                       |
| `cors(options?)`                                                                                                     | function | `CorsOptions{origin?, methods?, headers?, expose?, credentials?, maxAge?}` → preflight |
| `csrf(options?)`                                                                                                     | function | `CsrfOptions{cookie?, header?, field?, exempt?, sameSite?}`                            |
| `rateLimit(options?)`                                                                                                | function | `RateLimitOptions{max?, windowMs?, key?, message?}` → throws `RateLimitedError`        |
| Types: `MiddlewareStep = (ctx, next) => unknown`, `MiddlewareNext`, `CorsOptions`, `CsrfOptions`, `RateLimitOptions` | types    | —                                                                                      |

### Pipeline domain [#pipeline-domain]

| Symbol                                                                                                                                                                                                                                                          | Kind      | Signature                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------- |
| `buildCtx(elysia, app, input)`                                                                                                                                                                                                                                  | function  | → `HttpContext`                               |
| `getKwiva/tryGetKwiva/stashKwiva/applyHeaders/hasHeaders`                                                                                                                                                                                                       | functions | —                                             |
| `parseCookies(header)` / `headersRecord` / `paramsOf` / `headersOf` / `cookiesOf` / `splitInput` / `definedOverrides` / `rawInputOf` / `sourceOf`                                                                                                               | functions | —                                             |
| `validateInput(context, route, overrides?)`                                                                                                                                                                                                                     | function  | → `{params, query, body, headers?, cookies?}` |
| `compileBeforeHandle(route, app, resolvers)` / `compileAfterHandle` / `wrapHandler` / `compileWsBeforeHandle`                                                                                                                                                   | functions | Elysia phase compilers                        |
| `toErrorResponse(error)` / `statusFor(code)` / `registerError(code, status)` / `error(code, message?, fields?)` / `issuesToFields`                                                                                                                              | functions | —                                             |
| `CONTINUE`                                                                                                                                                                                                                                                      | symbol    | before-handle short-circuit marker            |
| Types: `HttpContext = RequestContextWith<{input, headers, cookies, session, user, can?, bound, ip, header(), setHeaders(), json(), text(), noContent(), redirect(), waitUntil(), stream()}>`, `HttpInput{params, query, body, headers?, cookies?}`, `ErrorBody` | types     | —                                             |

### Server domain [#server-domain]

| Symbol                                                                                                                                                                                       | Kind      | Signature                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------- |
| `createServer(options?)`                                                                                                                                                                     | function  | → `AppServer{port, url, start(port?), stop(), handle(req), mount(plugin)}` |
| `bootApp(server, options)`                                                                                                                                                                   | function  | → `ManifestEntry[]` (routes, WS, auto-routes, manifest, OpenAPI)           |
| `mountRoutes/mountWsRoutes/mountAutoRoutes/mountOpenAPI/registerPipeline/callRoute`                                                                                                          | functions | —                                                                          |
| `assembleManifest(entries)`                                                                                                                                                                  | function  | → `ManifestEntry[]` (dedupe by routeId, throws on dup)                     |
| `findRoute(entries, name)` / `routeUrl(entries, name, params?, options?)`                                                                                                                    | functions | —                                                                          |
| Types: `ServerOptions{port?}`, `AppServer`, `BootOptions{controllers?, middlewareGroups?, models?, macros?, resolvers?, appCtx, openAPI?}`, `OpenAPIOptions`, `JsonSchema`, `ReferenceEntry` | types     | —                                                                          |

### WebSocket domain [#websocket-domain]

| Symbol                                                                        | Kind      | Signature                                                                                          |
| ----------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| `channel(name)`                                                               | function  | → `Channel{name, policy(fn)}`; `broadcast(name, payload)` (hub)                                    |
| `createChannelHandle({getSession, onCleanup})`                                | function  | → `ChannelHandle{subscribe(topic): AsyncGenerator}` (policy-checked)                               |
| `presence(pattern)`                                                           | function  | → `Presence{pattern, onJoin, onLeave, room(key), join(key,user), leave(key,userId), members(key)}` |
| `createPresenceHandle(onCleanup?)`                                            | function  | → `PresenceHandle` (auto-leave on close)                                                           |
| `resetHub()` / `resetChannels()` / `resetPresence()`                          | functions | —                                                                                                  |
| `AsyncQueue<T>`                                                               | class     | `push/take/close/asyncIterator`                                                                    |
| `broadcastEvent(event, data, overrides?)` / `emitAndBroadcast` (event-bridge) | functions | map event broadcast → WS channels                                                                  |
| `subscribe(topic, sink)` / `topicCount(topic)`                                | functions | hub                                                                                                |
| Types: `BroadcastEventOverrides`, `WsContext`                                 | types     | —                                                                                                  |

### Stream domain [#stream-domain]

| Symbol                              | Kind     | Signature                                                                     |
| ----------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `stream(setup, options?)`           | function | → `Response` (SSE); `StreamController{lastEventId, closed, enqueue, close()}` |
| `toSSEResponse(iterable, options?)` | function | → `Response`                                                                  |
| `frame(id, event, data)`            | function | → SSE string                                                                  |

### Helpers domain [#helpers-domain]

`redirect(path, status?)`, `back(fallback?, status?)`, `away(url, status?)` — ambient scope.

***

## 5. `@kwiva/auth` (v0.2.0) [#5-kwivaauth-v020]

### Session domain [#session-domain]

| Symbol                                                                                                                                                                                                                                 | Kind      | Signature                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------ |
| `createSession(user, options)` / `rotateSession(sessionId, options)` / `getSession(request, options)` / `refreshSession(sessionId, options)` / `destroySession(sessionId, options)`                                                    | functions | —                                    |
| `commitSession(session, options)` / `commitRememberCookie(session, options)` / `destroySessionCookie(cookie?)` / `destroyRememberCookie(cookie?)`                                                                                      | functions | → `Set-Cookie` strings               |
| `createSessionManager(options)`                                                                                                                                                                                                        | function  | → `SessionManager` (bound)           |
| `createMemorySessionStore()`                                                                                                                                                                                                           | function  | → `SessionStore{get/set/delete}`     |
| `createMemoryUserStore(initial?)`                                                                                                                                                                                                      | function  | → `UserStore{findById, findByEmail}` |
| `resolveSessionParams(ctx, options)`                                                                                                                                                                                                   | function  | → `ResolvedSessionParams`            |
| `SessionOptions{secret, maxAge?, cookie?, store, now?, remember?, rememberMaxAge?, rememberCookie?, honorRemember?}`                                                                                                                   | type      | —                                    |
| Consts: `DEFAULT_SESSION_COOKIE{name:"kwiva_session", httpOnly, secure:false, sameSite:"lax", path:"/"}`, `DEFAULT_SESSION_MAX_AGE=604800` (7d), `DEFAULT_REMEMBER_COOKIE{name:"kwiva_remember"}`, `DEFAULT_REMEMBER_MAX_AGE=31536000` | consts    | —                                    |
| Crypto: `hashPassword` (scrypt `scrypt$salt$hash`), `verifyPassword`, `signSessionId` (HMAC-SHA256), `serializeSessionValue`, `parseSessionValue`                                                                                      | functions | `crypto`-based                       |

### Identity domain (`attempt/login/logout`, `clientIp`, rate limiting) [#identity-domain-attemptloginlogout-clientip-rate-limiting]

| Symbol                                                                                                                                                                                                                                                   | Kind      | Signature                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attempt(credentials, options)`                                                                                                                                                                                                                          | function  | → `AttemptResult` (`{ok:true,user,session,setCookie,rememberCookie?}` \| `{ok:false, reason:"invalid"\|"rate_limited", resetAt?}`); rate-limit 5/60s per key, resets on success |
| `login(user, options)`                                                                                                                                                                                                                                   | function  | → `AttemptSuccess` (rotates on `previousSessionId`)                                                                                                                             |
| `logout(sessionId, options)`                                                                                                                                                                                                                             | function  | → `LogoutCookies`                                                                                                                                                               |
| `DEFAULT_LOGIN_RATE_LIMIT = {max:5, windowMs:60000}`                                                                                                                                                                                                     | const     | —                                                                                                                                                                               |
| `createRateLimiter(clock?)` / `defaultRateLimiter()`                                                                                                                                                                                                     | functions | → `RateLimiter{check, reset}`                                                                                                                                                   |
| Types: `IdentityOptions{secret, maxAge?, cookie?, store, users, now?, providers?, verify?, resolveUser?, rememberMaxAge?, rememberCookie?, honorRemember?, limiter?, loginRateLimit?, ip?}`, `AttemptSuccess{user, session, setCookie, rememberCookie?}` | types     | —                                                                                                                                                                               |

### Controller domain [#controller-domain-1]

`createAuthController(options?)` → `Controller` — `POST /auth/login`, `/auth/logout`, `/auth/register`; `createSessionController(options?)` → `Controller` — `GET /session`; `sessionController` (zero-arg).

### Middleware domain [#middleware-domain]

| Symbol                                                                                                                         | Kind     | Signature                                            |
| ------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------- |
| `requireAuth(options?)`                                                                                                        | function | → `Middleware` — session/user attach + `runWithAuth` |
| `guestOnly(options?)`                                                                                                          | function | → `Middleware` — redirect or `CONFLICT`              |
| `verified(options?)`                                                                                                           | function | → `Middleware` — 403 unless user verified            |
| Types: `RequireAuthOptions{secret?, maxAge?, cookie?, store?, users?, policies?}`, `GuestOnlyOptions`, `ResolvedSessionParams` | types    | —                                                    |

### Policy domain (`definePolicy/defineGate/can/authorize/whereCan`) [#policy-domain-definepolicydefinegatecanauthorizewherecan]

| Symbol                                                                                                                                                                                      | Kind              | Signature                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------- |
| `definePolicy(rules, options?)`                                                                                                                                                             | function          | → frozen `Policy{[action]: fn \| before?}`; deny-by-default |
| `defineGate(check)`                                                                                                                                                                         | function          | → frozen `Gate{kind:"gate"}`                                |
| `can/cannot`                                                                                                                                                                                | functions         | ambient (ALS) + explicit overloads                          |
| `authorize(policy, user, action, resource?)` / `authorizeGate(gate, user, resource?)`                                                                                                       | functions         | throws `ForbiddenError`                                     |
| `whereCan`                                                                                                                                                                                  | functions         | ambient + explicit overloads                                |
| `checkGate/checkExplicit/splitAbility/policiesFromModules/segmentCandidates`                                                                                                                | functions         | —                                                           |
| Registry: `PolicyRegistry{register/registerModules/resolve}`, `getDefaultRegistry/registerPolicies/resetDefaultRegistry/policyFor/normalizeRegistry`                                        | class + functions | —                                                           |
| Types: `Policy{[action]: PolicyRule \| PolicyBeforeHook \| undefined; before?}`, `PolicyRule<T> = (user, resource?) => boolean`, `Gate<T>{kind:"gate"}`, `GateCheck<T>`, `PolicyBeforeHook` | types             | —                                                           |

### Client hooks (React peer) [#client-hooks-react-peer]

| Symbol                                              | Kind      | Signature                               |
| --------------------------------------------------- | --------- | --------------------------------------- |
| `useSession(endpoint="/session")`                   | function  | → `{session, user, isLoading, refresh}` |
| `useCan(ability, abilities?)` / `AbilitiesProvider` | functions | —                                       |
| `setAmbientAbilities/getAmbientAbilities`           | functions | —                                       |

***

## 6. `@kwiva/client` (v0.2.0) [#6-kwivaclient-v020]

### Client core [#client-core]

| Symbol                                                                                                                                                                                                  | Kind     | Signature                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `client` (const, Proxy)                                                                                                                                                                                 | value    | `client.Controller.method(args?, opts?) => Promise<output>`                             |
| `initClient(options: InitClientOptions)`                                                                                                                                                                | function | validates config; builds Eden Treaty client; installs token-refresh fetch wrapper       |
| `resetClient()`                                                                                                                                                                                         | function | —                                                                                       |
| `callRoute(routeId, args?, opts?)`                                                                                                                                                                      | function | → `Promise<unknown>`; throws normalized `ClientErrorShape`                              |
| `getClientSnapshot()`                                                                                                                                                                                   | function | → `{baseUrl, wsUrl, routes, reconnect}`                                                 |
| `toClientError(status, value)`                                                                                                                                                                          | function | normalize Eden failure → `ClientErrorShape{code, message, status, requestId?, fields?}` |
| `substitutePath(template, params, routeId)`                                                                                                                                                             | function | → path string + params (`ClientErrorShape` on missing)                                  |
| Types: `ClientConfig{baseUrl, headers?, credentials?, fetch?, onError?, websocket?}`, `WebSocketConfig{url, reconnect?, headers?}`, `ReconnectPolicy{enabled, delay, maxAttempts}`, `InitClientOptions` | types    | —                                                                                       |

### Data hooks [#data-hooks]

| Symbol                                                                                                                                                    | Kind     | Signature                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `useResource(routeId, args?, options?)`                                                                                                                   | function | TanStack `useQuery` wrapper                                                                                   |
| `useList(routeId, args?, options?)`                                                                                                                       | function | —                                                                                                             |
| `prefetchRoute(routeId, args?, options?)`                                                                                                                 | async fn | —                                                                                                             |
| `routeKey(routeId, args?)`                                                                                                                                | function | → `["kwiva", controller, method, args?]`                                                                      |
| `useMutation(routeId, options?)`                                                                                                                          | function | optimistic + auto-invalidate; `mutateAsync(vars, opts?)`, `routeFamily/invalidate`                            |
| `invalidate(targets)`                                                                                                                                     | async fn | —                                                                                                             |
| `useUpload(routeId, options?)`                                                                                                                            | function | multipart mutation; `UploadVariables{file?, files?, field?, fields?}`                                         |
| `useInfiniteList(routeId, args?, options?)`                                                                                                               | function | `items/loadNext/hasNext/pages`                                                                                |
| `useForm(initial, options?)`                                                                                                                              | function | `{data, setData, errors, setError, clearErrors, processing, transform, reset, submit, post/patch/put/delete}` |
| Types: `QueryHookOptions, PrefetchOptions, KwivaMutationResult, MutateOptions, OptimisticUpdate, InfiniteListOptions/InfiniteListResult, UploadVariables` | types    | —                                                                                                             |

### WebSocket + cache persistence [#websocket--cache-persistence]

| Symbol                                                                                        | Kind      | Signature                                                                                                              |
| --------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `connectRoute(routeId, args?, opts?)`                                                         | function  | → `ManagedSocket{send, close, status}`                                                                                 |
| `useWsSubscription(routeId, args?, opts?)`                                                    | function  | → `{data, error, status, send}`                                                                                        |
| `useConnectionState()`                                                                        | function  | → `{status}`                                                                                                           |
| `aggregateStatus()` / `onAggregateStatus(listener)`                                           | functions | connection state machine                                                                                               |
| `createQueryClient()` / `getQueryClient()` / `resetQueryClient()` / `dehydrateClient(client)` | functions | —                                                                                                                      |
| `ClientProvider({children, client?, dehydratedState?})`                                       | function  | —                                                                                                                      |
| `enableCachePersistence(options?)` → disposer, `clearPersistedCache()`                        | function  | `PersistCacheOptions{storage?, key?, maxAge?, throttleMs?, now?, client?}`; `CacheStorage{getItem/setItem/removeItem}` |
| `createTokenRefreshFetch(options)`                                                            | function  | `TokenRefreshOptions{refresh, fetch?, header?, statuses?, format?}` → `FetchLike` (retry once on 401)                  |

***

## 7. `@kwiva/ui` (v0.2.0) — `.` + `./server` [#7-kwivaui-v020----server]

### Pages domain (`definePage`, `resolveHead`, `notFound`, `redirect`) [#pages-domain-definepage-resolvehead-notfound-redirect]

| Symbol                                                                                | Kind      | Signature                                                                            |
| ------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------ |
| `definePage(options \| path, options)`                                                | function  | → frozen `Page{kind:"page", path?, load?, render, head?, middleware?}`               |
| `redirect(path, status?)` / `notFound()`                                              | functions | throw `PageRedirect`/`PageNotFound`                                                  |
| `resolveHead(page, props)`                                                            | function  | → `PageHead`                                                                         |
| `PageRedirect` / `PageNotFound`                                                       | classes   | —                                                                                    |
| `pagesFromRegistry(units)`                                                            | function  | → `DiscoveredPage[]{name, source, pattern, page}` (dedupe by pattern; throws on dup) |
| Types: `Page, DefinePageOptions, PageLoadContext, PageHead, DiscoveredPage, PageUnit` | types     | —                                                                                    |

### Server render domain (`renderPage`, `renderDocument`, `renderNotFound`, `renderErrorPage`, `defineIsland`, `hydrateIslands`, assets) [#server-render-domain-renderpage-renderdocument-rendernotfound-rendererrorpage-defineisland-hydrateislands-assets]

| Symbol                                                                                                                        | Kind            | Signature                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------- |
| `renderPage(page, ctx, options?)`                                                                                             | function        | → `Response`; `Accept: application/json` → `{component, url, props}` envelope |
| `renderNotFound(url)` / `renderErrorPage(status, message, options?)`                                                          | functions       | —                                                                             |
| `renderDocument(options)`                                                                                                     | function        | `{head, body, seed, clientScript, extraScripts?}`                             |
| `renderHead(head, pagePath)`                                                                                                  | function        | head string                                                                   |
| `documentPrologue(head)` / `documentEpilogue(options)` / `serializeSeed(seed)`                                                | functions       | document shell                                                                |
| `escapeHtml` (re-export)                                                                                                      | function        | —                                                                             |
| `defineIsland(component, options)`                                                                                            | function        | → `Island{name, component, hydrate, defaultProps}`                            |
| `renderIsland(island, props?)`                                                                                                | function        | emits `data-kwiva-island` markers                                             |
| `hydrateIslands(registry, options?)`                                                                                          | function        | → count                                                                       |
| `AssetManifest{entry?, files?, css?}`, `assetUrl(manifest, name)`, `assetTags(manifest, entry?)`, `parseAssetManifest(value)` | functions/types | —                                                                             |

### `./server` subpath — `createPagesController(pages, options?)` → `Controller` [#server-subpath--createpagescontrollerpages-options--controller]

### Navigation domain [#navigation-domain]

| Symbol                                                                                                                             | Kind      | Signature              |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------- |
| `hydrateApp(options: HydrateAppOptions{pages, layouts?, events?})`                                                                 | function  | hydrateRoot + soft-nav |
| `Link`                                                                                                                             | component | soft-navigating anchor |
| `usePage()` / `useRouter()` / `RouterEvents` (`on(event, listener)`)                                                               | functions | —                      |
| `resolvePage(pathname, pages)` / `fetchEnvelope(url)` / `renderPageState(state, pages, layouts)`                                   | functions | —                      |
| `setLinkPrefetcher(fn?)` / `installScrollRestoration(events, options?)`                                                            | functions | —                      |
| Types: `PageState, PageEnvelope, BundledPage, VisitOptions, RouterEvent, RouterEventPayload, HydrateAppOptions, LinkProps, Router` | types     | —                      |

### SEO domain [#seo-domain]

`sitemap(entries, options)`, `sitemapResponse(...)`, `robotsTxt(options?)`, `robotsResponse(...)`; types `SitemapEntry{path, lastmod?, changefreq?, priority?}`, `SitemapOptions{origin}`, `RobotsOptions`.

***

## 8. `@kwiva/jobs` (v0.2.0) [#8-kwivajobs-v020]

### Define + Validate [#define--validate]

| Symbol                                             | Kind     | Signature                                                                                           |
| -------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `defineJob<T>(options: DefineJobOptions<T>)`       | function | → frozen `Job<T>`; validated (tries ≥ 1, backoff ≥ 0, timeoutMs > 0, jitter default true)           |
| `validateJobInput<T>(job, raw)`                    | function | → validated input; throws `ValidationError`                                                         |
| `executeJobOnce(job, rawInput, ref)`               | function | one attempt: decrypt → validate → middleware → timeout race                                         |
| `computeBackoffDelay(job, failedAttempt, random?)` | function | fixed/exponential, capped, jittered                                                                 |
| `defineTask(options)`                              | function | → `Task{kind:"task", schedule?, description?, preventOverlapping, onSuccess?, onFailure?, handler}` |
| `runTask(task, opts?)`                             | function | fires `onSuccess`/`onFailure`                                                                       |

### Dispatch [#dispatch]

| Symbol                                     | Kind      | Signature                                                                                                                                                                                      |
| ------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dispatch(job, input, opts?)`              | function  | → `Promise<string>` record id                                                                                                                                                                  |
| `dispatchAfterResponse(job, input, opts?)` | function  | void (scope-aware)                                                                                                                                                                             |
| `dispatchSync(job, input, opts?)`          | function  | → result (1 attempt, no retries)                                                                                                                                                               |
| `dispatchChain(entries, opts?)`            | function  | sequential; `ChainResult{ok, results, failedIndex?, error?}`                                                                                                                                   |
| `dispatchBatch(options)`                   | function  | `BatchOptions{jobs: BatchEntry[], queue?, concurrency?, allowFailures?, then?, catch?, finally?}` → `BatchResult{ok, results, errors, skipped, handle: BatchHandle{id, cancel(), progress()}}` |
| `setDispatcher(fn)` / `resetDispatcher()`  | functions | fakeQueue seam                                                                                                                                                                                 |

### Queue engines [#queue-engines]

| Symbol                                                                                                                                                                                                                                                                                                                                                                       | Kind      | Signature                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `createMemoryQueue(options?)`                                                                                                                                                                                                                                                                                                                                                | function  | → `MemoryQueue{enqueue, due(now, queue?), ack, fail, has, size(queue?), pending(), failures(), clear()}` |
| `uniqueOwner/claimUnique/releaseUnique/settleUnique/clearUnique`                                                                                                                                                                                                                                                                                                             | functions | dedupe ledger                                                                                            |
| `createJobCipher(key)` → `{encrypt, decrypt}`; `setJobCipher/getJobCipher`; `encryptJobInput/decryptJobInput/isEncryptedJobInput`                                                                                                                                                                                                                                            | functions | AES-256-GCM                                                                                              |
| `enqueueOutbox(job, input, opts?)` / `drainOutbox(opts?)` / `getOutboxStore/setOutboxStore/resetOutboxStore`                                                                                                                                                                                                                                                                 | functions | transactional outbox; `OutboxRecord{id, job, input, queue, runAt, priority, enqueuedAt}`                 |
| `setDefaultEngine/getDefaultEngine/resetDefaultEngine`, `setConnectionPriorities/getConnectionPriority/resetConnectionPriorities`                                                                                                                                                                                                                                            | functions | —                                                                                                        |
| Types: `JobCore/Job<T>/AnyJob`, `DefineJobOptions`, `JobExecutionContext{id, queue, attempt, input, logger}`, `JobNext`, `JobMiddleware`, `UniqueJobOptions`, `StandardSchema`, `QueuedJobRecord`, `EngineFailure`, `JobEvent ("processing"\|"retrying"\|"processed"\|"failed")`, `JobEventPayload`, `JobCipher`, `JobReleaseError{delayMs}`, `BatchCancelledError{batchId}` | types     | —                                                                                                        |

### Middleware [#middleware]

| Symbol                                                                                           | Kind      | Signature                                                                           |
| ------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------- |
| `throttle(key, options)`                                                                         | function  | `ThrottleOptions{max, windowMs, releaseMs?, now?}`; `JobReleaseError` on over-limit |
| `withoutOverlap(key, options?)`                                                                  | function  | `WithoutOverlapOptions{releaseMs?, ttlMs?, now?}`                                   |
| `skipIfBatchCancelled()`                                                                         | function  | —                                                                                   |
| `clearThrottleBuckets/clearOverlapLocks/markBatchCancelled/isBatchCancelled/clearBatchCancelled` | functions | —                                                                                   |

### Worker [#worker]

| Symbol                                      | Kind      | Signature                                                                |
| ------------------------------------------- | --------- | ------------------------------------------------------------------------ |
| `startWorker(options?)`                     | function  | → `WorkerHandle{stop(): Promise, stats(): WorkerStats, stopWhenEmpty()}` |
| `executeWithRetry(job, input, opts?)`       | function  | → `RetryResult{ok, value?, error?, attempts}`                            |
| `defaultSleeper(ms)`                        | function  | —                                                                        |
| `registerWorkerStats/unregisterWorkerStats` | functions | —                                                                        |

### Failed-job registry [#failed-job-registry]

| Symbol                                                                                                         | Kind      | Signature             |
| -------------------------------------------------------------------------------------------------------------- | --------- | --------------------- |
| `failedJobs()` / `recordFailed(job)` / `removeFailed(id)` / `pruneFailed(olderThanMs, now?)` / `clearFailed()` | functions | —                     |
| `retryFailed(id, opts?)` / `retryAllFailed(opts?)`                                                             | functions | `RetryFailedOptions`  |
| `describeFailure(error)`                                                                                       | function  | `{error, errorCode?}` |
| Types: `FailedJob{id, queue, attempts, input, job?, error, errorCode?, failedAt}`                              | type      | —                     |

### Batches + observability [#batches--observability]

| Symbol                                                                                                                                                                      | Kind      | Signature                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `createBatchRecord(total)` / `getBatchRecord(id)` / `batchProgress(id)` / `cancelBatch(id)` / `isBatchRecordCancelled(id)` / `clearBatchRecord(id)` / `clearBatchRecords()` | functions | `BatchRecord`, `BatchProgress`                                                                                            |
| `queueMetrics(engine?)`                                                                                                                                                     | function  | `QueueMetrics{pending, pendingByQueue, failed, processed, succeeded, inFlight, workers}`                                  |
| `onJobEvent(event, handler)` / `offJobEvent` / `clearJobEvents`                                                                                                             | functions | —                                                                                                                         |
| `Scheduler`, `startScheduler(options)`                                                                                                                                      | function  | → `SchedulerHandle{tick(now?), stop()}`; `parseCron(expr)`, `isDue`, `nextRun`, `assertValidTimeZone`                     |
| `withoutOverlapping(task)`                                                                                                                                                  | function  | —                                                                                                                         |
| `fakeQueue()`                                                                                                                                                               | function  | → `QueueFake{dispatched, assertDispatched, assertNotDispatched, assertNothingDispatched, assertDispatchedCount, restore}` |

***

## 9. `@kwiva/events` (v0.2.0) [#9-kwivaevents-v020]

| Symbol                                                                                                                                                                                            | Kind            | Signature                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineEvent<T>(options?)`                                                                                                                                                                        | function        | → `KwivaEvent<T>`; `EventOptions{broadcast?, broadcastOn?, broadcastAs?, broadcastWith?, broadcastWhen?, listeners?, queued?, schema?}`                                     |
| `KwivaEvent<T>`                                                                                                                                                                                   | interface       | `listeners, queued, emit(data), emitUntil(data), emitIf/emitUnless, on(listener, handler) => unsub, channelFor(data)`                                                       |
| `defineListener(options)`                                                                                                                                                                         | function        | → `KwivaListener{event, queue, run(data), unsubscribe()}`; `DefineListenerOptions{on, handle, failed?, shouldHandle?, queue?}`, `ListenerQueue{tries?, backoff?, delayMs?}` |
| `onEvent(event, handle)`                                                                                                                                                                          | function        | → `SubscriberEntry{event, handle}`                                                                                                                                          |
| `defineSubscriber(options)`                                                                                                                                                                       | function        | → `KwivaSubscriber{name, unsubscribe()}`                                                                                                                                    |
| Fake: `fakeEvents(...events)` / `restoreEvents()` / `emittedEvents()` / `assertEmitted(event, predicate?)` / `assertNotEmitted` / `assertNothingEmitted`; types `FakeableEvent, RecordedEmission` | functions/types | —                                                                                                                                                                           |
| Config: `setEventsConfig/getEventsConfig/resetEventsConfig/validateEventsConfig(section)`; `EventsConfig{driver?: "sync"\|"queued", prefix?}`                                                     | functions/type  | —                                                                                                                                                                           |

***

## 10. `@kwiva/mail` (v0.2.0) [#10-kwivamail-v020]

| Symbol                                                                                                                                                                                                                         | Kind            | Signature                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineMail(options)`                                                                                                                                                                                                          | function        | → `Mailable{to(recipient): PendingMail, send, queue, later}`; `DefineMailOptions{to, from?, cc?, bcc?, replyTo?, subject, render(data): string, html?, markdown?, text?, tags?, metadata?, attachments?}` (`MailField = value \| (data) => value`) |
| `PendingMail<T>.send(data, transport?)`                                                                                                                                                                                        | method          | → `Promise<OutgoingMessage>`                                                                                                                                                                                                                       |
| `setTransport/getTransport/resetTransport`                                                                                                                                                                                     | functions       | —                                                                                                                                                                                                                                                  |
| `MemoryTransport` (records `sent[]`, `clear()`), `ConsoleTransport`                                                                                                                                                            | classes         | `{name, send(message)}`                                                                                                                                                                                                                            |
| `defineMailTransport(definition)`                                                                                                                                                                                              | function        | → `MailTransportDefinition{name, create()}`                                                                                                                                                                                                        |
| Address: `formatAddress/formatAddresses`; `Attachment{fromPath(path, {as?, mime?}), fromData(data, filename, mime?)}`; `OutgoingMessage{to, subject, body, from?, cc?, bcc?, replyTo?, html?, tags?, metadata?, attachments?}` | functions/types | —                                                                                                                                                                                                                                                  |
| Templates: `renderString(template, data)` (dotted `{{ key }}`, missing → ""), `markdownToHtml(src)`, `renderMarkdown(template, data)`, `mailButton({text,url})`, `mailPanel(content)`, `mailTable(headers, rows)`              | functions       | —                                                                                                                                                                                                                                                  |
| Config: `setMailConfig/getMailConfig/resetMailConfig`; `validateMailConfig(section)`; `MailConfig{transport?: "memory"\|"console"\|"smtp"\|"sendgrid"\|"resend", from?}`                                                       | functions/type  | —                                                                                                                                                                                                                                                  |

***

## 11. `@kwiva/mcp` (v0.1.0) — `.` + `./server` [#11-kwivamcp-v010----server]

### Tool domain [#tool-domain]

| Symbol                                                                                                                                                                                       | Kind           | Signature                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------- |
| `defineMcpTool(options)`                                                                                                                                                                     | function       | → `McpTool{description?, input, ability, handler, name?, bindName(name)}` |
| `registerMcpTool(name, tool)`                                                                                                                                                                | function       | appends `Tool` suffix                                                     |
| `MCP_TOOL_SUFFIX = "Tool"`, `toolName(tool)`                                                                                                                                                 | const/function | —                                                                         |
| `validateToolInput(input, raw)`                                                                                                                                                              | function       | → `{ok, value?, fields?, message?}`                                       |
| `inputToJsonSchema(input)`                                                                                                                                                                   | function       | —                                                                         |
| `generateModelTools({config, models?, executor?})`                                                                                                                                           | function       | → `McpTool[]` (`{table}_{action}`, `readOnly` aware)                      |
| `generateControllerTools({config, manifest?, executor?})`                                                                                                                                    | function       | → `McpTool[]` (`{controller}_{action}`)                                   |
| Types: `McpInput = McpStandardSchema \| McpFieldMap`, `McpFieldMap`, `McpJsonField`, `McpStandardSchema`, `McpSchemaResult`, `McpTool{description, input, ability, handler, name, bindName}` | types          | —                                                                         |

### Server domain (`./server`) [#server-domain-server]

| Symbol                                                                                                            | Kind      | Signature                                                              |
| ----------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------- |
| `createMcpServerHandler({config, tools, resolveScope?, logger?, rateLimiter?, rateLimitWindow?, requireTenant?})` | function  | → `McpHandler{fetch(request): Promise<Response>}`                      |
| `runStdio(options)`                                                                                               | function  | → `McpStdioHandle{close()}` (requires `auth:"none"`)                   |
| `executeToolCall({tool, name, input, scope, options})`                                                            | function  | → `McpToolResult` (rate limit → validate → ability → tenant → handler) |
| `makeRegistrarFactory(options)` / `makeTestRateLimiter()`                                                         | functions | —                                                                      |
| `normalizeHandlerResult` / `toolError` / `toolErrorFromException`                                                 | functions | —                                                                      |
| `DEFAULT_RATE_WINDOW{max:120, windowMs:60000}`                                                                    | const     | —                                                                      |
| Types: `McpRequestScope{user?, policies?, tenantId?}`, `McpScopeResolver`, `ToolExecutionArgs`                    | types     | —                                                                      |

### Config domain [#config-domain]

| Symbol                                                                                                                                                                 | Kind     | Signature                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `validateMcpConfig(config?)`                                                                                                                                           | function | → `ValidatedMcpConfig{enabled, route, transport, auth, models, controllers, readOnly, scopes, requireTenant}` (throws `BAD_REQUEST`) |
| `DEFAULT_MCP_CONFIG{enabled:false, route:"/mcp", transport:"streamable", auth:"session", models:[], controllers:[], readOnly:false, scopes:[], requireTenant:false}`   | const    | —                                                                                                                                    |
| Types: `McpConfig{enabled?, route?, transport?: "streamable"\|"stdio", auth?: "session"\|"bearer"\|"none", models?, controllers?, readOnly?, scopes?, requireTenant?}` | type     | —                                                                                                                                    |

***

## 12. `@kwiva/search` (v0.1.0) [#12-kwivasearch-v010]

| Symbol                                                                                           | Kind     | Signature                                                |
| ------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------- |
| `validateSearchConfig(input)`                                                                    | function | → `SearchConfig` (throws `VALIDATION`)                   |
| `searchAcross(models, term, limit = 20)`                                                         | function | → `SearchHit[]{model, row, rank}` sorted by `searchRank` |
| Types: `SearchConfig{engine:"postgres", language?}`, `SearchConfigSection{search?}`, `SearchHit` | types    | —                                                        |

***

## 13. `@kwiva/storage` (v0.1.0) [#13-kwivastorage-v010]

### Config [#config]

| Symbol                                                                                                                                                                                                                                                                                                 | Kind     | Signature                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------- |
| `validateStorageConfig(config?)`                                                                                                                                                                                                                                                                       | function | → `ResolvedStorageConfig` (default disk: `local` at `./storage/app`) |
| `STORAGE_DRIVERS = ["local","memory","s3","gcs","azure","vercel-blob"]`                                                                                                                                                                                                                                | const    | —                                                                    |
| Types: `StorageConfig{default?, disks?: Record<string, DiskConfig>, tenant?: StorageTenantConfig}`, `DiskConfig{driver, root?, publicUrl?, options?}`, `StorageTenantConfig{scoped?, prefix?}`, `StorageDriver`, `ResolvedDiskConfig`, `ResolvedStorageConfig`, `DEFAULT_LOCAL_ROOT = "./storage/app"` | types    | —                                                                    |

### Storage domain [#storage-domain]

| Symbol                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Kind              | Signature                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `class Storage`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | class             | `configure(config?)`, `disk(name?) => Disk`, `fake()`, `capabilities/put/get/download/head/exists/delete/list/listAll/search/copy/move/url/signedUrl/signedUploadUrl/file(key)` |
| `storage` (singleton)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | value             | `initStorage(config?)`, `getStorage()`, `resetStorage()`                                                                                                                        |
| `class Disk`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | class             | `name, config, tenant?`; qualified key ops; `qualify(key)`, `calls()`, `clear()`                                                                                                |
| `FakeDisk` / `FakeStorage{disk, calls, reset, restore}`; `assertUploaded/assertExists/assertMissing/assertDeleted(disk, key, opts?)`                                                                                                                                                                                                                                                                                                                                                                                | classes/functions | throw `ValidationError`                                                                                                                                                         |
| `StorageError(code, message, options?)` (`storageCode`, `isStorageError`, `storageCodeOf`); `StorageErrorCode` = `STORAGE_NOT_FOUND/CONFLICT/INVALID/UNAVAILABLE/TENANT_REQUIRED`                                                                                                                                                                                                                                                                                                                                   | class/type        | —                                                                                                                                                                               |
| Types: `StorageAdapter{name, capabilities, upload/download/head/exists/delete/copy/move/list/listAll/search/url/signedUrl/signedUploadUrl}`, `StorageBody`, `FileMeta{key, size, contentType, etag?, lastModified?, metadata?}`, `StoredFile` (`name, type, arrayBuffer(), text(), stream(), blob()`), `UploadResult`, `SignedUpload`, `PutOptions`, `ListParams/ListPage`, `SearchParams`, `StorageUrlOptions`, `SignedUrlOptions`, `SignedUploadOptions`, `StorageCapabilities`, `StorageCall`, `KwivaFileHandle` | types             | —                                                                                                                                                                               |

### Assets subpath (`@kwiva/storage/assets`) [#assets-subpath-kwivastorageassets]

| Symbol                                           | Kind     | Signature                                                             |
| ------------------------------------------------ | -------- | --------------------------------------------------------------------- |
| `assetUrl(path, options?)`                       | function | resolve via `./public/assets-manifest.json` or `KWIVA_ASSET_MANIFEST` |
| `clearAssetManifestCache()`                      | function | —                                                                     |
| Type: `AssetUrlOptions{baseUrl?, manifestPath?}` | type     | —                                                                     |

***

## 14. `@kwiva/testing` (v0.1.0) [#14-kwivatesting-v010]

| Symbol                                                                                                                                                                                         | Kind                | Signature                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `withApp(fn, options?)`                                                                                                                                                                        | function            | → `WithAppContext{server, handler, client, registry, config, manifest}`; options `{cwd?, name?, db?, routes?, baseUrl?, extraControllers?, clientScript?, extraScripts?, services?, state?}`; teardown resets auth/client/query/policies/WS-hub; nested calls throw |
| `createTestClient(server, options?)`                                                                                                                                                           | function            | → `TypedClient`                                                                                                                                                                                                                                                     |
| `bootAppFromRoot(options?)`                                                                                                                                                                    | function (`./boot`) | → `BootedRoot{server, registry, config, manifest, models, appUnits}`; `BootAppRootOptions` (all above + `models?, mountModelRoutes?, configureDb?, decorate?, resolve?`)                                                                                            |
| Re-exports: `defineFactory` (@kwiva/data), `setupTestDb/teardownTestDb/truncateAll` (@kwiva/data/testing), `fakeQueue` (@kwiva/jobs), `fakeEvents/assertEmitted/restoreEvents` (@kwiva/events) | —                   | —                                                                                                                                                                                                                                                                   |
| Types: `WithAppContext, WithAppOptions, TestServerHandle, TestClientOptions, BootedRoot, BootAppRootOptions`                                                                                   | types               | —                                                                                                                                                                                                                                                                   |

***

## 15. `@kwiva/cli` (v0.3.0) — `kwiva` binary [#15-kwivacli-v030--kwiva-binary]

### Command domain [#command-domain]

| Symbol                                                      | Kind      | Signature                                                                                 |
| ----------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `defineCommand(options)`                                    | function  | → `CommandDefinition{name, description?, options?{key: CommandOption}, handler(options)}` |
| `optionKind(option)`                                        | function  | —                                                                                         |
| `parseCommandArgs(definition, argv)`                        | function  | → `ParsedArgs{values, help, errors}`                                                      |
| `formatCommandHelp/formatCommandList`                       | functions | —                                                                                         |
| `loadAppCommands(root?)` / `dispatchAppCommand(root, argv)` | functions | app commands from `src/app/commands/`                                                     |
| `main(argv)`                                                | function  | `import.meta.main` entry                                                                  |

### Make domain [#make-domain]

| Symbol                                                                           | Kind     | Signature                                                                                                                                                                             |
| -------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `planConstruct(kind, name, now?)`                                                | function | → `GeneratedFile{relativePath, content}`                                                                                                                                              |
| `writeConstruct(root, kind, name, now?)`                                         | function | → path; throws if exists                                                                                                                                                              |
| `runMake(root, command, argv)`                                                   | function | `kwiva make:<kind> <Name>`                                                                                                                                                            |
| `MAKE_KINDS`                                                                     | const    | `["config","service","model","controller","middleware","contract","policy","gate","job","task","event","listener","mail","factory","migration","seeder","page","mcp-tool","command"]` |
| `isMakeKind(kind)`                                                               | function | type guard                                                                                                                                                                            |
| Types: `MakeKind, MakeTarget{folder, extension, suffix?, dated?}, GeneratedFile` | types    | —                                                                                                                                                                                     |

### Server domain [#server-domain-1]

| Symbol                                                | Kind      | Signature                                                                                                              |
| ----------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `loadAppConfig(root)` / `applyConfigSections(config)` | functions | validate + apply all sections (auth, jobs, client, events, storage, mail, search, mcp, cache, kv)                      |
| `buildClientBundle(root, options?)`                   | function  | → `ClientBuildResult{tree, entryFile, outFile, usedDefaultConfig}`                                                     |
| `discoverPageFiles(root)`                             | function  | → `EntryPage[]` (`src/ui/pages`)                                                                                       |
| `emitClientEntry(pages, layouts, clientConfigPath?)`  | function  | generated entry source                                                                                                 |
| `bootDevServer(root, options?)`                       | function  | → `DevServer{url, port, appUnits, close()}` (serves `/__kwiva/client.js`, `/__kwiva/reload.js`, `/__kwiva/reload` SSE) |

### Codegen domain [#codegen-domain]

| Symbol                  | Kind     | Signature                                                             |
| ----------------------- | -------- | --------------------------------------------------------------------- |
| `collectRoutes(root)`   | function | → `CollectedRoute[]{id, method, path, params[], input, output, isWS}` |
| `collectPages(root)`    | function | → `CollectedPage[]`                                                   |
| `scanLayoutFiles(root)` | function | → layout paths                                                        |
| `writeRouteTree(root)`  | function | writes `src/.kwiva/types/route-tree.gen.ts`                           |

### Commands (framework) [#commands-framework]

`devCommand`, `buildCommand`, `testCommand`, `createCommand`, `migrateCommand`, `migrateStatusCommand`, `migrateDownCommand`, `migrateGenerateCommand`, `seedCommand`, `taskCommand`, `routeListCommand`, `keyGenerateCommand`, `storageSyncCommand`, `storageClearCommand`, `searchReindexCommand`, `mcpCommand`, `mcpPrintConfigCommand`, `doctorCommand`. Types: `DevCommandOptions{port?}`, `BuildCommandOptions{outDir?, minify?}`.

***

## 16. Opt-in packages [#16-opt-in-packages]

| Package                   | Symbols                                                                                                                                                                                                                                                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@kwiva/auth-better-auth` | `defineBetterAuth(options?)` → `BetterAuthDefinition{options, basePath (default "/api/auth")}`; `createBetterAuthServer(definition)` → `{handler, instance, resolveSession, resolveAuthScope}`; `mountBetterAuth(server, definition)`; `resolveBetterAuthSession(definition, request)`; `withBetterAuthScope(definition, request, fn)` |
| `@kwiva/mail-smtp`        | `SmtpTransport implements Transport{name:"smtp", send}`; `defineSmtpTransport(options)`                                                                                                                                                                                                                                                |
| `@kwiva/mail-resend`      | `ResendTransport implements Transport{name:"resend", send}`; `defineResendTransport(options)`                                                                                                                                                                                                                                          |
| `@kwiva/jobs-pg-boss`     | `definePgBossQueue(options)` → `PgBossQueue extends QueueEngine`                                                                                                                                                                                                                                                                       |
| `@kwiva/store-redis`      | `RedisStore implements StoreDriver`; `defineRedisStore(options?)`; `installRedisStore()`                                                                                                                                                                                                                                               |
