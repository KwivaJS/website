import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/architecture/package-boundaries.mdx?macro_id=press.config.tsx%23architecture
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Package Boundaries",
	"description": "The 17 @kwiva packages, their dependency graph, the ownership map, and the boundary rules that keep the framework coherent."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva ships as many equal, focused packages under the `@kwiva/*` scope. Each owns one concern, versions independently, and imports only what it needs. The boundaries between packages — and between the framework, its engines, and the application — are what keep the system coherent.\n\n## The Packages [#the-packages]\n\n| Package           | Owns                                                    |\n| ----------------- | ------------------------------------------------------- |\n| `@kwiva/core`     | App kernel (`defineApp`), context, DI, errors, policies |\n| `@kwiva/config`   | Configuration system, config folder, typed env          |\n| `@kwiva/schema`   | Field DSL, model IR, validation                         |\n| `@kwiva/data`     | Models, query builder, transactions, relations          |\n| `@kwiva/http`     | Controllers, middleware, lifecycle, guards, routes, WS  |\n| `@kwiva/router`   | Owned typed file-based router core                      |\n| `@kwiva/react`    | Pages, SSR, providers, data hooks                       |\n| `@kwiva/client`   | Typed RPC SDK                                           |\n| `@kwiva/services` | Service container                                       |\n| `@kwiva/queue`    | Jobs, workers, retries, backoff                         |\n| `@kwiva/events`   | Events, listeners, broadcasting                         |\n| `@kwiva/auth`     | Authentication, sessions, providers                     |\n| `@kwiva/studio`   | Generated operations UI                                 |\n| `@kwiva/mcp`      | MCP server and tools                                    |\n| `@kwiva/ui-kit`   | UI components                                           |\n| `@kwiva/cli`      | The `kwiva` binary                                      |\n| `@kwiva/testing`  | Test harness and fixtures                               |\n\n## Dependency Graph [#dependency-graph]\n\nThe graph is strict and acyclic — `core` and `schema` are leaves (nothing depends on them depending outward), nothing imports the CLI, and app-facing packages never re-export engine APIs:\n\n```plaintext title=\"dependency-graph.txt\"\ncli ──► http · react · data · auth · studio · toolchain integration\nstudio ──► react · ui-kit · data\nreact ──► router · client · data-cache engine (sealed)\nclient ──► core (types only)\nhttp  ──► core · schema · data (server engine, sealed)\ndata  ──► core · schema (SQL engine, sealed)\nauth  ──► core · http (auth engine, sealed)\nqueue ──► core · events\nevents ──► core · data\nservices ──► core\nconfig ──► core\nschema ──► (nothing — leaf)\ncore  ──► (nothing — leaf)\n```\n\nWhy this matters: because packages depend in one direction, the framework can version each concern independently, test packages in isolation, and seal engines without creating cycles.\n\n## Ownership Map [#ownership-map]\n\n| Capability                                   | Owner                            | Notes                                |\n| -------------------------------------------- | -------------------------------- | ------------------------------------ |\n| Scaffold / project boot                      | `@kwiva/cli`                     | Own scaffolder, formatted output     |\n| Dev server, HMR, build, check, test          | `@kwiva/cli`                     | Rust-speed toolchain integrated      |\n| Server portability (presets, storage, tasks) | internal engine                  | Configured by the framework          |\n| HTTP pipeline, controllers, validation       | `@kwiva/http`                    | Owned                                |\n| REST conventions, OpenAPI                    | `@kwiva/http`                    | From route/model IR                  |\n| Typed RPC client                             | `@kwiva/client`                  | From the same IR                     |\n| Data schema (source of truth)                | `@kwiva/schema` + `@kwiva/data`  | App writes `defineModel` files       |\n| Migrations, seeders, factories               | `@kwiva/data`                    | Model diff → SQL                     |\n| Studio (ops UI)                              | `@kwiva/studio`                  | Generated, policy-aware              |\n| AuthN (sessions, providers)                  | `@kwiva/auth`                    | Wired into HTTP + SSR                |\n| Authorization (RBAC/policies)                | `@kwiva/core`                    | Conventions + model enforcement      |\n| Tenancy                                      | `@kwiva/core`/`@kwiva/data`      | `tenantField` + context scoping      |\n| UI routing                                   | `@kwiva/router`                  | Owned                                |\n| SSR orchestration                            | `@kwiva/react`                   | Owns hydration/dehydration/streaming |\n| Client data cache                            | internal engine                  | Surfaced via data hooks only         |\n| Prerender/ISR/SWR                            | internal engine                  | Route rules                          |\n| Queue/jobs, events, tasks                    | `@kwiva/queue` + `@kwiva/events` | Owned                                |\n| Security headers/CSP, rate limiting          | framework defaults               | Config-driven                        |\n\n## Boundary Rules [#boundary-rules]\n\n1. **The framework doesn't duplicate engine capability.** If an internal engine already provides something (storage, caching, websockets), the framework configures and documents it rather than re-implementing it.\n2. **Application code doesn't re-architect framework layers.** Applications write `defineX` files; they don't build their own request pipeline, router, or query cache.\n3. **Engine choices are the framework's; version pins are the app's.** The framework ships compatibility ranges; apps pin exact versions.\n4. **Extension over replacement.** Want a different validator? Standard Schema abstracts it. Want a different HTTP foundation? That's a full stack change, not a per-app choice.\n5. **The framework has veto power on conventions.** Loaders fetch via the typed RPC client, not raw fetch — enforced by lint.\n\n## Versioning & Support [#versioning--support]\n\n* Packages follow semantic versioning independently.\n* A compatibility matrix (peer ranges) documents which internal engine versions each release supports.\n* Security fixes prioritize `@kwiva/core`, `@kwiva/http`, and `@kwiva/cli`.\n* Deprecations follow a two-major-version window, with codemod-powered upgrades via `kwiva upgrade`.\n\n## What to Read Next [#what-to-read-next]\n\n* [Architecture Overview](/architecture) — The layered model\n* [Design Principles](/architecture/design-principles) — Why these boundaries exist\n* [Modules & Plugins](/docs/modules-plugins) — How packages compose into an app\n* [Advanced: Package Boundaries](/docs/advanced/package-boundaries) — Internal deep dive\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva ships as many equal, focused packages under the `@kwiva/*` scope. Each owns one concern, versions independently, and imports only what it needs. The boundaries between packages — and between the framework, its engines, and the application — are what keep the system coherent."
		},
		{
			"heading": "the-packages",
			"content": "Package"
		},
		{
			"heading": "the-packages",
			"content": "Owns"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "the-packages",
			"content": "App kernel (`defineApp`), context, DI, errors, policies"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/config`"
		},
		{
			"heading": "the-packages",
			"content": "Configuration system, config folder, typed env"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/schema`"
		},
		{
			"heading": "the-packages",
			"content": "Field DSL, model IR, validation"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/data`"
		},
		{
			"heading": "the-packages",
			"content": "Models, query builder, transactions, relations"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-packages",
			"content": "Controllers, middleware, lifecycle, guards, routes, WS"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/router`"
		},
		{
			"heading": "the-packages",
			"content": "Owned typed file-based router core"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/react`"
		},
		{
			"heading": "the-packages",
			"content": "Pages, SSR, providers, data hooks"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/client`"
		},
		{
			"heading": "the-packages",
			"content": "Typed RPC SDK"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/services`"
		},
		{
			"heading": "the-packages",
			"content": "Service container"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/queue`"
		},
		{
			"heading": "the-packages",
			"content": "Jobs, workers, retries, backoff"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/events`"
		},
		{
			"heading": "the-packages",
			"content": "Events, listeners, broadcasting"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/auth`"
		},
		{
			"heading": "the-packages",
			"content": "Authentication, sessions, providers"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/studio`"
		},
		{
			"heading": "the-packages",
			"content": "Generated operations UI"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/mcp`"
		},
		{
			"heading": "the-packages",
			"content": "MCP server and tools"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/ui-kit`"
		},
		{
			"heading": "the-packages",
			"content": "UI components"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/cli`"
		},
		{
			"heading": "the-packages",
			"content": "The `kwiva` binary"
		},
		{
			"heading": "the-packages",
			"content": "`@kwiva/testing`"
		},
		{
			"heading": "the-packages",
			"content": "Test harness and fixtures"
		},
		{
			"heading": "dependency-graph",
			"content": "The graph is strict and acyclic — `core` and `schema` are leaves (nothing depends on them depending outward), nothing imports the CLI, and app-facing packages never re-export engine APIs:"
		},
		{
			"heading": "dependency-graph",
			"content": "Why this matters: because packages depend in one direction, the framework can version each concern independently, test packages in isolation, and seal engines without creating cycles."
		},
		{
			"heading": "ownership-map",
			"content": "Capability"
		},
		{
			"heading": "ownership-map",
			"content": "Owner"
		},
		{
			"heading": "ownership-map",
			"content": "Notes"
		},
		{
			"heading": "ownership-map",
			"content": "Scaffold / project boot"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/cli`"
		},
		{
			"heading": "ownership-map",
			"content": "Own scaffolder, formatted output"
		},
		{
			"heading": "ownership-map",
			"content": "Dev server, HMR, build, check, test"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/cli`"
		},
		{
			"heading": "ownership-map",
			"content": "Rust-speed toolchain integrated"
		},
		{
			"heading": "ownership-map",
			"content": "Server portability (presets, storage, tasks)"
		},
		{
			"heading": "ownership-map",
			"content": "internal engine"
		},
		{
			"heading": "ownership-map",
			"content": "Configured by the framework"
		},
		{
			"heading": "ownership-map",
			"content": "HTTP pipeline, controllers, validation"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "ownership-map",
			"content": "Owned"
		},
		{
			"heading": "ownership-map",
			"content": "REST conventions, OpenAPI"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "ownership-map",
			"content": "From route/model IR"
		},
		{
			"heading": "ownership-map",
			"content": "Typed RPC client"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/client`"
		},
		{
			"heading": "ownership-map",
			"content": "From the same IR"
		},
		{
			"heading": "ownership-map",
			"content": "Data schema (source of truth)"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/schema` + `@kwiva/data`"
		},
		{
			"heading": "ownership-map",
			"content": "App writes `defineModel` files"
		},
		{
			"heading": "ownership-map",
			"content": "Migrations, seeders, factories"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/data`"
		},
		{
			"heading": "ownership-map",
			"content": "Model diff → SQL"
		},
		{
			"heading": "ownership-map",
			"content": "Studio (ops UI)"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/studio`"
		},
		{
			"heading": "ownership-map",
			"content": "Generated, policy-aware"
		},
		{
			"heading": "ownership-map",
			"content": "AuthN (sessions, providers)"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/auth`"
		},
		{
			"heading": "ownership-map",
			"content": "Wired into HTTP + SSR"
		},
		{
			"heading": "ownership-map",
			"content": "Authorization (RBAC/policies)"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "ownership-map",
			"content": "Conventions + model enforcement"
		},
		{
			"heading": "ownership-map",
			"content": "Tenancy"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/core`/`@kwiva/data`"
		},
		{
			"heading": "ownership-map",
			"content": "`tenantField` + context scoping"
		},
		{
			"heading": "ownership-map",
			"content": "UI routing"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/router`"
		},
		{
			"heading": "ownership-map",
			"content": "Owned"
		},
		{
			"heading": "ownership-map",
			"content": "SSR orchestration"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/react`"
		},
		{
			"heading": "ownership-map",
			"content": "Owns hydration/dehydration/streaming"
		},
		{
			"heading": "ownership-map",
			"content": "Client data cache"
		},
		{
			"heading": "ownership-map",
			"content": "internal engine"
		},
		{
			"heading": "ownership-map",
			"content": "Surfaced via data hooks only"
		},
		{
			"heading": "ownership-map",
			"content": "Prerender/ISR/SWR"
		},
		{
			"heading": "ownership-map",
			"content": "internal engine"
		},
		{
			"heading": "ownership-map",
			"content": "Route rules"
		},
		{
			"heading": "ownership-map",
			"content": "Queue/jobs, events, tasks"
		},
		{
			"heading": "ownership-map",
			"content": "`@kwiva/queue` + `@kwiva/events`"
		},
		{
			"heading": "ownership-map",
			"content": "Owned"
		},
		{
			"heading": "ownership-map",
			"content": "Security headers/CSP, rate limiting"
		},
		{
			"heading": "ownership-map",
			"content": "framework defaults"
		},
		{
			"heading": "ownership-map",
			"content": "Config-driven"
		},
		{
			"heading": "boundary-rules",
			"content": "**The framework doesn't duplicate engine capability.** If an internal engine already provides something (storage, caching, websockets), the framework configures and documents it rather than re-implementing it."
		},
		{
			"heading": "boundary-rules",
			"content": "**Application code doesn't re-architect framework layers.** Applications write `defineX` files; they don't build their own request pipeline, router, or query cache."
		},
		{
			"heading": "boundary-rules",
			"content": "**Engine choices are the framework's; version pins are the app's.** The framework ships compatibility ranges; apps pin exact versions."
		},
		{
			"heading": "boundary-rules",
			"content": "**Extension over replacement.** Want a different validator? Standard Schema abstracts it. Want a different HTTP foundation? That's a full stack change, not a per-app choice."
		},
		{
			"heading": "boundary-rules",
			"content": "**The framework has veto power on conventions.** Loaders fetch via the typed RPC client, not raw fetch — enforced by lint."
		},
		{
			"heading": "versioning--support",
			"content": "Packages follow semantic versioning independently."
		},
		{
			"heading": "versioning--support",
			"content": "A compatibility matrix (peer ranges) documents which internal engine versions each release supports."
		},
		{
			"heading": "versioning--support",
			"content": "Security fixes prioritize `@kwiva/core`, `@kwiva/http`, and `@kwiva/cli`."
		},
		{
			"heading": "versioning--support",
			"content": "Deprecations follow a two-major-version window, with codemod-powered upgrades via `kwiva upgrade`."
		},
		{
			"heading": "what-to-read-next",
			"content": "Architecture Overview — The layered model"
		},
		{
			"heading": "what-to-read-next",
			"content": "Design Principles — Why these boundaries exist"
		},
		{
			"heading": "what-to-read-next",
			"content": "Modules & Plugins — How packages compose into an app"
		},
		{
			"heading": "what-to-read-next",
			"content": "Advanced: Package Boundaries — Internal deep dive"
		}
	],
	"headings": [
		{
			"id": "the-packages",
			"content": "The Packages"
		},
		{
			"id": "dependency-graph",
			"content": "Dependency Graph"
		},
		{
			"id": "ownership-map",
			"content": "Ownership Map"
		},
		{
			"id": "boundary-rules",
			"content": "Boundary Rules"
		},
		{
			"id": "versioning--support",
			"content": "Versioning & Support"
		},
		{
			"id": "what-to-read-next",
			"content": "What to Read Next"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#the-packages",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Packages" })
	},
	{
		depth: 2,
		url: "#dependency-graph",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Dependency Graph" })
	},
	{
		depth: 2,
		url: "#ownership-map",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Ownership Map" })
	},
	{
		depth: 2,
		url: "#boundary-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Boundary Rules" })
	},
	{
		depth: 2,
		url: "#versioning--support",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Versioning & Support" })
	},
	{
		depth: 2,
		url: "#what-to-read-next",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What to Read Next" })
	}
];
function _createMdxContent(props) {
	const _components = {
		a: "a",
		code: "code",
		h2: "h2",
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva ships as many equal, focused packages under the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
			" scope. Each owns one concern, versions independently, and imports only what it needs. The boundaries between packages — and between the framework, its engines, and the application — are what keep the system coherent."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-packages",
			children: "The Packages"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Package" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Owns" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"App kernel (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
				"), context, DI, errors, policies"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/config" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Configuration system, config folder, typed env" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/schema" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Field DSL, model IR, validation" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Models, query builder, transactions, relations" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controllers, middleware, lifecycle, guards, routes, WS" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/router" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Owned typed file-based router core" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pages, SSR, providers, data hooks" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Typed RPC SDK" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/services" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Service container" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/queue" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Jobs, workers, retries, backoff" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/events" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Events, listeners, broadcasting" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authentication, sessions, providers" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/studio" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generated operations UI" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/mcp" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP server and tools" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/ui-kit" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "UI components" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/cli" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva" }),
				" binary"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/testing" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Test harness and fixtures" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "dependency-graph",
			children: "Dependency Graph"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The graph is strict and acyclic — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "core" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schema" }),
			" are leaves (nothing depends on them depending outward), nothing imports the CLI, and app-facing packages never re-export engine APIs:"
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
			title: "dependency-graph.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "cli ──► http · react · data · auth · studio · toolchain integration" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "studio ──► react · ui-kit · data" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "react ──► router · client · data-cache engine (sealed)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "client ──► core (types only)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "http  ──► core · schema · data (server engine, sealed)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "data  ──► core · schema (SQL engine, sealed)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "auth  ──► core · http (auth engine, sealed)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "queue ──► core · events" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "events ──► core · data" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "services ──► core" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "config ──► core" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "schema ──► (nothing — leaf)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "core  ──► (nothing — leaf)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Why this matters: because packages depend in one direction, the framework can version each concern independently, test packages in isolation, and seal engines without creating cycles." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "ownership-map",
			children: "Ownership Map"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Capability" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Owner" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Notes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scaffold / project boot" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/cli" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Own scaffolder, formatted output" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dev server, HMR, build, check, test" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/cli" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rust-speed toolchain integrated" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server portability (presets, storage, tasks)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "internal engine" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Configured by the framework" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "HTTP pipeline, controllers, validation" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Owned" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "REST conventions, OpenAPI" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "From route/model IR" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Typed RPC client" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "From the same IR" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Data schema (source of truth)" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/schema" }),
					" + ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" })
				] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"App writes ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
					" files"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Migrations, seeders, factories" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model diff → SQL" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Studio (ops UI)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/studio" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generated, policy-aware" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "AuthN (sessions, providers)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Wired into HTTP + SSR" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authorization (RBAC/policies)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Conventions + model enforcement" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tenancy" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }),
					"/",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" })
				] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }), " + context scoping"] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "UI routing" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/router" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Owned" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR orchestration" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Owns hydration/dehydration/streaming" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Client data cache" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "internal engine" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Surfaced via data hooks only" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Prerender/ISR/SWR" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "internal engine" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route rules" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Queue/jobs, events, tasks" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/queue" }),
					" + ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/events" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Owned" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Security headers/CSP, rate limiting" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "framework defaults" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Config-driven" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "boundary-rules",
			children: "Boundary Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "The framework doesn't duplicate engine capability." }), " If an internal engine already provides something (storage, caching, websockets), the framework configures and documents it rather than re-implementing it."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Application code doesn't re-architect framework layers." }),
				" Applications write ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" files; they don't build their own request pipeline, router, or query cache."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Engine choices are the framework's; version pins are the app's." }), " The framework ships compatibility ranges; apps pin exact versions."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Extension over replacement." }), " Want a different validator? Standard Schema abstracts it. Want a different HTTP foundation? That's a full stack change, not a per-app choice."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "The framework has veto power on conventions." }), " Loaders fetch via the typed RPC client, not raw fetch — enforced by lint."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "versioning--support",
			children: "Versioning & Support"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Packages follow semantic versioning independently." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "A compatibility matrix (peer ranges) documents which internal engine versions each release supports." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Security fixes prioritize ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/cli" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Deprecations follow a two-major-version window, with codemod-powered upgrades via ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva upgrade" }),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-to-read-next",
			children: "What to Read Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture",
				children: "Architecture Overview"
			}), " — The layered model"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/design-principles",
				children: "Design Principles"
			}), " — Why these boundaries exist"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins",
				children: "Modules & Plugins"
			}), " — How packages compose into an app"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/package-boundaries",
				children: "Advanced: Package Boundaries"
			}), " — Internal deep dive"] }),
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
