# Project Structure (/docs/getting-started/project-structure)



A Kwiva project follows a predictable, all-lowercase filesystem with a clear separation of concerns: one directory per concern, one `defineX` construct per file. Because the framework discovers files by convention, the directory layout *is* the registration mechanism — there is no central list of models, controllers, or pages to maintain.

## Directory Layout [#directory-layout]

<Files>
  <File name="kwiva.config.ts" />

  <File name="package.json" />

  <File name="tsconfig.json" />

  <File name=".env / .env.local / .env.example" />

  <Folder name="public" />

  <Folder name="storage" />

  <Folder name="tests">
    <File name="api/*.test.ts" />

    <File name="models/*.test.ts" />

    <File name="e2e/*.spec.ts" />
  </Folder>

  <Folder name="src">
    <Folder name="bootstrap">
      <File name="app.ts" />
    </Folder>

    <Folder name="app">
      <Folder name="models" />

      <Folder name="http">
        <Folder name="controllers" />

        <Folder name="middleware" />

        <File name="auth.ts" />
      </Folder>

      <Folder name="services" />

      <Folder name="jobs" />

      <Folder name="events" />

      <Folder name="policies" />

      <Folder name="tasks" />

      <Folder name="console" />
    </Folder>

    <Folder name="routes">
      <File name="api.ts" />

      <File name="console.ts" />

      <File name="rules.ts" />
    </Folder>

    <Folder name="config" />

    <Folder name="database">
      <Folder name="migrations" />

      <Folder name="seeders" />

      <File name="factories.ts" />
    </Folder>

    <Folder name="ui">
      <Folder name="pages">
        <File name="__root.tsx" />

        <File name="index.tsx" />

        <File name="posts.$id.tsx" />

        <Folder name="settings">
          <File name="profile.tsx" />
        </Folder>
      </Folder>

      <Folder name="components" />

      <Folder name="hooks" />

      <Folder name="styles" />
    </Folder>
  </Folder>
</Files>

The same tree can be written as a `files` code block:

<Files>
  <Folder name="   └─ pages/" />
</Files>

Generated artifacts — the route manifest, the model intermediate representation, and ambient types — live in `src/.kwiva/`, rebuild on `kwiva dev` and `kwiva build`, and are never hand-edited or committed.

## Key Conventions [#key-conventions]

1. **Lowercase everywhere** — directories and file names use lowercase kebab/dot case: `send-welcome.ts`, `posts.$id.tsx`. Enforced by `kwiva check`.
2. **One construct per file** — each model, controller, middleware, job, event, policy, and task lives in its own file and exports one `defineX` definition.
3. **Auto-discovery** — models, controllers, middleware, pages, jobs, events, and commands are discovered from their directories by convention. `src/routes/*.ts` exists for explicit registration, ordering, and route rules.
4. **Framework-owned imports** — app code imports only from `@kwiva/*` packages. Importing an engine by name is a lint error.
5. **Config has exactly one home** — `src/config/` plus the `kwiva.config.ts` entry. Nothing is configured from a third place.
6. **Only `public/` is served raw** — static assets live there; app code never does.

## The `defineX` Files [#the-definex-files]

Each directory maps to one factory from one package:

| Directory / file                | Factory             | Package           |
| ------------------------------- | ------------------- | ----------------- |
| `src/bootstrap/app.ts`          | `defineApp`         | `@kwiva/core`     |
| `src/config/*.ts`               | `defineConfig`      | `@kwiva/config`   |
| `src/app/models/*.ts`           | `defineModel`       | `@kwiva/data`     |
| `src/app/http/controllers/*.ts` | `defineController`  | `@kwiva/http`     |
| `src/app/http/middleware/*.ts`  | `defineMiddleware`  | `@kwiva/http`     |
| `src/app/http/auth.ts`          | `defineAuth`        | `@kwiva/auth`     |
| `src/app/services/*.ts`         | `defineService`     | `@kwiva/services` |
| `src/app/jobs/*.ts`             | `defineJob`         | `@kwiva/queue`    |
| `src/app/events/*.ts`           | `defineEvent`       | `@kwiva/events`   |
| `src/app/policies/*.ts`         | `definePolicy`      | `@kwiva/core`     |
| `src/app/tasks/*.ts`            | `defineTask`        | `@kwiva/http`     |
| `src/app/console/*.ts`          | `defineCommand`     | `@kwiva/cli`      |
| `src/routes/rules.ts`           | `defineServerRoute` | `@kwiva/http`     |
| `src/ui/pages/*.tsx`            | `definePage`        | `@kwiva/react`    |
| `src/database/seeders/*.ts`     | `defineSeeder`      | `@kwiva/data`     |

## The Bootstrap Kernel [#the-bootstrap-kernel]

The application is composed in `src/bootstrap/app.ts` with `defineApp`. Models, controllers, and middleware are imported from the discovery helper, so the file reads as a declaration of what the app is rather than a list of wiring:

```ts title="src/bootstrap/app.ts"
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

## Mode Variations [#mode-variations]

Modes are profiles of the same layout — each removes or adjusts a slice of the tree:

| Mode         | Removed                                     | Notes                                           |
| ------------ | ------------------------------------------- | ----------------------------------------------- |
| `api+spa`    | `src/ui/pages` (optional)                   | SSR renderer off; SPA shell served              |
| `static`     | `src/app/http`, `src/app/jobs`, and friends | Prerendered pages only, no server at runtime    |
| `standalone` | nothing                                     | Single-binary output via `kwiva build --binary` |
| `edge`       | same tree                                   | Edge-safe constraint set applies                |

In every mode, the config folder, the model layer, and the discovery rules are identical — the differences are confined to which surfaces are enabled and how the build is emitted.

## Naming Cheatsheet [#naming-cheatsheet]

| Artifact           | File                                | Factory             |
| ------------------ | ----------------------------------- | ------------------- |
| App kernel         | `src/bootstrap/app.ts`              | `defineApp`         |
| Model              | `src/app/models/users.ts`           | `defineModel`       |
| Controller         | `src/app/http/controllers/posts.ts` | `defineController`  |
| Middleware         | `src/app/http/middleware/auth.ts`   | `defineMiddleware`  |
| Auth               | `src/app/http/auth.ts`              | `defineAuth`        |
| Service            | `src/app/services/billing.ts`       | `defineService`     |
| Job                | `src/app/jobs/send-welcome.ts`      | `defineJob`         |
| Event              | `src/app/events/user-signed-up.ts`  | `defineEvent`       |
| Policy             | `src/app/policies/posts.ts`         | `definePolicy`      |
| Task               | `src/app/tasks/cleanup.ts`          | `defineTask`        |
| Command            | `src/app/console/import-legacy.ts`  | `defineCommand`     |
| Config module      | `src/config/database.ts`            | `defineConfig`      |
| Server route rules | `src/routes/rules.ts`               | `defineServerRoute` |
| Page               | `src/ui/pages/posts.$id.tsx`        | `definePage`        |

## What to Read Next [#what-to-read-next]

* [Configuration](/docs/getting-started/configuration) — how to configure your project
* [The defineX Convention](/docs/core-concepts/definex) — the pattern behind every file
* [Application Composition](/docs/core-concepts/applications) — how the app boots
* [Auto-Discovery](/docs/core-concepts/auto-discovery) — how files are discovered by convention
