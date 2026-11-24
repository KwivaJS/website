# Package Boundaries (/architecture/package-boundaries)



Kwiva ships as many equal, focused packages under the `@kwiva/*` scope. Each owns one concern, versions independently, and imports only what it needs. The boundaries between packages — and between the framework, its engines, and the application — are what keep the system coherent.

## The Packages [#the-packages]

| Package           | Owns                                                    |
| ----------------- | ------------------------------------------------------- |
| `@kwiva/core`     | App kernel (`defineApp`), context, DI, errors, policies |
| `@kwiva/config`   | Configuration system, config folder, typed env          |
| `@kwiva/schema`   | Field DSL, model IR, validation                         |
| `@kwiva/data`     | Models, query builder, transactions, relations          |
| `@kwiva/http`     | Controllers, middleware, lifecycle, guards, routes, WS  |
| `@kwiva/router`   | Owned typed file-based router core                      |
| `@kwiva/react`    | Pages, SSR, providers, data hooks                       |
| `@kwiva/client`   | Typed RPC SDK                                           |
| `@kwiva/services` | Service container                                       |
| `@kwiva/queue`    | Jobs, workers, retries, backoff                         |
| `@kwiva/events`   | Events, listeners, broadcasting                         |
| `@kwiva/auth`     | Authentication, sessions, providers                     |
| `@kwiva/studio`   | Generated operations UI                                 |
| `@kwiva/mcp`      | MCP server and tools                                    |
| `@kwiva/ui-kit`   | UI components                                           |
| `@kwiva/cli`      | The `kwiva` binary                                      |
| `@kwiva/testing`  | Test harness and fixtures                               |

## Dependency Graph [#dependency-graph]

The graph is strict and acyclic — `core` and `schema` are leaves (nothing depends on them depending outward), nothing imports the CLI, and app-facing packages never re-export engine APIs:

```plaintext title="dependency-graph.txt"
cli ──► http · react · data · auth · studio · toolchain integration
studio ──► react · ui-kit · data
react ──► router · client · data-cache engine (sealed)
client ──► core (types only)
http  ──► core · schema · data (server engine, sealed)
data  ──► core · schema (SQL engine, sealed)
auth  ──► core · http (auth engine, sealed)
queue ──► core · events
events ──► core · data
services ──► core
config ──► core
schema ──► (nothing — leaf)
core  ──► (nothing — leaf)
```

Why this matters: because packages depend in one direction, the framework can version each concern independently, test packages in isolation, and seal engines without creating cycles.

## Ownership Map [#ownership-map]

| Capability                                   | Owner                            | Notes                                |
| -------------------------------------------- | -------------------------------- | ------------------------------------ |
| Scaffold / project boot                      | `@kwiva/cli`                     | Own scaffolder, formatted output     |
| Dev server, HMR, build, check, test          | `@kwiva/cli`                     | Rust-speed toolchain integrated      |
| Server portability (presets, storage, tasks) | internal engine                  | Configured by the framework          |
| HTTP pipeline, controllers, validation       | `@kwiva/http`                    | Owned                                |
| REST conventions, OpenAPI                    | `@kwiva/http`                    | From route/model IR                  |
| Typed RPC client                             | `@kwiva/client`                  | From the same IR                     |
| Data schema (source of truth)                | `@kwiva/schema` + `@kwiva/data`  | App writes `defineModel` files       |
| Migrations, seeders, factories               | `@kwiva/data`                    | Model diff → SQL                     |
| Studio (ops UI)                              | `@kwiva/studio`                  | Generated, policy-aware              |
| AuthN (sessions, providers)                  | `@kwiva/auth`                    | Wired into HTTP + SSR                |
| Authorization (RBAC/policies)                | `@kwiva/core`                    | Conventions + model enforcement      |
| Tenancy                                      | `@kwiva/core`/`@kwiva/data`      | `tenantField` + context scoping      |
| UI routing                                   | `@kwiva/router`                  | Owned                                |
| SSR orchestration                            | `@kwiva/react`                   | Owns hydration/dehydration/streaming |
| Client data cache                            | internal engine                  | Surfaced via data hooks only         |
| Prerender/ISR/SWR                            | internal engine                  | Route rules                          |
| Queue/jobs, events, tasks                    | `@kwiva/queue` + `@kwiva/events` | Owned                                |
| Security headers/CSP, rate limiting          | framework defaults               | Config-driven                        |

## Boundary Rules [#boundary-rules]

1. **The framework doesn't duplicate engine capability.** If an internal engine already provides something (storage, caching, websockets), the framework configures and documents it rather than re-implementing it.
2. **Application code doesn't re-architect framework layers.** Applications write `defineX` files; they don't build their own request pipeline, router, or query cache.
3. **Engine choices are the framework's; version pins are the app's.** The framework ships compatibility ranges; apps pin exact versions.
4. **Extension over replacement.** Want a different validator? Standard Schema abstracts it. Want a different HTTP foundation? That's a full stack change, not a per-app choice.
5. **The framework has veto power on conventions.** Loaders fetch via the typed RPC client, not raw fetch — enforced by lint.

## Versioning & Support [#versioning--support]

* Packages follow semantic versioning independently.
* A compatibility matrix (peer ranges) documents which internal engine versions each release supports.
* Security fixes prioritize `@kwiva/core`, `@kwiva/http`, and `@kwiva/cli`.
* Deprecations follow a two-major-version window, with codemod-powered upgrades via `kwiva upgrade`.

## What to Read Next [#what-to-read-next]

* [Architecture Overview](/architecture) — The layered model
* [Design Principles](/architecture/design-principles) — Why these boundaries exist
* [Modules & Plugins](/docs/modules-plugins) — How packages compose into an app
* [Advanced: Package Boundaries](/docs/advanced/package-boundaries) — Internal deep dive
