# Research — Laravel (as DX Reference)

**Relevance**: **Reference** — Kwiva's DX-grammar model. Laravel is the gold standard for batteries-included frameworks; the JS ecosystem lacks its opinionated onboard. Kwiva adapts the shape uniquely (Laravel-shaped, Kwiva's own).

## What "Laravel-Style DX" Means for Kwiva

### 1. CLI-first scaffolding & automation
Laravel: `laravel new`, `artisan make:model/controller/migration/seeder`, `artisan serve`, `artisan tinker`, `migrate`, `queue:work`, `schedule:run`.
Kwiva equivalent: `kwiva new`, `kwiva make:*`, `kwiva dev`, `kwiva console` (tinker-like), `kwiva db:migrate/seed`, `kwiva task:run`, `kwiva queue:work`.

### 2. Convention-over-configuration with an escape hatch
- Laravel: opinions by default (`app/`, resources, controllers); every switch documented.
- Kwiva: file layouts + route conventions + config folder, deviating when needed (ADR-0011, ADR-0012/0020).

### 3. Predictable project anatomy
Laravel's `app/Models`, `app/Http/Controllers`, `database/migrations`, `resources/views`.
Kwiva anatomy defined in `application/01-project-structure.md`: `src/app/models/*`, `src/app/http/controllers/*`, `src/database/migrations/`, `src/ui/pages/**` — all lowercase, all `defineX`.

### 4. The "framework is the tutorial"
Laravel docs teach the whole app (auth → models → queues → payment). Kwiva targets the same: one coherent narrative rather than scattered library docs — this whole docs set is that narrative.

### 5. Ecosystem covenant
"Use the pro parts" (cashier, horizon, telescope, nova). Kwiva parallels: Kwiva Studio (Nova-like), observability defaults (Telescope-like), queue with DLQ + CLI (Horizon-like), payment/email integrations as recipe modules.

### 6. Entities become nouns
Laravel: `User`, `Article`, `Payment` walk the whole stack. Kwiva: models flow from `defineModel` → REST → client → Studio → jobs as the same noun.

## What Laravel Gets Wrong (Kwiva avoids)

- **Namespace sprawl & doc-heavy boilerplate**: Kwiva converts docs to executable `kwiva` commands; defineX conventions are enforced by lint, not by reading.
- **Global state**: `config()`, service container magic — Kwiva favors typed context (state/decorate/resolve) + typed `config()`.
- **PHP runtime limits** (concurrency/edge) — irrelevant in the Bun/portability story.
- **Monolithic defaults**: Kwiva's modular `@kwiva/*` packages (ADR-0010/0017) keep apps lean.

## Concrete Borrowed Patterns → Kwiva Surfaces

| Laravel | Kwiva |
|---|---|
| `artisan make:model` | `kwiva make:model` (model + migration + factory) |
| `artisan make:controller` | `kwiva make:controller` (`defineController`) |
| `artisan migrate` | `kwiva db:migrate` (model IR diff) |
| `artisan tinker` | `kwiva console` (Bun REPL w/ app ctx) |
| `artisan queue:work` | `kwiva queue:work` |
| `artisan schedule:run` | `kwiva schedule:run` |
| Eloquent relationships | `f.belongsTo/hasMany/hasOne/belongsToMany` |
| Eloquent scopes/soft-deletes | query builder + `softDelete` option |
| Middleware pipeline | `defineMiddleware` + lifecycle stages |
| Service container | typed context (state/decorate/resolve) + `defineService` |
| Policies/Gates | `definePolicy` / `defineGate` (platform/02) |
| Events/listeners + broadcast | `defineEvent` + channels (data/04) |
| Queues (retries/DLQ/failed table) | `defineJob` + DLQ + `queue:*` CLI |
| Task scheduling | `src/config/schedule.ts` + scheduler controls |
| Factories/seeders | `defineFactory` / `defineSeeder` |
| `config/*.php` | `src/config/*.ts` (`defineConfig`) |
| `auth()->user()` | typed `ctx.session` / `useSession()` |
| Nova admin | Kwiva Studio (`@kwiva/studio`) |
| Telescope | observability defaults (OTel) |
| Form Requests | route schemas (body/query validation) |
| API Resources | typed responses from the route manifest |

## Narrative Docs Style

Kwiva docs adopt "one cohesive path": Getting started → core concepts → building a real app (auth + tenancy + Studio) → deploying everywhere. Each doc links the underlying engine for depth, but the **Kwiva narrative is self-contained** — that is the differentiator this docset is written to provide.
