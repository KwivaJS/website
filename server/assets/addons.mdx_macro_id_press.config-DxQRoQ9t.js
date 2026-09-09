import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/modules-plugins/addons.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Addons & Distribution",
	"description": "Install, search, version, and publish Kwiva addons — modules, plugins, and themes — through a single workflow built on kwiva add and the addon registry."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nAn **addon** is any installable capability package: a **module** (a full-stack capability), a **plugin** (an HTTP-level extension), or a **theme** (a ui-kit skin). All three share one installation path — the addon workflow is the single way capabilities are installed and registered in a Kwiva app. This page covers that workflow end to end: what an addon is, how it installs, how it is discovered, how versions are resolved, and how you publish your own.\n\n## What Is an Addon? [#what-is-an-addon]\n\nThe source of an addon does not change the workflow:\n\n| Source      | Example                            | How it installs                       |\n| ----------- | ---------------------------------- | ------------------------------------- |\n| First-party | `@kwiva/blog`                      | `kwiva add @kwiva/blog`               |\n| Third-party | any addon tagged for the ecosystem | `kwiva add <addon>`                   |\n| Local       | `./addons/analytics`               | `kwiva add ./addons/analytics --path` |\n\nThe kind of addon shapes what it contributes but not how it is managed. A module brings the full vertical stack — models, controllers, pages, jobs, config, and migrations. A plugin extends the HTTP surface — middleware, route rules, and lifecycle hooks. A theme restyles the ui-kit. All three install, list, update, and remove through the same commands.\n\n## The Addon CLI [#the-addon-cli]\n\n| Command                           | Purpose                                                                     |\n| --------------------------------- | --------------------------------------------------------------------------- |\n| `kwiva add <addon>`               | Install and register an addon — package, config entry, and migrations check |\n| `kwiva add <addon> --path`        | Install a local addon from a workspace path                                 |\n| `kwiva add <addon> --version <v>` | Pin a specific version                                                      |\n| `kwiva addons list`               | Show installed addons: contributions and versions                           |\n| `kwiva addons search <term>`      | Search the registry                                                         |\n| `kwiva addons info <addon>`       | Show details of an addon before you commit                                  |\n| `kwiva addons remove <addon>`     | Remove an installed addon, leaving its migrations intact and flagged        |\n| `kwiva addons update [addon]`     | Update addons within their `requires` compatibility ranges                  |\n| `kwiva addons outdated`           | List addons with newer compatible versions available                        |\n\nThe full command reference for this surface lives on [CLI Addon Commands](/docs/cli/addon-commands).\n\n## Installing an Addon [#installing-an-addon]\n\nOne command installs, registers, and checks:\n\n```bash title=\"terminal\"\nkwiva add @kwiva/blog\n```\n\n`kwiva add` does three things at once:\n\n1. **Installs** the package from the registry.\n2. **Registers** it — it writes the module entry into `kwiva.config.ts` for you.\n3. **Checks migrations** — module migrations are validated so the addon's schema steps apply cleanly with the app's migrations, and anything needing `db:migrate` is flagged.\n\nAfter `kwiva add`, the addon's contributions — models, controllers, pages, config, migrations — are live in the app, registered in configuration, and subject to the same conventions and gates as first-party code.\n\nLocal addons work identically with a path instead of a package name:\n\n```bash title=\"terminal\"\nkwiva add ./addons/analytics --path\n```\n\nPinning follows the same one-step shape:\n\n```bash title=\"terminal\"\nkwiva add @kwiva/blogstore --version 2.1.0\n```\n\nManual registration in `kwiva.config.ts` remains supported for vendored and path-based modules that were never installed through the CLI:\n\n```ts title=\"kwiva.config.ts\"\n// kwiva.config.ts\nexport default defineConfig({\n  modules: [\n    './modules/billing',  // vendored or path-based registration\n  ],\n})\n```\n\n## Registry and Distribution Conventions [#registry-and-distribution-conventions]\n\nPublishing an addon is a small, explicit contract:\n\n1. The package **exports the `defineModule` result** as its default export.\n2. It is **tagged with the `kwiva-addon` keyword** in the package registry.\n3. It declares **`requires` ranges** for its `@kwiva/*` peer dependencies.\n\nWith that contract in place:\n\n* `kwiva add @acme/chat` installs and registers the module.\n* `kwiva addons search chat` lists it — backed by a curated addon index.\n* The app pins versions with semver; compatibility is enforced via `requires` ranges.\n\nThe keyword is the discovery bridge. `kwiva addons search` matches on it, and the curated addon index maintains quality and compatibility signals for what search returns. `kwiva addons info` is the pre-install look: description, contribution summary (which models, controllers, pages, or config the addon brings), requirements, and changelog.\n\n## Version and Upgrade Management [#version-and-upgrade-management]\n\nKwiva resolves upgrades against declared compatibility rather than blindly bumping:\n\n* `kwiva addons update` brings every addon to the newest version **within its `requires` range** — it refuses to jump outside a declared compatible window.\n* `kwiva addons outdated` reports what is behind, so upgrades become deliberate decisions rather than periodic rituals.\n* `kwiva addons info <addon>` shows the installed version, available versions, and requirements before you commit to a move.\n* `kwiva addons remove <addon>` unregisters and removes the addon cleanly — the package is uninstalled and the registry entry removed, but any schema the addon contributed is left intact and flagged so database data is never silently dropped.\n\nBecause the app pins versions and addons declare `requires`, two apps can hold different addon versions without breakage — upgrades are deliberate, per-app decisions. When an addon's `requires` range conflicts with what the app already pins, resolution rejects the combination instead of running an incompatibility.\n\n> \\[!TIP]\n> `kwiva addons outdated` plus `kwiva addons info` is the review loop for a low-risk upgrade: find what is behind, read the requirements and changelog, then `kwiva addons update <addon>` to move within the compatible range.\n\n## First-Party Addons [#first-party-addons]\n\nFramework-maintained addons cover the common platform capabilities:\n\n| Addon                  | Ships                                                                 |\n| ---------------------- | --------------------------------------------------------------------- |\n| `@kwiva/auth-kit`      | Ready auth screens (sign-in, sign-up, OAuth) + user-management polish |\n| `@kwiva/blog`          | Posts, tags, and comments models + pages + feed                       |\n| `@kwiva/billing`       | Plans, subscriptions, invoices + webhooks (engine-agnostic gateway)   |\n| `@kwiva/notifications` | In-app + email notification stack                                     |\n| `@kwiva/analytics`     | Event tracking + dashboards                                           |\n\nThese demonstrate the shape a well-built addon takes — namespaced contributions, config defaults apps can override, migrations ordered before app migrations, and `requires` ranges that keep them upgradable.\n\n## Authoring and Publishing an Addon [#authoring-and-publishing-an-addon]\n\nEverything else is publishable by anyone. The authoring surface is the same one you use in an application — `defineModule` for modules, `definePlugin` for plugins, and a ui-kit skin for themes:\n\n1. **Scaffold** — `kwiva make:module analytics` creates the module folder with slots for each contribution type.\n2. **Author** — declare contributions through `defineModule`; set namespaced config defaults; declare `requires`.\n3. **Test locally** — register the module from its workspace path (`./addons/analytics`) in a real app and exercise what it contributes.\n4. **Build** — `kwiva module:build` packages the module with its contribution manifest and a compiled distribution (bundled output plus isolated type declarations).\n5. **Publish** — publish to the package registry tagged with the `kwiva-addon` keyword.\n\nFrom then on, `kwiva add @acme/analytics` installs it into any compatible app, and `kwiva addons search analytics` makes it discoverable to everyone else.\n\n## The Consumer–Author Contract [#the-consumerauthor-contract]\n\nThe contract holds in both directions:\n\n* **Consumers** get a surface with no guessing — search, info, install, update, remove, and audit are all first-class commands.\n* **Authors** get one publishing path — package with the keyword, and the addon becomes discoverable through the CLI rather than word of mouth.\n\nThat symmetry is what makes the addon model a distribution story rather than a set of copy-paste instructions.\n\n## What's Next [#whats-next]\n\n* [Defining Modules](/docs/modules-plugins/defining-modules) — the contribution points an addon ships\n* [Application Composition](/docs/modules-plugins/composition) — how registered modules join the kernel\n* [Modules & Plugins](/docs/modules-plugins) — the composition model at a glance\n* [CLI Addons](/docs/cli/addon-commands) — the command reference for addon workflows\n* [Modules Reference](/docs/cli/generators) — generators that scaffold new modules\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "An **addon** is any installable capability package: a **module** (a full-stack capability), a **plugin** (an HTTP-level extension), or a **theme** (a ui-kit skin). All three share one installation path — the addon workflow is the single way capabilities are installed and registered in a Kwiva app. This page covers that workflow end to end: what an addon is, how it installs, how it is discovered, how versions are resolved, and how you publish your own."
		},
		{
			"heading": "what-is-an-addon",
			"content": "The source of an addon does not change the workflow:"
		},
		{
			"heading": "what-is-an-addon",
			"content": "Source"
		},
		{
			"heading": "what-is-an-addon",
			"content": "Example"
		},
		{
			"heading": "what-is-an-addon",
			"content": "How it installs"
		},
		{
			"heading": "what-is-an-addon",
			"content": "First-party"
		},
		{
			"heading": "what-is-an-addon",
			"content": "`@kwiva/blog`"
		},
		{
			"heading": "what-is-an-addon",
			"content": "`kwiva add @kwiva/blog`"
		},
		{
			"heading": "what-is-an-addon",
			"content": "Third-party"
		},
		{
			"heading": "what-is-an-addon",
			"content": "any addon tagged for the ecosystem"
		},
		{
			"heading": "what-is-an-addon",
			"content": "`kwiva add <addon>`"
		},
		{
			"heading": "what-is-an-addon",
			"content": "Local"
		},
		{
			"heading": "what-is-an-addon",
			"content": "`./addons/analytics`"
		},
		{
			"heading": "what-is-an-addon",
			"content": "`kwiva add ./addons/analytics --path`"
		},
		{
			"heading": "what-is-an-addon",
			"content": "The kind of addon shapes what it contributes but not how it is managed. A module brings the full vertical stack — models, controllers, pages, jobs, config, and migrations. A plugin extends the HTTP surface — middleware, route rules, and lifecycle hooks. A theme restyles the ui-kit. All three install, list, update, and remove through the same commands."
		},
		{
			"heading": "the-addon-cli",
			"content": "Command"
		},
		{
			"heading": "the-addon-cli",
			"content": "Purpose"
		},
		{
			"heading": "the-addon-cli",
			"content": "`kwiva add <addon>`"
		},
		{
			"heading": "the-addon-cli",
			"content": "Install and register an addon — package, config entry, and migrations check"
		},
		{
			"heading": "the-addon-cli",
			"content": "`kwiva add <addon> --path`"
		},
		{
			"heading": "the-addon-cli",
			"content": "Install a local addon from a workspace path"
		},
		{
			"heading": "the-addon-cli",
			"content": "`kwiva add <addon> --version <v>`"
		},
		{
			"heading": "the-addon-cli",
			"content": "Pin a specific version"
		},
		{
			"heading": "the-addon-cli",
			"content": "`kwiva addons list`"
		},
		{
			"heading": "the-addon-cli",
			"content": "Show installed addons: contributions and versions"
		},
		{
			"heading": "the-addon-cli",
			"content": "`kwiva addons search <term>`"
		},
		{
			"heading": "the-addon-cli",
			"content": "Search the registry"
		},
		{
			"heading": "the-addon-cli",
			"content": "`kwiva addons info <addon>`"
		},
		{
			"heading": "the-addon-cli",
			"content": "Show details of an addon before you commit"
		},
		{
			"heading": "the-addon-cli",
			"content": "`kwiva addons remove <addon>`"
		},
		{
			"heading": "the-addon-cli",
			"content": "Remove an installed addon, leaving its migrations intact and flagged"
		},
		{
			"heading": "the-addon-cli",
			"content": "`kwiva addons update [addon]`"
		},
		{
			"heading": "the-addon-cli",
			"content": "Update addons within their `requires` compatibility ranges"
		},
		{
			"heading": "the-addon-cli",
			"content": "`kwiva addons outdated`"
		},
		{
			"heading": "the-addon-cli",
			"content": "List addons with newer compatible versions available"
		},
		{
			"heading": "the-addon-cli",
			"content": "The full command reference for this surface lives on CLI Addon Commands."
		},
		{
			"heading": "installing-an-addon",
			"content": "One command installs, registers, and checks:"
		},
		{
			"heading": "installing-an-addon",
			"content": "`kwiva add` does three things at once:"
		},
		{
			"heading": "installing-an-addon",
			"content": "**Installs** the package from the registry."
		},
		{
			"heading": "installing-an-addon",
			"content": "**Registers** it — it writes the module entry into `kwiva.config.ts` for you."
		},
		{
			"heading": "installing-an-addon",
			"content": "**Checks migrations** — module migrations are validated so the addon's schema steps apply cleanly with the app's migrations, and anything needing `db:migrate` is flagged."
		},
		{
			"heading": "installing-an-addon",
			"content": "After `kwiva add`, the addon's contributions — models, controllers, pages, config, migrations — are live in the app, registered in configuration, and subject to the same conventions and gates as first-party code."
		},
		{
			"heading": "installing-an-addon",
			"content": "Local addons work identically with a path instead of a package name:"
		},
		{
			"heading": "installing-an-addon",
			"content": "Pinning follows the same one-step shape:"
		},
		{
			"heading": "installing-an-addon",
			"content": "Manual registration in `kwiva.config.ts` remains supported for vendored and path-based modules that were never installed through the CLI:"
		},
		{
			"heading": "registry-and-distribution-conventions",
			"content": "Publishing an addon is a small, explicit contract:"
		},
		{
			"heading": "registry-and-distribution-conventions",
			"content": "The package **exports the `defineModule` result** as its default export."
		},
		{
			"heading": "registry-and-distribution-conventions",
			"content": "It is **tagged with the `kwiva-addon` keyword** in the package registry."
		},
		{
			"heading": "registry-and-distribution-conventions",
			"content": "It declares **`requires` ranges** for its `@kwiva/*` peer dependencies."
		},
		{
			"heading": "registry-and-distribution-conventions",
			"content": "With that contract in place:"
		},
		{
			"heading": "registry-and-distribution-conventions",
			"content": "`kwiva add @acme/chat` installs and registers the module."
		},
		{
			"heading": "registry-and-distribution-conventions",
			"content": "`kwiva addons search chat` lists it — backed by a curated addon index."
		},
		{
			"heading": "registry-and-distribution-conventions",
			"content": "The app pins versions with semver; compatibility is enforced via `requires` ranges."
		},
		{
			"heading": "registry-and-distribution-conventions",
			"content": "The keyword is the discovery bridge. `kwiva addons search` matches on it, and the curated addon index maintains quality and compatibility signals for what search returns. `kwiva addons info` is the pre-install look: description, contribution summary (which models, controllers, pages, or config the addon brings), requirements, and changelog."
		},
		{
			"heading": "version-and-upgrade-management",
			"content": "Kwiva resolves upgrades against declared compatibility rather than blindly bumping:"
		},
		{
			"heading": "version-and-upgrade-management",
			"content": "`kwiva addons update` brings every addon to the newest version **within its `requires` range** — it refuses to jump outside a declared compatible window."
		},
		{
			"heading": "version-and-upgrade-management",
			"content": "`kwiva addons outdated` reports what is behind, so upgrades become deliberate decisions rather than periodic rituals."
		},
		{
			"heading": "version-and-upgrade-management",
			"content": "`kwiva addons info <addon>` shows the installed version, available versions, and requirements before you commit to a move."
		},
		{
			"heading": "version-and-upgrade-management",
			"content": "`kwiva addons remove <addon>` unregisters and removes the addon cleanly — the package is uninstalled and the registry entry removed, but any schema the addon contributed is left intact and flagged so database data is never silently dropped."
		},
		{
			"heading": "version-and-upgrade-management",
			"content": "Because the app pins versions and addons declare `requires`, two apps can hold different addon versions without breakage — upgrades are deliberate, per-app decisions. When an addon's `requires` range conflicts with what the app already pins, resolution rejects the combination instead of running an incompatibility."
		},
		{
			"heading": "version-and-upgrade-management",
			"content": "> \\[!TIP]\n> `kwiva addons outdated` plus `kwiva addons info` is the review loop for a low-risk upgrade: find what is behind, read the requirements and changelog, then `kwiva addons update <addon>` to move within the compatible range."
		},
		{
			"heading": "first-party-addons",
			"content": "Framework-maintained addons cover the common platform capabilities:"
		},
		{
			"heading": "first-party-addons",
			"content": "Addon"
		},
		{
			"heading": "first-party-addons",
			"content": "Ships"
		},
		{
			"heading": "first-party-addons",
			"content": "`@kwiva/auth-kit`"
		},
		{
			"heading": "first-party-addons",
			"content": "Ready auth screens (sign-in, sign-up, OAuth) + user-management polish"
		},
		{
			"heading": "first-party-addons",
			"content": "`@kwiva/blog`"
		},
		{
			"heading": "first-party-addons",
			"content": "Posts, tags, and comments models + pages + feed"
		},
		{
			"heading": "first-party-addons",
			"content": "`@kwiva/billing`"
		},
		{
			"heading": "first-party-addons",
			"content": "Plans, subscriptions, invoices + webhooks (engine-agnostic gateway)"
		},
		{
			"heading": "first-party-addons",
			"content": "`@kwiva/notifications`"
		},
		{
			"heading": "first-party-addons",
			"content": "In-app + email notification stack"
		},
		{
			"heading": "first-party-addons",
			"content": "`@kwiva/analytics`"
		},
		{
			"heading": "first-party-addons",
			"content": "Event tracking + dashboards"
		},
		{
			"heading": "first-party-addons",
			"content": "These demonstrate the shape a well-built addon takes — namespaced contributions, config defaults apps can override, migrations ordered before app migrations, and `requires` ranges that keep them upgradable."
		},
		{
			"heading": "authoring-and-publishing-an-addon",
			"content": "Everything else is publishable by anyone. The authoring surface is the same one you use in an application — `defineModule` for modules, `definePlugin` for plugins, and a ui-kit skin for themes:"
		},
		{
			"heading": "authoring-and-publishing-an-addon",
			"content": "**Scaffold** — `kwiva make:module analytics` creates the module folder with slots for each contribution type."
		},
		{
			"heading": "authoring-and-publishing-an-addon",
			"content": "**Author** — declare contributions through `defineModule`; set namespaced config defaults; declare `requires`."
		},
		{
			"heading": "authoring-and-publishing-an-addon",
			"content": "**Test locally** — register the module from its workspace path (`./addons/analytics`) in a real app and exercise what it contributes."
		},
		{
			"heading": "authoring-and-publishing-an-addon",
			"content": "**Build** — `kwiva module:build` packages the module with its contribution manifest and a compiled distribution (bundled output plus isolated type declarations)."
		},
		{
			"heading": "authoring-and-publishing-an-addon",
			"content": "**Publish** — publish to the package registry tagged with the `kwiva-addon` keyword."
		},
		{
			"heading": "authoring-and-publishing-an-addon",
			"content": "From then on, `kwiva add @acme/analytics` installs it into any compatible app, and `kwiva addons search analytics` makes it discoverable to everyone else."
		},
		{
			"heading": "the-consumerauthor-contract",
			"content": "The contract holds in both directions:"
		},
		{
			"heading": "the-consumerauthor-contract",
			"content": "**Consumers** get a surface with no guessing — search, info, install, update, remove, and audit are all first-class commands."
		},
		{
			"heading": "the-consumerauthor-contract",
			"content": "**Authors** get one publishing path — package with the keyword, and the addon becomes discoverable through the CLI rather than word of mouth."
		},
		{
			"heading": "the-consumerauthor-contract",
			"content": "That symmetry is what makes the addon model a distribution story rather than a set of copy-paste instructions."
		},
		{
			"heading": "whats-next",
			"content": "Defining Modules — the contribution points an addon ships"
		},
		{
			"heading": "whats-next",
			"content": "Application Composition — how registered modules join the kernel"
		},
		{
			"heading": "whats-next",
			"content": "Modules & Plugins — the composition model at a glance"
		},
		{
			"heading": "whats-next",
			"content": "CLI Addons — the command reference for addon workflows"
		},
		{
			"heading": "whats-next",
			"content": "Modules Reference — generators that scaffold new modules"
		}
	],
	"headings": [
		{
			"id": "what-is-an-addon",
			"content": "What Is an Addon?"
		},
		{
			"id": "the-addon-cli",
			"content": "The Addon CLI"
		},
		{
			"id": "installing-an-addon",
			"content": "Installing an Addon"
		},
		{
			"id": "registry-and-distribution-conventions",
			"content": "Registry and Distribution Conventions"
		},
		{
			"id": "version-and-upgrade-management",
			"content": "Version and Upgrade Management"
		},
		{
			"id": "first-party-addons",
			"content": "First-Party Addons"
		},
		{
			"id": "authoring-and-publishing-an-addon",
			"content": "Authoring and Publishing an Addon"
		},
		{
			"id": "the-consumerauthor-contract",
			"content": "The Consumer–Author Contract"
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
		url: "#what-is-an-addon",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Is an Addon?" })
	},
	{
		depth: 2,
		url: "#the-addon-cli",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Addon CLI" })
	},
	{
		depth: 2,
		url: "#installing-an-addon",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Installing an Addon" })
	},
	{
		depth: 2,
		url: "#registry-and-distribution-conventions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Registry and Distribution Conventions" })
	},
	{
		depth: 2,
		url: "#version-and-upgrade-management",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Version and Upgrade Management" })
	},
	{
		depth: 2,
		url: "#first-party-addons",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "First-Party Addons" })
	},
	{
		depth: 2,
		url: "#authoring-and-publishing-an-addon",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Authoring and Publishing an Addon" })
	},
	{
		depth: 2,
		url: "#the-consumerauthor-contract",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Consumer–Author Contract" })
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"An ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "addon" }),
			" is any installable capability package: a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "module" }),
			" (a full-stack capability), a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "plugin" }),
			" (an HTTP-level extension), or a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "theme" }),
			" (a ui-kit skin). All three share one installation path — the addon workflow is the single way capabilities are installed and registered in a Kwiva app. This page covers that workflow end to end: what an addon is, how it installs, how it is discovered, how versions are resolved, and how you publish your own."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-is-an-addon",
			children: "What Is an Addon?"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The source of an addon does not change the workflow:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Source" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "How it installs" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "First-party" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/blog" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add @kwiva/blog" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Third-party" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "any addon tagged for the ecosystem" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add <addon>" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Local" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "./addons/analytics" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add ./addons/analytics --path" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The kind of addon shapes what it contributes but not how it is managed. A module brings the full vertical stack — models, controllers, pages, jobs, config, and migrations. A plugin extends the HTTP surface — middleware, route rules, and lifecycle hooks. A theme restyles the ui-kit. All three install, list, update, and remove through the same commands." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-addon-cli",
			children: "The Addon CLI"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add <addon>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Install and register an addon — package, config entry, and migrations check" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add <addon> --path" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Install a local addon from a workspace path" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add <addon> --version <v>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pin a specific version" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons list" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Show installed addons: contributions and versions" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons search <term>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Search the registry" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons info <addon>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Show details of an addon before you commit" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons remove <addon>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Remove an installed addon, leaving its migrations intact and flagged" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons update [addon]" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Update addons within their ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
				" compatibility ranges"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons outdated" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "List addons with newer compatible versions available" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The full command reference for this surface lives on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/addon-commands",
				children: "CLI Addon Commands"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "installing-an-addon",
			children: "Installing an Addon"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "One command installs, registers, and checks:" }),
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
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add" }), " does three things at once:"] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Installs" }), " the package from the registry."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Registers" }),
				" it — it writes the module entry into ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
				" for you."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Checks migrations" }),
				" — module migrations are validated so the addon's schema steps apply cleanly with the app's migrations, and anything needing ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:migrate" }),
				" is flagged."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"After ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add" }),
			", the addon's contributions — models, controllers, pages, config, migrations — are live in the app, registered in configuration, and subject to the same conventions and gates as first-party code."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Local addons work identically with a path instead of a package name:" }),
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
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Pinning follows the same one-step shape:" }),
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
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
						children: " @kwiva/blogstore"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: " --version"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: " 2.1.0"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Manual registration in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
			" remains supported for vendored and path-based modules that were never installed through the CLI:"
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
							children: "// vendored or path-based registration"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "registry-and-distribution-conventions",
			children: "Registry and Distribution Conventions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Publishing an addon is a small, explicit contract:" }),
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "With that contract in place:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add @acme/chat" }), " installs and registers the module."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons search chat" }), " lists it — backed by a curated addon index."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The app pins versions with semver; compatibility is enforced via ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
				" ranges."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The keyword is the discovery bridge. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons search" }),
			" matches on it, and the curated addon index maintains quality and compatibility signals for what search returns. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons info" }),
			" is the pre-install look: description, contribution summary (which models, controllers, pages, or config the addon brings), requirements, and changelog."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "version-and-upgrade-management",
			children: "Version and Upgrade Management"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva resolves upgrades against declared compatibility rather than blindly bumping:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons update" }),
				" brings every addon to the newest version ",
				(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [
					"within its ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
					" range"
				] }),
				" — it refuses to jump outside a declared compatible window."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons outdated" }), " reports what is behind, so upgrades become deliberate decisions rather than periodic rituals."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons info <addon>" }), " shows the installed version, available versions, and requirements before you commit to a move."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons remove <addon>" }), " unregisters and removes the addon cleanly — the package is uninstalled and the registry entry removed, but any schema the addon contributed is left intact and flagged so database data is never silently dropped."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the app pins versions and addons declare ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
			", two apps can hold different addon versions without breakage — upgrades are deliberate, per-app decisions. When an addon's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
			" range conflicts with what the app already pins, resolution rejects the combination instead of running an incompatibility."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!TIP]\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons outdated" }),
				" plus ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons info" }),
				" is the review loop for a low-risk upgrade: find what is behind, read the requirements and changelog, then ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons update <addon>" }),
				" to move within the compatible range."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "first-party-addons",
			children: "First-Party Addons"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Framework-maintained addons cover the common platform capabilities:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Addon" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Ships" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth-kit" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Ready auth screens (sign-in, sign-up, OAuth) + user-management polish" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/blog" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Posts, tags, and comments models + pages + feed" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/billing" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Plans, subscriptions, invoices + webhooks (engine-agnostic gateway)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/notifications" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "In-app + email notification stack" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/analytics" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Event tracking + dashboards" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"These demonstrate the shape a well-built addon takes — namespaced contributions, config defaults apps can override, migrations ordered before app migrations, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
			" ranges that keep them upgradable."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "authoring-and-publishing-an-addon",
			children: "Authoring and Publishing an Addon"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Everything else is publishable by anyone. The authoring surface is the same one you use in an application — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
			" for modules, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePlugin" }),
			" for plugins, and a ui-kit skin for themes:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Scaffold" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:module analytics" }),
				" creates the module folder with slots for each contribution type."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Author" }),
				" — declare contributions through ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
				"; set namespaced config defaults; declare ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Test locally" }),
				" — register the module from its workspace path (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "./addons/analytics" }),
				") in a real app and exercise what it contributes."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Build" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva module:build" }),
				" packages the module with its contribution manifest and a compiled distribution (bundled output plus isolated type declarations)."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Publish" }),
				" — publish to the package registry tagged with the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva-addon" }),
				" keyword."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"From then on, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add @acme/analytics" }),
			" installs it into any compatible app, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons search analytics" }),
			" makes it discoverable to everyone else."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-consumerauthor-contract",
			children: "The Consumer–Author Contract"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The contract holds in both directions:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Consumers" }), " get a surface with no guessing — search, info, install, update, remove, and audit are all first-class commands."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Authors" }), " get one publishing path — package with the keyword, and the addon becomes discoverable through the CLI rather than word of mouth."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "That symmetry is what makes the addon model a distribution story rather than a set of copy-paste instructions." }),
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
			}), " — the contribution points an addon ships"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/composition",
				children: "Application Composition"
			}), " — how registered modules join the kernel"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins",
				children: "Modules & Plugins"
			}), " — the composition model at a glance"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/addon-commands",
				children: "CLI Addons"
			}), " — the command reference for addon workflows"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/generators",
				children: "Modules Reference"
			}), " — generators that scaffold new modules"] }),
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
