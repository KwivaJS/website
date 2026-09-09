import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/modules-plugins/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Modules & Plugins",
	"description": "Package-level composition for Kwiva apps — defineModule caps into reusable capability packages, and the addon workflow installs and registers modules, plugins, and themes."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nModules and plugins are how Kwiva scales from a single application to a **platform**. Where `defineX` files compose a single app, `defineModule` composes reusable capabilities — models, controllers, pages, jobs, config, and migrations — that drop into any Kwiva application as a unit. Addons extend the same idea to the whole ecosystem: anything installable ships and lands through one workflow.\n\nThis section covers the full story in four pages:\n\n| Page                                                         | Purpose                                                                      |\n| ------------------------------------------------------------ | ---------------------------------------------------------------------------- |\n| [Defining Modules](/docs/modules-plugins/defining-modules)   | The `defineModule` factory and every contribution point                      |\n| [Application Composition](/docs/modules-plugins/composition) | How the kernel (`defineApp`) assembles an app from modules                   |\n| [Addons & Distribution](/docs/modules-plugins/addons)        | Install, search, version, and publish capabilities                           |\n| This page                                                    | The model: what modules, plugins, and addons are, and when to reach for them |\n\n## What Is a Module? [#what-is-a-module]\n\nA module is a **package-level capability**. One module can ship models, controllers, middleware, pages, jobs, events, tasks, policies, migrations, config defaults, and channel policies together, all namespaced so they never collide with your application code:\n\n```ts title=\"modules/chat/index.ts\"\n// modules/chat/index.ts\nimport { defineModule } from '@kwiva/core'\n\nexport default defineModule({\n  name: '@acme/chat',\n  version: '1.2.0',\n\n  // contribution points — all optional\n  models:      () => import.meta.glob('./models/*.ts'),       // rooms, messages\n  controllers: () => import.meta.glob('./controllers/*.ts'),  // chat\n  pages:       () => import.meta.glob('./pages/**/*.tsx'),    // ui additions\n  jobs:        () => import.meta.glob('./jobs/*.ts'),\n  migrations:  './migrations',                                 // applied with app migrations\n  config:      { chat: { maxMessageLength: 2000 } },          // namespaced defaults\n  channels:    { 'chat.{roomId}': { policy: 'chat.member' } },\n\n  boot: async ({ config, models, providers }) => { /* ... */ },\n  requires: { '@kwiva/core': '^1', '@kwiva/auth': '^1' },\n})\n```\n\nContributions merge into the application scan as if they were local — namespaced, versioned, and conflict-free. See [Defining Modules](/docs/modules-plugins/defining-modules) for the full surface, including lifecycle hooks and peer requirements.\n\n## Modules, Plugins, and Themes [#modules-plugins-and-themes]\n\nThe noun for \"installable capability\" is **addon**. An addon is any one of three kinds of package:\n\n| Kind   | It is                   | Example surface                                  |\n| ------ | ----------------------- | ------------------------------------------------ |\n| Module | A full-stack capability | models + controllers + pages + jobs + config     |\n| Plugin | An HTTP-level extension | middleware, route rules, lifecycle hooks         |\n| Theme  | A UI skin               | pages and components restyled through the ui-kit |\n\nAll three flow through the same install path — `kwiva add` — and are managed by the same `kwiva addons` commands. The distinction matters at authoring time: a module is authored with `defineModule`, a plugin with `definePlugin`, and a theme as a ui-kit skin; at consumption time they are all just \"addons.\"\n\n```bash title=\"terminal\"\nkwiva add @kwiva/blog               # a module: install + register + migrations check\nkwiva add ./addons/analytics --path # a local addon from a workspace path\nkwiva addons list                   # everything installed, with contributions and versions\n```\n\n## When to Reach for a Module [#when-to-reach-for-a-module]\n\nA module is the right unit when a capability is meant to be **reused across applications** — by your own team today, or by the ecosystem tomorrow. The framework's composition ladder makes the progression natural:\n\n1. **A static site** — model-less pages; the kernel with config + pages + prerender.\n2. **A CRUD app** — one model, zero controllers.\n3. **A SaaS** — auth, policies, tenancy, Studio.\n4. **Realtime** — events, channels, jobs.\n5. **A platform** — modules, MCP, multi-preset deploys.\n\nThe kernel shape never changes on the way up that ladder — only which `defineX` files and modules exist. If you catch yourself imagining the second application that will need the feature you are building, that is the moment to extract a module.\n\n## Contribution Points in Brief [#contribution-points-in-brief]\n\nA module declares what it contributes with globs — same lazy, scan-based convention as application files. The full surface is documented on [Defining Modules](/docs/modules-plugins/defining-modules); the key contributions:\n\n| Contribution                | What it adds                                             |\n| --------------------------- | -------------------------------------------------------- |\n| `models`                    | Database tables, generated routes, types, Studio screens |\n| `controllers`               | HTTP routes under the module's scope                     |\n| `pages`                     | UI additions under the module's route scope              |\n| `jobs` / `tasks` / `events` | Background work and emitted events                       |\n| `policies`                  | Authorization rules in the module's permission namespace |\n| `migrations`                | Schema steps applied with the app's migrations           |\n| `config`                    | Namespaced defaults, overridable by the app              |\n| `channels`                  | Realtime channels plus their policies                    |\n\nEverything is optional. A module that ships only pages is as valid as one that ships the whole vertical stack.\n\n## The Contracts That Keep Modules Safe [#the-contracts-that-keep-modules-safe]\n\nAny number of modules can coexist because of a small set of hard contracts:\n\n* **Namespacing** — model and resource names are prefixed by the module scope (`chat.messages`, never bare `messages`); route paths mount under the module's declared prefix, so no two modules can claim the same namespace.\n* **Config precedence** — module defaults register under their namespace (`chat.maxMessageLength`) and are overridden in the app's `src/config/modules.ts` through a deep merge where the app wins: defaults → `src/config` → inline, inline wins.\n* **Isolation** — modules never import each other's internals; they interoperate only through published contribution points.\n* **Migration ordering** — module migrations are ordered **before** application migrations and versioned by module version, so a module can evolve independently of the app.\n* **Peer requirements** — each module declares `requires` ranges for `@kwiva/*` packages, and addon tooling respects those ranges when resolving upgrades.\n\n## Where Modules Come From [#where-modules-come-from]\n\n| Source                  | Example                                                                    | Notes                                                               |\n| ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |\n| First-party             | `@kwiva/auth-kit`, `@kwiva/blog`, `@kwiva/billing`, `@kwiva/notifications` | Built and maintained by the framework team                          |\n| Third-party (published) | any addon published to the package registry with the `kwiva-addon` keyword | Installed with `kwiva add`, discoverable through the addon registry |\n| Local                   | `./modules/billing`                                                        | Workspace path; no publishing required                              |\n\nLocal and vendored modules are fully first-class — you get all the composition guarantees without leaving your repository.\n\n## Composition for Applications [#composition-for-applications]\n\nModules exist to be composed. The application kernel (`defineApp` in `src/bootstrap/app.ts`) receives discovered files and explicit providers; modules contribute to both. The module registry lives in `kwiva.config.ts`:\n\n```ts title=\"kwiva.config.ts\"\n// kwiva.config.ts\nexport default defineConfig({\n  modules: [\n    '@kwiva/auth-kit',    // first-party addon\n    '@acme/chat',         // third-party addon\n    './modules/billing',  // local workspace path\n  ],\n})\n```\n\n`kwiva add` writes that entry for you. Manual registration stays supported for vendored or path-based modules. Discovery merges module contributions into the app scan before the model IR is built, so a module's models, migrations, and config defaults participate in everything the IR derives — the typed client, OpenAPI spec, Studio screens, and MCP tools. See [Application Composition](/docs/modules-plugins/composition) for how the kernel assembles everything in order.\n\n## Publishing [#publishing]\n\nPublishing a module is a small, explicit contract:\n\n1. The package **exports the `defineModule` result** as its default export.\n2. It is **tagged with the `kwiva-addon` keyword** in the package registry.\n3. It declares **`requires` ranges** for its `@kwiva/*` peer dependencies.\n\n`kwiva module:build` packages a module — contribution manifest plus a compiled distribution with isolated type declarations — ready for the registry. Apps pin versions with semver; compatibility is enforced through `requires`. Discoverability comes from the curated addon index behind `kwiva addons search`. The full workflow is on [Addons & Distribution](/docs/modules-plugins/addons).\n\n## Plugins and Themes [#plugins-and-themes]\n\nPlugins are the HTTP-level counterpart to modules: middleware, route rules, and lifecycle hooks that extend the framework surface rather than contributing a full vertical stack. Themes restyle the ui-kit. Both are defined with their own factories and distributed through the same addon mechanics, so the mental model from this page — named, versioned, installable, composed — carries over unchanged.\n\n## What's Next [#whats-next]\n\n* [Defining Modules](/docs/modules-plugins/defining-modules) — build your first reusable capability\n* [Application Composition](/docs/modules-plugins/composition) — see modules join the kernel\n* [Addons & Distribution](/docs/modules-plugins/addons) — install third-party capabilities\n* [Applications](/docs/core-concepts/applications) — the kernel `defineApp` composes\n* [CLI](/docs/cli) — the generator and addon command reference\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Modules and plugins are how Kwiva scales from a single application to a **platform**. Where `defineX` files compose a single app, `defineModule` composes reusable capabilities — models, controllers, pages, jobs, config, and migrations — that drop into any Kwiva application as a unit. Addons extend the same idea to the whole ecosystem: anything installable ships and lands through one workflow."
		},
		{
			"heading": void 0,
			"content": "This section covers the full story in four pages:"
		},
		{
			"heading": void 0,
			"content": "Page"
		},
		{
			"heading": void 0,
			"content": "Purpose"
		},
		{
			"heading": void 0,
			"content": "Defining Modules"
		},
		{
			"heading": void 0,
			"content": "The `defineModule` factory and every contribution point"
		},
		{
			"heading": void 0,
			"content": "Application Composition"
		},
		{
			"heading": void 0,
			"content": "How the kernel (`defineApp`) assembles an app from modules"
		},
		{
			"heading": void 0,
			"content": "Addons & Distribution"
		},
		{
			"heading": void 0,
			"content": "Install, search, version, and publish capabilities"
		},
		{
			"heading": void 0,
			"content": "This page"
		},
		{
			"heading": void 0,
			"content": "The model: what modules, plugins, and addons are, and when to reach for them"
		},
		{
			"heading": "what-is-a-module",
			"content": "A module is a **package-level capability**. One module can ship models, controllers, middleware, pages, jobs, events, tasks, policies, migrations, config defaults, and channel policies together, all namespaced so they never collide with your application code:"
		},
		{
			"heading": "what-is-a-module",
			"content": "Contributions merge into the application scan as if they were local — namespaced, versioned, and conflict-free. See Defining Modules for the full surface, including lifecycle hooks and peer requirements."
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "The noun for \"installable capability\" is **addon**. An addon is any one of three kinds of package:"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "Kind"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "It is"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "Example surface"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "Module"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "A full-stack capability"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "models + controllers + pages + jobs + config"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "Plugin"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "An HTTP-level extension"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "middleware, route rules, lifecycle hooks"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "Theme"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "A UI skin"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "pages and components restyled through the ui-kit"
		},
		{
			"heading": "modules-plugins-and-themes",
			"content": "All three flow through the same install path — `kwiva add` — and are managed by the same `kwiva addons` commands. The distinction matters at authoring time: a module is authored with `defineModule`, a plugin with `definePlugin`, and a theme as a ui-kit skin; at consumption time they are all just \"addons.\""
		},
		{
			"heading": "when-to-reach-for-a-module",
			"content": "A module is the right unit when a capability is meant to be **reused across applications** — by your own team today, or by the ecosystem tomorrow. The framework's composition ladder makes the progression natural:"
		},
		{
			"heading": "when-to-reach-for-a-module",
			"content": "**A static site** — model-less pages; the kernel with config + pages + prerender."
		},
		{
			"heading": "when-to-reach-for-a-module",
			"content": "**A CRUD app** — one model, zero controllers."
		},
		{
			"heading": "when-to-reach-for-a-module",
			"content": "**A SaaS** — auth, policies, tenancy, Studio."
		},
		{
			"heading": "when-to-reach-for-a-module",
			"content": "**Realtime** — events, channels, jobs."
		},
		{
			"heading": "when-to-reach-for-a-module",
			"content": "**A platform** — modules, MCP, multi-preset deploys."
		},
		{
			"heading": "when-to-reach-for-a-module",
			"content": "The kernel shape never changes on the way up that ladder — only which `defineX` files and modules exist. If you catch yourself imagining the second application that will need the feature you are building, that is the moment to extract a module."
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "A module declares what it contributes with globs — same lazy, scan-based convention as application files. The full surface is documented on Defining Modules; the key contributions:"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "Contribution"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "What it adds"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "`models`"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "Database tables, generated routes, types, Studio screens"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "`controllers`"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "HTTP routes under the module's scope"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "`pages`"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "UI additions under the module's route scope"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "`jobs` / `tasks` / `events`"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "Background work and emitted events"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "`policies`"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "Authorization rules in the module's permission namespace"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "`migrations`"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "Schema steps applied with the app's migrations"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "`config`"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "Namespaced defaults, overridable by the app"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "`channels`"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "Realtime channels plus their policies"
		},
		{
			"heading": "contribution-points-in-brief",
			"content": "Everything is optional. A module that ships only pages is as valid as one that ships the whole vertical stack."
		},
		{
			"heading": "the-contracts-that-keep-modules-safe",
			"content": "Any number of modules can coexist because of a small set of hard contracts:"
		},
		{
			"heading": "the-contracts-that-keep-modules-safe",
			"content": "**Namespacing** — model and resource names are prefixed by the module scope (`chat.messages`, never bare `messages`); route paths mount under the module's declared prefix, so no two modules can claim the same namespace."
		},
		{
			"heading": "the-contracts-that-keep-modules-safe",
			"content": "**Config precedence** — module defaults register under their namespace (`chat.maxMessageLength`) and are overridden in the app's `src/config/modules.ts` through a deep merge where the app wins: defaults → `src/config` → inline, inline wins."
		},
		{
			"heading": "the-contracts-that-keep-modules-safe",
			"content": "**Isolation** — modules never import each other's internals; they interoperate only through published contribution points."
		},
		{
			"heading": "the-contracts-that-keep-modules-safe",
			"content": "**Migration ordering** — module migrations are ordered **before** application migrations and versioned by module version, so a module can evolve independently of the app."
		},
		{
			"heading": "the-contracts-that-keep-modules-safe",
			"content": "**Peer requirements** — each module declares `requires` ranges for `@kwiva/*` packages, and addon tooling respects those ranges when resolving upgrades."
		},
		{
			"heading": "where-modules-come-from",
			"content": "Source"
		},
		{
			"heading": "where-modules-come-from",
			"content": "Example"
		},
		{
			"heading": "where-modules-come-from",
			"content": "Notes"
		},
		{
			"heading": "where-modules-come-from",
			"content": "First-party"
		},
		{
			"heading": "where-modules-come-from",
			"content": "`@kwiva/auth-kit`, `@kwiva/blog`, `@kwiva/billing`, `@kwiva/notifications`"
		},
		{
			"heading": "where-modules-come-from",
			"content": "Built and maintained by the framework team"
		},
		{
			"heading": "where-modules-come-from",
			"content": "Third-party (published)"
		},
		{
			"heading": "where-modules-come-from",
			"content": "any addon published to the package registry with the `kwiva-addon` keyword"
		},
		{
			"heading": "where-modules-come-from",
			"content": "Installed with `kwiva add`, discoverable through the addon registry"
		},
		{
			"heading": "where-modules-come-from",
			"content": "Local"
		},
		{
			"heading": "where-modules-come-from",
			"content": "`./modules/billing`"
		},
		{
			"heading": "where-modules-come-from",
			"content": "Workspace path; no publishing required"
		},
		{
			"heading": "where-modules-come-from",
			"content": "Local and vendored modules are fully first-class — you get all the composition guarantees without leaving your repository."
		},
		{
			"heading": "composition-for-applications",
			"content": "Modules exist to be composed. The application kernel (`defineApp` in `src/bootstrap/app.ts`) receives discovered files and explicit providers; modules contribute to both. The module registry lives in `kwiva.config.ts`:"
		},
		{
			"heading": "composition-for-applications",
			"content": "`kwiva add` writes that entry for you. Manual registration stays supported for vendored or path-based modules. Discovery merges module contributions into the app scan before the model IR is built, so a module's models, migrations, and config defaults participate in everything the IR derives — the typed client, OpenAPI spec, Studio screens, and MCP tools. See Application Composition for how the kernel assembles everything in order."
		},
		{
			"heading": "publishing",
			"content": "Publishing a module is a small, explicit contract:"
		},
		{
			"heading": "publishing",
			"content": "The package **exports the `defineModule` result** as its default export."
		},
		{
			"heading": "publishing",
			"content": "It is **tagged with the `kwiva-addon` keyword** in the package registry."
		},
		{
			"heading": "publishing",
			"content": "It declares **`requires` ranges** for its `@kwiva/*` peer dependencies."
		},
		{
			"heading": "publishing",
			"content": "`kwiva module:build` packages a module — contribution manifest plus a compiled distribution with isolated type declarations — ready for the registry. Apps pin versions with semver; compatibility is enforced through `requires`. Discoverability comes from the curated addon index behind `kwiva addons search`. The full workflow is on Addons & Distribution."
		},
		{
			"heading": "plugins-and-themes",
			"content": "Plugins are the HTTP-level counterpart to modules: middleware, route rules, and lifecycle hooks that extend the framework surface rather than contributing a full vertical stack. Themes restyle the ui-kit. Both are defined with their own factories and distributed through the same addon mechanics, so the mental model from this page — named, versioned, installable, composed — carries over unchanged."
		},
		{
			"heading": "whats-next",
			"content": "Defining Modules — build your first reusable capability"
		},
		{
			"heading": "whats-next",
			"content": "Application Composition — see modules join the kernel"
		},
		{
			"heading": "whats-next",
			"content": "Addons & Distribution — install third-party capabilities"
		},
		{
			"heading": "whats-next",
			"content": "Applications — the kernel `defineApp` composes"
		},
		{
			"heading": "whats-next",
			"content": "CLI — the generator and addon command reference"
		}
	],
	"headings": [
		{
			"id": "what-is-a-module",
			"content": "What Is a Module?"
		},
		{
			"id": "modules-plugins-and-themes",
			"content": "Modules, Plugins, and Themes"
		},
		{
			"id": "when-to-reach-for-a-module",
			"content": "When to Reach for a Module"
		},
		{
			"id": "contribution-points-in-brief",
			"content": "Contribution Points in Brief"
		},
		{
			"id": "the-contracts-that-keep-modules-safe",
			"content": "The Contracts That Keep Modules Safe"
		},
		{
			"id": "where-modules-come-from",
			"content": "Where Modules Come From"
		},
		{
			"id": "composition-for-applications",
			"content": "Composition for Applications"
		},
		{
			"id": "publishing",
			"content": "Publishing"
		},
		{
			"id": "plugins-and-themes",
			"content": "Plugins and Themes"
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
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Is a Module?" })
	},
	{
		depth: 2,
		url: "#modules-plugins-and-themes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Modules, Plugins, and Themes" })
	},
	{
		depth: 2,
		url: "#when-to-reach-for-a-module",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When to Reach for a Module" })
	},
	{
		depth: 2,
		url: "#contribution-points-in-brief",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Contribution Points in Brief" })
	},
	{
		depth: 2,
		url: "#the-contracts-that-keep-modules-safe",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Contracts That Keep Modules Safe" })
	},
	{
		depth: 2,
		url: "#where-modules-come-from",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where Modules Come From" })
	},
	{
		depth: 2,
		url: "#composition-for-applications",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Composition for Applications" })
	},
	{
		depth: 2,
		url: "#publishing",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Publishing" })
	},
	{
		depth: 2,
		url: "#plugins-and-themes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Plugins and Themes" })
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
			"Modules and plugins are how Kwiva scales from a single application to a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "platform" }),
			". Where ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" files compose a single app, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
			" composes reusable capabilities — models, controllers, pages, jobs, config, and migrations — that drop into any Kwiva application as a unit. Addons extend the same idea to the whole ecosystem: anything installable ships and lands through one workflow."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This section covers the full story in four pages:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Page" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/defining-modules",
				children: "Defining Modules"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
				" factory and every contribution point"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/composition",
				children: "Application Composition"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"How the kernel (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
				") assembles an app from modules"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/addons",
				children: "Addons & Distribution"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Install, search, version, and publish capabilities" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "This page" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The model: what modules, plugins, and addons are, and when to reach for them" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-is-a-module",
			children: "What Is a Module?"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A module is a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "package-level capability" }),
			". One module can ship models, controllers, middleware, pages, jobs, events, tasks, policies, migrations, config defaults, and channel policies together, all namespaced so they never collide with your application code:"
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
			title: "modules/chat/index.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// modules/chat/index.ts"
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
							children: "'@acme/chat'"
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
							children: "'1.2.0'"
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
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // contribution points — all optional"
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
							children: "'./models/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),       "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// rooms, messages"
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
							children: "'./controllers/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// chat"
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
							children: "),    "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// ui additions"
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
							children: "'./jobs/*.ts'"
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
							children: "'./migrations'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",                                 "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// applied with app migrations"
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
							children: "  config:      { chat: { maxMessageLength: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "2000"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } },          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// namespaced defaults"
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
							children: "  channels:    { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'chat.{roomId}'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": { policy: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'chat.member'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } },"
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
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "providers"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  requires: { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'@kwiva/core'"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'^1'"
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
							children: "'@kwiva/auth'"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'^1'"
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
			"Contributions merge into the application scan as if they were local — namespaced, versioned, and conflict-free. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/defining-modules",
				children: "Defining Modules"
			}),
			" for the full surface, including lifecycle hooks and peer requirements."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "modules-plugins-and-themes",
			children: "Modules, Plugins, and Themes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The noun for \"installable capability\" is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "addon" }),
			". An addon is any one of three kinds of package:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Kind" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "It is" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example surface" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Module" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A full-stack capability" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "models + controllers + pages + jobs + config" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Plugin" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "An HTTP-level extension" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "middleware, route rules, lifecycle hooks" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Theme" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A UI skin" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "pages and components restyled through the ui-kit" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"All three flow through the same install path — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add" }),
			" — and are managed by the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons" }),
			" commands. The distinction matters at authoring time: a module is authored with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
			", a plugin with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePlugin" }),
			", and a theme as a ui-kit skin; at consumption time they are all just \"addons.\""
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
			title: "terminal",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " add"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " @kwiva/blog"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "               # a module: install + register + migrations check"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " add"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " ./addons/analytics"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --path"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: " # a local addon from a workspace path"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " addons"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " list"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                   # everything installed, with contributions and versions"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-to-reach-for-a-module",
			children: "When to Reach for a Module"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A module is the right unit when a capability is meant to be ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "reused across applications" }),
			" — by your own team today, or by the ecosystem tomorrow. The framework's composition ladder makes the progression natural:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "A static site" }), " — model-less pages; the kernel with config + pages + prerender."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "A CRUD app" }), " — one model, zero controllers."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "A SaaS" }), " — auth, policies, tenancy, Studio."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Realtime" }), " — events, channels, jobs."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "A platform" }), " — modules, MCP, multi-preset deploys."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The kernel shape never changes on the way up that ladder — only which ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" files and modules exist. If you catch yourself imagining the second application that will need the feature you are building, that is the moment to extract a module."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "contribution-points-in-brief",
			children: "Contribution Points in Brief"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A module declares what it contributes with globs — same lazy, scan-based convention as application files. The full surface is documented on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/defining-modules",
				children: "Defining Modules"
			}),
			"; the key contributions:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Contribution" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it adds" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Database tables, generated routes, types, Studio screens" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "controllers" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "HTTP routes under the module's scope" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pages" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "UI additions under the module's route scope" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "jobs" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tasks" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "events" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Background work and emitted events" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "policies" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authorization rules in the module's permission namespace" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "migrations" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Schema steps applied with the app's migrations" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Namespaced defaults, overridable by the app" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "channels" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Realtime channels plus their policies" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Everything is optional. A module that ships only pages is as valid as one that ships the whole vertical stack." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-contracts-that-keep-modules-safe",
			children: "The Contracts That Keep Modules Safe"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Any number of modules can coexist because of a small set of hard contracts:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Namespacing" }),
				" — model and resource names are prefixed by the module scope (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.messages" }),
				", never bare ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "messages" }),
				"); route paths mount under the module's declared prefix, so no two modules can claim the same namespace."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Config precedence" }),
				" — module defaults register under their namespace (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.maxMessageLength" }),
				") and are overridden in the app's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/modules.ts" }),
				" through a deep merge where the app wins: defaults → ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config" }),
				" → inline, inline wins."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Isolation" }), " — modules never import each other's internals; they interoperate only through published contribution points."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Migration ordering" }),
				" — module migrations are ordered ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "before" }),
				" application migrations and versioned by module version, so a module can evolve independently of the app."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Peer requirements" }),
				" — each module declares ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
				" ranges for ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" packages, and addon tooling respects those ranges when resolving upgrades."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-modules-come-from",
			children: "Where Modules Come From"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Source" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Notes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "First-party" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth-kit" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/blog" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/billing" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/notifications" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Built and maintained by the framework team" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Third-party (published)" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"any addon published to the package registry with the ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva-addon" }),
					" keyword"
				] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Installed with ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add" }),
					", discoverable through the addon registry"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Local" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "./modules/billing" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Workspace path; no publishing required" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Local and vendored modules are fully first-class — you get all the composition guarantees without leaving your repository." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "composition-for-applications",
			children: "Composition for Applications"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Modules exist to be composed. The application kernel (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
			" in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/bootstrap/app.ts" }),
			") receives discovered files and explicit providers; modules contribute to both. The module registry lives in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
			":"
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
							children: ",    "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// first-party addon"
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
							children: ",         "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// third-party addon"
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
							children: ",  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// local workspace path"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add" }),
			" writes that entry for you. Manual registration stays supported for vendored or path-based modules. Discovery merges module contributions into the app scan before the model IR is built, so a module's models, migrations, and config defaults participate in everything the IR derives — the typed client, OpenAPI spec, Studio screens, and MCP tools. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/composition",
				children: "Application Composition"
			}),
			" for how the kernel assembles everything in order."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "publishing",
			children: "Publishing"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Publishing a module is a small, explicit contract:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The package ",
				(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [
					"exports the ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
					" result"
				] }),
				" as its default export."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"It is ",
				(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [
					"tagged with the ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva-addon" }),
					" keyword"
				] }),
				" in the package registry."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"It declares ",
				(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }), " ranges"] }),
				" for its ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" peer dependencies."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva module:build" }),
			" packages a module — contribution manifest plus a compiled distribution with isolated type declarations — ready for the registry. Apps pin versions with semver; compatibility is enforced through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
			". Discoverability comes from the curated addon index behind ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons search" }),
			". The full workflow is on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/addons",
				children: "Addons & Distribution"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "plugins-and-themes",
			children: "Plugins and Themes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Plugins are the HTTP-level counterpart to modules: middleware, route rules, and lifecycle hooks that extend the framework surface rather than contributing a full vertical stack. Themes restyle the ui-kit. Both are defined with their own factories and distributed through the same addon mechanics, so the mental model from this page — named, versioned, installable, composed — carries over unchanged." }),
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
			}), " — build your first reusable capability"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/composition",
				children: "Application Composition"
			}), " — see modules join the kernel"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/addons",
				children: "Addons & Distribution"
			}), " — install third-party capabilities"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/applications",
					children: "Applications"
				}),
				" — the kernel ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
				" composes"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli",
				children: "CLI"
			}), " — the generator and addon command reference"] }),
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
