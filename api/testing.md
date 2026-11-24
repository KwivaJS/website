# @kwiva/testing (/api/testing)



# @kwiva/testing [#kwivatesting]

In-process test harness.

## Main barrel [#main-barrel]

| Symbol                                                                                                                                                                                         | Kind     | Signature                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `withApp(fn, options?)`                                                                                                                                                                        | function | → `WithAppContext{server, handler, client, registry, config, manifest}`; options `{cwd?, name?, db?, routes?, baseUrl?, extraControllers?, clientScript?, extraScripts?, services?, state?}` |
| `createTestClient(server, options?)`                                                                                                                                                           | function | → `TypedClient`                                                                                                                                                                              |
| Re-exports: `defineFactory` (@kwiva/data), `setupTestDb/teardownTestDb/truncateAll` (@kwiva/data/testing), `fakeQueue` (@kwiva/jobs), `fakeEvents/assertEmitted/restoreEvents` (@kwiva/events) | —        | —                                                                                                                                                                                            |

WithApp semantics: boots the real app in-process (nested calls throw), teardown resets auth/client/query/policies/WS-hub.

## `./boot` subpath — `bootAppFromRoot(options?)` → `BootedRoot{server, registry, config, manifest, models, appUnits}` [#boot-subpath--bootappfromrootoptions--bootedrootserver-registry-config-manifest-models-appunits]

## Test DB helpers (@kwiva/data/testing, re-exported here) [#test-db-helpers-kwivadatatesting-re-exported-here]

`setupTestDb(models)` — fresh in-memory PGLite + `registerModel` + `syncSchema()`; `teardownTestDb()`; `truncateAll()`; `syncSchema()`; `registerFixtures({name, model}[])`.

> \[!TIP]
> With `withApp`, `ctx.client` is the in-process typed client; `ctx.handler(request)` for raw Request handling; `ctx.server` for `handle()`.
