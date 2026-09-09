import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/http/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "HTTP",
	"description": "The complete HTTP layer — controllers, routes, middleware, guards, validation, errors, uploads, streaming, WebSockets, CORS, and response caching."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nThe HTTP layer is Kwiva's framework-owned request pipeline. Everything that happens between an incoming request and the response that leaves the server — routing, body parsing, validation, authorization, error mapping, caching, streaming, and WebSocket upgrades — is owned and executed by `@kwiva/http`. You describe the surface of your API with a small set of factories, and the framework compiles it into a typed route tree with an end-to-end typed client.\n\nBecause the pipeline is framework-owned rather than vendored from an external server library, its evolution is not coupled to any upstream release. The internal layout of `@kwiva/http` mirrors a proven Web-Standard design: a flat core (`context`, `compose`, `cookies`, `error`, `manifest`, `parse-query`, `formats`, `trace`) plus runtime adapters for `bun`, `web-standard`, and `cloudflare-worker`. That structure keeps the HTTP surface portable across every deployment target while preserving one authoring grammar for app code.\n\n## What the HTTP Layer Includes [#what-the-http-layer-includes]\n\nThe layer is organized around four app-facing factories:\n\n| Factory             | Purpose                               | Location                        |\n| ------------------- | ------------------------------------- | ------------------------------- |\n| `defineController`  | Resource endpoints and custom actions | `src/app/http/controllers/*.ts` |\n| `defineMiddleware`  | Reusable pipeline stages              | `src/app/http/middleware/*.ts`  |\n| `defineServerRoute` | Infrastructure routes and route rules | `src/routes/*.ts`               |\n| `defineTask`        | Background tasks                      | `src/app/tasks/*.ts`            |\n\nControllers declare routes with the full method surface, per-route option schemas, and custom actions. Middleware attaches at precise lifecycle events. Server routes apply engine-grade rules such as redirects, proxies, and caching. Tasks expose the same request pipeline to scheduled and manually invoked work.\n\nAll four factories are discovered by convention. A controller named `posts.ts` in `src/app/http/controllers/` becomes the `posts` namespace, and a middleware named `request-id.ts` becomes the `request-id` stage — no registration list, no wiring step.\n\n## One Grammar [#one-grammar]\n\nLike every app-facing construct in Kwiva, controllers follow the `defineX` convention. A controller is a plain factory — no decorators, no classes:\n\n```ts title=\"src/app/http/controllers/posts.ts\"\n// src/app/http/controllers/posts.ts\nimport { defineController } from '@kwiva/http'\n\nexport default defineController('posts', (c) => ({\n  list: c.get('/', async ({ query }) =>\n    Post.query()\n      .where('status', 'published')\n      .page(query.page ?? 1, 20)\n  ),\n\n  create: c.post('/', async ({ body, session }) =>\n    Post.create({ ...body, authorId: session.user.id })\n  , {\n    body: { title: 'string', body: 'string?' },\n    permission: 'posts.create',\n  }),\n}), {\n  prefix: '/posts',\n  tags: ['posts'],\n})\n```\n\nThe builder `c` exposes `get`, `post`, `put`, `patch`, and `delete` for resources, plus `guard`, `macro`, and `ws` for composition, authorization, and realtime. Every route handler receives a typed context: `body`, `params`, `query`, `headers`, `cookies`, `session`, `tenant`, `store`, `set`, and `error` — all inferred from the route's own schemas.\n\n> \\[!NOTE]\n> Routes are declared declaratively. Handlers run only after parsing, session loading, validation, and authorization have all completed, and every return value is serialized into a response by the pipeline.\n\n## The Request Pipeline [#the-request-pipeline]\n\nEvery request flows through one ordered, 14-step pipeline. The same pipeline serves API routes, rendered pages, WebSocket upgrades, and infrastructure routes:\n\n```plaintext title=\"the-request-pipeline.txt\"\nclient request\n  → adapter normalization\n  → pipeline entry (request ID, trace span, onRequest middleware)\n  → route manifest match\n  → route rules (cache hit → serve + bypass pipeline)\n  → context assembly (parse, cookies, session, tenant, app context)\n  → onTransform\n  → validation\n  → onBeforeHandle (guards)\n  → handler (controller action or SSR render)\n  → onAfterHandle (response shaping, cache tags)\n  → onError (any throw → taxonomy mapping)\n  → onResponse (final headers, span close)\n  → engine writes response\n```\n\nFour ordering guarantees hold across every request:\n\n* Middleware runs in the `src/config/app.ts` stack order, before guards.\n* Guard `beforeHandle` runs after validation, so policies see validated input.\n* Route rules short-circuit before session loading — public cached pages skip auth entirely.\n* Error mapping is the only code that can run after `onResponse`, and it only records span error attributes.\n\nThe pipeline is budgeted to stay cheap at every stage. Example p50 targets for a typical list endpoint: adapter to pipeline entry under 1 ms, session and tenant resolve under 2 ms, validation under 0.5 ms, handler under 5 ms, and a full local API round-trip under 15 ms. Each stage is a trace span, so the waterfall is observable end to end. See [Request Lifecycle](/docs/http/lifecycle) for the complete stage-by-stage reference.\n\n## Typed End to End [#typed-end-to-end]\n\nEvery authored and generated route contributes to the **route manifest** — a typed intermediate representation containing path, method, schemas, response type, permission, and tags. The same manifest drives three outputs:\n\n* `@kwiva/client` — end-to-end typed RPC methods, inferred at the type level with no codegen step\n* OpenAPI 3.1 — served at `/openapi.json`, with an optional Swagger UI at `/docs`\n* `@kwiva/mcp` — model and controller actions exposed as tools\n\nBecause the manifest is a single source of truth, the API contract never drifts from the typed client. The route manifest also feeds Studio screens, so one declaration governs the API, the admin UI, and the agent surface simultaneously.\n\n## Errors and Security [#errors-and-security]\n\nErrors map to a single eight-code taxonomy rendered two ways: JSON for API routes, HTML for pages. `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `VALIDATION`, and `TOO_MANY_REQUESTS` cover the common cases; `INTERNAL_ERROR` catches everything unhandled; `OK` is the success resolution. Every error carries a `requestId` that equals the `x-request-id` header, and the typed client surfaces the taxonomy as a discriminated union. See [Error Handling](/docs/http/errors).\n\nSecurity is wired into the same pipeline. Validation is schema-driven at every input boundary, the `security-headers` middleware applies `x-content-type-options`, `x-frame-options`, `referrer-policy`, HSTS, and a nonce-based CSP by default, and CORS presets are enforced by built-in middleware. See [CORS & Security Headers](/docs/http/cors) and [Security: input validation](/docs/security/input-validation).\n\n## Quick Start [#quick-start]\n\nA controller and its typed client, end to end:\n\n```ts title=\"quick-start.ts\"\nimport { defineController } from '@kwiva/http'\n\nexport default defineController('posts', (c) => ({\n  list: c.get('/', async ({ query }) =>\n    Post.query().page(query.page ?? 1, 20)\n  ),\n\n  publish: c.post('/:id/publish', async ({ params }) => {\n    const post = await Post.findOrFail(params.id)\n    return post.update({ status: 'published', publishedAt: new Date() })\n  }, { permission: 'posts.publish' }),\n}), { prefix: '/posts', tags: ['posts'] })\n```\n\n```ts title=\"quick-start-2.ts\"\nimport { createClient } from '@kwiva/client'\n\nexport const client = createClient({ baseUrl: 'https://api.acme.dev' })\n\nconst { data } = await client.posts.list({ page: 1 })\nawait client.posts.publish('pst_123')\n```\n\nThe generated model endpoints — five deterministic routes per model — and your custom controller actions appear in the same client with the same type guarantees. On the server the client executes in-process with no network round-trip; in the browser it becomes fetch requests authenticated by session cookies.\n\n## Where the HTTP Layer Fits [#where-the-http-layer-fits]\n\n* **API surface** — REST conventions, generated endpoints, and the RPC contract live in the [API](/docs/api) section.\n* **Security** — schema-driven validation and default protections are documented under [Security](/docs/security/input-validation).\n* **Observability** — every pipeline stage is a trace span and every error carries a `requestId`; see [Observability](/docs/observability).\n* **Realtime** — channels and client subscriptions build directly on the WebSocket routes defined here; see [Realtime](/docs/realtime).\n\n## What's Next [#whats-next]\n\n1. [Controllers](/docs/http/controllers) — `defineController` and typed handlers\n2. [Routes & Routing](/docs/http/routes) — paths, params, generated routes, and the manifest\n3. [Middleware](/docs/http/middleware) — the global stack and lifecycle scoping\n4. [Request Lifecycle](/docs/http/lifecycle) — the full pipeline, stage by stage\n5. [Validation](/docs/http/validation) — schema-driven input validation\n6. [Error Handling](/docs/http/errors) — the eight-code taxonomy and typed errors\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The HTTP layer is Kwiva's framework-owned request pipeline. Everything that happens between an incoming request and the response that leaves the server — routing, body parsing, validation, authorization, error mapping, caching, streaming, and WebSocket upgrades — is owned and executed by `@kwiva/http`. You describe the surface of your API with a small set of factories, and the framework compiles it into a typed route tree with an end-to-end typed client."
		},
		{
			"heading": void 0,
			"content": "Because the pipeline is framework-owned rather than vendored from an external server library, its evolution is not coupled to any upstream release. The internal layout of `@kwiva/http` mirrors a proven Web-Standard design: a flat core (`context`, `compose`, `cookies`, `error`, `manifest`, `parse-query`, `formats`, `trace`) plus runtime adapters for `bun`, `web-standard`, and `cloudflare-worker`. That structure keeps the HTTP surface portable across every deployment target while preserving one authoring grammar for app code."
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "The layer is organized around four app-facing factories:"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "Factory"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "Purpose"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "Location"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "`defineController`"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "Resource endpoints and custom actions"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "`src/app/http/controllers/*.ts`"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "`defineMiddleware`"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "Reusable pipeline stages"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "`src/app/http/middleware/*.ts`"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "`defineServerRoute`"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "Infrastructure routes and route rules"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "`src/routes/*.ts`"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "`defineTask`"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "Background tasks"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "`src/app/tasks/*.ts`"
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "Controllers declare routes with the full method surface, per-route option schemas, and custom actions. Middleware attaches at precise lifecycle events. Server routes apply engine-grade rules such as redirects, proxies, and caching. Tasks expose the same request pipeline to scheduled and manually invoked work."
		},
		{
			"heading": "what-the-http-layer-includes",
			"content": "All four factories are discovered by convention. A controller named `posts.ts` in `src/app/http/controllers/` becomes the `posts` namespace, and a middleware named `request-id.ts` becomes the `request-id` stage — no registration list, no wiring step."
		},
		{
			"heading": "one-grammar",
			"content": "Like every app-facing construct in Kwiva, controllers follow the `defineX` convention. A controller is a plain factory — no decorators, no classes:"
		},
		{
			"heading": "one-grammar",
			"content": "The builder `c` exposes `get`, `post`, `put`, `patch`, and `delete` for resources, plus `guard`, `macro`, and `ws` for composition, authorization, and realtime. Every route handler receives a typed context: `body`, `params`, `query`, `headers`, `cookies`, `session`, `tenant`, `store`, `set`, and `error` — all inferred from the route's own schemas."
		},
		{
			"heading": "one-grammar",
			"content": "> \\[!NOTE]\n> Routes are declared declaratively. Handlers run only after parsing, session loading, validation, and authorization have all completed, and every return value is serialized into a response by the pipeline."
		},
		{
			"heading": "the-request-pipeline",
			"content": "Every request flows through one ordered, 14-step pipeline. The same pipeline serves API routes, rendered pages, WebSocket upgrades, and infrastructure routes:"
		},
		{
			"heading": "the-request-pipeline",
			"content": "Four ordering guarantees hold across every request:"
		},
		{
			"heading": "the-request-pipeline",
			"content": "Middleware runs in the `src/config/app.ts` stack order, before guards."
		},
		{
			"heading": "the-request-pipeline",
			"content": "Guard `beforeHandle` runs after validation, so policies see validated input."
		},
		{
			"heading": "the-request-pipeline",
			"content": "Route rules short-circuit before session loading — public cached pages skip auth entirely."
		},
		{
			"heading": "the-request-pipeline",
			"content": "Error mapping is the only code that can run after `onResponse`, and it only records span error attributes."
		},
		{
			"heading": "the-request-pipeline",
			"content": "The pipeline is budgeted to stay cheap at every stage. Example p50 targets for a typical list endpoint: adapter to pipeline entry under 1 ms, session and tenant resolve under 2 ms, validation under 0.5 ms, handler under 5 ms, and a full local API round-trip under 15 ms. Each stage is a trace span, so the waterfall is observable end to end. See Request Lifecycle for the complete stage-by-stage reference."
		},
		{
			"heading": "typed-end-to-end",
			"content": "Every authored and generated route contributes to the **route manifest** — a typed intermediate representation containing path, method, schemas, response type, permission, and tags. The same manifest drives three outputs:"
		},
		{
			"heading": "typed-end-to-end",
			"content": "`@kwiva/client` — end-to-end typed RPC methods, inferred at the type level with no codegen step"
		},
		{
			"heading": "typed-end-to-end",
			"content": "OpenAPI 3.1 — served at `/openapi.json`, with an optional Swagger UI at `/docs`"
		},
		{
			"heading": "typed-end-to-end",
			"content": "`@kwiva/mcp` — model and controller actions exposed as tools"
		},
		{
			"heading": "typed-end-to-end",
			"content": "Because the manifest is a single source of truth, the API contract never drifts from the typed client. The route manifest also feeds Studio screens, so one declaration governs the API, the admin UI, and the agent surface simultaneously."
		},
		{
			"heading": "errors-and-security",
			"content": "Errors map to a single eight-code taxonomy rendered two ways: JSON for API routes, HTML for pages. `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `VALIDATION`, and `TOO_MANY_REQUESTS` cover the common cases; `INTERNAL_ERROR` catches everything unhandled; `OK` is the success resolution. Every error carries a `requestId` that equals the `x-request-id` header, and the typed client surfaces the taxonomy as a discriminated union. See Error Handling."
		},
		{
			"heading": "errors-and-security",
			"content": "Security is wired into the same pipeline. Validation is schema-driven at every input boundary, the `security-headers` middleware applies `x-content-type-options`, `x-frame-options`, `referrer-policy`, HSTS, and a nonce-based CSP by default, and CORS presets are enforced by built-in middleware. See CORS & Security Headers and Security: input validation."
		},
		{
			"heading": "quick-start",
			"content": "A controller and its typed client, end to end:"
		},
		{
			"heading": "quick-start",
			"content": "The generated model endpoints — five deterministic routes per model — and your custom controller actions appear in the same client with the same type guarantees. On the server the client executes in-process with no network round-trip; in the browser it becomes fetch requests authenticated by session cookies."
		},
		{
			"heading": "where-the-http-layer-fits",
			"content": "**API surface** — REST conventions, generated endpoints, and the RPC contract live in the API section."
		},
		{
			"heading": "where-the-http-layer-fits",
			"content": "**Security** — schema-driven validation and default protections are documented under Security."
		},
		{
			"heading": "where-the-http-layer-fits",
			"content": "**Observability** — every pipeline stage is a trace span and every error carries a `requestId`; see Observability."
		},
		{
			"heading": "where-the-http-layer-fits",
			"content": "**Realtime** — channels and client subscriptions build directly on the WebSocket routes defined here; see Realtime."
		},
		{
			"heading": "whats-next",
			"content": "Controllers — `defineController` and typed handlers"
		},
		{
			"heading": "whats-next",
			"content": "Routes & Routing — paths, params, generated routes, and the manifest"
		},
		{
			"heading": "whats-next",
			"content": "Middleware — the global stack and lifecycle scoping"
		},
		{
			"heading": "whats-next",
			"content": "Request Lifecycle — the full pipeline, stage by stage"
		},
		{
			"heading": "whats-next",
			"content": "Validation — schema-driven input validation"
		},
		{
			"heading": "whats-next",
			"content": "Error Handling — the eight-code taxonomy and typed errors"
		}
	],
	"headings": [
		{
			"id": "what-the-http-layer-includes",
			"content": "What the HTTP Layer Includes"
		},
		{
			"id": "one-grammar",
			"content": "One Grammar"
		},
		{
			"id": "the-request-pipeline",
			"content": "The Request Pipeline"
		},
		{
			"id": "typed-end-to-end",
			"content": "Typed End to End"
		},
		{
			"id": "errors-and-security",
			"content": "Errors and Security"
		},
		{
			"id": "quick-start",
			"content": "Quick Start"
		},
		{
			"id": "where-the-http-layer-fits",
			"content": "Where the HTTP Layer Fits"
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
		url: "#what-the-http-layer-includes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What the HTTP Layer Includes" })
	},
	{
		depth: 2,
		url: "#one-grammar",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One Grammar" })
	},
	{
		depth: 2,
		url: "#the-request-pipeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Request Pipeline" })
	},
	{
		depth: 2,
		url: "#typed-end-to-end",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Typed End to End" })
	},
	{
		depth: 2,
		url: "#errors-and-security",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Errors and Security" })
	},
	{
		depth: 2,
		url: "#quick-start",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Quick Start" })
	},
	{
		depth: 2,
		url: "#where-the-http-layer-fits",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where the HTTP Layer Fits" })
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
			"The HTTP layer is Kwiva's framework-owned request pipeline. Everything that happens between an incoming request and the response that leaves the server — routing, body parsing, validation, authorization, error mapping, caching, streaming, and WebSocket upgrades — is owned and executed by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
			". You describe the surface of your API with a small set of factories, and the framework compiles it into a typed route tree with an end-to-end typed client."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the pipeline is framework-owned rather than vendored from an external server library, its evolution is not coupled to any upstream release. The internal layout of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
			" mirrors a proven Web-Standard design: a flat core (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "context" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "compose" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookies" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "error" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "manifest" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "parse-query" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "formats" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "trace" }),
			") plus runtime adapters for ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "web-standard" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cloudflare-worker" }),
			". That structure keeps the HTTP surface portable across every deployment target while preserving one authoring grammar for app code."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-the-http-layer-includes",
			children: "What the HTTP Layer Includes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The layer is organized around four app-facing factories:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Factory" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Location" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Resource endpoints and custom actions" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/controllers/*.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMiddleware" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Reusable pipeline stages" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/middleware/*.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineServerRoute" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Infrastructure routes and route rules" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/routes/*.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Background tasks" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/tasks/*.ts" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Controllers declare routes with the full method surface, per-route option schemas, and custom actions. Middleware attaches at precise lifecycle events. Server routes apply engine-grade rules such as redirects, proxies, and caching. Tasks expose the same request pipeline to scheduled and manually invoked work." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"All four factories are discovered by convention. A controller named ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.ts" }),
			" in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/controllers/" }),
			" becomes the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
			" namespace, and a middleware named ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "request-id.ts" }),
			" becomes the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "request-id" }),
			" stage — no registration list, no wiring step."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "one-grammar",
			children: "One Grammar"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Like every app-facing construct in Kwiva, controllers follow the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" convention. A controller is a plain factory — no decorators, no classes:"
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
			title: "src/app/http/controllers/posts.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/http/controllers/posts.ts"
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
							children: " { defineController } "
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
							children: " '@kwiva/http'"
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
							children: "  list: c."
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
							children: "'/'"
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
							children: "query"
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
							children: "    Post."
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
							children: "()"
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
							children: "      ."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "where"
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
							children: "'status'"
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
							children: "'published'"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "      ."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "page"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(query.page "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "??"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " 1"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "20"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  ),"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  create: c."
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
							children: "body"
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
							children: "    Post."
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
							children: "({ "
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
							children: "body, authorId: session.user.id })"
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
						children: "  , {"
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
							children: "    body: { title: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'string'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", body: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'string?'"
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
							children: "'posts.create'"
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
						children: "}), {"
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
							children: "  prefix: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'/posts'"
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
							children: "  tags: ["
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
							children: "],"
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
			"The builder ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "c" }),
			" exposes ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "get" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "post" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "put" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "patch" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delete" }),
			" for resources, plus ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "guard" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "macro" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ws" }),
			" for composition, authorization, and realtime. Every route handler receives a typed context: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "body" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "query" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "headers" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookies" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenant" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "store" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "set" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "error" }),
			" — all inferred from the route's own schemas."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!NOTE]\nRoutes are declared declaratively. Handlers run only after parsing, session loading, validation, and authorization have all completed, and every return value is serialized into a response by the pipeline." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-request-pipeline",
			children: "The Request Pipeline"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every request flows through one ordered, 14-step pipeline. The same pipeline serves API routes, rendered pages, WebSocket upgrades, and infrastructure routes:" }),
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
			title: "the-request-pipeline.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "client request" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → adapter normalization" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → pipeline entry (request ID, trace span, onRequest middleware)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → route manifest match" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → route rules (cache hit → serve + bypass pipeline)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → context assembly (parse, cookies, session, tenant, app context)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → onTransform" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → validation" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → onBeforeHandle (guards)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → handler (controller action or SSR render)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → onAfterHandle (response shaping, cache tags)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → onError (any throw → taxonomy mapping)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → onResponse (final headers, span close)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → engine writes response" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Four ordering guarantees hold across every request:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Middleware runs in the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts" }),
				" stack order, before guards."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Guard ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeHandle" }),
				" runs after validation, so policies see validated input."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Route rules short-circuit before session loading — public cached pages skip auth entirely." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Error mapping is the only code that can run after ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onResponse" }),
				", and it only records span error attributes."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The pipeline is budgeted to stay cheap at every stage. Example p50 targets for a typical list endpoint: adapter to pipeline entry under 1 ms, session and tenant resolve under 2 ms, validation under 0.5 ms, handler under 5 ms, and a full local API round-trip under 15 ms. Each stage is a trace span, so the waterfall is observable end to end. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Request Lifecycle"
			}),
			" for the complete stage-by-stage reference."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "typed-end-to-end",
			children: "Typed End to End"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every authored and generated route contributes to the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "route manifest" }),
			" — a typed intermediate representation containing path, method, schemas, response type, permission, and tags. The same manifest drives three outputs:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }), " — end-to-end typed RPC methods, inferred at the type level with no codegen step"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"OpenAPI 3.1 — served at ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/openapi.json" }),
				", with an optional Swagger UI at ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/docs" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/mcp" }), " — model and controller actions exposed as tools"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the manifest is a single source of truth, the API contract never drifts from the typed client. The route manifest also feeds Studio screens, so one declaration governs the API, the admin UI, and the agent surface simultaneously." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "errors-and-security",
			children: "Errors and Security"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Errors map to a single eight-code taxonomy rendered two ways: JSON for API routes, HTML for pages. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "UNAUTHORIZED" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "FORBIDDEN" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "NOT_FOUND" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "CONFLICT" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "VALIDATION" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "TOO_MANY_REQUESTS" }),
			" cover the common cases; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "INTERNAL_ERROR" }),
			" catches everything unhandled; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "OK" }),
			" is the success resolution. Every error carries a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
			" that equals the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-request-id" }),
			" header, and the typed client surfaces the taxonomy as a discriminated union. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/errors",
				children: "Error Handling"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Security is wired into the same pipeline. Validation is schema-driven at every input boundary, the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "security-headers" }),
			" middleware applies ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-content-type-options" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-frame-options" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "referrer-policy" }),
			", HSTS, and a nonce-based CSP by default, and CORS presets are enforced by built-in middleware. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/cors",
				children: "CORS & Security Headers"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/input-validation",
				children: "Security: input validation"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "quick-start",
			children: "Quick Start"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A controller and its typed client, end to end:" }),
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
			title: "quick-start.ts",
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
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { defineController } "
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
							children: " '@kwiva/http'"
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
							children: "  list: c."
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
							children: "'/'"
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
							children: "query"
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
							children: "    Post."
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
							children: "page"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(query.page "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "??"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " 1"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "20"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  ),"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  }, { permission: "
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "}), { prefix: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'/posts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", tags: ["
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
							children: "] })"
						})
					]
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
			title: "quick-start-2.ts",
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
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { createClient } "
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
							children: " '@kwiva/client'"
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
							children: " createClient"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ baseUrl: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'https://api.acme.dev'"
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "data"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "="
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
							children: " client.posts."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "list"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ page: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "1"
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " client.posts."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "publish"
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
							children: "'pst_123'"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The generated model endpoints — five deterministic routes per model — and your custom controller actions appear in the same client with the same type guarantees. On the server the client executes in-process with no network round-trip; in the browser it becomes fetch requests authenticated by session cookies." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-the-http-layer-fits",
			children: "Where the HTTP Layer Fits"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "API surface" }),
				" — REST conventions, generated endpoints, and the RPC contract live in the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/api",
					children: "API"
				}),
				" section."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Security" }),
				" — schema-driven validation and default protections are documented under ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/security/input-validation",
					children: "Security"
				}),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Observability" }),
				" — every pipeline stage is a trace span and every error carries a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
				"; see ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/observability",
					children: "Observability"
				}),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Realtime" }),
				" — channels and client subscriptions build directly on the WebSocket routes defined here; see ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/realtime",
					children: "Realtime"
				}),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/controllers",
					children: "Controllers"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
				" and typed handlers"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/routes",
				children: "Routes & Routing"
			}), " — paths, params, generated routes, and the manifest"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/middleware",
				children: "Middleware"
			}), " — the global stack and lifecycle scoping"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Request Lifecycle"
			}), " — the full pipeline, stage by stage"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/validation",
				children: "Validation"
			}), " — schema-driven input validation"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/errors",
				children: "Error Handling"
			}), " — the eight-code taxonomy and typed errors"] }),
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
