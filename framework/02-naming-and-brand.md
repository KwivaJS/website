# 02 — Naming & Brand

**Status**: Chosen · **Updated**: 2026-09-08 · **Docset**: v0.3

## Chosen Name

**Kwiva**

- **CLI**: `kwiva`
- **Packages**: `@kwiva/core`, `@kwiva/http`, `@kwiva/data`, `@kwiva/react`, `@kwiva/cli`, …
- **URL**: `kwiva.js.org` (via js.org + GitHub Pages); `kwiva.dev` reserved for a future upgrade
- **GitHub**: `github.com/kwiva-dev`
- **History**: the project was provisionally branded **Forgepie** for a period during planning; after final evaluation, **Kwiva was restored as the preferred name** and all artifacts use it. `Forgepie` is retired and must not appear in any app-facing surface (enforced by the verification greps in the docset QA).

## Rationale

- Derived from "quiver" — evokes energy, dynamism, motion, and readiness.
- The "KW" spelling differentiates from existing "KIVA" trademarks (Kiva Software, Kiva Systems/Amazon, Kiva Health Brands, Ross Video Limited).
- Two clean syllables (KWEE-vah), pronounceable globally, short enough for a CLI.
- Strong metaphorical system: quiver (collection of capabilities), arrow (deploy artifact), nock (config entry), draw (scaffold), release (deploy).
- No direct collision with major npm/trademark holdings for the exact spelling "KWIVA".

## Evaluation Criteria (used to score alternatives)

1. **Pronounceability** (non-technical founders / global teams)
2. **Memorability** (spellable after hearing once)
3. **npm/GitHub availability** (package + org)
4. **Domain availability** (`.dev` / `.io`)
5. **SEO distinctness** (doesn't collide with an existing tech product)
6. **Derivability** (good nouns for commands, package names, error codes)
7. **Trademark risk** (no major existing trademark)

## Candidate Comparison

| Candidate | Score | Notes |
|---|---|---|
| **Kwiva** | ★★★★★ | Chosen. Distinctive spelling, strong metaphor, available across registries. |
| **Forgepie** | ★★★★★ | Runner-up; interim name during planning. Retained as top backup. |
| **Vulcan** | ★★★★☆ | Strong, but space occupied; hard-sounding, less approachable. |
| **Kiln** | ★★★★☆ | Tailored craft/heat metaphor, short. Weak derivation for packages. |
| **Anvil** | ★★★☆☆ | Nice metaphor, plural/typo risk in searches, trademark collision history. |
| **Craftstack / Craftkit** | ★★★☆☆ | Generic; collides with existing "craft" products. |
| **Loam** | ★★★☆☆ | Soft, distinctive; harder to convey "framework" intent. |
| **Nebula** | ★★☆☆☆ | Heavily used across databases/IDEs. |
| **Atlas** | ★★☆☆☆ | Saturated (databases, ML, maps). |
| **Homestead** | ★★☆☆☆ | Laravel-adjacent (Homestead = local env) → confusing association. |
| **Tinker / Artisan** | ★☆☆☆☆ | Directly Laravel's command names; trademark risk. Do not use. |

## Brand Vocabulary

| Term | Canonical definition |
|---|---|
| Kwiva app | A project created by `kwiva new` |
| Quiver | The collection of `@kwiva/*` packages composed into an app |
| Arrow | A compiled/built artifact for deployment |
| Nock | Configuration entry point (where arrow meets string): `kwiva.config.ts` + `src/config/` |
| Draw | Scaffolding action (`kwiva make:*`) |
| Release | Deploy action (`kwiva deploy`) |
| Model | A `defineModel('…', …)` definition in `src/app/models/` — the data layer's single source of truth |
| Controller / Route / Middleware | Server API primitives (`defineController`, `defineServerRoute`, `defineMiddleware`) |
| Page | A file-based route in `src/ui/pages/` rendered by `@kwiva/react` |
| Engine | A hidden internal library powering a framework package (Nitro, Drizzle, Better Auth, TanStack Query) |
| Reference | An inspiration-only library with zero runtime dependency (Elysia, TanStack Router, Vite+, Laravel, Questpie) |
| Addon | An installable capability package from the registry — the umbrella term for modules, plugins, and themes; installed via `kwiva add` |
| Kwiva Studio | The generated operations UI (`@kwiva/studio`) derived from models — CRUD screens, users/sessions, tenants, queue, schedule, audit, settings, addons |

## Application Terminology

| Concept (informal) | Kwiva term |
|---|---|
| collection / table | **model** (`defineModel`) |
| schema file | **model files** (`src/app/models/*.ts`) |
| one-schema | **model layer** (the derived REST/client/Studio/migration plane) |
| Elysia / Nitro / Drizzle / Better Auth / TanStack Query | **engines** (hidden internals; never imported by app code) |
| Elysia / TanStack Router / Vite+ / Laravel / Questpie | **references** (shape APIs and internals; zero dependency) |
| file-based router (TanStack) | **owned router** (`@kwiva/router` + `@kwiva/react`) |

## CLI Commands

| Command | Action | Laravel Equivalent |
|---------|--------|-------------------|
| `kwiva new` | Create new app | `laravel new` |
| `kwiva dev` | Start dev server (oxc + Bun) | `php artisan serve` |
| `kwiva build` | Production build (rolldown + Nitro) | — |
| `kwiva check` | Lint (oxlint) + format (oxfmt) + types | — |
| `kwiva test` | Run tests (bun test + Playwright) | `php artisan test` |
| `kwiva console` | REPL with app context | `php artisan tinker` |
| `kwiva deploy` | Build + provider deploy | — |
| `kwiva make:model` | Scaffold a model | `php artisan make:model` |
| `kwiva make:controller` | Create controller | `php artisan make:controller` |
| `kwiva make:service` / `make:job` / `make:event` / `make:command` / `make:task` / `make:page` / `make:policy` / `make:module` | Scaffold each construct | `php artisan make:*` |
| `kwiva make:test` | Scaffold test | `php artisan make:test` |
| `kwiva db:migrate` / `db:seed` / `db:reset` | Database lifecycle | `php artisan migrate:*` |
| `kwiva queue:work` / `queue:listen` | Run workers | `php artisan queue:*` |
| `kwiva schedule:run` / `schedule:work` | Run scheduler | `php artisan schedule:*` |
| `kwiva upgrade` | Run codemods (oxc) + recipes | — |
| `kwiva key:generate` | Generate `APP_KEY` | `php artisan key:generate` |
| `kwiva add <addon>` | Install + register an addon | `composer require` + package discovery |
| `kwiva addons list/search/info/remove/update` | Addon registry management | — |

## Naming Conventions for Packages

Many equal packages, each owning one concern (ADR-0017). Internally, `packages/http` mirrors the Elysia repo `src/` tree; repo-level layout (`packages/`, `example/`, `test/`) mirrors elysiajs/elysia.

| Package | Owns |
|---|---|
| `@kwiva/core` | App kernel (`defineApp`), context, DI tokens, `config()`, errors, policies |
| `@kwiva/config` | `defineConfig`, config-folder loading, env typing/merging |
| `@kwiva/schema` | Field DSL + model IR (validation via Standard Schema; Valibot default, switchable) |
| `@kwiva/data` | `defineModel` runtime: query builder, transactions, relations (Drizzle engine) |
| `@kwiva/http` | `defineController`, `defineMiddleware`, `defineServerRoute`, lifecycle, guards, macros, WS; `src/adapter/`, `src/universal/`, `src/ws/` (Elysia-mirroring structure) |
| `@kwiva/router` | Owned file-based router core (TanStack Router reference) |
| `@kwiva/react` | `definePage`, SSR, providers, data hooks (TanStack Query engine) |
| `@kwiva/client` | Generated typed RPC SDK (Eden-like, from controller/model IR) |
| `@kwiva/services` | `defineService` container |
| `@kwiva/queue` | `defineJob` + queue transport |
| `@kwiva/events` | `defineEvent`, listeners, transactional outbox |
| `@kwiva/auth` | `defineAuth`, session, OAuth/passkeys (Better Auth engine) |
| `@kwiva/studio` | Kwiva Studio — generated operations screens |
| `@kwiva/mcp` | MCP server from model/controller IR |
| `@kwiva/ui-kit` | Components on Base UI + Tailwind v4 |
| `@kwiva/cli` | The `kwiva` binary (oxc toolchain: rolldown, oxlint, oxfmt, transformer, resolver, minifier, isolated declarations) |
| `@kwiva/testing` | Test harness, fixtures, assertions |

## Digital Identity

### GitHub

| Resource | URL | Status |
|----------|-----|--------|
| Organization | `github.com/kwiva-dev` | ✅ Available |
| Main repo | `github.com/kwiva-dev/kwiva` | To create |
| Packages | `github.com/kwiva-dev/kwiva/packages` | To configure |

### Domain

| Domain | Purpose | Status |
|--------|---------|--------|
| `kwiva.js.org` | Primary documentation + addons registry site | ✅ Targeted — js.org subdomain (free for JS projects; requires GitHub repo + CNAME, served via GitHub Pages) |
| `kwiva.dev` | Future upgrade / canonical redirect | Consider registering later |

### npm

| Package | Purpose | Status |
|---------|---------|--------|
| `kwiva` | CLI binary | ✅ Available |
| `@kwiva/core` | Framework kernel | ✅ Available |
| `@kwiva/react` | React integration | ✅ Available |
| `@kwiva/cli` | CLI tooling | ✅ Available |
| `@kwiva/config` | Configuration runtime | ✅ Available |
| `@kwiva/schema` | Data schema layer | ✅ Available |
| `@kwiva/auth` | Authentication wrapper | ✅ Available |
| `@kwiva/tenancy` | Multi-tenancy | ✅ Available |
| `@kwiva/studio` | Kwiva Studio (operations UI generator) | Verify at publish |
| `@kwiva/http` / `@kwiva/data` / `@kwiva/router` / `@kwiva/client` / `@kwiva/queue` / `@kwiva/events` / `@kwiva/mcp` / `@kwiva/ui-kit` / `@kwiva/testing` | Remaining set | ✅ Available |

## Brand Identity

### Tone & Voice

| Quality | Expression |
|---------|------------|
| **Technical & Precise** | Clear docs, accurate API references, TypeScript-first |
| **Energetic & Dynamic** | Fast builds (oxc), quick releases, responsive DX, "quiver" metaphor |
| **Friendly & Approachable** | Warm onboarding, helpful errors, inclusive community |

### Visual Identity Direction

| Element | Recommendation |
|---------|----------------|
| **Primary Color** | Deep blue (#1E3A5F) — trust, stability, technical depth |
| **Secondary Color** | Vibrant orange (#FF6B35) — energy, creativity, action |
| **Accent** | Light gray (#F5F5F5) — clean, modern background |
| **Logo Concept** | Stylized arrow or quiver icon — minimal, geometric, suggests speed |
| **Typography** | Clean sans-serif (Inter, Satoshi, or Geist) |
| **Icon Style** | Line icons, 2px stroke, rounded caps |

## Competitive Positioning

| vs. | Kwiva Advantage |
|-----|-----------------|
| **Next.js** | Not Vercel-locked; deploy anywhere; Laravel-shaped full stack, not just React |
| **Nuxt / SvelteKit** | TypeScript-first, engine/reference split keeps apps portable |
| **Remix** | Batteries-included (queue, cache, storage, schedule, Studio), not web fundamentals only |
| **AdonisJS** | Modern Rust toolchain (oxc), Bun runtime, generated RPC/Studio/MCP |
| **NestJS** | Convention-first not decorator-heavy; frontend included; single CLI |
| **Laravel** | TypeScript end-to-end, typed RPC, deploy-anywhere presets, Bun speed |

## Required Legal/Registry Checks (before public launch)

- [x] npm: `kwiva`, `@kwiva/*` availability confirmed.
- [x] GitHub org: `kwiva-dev` available.
- [ ] Domain: submit the js.org request for `kwiva.js.org` (needs public GitHub repo + CNAME in Pages); verify at https://kwiva.js.org after approval. Register `kwiva.dev` later as the upgrade path.
- [ ] Formal trademark search for "KWIVA" in target markets (EUIPO/USPTO).
- [ ] unjs/oxc adjacency check — avoid implying affiliation with Nitro or the oxc project.

## Backups

If Kwiva is blocked: **Forgepie**, **Quiver**, **Nock**, **Furnace**, **Smelt**. All re-scored with the same criteria before adoption.
