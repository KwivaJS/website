# @kwiva/core (/api/core)



# @kwiva/core [#kwivacore]

The application kernel — app composition, config, context/ALS, errors, logger, model IR, cache, KV, store, and helper/collection barrels.

## defineApp [#defineapp]

| Symbol                                | Kind     | Signature                                                                                                                                                                    |
| ------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineApp(options)`                  | function | → `AppDefinition{name, models?, controllers?, middleware?, services?, policies?, pages?, jobs?, events?, commands?, macros?, state?, decorate?, resolve?}` (additive arrays) |
| `assembleApp(app, root?)`             | function | → `UnitRegistry` (discovery + merge)                                                                                                                                         |
| `defineService(factory)`              | function | `(factory: (ctx: {context: AppContext}) => T) => ServiceFactory<T>`                                                                                                          |
| `instantiateServices(factories, app)` | function | —                                                                                                                                                                            |

## Config [#config]

| Symbol                                                                 | Kind     | Signature                                                                               |
| ---------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `defineConfig<T>(section): T`                                          | function | pass-through validator                                                                  |
| `loadConfig(dir?, root?, env?, validators?)`                           | function | discovers `src/config/*.ts`; merge defaults → files → env (`APP_PORT`, `DATABASE_URL`…) |
| `envVarFor(section, keyPath)`                                          | function | → upper-snake env name                                                                  |
| Types: `AppConfig{name?, port?, host?}`, `LoggerConfig{level?, sink?}` | types    | —                                                                                       |

## Context / ALS [#context--als]

| Symbol                                                                                                                        | Kind      | Signature            |
| ----------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------- |
| `runWithAuth/currentAuth`, `runWithRequest/currentRequest`, `runWithBatch`, `runWithTenant/currentTenant`, `runInTransaction` | functions | ALS scopes           |
| `stashAuthScope/authScopeOf`, `createContext`, `createAppContext`                                                             | functions | —                    |
| `afterResponse(task)`, `flushAfterResponse()`, `hasAfterResponseScope()`, `runWithAfterResponse(fn)`                          | functions | after-response queue |
| Types: `AppContext, RequestContext, Session{id, userId, expiresAt, remember?}`                                                | types     | —                    |

## Errors [#errors]

| Symbol                                                                                               | Kind           | Signature       |
| ---------------------------------------------------------------------------------------------------- | -------------- | --------------- |
| `class KwivaError(code, message, options?)`, `error(code, message, data?)`                           | class/function | 8-code taxonomy |
| `NotFoundError, ForbiddenError, UnauthorizedError, ConflictError, ValidationError, RateLimitedError` | classes        | —               |
| `STORAGE_*` + `SEARCH_NOT_CONFIGURED` codes                                                          | const          | —               |

## Logger [#logger]

`class Logger{info/warn/error(msg, data?), child(bindings)}`, `createLogger(options?)`, `createContextLogger(requestId)` (evlog-backed).

## Model IR (frozen) [#model-ir-frozen]

Types: `ModelDefinition{fields, relations, indexes, options, hooks, scopes}`, `FieldDefinition{name, column, kind, nullable, unique, indexed, primaryKey, enumValues?}`, `RelationDefinition{type: RelationKind (belongsTo…morphToMany), target, ...}`, `ModelOptions{timestamps, softDelete, audit, tenantField?, permission?, routes, search?}`, `ModelSearchOptions{fields, language?}`, `MODEL_IR_VERSION = 1`, `toSnakeCase`, `SEARCH_LANGUAGE_PATTERN`.

## Cache (ADR-0019) [#cache-adr-0019]

`class Cache{get/set/delete/wrap/invalidateTags}`, `initCache/getCache/resetCache`, `CacheWrapOptions{ttl?, tags?, swr?}`, `CacheSetOptions{ttl?, tags?}`.

## KV [#kv]

`class Kv{get/set/delete/has/clear/namespace}`, `initKv/getKv/resetKv`, `KvSetOptions{ttl?}`.

## Store (sealed seam) [#store-sealed-seam]

`class KeyvStore`, `createKeyvDriver/createStore`, `registerStoreDriver/unregisterStoreDriver`, `serializeValue/deserializeValue`, `StoreDriverName` (`memory|file|sqlite|redis|postgres`).

## Helpers (`./helpers`) [#helpers-helpers]

`blank/filled/value/withValue/tap/transform/when/retry/throwIf/throwUnless/rescue`, `abort/abortIf/abortUnless` (CODE\_MAP: 400/401/403/404/409/422/429/500), `auth()`, `config(path?, default?)`, `env(key, default?, {source?})`, `now()`, `today()`, `provideConfig`, `dump/dd/info/logger/DumpError`, `parsePath/walkPath/getPath/setPath/hasPath/forgetPath/dataGet/dataSet/dataFill/dataForget/dataHas/head/last`, types `Path`, `PathSegment`.

## Collection (`./collection`) [#collection-collection]

`Collection<T>` class + statics (`of/fromJson/times/range`) + \~50 methods (`where/groupBy/keyBy/pluck/chunk/sliding/unique/sortBy/tap/pipe/dot/undot/collapse/pad`…), `collect(items?)`.

## Guards/HTML [#guardshtml]

`isRecord` (`./guards`), `escapeHtml(value)` (`./html`).

## Configuration sections table [#configuration-sections-table]

| Section  | Owned by | Shape                                                                                                                   |
| -------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `app`    | core     | `{name?, port?, host?}`                                                                                                 |
| `logger` | core     | `{level?: "debug"\|"info"\|"warn"\|"error", sink?}`                                                                     |
| `cache`  | core     | `{driver?, prefix?, defaultTtl?, tags?, file?, url?, swrGraceMs?, waitUntil?}` (defaults: memory/kwiva/60000/tags:true) |
| `kv`     | core     | `{driver?, namespace? ("app"), defaultTtl? (300000), file?, url?}`                                                      |

> \[!TIP]
> `defineConfig` + `loadConfig` are core; other sections' validators (auth, jobs, client, events, storage, mail, mcp, search) are invoked via `applyConfigSections` (CLI).
