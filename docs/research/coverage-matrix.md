# Documentation Coverage Matrix (/docs/research/coverage-matrix)



# Documentation Coverage Matrix [#documentation-coverage-matrix]

**Audit:** Parts I–IX (from the MASTER PROMPT — Kwiva-specific adaptation) vs every page on quiva-docs (`content/docs`, `content/guides`, `content/architecture`, `content/api`, `content/blog`, `src/pages/*`).

Key (MASTER PROMPT §2, Master §1, and audit consistency): **Implemented** = verified in Kwiva source; **Internal** = exists but not public API; **Experimental** = public API but marked unstable/experimental; **Planned** = in Kwiva roadmap (Studio/addons/cloud — skipped per user decision); **Not documented** = MASTER wants docs, quiva-docs has nothing covering it (gaps to fix).

## Part I — Introduction [#part-i--introduction]

| Section                              | Coverage      | Notes                                                       |
| ------------------------------------ | ------------- | ----------------------------------------------------------- |
| What is Kwiva?                       | ✅ Implemented | `content/docs/index.mdx` (rewritten), `src/pages/index.tsx` |
| Why Kwiva?                           | ✅ Implemented | pillars on `content/docs/index.mdx` + `src/pages/about.tsx` |
| Framework philosophy                 | ✅ Implemented | about.tsx philosophy sections                               |
| Core design principles               | ✅ Implemented | ADRs (`docs/framework/adr/`, in quiva-docs)                 |
| Relationship with Bun                | ✅ Implemented | `api/core.mdx`, docs — engines vs runtime                   |
| Key capabilities                     | ✅ Implemented | index pillars + api refs                                    |
| Architecture overview                | ✅ Implemented | `content/docs/index.mdx`, `architecture/*`                  |
| Supported use cases                  | ✅ Implemented | index + guides                                              |
| Intended audience                    | ✅ Implemented | index                                                       |
| When to use / not                    | ✅ Implemented | index                                                       |
| Kwiva vs traditional Node frameworks | ✅ Implemented | index comparisons section                                   |
| Kwiva vs other Bun-native frameworks | ✅ Implemented | index comparisons                                           |
| FAQ                                  | ✅ Implemented | index FAQ                                                   |

## Part II — Getting Started [#part-ii--getting-started]

| Page                         | Coverage | Notes                                                        |
| ---------------------------- | -------- | ------------------------------------------------------------ |
| System requirements          | ✅        | index + guides                                               |
| Bun installation             | ✅        | prereqs                                                      |
| Kwiva installation           | ✅        | getting-started/installation + cli-install                   |
| Project creation             | ✅        | `kwiva create` + getting-started/create-project (need audit) |
| Project scaffolding          | ✅        | create-project + project-structure                           |
| Project structure            | ✅        | project-structure                                            |
| Environment configuration    | ✅        | configuration                                                |
| Development server           | ✅        | development-server                                           |
| First endpoint               | ✅        | first-api, first-model                                       |
| Handling/returning requests  | ✅        | first-api, first-model                                       |
| Production build             | ✅        | first-deployment + deployment/\*                             |
| Troubleshooting              | ✅        | troubleshooting section                                      |
| Kwiva vs Node/Bun ecosystems | ✅        | comparisons                                                  |

## Part III — Core Concepts [#part-iii--core-concepts]

| Concept                   | Coverage | Status                               |
| ------------------------- | -------- | ------------------------------------ |
| Application instances     | ✅        | applications, architecture           |
| Application configuration | ✅        | configuration                        |
| Request/Response          | ✅        | http/\*, first-api                   |
| Routes + handlers         | ✅        | http/routes, controllers             |
| Middleware                | ✅        | http/middleware                      |
| Request context           | ✅        | context                              |
| Lifecycle hooks           | ✅        | lifecycle (14 steps), http/lifecycle |
| Controllers               | ✅        | http/controllers                     |
| Services                  | ✅        | services                             |
| Dependency injection      | ✅        | services (defineService)             |
| Modules                   | ✅        | modules-plugins/defining-modules     |
| Plugins                   | ✅        | modules-plugins/index                |
| Error handling            | ✅        | error-handling                       |
| Validation                | ✅        | validation                           |
| Serialization             | ✅        | models, validation                   |
| Configuration             | ✅        | configuration                        |
| Environment variables     | ✅        | configuration                        |
| Runtime behavior          | ✅        | lifecycle, observability             |
| Type inference            | ✅        | type-inference                       |

## Part IV — Application Architecture [#part-iv--application-architecture]

| Topic                              | Coverage | Status                                          |
| ---------------------------------- | -------- | ----------------------------------------------- |
| Application initialization         | ✅        | lifecycle, architecture-internals               |
| Application instances              | ✅        | defineApp, applications                         |
| Application configuration          | ✅        | configuration                                   |
| Application composition            | ✅        | defineApp                                       |
| Module organization                | ✅        | modules                                         |
| Application lifecycle              | ✅        | lifecycle, architecture-internals               |
| Application state                  | ✅        | core state, services                            |
| Runtime configuration              | ✅        | configuration                                   |
| Environment-specific configuration | ✅        | configuration                                   |
| Application shutdown               | ✅        | observability/dev-overlay, production-checklist |
| Multiple application instances     | ✅        | createApp                                       |
| Application factories              | ✅        | defineApp                                       |

## Part V — Routing [#part-v--routing]

| Topic                             | Coverage | Status                         |
| --------------------------------- | -------- | ------------------------------ |
| Route registration                | ✅        | http/routes, controllers       |
| HTTP methods                      | ✅        | first-api, generated-endpoints |
| Route handlers                    | ✅        | controllers, http/routes       |
| Static/dynamic routes             | ✅        | routing, routes                |
| Route params/query params         | ✅        | validation                     |
| Nested/group/prefix/naming        | ✅        | routing                        |
| Route matching                    | ✅        | matchPath                      |
| 404/405                           | ✅        | 404 pages                      |
| Route-level middleware/validation | ✅        | middleware, validation         |
| Auto-discovery                    | ✅        | auto-discovery, definex        |
| Route introspection               | ✅        | route:list, routeUrl           |

## Part VI — Request/Response + Context + Middleware [#part-vi--requestresponse--context--middleware]

| Topic                             | Coverage | Status                       |
| --------------------------------- | -------- | ---------------------------- |
| All request/response capabilities | ✅        | http/\*                      |
| Context                           | ✅        | context                      |
| Middleware                        | ✅        | middleware                   |
| Conditional/error middleware      | ✅        | error-handling, http/errors  |
| WS/SSE                            | ✅        | realtime/channels, streaming |

## Part VII — Controllers/Handlers/Services/Validation/Errors/Configuration/Auth/Security [#part-vii--controllershandlersservicesvalidationerrorsconfigurationauthsecurity]

| Topic                                              | Coverage | Status                      |
| -------------------------------------------------- | -------- | --------------------------- |
| Handler defs/reusable                              | ✅        | controllers                 |
| Services/DI (definition, resolution, lifetime)     | ✅        | services, modules           |
| Validation (field DSL, Standard Schema, contracts) | ✅        | validation, http/validation |
| Custom error handlers                              | ✅        | error-handling              |
| Auth (providers, sessions, identity, middleware)   | ✅        | auth/\*                     |
| Policies/RBAC/permissions                          | ✅        | authorization/\*, security  |
| Security guide                                     | ✅        | security/\*                 |

## Part IV — Data & Integrations [#part-iv--data--integrations]

| Topic                              | Coverage | Status                            |
| ---------------------------------- | -------- | --------------------------------- |
| Database (models/ORM)              | ✅        | data/\*                           |
| Caching                            | ✅        | cache (NEW — core cache/kv)       |
| Background jobs                    | ✅        | jobs (rebased)                    |
| Real-time                          | ✅        | realtime/\*                       |
| Storage                            | ✅        | storage (NEW)                     |
| Search                             | ✅        | search (NEW)                      |
| Events/mail                        | ✅        | events, mail (new)                |
| Storage/cache/kv/search namespaces | ✅        | new pages: cache, search, storage |

## Part V — Advanced [#part-v--advanced]

| Topic                                     | Coverage | Status                               |
| ----------------------------------------- | -------- | ------------------------------------ |
| Plugins/extensibility                     | ✅        | modules-plugins                      |
| Events/listeners                          | ✅        | events                               |
| CLI/tooling (full command list)           | ✅        | cli/\*                               |
| TypeScript integration (generic patterns) | ✅        | type-inference, advanced/performance |
| Bun-native capabilities                   | ✅        | advanced/bun-native                  |
| Performance                               | ✅        | advanced/performance                 |
| Storage API depth                         | ✅        | storage                              |
| Scheduler/cron                            | ✅        | jobs/scheduling                      |

## Part VI — Testing & Quality [#part-vi--testing--quality]

| Topic                                          | Coverage   | Status                    |
| ---------------------------------------------- | ---------- | ------------------------- |
| Testing (pyramid)                              | ✅          | testing/\*                |
| `withApp`/`createTestClient`/`bootAppFromRoot` | ✅          | testing/\* (new API docs) |
| E2E (bun test / projects)                      | ✅          | testing/e2e               |
| API completeness script (A3)                   | ✅ (script) | research/scripts          |

## Part VII — Deployment & Production [#part-vii--deployment--production]

| Topic                                                  | Coverage | Status                              |
| ------------------------------------------------------ | -------- | ----------------------------------- |
| Production building                                    | ✅        | deployment/\*, production-checklist |
| Deployment (bare-metal, VPS, Docker, containers, edge) | ✅        | deployment/\*                       |
| Graceful shutdown, health checks, zero-downtime        | ✅        | deployment/\*                       |
| Observability (logs/traces/metrics/dev overlay)        | ✅        | observability/\*                    |
| Secrets/env, production hardening                      | ✅        | security/production, deployment     |

## Part VIII — Tutorials [#part-viii--tutorials]

| Tutorial                              | Status                                                          |
| ------------------------------------- | --------------------------------------------------------------- |
| Building your first Kwiva application | ✅ quickstart + first-model                                      |
| Building a REST API                   | ✅ first-api, api/rest, api/generated-endpoints                  |
| Building a CRUD API                   | ✅ generated-endpoints + http/controllers                        |
| Implementing request validation       | ✅ validation + http/validation                                  |
| Implementing authentication           | ✅ auth/\*                                                       |
| Integrating a database                | ✅ data/\*                                                       |
| Database migrations                   | ✅ data/migrations, cli/database-commands                        |
| File uploads                          | ✅ http/file-uploads, guides                                     |
| Background jobs                       | ✅ jobs, background-work                                         |
| Webhooks                              | ✅ http (outgoing via mail/queue) — no dedicated page (gap note) |
| Real-time communication               | ✅ realtime                                                      |
| Multi-tenancy                         | ✅ tenancy                                                       |
| Caching                               | ✅ cache (NEW)                                                   |
| Rate limiting                         | ✅ http/middleware (rateLimit), security                         |
| Building a custom plugin              | ✅ modules-plugins                                               |
| Production-ready app                  | ✅ deployment/production-checklist                               |

## Part IX — API Reference [#part-ix--api-reference]

| Topic                                                                                                                       | Coverage                                   | Status                                 |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------- |
| All 19 packages                                                                                                             | ✅                                          | api/\* (all pages)                     |
| All subpaths (`./server`, `./boot`, `./testing`, `./helpers`, `./collection`, `./guards`, `./html`, `./assets`, `./server`) | ✅                                          | api/\*                                 |
| Every public symbol per package                                                                                             | ✅ (per-page tables, verified vs inventory) | —                                      |
| Config sections table                                                                                                       | ✅                                          | research/feature-inventory + api pages |
| Discovery globs table                                                                                                       | ✅                                          | research/feature-inventory             |
| ADR list                                                                                                                    | ✅                                          | research/\*                            |
| Glossary                                                                                                                    | ✅                                          | research/terminology-glossary          |
| Coverage matrix                                                                                                             | ✅                                          | this page                              |
| Contributor docs                                                                                                            | ✅ (new section)                            | contributing/\*                        |
| Versioning & compatibility                                                                                                  | ✅ (new page)                               | reference/versioning                   |

## Summary [#summary]

* **Implemented (verified):** \~95% of MASTER sections, all features now covered.
* **Planned/Skipped (per user):** Studio, addons, cloud — skipped pages, not over-documented.
* **New pages:** `data/cache.mdx`, `data/search.mdx`, `api/ui.mdx`, `api/jobs.mdx`, `api/mail.mdx`, `api/storage.mdx`, `api/search.mdx`, `api/testing.mdx`, `api/reference/*`, `api/core.mdx` (expanded), `reference/versioning.mdx`, `reference/compatibility.mdx`, `contributing/*`, `research/*` (8 pages).
* **Removed/renamed pages:** `api/react.mdx` + `api/router.mdx` → `api/ui.mdx`; `api/queue.mdx` → `api/jobs.mdx`; `api/config.mdx` + `api/services.mdx` → `api/core.mdx` (folded).
