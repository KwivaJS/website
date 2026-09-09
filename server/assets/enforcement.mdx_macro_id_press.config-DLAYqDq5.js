import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/authorization/enforcement.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Enforcement Points",
	"description": "Every surface that runs your policies — routes, Studio, channels, MCP, seeders, tasks — and the defense-in-depth ordering that connects them."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nA policy that is never checked is decoration. Kwiva enforces policies at every access surface, so the decision you write once in `definePolicy` is executed consistently no matter how a user (or an agent) reaches the data. This page is the map of where checks run and why the order of those checks matters.\n\nThe unifying property across every surface is the policy source. Each check resolves through the same `definePolicy` file, so \"can this user publish this post\" has exactly one answer everywhere. What varies per surface is the mechanism — a route lifecycle hook, a Studio render decision, a channel subscription gate, an explicit `authorize()` call in a job — never the decision itself.\n\n## The Enforcement Map [#the-enforcement-map]\n\n| Surface                | Rule                                                   |\n| ---------------------- | ------------------------------------------------------ |\n| Generated model routes | `{permission}.{action}` checked in the route lifecycle |\n| Controller routes      | `permission` option resolved against the policy        |\n| Studio screens         | Actions hidden or disabled without the ability         |\n| Realtime channels      | Subscribe is policy-checked                            |\n| MCP tools              | Per-tool ability enforcement                           |\n| Seeders / tasks        | Explicit `authorize()` calls                           |\n\nEach surface uses the same policy source, so there is exactly one definition of \"can a user publish this post\" — not a route copy, a UI copy, and an agent copy that slowly diverge.\n\n## Generated Model Routes [#generated-model-routes]\n\nThe most important enforcement point is the one you never write. A model declared with the `permission` option generates five routes — `list/get/create/update/delete` — and every one of them checks `{permission}.{action}` against the policy namespace during the request lifecycle:\n\n```ts title=\"generated-model-routes.ts\"\ndefineModel('posts', (f) => ({ ... }), {\n  timestamps: true,\n  permission: 'posts',\n})\n```\n\n`posts` maps to list `posts.read`, get `posts.read`, create `posts.create`, update `posts.update`, and delete `posts.delete`, resolved through the `posts` policy before the handler executes. Because the check lives in the route lifecycle, it composes with every other stage — auth and tenant middleware have already run, so the policy receives a real session and a scoped request.\n\nThe route lifecycle stage matters for correctness: validation runs before the check, so the policy decides on a validated request; auth runs before it, so `user` is never `null`; and tenant resolution runs before it, so the request already knows whose data it touches. A rejected decision produces a typed error response before the handler body executes.\n\n## Controller Routes [#controller-routes]\n\nHand-written endpoints opt into the same machinery with the `permission` route option. This is how custom actions — anything beyond the four CRUD verbs — get enforced:\n\n```ts title=\"controller-routes.ts\"\nexport default defineController('posts', (c) => ({\n  publish: c.post('/:id/publish', (), { permission: 'posts.publish' }),\n}))\n```\n\nThe `publish` ability is a custom action registered in the route manifest; the policy's `case 'publish'` decides it. Wire the same namespace on the model and the controller, and one policy gates both the generated surface and the bespoke one.\n\n## Studio Screens [#studio-screens]\n\nStudio respects the same policies without a line of configuration. Actions a user lacks the ability to perform are hidden or disabled on generated CRUD screens — no create button without `create`, no delete without `delete`. Studio derives columns, filters, and forms from the model and gates actions with its policy, so the admin UI can never offer an operation a policy would reject. In v1.x, role matrices generated from policies show administrators exactly who holds which ability, straight from the source of truth.\n\nStudio is the most visible proof of policy purity: the same boolean that rejects a request in the pipeline also hides the button in the UI. There is no second implementation of \"can the user do this\" living in the admin interface.\n\n## Realtime Channels [#realtime-channels]\n\nSubscription is an access decision too. A channel subscribe is policy-checked before the WebSocket connection receives events, so a user can hold an authenticated session without being able to join a private stream — `channel('chat.{roomId}')` resolves membership through the policy engine rather than manual guard lists.\n\nThe check runs at the handshake, before the connection upgrades, so an unauthorized subscriber is rejected before a stream opens. Per-tenant membership follows the same rule — see [Tenant isolation](/docs/tenancy/isolation) for how channel membership is additionally scoped by tenant.\n\n## MCP Tools [#mcp-tools]\n\nAgent surfaces are gated by the same policies as every other surface. When a model's CRUD operations are exposed as MCP tools, each tool runs through per-tool permission checks; custom controller actions exposed as tools carry their `permission` ability. An agent with tool access is bound by exactly the same lines as an API client or a Studio user — no parallel authorization model for machines.\n\nThis is deliberate: the tool resolver and the HTTP route resolve the same policy for the same ability, so an agent cannot reach records a richer permission would forbid. Machines get no special path.\n\n## Seeders and Tasks [#seeders-and-tasks]\n\nBackground execution has a different nature: there is no request, no route lifecycle, and often no browser. Seeders and tasks therefore enforce explicitly with `await authorize(...)`, which throws a `ForbiddenError` when the current context lacks the ability. Explicit is correct here — silent `false` in a seed would half-provide data, and a task that quietly no-ops can be worse than one that fails loudly.\n\n```ts title=\"seeders-and-tasks.ts\"\n// inside a task or seeder\nawait authorize('posts.update', post)   // throws ForbiddenError on denial\n```\n\nThe throwing variant is preferred in these surfaces precisely because there is no UI to hide a button in. A background operation that cannot legally proceed should fail loudly, surface in logs, and be retryable — not complete with half its intended effect.\n\n## Defense-in-Depth Ordering [#defense-in-depth-ordering]\n\nEnforcement is layered, and the layers run in a deliberate order:\n\n1. **Authentication** — the session middleware resolves who is making the request; unauthenticated requests are cut off early with `401`.\n2. **Policy checks** — in the route lifecycle, before the handler, via `{permission}.{action}` or the route `permission` option.\n3. **Handler logic** — explicit `ctx.can`/`authorize` for decisions the generic checks do not cover.\n4. **Data-level scoping** — models with a tenant field auto-scope queries, so even a permitted request cannot reach records outside its tenant; `whereCan` (v1.x) applies policy filtering to result sets themselves.\n5. **Surface-level gating** — Studio, channels, and MCP run the same policies for non-HTTP access.\n\nEach layer assumes the ones before it ran. An early layer failing stops the request cheaply; a later layer catching something the earlier ones missed is normal defense-in-depth, not duplication. The framework's contribution is that every layer reads from the same policy source, so the layers reinforce rather than contradict each other.\n\n> \\[!WARNING]\n> Layering is not redundancy to be pruned. Removing the data-level scoping layer because the policy layer \"already passed\" turns a permitted-but-scoped request into a permitted-and-unscoped one. Keep the layers; they enforce orthogonal boundaries.\n\n## What's Next [#whats-next]\n\n* [Policies](/docs/authorization/policies) — writing the decisions every surface enforces\n* [Permissions](/docs/authorization/permissions) — the strings that name those decisions\n* [Middleware](/docs/http/middleware) — where auth and policy checks sit in the pipeline\n* [Tenancy](/docs/tenancy/scoping) — the data-level scope that runs after authorization\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "A policy that is never checked is decoration. Kwiva enforces policies at every access surface, so the decision you write once in `definePolicy` is executed consistently no matter how a user (or an agent) reaches the data. This page is the map of where checks run and why the order of those checks matters."
		},
		{
			"heading": void 0,
			"content": "The unifying property across every surface is the policy source. Each check resolves through the same `definePolicy` file, so \"can this user publish this post\" has exactly one answer everywhere. What varies per surface is the mechanism — a route lifecycle hook, a Studio render decision, a channel subscription gate, an explicit `authorize()` call in a job — never the decision itself."
		},
		{
			"heading": "the-enforcement-map",
			"content": "Surface"
		},
		{
			"heading": "the-enforcement-map",
			"content": "Rule"
		},
		{
			"heading": "the-enforcement-map",
			"content": "Generated model routes"
		},
		{
			"heading": "the-enforcement-map",
			"content": "`{permission}.{action}` checked in the route lifecycle"
		},
		{
			"heading": "the-enforcement-map",
			"content": "Controller routes"
		},
		{
			"heading": "the-enforcement-map",
			"content": "`permission` option resolved against the policy"
		},
		{
			"heading": "the-enforcement-map",
			"content": "Studio screens"
		},
		{
			"heading": "the-enforcement-map",
			"content": "Actions hidden or disabled without the ability"
		},
		{
			"heading": "the-enforcement-map",
			"content": "Realtime channels"
		},
		{
			"heading": "the-enforcement-map",
			"content": "Subscribe is policy-checked"
		},
		{
			"heading": "the-enforcement-map",
			"content": "MCP tools"
		},
		{
			"heading": "the-enforcement-map",
			"content": "Per-tool ability enforcement"
		},
		{
			"heading": "the-enforcement-map",
			"content": "Seeders / tasks"
		},
		{
			"heading": "the-enforcement-map",
			"content": "Explicit `authorize()` calls"
		},
		{
			"heading": "the-enforcement-map",
			"content": "Each surface uses the same policy source, so there is exactly one definition of \"can a user publish this post\" — not a route copy, a UI copy, and an agent copy that slowly diverge."
		},
		{
			"heading": "generated-model-routes",
			"content": "The most important enforcement point is the one you never write. A model declared with the `permission` option generates five routes — `list/get/create/update/delete` — and every one of them checks `{permission}.{action}` against the policy namespace during the request lifecycle:"
		},
		{
			"heading": "generated-model-routes",
			"content": "`posts` maps to list `posts.read`, get `posts.read`, create `posts.create`, update `posts.update`, and delete `posts.delete`, resolved through the `posts` policy before the handler executes. Because the check lives in the route lifecycle, it composes with every other stage — auth and tenant middleware have already run, so the policy receives a real session and a scoped request."
		},
		{
			"heading": "generated-model-routes",
			"content": "The route lifecycle stage matters for correctness: validation runs before the check, so the policy decides on a validated request; auth runs before it, so `user` is never `null`; and tenant resolution runs before it, so the request already knows whose data it touches. A rejected decision produces a typed error response before the handler body executes."
		},
		{
			"heading": "controller-routes",
			"content": "Hand-written endpoints opt into the same machinery with the `permission` route option. This is how custom actions — anything beyond the four CRUD verbs — get enforced:"
		},
		{
			"heading": "controller-routes",
			"content": "The `publish` ability is a custom action registered in the route manifest; the policy's `case 'publish'` decides it. Wire the same namespace on the model and the controller, and one policy gates both the generated surface and the bespoke one."
		},
		{
			"heading": "studio-screens",
			"content": "Studio respects the same policies without a line of configuration. Actions a user lacks the ability to perform are hidden or disabled on generated CRUD screens — no create button without `create`, no delete without `delete`. Studio derives columns, filters, and forms from the model and gates actions with its policy, so the admin UI can never offer an operation a policy would reject. In v1.x, role matrices generated from policies show administrators exactly who holds which ability, straight from the source of truth."
		},
		{
			"heading": "studio-screens",
			"content": "Studio is the most visible proof of policy purity: the same boolean that rejects a request in the pipeline also hides the button in the UI. There is no second implementation of \"can the user do this\" living in the admin interface."
		},
		{
			"heading": "realtime-channels",
			"content": "Subscription is an access decision too. A channel subscribe is policy-checked before the WebSocket connection receives events, so a user can hold an authenticated session without being able to join a private stream — `channel('chat.{roomId}')` resolves membership through the policy engine rather than manual guard lists."
		},
		{
			"heading": "realtime-channels",
			"content": "The check runs at the handshake, before the connection upgrades, so an unauthorized subscriber is rejected before a stream opens. Per-tenant membership follows the same rule — see Tenant isolation for how channel membership is additionally scoped by tenant."
		},
		{
			"heading": "mcp-tools",
			"content": "Agent surfaces are gated by the same policies as every other surface. When a model's CRUD operations are exposed as MCP tools, each tool runs through per-tool permission checks; custom controller actions exposed as tools carry their `permission` ability. An agent with tool access is bound by exactly the same lines as an API client or a Studio user — no parallel authorization model for machines."
		},
		{
			"heading": "mcp-tools",
			"content": "This is deliberate: the tool resolver and the HTTP route resolve the same policy for the same ability, so an agent cannot reach records a richer permission would forbid. Machines get no special path."
		},
		{
			"heading": "seeders-and-tasks",
			"content": "Background execution has a different nature: there is no request, no route lifecycle, and often no browser. Seeders and tasks therefore enforce explicitly with `await authorize(...)`, which throws a `ForbiddenError` when the current context lacks the ability. Explicit is correct here — silent `false` in a seed would half-provide data, and a task that quietly no-ops can be worse than one that fails loudly."
		},
		{
			"heading": "seeders-and-tasks",
			"content": "The throwing variant is preferred in these surfaces precisely because there is no UI to hide a button in. A background operation that cannot legally proceed should fail loudly, surface in logs, and be retryable — not complete with half its intended effect."
		},
		{
			"heading": "defense-in-depth-ordering",
			"content": "Enforcement is layered, and the layers run in a deliberate order:"
		},
		{
			"heading": "defense-in-depth-ordering",
			"content": "**Authentication** — the session middleware resolves who is making the request; unauthenticated requests are cut off early with `401`."
		},
		{
			"heading": "defense-in-depth-ordering",
			"content": "**Policy checks** — in the route lifecycle, before the handler, via `{permission}.{action}` or the route `permission` option."
		},
		{
			"heading": "defense-in-depth-ordering",
			"content": "**Handler logic** — explicit `ctx.can`/`authorize` for decisions the generic checks do not cover."
		},
		{
			"heading": "defense-in-depth-ordering",
			"content": "**Data-level scoping** — models with a tenant field auto-scope queries, so even a permitted request cannot reach records outside its tenant; `whereCan` (v1.x) applies policy filtering to result sets themselves."
		},
		{
			"heading": "defense-in-depth-ordering",
			"content": "**Surface-level gating** — Studio, channels, and MCP run the same policies for non-HTTP access."
		},
		{
			"heading": "defense-in-depth-ordering",
			"content": "Each layer assumes the ones before it ran. An early layer failing stops the request cheaply; a later layer catching something the earlier ones missed is normal defense-in-depth, not duplication. The framework's contribution is that every layer reads from the same policy source, so the layers reinforce rather than contradict each other."
		},
		{
			"heading": "defense-in-depth-ordering",
			"content": "> \\[!WARNING]\n> Layering is not redundancy to be pruned. Removing the data-level scoping layer because the policy layer \"already passed\" turns a permitted-but-scoped request into a permitted-and-unscoped one. Keep the layers; they enforce orthogonal boundaries."
		},
		{
			"heading": "whats-next",
			"content": "Policies — writing the decisions every surface enforces"
		},
		{
			"heading": "whats-next",
			"content": "Permissions — the strings that name those decisions"
		},
		{
			"heading": "whats-next",
			"content": "Middleware — where auth and policy checks sit in the pipeline"
		},
		{
			"heading": "whats-next",
			"content": "Tenancy — the data-level scope that runs after authorization"
		}
	],
	"headings": [
		{
			"id": "the-enforcement-map",
			"content": "The Enforcement Map"
		},
		{
			"id": "generated-model-routes",
			"content": "Generated Model Routes"
		},
		{
			"id": "controller-routes",
			"content": "Controller Routes"
		},
		{
			"id": "studio-screens",
			"content": "Studio Screens"
		},
		{
			"id": "realtime-channels",
			"content": "Realtime Channels"
		},
		{
			"id": "mcp-tools",
			"content": "MCP Tools"
		},
		{
			"id": "seeders-and-tasks",
			"content": "Seeders and Tasks"
		},
		{
			"id": "defense-in-depth-ordering",
			"content": "Defense-in-Depth Ordering"
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
		url: "#the-enforcement-map",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Enforcement Map" })
	},
	{
		depth: 2,
		url: "#generated-model-routes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generated Model Routes" })
	},
	{
		depth: 2,
		url: "#controller-routes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Controller Routes" })
	},
	{
		depth: 2,
		url: "#studio-screens",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Studio Screens" })
	},
	{
		depth: 2,
		url: "#realtime-channels",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Realtime Channels" })
	},
	{
		depth: 2,
		url: "#mcp-tools",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "MCP Tools" })
	},
	{
		depth: 2,
		url: "#seeders-and-tasks",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Seeders and Tasks" })
	},
	{
		depth: 2,
		url: "#defense-in-depth-ordering",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Defense-in-Depth Ordering" })
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
			"A policy that is never checked is decoration. Kwiva enforces policies at every access surface, so the decision you write once in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			" is executed consistently no matter how a user (or an agent) reaches the data. This page is the map of where checks run and why the order of those checks matters."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The unifying property across every surface is the policy source. Each check resolves through the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			" file, so \"can this user publish this post\" has exactly one answer everywhere. What varies per surface is the mechanism — a route lifecycle hook, a Studio render decision, a channel subscription gate, an explicit ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "authorize()" }),
			" call in a job — never the decision itself."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-enforcement-map",
			children: "The Enforcement Map"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Rule" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generated model routes" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{permission}.{action}" }), " checked in the route lifecycle"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controller routes" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }), " option resolved against the policy"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Studio screens" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Actions hidden or disabled without the ability" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Realtime channels" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Subscribe is policy-checked" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP tools" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Per-tool ability enforcement" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Seeders / tasks" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Explicit ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "authorize()" }),
				" calls"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each surface uses the same policy source, so there is exactly one definition of \"can a user publish this post\" — not a route copy, a UI copy, and an agent copy that slowly diverge." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generated-model-routes",
			children: "Generated Model Routes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The most important enforcement point is the one you never write. A model declared with the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" option generates five routes — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "list/get/create/update/delete" }),
			" — and every one of them checks ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{permission}.{action}" }),
			" against the policy namespace during the request lifecycle:"
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
			title: "generated-model-routes.ts",
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
							children: " ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "..."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }), {"
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
							children: "  timestamps: "
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
							children: "  permission: "
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
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
			" maps to list ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.read" }),
			", get ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.read" }),
			", create ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.create" }),
			", update ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.update" }),
			", and delete ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.delete" }),
			", resolved through the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
			" policy before the handler executes. Because the check lives in the route lifecycle, it composes with every other stage — auth and tenant middleware have already run, so the policy receives a real session and a scoped request."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The route lifecycle stage matters for correctness: validation runs before the check, so the policy decides on a validated request; auth runs before it, so ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user" }),
			" is never ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "null" }),
			"; and tenant resolution runs before it, so the request already knows whose data it touches. A rejected decision produces a typed error response before the handler body executes."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "controller-routes",
			children: "Controller Routes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Hand-written endpoints opt into the same machinery with the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" route option. This is how custom actions — anything beyond the four CRUD verbs — get enforced:"
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
			title: "controller-routes.ts",
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
							children: ", (), { permission: "
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
							children: " }),"
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
						children: "}))"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "publish" }),
			" ability is a custom action registered in the route manifest; the policy's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "case 'publish'" }),
			" decides it. Wire the same namespace on the model and the controller, and one policy gates both the generated surface and the bespoke one."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "studio-screens",
			children: "Studio Screens"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Studio respects the same policies without a line of configuration. Actions a user lacks the ability to perform are hidden or disabled on generated CRUD screens — no create button without ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "create" }),
			", no delete without ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delete" }),
			". Studio derives columns, filters, and forms from the model and gates actions with its policy, so the admin UI can never offer an operation a policy would reject. In v1.x, role matrices generated from policies show administrators exactly who holds which ability, straight from the source of truth."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio is the most visible proof of policy purity: the same boolean that rejects a request in the pipeline also hides the button in the UI. There is no second implementation of \"can the user do this\" living in the admin interface." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "realtime-channels",
			children: "Realtime Channels"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Subscription is an access decision too. A channel subscribe is policy-checked before the WebSocket connection receives events, so a user can hold an authenticated session without being able to join a private stream — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "channel('chat.{roomId}')" }),
			" resolves membership through the policy engine rather than manual guard lists."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The check runs at the handshake, before the connection upgrades, so an unauthorized subscriber is rejected before a stream opens. Per-tenant membership follows the same rule — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Tenant isolation"
			}),
			" for how channel membership is additionally scoped by tenant."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "mcp-tools",
			children: "MCP Tools"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Agent surfaces are gated by the same policies as every other surface. When a model's CRUD operations are exposed as MCP tools, each tool runs through per-tool permission checks; custom controller actions exposed as tools carry their ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" ability. An agent with tool access is bound by exactly the same lines as an API client or a Studio user — no parallel authorization model for machines."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This is deliberate: the tool resolver and the HTTP route resolve the same policy for the same ability, so an agent cannot reach records a richer permission would forbid. Machines get no special path." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "seeders-and-tasks",
			children: "Seeders and Tasks"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Background execution has a different nature: there is no request, no route lifecycle, and often no browser. Seeders and tasks therefore enforce explicitly with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "await authorize(...)" }),
			", which throws a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ForbiddenError" }),
			" when the current context lacks the ability. Explicit is correct here — silent ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "false" }),
			" in a seed would half-provide data, and a task that quietly no-ops can be worse than one that fails loudly."
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
			title: "seeders-and-tasks.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// inside a task or seeder"
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
							children: ", post)   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// throws ForbiddenError on denial"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The throwing variant is preferred in these surfaces precisely because there is no UI to hide a button in. A background operation that cannot legally proceed should fail loudly, surface in logs, and be retryable — not complete with half its intended effect." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "defense-in-depth-ordering",
			children: "Defense-in-Depth Ordering"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Enforcement is layered, and the layers run in a deliberate order:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Authentication" }),
				" — the session middleware resolves who is making the request; unauthenticated requests are cut off early with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "401" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Policy checks" }),
				" — in the route lifecycle, before the handler, via ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{permission}.{action}" }),
				" or the route ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" option."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Handler logic" }),
				" — explicit ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.can" }),
				"/",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "authorize" }),
				" for decisions the generic checks do not cover."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Data-level scoping" }),
				" — models with a tenant field auto-scope queries, so even a permitted request cannot reach records outside its tenant; ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "whereCan" }),
				" (v1.x) applies policy filtering to result sets themselves."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Surface-level gating" }), " — Studio, channels, and MCP run the same policies for non-HTTP access."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each layer assumes the ones before it ran. An early layer failing stops the request cheaply; a later layer catching something the earlier ones missed is normal defense-in-depth, not duplication. The framework's contribution is that every layer reads from the same policy source, so the layers reinforce rather than contradict each other." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!WARNING]\nLayering is not redundancy to be pruned. Removing the data-level scoping layer because the policy layer \"already passed\" turns a permitted-but-scoped request into a permitted-and-unscoped one. Keep the layers; they enforce orthogonal boundaries." }),
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
			}), " — writing the decisions every surface enforces"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/permissions",
				children: "Permissions"
			}), " — the strings that name those decisions"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/middleware",
				children: "Middleware"
			}), " — where auth and policy checks sit in the pipeline"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/scoping",
				children: "Tenancy"
			}), " — the data-level scope that runs after authorization"] }),
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
