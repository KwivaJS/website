import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/advanced/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Advanced",
	"description": "Architecture internals, the request lifecycle, the model IR, package boundaries, and performance — what happens under the hood of a Kwiva application."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nThis section takes you beneath the `defineX` surface. The rest of the documentation tells you how to write models, controllers, and pages; this section explains how those declarations become a running, deployable application. If you are building on Kwiva at scale, contributing to the framework, or debugging a subtle production issue, start here.\n\nThe throughline of every page in this section is the core architectural rule: the application depends only on the framework, the framework depends on sealed internal engines and a Rust-speed toolchain, and application code never imports an engine by name. Building everything on top of one convention — and one intermediate representation — is what makes Kwiva's guarantees possible: no drift between types, API, and database; a single mental model for every construct; and deployable, observable output from one codebase.\n\n## What \"Advanced\" Covers [#what-advanced-covers]\n\n| Page                                                            | What it explains                                                                                                                      |\n| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |\n| [Architecture Internals](/docs/advanced/architecture-internals) | Layering — application, `@kwiva/*` framework APIs, sealed internal engines, toolchain, runtime — and how each layer stays in its lane |\n| [Request Lifecycle](/docs/advanced/request-lifecycle)           | The exact ordered sequence a request travels, from pipeline entry to the final response, and every place you can hook into it         |\n| [Model IR](/docs/advanced/model-ir)                             | The single intermediate representation derived from `defineModel` and the \"no drift\" guarantee it gives your whole stack              |\n| [Package Boundaries](/docs/advanced/package-boundaries)         | The dependency graph among `@kwiva/*` packages, what each one owns, and where application code may and may not import                 |\n| [Performance](/docs/advanced/performance)                       | The Rust-speed static machinery, the native TypeScript runtime, streaming-first SSR, and layered caching                              |\n\n## The Mental Model [#the-mental-model]\n\nEvery Kwiva application — and the framework itself — is organized in four layers:\n\n```plaintext title=\"the-mental-model.txt\"\nApplication (src/)\n  ↓\nFramework APIs (@kwiva/*)\n  ↓\nInternal engines (hidden, framework-owned)\n  ↓\nRuntime (Bun, Node, Edge)\n```\n\nYou write application code against the framework APIs only. The framework wires the internal engines and the toolchain. The runtime executes the result, with deploy differences contained in the engine layer so the application sees the same API surface everywhere.\n\nDeriving from this is the second mental model: everything your app ships is produced from shared intermediate representations. Models are the single source of truth; the model IR feeds the database, the REST API, the typed RPC client, Studio, the OpenAPI spec, and MCP tools. There is never a second source of truth to drift against — just one IR and the artifacts it compiles to.\n\nThese two mental models make the entire section predictable:\n\n1. **Layering** — every construct has exactly one home (in the app, in a framework package, or behind a sealed engine), and every dependency arrow points one way.\n2. **Single intermediate representation** — the model IR and the route manifest are the only inputs the derived outputs are allowed to read.\n\n## How These Pages Fit Together [#how-these-pages-fit-together]\n\n| Page                   | Question it answers                                         | Foundation it draws on                                              |\n| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |\n| Architecture Internals | Where does my code live, and who is allowed to touch what?  | Layering, sealed engines, auto-discovery, module boundaries         |\n| Request Lifecycle      | What happens, in order, when a request arrives?             | The 14-step sequence, hook scoping, context assembly, error mapping |\n| Model IR               | How does one model definition become the whole stack?       | The derivation pipeline from `defineModel` to every output          |\n| Package Boundaries     | Which package may depend on which, and why does it matter?  | The strict, acyclic package graph and the engine-sealing rule       |\n| Performance            | Why is Kwiva fast, and how do I keep it fast in production? | The toolchain, native runtime, streaming SSR, and caching layers    |\n\n## The Core Architectural Rule in Practice [#the-core-architectural-rule-in-practice]\n\nThe rule restated for the debugging scenarios this section serves:\n\n* **A type error across model and client?** It cannot drift — both compile from the same IR. Look at the derivation pipeline, not for a phantom second schema.\n* **A slow request?** The pipeline is a span tree with budgeted stages (`under 1 ms` adapter, `under 2 ms` session, `under 0.5 ms` validation, `under 5 ms` handler, `under 15 ms` full API, `under 50 ms` SSR shell). Trace it, then look at the layer the span points at.\n* **Who is allowed to import what?** The package graph is acyclic and lint-enforced; the answer to \"may I import this?\" is always derivable from the layered diagram.\n\n## Key Terms in One Place [#key-terms-in-one-place]\n\nThe advanced pages use a small vocabulary precisely. A quick reference before you dive in:\n\n| Term             | Meaning                                                                                                                                                                  |\n| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |\n| `defineX`        | The convention of one factory per file type — `defineModel`, `defineController`, `definePage`, and so on. Every app-facing construct is one of these.                    |\n| Model IR         | The typed intermediate representation derived from `defineModel` files, written to `src/.kwiva/model-ir.json`.                                                           |\n| Route manifest   | The route IR derived from controllers, generated model routes, and server routes — the input to the client, OpenAPI, and MCP outputs.                                    |\n| Sealed engine    | Internal infrastructure the framework configures and owns: the server carrier, the SQL engine, the auth engine, and the client-cache engine. Never imported by app code. |\n| Adapter / preset | The build-time packaging of `.output/` for a target — Node, Bun, serverless, edge, static, or binary.                                                                    |\n| Toolchain        | The Rust-speed development and build machinery bound into the `kwiva` CLI: bundler, transformer, resolver, minifier, linter, formatter, declarations.                    |\n| `.kwiva/`        | The generated directory — IR artifacts and types. A build product; never hand-edited.                                                                                    |\n\nEvery page in this section explains one of these terms in depth and shows how it connects to the others. The model IR is the connective tissue: it is what turns `defineModel` into the database, the API, the client, Studio, OpenAPI, and MCP with one derivation pass.\n\n## When to Read This Section [#when-to-read-this-section]\n\nA quick orienting note: if you have not yet created a project, read [Getting Started](/docs/getting-started) first, and skim [Core Concepts](/docs/core-concepts) for the `defineX` convention and auto-discovery. The Advanced section assumes you already understand those. If you are reading this to debug a specific production symptom, jump straight to [Request Lifecycle](/docs/advanced/request-lifecycle) or [Performance](/docs/advanced/performance); both pages include the concrete budgets and checklists you will need.\n\n## What's Next [#whats-next]\n\n* [Architecture Internals](/docs/advanced/architecture-internals) — Start with the layered model and the sealed-engine rule\n* [Package Boundaries](/docs/advanced/package-boundaries) — Understand the dependency graph before you add a dependency\n* [Request Lifecycle](/docs/advanced/request-lifecycle) — Trace a single request through the whole stack\n* [Model IR](/docs/advanced/model-ir) — See how one definition becomes the entire data plane\n* [Core Concepts](/docs/core-concepts) — Revisit the `defineX` convention that makes all of this consistent\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "This section takes you beneath the `defineX` surface. The rest of the documentation tells you how to write models, controllers, and pages; this section explains how those declarations become a running, deployable application. If you are building on Kwiva at scale, contributing to the framework, or debugging a subtle production issue, start here."
		},
		{
			"heading": void 0,
			"content": "The throughline of every page in this section is the core architectural rule: the application depends only on the framework, the framework depends on sealed internal engines and a Rust-speed toolchain, and application code never imports an engine by name. Building everything on top of one convention — and one intermediate representation — is what makes Kwiva's guarantees possible: no drift between types, API, and database; a single mental model for every construct; and deployable, observable output from one codebase."
		},
		{
			"heading": "what-advanced-covers",
			"content": "Page"
		},
		{
			"heading": "what-advanced-covers",
			"content": "What it explains"
		},
		{
			"heading": "what-advanced-covers",
			"content": "Architecture Internals"
		},
		{
			"heading": "what-advanced-covers",
			"content": "Layering — application, `@kwiva/*` framework APIs, sealed internal engines, toolchain, runtime — and how each layer stays in its lane"
		},
		{
			"heading": "what-advanced-covers",
			"content": "Request Lifecycle"
		},
		{
			"heading": "what-advanced-covers",
			"content": "The exact ordered sequence a request travels, from pipeline entry to the final response, and every place you can hook into it"
		},
		{
			"heading": "what-advanced-covers",
			"content": "Model IR"
		},
		{
			"heading": "what-advanced-covers",
			"content": "The single intermediate representation derived from `defineModel` and the \"no drift\" guarantee it gives your whole stack"
		},
		{
			"heading": "what-advanced-covers",
			"content": "Package Boundaries"
		},
		{
			"heading": "what-advanced-covers",
			"content": "The dependency graph among `@kwiva/*` packages, what each one owns, and where application code may and may not import"
		},
		{
			"heading": "what-advanced-covers",
			"content": "Performance"
		},
		{
			"heading": "what-advanced-covers",
			"content": "The Rust-speed static machinery, the native TypeScript runtime, streaming-first SSR, and layered caching"
		},
		{
			"heading": "the-mental-model",
			"content": "Every Kwiva application — and the framework itself — is organized in four layers:"
		},
		{
			"heading": "the-mental-model",
			"content": "You write application code against the framework APIs only. The framework wires the internal engines and the toolchain. The runtime executes the result, with deploy differences contained in the engine layer so the application sees the same API surface everywhere."
		},
		{
			"heading": "the-mental-model",
			"content": "Deriving from this is the second mental model: everything your app ships is produced from shared intermediate representations. Models are the single source of truth; the model IR feeds the database, the REST API, the typed RPC client, Studio, the OpenAPI spec, and MCP tools. There is never a second source of truth to drift against — just one IR and the artifacts it compiles to."
		},
		{
			"heading": "the-mental-model",
			"content": "These two mental models make the entire section predictable:"
		},
		{
			"heading": "the-mental-model",
			"content": "**Layering** — every construct has exactly one home (in the app, in a framework package, or behind a sealed engine), and every dependency arrow points one way."
		},
		{
			"heading": "the-mental-model",
			"content": "**Single intermediate representation** — the model IR and the route manifest are the only inputs the derived outputs are allowed to read."
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "Page"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "Question it answers"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "Foundation it draws on"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "Architecture Internals"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "Where does my code live, and who is allowed to touch what?"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "Layering, sealed engines, auto-discovery, module boundaries"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "Request Lifecycle"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "What happens, in order, when a request arrives?"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "The 14-step sequence, hook scoping, context assembly, error mapping"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "Model IR"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "How does one model definition become the whole stack?"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "The derivation pipeline from `defineModel` to every output"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "Package Boundaries"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "Which package may depend on which, and why does it matter?"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "The strict, acyclic package graph and the engine-sealing rule"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "Performance"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "Why is Kwiva fast, and how do I keep it fast in production?"
		},
		{
			"heading": "how-these-pages-fit-together",
			"content": "The toolchain, native runtime, streaming SSR, and caching layers"
		},
		{
			"heading": "the-core-architectural-rule-in-practice",
			"content": "The rule restated for the debugging scenarios this section serves:"
		},
		{
			"heading": "the-core-architectural-rule-in-practice",
			"content": "**A type error across model and client?** It cannot drift — both compile from the same IR. Look at the derivation pipeline, not for a phantom second schema."
		},
		{
			"heading": "the-core-architectural-rule-in-practice",
			"content": "**A slow request?** The pipeline is a span tree with budgeted stages (`under 1 ms` adapter, `under 2 ms` session, `under 0.5 ms` validation, `under 5 ms` handler, `under 15 ms` full API, `under 50 ms` SSR shell). Trace it, then look at the layer the span points at."
		},
		{
			"heading": "the-core-architectural-rule-in-practice",
			"content": "**Who is allowed to import what?** The package graph is acyclic and lint-enforced; the answer to \"may I import this?\" is always derivable from the layered diagram."
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "The advanced pages use a small vocabulary precisely. A quick reference before you dive in:"
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "Term"
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "Meaning"
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "`defineX`"
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "The convention of one factory per file type — `defineModel`, `defineController`, `definePage`, and so on. Every app-facing construct is one of these."
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "Model IR"
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "The typed intermediate representation derived from `defineModel` files, written to `src/.kwiva/model-ir.json`."
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "Route manifest"
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "The route IR derived from controllers, generated model routes, and server routes — the input to the client, OpenAPI, and MCP outputs."
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "Sealed engine"
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "Internal infrastructure the framework configures and owns: the server carrier, the SQL engine, the auth engine, and the client-cache engine. Never imported by app code."
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "Adapter / preset"
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "The build-time packaging of `.output/` for a target — Node, Bun, serverless, edge, static, or binary."
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "Toolchain"
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "The Rust-speed development and build machinery bound into the `kwiva` CLI: bundler, transformer, resolver, minifier, linter, formatter, declarations."
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "`.kwiva/`"
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "The generated directory — IR artifacts and types. A build product; never hand-edited."
		},
		{
			"heading": "key-terms-in-one-place",
			"content": "Every page in this section explains one of these terms in depth and shows how it connects to the others. The model IR is the connective tissue: it is what turns `defineModel` into the database, the API, the client, Studio, OpenAPI, and MCP with one derivation pass."
		},
		{
			"heading": "when-to-read-this-section",
			"content": "A quick orienting note: if you have not yet created a project, read Getting Started first, and skim Core Concepts for the `defineX` convention and auto-discovery. The Advanced section assumes you already understand those. If you are reading this to debug a specific production symptom, jump straight to Request Lifecycle or Performance; both pages include the concrete budgets and checklists you will need."
		},
		{
			"heading": "whats-next",
			"content": "Architecture Internals — Start with the layered model and the sealed-engine rule"
		},
		{
			"heading": "whats-next",
			"content": "Package Boundaries — Understand the dependency graph before you add a dependency"
		},
		{
			"heading": "whats-next",
			"content": "Request Lifecycle — Trace a single request through the whole stack"
		},
		{
			"heading": "whats-next",
			"content": "Model IR — See how one definition becomes the entire data plane"
		},
		{
			"heading": "whats-next",
			"content": "Core Concepts — Revisit the `defineX` convention that makes all of this consistent"
		}
	],
	"headings": [
		{
			"id": "what-advanced-covers",
			"content": "What \"Advanced\" Covers"
		},
		{
			"id": "the-mental-model",
			"content": "The Mental Model"
		},
		{
			"id": "how-these-pages-fit-together",
			"content": "How These Pages Fit Together"
		},
		{
			"id": "the-core-architectural-rule-in-practice",
			"content": "The Core Architectural Rule in Practice"
		},
		{
			"id": "key-terms-in-one-place",
			"content": "Key Terms in One Place"
		},
		{
			"id": "when-to-read-this-section",
			"content": "When to Read This Section"
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
		url: "#what-advanced-covers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What \"Advanced\" Covers" })
	},
	{
		depth: 2,
		url: "#the-mental-model",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Mental Model" })
	},
	{
		depth: 2,
		url: "#how-these-pages-fit-together",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How These Pages Fit Together" })
	},
	{
		depth: 2,
		url: "#the-core-architectural-rule-in-practice",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Core Architectural Rule in Practice" })
	},
	{
		depth: 2,
		url: "#key-terms-in-one-place",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Key Terms in One Place" })
	},
	{
		depth: 2,
		url: "#when-to-read-this-section",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When to Read This Section" })
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
			"This section takes you beneath the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" surface. The rest of the documentation tells you how to write models, controllers, and pages; this section explains how those declarations become a running, deployable application. If you are building on Kwiva at scale, contributing to the framework, or debugging a subtle production issue, start here."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The throughline of every page in this section is the core architectural rule: the application depends only on the framework, the framework depends on sealed internal engines and a Rust-speed toolchain, and application code never imports an engine by name. Building everything on top of one convention — and one intermediate representation — is what makes Kwiva's guarantees possible: no drift between types, API, and database; a single mental model for every construct; and deployable, observable output from one codebase." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-advanced-covers",
			children: "What \"Advanced\" Covers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Page" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it explains" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/architecture-internals",
				children: "Architecture Internals"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Layering — application, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" framework APIs, sealed internal engines, toolchain, runtime — and how each layer stays in its lane"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/request-lifecycle",
				children: "Request Lifecycle"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The exact ordered sequence a request travels, from pipeline entry to the final response, and every place you can hook into it" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/model-ir",
				children: "Model IR"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The single intermediate representation derived from ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				" and the \"no drift\" guarantee it gives your whole stack"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/package-boundaries",
				children: "Package Boundaries"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The dependency graph among ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" packages, what each one owns, and where application code may and may not import"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/performance",
				children: "Performance"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The Rust-speed static machinery, the native TypeScript runtime, streaming-first SSR, and layered caching" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-mental-model",
			children: "The Mental Model"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every Kwiva application — and the framework itself — is organized in four layers:" }),
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
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ↓" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Framework APIs (@kwiva/*)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ↓" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Internal engines (hidden, framework-owned)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ↓" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Runtime (Bun, Node, Edge)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "You write application code against the framework APIs only. The framework wires the internal engines and the toolchain. The runtime executes the result, with deploy differences contained in the engine layer so the application sees the same API surface everywhere." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Deriving from this is the second mental model: everything your app ships is produced from shared intermediate representations. Models are the single source of truth; the model IR feeds the database, the REST API, the typed RPC client, Studio, the OpenAPI spec, and MCP tools. There is never a second source of truth to drift against — just one IR and the artifacts it compiles to." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "These two mental models make the entire section predictable:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Layering" }), " — every construct has exactly one home (in the app, in a framework package, or behind a sealed engine), and every dependency arrow points one way."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Single intermediate representation" }), " — the model IR and the route manifest are the only inputs the derived outputs are allowed to read."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-these-pages-fit-together",
			children: "How These Pages Fit Together"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Page" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Question it answers" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Foundation it draws on" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Architecture Internals" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Where does my code live, and who is allowed to touch what?" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Layering, sealed engines, auto-discovery, module boundaries" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Request Lifecycle" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "What happens, in order, when a request arrives?" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The 14-step sequence, hook scoping, context assembly, error mapping" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model IR" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "How does one model definition become the whole stack?" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"The derivation pipeline from ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
					" to every output"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Package Boundaries" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Which package may depend on which, and why does it matter?" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The strict, acyclic package graph and the engine-sealing rule" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Performance" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Why is Kwiva fast, and how do I keep it fast in production?" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The toolchain, native runtime, streaming SSR, and caching layers" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-core-architectural-rule-in-practice",
			children: "The Core Architectural Rule in Practice"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The rule restated for the debugging scenarios this section serves:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "A type error across model and client?" }), " It cannot drift — both compile from the same IR. Look at the derivation pipeline, not for a phantom second schema."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "A slow request?" }),
				" The pipeline is a span tree with budgeted stages (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "under 1 ms" }),
				" adapter, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "under 2 ms" }),
				" session, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "under 0.5 ms" }),
				" validation, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "under 5 ms" }),
				" handler, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "under 15 ms" }),
				" full API, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "under 50 ms" }),
				" SSR shell). Trace it, then look at the layer the span points at."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Who is allowed to import what?" }), " The package graph is acyclic and lint-enforced; the answer to \"may I import this?\" is always derivable from the layered diagram."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "key-terms-in-one-place",
			children: "Key Terms in One Place"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The advanced pages use a small vocabulary precisely. A quick reference before you dive in:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Term" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The convention of one factory per file type — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
				", and so on. Every app-facing construct is one of these."
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model IR" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The typed intermediate representation derived from ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				" files, written to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/model-ir.json" }),
				"."
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route manifest" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The route IR derived from controllers, generated model routes, and server routes — the input to the client, OpenAPI, and MCP outputs." })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sealed engine" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Internal infrastructure the framework configures and owns: the server carrier, the SQL engine, the auth engine, and the client-cache engine. Never imported by app code." })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Adapter / preset" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The build-time packaging of ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
				" for a target — Node, Bun, serverless, edge, static, or binary."
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Toolchain" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The Rust-speed development and build machinery bound into the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva" }),
				" CLI: bundler, transformer, resolver, minifier, linter, formatter, declarations."
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".kwiva/" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The generated directory — IR artifacts and types. A build product; never hand-edited." })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every page in this section explains one of these terms in depth and shows how it connects to the others. The model IR is the connective tissue: it is what turns ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" into the database, the API, the client, Studio, OpenAPI, and MCP with one derivation pass."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-to-read-this-section",
			children: "When to Read This Section"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A quick orienting note: if you have not yet created a project, read ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started",
				children: "Getting Started"
			}),
			" first, and skim ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts",
				children: "Core Concepts"
			}),
			" for the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" convention and auto-discovery. The Advanced section assumes you already understand those. If you are reading this to debug a specific production symptom, jump straight to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/request-lifecycle",
				children: "Request Lifecycle"
			}),
			" or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/performance",
				children: "Performance"
			}),
			"; both pages include the concrete budgets and checklists you will need."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/architecture-internals",
				children: "Architecture Internals"
			}), " — Start with the layered model and the sealed-engine rule"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/package-boundaries",
				children: "Package Boundaries"
			}), " — Understand the dependency graph before you add a dependency"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/request-lifecycle",
				children: "Request Lifecycle"
			}), " — Trace a single request through the whole stack"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/model-ir",
				children: "Model IR"
			}), " — See how one definition becomes the entire data plane"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts",
					children: "Core Concepts"
				}),
				" — Revisit the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" convention that makes all of this consistent"
			] }),
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
