# Modules & Plugins (/docs/modules-plugins)



Modules and plugins are how Kwiva scales from a single application to a **platform**. Where `defineX` files compose a single app, `defineModule` composes reusable capabilities — models, controllers, pages, jobs, config, and migrations — that drop into any Kwiva application as a unit. Addons extend the same idea to the whole ecosystem: anything installable ships and lands through one workflow.

This section covers the full story in four pages:

| Page                                                         | Purpose                                                                      |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [Defining Modules](/docs/modules-plugins/defining-modules)   | The `defineModule` factory and every contribution point                      |
| [Application Composition](/docs/modules-plugins/composition) | How the kernel (`defineApp`) assembles an app from modules                   |
| [Addons & Distribution](/docs/modules-plugins/addons)        | Install, search, version, and publish capabilities                           |
| This page                                                    | The model: what modules, plugins, and addons are, and when to reach for them |

## What Is a Module? [#what-is-a-module]

A module is a **package-level capability**. One module can ship models, controllers, middleware, pages, jobs, events, tasks, policies, migrations, config defaults, and channel policies together, all namespaced so they never collide with your application code:

```ts title="modules/chat/index.ts"
// modules/chat/index.ts
import { defineModule } from '@kwiva/core'

export default defineModule({
  name: '@acme/chat',
  version: '1.2.0',

  // contribution points — all optional
  models:      () => import.meta.glob('./models/*.ts'),       // rooms, messages
  controllers: () => import.meta.glob('./controllers/*.ts'),  // chat
  pages:       () => import.meta.glob('./pages/**/*.tsx'),    // ui additions
  jobs:        () => import.meta.glob('./jobs/*.ts'),
  migrations:  './migrations',                                 // applied with app migrations
  config:      { chat: { maxMessageLength: 2000 } },          // namespaced defaults
  channels:    { 'chat.{roomId}': { policy: 'chat.member' } },

  boot: async ({ config, models, providers }) => { /* ... */ },
  requires: { '@kwiva/core': '^1', '@kwiva/auth': '^1' },
})
```

Contributions merge into the application scan as if they were local — namespaced, versioned, and conflict-free. See [Defining Modules](/docs/modules-plugins/defining-modules) for the full surface, including lifecycle hooks and peer requirements.

## Modules, Plugins, and Themes [#modules-plugins-and-themes]

The noun for "installable capability" is **addon**. An addon is any one of three kinds of package:

| Kind   | It is                   | Example surface                                  |
| ------ | ----------------------- | ------------------------------------------------ |
| Module | A full-stack capability | models + controllers + pages + jobs + config     |
| Plugin | An HTTP-level extension | middleware, route rules, lifecycle hooks         |
| Theme  | A UI skin               | pages and components restyled through the ui-kit |

All three flow through the same install path — `kwiva add` — and are managed by the same `kwiva addons` commands. The distinction matters at authoring time: a module is authored with `defineModule`, a plugin with `definePlugin`, and a theme as a ui-kit skin; at consumption time they are all just "addons."

```bash title="terminal"
kwiva add @kwiva/blog               # a module: install + register + migrations check
kwiva add ./addons/analytics --path # a local addon from a workspace path
kwiva addons list                   # everything installed, with contributions and versions
```

## When to Reach for a Module [#when-to-reach-for-a-module]

A module is the right unit when a capability is meant to be **reused across applications** — by your own team today, or by the ecosystem tomorrow. The framework's composition ladder makes the progression natural:

1. **A static site** — model-less pages; the kernel with config + pages + prerender.
2. **A CRUD app** — one model, zero controllers.
3. **A SaaS** — auth, policies, tenancy, Studio.
4. **Realtime** — events, channels, jobs.
5. **A platform** — modules, MCP, multi-preset deploys.

The kernel shape never changes on the way up that ladder — only which `defineX` files and modules exist. If you catch yourself imagining the second application that will need the feature you are building, that is the moment to extract a module.

## Contribution Points in Brief [#contribution-points-in-brief]

A module declares what it contributes with globs — same lazy, scan-based convention as application files. The full surface is documented on [Defining Modules](/docs/modules-plugins/defining-modules); the key contributions:

| Contribution                | What it adds                                             |
| --------------------------- | -------------------------------------------------------- |
| `models`                    | Database tables, generated routes, types, Studio screens |
| `controllers`               | HTTP routes under the module's scope                     |
| `pages`                     | UI additions under the module's route scope              |
| `jobs` / `tasks` / `events` | Background work and emitted events                       |
| `policies`                  | Authorization rules in the module's permission namespace |
| `migrations`                | Schema steps applied with the app's migrations           |
| `config`                    | Namespaced defaults, overridable by the app              |
| `channels`                  | Realtime channels plus their policies                    |

Everything is optional. A module that ships only pages is as valid as one that ships the whole vertical stack.

## The Contracts That Keep Modules Safe [#the-contracts-that-keep-modules-safe]

Any number of modules can coexist because of a small set of hard contracts:

* **Namespacing** — model and resource names are prefixed by the module scope (`chat.messages`, never bare `messages`); route paths mount under the module's declared prefix, so no two modules can claim the same namespace.
* **Config precedence** — module defaults register under their namespace (`chat.maxMessageLength`) and are overridden in the app's `src/config/modules.ts` through a deep merge where the app wins: defaults → `src/config` → inline, inline wins.
* **Isolation** — modules never import each other's internals; they interoperate only through published contribution points.
* **Migration ordering** — module migrations are ordered **before** application migrations and versioned by module version, so a module can evolve independently of the app.
* **Peer requirements** — each module declares `requires` ranges for `@kwiva/*` packages, and addon tooling respects those ranges when resolving upgrades.

## Where Modules Come From [#where-modules-come-from]

| Source                  | Example                                                                    | Notes                                                               |
| ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| First-party             | `@kwiva/auth-kit`, `@kwiva/blog`, `@kwiva/billing`, `@kwiva/notifications` | Built and maintained by the framework team                          |
| Third-party (published) | any addon published to the package registry with the `kwiva-addon` keyword | Installed with `kwiva add`, discoverable through the addon registry |
| Local                   | `./modules/billing`                                                        | Workspace path; no publishing required                              |

Local and vendored modules are fully first-class — you get all the composition guarantees without leaving your repository.

## Composition for Applications [#composition-for-applications]

Modules exist to be composed. The application kernel (`defineApp` in `src/bootstrap/app.ts`) receives discovered files and explicit providers; modules contribute to both. The module registry lives in `kwiva.config.ts`:

```ts title="kwiva.config.ts"
// kwiva.config.ts
export default defineConfig({
  modules: [
    '@kwiva/auth-kit',    // first-party addon
    '@acme/chat',         // third-party addon
    './modules/billing',  // local workspace path
  ],
})
```

`kwiva add` writes that entry for you. Manual registration stays supported for vendored or path-based modules. Discovery merges module contributions into the app scan before the model IR is built, so a module's models, migrations, and config defaults participate in everything the IR derives — the typed client, OpenAPI spec, Studio screens, and MCP tools. See [Application Composition](/docs/modules-plugins/composition) for how the kernel assembles everything in order.

## Publishing [#publishing]

Publishing a module is a small, explicit contract:

1. The package **exports the `defineModule` result** as its default export.
2. It is **tagged with the `kwiva-addon` keyword** in the package registry.
3. It declares **`requires` ranges** for its `@kwiva/*` peer dependencies.

`kwiva module:build` packages a module — contribution manifest plus a compiled distribution with isolated type declarations — ready for the registry. Apps pin versions with semver; compatibility is enforced through `requires`. Discoverability comes from the curated addon index behind `kwiva addons search`. The full workflow is on [Addons & Distribution](/docs/modules-plugins/addons).

## Plugins and Themes [#plugins-and-themes]

Plugins are the HTTP-level counterpart to modules: middleware, route rules, and lifecycle hooks that extend the framework surface rather than contributing a full vertical stack. Themes restyle the ui-kit. Both are defined with their own factories and distributed through the same addon mechanics, so the mental model from this page — named, versioned, installable, composed — carries over unchanged.

## What's Next [#whats-next]

* [Defining Modules](/docs/modules-plugins/defining-modules) — build your first reusable capability
* [Application Composition](/docs/modules-plugins/composition) — see modules join the kernel
* [Addons & Distribution](/docs/modules-plugins/addons) — install third-party capabilities
* [Applications](/docs/core-concepts/applications) — the kernel `defineApp` composes
* [CLI](/docs/cli) — the generator and addon command reference
