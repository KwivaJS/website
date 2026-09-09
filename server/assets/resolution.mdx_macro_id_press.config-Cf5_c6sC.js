import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/tenancy/resolution.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Tenant Resolution",
	"description": "Resolve the tenant per request from domain, path, or header through the tenant middleware, which injects tenant context and storage keys."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nBefore a request can be scoped, the framework must know which tenant it belongs to. Tenant resolution is the answer to that question, and it happens exactly once per request. Whatever mode is configured, resolution terminates in the same thing: a typed `ctx.tenant` supplied to the request context, which every downstream system — query scoping, cache keys, storage paths, queue payloads — then reads.\n\n## The Resolution Pipeline [#the-resolution-pipeline]\n\nResolution runs in the `tenant` middleware. The flow is:\n\n1. The middleware reads the current mode from the tenancy configuration\n2. It extracts the tenant identity from the request — the subdomain, the first path segment, or the `x-tenant-id` header\n3. It looks up the matching tenant record\n4. It injects the tenant into the request context as a typed value\n5. The same tenant flows downstream into storage keys, cache keys, and queue payloads\n\nThe middleware sits in the middleware stack configured in `src/config/app.ts`, alongside the other built-ins such as request id and session. Because middleware is scoped per route or controller when needed, tenant resolution can be applied globally, or restricted to the segments of the app that deal with tenant data.\n\nResolution is timed against the rest of the pipeline: session and tenant resolution together target under 2ms on a warm database or Redis hit. Route-cached responses short-circuit before resolution entirely, so public cached pages never pay for a tenant lookup.\n\n## The Typed Tenant Context [#the-typed-tenant-context]\n\nOnce resolved, the tenant is available on the request context with full type inference:\n\n```ts title=\"the-typed-tenant-context.ts\"\n// ctx.tenant is typed as { id, name, ownerId }\napp.get('/account', async ({ tenant }) => {\n  return tenant  // { id, name, ownerId }\n})\n```\n\nThe typed surface is deliberately small — `id` for scoping, `name` for display, `ownerId` for ownership checks. Policies receive what they need to decide, and queries receive the `id` they need to scope. The context type flows from the tenant model definition, so new fields on the tenant model surface in the context type with zero extra wiring.\n\n## Resolution Strategies in Detail [#resolution-strategies-in-detail]\n\n### Domain mode [#domain-mode]\n\n```plaintext title=\"domain-mode.txt\"\nacme.app.dev  ──►  tenant with slug 'acme'\n```\n\nThe subdomain is the tenant identity. The tenant model carries a unique `slug` for this lookup, and the framework resolves the first subdomain segment against it. This is the default: each customer gets a subdomain, and all requests under it are scoped to that customer.\n\n### Path mode [#path-mode]\n\n```plaintext title=\"path-mode.txt\"\n/t/acme/...  ──►  tenant with slug 'acme'\n```\n\nThe first path segment is the tenant identity. Workspaces on a shared host use this shape, and the path structure keeps tenant context visible in URLs and shareable routes.\n\n### Header mode [#header-mode]\n\n```plaintext title=\"header-mode.txt\"\nx-tenant-id: acme  ──►  tenant identified by header value\n```\n\nAPI clients and internal tools pass the tenant identity explicitly. This mode suits machine-to-machine traffic where hosts and paths carry no tenant meaning, and it pairs naturally with the typed client.\n\n### Fixed mode [#fixed-mode]\n\n```plaintext title=\"fixed-mode.txt\"\nfixed: 'acme'  ──►  every request is tenant 'acme'\n```\n\nA single configured tenant. A single-tenant deployment still gets the full isolation guarantees — scoped storage, tenant-prefixed cache, tenant-aware queueing — without paying resolution cost per request.\n\n### Org mode (v1.x) [#org-mode-v1x]\n\nAuthenticated organization membership resolves to a tenant. The org the user belongs to becomes the tenant, which is a natural fit when organizations and tenants are the same concept in the domain. Combining org mode with auth scopes the tenant to the user's membership — admin in one tenant, standard user in another.\n\n### None mode [#none-mode]\n\n`solo app — no tenant resolution, no scoping`. Mode `none` disables the machinery entirely, giving solo applications zero resolution overhead.\n\n## Once Per Request [#once-per-request]\n\nResolution is a one-shot operation per request. The middleware resolves the tenant once and the result is reused by everything downstream — scoping rules, storage keys, caching, and queue payloads all read from the same context. There is no per-query re-resolution, no repeated lookups inside a handler that already holds the tenant.\n\nThis also means tenant context is stable across internal RPC: the typed client called from a handler inherits the request's tenant, and in-process test clients scope every call against the tenant they were constructed with.\n\n## Lookup Caching [#lookup-caching]\n\nTenant lookups are memoized for the lifetime of the request. The record is fetched once, and the resolved tenant is reused wherever context flows. Across requests, correctness takes precedence over speculative caching: the tenant record is read through the standard data layer at resolution time, and cache scoping is applied to the tenant's derived state rather than to the tenant lookup itself.\n\nIn production, the expectation is the same as the rest of the framework: instances are stateless and interchangeable, so tenant resolution never depends on which instance served the request.\n\n## Lookup Performance [#lookup-performance]\n\nResolution stays fast because the tenant model is shaped for lookup:\n\n* `slug` is unique — the domain and path lookups hit a unique index\n* The tenant record is small (id, name, slug, owner, plan) — a single indexed read\n* Resolution is memoized per request — one lookup regardless of downstream consumers\n\nKeep the tenant model lean and the unique indexes intact, and resolution cost stays in the sub-millisecond range even as the tenant table grows. Indexing applies the same way to the `tenantId` column on scoped models: the injected predicate in every scoped query is only fast when the column it filters on is indexed, which the migration generates automatically.\n\n## Fallback and No-Tenant Behavior [#fallback-and-no-tenant-behavior]\n\nWhat happens when no tenant can be resolved depends on mode and intent:\n\n* **`none` mode** — nothing resolves and nothing is scoped; tenant context is simply absent\n* **`fixed` mode** — every request resolves to the configured tenant, so there is no unknown state\n* **`domain`, `path`, and `header` modes** — a request without a resolvable tenant does not get scoped access; the request does not proceed as an unscoped cross-tenant call\n\nThe safe default is that an unresolvable tenant is a failed resolution, not an anonymous wide-open one. Applications that deliberately expose unscoped routes — such as a public signup endpoint that creates the first tenant — should mount those routes outside the tenant middleware or in a controller that handles the tenantless case explicitly.\n\nMissing tenant context is a **hard failure for tenant-scoped operations**: the data layer raises an integrity error rather than silently running an unscoped query. A tenantless request can never reach scoped data by default; it must be routed around the middleware on purpose and designed to handle the tenantless case.\n\n## Resolution Errors [#resolution-errors]\n\nTenant lookup failures follow the normal error semantics of the framework. Because scoping treats absence conservatively, the practical effect for callers is a clear failure rather than silent data exposure. In tests, resolution behavior is exercised explicitly — see below.\n\n## Testing Resolution [#testing-resolution]\n\nThe test harness drives resolution deterministically:\n\n```ts title=\"testing-resolution.ts\"\nwithApp(async (app) => {\n  const acme = app.asTenant('acme')\n  const client = createTestClient(app, { tenant: acme })\n  // requests are scoped to acme; a cross-tenant call asserts 404\n})\n```\n\n`app.asTenant` selects the tenant, the test client binds to it, and every request through the client resolves to that tenant. This makes resolution behavior — including the cross-tenant 404 rule — a first-class test concern, not an afterthought. The tenancy invariant suite (`kwiva test --tenancy`) runs the same assertions across two tenants end-to-end.\n\n## What's Next [#whats-next]\n\n* [Configuration](/docs/tenancy/configuration) — choosing the resolution mode\n* [Scoping](/docs/tenancy/scoping) — what the resolved tenant applies to every query\n* [Isolation](/docs/tenancy/isolation) — how the tenant flows into storage, cache, and queue\n* [Middleware](/docs/http/middleware) — where the `tenant` middleware sits in the stack\n* [Policies](/docs/authorization/policies) — how the resolved tenant reaches policy checks\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Before a request can be scoped, the framework must know which tenant it belongs to. Tenant resolution is the answer to that question, and it happens exactly once per request. Whatever mode is configured, resolution terminates in the same thing: a typed `ctx.tenant` supplied to the request context, which every downstream system — query scoping, cache keys, storage paths, queue payloads — then reads."
		},
		{
			"heading": "the-resolution-pipeline",
			"content": "Resolution runs in the `tenant` middleware. The flow is:"
		},
		{
			"heading": "the-resolution-pipeline",
			"content": "The middleware reads the current mode from the tenancy configuration"
		},
		{
			"heading": "the-resolution-pipeline",
			"content": "It extracts the tenant identity from the request — the subdomain, the first path segment, or the `x-tenant-id` header"
		},
		{
			"heading": "the-resolution-pipeline",
			"content": "It looks up the matching tenant record"
		},
		{
			"heading": "the-resolution-pipeline",
			"content": "It injects the tenant into the request context as a typed value"
		},
		{
			"heading": "the-resolution-pipeline",
			"content": "The same tenant flows downstream into storage keys, cache keys, and queue payloads"
		},
		{
			"heading": "the-resolution-pipeline",
			"content": "The middleware sits in the middleware stack configured in `src/config/app.ts`, alongside the other built-ins such as request id and session. Because middleware is scoped per route or controller when needed, tenant resolution can be applied globally, or restricted to the segments of the app that deal with tenant data."
		},
		{
			"heading": "the-resolution-pipeline",
			"content": "Resolution is timed against the rest of the pipeline: session and tenant resolution together target under 2ms on a warm database or Redis hit. Route-cached responses short-circuit before resolution entirely, so public cached pages never pay for a tenant lookup."
		},
		{
			"heading": "the-typed-tenant-context",
			"content": "Once resolved, the tenant is available on the request context with full type inference:"
		},
		{
			"heading": "the-typed-tenant-context",
			"content": "The typed surface is deliberately small — `id` for scoping, `name` for display, `ownerId` for ownership checks. Policies receive what they need to decide, and queries receive the `id` they need to scope. The context type flows from the tenant model definition, so new fields on the tenant model surface in the context type with zero extra wiring."
		},
		{
			"heading": "domain-mode",
			"content": "The subdomain is the tenant identity. The tenant model carries a unique `slug` for this lookup, and the framework resolves the first subdomain segment against it. This is the default: each customer gets a subdomain, and all requests under it are scoped to that customer."
		},
		{
			"heading": "path-mode",
			"content": "The first path segment is the tenant identity. Workspaces on a shared host use this shape, and the path structure keeps tenant context visible in URLs and shareable routes."
		},
		{
			"heading": "header-mode",
			"content": "API clients and internal tools pass the tenant identity explicitly. This mode suits machine-to-machine traffic where hosts and paths carry no tenant meaning, and it pairs naturally with the typed client."
		},
		{
			"heading": "fixed-mode",
			"content": "A single configured tenant. A single-tenant deployment still gets the full isolation guarantees — scoped storage, tenant-prefixed cache, tenant-aware queueing — without paying resolution cost per request."
		},
		{
			"heading": "org-mode-v1x",
			"content": "Authenticated organization membership resolves to a tenant. The org the user belongs to becomes the tenant, which is a natural fit when organizations and tenants are the same concept in the domain. Combining org mode with auth scopes the tenant to the user's membership — admin in one tenant, standard user in another."
		},
		{
			"heading": "none-mode",
			"content": "`solo app — no tenant resolution, no scoping`. Mode `none` disables the machinery entirely, giving solo applications zero resolution overhead."
		},
		{
			"heading": "once-per-request",
			"content": "Resolution is a one-shot operation per request. The middleware resolves the tenant once and the result is reused by everything downstream — scoping rules, storage keys, caching, and queue payloads all read from the same context. There is no per-query re-resolution, no repeated lookups inside a handler that already holds the tenant."
		},
		{
			"heading": "once-per-request",
			"content": "This also means tenant context is stable across internal RPC: the typed client called from a handler inherits the request's tenant, and in-process test clients scope every call against the tenant they were constructed with."
		},
		{
			"heading": "lookup-caching",
			"content": "Tenant lookups are memoized for the lifetime of the request. The record is fetched once, and the resolved tenant is reused wherever context flows. Across requests, correctness takes precedence over speculative caching: the tenant record is read through the standard data layer at resolution time, and cache scoping is applied to the tenant's derived state rather than to the tenant lookup itself."
		},
		{
			"heading": "lookup-caching",
			"content": "In production, the expectation is the same as the rest of the framework: instances are stateless and interchangeable, so tenant resolution never depends on which instance served the request."
		},
		{
			"heading": "lookup-performance",
			"content": "Resolution stays fast because the tenant model is shaped for lookup:"
		},
		{
			"heading": "lookup-performance",
			"content": "`slug` is unique — the domain and path lookups hit a unique index"
		},
		{
			"heading": "lookup-performance",
			"content": "The tenant record is small (id, name, slug, owner, plan) — a single indexed read"
		},
		{
			"heading": "lookup-performance",
			"content": "Resolution is memoized per request — one lookup regardless of downstream consumers"
		},
		{
			"heading": "lookup-performance",
			"content": "Keep the tenant model lean and the unique indexes intact, and resolution cost stays in the sub-millisecond range even as the tenant table grows. Indexing applies the same way to the `tenantId` column on scoped models: the injected predicate in every scoped query is only fast when the column it filters on is indexed, which the migration generates automatically."
		},
		{
			"heading": "fallback-and-no-tenant-behavior",
			"content": "What happens when no tenant can be resolved depends on mode and intent:"
		},
		{
			"heading": "fallback-and-no-tenant-behavior",
			"content": "**`none` mode** — nothing resolves and nothing is scoped; tenant context is simply absent"
		},
		{
			"heading": "fallback-and-no-tenant-behavior",
			"content": "**`fixed` mode** — every request resolves to the configured tenant, so there is no unknown state"
		},
		{
			"heading": "fallback-and-no-tenant-behavior",
			"content": "**`domain`, `path`, and `header` modes** — a request without a resolvable tenant does not get scoped access; the request does not proceed as an unscoped cross-tenant call"
		},
		{
			"heading": "fallback-and-no-tenant-behavior",
			"content": "The safe default is that an unresolvable tenant is a failed resolution, not an anonymous wide-open one. Applications that deliberately expose unscoped routes — such as a public signup endpoint that creates the first tenant — should mount those routes outside the tenant middleware or in a controller that handles the tenantless case explicitly."
		},
		{
			"heading": "fallback-and-no-tenant-behavior",
			"content": "Missing tenant context is a **hard failure for tenant-scoped operations**: the data layer raises an integrity error rather than silently running an unscoped query. A tenantless request can never reach scoped data by default; it must be routed around the middleware on purpose and designed to handle the tenantless case."
		},
		{
			"heading": "resolution-errors",
			"content": "Tenant lookup failures follow the normal error semantics of the framework. Because scoping treats absence conservatively, the practical effect for callers is a clear failure rather than silent data exposure. In tests, resolution behavior is exercised explicitly — see below."
		},
		{
			"heading": "testing-resolution",
			"content": "The test harness drives resolution deterministically:"
		},
		{
			"heading": "testing-resolution",
			"content": "`app.asTenant` selects the tenant, the test client binds to it, and every request through the client resolves to that tenant. This makes resolution behavior — including the cross-tenant 404 rule — a first-class test concern, not an afterthought. The tenancy invariant suite (`kwiva test --tenancy`) runs the same assertions across two tenants end-to-end."
		},
		{
			"heading": "whats-next",
			"content": "Configuration — choosing the resolution mode"
		},
		{
			"heading": "whats-next",
			"content": "Scoping — what the resolved tenant applies to every query"
		},
		{
			"heading": "whats-next",
			"content": "Isolation — how the tenant flows into storage, cache, and queue"
		},
		{
			"heading": "whats-next",
			"content": "Middleware — where the `tenant` middleware sits in the stack"
		},
		{
			"heading": "whats-next",
			"content": "Policies — how the resolved tenant reaches policy checks"
		}
	],
	"headings": [
		{
			"id": "the-resolution-pipeline",
			"content": "The Resolution Pipeline"
		},
		{
			"id": "the-typed-tenant-context",
			"content": "The Typed Tenant Context"
		},
		{
			"id": "resolution-strategies-in-detail",
			"content": "Resolution Strategies in Detail"
		},
		{
			"id": "domain-mode",
			"content": "Domain mode"
		},
		{
			"id": "path-mode",
			"content": "Path mode"
		},
		{
			"id": "header-mode",
			"content": "Header mode"
		},
		{
			"id": "fixed-mode",
			"content": "Fixed mode"
		},
		{
			"id": "org-mode-v1x",
			"content": "Org mode (v1.x)"
		},
		{
			"id": "none-mode",
			"content": "None mode"
		},
		{
			"id": "once-per-request",
			"content": "Once Per Request"
		},
		{
			"id": "lookup-caching",
			"content": "Lookup Caching"
		},
		{
			"id": "lookup-performance",
			"content": "Lookup Performance"
		},
		{
			"id": "fallback-and-no-tenant-behavior",
			"content": "Fallback and No-Tenant Behavior"
		},
		{
			"id": "resolution-errors",
			"content": "Resolution Errors"
		},
		{
			"id": "testing-resolution",
			"content": "Testing Resolution"
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
		url: "#the-resolution-pipeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Resolution Pipeline" })
	},
	{
		depth: 2,
		url: "#the-typed-tenant-context",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Typed Tenant Context" })
	},
	{
		depth: 2,
		url: "#resolution-strategies-in-detail",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Resolution Strategies in Detail" })
	},
	{
		depth: 3,
		url: "#domain-mode",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Domain mode" })
	},
	{
		depth: 3,
		url: "#path-mode",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Path mode" })
	},
	{
		depth: 3,
		url: "#header-mode",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Header mode" })
	},
	{
		depth: 3,
		url: "#fixed-mode",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Fixed mode" })
	},
	{
		depth: 3,
		url: "#org-mode-v1x",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Org mode (v1.x)" })
	},
	{
		depth: 3,
		url: "#none-mode",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "None mode" })
	},
	{
		depth: 2,
		url: "#once-per-request",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Once Per Request" })
	},
	{
		depth: 2,
		url: "#lookup-caching",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Lookup Caching" })
	},
	{
		depth: 2,
		url: "#lookup-performance",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Lookup Performance" })
	},
	{
		depth: 2,
		url: "#fallback-and-no-tenant-behavior",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Fallback and No-Tenant Behavior" })
	},
	{
		depth: 2,
		url: "#resolution-errors",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Resolution Errors" })
	},
	{
		depth: 2,
		url: "#testing-resolution",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Testing Resolution" })
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
		h3: "h3",
		li: "li",
		ol: "ol",
		p: "p",
		pre: "pre",
		span: "span",
		strong: "strong",
		ul: "ul",
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Before a request can be scoped, the framework must know which tenant it belongs to. Tenant resolution is the answer to that question, and it happens exactly once per request. Whatever mode is configured, resolution terminates in the same thing: a typed ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.tenant" }),
			" supplied to the request context, which every downstream system — query scoping, cache keys, storage paths, queue payloads — then reads."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-resolution-pipeline",
			children: "The Resolution Pipeline"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Resolution runs in the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenant" }),
			" middleware. The flow is:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The middleware reads the current mode from the tenancy configuration" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"It extracts the tenant identity from the request — the subdomain, the first path segment, or the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-tenant-id" }),
				" header"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "It looks up the matching tenant record" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "It injects the tenant into the request context as a typed value" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The same tenant flows downstream into storage keys, cache keys, and queue payloads" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The middleware sits in the middleware stack configured in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts" }),
			", alongside the other built-ins such as request id and session. Because middleware is scoped per route or controller when needed, tenant resolution can be applied globally, or restricted to the segments of the app that deal with tenant data."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Resolution is timed against the rest of the pipeline: session and tenant resolution together target under 2ms on a warm database or Redis hit. Route-cached responses short-circuit before resolution entirely, so public cached pages never pay for a tenant lookup." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-typed-tenant-context",
			children: "The Typed Tenant Context"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Once resolved, the tenant is available on the request context with full type inference:" }),
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
			title: "the-typed-tenant-context.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// ctx.tenant is typed as { id, name, ownerId }"
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
							children: "app."
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
							children: "'/account'"
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
							children: "tenant"
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
							children: "  return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " tenant  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// { id, name, ownerId }"
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
			"The typed surface is deliberately small — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "id" }),
			" for scoping, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "name" }),
			" for display, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ownerId" }),
			" for ownership checks. Policies receive what they need to decide, and queries receive the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "id" }),
			" they need to scope. The context type flows from the tenant model definition, so new fields on the tenant model surface in the context type with zero extra wiring."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "resolution-strategies-in-detail",
			children: "Resolution Strategies in Detail"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "domain-mode",
			children: "Domain mode"
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
			title: "domain-mode.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "acme.app.dev  ──►  tenant with slug 'acme'" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The subdomain is the tenant identity. The tenant model carries a unique ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "slug" }),
			" for this lookup, and the framework resolves the first subdomain segment against it. This is the default: each customer gets a subdomain, and all requests under it are scoped to that customer."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "path-mode",
			children: "Path mode"
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
			title: "path-mode.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/t/acme/...  ──►  tenant with slug 'acme'" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The first path segment is the tenant identity. Workspaces on a shared host use this shape, and the path structure keeps tenant context visible in URLs and shareable routes." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "header-mode",
			children: "Header mode"
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
			title: "header-mode.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "x-tenant-id: acme  ──►  tenant identified by header value" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "API clients and internal tools pass the tenant identity explicitly. This mode suits machine-to-machine traffic where hosts and paths carry no tenant meaning, and it pairs naturally with the typed client." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "fixed-mode",
			children: "Fixed mode"
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
			title: "fixed-mode.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "fixed: 'acme'  ──►  every request is tenant 'acme'" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A single configured tenant. A single-tenant deployment still gets the full isolation guarantees — scoped storage, tenant-prefixed cache, tenant-aware queueing — without paying resolution cost per request." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "org-mode-v1x",
			children: "Org mode (v1.x)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Authenticated organization membership resolves to a tenant. The org the user belongs to becomes the tenant, which is a natural fit when organizations and tenants are the same concept in the domain. Combining org mode with auth scopes the tenant to the user's membership — admin in one tenant, standard user in another." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "none-mode",
			children: "None mode"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "solo app — no tenant resolution, no scoping" }),
			". Mode ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "none" }),
			" disables the machinery entirely, giving solo applications zero resolution overhead."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "once-per-request",
			children: "Once Per Request"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Resolution is a one-shot operation per request. The middleware resolves the tenant once and the result is reused by everything downstream — scoping rules, storage keys, caching, and queue payloads all read from the same context. There is no per-query re-resolution, no repeated lookups inside a handler that already holds the tenant." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This also means tenant context is stable across internal RPC: the typed client called from a handler inherits the request's tenant, and in-process test clients scope every call against the tenant they were constructed with." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "lookup-caching",
			children: "Lookup Caching"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tenant lookups are memoized for the lifetime of the request. The record is fetched once, and the resolved tenant is reused wherever context flows. Across requests, correctness takes precedence over speculative caching: the tenant record is read through the standard data layer at resolution time, and cache scoping is applied to the tenant's derived state rather than to the tenant lookup itself." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "In production, the expectation is the same as the rest of the framework: instances are stateless and interchangeable, so tenant resolution never depends on which instance served the request." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "lookup-performance",
			children: "Lookup Performance"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Resolution stays fast because the tenant model is shaped for lookup:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "slug" }), " is unique — the domain and path lookups hit a unique index"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The tenant record is small (id, name, slug, owner, plan) — a single indexed read" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Resolution is memoized per request — one lookup regardless of downstream consumers" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Keep the tenant model lean and the unique indexes intact, and resolution cost stays in the sub-millisecond range even as the tenant table grows. Indexing applies the same way to the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
			" column on scoped models: the injected predicate in every scoped query is only fast when the column it filters on is indexed, which the migration generates automatically."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "fallback-and-no-tenant-behavior",
			children: "Fallback and No-Tenant Behavior"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "What happens when no tenant can be resolved depends on mode and intent:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "none" }), " mode"] }), " — nothing resolves and nothing is scoped; tenant context is simply absent"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fixed" }), " mode"] }), " — every request resolves to the configured tenant, so there is no unknown state"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "domain" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "path" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "header" }),
				" modes"
			] }), " — a request without a resolvable tenant does not get scoped access; the request does not proceed as an unscoped cross-tenant call"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The safe default is that an unresolvable tenant is a failed resolution, not an anonymous wide-open one. Applications that deliberately expose unscoped routes — such as a public signup endpoint that creates the first tenant — should mount those routes outside the tenant middleware or in a controller that handles the tenantless case explicitly." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Missing tenant context is a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "hard failure for tenant-scoped operations" }),
			": the data layer raises an integrity error rather than silently running an unscoped query. A tenantless request can never reach scoped data by default; it must be routed around the middleware on purpose and designed to handle the tenantless case."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "resolution-errors",
			children: "Resolution Errors"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tenant lookup failures follow the normal error semantics of the framework. Because scoping treats absence conservatively, the practical effect for callers is a clear failure rather than silent data exposure. In tests, resolution behavior is exercised explicitly — see below." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "testing-resolution",
			children: "Testing Resolution"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The test harness drives resolution deterministically:" }),
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
			title: "testing-resolution.ts",
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
							children: "withApp"
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
							children: "app"
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
							children: "  const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " acme"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " app."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "asTenant"
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
							children: "'acme'"
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
							children: "  const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " client"
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
							children: " createTestClient"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(app, { tenant: acme })"
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
						children: "  // requests are scoped to acme; a cross-tenant call asserts 404"
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
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "app.asTenant" }),
			" selects the tenant, the test client binds to it, and every request through the client resolves to that tenant. This makes resolution behavior — including the cross-tenant 404 rule — a first-class test concern, not an afterthought. The tenancy invariant suite (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test --tenancy" }),
			") runs the same assertions across two tenants end-to-end."
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
				href: "/docs/tenancy/configuration",
				children: "Configuration"
			}), " — choosing the resolution mode"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/scoping",
				children: "Scoping"
			}), " — what the resolved tenant applies to every query"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Isolation"
			}), " — how the tenant flows into storage, cache, and queue"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/middleware",
					children: "Middleware"
				}),
				" — where the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenant" }),
				" middleware sits in the stack"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/policies",
				children: "Policies"
			}), " — how the resolved tenant reaches policy checks"] }),
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
