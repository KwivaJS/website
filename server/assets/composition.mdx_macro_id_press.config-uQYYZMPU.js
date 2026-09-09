import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/modules-plugins/composition.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Application Composition",
	"description": "How defineApp assembles the kernel — config, models, middleware, providers, and modules — and how the module registry in kwiva.config.ts resolves and merges contributions."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nEverything in a Kwiva application is composed by one function: `defineApp` in `src/bootstrap/app.ts`. It is the kernel — config, models, HTTP, modules, and providers assembled into a single runnable application. This page describes that assembly in order: the kernel, the module registry, the merge, the boot sequence, and what happens at shutdown.\n\n## The Kernel [#the-kernel]\n\n```ts title=\"src/bootstrap/app.ts\"\n// src/bootstrap/app.ts\nimport { defineApp } from '@kwiva/core'\nimport auth from '../app/http/auth'\n\nexport const app = defineApp({\n  auth,\n\n  // discovered (scan-based; explicit override possible)\n  models, controllers, middleware, jobs, events, tasks, policies, pages,\n\n  // explicit composition\n  providers: [\n    telemetryProvider,       // telemetry init (from src/config/telemetry.ts)\n    queueProvider,           // queue transport (from src/config/queue.ts)\n    storageProvider,         // disks (from src/config/storage.ts)\n  ],\n\n  // app-level context\n  state: { startTime: Date.now() },\n  decorate: { /* singletons */ },\n  resolve: [ /* per-request derivations */ ],\n\n  // route-level reusable keys\n  macros: { auth, cache, rateLimit },\n})\n```\n\nMost of the kernel is assembled by **auto-discovery** — models from `src/app/models/`, controllers from `src/app/http/controllers/`, pages from `src/ui/pages/`. Explicit lists remain available for override. Providers are the explicit part: services that boot, hold resources, and shut down in order. Modules contribute to both halves: their models, controllers, and pages join the scan, and their boot/shutdown hooks participate alongside providers.\n\nThe kernel also carries the app-level context that every request sees: `state` for process-lifetime values, `decorate` for singletons, and `resolve` for per-request derivations — such as the per-request logger bound to the request's correlation IDs. `macros` declares reusable route-level keys that controllers can consume as typechecked options.\n\n## The Module Registry [#the-module-registry]\n\nModules are registered in `kwiva.config.ts` through the `modules` key:\n\n```ts title=\"kwiva.config.ts\"\n// kwiva.config.ts\nexport default defineConfig({\n  modules: [\n    '@kwiva/auth-kit',        // first-party (package addon)\n    '@acme/chat',             // third-party (package addon)\n    './modules/billing',      // local (workspace path)\n  ],\n})\n```\n\n* **First-party** entries are framework-maintained addons.\n* **Third-party** entries are published addons installed from the package registry.\n* **Local** entries are workspace paths — no publishing step required.\n\n`kwiva add` writes this entry automatically as part of installation. Manual registration stays supported for vendored or path-based modules. The `modules` array is the single list of external composition in the application — everything internal is auto-discovered, everything external joins here.\n\n## How Modules Join the App [#how-modules-join-the-app]\n\nDiscovery **merges module contributions into the application scan**. A module's models, controllers, and pages appear as if they were local — namespaced to the module scope. A chat module contributing `messages` registers as `chat.messages`, mounts its pages under its declared prefix, and merges its config defaults under `chat.*`.\n\nThe merge is invisible from the handler side: a request to `chat.messages` behaves exactly like a request to a locally-defined model, because it flows through the same pipeline — context, lifecycle, validation, policies, and response. There is no second routing universe for module contributions.\n\nThe ordering of that merge matters. Module contributions land before the model scan produces its intermediate representation, so module models, migrations, and config defaults participate in everything the IR derives:\n\n* the generated route surface (model REST routes + controllers)\n* the typed client\n* the OpenAPI spec\n* Studio screens\n* MCP tool schemas\n\nSwitch one module for another with the same shape and the derived artifacts re-derive — that is what makes package-level composition feel like the rest of the framework.\n\n## Composition Order (Boot) [#composition-order-boot]\n\nThe kernel assembles in a deterministic order:\n\n```text title=\"composition-order-boot.txt\"\n1. config folder load + env validation        (fail-fast)\n2. module contributions merge (models/config/migrations)\n3. model scan → IR → migrations drift check   (dev warn)\n4. route registration: generated model routes + controllers + server routes + module routes\n5. middleware stack assembly (config order)\n6. providers boot (telemetry, queue, storage, custom services)\n7. engine init (storage mounts, cache, task scheduler, ws)\n8. listen (preset adapter)\n```\n\nShutdown inverts the sequence: providers stop, the queue drains, the engine stops.\n\nThe critical position for modules is step 2 — contributions merge before the model IR is built. Two consequences follow:\n\n* A module's migrations and config defaults are in place before the drift check at step 3 runs, so the dev-time warning reflects the full composed schema.\n* A module's models are in the route registration step at step 4, so generated routes for `chat.messages` exist from the first request.\n\n## Module Resolution and Conflicts [#module-resolution-and-conflicts]\n\nConflicts are prevented by contract and resolved by precedence:\n\n* **Namespacing prevents collisions** — every module claims its own namespaces for models, routes, config, and policies, so two modules cannot silently overwrite each other.\n* **Standard config precedence** — defaults → `src/config` values → inline `defineX` options, with inline winning. Module config defaults register under their namespace and are overridden in the app's `src/config/modules.ts` through a deep merge where the app wins.\n* **Peer requirements** — each module declares `requires` ranges for `@kwiva/*` packages; resolution rejects incompatible combinations rather than running them.\n* **Discovery overrides stay explicit** — a module's contribution is merged, but the app can still define its own files and providers to win where intended.\n\nThe resolution runs at build time as a dependency graph with cycle detection, so a module arrangement that would deadlock is a build error, not a runtime surprise.\n\n## Adding Capability Is Still Adding a File [#adding-capability-is-still-adding-a-file]\n\nThe composition story scales down as much as up: there is no \"register the router\" step and no \"add the cache plugin\" step. Adding capability to the kernel is still just adding a defineX file:\n\n| I want…               | I add…                                           |\n| --------------------- | ------------------------------------------------ |\n| a new resource        | `src/app/models/x.ts` (+ optional controller)    |\n| authenticated pages   | `src/app/http/auth.ts` + middleware in the stack |\n| background processing | `src/app/jobs/x.ts` + queue config               |\n| realtime              | event + channel policy                           |\n| reusable capability   | a module                                         |\n| envs/deploy targets   | presets — zero code changes                      |\n\n## Composition per Mode [#composition-per-mode]\n\nThe kernel assembles differently per application mode, selected at scaffold time:\n\n| Mode         | Kernel assembly                         |\n| ------------ | --------------------------------------- |\n| `fullstack`  | everything                              |\n| `api+spa`    | no pages SSR; SPA shell                 |\n| `static`     | pages + prerender only; no http/jobs    |\n| `standalone` | fullstack + binary output               |\n| `edge`       | fullstack under the edge constraint set |\n\nThe kernel shape never changes — only which `defineX` files and modules exist. A module written for a fullstack app composes identically into an edge deployment as long as it stays inside the constraints the mode imposes.\n\n## Testing Composition [#testing-composition]\n\n`withApp` boots the real kernel with in-memory adapters where possible, so tests compose exactly like production. `createTestClient(app)` talks to it in-process with full types — no network, no deployment required. Because the harness boots the composed kernel, module contributions come along: a test that exercises a route contributed by a module exercises the same merged pipeline production runs. See [Testing](/docs/testing/) for the harness in depth.\n\n## What's Next [#whats-next]\n\n* [Defining Modules](/docs/modules-plugins/defining-modules) — the contribution points modules provide\n* [Addons & Distribution](/docs/modules-plugins/addons) — install and manage modules\n* [Modules & Plugins](/docs/modules-plugins) — the composition model at a glance\n* [Applications](/docs/core-concepts/applications) — the kernel in depth\n* [The defineX Convention](/docs/core-concepts/definex) — one grammar across every factory\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Everything in a Kwiva application is composed by one function: `defineApp` in `src/bootstrap/app.ts`. It is the kernel — config, models, HTTP, modules, and providers assembled into a single runnable application. This page describes that assembly in order: the kernel, the module registry, the merge, the boot sequence, and what happens at shutdown."
		},
		{
			"heading": "the-kernel",
			"content": "Most of the kernel is assembled by **auto-discovery** — models from `src/app/models/`, controllers from `src/app/http/controllers/`, pages from `src/ui/pages/`. Explicit lists remain available for override. Providers are the explicit part: services that boot, hold resources, and shut down in order. Modules contribute to both halves: their models, controllers, and pages join the scan, and their boot/shutdown hooks participate alongside providers."
		},
		{
			"heading": "the-kernel",
			"content": "The kernel also carries the app-level context that every request sees: `state` for process-lifetime values, `decorate` for singletons, and `resolve` for per-request derivations — such as the per-request logger bound to the request's correlation IDs. `macros` declares reusable route-level keys that controllers can consume as typechecked options."
		},
		{
			"heading": "the-module-registry",
			"content": "Modules are registered in `kwiva.config.ts` through the `modules` key:"
		},
		{
			"heading": "the-module-registry",
			"content": "**First-party** entries are framework-maintained addons."
		},
		{
			"heading": "the-module-registry",
			"content": "**Third-party** entries are published addons installed from the package registry."
		},
		{
			"heading": "the-module-registry",
			"content": "**Local** entries are workspace paths — no publishing step required."
		},
		{
			"heading": "the-module-registry",
			"content": "`kwiva add` writes this entry automatically as part of installation. Manual registration stays supported for vendored or path-based modules. The `modules` array is the single list of external composition in the application — everything internal is auto-discovered, everything external joins here."
		},
		{
			"heading": "how-modules-join-the-app",
			"content": "Discovery **merges module contributions into the application scan**. A module's models, controllers, and pages appear as if they were local — namespaced to the module scope. A chat module contributing `messages` registers as `chat.messages`, mounts its pages under its declared prefix, and merges its config defaults under `chat.*`."
		},
		{
			"heading": "how-modules-join-the-app",
			"content": "The merge is invisible from the handler side: a request to `chat.messages` behaves exactly like a request to a locally-defined model, because it flows through the same pipeline — context, lifecycle, validation, policies, and response. There is no second routing universe for module contributions."
		},
		{
			"heading": "how-modules-join-the-app",
			"content": "The ordering of that merge matters. Module contributions land before the model scan produces its intermediate representation, so module models, migrations, and config defaults participate in everything the IR derives:"
		},
		{
			"heading": "how-modules-join-the-app",
			"content": "the generated route surface (model REST routes + controllers)"
		},
		{
			"heading": "how-modules-join-the-app",
			"content": "the typed client"
		},
		{
			"heading": "how-modules-join-the-app",
			"content": "the OpenAPI spec"
		},
		{
			"heading": "how-modules-join-the-app",
			"content": "Studio screens"
		},
		{
			"heading": "how-modules-join-the-app",
			"content": "MCP tool schemas"
		},
		{
			"heading": "how-modules-join-the-app",
			"content": "Switch one module for another with the same shape and the derived artifacts re-derive — that is what makes package-level composition feel like the rest of the framework."
		},
		{
			"heading": "composition-order-boot",
			"content": "The kernel assembles in a deterministic order:"
		},
		{
			"heading": "composition-order-boot",
			"content": "Shutdown inverts the sequence: providers stop, the queue drains, the engine stops."
		},
		{
			"heading": "composition-order-boot",
			"content": "The critical position for modules is step 2 — contributions merge before the model IR is built. Two consequences follow:"
		},
		{
			"heading": "composition-order-boot",
			"content": "A module's migrations and config defaults are in place before the drift check at step 3 runs, so the dev-time warning reflects the full composed schema."
		},
		{
			"heading": "composition-order-boot",
			"content": "A module's models are in the route registration step at step 4, so generated routes for `chat.messages` exist from the first request."
		},
		{
			"heading": "module-resolution-and-conflicts",
			"content": "Conflicts are prevented by contract and resolved by precedence:"
		},
		{
			"heading": "module-resolution-and-conflicts",
			"content": "**Namespacing prevents collisions** — every module claims its own namespaces for models, routes, config, and policies, so two modules cannot silently overwrite each other."
		},
		{
			"heading": "module-resolution-and-conflicts",
			"content": "**Standard config precedence** — defaults → `src/config` values → inline `defineX` options, with inline winning. Module config defaults register under their namespace and are overridden in the app's `src/config/modules.ts` through a deep merge where the app wins."
		},
		{
			"heading": "module-resolution-and-conflicts",
			"content": "**Peer requirements** — each module declares `requires` ranges for `@kwiva/*` packages; resolution rejects incompatible combinations rather than running them."
		},
		{
			"heading": "module-resolution-and-conflicts",
			"content": "**Discovery overrides stay explicit** — a module's contribution is merged, but the app can still define its own files and providers to win where intended."
		},
		{
			"heading": "module-resolution-and-conflicts",
			"content": "The resolution runs at build time as a dependency graph with cycle detection, so a module arrangement that would deadlock is a build error, not a runtime surprise."
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "The composition story scales down as much as up: there is no \"register the router\" step and no \"add the cache plugin\" step. Adding capability to the kernel is still just adding a defineX file:"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "I want…"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "I add…"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "a new resource"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "`src/app/models/x.ts` (+ optional controller)"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "authenticated pages"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "`src/app/http/auth.ts` + middleware in the stack"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "background processing"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "`src/app/jobs/x.ts` + queue config"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "realtime"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "event + channel policy"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "reusable capability"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "a module"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "envs/deploy targets"
		},
		{
			"heading": "adding-capability-is-still-adding-a-file",
			"content": "presets — zero code changes"
		},
		{
			"heading": "composition-per-mode",
			"content": "The kernel assembles differently per application mode, selected at scaffold time:"
		},
		{
			"heading": "composition-per-mode",
			"content": "Mode"
		},
		{
			"heading": "composition-per-mode",
			"content": "Kernel assembly"
		},
		{
			"heading": "composition-per-mode",
			"content": "`fullstack`"
		},
		{
			"heading": "composition-per-mode",
			"content": "everything"
		},
		{
			"heading": "composition-per-mode",
			"content": "`api+spa`"
		},
		{
			"heading": "composition-per-mode",
			"content": "no pages SSR; SPA shell"
		},
		{
			"heading": "composition-per-mode",
			"content": "`static`"
		},
		{
			"heading": "composition-per-mode",
			"content": "pages + prerender only; no http/jobs"
		},
		{
			"heading": "composition-per-mode",
			"content": "`standalone`"
		},
		{
			"heading": "composition-per-mode",
			"content": "fullstack + binary output"
		},
		{
			"heading": "composition-per-mode",
			"content": "`edge`"
		},
		{
			"heading": "composition-per-mode",
			"content": "fullstack under the edge constraint set"
		},
		{
			"heading": "composition-per-mode",
			"content": "The kernel shape never changes — only which `defineX` files and modules exist. A module written for a fullstack app composes identically into an edge deployment as long as it stays inside the constraints the mode imposes."
		},
		{
			"heading": "testing-composition",
			"content": "`withApp` boots the real kernel with in-memory adapters where possible, so tests compose exactly like production. `createTestClient(app)` talks to it in-process with full types — no network, no deployment required. Because the harness boots the composed kernel, module contributions come along: a test that exercises a route contributed by a module exercises the same merged pipeline production runs. See Testing for the harness in depth."
		},
		{
			"heading": "whats-next",
			"content": "Defining Modules — the contribution points modules provide"
		},
		{
			"heading": "whats-next",
			"content": "Addons & Distribution — install and manage modules"
		},
		{
			"heading": "whats-next",
			"content": "Modules & Plugins — the composition model at a glance"
		},
		{
			"heading": "whats-next",
			"content": "Applications — the kernel in depth"
		},
		{
			"heading": "whats-next",
			"content": "The defineX Convention — one grammar across every factory"
		}
	],
	"headings": [
		{
			"id": "the-kernel",
			"content": "The Kernel"
		},
		{
			"id": "the-module-registry",
			"content": "The Module Registry"
		},
		{
			"id": "how-modules-join-the-app",
			"content": "How Modules Join the App"
		},
		{
			"id": "composition-order-boot",
			"content": "Composition Order (Boot)"
		},
		{
			"id": "module-resolution-and-conflicts",
			"content": "Module Resolution and Conflicts"
		},
		{
			"id": "adding-capability-is-still-adding-a-file",
			"content": "Adding Capability Is Still Adding a File"
		},
		{
			"id": "composition-per-mode",
			"content": "Composition per Mode"
		},
		{
			"id": "testing-composition",
			"content": "Testing Composition"
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
		url: "#the-kernel",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Kernel" })
	},
	{
		depth: 2,
		url: "#the-module-registry",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Module Registry" })
	},
	{
		depth: 2,
		url: "#how-modules-join-the-app",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How Modules Join the App" })
	},
	{
		depth: 2,
		url: "#composition-order-boot",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Composition Order (Boot)" })
	},
	{
		depth: 2,
		url: "#module-resolution-and-conflicts",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Module Resolution and Conflicts" })
	},
	{
		depth: 2,
		url: "#adding-capability-is-still-adding-a-file",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Adding Capability Is Still Adding a File" })
	},
	{
		depth: 2,
		url: "#composition-per-mode",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Composition per Mode" })
	},
	{
		depth: 2,
		url: "#testing-composition",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Testing Composition" })
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
			"Everything in a Kwiva application is composed by one function: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
			" in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/bootstrap/app.ts" }),
			". It is the kernel — config, models, HTTP, modules, and providers assembled into a single runnable application. This page describes that assembly in order: the kernel, the module registry, the merge, the boot sequence, and what happens at shutdown."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-kernel",
			children: "The Kernel"
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
						children: "  // explicit composition"
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
						children: "    telemetryProvider,       "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// telemetry init (from src/config/telemetry.ts)"
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
						children: "    queueProvider,           "
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
						children: "    storageProvider,         "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// disks (from src/config/storage.ts)"
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
			"Most of the kernel is assembled by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "auto-discovery" }),
			" — models from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/" }),
			", controllers from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/controllers/" }),
			", pages from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/" }),
			". Explicit lists remain available for override. Providers are the explicit part: services that boot, hold resources, and shut down in order. Modules contribute to both halves: their models, controllers, and pages join the scan, and their boot/shutdown hooks participate alongside providers."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The kernel also carries the app-level context that every request sees: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "state" }),
			" for process-lifetime values, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "decorate" }),
			" for singletons, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "resolve" }),
			" for per-request derivations — such as the per-request logger bound to the request's correlation IDs. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "macros" }),
			" declares reusable route-level keys that controllers can consume as typechecked options."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-module-registry",
			children: "The Module Registry"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Modules are registered in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
			" through the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "modules" }),
			" key:"
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
			title: "kwiva.config.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// kwiva.config.ts"
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
							children: "export"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " default"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " defineConfig"
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
						children: "  modules: ["
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "    '@kwiva/auth-kit'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",        "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// first-party (package addon)"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "    '@acme/chat'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",             "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// third-party (package addon)"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "    './modules/billing'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",      "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// local (workspace path)"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "First-party" }), " entries are framework-maintained addons."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Third-party" }), " entries are published addons installed from the package registry."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Local" }), " entries are workspace paths — no publishing step required."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add" }),
			" writes this entry automatically as part of installation. Manual registration stays supported for vendored or path-based modules. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "modules" }),
			" array is the single list of external composition in the application — everything internal is auto-discovered, everything external joins here."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-modules-join-the-app",
			children: "How Modules Join the App"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Discovery ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "merges module contributions into the application scan" }),
			". A module's models, controllers, and pages appear as if they were local — namespaced to the module scope. A chat module contributing ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "messages" }),
			" registers as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.messages" }),
			", mounts its pages under its declared prefix, and merges its config defaults under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.*" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The merge is invisible from the handler side: a request to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.messages" }),
			" behaves exactly like a request to a locally-defined model, because it flows through the same pipeline — context, lifecycle, validation, policies, and response. There is no second routing universe for module contributions."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The ordering of that merge matters. Module contributions land before the model scan produces its intermediate representation, so module models, migrations, and config defaults participate in everything the IR derives:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "the generated route surface (model REST routes + controllers)" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "the typed client" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "the OpenAPI spec" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Studio screens" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "MCP tool schemas" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Switch one module for another with the same shape and the derived artifacts re-derive — that is what makes package-level composition feel like the rest of the framework." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "composition-order-boot",
			children: "Composition Order (Boot)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The kernel assembles in a deterministic order:" }),
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
			title: "composition-order-boot.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "1. config folder load + env validation        (fail-fast)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "2. module contributions merge (models/config/migrations)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "3. model scan → IR → migrations drift check   (dev warn)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "4. route registration: generated model routes + controllers + server routes + module routes" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "5. middleware stack assembly (config order)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "6. providers boot (telemetry, queue, storage, custom services)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "7. engine init (storage mounts, cache, task scheduler, ws)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "8. listen (preset adapter)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Shutdown inverts the sequence: providers stop, the queue drains, the engine stops." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The critical position for modules is step 2 — contributions merge before the model IR is built. Two consequences follow:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "A module's migrations and config defaults are in place before the drift check at step 3 runs, so the dev-time warning reflects the full composed schema." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A module's models are in the route registration step at step 4, so generated routes for ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.messages" }),
				" exist from the first request."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "module-resolution-and-conflicts",
			children: "Module Resolution and Conflicts"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Conflicts are prevented by contract and resolved by precedence:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Namespacing prevents collisions" }), " — every module claims its own namespaces for models, routes, config, and policies, so two modules cannot silently overwrite each other."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Standard config precedence" }),
				" — defaults → ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config" }),
				" values → inline ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" options, with inline winning. Module config defaults register under their namespace and are overridden in the app's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/modules.ts" }),
				" through a deep merge where the app wins."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Peer requirements" }),
				" — each module declares ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
				" ranges for ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" packages; resolution rejects incompatible combinations rather than running them."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Discovery overrides stay explicit" }), " — a module's contribution is merged, but the app can still define its own files and providers to win where intended."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The resolution runs at build time as a dependency graph with cycle detection, so a module arrangement that would deadlock is a build error, not a runtime surprise." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "adding-capability-is-still-adding-a-file",
			children: "Adding Capability Is Still Adding a File"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The composition story scales down as much as up: there is no \"register the router\" step and no \"add the cache plugin\" step. Adding capability to the kernel is still just adding a defineX file:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "I want…" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "I add…" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "a new resource" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/x.ts" }), " (+ optional controller)"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "authenticated pages" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/auth.ts" }), " + middleware in the stack"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "background processing" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/x.ts" }), " + queue config"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "realtime" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "event + channel policy" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "reusable capability" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "a module" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "envs/deploy targets" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "presets — zero code changes" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "composition-per-mode",
			children: "Composition per Mode"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The kernel assembles differently per application mode, selected at scaffold time:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Kernel assembly" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "everything" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "no pages SSR; SPA shell" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "pages + prerender only; no http/jobs" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "fullstack + binary output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "fullstack under the edge constraint set" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The kernel shape never changes — only which ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" files and modules exist. A module written for a fullstack app composes identically into an edge deployment as long as it stays inside the constraints the mode imposes."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "testing-composition",
			children: "Testing Composition"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" }),
			" boots the real kernel with in-memory adapters where possible, so tests compose exactly like production. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createTestClient(app)" }),
			" talks to it in-process with full types — no network, no deployment required. Because the harness boots the composed kernel, module contributions come along: a test that exercises a route contributed by a module exercises the same merged pipeline production runs. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/",
				children: "Testing"
			}),
			" for the harness in depth."
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
				href: "/docs/modules-plugins/defining-modules",
				children: "Defining Modules"
			}), " — the contribution points modules provide"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/addons",
				children: "Addons & Distribution"
			}), " — install and manage modules"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins",
				children: "Modules & Plugins"
			}), " — the composition model at a glance"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}), " — the kernel in depth"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}), " — one grammar across every factory"] }),
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
