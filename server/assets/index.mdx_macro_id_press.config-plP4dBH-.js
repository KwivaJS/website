import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/architecture/index.mdx?macro_id=press.config.tsx%23architecture
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Architecture",
	"description": "Deep dive into Kwiva's architecture — layer design, framework-owned engines, request lifecycle, and model derivation."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nKwiva's architecture follows a strict layered design with clear ownership boundaries. Everything an\napplication touches is `@kwiva/*`; everything underneath is framework-owned.\n\n## Core Architectural Rule [#core-architectural-rule]\n\n> App code imports only `@kwiva/*`. Every app-facing construct follows the `defineX` convention. Engines are framework-owned implementation details.\n\n## Layers [#layers]\n\n```plaintext title=\"layers.txt\"\n┌──────────────────────────────────────────────────────────┐\n│  APP — imports only @kwiva/* · writes defineX(...) only  │\n├──────────────────────────────────────────────────────────┤\n│  FRAMEWORK API (@kwiva/*)                                │\n│  core · config · schema · data · http · router · react    │\n│  client · services · queue · events · auth · studio · mcp │\n├───────────────────────────────┬──────────────────────────┤\n│  INTERNAL ENGINES (hidden)   │  TOOLCHAIN (Rust-speed)   │\n│  http · data · auth · client │  compiler · bundler       │\n│  data plane                 │  linter · formatter        │\n├───────────────────────────────┴──────────────────────────┤\n│  RUNTIME: Bun (primary) · Node · Edge (via presets)       │\n└──────────────────────────────────────────────────────────┘\n```\n\n## Framework API Packages (17) [#framework-api-packages-17]\n\n| Package           | Purpose                                    |\n| ----------------- | ------------------------------------------ |\n| `@kwiva/core`     | App kernel, context, DI, errors, policies  |\n| `@kwiva/config`   | Configuration system                       |\n| `@kwiva/schema`   | Field DSL, model IR, validation            |\n| `@kwiva/data`     | Models, query builder, transactions        |\n| `@kwiva/http`     | Controllers, middleware, lifecycle, guards |\n| `@kwiva/router`   | File-based typed routing                   |\n| `@kwiva/react`    | Pages, SSR, data hooks                     |\n| `@kwiva/client`   | Typed RPC SDK                              |\n| `@kwiva/services` | Service container                          |\n| `@kwiva/queue`    | Jobs, workers, retries                     |\n| `@kwiva/events`   | Events, listeners, broadcasting            |\n| `@kwiva/auth`     | Authentication, sessions                   |\n| `@kwiva/studio`   | Generated admin UI                         |\n| `@kwiva/mcp`      | MCP tools from IR                          |\n| `@kwiva/ui-kit`   | UI components                              |\n| `@kwiva/cli`      | CLI binary                                 |\n| `@kwiva/testing`  | Test harness, fixtures                     |\n\n## Engine Boundaries [#engine-boundaries]\n\n### Internal engines (hidden, framework-owned) [#internal-engines-hidden-framework-owned]\n\nKwiva's engines are implementation details: sealed, versioned, and never imported by application\ncode. They exist so you get production-grade behavior without owning its complexity — and you can\nswitch internal implementation without touching your application.\n\n| Engine             | Role                                                  | Kwiva Surface                |\n| ------------------ | ----------------------------------------------------- | ---------------------------- |\n| HTTP engine        | Server carrier, presets, streaming, WebSockets        | `@kwiva/http`, `@kwiva/core` |\n| Data engine        | SQL persistence (SQLite dev / Postgres prod)          | `@kwiva/data`                |\n| Auth engine        | Authentication (sessions, OAuth, passkeys)            | `@kwiva/auth`                |\n| Client data engine | Client-side caching, invalidation, optimistic updates | `@kwiva/react` data hooks    |\n\n## Model-Derived Architecture [#model-derived-architecture]\n\nOne model definition drives the entire data plane:\n\n```plaintext title=\"model-derived-architecture.txt\"\ndefineModel → IR (intermediate representation)\n  ├─→ Database schema + migrations     (@kwiva/data)\n  ├─→ REST API (5 routes per model)    (@kwiva/http + @kwiva/data)\n  ├─→ Typed RPC client SDK             (@kwiva/client)\n  ├─→ Studio screens                   (@kwiva/studio)\n  ├─→ OpenAPI spec                     (@kwiva/http)\n  └─→ MCP tools                        (@kwiva/mcp)\n```\n\n## Request Flow [#request-flow]\n\n```plaintext title=\"request-flow.txt\"\nclient → runtime preset/adapter → @kwiva/http pipeline\n  ├─ page route  → @kwiva/router → @kwiva/react SSR\n  │                  (loaders → data hooks → React → stream HTML)\n  └─ api route   → defineController\n                    (validation → handler → JSON)\n                    └─ defineModel → data engine → Postgres/SQLite\n```\n\n## Further Reading [#further-reading]\n\n* [Design Principles](/architecture/design-principles) — The philosophy behind the architecture\n* [Request Lifecycle](/architecture/request-lifecycle) — Visual 14-step lifecycle\n* [Model Derivation](/architecture/model-derivation) — How one model becomes many artifacts\n* [Package Boundaries](/architecture/package-boundaries) — Dependency graph and framework-owned engines\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva's architecture follows a strict layered design with clear ownership boundaries. Everything an\napplication touches is `@kwiva/*`; everything underneath is framework-owned."
		},
		{
			"heading": "core-architectural-rule",
			"content": "> App code imports only `@kwiva/*`. Every app-facing construct follows the `defineX` convention. Engines are framework-owned implementation details."
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Package"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Purpose"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "App kernel, context, DI, errors, policies"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/config`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Configuration system"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/schema`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Field DSL, model IR, validation"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/data`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Models, query builder, transactions"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Controllers, middleware, lifecycle, guards"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/router`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "File-based typed routing"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/react`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Pages, SSR, data hooks"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/client`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Typed RPC SDK"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/services`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Service container"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/queue`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Jobs, workers, retries"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/events`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Events, listeners, broadcasting"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/auth`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Authentication, sessions"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/studio`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Generated admin UI"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/mcp`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "MCP tools from IR"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/ui-kit`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "UI components"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/cli`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "CLI binary"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "`@kwiva/testing`"
		},
		{
			"heading": "framework-api-packages-17",
			"content": "Test harness, fixtures"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "Kwiva's engines are implementation details: sealed, versioned, and never imported by application\ncode. They exist so you get production-grade behavior without owning its complexity — and you can\nswitch internal implementation without touching your application."
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "Engine"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "Role"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "Kwiva Surface"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "HTTP engine"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "Server carrier, presets, streaming, WebSockets"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "`@kwiva/http`, `@kwiva/core`"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "Data engine"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "SQL persistence (SQLite dev / Postgres prod)"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "`@kwiva/data`"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "Auth engine"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "Authentication (sessions, OAuth, passkeys)"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "`@kwiva/auth`"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "Client data engine"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "Client-side caching, invalidation, optimistic updates"
		},
		{
			"heading": "internal-engines-hidden-framework-owned",
			"content": "`@kwiva/react` data hooks"
		},
		{
			"heading": "model-derived-architecture",
			"content": "One model definition drives the entire data plane:"
		},
		{
			"heading": "further-reading",
			"content": "Design Principles — The philosophy behind the architecture"
		},
		{
			"heading": "further-reading",
			"content": "Request Lifecycle — Visual 14-step lifecycle"
		},
		{
			"heading": "further-reading",
			"content": "Model Derivation — How one model becomes many artifacts"
		},
		{
			"heading": "further-reading",
			"content": "Package Boundaries — Dependency graph and framework-owned engines"
		}
	],
	"headings": [
		{
			"id": "core-architectural-rule",
			"content": "Core Architectural Rule"
		},
		{
			"id": "layers",
			"content": "Layers"
		},
		{
			"id": "framework-api-packages-17",
			"content": "Framework API Packages (17)"
		},
		{
			"id": "engine-boundaries",
			"content": "Engine Boundaries"
		},
		{
			"id": "internal-engines-hidden-framework-owned",
			"content": "Internal engines (hidden, framework-owned)"
		},
		{
			"id": "model-derived-architecture",
			"content": "Model-Derived Architecture"
		},
		{
			"id": "request-flow",
			"content": "Request Flow"
		},
		{
			"id": "further-reading",
			"content": "Further Reading"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#core-architectural-rule",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Core Architectural Rule" })
	},
	{
		depth: 2,
		url: "#layers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layers" })
	},
	{
		depth: 2,
		url: "#framework-api-packages-17",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Framework API Packages (17)" })
	},
	{
		depth: 2,
		url: "#engine-boundaries",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Engine Boundaries" })
	},
	{
		depth: 3,
		url: "#internal-engines-hidden-framework-owned",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Internal engines (hidden, framework-owned)" })
	},
	{
		depth: 2,
		url: "#model-derived-architecture",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Model-Derived Architecture" })
	},
	{
		depth: 2,
		url: "#request-flow",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Request Flow" })
	},
	{
		depth: 2,
		url: "#further-reading",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Further Reading" })
	}
];
function _createMdxContent(props) {
	const _components = {
		a: "a",
		blockquote: "blockquote",
		code: "code",
		h2: "h2",
		h3: "h3",
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva's architecture follows a strict layered design with clear ownership boundaries. Everything an\napplication touches is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
			"; everything underneath is framework-owned."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "core-architectural-rule",
			children: "Core Architectural Rule"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"App code imports only ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				". Every app-facing construct follows the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" convention. Engines are framework-owned implementation details."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layers",
			children: "Layers"
		}),
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
			title: "layers.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "┌──────────────────────────────────────────────────────────┐" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  APP — imports only @kwiva/* · writes defineX(...) only  │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├──────────────────────────────────────────────────────────┤" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  FRAMEWORK API (@kwiva/*)                                │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  core · config · schema · data · http · router · react    │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  client · services · queue · events · auth · studio · mcp │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├───────────────────────────────┬──────────────────────────┤" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  INTERNAL ENGINES (hidden)   │  TOOLCHAIN (Rust-speed)   │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  http · data · auth · client │  compiler · bundler       │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  data plane                 │  linter · formatter        │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├───────────────────────────────┴──────────────────────────┤" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  RUNTIME: Bun (primary) · Node · Edge (via presets)       │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "└──────────────────────────────────────────────────────────┘" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "framework-api-packages-17",
			children: "Framework API Packages (17)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Package" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "App kernel, context, DI, errors, policies" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/config" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Configuration system" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/schema" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Field DSL, model IR, validation" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Models, query builder, transactions" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controllers, middleware, lifecycle, guards" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/router" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "File-based typed routing" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pages, SSR, data hooks" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Typed RPC SDK" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/services" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Service container" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/queue" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Jobs, workers, retries" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/events" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Events, listeners, broadcasting" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authentication, sessions" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/studio" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generated admin UI" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/mcp" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP tools from IR" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/ui-kit" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "UI components" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/cli" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "CLI binary" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/testing" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Test harness, fixtures" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "engine-boundaries",
			children: "Engine Boundaries"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "internal-engines-hidden-framework-owned",
			children: "Internal engines (hidden, framework-owned)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva's engines are implementation details: sealed, versioned, and never imported by application\ncode. They exist so you get production-grade behavior without owning its complexity — and you can\nswitch internal implementation without touching your application." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Engine" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Role" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Kwiva Surface" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "HTTP engine" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server carrier, presets, streaming, WebSockets" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Data engine" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SQL persistence (SQLite dev / Postgres prod)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Auth engine" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authentication (sessions, OAuth, passkeys)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Client data engine" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Client-side caching, invalidation, optimistic updates" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }), " data hooks"] })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "model-derived-architecture",
			children: "Model-Derived Architecture"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "One model definition drives the entire data plane:" }),
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
			title: "model-derived-architecture.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineModel → IR (intermediate representation)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─→ Database schema + migrations     (@kwiva/data)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─→ REST API (5 routes per model)    (@kwiva/http + @kwiva/data)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─→ Typed RPC client SDK             (@kwiva/client)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─→ Studio screens                   (@kwiva/studio)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─→ OpenAPI spec                     (@kwiva/http)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  └─→ MCP tools                        (@kwiva/mcp)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "request-flow",
			children: "Request Flow"
		}),
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
			title: "request-flow.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "client → runtime preset/adapter → @kwiva/http pipeline" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─ page route  → @kwiva/router → @kwiva/react SSR" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  │                  (loaders → data hooks → React → stream HTML)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  └─ api route   → defineController" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                    (validation → handler → JSON)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                    └─ defineModel → data engine → Postgres/SQLite" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "further-reading",
			children: "Further Reading"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/design-principles",
				children: "Design Principles"
			}), " — The philosophy behind the architecture"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/request-lifecycle",
				children: "Request Lifecycle"
			}), " — Visual 14-step lifecycle"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/model-derivation",
				children: "Model Derivation"
			}), " — How one model becomes many artifacts"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/package-boundaries",
				children: "Package Boundaries"
			}), " — Dependency graph and framework-owned engines"] }),
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
