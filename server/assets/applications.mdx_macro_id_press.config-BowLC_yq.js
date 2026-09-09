import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/core-concepts/applications.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Applications",
	"description": "defineApp is the application kernel — how config, models, HTTP, modules, and providers are composed into one runnable application."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\n## What is defineApp? [#what-is-defineapp]\n\n`defineApp` is the application kernel. It lives in `src/bootstrap/app.ts` and is the single place where the pieces of your application are wired together: configuration, models, controllers, middleware, pages, modules, providers, and per-request context behavior. It is also a `defineX` factory, so it follows the same grammar as everything else — plain options, no classes, types inferred automatically.\n\nThe kernel does the composition work that other frameworks scatter across service providers, route files, and DI registries: it merges module contributions, registers discovered constructs, assembles the middleware stack, boots providers, and starts the server.\n\n## The Bootstrap File [#the-bootstrap-file]\n\n```ts title=\"src/bootstrap/app.ts\"\n// src/bootstrap/app.ts\nimport { defineApp } from '@kwiva/core'\nimport auth from '../app/http/auth'\n\nexport const app = defineApp({\n  auth,\n\n  // discovered (scan-based; explicit override possible)\n  models, controllers, middleware, jobs, events, tasks, policies, pages,\n\n  // explicit composition — providers boot with the kernel\n  providers: [\n    telemetryProvider,           // observability init (from src/config/telemetry.ts)\n    queueProvider,               // queue transport (from src/config/queue.ts)\n    storageProvider,             // storage disks (from src/config/storage.ts)\n  ],\n\n  // app-level context\n  state: { startTime: Date.now() },\n  decorate: { /* singletons */ },\n  resolve: [ /* per-request derivations */ ],\n\n  // route-level reusable keys\n  macros: { auth, cache, rateLimit },\n})\n```\n\nMost of the fields are optional. The kernel picks up discovered constructs like models and controllers from the standard directories; `providers`, `state`, `decorate`, `resolve`, and `macros` are where you make explicit contributions. `middleware` may also be declared here as an explicit stack, though the canonical home is `src/config/app.ts > middleware[]`.\n\n## Boot Lifecycle [#boot-lifecycle]\n\nWhen the application starts, the kernel runs a fixed composition order:\n\n1. Config folder load and env validation — fail-fast on missing or invalid values\n2. Module contribution merge — models, config, and migrations from `defineModule` packages\n3. Model scan to IR — the model intermediate representation is built, with a migration drift check that warns in development\n4. Route registration — generated model routes, controllers, server routes, and module routes\n5. Middleware stack assembly — in the order declared in config\n6. Provider boot — telemetry, queue, storage, or any custom provider\n7. Engine init — storage mounts, cache, the task scheduler, and realtime channels\n8. Listen — the deployment preset adapter starts accepting requests\n\nShutdown inverts the sequence: providers stop, the queue drains, then the engine layer stops. Nothing below the framework layer is shut down from app code directly — the kernel owns the ordering.\n\nBoot failures are loud. Env validation and config merging happen first, so misconfiguration surfaces before the server starts, not on the first request.\n\n## Composition by Addition [#composition-by-addition]\n\nThe composition story is simple: capabilities are files in the standard tree. There is no \"register the router\" step and no \"add the cache plugin\" step — discovery plus configuration does it.\n\n| I want…                    | I add…                                              |\n| -------------------------- | --------------------------------------------------- |\n| a new resource             | `src/app/models/x.ts` plus an optional controller   |\n| authenticated pages        | `src/app/http/auth.ts` plus middleware in the stack |\n| background processing      | `src/app/jobs/x.ts` plus queue config               |\n| realtime                   | an event plus a channel policy                      |\n| Kwiva Studio               | `studio: { enabled: true }`                         |\n| agent access               | `src/config/mcp.ts`                                 |\n| a reusable capability      | a module                                            |\n| new envs or deploy targets | a preset — zero code changes                        |\n\nThis is the concrete form of [auto-discovery](/docs/core-concepts/auto-discovery): the kernel never needs to know about a file until it exists.\n\n## Per-Mode Composition [#per-mode-composition]\n\nThe same kernel assembles differently depending on the application mode, chosen when you create the project:\n\n| Mode         | Kernel assembly                                   |\n| ------------ | ------------------------------------------------- |\n| `fullstack`  | everything — API, SSR pages, jobs, realtime       |\n| `api+spa`    | no page SSR; a SPA shell with the API behind it   |\n| `static`     | pages plus prerender only; no HTTP server or jobs |\n| `standalone` | fullstack plus a binary output                    |\n| `edge`       | fullstack under the edge constraint set           |\n\nThe kernel shape never changes — only which `defineX` files exist. A static site still boots the kernel (config, pages, prerender); a serverless API just prunes the page and job layers.\n\n## Context and Macros [#context-and-macros]\n\nThree options in `defineApp` shape what handlers receive, all fully typed:\n\n* `state` — declares typed fields on the per-request store.\n* `decorate` — attaches singletons that appear on the context unchanged.\n* `resolve` — derives per-request values asynchronously during context assembly.\n\n`macros` define reusable route-level option keys. Each macro is a function that inspects its option value and pushes into lifecycle arrays:\n\n```ts title=\"context-and-macros.ts\"\ndefineApp({\n  macros: {\n    auth: (options: boolean, { beforeHandle }) => {\n      if (options) beforeHandle.push(requireAuth)\n    },\n    cache: (seconds: number, { afterHandle }) => afterHandle.push(setCache(seconds)),\n  },\n})\n```\n\nWith the macros declared, a route can author `{ auth: true, cache: 60 }` and both behaviors typecheck. See [Context](/docs/core-concepts/context) for the full picture of state, decoration, and derivation.\n\n## Testing Composition [#testing-composition]\n\nThe kernel is not a production-only concern — tests boot the real thing. `withApp` boots the kernel with in-memory adapters where possible, so tests compose exactly like production. `createTestClient(app)` speaks to the running kernel in-process, giving you typed API tests without a network hop.\n\n```ts title=\"testing-composition.ts\"\nimport { withApp, createTestClient } from '@kwiva/testing'\n\nconst { client } = await withApp(async (app) => {\n  return createTestClient(app)\n})\n```\n\nSee [Testing](/docs/testing) for the supported harnesses.\n\n## The Complexity Ladder [#the-complexity-ladder]\n\nBecause the kernel is fixed, growing the app means growing the set of `defineX` files, not the architecture:\n\n1. **Static site** — model-less pages; the kernel still runs (config, pages, prerender).\n2. **CRUD app** — add one model; zero controllers needed.\n3. **SaaS** — add auth, policies, tenancy, and Studio.\n4. **Realtime** — add events, channels, and jobs.\n5. **Platform** — add modules, MCP, and multi-preset deploys.\n\nAt every step the bootstrap file stays roughly the same size; the difference is which files exist in `src/`.\n\n## What's Next [#whats-next]\n\n* [Modules](/docs/core-concepts/modules) — `defineModule` adds feature packages to the kernel\n* [Plugins](/docs/core-concepts/plugins) — `definePlugin` changes framework behavior\n* [Lifecycle](/docs/core-concepts/lifecycle) — boot order and the request pipeline in detail\n* [Context](/docs/core-concepts/context) — the typed request context the kernel assembles\n* [Application Composition](/docs/modules-plugins/composition) — modules joining the kernel\n";
var structuredData = {
	"contents": [
		{
			"heading": "what-is-defineapp",
			"content": "`defineApp` is the application kernel. It lives in `src/bootstrap/app.ts` and is the single place where the pieces of your application are wired together: configuration, models, controllers, middleware, pages, modules, providers, and per-request context behavior. It is also a `defineX` factory, so it follows the same grammar as everything else — plain options, no classes, types inferred automatically."
		},
		{
			"heading": "what-is-defineapp",
			"content": "The kernel does the composition work that other frameworks scatter across service providers, route files, and DI registries: it merges module contributions, registers discovered constructs, assembles the middleware stack, boots providers, and starts the server."
		},
		{
			"heading": "the-bootstrap-file",
			"content": "Most of the fields are optional. The kernel picks up discovered constructs like models and controllers from the standard directories; `providers`, `state`, `decorate`, `resolve`, and `macros` are where you make explicit contributions. `middleware` may also be declared here as an explicit stack, though the canonical home is `src/config/app.ts > middleware[]`."
		},
		{
			"heading": "boot-lifecycle",
			"content": "When the application starts, the kernel runs a fixed composition order:"
		},
		{
			"heading": "boot-lifecycle",
			"content": "Config folder load and env validation — fail-fast on missing or invalid values"
		},
		{
			"heading": "boot-lifecycle",
			"content": "Module contribution merge — models, config, and migrations from `defineModule` packages"
		},
		{
			"heading": "boot-lifecycle",
			"content": "Model scan to IR — the model intermediate representation is built, with a migration drift check that warns in development"
		},
		{
			"heading": "boot-lifecycle",
			"content": "Route registration — generated model routes, controllers, server routes, and module routes"
		},
		{
			"heading": "boot-lifecycle",
			"content": "Middleware stack assembly — in the order declared in config"
		},
		{
			"heading": "boot-lifecycle",
			"content": "Provider boot — telemetry, queue, storage, or any custom provider"
		},
		{
			"heading": "boot-lifecycle",
			"content": "Engine init — storage mounts, cache, the task scheduler, and realtime channels"
		},
		{
			"heading": "boot-lifecycle",
			"content": "Listen — the deployment preset adapter starts accepting requests"
		},
		{
			"heading": "boot-lifecycle",
			"content": "Shutdown inverts the sequence: providers stop, the queue drains, then the engine layer stops. Nothing below the framework layer is shut down from app code directly — the kernel owns the ordering."
		},
		{
			"heading": "boot-lifecycle",
			"content": "Boot failures are loud. Env validation and config merging happen first, so misconfiguration surfaces before the server starts, not on the first request."
		},
		{
			"heading": "composition-by-addition",
			"content": "The composition story is simple: capabilities are files in the standard tree. There is no \"register the router\" step and no \"add the cache plugin\" step — discovery plus configuration does it."
		},
		{
			"heading": "composition-by-addition",
			"content": "I want…"
		},
		{
			"heading": "composition-by-addition",
			"content": "I add…"
		},
		{
			"heading": "composition-by-addition",
			"content": "a new resource"
		},
		{
			"heading": "composition-by-addition",
			"content": "`src/app/models/x.ts` plus an optional controller"
		},
		{
			"heading": "composition-by-addition",
			"content": "authenticated pages"
		},
		{
			"heading": "composition-by-addition",
			"content": "`src/app/http/auth.ts` plus middleware in the stack"
		},
		{
			"heading": "composition-by-addition",
			"content": "background processing"
		},
		{
			"heading": "composition-by-addition",
			"content": "`src/app/jobs/x.ts` plus queue config"
		},
		{
			"heading": "composition-by-addition",
			"content": "realtime"
		},
		{
			"heading": "composition-by-addition",
			"content": "an event plus a channel policy"
		},
		{
			"heading": "composition-by-addition",
			"content": "Kwiva Studio"
		},
		{
			"heading": "composition-by-addition",
			"content": "`studio: { enabled: true }`"
		},
		{
			"heading": "composition-by-addition",
			"content": "agent access"
		},
		{
			"heading": "composition-by-addition",
			"content": "`src/config/mcp.ts`"
		},
		{
			"heading": "composition-by-addition",
			"content": "a reusable capability"
		},
		{
			"heading": "composition-by-addition",
			"content": "a module"
		},
		{
			"heading": "composition-by-addition",
			"content": "new envs or deploy targets"
		},
		{
			"heading": "composition-by-addition",
			"content": "a preset — zero code changes"
		},
		{
			"heading": "composition-by-addition",
			"content": "This is the concrete form of auto-discovery: the kernel never needs to know about a file until it exists."
		},
		{
			"heading": "per-mode-composition",
			"content": "The same kernel assembles differently depending on the application mode, chosen when you create the project:"
		},
		{
			"heading": "per-mode-composition",
			"content": "Mode"
		},
		{
			"heading": "per-mode-composition",
			"content": "Kernel assembly"
		},
		{
			"heading": "per-mode-composition",
			"content": "`fullstack`"
		},
		{
			"heading": "per-mode-composition",
			"content": "everything — API, SSR pages, jobs, realtime"
		},
		{
			"heading": "per-mode-composition",
			"content": "`api+spa`"
		},
		{
			"heading": "per-mode-composition",
			"content": "no page SSR; a SPA shell with the API behind it"
		},
		{
			"heading": "per-mode-composition",
			"content": "`static`"
		},
		{
			"heading": "per-mode-composition",
			"content": "pages plus prerender only; no HTTP server or jobs"
		},
		{
			"heading": "per-mode-composition",
			"content": "`standalone`"
		},
		{
			"heading": "per-mode-composition",
			"content": "fullstack plus a binary output"
		},
		{
			"heading": "per-mode-composition",
			"content": "`edge`"
		},
		{
			"heading": "per-mode-composition",
			"content": "fullstack under the edge constraint set"
		},
		{
			"heading": "per-mode-composition",
			"content": "The kernel shape never changes — only which `defineX` files exist. A static site still boots the kernel (config, pages, prerender); a serverless API just prunes the page and job layers."
		},
		{
			"heading": "context-and-macros",
			"content": "Three options in `defineApp` shape what handlers receive, all fully typed:"
		},
		{
			"heading": "context-and-macros",
			"content": "`state` — declares typed fields on the per-request store."
		},
		{
			"heading": "context-and-macros",
			"content": "`decorate` — attaches singletons that appear on the context unchanged."
		},
		{
			"heading": "context-and-macros",
			"content": "`resolve` — derives per-request values asynchronously during context assembly."
		},
		{
			"heading": "context-and-macros",
			"content": "`macros` define reusable route-level option keys. Each macro is a function that inspects its option value and pushes into lifecycle arrays:"
		},
		{
			"heading": "context-and-macros",
			"content": "With the macros declared, a route can author `{ auth: true, cache: 60 }` and both behaviors typecheck. See Context for the full picture of state, decoration, and derivation."
		},
		{
			"heading": "testing-composition",
			"content": "The kernel is not a production-only concern — tests boot the real thing. `withApp` boots the kernel with in-memory adapters where possible, so tests compose exactly like production. `createTestClient(app)` speaks to the running kernel in-process, giving you typed API tests without a network hop."
		},
		{
			"heading": "testing-composition",
			"content": "See Testing for the supported harnesses."
		},
		{
			"heading": "the-complexity-ladder",
			"content": "Because the kernel is fixed, growing the app means growing the set of `defineX` files, not the architecture:"
		},
		{
			"heading": "the-complexity-ladder",
			"content": "**Static site** — model-less pages; the kernel still runs (config, pages, prerender)."
		},
		{
			"heading": "the-complexity-ladder",
			"content": "**CRUD app** — add one model; zero controllers needed."
		},
		{
			"heading": "the-complexity-ladder",
			"content": "**SaaS** — add auth, policies, tenancy, and Studio."
		},
		{
			"heading": "the-complexity-ladder",
			"content": "**Realtime** — add events, channels, and jobs."
		},
		{
			"heading": "the-complexity-ladder",
			"content": "**Platform** — add modules, MCP, and multi-preset deploys."
		},
		{
			"heading": "the-complexity-ladder",
			"content": "At every step the bootstrap file stays roughly the same size; the difference is which files exist in `src/`."
		},
		{
			"heading": "whats-next",
			"content": "Modules — `defineModule` adds feature packages to the kernel"
		},
		{
			"heading": "whats-next",
			"content": "Plugins — `definePlugin` changes framework behavior"
		},
		{
			"heading": "whats-next",
			"content": "Lifecycle — boot order and the request pipeline in detail"
		},
		{
			"heading": "whats-next",
			"content": "Context — the typed request context the kernel assembles"
		},
		{
			"heading": "whats-next",
			"content": "Application Composition — modules joining the kernel"
		}
	],
	"headings": [
		{
			"id": "what-is-defineapp",
			"content": "What is defineApp?"
		},
		{
			"id": "the-bootstrap-file",
			"content": "The Bootstrap File"
		},
		{
			"id": "boot-lifecycle",
			"content": "Boot Lifecycle"
		},
		{
			"id": "composition-by-addition",
			"content": "Composition by Addition"
		},
		{
			"id": "per-mode-composition",
			"content": "Per-Mode Composition"
		},
		{
			"id": "context-and-macros",
			"content": "Context and Macros"
		},
		{
			"id": "testing-composition",
			"content": "Testing Composition"
		},
		{
			"id": "the-complexity-ladder",
			"content": "The Complexity Ladder"
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
		url: "#what-is-defineapp",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What is defineApp?" })
	},
	{
		depth: 2,
		url: "#the-bootstrap-file",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Bootstrap File" })
	},
	{
		depth: 2,
		url: "#boot-lifecycle",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Boot Lifecycle" })
	},
	{
		depth: 2,
		url: "#composition-by-addition",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Composition by Addition" })
	},
	{
		depth: 2,
		url: "#per-mode-composition",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Per-Mode Composition" })
	},
	{
		depth: 2,
		url: "#context-and-macros",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Context and Macros" })
	},
	{
		depth: 2,
		url: "#testing-composition",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Testing Composition" })
	},
	{
		depth: 2,
		url: "#the-complexity-ladder",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Complexity Ladder" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-is-defineapp",
			children: "What is defineApp?"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
			" is the application kernel. It lives in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/bootstrap/app.ts" }),
			" and is the single place where the pieces of your application are wired together: configuration, models, controllers, middleware, pages, modules, providers, and per-request context behavior. It is also a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factory, so it follows the same grammar as everything else — plain options, no classes, types inferred automatically."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The kernel does the composition work that other frameworks scatter across service providers, route files, and DI registries: it merges module contributions, registers discovered constructs, assembles the middleware stack, boots providers, and starts the server." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-bootstrap-file",
			children: "The Bootstrap File"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // discovered (scan-based; explicit override possible)"
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
						children: "  models, controllers, middleware, jobs, events, tasks, policies, pages,"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // explicit composition — providers boot with the kernel"
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
						children: "  providers: ["
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
						children: "    telemetryProvider,           "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// observability init (from src/config/telemetry.ts)"
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
						children: "    queueProvider,               "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// queue transport (from src/config/queue.ts)"
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
						children: "    storageProvider,             "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// storage disks (from src/config/storage.ts)"
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
						children: "  ],"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // app-level context"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  state: { startTime: Date."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "now"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "() },"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  decorate: { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "/* singletons */"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " },"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  resolve: [ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "/* per-request derivations */"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ],"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // route-level reusable keys"
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
						children: "  macros: { auth, cache, rateLimit },"
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
			"Most of the fields are optional. The kernel picks up discovered constructs like models and controllers from the standard directories; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "providers" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "state" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "decorate" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "resolve" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "macros" }),
			" are where you make explicit contributions. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "middleware" }),
			" may also be declared here as an explicit stack, though the canonical home is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts > middleware[]" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "boot-lifecycle",
			children: "Boot Lifecycle"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "When the application starts, the kernel runs a fixed composition order:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Config folder load and env validation — fail-fast on missing or invalid values" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Module contribution merge — models, config, and migrations from ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
				" packages"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Model scan to IR — the model intermediate representation is built, with a migration drift check that warns in development" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Route registration — generated model routes, controllers, server routes, and module routes" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Middleware stack assembly — in the order declared in config" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Provider boot — telemetry, queue, storage, or any custom provider" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Engine init — storage mounts, cache, the task scheduler, and realtime channels" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Listen — the deployment preset adapter starts accepting requests" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Shutdown inverts the sequence: providers stop, the queue drains, then the engine layer stops. Nothing below the framework layer is shut down from app code directly — the kernel owns the ordering." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Boot failures are loud. Env validation and config merging happen first, so misconfiguration surfaces before the server starts, not on the first request." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "composition-by-addition",
			children: "Composition by Addition"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The composition story is simple: capabilities are files in the standard tree. There is no \"register the router\" step and no \"add the cache plugin\" step — discovery plus configuration does it." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "I want…" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "I add…" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "a new resource" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/x.ts" }), " plus an optional controller"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "authenticated pages" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/auth.ts" }), " plus middleware in the stack"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "background processing" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/x.ts" }), " plus queue config"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "realtime" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "an event plus a channel policy" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Kwiva Studio" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "studio: { enabled: true }" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "agent access" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/mcp.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "a reusable capability" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "a module" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "new envs or deploy targets" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "a preset — zero code changes" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This is the concrete form of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/auto-discovery",
				children: "auto-discovery"
			}),
			": the kernel never needs to know about a file until it exists."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "per-mode-composition",
			children: "Per-Mode Composition"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The same kernel assembles differently depending on the application mode, chosen when you create the project:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Kernel assembly" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "everything — API, SSR pages, jobs, realtime" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "no page SSR; a SPA shell with the API behind it" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "pages plus prerender only; no HTTP server or jobs" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "fullstack plus a binary output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "fullstack under the edge constraint set" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The kernel shape never changes — only which ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" files exist. A static site still boots the kernel (config, pages, prerender); a serverless API just prunes the page and job layers."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "context-and-macros",
			children: "Context and Macros"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Three options in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
			" shape what handlers receive, all fully typed:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "state" }), " — declares typed fields on the per-request store."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "decorate" }), " — attaches singletons that appear on the context unchanged."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "resolve" }), " — derives per-request values asynchronously during context assembly."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "macros" }), " define reusable route-level option keys. Each macro is a function that inspects its option value and pushes into lifecycle arrays:"] }),
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
			title: "context-and-macros.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "defineApp"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "({"
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
						children: "  macros: {"
					})
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
							children: "    auth"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "options"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: ":"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " boolean"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "beforeHandle"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }) "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "=>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " {"
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
							children: "      if"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " (options) beforeHandle."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "push"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(requireAuth)"
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
						children: "    },"
					})
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
							children: "    cache"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "seconds"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: ":"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " number"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "afterHandle"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }) "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "=>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " afterHandle."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "push"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "setCache"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(seconds)),"
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
						children: "  },"
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
			"With the macros declared, a route can author ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ auth: true, cache: 60 }" }),
			" and both behaviors typecheck. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/context",
				children: "Context"
			}),
			" for the full picture of state, decoration, and derivation."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "testing-composition",
			children: "Testing Composition"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The kernel is not a production-only concern — tests boot the real thing. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" }),
			" boots the kernel with in-memory adapters where possible, so tests compose exactly like production. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createTestClient(app)" }),
			" speaks to the running kernel in-process, giving you typed API tests without a network hop."
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
			title: "testing-composition.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
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
							children: " { withApp, createTestClient } "
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
							children: " '@kwiva/testing'"
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "client"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " withApp"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "async"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "app"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ") "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "=>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " {"
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
							children: "  return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " createTestClient"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(app)"
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
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing",
				children: "Testing"
			}),
			" for the supported harnesses."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-complexity-ladder",
			children: "The Complexity Ladder"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the kernel is fixed, growing the app means growing the set of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" files, not the architecture:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Static site" }), " — model-less pages; the kernel still runs (config, pages, prerender)."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "CRUD app" }), " — add one model; zero controllers needed."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "SaaS" }), " — add auth, policies, tenancy, and Studio."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Realtime" }), " — add events, channels, and jobs."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Platform" }), " — add modules, MCP, and multi-preset deploys."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"At every step the bootstrap file stays roughly the same size; the difference is which files exist in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/modules",
					children: "Modules"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
				" adds feature packages to the kernel"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/plugins",
					children: "Plugins"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePlugin" }),
				" changes framework behavior"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/lifecycle",
				children: "Lifecycle"
			}), " — boot order and the request pipeline in detail"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/context",
				children: "Context"
			}), " — the typed request context the kernel assembles"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/composition",
				children: "Application Composition"
			}), " — modules joining the kernel"] }),
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
