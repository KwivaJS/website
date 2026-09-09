# Application 01 — Project Structure

**Status**: Locked · **Updated**: 2026-09-08 · **Docset**: v0.3

The Kwiva app filesystem: Laravel-shaped, TypeScript-native, **all lowercase**, one `defineX` factory per file type. Enforced by the CLI scaffold and oxlint gates.

## Full app tree

```
acme/
├─ kwiva.config.ts            # defineConfig — app entry (loads src/config)
├─ package.json
├─ tsconfig.json
├─ .env / .env.local / .env.example
├─ public/                       # static assets served as-is (favicon, robots.txt)
├─ storage/                      # runtime: sqlite db, uploads, logs, cache
├─ tests/                        # unit + integration + e2e
│  ├─ api/*.test.ts
│  ├─ models/*.test.ts
│  └─ e2e/*.spec.ts              # Playwright
└─ src/
   ├─ bootstrap/
   │  └─ app.ts                  # defineApp — the application kernel
   ├─ app/
   │  ├─ models/                 # defineModel — one file per model
   │  │  ├─ users.ts
   │  │  ├─ posts.ts
   │  │  └─ comments.ts
   │  ├─ http/
   │  │  ├─ controllers/         # defineController — one file per resource
   │  │  │  ├─ auth.ts
   │  │  │  └─ posts.ts
   │  │  ├─ middleware/          # defineMiddleware — one file per middleware
   │  │  │  ├─ auth.ts
   │  │  │  ├─ tenant.ts
   │  │  │  └─ request-id.ts
   │  │  └─ auth.ts              # defineAuth — providers/session
   │  ├─ services/               # defineService — business logic
   │  │  └─ billing.ts
   │  ├─ jobs/                   # defineJob — one file per job
   │  │  └─ send-welcome.ts
   │  ├─ events/                 # defineEvent — one file per event
   │  │  └─ user-signed-up.ts
   │  ├─ policies/               # definePolicy — one file per resource
   │  │  └─ posts.ts
   │  ├─ tasks/                  # defineTask — background tasks
   │  │  └─ cleanup.ts
   │  └─ console/                # defineCommand — CLI commands
   │     └─ import-legacy.ts
   ├─ routes/
   │  ├─ api.ts                  # controller registration + route rules
   │  ├─ console.ts              # command + schedule registration
   │  └─ rules.ts                # defineServerRoute — infra route rules
   ├─ config/                    # ALL configuration lives here (see 03)
   │  ├─ app.ts
   │  ├─ database.ts
   │  ├─ auth.ts
   │  ├─ api.ts
   │  ├─ queue.ts
   │  ├─ cache.ts
   │  ├─ storage.ts
   │  ├─ schedule.ts
   │  ├─ tenancy.ts
   │  ├─ cors.ts
   │  ├─ ui.ts
   │  ├─ telemetry.ts
   │  └─ modules.ts
   ├─ database/
   │  ├─ migrations/             # generated + editable SQL-step files
   │  ├─ seeders/                # defineSeeder
   │  └─ factories.ts            # model factories (extend per model)
   ├─ ui/
   │  ├─ pages/                  # definePage — file-based routing
   │  │  ├─ __root.tsx
   │  │  ├─ index.tsx
   │  │  ├─ posts.index.tsx
   │  │  ├─ posts.$id.tsx
   │  │  └─ settings/
   │  │     └─ profile.tsx
   │  ├─ components/             # shared components
   │  ├─ hooks/                  # custom hooks
   │  └─ styles/                 # global css / tailwind entry
   └─ .kwiva/                 # GENERATED (never edit, gitignored)
      ├─ route-manifest.json     # route IR → client, OpenAPI, MCP
      ├─ model-ir.json           # model IR
      └─ types/                  # generated ambient types
```

## Rules

1. **Lowercase everywhere**: directories and file names use kebab/dot case (`send-welcome.ts`, `posts.$id.tsx`). Enforced by `kwiva check` (oxlint convention rules).
2. **One factory per file type**: `defineModel` in `src/app/models/*.ts`, `defineController` in `src/app/http/controllers/*.ts`, `definePage` in `src/ui/pages/**`, etc. (full table in [07-feature-catalog §Cross-cutting](../07-feature-catalog.md)).
3. **No engine imports**: app code imports only `@kwiva/*` (plus its own modules and regular npm libs that are not engines).
4. **`src/.kwiva/` is generated**: rebuilt on dev/build; never hand-edited.
5. **Registration is file-scan based**: models/controllers/pages/middleware are auto-discovered from their directories; `src/routes/*.ts` exists for explicit registration, ordering, and route rules.
6. **Config has exactly one home**: `src/config/` (+ `kwiva.config.ts` entry) — see [03-configuration.md](03-configuration.md).
7. **Static split**: only `public/` is served raw; app code never lives there.

## The bootstrap kernel

```ts
// src/bootstrap/app.ts
import { defineApp } from '@kwiva/core'
import auth from '../app/http/auth'
import { controllers, models, middleware } from '@kwiva/core/discover'

export const app = defineApp({
  auth,
  models,          // auto-discovered from src/app/models
  controllers,     // auto-discovered from src/app/http/controllers
  middleware,      // stack defined in src/config/app.ts, files discovered
  providers: [
    // boot/shutdown hooks for services
  ],
})
```

## Mode variations

| Mode | Removed | Notes |
|---|---|---|
| `api+spa` | `src/ui/pages` (optional) | SSR renderer off; SPA shell served |
| `static` | `src/app/http`, `src/app/jobs`, … | prerendered pages only |
| `standalone` | nothing | single-binary output |
| `edge` | (same tree) | edge-safe constraint set applies ([06](../06-adapter-matrix.md)) |

## Naming cheatsheet

| Artifact | File | Factory |
|---|---|---|
| App kernel | `src/bootstrap/app.ts` | `defineApp` |
| Model | `src/app/models/users.ts` | `defineModel` |
| Controller | `src/app/http/controllers/posts.ts` | `defineController` |
| Middleware | `src/app/http/middleware/auth.ts` | `defineMiddleware` |
| Auth | `src/app/http/auth.ts` | `defineAuth` |
| Service | `src/app/services/billing.ts` | `defineService` |
| Job | `src/app/jobs/send-welcome.ts` | `defineJob` |
| Event | `src/app/events/user-signed-up.ts` | `defineEvent` |
| Policy | `src/app/policies/posts.ts` | `definePolicy` |
| Task | `src/app/tasks/cleanup.ts` | `defineTask` |
| Command | `src/app/console/import-legacy.ts` | `defineCommand` |
| Config module | `src/config/database.ts` | `defineConfig` |
| Server route rules | `src/routes/rules.ts` | `defineServerRoute` |
| Page | `src/ui/pages/posts.$id.tsx` | `definePage` |
