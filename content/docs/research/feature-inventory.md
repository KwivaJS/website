---
title: Feature Inventory
description: "Every factory, command, config section, discovery glob, and ADR in Kwiva — where things live, what they do, when they were added (snapshot from kwivajs @ 552115f)."
status: implemented
---

# Feature Inventory

**Snapshot:** Kwiva framework repo at `552115f` (main; packages at 0.2.0 RC-era). All features below are verified against source. `Studio`, `addons`, `cloud` are explicitly **not** in the inventory (they are roadmap on the framework side).

---

## 1. Factories (`defineX` — one grammar across packages)

| Factory | Package | Location (`packages/<pkg>/src/...`) | Notes |
|---|---|---|---|
| `defineApp` | `@kwiva/core` | `app/define-app.ts` | returns `{name, models?, controllers?, middleware?, services?, policies?, pages?, jobs?, events?, commands?, macros?, state?, decorate?, resolve?}` additive |
| `defineConfig` | `@kwiva/core` | `config/define-config.ts` | section validator |
| `defineService` | `@kwiva/core` | `app/define-service.ts` | `(factory: (ctx: {context: AppContext}) => T) => ServiceFactory<T>` |
| `defineModel` | `@kwiva/data` | `model/define-model.ts` | `(factory: (f: FieldsApi) => F, options?) => Model<...>` |
| `defineController` | `@kwiva/http` | `controller/define-controller.ts` | `{prefix?, middleware?, middlewareGroups?, routes(api)}` |
| `defineContract` | `@kwiva/http` | `controller/define-contract.ts` | typed request/response contracts |
| `defineMiddleware` | `@kwiva/http` | `middleware/define-middleware.ts` | `defineMiddleware(step) => Middleware{step, preflight?}` |
| `definePage` | `@kwiva/ui` | `pages/define-page.ts` | SSR pages (free-form or `(path, options)`) |
| `defineIsland` | `@kwiva/ui` | `islands/define-island.ts` | client islands |
| `defineJob` | `@kwiva/jobs` | `job/define-job.ts` | validated, frozen, const-suffix identity |
| `defineTask` | `@kwiva/jobs` | `job/define-task.ts` | `{schedule?, description?, preventOverlapping, onSuccess?, onFailure?, handler}` |
| `defineEvent` | `@kwiva/events` | `event/define-event.ts` | `{broadcast?, broadcastOn?, broadcastAs?, broadcastWith?, broadcastWhen?, listeners?, queued?, schema?}` |
| `defineListener` | `@kwiva/events` | `listener/*` | `{on, handle, failed?, shouldHandle?, queue?}` |
| `defineSubscriber` | `@kwiva/events` | `subscriber/define-subscriber.ts` | `{name?, events}` |
| `defineMail` | `@kwiva/mail` | `mail/define-mail.ts` | `{to, from?, cc?, bcc?, replyTo?, subject, render(data), html?, markdown?, text?, tags?, metadata?, attachments?}` |
| `defineMcpTool` | `@kwiva/mcp` | `tool/define-mcp-tool.ts` | `{description?, input, ability, handler}` |
| `definePolicy` | `@kwiva/auth` | `policy/define-policy.ts` | deny-by-default, frozen |
| `defineGate` | `@kwiva/auth` | `gate/*` | `{kind:"gate"}` frozen |
| `defineBetterAuth` | `@kwiva/auth-better-auth` | `define-better-auth.ts` | sealed adapter (server-facing) |
| `defineCommand` | `@kwiva/cli` | `command/define-command.ts` | `{name, description?, options?, handler(options)}` |

**Companion DSLs:** `defineMigration`, `defineSeeder`, `defineFactory` (@kwiva/data); `defineMcpTool` (@kwiva/mcp); `RedisStore`/`defineRedisStore`/`installRedisStore` (@kwiva/store-redis); `SmtpTransport`/`defineSmtpTransport` (@kwiva/mail-smtp); `ResendTransport`/`defineResendTransport` (@kwiva/mail-resend); `PgBossQueue`/`definePgBossQueue` (@kwiva/jobs-pg-boss).

**Storage (data):** `defineStorageDriver` — files-sdk adapter seam (sealed in `storage/files-adapter.ts`), drivers: local/memory/s3/gcs/azure/vercel-blob.

---

## 2. CLI commands (`kwiva` binary — `packages/cli`)

### Framework commands

| Command | Args/Flags | Behavior |
|---|---|---|
| `create <name>` | `kwiva create <name>` | Validated name `^[a-z][a-z0-9-]*$`; refuses if exists. Scaffolds `bootstrap/`, `src/config/` (app, database, cache, kv, storage, mcp), `src/app/models/`, `src/app/http/controllers/`, `src/database/migrations/`, `src/database/seeders/`, `package.json` scripts (dev/build/test). |
| `dev` | `kwiva dev [--port <n>]` | Dev server (supervises child, rebuilds, `src/.kwiva/serve.gen.ts`, SSE reload). `--port` default 3000; exits 0 on SIGINT/SIGTERM. |
| `build` | `kwiva build [--out <dir>]` | Client bundle → `src/.kwiva/entry.client.tsx` → `<out>/client`. Default out `dist`. Prints `kwiva build → <outFile> (<routes> routes, <pages> pages)`. |
| `test` | `kwiva test [-- <args>]` | `bun test` in app root; exit code passthrough. |
| `migrate` | — | Apply all migrations from `src/database/migrations`. |
| `migrate:status` | — | Prints `applied: …` / `pending: …`. |
| `migrate:down` | — | Roll back last batch. |
| `migrate:generate` | — | Generate diffs from model IR (`migrateGenerate(models)`). |
| `seed` | `kwiva seed [name]` | Run all seeders (or one by name). |
| `task <name>` | — | Run one task by name (`runTask`). |
| `route:list` | — | Print `METHOD  fullPath  routeId` lines. |
| `key:generate` | — | Append `APP_KEY=<base64 32B>` to `.env` (mode 0600, refuses to overwrite). |
| `storage:sync <from> <to>` | `[--prune] [--dry-run]` | Copy objects between disks; skips unchanged; `--prune` deletes target-only. |
| `storage:clear [disk]` | `[--force]` | Clear a disk (s3/gcs/azure need `--force`). |
| `search:reindex [model]` | — | Requires `database` section; `reindexSearch` per model. |
| `mcp` | — | Serve MCP on stdio (auth forced `none`) with generated model + custom tools. |
| `mcp:print-config` | — | Print agent config JSON (`mcpServers.kwiva{url, headers}`). |
| `doctor` | — | Validate storage/search/mcp; `ok`/`fail` output; exit 1 on failure. |
| `config-sections` | — | Boot-seam helper (`applyConfigSections`). |

### App commands (`defineCommand`, `src/app/commands/`)

Discovered flat from `src/app/commands/`; required export shape: `{name: string, handler: fn}`. Parsed flags: `--name=value` / `--name value`; `optionKind`: boolean-default → `flag`, else `option`; defaults applied; `required` honored; `-h`/`--help` → generated help; errors → stderr + exit 1; unknown option/extra args → error.

### Generators (`kwiva make:*` — 19 kinds)

| Kind | Target folder (app-root relative) | Files | Dated? | Suffix |
|---|---|---|---|---|
| `config` | `src/config` | `.ts` | — | — |
| `service` | `src/app/services` | `.ts` (`Service` suffix) | — | `Service` |
| `model` | `src/app/models` | `.ts` | — | — |
| `controller` | `src/app/http/controllers` | `.ts` (`Controller`) | — | `Controller` |
| `middleware` | `src/app/http/middleware` | `.ts` (`Middleware`) | — | `Middleware` |
| `contract` | `src/app/http/contracts` | `.ts` (`Contract`) | — | `Contract` |
| `policy` | `src/app/policies` | `.ts` (`Policy`) | — | `Policy` |
| `gate` | `src/app/policies` | `.ts` (`Gate`) | — | `Gate` |
| `job` | `src/app/jobs` | `.ts` (`Job`) | — | `Job` |
| `task` | `src/app/tasks` | `.ts` (`Task`) | — | `Task` |
| `event` | `src/app/events` | `.ts` (`Event`) | — | `Event` |
| `listener` | `src/app/events` | `.ts` (`Listener`) | — | `Listener` |
| `mail` | `src/app/mail` | `.ts` (`Mail`) | — | `Mail` |
| `factory` | `src/database/factories` | `.ts` (`Factory`) | — | `Factory` |
| `migration` | `src/database/migrations` | `.ts` (`Migration`) | ✅ `YYYYMMDDHHMMSS_` | `Migration` |
| `seeder` | `src/database/seeders` | `.ts` (`Seeder`) | — | `Seeder` |
| `page` | `src/ui/pages` | `.tsx` (`Page`) | — | `Page` |
| `mcp-tool` | `src/app/mcp/tools` | `.ts` (`Tool`) | — | `Tool` |
| `command` | `src/app/commands` | `.ts` (`Command`) | — | `Command` |

Behavior: refuses overwrite, `created <path>` output, template bodies are minimal valid `defineX` shapes (e.g., `defineController({prefix: "/${base}", routes: (api) => api.get("/", () => ({ok: true}))})`).

---

## 3. Config sections (`src/config/*.ts`, discovered + validated)

| Section | Where | Option shape |
|---|---|---|
| `app` | core | `{name?, port?: int (validated), host?}` — loader default `{port:3000, host:"localhost"}` |
| `logger` | core | `{level?: "debug"\|"info"\|"warn"\|"error", sink?}` — default `{level:"info", sink:"console"}` |
| `cache` | core | `{driver?: StoreDriverName, prefix?: string (default "kwiva"), defaultTtl?: number ms (default 60000; 0 = never), tags?: boolean (true), file?: {dir ("./var/cache")}, url?, swrGraceMs?: number (60000), waitUntil?: fn}` |
| `kv` | core | `{driver?: StoreDriverName, namespace?: string (default "app"), defaultTtl?: number (300000), file?: {dir ("./var/kv")}, url?}` |
| `database` | data | `DatabaseConfig{driver: "pglite"\|"postgres" (required), dataDir?, url?, host?, port?, database?, username?, password?, pool?: PoolConfig{max?, idleTimeout?, connectionTimeout?, maxLifetime?}}` |
| `tenancy` | data | `TenancyConfig{defaults: {mode: "domain"\|"path"\|"header"\|"fixed"\|"org"\|"none" (default "path"), tenantField: string (default "tenant_id"), models: "*"\|string[] (default "*"), cache: {scoped: boolean (default true)}, storage: {scoped: boolean (default true)}}}` |
| `auth` | auth | `AuthConfig{providers: AuthProviderConfig[], session: AuthSessionConfig{secret (non-empty), maxAge (positive, seconds; default 604800), cookie?: {name?, httpOnly?, secure?, sameSite?: "lax"\|"strict"\|"none", path?, domain?}}, register?: {createUser(input), minPasswordLength?: int ≥ 1}, remember?: {maxAge?, cookie?}, rateLimit?: {login?: {max, windowMs}}, trustProxy?: boolean\|int ≥ 0}` |
| `client` | client | `ClientConfig{baseUrl (required, non-empty), headers?, credentials?: "omit"\|"same-origin"\|"include", fetch?, onError?, websocket?: {url, reconnect?: {enabled?, delay?, maxAttempts?}, headers?}}` |
| `jobs` | jobs | `JobsConfig{driver: "memory", defaultQueue?, concurrency?, scheduler?: {enabled?, tickMs?, timezone?}, connections?: Record<string, {priority?}>}` — default `{driver:"memory"}` |
| `events` | events | `EventsConfig{driver?: "sync"\|"queued", prefix?}` |
| `mail` | mail | `MailConfig{transport?: "memory"\|"console"\|"smtp"\|"sendgrid"\|"resend", from?}` (applied via `setMailConfig` in boot seam) |
| `storage` | storage | `StorageConfig{default?: string, disks?: Record<string, DiskConfig{driver: "local"\|"memory"\|"s3"\|"gcs"\|"azure"\|"vercel-blob", root?, publicUrl?, options?}>, tenant?: StorageTenantConfig{scoped?, prefix?}}` |
| `mcp` | mcp | `McpConfig{enabled?, route? (starts with "/", default "/mcp"), transport?: "streamable"\|"stdio" (default "streamable"), auth?: "session"\|"bearer"\|"none" (default "session"; `none` only with stdio), models?: string[], controllers?: string[], readOnly?: boolean (false), scopes?: string[], requireTenant?: boolean (false)}` |
| `search` | search | `SearchConfig{engine: "postgres", language? (must match Postgres regconfig pattern)}` |

(`cache`/`kv` sections have **no file** — applied via `initCache`/`initKv`; `database` section is handled by `configureDatabase`; all section files discovered by filename in `src/config/`.)

---

## 4. Discovery glob conventions (`packages/core/src/app/discover.ts`)

`discoverKind(root, kind)` scans `DEFAULT_FOLDERS[kind]`:

| Kind | Folder | Mode | Notes |
|---|---|---|---|
| `models` | `src/app/models` | flat | extensions `.ts/.tsx`, no `.d.ts`, no `.test.ts` |
| `services` | `src/app/services` | flat | same |
| `policies` | `src/app/policies` | flat | `definePolicy`/`defineGate` detected by export shape |
| `jobs` | `src/app/jobs` | flat | — |
| `events` | `src/app/events` | flat | `defineEvent` + `defineListener` in same folder |
| `tasks` | `src/app/tasks` | flat | `runTask` callers discoverable via `defineTask` |
| `commands` | `src/app/commands` | flat | required `{name, handler}` exports |
| `controllers` | `src/app/http/controllers` | flat | — |
| `middleware` | `src/app/http/middleware` | flat | — |
| `pages` | `src/ui/pages` | **recursive** | route derived from relative path: `index` dropped, `$x`→`:x`, `$`→`*` |

Registration: object exports keyed by const name (`exported const`). `assembleApp(app, root)` = `discoverUnits` + additive merge (dedupe by name; throws on conflicts) + `derivePageRoute` for pages.

**Related globs outside `DEFAULT_FOLDERS`:**
- `discoverKind(root, "commands")` — CLI app commands (`src/app/commands/`).
- Migrations: `src/database/migrations` — recursive-ish flat (`readdirSync`, `*.ts/*.tsx/*.js`, no `.d.ts`), applied in name order.
- Seeders: `src/database/seeders` — same flat shape.
- MCP tools: `src/app/mcp/tools` — `Bun.Glob("**/*.{ts,tsx}")` recursive, skips `*.test.ts`.
- Client bundles: `src/ui/pages` + `src/ui/layouts` — recursive, route-derived; codegen → `src/.kwiva/types/route-tree.gen.ts`, `src/.kwiva/entry.client.tsx`.
- Mail: `src/app/mail` is **not** in `DEFAULT_FOLDERS` — config-driven (`setMailConfig` in boot seam).

---

## 5. Versioning (per repo: changesets + no tags + `main` branch)

| Scope | Version | Notes |
|---|---|---|
| Root `kwiva` (workspace root) | `0.0.0` | private, builds all packages |
| `@kwiva/core` | `0.2.0` | — |
| `@kwiva/data` | `0.2.0` | — |
| `@kwiva/http` | `0.2.0` | — |
| `@kwiva/ui` | `0.2.0` | — |
| `@kwiva/client` | `0.2.0` | — |
| `@kwiva/auth` | `0.2.0` | — |
| `@kwiva/jobs` | `0.2.0` | — |
| `@kwiva/events` | `0.2.0` | — |
| `@kwiva/mail` | `0.2.0` | — |
| `@kwiva/mcp` | `0.1.0` | — |
| `@kwiva/search` | `0.1.0` | — |
| `@kwiva/storage` | `0.1.0` | — |
| `@kwiva/testing` | `0.1.0` | — |
| `@kwiva/cli` | `0.3.0` | — |
| `@kwiva/auth-better-auth` | `0.0.1` | — |
| `@kwiva/jobs-pg-boss` | `0.0.1` | — |
| `@kwiva/mail-smtp` | `0.0.1` | — |
| `@kwiva/mail-resend` | `0.0.1` | — |
| `@kwiva/store-redis` | `0.0.1` | — |

All engines: `bun >= 1.4.0`. `"type": "module"`, publish `dist/`, `.d.ts.map`s. Changesets workflow (`@changesets/cli`, `access: public`, `updateInternalDependencies: patch`); latest release commit at `552115f`; **no git tags**.
