---
title: Terminology Glossary
description: "Canonical Kwiva term glossary — one definition per concept, used across all Kwiva docs (snapshot). Keep every page's terminology consistent with this."
status: implemented
---

# Terminology Glossary

Canonical definitions for Kwiva terms — **always use these exact terms and meanings** in every doc page. This file is the source of truth; `core-concepts/definex.mdx`, `api/*.mdx`, and all concept pages must use the same language.

| Term | Definition | Where defined (source) |
|---|---|---|
| **Kwiva** | The batteries-included TypeScript application framework. | `framework/README.md` |
| **DefineX** | The single grammar convention — one `defineX` factory for every app-facing construct. | core |
| **Factory** | A declarative, serializable construct function (`defineModel`, `defineController`, …). | core |
| **Engine** | The machine running an app: Kwiva owns engine packages (`kysely`, `elysia`, `better-auth`, …); hidden from app code by lint gates. | core |
| **Package** | The public units `@kwiva/*` app code imports (19 packages). | core |
| **Sealed** | Engine packages are `sealed` — app code may not import them. | core |
| **`defineApp`** | Application composition factory — wires models, controllers, middleware, services, pages, jobs, events, commands. | core |
| **`defineModel`** | Data model factory — one source of truth; derives schema, migrations, REST, client, MCP, audit. | data |
| **`defineController`** | HTTP controller factory — routes + handlers. | http |
| **`defineContract`** | Typed request/response contract. | http |
| **`defineMiddleware`** | Middleware factory. | http |
| **`definePage`** | Frontend page factory (`@kwiva/ui`). | ui |
| **`defineJob`** | Background job factory (`@kwiva/jobs`). | jobs |
| **`defineTask`** | Scheduled task factory. | jobs |
| **`defineEvent`** | Pub/sub event factory (`@kwiva/events`). | events |
| **`defineListener`** | Event listener factory. | events |
| **`defineSubscriber`** | Subscriber factory. | events |
| **`defineMail`** | Mail factory (`@kwiva/mail`). | mail |
| **`defineMcpTool`** | MCP tool factory. | mcp |
| **`definePolicy`** | Authorization policy factory. | auth |
| **`defineGate`** | Gate factory (public hook only). | auth |
| **Model IR** | `ModelDefinition` — serialized intermediate representation. | data |
| **Derivation** | IR → artifacts (schema, migrations, REST, client, MCP…). | core+data |
| **Discovery** | Convention-based registration via `src/app/**` globs. | core |
| **Dispatch** | `dispatch`/`dispatchSync`/`dispatchChain`/`dispatchBatch` — putting jobs into the queue. | jobs |
| **Worker** | `startWorker` loop; drains queue. | jobs |
| **Scheduler** | `startScheduler`/`parseCron` — cron-based runs. | jobs |
| **Cron** | 5-field expression; Kwiva supports `@yearly`…`@minutely` macros. | jobs |
| **Outbox** | Transactional events-to-jobs queue (`enqueueOutbox`/`drainOutbox`). | jobs |
| **Contract** | Typed input/output contract on routes. | http |
| **Middleware** | Global/group/route pipeline stage. | http |
| **SSR** | Server-side rendering by Kwiva-owned orchestrator. | ui |
| **Island** | Client-hydrated component in SSR pages. | ui |
| **`defineContract`** | (see Contract) | http |
| **Cache** | `Cache` class / `initCache` (Keyv v6 sealed, tags, TTL). | core |
| **KV** | `Kv` class / `initKv` (Keyv v6 sealed, namespaces). | core |
| **Store** | Raw key-value store abstraction; drivers: memory, file, sqlite, redis, postgres. | core |
| **Storage** | `Storage` class/`initStorage` (files-sdk disks). | storage |
| **Disk** | `Disk` instance — one configured filesystem-like storage. | storage |
| **Signed URL** | Token-based public URL with expiry. | storage |
| **Tenancy** | `TenancyConfig` — multi-tenant access rules. | data |
| **Scope** | `QueryBuilder.scope/withoutGlobalScopes`. | data |
| **Standard Schema** | Shared validation schema interface (`StandardSchema`). | core |
| **ValidationError** | HTTP 422-class; `fields` = field-mapped issues. | core/http |
| **ErrorCode** | The 8-code taxonomy (BAD_REQUEST…STORAGE_TENANT_REQUIRED). | core |
| **Client** | `@kwiva/client` — TanStack Query + Eden adapter; `initClient`. | client |
| **FormData** | (for `useUpload`) — multipart body. | client |
| **WASM?** (avoid) | — | — |
| **Route tree** | Generated `src/.kwiva/types/route-tree.gen.ts` (TS-only typing). | cli/ui |
| **Session** | `Session` — auth session state (core ALS + auth). | auth |
| **AuthScope** | `Symbol.for("kwiva.authScope")` ambient scope. | core/auth |
| **`defineMcpTool`** | (see MCP Tool) | mcp |
| **Transport** | Sealed destination/transport for an async "send" — `Transport` on Mail; jobs go to QueueEngine. | mail/jobs |
| **Cron macro** | e.g. `@yearly`, `@minutely` (supported). | jobs |
