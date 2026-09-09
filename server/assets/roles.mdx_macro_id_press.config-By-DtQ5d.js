import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/authorization/roles.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "RBAC",
	"description": "Role and permission fields on User, assigning and defaulting roles, seeding strategy, and how policies — not app code — interpret roles."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nRole-based access control in Kwiva rests on a simple rule: **roles are data, policies interpret them**. The `role` and `permission` fields on the user record carry identity, `definePolicy` files decide what any role may do, and application code never checks roles directly — it checks abilities, letting one policy change propagate everywhere.\n\nRoles are deliberately unmagical. They are enum values on a model column, stored like any other data, queried like any other data, and interpreted in exactly one place: policies. Everything else in the framework — routes, Studio screens, client hooks, MCP tools — asks \"can this user do X?\" and never \"is this user role Y?\". That indirection is the entire point of the design: role meaning lives in one file, not scattered through handlers.\n\n## Roles as Data [#roles-as-data]\n\nA role is a value on the user record, nothing more magical:\n\n```ts title=\"roles-as-data.ts\"\ndefineModel('users', (f) => ({\n  id: f.id(),\n  email: f.string().unique(),\n  name: f.string(),\n  role: f.enum('user', 'admin').default('user').indexed(),\n  // engine-managed columns (added automatically at migration time):\n  // password_hash, session references, oauth accounts, passkey credentials\n}), { timestamps: true, permission: 'users' })\n```\n\nThe `role` field is a typed enum with a default, and the `permission` field holds explicit grants. Together they answer \"what is this person\" (`role`) and \"what extra can they do\" (`permission`). Because both live on the model, they come with queryability, uniqueness, and indexing for free — filtering by role or building an admin list is a normal query.\n\n> \\[!NOTE]\n> The exact role names are yours. The common scaffolded set is `user` and `admin`; teams with editorial needs add `editor`; tenancy adds `owner` semantics through the tenant record's `ownerId`. What stays constant is the mechanism — roles are enum data, and policies give them meaning.\n\n### Common role shapes [#common-role-shapes]\n\n| Role     | Typical meaning                                      | Where it shows up                        |\n| -------- | ---------------------------------------------------- | ---------------------------------------- |\n| `user`   | Default sign-up bucket, minimal abilities            | Default on the `role` field              |\n| `admin`  | Broad authority, short-circuits policies             | `if (user.role === 'admin') return true` |\n| `editor` | Content capability beyond the standard verbs         | `case 'publish'` in content policies     |\n| `owner`  | Tenant ownership, from the tenant record's `ownerId` | Tenant-scoped policies and gates         |\n\nThe `permission` field complements the role with explicit grants — a user can hold a role bundle of expected abilities plus named extras. Policies interpret both together.\n\n## Assigning and Defaulting Roles [#assigning-and-defaulting-roles]\n\nRoles are assigned like any data: written at creation, updated over the user's life, seeded for tests and staging.\n\n* **Default roles** — the `default('user')` on the field means every sign-up lands in the safe bucket until explicitly elevated; no code path can forget to set a role.\n* **Manual assignment** — an admin action updates the `role` field on the specific record.\n* **Assignment by seed** — seeders assign roles during development and test setup so fixtures have the right expectations baked in.\n\nUpgrading a user to admin is a single field update, and it is immediately visible to every policy in the next request — no cache to flush, no redeploy. Because policies read the field at decision time, the change takes effect with zero propagation steps.\n\n## Seeding Strategies [#seeding-strategies]\n\nSeeding roles follows the same conventions as seeding any data. Because role data is just enum values on user records, factories and seeders compose naturally:\n\n```ts title=\"seeding-strategies.ts\"\n// src/database/seeders/\nAdmin.factory().create({ role: 'admin', email: 'admin@example.com' })\nStandard.factory().count(10).create({ role: 'user' })\n```\n\nA common strategy is to seed a small fixed set — one admin, a couple of editors, a handful of standard users — so that every environment has known identities with known capabilities, and policies can be exercised realistically from the first run. Test setups that need isolation rely on the same factories, so role-bearing fixtures are consistent between local development and CI.\n\n## The role, Permission Field, and Policies [#the-role-permission-field-and-policies]\n\nThe division of labor is strict:\n\n| Where            | What lives there                                       |\n| ---------------- | ------------------------------------------------------ |\n| User record      | `role` and `permission` data                           |\n| Policy files     | The interpretation of that data into abilities         |\n| Application code | Only ability checks — `ctx.can`, `authorize`, `useCan` |\n\nPolicies read role values and translate them into decisions:\n\n```ts title=\"the-role-permission-field-and-policies.ts\"\nexport default definePolicy('posts', (user, ability, resource) => {\n  if (user.role === 'admin') return true\n  switch (ability) {\n    case 'publish':   return user.role === 'editor'\n    default:          return false\n  }\n})\n```\n\nThe `admin` short-circuit and the `editor` publish case are where roles mean anything. Move the role out of the policy and the same admin is suddenly locked out of every surface at once — consistently, because it is the same policy everywhere.\n\n### Permission grants beyond roles [#permission-grants-beyond-roles]\n\nRoles bundle expected behavior, but they are not exhaustive. The `permission` field exists for explicit, per-user grants that do not fit a role bundle. Both feed the same resolution: a user's effective ability is the policy's answer given their role data and explicit grants. Assigning or revoking a permission is a field update, exactly like a role change.\n\n## Why Application Code Never Checks Roles [#why-application-code-never-checks-roles]\n\nDirect role checks in handlers are a drift hazard: one route checks `user.role === 'admin'`, another checks `user.role !== 'user'`, and before long \"admin\" means different things in different places. Kwiva enforces the discipline with a lint gate — `no-role-checks` (v1.x) — flagging role comparisons outside policies. The rule is the reason `ctx.can('posts.publish')` reads as a product question while `user.role === 'editor'` reads as a data detail.\n\nThe payback appears when product rules change. If \"editor can publish\" becomes \"editor can publish only within their workspace\", the change lives in one policy file and propagates to every surface — a route, a Studio screen, an MCP tool — on the next decision. A role comparison scattered across handlers would require hunting down every occurrence.\n\n## Organizations as Roles (v1.x) [#organizations-as-roles-v1x]\n\nIn v1.x, the org membership model maps onto RBAC directly: each organization membership has roles, and those membership roles are policy roles. Combined with tenancy in `org` mode, a user's role becomes tenant-scoped — admin in one tenant, standard user in another — and policies interpret the membership role for the active tenant. Same policy engine, one more axis.\n\nThe model is the same as plain RBAC: membership rows carry the role data, and policies read it. The only difference is which membership is consulted — the one for the active tenant — so the same user genuinely holds different authority in different workspaces without any field juggling.\n\n## Role Visibility (v1.x) [#role-visibility-v1x]\n\nRole matrices inside Studio are generated from the policies themselves, showing which roles hold which abilities. Because the matrix derives from policy source rather than a duplicated table, it can never drift from actual enforcement — what the matrix says an editor can publish is exactly what the policy enforces.\n\nThis is the payoff of \"roles are data, policies interpret them\" made visible: the admin UI for role management is a projection of the policy source, not a second system that can disagree with it.\n\n## What's Next [#whats-next]\n\n* [Policies](/docs/authorization/policies) — the only place roles should be read\n* [Permissions](/docs/authorization/permissions) — the ability strings roles translate into\n* [Enforcement Points](/docs/authorization/enforcement) — how role-derived decisions run on every surface\n* [Models](/docs/data/models) — declaring the `role` and `permission` fields\n* [Seeders](/docs/data/seeders) — seeding known identities and roles\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Role-based access control in Kwiva rests on a simple rule: **roles are data, policies interpret them**. The `role` and `permission` fields on the user record carry identity, `definePolicy` files decide what any role may do, and application code never checks roles directly — it checks abilities, letting one policy change propagate everywhere."
		},
		{
			"heading": void 0,
			"content": "Roles are deliberately unmagical. They are enum values on a model column, stored like any other data, queried like any other data, and interpreted in exactly one place: policies. Everything else in the framework — routes, Studio screens, client hooks, MCP tools — asks \"can this user do X?\" and never \"is this user role Y?\". That indirection is the entire point of the design: role meaning lives in one file, not scattered through handlers."
		},
		{
			"heading": "roles-as-data",
			"content": "A role is a value on the user record, nothing more magical:"
		},
		{
			"heading": "roles-as-data",
			"content": "The `role` field is a typed enum with a default, and the `permission` field holds explicit grants. Together they answer \"what is this person\" (`role`) and \"what extra can they do\" (`permission`). Because both live on the model, they come with queryability, uniqueness, and indexing for free — filtering by role or building an admin list is a normal query."
		},
		{
			"heading": "roles-as-data",
			"content": "> \\[!NOTE]\n> The exact role names are yours. The common scaffolded set is `user` and `admin`; teams with editorial needs add `editor`; tenancy adds `owner` semantics through the tenant record's `ownerId`. What stays constant is the mechanism — roles are enum data, and policies give them meaning."
		},
		{
			"heading": "common-role-shapes",
			"content": "Role"
		},
		{
			"heading": "common-role-shapes",
			"content": "Typical meaning"
		},
		{
			"heading": "common-role-shapes",
			"content": "Where it shows up"
		},
		{
			"heading": "common-role-shapes",
			"content": "`user`"
		},
		{
			"heading": "common-role-shapes",
			"content": "Default sign-up bucket, minimal abilities"
		},
		{
			"heading": "common-role-shapes",
			"content": "Default on the `role` field"
		},
		{
			"heading": "common-role-shapes",
			"content": "`admin`"
		},
		{
			"heading": "common-role-shapes",
			"content": "Broad authority, short-circuits policies"
		},
		{
			"heading": "common-role-shapes",
			"content": "`if (user.role === 'admin') return true`"
		},
		{
			"heading": "common-role-shapes",
			"content": "`editor`"
		},
		{
			"heading": "common-role-shapes",
			"content": "Content capability beyond the standard verbs"
		},
		{
			"heading": "common-role-shapes",
			"content": "`case 'publish'` in content policies"
		},
		{
			"heading": "common-role-shapes",
			"content": "`owner`"
		},
		{
			"heading": "common-role-shapes",
			"content": "Tenant ownership, from the tenant record's `ownerId`"
		},
		{
			"heading": "common-role-shapes",
			"content": "Tenant-scoped policies and gates"
		},
		{
			"heading": "common-role-shapes",
			"content": "The `permission` field complements the role with explicit grants — a user can hold a role bundle of expected abilities plus named extras. Policies interpret both together."
		},
		{
			"heading": "assigning-and-defaulting-roles",
			"content": "Roles are assigned like any data: written at creation, updated over the user's life, seeded for tests and staging."
		},
		{
			"heading": "assigning-and-defaulting-roles",
			"content": "**Default roles** — the `default('user')` on the field means every sign-up lands in the safe bucket until explicitly elevated; no code path can forget to set a role."
		},
		{
			"heading": "assigning-and-defaulting-roles",
			"content": "**Manual assignment** — an admin action updates the `role` field on the specific record."
		},
		{
			"heading": "assigning-and-defaulting-roles",
			"content": "**Assignment by seed** — seeders assign roles during development and test setup so fixtures have the right expectations baked in."
		},
		{
			"heading": "assigning-and-defaulting-roles",
			"content": "Upgrading a user to admin is a single field update, and it is immediately visible to every policy in the next request — no cache to flush, no redeploy. Because policies read the field at decision time, the change takes effect with zero propagation steps."
		},
		{
			"heading": "seeding-strategies",
			"content": "Seeding roles follows the same conventions as seeding any data. Because role data is just enum values on user records, factories and seeders compose naturally:"
		},
		{
			"heading": "seeding-strategies",
			"content": "A common strategy is to seed a small fixed set — one admin, a couple of editors, a handful of standard users — so that every environment has known identities with known capabilities, and policies can be exercised realistically from the first run. Test setups that need isolation rely on the same factories, so role-bearing fixtures are consistent between local development and CI."
		},
		{
			"heading": "the-role-permission-field-and-policies",
			"content": "The division of labor is strict:"
		},
		{
			"heading": "the-role-permission-field-and-policies",
			"content": "Where"
		},
		{
			"heading": "the-role-permission-field-and-policies",
			"content": "What lives there"
		},
		{
			"heading": "the-role-permission-field-and-policies",
			"content": "User record"
		},
		{
			"heading": "the-role-permission-field-and-policies",
			"content": "`role` and `permission` data"
		},
		{
			"heading": "the-role-permission-field-and-policies",
			"content": "Policy files"
		},
		{
			"heading": "the-role-permission-field-and-policies",
			"content": "The interpretation of that data into abilities"
		},
		{
			"heading": "the-role-permission-field-and-policies",
			"content": "Application code"
		},
		{
			"heading": "the-role-permission-field-and-policies",
			"content": "Only ability checks — `ctx.can`, `authorize`, `useCan`"
		},
		{
			"heading": "the-role-permission-field-and-policies",
			"content": "Policies read role values and translate them into decisions:"
		},
		{
			"heading": "the-role-permission-field-and-policies",
			"content": "The `admin` short-circuit and the `editor` publish case are where roles mean anything. Move the role out of the policy and the same admin is suddenly locked out of every surface at once — consistently, because it is the same policy everywhere."
		},
		{
			"heading": "permission-grants-beyond-roles",
			"content": "Roles bundle expected behavior, but they are not exhaustive. The `permission` field exists for explicit, per-user grants that do not fit a role bundle. Both feed the same resolution: a user's effective ability is the policy's answer given their role data and explicit grants. Assigning or revoking a permission is a field update, exactly like a role change."
		},
		{
			"heading": "why-application-code-never-checks-roles",
			"content": "Direct role checks in handlers are a drift hazard: one route checks `user.role === 'admin'`, another checks `user.role !== 'user'`, and before long \"admin\" means different things in different places. Kwiva enforces the discipline with a lint gate — `no-role-checks` (v1.x) — flagging role comparisons outside policies. The rule is the reason `ctx.can('posts.publish')` reads as a product question while `user.role === 'editor'` reads as a data detail."
		},
		{
			"heading": "why-application-code-never-checks-roles",
			"content": "The payback appears when product rules change. If \"editor can publish\" becomes \"editor can publish only within their workspace\", the change lives in one policy file and propagates to every surface — a route, a Studio screen, an MCP tool — on the next decision. A role comparison scattered across handlers would require hunting down every occurrence."
		},
		{
			"heading": "organizations-as-roles-v1x",
			"content": "In v1.x, the org membership model maps onto RBAC directly: each organization membership has roles, and those membership roles are policy roles. Combined with tenancy in `org` mode, a user's role becomes tenant-scoped — admin in one tenant, standard user in another — and policies interpret the membership role for the active tenant. Same policy engine, one more axis."
		},
		{
			"heading": "organizations-as-roles-v1x",
			"content": "The model is the same as plain RBAC: membership rows carry the role data, and policies read it. The only difference is which membership is consulted — the one for the active tenant — so the same user genuinely holds different authority in different workspaces without any field juggling."
		},
		{
			"heading": "role-visibility-v1x",
			"content": "Role matrices inside Studio are generated from the policies themselves, showing which roles hold which abilities. Because the matrix derives from policy source rather than a duplicated table, it can never drift from actual enforcement — what the matrix says an editor can publish is exactly what the policy enforces."
		},
		{
			"heading": "role-visibility-v1x",
			"content": "This is the payoff of \"roles are data, policies interpret them\" made visible: the admin UI for role management is a projection of the policy source, not a second system that can disagree with it."
		},
		{
			"heading": "whats-next",
			"content": "Policies — the only place roles should be read"
		},
		{
			"heading": "whats-next",
			"content": "Permissions — the ability strings roles translate into"
		},
		{
			"heading": "whats-next",
			"content": "Enforcement Points — how role-derived decisions run on every surface"
		},
		{
			"heading": "whats-next",
			"content": "Models — declaring the `role` and `permission` fields"
		},
		{
			"heading": "whats-next",
			"content": "Seeders — seeding known identities and roles"
		}
	],
	"headings": [
		{
			"id": "roles-as-data",
			"content": "Roles as Data"
		},
		{
			"id": "common-role-shapes",
			"content": "Common role shapes"
		},
		{
			"id": "assigning-and-defaulting-roles",
			"content": "Assigning and Defaulting Roles"
		},
		{
			"id": "seeding-strategies",
			"content": "Seeding Strategies"
		},
		{
			"id": "the-role-permission-field-and-policies",
			"content": "The role, Permission Field, and Policies"
		},
		{
			"id": "permission-grants-beyond-roles",
			"content": "Permission grants beyond roles"
		},
		{
			"id": "why-application-code-never-checks-roles",
			"content": "Why Application Code Never Checks Roles"
		},
		{
			"id": "organizations-as-roles-v1x",
			"content": "Organizations as Roles (v1.x)"
		},
		{
			"id": "role-visibility-v1x",
			"content": "Role Visibility (v1.x)"
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
		url: "#roles-as-data",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Roles as Data" })
	},
	{
		depth: 3,
		url: "#common-role-shapes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Common role shapes" })
	},
	{
		depth: 2,
		url: "#assigning-and-defaulting-roles",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Assigning and Defaulting Roles" })
	},
	{
		depth: 2,
		url: "#seeding-strategies",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Seeding Strategies" })
	},
	{
		depth: 2,
		url: "#the-role-permission-field-and-policies",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The role, Permission Field, and Policies" })
	},
	{
		depth: 3,
		url: "#permission-grants-beyond-roles",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Permission grants beyond roles" })
	},
	{
		depth: 2,
		url: "#why-application-code-never-checks-roles",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Why Application Code Never Checks Roles" })
	},
	{
		depth: 2,
		url: "#organizations-as-roles-v1x",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Organizations as Roles (v1.x)" })
	},
	{
		depth: 2,
		url: "#role-visibility-v1x",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Role Visibility (v1.x)" })
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
		h3: "h3",
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
			"Role-based access control in Kwiva rests on a simple rule: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "roles are data, policies interpret them" }),
			". The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" fields on the user record carry identity, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			" files decide what any role may do, and application code never checks roles directly — it checks abilities, letting one policy change propagate everywhere."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Roles are deliberately unmagical. They are enum values on a model column, stored like any other data, queried like any other data, and interpreted in exactly one place: policies. Everything else in the framework — routes, Studio screens, client hooks, MCP tools — asks \"can this user do X?\" and never \"is this user role Y?\". That indirection is the entire point of the design: role meaning lives in one file, not scattered through handlers." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "roles-as-data",
			children: "Roles as Data"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A role is a value on the user record, nothing more magical:" }),
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
			title: "roles-as-data.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "defineModel"
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
							children: "'users'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "f"
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
							children: " ({"
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
							children: "  id: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "id"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),"
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
							children: "  email: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "string"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "unique"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),"
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
							children: "  name: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "string"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),"
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
							children: "  role: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "enum"
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
							children: "'user'"
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
							children: "'admin'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "default"
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
							children: "'user'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "indexed"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),"
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
						children: "  // engine-managed columns (added automatically at migration time):"
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
						children: "  // password_hash, session references, oauth accounts, passkey credentials"
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
							children: "}), { timestamps: "
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
							children: ", permission: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'users'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
			" field is a typed enum with a default, and the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" field holds explicit grants. Together they answer \"what is this person\" (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
			") and \"what extra can they do\" (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			"). Because both live on the model, they come with queryability, uniqueness, and indexing for free — filtering by role or building an admin list is a normal query."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nThe exact role names are yours. The common scaffolded set is ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "admin" }),
				"; teams with editorial needs add ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "editor" }),
				"; tenancy adds ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "owner" }),
				" semantics through the tenant record's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ownerId" }),
				". What stays constant is the mechanism — roles are enum data, and policies give them meaning."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "common-role-shapes",
			children: "Common role shapes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Role" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Typical meaning" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Where it shows up" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Default sign-up bucket, minimal abilities" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Default on the ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
					" field"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "admin" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Broad authority, short-circuits policies" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "if (user.role === 'admin') return true" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "editor" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Content capability beyond the standard verbs" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "case 'publish'" }), " in content policies"] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "owner" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Tenant ownership, from the tenant record's ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ownerId" })] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tenant-scoped policies and gates" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" field complements the role with explicit grants — a user can hold a role bundle of expected abilities plus named extras. Policies interpret both together."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "assigning-and-defaulting-roles",
			children: "Assigning and Defaulting Roles"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Roles are assigned like any data: written at creation, updated over the user's life, seeded for tests and staging." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Default roles" }),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "default('user')" }),
				" on the field means every sign-up lands in the safe bucket until explicitly elevated; no code path can forget to set a role."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Manual assignment" }),
				" — an admin action updates the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
				" field on the specific record."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Assignment by seed" }), " — seeders assign roles during development and test setup so fixtures have the right expectations baked in."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Upgrading a user to admin is a single field update, and it is immediately visible to every policy in the next request — no cache to flush, no redeploy. Because policies read the field at decision time, the change takes effect with zero propagation steps." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "seeding-strategies",
			children: "Seeding Strategies"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Seeding roles follows the same conventions as seeding any data. Because role data is just enum values on user records, factories and seeders compose naturally:" }),
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
			title: "seeding-strategies.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/database/seeders/"
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
							children: "Admin."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "factory"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "create"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ role: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'admin'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", email: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'admin@example.com'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })"
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
							children: "Standard."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "factory"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "count"
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
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "create"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ role: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'user'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A common strategy is to seed a small fixed set — one admin, a couple of editors, a handful of standard users — so that every environment has known identities with known capabilities, and policies can be exercised realistically from the first run. Test setups that need isolation rely on the same factories, so role-bearing fixtures are consistent between local development and CI." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-role-permission-field-and-policies",
			children: "The role, Permission Field, and Policies"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The division of labor is strict:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Where" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What lives there" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "User record" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" data"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Policy files" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The interpretation of that data into abilities" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Application code" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Only ability checks — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.can" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "authorize" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useCan" })
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Policies read role values and translate them into decisions:" }),
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
			title: "the-role-permission-field-and-policies.ts",
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
							children: " definePolicy"
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
							children: "'posts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "user"
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
							children: "ability"
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
							children: "resource"
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
							children: "  if"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " (user.role "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "==="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " 'admin'"
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
							children: "return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " true"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "  switch"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " (ability) {"
					})]
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
							children: "    case"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " 'publish'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " user.role "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "==="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " 'editor'"
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
							children: "    default"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " false"
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
						children: "  }"
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
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "admin" }),
			" short-circuit and the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "editor" }),
			" publish case are where roles mean anything. Move the role out of the policy and the same admin is suddenly locked out of every surface at once — consistently, because it is the same policy everywhere."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "permission-grants-beyond-roles",
			children: "Permission grants beyond roles"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Roles bundle expected behavior, but they are not exhaustive. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" field exists for explicit, per-user grants that do not fit a role bundle. Both feed the same resolution: a user's effective ability is the policy's answer given their role data and explicit grants. Assigning or revoking a permission is a field update, exactly like a role change."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "why-application-code-never-checks-roles",
			children: "Why Application Code Never Checks Roles"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Direct role checks in handlers are a drift hazard: one route checks ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user.role === 'admin'" }),
			", another checks ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user.role !== 'user'" }),
			", and before long \"admin\" means different things in different places. Kwiva enforces the discipline with a lint gate — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-role-checks" }),
			" (v1.x) — flagging role comparisons outside policies. The rule is the reason ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.can('posts.publish')" }),
			" reads as a product question while ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user.role === 'editor'" }),
			" reads as a data detail."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The payback appears when product rules change. If \"editor can publish\" becomes \"editor can publish only within their workspace\", the change lives in one policy file and propagates to every surface — a route, a Studio screen, an MCP tool — on the next decision. A role comparison scattered across handlers would require hunting down every occurrence." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "organizations-as-roles-v1x",
			children: "Organizations as Roles (v1.x)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"In v1.x, the org membership model maps onto RBAC directly: each organization membership has roles, and those membership roles are policy roles. Combined with tenancy in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "org" }),
			" mode, a user's role becomes tenant-scoped — admin in one tenant, standard user in another — and policies interpret the membership role for the active tenant. Same policy engine, one more axis."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The model is the same as plain RBAC: membership rows carry the role data, and policies read it. The only difference is which membership is consulted — the one for the active tenant — so the same user genuinely holds different authority in different workspaces without any field juggling." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "role-visibility-v1x",
			children: "Role Visibility (v1.x)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Role matrices inside Studio are generated from the policies themselves, showing which roles hold which abilities. Because the matrix derives from policy source rather than a duplicated table, it can never drift from actual enforcement — what the matrix says an editor can publish is exactly what the policy enforces." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This is the payoff of \"roles are data, policies interpret them\" made visible: the admin UI for role management is a projection of the policy source, not a second system that can disagree with it." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/policies",
				children: "Policies"
			}), " — the only place roles should be read"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/permissions",
				children: "Permissions"
			}), " — the ability strings roles translate into"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/enforcement",
				children: "Enforcement Points"
			}), " — how role-derived decisions run on every surface"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Models"
				}),
				" — declaring the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" fields"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/seeders",
				children: "Seeders"
			}), " — seeding known identities and roles"] }),
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
