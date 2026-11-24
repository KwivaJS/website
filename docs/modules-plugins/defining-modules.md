# Defining Modules (/docs/modules-plugins/defining-modules)



A module is a reusable capability package: a folder of contributions — models, controllers, pages, jobs, events, tasks, policies, migrations, config defaults, and channel policies — declared through the `defineModule` factory and installed into any Kwiva application as a unit. This page is the complete reference for authoring one.

## The `defineModule` Factory [#the-definemodule-factory]

A module is defined with the same declarative convention as everything else in Kwiva — one factory, plain serializable options, zero classes and zero decorators. The signature follows the `defineX` grammar you already know.

```ts title="modules/chat/index.ts"
// modules/chat/index.ts
import { defineModule } from '@kwiva/core'

export default defineModule({
  name: '@acme/chat',
  version: '1.2.0',

  // contribution points — all optional
  models:      () => import.meta.glob('./models/*.ts'),      // rooms, messages
  controllers: () => import.meta.glob('./controllers/*.ts'), // chat
  middleware:  () => import.meta.glob('./middleware/*.ts'),
  pages:       () => import.meta.glob('./pages/**/*.tsx'),   // ui additions
  jobs:        () => import.meta.glob('./jobs/*.ts'),
  events:      () => import.meta.glob('./events/*.ts'),
  tasks:       () => import.meta.glob('./tasks/*.ts'),
  policies:    () => import.meta.glob('./policies/*.ts'),
  migrations:  './migrations',                                // applied with app migrations
  config:      { chat: { maxMessageLength: 2000 } },          // namespaced defaults
  channels:    { 'chat.{roomId}': { policy: 'chat.member' } },

  // module lifecycle
  boot: async ({ config, models, providers }) => { /* ... */ },
  shutdown: async () => { /* ... */ },

  // peer requirements
  requires: { '@kwiva/core': '^1', '@kwiva/auth': '^1' },
})
```

`name` and `version` identify the module; everything else is optional. A module that ships only pages is as valid as one that ships the full vertical stack. Every contribution lives behind a lazy glob so the framework only loads what the app actually uses.

## Contribution Points [#contribution-points]

| Contribution  | Shape                    | What it adds to the app                                      |
| ------------- | ------------------------ | ------------------------------------------------------------ |
| `models`      | Glob of model files      | Database tables, generated routes, types, Studio screens     |
| `controllers` | Glob of controller files | HTTP routes under the module's scope                         |
| `middleware`  | Glob of middleware files | Pipeline stages available to the app                         |
| `pages`       | Glob of page files       | UI additions registered under the module's route scope       |
| `jobs`        | Glob of job files        | Queueable background work                                    |
| `events`      | Glob of event files      | Emitted and consumed events                                  |
| `tasks`       | Glob of task files       | Scheduled background work                                    |
| `policies`    | Glob of policy files     | Authorization rules in the module's permission namespace     |
| `migrations`  | Directory                | Schema steps applied with the app's migrations               |
| `config`      | Object                   | Namespaced defaults, overridable by the app                  |
| `channels`    | Map of channel patterns  | Realtime channels plus their policies                        |
| `boot`        | Async function           | Module startup — config, models, and providers are passed in |
| `shutdown`    | Async function           | Module teardown, run during app shutdown                     |
| `requires`    | Version ranges           | Declared peer requirements for `@kwiva/*` dependencies       |

## How Contributions Resolve [#how-contributions-resolve]

Each contribution merges into the application's existing scan:

* **Models** are registered under the module's namespace. A chat module contributing `messages` registers as `chat.messages`, gets the full generated-route surface, and appears in the typed client, OpenAPI spec, Studio, and MCP tools under that name.
* **Controllers** mount their routes under the module's declared prefix, namespaced so they cannot collide with application routes.
* **Pages** are mounted under the module's route scope, so a UI addon keeps its URLs to itself.
* **Config** defaults register under the module's namespace and participate in the standard precedence: defaults → `src/config` values → inline `defineX` options, inline wins.
* **Migrations** are applied with the app's migrations — ordered **before** application migrations and versioned by module version.

Because discovery is glob-based, adding a file to a module folder is adding a capability. No registry edits exist inside a module.

## Model Contributions in Depth [#model-contributions-in-depth]

A module model is a normal `defineModel` file. It derives everything an application model derives — table, generated REST routes, types, and Studio screens — but namespaced to the module:

```ts title="modules/chat/models/messages.ts"
// modules/chat/models/messages.ts
import { defineModel } from '@kwiva/data'

export default defineModel('messages', (f) => ({
  id: f.id(),
  roomId: f.foreignKey('rooms'),
  body: f.text(),
  authorId: f.foreignKey('users'),
}), {
  timestamps: true,
  permission: 'chat',
})
```

The namespacing contract is what keeps two modules from colliding: the same file, in two different module folders, produces two disjoint resource names (`chat.messages` and `forum.messages`) that coexist in the same app.

> \[!TIP]
> Because module config defaults register under their own namespace, an app can tighten a module's behavior without forking it. Overriding `chat.maxMessageLength` in `src/config/modules.ts` is a deep merge — the app wins, the module keeps shipping updates.

## Module Scope and Boundaries [#module-scope-and-boundaries]

Modules follow hard contracts so that any number of them can coexist:

* **Namespacing** — model and resource names are prefixed by the module scope. A chat module's models become `chat.rooms` and `chat.messages`, never bare `rooms` and `messages`.
* **Route prefixing** — page and route paths mount under the module's declared prefix. No two modules can claim the same namespace.
* **Config namespacing** — module defaults register under their namespaces (`chat.maxMessageLength`) and can be overridden in the app's `src/config/modules.ts` via a deep merge where the app wins — the standard precedence (defaults → `src/config` → inline, inline wins).
* **Policy namespacing** — module policies live in the module's permission namespace (`chat.member`, not `member`).
* **Isolation** — modules never import each other's internals. They interoperate only through published contribution points, so upgrade paths stay clean.
* **Migration ordering** — module migrations are ordered **before** application migrations and versioned by module version, so a module can evolve independently of the app.

This port discipline is enforced mechanically: module boundary rules are part of the default lint surface, so a module that reaches into another module's internals fails the gate rather than shipping.

## Co-located Assets [#co-located-assets]

A module is a folder. Everything it contributes is referenced through lazy globs relative to the module entry, so the module's models, controllers, pages, and jobs stay co-located:

```text title="co-located-assets.txt"
modules/chat/
├─ index.ts                  # defineModule entry
├─ models/
│  ├─ rooms.ts
│  └─ messages.ts
├─ controllers/chat.ts
├─ middleware/chat-auth.ts
├─ policies/chat.ts
├─ pages/
│  └─ index.tsx
├─ jobs/send-message-notification.ts
├─ events/message-posted.ts
├─ tasks/archive-old-rooms.ts
└─ migrations/
   ├─ 0001_create_rooms.ts
   └─ 0002_create_messages.ts
```

Because contributions are discovered by glob, adding a file to a module folder is adding a capability — no registry edits inside the module. The standard `kwiva make:*` generators can scaffold module folders, and file placement inside a module follows the same lowercase-kebab naming rules as application files.

## Lifecycle and Peer Requirements [#lifecycle-and-peer-requirements]

* `boot` runs when the module joins the app, with typed access to config, models, and providers. This is where a module prepares its runtime — scheduling recurring work, seeding defaults, or warming a provider.
* `shutdown` runs during app teardown, inverting boot order with the rest of the kernel. Providers stop, the queue drains, the engine stops — a module's teardown slots into that sequence.
* `requires` declares compatible versions of `@kwiva/*` packages; addon tooling respects these ranges when resolving upgrades. Resolution rejects incompatible combinations rather than running them, and `kwiva addons update` will not jump outside a declared range.

```ts title="lifecycle-and-peer-requirements.ts"
export default defineModule({
  name: '@acme/billing',
  version: '0.4.1',
  requires: { '@kwiva/core': '^1', '@kwiva/notifications': '^1' },
  boot: async ({ config, jobs }) => {
    if (config.billing.dueReminders) {
      jobs.schedule('billing.send-reminders', '0 9 * * *')
    }
  },
})
```

## Writing a Module Step by Step [#writing-a-module-step-by-step]

1. **Scaffold** — `kwiva make:module analytics` creates `modules/analytics/` with slots for each contribution type.
2. **Declare the entry** — fill in `name`, `version`, and `requires` on the `defineModule` call.
3. **Add contributions** — drop model, controller, page, and job files into their folders; the globs pick them up.
4. **Set config defaults** — namespaced defaults under `config`, documented so apps know what they can override.
5. **Test against a real app** — register the module in `kwiva.config.ts` locally and exercise the routes, policies, and jobs it contributes.
6. **Package** — `kwiva module:build` produces the distribution; publish to the registry tagged with the `kwiva-addon` keyword.

## Publishing a Module [#publishing-a-module]

```bash title="terminal"
kwiva module:build
```

`kwiva module:build` packages the module: a package with the contribution manifest plus a compiled distribution (bundled output plus isolated type declarations). The registry contract is a published package that

* exports the `defineModule` result as its default export,
* is tagged with the `kwiva-addon` keyword in the package registry, and
* declares its `requires` ranges so apps resolve compatible versions.

Discoverability comes from the curated addon index behind `kwiva addons search`. See [Addons & Distribution](/docs/modules-plugins/addons) for the full workflow, and [CLI Generators](/docs/cli/generators) for `make:module` and the module build surface.

## What's Next [#whats-next]

* [Addons & Distribution](/docs/modules-plugins/addons) — publish, install, and version modules
* [Application Composition](/docs/modules-plugins/composition) — see modules join the kernel
* [Modules & Plugins](/docs/modules-plugins) — the composition model at a glance
* [The defineX Convention](/docs/core-concepts/definex) — one grammar across every factory
* [Data Models](/docs/data/models) — what a module's `models` contribution derives
