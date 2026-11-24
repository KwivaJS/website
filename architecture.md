# Architecture (/architecture)



Kwiva's architecture follows a strict layered design with clear ownership boundaries. Everything an
application touches is `@kwiva/*`; everything underneath is framework-owned.

## Core Architectural Rule [#core-architectural-rule]

> App code imports only `@kwiva/*`. Every app-facing construct follows the `defineX` convention. Engines are framework-owned implementation details.

## Layers [#layers]

```plaintext title="layers.txt"
┌──────────────────────────────────────────────────────────┐
│  APP — imports only @kwiva/* · writes defineX(...) only  │
├──────────────────────────────────────────────────────────┤
│  FRAMEWORK API (@kwiva/*)                                │
│  core · config · schema · data · http · router · react    │
│  client · services · queue · events · auth · studio · mcp │
├───────────────────────────────┬──────────────────────────┤
│  INTERNAL ENGINES (hidden)   │  TOOLCHAIN (Rust-speed)   │
│  http · data · auth · client │  compiler · bundler       │
│  data plane                 │  linter · formatter        │
├───────────────────────────────┴──────────────────────────┤
│  RUNTIME: Bun (primary) · Node · Edge (via presets)       │
└──────────────────────────────────────────────────────────┘
```

## Framework API Packages (17) [#framework-api-packages-17]

| Package           | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `@kwiva/core`     | App kernel, context, DI, errors, policies  |
| `@kwiva/config`   | Configuration system                       |
| `@kwiva/schema`   | Field DSL, model IR, validation            |
| `@kwiva/data`     | Models, query builder, transactions        |
| `@kwiva/http`     | Controllers, middleware, lifecycle, guards |
| `@kwiva/router`   | File-based typed routing                   |
| `@kwiva/react`    | Pages, SSR, data hooks                     |
| `@kwiva/client`   | Typed RPC SDK                              |
| `@kwiva/services` | Service container                          |
| `@kwiva/queue`    | Jobs, workers, retries                     |
| `@kwiva/events`   | Events, listeners, broadcasting            |
| `@kwiva/auth`     | Authentication, sessions                   |
| `@kwiva/studio`   | Generated admin UI                         |
| `@kwiva/mcp`      | MCP tools from IR                          |
| `@kwiva/ui-kit`   | UI components                              |
| `@kwiva/cli`      | CLI binary                                 |
| `@kwiva/testing`  | Test harness, fixtures                     |

## Engine Boundaries [#engine-boundaries]

### Internal engines (hidden, framework-owned) [#internal-engines-hidden-framework-owned]

Kwiva's engines are implementation details: sealed, versioned, and never imported by application
code. They exist so you get production-grade behavior without owning its complexity — and you can
switch internal implementation without touching your application.

| Engine             | Role                                                  | Kwiva Surface                |
| ------------------ | ----------------------------------------------------- | ---------------------------- |
| HTTP engine        | Server carrier, presets, streaming, WebSockets        | `@kwiva/http`, `@kwiva/core` |
| Data engine        | SQL persistence (SQLite dev / Postgres prod)          | `@kwiva/data`                |
| Auth engine        | Authentication (sessions, OAuth, passkeys)            | `@kwiva/auth`                |
| Client data engine | Client-side caching, invalidation, optimistic updates | `@kwiva/react` data hooks    |

## Model-Derived Architecture [#model-derived-architecture]

One model definition drives the entire data plane:

```plaintext title="model-derived-architecture.txt"
defineModel → IR (intermediate representation)
  ├─→ Database schema + migrations     (@kwiva/data)
  ├─→ REST API (5 routes per model)    (@kwiva/http + @kwiva/data)
  ├─→ Typed RPC client SDK             (@kwiva/client)
  ├─→ Studio screens                   (@kwiva/studio)
  ├─→ OpenAPI spec                     (@kwiva/http)
  └─→ MCP tools                        (@kwiva/mcp)
```

## Request Flow [#request-flow]

```plaintext title="request-flow.txt"
client → runtime preset/adapter → @kwiva/http pipeline
  ├─ page route  → @kwiva/router → @kwiva/react SSR
  │                  (loaders → data hooks → React → stream HTML)
  └─ api route   → defineController
                    (validation → handler → JSON)
                    └─ defineModel → data engine → Postgres/SQLite
```

## Further Reading [#further-reading]

* [Design Principles](/architecture/design-principles) — The philosophy behind the architecture
* [Request Lifecycle](/architecture/request-lifecycle) — Visual 14-step lifecycle
* [Model Derivation](/architecture/model-derivation) — How one model becomes many artifacts
* [Package Boundaries](/architecture/package-boundaries) — Dependency graph and framework-owned engines
