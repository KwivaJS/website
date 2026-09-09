import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/core-concepts/modules.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Modules",
	"description": "defineModule — self-contained feature packages that compose models, controllers, pages, jobs, and config into an application with one declaration."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\n## What is a Module? [#what-is-a-module]\n\nA module is a self-contained feature package. It bundles related constructs — models, controllers, pages, jobs, events, tasks, policies, migrations, config, and channels — and composes them into an application with one declaration. A blog, an analytics panel, or an admin console are all natural modules: each is a vertical slice that owns its models, its API, its UI, and its background work.\n\nModules are how Kwiva scales beyond a single app folder. Everything a module contributes is namespaced and versioned, so any number of modules can coexist in an application without colliding, and each can evolve independently. See [Defining Modules](/docs/modules-plugins/defining-modules) for the full authoring reference.\n\n## The `defineModule` Factory [#the-definemodule-factory]\n\nA module is defined like every other construct — declaratively, as a `defineX` factory:\n\n```ts title=\"modules/blog/index.ts\"\n// modules/blog/index.ts\nimport { defineModule } from '@kwiva/core'\n\nexport default defineModule({\n  name: '@acme/blog',\n  version: '1.0.0',\n\n  models:      () => import.meta.glob('./models/**/*.ts'),\n  controllers: () => import.meta.glob('./controllers/**/*.ts'),\n  pages:       () => import.meta.glob('./pages/**/*.tsx'),\n  jobs:        () => import.meta.glob('./jobs/**/*.ts'),\n  events:      () => import.meta.glob('./events/**/*.ts'),\n  tasks:       () => import.meta.glob('./tasks/**/*.ts'),\n  policies:    () => import.meta.glob('./policies/**/*.ts'),\n  migrations:  './database/migrations',\n\n  config: {\n    blog: { postsPerPage: 10 },\n  },\n\n  boot: async ({ config, models }) => { /* ... */ },\n  shutdown: async () => { /* ... */ },\n})\n```\n\n`name` and `version` identify the module; every contribution is optional. A module that ships only pages is as valid as one that ships the full vertical stack.\n\n## Contribution Points [#contribution-points]\n\nA module can contribute any construct an application can:\n\n| Construct           | Contribution                                                         |\n| ------------------- | -------------------------------------------------------------------- |\n| `models`            | `defineModel` files that derive routes, client types, Studio screens |\n| `controllers`       | API surface under the module's scope                                 |\n| `middleware`        | Pipeline stages available to the app                                 |\n| `pages`             | Frontend routes registered under the module's route scope            |\n| `jobs` `events`     | Background work and domain events                                    |\n| `tasks`             | Scheduled work                                                       |\n| `policies`          | Authorization rules in the module's permission namespace             |\n| `migrations`        | Schema steps applied with the app's migrations                       |\n| `config`            | Typed, namespaced defaults the app can override                      |\n| `channels`          | Realtime channels plus their policies                                |\n| `boot` / `shutdown` | Module lifecycle join and teardown                                   |\n| `requires`          | Declared peer ranges for `@kwiva/*` dependencies                     |\n\nContribution points are referenced as lazy globs relative to the module entry, so everything a module ships stays co-located in one folder. Adding a file to a module folder is adding a capability — no registry edits inside the module.\n\n## A Local Module Layout [#a-local-module-layout]\n\nA module is a folder, and its internal tree mirrors the app tree it will join. A representative chat module:\n\n```text title=\"a-local-module-layout.txt\"\nmodules/chat/\n├─ index.ts                  # defineModule entry\n├─ models/\n│  ├─ rooms.ts\n│  └─ messages.ts\n├─ controllers/chat.ts\n├─ middleware/chat-auth.ts\n├─ policies/chat.ts\n├─ pages/\n│  └─ index.tsx\n├─ jobs/send-message-notification.ts\n├─ events/message-posted.ts\n├─ tasks/archive-old-rooms.ts\n└─ migrations/\n   ├─ 0001_create_rooms.ts\n   └─ 0002_create_messages.ts\n```\n\nEach subfolder uses the same [defineX](/docs/core-concepts/definex) conventions as the app — which is why the kernel can mount a module's contributions with the exact same pipeline it uses for app files. The globs in the `defineModule` declaration are the only wiring; everything else is convention.\n\n## Module Registry [#module-registry]\n\nModules are registered in the application configuration:\n\n```ts title=\"kwiva.config.ts\"\n// kwiva.config.ts\nimport { defineConfig } from '@kwiva/config'\n\nexport default defineConfig({\n  modules: ['@kwiva/blog', './modules/analytics', '@acme/admin'],\n})\n```\n\nFirst-party modules, local modules, and published packages share one registry. `kwiva add <addon>` installs and registers in a single step — see [Addons](/docs/modules-plugins/addons).\n\n## Composing with the Kernel [#composing-with-the-kernel]\n\nModules join the kernel before model scan and route registration (see [Applications](/docs/core-concepts/applications) and [Application Composition](/docs/modules-plugins/composition)):\n\n1. The kernel resolves the `modules[]` registry and loads each module's definition.\n2. Module contributions merge with app constructs — namespacing keeps them distinct.\n3. Module config defaults merge under their namespaces, overridable by the app.\n4. Module migrations order before app migrations.\n5. Generated routes, client types, and Studio screens include module-owned resources.\n\nThe result behaves exactly like app-authored code: a module's model has generated endpoints and client types; a module's page participates in routing and hydration. By [composition](/docs/core-concepts/applications), modules are not a separate tier your features graduate into — they are packaging.\n\n## Namespacing and Boundaries [#namespacing-and-boundaries]\n\nModules interoperate under hard contracts rather than imports:\n\n* **Model namespacing** — model and resource names are prefixed by the module scope (`chat.rooms`, never bare `rooms`).\n* **Route prefixing** — page and API paths mount under the module's declared prefix; no two modules claim the same namespace.\n* **Config namespacing** — module defaults register under their namespaces and are overridable by the app through the standard precedence (defaults, config folder, inline — inline wins).\n* **Policy namespacing** — policies live in the module's permission namespace (`chat.member`, not `member`).\n* **Isolation** — modules never import each other's internals; they interoperate only through published contribution points.\n* **Migration ordering** — module migrations apply before application migrations and are versioned by module version.\n\nThese rules are what let third-party modules be composed safely: a module cannot silently shadow your models, routes, or config keys.\n\n## Lifecycle and Peer Requirements [#lifecycle-and-peer-requirements]\n\n* `boot` runs when the module joins the app, with typed access to config, models, and providers.\n* `shutdown` runs during app teardown, inverting boot order with the rest of the kernel.\n* `requires` declares compatible versions of `@kwiva/*` packages; addon tooling respects these ranges when resolving upgrades.\n\nThe kernel merges module contributions during boot, before model scan and route registration — see [Applications](/docs/core-concepts/applications).\n\n## Publishing a Module [#publishing-a-module]\n\n`kwiva module:build` packages a module: the contribution manifest plus a compiled distribution with isolated type declarations. The registry contract is a published package that exports the `defineModule` result as its default export, is tagged with the `kwiva-addon` keyword, and declares `requires` so apps resolve compatible versions. See [Addons & Distribution](/docs/modules-plugins/addons) for the full workflow.\n\n## Modules vs Plugins [#modules-vs-plugins]\n\n|                  | Module (`defineModule`)                            | Plugin (`definePlugin`)                         |\n| ---------------- | -------------------------------------------------- | ----------------------------------------------- |\n| Scope            | Application feature                                | Framework behavior                              |\n| Contributes      | Models, controllers, pages, jobs, config, channels | Middleware, services, hooks, context extensions |\n| Contribute shape | Declarative globs and options                      | Programmatic setup and boot functions           |\n| Distribution     | Addon packages                                     | Addon packages                                  |\n| Example          | Blog, analytics, admin                             | Request timing, legacy compatibility            |\n\nChoose a module to add a feature, a plugin to change how the framework behaves. The comparison is detailed on [Plugins](/docs/core-concepts/plugins).\n\n## What's Next [#whats-next]\n\n1. [Defining Modules](/docs/modules-plugins/defining-modules) — contribution points in detail\n2. [Application Composition](/docs/modules-plugins/composition) — how modules join the kernel at boot\n3. [Addons](/docs/modules-plugins/addons) — installing and distributing modules\n4. [Applications](/docs/core-concepts/applications) — the kernel that merges module contributions\n5. [Plugins](/docs/core-concepts/plugins) — programmatic extension for comparison\n";
var structuredData = {
	"contents": [
		{
			"heading": "what-is-a-module",
			"content": "A module is a self-contained feature package. It bundles related constructs — models, controllers, pages, jobs, events, tasks, policies, migrations, config, and channels — and composes them into an application with one declaration. A blog, an analytics panel, or an admin console are all natural modules: each is a vertical slice that owns its models, its API, its UI, and its background work."
		},
		{
			"heading": "what-is-a-module",
			"content": "Modules are how Kwiva scales beyond a single app folder. Everything a module contributes is namespaced and versioned, so any number of modules can coexist in an application without colliding, and each can evolve independently. See Defining Modules for the full authoring reference."
		},
		{
			"heading": "the-definemodule-factory",
			"content": "A module is defined like every other construct — declaratively, as a `defineX` factory:"
		},
		{
			"heading": "the-definemodule-factory",
			"content": "`name` and `version` identify the module; every contribution is optional. A module that ships only pages is as valid as one that ships the full vertical stack."
		},
		{
			"heading": "contribution-points",
			"content": "A module can contribute any construct an application can:"
		},
		{
			"heading": "contribution-points",
			"content": "Construct"
		},
		{
			"heading": "contribution-points",
			"content": "Contribution"
		},
		{
			"heading": "contribution-points",
			"content": "`models`"
		},
		{
			"heading": "contribution-points",
			"content": "`defineModel` files that derive routes, client types, Studio screens"
		},
		{
			"heading": "contribution-points",
			"content": "`controllers`"
		},
		{
			"heading": "contribution-points",
			"content": "API surface under the module's scope"
		},
		{
			"heading": "contribution-points",
			"content": "`middleware`"
		},
		{
			"heading": "contribution-points",
			"content": "Pipeline stages available to the app"
		},
		{
			"heading": "contribution-points",
			"content": "`pages`"
		},
		{
			"heading": "contribution-points",
			"content": "Frontend routes registered under the module's route scope"
		},
		{
			"heading": "contribution-points",
			"content": "`jobs` `events`"
		},
		{
			"heading": "contribution-points",
			"content": "Background work and domain events"
		},
		{
			"heading": "contribution-points",
			"content": "`tasks`"
		},
		{
			"heading": "contribution-points",
			"content": "Scheduled work"
		},
		{
			"heading": "contribution-points",
			"content": "`policies`"
		},
		{
			"heading": "contribution-points",
			"content": "Authorization rules in the module's permission namespace"
		},
		{
			"heading": "contribution-points",
			"content": "`migrations`"
		},
		{
			"heading": "contribution-points",
			"content": "Schema steps applied with the app's migrations"
		},
		{
			"heading": "contribution-points",
			"content": "`config`"
		},
		{
			"heading": "contribution-points",
			"content": "Typed, namespaced defaults the app can override"
		},
		{
			"heading": "contribution-points",
			"content": "`channels`"
		},
		{
			"heading": "contribution-points",
			"content": "Realtime channels plus their policies"
		},
		{
			"heading": "contribution-points",
			"content": "`boot` / `shutdown`"
		},
		{
			"heading": "contribution-points",
			"content": "Module lifecycle join and teardown"
		},
		{
			"heading": "contribution-points",
			"content": "`requires`"
		},
		{
			"heading": "contribution-points",
			"content": "Declared peer ranges for `@kwiva/*` dependencies"
		},
		{
			"heading": "contribution-points",
			"content": "Contribution points are referenced as lazy globs relative to the module entry, so everything a module ships stays co-located in one folder. Adding a file to a module folder is adding a capability — no registry edits inside the module."
		},
		{
			"heading": "a-local-module-layout",
			"content": "A module is a folder, and its internal tree mirrors the app tree it will join. A representative chat module:"
		},
		{
			"heading": "a-local-module-layout",
			"content": "Each subfolder uses the same defineX conventions as the app — which is why the kernel can mount a module's contributions with the exact same pipeline it uses for app files. The globs in the `defineModule` declaration are the only wiring; everything else is convention."
		},
		{
			"heading": "module-registry",
			"content": "Modules are registered in the application configuration:"
		},
		{
			"heading": "module-registry",
			"content": "First-party modules, local modules, and published packages share one registry. `kwiva add <addon>` installs and registers in a single step — see Addons."
		},
		{
			"heading": "composing-with-the-kernel",
			"content": "Modules join the kernel before model scan and route registration (see Applications and Application Composition):"
		},
		{
			"heading": "composing-with-the-kernel",
			"content": "The kernel resolves the `modules[]` registry and loads each module's definition."
		},
		{
			"heading": "composing-with-the-kernel",
			"content": "Module contributions merge with app constructs — namespacing keeps them distinct."
		},
		{
			"heading": "composing-with-the-kernel",
			"content": "Module config defaults merge under their namespaces, overridable by the app."
		},
		{
			"heading": "composing-with-the-kernel",
			"content": "Module migrations order before app migrations."
		},
		{
			"heading": "composing-with-the-kernel",
			"content": "Generated routes, client types, and Studio screens include module-owned resources."
		},
		{
			"heading": "composing-with-the-kernel",
			"content": "The result behaves exactly like app-authored code: a module's model has generated endpoints and client types; a module's page participates in routing and hydration. By composition, modules are not a separate tier your features graduate into — they are packaging."
		},
		{
			"heading": "namespacing-and-boundaries",
			"content": "Modules interoperate under hard contracts rather than imports:"
		},
		{
			"heading": "namespacing-and-boundaries",
			"content": "**Model namespacing** — model and resource names are prefixed by the module scope (`chat.rooms`, never bare `rooms`)."
		},
		{
			"heading": "namespacing-and-boundaries",
			"content": "**Route prefixing** — page and API paths mount under the module's declared prefix; no two modules claim the same namespace."
		},
		{
			"heading": "namespacing-and-boundaries",
			"content": "**Config namespacing** — module defaults register under their namespaces and are overridable by the app through the standard precedence (defaults, config folder, inline — inline wins)."
		},
		{
			"heading": "namespacing-and-boundaries",
			"content": "**Policy namespacing** — policies live in the module's permission namespace (`chat.member`, not `member`)."
		},
		{
			"heading": "namespacing-and-boundaries",
			"content": "**Isolation** — modules never import each other's internals; they interoperate only through published contribution points."
		},
		{
			"heading": "namespacing-and-boundaries",
			"content": "**Migration ordering** — module migrations apply before application migrations and are versioned by module version."
		},
		{
			"heading": "namespacing-and-boundaries",
			"content": "These rules are what let third-party modules be composed safely: a module cannot silently shadow your models, routes, or config keys."
		},
		{
			"heading": "lifecycle-and-peer-requirements",
			"content": "`boot` runs when the module joins the app, with typed access to config, models, and providers."
		},
		{
			"heading": "lifecycle-and-peer-requirements",
			"content": "`shutdown` runs during app teardown, inverting boot order with the rest of the kernel."
		},
		{
			"heading": "lifecycle-and-peer-requirements",
			"content": "`requires` declares compatible versions of `@kwiva/*` packages; addon tooling respects these ranges when resolving upgrades."
		},
		{
			"heading": "lifecycle-and-peer-requirements",
			"content": "The kernel merges module contributions during boot, before model scan and route registration — see Applications."
		},
		{
			"heading": "publishing-a-module",
			"content": "`kwiva module:build` packages a module: the contribution manifest plus a compiled distribution with isolated type declarations. The registry contract is a published package that exports the `defineModule` result as its default export, is tagged with the `kwiva-addon` keyword, and declares `requires` so apps resolve compatible versions. See Addons & Distribution for the full workflow."
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Module (`defineModule`)"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Plugin (`definePlugin`)"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Scope"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Application feature"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Framework behavior"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Contributes"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Models, controllers, pages, jobs, config, channels"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Middleware, services, hooks, context extensions"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Contribute shape"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Declarative globs and options"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Programmatic setup and boot functions"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Distribution"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Addon packages"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Addon packages"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Example"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Blog, analytics, admin"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Request timing, legacy compatibility"
		},
		{
			"heading": "modules-vs-plugins",
			"content": "Choose a module to add a feature, a plugin to change how the framework behaves. The comparison is detailed on Plugins."
		},
		{
			"heading": "whats-next",
			"content": "Defining Modules — contribution points in detail"
		},
		{
			"heading": "whats-next",
			"content": "Application Composition — how modules join the kernel at boot"
		},
		{
			"heading": "whats-next",
			"content": "Addons — installing and distributing modules"
		},
		{
			"heading": "whats-next",
			"content": "Applications — the kernel that merges module contributions"
		},
		{
			"heading": "whats-next",
			"content": "Plugins — programmatic extension for comparison"
		}
	],
	"headings": [
		{
			"id": "what-is-a-module",
			"content": "What is a Module?"
		},
		{
			"id": "the-definemodule-factory",
			"content": "The `defineModule` Factory"
		},
		{
			"id": "contribution-points",
			"content": "Contribution Points"
		},
		{
			"id": "a-local-module-layout",
			"content": "A Local Module Layout"
		},
		{
			"id": "module-registry",
			"content": "Module Registry"
		},
		{
			"id": "composing-with-the-kernel",
			"content": "Composing with the Kernel"
		},
		{
			"id": "namespacing-and-boundaries",
			"content": "Namespacing and Boundaries"
		},
		{
			"id": "lifecycle-and-peer-requirements",
			"content": "Lifecycle and Peer Requirements"
		},
		{
			"id": "publishing-a-module",
			"content": "Publishing a Module"
		},
		{
			"id": "modules-vs-plugins",
			"content": "Modules vs Plugins"
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
		url: "#what-is-a-module",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What is a Module?" })
	},
	{
		depth: 2,
		url: "#the-definemodule-factory",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)("code", { children: "defineModule" }),
			" Factory"
		] })
	},
	{
		depth: 2,
		url: "#contribution-points",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Contribution Points" })
	},
	{
		depth: 2,
		url: "#a-local-module-layout",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "A Local Module Layout" })
	},
	{
		depth: 2,
		url: "#module-registry",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Module Registry" })
	},
	{
		depth: 2,
		url: "#composing-with-the-kernel",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Composing with the Kernel" })
	},
	{
		depth: 2,
		url: "#namespacing-and-boundaries",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Namespacing and Boundaries" })
	},
	{
		depth: 2,
		url: "#lifecycle-and-peer-requirements",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Lifecycle and Peer Requirements" })
	},
	{
		depth: 2,
		url: "#publishing-a-module",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Publishing a Module" })
	},
	{
		depth: 2,
		url: "#modules-vs-plugins",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Modules vs Plugins" })
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
			id: "what-is-a-module",
			children: "What is a Module?"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A module is a self-contained feature package. It bundles related constructs — models, controllers, pages, jobs, events, tasks, policies, migrations, config, and channels — and composes them into an application with one declaration. A blog, an analytics panel, or an admin console are all natural modules: each is a vertical slice that owns its models, its API, its UI, and its background work." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Modules are how Kwiva scales beyond a single app folder. Everything a module contributes is namespaced and versioned, so any number of modules can coexist in an application without colliding, and each can evolve independently. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/defining-modules",
				children: "Defining Modules"
			}),
			" for the full authoring reference."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "the-definemodule-factory",
			children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
				" Factory"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A module is defined like every other construct — declaratively, as a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factory:"
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
			title: "modules/blog/index.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// modules/blog/index.ts"
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
							children: " { defineModule } "
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
							children: " default"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " defineModule"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  name: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'@acme/blog'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
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
							children: "  version: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'1.0.0'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  models"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":      () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./models/**/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
						})
					]
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
							children: "  controllers"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./controllers/**/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
						})
					]
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
							children: "  pages"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":       () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./pages/**/*.tsx'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
						})
					]
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
							children: "  jobs"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":        () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./jobs/**/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
						})
					]
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
							children: "  events"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":      () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./events/**/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
						})
					]
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
							children: "  tasks"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":       () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./tasks/**/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
						})
					]
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
							children: "  policies"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":    () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./policies/**/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
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
							children: "  migrations:  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./database/migrations'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
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
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  config: {"
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
							children: "    blog: { postsPerPage: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "10"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  boot"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
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
							children: " ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "config"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "models"
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
							children: " { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "/* ... */"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  shutdown"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
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
							children: " () "
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
							children: " { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "/* ... */"
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
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "name" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "version" }),
			" identify the module; every contribution is optional. A module that ships only pages is as valid as one that ships the full vertical stack."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "contribution-points",
			children: "Contribution Points"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A module can contribute any construct an application can:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Construct" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Contribution" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }), " files that derive routes, client types, Studio screens"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "controllers" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API surface under the module's scope" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "middleware" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pipeline stages available to the app" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pages" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Frontend routes registered under the module's route scope" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "jobs" }),
				" ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "events" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Background work and domain events" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tasks" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scheduled work" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "policies" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authorization rules in the module's permission namespace" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "migrations" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Schema steps applied with the app's migrations" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Typed, namespaced defaults the app can override" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "channels" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Realtime channels plus their policies" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "boot" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "shutdown" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Module lifecycle join and teardown" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Declared peer ranges for ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" dependencies"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Contribution points are referenced as lazy globs relative to the module entry, so everything a module ships stays co-located in one folder. Adding a file to a module folder is adding a capability — no registry edits inside the module." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "a-local-module-layout",
			children: "A Local Module Layout"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A module is a folder, and its internal tree mirrors the app tree it will join. A representative chat module:" }),
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
			title: "a-local-module-layout.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "modules/chat/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ index.ts                  # defineModule entry" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ models/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ rooms.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  └─ messages.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ controllers/chat.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ middleware/chat-auth.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ policies/chat.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ pages/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  └─ index.tsx" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ jobs/send-message-notification.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ events/message-posted.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ tasks/archive-old-rooms.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "└─ migrations/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   ├─ 0001_create_rooms.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   └─ 0002_create_messages.ts" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each subfolder uses the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "defineX"
			}),
			" conventions as the app — which is why the kernel can mount a module's contributions with the exact same pipeline it uses for app files. The globs in the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
			" declaration are the only wiring; everything else is convention."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "module-registry",
			children: "Module Registry"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Modules are registered in the application configuration:" }),
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
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { defineConfig } "
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
							children: " '@kwiva/config'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  modules: ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'@kwiva/blog'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./modules/analytics'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'@acme/admin'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "],"
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
			"First-party modules, local modules, and published packages share one registry. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add <addon>" }),
			" installs and registers in a single step — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/addons",
				children: "Addons"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "composing-with-the-kernel",
			children: "Composing with the Kernel"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Modules join the kernel before model scan and route registration (see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/composition",
				children: "Application Composition"
			}),
			"):"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The kernel resolves the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "modules[]" }),
				" registry and loads each module's definition."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Module contributions merge with app constructs — namespacing keeps them distinct." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Module config defaults merge under their namespaces, overridable by the app." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Module migrations order before app migrations." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Generated routes, client types, and Studio screens include module-owned resources." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The result behaves exactly like app-authored code: a module's model has generated endpoints and client types; a module's page participates in routing and hydration. By ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "composition"
			}),
			", modules are not a separate tier your features graduate into — they are packaging."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "namespacing-and-boundaries",
			children: "Namespacing and Boundaries"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Modules interoperate under hard contracts rather than imports:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Model namespacing" }),
				" — model and resource names are prefixed by the module scope (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.rooms" }),
				", never bare ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rooms" }),
				")."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Route prefixing" }), " — page and API paths mount under the module's declared prefix; no two modules claim the same namespace."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Config namespacing" }), " — module defaults register under their namespaces and are overridable by the app through the standard precedence (defaults, config folder, inline — inline wins)."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Policy namespacing" }),
				" — policies live in the module's permission namespace (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.member" }),
				", not ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "member" }),
				")."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Isolation" }), " — modules never import each other's internals; they interoperate only through published contribution points."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Migration ordering" }), " — module migrations apply before application migrations and are versioned by module version."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "These rules are what let third-party modules be composed safely: a module cannot silently shadow your models, routes, or config keys." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "lifecycle-and-peer-requirements",
			children: "Lifecycle and Peer Requirements"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "boot" }), " runs when the module joins the app, with typed access to config, models, and providers."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "shutdown" }), " runs during app teardown, inverting boot order with the rest of the kernel."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
				" declares compatible versions of ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" packages; addon tooling respects these ranges when resolving upgrades."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The kernel merges module contributions during boot, before model scan and route registration — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "publishing-a-module",
			children: "Publishing a Module"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva module:build" }),
			" packages a module: the contribution manifest plus a compiled distribution with isolated type declarations. The registry contract is a published package that exports the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
			" result as its default export, is tagged with the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva-addon" }),
			" keyword, and declares ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
			" so apps resolve compatible versions. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/addons",
				children: "Addons & Distribution"
			}),
			" for the full workflow."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "modules-vs-plugins",
			children: "Modules vs Plugins"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, {}),
			(0, import_jsx_runtime_react_server.jsxs)(_components.th, { children: [
				"Module (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
				")"
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.th, { children: [
				"Plugin (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePlugin" }),
				")"
			] })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scope" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Application feature" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Framework behavior" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Contributes" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Models, controllers, pages, jobs, config, channels" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Middleware, services, hooks, context extensions" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Contribute shape" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Declarative globs and options" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Programmatic setup and boot functions" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Distribution" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Addon packages" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Addon packages" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Example" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Blog, analytics, admin" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Request timing, legacy compatibility" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Choose a module to add a feature, a plugin to change how the framework behaves. The comparison is detailed on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/plugins",
				children: "Plugins"
			}),
			"."
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
				href: "/docs/modules-plugins/defining-modules",
				children: "Defining Modules"
			}), " — contribution points in detail"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/composition",
				children: "Application Composition"
			}), " — how modules join the kernel at boot"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/addons",
				children: "Addons"
			}), " — installing and distributing modules"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}), " — the kernel that merges module contributions"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/plugins",
				children: "Plugins"
			}), " — programmatic extension for comparison"] }),
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
