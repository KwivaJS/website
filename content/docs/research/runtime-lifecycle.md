---
title: Runtime Lifecycle
description: "Kwiva's actual runtime lifecycle — boot, discovery, request pipeline, WS, jobs, error handling (verified from source, kwivajs @ 552115f)."
status: implemented
---

# Runtime Lifecycle

**Sources:** `packages/core/src/app/*` (defineApp, assembleApp, discover), `packages/core/src/config/loader.ts`, `packages/core/src/config/env.ts`, `packages/cli/src/server/config-sections.ts` (`applyConfigSections`, `loadAppConfig`), `packages/http/src/server/*` (createServer/bootApp/mountRoutes), `packages/http/src/pipeline/*`, `packages/ui/src/render/server.ts`, `packages/data/src/dialect/config.ts`.

---

## 1. App boot (in order)

1. `kwiva create <name>` — scaffolds `bootstrap/app.ts` (`defineApp({name})`), `src/config/{app,database,cache,kv,storage,mcp}.ts`, `src/app/models/`, `src/app/http/controllers/`, `src/database/{migrations,seeders}/`, `package.json` scripts (`dev/build/test`).
2. `loadConfig("src/config", root, env())` — loads `src/config/*.ts` files (section key = filename), merges `BUILT_IN_DEFAULTS` (app `{port:3000, host:"localhost"}`, logger `{level:"info", sink:"console"}`, cache `{driver:"memory", prefix:"kwiva", defaultTtl:60000, tags:true, swrGraceMs:60000}`, kv `{driver:"memory", namespace:"app", defaultTtl:300000}`) → files → env (`APP_PORT`, `DATABASE_URL`, `DATABASE_POOL_MAX`, …). `runValidators` (core `validate()` checks `app.port` int, `logger.level` enum) + section validators (auth, jobs, client, events, storage, mail, mcp, search) happen via `applyConfigSections(config)`.
3. `applyConfigSections(config)` — validates auth/jobs/client sections, calls `setMailConfig`, `setEventsConfig`, `initCache`, `initKv`, `initStorage`, `validateSearchConfig`, `validateMcpConfig`; `database` → `configureDatabase` (data runtime, PGLite/Postgres via Kysely + Bun.SQL dialect).
4. `assembleApp(defineAppResult, root)` — `discoverUnits` (models/services/policies/jobs/events/tasks/commands/controllers/middleware flat-scan, pages recursive), `registerPolicies` (exports ending in `Policy`/`Gate` from `policies/`), `pagesFromRegistry`.
5. `createServer({port})` → `AppServer`. `bootApp(server, {controllers, middlewareGroups, models, macros, resolvers, appCtx, openAPI})` → binds route ids, expands macros, mounts routes, mounts WS, `mountAutoRoutes` (data `restRoutes` per model), `assembleManifest`, `mountOpenAPI` (Scalar). Returns `ManifestEntry[]`.
6. `start(port?)` → server listens; `url` getter returns base.

---

## 2. Request pipeline (Elysia → before → handler → after → error)

For every incoming request to a controller route (simplified from `http/pipeline/{input,binding,before-handle,after-handle,error-map}.ts`):

1. **Input extraction** (`parseCookies`, `splitInput` — destructures `params/query/body/headers/cookies` per `RouteDefinition.input`).
2. **Validate** (`validateInput` → `parsePart` — Standard Schema per part; issues → `ValidationError` with field-mapped `fields`; `guard`/`group` scopes run their `before` via macro/`setup`).
3. **Before middleware** (`compileBeforeHandle` — global → controller → group → route middleware stack, in order; `CONTINUE` symbol short-circuits; exceptions → error map).
4. **Handler** (`wrapHandler`) — typed `ctx` (`HttpContext`): `.input`, `.params`, `.headers()`, `.setHeaders()`, `.json/.text/.noContent`, `.redirect()`, `.waitUntil()`, `.stream()`. `ctx.can` ambient ability map.
5. **After middleware** (`compileAfterHandle`).
6. **Output validation** — `validateOutput(schema, value)`; response shape per `RouteDefinition.contract`.
7. **Error mapping** (`toErrorResponse(error)`) — KwivaError → `{error: {code, message, requestId?, fields?}}` with HTTP status via `statusFor(code)`; non-KwivaError → 500 `INTERNAL`.

`AppServer.handle(request): Promise<Response>` — routing via `findRoute` reverse map (`routeUrl` for generating URLs from manifests), 404 via parameterless response, method mismatch via Elysia defaults.

---

## 3. WS/SSE

- **Upgrade** (`websocket/upgrade.ts`) — policy-checked via `createChannelHandle({getSession, onCleanup}).subscribe(topic)`; `awaitFn` until `open`.
- **Broadcast** (`broadcast`) — in-process hub; `subscribe(topic, sink)` returns unsubscribe; `topicCount`.
- **Presence** — `Presence{pattern, onJoin, onLeave, room(key), join, leave, members}` + `createPresenceHandle`.
- **SSE** (`stream/`, `streamPage`) — `StreamController{lastEventId, closed, enqueue, close}`; `SSE_HEADERS` content-type `text/event-stream`; `startHeartbeat` optional; `frame(id, event, data)`.

---

## 4. Jobs/Tasks/Scheduler

- `dispatch(job, input, opts)` → record id; `dispatchSync` → attempt; `startWorker({queues, concurrency, pollMs, ...})` → `WorkerHandle`; `startScheduler({tasks, tickMs, timezone})` → `{tick, stop}`; `parseCron`/`nextRun`; `defineTask` runs in event-loop context via `runTask`.

## 5. Global error handling + after-response

- `toErrorResponse` maps the 8-code taxonomy to HTTP statuses; `mapError` covers `STORAGE_*`/`SEARCH_NOT_CONFIGURED` → storage/search 404s.
- `afterResponse(task)` — after-response queue for `dispatchAfterResponse` jobs.
