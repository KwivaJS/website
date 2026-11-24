# The defineX Convention (/docs/core-concepts/definex)



## What is defineX? [#what-is-definex]

The `defineX` convention is Kwiva's unifying abstraction. Every application-facing construct — from models to controllers to pages to jobs — is defined through a `defineX` factory function. There is no mix of classes, decorators, and ad-hoc option objects. There is one pattern, repeated across 17 core primitives, and a smaller set of companion DSLs that follow the same grammar.

The convention exists to collapse the learning surface of the framework into a single idea:

* A construct is authored by calling one function (`defineModel`, `defineController`, `defineJob`, ...).
* The call lives in its own file at a conventional location.
* The definition is plain data and functions — no classes, no decorators, no inheritance.
* Every factory accepts an inline options object that overrides folder-level defaults.
* Types flow automatically from the definition to every downstream consumer.

## The Complete Surface [#the-complete-surface]

The authoritative list of core factories — these 17 are the full set of app-facing `defineX` entry points:

| Factory             | Purpose                 | Package           |
| ------------------- | ----------------------- | ----------------- |
| `defineApp`         | Application composition | `@kwiva/core`     |
| `defineConfig`      | Configuration modules   | `@kwiva/config`   |
| `defineModel`       | Data models             | `@kwiva/data`     |
| `defineController`  | HTTP controllers        | `@kwiva/http`     |
| `defineMiddleware`  | Middleware              | `@kwiva/http`     |
| `defineServerRoute` | Infrastructure routes   | `@kwiva/http`     |
| `defineService`     | Services                | `@kwiva/services` |
| `defineJob`         | Background jobs         | `@kwiva/queue`    |
| `defineEvent`       | Events                  | `@kwiva/events`   |
| `defineCommand`     | CLI commands            | `@kwiva/cli`      |
| `defineTask`        | Scheduled tasks         | `@kwiva/http`     |
| `definePage`        | Frontend pages          | `@kwiva/react`    |
| `definePolicy`      | Authorization policies  | `@kwiva/core`     |
| `defineAuth`        | Authentication          | `@kwiva/auth`     |
| `definePlugin`      | Plugins                 | `@kwiva/core`     |
| `defineModule`      | Modules                 | `@kwiva/core`     |
| `defineMcpTool`     | MCP tools               | `@kwiva/mcp`      |

Beyond the seventeen, companion DSLs extend the same grammar into specialized domains — `defineSeeder`, `defineFactory`, and `defineMigration` for `src/database/`, `defineGate` alongside `definePolicy`, and `defineStudioScreen` for Studio screens. They share every rule in this page: one construct per file, declarative definitions, inline options, and discovery by convention.

Each factory maps to a home directory, which is how discovery knows what a file is:

| Factory                         | Home                              | Files                      |
| ------------------------------- | --------------------------------- | -------------------------- |
| `defineApp`                     | `src/bootstrap/`                  | `app.ts`                   |
| `defineConfig`                  | `kwiva.config.ts` + `src/config/` | one file per domain        |
| `defineModel`                   | `src/app/models/`                 | `posts.ts`, `user.ts`      |
| `defineController`              | `src/app/http/controllers/`       | `posts.ts`                 |
| `defineMiddleware`              | `src/app/http/middleware/`        | `auth.ts`, `rate-limit.ts` |
| `defineAuth`                    | `src/app/http/`                   | `auth.ts`                  |
| `defineService`                 | `src/app/services/`               | `billing.ts`               |
| `defineJob`                     | `src/app/jobs/`                   | `send-welcome.ts`          |
| `defineEvent`                   | `src/app/events/`                 | `user-signed-up.ts`        |
| `defineTask`                    | `src/app/tasks/`                  | `cleanup-sessions.ts`      |
| `defineCommand`                 | `src/app/console/`                | `import-legacy.ts`         |
| `defineServerRoute`             | `src/routes/`                     | `rules.ts`                 |
| `definePage`                    | `src/ui/pages/`                   | `posts.$id.tsx`            |
| `definePolicy`                  | `src/app/policies/`               | `post.ts`                  |
| `defineModule` / `definePlugin` | packages                          | module entry               |

## Convention Rules [#convention-rules]

### One construct per file [#one-construct-per-file]

Each `defineX` call lives in its own file, named after the construct it defines:

```plaintext title="one-construct-per-file.txt"
src/app/models/posts.ts            → defineModel('posts', ...)
src/app/http/controllers/posts.ts  → defineController('posts', ...)
src/app/jobs/send-welcome.ts       → defineJob('send-welcome', ...)
src/ui/pages/posts.$id.tsx         → definePage({ ... })
```

### Named by location [#named-by-location]

The file's directory determines what it is; the filename determines what it registers. No manual registration happens anywhere — a model file in `src/app/models/` is a model by virtue of being there. This is the backbone of [auto-discovery](/docs/core-concepts/auto-discovery).

### Declarative, plain data [#declarative-plain-data]

`defineX` calls are plain function calls returning serializable definitions. There are no decorators and no classes. Reading app code reads like a description of the product:

```ts title="src/app/models/posts.ts"
// src/app/models/posts.ts
import { defineModel } from '@kwiva/data'

export default defineModel('posts', (f) => ({
  id: f.id(),
  title: f.string().validation((s) => s.min(1).max(200)),
  body: f.text().optional(),
  status: f.enum('draft', 'published').default('draft'),
  author: f.belongsTo(() => User),
  comments: f.hasMany(() => Comment),
}), {
  timestamps: true,
  permission: 'posts',
})
```

Because definitions are plain data and functions, they are statically analyzable: the framework can generate an intermediate representation (IR), codemods can rewrite them, and lint rules can enforce conventions uniformly across every construct.

### Type inference flows automatically [#type-inference-flows-automatically]

Types flow from a `defineX` definition through the entire stack:

```plaintext title="type-inference-flows-automatically.txt"
defineModel → defineController → @kwiva/client → definePage loader → data hooks
```

No codegen, no manual type annotations, one type universe. A client call is checked against the model that produced the endpoint, not against a hand-maintained SDK. See [Type Inference](/docs/core-concepts/type-inference) for how this works.

### Inline options override config [#inline-options-override-config]

Every `defineX` accepts full inline options, and inline values always win over config-folder values:

```ts title="src/config/cache.ts"
// src/config/cache.ts declares a global cache TTL
// but this model tunes it inline
export default defineModel('posts', (f) => ({ /* ... */ }), {
  cache: { ttl: 120, tags: ['posts'] },   // overrides the folder default for posts only
})
```

The folder centralizes; inline tunes per construct. The precedence chain is documented in [Configuration](/docs/core-concepts/configuration).

## File Naming Conventions [#file-naming-conventions]

| File type   | Convention      | Example                      |
| ----------- | --------------- | ---------------------------- |
| Models      | `singular.ts`   | `post.ts`, `user.ts`         |
| Controllers | `plural.ts`     | `posts.ts`, `users.ts`       |
| Middleware  | `kebab-case.ts` | `auth.ts`, `rate-limit.ts`   |
| Jobs        | `kebab-case.ts` | `send-welcome.ts`            |
| Events      | `kebab-case.ts` | `user-signed-up.ts`          |
| Policies    | `singular.ts`   | `post.ts`, `user.ts`         |
| Pages       | `dot.route.tsx` | `posts.$id.tsx`, `index.tsx` |

Names are lowercase throughout. Where a construct has no fixed singular or plural rule (middleware, jobs, events, tasks, commands), files use kebab-case. When a file exports named values — such as the composed app in `src/bootstrap/app.ts` — named exports follow PascalCase, while the `defineX` construct itself is the module's default export. The CLI generators enforce these rules, rejecting names that would fail the conventions later. See [Generators](/docs/cli/generators).

## Inline Options: Full and Always Available [#inline-options-full-and-always-available]

Options are not a separate feature of one or two factories — they are part of the grammar:

```ts title="inline-options-full-and-always-available.ts"
export default defineController('reports', (c) => ({ /* ... */ }), {
  prefix: '/reports',
  cors: { origins: ['https://acme.dev'] },   // inline beats the folder
})

export default defineJob('cleanup', handler, {
  queue: 'maintenance',                      // routes to a queue declared in src/config/queue.ts
  attempts: 3,
})
```

The rule of thumb: the folder defaults, inline tunes. Nothing is configured from a third place.

## Why One Convention? [#why-one-convention]

The `defineX` convention exists because:

1. **Consistency** — learn one pattern, apply it to every construct.
2. **Discoverability** — every file type follows the same structure, so the scanner and humans agree.
3. **Type safety** — types flow through the entire stack from a single source.
4. **Tooling** — lint rules, generators, codemods, and IDE support target one pattern.
5. **Readability** — app code reads like a product description.
6. **Extensibility** — new constructs ship as `defineX` factories with a matching generator, so the grammar never diversifies.

> \[!TIP]
> If you are unsure how a file should be authored, check the generators first: `kwiva make:*` always emits the convention-shaped stub for that construct.

## What to Read Next [#what-to-read-next]

* [Models](/docs/data/models) — `defineModel` deep dive
* [Controllers](/docs/http/controllers) — `defineController` deep dive
* [Pages](/docs/frontend/pages) — `definePage` deep dive
* [Application Composition](/docs/core-concepts/applications) — how `defineApp` bootstraps everything
* [Generators](/docs/cli/generators) — every `make:` command emits this grammar
