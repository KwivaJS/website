import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/http/routes.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Routes & Routing",
	"description": "URL conventions, route handlers, params, schema options, the route manifest, server routes, and versioning."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nRouting maps incoming requests to controller actions. In Kwiva every route is declared in one of three places: generated model routes, authored controller routes, or infrastructure-level server routes. All three compile into a single typed route manifest, and the manifest is the only source the typed client, OpenAPI, and MCP tools read from.\n\nBecause every route — generated or authored — becomes a manifest entry, the behavior you can rely on is uniform: parsing, validation, authorization, error mapping, and response serialization behave identically whether the path was produced by `defineModel`, written with `defineController`, or applied as a server rule.\n\n## URL Conventions [#url-conventions]\n\n```plaintext title=\"url-conventions.txt\"\n/api                        # API prefix (src/config/api.ts)\n/api/{model}                # generated → /api/posts\n/api/{model}/:id            # single resource\n/api/{model}/:id/{action}   # custom, controller-defined\n/api/{controller}/...       # controller routes under prefix\n/openapi.json               # OpenAPI 3.1 spec\n/docs                       # Swagger UI (optional)\n/mcp                        # MCP endpoint (optional)\n/healthz · /readyz           # health checks\n```\n\nNaming is enforced by convention: lowercase plural models, kebab-case custom segments, and no verbs in paths — actions on a resource are expressed as custom routes, not verbs.\n\n## Route Handlers [#route-handlers]\n\nControllers declare routes via the builder methods `get`, `post`, `put`, `patch`, and `delete`, each taking a path, a handler, and an optional schema:\n\n```ts title=\"route-handlers.ts\"\nc.get('/:id', async ({ params }) => Post.findOrFail(params.id))\n\nc.post('/', async ({ body, session }) =>\n  Post.create({ ...body, authorId: session.user.id })\n, {\n  body: { title: 'string', body: 'string?' },\n  permission: 'posts.create',\n})\n```\n\nThe method determines the HTTP verb, the handler produces the response, and the option object narrows the request before the handler runs. `put` and `patch` are distinct: `put` sends a complete representation, while `patch` is the partial-update convention used by the generated model routes.\n\n## Paths and Params [#paths-and-params]\n\nPaths use `:param` segments. Params are parsed before the handler runs and typed from the route schema:\n\n```ts title=\"paths-and-params.ts\"\nc.patch('/posts/:id', async ({ params, body }) => {\n  const post = await Post.findOrFail(params.id)\n  return post.update(body)\n}, {\n  params: { id: 'string' },\n  body: { title: 'string?', body: 'string?' },\n})\n```\n\nIf a requested param fails validation, the route short-circuits with a validation error before the handler is ever called. Unknown params in a declared schema reject the request; undeclared params are ignored. Params are always strings at runtime — a schema that parses them, such as `{ id: 'number' }`, runs the value through the same validation runtime as body and query.\n\n> \\[!NOTE]\n> Path matching is exact per segment. A route declared as `/posts/:id` matches `/posts/1` but not `/posts/1/edit` — the segments are fixed. Custom actions occupy their own path with their own segments.\n\n## Schema Options [#schema-options]\n\nEvery route can validate any subset of the request in its option object:\n\n| Option    | Validates               |\n| --------- | ----------------------- |\n| `body`    | Request body            |\n| `query`   | Query-string parameters |\n| `params`  | Path parameters         |\n| `headers` | Request headers         |\n| `cookies` | Request cookies         |\n\nAll routes are validated by the same schema-driven validation runtime used by models, jobs, and channels. See [Validation](/docs/http/validation).\n\n## Generated Model Routes [#generated-model-routes]\n\nEach model contributes exactly five deterministic routes. This shape is stable so documentation and tooling can rely on it:\n\n| Method   | Path             | Request                                          | Response                                |\n| -------- | ---------------- | ------------------------------------------------ | --------------------------------------- |\n| `GET`    | `/api/posts`     | `where`, `page`, `limit`, `orderBy`, `with`, `q` | `` `{ data, total, page, lastPage }` `` |\n| `GET`    | `/api/posts/:id` | —                                                | `Post`                                  |\n| `POST`   | `/api/posts`     | validated body                                   | `Post` (201)                            |\n| `PATCH`  | `/api/posts/:id` | validated partial body                           | `Post`                                  |\n| `DELETE` | `/api/posts/:id` | —                                                | 204                                     |\n\nGenerated routes are enforced at the model level:\n\n* `where` is schema-checked against the model — unknown fields return a 422.\n* `with` accepts only declared relations.\n* Each route requires the policy matching its operation, for example `posts.read` and `posts.update`, unless `permission` is disabled for the model.\n\nBecause the five routes derive from the model's field DSL, changing a model changes the schemas, the responses, and the client signatures of every generated route together. See [Generated Endpoints](/docs/api/generated-endpoints).\n\n## Route Manifest [#route-manifest]\n\nEvery route — generated or authored — contributes an entry to the route manifest: path, method, schemas, response type, permission, and tags. The manifest is rendered once at boot and feeds three consumers:\n\n* `@kwiva/client` — typed RPC methods inferred at the type level, zero codegen\n* OpenAPI 3.1 — served at `/openapi.json` with an optional Swagger UI at `/docs`\n* `@kwiva/mcp` — controller and model routes exposed as agent-callable tools\n\nBecause generation happens from one intermediate representation, the client, the spec, and the tools can never drift from the routes you declared. The same entries drive Studio screens, so a route you add appears in the admin UI and the agent surface without further wiring. See [API: OpenAPI](/docs/api/openapi) and [Studio](/docs/studio).\n\n## Server Routes [#server-routes]\n\n`defineServerRoute` adds infrastructure-level routes and rules outside the controller surface. Server routes live in `src/routes/*.ts` and are the place for redirects, proxies, caching rules, and engine-level controls:\n\n```ts title=\"src/routes/rules.ts\"\n// src/routes/rules.ts\nimport { defineServerRoute } from '@kwiva/http'\n\nexport default [\n  defineServerRoute('/legacy/**',  { redirect: { to: '/new/**', status: 308 } }),\n  defineServerRoute('/api/**',     { cors: true, rateLimit: { max: 600, per: 60 } }),\n  defineServerRoute('/proxy/img',  { proxy: 'https://img.acme.dev/**' }),\n  defineServerRoute('/healthz',    { handler: () => new Response('ok') }),\n]\n```\n\nThe full rule surface is available:\n\n| Rule        | Effect                                  |\n| ----------- | --------------------------------------- |\n| `cache`     | Cache whole responses for a TTL         |\n| `swr`       | Stale-while-revalidate refresh          |\n| `isr`       | Regenerate a static page on an interval |\n| `static`    | Build-time output                       |\n| `prerender` | Crawled and rendered at build time      |\n| `redirect`  | Permanent or temporary redirects        |\n| `proxy`     | Reverse-proxy matched paths             |\n| `headers`   | Attach arbitrary response headers       |\n| `cors`      | Apply or override the CORS preset       |\n| `rateLimit` | Enforce per-path request limits         |\n\nRules are applied before the request context is assembled, so cached public routes skip session loading entirely. See [Response Caching](/docs/http/caching) and [CORS & Security Headers](/docs/http/cors).\n\n## Groups and Prefixes [#groups-and-prefixes]\n\nControllers mount under a prefix, which composes with the API prefix configured in `src/config/api.ts`. Multiple controllers can share a prefix by each declaring it, and guards provide the nesting model — every route inside a guard inherits its middleware and checks. See [Controllers](/docs/http/controllers) and [Guards](/docs/http/guards).\n\n## Versioning [#versioning]\n\nURL versioning is configured in `src/config/api.ts`:\n\n```ts title=\"versioning.ts\"\nexport default defineConfig('api', {\n  defaults: {\n    versioning: { strategy: 'url', default: 'v1' },\n  },\n})\n```\n\nWith the `url` strategy, routes mount under `/api/v1/...`. Breaking changes require a new version; deprecation signals can be attached to routes via route rules and are carried through to the OpenAPI output. The typed client targets the configured version automatically, so application code never hard-codes the version segment.\n\n## Health Checks [#health-checks]\n\n`/healthz` and `/readyz` are provided by server routes. The former is the liveness probe — the process is up — while the latter reports readiness, such as database and queue connectivity. Health responses are kept tiny and uncached so orchestrators get an accurate signal. See [Getting Started: configuration](/docs/getting-started/configuration) for wiring health routes into deployments.\n\n## What's Next [#whats-next]\n\n1. [Controllers](/docs/http/controllers) — declaring routes with typed handlers\n2. [API: Generated endpoints](/docs/api/generated-endpoints) — the five-model-route contract\n3. [API: RPC client](/docs/api/rpc) — consuming the manifest from the client\n4. [API: OpenAPI](/docs/api/openapi) — the spec rendered from the manifest\n5. [Middleware](/docs/http/middleware) — pipeline stages that run around routing\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Routing maps incoming requests to controller actions. In Kwiva every route is declared in one of three places: generated model routes, authored controller routes, or infrastructure-level server routes. All three compile into a single typed route manifest, and the manifest is the only source the typed client, OpenAPI, and MCP tools read from."
		},
		{
			"heading": void 0,
			"content": "Because every route — generated or authored — becomes a manifest entry, the behavior you can rely on is uniform: parsing, validation, authorization, error mapping, and response serialization behave identically whether the path was produced by `defineModel`, written with `defineController`, or applied as a server rule."
		},
		{
			"heading": "url-conventions",
			"content": "Naming is enforced by convention: lowercase plural models, kebab-case custom segments, and no verbs in paths — actions on a resource are expressed as custom routes, not verbs."
		},
		{
			"heading": "route-handlers",
			"content": "Controllers declare routes via the builder methods `get`, `post`, `put`, `patch`, and `delete`, each taking a path, a handler, and an optional schema:"
		},
		{
			"heading": "route-handlers",
			"content": "The method determines the HTTP verb, the handler produces the response, and the option object narrows the request before the handler runs. `put` and `patch` are distinct: `put` sends a complete representation, while `patch` is the partial-update convention used by the generated model routes."
		},
		{
			"heading": "paths-and-params",
			"content": "Paths use `:param` segments. Params are parsed before the handler runs and typed from the route schema:"
		},
		{
			"heading": "paths-and-params",
			"content": "If a requested param fails validation, the route short-circuits with a validation error before the handler is ever called. Unknown params in a declared schema reject the request; undeclared params are ignored. Params are always strings at runtime — a schema that parses them, such as `{ id: 'number' }`, runs the value through the same validation runtime as body and query."
		},
		{
			"heading": "paths-and-params",
			"content": "> \\[!NOTE]\n> Path matching is exact per segment. A route declared as `/posts/:id` matches `/posts/1` but not `/posts/1/edit` — the segments are fixed. Custom actions occupy their own path with their own segments."
		},
		{
			"heading": "schema-options",
			"content": "Every route can validate any subset of the request in its option object:"
		},
		{
			"heading": "schema-options",
			"content": "Option"
		},
		{
			"heading": "schema-options",
			"content": "Validates"
		},
		{
			"heading": "schema-options",
			"content": "`body`"
		},
		{
			"heading": "schema-options",
			"content": "Request body"
		},
		{
			"heading": "schema-options",
			"content": "`query`"
		},
		{
			"heading": "schema-options",
			"content": "Query-string parameters"
		},
		{
			"heading": "schema-options",
			"content": "`params`"
		},
		{
			"heading": "schema-options",
			"content": "Path parameters"
		},
		{
			"heading": "schema-options",
			"content": "`headers`"
		},
		{
			"heading": "schema-options",
			"content": "Request headers"
		},
		{
			"heading": "schema-options",
			"content": "`cookies`"
		},
		{
			"heading": "schema-options",
			"content": "Request cookies"
		},
		{
			"heading": "schema-options",
			"content": "All routes are validated by the same schema-driven validation runtime used by models, jobs, and channels. See Validation."
		},
		{
			"heading": "generated-model-routes",
			"content": "Each model contributes exactly five deterministic routes. This shape is stable so documentation and tooling can rely on it:"
		},
		{
			"heading": "generated-model-routes",
			"content": "Method"
		},
		{
			"heading": "generated-model-routes",
			"content": "Path"
		},
		{
			"heading": "generated-model-routes",
			"content": "Request"
		},
		{
			"heading": "generated-model-routes",
			"content": "Response"
		},
		{
			"heading": "generated-model-routes",
			"content": "`GET`"
		},
		{
			"heading": "generated-model-routes",
			"content": "`/api/posts`"
		},
		{
			"heading": "generated-model-routes",
			"content": "`where`, `page`, `limit`, `orderBy`, `with`, `q`"
		},
		{
			"heading": "generated-model-routes",
			"content": "`` `{ data, total, page, lastPage }` ``"
		},
		{
			"heading": "generated-model-routes",
			"content": "`GET`"
		},
		{
			"heading": "generated-model-routes",
			"content": "`/api/posts/:id`"
		},
		{
			"heading": "generated-model-routes",
			"content": "—"
		},
		{
			"heading": "generated-model-routes",
			"content": "`Post`"
		},
		{
			"heading": "generated-model-routes",
			"content": "`POST`"
		},
		{
			"heading": "generated-model-routes",
			"content": "`/api/posts`"
		},
		{
			"heading": "generated-model-routes",
			"content": "validated body"
		},
		{
			"heading": "generated-model-routes",
			"content": "`Post` (201)"
		},
		{
			"heading": "generated-model-routes",
			"content": "`PATCH`"
		},
		{
			"heading": "generated-model-routes",
			"content": "`/api/posts/:id`"
		},
		{
			"heading": "generated-model-routes",
			"content": "validated partial body"
		},
		{
			"heading": "generated-model-routes",
			"content": "`Post`"
		},
		{
			"heading": "generated-model-routes",
			"content": "`DELETE`"
		},
		{
			"heading": "generated-model-routes",
			"content": "`/api/posts/:id`"
		},
		{
			"heading": "generated-model-routes",
			"content": "—"
		},
		{
			"heading": "generated-model-routes",
			"content": "204"
		},
		{
			"heading": "generated-model-routes",
			"content": "Generated routes are enforced at the model level:"
		},
		{
			"heading": "generated-model-routes",
			"content": "`where` is schema-checked against the model — unknown fields return a 422."
		},
		{
			"heading": "generated-model-routes",
			"content": "`with` accepts only declared relations."
		},
		{
			"heading": "generated-model-routes",
			"content": "Each route requires the policy matching its operation, for example `posts.read` and `posts.update`, unless `permission` is disabled for the model."
		},
		{
			"heading": "generated-model-routes",
			"content": "Because the five routes derive from the model's field DSL, changing a model changes the schemas, the responses, and the client signatures of every generated route together. See Generated Endpoints."
		},
		{
			"heading": "route-manifest",
			"content": "Every route — generated or authored — contributes an entry to the route manifest: path, method, schemas, response type, permission, and tags. The manifest is rendered once at boot and feeds three consumers:"
		},
		{
			"heading": "route-manifest",
			"content": "`@kwiva/client` — typed RPC methods inferred at the type level, zero codegen"
		},
		{
			"heading": "route-manifest",
			"content": "OpenAPI 3.1 — served at `/openapi.json` with an optional Swagger UI at `/docs`"
		},
		{
			"heading": "route-manifest",
			"content": "`@kwiva/mcp` — controller and model routes exposed as agent-callable tools"
		},
		{
			"heading": "route-manifest",
			"content": "Because generation happens from one intermediate representation, the client, the spec, and the tools can never drift from the routes you declared. The same entries drive Studio screens, so a route you add appears in the admin UI and the agent surface without further wiring. See API: OpenAPI and Studio."
		},
		{
			"heading": "server-routes",
			"content": "`defineServerRoute` adds infrastructure-level routes and rules outside the controller surface. Server routes live in `src/routes/*.ts` and are the place for redirects, proxies, caching rules, and engine-level controls:"
		},
		{
			"heading": "server-routes",
			"content": "The full rule surface is available:"
		},
		{
			"heading": "server-routes",
			"content": "Rule"
		},
		{
			"heading": "server-routes",
			"content": "Effect"
		},
		{
			"heading": "server-routes",
			"content": "`cache`"
		},
		{
			"heading": "server-routes",
			"content": "Cache whole responses for a TTL"
		},
		{
			"heading": "server-routes",
			"content": "`swr`"
		},
		{
			"heading": "server-routes",
			"content": "Stale-while-revalidate refresh"
		},
		{
			"heading": "server-routes",
			"content": "`isr`"
		},
		{
			"heading": "server-routes",
			"content": "Regenerate a static page on an interval"
		},
		{
			"heading": "server-routes",
			"content": "`static`"
		},
		{
			"heading": "server-routes",
			"content": "Build-time output"
		},
		{
			"heading": "server-routes",
			"content": "`prerender`"
		},
		{
			"heading": "server-routes",
			"content": "Crawled and rendered at build time"
		},
		{
			"heading": "server-routes",
			"content": "`redirect`"
		},
		{
			"heading": "server-routes",
			"content": "Permanent or temporary redirects"
		},
		{
			"heading": "server-routes",
			"content": "`proxy`"
		},
		{
			"heading": "server-routes",
			"content": "Reverse-proxy matched paths"
		},
		{
			"heading": "server-routes",
			"content": "`headers`"
		},
		{
			"heading": "server-routes",
			"content": "Attach arbitrary response headers"
		},
		{
			"heading": "server-routes",
			"content": "`cors`"
		},
		{
			"heading": "server-routes",
			"content": "Apply or override the CORS preset"
		},
		{
			"heading": "server-routes",
			"content": "`rateLimit`"
		},
		{
			"heading": "server-routes",
			"content": "Enforce per-path request limits"
		},
		{
			"heading": "server-routes",
			"content": "Rules are applied before the request context is assembled, so cached public routes skip session loading entirely. See Response Caching and CORS & Security Headers."
		},
		{
			"heading": "groups-and-prefixes",
			"content": "Controllers mount under a prefix, which composes with the API prefix configured in `src/config/api.ts`. Multiple controllers can share a prefix by each declaring it, and guards provide the nesting model — every route inside a guard inherits its middleware and checks. See Controllers and Guards."
		},
		{
			"heading": "versioning",
			"content": "URL versioning is configured in `src/config/api.ts`:"
		},
		{
			"heading": "versioning",
			"content": "With the `url` strategy, routes mount under `/api/v1/...`. Breaking changes require a new version; deprecation signals can be attached to routes via route rules and are carried through to the OpenAPI output. The typed client targets the configured version automatically, so application code never hard-codes the version segment."
		},
		{
			"heading": "health-checks",
			"content": "`/healthz` and `/readyz` are provided by server routes. The former is the liveness probe — the process is up — while the latter reports readiness, such as database and queue connectivity. Health responses are kept tiny and uncached so orchestrators get an accurate signal. See Getting Started: configuration for wiring health routes into deployments."
		},
		{
			"heading": "whats-next",
			"content": "Controllers — declaring routes with typed handlers"
		},
		{
			"heading": "whats-next",
			"content": "API: Generated endpoints — the five-model-route contract"
		},
		{
			"heading": "whats-next",
			"content": "API: RPC client — consuming the manifest from the client"
		},
		{
			"heading": "whats-next",
			"content": "API: OpenAPI — the spec rendered from the manifest"
		},
		{
			"heading": "whats-next",
			"content": "Middleware — pipeline stages that run around routing"
		}
	],
	"headings": [
		{
			"id": "url-conventions",
			"content": "URL Conventions"
		},
		{
			"id": "route-handlers",
			"content": "Route Handlers"
		},
		{
			"id": "paths-and-params",
			"content": "Paths and Params"
		},
		{
			"id": "schema-options",
			"content": "Schema Options"
		},
		{
			"id": "generated-model-routes",
			"content": "Generated Model Routes"
		},
		{
			"id": "route-manifest",
			"content": "Route Manifest"
		},
		{
			"id": "server-routes",
			"content": "Server Routes"
		},
		{
			"id": "groups-and-prefixes",
			"content": "Groups and Prefixes"
		},
		{
			"id": "versioning",
			"content": "Versioning"
		},
		{
			"id": "health-checks",
			"content": "Health Checks"
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
		url: "#url-conventions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "URL Conventions" })
	},
	{
		depth: 2,
		url: "#route-handlers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Route Handlers" })
	},
	{
		depth: 2,
		url: "#paths-and-params",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Paths and Params" })
	},
	{
		depth: 2,
		url: "#schema-options",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Schema Options" })
	},
	{
		depth: 2,
		url: "#generated-model-routes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generated Model Routes" })
	},
	{
		depth: 2,
		url: "#route-manifest",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Route Manifest" })
	},
	{
		depth: 2,
		url: "#server-routes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Server Routes" })
	},
	{
		depth: 2,
		url: "#groups-and-prefixes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Groups and Prefixes" })
	},
	{
		depth: 2,
		url: "#versioning",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Versioning" })
	},
	{
		depth: 2,
		url: "#health-checks",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Health Checks" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Routing maps incoming requests to controller actions. In Kwiva every route is declared in one of three places: generated model routes, authored controller routes, or infrastructure-level server routes. All three compile into a single typed route manifest, and the manifest is the only source the typed client, OpenAPI, and MCP tools read from." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because every route — generated or authored — becomes a manifest entry, the behavior you can rely on is uniform: parsing, validation, authorization, error mapping, and response serialization behave identically whether the path was produced by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			", written with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
			", or applied as a server rule."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "url-conventions",
			children: "URL Conventions"
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
			title: "url-conventions.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/api                        # API prefix (src/config/api.ts)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/api/{model}                # generated → /api/posts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/api/{model}/:id            # single resource" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/api/{model}/:id/{action}   # custom, controller-defined" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/api/{controller}/...       # controller routes under prefix" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/openapi.json               # OpenAPI 3.1 spec" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/docs                       # Swagger UI (optional)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/mcp                        # MCP endpoint (optional)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/healthz · /readyz           # health checks" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Naming is enforced by convention: lowercase plural models, kebab-case custom segments, and no verbs in paths — actions on a resource are expressed as custom routes, not verbs." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "route-handlers",
			children: "Route Handlers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Controllers declare routes via the builder methods ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "get" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "post" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "put" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "patch" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delete" }),
			", each taking a path, a handler, and an optional schema:"
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
			title: "route-handlers.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
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
							children: "(params.id))"
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
							children: "  Post."
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
						children: ", {"
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
							children: "  body: { title: "
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
							children: "  permission: "
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
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The method determines the HTTP verb, the handler produces the response, and the option object narrows the request before the handler runs. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "put" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "patch" }),
			" are distinct: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "put" }),
			" sends a complete representation, while ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "patch" }),
			" is the partial-update convention used by the generated model routes."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "paths-and-params",
			children: "Paths and Params"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Paths use ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ":param" }),
			" segments. Params are parsed before the handler runs and typed from the route schema:"
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
			title: "paths-and-params.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
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
							children: "patch"
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
							children: "'/posts/:id'"
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
							children: ", "
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
							children: "  const"
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
							children: "  return"
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
							children: "(body)"
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
						children: "}, {"
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
							children: "  params: { id: "
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
							children: "  body: { title: "
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
			"If a requested param fails validation, the route short-circuits with a validation error before the handler is ever called. Unknown params in a declared schema reject the request; undeclared params are ignored. Params are always strings at runtime — a schema that parses them, such as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ id: 'number' }" }),
			", runs the value through the same validation runtime as body and query."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nPath matching is exact per segment. A route declared as ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/posts/:id" }),
				" matches ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/posts/1" }),
				" but not ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/posts/1/edit" }),
				" — the segments are fixed. Custom actions occupy their own path with their own segments."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "schema-options",
			children: "Schema Options"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every route can validate any subset of the request in its option object:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Option" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Validates" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "body" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Request body" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "query" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Query-string parameters" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Path parameters" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "headers" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Request headers" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookies" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Request cookies" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"All routes are validated by the same schema-driven validation runtime used by models, jobs, and channels. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/validation",
				children: "Validation"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generated-model-routes",
			children: "Generated Model Routes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each model contributes exactly five deterministic routes. This shape is stable so documentation and tooling can rely on it:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Method" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Path" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Request" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Response" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "page" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "limit" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "orderBy" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "with" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "q" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "`{ data, total, page, lastPage }`" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "—" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Post" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "validated body" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Post" }), " (201)"] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PATCH" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "validated partial body" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Post" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DELETE" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "—" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "204" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Generated routes are enforced at the model level:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }), " is schema-checked against the model — unknown fields return a 422."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "with" }), " accepts only declared relations."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Each route requires the policy matching its operation, for example ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.read" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.update" }),
				", unless ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" is disabled for the model."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the five routes derive from the model's field DSL, changing a model changes the schemas, the responses, and the client signatures of every generated route together. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "Generated Endpoints"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "route-manifest",
			children: "Route Manifest"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every route — generated or authored — contributes an entry to the route manifest: path, method, schemas, response type, permission, and tags. The manifest is rendered once at boot and feeds three consumers:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }), " — typed RPC methods inferred at the type level, zero codegen"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"OpenAPI 3.1 — served at ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/openapi.json" }),
				" with an optional Swagger UI at ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/docs" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/mcp" }), " — controller and model routes exposed as agent-callable tools"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because generation happens from one intermediate representation, the client, the spec, and the tools can never drift from the routes you declared. The same entries drive Studio screens, so a route you add appears in the admin UI and the agent surface without further wiring. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/openapi",
				children: "API: OpenAPI"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio",
				children: "Studio"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "server-routes",
			children: "Server Routes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineServerRoute" }),
			" adds infrastructure-level routes and rules outside the controller surface. Server routes live in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/routes/*.ts" }),
			" and are the place for redirects, proxies, caching rules, and engine-level controls:"
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
			title: "src/routes/rules.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/routes/rules.ts"
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
							children: " { defineServerRoute } "
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ["
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
							children: "  defineServerRoute"
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
							children: "'/legacy/**'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",  { redirect: { to: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'/new/**'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", status: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "308"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } }),"
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
							children: "  defineServerRoute"
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
							children: "'/api/**'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",     { cors: "
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
							children: ", rateLimit: { max: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "600"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", per: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "60"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } }),"
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
							children: "  defineServerRoute"
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
							children: "'/proxy/img'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",  { proxy: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'https://img.acme.dev/**'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  defineServerRoute"
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
							children: "'/healthz'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",    { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "handler"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " new"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " Response"
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
							children: "'ok'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ") }),"
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
						children: "]"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The full rule surface is available:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Rule" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Effect" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cache whole responses for a TTL" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Stale-while-revalidate refresh" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Regenerate a static page on an interval" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build-time output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Crawled and rendered at build time" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "redirect" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Permanent or temporary redirects" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "proxy" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Reverse-proxy matched paths" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "headers" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Attach arbitrary response headers" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Apply or override the CORS preset" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rateLimit" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Enforce per-path request limits" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Rules are applied before the request context is assembled, so cached public routes skip session loading entirely. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/caching",
				children: "Response Caching"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/cors",
				children: "CORS & Security Headers"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "groups-and-prefixes",
			children: "Groups and Prefixes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Controllers mount under a prefix, which composes with the API prefix configured in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/api.ts" }),
			". Multiple controllers can share a prefix by each declaring it, and guards provide the nesting model — every route inside a guard inherits its middleware and checks. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/controllers",
				children: "Controllers"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/guards",
				children: "Guards"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "versioning",
			children: "Versioning"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"URL versioning is configured in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/api.ts" }),
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
			title: "versioning.ts",
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
							children: "'api'"
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
							children: "    versioning: { strategy: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'url'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", default: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'v1'"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"With the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "url" }),
			" strategy, routes mount under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/v1/..." }),
			". Breaking changes require a new version; deprecation signals can be attached to routes via route rules and are carried through to the OpenAPI output. The typed client targets the configured version automatically, so application code never hard-codes the version segment."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "health-checks",
			children: "Health Checks"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/readyz" }),
			" are provided by server routes. The former is the liveness probe — the process is up — while the latter reports readiness, such as database and queue connectivity. Health responses are kept tiny and uncached so orchestrators get an accurate signal. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/configuration",
				children: "Getting Started: configuration"
			}),
			" for wiring health routes into deployments."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/controllers",
				children: "Controllers"
			}), " — declaring routes with typed handlers"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "API: Generated endpoints"
			}), " — the five-model-route contract"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rpc",
				children: "API: RPC client"
			}), " — consuming the manifest from the client"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/openapi",
				children: "API: OpenAPI"
			}), " — the spec rendered from the manifest"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/middleware",
				children: "Middleware"
			}), " — pipeline stages that run around routing"] }),
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
