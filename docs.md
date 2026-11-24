# What is Kwiva? (/docs)



## Overview [#overview]

Kwiva is the **batteries-included TypeScript application framework** that replaces the stitched-together stack. Instead of assembling a dozen unrelated libraries — a router here, a data layer there, a separate auth kit, a build tool, a generated client, and yet another admin UI — your application talks to one coherent framework: a framework-owned `@kwiva/*` API surface, a single configuration model, one CLI, and a **Rust-speed toolchain** for instant feedback.

You write plain TypeScript. App code imports only from `@kwiva/*` packages. Every construct you declare — a model, a controller, a page, a job, an event — is a `defineX` factory whose definition flows types through the entire stack. Reading Kwiva app code should feel like reading a description of the product: models describe the data, controllers describe the HTTP surface, pages describe the UI, and the framework derives the rest.

### The Problem [#the-problem]

A serious TypeScript application today usually means gluing unrelated libraries together. Each library ships its own conventions, its own configuration, its own failure modes, and its own upgrade cadence. Types stop at library boundaries. Configuration spreads across four formats. "Shipping" means re-learning integration details for every new element of the stack. The result is a fragile house of cards — a pile of parts that only coincidentally behaves like an application.

### The Solution [#the-solution]

Kwiva collapses that stack into a single, coherent framework:

```plaintext title="the-solution.txt"
One project. One configuration model. One CLI. One defineX language.
```

* **Models** derive the entire data layer — database schema, migrations, seeders, REST API routes, the typed RPC client, Studio screens, OpenAPI, and MCP tools
* **Controllers** define HTTP endpoints with typed context, per-route validation, lifecycle hooks, and policy checks
* **Pages** render with streaming SSR, typed loaders, and full-stack type safety from database to browser
* **Auth, authorization, tenancy, queues, realtime, and observability** are built in, not bolted on

## Why Kwiva [#why-kwiva]

Kwiva is organized around four design pillars.

| Pillar                   | What it means                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Expressive syntax**    | One `defineX` grammar for every construct. Models are the single source of truth and derive the whole stack. Plain, serializable definitions — no decorators, no classes, no config sprawl.                                                            |
| **Developer experience** | CLI-first with generators for everything, a typed config folder with sensible defaults, auto-discovery over manual registration, and friendly errors (did-you-mean suggestions, field-mapped validation, request correlation).                         |
| **Performance**          | Rust-speed static machinery for sub-second checks and fast builds, a TypeScript-native runtime with fast startup, streaming-first SSR, layered caching (route rules → model cache → client cache), and type-level inference with zero runtime codegen. |
| **Scalability**          | Stateless multi-instance by construction (externalized state), tenancy-first data access, queue/tasks/schedule for background scale, edge presets, and deploy-anywhere output from one codebase.                                                       |

## Architecture at a Glance [#architecture-at-a-glance]

Kwiva holds one core architectural rule:

```plaintext title="architecture-at-a-glance.txt"
Application (src/) — models, http, pages, jobs, events, config
  ↓  writes defineX(...) only · imports only @kwiva/*
Framework API surface (@kwiva/*)
  ↓
Sealed engines (framework-owned internals — never imported by app code)
  ↓
Runtime (Bun · Node · Edge) via deployment presets
```

The application depends only on the framework. The framework owns the sealed engines and the Rust-speed toolchain. App code never imports an engine by name — engine choice is a deployment detail that stays inside the framework. Whatever preset an application deploys to, it sees the same framework API surface; the differences between a Bun server, a serverless function, a static export, and an edge worker stay in the engine layer.

### One Definition Multiplies the Stack [#one-definition-multiplies-the-stack]

A single model definition feeds an intermediate representation (the model IR) from which the rest of the stack is derived — so there is no drift between your types, your API, and your database:

```plaintext title="one-definition-multiplies-the-stack.txt"
src/app/models/*.ts ──► model IR
  ├─► database schema + migrations + seeders
  ├─► typed REST API routes (list / get / create / update / delete)
  ├─► typed RPC client SDK (@kwiva/client)
  ├─► Kwiva Studio screens (generated operations UI)
  ├─► OpenAPI 3.1 spec (/openapi.json)
  └─► MCP tools (optional, policy-checked)
```

## The defineX Ecosystem [#the-definex-ecosystem]

Every app-facing construct in Kwiva is a `defineX` factory — one consistent convention across the whole framework. Learn one, learn them all.

| Factory             | Purpose                                  | Package           |
| ------------------- | ---------------------------------------- | ----------------- |
| `defineApp`         | Application composition and kernel       | `@kwiva/core`     |
| `defineConfig`      | Typed configuration modules              | `@kwiva/config`   |
| `defineModel`       | Data models — the single source of truth | `@kwiva/data`     |
| `defineController`  | Resource endpoints and custom actions    | `@kwiva/http`     |
| `defineMiddleware`  | Lifecycle pipeline stages                | `@kwiva/http`     |
| `defineServerRoute` | Infrastructure routes and route rules    | `@kwiva/http`     |
| `defineService`     | Business logic with typed injection      | `@kwiva/services` |
| `defineJob`         | Background jobs                          | `@kwiva/queue`    |
| `defineEvent`       | Domain events, listeners, and the outbox | `@kwiva/events`   |
| `defineCommand`     | App-defined CLI commands                 | `@kwiva/cli`      |
| `defineTask`        | Background / scheduled tasks             | `@kwiva/http`     |
| `definePage`        | File-based frontend pages                | `@kwiva/react`    |
| `definePolicy`      | Authorization policies                   | `@kwiva/core`     |
| `defineAuth`        | Authentication providers and sessions    | `@kwiva/auth`     |
| `definePlugin`      | Framework plugins                        | `@kwiva/core`     |
| `defineModule`      | Reusable capability modules              | `@kwiva/core`     |
| `defineMcpTool`     | Model Context Protocol tools             | `@kwiva/mcp`      |

Every factory is a plain, declarative function call placed in a conventional directory. Every factory accepts full inline options that override the config folder. Every definition flows types to the rest of the system through one `defineX` grammar. See [The defineX Convention](/docs/core-concepts/definex) for the complete surface.

## Documentation Map [#documentation-map]

Every section has its own index page, and each page links to its neighbors, references, and guides.

| Section                                                                              | Covers                                                                                       |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| [Getting Started](/docs/getting-started)                                             | Install, scaffold, configure, your first model, API, page, and deployment                    |
| [Core Concepts](/docs/core-concepts)                                                 | The defineX convention, applications, configuration, lifecycle, context, type inference      |
| [Data](/docs/data)                                                                   | Models, fields, queries, relations, migrations, transactions, factories, seeders, validation |
| [HTTP](/docs/http) · [API](/docs/api)                                                | Controllers, middleware, routes, validation, guards; REST conventions, RPC client, OpenAPI   |
| [Frontend](/docs/frontend) · [Rendering](/docs/rendering)                            | Pages, loaders, data hooks; SSR, hydration, streaming, prerendering                          |
| [Auth](/docs/auth) · [Authorization](/docs/authorization) · [Tenancy](/docs/tenancy) | Sessions, providers, route protection; policies, roles; tenant isolation and scoping         |
| [Realtime](/docs/realtime)                                                           | Events, channels, client usage, scaling WebSockets                                           |
| [Background Work](/docs/background-work)                                             | Queues, jobs, scheduling, observability                                                      |
| [Studio](/docs/studio)                                                               | The generated operations UI and its configuration                                            |
| [AI & MCP](/docs/ai-mcp)                                                             | MCP server, tool generation, agent integration                                               |
| [Modules & Plugins](/docs/modules-plugins)                                           | Composition, defining modules, addons                                                        |
| [CLI](/docs/cli)                                                                     | Commands, generators, database and project tooling                                           |
| [Testing](/docs/testing)                                                             | Unit, integration, API, and e2e testing                                                      |
| [Observability](/docs/observability)                                                 | Logging, metrics, tracing, the dev overlay                                                   |
| [Security](/docs/security)                                                           | Headers, input validation, default protections, production hardening                         |
| [Deployment](/docs/deployment)                                                       | Presets, adapters, containers, serverless, production checklist                              |
| [Advanced](/docs/advanced)                                                           | Internals, request lifecycle, model IR, performance, package boundaries                      |

## Quick Start [#quick-start]

Scaffold a default **fullstack** application and start developing:

```bash title="terminal"
bun create kwiva my-app
cd my-app
bun run dev
```

Open `http://localhost:3000` and you have a running application: SSR pages, an API surface, and a dev server with hot module replacement. From here, add a model, publish an API, render a page — and deploy anywhere.

## What's Next [#whats-next]

1. [Getting Started](/docs/getting-started) — install Bun and create your first project
2. [The defineX Convention](/docs/core-concepts/definex) — the one grammar behind every file
3. [Architecture](/architecture) — a deep dive into the framework's design
