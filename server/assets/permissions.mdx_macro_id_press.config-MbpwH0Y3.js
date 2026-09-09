import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/authorization/permissions.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Permissions",
	"description": "The {resource}.{action} permission grammar, model and route gating, and the ctx.can, authorize, useCan, and whereCan helpers."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nPermissions are how authorization is addressed. Every access decision in Kwiva is expressed as a `{resource}.{action}` string, checked against a policy, and surfaced to the user with the same grammar on the server and the client. Get the naming right and the rest of the system — route gating, Studio screens, MCP tools, documentation — falls into place.\n\nPermissions are strings, but they are contracts, not ad-hoc labels. A permission names one decision: \"may this user perform this action on this resource?\". Because every layer of the framework reasons in the same grammar, writing `posts.publish` once wires the same ability into a controller route, a Studio button, client types, and OpenAPI metadata.\n\n## The Permission Grammar [#the-permission-grammar]\n\nA permission string has exactly two parts:\n\n```plaintext title=\"the-permission-grammar.txt\"\n{resource}.{action}\n```\n\n`posts.publish`, `users.create`, `projects.archive` — all follow the shape. The resource is the policy namespace, and the action is an ability the policy decides:\n\n| Permission      | Resource | Action           |\n| --------------- | -------- | ---------------- |\n| `posts.read`    | posts    | read             |\n| `posts.create`  | posts    | create           |\n| `posts.update`  | posts    | update           |\n| `posts.delete`  | posts    | delete           |\n| `posts.publish` | posts    | publish (custom) |\n| `users.create`  | users    | create           |\n\nThe framework's standard actions are `read`, `create`, `update`, and `delete` — the four verbs every generated model route uses. Custom actions such as `publish` or `archive` come from controller routes; because the route manifest registers every controller action as an ability, a custom permission is discoverable in client types, OpenAPI, and MCP tools the moment it is declared.\n\n### Where the verbs map [#where-the-verbs-map]\n\n| Generated route | Permission checked    |\n| --------------- | --------------------- |\n| `list`          | `{permission}.read`   |\n| `get`           | `{permission}.read`   |\n| `create`        | `{permission}.create` |\n| `update`        | `{permission}.update` |\n| `delete`        | `{permission}.delete` |\n\nThe resource half of the string is the namespace declared on the model (`permission: 'posts'`) or controller. The action half is the verb being attempted. Joining them names the exact decision the policy has a case for.\n\n## Granting Permissions [#granting-permissions]\n\nPermissions are granted two ways, both stored on the user record through its `permission` field:\n\n* **Directly** — a user's `permission` list names exact abilities they hold.\n* **By role** — the `role` field implies a bundle of expected abilities, which policies interpret.\n\nGranting is data, not code. There is no special `grant` call in application logic; a permission is granted by assigning it to the field and revoked the same way. Policies remain the sole interpreter of what any grant means.\n\n> \\[!NOTE]\n> The `permission` field and the `role` field feed policies, but they are not interpreted by the data layer. A grant sitting in a field does nothing until a policy reads it — which is exactly why revoking policy meaning is one file edit, not a data migration.\n\n## Model-Level Gating [#model-level-gating]\n\nThe strongest enforcement point is the model itself. A model declared with the `permission` option gates every generated route by namespace:\n\n```ts title=\"model-level-gating.ts\"\ndefineModel('posts', (f) => ({\n  // ...\n}), { timestamps: true, permission: 'posts' })\n```\n\nWith `permission: 'posts'` declared, the model's generated `list/get/create/update/delete` routes check `posts.read`, `posts.create`, `posts.update`, and `posts.delete` respectively — resolved against the `posts` policy in the route lifecycle before any handler runs. Studio screens and MCP tools generated from the same model inherit the identical gating, so one option keeps the whole surface consistent.\n\nThe check runs at the guard stage of the pipeline, after the session has been loaded, so the policy receives a real session and can make per-user decisions. A rejected check raises a typed error before the handler executes — no handler-level `if` noise.\n\n## Route-Level Gating [#route-level-gating]\n\nHand-written controllers gate individual actions with the same grammar. The `permission` route option names the exact ability a handler requires:\n\n```ts title=\"route-level-gating.ts\"\nexport default defineController('posts', (c) => ({\n  publish: c.post('/:id/publish', async ({ params }) => {\n    const post = await Post.findOrFail(params.id)\n    return post.update({ status: 'published', publishedAt: new Date() })\n  }, {\n    permission: 'posts.publish',\n  }),\n}))\n```\n\nThe check runs in the route lifecycle before the handler, alongside auth and tenant middleware. A missing or insufficient permission raises the same typed error the rest of the pipeline uses — no handler-level `if` noise.\n\nRoute-level gating is how custom actions get enforced. Anything beyond the four CRUD verbs — `publish`, `archive`, `invite`, `transfer` — is a controller route with a `permission` option, and the manifest carries the custom ability into client types, OpenAPI, and MCP tool metadata automatically.\n\n## Checking in Application Code [#checking-in-application-code]\n\nMost checks never need explicit code — model and route options handle them. When you do check, three helpers mirror the same grammar:\n\n```ts title=\"checking-in-application-code.ts\"\n// server: does the current user hold this ability?\nctx.can('posts.publish')                        // ability check (resource-less)\nctx.can('posts.update', post)                   // resource check\n\n// server: check or throw\nawait authorize('posts.update', post)           // throws ForbiddenError\n\n// client: reactive ability\nconst canPublish = useCan('posts.publish')\n```\n\n* **ctx.can** — the boolean question, optionally against a concrete resource. Use it to conditionally render, branch, or short-circuit.\n* **authorize** — the enforcing variant. It throws a `ForbiddenError` that the error taxonomy maps to a typed response; prefer it in jobs, seeders, and anywhere a silent `false` would be dangerous.\n* **useCan** — the reactive client twin, returning `true` or `false` for the current session. It drives conditional UI — hide the publish button, not just reject the request.\n\n### Resource checks [#resource-checks]\n\nThe two-argument form binds the decision to a specific record. `ctx.can('posts.update', post)` hands the policy the concrete resource, so ownership cases like `resource.authorId === user.id` can decide. Without a resource, the policy's `undefined` branch answers — the right shape for create and publish decisions where there is nothing to own yet.\n\n### Where each helper belongs [#where-each-helper-belongs]\n\n| Helper      | Surface                    | Use for                                     |\n| ----------- | -------------------------- | ------------------------------------------- |\n| `ctx.can`   | Server, in handlers        | Branching and short-circuits                |\n| `authorize` | Server, jobs/seeders       | Enforcing decisions that must not be silent |\n| `useCan`    | Client, components         | Conditional rendering of actions            |\n| `whereCan`  | Server, query layer (v1.x) | Scoping result sets by policy               |\n\n## Query-Level Scoping (v1.x) [#query-level-scoping-v1x]\n\nFor query-level scoping, v1.x adds policy-filtered result sets:\n\n```ts title=\"query-level-scoping-v1.ts\"\nPost.query().whereCan('posts.update')           // policy-filtered result set (v1.x)\n```\n\n`whereCan` narrows the returned rows themselves, so users only ever receive records their policy would grant — defense at the data layer, not the render layer. It composes with tenant scoping: a `whereCan` query is still tenant-scoped first, then ability-filtered, so the result set satisfies both boundaries.\n\n## Keep the Grammar Consistent [#keep-the-grammar-consistent]\n\nBecause permissions are strings, they are also contracts. The framework enforces consistency by deriving everything from the same source: policies declare the namespaces, controllers register the custom abilities into the manifest, and generated routes read the model option. When your docs, Studio screens, and OpenAPI spec all agree on `posts.publish`, authorization stays legible at every layer.\n\nThe consistency is what makes a permission safe to reason about. When `posts.publish` appears in a route option, a policy case, a Studio rule, a client type, and an MCP tool resolver, it is the same ability in every one of them — there is no dialect to translate between surfaces.\n\n## What's Next [#whats-next]\n\n* [Policies](/docs/authorization/policies) — what a `posts.publish` string actually resolves to\n* [RBAC](/docs/authorization/roles) — where permission grants and roles are stored\n* [Enforcement Points](/docs/authorization/enforcement) — where these checks run, in depth\n* [Controllers](/docs/http/controllers) — route options including `permission`\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Permissions are how authorization is addressed. Every access decision in Kwiva is expressed as a `{resource}.{action}` string, checked against a policy, and surfaced to the user with the same grammar on the server and the client. Get the naming right and the rest of the system — route gating, Studio screens, MCP tools, documentation — falls into place."
		},
		{
			"heading": void 0,
			"content": "Permissions are strings, but they are contracts, not ad-hoc labels. A permission names one decision: \"may this user perform this action on this resource?\". Because every layer of the framework reasons in the same grammar, writing `posts.publish` once wires the same ability into a controller route, a Studio button, client types, and OpenAPI metadata."
		},
		{
			"heading": "the-permission-grammar",
			"content": "A permission string has exactly two parts:"
		},
		{
			"heading": "the-permission-grammar",
			"content": "`posts.publish`, `users.create`, `projects.archive` — all follow the shape. The resource is the policy namespace, and the action is an ability the policy decides:"
		},
		{
			"heading": "the-permission-grammar",
			"content": "Permission"
		},
		{
			"heading": "the-permission-grammar",
			"content": "Resource"
		},
		{
			"heading": "the-permission-grammar",
			"content": "Action"
		},
		{
			"heading": "the-permission-grammar",
			"content": "`posts.read`"
		},
		{
			"heading": "the-permission-grammar",
			"content": "posts"
		},
		{
			"heading": "the-permission-grammar",
			"content": "read"
		},
		{
			"heading": "the-permission-grammar",
			"content": "`posts.create`"
		},
		{
			"heading": "the-permission-grammar",
			"content": "posts"
		},
		{
			"heading": "the-permission-grammar",
			"content": "create"
		},
		{
			"heading": "the-permission-grammar",
			"content": "`posts.update`"
		},
		{
			"heading": "the-permission-grammar",
			"content": "posts"
		},
		{
			"heading": "the-permission-grammar",
			"content": "update"
		},
		{
			"heading": "the-permission-grammar",
			"content": "`posts.delete`"
		},
		{
			"heading": "the-permission-grammar",
			"content": "posts"
		},
		{
			"heading": "the-permission-grammar",
			"content": "delete"
		},
		{
			"heading": "the-permission-grammar",
			"content": "`posts.publish`"
		},
		{
			"heading": "the-permission-grammar",
			"content": "posts"
		},
		{
			"heading": "the-permission-grammar",
			"content": "publish (custom)"
		},
		{
			"heading": "the-permission-grammar",
			"content": "`users.create`"
		},
		{
			"heading": "the-permission-grammar",
			"content": "users"
		},
		{
			"heading": "the-permission-grammar",
			"content": "create"
		},
		{
			"heading": "the-permission-grammar",
			"content": "The framework's standard actions are `read`, `create`, `update`, and `delete` — the four verbs every generated model route uses. Custom actions such as `publish` or `archive` come from controller routes; because the route manifest registers every controller action as an ability, a custom permission is discoverable in client types, OpenAPI, and MCP tools the moment it is declared."
		},
		{
			"heading": "where-the-verbs-map",
			"content": "Generated route"
		},
		{
			"heading": "where-the-verbs-map",
			"content": "Permission checked"
		},
		{
			"heading": "where-the-verbs-map",
			"content": "`list`"
		},
		{
			"heading": "where-the-verbs-map",
			"content": "`{permission}.read`"
		},
		{
			"heading": "where-the-verbs-map",
			"content": "`get`"
		},
		{
			"heading": "where-the-verbs-map",
			"content": "`{permission}.read`"
		},
		{
			"heading": "where-the-verbs-map",
			"content": "`create`"
		},
		{
			"heading": "where-the-verbs-map",
			"content": "`{permission}.create`"
		},
		{
			"heading": "where-the-verbs-map",
			"content": "`update`"
		},
		{
			"heading": "where-the-verbs-map",
			"content": "`{permission}.update`"
		},
		{
			"heading": "where-the-verbs-map",
			"content": "`delete`"
		},
		{
			"heading": "where-the-verbs-map",
			"content": "`{permission}.delete`"
		},
		{
			"heading": "where-the-verbs-map",
			"content": "The resource half of the string is the namespace declared on the model (`permission: 'posts'`) or controller. The action half is the verb being attempted. Joining them names the exact decision the policy has a case for."
		},
		{
			"heading": "granting-permissions",
			"content": "Permissions are granted two ways, both stored on the user record through its `permission` field:"
		},
		{
			"heading": "granting-permissions",
			"content": "**Directly** — a user's `permission` list names exact abilities they hold."
		},
		{
			"heading": "granting-permissions",
			"content": "**By role** — the `role` field implies a bundle of expected abilities, which policies interpret."
		},
		{
			"heading": "granting-permissions",
			"content": "Granting is data, not code. There is no special `grant` call in application logic; a permission is granted by assigning it to the field and revoked the same way. Policies remain the sole interpreter of what any grant means."
		},
		{
			"heading": "granting-permissions",
			"content": "> \\[!NOTE]\n> The `permission` field and the `role` field feed policies, but they are not interpreted by the data layer. A grant sitting in a field does nothing until a policy reads it — which is exactly why revoking policy meaning is one file edit, not a data migration."
		},
		{
			"heading": "model-level-gating",
			"content": "The strongest enforcement point is the model itself. A model declared with the `permission` option gates every generated route by namespace:"
		},
		{
			"heading": "model-level-gating",
			"content": "With `permission: 'posts'` declared, the model's generated `list/get/create/update/delete` routes check `posts.read`, `posts.create`, `posts.update`, and `posts.delete` respectively — resolved against the `posts` policy in the route lifecycle before any handler runs. Studio screens and MCP tools generated from the same model inherit the identical gating, so one option keeps the whole surface consistent."
		},
		{
			"heading": "model-level-gating",
			"content": "The check runs at the guard stage of the pipeline, after the session has been loaded, so the policy receives a real session and can make per-user decisions. A rejected check raises a typed error before the handler executes — no handler-level `if` noise."
		},
		{
			"heading": "route-level-gating",
			"content": "Hand-written controllers gate individual actions with the same grammar. The `permission` route option names the exact ability a handler requires:"
		},
		{
			"heading": "route-level-gating",
			"content": "The check runs in the route lifecycle before the handler, alongside auth and tenant middleware. A missing or insufficient permission raises the same typed error the rest of the pipeline uses — no handler-level `if` noise."
		},
		{
			"heading": "route-level-gating",
			"content": "Route-level gating is how custom actions get enforced. Anything beyond the four CRUD verbs — `publish`, `archive`, `invite`, `transfer` — is a controller route with a `permission` option, and the manifest carries the custom ability into client types, OpenAPI, and MCP tool metadata automatically."
		},
		{
			"heading": "checking-in-application-code",
			"content": "Most checks never need explicit code — model and route options handle them. When you do check, three helpers mirror the same grammar:"
		},
		{
			"heading": "checking-in-application-code",
			"content": "**ctx.can** — the boolean question, optionally against a concrete resource. Use it to conditionally render, branch, or short-circuit."
		},
		{
			"heading": "checking-in-application-code",
			"content": "**authorize** — the enforcing variant. It throws a `ForbiddenError` that the error taxonomy maps to a typed response; prefer it in jobs, seeders, and anywhere a silent `false` would be dangerous."
		},
		{
			"heading": "checking-in-application-code",
			"content": "**useCan** — the reactive client twin, returning `true` or `false` for the current session. It drives conditional UI — hide the publish button, not just reject the request."
		},
		{
			"heading": "resource-checks",
			"content": "The two-argument form binds the decision to a specific record. `ctx.can('posts.update', post)` hands the policy the concrete resource, so ownership cases like `resource.authorId === user.id` can decide. Without a resource, the policy's `undefined` branch answers — the right shape for create and publish decisions where there is nothing to own yet."
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "Helper"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "Surface"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "Use for"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "`ctx.can`"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "Server, in handlers"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "Branching and short-circuits"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "`authorize`"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "Server, jobs/seeders"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "Enforcing decisions that must not be silent"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "`useCan`"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "Client, components"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "Conditional rendering of actions"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "`whereCan`"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "Server, query layer (v1.x)"
		},
		{
			"heading": "where-each-helper-belongs",
			"content": "Scoping result sets by policy"
		},
		{
			"heading": "query-level-scoping-v1x",
			"content": "For query-level scoping, v1.x adds policy-filtered result sets:"
		},
		{
			"heading": "query-level-scoping-v1x",
			"content": "`whereCan` narrows the returned rows themselves, so users only ever receive records their policy would grant — defense at the data layer, not the render layer. It composes with tenant scoping: a `whereCan` query is still tenant-scoped first, then ability-filtered, so the result set satisfies both boundaries."
		},
		{
			"heading": "keep-the-grammar-consistent",
			"content": "Because permissions are strings, they are also contracts. The framework enforces consistency by deriving everything from the same source: policies declare the namespaces, controllers register the custom abilities into the manifest, and generated routes read the model option. When your docs, Studio screens, and OpenAPI spec all agree on `posts.publish`, authorization stays legible at every layer."
		},
		{
			"heading": "keep-the-grammar-consistent",
			"content": "The consistency is what makes a permission safe to reason about. When `posts.publish` appears in a route option, a policy case, a Studio rule, a client type, and an MCP tool resolver, it is the same ability in every one of them — there is no dialect to translate between surfaces."
		},
		{
			"heading": "whats-next",
			"content": "Policies — what a `posts.publish` string actually resolves to"
		},
		{
			"heading": "whats-next",
			"content": "RBAC — where permission grants and roles are stored"
		},
		{
			"heading": "whats-next",
			"content": "Enforcement Points — where these checks run, in depth"
		},
		{
			"heading": "whats-next",
			"content": "Controllers — route options including `permission`"
		}
	],
	"headings": [
		{
			"id": "the-permission-grammar",
			"content": "The Permission Grammar"
		},
		{
			"id": "where-the-verbs-map",
			"content": "Where the verbs map"
		},
		{
			"id": "granting-permissions",
			"content": "Granting Permissions"
		},
		{
			"id": "model-level-gating",
			"content": "Model-Level Gating"
		},
		{
			"id": "route-level-gating",
			"content": "Route-Level Gating"
		},
		{
			"id": "checking-in-application-code",
			"content": "Checking in Application Code"
		},
		{
			"id": "resource-checks",
			"content": "Resource checks"
		},
		{
			"id": "where-each-helper-belongs",
			"content": "Where each helper belongs"
		},
		{
			"id": "query-level-scoping-v1x",
			"content": "Query-Level Scoping (v1.x)"
		},
		{
			"id": "keep-the-grammar-consistent",
			"content": "Keep the Grammar Consistent"
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
		url: "#the-permission-grammar",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Permission Grammar" })
	},
	{
		depth: 3,
		url: "#where-the-verbs-map",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where the verbs map" })
	},
	{
		depth: 2,
		url: "#granting-permissions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Granting Permissions" })
	},
	{
		depth: 2,
		url: "#model-level-gating",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Model-Level Gating" })
	},
	{
		depth: 2,
		url: "#route-level-gating",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Route-Level Gating" })
	},
	{
		depth: 2,
		url: "#checking-in-application-code",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Checking in Application Code" })
	},
	{
		depth: 3,
		url: "#resource-checks",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Resource checks" })
	},
	{
		depth: 3,
		url: "#where-each-helper-belongs",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where each helper belongs" })
	},
	{
		depth: 2,
		url: "#query-level-scoping-v1x",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Query-Level Scoping (v1.x)" })
	},
	{
		depth: 2,
		url: "#keep-the-grammar-consistent",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Keep the Grammar Consistent" })
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
			"Permissions are how authorization is addressed. Every access decision in Kwiva is expressed as a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{resource}.{action}" }),
			" string, checked against a policy, and surfaced to the user with the same grammar on the server and the client. Get the naming right and the rest of the system — route gating, Studio screens, MCP tools, documentation — falls into place."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Permissions are strings, but they are contracts, not ad-hoc labels. A permission names one decision: \"may this user perform this action on this resource?\". Because every layer of the framework reasons in the same grammar, writing ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" }),
			" once wires the same ability into a controller route, a Studio button, client types, and OpenAPI metadata."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-permission-grammar",
			children: "The Permission Grammar"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A permission string has exactly two parts:" }),
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
			title: "the-permission-grammar.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "{resource}.{action}" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "users.create" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "projects.archive" }),
			" — all follow the shape. The resource is the policy namespace, and the action is an ability the policy decides:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Permission" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Resource" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Action" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.read" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "posts" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "read" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.create" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "posts" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "create" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.update" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "posts" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "update" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.delete" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "posts" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "delete" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "posts" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "publish (custom)" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "users.create" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "users" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "create" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The framework's standard actions are ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "read" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "create" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "update" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delete" }),
			" — the four verbs every generated model route uses. Custom actions such as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "publish" }),
			" or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "archive" }),
			" come from controller routes; because the route manifest registers every controller action as an ability, a custom permission is discoverable in client types, OpenAPI, and MCP tools the moment it is declared."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "where-the-verbs-map",
			children: "Where the verbs map"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Generated route" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Permission checked" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "list" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{permission}.read" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "get" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{permission}.read" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "create" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{permission}.create" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "update" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{permission}.update" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delete" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{permission}.delete" }) })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The resource half of the string is the namespace declared on the model (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission: 'posts'" }),
			") or controller. The action half is the verb being attempted. Joining them names the exact decision the policy has a case for."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "granting-permissions",
			children: "Granting Permissions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Permissions are granted two ways, both stored on the user record through its ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" field:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Directly" }),
				" — a user's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" list names exact abilities they hold."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "By role" }),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
				" field implies a bundle of expected abilities, which policies interpret."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Granting is data, not code. There is no special ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "grant" }),
			" call in application logic; a permission is granted by assigning it to the field and revoked the same way. Policies remain the sole interpreter of what any grant means."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nThe ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" field and the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
				" field feed policies, but they are not interpreted by the data layer. A grant sitting in a field does nothing until a policy reads it — which is exactly why revoking policy meaning is one file edit, not a data migration."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "model-level-gating",
			children: "Model-Level Gating"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The strongest enforcement point is the model itself. A model declared with the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" option gates every generated route by namespace:"
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
			title: "model-level-gating.ts",
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // ..."
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
							children: "'posts'"
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
			"With ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission: 'posts'" }),
			" declared, the model's generated ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "list/get/create/update/delete" }),
			" routes check ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.read" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.create" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.update" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.delete" }),
			" respectively — resolved against the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
			" policy in the route lifecycle before any handler runs. Studio screens and MCP tools generated from the same model inherit the identical gating, so one option keeps the whole surface consistent."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The check runs at the guard stage of the pipeline, after the session has been loaded, so the policy receives a real session and can make per-user decisions. A rejected check raises a typed error before the handler executes — no handler-level ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "if" }),
			" noise."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "route-level-gating",
			children: "Route-Level Gating"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Hand-written controllers gate individual actions with the same grammar. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" route option names the exact ability a handler requires:"
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
			title: "route-level-gating.ts",
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
							children: " defineController"
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
							children: "c"
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
							children: "  publish: c."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "post"
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
							children: "'/:id/publish'"
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
							children: "params"
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
							children: "    const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " post"
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " Post."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "findOrFail"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(params.id)"
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
							children: "    return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " post."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "update"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ status: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'published'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", publishedAt: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "new"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " Date"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "() })"
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
						children: "  }, {"
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
							children: "    permission: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'posts.publish'"
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
						children: "  }),"
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
						children: "}))"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The check runs in the route lifecycle before the handler, alongside auth and tenant middleware. A missing or insufficient permission raises the same typed error the rest of the pipeline uses — no handler-level ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "if" }),
			" noise."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Route-level gating is how custom actions get enforced. Anything beyond the four CRUD verbs — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "publish" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "archive" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invite" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "transfer" }),
			" — is a controller route with a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" option, and the manifest carries the custom ability into client types, OpenAPI, and MCP tool metadata automatically."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "checking-in-application-code",
			children: "Checking in Application Code"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Most checks never need explicit code — model and route options handle them. When you do check, three helpers mirror the same grammar:" }),
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
			title: "checking-in-application-code.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// server: does the current user hold this ability?"
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
							children: "ctx."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "can"
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
							children: "'posts.publish'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")                        "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// ability check (resource-less)"
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
							children: "ctx."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "can"
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
							children: "'posts.update'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", post)                   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// resource check"
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
						children: "// server: check or throw"
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
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " authorize"
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
							children: "'posts.update'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", post)           "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// throws ForbiddenError"
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
						children: "// client: reactive ability"
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " canPublish"
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
							children: " useCan"
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
							children: "'posts.publish'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "ctx.can" }), " — the boolean question, optionally against a concrete resource. Use it to conditionally render, branch, or short-circuit."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "authorize" }),
				" — the enforcing variant. It throws a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ForbiddenError" }),
				" that the error taxonomy maps to a typed response; prefer it in jobs, seeders, and anywhere a silent ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "false" }),
				" would be dangerous."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "useCan" }),
				" — the reactive client twin, returning ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "true" }),
				" or ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "false" }),
				" for the current session. It drives conditional UI — hide the publish button, not just reject the request."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "resource-checks",
			children: "Resource checks"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The two-argument form binds the decision to a specific record. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.can('posts.update', post)" }),
			" hands the policy the concrete resource, so ownership cases like ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "resource.authorId === user.id" }),
			" can decide. Without a resource, the policy's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "undefined" }),
			" branch answers — the right shape for create and publish decisions where there is nothing to own yet."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "where-each-helper-belongs",
			children: "Where each helper belongs"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Helper" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Use for" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.can" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server, in handlers" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Branching and short-circuits" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "authorize" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server, jobs/seeders" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Enforcing decisions that must not be silent" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useCan" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Client, components" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Conditional rendering of actions" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "whereCan" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server, query layer (v1.x)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scoping result sets by policy" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "query-level-scoping-v1x",
			children: "Query-Level Scoping (v1.x)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "For query-level scoping, v1.x adds policy-filtered result sets:" }),
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
			title: "query-level-scoping-v1.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "Post."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "query"
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
						children: "whereCan"
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
						children: "'posts.update'"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ")           "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// policy-filtered result set (v1.x)"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "whereCan" }),
			" narrows the returned rows themselves, so users only ever receive records their policy would grant — defense at the data layer, not the render layer. It composes with tenant scoping: a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "whereCan" }),
			" query is still tenant-scoped first, then ability-filtered, so the result set satisfies both boundaries."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "keep-the-grammar-consistent",
			children: "Keep the Grammar Consistent"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because permissions are strings, they are also contracts. The framework enforces consistency by deriving everything from the same source: policies declare the namespaces, controllers register the custom abilities into the manifest, and generated routes read the model option. When your docs, Studio screens, and OpenAPI spec all agree on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" }),
			", authorization stays legible at every layer."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The consistency is what makes a permission safe to reason about. When ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" }),
			" appears in a route option, a policy case, a Studio rule, a client type, and an MCP tool resolver, it is the same ability in every one of them — there is no dialect to translate between surfaces."
		] }),
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
					href: "/docs/authorization/policies",
					children: "Policies"
				}),
				" — what a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" }),
				" string actually resolves to"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/roles",
				children: "RBAC"
			}), " — where permission grants and roles are stored"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/enforcement",
				children: "Enforcement Points"
			}), " — where these checks run, in depth"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/controllers",
					children: "Controllers"
				}),
				" — route options including ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" })
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
