import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/studio/configuration.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Studio Configuration",
	"description": "Enable Studio, choose the mount route and access guard, control which models appear, and configure audit visibility and branding."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nStudio is off by default. Enabling it is a single block in your app configuration, but a handful of related switches control how it mounts, who can reach it, and how much operational history it exposes. Because Studio is generated from the same model IR as everything else, configuration is about enabling and gating — not about describing the interface.\n\n## Enabling Studio [#enabling-studio]\n\nStudio lives under the `studio` key of the app config module:\n\n```ts title=\"src/config/app.ts\"\n// src/config/app.ts\nexport default defineConfig('app', {\n  defaults: {\n    studio: { enabled: true, route: '/studio', guard: 'admin-role' },\n  },\n})\n```\n\nThree settings matter up front:\n\n| Key       | Purpose                                 | Default      |\n| --------- | --------------------------------------- | ------------ |\n| `enabled` | Turns the Studio route bundle on or off | `false`      |\n| `route`   | The base path Studio mounts at          | `/studio`    |\n| `guard`   | The gate a user must pass to enter      | `admin-role` |\n\nWith `enabled: true`, Studio is mounted at `route` and protected by `guard`. Both the mount and the gate are config, so a deployment can run Studio on a private path with a staff-only gate while the public app stays untouched.\n\n## Where It Mounts [#where-it-mounts]\n\nStudio mounts as a single path namespace under the configured `route`. With the default config that is:\n\n```plaintext title=\"where-it-mounts.txt\"\n/studio              → landing / navigation\n/studio/posts        → list screen\n/studio/posts/:id    → detail screen\n/studio/posts/new    → create screen\n/studio/posts/:id/edit → edit screen\n```\n\nBecause every model contributes screens under `route`, the whole surface is one predictable namespace. That keeps routing, guarding, network rules, and link generation simple — one prefix to protect, one prefix to document.\n\nBecause the Studio bundle is emitted as a separate route chunk at build time, it is never shipped to public pages. The operations UI and your customer-facing app are distinct artifacts served from the same codebase; Studio code never loads for a visitor who does not enter the Studio namespace.\n\n## Who Can Enter [#who-can-enter]\n\nThe `guard` option gates access to the Studio namespace. The default value requires the `admin` role, and the check runs through the policy engine — the same `definePolicy` rules that protect your generated routes, controller routes, channels, and MCP tools.\n\nYou can supply any gate that your authorization layer accepts, so the guard can express things like a staff-only role, a tenant-owner check, or a custom role matrix. Whatever you choose, the rule is uniform: &#x2A;*the gate admits a user to Studio, and then every individual action inside Studio is still checked against its own ability.**\n\nThe access gate is admission; it is not a blanket bypass of action-level permissions. See [Roles](/docs/authorization/roles) for role configuration and [Policies](/docs/authorization/policies) for the ability model.\n\n## Which Models Appear [#which-models-appear]\n\nEvery model you define with `defineModel` is a candidate for a Studio screen. The screens are generated from the model IR — there is no separate list of admin \"resources\" to maintain. Models that carry a `permission` option surface their screens under that permission namespace, and the generated actions are gated by the matching policy.\n\nThis means:\n\n* A model with a `permission` setting appears in Studio with actions governed by its policy\n* Models whose configuration you extend inline (for example caching or rate limits) keep those settings on their Studio screens too\n* Renaming or removing a model updates Studio on the next load — no manual sync\n\nIf a model should not appear in Studio at all, the lever is its `permission` configuration rather than a Studio-specific denylist — the same policy that gates its routes gates its admin surface.\n\n## Permission Gating [#permission-gating]\n\nStudio is a client of the same generated REST routes and typed client your API uses, so the permission story carries over unchanged:\n\n| Surface        | Rule                                                                 |\n| -------------- | -------------------------------------------------------------------- |\n| List screen    | only rows the user can read render; `read` ability                   |\n| Create screen  | hidden without the `create` ability                                  |\n| Edit screen    | `update` ability, checked per row                                    |\n| Delete action  | `delete` ability, checked per row                                    |\n| Custom actions | the `ability` you declare on the action, for example `posts.publish` |\n\nActions a user lacks the ability for are hidden or disabled — never shown and rejected. Cross-tenant rows are invisible to the resolved tenant, so Studio enforces the same scoping as your routes.\n\n## Audit Visibility [#audit-visibility]\n\nTwo layers of audit are available, and which one you see depends on your models:\n\n1. **Model audit trail** — models declared with `{ audit: true }` record `createdBy` and `updatedBy` on every row from the session. Studio exposes the change history for these models.\n2. **Studio audit screen** — the built-in Audit screen (v1.x) lists change history across audited models in one place.\n\nAudit is additive: models without `audit: true` get no change history, and enabling audit on a model later applies from the point of enablement. The recorded actor always comes from the session, so impersonation and background jobs show their responsible identities rather than a free-form string.\n\n## Tenant Scoping [#tenant-scoping]\n\nWhen tenancy is configured, Studio inherits the tenant context of the current request. The relationship-aware Studio renders only the resolved tenant's rows, applies the same storage and cache scoping as your routes, and treats cross-tenant access identically to a missing record.\n\nPlatform staff who need a cross-tenant view use the same `asAdmin` escape hatch available in policies — scoped to your platform-user roles, never to ordinary Studio access. See [Tenancy](/docs/tenancy) and [Tenant Scoping](/docs/tenancy/scoping).\n\n## Branding [#branding]\n\n`studio: { branding }` controls the visible identity of the back office:\n\n| Key     | Purpose                                       |\n| ------- | --------------------------------------------- |\n| `logo`  | The mark shown in the Studio shell            |\n| `title` | The product name in the Studio header         |\n| `theme` | The visual theme applied to generated screens |\n\nBecause the whole surface is themeable, Studio can be branded as your product's back office rather than an internal tool that leaks the framework's look. The theme key feeds the same theming system the public UI uses, so a dark-mode admin experience is a theme choice, not a fork of Studio. See [Customization](/docs/studio/customization) for theming detail.\n\n## Environment-Shaped Configuration [#environment-shaped-configuration]\n\nConfiguration is overridable per environment through the typed environment binding, exactly like every other config module. A common shape: Studio enabled and reachable at `/studio` in development, mounted on a restricted path with a stricter guard in production, and disabled entirely on staging instances that should not accept operator traffic. The `guard` and `enabled` keys change per environment without touching model or screen code.\n\n## What's Next [#whats-next]\n\n* [Generated UI](/docs/studio/generated-ui) — what Studio derives from each model\n* [Policies](/docs/authorization/policies) — how abilities gate every Studio action\n* [Multi-Tenancy](/docs/tenancy) — how tenant scoping applies to Studio\n* [Models](/docs/data/models) — the model options that drive Studio screens\n* [Configuration](/docs/core-concepts/configuration) — the config folder and precedence rules\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Studio is off by default. Enabling it is a single block in your app configuration, but a handful of related switches control how it mounts, who can reach it, and how much operational history it exposes. Because Studio is generated from the same model IR as everything else, configuration is about enabling and gating — not about describing the interface."
		},
		{
			"heading": "enabling-studio",
			"content": "Studio lives under the `studio` key of the app config module:"
		},
		{
			"heading": "enabling-studio",
			"content": "Three settings matter up front:"
		},
		{
			"heading": "enabling-studio",
			"content": "Key"
		},
		{
			"heading": "enabling-studio",
			"content": "Purpose"
		},
		{
			"heading": "enabling-studio",
			"content": "Default"
		},
		{
			"heading": "enabling-studio",
			"content": "`enabled`"
		},
		{
			"heading": "enabling-studio",
			"content": "Turns the Studio route bundle on or off"
		},
		{
			"heading": "enabling-studio",
			"content": "`false`"
		},
		{
			"heading": "enabling-studio",
			"content": "`route`"
		},
		{
			"heading": "enabling-studio",
			"content": "The base path Studio mounts at"
		},
		{
			"heading": "enabling-studio",
			"content": "`/studio`"
		},
		{
			"heading": "enabling-studio",
			"content": "`guard`"
		},
		{
			"heading": "enabling-studio",
			"content": "The gate a user must pass to enter"
		},
		{
			"heading": "enabling-studio",
			"content": "`admin-role`"
		},
		{
			"heading": "enabling-studio",
			"content": "With `enabled: true`, Studio is mounted at `route` and protected by `guard`. Both the mount and the gate are config, so a deployment can run Studio on a private path with a staff-only gate while the public app stays untouched."
		},
		{
			"heading": "where-it-mounts",
			"content": "Studio mounts as a single path namespace under the configured `route`. With the default config that is:"
		},
		{
			"heading": "where-it-mounts",
			"content": "Because every model contributes screens under `route`, the whole surface is one predictable namespace. That keeps routing, guarding, network rules, and link generation simple — one prefix to protect, one prefix to document."
		},
		{
			"heading": "where-it-mounts",
			"content": "Because the Studio bundle is emitted as a separate route chunk at build time, it is never shipped to public pages. The operations UI and your customer-facing app are distinct artifacts served from the same codebase; Studio code never loads for a visitor who does not enter the Studio namespace."
		},
		{
			"heading": "who-can-enter",
			"content": "The `guard` option gates access to the Studio namespace. The default value requires the `admin` role, and the check runs through the policy engine — the same `definePolicy` rules that protect your generated routes, controller routes, channels, and MCP tools."
		},
		{
			"heading": "who-can-enter",
			"content": "You can supply any gate that your authorization layer accepts, so the guard can express things like a staff-only role, a tenant-owner check, or a custom role matrix. Whatever you choose, the rule is uniform: &#x2A;*the gate admits a user to Studio, and then every individual action inside Studio is still checked against its own ability.**"
		},
		{
			"heading": "who-can-enter",
			"content": "The access gate is admission; it is not a blanket bypass of action-level permissions. See Roles for role configuration and Policies for the ability model."
		},
		{
			"heading": "which-models-appear",
			"content": "Every model you define with `defineModel` is a candidate for a Studio screen. The screens are generated from the model IR — there is no separate list of admin \"resources\" to maintain. Models that carry a `permission` option surface their screens under that permission namespace, and the generated actions are gated by the matching policy."
		},
		{
			"heading": "which-models-appear",
			"content": "This means:"
		},
		{
			"heading": "which-models-appear",
			"content": "A model with a `permission` setting appears in Studio with actions governed by its policy"
		},
		{
			"heading": "which-models-appear",
			"content": "Models whose configuration you extend inline (for example caching or rate limits) keep those settings on their Studio screens too"
		},
		{
			"heading": "which-models-appear",
			"content": "Renaming or removing a model updates Studio on the next load — no manual sync"
		},
		{
			"heading": "which-models-appear",
			"content": "If a model should not appear in Studio at all, the lever is its `permission` configuration rather than a Studio-specific denylist — the same policy that gates its routes gates its admin surface."
		},
		{
			"heading": "permission-gating",
			"content": "Studio is a client of the same generated REST routes and typed client your API uses, so the permission story carries over unchanged:"
		},
		{
			"heading": "permission-gating",
			"content": "Surface"
		},
		{
			"heading": "permission-gating",
			"content": "Rule"
		},
		{
			"heading": "permission-gating",
			"content": "List screen"
		},
		{
			"heading": "permission-gating",
			"content": "only rows the user can read render; `read` ability"
		},
		{
			"heading": "permission-gating",
			"content": "Create screen"
		},
		{
			"heading": "permission-gating",
			"content": "hidden without the `create` ability"
		},
		{
			"heading": "permission-gating",
			"content": "Edit screen"
		},
		{
			"heading": "permission-gating",
			"content": "`update` ability, checked per row"
		},
		{
			"heading": "permission-gating",
			"content": "Delete action"
		},
		{
			"heading": "permission-gating",
			"content": "`delete` ability, checked per row"
		},
		{
			"heading": "permission-gating",
			"content": "Custom actions"
		},
		{
			"heading": "permission-gating",
			"content": "the `ability` you declare on the action, for example `posts.publish`"
		},
		{
			"heading": "permission-gating",
			"content": "Actions a user lacks the ability for are hidden or disabled — never shown and rejected. Cross-tenant rows are invisible to the resolved tenant, so Studio enforces the same scoping as your routes."
		},
		{
			"heading": "audit-visibility",
			"content": "Two layers of audit are available, and which one you see depends on your models:"
		},
		{
			"heading": "audit-visibility",
			"content": "**Model audit trail** — models declared with `{ audit: true }` record `createdBy` and `updatedBy` on every row from the session. Studio exposes the change history for these models."
		},
		{
			"heading": "audit-visibility",
			"content": "**Studio audit screen** — the built-in Audit screen (v1.x) lists change history across audited models in one place."
		},
		{
			"heading": "audit-visibility",
			"content": "Audit is additive: models without `audit: true` get no change history, and enabling audit on a model later applies from the point of enablement. The recorded actor always comes from the session, so impersonation and background jobs show their responsible identities rather than a free-form string."
		},
		{
			"heading": "tenant-scoping",
			"content": "When tenancy is configured, Studio inherits the tenant context of the current request. The relationship-aware Studio renders only the resolved tenant's rows, applies the same storage and cache scoping as your routes, and treats cross-tenant access identically to a missing record."
		},
		{
			"heading": "tenant-scoping",
			"content": "Platform staff who need a cross-tenant view use the same `asAdmin` escape hatch available in policies — scoped to your platform-user roles, never to ordinary Studio access. See Tenancy and Tenant Scoping."
		},
		{
			"heading": "branding",
			"content": "`studio: { branding }` controls the visible identity of the back office:"
		},
		{
			"heading": "branding",
			"content": "Key"
		},
		{
			"heading": "branding",
			"content": "Purpose"
		},
		{
			"heading": "branding",
			"content": "`logo`"
		},
		{
			"heading": "branding",
			"content": "The mark shown in the Studio shell"
		},
		{
			"heading": "branding",
			"content": "`title`"
		},
		{
			"heading": "branding",
			"content": "The product name in the Studio header"
		},
		{
			"heading": "branding",
			"content": "`theme`"
		},
		{
			"heading": "branding",
			"content": "The visual theme applied to generated screens"
		},
		{
			"heading": "branding",
			"content": "Because the whole surface is themeable, Studio can be branded as your product's back office rather than an internal tool that leaks the framework's look. The theme key feeds the same theming system the public UI uses, so a dark-mode admin experience is a theme choice, not a fork of Studio. See Customization for theming detail."
		},
		{
			"heading": "environment-shaped-configuration",
			"content": "Configuration is overridable per environment through the typed environment binding, exactly like every other config module. A common shape: Studio enabled and reachable at `/studio` in development, mounted on a restricted path with a stricter guard in production, and disabled entirely on staging instances that should not accept operator traffic. The `guard` and `enabled` keys change per environment without touching model or screen code."
		},
		{
			"heading": "whats-next",
			"content": "Generated UI — what Studio derives from each model"
		},
		{
			"heading": "whats-next",
			"content": "Policies — how abilities gate every Studio action"
		},
		{
			"heading": "whats-next",
			"content": "Multi-Tenancy — how tenant scoping applies to Studio"
		},
		{
			"heading": "whats-next",
			"content": "Models — the model options that drive Studio screens"
		},
		{
			"heading": "whats-next",
			"content": "Configuration — the config folder and precedence rules"
		}
	],
	"headings": [
		{
			"id": "enabling-studio",
			"content": "Enabling Studio"
		},
		{
			"id": "where-it-mounts",
			"content": "Where It Mounts"
		},
		{
			"id": "who-can-enter",
			"content": "Who Can Enter"
		},
		{
			"id": "which-models-appear",
			"content": "Which Models Appear"
		},
		{
			"id": "permission-gating",
			"content": "Permission Gating"
		},
		{
			"id": "audit-visibility",
			"content": "Audit Visibility"
		},
		{
			"id": "tenant-scoping",
			"content": "Tenant Scoping"
		},
		{
			"id": "branding",
			"content": "Branding"
		},
		{
			"id": "environment-shaped-configuration",
			"content": "Environment-Shaped Configuration"
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
		url: "#enabling-studio",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Enabling Studio" })
	},
	{
		depth: 2,
		url: "#where-it-mounts",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where It Mounts" })
	},
	{
		depth: 2,
		url: "#who-can-enter",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Who Can Enter" })
	},
	{
		depth: 2,
		url: "#which-models-appear",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Which Models Appear" })
	},
	{
		depth: 2,
		url: "#permission-gating",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Permission Gating" })
	},
	{
		depth: 2,
		url: "#audit-visibility",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Audit Visibility" })
	},
	{
		depth: 2,
		url: "#tenant-scoping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Tenant Scoping" })
	},
	{
		depth: 2,
		url: "#branding",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Branding" })
	},
	{
		depth: 2,
		url: "#environment-shaped-configuration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Environment-Shaped Configuration" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio is off by default. Enabling it is a single block in your app configuration, but a handful of related switches control how it mounts, who can reach it, and how much operational history it exposes. Because Studio is generated from the same model IR as everything else, configuration is about enabling and gating — not about describing the interface." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "enabling-studio",
			children: "Enabling Studio"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Studio lives under the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "studio" }),
			" key of the app config module:"
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
			title: "src/config/app.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/app.ts"
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
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'app'"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  defaults: {"
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
							children: "    studio: { enabled: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "true"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", route: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'/studio'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", guard: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'admin-role'"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Three settings matter up front:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Key" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Default" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "enabled" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Turns the Studio route bundle on or off" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "false" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "route" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The base path Studio mounts at" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "guard" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The gate a user must pass to enter" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "admin-role" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"With ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "enabled: true" }),
			", Studio is mounted at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "route" }),
			" and protected by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "guard" }),
			". Both the mount and the gate are config, so a deployment can run Studio on a private path with a staff-only gate while the public app stays untouched."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-it-mounts",
			children: "Where It Mounts"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Studio mounts as a single path namespace under the configured ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "route" }),
			". With the default config that is:"
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
			title: "where-it-mounts.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/studio              → landing / navigation" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/studio/posts        → list screen" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/studio/posts/:id    → detail screen" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/studio/posts/new    → create screen" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/studio/posts/:id/edit → edit screen" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because every model contributes screens under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "route" }),
			", the whole surface is one predictable namespace. That keeps routing, guarding, network rules, and link generation simple — one prefix to protect, one prefix to document."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the Studio bundle is emitted as a separate route chunk at build time, it is never shipped to public pages. The operations UI and your customer-facing app are distinct artifacts served from the same codebase; Studio code never loads for a visitor who does not enter the Studio namespace." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "who-can-enter",
			children: "Who Can Enter"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "guard" }),
			" option gates access to the Studio namespace. The default value requires the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "admin" }),
			" role, and the check runs through the policy engine — the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			" rules that protect your generated routes, controller routes, channels, and MCP tools."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: ["You can supply any gate that your authorization layer accepts, so the guard can express things like a staff-only role, a tenant-owner check, or a custom role matrix. Whatever you choose, the rule is uniform: ", (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "the gate admits a user to Studio, and then every individual action inside Studio is still checked against its own ability." })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The access gate is admission; it is not a blanket bypass of action-level permissions. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/roles",
				children: "Roles"
			}),
			" for role configuration and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/policies",
				children: "Policies"
			}),
			" for the ability model."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "which-models-appear",
			children: "Which Models Appear"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every model you define with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" is a candidate for a Studio screen. The screens are generated from the model IR — there is no separate list of admin \"resources\" to maintain. Models that carry a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" option surface their screens under that permission namespace, and the generated actions are gated by the matching policy."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This means:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A model with a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" setting appears in Studio with actions governed by its policy"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Models whose configuration you extend inline (for example caching or rate limits) keep those settings on their Studio screens too" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Renaming or removing a model updates Studio on the next load — no manual sync" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"If a model should not appear in Studio at all, the lever is its ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" configuration rather than a Studio-specific denylist — the same policy that gates its routes gates its admin surface."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "permission-gating",
			children: "Permission Gating"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio is a client of the same generated REST routes and typed client your API uses, so the permission story carries over unchanged:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Rule" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "List screen" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"only rows the user can read render; ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "read" }),
				" ability"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Create screen" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"hidden without the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "create" }),
				" ability"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edit screen" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "update" }), " ability, checked per row"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Delete action" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delete" }), " ability, checked per row"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Custom actions" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ability" }),
				" you declare on the action, for example ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" })
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Actions a user lacks the ability for are hidden or disabled — never shown and rejected. Cross-tenant rows are invisible to the resolved tenant, so Studio enforces the same scoping as your routes." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "audit-visibility",
			children: "Audit Visibility"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two layers of audit are available, and which one you see depends on your models:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Model audit trail" }),
				" — models declared with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ audit: true }" }),
				" record ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createdBy" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "updatedBy" }),
				" on every row from the session. Studio exposes the change history for these models."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Studio audit screen" }), " — the built-in Audit screen (v1.x) lists change history across audited models in one place."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Audit is additive: models without ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "audit: true" }),
			" get no change history, and enabling audit on a model later applies from the point of enablement. The recorded actor always comes from the session, so impersonation and background jobs show their responsible identities rather than a free-form string."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "tenant-scoping",
			children: "Tenant Scoping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "When tenancy is configured, Studio inherits the tenant context of the current request. The relationship-aware Studio renders only the resolved tenant's rows, applies the same storage and cache scoping as your routes, and treats cross-tenant access identically to a missing record." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Platform staff who need a cross-tenant view use the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "asAdmin" }),
			" escape hatch available in policies — scoped to your platform-user roles, never to ordinary Studio access. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy",
				children: "Tenancy"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/scoping",
				children: "Tenant Scoping"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "branding",
			children: "Branding"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "studio: { branding }" }), " controls the visible identity of the back office:"] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Key" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "logo" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The mark shown in the Studio shell" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "title" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The product name in the Studio header" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "theme" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The visual theme applied to generated screens" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the whole surface is themeable, Studio can be branded as your product's back office rather than an internal tool that leaks the framework's look. The theme key feeds the same theming system the public UI uses, so a dark-mode admin experience is a theme choice, not a fork of Studio. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/customization",
				children: "Customization"
			}),
			" for theming detail."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "environment-shaped-configuration",
			children: "Environment-Shaped Configuration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Configuration is overridable per environment through the typed environment binding, exactly like every other config module. A common shape: Studio enabled and reachable at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio" }),
			" in development, mounted on a restricted path with a stricter guard in production, and disabled entirely on staging instances that should not accept operator traffic. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "guard" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "enabled" }),
			" keys change per environment without touching model or screen code."
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
				href: "/docs/studio/generated-ui",
				children: "Generated UI"
			}), " — what Studio derives from each model"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/policies",
				children: "Policies"
			}), " — how abilities gate every Studio action"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy",
				children: "Multi-Tenancy"
			}), " — how tenant scoping applies to Studio"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}), " — the model options that drive Studio screens"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/configuration",
				children: "Configuration"
			}), " — the config folder and precedence rules"] }),
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
