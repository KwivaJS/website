import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/advanced/package-boundaries.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Package Boundaries",
	"description": "The strict acyclic dependency graph among @kwiva/* packages, what each package owns, engine sealing, and where application code can and cannot import."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nPackage boundaries are Kwiva's contract for organizing code: what each package owns, what it may depend on, and — just as important — what it may never import. These boundaries are enforced by the built-in linter, which means they hold in CI, not just on paper.\n\n## The Principle [#the-principle]\n\nDependency direction is always downward through the layers: application depends on the framework, the framework depends on sealed internal engines and the Rust-speed toolchain, and nothing depends upward. Two concrete rules follow:\n\n1. **App code imports only the framework** — `@kwiva/*` packages, plus the application's own modules and ordinary dependencies that are not internal engines.\n2. **No framework package re-exports an engine API** — engine capabilities reach the application only through the `@kwiva/*` surface.\n\nRule two is the more subtle half. An engine that stays importable from outside is not sealed; sealing is only real when the public entry points of `@kwiva/*` are the sole way to reach engine behavior. That is why the boundaries are enforced at the package level rather than left as a documentation convention.\n\n## Monorepo Layout [#monorepo-layout]\n\nKwiva is a monorepo of many equal packages, each versioned independently so a concern can change and release on its own schedule:\n\n```plaintext title=\"monorepo-layout.txt\"\nkwiva/\n  packages/\n    core/      @kwiva/core\n    config/    @kwiva/config\n    schema/    @kwiva/schema\n    data/      @kwiva/data\n    http/      @kwiva/http\n    router/    @kwiva/router\n    react/     @kwiva/react\n    client/    @kwiva/client\n    queue/     @kwiva/queue\n    events/    @kwiva/events\n    auth/      @kwiva/auth\n    studio/    @kwiva/studio\n    mcp/       @kwiva/mcp\n    testing/   @kwiva/testing\n  example/     the dogfood application\n  test/        functionality · types · node · edge smoke tests\n  build.ts     package build orchestration\n```\n\nEach package ships independent semantic versions with a documented compatibility contract for the internal engines. Package builds are produced by the Rust-speed bundler pipeline plus fast declaration emission — type declarations without a separate typecheck pass. `example/` is the dogfood application: the acceptance bar every phase of the roadmap is measured against, and the live proof that the package boundaries work in a real app.\n\n## The Dependency Graph [#the-dependency-graph]\n\nThe package graph is strict and acyclic:\n\n```plaintext title=\"the-dependency-graph.txt\"\nstudio ──► react · data\nreact  ──► router · client · client-cache engine (sealed)\nclient ──► core (types only)\nhttp   ──► core · schema · data · server carrier engine (sealed)\ndata   ──► core · schema · sql engine (sealed)\nauth   ──► core · http · auth engine (sealed)\nqueue  ──► core · events\nevents ──► core · data\nconfig ──► core\nschema ──► (nothing — leaf)\ncore   ──► (nothing — leaf)\n```\n\nRules that keep this graph healthy:\n\n* `core` and `schema` are leaves — they depend on nothing.\n* No package depends on the CLI tooling; the toolchain consumes the framework, never the reverse.\n* Application-facing packages never re-export engine APIs, which is what keeps engines sealed at the boundary.\n* The services container used by application code depends only on `core`, keeping business-logic definitions squarely on the framework surface.\n\nTwo more pieces complete the picture. The **CLI tooling** produces the `kwiva` binary and is the sole consumer of the Rust-speed build pipeline; it is used by you on the command line, never imported by application code. The **component kit** used by Studio sits alongside the react packages and stays out of the application-facing dependency path.\n\n## What Each Package Owns [#what-each-package-owns]\n\n| Package          | Owns                                                                                             |\n| ---------------- | ------------------------------------------------------------------------------------------------ |\n| `@kwiva/core`    | The application kernel, context, dependency injection, config access, errors, policies           |\n| `@kwiva/config`  | The config-folder loader, typed environment binding, precedence rules                            |\n| `@kwiva/schema`  | The field DSL and the model IR — the leaf that everything else reads from                        |\n| `@kwiva/data`    | Models, the query builder, transactions, relations, factories, migrations                        |\n| `@kwiva/http`    | Controllers, middleware, server routes, the request lifecycle, guards, macros, WebSockets, tasks |\n| `@kwiva/router`  | The file-based router core, loaders, and typed navigation                                        |\n| `@kwiva/react`   | Pages, the SSR renderer, providers, navigation primitives, and data hooks                        |\n| `@kwiva/client`  | The generated typed RPC SDK, derived from controller and model IR                                |\n| `@kwiva/queue`   | Jobs, workers, retries, backoff, and the dead-letter queue                                       |\n| `@kwiva/events`  | Event definitions, listeners, and outbox delivery                                                |\n| `@kwiva/auth`    | Authentication definitions, sessions, OAuth, and passkeys                                        |\n| `@kwiva/studio`  | The generated operations interface, derived from the model IR                                    |\n| `@kwiva/mcp`     | The MCP server and tools, derived from the IR                                                    |\n| `@kwiva/testing` | The app test harness, fixtures, and fakes                                                        |\n\nThe ownership table is also a fault-localization map: a bug in query-generation semantics belongs to `@kwiva/data`, a bug in lifecycle ordering belongs to `@kwiva/http`, and a bug in the derived client types belongs to `@kwiva/client`. When something misbehaves, the owning package is where the fix and the test live.\n\n## Engine Sealing [#engine-sealing]\n\nThe internal engines — the server carrier, the SQL engine, the auth engine, and the client-cache engine — are configured by the framework and never imported by application code. Sealing gives Kwiva the freedom to upgrade an engine underneath you without changing your source, and it prevents the all-too-common pattern where \"one small config thing\" in an engine leaks into dozens of files.\n\nThe seal is enforced by the built-in linter. `kwiva check` runs the convention gates:\n\n* `no-engine-imports` — flags any direct engine import in application code\n* `no-raw-fetch-in-loaders` — keeps page loaders on the typed client\n* `no-secrets-in-client` — keeps signed secrets out of client bundles\n* `defineX-file-conventions` — one factory per file type, in the right directory\n* `lowercase-paths` — the lowercase filesystem enforced mechanically\n\n### What is sealable [#what-is-sealable]\n\nAnything the framework configures is sealable: deploy presets, storage mounts, route rules, task execution, WebSockets, the SQL dialect translation, sessions, OAuth, and the client query cache. What is *not* sealable is the public surface itself — `defineX` factories, config modules, and the documented framework API are the contract application code compiles against, and they change through deprecation and codemods, never behind the application's back.\n\n## Where Application Code Can and Cannot Import [#where-application-code-can-and-cannot-import]\n\nApplication code may import:\n\n* Any `@kwiva/*` package, from the framework surface\n* The application's own modules and services\n* Ordinary dependencies that are not internal engines\n\nApplication code may **not** import:\n\n* Any sealed internal engine, by name or by path — flagged by `no-engine-imports`\n* Framework internals beneath the public entry points of a package\n\nIf you find yourself reaching for an engine import to accomplish something, the framework surface almost always has the intended entry point — a `defineX` option, a config module, or a built-in middleware. That is the design: every app-facing capability is reachable through the framework API.\n\nTwo practical heuristics for staying inside the boundaries:\n\n1. **Search the framework surface first.** Before importing anything, ask which `defineX` factory, config module, or middleware should own the capability you need. The answer is almost always \"one exists.\"\n2. **If a configuration option is missing, treat it as a feature request, not a workaround.** An \"escape hatch\" import today becomes a maintenance tax across every engine upgrade tomorrow — the sealed boundary is exactly what protects you from paying it.\n\n## What's Next [#whats-next]\n\n* [Architecture Internals](/docs/advanced/architecture-internals) — The layered model these boundaries enforce\n* [The defineX Convention](/docs/core-concepts/definex) — The factory surface you import from `@kwiva/*`\n* [Auto-Discovery](/docs/core-concepts/auto-discovery) — How the framework finds files by convention, not registration\n* [Security in Production](/docs/security/production) — Hardening guidance built on the same boundaries\n* [Project Structure](/docs/getting-started/project-structure) — Where each kind of file lives in your application\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Package boundaries are Kwiva's contract for organizing code: what each package owns, what it may depend on, and — just as important — what it may never import. These boundaries are enforced by the built-in linter, which means they hold in CI, not just on paper."
		},
		{
			"heading": "the-principle",
			"content": "Dependency direction is always downward through the layers: application depends on the framework, the framework depends on sealed internal engines and the Rust-speed toolchain, and nothing depends upward. Two concrete rules follow:"
		},
		{
			"heading": "the-principle",
			"content": "**App code imports only the framework** — `@kwiva/*` packages, plus the application's own modules and ordinary dependencies that are not internal engines."
		},
		{
			"heading": "the-principle",
			"content": "**No framework package re-exports an engine API** — engine capabilities reach the application only through the `@kwiva/*` surface."
		},
		{
			"heading": "the-principle",
			"content": "Rule two is the more subtle half. An engine that stays importable from outside is not sealed; sealing is only real when the public entry points of `@kwiva/*` are the sole way to reach engine behavior. That is why the boundaries are enforced at the package level rather than left as a documentation convention."
		},
		{
			"heading": "monorepo-layout",
			"content": "Kwiva is a monorepo of many equal packages, each versioned independently so a concern can change and release on its own schedule:"
		},
		{
			"heading": "monorepo-layout",
			"content": "Each package ships independent semantic versions with a documented compatibility contract for the internal engines. Package builds are produced by the Rust-speed bundler pipeline plus fast declaration emission — type declarations without a separate typecheck pass. `example/` is the dogfood application: the acceptance bar every phase of the roadmap is measured against, and the live proof that the package boundaries work in a real app."
		},
		{
			"heading": "the-dependency-graph",
			"content": "The package graph is strict and acyclic:"
		},
		{
			"heading": "the-dependency-graph",
			"content": "Rules that keep this graph healthy:"
		},
		{
			"heading": "the-dependency-graph",
			"content": "`core` and `schema` are leaves — they depend on nothing."
		},
		{
			"heading": "the-dependency-graph",
			"content": "No package depends on the CLI tooling; the toolchain consumes the framework, never the reverse."
		},
		{
			"heading": "the-dependency-graph",
			"content": "Application-facing packages never re-export engine APIs, which is what keeps engines sealed at the boundary."
		},
		{
			"heading": "the-dependency-graph",
			"content": "The services container used by application code depends only on `core`, keeping business-logic definitions squarely on the framework surface."
		},
		{
			"heading": "the-dependency-graph",
			"content": "Two more pieces complete the picture. The **CLI tooling** produces the `kwiva` binary and is the sole consumer of the Rust-speed build pipeline; it is used by you on the command line, never imported by application code. The **component kit** used by Studio sits alongside the react packages and stays out of the application-facing dependency path."
		},
		{
			"heading": "what-each-package-owns",
			"content": "Package"
		},
		{
			"heading": "what-each-package-owns",
			"content": "Owns"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "The application kernel, context, dependency injection, config access, errors, policies"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/config`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "The config-folder loader, typed environment binding, precedence rules"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/schema`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "The field DSL and the model IR — the leaf that everything else reads from"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/data`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "Models, the query builder, transactions, relations, factories, migrations"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "Controllers, middleware, server routes, the request lifecycle, guards, macros, WebSockets, tasks"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/router`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "The file-based router core, loaders, and typed navigation"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/react`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "Pages, the SSR renderer, providers, navigation primitives, and data hooks"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/client`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "The generated typed RPC SDK, derived from controller and model IR"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/queue`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "Jobs, workers, retries, backoff, and the dead-letter queue"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/events`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "Event definitions, listeners, and outbox delivery"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/auth`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "Authentication definitions, sessions, OAuth, and passkeys"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/studio`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "The generated operations interface, derived from the model IR"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/mcp`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "The MCP server and tools, derived from the IR"
		},
		{
			"heading": "what-each-package-owns",
			"content": "`@kwiva/testing`"
		},
		{
			"heading": "what-each-package-owns",
			"content": "The app test harness, fixtures, and fakes"
		},
		{
			"heading": "what-each-package-owns",
			"content": "The ownership table is also a fault-localization map: a bug in query-generation semantics belongs to `@kwiva/data`, a bug in lifecycle ordering belongs to `@kwiva/http`, and a bug in the derived client types belongs to `@kwiva/client`. When something misbehaves, the owning package is where the fix and the test live."
		},
		{
			"heading": "engine-sealing",
			"content": "The internal engines — the server carrier, the SQL engine, the auth engine, and the client-cache engine — are configured by the framework and never imported by application code. Sealing gives Kwiva the freedom to upgrade an engine underneath you without changing your source, and it prevents the all-too-common pattern where \"one small config thing\" in an engine leaks into dozens of files."
		},
		{
			"heading": "engine-sealing",
			"content": "The seal is enforced by the built-in linter. `kwiva check` runs the convention gates:"
		},
		{
			"heading": "engine-sealing",
			"content": "`no-engine-imports` — flags any direct engine import in application code"
		},
		{
			"heading": "engine-sealing",
			"content": "`no-raw-fetch-in-loaders` — keeps page loaders on the typed client"
		},
		{
			"heading": "engine-sealing",
			"content": "`no-secrets-in-client` — keeps signed secrets out of client bundles"
		},
		{
			"heading": "engine-sealing",
			"content": "`defineX-file-conventions` — one factory per file type, in the right directory"
		},
		{
			"heading": "engine-sealing",
			"content": "`lowercase-paths` — the lowercase filesystem enforced mechanically"
		},
		{
			"heading": "what-is-sealable",
			"content": "Anything the framework configures is sealable: deploy presets, storage mounts, route rules, task execution, WebSockets, the SQL dialect translation, sessions, OAuth, and the client query cache. What is *not* sealable is the public surface itself — `defineX` factories, config modules, and the documented framework API are the contract application code compiles against, and they change through deprecation and codemods, never behind the application's back."
		},
		{
			"heading": "where-application-code-can-and-cannot-import",
			"content": "Application code may import:"
		},
		{
			"heading": "where-application-code-can-and-cannot-import",
			"content": "Any `@kwiva/*` package, from the framework surface"
		},
		{
			"heading": "where-application-code-can-and-cannot-import",
			"content": "The application's own modules and services"
		},
		{
			"heading": "where-application-code-can-and-cannot-import",
			"content": "Ordinary dependencies that are not internal engines"
		},
		{
			"heading": "where-application-code-can-and-cannot-import",
			"content": "Application code may **not** import:"
		},
		{
			"heading": "where-application-code-can-and-cannot-import",
			"content": "Any sealed internal engine, by name or by path — flagged by `no-engine-imports`"
		},
		{
			"heading": "where-application-code-can-and-cannot-import",
			"content": "Framework internals beneath the public entry points of a package"
		},
		{
			"heading": "where-application-code-can-and-cannot-import",
			"content": "If you find yourself reaching for an engine import to accomplish something, the framework surface almost always has the intended entry point — a `defineX` option, a config module, or a built-in middleware. That is the design: every app-facing capability is reachable through the framework API."
		},
		{
			"heading": "where-application-code-can-and-cannot-import",
			"content": "Two practical heuristics for staying inside the boundaries:"
		},
		{
			"heading": "where-application-code-can-and-cannot-import",
			"content": "**Search the framework surface first.** Before importing anything, ask which `defineX` factory, config module, or middleware should own the capability you need. The answer is almost always \"one exists.\""
		},
		{
			"heading": "where-application-code-can-and-cannot-import",
			"content": "**If a configuration option is missing, treat it as a feature request, not a workaround.** An \"escape hatch\" import today becomes a maintenance tax across every engine upgrade tomorrow — the sealed boundary is exactly what protects you from paying it."
		},
		{
			"heading": "whats-next",
			"content": "Architecture Internals — The layered model these boundaries enforce"
		},
		{
			"heading": "whats-next",
			"content": "The defineX Convention — The factory surface you import from `@kwiva/*`"
		},
		{
			"heading": "whats-next",
			"content": "Auto-Discovery — How the framework finds files by convention, not registration"
		},
		{
			"heading": "whats-next",
			"content": "Security in Production — Hardening guidance built on the same boundaries"
		},
		{
			"heading": "whats-next",
			"content": "Project Structure — Where each kind of file lives in your application"
		}
	],
	"headings": [
		{
			"id": "the-principle",
			"content": "The Principle"
		},
		{
			"id": "monorepo-layout",
			"content": "Monorepo Layout"
		},
		{
			"id": "the-dependency-graph",
			"content": "The Dependency Graph"
		},
		{
			"id": "what-each-package-owns",
			"content": "What Each Package Owns"
		},
		{
			"id": "engine-sealing",
			"content": "Engine Sealing"
		},
		{
			"id": "what-is-sealable",
			"content": "What is sealable"
		},
		{
			"id": "where-application-code-can-and-cannot-import",
			"content": "Where Application Code Can and Cannot Import"
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
		url: "#the-principle",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Principle" })
	},
	{
		depth: 2,
		url: "#monorepo-layout",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Monorepo Layout" })
	},
	{
		depth: 2,
		url: "#the-dependency-graph",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Dependency Graph" })
	},
	{
		depth: 2,
		url: "#what-each-package-owns",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Each Package Owns" })
	},
	{
		depth: 2,
		url: "#engine-sealing",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Engine Sealing" })
	},
	{
		depth: 3,
		url: "#what-is-sealable",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What is sealable" })
	},
	{
		depth: 2,
		url: "#where-application-code-can-and-cannot-import",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where Application Code Can and Cannot Import" })
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
		em: "em",
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Package boundaries are Kwiva's contract for organizing code: what each package owns, what it may depend on, and — just as important — what it may never import. These boundaries are enforced by the built-in linter, which means they hold in CI, not just on paper." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-principle",
			children: "The Principle"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Dependency direction is always downward through the layers: application depends on the framework, the framework depends on sealed internal engines and the Rust-speed toolchain, and nothing depends upward. Two concrete rules follow:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "App code imports only the framework" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" packages, plus the application's own modules and ordinary dependencies that are not internal engines."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No framework package re-exports an engine API" }),
				" — engine capabilities reach the application only through the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" surface."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Rule two is the more subtle half. An engine that stays importable from outside is not sealed; sealing is only real when the public entry points of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
			" are the sole way to reach engine behavior. That is why the boundaries are enforced at the package level rather than left as a documentation convention."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "monorepo-layout",
			children: "Monorepo Layout"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva is a monorepo of many equal packages, each versioned independently so a concern can change and release on its own schedule:" }),
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
			title: "monorepo-layout.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "kwiva/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  packages/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    core/      @kwiva/core" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    config/    @kwiva/config" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    schema/    @kwiva/schema" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    data/      @kwiva/data" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    http/      @kwiva/http" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    router/    @kwiva/router" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    react/     @kwiva/react" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    client/    @kwiva/client" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    queue/     @kwiva/queue" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    events/    @kwiva/events" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    auth/      @kwiva/auth" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    studio/    @kwiva/studio" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    mcp/       @kwiva/mcp" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    testing/   @kwiva/testing" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  example/     the dogfood application" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  test/        functionality · types · node · edge smoke tests" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  build.ts     package build orchestration" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each package ships independent semantic versions with a documented compatibility contract for the internal engines. Package builds are produced by the Rust-speed bundler pipeline plus fast declaration emission — type declarations without a separate typecheck pass. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "example/" }),
			" is the dogfood application: the acceptance bar every phase of the roadmap is measured against, and the live proof that the package boundaries work in a real app."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-dependency-graph",
			children: "The Dependency Graph"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The package graph is strict and acyclic:" }),
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
			title: "the-dependency-graph.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "studio ──► react · data" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "react  ──► router · client · client-cache engine (sealed)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "client ──► core (types only)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "http   ──► core · schema · data · server carrier engine (sealed)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "data   ──► core · schema · sql engine (sealed)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "auth   ──► core · http · auth engine (sealed)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "queue  ──► core · events" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "events ──► core · data" })
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
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "core   ──► (nothing — leaf)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Rules that keep this graph healthy:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "core" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schema" }),
				" are leaves — they depend on nothing."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "No package depends on the CLI tooling; the toolchain consumes the framework, never the reverse." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Application-facing packages never re-export engine APIs, which is what keeps engines sealed at the boundary." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The services container used by application code depends only on ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "core" }),
				", keeping business-logic definitions squarely on the framework surface."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Two more pieces complete the picture. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "CLI tooling" }),
			" produces the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva" }),
			" binary and is the sole consumer of the Rust-speed build pipeline; it is used by you on the command line, never imported by application code. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "component kit" }),
			" used by Studio sits alongside the react packages and stays out of the application-facing dependency path."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-each-package-owns",
			children: "What Each Package Owns"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Package" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Owns" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The application kernel, context, dependency injection, config access, errors, policies" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/config" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The config-folder loader, typed environment binding, precedence rules" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/schema" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The field DSL and the model IR — the leaf that everything else reads from" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Models, the query builder, transactions, relations, factories, migrations" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controllers, middleware, server routes, the request lifecycle, guards, macros, WebSockets, tasks" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/router" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The file-based router core, loaders, and typed navigation" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pages, the SSR renderer, providers, navigation primitives, and data hooks" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The generated typed RPC SDK, derived from controller and model IR" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/queue" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Jobs, workers, retries, backoff, and the dead-letter queue" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/events" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Event definitions, listeners, and outbox delivery" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authentication definitions, sessions, OAuth, and passkeys" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/studio" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The generated operations interface, derived from the model IR" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/mcp" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The MCP server and tools, derived from the IR" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/testing" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The app test harness, fixtures, and fakes" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ownership table is also a fault-localization map: a bug in query-generation semantics belongs to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }),
			", a bug in lifecycle ordering belongs to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
			", and a bug in the derived client types belongs to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }),
			". When something misbehaves, the owning package is where the fix and the test live."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "engine-sealing",
			children: "Engine Sealing"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The internal engines — the server carrier, the SQL engine, the auth engine, and the client-cache engine — are configured by the framework and never imported by application code. Sealing gives Kwiva the freedom to upgrade an engine underneath you without changing your source, and it prevents the all-too-common pattern where \"one small config thing\" in an engine leaks into dozens of files." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The seal is enforced by the built-in linter. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
			" runs the convention gates:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-engine-imports" }), " — flags any direct engine import in application code"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-raw-fetch-in-loaders" }), " — keeps page loaders on the typed client"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-secrets-in-client" }), " — keeps signed secrets out of client bundles"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX-file-conventions" }), " — one factory per file type, in the right directory"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "lowercase-paths" }), " — the lowercase filesystem enforced mechanically"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "what-is-sealable",
			children: "What is sealable"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Anything the framework configures is sealable: deploy presets, storage mounts, route rules, task execution, WebSockets, the SQL dialect translation, sessions, OAuth, and the client query cache. What is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "not" }),
			" sealable is the public surface itself — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factories, config modules, and the documented framework API are the contract application code compiles against, and they change through deprecation and codemods, never behind the application's back."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-application-code-can-and-cannot-import",
			children: "Where Application Code Can and Cannot Import"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Application code may import:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Any ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" package, from the framework surface"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The application's own modules and services" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Ordinary dependencies that are not internal engines" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Application code may ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "not" }),
			" import:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: ["Any sealed internal engine, by name or by path — flagged by ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-engine-imports" })] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Framework internals beneath the public entry points of a package" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"If you find yourself reaching for an engine import to accomplish something, the framework surface almost always has the intended entry point — a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" option, a config module, or a built-in middleware. That is the design: every app-facing capability is reachable through the framework API."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two practical heuristics for staying inside the boundaries:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Search the framework surface first." }),
				" Before importing anything, ask which ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" factory, config module, or middleware should own the capability you need. The answer is almost always \"one exists.\""
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "If a configuration option is missing, treat it as a feature request, not a workaround." }), " An \"escape hatch\" import today becomes a maintenance tax across every engine upgrade tomorrow — the sealed boundary is exactly what protects you from paying it."] }),
			"\n"
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
			}), " — The layered model these boundaries enforce"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/definex",
					children: "The defineX Convention"
				}),
				" — The factory surface you import from ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/auto-discovery",
				children: "Auto-Discovery"
			}), " — How the framework finds files by convention, not registration"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/production",
				children: "Security in Production"
			}), " — Hardening guidance built on the same boundaries"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/project-structure",
				children: "Project Structure"
			}), " — Where each kind of file lives in your application"] }),
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
