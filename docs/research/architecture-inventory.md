# Architecture Inventory (/docs/research/architecture-inventory)



# Architecture Inventory [#architecture-inventory]

**Generated from:** read-only traversal of the Kwiva framework repo (`kwivajs`) at commit `552115f` ("chore(release): version packages for the 0.2.0 release candidate", 2026-11-18) and the docs repo (`quiva-docs`) at its working state. Snapshot, not live data.

***

## 1. Kwiva repo layout [#1-kwiva-repo-layout]

```
kwivajs/
├── packages/                  # 20 @kwiva/* packages (all published, public)
│   ├── core/                  # @kwiva/core 0.2.0  — kernel, config, context, errors, logger, model IR, cache, kv, store
│   ├── data/                  # @kwiva/data 0.2.0  — models, query, migrations, seeders, factories, search, db runtime
│   ├── http/                  # @kwiva/http 0.2.0  — controllers, contracts, middleware, pipeline, server, openapi, websocket, stream
│   ├── ui/                    # @kwiva/ui 0.2.0    — pages, routing, SSR, islands, navigation, SEO, ./server
│   ├── client/                # @kwiva/client 0.2.0 — typed RPC, reads/mutations/upload hooks, cache, token refresh, WS
│   ├── auth/                  # @kwiva/auth 0.2.0  — defineAuth, providers, sessions, identity, policies, gates, client hooks
│   ├── jobs/                  # @kwiva/jobs 0.2.0  — defineJob/Task, dispatch, workers, middleware, scheduler, outbox, failed, metrics
│   ├── events/                # @kwiva/events 0.2.0 — defineEvent, listeners, subscribers, broadcast, config, fakes
│   ├── mail/                  # @kwiva/mail 0.2.0  — defineMail, templates, transports (smtp, resend), config
│   ├── mcp/                   # @kwiva/mcp 0.1.0   — MCP v2, config, tools, ./server (handler, stdio)
│   ├── search/                # @kwiva/search 0.1.0 — config validation, federated search, reindex
│   ├── storage/               # @kwiva/storage 0.1.0 — files-sdk disks, uploads, signed URLs, assets, fakes
│   ├── testing/               # @kwiva/testing 0.1.0 — withApp, createTestClient, ./boot, db lifecycle
│   ├── cli/                   # @kwiva/cli 0.3.0   — kwiva binary, 20 commands, 19 make kinds, codegen
│   ├── auth-better-auth/      # @kwiva/auth-better-auth 0.0.1 — sealed Better Auth adapter
│   ├── jobs-pg-boss/          # @kwiva/jobs-pg-boss 0.0.1 — pg-boss queue transport
│   ├── mail-smtp/             # @kwiva/mail-smtp 0.0.1 — nodemailer transport
│   ├── mail-resend/           # @kwiva/mail-resend 0.0.1 — Resend API transport
│   └── store-redis/           # @kwiva/store-redis 0.0.1 — Redis StoreDriver adapter
├── examples/                  # reference apps: todo-app-m2, todo-app-m3, todo-app-m4-m7
├── docs/
│   ├── framework/             # spec docset (v0.3, 21 ADRs) — has mirror + deviations drift over time
│   ├── features/, plans/, phases/, research/ ...
├── test/functionality/        # engine-import, barrel-surface, size-budget, folder-convention, graph gates
├── scripts/                   # workspace runner, ci-validate
├── build.ts                   # shared tsc build for all packages
└── bun.lock, package.json (workspaces: packages/*, examples/*)
```

**Build:** every package builds with `tsc` to `dist/` (`build.ts`), `exports` map uses `bun` condition → `src/*.ts` (monorepo dev), `types`/`import` → `dist/*.d.ts`/`dist/*.js` (published).

**Root:** private workspace (`0.0.0`), `engines.bun >= 1.4.0`, `type: "module"`, CI pipeline: `typecheck` → `test` → `build` → functionality gates; moon config parked (pre-1.0 schema, not active); changesets for versioning.

**Dev conventions:** engines sealed — `no-engine-imports` lint gate; code linted with oxlint (Rust-speed) via root and per-package scripts.

***

## 2. Kwiva package map (roles) [#2-kwiva-package-map-roles]

| Package                                   | One-line role                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@kwiva/core`                             | Application kernel: `defineApp`, `defineConfig`, config sections (`app`, `logger`, `cache`, `kv`), context/ALS (request, auth, batch, tenant, transaction, afterResponse), errors (8-code taxonomy), logger, model IR (frozen), cache (`initCache`), KV (`initKv`), store contracts, helpers/collection barrels.                                                                   |
| `@kwiva/data`                             | Models: `defineModel`, field DSL (string/enum/dateTime/belongsTo/hasMany/...), query builder, relations (incl. morph, through), transactions, migrations/seeders/factories, runtime (`db`, `transaction`), REST restRoutes helpers, Postgres FTS (`.search()` etc.), `./testing`.                                                                                                  |
| `@kwiva/http`                             | HTTP: `defineController`, `defineContract`, `defineMiddleware`, route builder (`api.get/post/ws/group`), guards, macros, middleware stack (`cors`, `csrf`, `rateLimit` built-in), server/boot/mount/dispatch/rest, OpenAPI mount (Scalar, model schemas), SSE/stream, WebSocket routes + channels + presence + broadcastEvent, error mapping (8-code → HTTP status, field-mapped). |
| `@kwiva/ui`                               | Frontend: `definePage`, layouts, recursive page discovery, `./server` renderPage (SSR, streaming, islands, assets, hydration, SEO helpers), navigation (typed routes, Link, scroll restoration), router.                                                                                                                                                                           |
| `@kwiva/client`                           | Typed client:eden adapter, routes typed, query hooks (`useResource`, `useList`, `useMutation`, `useUpload`, `useInfiniteList`, `useForm`, `connectRoute`), optimistic mutations, cache persistence, token refresh, SSR client, `./boot` not included here (that's testing).                                                                                                        |
| `@kwiva/auth`                             | Auth: `defineAuth` (providers: emailPassword, magicLink, oauth), sessions (memory store), identity (password reset, email verify, TOTP, API tokens, PKCE OAuth), middleware (`requireAuth`, `apiTokenAuth`, `passwordConfirmation`), controllers, policies/gates/abilities (`definePolicy`, `defineGate`, `authorize`, `authorizeGate`, `can/whereCan`).                           |
| `@kwiva/jobs`                             | Jobs: `defineJob` (retries, backoff, middleware, outbox, priority), `defineTask`, cron scheduler (`parseCron`), workers (`startWorker`), dispatch (`dispatch`, `dispatchBatch`, `dispatchChain`, `dispatchAfterResponse`), failed-job registry (`retryFailed`), events, metrics, outbox store.                                                                                     |
| `@kwiva/events`                           | Events: `defineEvent` (sync/queued, broadcast metadata, channelFor), listeners (`defineListener` with queue options), subscribers (`defineSubscriber`), config, fakes (`fakeEvents`).                                                                                                                                                                                              |
| `@kwiva/mail`                             | Mail: `defineMail`, templates (markdown + string + components), transports (memory, console, smtp, resend), config, `validateMailConfig`.                                                                                                                                                                                                                                          |
| `@kwiva/mcp`                              | MCP: config (`validateMcpConfig`), tool generation (model + controller tools), custom tools (`defineMcpTool`, `registerMcpTool`), server handler (`createMcpServerHandler`), stdio server (`runStdio`), in-process client tests, rate limiting, audit.                                                                                                                             |
| `@kwiva/search`                           | Search: `validateSearchConfig`, Postgres FTS, federated `searchAcross`, reindex via `kwiva search:reindex`.                                                                                                                                                                                                                                                                        |
| `@kwiva/storage`                          | Storage: `Disk` + `Storage` classes, files-sdk adapters (local/memory/s3/gcs/azure/vercel-blob), signed URLs, assets manifest, fakes, errors (`StorageError`, 5 codes).                                                                                                                                                                                                            |
| `@kwiva/testing`                          | Testing: `withApp`, `createTestClient`, `bootAppFromRoot`, `./boot`, DB lifecycle (`setupTestDb` etc.), re-exports.                                                                                                                                                                                                                                                                |
| `@kwiva/cli`                              | CLI: `kwiva` bin, dev/build/test/create, app commands (`defineCommand`), generators (`make:*`, 19 kinds), platform commands, codegen (route-tree, page bundle, layout scan).                                                                                                                                                                                                       |
| `@kwiva/auth-better-auth`                 | Auth engine: `defineBetterAuth` + `mountBetterAuth` (engine not exposed publicly).                                                                                                                                                                                                                                                                                                 |
| `@kwiva/jobs-pg-boss`                     | Job transport: `definePgBossQueue` — engine adapter with local pending mirror.                                                                                                                                                                                                                                                                                                     |
| `@kwiva/mail-smtp` / `@kwiva/mail-resend` | Mail transports.                                                                                                                                                                                                                                                                                                                                                                   |
| `@kwiva/store-redis`                      | StoreDriver adapter (redis via ioredis), `installRedisStore`.                                                                                                                                                                                                                                                                                                                      |

***

## 3. Dependency graph (package → runtime deps) [#3-dependency-graph-package--runtime-deps]

Derived from `package.json` files in the repo.

```
@kwiva/core
├── @keyv/sqlite, keyv, evlog            (store, logger, errors/misc)
│   (peers: @keyv/postgres, @keyv/redis; dev: both)
@kwiva/data
└── @kwiva/core, kysely, pluralize       (+ dev: @electric-sql/pglite)
@kwiva/http
└── @kwiva/core, @kwiva/data, @kwiva/events, elysia, valibot,
    @elysia/openapi, @valibot/to-json-schema, @scalar/types
@kwiva/ui
└── @kwiva/core, @kwiva/http, devalue    (peers: react, react-dom)
@kwiva/client
└── @elysia/eden, @kwiva/core, @kwiva/http, @tanstack/react-query,
    @tanstack/query-persist-client-core   (peers: react, react-dom)
@kwiva/auth
└── @kwiva/core, @kwiva/http             (peers: react, react-dom)
@kwiva/jobs
└── @kwiva/core, croner                  (+ peeks: none)
@kwiva/events, @kwiva/search, @kwiva/mcp, @kwiva/testing
└── @kwiva/core (+ @kwiva/data/@kwiva/http/@kwiva/auth/@kwiva/ui/@kwiva/jobs for testing)
@kwiva/mail
└── @kwiva/core, marked
@kwiva/storage
└── @kwiva/core, files-sdk
    (peers: @aws-sdk/*, @azure/storage-blob, @google-cloud/storage, @vercel/blob)
@kwiva/testing
└── all others (auth, client, data, events, http, jobs, mail, ui)
@kwiva/cli
└── all framework packages, @clack/*, change-case, leven
    (+ engine transports: @kwiva/jobs-pg-boss, @kwiva/mail-smtp)
    + driver packages: @kwiva/store-redis, @kwiva/auth-better-auth(via mcp? no — auth engine, CLI references via devDeps? actually it's a separate package)
```

**Key boundary note:** engines are NOT in the public dependency graph — `elysia`, `better-auth`, `tanstack`, `kysely`, `pglite`, `evlog` etc. live in package deps; app code imports only `@kwiva/*`.

***

## 4. Boundary rules (non-negotiable, enforceable by lint) [#4-boundary-rules-non-negotiable-enforceable-by-lint]

* **No engine imports in app code** (`no-engine-imports` lint gate — oxlint; ADR-0009).
* App code imports only `@kwiva/*` (ADR-0009).
* Package graph is acyclic (`test/functionality/engine-imports.test.ts`, graph tests).
* Stateless by construction: externalized state via public config sections; multi-instance safe.
* Jobs go through `@kwiva/jobs` queue (in-memory default, outbox for durable).

***

## 5. Examples (reference apps) [#5-examples-reference-apps]

| App                      | Packages                                  | Key files                                                                                                                                                                                    |
| ------------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `todo-app-m2` (0.0.3)    | core, data                                | `src/app/models/todo.ts`, `src/bootstrap/app.ts`, `src/config/{app,database}.ts`, `src/database/migrations/*`, `todo.test.ts`                                                                |
| `todo-app-m3` (0.0.3)    | core, data, events, http, mail            | `src/app/controllers/todo.ts`, `src/app/contracts/todos.ts`, `src/app/events/todo-created.ts`, `src/app/mail/todo-mail.ts`, Scalar OpenAPI docs mount                                        |
| `todo-app-m4-m7` (0.0.3) | all + cli, ui, auth, client, jobs, events | `src/bootstrap/{app,server}.ts`, `src/app/{auth,policies,jobs,tasks,events,mail,models,http}/*`, `src/ui/{pages,layouts}/*`, `src/.kwiva/types/route-tree.gen.ts`, tests in `test/*.test.ts` |
