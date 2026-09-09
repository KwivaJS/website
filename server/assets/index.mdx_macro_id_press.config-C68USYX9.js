import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "What is Kwiva?",
	"description": "Kwiva is the batteries-included TypeScript framework that replaces the stitched-together stack — data, APIs, auth, frontend, jobs, realtime and deploy in one framework, one CLI, one defineX language."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\n## Overview [#overview]\n\nKwiva is the **batteries-included TypeScript application framework** that replaces the stitched-together stack. Instead of assembling a dozen unrelated libraries — a router here, a data layer there, a separate auth kit, a build tool, a generated client, and yet another admin UI — your application talks to one coherent framework: a framework-owned `@kwiva/*` API surface, a single configuration model, one CLI, and a **Rust-speed toolchain** for instant feedback.\n\nYou write plain TypeScript. App code imports only from `@kwiva/*` packages. Every construct you declare — a model, a controller, a page, a job, an event — is a `defineX` factory whose definition flows types through the entire stack. Reading Kwiva app code should feel like reading a description of the product: models describe the data, controllers describe the HTTP surface, pages describe the UI, and the framework derives the rest.\n\n### The Problem [#the-problem]\n\nA serious TypeScript application today usually means gluing unrelated libraries together. Each library ships its own conventions, its own configuration, its own failure modes, and its own upgrade cadence. Types stop at library boundaries. Configuration spreads across four formats. \"Shipping\" means re-learning integration details for every new element of the stack. The result is a fragile house of cards — a pile of parts that only coincidentally behaves like an application.\n\n### The Solution [#the-solution]\n\nKwiva collapses that stack into a single, coherent framework:\n\n```plaintext title=\"the-solution.txt\"\nOne project. One configuration model. One CLI. One defineX language.\n```\n\n* **Models** derive the entire data layer — database schema, migrations, seeders, REST API routes, the typed RPC client, Studio screens, OpenAPI, and MCP tools\n* **Controllers** define HTTP endpoints with typed context, per-route validation, lifecycle hooks, and policy checks\n* **Pages** render with streaming SSR, typed loaders, and full-stack type safety from database to browser\n* **Auth, authorization, tenancy, queues, realtime, and observability** are built in, not bolted on\n\n## Why Kwiva [#why-kwiva]\n\nKwiva is organized around four design pillars.\n\n| Pillar                   | What it means                                                                                                                                                                                                                                          |\n| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |\n| **Expressive syntax**    | One `defineX` grammar for every construct. Models are the single source of truth and derive the whole stack. Plain, serializable definitions — no decorators, no classes, no config sprawl.                                                            |\n| **Developer experience** | CLI-first with generators for everything, a typed config folder with sensible defaults, auto-discovery over manual registration, and friendly errors (did-you-mean suggestions, field-mapped validation, request correlation).                         |\n| **Performance**          | Rust-speed static machinery for sub-second checks and fast builds, a TypeScript-native runtime with fast startup, streaming-first SSR, layered caching (route rules → model cache → client cache), and type-level inference with zero runtime codegen. |\n| **Scalability**          | Stateless multi-instance by construction (externalized state), tenancy-first data access, queue/tasks/schedule for background scale, edge presets, and deploy-anywhere output from one codebase.                                                       |\n\n## Architecture at a Glance [#architecture-at-a-glance]\n\nKwiva holds one core architectural rule:\n\n```plaintext title=\"architecture-at-a-glance.txt\"\nApplication (src/) — models, http, pages, jobs, events, config\n  ↓  writes defineX(...) only · imports only @kwiva/*\nFramework API surface (@kwiva/*)\n  ↓\nSealed engines (framework-owned internals — never imported by app code)\n  ↓\nRuntime (Bun · Node · Edge) via deployment presets\n```\n\nThe application depends only on the framework. The framework owns the sealed engines and the Rust-speed toolchain. App code never imports an engine by name — engine choice is a deployment detail that stays inside the framework. Whatever preset an application deploys to, it sees the same framework API surface; the differences between a Bun server, a serverless function, a static export, and an edge worker stay in the engine layer.\n\n### One Definition Multiplies the Stack [#one-definition-multiplies-the-stack]\n\nA single model definition feeds an intermediate representation (the model IR) from which the rest of the stack is derived — so there is no drift between your types, your API, and your database:\n\n```plaintext title=\"one-definition-multiplies-the-stack.txt\"\nsrc/app/models/*.ts ──► model IR\n  ├─► database schema + migrations + seeders\n  ├─► typed REST API routes (list / get / create / update / delete)\n  ├─► typed RPC client SDK (@kwiva/client)\n  ├─► Kwiva Studio screens (generated operations UI)\n  ├─► OpenAPI 3.1 spec (/openapi.json)\n  └─► MCP tools (optional, policy-checked)\n```\n\n## The defineX Ecosystem [#the-definex-ecosystem]\n\nEvery app-facing construct in Kwiva is a `defineX` factory — one consistent convention across the whole framework. Learn one, learn them all.\n\n| Factory             | Purpose                                  | Package           |\n| ------------------- | ---------------------------------------- | ----------------- |\n| `defineApp`         | Application composition and kernel       | `@kwiva/core`     |\n| `defineConfig`      | Typed configuration modules              | `@kwiva/config`   |\n| `defineModel`       | Data models — the single source of truth | `@kwiva/data`     |\n| `defineController`  | Resource endpoints and custom actions    | `@kwiva/http`     |\n| `defineMiddleware`  | Lifecycle pipeline stages                | `@kwiva/http`     |\n| `defineServerRoute` | Infrastructure routes and route rules    | `@kwiva/http`     |\n| `defineService`     | Business logic with typed injection      | `@kwiva/services` |\n| `defineJob`         | Background jobs                          | `@kwiva/queue`    |\n| `defineEvent`       | Domain events, listeners, and the outbox | `@kwiva/events`   |\n| `defineCommand`     | App-defined CLI commands                 | `@kwiva/cli`      |\n| `defineTask`        | Background / scheduled tasks             | `@kwiva/http`     |\n| `definePage`        | File-based frontend pages                | `@kwiva/react`    |\n| `definePolicy`      | Authorization policies                   | `@kwiva/core`     |\n| `defineAuth`        | Authentication providers and sessions    | `@kwiva/auth`     |\n| `definePlugin`      | Framework plugins                        | `@kwiva/core`     |\n| `defineModule`      | Reusable capability modules              | `@kwiva/core`     |\n| `defineMcpTool`     | Model Context Protocol tools             | `@kwiva/mcp`      |\n\nEvery factory is a plain, declarative function call placed in a conventional directory. Every factory accepts full inline options that override the config folder. Every definition flows types to the rest of the system through one `defineX` grammar. See [The defineX Convention](/docs/core-concepts/definex) for the complete surface.\n\n## Documentation Map [#documentation-map]\n\nEvery section has its own index page, and each page links to its neighbors, references, and guides.\n\n| Section                                                                              | Covers                                                                                       |\n| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |\n| [Getting Started](/docs/getting-started)                                             | Install, scaffold, configure, your first model, API, page, and deployment                    |\n| [Core Concepts](/docs/core-concepts)                                                 | The defineX convention, applications, configuration, lifecycle, context, type inference      |\n| [Data](/docs/data)                                                                   | Models, fields, queries, relations, migrations, transactions, factories, seeders, validation |\n| [HTTP](/docs/http) · [API](/docs/api)                                                | Controllers, middleware, routes, validation, guards; REST conventions, RPC client, OpenAPI   |\n| [Frontend](/docs/frontend) · [Rendering](/docs/rendering)                            | Pages, loaders, data hooks; SSR, hydration, streaming, prerendering                          |\n| [Auth](/docs/auth) · [Authorization](/docs/authorization) · [Tenancy](/docs/tenancy) | Sessions, providers, route protection; policies, roles; tenant isolation and scoping         |\n| [Realtime](/docs/realtime)                                                           | Events, channels, client usage, scaling WebSockets                                           |\n| [Background Work](/docs/background-work)                                             | Queues, jobs, scheduling, observability                                                      |\n| [Studio](/docs/studio)                                                               | The generated operations UI and its configuration                                            |\n| [AI & MCP](/docs/ai-mcp)                                                             | MCP server, tool generation, agent integration                                               |\n| [Modules & Plugins](/docs/modules-plugins)                                           | Composition, defining modules, addons                                                        |\n| [CLI](/docs/cli)                                                                     | Commands, generators, database and project tooling                                           |\n| [Testing](/docs/testing)                                                             | Unit, integration, API, and e2e testing                                                      |\n| [Observability](/docs/observability)                                                 | Logging, metrics, tracing, the dev overlay                                                   |\n| [Security](/docs/security)                                                           | Headers, input validation, default protections, production hardening                         |\n| [Deployment](/docs/deployment)                                                       | Presets, adapters, containers, serverless, production checklist                              |\n| [Advanced](/docs/advanced)                                                           | Internals, request lifecycle, model IR, performance, package boundaries                      |\n\n## Quick Start [#quick-start]\n\nScaffold a default **fullstack** application and start developing:\n\n```bash title=\"terminal\"\nbun create kwiva my-app\ncd my-app\nbun run dev\n```\n\nOpen `http://localhost:3000` and you have a running application: SSR pages, an API surface, and a dev server with hot module replacement. From here, add a model, publish an API, render a page — and deploy anywhere.\n\n## What's Next [#whats-next]\n\n1. [Getting Started](/docs/getting-started) — install Bun and create your first project\n2. [The defineX Convention](/docs/core-concepts/definex) — the one grammar behind every file\n3. [Architecture](/architecture) — a deep dive into the framework's design\n";
var structuredData = {
	"contents": [
		{
			"heading": "overview",
			"content": "Kwiva is the **batteries-included TypeScript application framework** that replaces the stitched-together stack. Instead of assembling a dozen unrelated libraries — a router here, a data layer there, a separate auth kit, a build tool, a generated client, and yet another admin UI — your application talks to one coherent framework: a framework-owned `@kwiva/*` API surface, a single configuration model, one CLI, and a **Rust-speed toolchain** for instant feedback."
		},
		{
			"heading": "overview",
			"content": "You write plain TypeScript. App code imports only from `@kwiva/*` packages. Every construct you declare — a model, a controller, a page, a job, an event — is a `defineX` factory whose definition flows types through the entire stack. Reading Kwiva app code should feel like reading a description of the product: models describe the data, controllers describe the HTTP surface, pages describe the UI, and the framework derives the rest."
		},
		{
			"heading": "the-problem",
			"content": "A serious TypeScript application today usually means gluing unrelated libraries together. Each library ships its own conventions, its own configuration, its own failure modes, and its own upgrade cadence. Types stop at library boundaries. Configuration spreads across four formats. \"Shipping\" means re-learning integration details for every new element of the stack. The result is a fragile house of cards — a pile of parts that only coincidentally behaves like an application."
		},
		{
			"heading": "the-solution",
			"content": "Kwiva collapses that stack into a single, coherent framework:"
		},
		{
			"heading": "the-solution",
			"content": "**Models** derive the entire data layer — database schema, migrations, seeders, REST API routes, the typed RPC client, Studio screens, OpenAPI, and MCP tools"
		},
		{
			"heading": "the-solution",
			"content": "**Controllers** define HTTP endpoints with typed context, per-route validation, lifecycle hooks, and policy checks"
		},
		{
			"heading": "the-solution",
			"content": "**Pages** render with streaming SSR, typed loaders, and full-stack type safety from database to browser"
		},
		{
			"heading": "the-solution",
			"content": "**Auth, authorization, tenancy, queues, realtime, and observability** are built in, not bolted on"
		},
		{
			"heading": "why-kwiva",
			"content": "Kwiva is organized around four design pillars."
		},
		{
			"heading": "why-kwiva",
			"content": "Pillar"
		},
		{
			"heading": "why-kwiva",
			"content": "What it means"
		},
		{
			"heading": "why-kwiva",
			"content": "**Expressive syntax**"
		},
		{
			"heading": "why-kwiva",
			"content": "One `defineX` grammar for every construct. Models are the single source of truth and derive the whole stack. Plain, serializable definitions — no decorators, no classes, no config sprawl."
		},
		{
			"heading": "why-kwiva",
			"content": "**Developer experience**"
		},
		{
			"heading": "why-kwiva",
			"content": "CLI-first with generators for everything, a typed config folder with sensible defaults, auto-discovery over manual registration, and friendly errors (did-you-mean suggestions, field-mapped validation, request correlation)."
		},
		{
			"heading": "why-kwiva",
			"content": "**Performance**"
		},
		{
			"heading": "why-kwiva",
			"content": "Rust-speed static machinery for sub-second checks and fast builds, a TypeScript-native runtime with fast startup, streaming-first SSR, layered caching (route rules → model cache → client cache), and type-level inference with zero runtime codegen."
		},
		{
			"heading": "why-kwiva",
			"content": "**Scalability**"
		},
		{
			"heading": "why-kwiva",
			"content": "Stateless multi-instance by construction (externalized state), tenancy-first data access, queue/tasks/schedule for background scale, edge presets, and deploy-anywhere output from one codebase."
		},
		{
			"heading": "architecture-at-a-glance",
			"content": "Kwiva holds one core architectural rule:"
		},
		{
			"heading": "architecture-at-a-glance",
			"content": "The application depends only on the framework. The framework owns the sealed engines and the Rust-speed toolchain. App code never imports an engine by name — engine choice is a deployment detail that stays inside the framework. Whatever preset an application deploys to, it sees the same framework API surface; the differences between a Bun server, a serverless function, a static export, and an edge worker stay in the engine layer."
		},
		{
			"heading": "one-definition-multiplies-the-stack",
			"content": "A single model definition feeds an intermediate representation (the model IR) from which the rest of the stack is derived — so there is no drift between your types, your API, and your database:"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Every app-facing construct in Kwiva is a `defineX` factory — one consistent convention across the whole framework. Learn one, learn them all."
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Factory"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Purpose"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Package"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineApp`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Application composition and kernel"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineConfig`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Typed configuration modules"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/config`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineModel`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Data models — the single source of truth"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/data`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineController`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Resource endpoints and custom actions"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineMiddleware`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Lifecycle pipeline stages"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineServerRoute`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Infrastructure routes and route rules"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineService`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Business logic with typed injection"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/services`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineJob`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Background jobs"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/queue`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineEvent`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Domain events, listeners, and the outbox"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/events`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineCommand`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "App-defined CLI commands"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/cli`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineTask`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Background / scheduled tasks"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`definePage`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "File-based frontend pages"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/react`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`definePolicy`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Authorization policies"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineAuth`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Authentication providers and sessions"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/auth`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`definePlugin`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Framework plugins"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineModule`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Reusable capability modules"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`defineMcpTool`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Model Context Protocol tools"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "`@kwiva/mcp`"
		},
		{
			"heading": "the-definex-ecosystem",
			"content": "Every factory is a plain, declarative function call placed in a conventional directory. Every factory accepts full inline options that override the config folder. Every definition flows types to the rest of the system through one `defineX` grammar. See The defineX Convention for the complete surface."
		},
		{
			"heading": "documentation-map",
			"content": "Every section has its own index page, and each page links to its neighbors, references, and guides."
		},
		{
			"heading": "documentation-map",
			"content": "Section"
		},
		{
			"heading": "documentation-map",
			"content": "Covers"
		},
		{
			"heading": "documentation-map",
			"content": "Getting Started"
		},
		{
			"heading": "documentation-map",
			"content": "Install, scaffold, configure, your first model, API, page, and deployment"
		},
		{
			"heading": "documentation-map",
			"content": "Core Concepts"
		},
		{
			"heading": "documentation-map",
			"content": "The defineX convention, applications, configuration, lifecycle, context, type inference"
		},
		{
			"heading": "documentation-map",
			"content": "Data"
		},
		{
			"heading": "documentation-map",
			"content": "Models, fields, queries, relations, migrations, transactions, factories, seeders, validation"
		},
		{
			"heading": "documentation-map",
			"content": "HTTP · API"
		},
		{
			"heading": "documentation-map",
			"content": "Controllers, middleware, routes, validation, guards; REST conventions, RPC client, OpenAPI"
		},
		{
			"heading": "documentation-map",
			"content": "Frontend · Rendering"
		},
		{
			"heading": "documentation-map",
			"content": "Pages, loaders, data hooks; SSR, hydration, streaming, prerendering"
		},
		{
			"heading": "documentation-map",
			"content": "Auth · Authorization · Tenancy"
		},
		{
			"heading": "documentation-map",
			"content": "Sessions, providers, route protection; policies, roles; tenant isolation and scoping"
		},
		{
			"heading": "documentation-map",
			"content": "Realtime"
		},
		{
			"heading": "documentation-map",
			"content": "Events, channels, client usage, scaling WebSockets"
		},
		{
			"heading": "documentation-map",
			"content": "Background Work"
		},
		{
			"heading": "documentation-map",
			"content": "Queues, jobs, scheduling, observability"
		},
		{
			"heading": "documentation-map",
			"content": "Studio"
		},
		{
			"heading": "documentation-map",
			"content": "The generated operations UI and its configuration"
		},
		{
			"heading": "documentation-map",
			"content": "AI & MCP"
		},
		{
			"heading": "documentation-map",
			"content": "MCP server, tool generation, agent integration"
		},
		{
			"heading": "documentation-map",
			"content": "Modules & Plugins"
		},
		{
			"heading": "documentation-map",
			"content": "Composition, defining modules, addons"
		},
		{
			"heading": "documentation-map",
			"content": "CLI"
		},
		{
			"heading": "documentation-map",
			"content": "Commands, generators, database and project tooling"
		},
		{
			"heading": "documentation-map",
			"content": "Testing"
		},
		{
			"heading": "documentation-map",
			"content": "Unit, integration, API, and e2e testing"
		},
		{
			"heading": "documentation-map",
			"content": "Observability"
		},
		{
			"heading": "documentation-map",
			"content": "Logging, metrics, tracing, the dev overlay"
		},
		{
			"heading": "documentation-map",
			"content": "Security"
		},
		{
			"heading": "documentation-map",
			"content": "Headers, input validation, default protections, production hardening"
		},
		{
			"heading": "documentation-map",
			"content": "Deployment"
		},
		{
			"heading": "documentation-map",
			"content": "Presets, adapters, containers, serverless, production checklist"
		},
		{
			"heading": "documentation-map",
			"content": "Advanced"
		},
		{
			"heading": "documentation-map",
			"content": "Internals, request lifecycle, model IR, performance, package boundaries"
		},
		{
			"heading": "quick-start",
			"content": "Scaffold a default **fullstack** application and start developing:"
		},
		{
			"heading": "quick-start",
			"content": "Open `http://localhost:3000` and you have a running application: SSR pages, an API surface, and a dev server with hot module replacement. From here, add a model, publish an API, render a page — and deploy anywhere."
		},
		{
			"heading": "whats-next",
			"content": "Getting Started — install Bun and create your first project"
		},
		{
			"heading": "whats-next",
			"content": "The defineX Convention — the one grammar behind every file"
		},
		{
			"heading": "whats-next",
			"content": "Architecture — a deep dive into the framework's design"
		}
	],
	"headings": [
		{
			"id": "overview",
			"content": "Overview"
		},
		{
			"id": "the-problem",
			"content": "The Problem"
		},
		{
			"id": "the-solution",
			"content": "The Solution"
		},
		{
			"id": "why-kwiva",
			"content": "Why Kwiva"
		},
		{
			"id": "architecture-at-a-glance",
			"content": "Architecture at a Glance"
		},
		{
			"id": "one-definition-multiplies-the-stack",
			"content": "One Definition Multiplies the Stack"
		},
		{
			"id": "the-definex-ecosystem",
			"content": "The defineX Ecosystem"
		},
		{
			"id": "documentation-map",
			"content": "Documentation Map"
		},
		{
			"id": "quick-start",
			"content": "Quick Start"
		},
		{
			"id": "whats-next",
			"content": "What's Next"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#overview",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Overview" })
	},
	{
		depth: 3,
		url: "#the-problem",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Problem" })
	},
	{
		depth: 3,
		url: "#the-solution",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Solution" })
	},
	{
		depth: 2,
		url: "#why-kwiva",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Why Kwiva" })
	},
	{
		depth: 2,
		url: "#architecture-at-a-glance",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Architecture at a Glance" })
	},
	{
		depth: 3,
		url: "#one-definition-multiplies-the-stack",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One Definition Multiplies the Stack" })
	},
	{
		depth: 2,
		url: "#the-definex-ecosystem",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The defineX Ecosystem" })
	},
	{
		depth: 2,
		url: "#documentation-map",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Documentation Map" })
	},
	{
		depth: 2,
		url: "#quick-start",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Quick Start" })
	},
	{
		depth: 2,
		url: "#whats-next",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What's Next" })
	}
];
function _createMdxContent(props) {
	const _components = {
		a: "a",
		code: "code",
		h2: "h2",
		h3: "h3",
		li: "li",
		ol: "ol",
		p: "p",
		pre: "pre",
		span: "span",
		strong: "strong",
		table: "table",
		tbody: "tbody",
		td: "td",
		th: "th",
		thead: "thead",
		tr: "tr",
		ul: "ul",
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "overview",
			children: "Overview"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva is the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "batteries-included TypeScript application framework" }),
			" that replaces the stitched-together stack. Instead of assembling a dozen unrelated libraries — a router here, a data layer there, a separate auth kit, a build tool, a generated client, and yet another admin UI — your application talks to one coherent framework: a framework-owned ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
			" API surface, a single configuration model, one CLI, and a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Rust-speed toolchain" }),
			" for instant feedback."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"You write plain TypeScript. App code imports only from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
			" packages. Every construct you declare — a model, a controller, a page, a job, an event — is a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factory whose definition flows types through the entire stack. Reading Kwiva app code should feel like reading a description of the product: models describe the data, controllers describe the HTTP surface, pages describe the UI, and the framework derives the rest."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "the-problem",
			children: "The Problem"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A serious TypeScript application today usually means gluing unrelated libraries together. Each library ships its own conventions, its own configuration, its own failure modes, and its own upgrade cadence. Types stop at library boundaries. Configuration spreads across four formats. \"Shipping\" means re-learning integration details for every new element of the stack. The result is a fragile house of cards — a pile of parts that only coincidentally behaves like an application." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "the-solution",
			children: "The Solution"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva collapses that stack into a single, coherent framework:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "the-solution.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "One project. One configuration model. One CLI. One defineX language." })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Models" }), " derive the entire data layer — database schema, migrations, seeders, REST API routes, the typed RPC client, Studio screens, OpenAPI, and MCP tools"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Controllers" }), " define HTTP endpoints with typed context, per-route validation, lifecycle hooks, and policy checks"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Pages" }), " render with streaming SSR, typed loaders, and full-stack type safety from database to browser"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Auth, authorization, tenancy, queues, realtime, and observability" }), " are built in, not bolted on"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "why-kwiva",
			children: "Why Kwiva"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva is organized around four design pillars." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Pillar" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it means" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Expressive syntax" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"One ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" grammar for every construct. Models are the single source of truth and derive the whole stack. Plain, serializable definitions — no decorators, no classes, no config sprawl."
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Developer experience" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "CLI-first with generators for everything, a typed config folder with sensible defaults, auto-discovery over manual registration, and friendly errors (did-you-mean suggestions, field-mapped validation, request correlation)." })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Performance" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rust-speed static machinery for sub-second checks and fast builds, a TypeScript-native runtime with fast startup, streaming-first SSR, layered caching (route rules → model cache → client cache), and type-level inference with zero runtime codegen." })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Scalability" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Stateless multi-instance by construction (externalized state), tenancy-first data access, queue/tasks/schedule for background scale, edge presets, and deploy-anywhere output from one codebase." })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "architecture-at-a-glance",
			children: "Architecture at a Glance"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva holds one core architectural rule:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "architecture-at-a-glance.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Application (src/) — models, http, pages, jobs, events, config" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ↓  writes defineX(...) only · imports only @kwiva/*" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Framework API surface (@kwiva/*)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ↓" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Sealed engines (framework-owned internals — never imported by app code)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ↓" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Runtime (Bun · Node · Edge) via deployment presets" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The application depends only on the framework. The framework owns the sealed engines and the Rust-speed toolchain. App code never imports an engine by name — engine choice is a deployment detail that stays inside the framework. Whatever preset an application deploys to, it sees the same framework API surface; the differences between a Bun server, a serverless function, a static export, and an edge worker stay in the engine layer." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "one-definition-multiplies-the-stack",
			children: "One Definition Multiplies the Stack"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A single model definition feeds an intermediate representation (the model IR) from which the rest of the stack is derived — so there is no drift between your types, your API, and your database:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "one-definition-multiplies-the-stack.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/models/*.ts ──► model IR" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─► database schema + migrations + seeders" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─► typed REST API routes (list / get / create / update / delete)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─► typed RPC client SDK (@kwiva/client)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─► Kwiva Studio screens (generated operations UI)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─► OpenAPI 3.1 spec (/openapi.json)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  └─► MCP tools (optional, policy-checked)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-definex-ecosystem",
			children: "The defineX Ecosystem"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every app-facing construct in Kwiva is a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factory — one consistent convention across the whole framework. Learn one, learn them all."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Factory" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Package" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Application composition and kernel" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Typed configuration modules" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/config" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Data models — the single source of truth" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Resource endpoints and custom actions" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMiddleware" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Lifecycle pipeline stages" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineServerRoute" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Infrastructure routes and route rules" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineService" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Business logic with typed injection" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/services" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Background jobs" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/queue" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Domain events, listeners, and the outbox" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/events" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineCommand" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "App-defined CLI commands" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/cli" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Background / scheduled tasks" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "File-based frontend pages" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authorization policies" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authentication providers and sessions" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePlugin" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Framework plugins" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Reusable capability modules" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMcpTool" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model Context Protocol tools" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/mcp" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every factory is a plain, declarative function call placed in a conventional directory. Every factory accepts full inline options that override the config folder. Every definition flows types to the rest of the system through one ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" grammar. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}),
			" for the complete surface."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "documentation-map",
			children: "Documentation Map"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every section has its own index page, and each page links to its neighbors, references, and guides." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Section" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Covers" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started",
				children: "Getting Started"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Install, scaffold, configure, your first model, API, page, and deployment" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts",
				children: "Core Concepts"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The defineX convention, applications, configuration, lifecycle, context, type inference" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data",
				children: "Data"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Models, fields, queries, relations, migrations, transactions, factories, seeders, validation" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http",
					children: "HTTP"
				}),
				" · ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/api",
					children: "API"
				})
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controllers, middleware, routes, validation, guards; REST conventions, RPC client, OpenAPI" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/frontend",
					children: "Frontend"
				}),
				" · ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/rendering",
					children: "Rendering"
				})
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pages, loaders, data hooks; SSR, hydration, streaming, prerendering" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/auth",
					children: "Auth"
				}),
				" · ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/authorization",
					children: "Authorization"
				}),
				" · ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/tenancy",
					children: "Tenancy"
				})
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sessions, providers, route protection; policies, roles; tenant isolation and scoping" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime",
				children: "Realtime"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Events, channels, client usage, scaling WebSockets" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work",
				children: "Background Work"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Queues, jobs, scheduling, observability" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio",
				children: "Studio"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The generated operations UI and its configuration" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/ai-mcp",
				children: "AI & MCP"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP server, tool generation, agent integration" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins",
				children: "Modules & Plugins"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Composition, defining modules, addons" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli",
				children: "CLI"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Commands, generators, database and project tooling" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing",
				children: "Testing"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Unit, integration, API, and e2e testing" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Logging, metrics, tracing, the dev overlay" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security",
				children: "Security"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Headers, input validation, default protections, production hardening" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment",
				children: "Deployment"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Presets, adapters, containers, serverless, production checklist" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced",
				children: "Advanced"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Internals, request lifecycle, model IR, performance, package boundaries" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "quick-start",
			children: "Quick Start"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Scaffold a default ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "fullstack" }),
			" application and start developing:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "terminal",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "bun"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " create"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " my-app"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "cd"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " my-app"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "bun"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " run"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " dev"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Open ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http://localhost:3000" }),
			" and you have a running application: SSR pages, an API surface, and a dev server with hot module replacement. From here, add a model, publish an API, render a page — and deploy anywhere."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started",
				children: "Getting Started"
			}), " — install Bun and create your first project"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}), " — the one grammar behind every file"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture",
				children: "Architecture"
			}), " — a deep dive into the framework's design"] }),
			"\n"
		] })
	] });
}
function MDXContent(props = {}) {
	const { wrapper: MDXLayout } = props.components || {};
	return MDXLayout ? (0, import_jsx_runtime_react_server.jsx)(MDXLayout, {
		...props,
		children: (0, import_jsx_runtime_react_server.jsx)(_createMdxContent, { ...props })
	}) : _createMdxContent(props);
}
//#endregion
export { _markdown, MDXContent as default, frontmatter, lastModified, structuredData, toc };
