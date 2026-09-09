import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/authorization/policies.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Policies",
	"description": "definePolicy and defineGate — writing per-resource ability logic once, and running it on every surface that touches the resource."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nA policy is a pure decision: given a user, an ability, and the resource being acted on, should this be allowed? In Kwiva, policies are written once as `definePolicy` files and executed everywhere — API routes, Studio screens, background jobs, realtime channels, and MCP tools — so the answer to \"can this user publish this post?\" never depends on which door they walked through.\n\n## The Factory [#the-factory]\n\nPolicies live in `src/app/policies/`, one file per resource namespace, named `singular.ts` like the models they protect:\n\n```plaintext title=\"the-factory.txt\"\nsrc/app/policies/posts.ts      →  definePolicy('posts', ...)\nsrc/app/policies/users.ts      →  definePolicy('users', ...)\nsrc/app/policies/tenants.ts    →  definePolicy('tenants', ...)\n```\n\n```ts title=\"src/app/policies/posts.ts\"\n// src/app/policies/posts.ts\nimport { definePolicy } from '@kwiva/core'\n\nexport default definePolicy('posts', (user, ability, resource) => {\n  if (user.role === 'admin') return true\n  switch (ability) {\n    case 'read':      return true\n    case 'create':    return user.id != null\n    case 'update':\n    case 'delete':    return resource ? resource.authorId === user.id : false\n    case 'publish':   return user.role === 'editor'\n    default:          return false\n  }\n})\n```\n\nThe namespace string is the resource half of every permission: a policy named `posts` decides `posts.read`, `posts.create`, and any custom ability like `posts.publish`. Matching models and controllers to the same namespace is what wires the policy onto every enforcement surface.\n\n## The Signature [#the-signature]\n\nEvery policy is a function with three parameters:\n\n```ts title=\"the-signature.ts\"\n(user, ability, resource?) => boolean | Promise<boolean>\n```\n\n* **user** — the authenticated session user, typed from your model's fields.\n* **ability** — the action being requested, one of the standard `read`, `create`, `update`, `delete` set or a custom ability from a controller action.\n* **resource** — the record being acted on, `undefined` for resource-less checks like pure create or publish decisions.\n\nPolicies may return a plain boolean or a promise, so async decisions — checking a related record, calling a service, reading a flag — are first-class. A reject is the default: the `default: return false` branch is the correct way to close every policy, because anything unlisted should fail closed.\n\n### Evaluating a policy [#evaluating-a-policy]\n\nEvaluation follows the order written:\n\n1. **Admin short-circuit** — trusted roles return before the switch runs.\n2. **Ability switch** — the requested ability is matched against its case.\n3. **Fail closed** — anything unlisted falls to the `default: return false` branch.\n\nThe order is deliberate. Fast, broad rules run first; specific ownership rules run next; unknown abilities never pass by accident. Because the code is ordinary JavaScript, you can reason about it line by line — including which branches return for which inputs.\n\n## Deciding by Ability [#deciding-by-ability]\n\nThe two idioms every policy uses are the **admin short-circuit** and the **ability switch**:\n\n* **Admin short-circuit** — `if (user.role === 'admin') return true` skips the switch for trusted roles. It is fast to read and expresses hierarchy in one line, and because it lives inside the policy, it applies uniformly to every enforcement surface.\n* **Ability switch** — each case handles exactly one ability. Grouping related abilities on the same case — `update` and `delete` both requiring ownership above — keeps policy behavior obvious.\n\nCustom abilities fall through the same switch. When a controller action registers `publish` as a permission, the policy's `publish` case decides it, and the route manifest carries it into OpenAPI, client types, and MCP tool metadata.\n\n## Resource Binding [#resource-binding]\n\nThe `resource` argument is where ownership rules live. The classic pattern — users can update or delete only their own records — binds the decision to the record's fields:\n\n```ts title=\"resource-binding.ts\"\ncase 'update':\ncase 'delete':    return resource ? resource.authorId === user.id : false\n```\n\nWithout a resource there is no ownership to assert, and a false return forces callers to resolve the record first. That is deliberate: resource-less checks are for abilities that do not need one (create, publish), and the policy makes the requirement explicit by how it handles `undefined`.\n\nThe resource check is what turns a coarse RBAC boolean into fine-grained control. `posts.update` with a resource consults the actual post; `posts.create` without one asks a different question. Both are legitimate — they are simply different abilities, decided by the same policy.\n\n## Pure Logic, Everywhere [#pure-logic-everywhere]\n\nPolicies are pure logic — no HTTP concerns. They never read `ctx`, never return responses, never touch the filesystem or the network beyond what the decision requires. That purity is exactly what lets one file gate every surface:\n\n| Surface                | How the policy runs                                    |\n| ---------------------- | ------------------------------------------------------ |\n| Generated model routes | `{permission}.{action}` checked in the route lifecycle |\n| Controller routes      | `permission` option resolves the policy                |\n| Studio screens         | Actions hidden or disabled per ability                 |\n| Realtime channels      | Subscribe policy decides membership                    |\n| MCP tools              | Per-tool ability checks                                |\n| Jobs and seeders       | Explicit `authorize()` calls                           |\n\nA job that fails a policy behaves identically to a route that fails it — same decision, same semantics, no second implementation to drift.\n\n> \\[!TIP]\n> Because policies are pure, they are trivially testable: call the exported function with a fixture user, an ability, and a resource, and assert the boolean. No request setup, no database — the policy's own signature is its test harness.\n\n## Gates: One-Off Abilities [#gates-one-off-abilities]\n\nNot every decision is a full resource policy. `defineGate` creates a single, composable check for repeated one-off rules:\n\n```ts title=\"src/app/policies/gates.ts\"\n// src/app/policies/gates.ts\nimport { defineGate } from '@kwiva/core'\n\nexport const onlyEditors = defineGate((user) => user.role === 'editor')\nexport const tenantOwner = defineGate((user, tenant) => tenant.ownerId === user.id)\n```\n\nGates are used directly on routes and pages via the `gate` key — `gate: onlyEditors` — a small, forgettable capability that does not deserve a namespace of its own. They compose: any number of gates can be attached to a route, and each must pass.\n\n### Gates vs policies [#gates-vs-policies]\n\n|           | `definePolicy`                         | `defineGate`                     |\n| --------- | -------------------------------------- | -------------------------------- |\n| Scope     | One resource namespace, all abilities  | One single-purpose check         |\n| Signature | `(user, ability, resource)`            | `(user, ...args)`                |\n| Used by   | Routes, Studio, channels, MCP, jobs    | Routes and pages via `gate`      |\n| Example   | `posts` deciding every posting ability | `tenantOwner` deciding one thing |\n\nReach for a policy when a resource has multiple abilities to decide; reach for a gate when a single rule repeats across routes and does not belong to a resource namespace.\n\n## Wildcards and Inheritance (v1.x) [#wildcards-and-inheritance-v1x]\n\nTwo conveniences arrive in v1.x:\n\n* **Ability wildcards** — a `posts.*` ability in a policy covers every action in the namespace, for broad grants written once.\n* **Role matrices** — role-to-ability maps are generated from policies, so Studio can render a role matrix screen that shows at a glance which roles hold which abilities — always derived from the policy source, never a duplicated table.\n\nBoth conveniences lean on the same source of truth. A wildcard is shorthand for \"every ability this policy decides\", and the role matrix is a projection of the same decisions — so neither can drift from what actually gates requests.\n\n## What's Next [#whats-next]\n\n* [Permissions](/docs/authorization/permissions) — the `{resource}.{action}` grammar policies decide on\n* [Enforcement Points](/docs/authorization/enforcement) — every surface that runs your policies\n* [RBAC](/docs/authorization/roles) — storing the roles policies interpret\n* [Models](/docs/data/models) — the `permission` option wiring models to policies\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "A policy is a pure decision: given a user, an ability, and the resource being acted on, should this be allowed? In Kwiva, policies are written once as `definePolicy` files and executed everywhere — API routes, Studio screens, background jobs, realtime channels, and MCP tools — so the answer to \"can this user publish this post?\" never depends on which door they walked through."
		},
		{
			"heading": "the-factory",
			"content": "Policies live in `src/app/policies/`, one file per resource namespace, named `singular.ts` like the models they protect:"
		},
		{
			"heading": "the-factory",
			"content": "The namespace string is the resource half of every permission: a policy named `posts` decides `posts.read`, `posts.create`, and any custom ability like `posts.publish`. Matching models and controllers to the same namespace is what wires the policy onto every enforcement surface."
		},
		{
			"heading": "the-signature",
			"content": "Every policy is a function with three parameters:"
		},
		{
			"heading": "the-signature",
			"content": "**user** — the authenticated session user, typed from your model's fields."
		},
		{
			"heading": "the-signature",
			"content": "**ability** — the action being requested, one of the standard `read`, `create`, `update`, `delete` set or a custom ability from a controller action."
		},
		{
			"heading": "the-signature",
			"content": "**resource** — the record being acted on, `undefined` for resource-less checks like pure create or publish decisions."
		},
		{
			"heading": "the-signature",
			"content": "Policies may return a plain boolean or a promise, so async decisions — checking a related record, calling a service, reading a flag — are first-class. A reject is the default: the `default: return false` branch is the correct way to close every policy, because anything unlisted should fail closed."
		},
		{
			"heading": "evaluating-a-policy",
			"content": "Evaluation follows the order written:"
		},
		{
			"heading": "evaluating-a-policy",
			"content": "**Admin short-circuit** — trusted roles return before the switch runs."
		},
		{
			"heading": "evaluating-a-policy",
			"content": "**Ability switch** — the requested ability is matched against its case."
		},
		{
			"heading": "evaluating-a-policy",
			"content": "**Fail closed** — anything unlisted falls to the `default: return false` branch."
		},
		{
			"heading": "evaluating-a-policy",
			"content": "The order is deliberate. Fast, broad rules run first; specific ownership rules run next; unknown abilities never pass by accident. Because the code is ordinary JavaScript, you can reason about it line by line — including which branches return for which inputs."
		},
		{
			"heading": "deciding-by-ability",
			"content": "The two idioms every policy uses are the **admin short-circuit** and the **ability switch**:"
		},
		{
			"heading": "deciding-by-ability",
			"content": "**Admin short-circuit** — `if (user.role === 'admin') return true` skips the switch for trusted roles. It is fast to read and expresses hierarchy in one line, and because it lives inside the policy, it applies uniformly to every enforcement surface."
		},
		{
			"heading": "deciding-by-ability",
			"content": "**Ability switch** — each case handles exactly one ability. Grouping related abilities on the same case — `update` and `delete` both requiring ownership above — keeps policy behavior obvious."
		},
		{
			"heading": "deciding-by-ability",
			"content": "Custom abilities fall through the same switch. When a controller action registers `publish` as a permission, the policy's `publish` case decides it, and the route manifest carries it into OpenAPI, client types, and MCP tool metadata."
		},
		{
			"heading": "resource-binding",
			"content": "The `resource` argument is where ownership rules live. The classic pattern — users can update or delete only their own records — binds the decision to the record's fields:"
		},
		{
			"heading": "resource-binding",
			"content": "Without a resource there is no ownership to assert, and a false return forces callers to resolve the record first. That is deliberate: resource-less checks are for abilities that do not need one (create, publish), and the policy makes the requirement explicit by how it handles `undefined`."
		},
		{
			"heading": "resource-binding",
			"content": "The resource check is what turns a coarse RBAC boolean into fine-grained control. `posts.update` with a resource consults the actual post; `posts.create` without one asks a different question. Both are legitimate — they are simply different abilities, decided by the same policy."
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "Policies are pure logic — no HTTP concerns. They never read `ctx`, never return responses, never touch the filesystem or the network beyond what the decision requires. That purity is exactly what lets one file gate every surface:"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "Surface"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "How the policy runs"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "Generated model routes"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "`{permission}.{action}` checked in the route lifecycle"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "Controller routes"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "`permission` option resolves the policy"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "Studio screens"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "Actions hidden or disabled per ability"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "Realtime channels"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "Subscribe policy decides membership"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "MCP tools"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "Per-tool ability checks"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "Jobs and seeders"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "Explicit `authorize()` calls"
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "A job that fails a policy behaves identically to a route that fails it — same decision, same semantics, no second implementation to drift."
		},
		{
			"heading": "pure-logic-everywhere",
			"content": "> \\[!TIP]\n> Because policies are pure, they are trivially testable: call the exported function with a fixture user, an ability, and a resource, and assert the boolean. No request setup, no database — the policy's own signature is its test harness."
		},
		{
			"heading": "gates-one-off-abilities",
			"content": "Not every decision is a full resource policy. `defineGate` creates a single, composable check for repeated one-off rules:"
		},
		{
			"heading": "gates-one-off-abilities",
			"content": "Gates are used directly on routes and pages via the `gate` key — `gate: onlyEditors` — a small, forgettable capability that does not deserve a namespace of its own. They compose: any number of gates can be attached to a route, and each must pass."
		},
		{
			"heading": "gates-vs-policies",
			"content": "`definePolicy`"
		},
		{
			"heading": "gates-vs-policies",
			"content": "`defineGate`"
		},
		{
			"heading": "gates-vs-policies",
			"content": "Scope"
		},
		{
			"heading": "gates-vs-policies",
			"content": "One resource namespace, all abilities"
		},
		{
			"heading": "gates-vs-policies",
			"content": "One single-purpose check"
		},
		{
			"heading": "gates-vs-policies",
			"content": "Signature"
		},
		{
			"heading": "gates-vs-policies",
			"content": "`(user, ability, resource)`"
		},
		{
			"heading": "gates-vs-policies",
			"content": "`(user, ...args)`"
		},
		{
			"heading": "gates-vs-policies",
			"content": "Used by"
		},
		{
			"heading": "gates-vs-policies",
			"content": "Routes, Studio, channels, MCP, jobs"
		},
		{
			"heading": "gates-vs-policies",
			"content": "Routes and pages via `gate`"
		},
		{
			"heading": "gates-vs-policies",
			"content": "Example"
		},
		{
			"heading": "gates-vs-policies",
			"content": "`posts` deciding every posting ability"
		},
		{
			"heading": "gates-vs-policies",
			"content": "`tenantOwner` deciding one thing"
		},
		{
			"heading": "gates-vs-policies",
			"content": "Reach for a policy when a resource has multiple abilities to decide; reach for a gate when a single rule repeats across routes and does not belong to a resource namespace."
		},
		{
			"heading": "wildcards-and-inheritance-v1x",
			"content": "Two conveniences arrive in v1.x:"
		},
		{
			"heading": "wildcards-and-inheritance-v1x",
			"content": "**Ability wildcards** — a `posts.*` ability in a policy covers every action in the namespace, for broad grants written once."
		},
		{
			"heading": "wildcards-and-inheritance-v1x",
			"content": "**Role matrices** — role-to-ability maps are generated from policies, so Studio can render a role matrix screen that shows at a glance which roles hold which abilities — always derived from the policy source, never a duplicated table."
		},
		{
			"heading": "wildcards-and-inheritance-v1x",
			"content": "Both conveniences lean on the same source of truth. A wildcard is shorthand for \"every ability this policy decides\", and the role matrix is a projection of the same decisions — so neither can drift from what actually gates requests."
		},
		{
			"heading": "whats-next",
			"content": "Permissions — the `{resource}.{action}` grammar policies decide on"
		},
		{
			"heading": "whats-next",
			"content": "Enforcement Points — every surface that runs your policies"
		},
		{
			"heading": "whats-next",
			"content": "RBAC — storing the roles policies interpret"
		},
		{
			"heading": "whats-next",
			"content": "Models — the `permission` option wiring models to policies"
		}
	],
	"headings": [
		{
			"id": "the-factory",
			"content": "The Factory"
		},
		{
			"id": "the-signature",
			"content": "The Signature"
		},
		{
			"id": "evaluating-a-policy",
			"content": "Evaluating a policy"
		},
		{
			"id": "deciding-by-ability",
			"content": "Deciding by Ability"
		},
		{
			"id": "resource-binding",
			"content": "Resource Binding"
		},
		{
			"id": "pure-logic-everywhere",
			"content": "Pure Logic, Everywhere"
		},
		{
			"id": "gates-one-off-abilities",
			"content": "Gates: One-Off Abilities"
		},
		{
			"id": "gates-vs-policies",
			"content": "Gates vs policies"
		},
		{
			"id": "wildcards-and-inheritance-v1x",
			"content": "Wildcards and Inheritance (v1.x)"
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
		url: "#the-factory",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Factory" })
	},
	{
		depth: 2,
		url: "#the-signature",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Signature" })
	},
	{
		depth: 3,
		url: "#evaluating-a-policy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Evaluating a policy" })
	},
	{
		depth: 2,
		url: "#deciding-by-ability",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Deciding by Ability" })
	},
	{
		depth: 2,
		url: "#resource-binding",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Resource Binding" })
	},
	{
		depth: 2,
		url: "#pure-logic-everywhere",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Pure Logic, Everywhere" })
	},
	{
		depth: 2,
		url: "#gates-one-off-abilities",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Gates: One-Off Abilities" })
	},
	{
		depth: 3,
		url: "#gates-vs-policies",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Gates vs policies" })
	},
	{
		depth: 2,
		url: "#wildcards-and-inheritance-v1x",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Wildcards and Inheritance (v1.x)" })
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
			"A policy is a pure decision: given a user, an ability, and the resource being acted on, should this be allowed? In Kwiva, policies are written once as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			" files and executed everywhere — API routes, Studio screens, background jobs, realtime channels, and MCP tools — so the answer to \"can this user publish this post?\" never depends on which door they walked through."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-factory",
			children: "The Factory"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Policies live in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/policies/" }),
			", one file per resource namespace, named ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "singular.ts" }),
			" like the models they protect:"
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
			title: "the-factory.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/policies/posts.ts      →  definePolicy('posts', ...)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/policies/users.ts      →  definePolicy('users', ...)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/policies/tenants.ts    →  definePolicy('tenants', ...)" })
				})
			] })
		}) }),
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
			"The namespace string is the resource half of every permission: a policy named ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
			" decides ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.read" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.create" }),
			", and any custom ability like ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" }),
			". Matching models and controllers to the same namespace is what wires the policy onto every enforcement surface."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-signature",
			children: "The Signature"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every policy is a function with three parameters:" }),
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
			title: "the-signature.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
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
						children: " boolean "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "|"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: " Promise"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "<"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "boolean"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: ">"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "user" }), " — the authenticated session user, typed from your model's fields."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "ability" }),
				" — the action being requested, one of the standard ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "read" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "create" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "update" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delete" }),
				" set or a custom ability from a controller action."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "resource" }),
				" — the record being acted on, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "undefined" }),
				" for resource-less checks like pure create or publish decisions."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Policies may return a plain boolean or a promise, so async decisions — checking a related record, calling a service, reading a flag — are first-class. A reject is the default: the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "default: return false" }),
			" branch is the correct way to close every policy, because anything unlisted should fail closed."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "evaluating-a-policy",
			children: "Evaluating a policy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Evaluation follows the order written:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Admin short-circuit" }), " — trusted roles return before the switch runs."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Ability switch" }), " — the requested ability is matched against its case."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Fail closed" }),
				" — anything unlisted falls to the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "default: return false" }),
				" branch."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The order is deliberate. Fast, broad rules run first; specific ownership rules run next; unknown abilities never pass by accident. Because the code is ordinary JavaScript, you can reason about it line by line — including which branches return for which inputs." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "deciding-by-ability",
			children: "Deciding by Ability"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The two idioms every policy uses are the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "admin short-circuit" }),
			" and the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "ability switch" }),
			":"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Admin short-circuit" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "if (user.role === 'admin') return true" }),
				" skips the switch for trusted roles. It is fast to read and expresses hierarchy in one line, and because it lives inside the policy, it applies uniformly to every enforcement surface."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Ability switch" }),
				" — each case handles exactly one ability. Grouping related abilities on the same case — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "update" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delete" }),
				" both requiring ownership above — keeps policy behavior obvious."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Custom abilities fall through the same switch. When a controller action registers ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "publish" }),
			" as a permission, the policy's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "publish" }),
			" case decides it, and the route manifest carries it into OpenAPI, client types, and MCP tool metadata."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "resource-binding",
			children: "Resource Binding"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "resource" }),
			" argument is where ownership rules live. The classic pattern — users can update or delete only their own records — binds the decision to the record's fields:"
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
			title: "resource-binding.ts",
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
							children: "case"
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
							children: "case"
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
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Without a resource there is no ownership to assert, and a false return forces callers to resolve the record first. That is deliberate: resource-less checks are for abilities that do not need one (create, publish), and the policy makes the requirement explicit by how it handles ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "undefined" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The resource check is what turns a coarse RBAC boolean into fine-grained control. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.update" }),
			" with a resource consults the actual post; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.create" }),
			" without one asks a different question. Both are legitimate — they are simply different abilities, decided by the same policy."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "pure-logic-everywhere",
			children: "Pure Logic, Everywhere"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Policies are pure logic — no HTTP concerns. They never read ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx" }),
			", never return responses, never touch the filesystem or the network beyond what the decision requires. That purity is exactly what lets one file gate every surface:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "How the policy runs" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generated model routes" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{permission}.{action}" }), " checked in the route lifecycle"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controller routes" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }), " option resolves the policy"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Studio screens" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Actions hidden or disabled per ability" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Realtime channels" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Subscribe policy decides membership" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP tools" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Per-tool ability checks" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Jobs and seeders" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Explicit ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "authorize()" }),
				" calls"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A job that fails a policy behaves identically to a route that fails it — same decision, same semantics, no second implementation to drift." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!TIP]\nBecause policies are pure, they are trivially testable: call the exported function with a fixture user, an ability, and a resource, and assert the boolean. No request setup, no database — the policy's own signature is its test harness." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "gates-one-off-abilities",
			children: "Gates: One-Off Abilities"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Not every decision is a full resource policy. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineGate" }),
			" creates a single, composable check for repeated one-off rules:"
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
			title: "src/app/policies/gates.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/policies/gates.ts"
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
							children: " { defineGate } "
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
							children: " const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " onlyEditors"
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
							children: " defineGate"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(("
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
							children: " tenantOwner"
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
							children: " defineGate"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(("
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
							children: "tenant"
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
							children: " tenant.ownerId "
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
							children: " user.id)"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Gates are used directly on routes and pages via the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "gate" }),
			" key — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "gate: onlyEditors" }),
			" — a small, forgettable capability that does not deserve a namespace of its own. They compose: any number of gates can be attached to a route, and each must pass."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "gates-vs-policies",
			children: "Gates vs policies"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, {}),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineGate" }) })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scope" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "One resource namespace, all abilities" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "One single-purpose check" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Signature" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "(user, ability, resource)" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "(user, ...args)" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Used by" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Routes, Studio, channels, MCP, jobs" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Routes and pages via ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "gate" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Example" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }), " deciding every posting ability"] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantOwner" }), " deciding one thing"] })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Reach for a policy when a resource has multiple abilities to decide; reach for a gate when a single rule repeats across routes and does not belong to a resource namespace." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "wildcards-and-inheritance-v1x",
			children: "Wildcards and Inheritance (v1.x)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two conveniences arrive in v1.x:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Ability wildcards" }),
				" — a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.*" }),
				" ability in a policy covers every action in the namespace, for broad grants written once."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Role matrices" }), " — role-to-ability maps are generated from policies, so Studio can render a role matrix screen that shows at a glance which roles hold which abilities — always derived from the policy source, never a duplicated table."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Both conveniences lean on the same source of truth. A wildcard is shorthand for \"every ability this policy decides\", and the role matrix is a projection of the same decisions — so neither can drift from what actually gates requests." }),
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
					href: "/docs/authorization/permissions",
					children: "Permissions"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{resource}.{action}" }),
				" grammar policies decide on"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/enforcement",
				children: "Enforcement Points"
			}), " — every surface that runs your policies"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/roles",
				children: "RBAC"
			}), " — storing the roles policies interpret"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Models"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" option wiring models to policies"
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
