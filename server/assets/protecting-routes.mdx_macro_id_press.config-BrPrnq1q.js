import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/auth/protecting-routes.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Protecting Routes",
	"description": "requireAuth middleware, page-level beforeLoad guards, controller scoping, redirects, and layering permission checks."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nAuthentication tells you who the user is; protecting a route is the act of refusing to serve it to someone who is not signed in. Kwiva gives you two primary mechanisms — `requireAuth` middleware for the API side and `beforeLoad` guards for the page side — plus the ability to layer on permission checks once identity is established. Both mechanisms read the same typed `ctx.session`, so the guard code you write is a small, predictable branch on identity rather than bespoke cookie parsing.\n\nRoute protection composes. The auth machinery mounts as middleware in the owned HTTP pipeline and runs at a defined stage — after session load and validation, before the handler — which means every protected surface in the framework shares the same timing, the same error types, and the same ordering guarantees.\n\n## requireAuth Middleware [#requireauth-middleware]\n\nThe `auth` middleware implements `requireAuth` semantics: when no session user exists, the request is rejected in the pipeline before any handler runs.\n\n```ts title=\"requireauth-middleware.ts\"\ndefineMiddleware('auth', async (ctx, next) => {\n  if (!ctx.session.user) return error('UNAUTHORIZED')\n  return next()\n})\n```\n\nThis is the correct shape for every authenticated route: read the typed session, short-circuit with a `401` when it is absent, and otherwise continue. Because middleware composes by name, the same `auth` stage can be applied globally, to a controller, or to a single route using the middleware list.\n\n> \\[!NOTE]\n> The middleware reads `ctx.session.user`. An authenticated but anonymous visitor has no user, so the check correctly rejects them too — a session without an identity is not an authenticated request.\n\n## Scoping, Not Just Wiring [#scoping-not-just-wiring]\n\nBeside the auth middleware there is the `requireAuth` guard you can attach directly to route groups, controllers, and individual handlers through middleware scoping:\n\n* **Global** — the ordered middleware stack in `src/config/app.ts` applies the check to every request. This is the right default for applications with no public surface.\n* **Controller-wide** — the middleware list on a `defineController` protects everything the controller owns. Use this when the controller is entirely authenticated.\n* **Route-level** — individual handlers can add the check, the pattern used for a single admin endpoint inside an otherwise public controller.\n\nControllers reuse the same middleware:\n\n```ts title=\"scoping-not-just-wiring.ts\"\nexport default defineController('posts', (c) => c.guard({\n  middleware: ['auth', 'tenant'],\n}, (g) => ({\n  create: g.post('/', createHandler, { body: CreateBody }),\n  publish: g.post('/:id/publish', publishHandler, { permission: 'posts.publish' }),\n})))\n```\n\nHere `guard` applies `auth` (a signed-in user) and `tenant` (a resolved tenant) to every nested route, and the `publish` action additionally demands the `posts.publish` permission — identity and authorization enforced together, in the right order. Guards nest and compose, and the guarded builder only exposes protected routes.\n\n### The auth macro [#the-auth-macro]\n\nFor route-level toggling, the `auth` macro gives a one-word switch:\n\n```ts title=\"the-auth-macro.ts\"\ndefineApp({\n  macros: {\n    auth: (required: boolean, { beforeHandle }) => {\n      if (required) beforeHandle.push(requireAuth)\n    },\n  },\n})\n\n// per route\nc.get('/:id', handler, { auth: true })\n```\n\nThe macro installs the same `requireAuth` stage into the route's `beforeHandle` bucket, so `{ auth: true }` on a route is exactly equivalent to listing the middleware — just more legible when most routes in a controller are public.\n\n## Page-Level beforeLoad Guards [#page-level-beforeload-guards]\n\nFrontend pages are protected before they render. A `definePage` accepts a `beforeLoad` hook that runs in the load cycle; throwing a redirect there sends the visitor somewhere else without ever rendering the protected content:\n\n```tsx title=\"page-level-beforeload-guards.tsx\"\nexport default definePage({\n  beforeLoad: ({ session }) => {\n    if (!session.user) throw redirect({ to: '/login' })\n  },\n})\n```\n\n`beforeLoad` runs before the page loader, so protected data is never fetched for unauthenticated visitors — there is no wasted query and no flashed content. The same hook also handles permission redirects, giving you a single, predictable enforcement point for page access. Error and pending UI components still apply normally, so an unauthenticated visitor never sees a partial shell.\n\nThe decision runs server-side: the session is read from the cookie during server render, the guard fires if the identity is missing, and only the redirect — never the protected markup — is what streams. The client hydrates the already-correct view rather than correcting it after the fact.\n\n## Server Routes and Infra Endpoints [#server-routes-and-infra-endpoints]\n\nAuth route protection composes across the whole toolchain: `defineServerRoute` infrastructure routes, WebSocket channels, and generated model routes all flow through the same middleware pipeline. A channel subscription can be policy-checked, and a generated API route inherits whatever middleware its controller or the global stack applies.\n\nThe coverage is the point. A route that bypasses the auth stage would be an exception, not a rule, and the framework makes the common case — everything goes through the pipeline — the path of least resistance.\n\n## Redirect Behavior [#redirect-behavior]\n\nThe two layers behave differently by design:\n\n| Surface           | Unauthenticated behavior                                  |\n| ----------------- | --------------------------------------------------------- |\n| API / middleware  | `401` with a typed error body                             |\n| Page `beforeLoad` | Redirect to the target of your choice (commonly `/login`) |\n\nFor API callers, the `401` is the contract — a typed error body your client code can branch on. For browsers, the redirect keeps the experience smooth and leaves a landing page with a sign-in form. Choose the layer by the surface: browsers get navigated, clients get status codes.\n\n## Layering Order Matters [#layering-order-matters]\n\nProtection should be layered, never a single mechanism:\n\n1. **Auth middleware** — rejects unauthenticated requests early.\n2. **Permission checks** — what an authenticated user may do, via the `permission` route option, `ctx.can`, or explicit `authorize`.\n3. **Data-level scoping** — models with a tenant field auto-scope queries so even a valid session cannot reach records outside its tenant.\n\nThe order is deliberate. Identity first, then capability, then scope. Skipping a layer still \"works\" for the happy path but leaves a hole — the framework encourages the full stack through `guard`, global middleware, and policy enforcement.\n\nEach layer assumes the ones before it ran. The auth stage fails fast and cheaply for strangers; the policy stage then applies to the small set of authenticated requests; and tenant scoping finally constrains even a fully authorized request to the data it is allowed to see. Because every layer reads from the same typed context and the same policy source, the layers reinforce rather than contradict each other.\n\n## Readiness Checklist [#readiness-checklist]\n\nBefore exposing a new route, run through the list:\n\n* Is the route behind `auth` middleware, a `guard`, or the `auth` macro?\n* Does it need a `permission` option naming the exact ability?\n* If the route touches scoped models, is the tenant middleware on the stack?\n* For pages, does `beforeLoad` redirect unauthenticated visitors before the loader runs?\n\nIf each answer is yes, the route is protected at the identity, capability, and scope layers.\n\n## What's Next [#whats-next]\n\n* [Authorization](/docs/authorization) — what an authenticated user is allowed to do\n* [Sessions](/docs/auth/sessions) — the typed `ctx.session` the guards read\n* [Middleware](/docs/http/middleware) — building and scoping your own pipeline stages\n* [Guards](/docs/http/guards) — route-group guards and `beforeHandle`\n* [Tenancy](/docs/tenancy/scoping) — enforcing tenant scope after authentication\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Authentication tells you who the user is; protecting a route is the act of refusing to serve it to someone who is not signed in. Kwiva gives you two primary mechanisms — `requireAuth` middleware for the API side and `beforeLoad` guards for the page side — plus the ability to layer on permission checks once identity is established. Both mechanisms read the same typed `ctx.session`, so the guard code you write is a small, predictable branch on identity rather than bespoke cookie parsing."
		},
		{
			"heading": void 0,
			"content": "Route protection composes. The auth machinery mounts as middleware in the owned HTTP pipeline and runs at a defined stage — after session load and validation, before the handler — which means every protected surface in the framework shares the same timing, the same error types, and the same ordering guarantees."
		},
		{
			"heading": "requireauth-middleware",
			"content": "The `auth` middleware implements `requireAuth` semantics: when no session user exists, the request is rejected in the pipeline before any handler runs."
		},
		{
			"heading": "requireauth-middleware",
			"content": "This is the correct shape for every authenticated route: read the typed session, short-circuit with a `401` when it is absent, and otherwise continue. Because middleware composes by name, the same `auth` stage can be applied globally, to a controller, or to a single route using the middleware list."
		},
		{
			"heading": "requireauth-middleware",
			"content": "> \\[!NOTE]\n> The middleware reads `ctx.session.user`. An authenticated but anonymous visitor has no user, so the check correctly rejects them too — a session without an identity is not an authenticated request."
		},
		{
			"heading": "scoping-not-just-wiring",
			"content": "Beside the auth middleware there is the `requireAuth` guard you can attach directly to route groups, controllers, and individual handlers through middleware scoping:"
		},
		{
			"heading": "scoping-not-just-wiring",
			"content": "**Global** — the ordered middleware stack in `src/config/app.ts` applies the check to every request. This is the right default for applications with no public surface."
		},
		{
			"heading": "scoping-not-just-wiring",
			"content": "**Controller-wide** — the middleware list on a `defineController` protects everything the controller owns. Use this when the controller is entirely authenticated."
		},
		{
			"heading": "scoping-not-just-wiring",
			"content": "**Route-level** — individual handlers can add the check, the pattern used for a single admin endpoint inside an otherwise public controller."
		},
		{
			"heading": "scoping-not-just-wiring",
			"content": "Controllers reuse the same middleware:"
		},
		{
			"heading": "scoping-not-just-wiring",
			"content": "Here `guard` applies `auth` (a signed-in user) and `tenant` (a resolved tenant) to every nested route, and the `publish` action additionally demands the `posts.publish` permission — identity and authorization enforced together, in the right order. Guards nest and compose, and the guarded builder only exposes protected routes."
		},
		{
			"heading": "the-auth-macro",
			"content": "For route-level toggling, the `auth` macro gives a one-word switch:"
		},
		{
			"heading": "the-auth-macro",
			"content": "The macro installs the same `requireAuth` stage into the route's `beforeHandle` bucket, so `{ auth: true }` on a route is exactly equivalent to listing the middleware — just more legible when most routes in a controller are public."
		},
		{
			"heading": "page-level-beforeload-guards",
			"content": "Frontend pages are protected before they render. A `definePage` accepts a `beforeLoad` hook that runs in the load cycle; throwing a redirect there sends the visitor somewhere else without ever rendering the protected content:"
		},
		{
			"heading": "page-level-beforeload-guards",
			"content": "`beforeLoad` runs before the page loader, so protected data is never fetched for unauthenticated visitors — there is no wasted query and no flashed content. The same hook also handles permission redirects, giving you a single, predictable enforcement point for page access. Error and pending UI components still apply normally, so an unauthenticated visitor never sees a partial shell."
		},
		{
			"heading": "page-level-beforeload-guards",
			"content": "The decision runs server-side: the session is read from the cookie during server render, the guard fires if the identity is missing, and only the redirect — never the protected markup — is what streams. The client hydrates the already-correct view rather than correcting it after the fact."
		},
		{
			"heading": "server-routes-and-infra-endpoints",
			"content": "Auth route protection composes across the whole toolchain: `defineServerRoute` infrastructure routes, WebSocket channels, and generated model routes all flow through the same middleware pipeline. A channel subscription can be policy-checked, and a generated API route inherits whatever middleware its controller or the global stack applies."
		},
		{
			"heading": "server-routes-and-infra-endpoints",
			"content": "The coverage is the point. A route that bypasses the auth stage would be an exception, not a rule, and the framework makes the common case — everything goes through the pipeline — the path of least resistance."
		},
		{
			"heading": "redirect-behavior",
			"content": "The two layers behave differently by design:"
		},
		{
			"heading": "redirect-behavior",
			"content": "Surface"
		},
		{
			"heading": "redirect-behavior",
			"content": "Unauthenticated behavior"
		},
		{
			"heading": "redirect-behavior",
			"content": "API / middleware"
		},
		{
			"heading": "redirect-behavior",
			"content": "`401` with a typed error body"
		},
		{
			"heading": "redirect-behavior",
			"content": "Page `beforeLoad`"
		},
		{
			"heading": "redirect-behavior",
			"content": "Redirect to the target of your choice (commonly `/login`)"
		},
		{
			"heading": "redirect-behavior",
			"content": "For API callers, the `401` is the contract — a typed error body your client code can branch on. For browsers, the redirect keeps the experience smooth and leaves a landing page with a sign-in form. Choose the layer by the surface: browsers get navigated, clients get status codes."
		},
		{
			"heading": "layering-order-matters",
			"content": "Protection should be layered, never a single mechanism:"
		},
		{
			"heading": "layering-order-matters",
			"content": "**Auth middleware** — rejects unauthenticated requests early."
		},
		{
			"heading": "layering-order-matters",
			"content": "**Permission checks** — what an authenticated user may do, via the `permission` route option, `ctx.can`, or explicit `authorize`."
		},
		{
			"heading": "layering-order-matters",
			"content": "**Data-level scoping** — models with a tenant field auto-scope queries so even a valid session cannot reach records outside its tenant."
		},
		{
			"heading": "layering-order-matters",
			"content": "The order is deliberate. Identity first, then capability, then scope. Skipping a layer still \"works\" for the happy path but leaves a hole — the framework encourages the full stack through `guard`, global middleware, and policy enforcement."
		},
		{
			"heading": "layering-order-matters",
			"content": "Each layer assumes the ones before it ran. The auth stage fails fast and cheaply for strangers; the policy stage then applies to the small set of authenticated requests; and tenant scoping finally constrains even a fully authorized request to the data it is allowed to see. Because every layer reads from the same typed context and the same policy source, the layers reinforce rather than contradict each other."
		},
		{
			"heading": "readiness-checklist",
			"content": "Before exposing a new route, run through the list:"
		},
		{
			"heading": "readiness-checklist",
			"content": "Is the route behind `auth` middleware, a `guard`, or the `auth` macro?"
		},
		{
			"heading": "readiness-checklist",
			"content": "Does it need a `permission` option naming the exact ability?"
		},
		{
			"heading": "readiness-checklist",
			"content": "If the route touches scoped models, is the tenant middleware on the stack?"
		},
		{
			"heading": "readiness-checklist",
			"content": "For pages, does `beforeLoad` redirect unauthenticated visitors before the loader runs?"
		},
		{
			"heading": "readiness-checklist",
			"content": "If each answer is yes, the route is protected at the identity, capability, and scope layers."
		},
		{
			"heading": "whats-next",
			"content": "Authorization — what an authenticated user is allowed to do"
		},
		{
			"heading": "whats-next",
			"content": "Sessions — the typed `ctx.session` the guards read"
		},
		{
			"heading": "whats-next",
			"content": "Middleware — building and scoping your own pipeline stages"
		},
		{
			"heading": "whats-next",
			"content": "Guards — route-group guards and `beforeHandle`"
		},
		{
			"heading": "whats-next",
			"content": "Tenancy — enforcing tenant scope after authentication"
		}
	],
	"headings": [
		{
			"id": "requireauth-middleware",
			"content": "requireAuth Middleware"
		},
		{
			"id": "scoping-not-just-wiring",
			"content": "Scoping, Not Just Wiring"
		},
		{
			"id": "the-auth-macro",
			"content": "The auth macro"
		},
		{
			"id": "page-level-beforeload-guards",
			"content": "Page-Level beforeLoad Guards"
		},
		{
			"id": "server-routes-and-infra-endpoints",
			"content": "Server Routes and Infra Endpoints"
		},
		{
			"id": "redirect-behavior",
			"content": "Redirect Behavior"
		},
		{
			"id": "layering-order-matters",
			"content": "Layering Order Matters"
		},
		{
			"id": "readiness-checklist",
			"content": "Readiness Checklist"
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
		url: "#requireauth-middleware",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "requireAuth Middleware" })
	},
	{
		depth: 2,
		url: "#scoping-not-just-wiring",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Scoping, Not Just Wiring" })
	},
	{
		depth: 3,
		url: "#the-auth-macro",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The auth macro" })
	},
	{
		depth: 2,
		url: "#page-level-beforeload-guards",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Page-Level beforeLoad Guards" })
	},
	{
		depth: 2,
		url: "#server-routes-and-infra-endpoints",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Server Routes and Infra Endpoints" })
	},
	{
		depth: 2,
		url: "#redirect-behavior",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Redirect Behavior" })
	},
	{
		depth: 2,
		url: "#layering-order-matters",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layering Order Matters" })
	},
	{
		depth: 2,
		url: "#readiness-checklist",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Readiness Checklist" })
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
			"Authentication tells you who the user is; protecting a route is the act of refusing to serve it to someone who is not signed in. Kwiva gives you two primary mechanisms — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requireAuth" }),
			" middleware for the API side and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
			" guards for the page side — plus the ability to layer on permission checks once identity is established. Both mechanisms read the same typed ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			", so the guard code you write is a small, predictable branch on identity rather than bespoke cookie parsing."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Route protection composes. The auth machinery mounts as middleware in the owned HTTP pipeline and runs at a defined stage — after session load and validation, before the handler — which means every protected surface in the framework shares the same timing, the same error types, and the same ordering guarantees." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "requireauth-middleware",
			children: "requireAuth Middleware"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }),
			" middleware implements ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requireAuth" }),
			" semantics: when no session user exists, the request is rejected in the pipeline before any handler runs."
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
			title: "requireauth-middleware.ts",
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
							children: "defineMiddleware"
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
							children: "'auth'"
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
							children: " ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "ctx"
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
							children: "next"
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
							children: " ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "!"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "ctx.session.user) "
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " error"
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
							children: "'UNAUTHORIZED'"
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
							children: "  return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " next"
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
			"This is the correct shape for every authenticated route: read the typed session, short-circuit with a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "401" }),
			" when it is absent, and otherwise continue. Because middleware composes by name, the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }),
			" stage can be applied globally, to a controller, or to a single route using the middleware list."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nThe middleware reads ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session.user" }),
				". An authenticated but anonymous visitor has no user, so the check correctly rejects them too — a session without an identity is not an authenticated request."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "scoping-not-just-wiring",
			children: "Scoping, Not Just Wiring"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Beside the auth middleware there is the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requireAuth" }),
			" guard you can attach directly to route groups, controllers, and individual handlers through middleware scoping:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Global" }),
				" — the ordered middleware stack in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts" }),
				" applies the check to every request. This is the right default for applications with no public surface."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Controller-wide" }),
				" — the middleware list on a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
				" protects everything the controller owns. Use this when the controller is entirely authenticated."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Route-level" }), " — individual handlers can add the check, the pattern used for a single admin endpoint inside an otherwise public controller."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Controllers reuse the same middleware:" }),
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
			title: "scoping-not-just-wiring.ts",
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
							children: " c."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "guard"
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
							children: "  middleware: ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'auth'"
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
							children: "'tenant'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "],"
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
							children: "}, ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "g"
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
							children: "  create: g."
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
							children: "'/'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", createHandler, { body: CreateBody }),"
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
							children: "  publish: g."
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
							children: ", publishHandler, { permission: "
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
						children: "})))"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Here ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "guard" }),
			" applies ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }),
			" (a signed-in user) and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenant" }),
			" (a resolved tenant) to every nested route, and the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "publish" }),
			" action additionally demands the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" }),
			" permission — identity and authorization enforced together, in the right order. Guards nest and compose, and the guarded builder only exposes protected routes."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "the-auth-macro",
			children: "The auth macro"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For route-level toggling, the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }),
			" macro gives a one-word switch:"
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
			title: "the-auth-macro.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "defineApp"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "({"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  macros: {"
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
							children: "    auth"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "required"
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
							children: " boolean"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "beforeHandle"
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
							children: "      if"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " (required) beforeHandle."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "push"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(requireAuth)"
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
						children: "    },"
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
						children: "// per route"
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
							children: "c."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "get"
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
							children: "'/:id'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", handler, { auth: "
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
							children: " })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The macro installs the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requireAuth" }),
			" stage into the route's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeHandle" }),
			" bucket, so ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ auth: true }" }),
			" on a route is exactly equivalent to listing the middleware — just more legible when most routes in a controller are public."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "page-level-beforeload-guards",
			children: "Page-Level beforeLoad Guards"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Frontend pages are protected before they render. A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			" accepts a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
			" hook that runs in the load cycle; throwing a redirect there sends the visitor somewhere else without ever rendering the protected content:"
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
			title: "page-level-beforeload-guards.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
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
							children: " definePage"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  beforeLoad"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "session"
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
							children: "    if"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "!"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "session.user) "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "throw"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " redirect"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ to: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'/login'"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }), " runs before the page loader, so protected data is never fetched for unauthenticated visitors — there is no wasted query and no flashed content. The same hook also handles permission redirects, giving you a single, predictable enforcement point for page access. Error and pending UI components still apply normally, so an unauthenticated visitor never sees a partial shell."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The decision runs server-side: the session is read from the cookie during server render, the guard fires if the identity is missing, and only the redirect — never the protected markup — is what streams. The client hydrates the already-correct view rather than correcting it after the fact." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "server-routes-and-infra-endpoints",
			children: "Server Routes and Infra Endpoints"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Auth route protection composes across the whole toolchain: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineServerRoute" }),
			" infrastructure routes, WebSocket channels, and generated model routes all flow through the same middleware pipeline. A channel subscription can be policy-checked, and a generated API route inherits whatever middleware its controller or the global stack applies."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The coverage is the point. A route that bypasses the auth stage would be an exception, not a rule, and the framework makes the common case — everything goes through the pipeline — the path of least resistance." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "redirect-behavior",
			children: "Redirect Behavior"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The two layers behave differently by design:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Unauthenticated behavior" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API / middleware" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "401" }), " with a typed error body"] })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Page ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
			"Redirect to the target of your choice (commonly ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/login" }),
			")"
		] })] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For API callers, the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "401" }),
			" is the contract — a typed error body your client code can branch on. For browsers, the redirect keeps the experience smooth and leaves a landing page with a sign-in form. Choose the layer by the surface: browsers get navigated, clients get status codes."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layering-order-matters",
			children: "Layering Order Matters"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Protection should be layered, never a single mechanism:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Auth middleware" }), " — rejects unauthenticated requests early."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Permission checks" }),
				" — what an authenticated user may do, via the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" route option, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.can" }),
				", or explicit ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "authorize" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Data-level scoping" }), " — models with a tenant field auto-scope queries so even a valid session cannot reach records outside its tenant."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The order is deliberate. Identity first, then capability, then scope. Skipping a layer still \"works\" for the happy path but leaves a hole — the framework encourages the full stack through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "guard" }),
			", global middleware, and policy enforcement."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each layer assumes the ones before it ran. The auth stage fails fast and cheaply for strangers; the policy stage then applies to the small set of authenticated requests; and tenant scoping finally constrains even a fully authorized request to the data it is allowed to see. Because every layer reads from the same typed context and the same policy source, the layers reinforce rather than contradict each other." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "readiness-checklist",
			children: "Readiness Checklist"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Before exposing a new route, run through the list:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Is the route behind ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }),
				" middleware, a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "guard" }),
				", or the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }),
				" macro?"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Does it need a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" option naming the exact ability?"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "If the route touches scoped models, is the tenant middleware on the stack?" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"For pages, does ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
				" redirect unauthenticated visitors before the loader runs?"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "If each answer is yes, the route is protected at the identity, capability, and scope layers." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization",
				children: "Authorization"
			}), " — what an authenticated user is allowed to do"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/auth/sessions",
					children: "Sessions"
				}),
				" — the typed ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
				" the guards read"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/middleware",
				children: "Middleware"
			}), " — building and scoping your own pipeline stages"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/guards",
					children: "Guards"
				}),
				" — route-group guards and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeHandle" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/scoping",
				children: "Tenancy"
			}), " — enforcing tenant scope after authentication"] }),
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
