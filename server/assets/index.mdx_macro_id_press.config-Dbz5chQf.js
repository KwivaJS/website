import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/core-concepts/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Core Concepts",
	"description": "The foundational ideas behind Kwiva — the defineX convention, one config source, file-based discovery, a single type universe, and the two lifecycles every app runs."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nEvery Kwiva application is built from a small set of ideas that repeat everywhere: one authoring grammar (`defineX`), one place for configuration, one discovery mechanism, and one type system that flows from source to client with zero code generation. This section explains those ideas so the rest of the documentation reads like details of a single system rather than a list of unrelated APIs.\n\nIf you have not created a project yet, start with [Getting Started](/docs/getting-started), which walks through a real application. This section assumes you have scaffolding up and want to understand how it fits together.\n\n## The Mental Model [#the-mental-model]\n\nKwiva is organized as a stack of four layers. Application code lives at the top, framework APIs in the middle, and everything below is owned by the framework, not by you:\n\n```plaintext title=\"the-mental-model.txt\"\nApplication (src/)\n    ↓  authoring via defineX files\nFramework APIs (@kwiva/* packages)\n    ↓  owned pipeline, typed edges\nInternal engines (hidden, framework-owned)\n    ↓  deployment presets\nRuntime (Bun, Node, Edge)\n```\n\nDevelopers interact almost exclusively with the framework layer — the `@kwiva/*` packages. Below it sit the **hidden engine layer**: sealed dependencies the framework configures and adapts for serving, storage, caching, sessions, and client state. Convention enforces the boundary: application code never imports an engine directly, and a lint gate rejects engine imports before they land in your codebase. This is what lets framework upgrades absorb engine changes on your behalf.\n\n## The Concepts at a Glance [#the-concepts-at-a-glance]\n\n| Concept                                               | What it answers                                               |\n| ----------------------------------------------------- | ------------------------------------------------------------- |\n| [The defineX Convention](/docs/core-concepts/definex) | Why every construct is written the same way                   |\n| [Applications](/docs/core-concepts/applications)      | How `defineApp` composes everything into a running app        |\n| [Configuration](/docs/core-concepts/configuration)    | Where every knob lives and what wins when values conflict     |\n| [Auto-Discovery](/docs/core-concepts/auto-discovery)  | How files in the standard tree become registered capabilities |\n| [Lifecycle](/docs/core-concepts/lifecycle)            | Boot order and the request pipeline from entry to response    |\n| [Context](/docs/core-concepts/context)                | The typed object every handler receives                       |\n| [Services](/docs/core-concepts/services)              | Reusable business logic with typed composition                |\n| [Modules](/docs/core-concepts/modules)                | Self-contained feature packages                               |\n| [Plugins](/docs/core-concepts/plugins)                | Framework-behavior extension                                  |\n| [Error Handling](/docs/core-concepts/error-handling)  | The shared taxonomy every error maps into                     |\n| [Type Inference](/docs/core-concepts/type-inference)  | How types flow end to end without codegen                     |\n\n## How the Pieces Fit Together [#how-the-pieces-fit-together]\n\nFour flows run through every application, and each maps to a set of core-concepts pages.\n\n### Configuration flows down [#configuration-flows-down]\n\nEverything configurable — the app name, middleware stack, database connection, rate limits, tenant mode — is declared in one place under `src/config/`, typed through `defineConfig` modules, and surfaced through a typed `config()` reader. An entry file, `kwiva.config.ts`, points at the config folder and carries build and deploy options. Precedence is fixed: defaults, then config-folder values, then inline `defineX` options, then environment overrides. See [Configuration](/docs/core-concepts/configuration).\n\n### Capabilities flow in by convention [#capabilities-flow-in-by-convention]\n\nModels, controllers, middleware, jobs, events, and pages are plain files in standard directories. At boot the framework scans those directories and registers whatever it finds — adding a model is creating a file, not editing a registry. The [defineX convention](/docs/core-concepts/definex) keeps every one of those files in the same shape, and [auto-discovery](/docs/core-concepts/auto-discovery) is the wiring that turns files into running capabilities. [Applications](/docs/core-concepts/applications) shows how the kernel assembles the result.\n\n### Requests flow through one pipeline [#requests-flow-through-one-pipeline]\n\nAt runtime, every request — API call, rendered page, WebSocket upgrade — traverses a single ordered pipeline: entry hooks, routing, context assembly, validation, guards, handler, response hooks. Everything you can hook is a named lifecycle event (`onRequest`, `onTransform`, `onBeforeHandle`, `onAfterHandle`, `onResponse`). The [lifecycle](/docs/core-concepts/lifecycle) page covers boot order too, and [context](/docs/core-concepts/context) explains the object passed through it.\n\n### Types flow out with zero codegen [#types-flow-out-with-zero-codegen]\n\nBecause definitions are plain typed functions, the framework can derive everything else: model definitions become a route manifest, the manifest becomes REST endpoints, a typed client, OpenAPI documents, Studio screens, and MCP tools. The client that calls your API from a page loader is typechecked against the same definitions that produced the endpoints. See [type inference](/docs/core-concepts/type-inference).\n\n## The Standard Tree [#the-standard-tree]\n\nThe conventions in this section map to a fixed directory layout. Knowing the tree is the fastest way to predict what a file does:\n\n```plaintext title=\"the-standard-tree.txt\"\nkwiva.config.ts            # entry: config folder + build/deploy/modules\nsrc/\n├─ bootstrap/app.ts        # defineApp — the kernel\n├─ config/                 # defineConfig modules, one per domain\n├─ app/\n│  ├─ models/              # defineModel\n│  ├─ http/\n│  │  ├─ auth.ts           # defineAuth\n│  │  ├─ controllers/      # defineController\n│  │  └─ middleware/       # defineMiddleware\n│  ├─ services/            # defineService\n│  ├─ jobs/                # defineJob\n│  ├─ events/              # defineEvent\n│  ├─ tasks/               # defineTask\n│  ├─ policies/            # definePolicy\n│  ├─ console/             # defineCommand\n│  ├─ mcp/                 # defineMcpTool\n│  └─ studio/              # defineStudioScreen\n├─ routes/                 # defineServerRoute\n├─ ui/pages/               # definePage\n└─ database/               # migrations, seeders, factories\n```\n\nPlacement is declaration: a file's directory is what registers it, which is why [auto-discovery](/docs/core-concepts/auto-discovery) needs no configuration. The full layout is documented in [Project Structure](/docs/getting-started/project-structure).\n\n## Design Pillars [#design-pillars]\n\nThese are the decisions that hold the section together:\n\n1. **Convention over configuration** — the framework assumes the standard tree and standard names; you opt out per construct, not globally.\n2. **Everything is a file** — a new resource is a model file, a new endpoint is a controller file, a new capability is a module.\n3. **One config source** — all knobs resolve through the config folder; there is no second, ad-hoc way to configure.\n4. **Zero codegen types** — type derivation happens at the type level, so there is nothing to regenerate or commit.\n5. **Sealed engines** — the framework owns internals; you never import them, and they never leak into your typing.\n6. **Extensible by design** — modules compose features declaratively, plugins change framework behavior programmatically.\n\n> \\[!NOTE]\n> Terminology: throughout this section \"the framework\" means the `@kwiva/*` packages you import. \"The engine layer\" or \"hidden engine\" refers to sealed internals the framework manages for you — you will never import them directly.\n\n## What's Next [#whats-next]\n\n1. [The defineX Convention](/docs/core-concepts/definex) — start here; every other concept builds on it\n2. [Applications](/docs/core-concepts/applications) — see the kernel that assembles your app\n3. [Configuration](/docs/core-concepts/configuration) — the typed config folder and precedence rules\n4. [Auto-Discovery](/docs/core-concepts/auto-discovery) — how files become capabilities\n5. [Getting Started](/docs/getting-started) — a guided path through a real project\n6. [Architecture](/architecture) — deeper framework design and the derivation pipeline\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Every Kwiva application is built from a small set of ideas that repeat everywhere: one authoring grammar (`defineX`), one place for configuration, one discovery mechanism, and one type system that flows from source to client with zero code generation. This section explains those ideas so the rest of the documentation reads like details of a single system rather than a list of unrelated APIs."
		},
		{
			"heading": void 0,
			"content": "If you have not created a project yet, start with Getting Started, which walks through a real application. This section assumes you have scaffolding up and want to understand how it fits together."
		},
		{
			"heading": "the-mental-model",
			"content": "Kwiva is organized as a stack of four layers. Application code lives at the top, framework APIs in the middle, and everything below is owned by the framework, not by you:"
		},
		{
			"heading": "the-mental-model",
			"content": "Developers interact almost exclusively with the framework layer — the `@kwiva/*` packages. Below it sit the **hidden engine layer**: sealed dependencies the framework configures and adapts for serving, storage, caching, sessions, and client state. Convention enforces the boundary: application code never imports an engine directly, and a lint gate rejects engine imports before they land in your codebase. This is what lets framework upgrades absorb engine changes on your behalf."
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Concept"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "What it answers"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "The defineX Convention"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Why every construct is written the same way"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Applications"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "How `defineApp` composes everything into a running app"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Configuration"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Where every knob lives and what wins when values conflict"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Auto-Discovery"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "How files in the standard tree become registered capabilities"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Lifecycle"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Boot order and the request pipeline from entry to response"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Context"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "The typed object every handler receives"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Services"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Reusable business logic with typed composition"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Modules"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Self-contained feature packages"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Plugins"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Framework-behavior extension"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Error Handling"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "The shared taxonomy every error maps into"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "Type Inference"
		},
		{
			"heading": "the-concepts-at-a-glance",
			"content": "How types flow end to end without codegen"
		},
		{
			"heading": "how-the-pieces-fit-together",
			"content": "Four flows run through every application, and each maps to a set of core-concepts pages."
		},
		{
			"heading": "configuration-flows-down",
			"content": "Everything configurable — the app name, middleware stack, database connection, rate limits, tenant mode — is declared in one place under `src/config/`, typed through `defineConfig` modules, and surfaced through a typed `config()` reader. An entry file, `kwiva.config.ts`, points at the config folder and carries build and deploy options. Precedence is fixed: defaults, then config-folder values, then inline `defineX` options, then environment overrides. See Configuration."
		},
		{
			"heading": "capabilities-flow-in-by-convention",
			"content": "Models, controllers, middleware, jobs, events, and pages are plain files in standard directories. At boot the framework scans those directories and registers whatever it finds — adding a model is creating a file, not editing a registry. The defineX convention keeps every one of those files in the same shape, and auto-discovery is the wiring that turns files into running capabilities. Applications shows how the kernel assembles the result."
		},
		{
			"heading": "requests-flow-through-one-pipeline",
			"content": "At runtime, every request — API call, rendered page, WebSocket upgrade — traverses a single ordered pipeline: entry hooks, routing, context assembly, validation, guards, handler, response hooks. Everything you can hook is a named lifecycle event (`onRequest`, `onTransform`, `onBeforeHandle`, `onAfterHandle`, `onResponse`). The lifecycle page covers boot order too, and context explains the object passed through it."
		},
		{
			"heading": "types-flow-out-with-zero-codegen",
			"content": "Because definitions are plain typed functions, the framework can derive everything else: model definitions become a route manifest, the manifest becomes REST endpoints, a typed client, OpenAPI documents, Studio screens, and MCP tools. The client that calls your API from a page loader is typechecked against the same definitions that produced the endpoints. See type inference."
		},
		{
			"heading": "the-standard-tree",
			"content": "The conventions in this section map to a fixed directory layout. Knowing the tree is the fastest way to predict what a file does:"
		},
		{
			"heading": "the-standard-tree",
			"content": "Placement is declaration: a file's directory is what registers it, which is why auto-discovery needs no configuration. The full layout is documented in Project Structure."
		},
		{
			"heading": "design-pillars",
			"content": "These are the decisions that hold the section together:"
		},
		{
			"heading": "design-pillars",
			"content": "**Convention over configuration** — the framework assumes the standard tree and standard names; you opt out per construct, not globally."
		},
		{
			"heading": "design-pillars",
			"content": "**Everything is a file** — a new resource is a model file, a new endpoint is a controller file, a new capability is a module."
		},
		{
			"heading": "design-pillars",
			"content": "**One config source** — all knobs resolve through the config folder; there is no second, ad-hoc way to configure."
		},
		{
			"heading": "design-pillars",
			"content": "**Zero codegen types** — type derivation happens at the type level, so there is nothing to regenerate or commit."
		},
		{
			"heading": "design-pillars",
			"content": "**Sealed engines** — the framework owns internals; you never import them, and they never leak into your typing."
		},
		{
			"heading": "design-pillars",
			"content": "**Extensible by design** — modules compose features declaratively, plugins change framework behavior programmatically."
		},
		{
			"heading": "design-pillars",
			"content": "> \\[!NOTE]\n> Terminology: throughout this section \"the framework\" means the `@kwiva/*` packages you import. \"The engine layer\" or \"hidden engine\" refers to sealed internals the framework manages for you — you will never import them directly."
		},
		{
			"heading": "whats-next",
			"content": "The defineX Convention — start here; every other concept builds on it"
		},
		{
			"heading": "whats-next",
			"content": "Applications — see the kernel that assembles your app"
		},
		{
			"heading": "whats-next",
			"content": "Configuration — the typed config folder and precedence rules"
		},
		{
			"heading": "whats-next",
			"content": "Auto-Discovery — how files become capabilities"
		},
		{
			"heading": "whats-next",
			"content": "Getting Started — a guided path through a real project"
		},
		{
			"heading": "whats-next",
			"content": "Architecture — deeper framework design and the derivation pipeline"
		}
	],
	"headings": [
		{
			"id": "the-mental-model",
			"content": "The Mental Model"
		},
		{
			"id": "the-concepts-at-a-glance",
			"content": "The Concepts at a Glance"
		},
		{
			"id": "how-the-pieces-fit-together",
			"content": "How the Pieces Fit Together"
		},
		{
			"id": "configuration-flows-down",
			"content": "Configuration flows down"
		},
		{
			"id": "capabilities-flow-in-by-convention",
			"content": "Capabilities flow in by convention"
		},
		{
			"id": "requests-flow-through-one-pipeline",
			"content": "Requests flow through one pipeline"
		},
		{
			"id": "types-flow-out-with-zero-codegen",
			"content": "Types flow out with zero codegen"
		},
		{
			"id": "the-standard-tree",
			"content": "The Standard Tree"
		},
		{
			"id": "design-pillars",
			"content": "Design Pillars"
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
		url: "#the-mental-model",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Mental Model" })
	},
	{
		depth: 2,
		url: "#the-concepts-at-a-glance",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Concepts at a Glance" })
	},
	{
		depth: 2,
		url: "#how-the-pieces-fit-together",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How the Pieces Fit Together" })
	},
	{
		depth: 3,
		url: "#configuration-flows-down",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Configuration flows down" })
	},
	{
		depth: 3,
		url: "#capabilities-flow-in-by-convention",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Capabilities flow in by convention" })
	},
	{
		depth: 3,
		url: "#requests-flow-through-one-pipeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Requests flow through one pipeline" })
	},
	{
		depth: 3,
		url: "#types-flow-out-with-zero-codegen",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Types flow out with zero codegen" })
	},
	{
		depth: 2,
		url: "#the-standard-tree",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Standard Tree" })
	},
	{
		depth: 2,
		url: "#design-pillars",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Design Pillars" })
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
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every Kwiva application is built from a small set of ideas that repeat everywhere: one authoring grammar (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			"), one place for configuration, one discovery mechanism, and one type system that flows from source to client with zero code generation. This section explains those ideas so the rest of the documentation reads like details of a single system rather than a list of unrelated APIs."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"If you have not created a project yet, start with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started",
				children: "Getting Started"
			}),
			", which walks through a real application. This section assumes you have scaffolding up and want to understand how it fits together."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-mental-model",
			children: "The Mental Model"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva is organized as a stack of four layers. Application code lives at the top, framework APIs in the middle, and everything below is owned by the framework, not by you:" }),
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
			title: "the-mental-model.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Application (src/)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    ↓  authoring via defineX files" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Framework APIs (@kwiva/* packages)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    ↓  owned pipeline, typed edges" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Internal engines (hidden, framework-owned)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    ↓  deployment presets" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Runtime (Bun, Node, Edge)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Developers interact almost exclusively with the framework layer — the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
			" packages. Below it sit the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "hidden engine layer" }),
			": sealed dependencies the framework configures and adapts for serving, storage, caching, sessions, and client state. Convention enforces the boundary: application code never imports an engine directly, and a lint gate rejects engine imports before they land in your codebase. This is what lets framework upgrades absorb engine changes on your behalf."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-concepts-at-a-glance",
			children: "The Concepts at a Glance"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Concept" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it answers" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Why every construct is written the same way" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"How ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
				" composes everything into a running app"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/configuration",
				children: "Configuration"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Where every knob lives and what wins when values conflict" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/auto-discovery",
				children: "Auto-Discovery"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "How files in the standard tree become registered capabilities" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/lifecycle",
				children: "Lifecycle"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Boot order and the request pipeline from entry to response" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/context",
				children: "Context"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The typed object every handler receives" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/services",
				children: "Services"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Reusable business logic with typed composition" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/modules",
				children: "Modules"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Self-contained feature packages" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/plugins",
				children: "Plugins"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Framework-behavior extension" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/error-handling",
				children: "Error Handling"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The shared taxonomy every error maps into" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/type-inference",
				children: "Type Inference"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "How types flow end to end without codegen" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-the-pieces-fit-together",
			children: "How the Pieces Fit Together"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Four flows run through every application, and each maps to a set of core-concepts pages." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "configuration-flows-down",
			children: "Configuration flows down"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Everything configurable — the app name, middleware stack, database connection, rate limits, tenant mode — is declared in one place under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/" }),
			", typed through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
			" modules, and surfaced through a typed ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config()" }),
			" reader. An entry file, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
			", points at the config folder and carries build and deploy options. Precedence is fixed: defaults, then config-folder values, then inline ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" options, then environment overrides. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/configuration",
				children: "Configuration"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "capabilities-flow-in-by-convention",
			children: "Capabilities flow in by convention"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Models, controllers, middleware, jobs, events, and pages are plain files in standard directories. At boot the framework scans those directories and registers whatever it finds — adding a model is creating a file, not editing a registry. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "defineX convention"
			}),
			" keeps every one of those files in the same shape, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/auto-discovery",
				children: "auto-discovery"
			}),
			" is the wiring that turns files into running capabilities. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}),
			" shows how the kernel assembles the result."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "requests-flow-through-one-pipeline",
			children: "Requests flow through one pipeline"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"At runtime, every request — API call, rendered page, WebSocket upgrade — traverses a single ordered pipeline: entry hooks, routing, context assembly, validation, guards, handler, response hooks. Everything you can hook is a named lifecycle event (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onRequest" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onTransform" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onBeforeHandle" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onAfterHandle" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onResponse" }),
			"). The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/lifecycle",
				children: "lifecycle"
			}),
			" page covers boot order too, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/context",
				children: "context"
			}),
			" explains the object passed through it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "types-flow-out-with-zero-codegen",
			children: "Types flow out with zero codegen"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because definitions are plain typed functions, the framework can derive everything else: model definitions become a route manifest, the manifest becomes REST endpoints, a typed client, OpenAPI documents, Studio screens, and MCP tools. The client that calls your API from a page loader is typechecked against the same definitions that produced the endpoints. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/type-inference",
				children: "type inference"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-standard-tree",
			children: "The Standard Tree"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The conventions in this section map to a fixed directory layout. Knowing the tree is the fastest way to predict what a file does:" }),
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
			title: "the-standard-tree.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "kwiva.config.ts            # entry: config folder + build/deploy/modules" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ bootstrap/app.ts        # defineApp — the kernel" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ config/                 # defineConfig modules, one per domain" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ app/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ models/              # defineModel" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ http/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  │  ├─ auth.ts           # defineAuth" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  │  ├─ controllers/      # defineController" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  │  └─ middleware/       # defineMiddleware" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ services/            # defineService" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ jobs/                # defineJob" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ events/              # defineEvent" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ tasks/               # defineTask" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ policies/            # definePolicy" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ console/             # defineCommand" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ mcp/                 # defineMcpTool" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  └─ studio/              # defineStudioScreen" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ routes/                 # defineServerRoute" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ ui/pages/               # definePage" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "└─ database/               # migrations, seeders, factories" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Placement is declaration: a file's directory is what registers it, which is why ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/auto-discovery",
				children: "auto-discovery"
			}),
			" needs no configuration. The full layout is documented in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/project-structure",
				children: "Project Structure"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "design-pillars",
			children: "Design Pillars"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "These are the decisions that hold the section together:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Convention over configuration" }), " — the framework assumes the standard tree and standard names; you opt out per construct, not globally."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Everything is a file" }), " — a new resource is a model file, a new endpoint is a controller file, a new capability is a module."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "One config source" }), " — all knobs resolve through the config folder; there is no second, ad-hoc way to configure."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Zero codegen types" }), " — type derivation happens at the type level, so there is nothing to regenerate or commit."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Sealed engines" }), " — the framework owns internals; you never import them, and they never leak into your typing."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Extensible by design" }), " — modules compose features declaratively, plugins change framework behavior programmatically."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nTerminology: throughout this section \"the framework\" means the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" packages you import. \"The engine layer\" or \"hidden engine\" refers to sealed internals the framework manages for you — you will never import them directly."
			] }),
			"\n"
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
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}), " — start here; every other concept builds on it"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}), " — see the kernel that assembles your app"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/configuration",
				children: "Configuration"
			}), " — the typed config folder and precedence rules"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/auto-discovery",
				children: "Auto-Discovery"
			}), " — how files become capabilities"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started",
				children: "Getting Started"
			}), " — a guided path through a real project"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture",
				children: "Architecture"
			}), " — deeper framework design and the derivation pipeline"] }),
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
