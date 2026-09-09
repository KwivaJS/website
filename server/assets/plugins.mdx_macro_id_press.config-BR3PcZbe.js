import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/core-concepts/plugins.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Plugins",
	"description": "definePlugin — extend the framework itself. Plugin lifecycle, hooks, and when to reach for a plugin instead of a module."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\n## What is a Plugin? [#what-is-a-plugin]\n\nPlugins extend the framework itself. Where a module composes first-party constructs — models, controllers, pages — into an application feature, a plugin hooks into the framework's own behavior: intercepting boot, contributing middleware, registering services, or augmenting the context. Plugins are programmatic packages; modules are declarative packages.\n\nThe distinction is one of target. A plugin changes what the framework does for every request, every route, or at boot and shutdown. Request timing, default security headers, a compatibility shim, or a tracing integration are plugins. A blog, an analytics panel, or an admin console are modules.\n\n## The `definePlugin` Factory [#the-defineplugin-factory]\n\n```ts title=\"the-defineplugin-factory.ts\"\nimport { definePlugin } from '@kwiva/core'\n\nexport default definePlugin('request-timing', {\n  setup(app) {\n    app.on('before:handle', ({ start }) => {\n      const t0 = performance.now()\n      return () => console.log(`handled in ${performance.now() - t0}ms`)\n    })\n  },\n})\n```\n\nLike every `defineX` factory, `definePlugin` takes a name and an options object. The options are the plugin's contract: lifecycle functions that receive the application and mutate framework behavior programmatically.\n\n## Plugin Lifecycle [#plugin-lifecycle]\n\nPlugins participate in the application lifecycle at defined hook points. The hooks run in order as the kernel boots and stops:\n\n| Hook       | When                                    | Use                                                  |\n| ---------- | --------------------------------------- | ---------------------------------------------------- |\n| `booting`  | Before the app registers its constructs | Configure providers and defaults                     |\n| `setup`    | After boot, before serving              | Register middleware, services, or context extensions |\n| `starting` | When the app starts serving             | Allocate connections, start watchers                 |\n| `stopping` | When the app shuts down                 | Dispose connections, flush queues                    |\n\nThe hooks align with the kernel's boot sequence described in [Lifecycle](/docs/core-concepts/lifecycle) and [Applications](/docs/core-concepts/applications): a plugin's `booting` runs before construct registration, `setup` runs after providers boot and before listen, and `stopping` participates in inverted shutdown. Ordering between plugins is deterministic, so a plugin can rely on another plugin's `setup` having run.\n\n## What a Plugin Can Do [#what-a-plugin-can-do]\n\nA plugin can contribute the same constructs an application can, plus framework-level wiring:\n\n* middleware into the global stack\n* services into the container\n* context extensions via `state` and `decorate`\n* error mapping and handlers\n* lifecycle behavior at every hook\n\n```ts title=\"what-a-plugin-can-do.ts\"\nimport { definePlugin } from '@kwiva/core'\n\nexport default definePlugin('legacy-compat', {\n  boot(app) {\n    app.middleware(['legacy-session'])\n    app.decorate('legacyRequestId', () => crypto.randomUUID())\n  },\n})\n```\n\nAnything a plugin registers is available exactly like an app-authored equivalent: the middleware appears in scopes, decorated keys appear on the context, and error handlers participate in the shared taxonomy. See [Middleware](/docs/http/middleware), [Context](/docs/core-concepts/context), and [Error Handling](/docs/core-concepts/error-handling).\n\n## How Plugins Receive the App [#how-plugins-receive-the-app]\n\nLifecycle hooks receive the application object, and through it a small set of programmatic operations:\n\n| Method                     | What it does                                           |\n| -------------------------- | ------------------------------------------------------ |\n| `app.on(event, handler)`   | Attach a handler to a lifecycle event or pipeline hook |\n| `app.middleware([...])`    | Add named middleware to the global stack               |\n| `app.decorate(key, value)` | Extend the context with a singleton or resolver        |\n| `app.error(...)`           | Register error mapping or handlers                     |\n| `app.state(...)`           | Declare typed store fields                             |\n\nThe set is deliberately small — plugin authors reach for the same public surface application code uses, never for engine internals or private pipeline wiring. This keeps plugin behavior auditable: a plugin changes the framework through framework APIs.\n\n## Ordering Between Plugins [#ordering-between-plugins]\n\nPlugin hooks run in a deterministic order, which lets plugins build on each other:\n\n* `booting` hooks run in registration order before construct registration.\n* `setup` hooks run in order after providers boot and before listen.\n* `starting` and `stopping` mirror the kernel's start and inverted shutdown.\n\nBecause ordering is stable, a plugin can rely on another plugin's `setup` having run — for example, a tracing plugin can expect the session plugin's context extensions to exist. Document any ordering requirement in the plugin's `requires` metadata alongside peer ranges.\n\n## A Practical Example [#a-practical-example]\n\nA plugin that times every request end to end combines several framework surfaces:\n\n```ts title=\"a-practical-example.ts\"\nimport { definePlugin } from '@kwiva/core'\n\nexport default definePlugin('request-timing', {\n  setup(app) {\n    app.decorate('timing', () => ({ started: performance.now() }))\n  },\n  boot(app) {\n    app.on('onResponse', async ({ store }) => {\n      const started = store.timing?.started ?? performance.now()\n      console.log(`request took ${performance.now() - started}ms`)\n    })\n  },\n})\n```\n\nThe example shows the shape most plugins share: decorate to prepare, hook to observe, and let the pipeline flow unchanged.\n\n## Plugins vs Modules [#plugins-vs-modules]\n\n|                  | Plugin (`definePlugin`)                              | Module (`defineModule`)                            |\n| ---------------- | ---------------------------------------------------- | -------------------------------------------------- |\n| Scope            | Framework behavior                                   | Application feature                                |\n| Contributes      | Middleware, services, hooks, context, error handling | Models, controllers, pages, jobs, config, channels |\n| Contribute shape | Programmatic `setup` / `boot` functions              | Declarative globs and options                      |\n| Distribution     | Addon packages                                       | Addon packages                                     |\n| Example          | Request timing, security defaults, legacy compat     | Blog, analytics, admin                             |\n\nWhen in doubt, prefer a **module**. Most capabilities are features, not framework extensions. Reach for a plugin only when you need to change how the framework itself behaves — for example, shifting the middleware stack, altering context assembly, or running work at boot and shutdown for every app that installs the plugin.\n\n## Authoring Rules [#authoring-rules]\n\n* Keep plugins small and focused — one behavior per plugin, named clearly.\n* Prefer configuration over code where the framework already offers it. If a behavior can be expressed in the config folder, it belongs there, not in a plugin.\n* Use lifecycle hooks at the narrowest scope that works. A plugin that only adds middleware does not need `starting` or `stopping`.\n* Respect the shared boundaries: a plugin must not import engine internals or re-architect pipeline stages; it uses the same public surface as application code.\n\n> \\[!NOTE]\n> Both modules and plugins ship as addon packages with the `kwiva-addon` keyword. The difference is internal: a module declares contributions as data, a plugin executes behavior against the app. See [Addons](/docs/modules-plugins/addons) for distribution.\n\n## What's Next [#whats-next]\n\n1. [Modules](/docs/core-concepts/modules) — declarative feature composition, the preferred default\n2. [Defining Modules](/docs/modules-plugins/defining-modules) — contribution points in detail\n3. [Applications](/docs/core-concepts/applications) — the kernel a plugin hooks into\n4. [Lifecycle](/docs/core-concepts/lifecycle) — where plugin hooks fit in boot and request processing\n5. [Addons](/docs/modules-plugins/addons) — distributing plugins and modules\n";
var structuredData = {
	"contents": [
		{
			"heading": "what-is-a-plugin",
			"content": "Plugins extend the framework itself. Where a module composes first-party constructs — models, controllers, pages — into an application feature, a plugin hooks into the framework's own behavior: intercepting boot, contributing middleware, registering services, or augmenting the context. Plugins are programmatic packages; modules are declarative packages."
		},
		{
			"heading": "what-is-a-plugin",
			"content": "The distinction is one of target. A plugin changes what the framework does for every request, every route, or at boot and shutdown. Request timing, default security headers, a compatibility shim, or a tracing integration are plugins. A blog, an analytics panel, or an admin console are modules."
		},
		{
			"heading": "the-defineplugin-factory",
			"content": "Like every `defineX` factory, `definePlugin` takes a name and an options object. The options are the plugin's contract: lifecycle functions that receive the application and mutate framework behavior programmatically."
		},
		{
			"heading": "plugin-lifecycle",
			"content": "Plugins participate in the application lifecycle at defined hook points. The hooks run in order as the kernel boots and stops:"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "Hook"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "When"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "Use"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "`booting`"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "Before the app registers its constructs"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "Configure providers and defaults"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "`setup`"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "After boot, before serving"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "Register middleware, services, or context extensions"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "`starting`"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "When the app starts serving"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "Allocate connections, start watchers"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "`stopping`"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "When the app shuts down"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "Dispose connections, flush queues"
		},
		{
			"heading": "plugin-lifecycle",
			"content": "The hooks align with the kernel's boot sequence described in Lifecycle and Applications: a plugin's `booting` runs before construct registration, `setup` runs after providers boot and before listen, and `stopping` participates in inverted shutdown. Ordering between plugins is deterministic, so a plugin can rely on another plugin's `setup` having run."
		},
		{
			"heading": "what-a-plugin-can-do",
			"content": "A plugin can contribute the same constructs an application can, plus framework-level wiring:"
		},
		{
			"heading": "what-a-plugin-can-do",
			"content": "middleware into the global stack"
		},
		{
			"heading": "what-a-plugin-can-do",
			"content": "services into the container"
		},
		{
			"heading": "what-a-plugin-can-do",
			"content": "context extensions via `state` and `decorate`"
		},
		{
			"heading": "what-a-plugin-can-do",
			"content": "error mapping and handlers"
		},
		{
			"heading": "what-a-plugin-can-do",
			"content": "lifecycle behavior at every hook"
		},
		{
			"heading": "what-a-plugin-can-do",
			"content": "Anything a plugin registers is available exactly like an app-authored equivalent: the middleware appears in scopes, decorated keys appear on the context, and error handlers participate in the shared taxonomy. See Middleware, Context, and Error Handling."
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "Lifecycle hooks receive the application object, and through it a small set of programmatic operations:"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "Method"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "What it does"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "`app.on(event, handler)`"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "Attach a handler to a lifecycle event or pipeline hook"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "`app.middleware([...])`"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "Add named middleware to the global stack"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "`app.decorate(key, value)`"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "Extend the context with a singleton or resolver"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "`app.error(...)`"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "Register error mapping or handlers"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "`app.state(...)`"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "Declare typed store fields"
		},
		{
			"heading": "how-plugins-receive-the-app",
			"content": "The set is deliberately small — plugin authors reach for the same public surface application code uses, never for engine internals or private pipeline wiring. This keeps plugin behavior auditable: a plugin changes the framework through framework APIs."
		},
		{
			"heading": "ordering-between-plugins",
			"content": "Plugin hooks run in a deterministic order, which lets plugins build on each other:"
		},
		{
			"heading": "ordering-between-plugins",
			"content": "`booting` hooks run in registration order before construct registration."
		},
		{
			"heading": "ordering-between-plugins",
			"content": "`setup` hooks run in order after providers boot and before listen."
		},
		{
			"heading": "ordering-between-plugins",
			"content": "`starting` and `stopping` mirror the kernel's start and inverted shutdown."
		},
		{
			"heading": "ordering-between-plugins",
			"content": "Because ordering is stable, a plugin can rely on another plugin's `setup` having run — for example, a tracing plugin can expect the session plugin's context extensions to exist. Document any ordering requirement in the plugin's `requires` metadata alongside peer ranges."
		},
		{
			"heading": "a-practical-example",
			"content": "A plugin that times every request end to end combines several framework surfaces:"
		},
		{
			"heading": "a-practical-example",
			"content": "The example shows the shape most plugins share: decorate to prepare, hook to observe, and let the pipeline flow unchanged."
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Plugin (`definePlugin`)"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Module (`defineModule`)"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Scope"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Framework behavior"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Application feature"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Contributes"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Middleware, services, hooks, context, error handling"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Models, controllers, pages, jobs, config, channels"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Contribute shape"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Programmatic `setup` / `boot` functions"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Declarative globs and options"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Distribution"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Addon packages"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Addon packages"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Example"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Request timing, security defaults, legacy compat"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "Blog, analytics, admin"
		},
		{
			"heading": "plugins-vs-modules",
			"content": "When in doubt, prefer a **module**. Most capabilities are features, not framework extensions. Reach for a plugin only when you need to change how the framework itself behaves — for example, shifting the middleware stack, altering context assembly, or running work at boot and shutdown for every app that installs the plugin."
		},
		{
			"heading": "authoring-rules",
			"content": "Keep plugins small and focused — one behavior per plugin, named clearly."
		},
		{
			"heading": "authoring-rules",
			"content": "Prefer configuration over code where the framework already offers it. If a behavior can be expressed in the config folder, it belongs there, not in a plugin."
		},
		{
			"heading": "authoring-rules",
			"content": "Use lifecycle hooks at the narrowest scope that works. A plugin that only adds middleware does not need `starting` or `stopping`."
		},
		{
			"heading": "authoring-rules",
			"content": "Respect the shared boundaries: a plugin must not import engine internals or re-architect pipeline stages; it uses the same public surface as application code."
		},
		{
			"heading": "authoring-rules",
			"content": "> \\[!NOTE]\n> Both modules and plugins ship as addon packages with the `kwiva-addon` keyword. The difference is internal: a module declares contributions as data, a plugin executes behavior against the app. See Addons for distribution."
		},
		{
			"heading": "whats-next",
			"content": "Modules — declarative feature composition, the preferred default"
		},
		{
			"heading": "whats-next",
			"content": "Defining Modules — contribution points in detail"
		},
		{
			"heading": "whats-next",
			"content": "Applications — the kernel a plugin hooks into"
		},
		{
			"heading": "whats-next",
			"content": "Lifecycle — where plugin hooks fit in boot and request processing"
		},
		{
			"heading": "whats-next",
			"content": "Addons — distributing plugins and modules"
		}
	],
	"headings": [
		{
			"id": "what-is-a-plugin",
			"content": "What is a Plugin?"
		},
		{
			"id": "the-defineplugin-factory",
			"content": "The `definePlugin` Factory"
		},
		{
			"id": "plugin-lifecycle",
			"content": "Plugin Lifecycle"
		},
		{
			"id": "what-a-plugin-can-do",
			"content": "What a Plugin Can Do"
		},
		{
			"id": "how-plugins-receive-the-app",
			"content": "How Plugins Receive the App"
		},
		{
			"id": "ordering-between-plugins",
			"content": "Ordering Between Plugins"
		},
		{
			"id": "a-practical-example",
			"content": "A Practical Example"
		},
		{
			"id": "plugins-vs-modules",
			"content": "Plugins vs Modules"
		},
		{
			"id": "authoring-rules",
			"content": "Authoring Rules"
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
		url: "#what-is-a-plugin",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What is a Plugin?" })
	},
	{
		depth: 2,
		url: "#the-defineplugin-factory",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)("code", { children: "definePlugin" }),
			" Factory"
		] })
	},
	{
		depth: 2,
		url: "#plugin-lifecycle",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Plugin Lifecycle" })
	},
	{
		depth: 2,
		url: "#what-a-plugin-can-do",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What a Plugin Can Do" })
	},
	{
		depth: 2,
		url: "#how-plugins-receive-the-app",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How Plugins Receive the App" })
	},
	{
		depth: 2,
		url: "#ordering-between-plugins",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Ordering Between Plugins" })
	},
	{
		depth: 2,
		url: "#a-practical-example",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "A Practical Example" })
	},
	{
		depth: 2,
		url: "#plugins-vs-modules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Plugins vs Modules" })
	},
	{
		depth: 2,
		url: "#authoring-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Authoring Rules" })
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
			id: "what-is-a-plugin",
			children: "What is a Plugin?"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Plugins extend the framework itself. Where a module composes first-party constructs — models, controllers, pages — into an application feature, a plugin hooks into the framework's own behavior: intercepting boot, contributing middleware, registering services, or augmenting the context. Plugins are programmatic packages; modules are declarative packages." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The distinction is one of target. A plugin changes what the framework does for every request, every route, or at boot and shutdown. Request timing, default security headers, a compatibility shim, or a tracing integration are plugins. A blog, an analytics panel, or an admin console are modules." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "the-defineplugin-factory",
			children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePlugin" }),
				" Factory"
			]
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
			title: "the-defineplugin-factory.ts",
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
							children: " { definePlugin } "
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
							children: " definePlugin"
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
							children: "'request-timing'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", {"
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
							children: "  setup"
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
							children: ") {"
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
							children: "    app."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "on"
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
							children: "'before:handle'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "start"
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
							children: "      const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " t0"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " performance."
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
							children: "()"
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
							children: "      return"
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
							children: " console."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "log"
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
							children: "`handled in ${"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "performance"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "."
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "() "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "-"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " t0"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "}ms`"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
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
						children: "    })"
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
			"Like every ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factory, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePlugin" }),
			" takes a name and an options object. The options are the plugin's contract: lifecycle functions that receive the application and mutate framework behavior programmatically."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "plugin-lifecycle",
			children: "Plugin Lifecycle"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Plugins participate in the application lifecycle at defined hook points. The hooks run in order as the kernel boots and stops:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Hook" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "When" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Use" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "booting" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Before the app registers its constructs" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Configure providers and defaults" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "setup" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "After boot, before serving" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Register middleware, services, or context extensions" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "starting" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "When the app starts serving" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Allocate connections, start watchers" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stopping" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "When the app shuts down" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dispose connections, flush queues" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The hooks align with the kernel's boot sequence described in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/lifecycle",
				children: "Lifecycle"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}),
			": a plugin's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "booting" }),
			" runs before construct registration, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "setup" }),
			" runs after providers boot and before listen, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stopping" }),
			" participates in inverted shutdown. Ordering between plugins is deterministic, so a plugin can rely on another plugin's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "setup" }),
			" having run."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-a-plugin-can-do",
			children: "What a Plugin Can Do"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A plugin can contribute the same constructs an application can, plus framework-level wiring:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "middleware into the global stack" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "services into the container" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"context extensions via ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "state" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "decorate" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "error mapping and handlers" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "lifecycle behavior at every hook" }),
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
			title: "what-a-plugin-can-do.ts",
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
							children: " { definePlugin } "
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
							children: " definePlugin"
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
							children: "'legacy-compat'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", {"
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
							children: "  boot"
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
							children: ") {"
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
							children: "    app."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "middleware"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'legacy-session'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "])"
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
							children: "    app."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "decorate"
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
							children: "'legacyRequestId'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", () "
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
							children: " crypto."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "randomUUID"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "())"
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
			"Anything a plugin registers is available exactly like an app-authored equivalent: the middleware appears in scopes, decorated keys appear on the context, and error handlers participate in the shared taxonomy. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/middleware",
				children: "Middleware"
			}),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/context",
				children: "Context"
			}),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/error-handling",
				children: "Error Handling"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-plugins-receive-the-app",
			children: "How Plugins Receive the App"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Lifecycle hooks receive the application object, and through it a small set of programmatic operations:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Method" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it does" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "app.on(event, handler)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Attach a handler to a lifecycle event or pipeline hook" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "app.middleware([...])" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Add named middleware to the global stack" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "app.decorate(key, value)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Extend the context with a singleton or resolver" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "app.error(...)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Register error mapping or handlers" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "app.state(...)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Declare typed store fields" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The set is deliberately small — plugin authors reach for the same public surface application code uses, never for engine internals or private pipeline wiring. This keeps plugin behavior auditable: a plugin changes the framework through framework APIs." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "ordering-between-plugins",
			children: "Ordering Between Plugins"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Plugin hooks run in a deterministic order, which lets plugins build on each other:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "booting" }), " hooks run in registration order before construct registration."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "setup" }), " hooks run in order after providers boot and before listen."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "starting" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stopping" }),
				" mirror the kernel's start and inverted shutdown."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because ordering is stable, a plugin can rely on another plugin's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "setup" }),
			" having run — for example, a tracing plugin can expect the session plugin's context extensions to exist. Document any ordering requirement in the plugin's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
			" metadata alongside peer ranges."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "a-practical-example",
			children: "A Practical Example"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A plugin that times every request end to end combines several framework surfaces:" }),
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
			title: "a-practical-example.ts",
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
							children: " { definePlugin } "
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
							children: " definePlugin"
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
							children: "'request-timing'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", {"
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
							children: "  setup"
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
							children: ") {"
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
							children: "    app."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "decorate"
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
							children: "'timing'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", () "
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
							children: " ({ started: performance."
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
							children: "() }))"
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
							children: "("
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
							children: ") {"
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
							children: "    app."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "on"
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
							children: "'onResponse'"
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
							children: "store"
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
							children: "      const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " started"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " store.timing?.started "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "??"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " performance."
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
							children: "()"
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
							children: "      console."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "log"
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
							children: "`request took ${"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "performance"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "."
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "() "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "-"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " started"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "}ms`"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
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
						children: "    })"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The example shows the shape most plugins share: decorate to prepare, hook to observe, and let the pipeline flow unchanged." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "plugins-vs-modules",
			children: "Plugins vs Modules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, {}),
			(0, import_jsx_runtime_react_server.jsxs)(_components.th, { children: [
				"Plugin (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePlugin" }),
				")"
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.th, { children: [
				"Module (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
				")"
			] })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scope" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Framework behavior" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Application feature" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Contributes" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Middleware, services, hooks, context, error handling" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Models, controllers, pages, jobs, config, channels" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Contribute shape" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Programmatic ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "setup" }),
					" / ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "boot" }),
					" functions"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Declarative globs and options" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Distribution" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Addon packages" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Addon packages" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Example" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Request timing, security defaults, legacy compat" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Blog, analytics, admin" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"When in doubt, prefer a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "module" }),
			". Most capabilities are features, not framework extensions. Reach for a plugin only when you need to change how the framework itself behaves — for example, shifting the middleware stack, altering context assembly, or running work at boot and shutdown for every app that installs the plugin."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "authoring-rules",
			children: "Authoring Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Keep plugins small and focused — one behavior per plugin, named clearly." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Prefer configuration over code where the framework already offers it. If a behavior can be expressed in the config folder, it belongs there, not in a plugin." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Use lifecycle hooks at the narrowest scope that works. A plugin that only adds middleware does not need ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "starting" }),
				" or ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stopping" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Respect the shared boundaries: a plugin must not import engine internals or re-architect pipeline stages; it uses the same public surface as application code." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nBoth modules and plugins ship as addon packages with the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva-addon" }),
				" keyword. The difference is internal: a module declares contributions as data, a plugin executes behavior against the app. See ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/modules-plugins/addons",
					children: "Addons"
				}),
				" for distribution."
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
				href: "/docs/core-concepts/modules",
				children: "Modules"
			}), " — declarative feature composition, the preferred default"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/defining-modules",
				children: "Defining Modules"
			}), " — contribution points in detail"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}), " — the kernel a plugin hooks into"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/lifecycle",
				children: "Lifecycle"
			}), " — where plugin hooks fit in boot and request processing"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/addons",
				children: "Addons"
			}), " — distributing plugins and modules"] }),
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
