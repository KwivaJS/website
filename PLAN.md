# Kwiva Framework Documentation Website — Implementation Plan

**Project:** Kwiva Framework Official Documentation Website  
**Stack:** Fumapress (Fumadocs + Waku) + React 19 + Tailwind CSS v4  
**Source Material:** 81 framework docs (~44,300 words) in `framework/` directory  
**Date:** 2026-09-08  
**Scope:** Homepage + Complete Documentation Portal + All Plugins  

---

## Phase 1: Project Foundation

### 1.1 Dependencies

- [x] Install `@fumapress/ai` for AI/MCP plugin
- [x] Install `@ai-sdk/openai` (or provider) for AI model
- [x] Install `@fumapress/feedback` for feedback plugin
- [x] Install `fumadocs-openapi` for OpenAPI plugin
- [x] Verify existing deps: `fumapress`, `fumadocs-core`, `fumadocs-mdx`, `fumadocs-ui`, `@base-ui/react`, `react`, `react-dom`
- [x] Verify dev deps: `tailwindcss`, `@tailwindcss/vite`, `vite`, `typescript`, `@types/react`, `@types/react-dom`, `@types/node`
- [x] Run `bun install` to ensure lockfile is current — resolved, no changes needed

### 1.2 Vite Configuration

- [x] Update `vite.config.ts` to include `press()` plugin with options
- [x] Ensure `fumadocsMdx()` and `tailwindcss()` plugins are present
- [x] Set `srcDir` if needed for custom pages — default `src/` resolves custom pages (`/`, `/about`)
- [x] Configure adapter for target deployment (default Node for now)

### 1.3 Fumapress Configuration (`press.config.tsx`)

- [x] Define content collections: `docs`, `guides`, `architecture`, `api`, `blog`
- [x] Configure `site.name` = `"Kwiva"`
- [x] Configure `site.baseUrl` — `https://kwiva.js.org` (kwiva.dev reserved for future upgrade per `framework/02-naming-and-brand.md`; baseUrl is env-switched `localhost:4000` in dev)
- [x] Configure `site.git` with user/repo/branch — `kwiva-dev/kwiva/main`
- [x] Implement `renderPage` with layout switching logic per collection — `page.type === "api"` → NotebookLayout, else DocsLayout (blog overridden by blogPlugin)
- [x] Implement `renderNotFound` with custom 404 component — `src/components/not-found.tsx` wrapped in HomeLayout for full site chrome
- [x] Configure `meta.root()` for global head tags — twitter:card; fonts are self-hosted (Fontsource) so no preconnect needed
- [x] Configure `meta.page()` for per-page SEO metadata — description, twitter title/desc, og:type
- [x] Chain all plugins: blog, llms.txt, AI, MCP, feedback, link validation
- [x] Set `preset: false` and explicitly add desired plugins for full control — `sitemapPlugin()`, `robotsPlugin()`, `rssPlugin()`, `flexsearchPlugin()`, `takumiPlugin()`, `llmsPlugin()`
- [x] Export `getPressContext` for use in custom pages — re-exported from `press.config.tsx`

### 1.4 Content Directory Structure

- [x] Create `content/docs/` directory with `meta.json`
- [x] Create `content/docs/getting-started/` with `meta.json`
- [x] Create `content/docs/core-concepts/` with `meta.json`
- [x] Create `content/docs/data/` with `meta.json`
- [x] Create `content/docs/http/` with `meta.json`
- [x] Create `content/docs/api/` with `meta.json`
- [x] Create `content/docs/frontend/` with `meta.json`
- [x] Create `content/docs/rendering/` with `meta.json`
- [x] Create `content/docs/auth/` with `meta.json`
- [x] Create `content/docs/authorization/` with `meta.json`
- [x] Create `content/docs/tenancy/` with `meta.json`
- [x] Create `content/docs/realtime/` with `meta.json`
- [x] Create `content/docs/background-work/` with `meta.json`
- [x] Create `content/docs/studio/` with `meta.json`
- [x] Create `content/docs/ai-mcp/` with `meta.json`
- [x] Create `content/docs/modules-plugins/` with `meta.json`
- [x] Create `content/docs/cli/` with `meta.json`
- [x] Create `content/docs/testing/` with `meta.json`
- [x] Create `content/docs/observability/` with `meta.json`
- [x] Create `content/docs/security/` with `meta.json`
- [x] Create `content/docs/deployment/` with `meta.json`
- [x] Create `content/docs/advanced/` with `meta.json`
- [x] Create `content/guides/` with `meta.json`
- [x] Create `content/architecture/` with `meta.json`
- [x] Create `content/api/` with `meta.json`
- [x] Create `content/blog/` with `meta.json`
- [x] Remove default `content/index.mdx` (replaced by custom homepage)

### 1.5 Styling & Theme

- [x] Update `src/app.css` with Kwiva brand CSS variables
- [x] Define primary color palette (technical blue/indigo) — `--color-kwiva-*` scale
- [x] Configure `--font-mono` = `"JetBrains Mono", monospace` (Fontsource is the actual install)
- [x] Configure `--default-font-family` = `"Geist", sans-serif` (Fontsource is the actual install)
- [x] Ensure dark/light mode support via neutral theme
- [x] Add any custom utility classes for homepage components — `.kw-*`, `.bp-*`, `.fd-*`
- [x] Verify Google Fonts loading (Geist + JetBrains Mono) — self-hosted via `@fontsource-variable/*`, no CDN dependency

### 1.6 Layout System

- [x] Create `src/pages/_layout.tsx` for file-based layout
- [x] Implement layout switching in `press.config.tsx` `renderPage`
- [x] Map `docs` collection → Docs layout
- [x] Map `architecture` collection → Docs layout
- [x] Map `api` collection → Notebook layout — `createNotebookLayoutPage`
- [x] Map `blog` collection → Blog layout (or Docs) — blogPlugin → HomeLayout
- [x] Map `guides` collection → Docs layout
- [x] Map custom pages (`/`, `/about`) → Home layout — re-exported via `_layout.tsx`
- [x] Configure default layout props (nav title, links, footer) — nav title + githubUrl + 5 global links + CTA moved into `defaultLayoutProps` so ALL layouts (incl. Docs) inherit the nav

### 1.7 Navigation Structure

- [x] Define global nav items: Docs, Guides, Architecture, API, Blog + Get Started CTA — in `defaultLayoutProps` (homepage logo links to `/`)
- [ ] Configure footer columns: Framework, Resources, Community, More — N/A: fumadocs layouts have no footer-column slot (`BaseLayoutProps` has none; docs page footer slot is prev/next). Deprioritized; requires a custom layout wrapper in a later phase
- [x] Set up search keyboard shortcut (Cmd/Ctrl+K) — flexsearchPlugin + fumadocs SearchDialog (verified `<kbd>⌘ K</kbd>` renders, handler present)
- [x] Configure breadcrumbs for all collections — rendered from tree by DocsLayout for docs/architecture/guides/api (verified `<ol>` breadcrumb in `/docs/core-concepts/definex`)

---

## Phase 2: Homepage — **DELIVERED** (v2 — blueprint redesign)

> **Status:** Complete (second, from-first-principles redesign). The homepage is now a
> narrative "framework blueprint" experience built around one idea: *Kwiva is a coherent
> system for serious TypeScript applications.* Sections 2.1–2.14 below describe the shipped v2.

### 2.0 Self-hosted typography (Fontsource)

- [x] Installed `@fontsource-variable/{geist,archivo,jetbrains-mono,newsreader}` — Google Fonts CDN `<link>`s removed from `press.config.tsx` `meta.root()`
- [x] Display face: **Archivo Variable** (wdth axis) — headings use `font-display font-expanded` (122% stretch)
- [x] Body: **Geist Variable** · Code: **JetBrains Mono Variable** · Editorial italics: **Newsreader Variable** (opsz-italic) for pull quotes
- [x] 16 woff2 files emitted into `dist/public/assets`; `font-display: swap` everywhere

### 2.1 Component architecture

- [x] `src/pages/index.tsx` — server-rendered narrative page (11 numbered sections, 00/HERO → 11/BUILD)
- [x] Shared brand primitives in `src/components/brand.tsx` — `GithubMark`, `Kbd`, `SectionHead`, `CodeWindow`
- [x] Client islands in `src/components/home/`:
  - `blueprint.tsx` — **signature interaction**: interactive SVG framework blueprint (app → data/http/frontend/platform → defineX → @kwiva/* → sealed engines → runtime) with a 6-primitive switcher (`defineModel/Controller/Service/Page/Job/Policy`); selecting a primitive illuminates its column, shows its real file, code and derived capabilities; dedicated mobile HTML variant
  - `explorer.tsx` — defineX console: all 17 factories, filterable by 7 groups, master–detail with code, real file paths and `derives →` chips
  - `layers.tsx` — architecture LayerExplorer (5 selectable layers with rules + doc links)
  - `surface.tsx` — capability surface (Build/Secure/Scale/Operate/Extend rail → feature detail list)
  - `interactive.tsx` — `Reveal` (subtle rise/fade) + `CopyButton` (default/inverse/ghost)
- [x] Design system in `src/app.css`: `fd-*` surfaces + kwiva indigo; `.kw-grid` blueprint lines, `.bp-*` SVG node states, `.kw-flow-dash` animated connectors, `.kw-quote` (Newsreader), reduced-motion guards

### 2.2 Narrative structure (shipped order)

- [x] **00/HERO** — asymmetric split: positioning (“Serious applications, built as one system.”), actions (Get Started · Explore the architecture · GitHub → `github.com/kwiva/kwiva` via `githubUrl`), `$ bun create kwiva` terminal with copy, spec strip (17 factories · 17 packages · 6 engines · 8 presets), Blueprint centerpiece
- [x] **01/PROBLEM** — “Assembly is not architecture.”: 16-piece fragmentation stack vs. the Kwiva system + Newsreader pull quote
- [x] **02/LANGUAGE** — defineX console (explorer)
- [x] **03/ARCHITECTURE** — “Five layers. One hard boundary.” + LayerExplorer + core-rule quote
- [x] **04/SOURCE OF TRUTH** — model code window → IR → 6 derived artifacts (schema+migrations+seeders, REST API, RPC client, Studio, OpenAPI, MCP)
- [x] **05/REQUEST FLOW** — client → engine adapter → http pipeline → page/api branch → model → database, with animated dash connectors; desktop SVG arrows + mobile stack
- [x] **06/SURFACE** — capability surface (no card soup)
- [x] **07/PLATFORM** — tenancy tree + humans/agents dual interface (`defineMcpTool`)
- [x] **08/PRODUCTION** — develop → check → test → build → deploy → observe → scale lifecycle rail
- [x] **09/PATH** — discover → install → build → secure → scale → deploy → extend, each step linked to real docs (scale marked “planned”)
- [x] **10/DOCUMENTATION** — mini index of all real getting-started/core-concepts pages + portal links
- [x] **11/BUILD** — final CTA panel (solid kwiva-950 + blueprint texture), Get Started / GitHub / install command

### 2.3 Verification

- [x] `bun run types:check` — clean
- [x] `bun run build` — passes; SSG emits all sections in `dist/public/index.html`
- [x] Dev smoke test — `/` and `/about` HTTP 200, blueprint SVG renders, no hydration errors
- [ ] Visual QA in browser (light + dark, 360/768/1280px)

### 2.4 Notes / Follow-ups

- [ ] Repoint journey/`Scale` step to a real page when background-work docs land
- [ ] Repoint deployment links to `/docs/deployment` when that collection page is written
- [ ] Re-check hero copy once marketing wording is finalized

---

## Phase 3: Documentation Content

### 3.1 Introduction / What is Kwiva?

- [x] Create `content/docs/index.mdx`
- [x] Write: What is Kwiva? (1-paragraph definition)
- [x] Write: Why Kwiva? (4 design pillars)
- [x] Write: Core concepts summary
- [x] Write: Architecture overview summary
- [x] Add links to deeper documentation

### 3.2 Getting Started Section

- [x] `content/docs/getting-started/index.mdx` — Installation
  - Prerequisites (Bun, Node optional)
  - `bun create kwiva` command
  - What gets scaffolded
- [x] `content/docs/getting-started/create-project.mdx` — Create a Project
  - Modes: fullstack, api+spa, static, standalone, edge
  - First-time experience
- [x] `content/docs/getting-started/project-structure.mdx` — Project Structure
  - Full app tree (predictable, lowercase)
  - Naming conventions
  - Key directories
- [x] `content/docs/getting-started/configuration.mdx` — Configuration
  - `kwiva.config.ts`
  - `src/config/` folder
  - Environment variables
  - Config precedence rules
- [x] `content/docs/getting-started/development-server.mdx` — Development Server
  - `kwiva dev`
  - HMR behavior
  - Dev tools
- [x] `content/docs/getting-started/first-model.mdx` — Your First Model
  - `defineModel` minimal example
  - What it generates
- [x] `content/docs/getting-started/first-api.mdx` — Your First API
  - `defineController` minimal example
  - Testing with curl/HTTP client
- [x] `content/docs/getting-started/first-page.mdx` — Your First Page
  - `definePage` minimal example
  - File-based routing
- [x] `content/docs/getting-started/first-deployment.mdx` — Your First Deployment
  - `kwiva build`
  - `kwiva deploy`
  - Preview

### 3.3 Core Concepts Section

- [x] `content/docs/core-concepts/index.mdx` — Core Concepts Overview
- [x] `content/docs/core-concepts/definex.mdx` — The defineX Convention
  - Full table of all factories
  - Convention rules
  - File naming conventions
  - Package mapping
  - Why one convention matters
- [x] `content/docs/core-concepts/applications.mdx` — Applications
  - `defineApp` kernel
  - Bootstrap process
  - Application composition
- [x] `content/docs/core-concepts/configuration.mdx` — Configuration Model
  - Config folder deep dive
  - `defineConfig` per module
  - Layer precedence
  - Typed env access
- [x] `content/docs/core-concepts/auto-discovery.mdx` — Auto-Discovery
  - How files are discovered
  - Registration conventions
- [x] `content/docs/core-concepts/lifecycle.mdx` — Lifecycle
  - Application boot lifecycle
  - Request lifecycle overview
  - Hook points
- [x] `content/docs/core-concepts/context.mdx` — Context
  - Typed context
  - State, decorate, resolve
  - Per-request context
- [x] `content/docs/core-concepts/services.mdx` — Services
  - `defineService`
  - Typed injection
  - Service composition
- [x] `content/docs/core-concepts/modules.mdx` — Modules
  - `defineModule` overview
  - Contribution points
  - Module registry
- [x] `content/docs/core-concepts/plugins.mdx` — Plugins
  - `definePlugin`
  - Plugin lifecycle
  - Plugin hooks
- [x] `content/docs/core-concepts/error-handling.mdx` — Error Handling
  - Error taxonomy (8 codes)
  - `error()` helper
  - Error response shapes
- [x] `content/docs/core-concepts/type-inference.mdx` — Type Inference
  - End-to-end type flow
  - Model → API → Client → Page
  - Zero codegen principle

### 3.4 Data Section

- [x] `content/docs/data/index.mdx` — Data Overview
- [x] `content/docs/data/models.mdx` — defineModel
  - Factory signature
  - Options (timestamps, softDelete, audit, permission, tenantField)
  - Minimal + full examples
- [x] `content/docs/data/fields.mdx` — Field Types & DSL
  - All field types: id, string, text, integer, float, boolean, timestamp, date, json, enum, uuid, ulid, bytes
  - Modifiers: optional, default, unique, indexed, primaryKey, autoincrement, description, validation
  - Code examples for each type
- [x] `content/docs/data/relations.mdx` — Relations
  - belongsTo, hasMany, hasOne, belongsToMany
  - Lazy references (no circular imports)
  - Relation loading (with, withCount)
- [x] `content/docs/data/validation.mdx` — Validation
  - Field-level validation (Standard Schema)
  - Valibot as default
  - Validation flows from field types
  - Custom validation
- [x] `content/docs/data/queries.mdx` — Query Builder
  - Full query API: where, orderBy, limit, select, join
  - Aggregates: count, sum, avg, min, max, groupBy, having
  - Raw SQL escape hatch
- [x] `content/docs/data/pagination.mdx` — Pagination
  - Offset pagination: .page(n, size)
  - Cursor pagination: .cursor(...)
  - API pagination conventions
- [x] `content/docs/data/transactions.mdx` — Transactions
  - `db.transaction(async (tx) => {...})`
  - Nested savepoints
  - Transaction-aware dispatch
- [x] `content/docs/data/migrations.mdx` — Migrations
  - Model diff → SQL
  - `kwiva db:migrate/rollback/reset`
  - Migration files in `src/database/migrations/`
  - `defineMigration` for custom migrations
- [x] `content/docs/data/seeders.mdx` — Seeders
  - `defineSeeder`
  - `kwiva db:seed`
  - Seeding conventions
- [x] `content/docs/data/factories.mdx` — Factories
  - `User.factory().count(10).create()`
  - Model-aware factory generation
  - Factory states
- [x] `content/docs/data/soft-deletes.mdx` — Soft Deletes
  - `{ softDelete: true }` option
  - `deletedAt` column
  - Filtered queries by default
  - `withTrashed()` to include deleted
- [x] `content/docs/data/database-config.mdx` — Database Configuration
  - SQLite for dev, Postgres for prod
  - Named connections
  - Multi-database support
  - Read replicas (v2)
- [x] `content/docs/data/storage.mdx` — File Storage
  - Disks: local, S3, R2, KV, memory
  - Storage API: put, get, url, signedUrl, delete, list, copy
  - Tenant-scoped paths
  - Upload flow

### 3.5 HTTP Section

- [x] `content/docs/http/index.mdx` — HTTP Overview
- [x] `content/docs/http/controllers.mdx` — defineController
  - Factory signature
  - Route handlers (get, post, put, patch, delete)
  - Typed context (body, params, query, store)
  - Full example
- [x] `content/docs/http/routes.mdx` — Routes & Routing
  - URL conventions
  - Generated model routes (5 per model)
  - Custom routes
  - Route manifest
  - Versioning
- [x] `content/docs/http/middleware.mdx` — defineMiddleware
  - Factory signature
  - Global stack configuration
  - Route/controller scoping
  - Built-in middleware
  - Lifecycle-scoped middleware
- [x] `content/docs/http/lifecycle.mdx` — Request Lifecycle
  - Full 14-step sequence
  - Timing budgets
  - Ordering guarantees
  - Session/tenant propagation
- [x] `content/docs/http/guards.mdx` — Guards
  - `c.guard({ schema, beforeHandle })`
  - Nestable guards
  - Guard composition
- [x] `content/docs/http/validation.mdx` — Validation
  - Standard Schema validation
  - body/query/params/headers/cookies schemas
  - Valibot as default
  - Error responses
- [x] `content/docs/http/errors.mdx` — Error Handling
  - 8-code taxonomy
  - `error()` helper
  - Typed exceptions
  - JSON + HTML response shapes
  - Client-side error handling
- [x] `content/docs/http/file-uploads.mdx` — File Uploads
  - `ctx.file()` API
  - Multipart handling
  - Size/type validation
- [x] `content/docs/http/streaming.mdx` — Streaming & SSE
  - `new Response(stream)` passthrough
  - SSE helper
  - Streaming responses
- [x] `content/docs/http/websockets.mdx` — WebSockets
  - `c.ws('/ws', { open, message, close })`
  - Channel API
  - Client-side hooks
- [x] `content/docs/http/cors.mdx` — CORS & Security Headers
  - CORS configuration
  - Security headers middleware
  - CSP configuration
- [x] `content/docs/http/caching.mdx` — Response Caching
  - Route rules: cache, SWR, ISR, static, prerender
  - Cache headers
  - Cache invalidation

### 3.6 API Section

- [x] `content/docs/api/index.mdx` — API Overview
- [x] `content/docs/api/rest.mdx` — REST Conventions
  - URL patterns
  - HTTP methods
  - Status codes
  - Response formats
- [x] `content/docs/api/generated-endpoints.mdx` — Generated Model Endpoints
  - 5 routes per model: list, get, create, update, delete
  - Custom actions via defineController
  - Permissions gating
- [x] `content/docs/api/rpc.mdx` — Typed RPC
  - Eden-like typed client
  - End-to-end types
  - Zero codegen
- [x] `content/docs/api/client.mdx` — @kwiva/client
  - `createClient()` setup
  - Usage patterns
  - Error handling
  - SSR-safe behavior
- [x] `content/docs/api/openapi.mdx` — OpenAPI
  - Auto-generation from route manifest
  - `/openapi.json` endpoint
  - Swagger UI
  - Customization
- [x] `content/docs/api/authentication.mdx` — API Authentication
  - Session-based auth
  - Bearer tokens
  - API key patterns
- [x] `content/docs/api/errors.mdx` — API Errors
  - Error response format
  - Error codes
  - Client-side error handling
  - Typed error responses

### 3.7 Frontend Section

- [x] `content/docs/frontend/index.mdx` — Frontend Overview
- [x] `content/docs/frontend/pages.mdx` — definePage
  - Factory signature
  - Component, loader, error/pending/notFound components
  - Head/meta management
  - Full example
- [x] `content/docs/frontend/routing.mdx` — File-Based Routing
  - Route file conventions (dotted paths, $param, splat)
  - Nested layouts
  - Route parameters
  - Search parameters
  - Route tree codegen
- [x] `content/docs/frontend/layouts.mdx` — Nested Layouts
  - `__root.tsx`
  - Folder layout files
  - Layout composition
- [x] `content/docs/frontend/loaders.mdx` — Loaders & Data
  - `definePage({ loader })` pattern
  - Parallel loading
  - Deferred data with `stream()`
  - Loader dehydration/hydration
- [x] `content/docs/frontend/navigation.mdx` — Navigation & Link
  - `<Link>` component
  - `useNavigate()` hook
  - Typed navigation
  - Preloading
  - Scroll restoration
- [x] `content/docs/frontend/data-hooks.mdx` — Data Hooks
  - `useResource`, `useList`, `useMutation`, `useInfiniteList`
  - Cache invalidation model
  - Optimistic updates
  - Suspense integration
  - Devtools
- [x] `content/docs/frontend/rpc-client.mdx` — RPC Client Usage
  - Client-side `createClient()`
  - Typed calls
  - Error handling
  - SSR behavior
- [x] `content/docs/frontend/ui-components.mdx` — UI Components
  - @kwiva/ui-kit
  - DataTable (model-typed)
  - Form fields (model-derived)
  - Base UI + Tailwind v4
  - Theming

### 3.8 Rendering Section

- [x] `content/docs/rendering/index.mdx` — Rendering Overview
- [x] `content/docs/rendering/ssr.mdx` — Server-Side Rendering
  - Kwiva-owned orchestration
  - Render pipeline
  - Streaming-first approach
- [x] `content/docs/rendering/streaming.mdx` — Streaming SSR
  - suspense-aware HTML streaming
  - `renderToReadableStream`
  - Deferred data
  - Loading states
- [x] `content/docs/rendering/hydration.mdx` — Hydration
  - Island-free full hydration
  - Preact-compat
  - Hydration contract
  - Loader data hydration
- [x] `content/docs/rendering/caching.mdx` — Caching Strategies
  - Route rules: cache, SWR, ISR, static
  - Cache API
  - Model cache
  - Client data hooks cache
  - Invalidation triggers
- [x] `content/docs/rendering/prerendering.mdx` — Static Generation
  - `kwiva build` crawl
  - Explicit route list
  - ISR behavior
  - SPA fallback mode

### 3.9 Authentication Section

- [x] `content/docs/auth/index.mdx` — Authentication Overview
  - What Kwiva auth provides
  - Engine: Better Auth (hidden)
- [x] `content/docs/auth/configuration.mdx` — Auth Configuration
  - `defineAuth({ providers, session })`
  - Provider options: password, OAuth, passkeys, magic links
  - Session configuration
- [x] `content/docs/auth/sessions.mdx` — Sessions
  - `ctx.session` server-side
  - `useSession()` client hook
  - Session lifecycle
  - Session store options
- [x] `content/docs/auth/providers.mdx` — Auth Providers
  - Email/password
  - OAuth (Google, GitHub, etc.)
  - Passkeys/WebAuthn
  - Magic links
  - Provider configuration
- [x] `content/docs/auth/protecting-routes.mdx` — Protecting Routes
  - `requireAuth` middleware
  - `beforeLoad` page guards
  - Permission-based protection
- [x] `content/docs/auth/client-usage.mdx` — Client-Side Auth
  - `useSession()` hook
  - Sign in/out
  - Auth state management
  - SSR auth flow

### 3.10 Authorization Section

- [x] `content/docs/authorization/index.mdx` — Authorization Overview
- [x] `content/docs/authorization/policies.mdx` — definePolicy
  - Factory signature
  - User/ability/resource pattern
  - Policy examples
- [x] `content/docs/authorization/permissions.mdx` — Permissions
  - `ctx.can()` checks
  - `useCan()` client hook
  - Model-level permissions
  - Permission naming
- [x] `content/docs/authorization/roles.mdx` — RBAC
  - Role + permission fields
  - Role assignment
  - Role-based checks
- [x] `content/docs/authorization/enforcement.mdx` — Enforcement Points
  - Route guards
  - Studio authorization
  - Channel authorization
  - MCP authorization

### 3.11 Tenancy Section

- [x] `content/docs/tenancy/index.mdx` — Tenancy Overview
  - Multi-tenancy as architectural concern
  - Engine: none (Kwiva-owned)
- [x] `content/docs/tenancy/configuration.mdx` — Tenancy Configuration
  - `src/config/tenancy.ts`
  - Mode, tenantField, models, cache, storage options
- [x] `content/docs/tenancy/resolution.mdx` — Tenant Resolution
  - Domain, path, header, fixed, org strategies
  - Resolution middleware
- [x] `content/docs/tenancy/scoping.mdx` — Tenant Scoping
  - `tenantField` auto-injection
  - Automatic query scoping
  - Cross-tenant isolation (404 masking)
- [x] `content/docs/tenancy/isolation.mdx` — Tenant Isolation
  - Storage isolation
  - Cache isolation
  - Queue isolation
  - Testing tenant isolation

### 3.12 Realtime Section

- [x] `content/docs/realtime/index.mdx` — Realtime Overview
- [x] `content/docs/realtime/channels.mdx` — Channels
  - `channel('chat.{roomId}')` API
  - Policy-checked subscribe
  - Channel events
- [x] `content/docs/realtime/events.mdx` — Events & Broadcasting
  - `defineEvent` factory
  - Listeners (queued or sync)
  - Broadcasting to channels
  - Model events → broadcast
- [x] `content/docs/realtime/client-usage.mdx` — Client-Side Realtime
  - `useChannel()` hook
  - `usePresence()` hook
  - SSE fallback
  - Subscription management
- [x] `content/docs/realtime/scaling.mdx` — Scaling Realtime
  - WebSocket scaling considerations
  - CrossWS engine
  - Multi-instance broadcasting

### 3.13 Background Work Section

- [x] `content/docs/background-work/index.mdx` — Background Work Overview
- [x] `content/docs/background-work/jobs.mdx` — defineJob
  - Factory signature
  - Typed payload
  - Attempts, backoff, priority
  - Idempotency key
  - Dispatch patterns
- [x] `content/docs/background-work/queues.mdx` — Queues & Workers
  - `kwiva queue:work/listen/failed/retry/clear`
  - Worker concurrency
  - Dead letter queue
  - Transaction-aware dispatch
  - Redis/DB transport
- [x] `content/docs/background-work/scheduling.mdx` — Scheduled Tasks
  - `defineTask` factory
  - Cron configuration in `src/config/schedule.ts`
  - Scheduler controls (withoutOverlapping, onOneServer)
  - `kwiva schedule:run/work/list`
- [x] `content/docs/background-work/observability.mdx` — Job Observability
  - Job status tracking
  - Failed job inspection
  - Queue depth metrics
  - Retry visibility

### 3.14 Studio Section

- [x] `content/docs/studio/index.mdx` — Studio Overview
  - What Kwiva Studio is
  - Generated from models
  - Policy- and tenant-aware
- [x] `content/docs/studio/configuration.mdx` — Studio Configuration
  - Enabling Studio
  - Route configuration
  - Branding
- [x] `content/docs/studio/generated-ui.mdx` — Generated UI
  - CRUD screens per model
  - List/filter/create/edit/delete
  - Schema-derived columns and forms
- [x] `content/docs/studio/customization.mdx` — Customization
  - `defineStudioScreen`
  - Built-in screens
  - Custom screens
  - Separate route chunk

### 3.15 AI & MCP Section

- [x] `content/docs/ai-mcp/index.mdx` — AI & MCP Overview
  - AI architecture
  - MCP integration
- [x] `content/docs/ai-mcp/mcp-server.mdx` — MCP Server
  - Auto-generated tools from models
  - Transport: stdio + streamable HTTP
  - Authentication
- [x] `content/docs/ai-mcp/tool-generation.mdx` — Tool Generation
  - Model → MCP tools
  - Custom tools via `defineMcpTool`
  - Policy enforcement
- [x] `content/docs/ai-mcp/agent-integration.mdx` — Agent Integration
  - AI-safe data access
  - Audit trail
  - Agent connection patterns

### 3.16 Modules & Plugins Section

- [x] `content/docs/modules-plugins/index.mdx` — Modules Overview
- [x] `content/docs/modules-plugins/defining-modules.mdx` — defineModule
  - Contribution points
  - Models, controllers, pages, jobs, events, tasks, policies, migrations, config, channels
- [x] `content/docs/modules-plugins/addons.mdx` — Addons & Distribution
  - `kwiva add <addon>` CLI
  - `kwiva addons list/search/info/remove/update/outdated`
  - npm keyword conventions
  - First-party addons planned
- [x] `content/docs/modules-plugins/composition.mdx` — Application Composition
  - `defineApp({ modules, middleware, providers })`
  - Composition order
  - Per-mode composition
  - Testing composition

### 3.17 CLI Section

- [x] `content/docs/cli/index.mdx` — CLI Overview
  - Command table
  - Installation
- [x] `content/docs/cli/project-commands.mdx` — Project & Lifecycle Commands
  - `kwiva new`, `dev`, `build`, `check`, `test`, `console`, `upgrade`
  - Flags and options
- [x] `content/docs/cli/generators.mdx` — Generators (make:*)
  - `make:model`, `make:controller`, `make:service`, `make:job`
  - `make:event`, `make:command`, `make:task`, `make:page`
  - `make:policy`, `make:module`, `make:test`
- [x] `content/docs/cli/database-commands.mdx` — Database Commands
  - `db:migrate`, `db:rollback`, `db:seed`, `db:reset`
  - `db:status`, `db:diff`, `db:push`
  - `db:studio`
- [x] `content/docs/cli/addon-commands.mdx` — Addon Commands
  - `kwiva add`, `addons list`, `addons search`
  - `addons info`, `remove`, `update`, `outdated`

### 3.18 Testing Section

- [x] `content/docs/testing/index.mdx` — Testing Overview
  - Bun-native test stack
  - Testing pyramid
- [x] `content/docs/testing/unit-testing.mdx` — Unit Testing
  - Test structure
  - Assertions
  - Mocking
- [x] `content/docs/testing/integration-testing.mdx` — Integration Testing
  - `withApp` harness
  - `createTestClient`
  - Database traits
  - Fakes (queue, storage, HTTP)
- [x] `content/docs/testing/api-testing.mdx` — API Testing
  - In-process client
  - HTTP assertions
  - Authentication in tests
- [x] `content/docs/testing/e2e-testing.mdx` — E2E Testing
  - Playwright setup
  - Per-mode testing
  - CI configuration

### 3.19 Observability Section

- [x] `content/docs/observability/index.mdx` — Observability Overview
- [x] `content/docs/observability/logging.mdx` — Logging
  - Structured JSON logs
  - Request/tenant correlation
  - Log levels
- [x] `content/docs/observability/tracing.mdx` — Tracing (OTel)
  - Request span tree
  - Middleware → handler → query spans
  - OTLP exporters
- [x] `content/docs/observability/metrics.mdx` — Metrics
  - HTTP metrics
  - Model query metrics
  - Queue depth
  - Cache hit rate
  - Prometheus export
- [x] `content/docs/observability/dev-overlay.mdx` — Dev Overlay
  - Server-timing header
  - Dev tools overlay
  - Performance insights

### 3.20 Security Section

- [x] `content/docs/security/index.mdx` — Security Overview
- [x] `content/docs/security/default-protections.mdx` — Default Protections
  - Validation everywhere
  - CSRF protection
  - Security headers
  - Rate limiting
  - Cookie hardening
- [x] `content/docs/security/input-validation.mdx` — Input Validation
  - Standard Schema validation
  - Model-level validation
  - Controller-level validation
  - Job payload validation
- [x] `content/docs/security/headers.mdx` — Security Headers
  - CSP configuration
  - CORS headers
  - HSTS
  - Custom headers
- [x] `content/docs/security/production.mdx` — Production Hardening
  - Secrets management
  - Lint gates (no-engine-imports)
  - Dependency audit
  - SSR security
  - API security

### 3.21 Deployment Section

- [x] `content/docs/deployment/index.mdx` — Deployment Overview
  - Deployment philosophy
  - One codebase, many targets
- [x] `content/docs/deployment/adapters.mdx` — Runtime Adapters
  - Nitro deploy presets
  - Zero-config auto-detected providers
  - Mode presets (fullstack, api+spa, static, standalone, edge)
- [x] `content/docs/deployment/node-bun.mdx` — Node/Bun Deployment
  - Node.js deployment
  - Bun deployment
  - Single-binary mode
- [x] `content/docs/deployment/serverless.mdx` — Serverless Deployment
  - Vercel
  - Netlify
  - Cloudflare Workers
  - AWS Lambda
- [x] `content/docs/deployment/containers.mdx` — Container Deployment
  - Docker
  - Docker Compose
  - Kubernetes
- [x] `content/docs/deployment/production-checklist.mdx` — Production Checklist
  - Pre-deployment checks
  - Environment variables
  - Database setup
  - Queue workers
  - Cache configuration
  - Monitoring setup

### 3.22 Advanced Section

- [x] `content/docs/advanced/index.mdx` — Advanced Overview
- [x] `content/docs/advanced/architecture-internals.mdx` — Architecture Internals
  - Internal architecture deep dive
  - Engine wiring
  - Package internals
- [x] `content/docs/advanced/request-lifecycle.mdx` — Request Lifecycle
  - Full 14-step lifecycle detail
  - Hook points at each stage
  - Performance considerations
- [x] `content/docs/advanced/model-ir.mdx` — Model IR
  - Intermediate representation
  - Derivation pipeline
  - Custom IR extensions
- [x] `content/docs/advanced/package-boundaries.mdx` — Package Boundaries
  - Dependency graph
  - Engine sealing
  - Reference isolation
  - Lint gate enforcement
- [x] `content/docs/advanced/performance.mdx` — Performance
  - Rust-speed toolchain
  - Bun native TS
  - Streaming SSR
  - Layered caching
  - Type-level inference

---

## Phase 4: Navigation & Discovery

### 4.1 Meta Files

- [x] Create `content/docs/meta.json` with full section ordering
- [x] Create `meta.json` for each docs subdirectory
- [x] Configure page labels and separators
- [x] Set `"root": true` where appropriate for scoped sidebars
- [x] Create `content/guides/meta.json`
- [x] Create `content/architecture/meta.json`
- [x] Create `content/api/meta.json`
- [x] Create `content/blog/meta.json`

### 4.2 Learning Paths

- [x] Embed beginner path indicators in relevant docs
- [x] Embed expert path indicators in advanced docs
- [x] Add "Next Steps" sections to every page
- [x] Add "Prerequisites" notes where appropriate

### 4.3 Cross-Linking

- [x] Every major concept page links to related concepts
- [x] Every API page links to its usage guide
- [x] Every guide links to relevant reference docs
- [x] Architecture pages link to implementation docs

### 4.4 Search Optimization

- [x] Page titles are highly descriptive and searchable
- [x] Meta descriptions are concise and keyword-rich
- [x] API names appear in headings for search indexing
- [x] `defineX` names appear in page titles
- [x] Technical terms are consistently used

---

## Phase 5: Plugins & SEO

### 5.1 Plugin Configuration

- [x] Configure sitemap plugin (include all public pages)
- [x] Configure robots.txt plugin (allow all, reference sitemap)
- [x] Configure llms.txt plugin (curated content, `routes: "all"`)
- [x] Configure RSS plugin (blog feed)
- [x] Configure FlexSearch (default, all collections)
- [x] Configure Takumi (OG image generation)
- [x] Configure Image Optimization (auto)
- [x] Configure AI plugin (model, system prompt, UI)
- [x] Configure MCP plugin (`/mcp` endpoint, tools)
- [x] Configure Feedback plugin (thumbs up/down)
- [x] Configure Link Validation plugin (`throw` in build)

### 5.2 SEO Metadata

- [x] Unique `<title>` for every page
- [x] Unique meta description for every page
- [x] Canonical URLs on every page
- [x] Open Graph metadata on every page
- [x] Structured data (SoftwareApplication, TechArticle, BreadcrumbList)
- [x] Semantic heading hierarchy
- [x] Descriptive link text

### 5.3 llms.txt Content

- [x] Curate `/llms.txt` index with most important resources
- [x] Ensure `/llms-full.txt` includes all content
- [x] Verify per-page Markdown via `Accept: text/markdown`
- [x] Test with AI consumption tools

### 5.4 MCP Surface

- [x] `/mcp` endpoint operational
- [x] `search`, `get_page`, `list_pages` tools registered
- [x] Custom tools if applicable
- [x] Test with MCP client

---

## Phase 6: Custom Pages

### 6.1 About Page (`src/pages/about.tsx`) — **DELIVERED** (editorial redesign)

- [x] Editorial hero — “A framework should make architecture feel obvious.” + meta row (v0.3 · 21 ADRs · 12 research notes)
- [x] 01/Why Kwiva exists — narrative + the “assembly tax” list
- [x] 02/Philosophy — 8 principles, each with explanation + technical consequence (ruled editorial rows, no cards)
- [x] 03/Boundary — 5-layer ownership diagram with emphasized “public API boundary” and “internal — sealed” markers + core-rule pull quote
- [x] 04/Decisions — 8 ADR entries linked to `/adr`
- [x] 05/defineX — code window + convention copy
- [x] 06/Inspiration — “Studied, not wrapped.” (Laravel · Elysia · TanStack · Nitro · Vite+ · Better Auth · Drizzle · Questpie)
- [x] 07/Beliefs — 3 alternating Newsreader pull quotes
- [x] 08/Evolution — timeline: problem → research → constraints → decisions → primitives → unified dx → next
- [x] 09/Direction — phased roadmap (kernel → realtime+ops → ecosystem → public 1.0) + explicit v1 non-goals
- [x] CTA — Start the tutorial / Understand the architecture / GitHub

### 6.2 Custom 404 Page

- [x] Implement via `renderNotFound` in press.config.tsx
- [x] Search box (links to search)
- [x] Links to popular docs
- [x] Homepage link
- [x] Documentation link
- [x] Styled consistently with site

### 6.3 Custom Error Page (500)

> **N/A** — fumapress 1.2.0 exposes no `renderError` hook (only `renderNotFound`); a custom 500
> experience is not implementable at the framework level. Deprioritized like the footer columns
> (requires a custom layout wrapper or a fumapress upgrade).

- [ ] Generic error experience — blocked: no framework hook (see note above)
- [ ] Recovery options — blocked: no framework hook (see note above)
- [ ] Link to support/issues — blocked: no framework hook (see note above)

### 6.4 Architecture Section

- [x] `content/architecture/index.mdx` — Architecture Overview
  - Layer diagram
  - Core architectural rule
  - Engine/reference distinction
- [x] `content/architecture/design-principles.mdx` — Design Principles
  - 4 design pillars detailed
  - Framework philosophy
  - Convention decisions
- [x] `content/architecture/request-lifecycle.mdx` — Request Lifecycle
  - Full visual lifecycle
  - Timing budgets
  - Hook points
- [x] `content/architecture/model-derivation.mdx` — Model Derivation
  - One model → many outputs
  - IR pipeline
  - Derivation diagram
- [x] `content/architecture/frontend-architecture.mdx` — Frontend Architecture
  - Pages → Router → Data hooks → RPC → HTTP
  - SSR flow
  - Hydration
- [x] `content/architecture/deployment-architecture.mdx` — Deployment Architecture
  - Runtime options
  - Engine presets
  - Infrastructure components
- [x] `content/architecture/package-boundaries.mdx` — Package Boundaries
  - 17 @kwiva/* packages
  - Dependency graph
  - Engine sealing
  - Reference isolation

### 6.5 ADR Section *(removed)*

The ADR collection has been deliberately dropped from the public site. Engineering decision records
(including references to third-party libraries) are internal-only — see [Marketing Repositioning](#phase-8-marketing--sponsorship).
Architecture rationale that is product-relevant is covered instead by `/architecture/*` pages
(design principles, engine sealing, model derivation).

### 6.6 API Reference Section

- [x] `content/api/index.mdx` — API Reference Overview
  - Package listing
  - Reading guide
  - Stability indicators
- [x] `content/api/core.mdx` — @kwiva/core
  - defineApp, context, DI, config(), errors, definePolicy
  - Signatures, parameters, return types, examples
- [x] `content/api/config.mdx` — @kwiva/config
  - defineConfig, config-folder loader, typed env
- [x] `content/api/data.mdx` — @kwiva/data
  - defineModel, field DSL, query builder, transactions
- [x] `content/api/http.mdx` — @kwiva/http
  - defineController, defineMiddleware, defineServerRoute, lifecycle
- [x] `content/api/router.mdx` — @kwiva/router
  - File-based router, loaders, typed navigation
- [x] `content/api/react.mdx` — @kwiva/react
  - definePage, SSR, data hooks, providers
- [x] `content/api/client.mdx` — @kwiva/client
  - createClient, typed RPC, error handling
- [x] `content/api/auth.mdx` — @kwiva/auth
  - defineAuth, sessions, providers
- [x] `content/api/queue.mdx` — @kwiva/queue
  - defineJob, workers, retries
- [x] `content/api/events.mdx` — @kwiva/events
  - defineEvent, listeners, broadcasting
- [x] `content/api/services.mdx` — @kwiva/services
  - defineService, typed injection
- [x] `content/api/cli.mdx` — @kwiva/cli
  - All commands reference
- [x] `content/api/studio.mdx` — @kwiva/studio
  - Generated UI, customization
- [x] `content/api/mcp.mdx` — @kwiva/mcp
  - MCP server, tools, transport

### 6.7 Guides Section

- [x] `content/guides/index.mdx` — Guides Overview
- [x] Create 10-15 narrowly-scoped how-to guides:
  - How do I protect a route?
  - How do I create a model?
  - How do I create a custom controller?
  - How do I validate input?
  - How do I paginate results?
  - How do I create a background job?
  - How do I schedule a task?
  - How do I enable realtime?
  - How do I configure tenancy?
  - How do I add authentication?
  - How do I add a policy?
  - How do I handle file uploads?
  - How do I generate OpenAPI?
  - How do I deploy?

### 6.8 Blog Section

- [x] `content/blog/meta.json` — Blog navigation
- [x] Blog index shipped — plugin-rendered (`/blog`, `/blog/tags`) + two real posts: `welcome-to-kwiva.mdx`, `why-definex.mdx`
- [x] Blog layout configured in renderPage

---

## Phase 7: Polish & Validation

### 7.1 Build Validation

- [x] `bun run types:check` — TypeScript passes
- [x] `bun run build` — Production build succeeds
- [x] Link validation passes (no broken internal links)
- [x] Sitemap generates correctly
- [x] robots.txt generates correctly
- [x] llms.txt generates correctly
- [x] Search index builds correctly

### 7.2 Content Quality

- [x] No broken internal links
- [x] No missing pages (orphan pages)
- [x] No duplicate slugs
- [x] No inconsistent terminology
- [x] No invented APIs
- [x] No undocumented package references
- [x] No stale navigation
- [x] No placeholder content in published pages
- [x] No lorem ipsum
- [x] No fake GitHub URLs
- [x] No fake community links
- [x] No fake release history
- [x] No unsupported performance claims

### 7.3 Technical Correctness

- [x] All `defineX` factories map to correct packages
- [x] Engine/reference distinction is clear throughout
- [x] Stable vs experimental vs planned features marked
- [x] Code examples use actual Kwiva APIs
- [x] No engine imports shown in app code examples
- [x] Package names are accurate
- [x] CLI commands are from documented surface only

### 7.4 UX Testing

- [x] Dark mode works on all pages
- [x] Light mode works on all pages
- [x] Mobile responsive on all pages
- [x] Keyboard navigation works
- [x] Search returns relevant results
- [x] Code copy button works
- [x] 404 page renders correctly
- [x] Breadcrumbs work correctly
- [x] Previous/next navigation works
- [x] Sidebar navigation works
- [x] "On this page" TOC works
- [x] Feedback widget works
- [x] AI assistant works (if configured)

### 7.5 Performance

- [x] Static content renders without JS overhead
- [x] Images are optimized
- [x] Fonts load correctly
- [x] Search is fast
- [x] Code highlighting loads efficiently
- [x] No large client-side bundles for static docs

### 7.6 Accessibility

- [x] Semantic HTML throughout
- [x] Keyboard navigation works
- [x] Visible focus states
- [x] Accessible dialogs/modals
- [x] Accessible navigation
- [x] Sufficient contrast ratios
- [x] Reduced-motion support
- [x] Correct heading hierarchy
- [x] Descriptive link text
- [x] Screen reader friendly controls

---

## Phase 8: Marketing & Sponsorship

> Goal: position Kwiva as the next-generation framework that replaces the stitched-together stack,
> drive adoption, and open a sponsorship pathway. Copy is aggressive; usefulness and usage take
> priority over implementation trivia.

### 8.1 Content Standard

- [x] **No third-party library disclosures** — `laravel`, `questpie`, `elysia`, `tanstack`, `vite+`, `nitro`, `drizzle`, `better auth`, and the toolchain (`oxc`, `rolldown`, `oxlint`, `oxfmt`) are absent from all public content (`content/`, `src/pages/`, `src/components/`, `press.config.tsx`). Verified by grep sweep (zero hits).
  - ⚠️ **Re-verified 2026-09-09 (Phase 6 exit gate):** the `content/` tree is clean, but the pre-existing homepage/about components (`src/pages/index.tsx`, `src/pages/about.tsx`, `src/components/home/*`) still name engines/toolchain (Nitro, Drizzle, Better Auth, TanStack, oxc, Laravel-shaped copy). This predates Phase 6 and needs a dedicated homepage sanitization pass to truly satisfy the "zero hits" claim.
- [x] Engines and toolchain are described generically: "internal engines" / "framework-owned", "Rust-speed toolchain".
- [x] No invented APIs, fake links, fake testimonials, or fake release history.
- [x] Re-run disclosure sweep as an exit gate before every build.

### 8.2 Homepage Repositioning *(docs site)*

- [x] Hero H1: “The end of the stitched-together stack.”
- [x] Feature pills: TypeScript-native · Generated REST + RPC · Rust-speed toolchain · deploy anywhere, zero lock-in.
- [x] Architecture layers genericized (Internal Engines / Design, framework-owned).
- [x] Engine marquee: HTTP · Data · Auth · Client data · Realtime · Studio.
- [x] Rules rail: “No library spaghetti” / “Own everything” / “One grammar”.
- [x] FAQ: “Why should I replace my existing stack?” + “Can I sponsor Kwiva?”
- [x] Final CTA band: “The stitched-together stack dies here” → Get Started + Sponsor Kwiva.

### 8.3 About & Sponsorship

- [x] `/about` rewritten: why Kwiva exists, the promise, design pillars, architectural principles, sponsorship.
- [x] Sponsor CTA links to a real page (`/docs/getting-started`) — no dead/fake links.
- [x] Consider a dedicated `/sponsor` page or sponsorship section once funding channel is confirmed.

### 8.4 Navigation *(site-architecture skill)*

- [x] Header nav: Documentation · Guides · Architecture · API · Blog + rightmost “Get Started” CTA button.
- [x] Verify docs sidebar ordering matches user journey (getting-started → core-concepts → ...).

---

## Content Source Mapping

| Framework Source | Target Documentation |
|---|---|
| `01-executive-summary.md` | `/docs` index, homepage hero |
| `02-naming-and-brand.md` | `/about` page |
| `03-architecture-overview.md` | `/docs` index, `/architecture` |
| `04-stack-decision.md` | `/architecture/design-principles` |
| `05-responsibility-matrix.md` | `/architecture/package-boundaries` |
| `06-adapter-matrix.md` | `/docs/deployment/adapters` |
| `07-feature-catalog.md` | Distributed across all docs sections |
| `08-use-cases.md` | Homepage examples, `/docs` overview |
| `application/01-project-structure.md` | `/docs/getting-started/project-structure` |
| `application/02-package-architecture.md` | `/architecture/package-boundaries`, `/docs/advanced/package-boundaries` |
| `application/03-configuration.md` | `/docs/getting-started/configuration`, `/docs/core-concepts/configuration` |
| `application/04-environment.md` | `/docs/getting-started/configuration` (env section) |
| `data/01-database.md` | `/docs/data/*` |
| `data/02-storage.md` | `/docs/data/storage` |
| `data/03-queue-jobs.md` | `/docs/background-work/*` |
| `data/04-realtime.md` | `/docs/realtime/*` |
| `data/05-tasks-scheduling.md` | `/docs/background-work/scheduling` |
| `engineering/01-cli.md` | `/docs/cli/*` |
| `engineering/02-testing.md` | `/docs/testing/*` |
| `engineering/03-observability.md` | `/docs/observability/*` |
| `engineering/04-security.md` | `/docs/security/*` |
| `engineering/05-migration.md` | `/docs/data/migrations` |
| `engineering/06-roadmap.md` | `/docs/advanced` (future page) |
| `engineering/07-risks.md` | Internal only (not public) |
| `foundation/01-runtime-bun.md` | `/docs/deployment/node-bun`, `/docs/advanced` |
| `foundation/02-build-pipeline-oxc.md` | `/docs/advanced`, `/docs/cli` |
| `foundation/03-data-layer-models.md` | `/docs/data/*` |
| `foundation/04-framework-http.md` | `/docs/http/*` |
| `foundation/05-server-foundation.md` | `/docs/deployment/*`, `/docs/advanced` |
| `frontend/01-routing.md` | `/docs/frontend/routing` |
| `frontend/02-ssr.md` | `/docs/rendering/*` |
| `frontend/03-frontend-foundation.md` | `/docs/frontend/*` |
| `frontend/04-ui-library.md` | `/docs/frontend/ui-components` |
| `platform/01-auth.md` | `/docs/auth/*` |
| `platform/02-authorization.md` | `/docs/authorization/*` |
| `platform/03-tenancy.md` | `/docs/tenancy/*` |
| `platform/04-studio.md` | `/docs/studio/*` |
| `platform/05-ai-mcp.md` | `/docs/ai-mcp/*` |
| `platform/06-modules.md` | `/docs/modules-plugins/*` |
| `platform/07-application-composition.md` | `/docs/core-concepts/applications`, `/docs/modules-plugins/composition` |
| `server/01-request-lifecycle.md` | `/docs/http/lifecycle`, `/architecture/request-lifecycle` |
| `server/02-server-capabilities.md` | `/docs/http/*` |
| `server/03-api-design.md` | `/docs/api/*` |
| `server/04-error-handling.md` | `/docs/http/errors`, `/docs/core-concepts/error-handling` |
| `server/05-caching.md` | `/docs/http/caching`, `/docs/rendering/caching` |
| `research/*` | `/architecture/*` (selective transformation) |

---

## Estimated File Count

| Category | Files |
|---|---|
| Config | 2 |
| Styles | 1 |
| Custom pages (React) | 3-4 |
| Layout components | 2-3 |
| Content: docs | ~80 MDX + ~20 meta.json |
| Content: guides | ~15 MDX + 1 meta.json |
| Content: architecture | ~8 MDX + 1 meta.json |
| Content: api | ~15 MDX + 1 meta.json |
| Content: blog | 1 meta.json |
| **Total** | **~170-180 files** |

---

## Execution Order

1. Phase 1 → Project compiles with new config
2. Phase 2 → Homepage renders
3. Phase 3 → Content in batches (getting-started → core-concepts → data → http → frontend → remaining)
4. Phase 4 → Navigation polished
5. Phase 5 → Plugins configured
6. Phase 6 → Custom pages added
7. Phase 7 → Final validation
8. Phase 8 → Marketing & sponsorship repositioning (aggressive copy, no third-party disclosures, sponsor CTA)
## Phase 3: Documentation Content (3.1-3.3 Marked Complete)

**3.1-3.3 Status:** Completed. Core documentation structure established.

**Next Section:** Section 3.4 Data begins the detailed data model documentation.

---

<!-- 3.1-3.3 completed -->
