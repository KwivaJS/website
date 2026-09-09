# Platform 06 — Modules

**Status**: Baseline (ADR-0010, v1.x) · **Updated**: 2026-09-08 · **Docset**: v0.3

`defineModule` — package-level composition: reusable capabilities (models, controllers, pages, jobs, config) that drop into any Kwiva app.

## Define a module

```ts
// modules/chat/index.ts
import { defineModule } from '@kwiva/core'

export default defineModule({
  name: '@acme/chat',
  version: '1.2.0',

  // contribution points — all optional
  models:      () => import.meta.glob('./models/*.ts'),       // rooms, messages
  controllers: () => import.meta.glob('./controllers/*.ts'),  // chat
  middleware:  () => import.meta.glob('./middleware/*.ts'),
  pages:       () => import.meta.glob('./pages/**/*.tsx'),    // ui additions
  jobs:        () => import.meta.glob('./jobs/*.ts'),
  events:      () => import.meta.glob('./events/*.ts'),
  tasks:       () => import.meta.glob('./tasks/*.ts'),
  policies:    () => import.meta.glob('./policies/*.ts'),
  migrations:  './migrations',                                 // applied with app migrations
  config:      { chat: { maxMessageLength: 2000 } },          // namespaced defaults
  channels:    { 'chat.{roomId}': { policy: 'chat.member' } },

  // module lifecycle
  boot: async ({ config, models, providers }) => { ... },
  shutdown: async () => { ... },

  // peer requirements
  requires: { '@kwiva/core': '^1', '@kwiva/auth': '^1' },
})
```

## Addons (the distribution umbrella)

An **addon** is any installable capability package: a module (full-stack capability), a plugin (HTTP-level extension), or a theme (ui-kit skin). The addon workflow is the single installation path:

```bash
kwiva add @kwiva/blog                       # install + register (npm, config entry, migrations check)
kwiva add ./addons/analytics --path         # local addon
kwiva addons list                           # installed: contributions + versions
kwiva addons search chat                    # registry search (npm kwiva-addon keyword; curated index at kwiva.js.org)
kwiva addons update                         # within `requires` compatibility range
kwiva addons remove @kwiva/blog
```

## Register

```ts
// kwiva.config.ts
export default defineConfig({
  modules: [
    '@kwiva/auth-kit',        // first-party (npm addon)
    '@acme/chat',             // third-party (npm addon)
    './modules/billing',      // local (workspace path)
  ],
})
```

`kwiva add` writes this entry automatically; manual registration stays supported for vendored/path modules.

Discovery merges module contributions into the app scan — models/controllers/pages appear as if local, namespaced (`chat.messages` model name; pages mounted under module prefix).

## Contracts

- **Namespacing**: model/resource names prefixed by module scope; route paths under the module's declared prefix.
- **Config**: module defaults register under their namespace (`chat.maxMessageLength`); overridable in the app's `src/config/modules.ts` (deep merge; app wins — standard precedence).
- **Policies**: module policies follow the module's permission namespace.
- **Isolation**: modules never import each other's internals — only published contribution points.
- **Migrations**: module migrations are ordered before app migrations; versioned by module version.

## First-party addons (planned)

| Addon | Ships |
|---|---|
| `@kwiva/auth-kit` | ready auth screens (sign-in/up/OAuth) + user management polish |
| `@kwiva/blog` | posts/tags/comments models + pages + feed |
| `@kwiva/billing` | plans/subscriptions/invoices + webhooks (engine-agnostic gateway) |
| `@kwiva/notifications` | in-app + email notification stack |
| `@kwiva/analytics` | event tracking + dashboards (v2) |

## Publishing

- `kwiva module:build` → package with contribution manifest + dist (rolldown + isolated declarations).
- Registry contract: npm package exporting the `defineModule` result, tagged with the `kwiva-addon` keyword; `kwiva add @acme/chat` installs + registers; discoverable via `kwiva addons search` (curated index hosted at kwiva.js.org, v1.x).
- Versioning: semver; app pins; compatibility via `requires` ranges.
