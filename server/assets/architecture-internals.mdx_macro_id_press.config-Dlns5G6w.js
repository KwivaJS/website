import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/advanced/architecture-internals.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Architecture Internals",
	"description": "The layered architecture — application, @kwiva/* framework APIs, sealed internal engines, toolchain, runtime — plus auto-discovery and module boundaries."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva is organized as a strict set of layers with one non-negotiable dependency direction. Understanding the layers tells you who owns what, where code is allowed to run, and why the framework can change its internals without ever breaking your application.\n\n## The Core Architectural Rule [#the-core-architectural-rule]\n\n> The app depends only on the framework. The framework depends on internal engines and the Rust-speed toolchain. App code never imports an engine by name. Every app-facing construct is a `defineX` factory.\n\n```plaintext title=\"the-core-architectural-rule.txt\"\n┌──────────────────────────────────────────────────────────────────────┐\n│ APP (src/) — models, http, routes, services, jobs, events, ui, config│\n│   writes defineX(...) only · imports only @kwiva/*                   │\n├──────────────────────────────────────────────────────────────────────┤\n│ FRAMEWORK API (@kwiva/*)                                             │\n│   core · config · schema · data · http · router · react · client ·   │\n│   queue · events · auth · studio · mcp · testing                     │\n├──────────────────────────────────────┬───────────────────────────────┤\n│ ENGINES (internal, sealed)           │ TOOLCHAIN (deeply integrated) │\n│   server carrier (presets, route     │   bundler pipeline            │\n│   rules, kv/blob, websockets)        │   TS/JSX transformer          │\n│   SQL engine                         │   resolver                    │\n│   auth engine                        │   minifier · built-in linter  │\n│   client-cache engine                │   formatter · declarations    │\n├──────────────────────────────────────┴───────────────────────────────┤\n│ RUNTIME: Bun (primary) · Node (compatible) · edge (via presets)      │\n└──────────────────────────────────────────────────────────────────────┘\n```\n\nEach arrow in the diagram is a hard boundary enforced by the built-in linter. The rest of this page walks each layer.\n\n## Layer 1: The Application [#layer-1-the-application]\n\nApplication code lives in a lowercase, convention-driven filesystem. Directories and files use kebab or dot case — `send-welcome.ts`, `posts.$id.tsx` — and one `defineX` factory maps to each file type.\n\n```plaintext title=\"layer-1-the-application.txt\"\nsrc/\n  bootstrap/app.ts           defineApp — the application kernel\n  app/models/                defineModel — one file per model\n  app/http/controllers/      defineController — one file per resource\n  app/http/middleware/       defineMiddleware — one file per middleware\n  app/http/auth.ts           defineAuth — providers and sessions\n  app/services/              defineService — business logic\n  app/jobs/                  defineJob — background work\n  app/events/                defineEvent — event definitions\n  app/policies/              definePolicy — authorization policies\n  app/tasks/                 defineTask — scheduled work\n  app/console/               defineCommand — CLI commands\n  routes/                    controller registration, ordering, route rules\n  config/                    every configuration module\n  database/migrations/       generated, editable schema steps\n  database/seeders/          defineSeeder seed files\n  ui/pages/                  definePage — file-based routing\n  .kwiva/                    GENERATED — never edit, gitignored\n```\n\nThe whole application is booted from one kernel:\n\n```ts title=\"src/bootstrap/app.ts\"\n// src/bootstrap/app.ts\nimport { defineApp } from '@kwiva/core'\nimport auth from '../app/http/auth'\nimport { controllers, models, middleware } from '@kwiva/core/discover'\n\nexport const app = defineApp({\n  auth,\n  models,          // auto-discovered from src/app/models\n  controllers,     // auto-discovered from src/app/http/controllers\n  middleware,      // stack defined in src/config/app.ts, files discovered\n  providers: [\n    // boot/shutdown hooks for services\n  ],\n})\n```\n\nApplication code writes only framework APIs. The `kwiva check` command gates this with the `no-engine-imports` rule, so a stray engine import fails in CI before it ever reaches production. The lowercase filesystem, the `defineX`-per-file convention, and the boot-from-one-kernel pattern are all mechanical contracts — they are enforced by the linter, not by documentation.\n\n## Layer 2: The Framework API [#layer-2-the-framework-api]\n\nThis layer is the public surface of Kwiva: many equal packages that compose into a framework. Application code imports from this layer and nowhere below it.\n\n| Package                     | Exposes                                                                                                   | Backed by                           |\n| --------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------- |\n| `@kwiva/core`               | `defineApp`, context, dependency injection, `config()`, errors, `definePolicy`                            | Core + the internal server engine   |\n| `@kwiva/config`             | `defineConfig`, config-folder loader, typed env                                                           | Own                                 |\n| `@kwiva/schema`             | Field DSL, model IR, validation                                                                           | Own                                 |\n| `@kwiva/data`               | `defineModel`, query builder, transactions, relations, factories                                          | Sealed SQL engine                   |\n| `@kwiva/http`               | `defineController`, `defineMiddleware`, `defineServerRoute`, lifecycle, guards, macros, WebSockets, tasks | Own + the internal server engine    |\n| `@kwiva/router`             | File-based router core, loaders, typed navigation                                                         | Own                                 |\n| `@kwiva/react`              | `definePage`, SSR renderer, providers, `Link`, `useNavigate`                                              | Router + the internal server engine |\n| `@kwiva/react` (data hooks) | `useResource`, `useList`, `useMutation`, infinite, prefetch, devtools                                     | Sealed client-cache engine          |\n| `@kwiva/client`             | Generated typed RPC SDK                                                                                   | Own, from controller and model IR   |\n| `@kwiva/queue`              | `defineJob`, workers, retries, backoff, dead-letter queue                                                 | Own transport                       |\n| `@kwiva/events`             | `defineEvent`, listeners, transactional outbox                                                            | Own                                 |\n| `@kwiva/auth`               | `defineAuth`, `requireAuth`, sessions, OAuth, passkeys                                                    | Sealed auth engine                  |\n| `@kwiva/studio`             | Generated Studio screens                                                                                  | React + the component kit           |\n| `@kwiva/mcp`                | MCP server generated from the IR                                                                          | Own                                 |\n| `@kwiva/testing`            | App test harness, fixtures                                                                                | Own                                 |\n\nTwo rules govern this layer. First, `core` and `schema` are leaves: nothing underneath them may depend on anything else in the framework. Second, no framework package ever re-exports an engine API — sealing holds at the package boundary, not just the convention level. If a framework surface never hands you an engine type, there is nothing for an engine import to reach for.\n\n## Layer 3: Internal Engines (Sealed) [#layer-3-internal-engines-sealed]\n\nKwiva delegates deep infrastructure to sealed internal engines. \"Sealed\" means the framework configures and owns them, and application code never imports them directly — the framework surface is the only way in.\n\n| Engine domain       | Responsibilities behind the seal                                                                                         |\n| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |\n| Server carrier      | Deploy presets, storage mounts, route rules (SWR, ISR, cache, redirect, proxy), tasks and cron, WebSockets, prerendering |\n| SQL engine          | Schema translation, SQL query generation, transactions, relations                                                        |\n| Auth engine         | Sessions, OAuth, passkeys, organizations                                                                                 |\n| Client-cache engine | Query keys, caching, invalidation, optimistic updates, devtools                                                          |\n\nBecause engines are sealed, they can be swapped or upgraded without touching application code. One consequence matters for every Kwiva developer: you never pin or pass around engine configuration directly. Everything you can set flows through `defineX` options or the config folder, and the internal engine conforms to that.\n\nSealing is what makes the upgrade story honest. An engine major version bumps behind the framework surface, the framework absorbs the breaking changes, and application code moves on untouched. The trade is deliberate: the framework owns more surface, in exchange for a stable contract the application can rely on.\n\n## Auto-Discovery and Module Boundaries [#auto-discovery-and-module-boundaries]\n\nThe framework never asks you to register constructs. Registration is file-scan based: models, controllers, middleware, and pages are discovered from their directories by convention. `src/routes/*.ts` exists for cases where you need explicit registration, ordering, or route rules — not as a required step.\n\nAuto-discovery feeds the typed artifacts in `src/.kwiva/`, which is generated on every dev and build run and rebuilt whenever the filesystem changes:\n\n```plaintext title=\"auto-discovery-and-module-boundaries.txt\"\nsrc/.kwiva/\n  route-manifest.json   route IR → client, OpenAPI, MCP\n  model-ir.json         model IR\n  types/                generated ambient types\n```\n\nNever hand-edit anything under `.kwiva/`. It is a build product, regenerated deterministically from your definitions.\n\n## Layer 4: The Toolchain and the Runtime [#layer-4-the-toolchain-and-the-runtime]\n\nBelow the engines sits the toolchain and the runtime. The `kwiva` CLI is built directly on a Rust-speed toolchain: the bundler pipeline handles client and server production builds and package distribution builds; the TS/JSX transformer powers on-the-fly transforms in development and codemods for `kwiva upgrade`; the resolver serves the dev module graph; the minifier shrinks production output; the built-in linter enforces convention gates; the built-in formatter normalizes code; and declaration emission produces fast type-declaration output for packages.\n\nThe runtime layer is Bun-first: native TypeScript execution with no compile step in development, fast startup, and single-binary output when you need it. Node-compatible and edge outputs are produced through the engine presets, so the application surface stays identical across runtimes — deploy differences never leak into your code.\n\n## How the Layers Enforce the Guarantees [#how-the-layers-enforce-the-guarantees]\n\nThe guarantees this section relies on are enforced mechanically, and each one has an owner:\n\n| Guarantee                    | Enforced by                                     |\n| ---------------------------- | ----------------------------------------------- |\n| App imports only `@kwiva/*`  | `kwiva check` — `no-engine-imports` gate        |\n| One factory per file type    | `kwiva check` — `defineX-file-conventions` gate |\n| Lowercase filesystem         | `kwiva check` — `lowercase-paths` gate          |\n| Loaders use the typed client | `kwiva check` — `no-raw-fetch-in-loaders` gate  |\n| Secrets stay out of bundles  | `kwiva check` — `no-secrets-in-client` gate     |\n| No engine re-exports         | Package-boundary rules in the dependency graph  |\n| Deploy surface stays stable  | Sealed engines behind the framework API         |\n\nChecks run in CI, so the architecture holds on every commit — not just for the developers who remember the diagram. The build pipeline produces the artifacts; the linter produces the discipline.\n\n## What's Next [#whats-next]\n\n* [Package Boundaries](/docs/advanced/package-boundaries) — The dependency graph and where each package may import\n* [Request Lifecycle](/docs/advanced/request-lifecycle) — What happens inside the pipeline once a request arrives\n* [Auto-Discovery](/docs/core-concepts/auto-discovery) — How Kwiva finds and registers every construct\n* [Applications](/docs/core-concepts/applications) — How `defineApp` bootstraps the kernel shown above\n* [Project Structure](/docs/getting-started/project-structure) — The full lowercase filesystem, page by page\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva is organized as a strict set of layers with one non-negotiable dependency direction. Understanding the layers tells you who owns what, where code is allowed to run, and why the framework can change its internals without ever breaking your application."
		},
		{
			"heading": "the-core-architectural-rule",
			"content": "> The app depends only on the framework. The framework depends on internal engines and the Rust-speed toolchain. App code never imports an engine by name. Every app-facing construct is a `defineX` factory."
		},
		{
			"heading": "the-core-architectural-rule",
			"content": "Each arrow in the diagram is a hard boundary enforced by the built-in linter. The rest of this page walks each layer."
		},
		{
			"heading": "layer-1-the-application",
			"content": "Application code lives in a lowercase, convention-driven filesystem. Directories and files use kebab or dot case — `send-welcome.ts`, `posts.$id.tsx` — and one `defineX` factory maps to each file type."
		},
		{
			"heading": "layer-1-the-application",
			"content": "The whole application is booted from one kernel:"
		},
		{
			"heading": "layer-1-the-application",
			"content": "Application code writes only framework APIs. The `kwiva check` command gates this with the `no-engine-imports` rule, so a stray engine import fails in CI before it ever reaches production. The lowercase filesystem, the `defineX`-per-file convention, and the boot-from-one-kernel pattern are all mechanical contracts — they are enforced by the linter, not by documentation."
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "This layer is the public surface of Kwiva: many equal packages that compose into a framework. Application code imports from this layer and nowhere below it."
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Package"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Exposes"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Backed by"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`defineApp`, context, dependency injection, `config()`, errors, `definePolicy`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Core + the internal server engine"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/config`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`defineConfig`, config-folder loader, typed env"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Own"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/schema`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Field DSL, model IR, validation"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Own"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/data`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`defineModel`, query builder, transactions, relations, factories"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Sealed SQL engine"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`defineController`, `defineMiddleware`, `defineServerRoute`, lifecycle, guards, macros, WebSockets, tasks"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Own + the internal server engine"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/router`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "File-based router core, loaders, typed navigation"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Own"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/react`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`definePage`, SSR renderer, providers, `Link`, `useNavigate`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Router + the internal server engine"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/react` (data hooks)"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`useResource`, `useList`, `useMutation`, infinite, prefetch, devtools"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Sealed client-cache engine"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/client`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Generated typed RPC SDK"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Own, from controller and model IR"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/queue`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`defineJob`, workers, retries, backoff, dead-letter queue"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Own transport"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/events`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`defineEvent`, listeners, transactional outbox"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Own"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/auth`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`defineAuth`, `requireAuth`, sessions, OAuth, passkeys"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Sealed auth engine"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/studio`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Generated Studio screens"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "React + the component kit"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/mcp`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "MCP server generated from the IR"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Own"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "`@kwiva/testing`"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "App test harness, fixtures"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Own"
		},
		{
			"heading": "layer-2-the-framework-api",
			"content": "Two rules govern this layer. First, `core` and `schema` are leaves: nothing underneath them may depend on anything else in the framework. Second, no framework package ever re-exports an engine API — sealing holds at the package boundary, not just the convention level. If a framework surface never hands you an engine type, there is nothing for an engine import to reach for."
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "Kwiva delegates deep infrastructure to sealed internal engines. \"Sealed\" means the framework configures and owns them, and application code never imports them directly — the framework surface is the only way in."
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "Engine domain"
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "Responsibilities behind the seal"
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "Server carrier"
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "Deploy presets, storage mounts, route rules (SWR, ISR, cache, redirect, proxy), tasks and cron, WebSockets, prerendering"
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "SQL engine"
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "Schema translation, SQL query generation, transactions, relations"
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "Auth engine"
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "Sessions, OAuth, passkeys, organizations"
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "Client-cache engine"
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "Query keys, caching, invalidation, optimistic updates, devtools"
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "Because engines are sealed, they can be swapped or upgraded without touching application code. One consequence matters for every Kwiva developer: you never pin or pass around engine configuration directly. Everything you can set flows through `defineX` options or the config folder, and the internal engine conforms to that."
		},
		{
			"heading": "layer-3-internal-engines-sealed",
			"content": "Sealing is what makes the upgrade story honest. An engine major version bumps behind the framework surface, the framework absorbs the breaking changes, and application code moves on untouched. The trade is deliberate: the framework owns more surface, in exchange for a stable contract the application can rely on."
		},
		{
			"heading": "auto-discovery-and-module-boundaries",
			"content": "The framework never asks you to register constructs. Registration is file-scan based: models, controllers, middleware, and pages are discovered from their directories by convention. `src/routes/*.ts` exists for cases where you need explicit registration, ordering, or route rules — not as a required step."
		},
		{
			"heading": "auto-discovery-and-module-boundaries",
			"content": "Auto-discovery feeds the typed artifacts in `src/.kwiva/`, which is generated on every dev and build run and rebuilt whenever the filesystem changes:"
		},
		{
			"heading": "auto-discovery-and-module-boundaries",
			"content": "Never hand-edit anything under `.kwiva/`. It is a build product, regenerated deterministically from your definitions."
		},
		{
			"heading": "layer-4-the-toolchain-and-the-runtime",
			"content": "Below the engines sits the toolchain and the runtime. The `kwiva` CLI is built directly on a Rust-speed toolchain: the bundler pipeline handles client and server production builds and package distribution builds; the TS/JSX transformer powers on-the-fly transforms in development and codemods for `kwiva upgrade`; the resolver serves the dev module graph; the minifier shrinks production output; the built-in linter enforces convention gates; the built-in formatter normalizes code; and declaration emission produces fast type-declaration output for packages."
		},
		{
			"heading": "layer-4-the-toolchain-and-the-runtime",
			"content": "The runtime layer is Bun-first: native TypeScript execution with no compile step in development, fast startup, and single-binary output when you need it. Node-compatible and edge outputs are produced through the engine presets, so the application surface stays identical across runtimes — deploy differences never leak into your code."
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "The guarantees this section relies on are enforced mechanically, and each one has an owner:"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "Guarantee"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "Enforced by"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "App imports only `@kwiva/*`"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "`kwiva check` — `no-engine-imports` gate"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "One factory per file type"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "`kwiva check` — `defineX-file-conventions` gate"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "Lowercase filesystem"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "`kwiva check` — `lowercase-paths` gate"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "Loaders use the typed client"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "`kwiva check` — `no-raw-fetch-in-loaders` gate"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "Secrets stay out of bundles"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "`kwiva check` — `no-secrets-in-client` gate"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "No engine re-exports"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "Package-boundary rules in the dependency graph"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "Deploy surface stays stable"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "Sealed engines behind the framework API"
		},
		{
			"heading": "how-the-layers-enforce-the-guarantees",
			"content": "Checks run in CI, so the architecture holds on every commit — not just for the developers who remember the diagram. The build pipeline produces the artifacts; the linter produces the discipline."
		},
		{
			"heading": "whats-next",
			"content": "Package Boundaries — The dependency graph and where each package may import"
		},
		{
			"heading": "whats-next",
			"content": "Request Lifecycle — What happens inside the pipeline once a request arrives"
		},
		{
			"heading": "whats-next",
			"content": "Auto-Discovery — How Kwiva finds and registers every construct"
		},
		{
			"heading": "whats-next",
			"content": "Applications — How `defineApp` bootstraps the kernel shown above"
		},
		{
			"heading": "whats-next",
			"content": "Project Structure — The full lowercase filesystem, page by page"
		}
	],
	"headings": [
		{
			"id": "the-core-architectural-rule",
			"content": "The Core Architectural Rule"
		},
		{
			"id": "layer-1-the-application",
			"content": "Layer 1: The Application"
		},
		{
			"id": "layer-2-the-framework-api",
			"content": "Layer 2: The Framework API"
		},
		{
			"id": "layer-3-internal-engines-sealed",
			"content": "Layer 3: Internal Engines (Sealed)"
		},
		{
			"id": "auto-discovery-and-module-boundaries",
			"content": "Auto-Discovery and Module Boundaries"
		},
		{
			"id": "layer-4-the-toolchain-and-the-runtime",
			"content": "Layer 4: The Toolchain and the Runtime"
		},
		{
			"id": "how-the-layers-enforce-the-guarantees",
			"content": "How the Layers Enforce the Guarantees"
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
		url: "#the-core-architectural-rule",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Core Architectural Rule" })
	},
	{
		depth: 2,
		url: "#layer-1-the-application",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layer 1: The Application" })
	},
	{
		depth: 2,
		url: "#layer-2-the-framework-api",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layer 2: The Framework API" })
	},
	{
		depth: 2,
		url: "#layer-3-internal-engines-sealed",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layer 3: Internal Engines (Sealed)" })
	},
	{
		depth: 2,
		url: "#auto-discovery-and-module-boundaries",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Auto-Discovery and Module Boundaries" })
	},
	{
		depth: 2,
		url: "#layer-4-the-toolchain-and-the-runtime",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layer 4: The Toolchain and the Runtime" })
	},
	{
		depth: 2,
		url: "#how-the-layers-enforce-the-guarantees",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How the Layers Enforce the Guarantees" })
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
		blockquote: "blockquote",
		code: "code",
		h2: "h2",
		li: "li",
		p: "p",
		pre: "pre",
		span: "span",
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva is organized as a strict set of layers with one non-negotiable dependency direction. Understanding the layers tells you who owns what, where code is allowed to run, and why the framework can change its internals without ever breaking your application." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-core-architectural-rule",
			children: "The Core Architectural Rule"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"The app depends only on the framework. The framework depends on internal engines and the Rust-speed toolchain. App code never imports an engine by name. Every app-facing construct is a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" factory."
			] }),
			"\n"
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
			title: "the-core-architectural-rule.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "┌──────────────────────────────────────────────────────────────────────┐" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│ APP (src/) — models, http, routes, services, jobs, events, ui, config│" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│   writes defineX(...) only · imports only @kwiva/*                   │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├──────────────────────────────────────────────────────────────────────┤" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│ FRAMEWORK API (@kwiva/*)                                             │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│   core · config · schema · data · http · router · react · client ·   │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│   queue · events · auth · studio · mcp · testing                     │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├──────────────────────────────────────┬───────────────────────────────┤" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│ ENGINES (internal, sealed)           │ TOOLCHAIN (deeply integrated) │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│   server carrier (presets, route     │   bundler pipeline            │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│   rules, kv/blob, websockets)        │   TS/JSX transformer          │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│   SQL engine                         │   resolver                    │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│   auth engine                        │   minifier · built-in linter  │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│   client-cache engine                │   formatter · declarations    │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├──────────────────────────────────────┴───────────────────────────────┤" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│ RUNTIME: Bun (primary) · Node (compatible) · edge (via presets)      │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "└──────────────────────────────────────────────────────────────────────┘" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each arrow in the diagram is a hard boundary enforced by the built-in linter. The rest of this page walks each layer." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layer-1-the-application",
			children: "Layer 1: The Application"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Application code lives in a lowercase, convention-driven filesystem. Directories and files use kebab or dot case — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "send-welcome.ts" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.$id.tsx" }),
			" — and one ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factory maps to each file type."
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
			title: "layer-1-the-application.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  bootstrap/app.ts           defineApp — the application kernel" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  app/models/                defineModel — one file per model" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  app/http/controllers/      defineController — one file per resource" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  app/http/middleware/       defineMiddleware — one file per middleware" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  app/http/auth.ts           defineAuth — providers and sessions" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  app/services/              defineService — business logic" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  app/jobs/                  defineJob — background work" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  app/events/                defineEvent — event definitions" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  app/policies/              definePolicy — authorization policies" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  app/tasks/                 defineTask — scheduled work" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  app/console/               defineCommand — CLI commands" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  routes/                    controller registration, ordering, route rules" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  config/                    every configuration module" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  database/migrations/       generated, editable schema steps" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  database/seeders/          defineSeeder seed files" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ui/pages/                  definePage — file-based routing" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  .kwiva/                    GENERATED — never edit, gitignored" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The whole application is booted from one kernel:" }),
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
			title: "src/bootstrap/app.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/bootstrap/app.ts"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { defineApp } "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "from"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " '@kwiva/core'"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " auth "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "from"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " '../app/http/auth'"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { controllers, models, middleware } "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "from"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " '@kwiva/core/discover'"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "export"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " app"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " ="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " defineApp"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  auth,"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  models,          "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// auto-discovered from src/app/models"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  controllers,     "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// auto-discovered from src/app/http/controllers"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  middleware,      "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// stack defined in src/config/app.ts, files discovered"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  providers: ["
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "    // boot/shutdown hooks for services"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  ],"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Application code writes only framework APIs. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
			" command gates this with the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-engine-imports" }),
			" rule, so a stray engine import fails in CI before it ever reaches production. The lowercase filesystem, the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			"-per-file convention, and the boot-from-one-kernel pattern are all mechanical contracts — they are enforced by the linter, not by documentation."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layer-2-the-framework-api",
			children: "Layer 2: The Framework API"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This layer is the public surface of Kwiva: many equal packages that compose into a framework. Application code imports from this layer and nowhere below it." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Package" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Exposes" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Backed by" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
					", context, dependency injection, ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config()" }),
					", errors, ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Core + the internal server engine" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/config" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }), ", config-folder loader, typed env"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Own" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/schema" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Field DSL, model IR, validation" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Own" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }), ", query builder, transactions, relations, factories"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sealed SQL engine" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMiddleware" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineServerRoute" }),
					", lifecycle, guards, macros, WebSockets, tasks"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Own + the internal server engine" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/router" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "File-based router core, loaders, typed navigation" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Own" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
					", SSR renderer, providers, ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Link" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useNavigate" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Router + the internal server engine" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }), " (data hooks)"] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useResource" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useList" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useMutation" }),
					", infinite, prefetch, devtools"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sealed client-cache engine" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generated typed RPC SDK" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Own, from controller and model IR" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/queue" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }), ", workers, retries, backoff, dead-letter queue"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Own transport" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/events" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }), ", listeners, transactional outbox"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Own" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requireAuth" }),
					", sessions, OAuth, passkeys"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sealed auth engine" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/studio" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generated Studio screens" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "React + the component kit" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/mcp" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP server generated from the IR" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Own" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/testing" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "App test harness, fixtures" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Own" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Two rules govern this layer. First, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "core" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schema" }),
			" are leaves: nothing underneath them may depend on anything else in the framework. Second, no framework package ever re-exports an engine API — sealing holds at the package boundary, not just the convention level. If a framework surface never hands you an engine type, there is nothing for an engine import to reach for."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layer-3-internal-engines-sealed",
			children: "Layer 3: Internal Engines (Sealed)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva delegates deep infrastructure to sealed internal engines. \"Sealed\" means the framework configures and owns them, and application code never imports them directly — the framework surface is the only way in." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Engine domain" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Responsibilities behind the seal" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server carrier" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Deploy presets, storage mounts, route rules (SWR, ISR, cache, redirect, proxy), tasks and cron, WebSockets, prerendering" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SQL engine" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Schema translation, SQL query generation, transactions, relations" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Auth engine" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sessions, OAuth, passkeys, organizations" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Client-cache engine" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Query keys, caching, invalidation, optimistic updates, devtools" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because engines are sealed, they can be swapped or upgraded without touching application code. One consequence matters for every Kwiva developer: you never pin or pass around engine configuration directly. Everything you can set flows through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" options or the config folder, and the internal engine conforms to that."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Sealing is what makes the upgrade story honest. An engine major version bumps behind the framework surface, the framework absorbs the breaking changes, and application code moves on untouched. The trade is deliberate: the framework owns more surface, in exchange for a stable contract the application can rely on." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "auto-discovery-and-module-boundaries",
			children: "Auto-Discovery and Module Boundaries"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The framework never asks you to register constructs. Registration is file-scan based: models, controllers, middleware, and pages are discovered from their directories by convention. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/routes/*.ts" }),
			" exists for cases where you need explicit registration, ordering, or route rules — not as a required step."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Auto-discovery feeds the typed artifacts in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/" }),
			", which is generated on every dev and build run and rebuilt whenever the filesystem changes:"
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
			title: "auto-discovery-and-module-boundaries.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/.kwiva/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  route-manifest.json   route IR → client, OpenAPI, MCP" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  model-ir.json         model IR" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  types/                generated ambient types" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Never hand-edit anything under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".kwiva/" }),
			". It is a build product, regenerated deterministically from your definitions."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layer-4-the-toolchain-and-the-runtime",
			children: "Layer 4: The Toolchain and the Runtime"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Below the engines sits the toolchain and the runtime. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva" }),
			" CLI is built directly on a Rust-speed toolchain: the bundler pipeline handles client and server production builds and package distribution builds; the TS/JSX transformer powers on-the-fly transforms in development and codemods for ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva upgrade" }),
			"; the resolver serves the dev module graph; the minifier shrinks production output; the built-in linter enforces convention gates; the built-in formatter normalizes code; and declaration emission produces fast type-declaration output for packages."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The runtime layer is Bun-first: native TypeScript execution with no compile step in development, fast startup, and single-binary output when you need it. Node-compatible and edge outputs are produced through the engine presets, so the application surface stays identical across runtimes — deploy differences never leak into your code." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-the-layers-enforce-the-guarantees",
			children: "How the Layers Enforce the Guarantees"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The guarantees this section relies on are enforced mechanically, and each one has an owner:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Guarantee" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Enforced by" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["App imports only ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-engine-imports" }),
				" gate"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "One factory per file type" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX-file-conventions" }),
				" gate"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Lowercase filesystem" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "lowercase-paths" }),
				" gate"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Loaders use the typed client" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-raw-fetch-in-loaders" }),
				" gate"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Secrets stay out of bundles" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-secrets-in-client" }),
				" gate"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "No engine re-exports" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Package-boundary rules in the dependency graph" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Deploy surface stays stable" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sealed engines behind the framework API" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Checks run in CI, so the architecture holds on every commit — not just for the developers who remember the diagram. The build pipeline produces the artifacts; the linter produces the discipline." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/package-boundaries",
				children: "Package Boundaries"
			}), " — The dependency graph and where each package may import"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/request-lifecycle",
				children: "Request Lifecycle"
			}), " — What happens inside the pipeline once a request arrives"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/auto-discovery",
				children: "Auto-Discovery"
			}), " — How Kwiva finds and registers every construct"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/applications",
					children: "Applications"
				}),
				" — How ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
				" bootstraps the kernel shown above"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/project-structure",
				children: "Project Structure"
			}), " — The full lowercase filesystem, page by page"] }),
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
