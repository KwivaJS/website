import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/cli/addon-commands.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Addon Commands",
	"description": "kwiva add and kwiva addons — installing, searching, listing, inspecting, removing, updating, and auditing capabilities."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nAddons are installable capability packages — the umbrella covering modules, plugins, and themes. Instead of copying code into a project, you install an addon: the command installs the package, registers it in the module registry, and checks for migrations in one step. The addon surface is the distribution story of the framework: `kwiva add` brings capabilities in, and `kwiva addons` manages what is already there.\n\n## How an Addon Lands [#how-an-addon-lands]\n\n```bash title=\"terminal\"\nkwiva add @kwiva/blog\n```\n\n`kwiva add <addon>` performs the full install sequence:\n\n1. Install the addon package.\n2. Add its entry to the module registry in `kwiva.config.ts`.\n3. Check the addon's migrations and flag anything that needs `db:migrate`.\n\nAfter `kwiva add`, the addon's contributions — models, controllers, pages, config, migrations — are live in the app, registered in configuration, and subject to the same conventions as first-party code. A `kwiva check` run sees the addon's files; a `kwiva db:status` run sees the addon's migrations in the same sequence as the app's.\n\nThat parity is the point of the registry entry. There is no separate \"addon mode\" for a contributed model or page — a route contributed by an addon runs through the same pipeline, the same policy checks, and the same lint gates as one you wrote yourself. The only difference is provenance: it came from a package instead of a folder in `src/app/`, and it is tracked so updates and removals stay clean.\n\n## The `add` Variants [#the-add-variants]\n\n| Command                                       | Effect                            |\n| --------------------------------------------- | --------------------------------- |\n| `kwiva add <addon>`                           | Install and register the addon    |\n| `kwiva add <addon> --path ./addons/analytics` | Install a local addon from a path |\n| `kwiva add <addon> --version 1.2.0`           | Pin a specific version            |\n\n`--path` is how you work with addons that live in your repository or a monorepo before publication. `--version` pins the exact version, sidestepping resolution when a pin matters — for a production app that wants a known-good addon version, or during an incident where the resolution algorithm should have no degrees of freedom.\n\n## Managing Addons [#managing-addons]\n\n```bash title=\"terminal\"\nkwiva addons list\nkwiva addons search [query]\nkwiva addons info <addon>\nkwiva addons remove <addon>\nkwiva addons update [addon]\nkwiva addons outdated\n```\n\n| Command                       | What it reports or does                                          |\n| ----------------------------- | ---------------------------------------------------------------- |\n| `kwiva addons list`           | Installed addons with name, version, and a contribution summary  |\n| `kwiva addons search [query]` | Search discoverable addons by keyword                            |\n| `kwiva addons info <addon>`   | Description, contributions, requirements, changelog              |\n| `kwiva addons remove <addon>` | Unregister and uninstall; migrations are left intact and flagged |\n| `kwiva addons update [addon]` | Update within the compatibility range, honoring `requires`       |\n| `kwiva addons outdated`       | List addons with newer compatible versions available             |\n\n`kwiva addons list` is the census: what is installed, what it contributes, and at what version. `kwiva addons info` is the pre-install look — the contribution summary tells you whether the addon brings models, controllers, pages, or config before you commit to it. `kwiva addons outdated` finds newer compatible versions for everything installed, which makes upgrading deliberate rather than periodic.\n\n## The Upgrade Workflow [#the-upgrade-workflow]\n\nUpdates are resolved against declared compatibility, never blindly:\n\n```bash title=\"terminal\"\nkwiva addons outdated       # 1. what is behind?\nkwiva addons info <addon>   # 2. what would change? requirements, changelog\nkwiva addons update <addon> # 3. move within the `requires` range\n```\n\n`kwiva addons update` refuses to jump outside a declared compatible window — if the newest version requires a `@kwiva/*` major you do not pin, it stays put and tells you why. Because apps pin versions and addons declare `requires`, two apps can hold different addon versions without breakage; upgrades are deliberate, per-app decisions.\n\n> \\[!TIP]\n> Include `kwiva addons outdated` in a periodic maintenance pass. Addons age like any dependency, and the command turns \"is anything stale?\" into a one-line answer.\n\n## Removing [#removing]\n\n`kwiva addons remove <addon>` unregisters the addon and uninstalls its package, but it does not silently drop data. Any migrations the addon contributed are left intact and flagged, so you can decide — keeping the tables is often the right call when the schema now belongs to the app. The removal is reversible at the schema level: because the tables remain, re-installing the addon can pick up where the data left off.\n\n## Discovery: How Addons Are Found [#discovery-how-addons-are-found]\n\nAddons are discovered by convention. Authoring an addon is authoring a `defineModule` or `definePlugin` (or a theme package), building it with `kwiva module:build`, and publishing to the package registry tagged with the `kwiva-addon` keyword. That keyword is the discovery bridge: `kwiva addons search` matches it, and a curated index maintains quality and compatibility signals for search results.\n\nThe contract in both directions:\n\n* **Consumers** get a surface with no guessing — search, info, install, update, remove, and audit are all first-class commands.\n* **Authors** get one publishing path — package with the keyword, and the addon becomes discoverable through the CLI rather than word of mouth.\n\n```bash title=\"terminal\"\nkwiva module:build         # package a module: manifest + compiled distribution\n# publish to the registry tagged with the kwiva-addon keyword\nkwiva addons search chat   # now discoverable by anyone\n```\n\nSee [Addons](/docs/modules-plugins/addons) for the full authoring and distribution model.\n\n## Registration and Composition [#registration-and-composition]\n\nAddons register through the module registry in `kwiva.config.ts`:\n\n```ts title=\"kwiva.config.ts\"\n// kwiva.config.ts\nimport { defineConfig } from '@kwiva/config'\n\nexport default defineConfig({\n  load: './src/config',\n  modules: [\n    // first-party modules, local addons, and installed addons all live here\n  ],\n})\n```\n\nThat single array is how the app is composed — the framework discovers your `src/app` files automatically, while everything external joins through `modules`. When multiple addons contribute models or pages, the composition rules decide precedence and conflict:\n\n* **Namespacing** prevents collisions — every module claims its own namespaces for models, routes, config, and policies.\n* **Config precedence** is standard — module defaults are overridden by the app's `src/config/modules.ts` deep merge, app wins.\n* **Peer requirements** reject incompatible combinations rather than running them.\n\nSee [Composition](/docs/modules-plugins/composition).\n\n## Common Workflows [#common-workflows]\n\n| Goal                            | Commands                                                                                 |\n| ------------------------------- | ---------------------------------------------------------------------------------------- |\n| Try a capability                | `kwiva addons search <term>`, then `kwiva addons info <addon>`, then `kwiva add <addon>` |\n| Check what a project depends on | `kwiva addons list`                                                                      |\n| Stay current                    | `kwiva addons outdated`, review, `kwiva addons update`                                   |\n| Remove a package cleanly        | `kwiva addons remove <addon>`, then decide on the flagged migrations                     |\n| Author your own addon           | `kwiva make:module`, author, `kwiva module:build`, publish with the keyword              |\n\n## What's Next [#whats-next]\n\n* [Addons](/docs/modules-plugins/addons) — the addon model and distribution conventions\n* [Defining Modules](/docs/modules-plugins/defining-modules) — what goes inside an addon\n* [Composition](/docs/modules-plugins/composition) — how addons resolve against each other\n* [Generators](/docs/cli/generators) — `make:module` scaffolds addon-ready code\n* [CLI](/docs/cli/) — the rest of the command surface\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Addons are installable capability packages — the umbrella covering modules, plugins, and themes. Instead of copying code into a project, you install an addon: the command installs the package, registers it in the module registry, and checks for migrations in one step. The addon surface is the distribution story of the framework: `kwiva add` brings capabilities in, and `kwiva addons` manages what is already there."
		},
		{
			"heading": "how-an-addon-lands",
			"content": "`kwiva add <addon>` performs the full install sequence:"
		},
		{
			"heading": "how-an-addon-lands",
			"content": "Install the addon package."
		},
		{
			"heading": "how-an-addon-lands",
			"content": "Add its entry to the module registry in `kwiva.config.ts`."
		},
		{
			"heading": "how-an-addon-lands",
			"content": "Check the addon's migrations and flag anything that needs `db:migrate`."
		},
		{
			"heading": "how-an-addon-lands",
			"content": "After `kwiva add`, the addon's contributions — models, controllers, pages, config, migrations — are live in the app, registered in configuration, and subject to the same conventions as first-party code. A `kwiva check` run sees the addon's files; a `kwiva db:status` run sees the addon's migrations in the same sequence as the app's."
		},
		{
			"heading": "how-an-addon-lands",
			"content": "That parity is the point of the registry entry. There is no separate \"addon mode\" for a contributed model or page — a route contributed by an addon runs through the same pipeline, the same policy checks, and the same lint gates as one you wrote yourself. The only difference is provenance: it came from a package instead of a folder in `src/app/`, and it is tracked so updates and removals stay clean."
		},
		{
			"heading": "the-add-variants",
			"content": "Command"
		},
		{
			"heading": "the-add-variants",
			"content": "Effect"
		},
		{
			"heading": "the-add-variants",
			"content": "`kwiva add <addon>`"
		},
		{
			"heading": "the-add-variants",
			"content": "Install and register the addon"
		},
		{
			"heading": "the-add-variants",
			"content": "`kwiva add <addon> --path ./addons/analytics`"
		},
		{
			"heading": "the-add-variants",
			"content": "Install a local addon from a path"
		},
		{
			"heading": "the-add-variants",
			"content": "`kwiva add <addon> --version 1.2.0`"
		},
		{
			"heading": "the-add-variants",
			"content": "Pin a specific version"
		},
		{
			"heading": "the-add-variants",
			"content": "`--path` is how you work with addons that live in your repository or a monorepo before publication. `--version` pins the exact version, sidestepping resolution when a pin matters — for a production app that wants a known-good addon version, or during an incident where the resolution algorithm should have no degrees of freedom."
		},
		{
			"heading": "managing-addons",
			"content": "Command"
		},
		{
			"heading": "managing-addons",
			"content": "What it reports or does"
		},
		{
			"heading": "managing-addons",
			"content": "`kwiva addons list`"
		},
		{
			"heading": "managing-addons",
			"content": "Installed addons with name, version, and a contribution summary"
		},
		{
			"heading": "managing-addons",
			"content": "`kwiva addons search [query]`"
		},
		{
			"heading": "managing-addons",
			"content": "Search discoverable addons by keyword"
		},
		{
			"heading": "managing-addons",
			"content": "`kwiva addons info <addon>`"
		},
		{
			"heading": "managing-addons",
			"content": "Description, contributions, requirements, changelog"
		},
		{
			"heading": "managing-addons",
			"content": "`kwiva addons remove <addon>`"
		},
		{
			"heading": "managing-addons",
			"content": "Unregister and uninstall; migrations are left intact and flagged"
		},
		{
			"heading": "managing-addons",
			"content": "`kwiva addons update [addon]`"
		},
		{
			"heading": "managing-addons",
			"content": "Update within the compatibility range, honoring `requires`"
		},
		{
			"heading": "managing-addons",
			"content": "`kwiva addons outdated`"
		},
		{
			"heading": "managing-addons",
			"content": "List addons with newer compatible versions available"
		},
		{
			"heading": "managing-addons",
			"content": "`kwiva addons list` is the census: what is installed, what it contributes, and at what version. `kwiva addons info` is the pre-install look — the contribution summary tells you whether the addon brings models, controllers, pages, or config before you commit to it. `kwiva addons outdated` finds newer compatible versions for everything installed, which makes upgrading deliberate rather than periodic."
		},
		{
			"heading": "the-upgrade-workflow",
			"content": "Updates are resolved against declared compatibility, never blindly:"
		},
		{
			"heading": "the-upgrade-workflow",
			"content": "`kwiva addons update` refuses to jump outside a declared compatible window — if the newest version requires a `@kwiva/*` major you do not pin, it stays put and tells you why. Because apps pin versions and addons declare `requires`, two apps can hold different addon versions without breakage; upgrades are deliberate, per-app decisions."
		},
		{
			"heading": "the-upgrade-workflow",
			"content": "> \\[!TIP]\n> Include `kwiva addons outdated` in a periodic maintenance pass. Addons age like any dependency, and the command turns \"is anything stale?\" into a one-line answer."
		},
		{
			"heading": "removing",
			"content": "`kwiva addons remove <addon>` unregisters the addon and uninstalls its package, but it does not silently drop data. Any migrations the addon contributed are left intact and flagged, so you can decide — keeping the tables is often the right call when the schema now belongs to the app. The removal is reversible at the schema level: because the tables remain, re-installing the addon can pick up where the data left off."
		},
		{
			"heading": "discovery-how-addons-are-found",
			"content": "Addons are discovered by convention. Authoring an addon is authoring a `defineModule` or `definePlugin` (or a theme package), building it with `kwiva module:build`, and publishing to the package registry tagged with the `kwiva-addon` keyword. That keyword is the discovery bridge: `kwiva addons search` matches it, and a curated index maintains quality and compatibility signals for search results."
		},
		{
			"heading": "discovery-how-addons-are-found",
			"content": "The contract in both directions:"
		},
		{
			"heading": "discovery-how-addons-are-found",
			"content": "**Consumers** get a surface with no guessing — search, info, install, update, remove, and audit are all first-class commands."
		},
		{
			"heading": "discovery-how-addons-are-found",
			"content": "**Authors** get one publishing path — package with the keyword, and the addon becomes discoverable through the CLI rather than word of mouth."
		},
		{
			"heading": "discovery-how-addons-are-found",
			"content": "See Addons for the full authoring and distribution model."
		},
		{
			"heading": "registration-and-composition",
			"content": "Addons register through the module registry in `kwiva.config.ts`:"
		},
		{
			"heading": "registration-and-composition",
			"content": "That single array is how the app is composed — the framework discovers your `src/app` files automatically, while everything external joins through `modules`. When multiple addons contribute models or pages, the composition rules decide precedence and conflict:"
		},
		{
			"heading": "registration-and-composition",
			"content": "**Namespacing** prevents collisions — every module claims its own namespaces for models, routes, config, and policies."
		},
		{
			"heading": "registration-and-composition",
			"content": "**Config precedence** is standard — module defaults are overridden by the app's `src/config/modules.ts` deep merge, app wins."
		},
		{
			"heading": "registration-and-composition",
			"content": "**Peer requirements** reject incompatible combinations rather than running them."
		},
		{
			"heading": "registration-and-composition",
			"content": "See Composition."
		},
		{
			"heading": "common-workflows",
			"content": "Goal"
		},
		{
			"heading": "common-workflows",
			"content": "Commands"
		},
		{
			"heading": "common-workflows",
			"content": "Try a capability"
		},
		{
			"heading": "common-workflows",
			"content": "`kwiva addons search <term>`, then `kwiva addons info <addon>`, then `kwiva add <addon>`"
		},
		{
			"heading": "common-workflows",
			"content": "Check what a project depends on"
		},
		{
			"heading": "common-workflows",
			"content": "`kwiva addons list`"
		},
		{
			"heading": "common-workflows",
			"content": "Stay current"
		},
		{
			"heading": "common-workflows",
			"content": "`kwiva addons outdated`, review, `kwiva addons update`"
		},
		{
			"heading": "common-workflows",
			"content": "Remove a package cleanly"
		},
		{
			"heading": "common-workflows",
			"content": "`kwiva addons remove <addon>`, then decide on the flagged migrations"
		},
		{
			"heading": "common-workflows",
			"content": "Author your own addon"
		},
		{
			"heading": "common-workflows",
			"content": "`kwiva make:module`, author, `kwiva module:build`, publish with the keyword"
		},
		{
			"heading": "whats-next",
			"content": "Addons — the addon model and distribution conventions"
		},
		{
			"heading": "whats-next",
			"content": "Defining Modules — what goes inside an addon"
		},
		{
			"heading": "whats-next",
			"content": "Composition — how addons resolve against each other"
		},
		{
			"heading": "whats-next",
			"content": "Generators — `make:module` scaffolds addon-ready code"
		},
		{
			"heading": "whats-next",
			"content": "CLI — the rest of the command surface"
		}
	],
	"headings": [
		{
			"id": "how-an-addon-lands",
			"content": "How an Addon Lands"
		},
		{
			"id": "the-add-variants",
			"content": "The `add` Variants"
		},
		{
			"id": "managing-addons",
			"content": "Managing Addons"
		},
		{
			"id": "the-upgrade-workflow",
			"content": "The Upgrade Workflow"
		},
		{
			"id": "removing",
			"content": "Removing"
		},
		{
			"id": "discovery-how-addons-are-found",
			"content": "Discovery: How Addons Are Found"
		},
		{
			"id": "registration-and-composition",
			"content": "Registration and Composition"
		},
		{
			"id": "common-workflows",
			"content": "Common Workflows"
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
		url: "#how-an-addon-lands",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How an Addon Lands" })
	},
	{
		depth: 2,
		url: "#the-add-variants",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)("code", { children: "add" }),
			" Variants"
		] })
	},
	{
		depth: 2,
		url: "#managing-addons",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Managing Addons" })
	},
	{
		depth: 2,
		url: "#the-upgrade-workflow",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Upgrade Workflow" })
	},
	{
		depth: 2,
		url: "#removing",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Removing" })
	},
	{
		depth: 2,
		url: "#discovery-how-addons-are-found",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Discovery: How Addons Are Found" })
	},
	{
		depth: 2,
		url: "#registration-and-composition",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Registration and Composition" })
	},
	{
		depth: 2,
		url: "#common-workflows",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Common Workflows" })
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
			"Addons are installable capability packages — the umbrella covering modules, plugins, and themes. Instead of copying code into a project, you install an addon: the command installs the package, registers it in the module registry, and checks for migrations in one step. The addon surface is the distribution story of the framework: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add" }),
			" brings capabilities in, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons" }),
			" manages what is already there."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-an-addon-lands",
			children: "How an Addon Lands"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add <addon>" }), " performs the full install sequence:"] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Install the addon package." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Add its entry to the module registry in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Check the addon's migrations and flag anything that needs ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:migrate" }),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"After ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add" }),
			", the addon's contributions — models, controllers, pages, config, migrations — are live in the app, registered in configuration, and subject to the same conventions as first-party code. A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
			" run sees the addon's files; a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:status" }),
			" run sees the addon's migrations in the same sequence as the app's."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"That parity is the point of the registry entry. There is no separate \"addon mode\" for a contributed model or page — a route contributed by an addon runs through the same pipeline, the same policy checks, and the same lint gates as one you wrote yourself. The only difference is provenance: it came from a package instead of a folder in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/" }),
			", and it is tracked so updates and removals stay clean."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "the-add-variants",
			children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "add" }),
				" Variants"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Effect" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add <addon>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Install and register the addon" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add <addon> --path ./addons/analytics" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Install a local addon from a path" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add <addon> --version 1.2.0" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pin a specific version" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--path" }),
			" is how you work with addons that live in your repository or a monorepo before publication. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--version" }),
			" pins the exact version, sidestepping resolution when a pin matters — for a production app that wants a known-good addon version, or during an incident where the resolution algorithm should have no degrees of freedom."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "managing-addons",
			children: "Managing Addons"
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
							children: " addons"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " list"
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
							children: " search"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " [query]"
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
							children: " info"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "addo"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "n"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: ">"
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
							children: " remove"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "addo"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "n"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: ">"
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
							children: " update"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " [addon]"
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
							children: " outdated"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it reports or does" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons list" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Installed addons with name, version, and a contribution summary" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons search [query]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Search discoverable addons by keyword" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons info <addon>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Description, contributions, requirements, changelog" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons remove <addon>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Unregister and uninstall; migrations are left intact and flagged" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons update [addon]" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Update within the compatibility range, honoring ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons outdated" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "List addons with newer compatible versions available" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons list" }),
			" is the census: what is installed, what it contributes, and at what version. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons info" }),
			" is the pre-install look — the contribution summary tells you whether the addon brings models, controllers, pages, or config before you commit to it. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons outdated" }),
			" finds newer compatible versions for everything installed, which makes upgrading deliberate rather than periodic."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-upgrade-workflow",
			children: "The Upgrade Workflow"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Updates are resolved against declared compatibility, never blindly:" }),
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
							children: " addons"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " outdated"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "       # 1. what is behind?"
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
							children: " info"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "addo"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "n"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: ">"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "   # 2. what would change? requirements, changelog"
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
							children: " update"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "addo"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "n"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: ">"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: " # 3. move within the `requires` range"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons update" }),
			" refuses to jump outside a declared compatible window — if the newest version requires a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
			" major you do not pin, it stays put and tells you why. Because apps pin versions and addons declare ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
			", two apps can hold different addon versions without breakage; upgrades are deliberate, per-app decisions."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!TIP]\nInclude ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons outdated" }),
				" in a periodic maintenance pass. Addons age like any dependency, and the command turns \"is anything stale?\" into a one-line answer."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "removing",
			children: "Removing"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons remove <addon>" }), " unregisters the addon and uninstalls its package, but it does not silently drop data. Any migrations the addon contributed are left intact and flagged, so you can decide — keeping the tables is often the right call when the schema now belongs to the app. The removal is reversible at the schema level: because the tables remain, re-installing the addon can pick up where the data left off."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "discovery-how-addons-are-found",
			children: "Discovery: How Addons Are Found"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Addons are discovered by convention. Authoring an addon is authoring a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
			" or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePlugin" }),
			" (or a theme package), building it with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva module:build" }),
			", and publishing to the package registry tagged with the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva-addon" }),
			" keyword. That keyword is the discovery bridge: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons search" }),
			" matches it, and a curated index maintains quality and compatibility signals for search results."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The contract in both directions:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Consumers" }), " get a surface with no guessing — search, info, install, update, remove, and audit are all first-class commands."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Authors" }), " get one publishing path — package with the keyword, and the addon becomes discoverable through the CLI rather than word of mouth."] }),
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
							children: " module:build"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "         # package a module: manifest + compiled distribution"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "# publish to the registry tagged with the kwiva-addon keyword"
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
							children: " search"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " chat"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "   # now discoverable by anyone"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/addons",
				children: "Addons"
			}),
			" for the full authoring and distribution model."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "registration-and-composition",
			children: "Registration and Composition"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Addons register through the module registry in ",
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
							children: "  load: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./src/config'"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "    // first-party modules, local addons, and installed addons all live here"
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
			"That single array is how the app is composed — the framework discovers your ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app" }),
			" files automatically, while everything external joins through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "modules" }),
			". When multiple addons contribute models or pages, the composition rules decide precedence and conflict:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Namespacing" }), " prevents collisions — every module claims its own namespaces for models, routes, config, and policies."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Config precedence" }),
				" is standard — module defaults are overridden by the app's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/modules.ts" }),
				" deep merge, app wins."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Peer requirements" }), " reject incompatible combinations rather than running them."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/composition",
				children: "Composition"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "common-workflows",
			children: "Common Workflows"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Goal" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Commands" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Try a capability" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons search <term>" }),
				", then ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons info <addon>" }),
				", then ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add <addon>" })
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Check what a project depends on" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons list" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Stay current" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons outdated" }),
				", review, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons update" })
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Remove a package cleanly" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons remove <addon>" }), ", then decide on the flagged migrations"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Author your own addon" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:module" }),
				", author, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva module:build" }),
				", publish with the keyword"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/addons",
				children: "Addons"
			}), " — the addon model and distribution conventions"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/defining-modules",
				children: "Defining Modules"
			}), " — what goes inside an addon"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/composition",
				children: "Composition"
			}), " — how addons resolve against each other"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/cli/generators",
					children: "Generators"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:module" }),
				" scaffolds addon-ready code"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/",
				children: "CLI"
			}), " — the rest of the command surface"] }),
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
