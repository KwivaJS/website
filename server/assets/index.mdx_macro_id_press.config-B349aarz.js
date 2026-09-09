import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/authorization/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Authorization",
	"description": "definePolicy, permission strings, roles, and the enforcement points that gate every route, Studio screen, channel, and MCP tool."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nAuthorization answers the question authentication does not: given who the user is, what are they allowed to do? Kwiva answers it with a single, uniform model — policies defined once, checked everywhere. A `definePolicy` file in `src/app/policies/` describes what any user can do with a resource, and every access surface in the framework honors it: generated model routes, hand-written controllers, Studio screens, realtime channels, MCP tools, jobs, and seeders.\n\nAuthentication and authorization are deliberately separate layers. Authentication resolves identity — `ctx.session.user` — and authorization decides what that identity may do. Kwiva composes them in a fixed order: identity first, capability second, scope third. A policy never decides who you are, and a session alone never grants access.\n\n## Overview [#overview]\n\nAuthorization builds on three primitives:\n\n* **Policies** — `definePolicy('posts', (user, ability, resource) => ...)` — pure logic that decides an ability for a resource.\n* **Permissions** — the `{resource}.{action}` strings checked against policies, like `posts.publish` or `users.create`.\n* **Roles** — data stored on the user (`role`, `permission`) that policies interpret when making decisions.\n\nThe shape of access control is therefore always the same: an ability is requested, a policy decides, and every layer of the framework resolves the answer the same way. A request, a Studio click, and an agent tool call all ask the identical question and receive the identical answer because they all resolve through the same policy source.\n\n### Writing versus checking [#writing-versus-checking]\n\nAuthorization involves two separate acts: **writing** the decision and **checking** it. Writing happens once, in `definePolicy`. Checking happens everywhere — and the framework makes most of it automatic. Models and routes declare permissions declaratively, so the common cases (CRUD verbs, custom actions) never need a hand-written check. The helpers `ctx.can`, `authorize`, and `useCan` exist for the rest: branch, enforce, and render. The distinction matters because it decides *where* a policy change is felt — change the writer, and every checker follows.\n\n## Mental Model: Ability, Permission, Role [#mental-model-ability-permission-role]\n\nThese three words are easy to conflate, so the distinction matters:\n\n| Concept    | What it is                                                     | Example                      |\n| ---------- | -------------------------------------------------------------- | ---------------------------- |\n| Ability    | The action being attempted, addressed as `{resource}.{action}` | `posts.publish`              |\n| Permission | A granted right, stored on a user or derived from role         | `permission: 'posts.create'` |\n| Role       | A named bundle of expected behavior, stored as data            | `role: 'editor'`             |\n\nThe chain is always one-directional: roles inform users, policies interpret users to grant or deny abilities, and abilities are what routes and screens actually check. Application code never checks roles directly — it checks abilities, and policies are the only place role data is read.\n\nThe same policy file therefore serves every consumer. Because it is pure logic — a plain function from `(user, ability, resource)` to a boolean — it has no HTTP concerns and no UI concerns, which is exactly what makes it safe to run inside a route, a Studio screen render, or a background job with identical semantics.\n\n## Where Access Is Enforced [#where-access-is-enforced]\n\nEnforcement is not a single chokepoint but a consistent layer across every surface that touches data:\n\n| Surface                | Enforcement                                            |\n| ---------------------- | ------------------------------------------------------ |\n| Generated model routes | `{permission}.{action}` checked in the route lifecycle |\n| Controller routes      | `permission` option wired to the matching policy       |\n| Studio screens         | Actions hidden or disabled without the ability         |\n| Realtime channels      | Subscribe is policy-checked                            |\n| MCP tools              | Per-tool ability checks                                |\n| Seeders and tasks      | Explicit `authorize()` calls                           |\n\nBecause policies are pure logic with no HTTP concerns, the same `definePolicy` file gates a request, a screen action, and an agent tool with identical results. There is one definition of \"can this user publish this post\" — not a route copy, a UI copy, and an agent copy that slowly diverge. See [Enforcement Points](/docs/authorization/enforcement) for the full map.\n\n### The manifest connects it all [#the-manifest-connects-it-all]\n\nPolicies and permissions reach every surface through the route manifest — the intermediate representation that every generated route, controller route, Studio screen, MCP tool, and OpenAPI spec is compiled from. When a controller registers a custom action with `permission: 'posts.publish'`, the manifest records the ability once, and every consumer of the manifest reads the same string. That single registration is why a permission can be referenced from client types the moment it is declared, and why authorization never needs a second, hand-maintained wiring document.\n\n## Setting Up [#setting-up]\n\n```ts title=\"src/app/policies/posts.ts\"\n// src/app/policies/posts.ts\nimport { definePolicy } from '@kwiva/core'\n\nexport default definePolicy('posts', (user, ability, resource) => {\n  if (user.role === 'admin') return true\n  switch (ability) {\n    case 'read':      return true\n    case 'create':    return user.id != null\n    case 'update':\n    case 'delete':    return resource ? resource.authorId === user.id : false\n    case 'publish':   return user.role === 'editor'\n    default:          return false\n  }\n})\n```\n\nOne file per resource namespace, and the policy takes effect everywhere the resource appears. Generated routes read the model's `permission` option, controllers declare the same namespace, and Studio hides the buttons this policy would reject.\n\n### Wiring the namespace [#wiring-the-namespace]\n\nThe policy takes effect through two attachments:\n\n1. **On the model** — `defineModel('posts', ..., { permission: 'posts' })` gates every generated route by namespace.\n2. **On controllers** — the `permission` route option names the exact ability, including custom actions like `publish`.\n\nWire the same namespace in both places and the two halves of the API surface — generated and authored — resolve through one policy.\n\n## Defense in Depth [#defense-in-depth]\n\nAuthorization is layered, and the layers run in a deliberate order:\n\n1. **Authentication** — the session middleware resolves who is making the request.\n2. **Policy checks** — in the route lifecycle, before the handler.\n3. **Handler logic** — explicit `ctx.can` / `authorize` for decisions the generic checks do not cover.\n4. **Data-level scoping** — tenant field auto-scoping constrains even permitted requests to their own tenant's rows.\n\nEach layer assumes the ones before it ran, and every layer reads from the same policy source. See the [Enforcement](/docs/authorization/enforcement) page for the ordering in depth and the [Tenancy scoping](/docs/tenancy/scoping) page for the data boundary that runs after authorization.\n\n> \\[!NOTE]\n> The layered model is what makes authorization safe to reason about incrementally. A route you add later is protected the moment it declares a `permission`, regardless of what authorization has already been added elsewhere — the layers compose by construction, not by remembering to wire them.\n\n## Related Reading [#related-reading]\n\n* [Policies](/docs/authorization/policies) — writing `definePolicy` and `defineGate`\n* [Permissions](/docs/authorization/permissions) — the `{resource}.{action}` grammar and check helpers\n* [RBAC](/docs/authorization/roles) — storing roles on users and interpreting them in policies\n* [Enforcement Points](/docs/authorization/enforcement) — the full list of surfaces that check policies\n\n## What's Next [#whats-next]\n\n* [Policies](/docs/authorization/policies) — the factory function and its signature\n* [Permissions](/docs/authorization/permissions) — `ctx.can`, `useCan`, and route gating\n* [Enforcement Points](/docs/authorization/enforcement) — defense-in-depth through every surface\n* [Authentication](/docs/auth) — where identity feeding these checks comes from\n* [Models](/docs/data/models) — the `permission` option that ties models to policies\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Authorization answers the question authentication does not: given who the user is, what are they allowed to do? Kwiva answers it with a single, uniform model — policies defined once, checked everywhere. A `definePolicy` file in `src/app/policies/` describes what any user can do with a resource, and every access surface in the framework honors it: generated model routes, hand-written controllers, Studio screens, realtime channels, MCP tools, jobs, and seeders."
		},
		{
			"heading": void 0,
			"content": "Authentication and authorization are deliberately separate layers. Authentication resolves identity — `ctx.session.user` — and authorization decides what that identity may do. Kwiva composes them in a fixed order: identity first, capability second, scope third. A policy never decides who you are, and a session alone never grants access."
		},
		{
			"heading": "overview",
			"content": "Authorization builds on three primitives:"
		},
		{
			"heading": "overview",
			"content": "**Policies** — `definePolicy('posts', (user, ability, resource) => ...)` — pure logic that decides an ability for a resource."
		},
		{
			"heading": "overview",
			"content": "**Permissions** — the `{resource}.{action}` strings checked against policies, like `posts.publish` or `users.create`."
		},
		{
			"heading": "overview",
			"content": "**Roles** — data stored on the user (`role`, `permission`) that policies interpret when making decisions."
		},
		{
			"heading": "overview",
			"content": "The shape of access control is therefore always the same: an ability is requested, a policy decides, and every layer of the framework resolves the answer the same way. A request, a Studio click, and an agent tool call all ask the identical question and receive the identical answer because they all resolve through the same policy source."
		},
		{
			"heading": "writing-versus-checking",
			"content": "Authorization involves two separate acts: **writing** the decision and **checking** it. Writing happens once, in `definePolicy`. Checking happens everywhere — and the framework makes most of it automatic. Models and routes declare permissions declaratively, so the common cases (CRUD verbs, custom actions) never need a hand-written check. The helpers `ctx.can`, `authorize`, and `useCan` exist for the rest: branch, enforce, and render. The distinction matters because it decides *where* a policy change is felt — change the writer, and every checker follows."
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "These three words are easy to conflate, so the distinction matters:"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "Concept"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "What it is"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "Example"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "Ability"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "The action being attempted, addressed as `{resource}.{action}`"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "`posts.publish`"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "Permission"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "A granted right, stored on a user or derived from role"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "`permission: 'posts.create'`"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "Role"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "A named bundle of expected behavior, stored as data"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "`role: 'editor'`"
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "The chain is always one-directional: roles inform users, policies interpret users to grant or deny abilities, and abilities are what routes and screens actually check. Application code never checks roles directly — it checks abilities, and policies are the only place role data is read."
		},
		{
			"heading": "mental-model-ability-permission-role",
			"content": "The same policy file therefore serves every consumer. Because it is pure logic — a plain function from `(user, ability, resource)` to a boolean — it has no HTTP concerns and no UI concerns, which is exactly what makes it safe to run inside a route, a Studio screen render, or a background job with identical semantics."
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Enforcement is not a single chokepoint but a consistent layer across every surface that touches data:"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Surface"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Enforcement"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Generated model routes"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "`{permission}.{action}` checked in the route lifecycle"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Controller routes"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "`permission` option wired to the matching policy"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Studio screens"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Actions hidden or disabled without the ability"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Realtime channels"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Subscribe is policy-checked"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "MCP tools"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Per-tool ability checks"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Seeders and tasks"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Explicit `authorize()` calls"
		},
		{
			"heading": "where-access-is-enforced",
			"content": "Because policies are pure logic with no HTTP concerns, the same `definePolicy` file gates a request, a screen action, and an agent tool with identical results. There is one definition of \"can this user publish this post\" — not a route copy, a UI copy, and an agent copy that slowly diverge. See Enforcement Points for the full map."
		},
		{
			"heading": "the-manifest-connects-it-all",
			"content": "Policies and permissions reach every surface through the route manifest — the intermediate representation that every generated route, controller route, Studio screen, MCP tool, and OpenAPI spec is compiled from. When a controller registers a custom action with `permission: 'posts.publish'`, the manifest records the ability once, and every consumer of the manifest reads the same string. That single registration is why a permission can be referenced from client types the moment it is declared, and why authorization never needs a second, hand-maintained wiring document."
		},
		{
			"heading": "setting-up",
			"content": "One file per resource namespace, and the policy takes effect everywhere the resource appears. Generated routes read the model's `permission` option, controllers declare the same namespace, and Studio hides the buttons this policy would reject."
		},
		{
			"heading": "wiring-the-namespace",
			"content": "The policy takes effect through two attachments:"
		},
		{
			"heading": "wiring-the-namespace",
			"content": "**On the model** — `defineModel('posts', ..., { permission: 'posts' })` gates every generated route by namespace."
		},
		{
			"heading": "wiring-the-namespace",
			"content": "**On controllers** — the `permission` route option names the exact ability, including custom actions like `publish`."
		},
		{
			"heading": "wiring-the-namespace",
			"content": "Wire the same namespace in both places and the two halves of the API surface — generated and authored — resolve through one policy."
		},
		{
			"heading": "defense-in-depth",
			"content": "Authorization is layered, and the layers run in a deliberate order:"
		},
		{
			"heading": "defense-in-depth",
			"content": "**Authentication** — the session middleware resolves who is making the request."
		},
		{
			"heading": "defense-in-depth",
			"content": "**Policy checks** — in the route lifecycle, before the handler."
		},
		{
			"heading": "defense-in-depth",
			"content": "**Handler logic** — explicit `ctx.can` / `authorize` for decisions the generic checks do not cover."
		},
		{
			"heading": "defense-in-depth",
			"content": "**Data-level scoping** — tenant field auto-scoping constrains even permitted requests to their own tenant's rows."
		},
		{
			"heading": "defense-in-depth",
			"content": "Each layer assumes the ones before it ran, and every layer reads from the same policy source. See the Enforcement page for the ordering in depth and the Tenancy scoping page for the data boundary that runs after authorization."
		},
		{
			"heading": "defense-in-depth",
			"content": "> \\[!NOTE]\n> The layered model is what makes authorization safe to reason about incrementally. A route you add later is protected the moment it declares a `permission`, regardless of what authorization has already been added elsewhere — the layers compose by construction, not by remembering to wire them."
		},
		{
			"heading": "related-reading",
			"content": "Policies — writing `definePolicy` and `defineGate`"
		},
		{
			"heading": "related-reading",
			"content": "Permissions — the `{resource}.{action}` grammar and check helpers"
		},
		{
			"heading": "related-reading",
			"content": "RBAC — storing roles on users and interpreting them in policies"
		},
		{
			"heading": "related-reading",
			"content": "Enforcement Points — the full list of surfaces that check policies"
		},
		{
			"heading": "whats-next",
			"content": "Policies — the factory function and its signature"
		},
		{
			"heading": "whats-next",
			"content": "Permissions — `ctx.can`, `useCan`, and route gating"
		},
		{
			"heading": "whats-next",
			"content": "Enforcement Points — defense-in-depth through every surface"
		},
		{
			"heading": "whats-next",
			"content": "Authentication — where identity feeding these checks comes from"
		},
		{
			"heading": "whats-next",
			"content": "Models — the `permission` option that ties models to policies"
		}
	],
	"headings": [
		{
			"id": "overview",
			"content": "Overview"
		},
		{
			"id": "writing-versus-checking",
			"content": "Writing versus checking"
		},
		{
			"id": "mental-model-ability-permission-role",
			"content": "Mental Model: Ability, Permission, Role"
		},
		{
			"id": "where-access-is-enforced",
			"content": "Where Access Is Enforced"
		},
		{
			"id": "the-manifest-connects-it-all",
			"content": "The manifest connects it all"
		},
		{
			"id": "setting-up",
			"content": "Setting Up"
		},
		{
			"id": "wiring-the-namespace",
			"content": "Wiring the namespace"
		},
		{
			"id": "defense-in-depth",
			"content": "Defense in Depth"
		},
		{
			"id": "related-reading",
			"content": "Related Reading"
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
		url: "#overview",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Overview" })
	},
	{
		depth: 3,
		url: "#writing-versus-checking",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Writing versus checking" })
	},
	{
		depth: 2,
		url: "#mental-model-ability-permission-role",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Mental Model: Ability, Permission, Role" })
	},
	{
		depth: 2,
		url: "#where-access-is-enforced",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where Access Is Enforced" })
	},
	{
		depth: 3,
		url: "#the-manifest-connects-it-all",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The manifest connects it all" })
	},
	{
		depth: 2,
		url: "#setting-up",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Setting Up" })
	},
	{
		depth: 3,
		url: "#wiring-the-namespace",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Wiring the namespace" })
	},
	{
		depth: 2,
		url: "#defense-in-depth",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Defense in Depth" })
	},
	{
		depth: 2,
		url: "#related-reading",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Related Reading" })
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Authorization answers the question authentication does not: given who the user is, what are they allowed to do? Kwiva answers it with a single, uniform model — policies defined once, checked everywhere. A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			" file in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/policies/" }),
			" describes what any user can do with a resource, and every access surface in the framework honors it: generated model routes, hand-written controllers, Studio screens, realtime channels, MCP tools, jobs, and seeders."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Authentication and authorization are deliberately separate layers. Authentication resolves identity — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session.user" }),
			" — and authorization decides what that identity may do. Kwiva composes them in a fixed order: identity first, capability second, scope third. A policy never decides who you are, and a session alone never grants access."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "overview",
			children: "Overview"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Authorization builds on three primitives:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Policies" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy('posts', (user, ability, resource) => ...)" }),
				" — pure logic that decides an ability for a resource."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Permissions" }),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{resource}.{action}" }),
				" strings checked against policies, like ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" }),
				" or ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "users.create" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Roles" }),
				" — data stored on the user (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				") that policies interpret when making decisions."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The shape of access control is therefore always the same: an ability is requested, a policy decides, and every layer of the framework resolves the answer the same way. A request, a Studio click, and an agent tool call all ask the identical question and receive the identical answer because they all resolve through the same policy source." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "writing-versus-checking",
			children: "Writing versus checking"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Authorization involves two separate acts: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "writing" }),
			" the decision and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "checking" }),
			" it. Writing happens once, in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			". Checking happens everywhere — and the framework makes most of it automatic. Models and routes declare permissions declaratively, so the common cases (CRUD verbs, custom actions) never need a hand-written check. The helpers ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.can" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "authorize" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useCan" }),
			" exist for the rest: branch, enforce, and render. The distinction matters because it decides ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "where" }),
			" a policy change is felt — change the writer, and every checker follows."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "mental-model-ability-permission-role",
			children: "Mental Model: Ability, Permission, Role"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "These three words are easy to conflate, so the distinction matters:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Concept" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it is" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Ability" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["The action being attempted, addressed as ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{resource}.{action}" })] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Permission" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A granted right, stored on a user or derived from role" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission: 'posts.create'" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Role" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A named bundle of expected behavior, stored as data" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role: 'editor'" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The chain is always one-directional: roles inform users, policies interpret users to grant or deny abilities, and abilities are what routes and screens actually check. Application code never checks roles directly — it checks abilities, and policies are the only place role data is read." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same policy file therefore serves every consumer. Because it is pure logic — a plain function from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "(user, ability, resource)" }),
			" to a boolean — it has no HTTP concerns and no UI concerns, which is exactly what makes it safe to run inside a route, a Studio screen render, or a background job with identical semantics."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-access-is-enforced",
			children: "Where Access Is Enforced"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Enforcement is not a single chokepoint but a consistent layer across every surface that touches data:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Enforcement" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generated model routes" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{permission}.{action}" }), " checked in the route lifecycle"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controller routes" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }), " option wired to the matching policy"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Studio screens" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Actions hidden or disabled without the ability" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Realtime channels" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Subscribe is policy-checked" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP tools" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Per-tool ability checks" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Seeders and tasks" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Explicit ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "authorize()" }),
				" calls"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because policies are pure logic with no HTTP concerns, the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			" file gates a request, a screen action, and an agent tool with identical results. There is one definition of \"can this user publish this post\" — not a route copy, a UI copy, and an agent copy that slowly diverge. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/enforcement",
				children: "Enforcement Points"
			}),
			" for the full map."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "the-manifest-connects-it-all",
			children: "The manifest connects it all"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Policies and permissions reach every surface through the route manifest — the intermediate representation that every generated route, controller route, Studio screen, MCP tool, and OpenAPI spec is compiled from. When a controller registers a custom action with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission: 'posts.publish'" }),
			", the manifest records the ability once, and every consumer of the manifest reads the same string. That single registration is why a permission can be referenced from client types the moment it is declared, and why authorization never needs a second, hand-maintained wiring document."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "setting-up",
			children: "Setting Up"
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
			title: "src/app/policies/posts.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/policies/posts.ts"
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
							children: " { definePolicy } "
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
							children: " 'read'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":      "
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
							children: " 'create'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":    "
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
							children: " user.id "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "!="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " null"
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
							children: "    case"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " 'update'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":"
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
							children: "    case"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " 'delete'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":    "
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
							children: " resource "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "?"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " resource.authorId "
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " user.id "
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
							children: " false"
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
			"One file per resource namespace, and the policy takes effect everywhere the resource appears. Generated routes read the model's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" option, controllers declare the same namespace, and Studio hides the buttons this policy would reject."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "wiring-the-namespace",
			children: "Wiring the namespace"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The policy takes effect through two attachments:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "On the model" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel('posts', ..., { permission: 'posts' })" }),
				" gates every generated route by namespace."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "On controllers" }),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" route option names the exact ability, including custom actions like ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "publish" }),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Wire the same namespace in both places and the two halves of the API surface — generated and authored — resolve through one policy." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "defense-in-depth",
			children: "Defense in Depth"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Authorization is layered, and the layers run in a deliberate order:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Authentication" }), " — the session middleware resolves who is making the request."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Policy checks" }), " — in the route lifecycle, before the handler."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Handler logic" }),
				" — explicit ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.can" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "authorize" }),
				" for decisions the generic checks do not cover."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Data-level scoping" }), " — tenant field auto-scoping constrains even permitted requests to their own tenant's rows."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each layer assumes the ones before it ran, and every layer reads from the same policy source. See the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/enforcement",
				children: "Enforcement"
			}),
			" page for the ordering in depth and the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/scoping",
				children: "Tenancy scoping"
			}),
			" page for the data boundary that runs after authorization."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nThe layered model is what makes authorization safe to reason about incrementally. A route you add later is protected the moment it declares a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				", regardless of what authorization has already been added elsewhere — the layers compose by construction, not by remembering to wire them."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "related-reading",
			children: "Related Reading"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/authorization/policies",
					children: "Policies"
				}),
				" — writing ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineGate" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/authorization/permissions",
					children: "Permissions"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{resource}.{action}" }),
				" grammar and check helpers"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/roles",
				children: "RBAC"
			}), " — storing roles on users and interpreting them in policies"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/enforcement",
				children: "Enforcement Points"
			}), " — the full list of surfaces that check policies"] }),
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
				href: "/docs/authorization/policies",
				children: "Policies"
			}), " — the factory function and its signature"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/authorization/permissions",
					children: "Permissions"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.can" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useCan" }),
				", and route gating"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/enforcement",
				children: "Enforcement Points"
			}), " — defense-in-depth through every surface"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth",
				children: "Authentication"
			}), " — where identity feeding these checks comes from"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Models"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" option that ties models to policies"
			] }),
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
