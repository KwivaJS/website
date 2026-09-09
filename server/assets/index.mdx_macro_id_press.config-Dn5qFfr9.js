import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/api/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "API",
	"description": "Complete API layer — REST, generated endpoints, typed RPC, client SDK, OpenAPI, authentication, and errors."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva's API layer turns one set of declarations into a complete, always-in-sync HTTP surface. From your `defineModel` and `defineController` files in `src/app/`, the framework derives a deterministic REST API, a fully typed RPC client, an OpenAPI 3.1 specification, Studio screens, and MCP tools — all through the same route manifest. The conventional REST surface, the generated model routes, and your own controller actions are not three separate systems. They are one system: deterministic model routes, custom controller actions, and a client that never drifts.\n\nEverything in this section is derived. You never write route files twice, hand-maintain a spec, or regenerate a client SDK. The declarations are the contract, and every exported surface is a projection of the same route manifest.\n\n## One Model, One Manifest [#one-model-one-manifest]\n\n```plaintext title=\"one-model-one-manifest.txt\"\nsrc/app/models/posts.ts       defineModel('posts', ...)\nsrc/app/http/controllers/     defineController('posts', ...)\n                 │\n                 ▼\n           route manifest (IR)\n                 │\n   ┌──────┬──────┼─────┬──────┬──────┐\n   ▼      ▼      ▼     ▼      ▼      ▼\n REST   RPC   OpenAPI  Studio  MCP  validation\n```\n\nThe route manifest records path, method, schemas, response type, permission, and tags for every route — generated model routes and authored controller routes alike. `@kwiva/http` renders OpenAPI from it, `@kwiva/client` derives method types from it, and `@kwiva/mcp` exposes tools from it. Because every consumer reads the same intermediate representation, there is no second source of truth to keep in sync and no drift to fix.\n\n## What the API Layer Includes [#what-the-api-layer-includes]\n\n| Page                                                 | Covers                                                                         |\n| ---------------------------------------------------- | ------------------------------------------------------------------------------ |\n| [REST Conventions](/docs/api/rest)                   | URL patterns, method mapping, status codes, pagination, naming, error envelope |\n| [Generated Endpoints](/docs/api/generated-endpoints) | The deterministic 5 routes per model, custom actions, permission gating        |\n| [Typed RPC](/docs/api/rpc)                           | End-to-end types from controllers and models, zero runtime codegen             |\n| [Client SDK](/docs/api/client)                       | `@kwiva/client`, SSR-safe usage, `createTestClient` for in-process tests       |\n| [OpenAPI](/docs/api/openapi)                         | The auto-generated spec, `/openapi.json`, build artifact                       |\n| [API Authentication](/docs/api/authentication)       | Session cookies, token sessions, middleware, per-route protection              |\n| [API Errors](/docs/api/errors)                       | The error taxonomy, envelope shape, client-side typed handling                 |\n\nThe pages above read in two directions: conventions first for authors who shape the API, then the client and spec for consumers of it. Both directions meet in the manifest.\n\n## Quick Start [#quick-start]\n\nDefine a model once — the framework generates the five standard routes:\n\n```ts title=\"src/app/models/posts.ts\"\n// src/app/models/posts.ts\nimport { defineModel } from '@kwiva/data'\n\nexport default defineModel('posts', (f) => ({\n  id: f.id(),\n  title: f.string().validation((s) => s.min(1).max(200)),\n  status: f.enum('draft', 'published').default('draft'),\n}), { timestamps: true, permission: 'posts' })\n```\n\nAdd custom behavior with a controller:\n\n```ts title=\"src/app/http/controllers/posts.ts\"\n// src/app/http/controllers/posts.ts\nimport { defineController } from '@kwiva/http'\n\nexport default defineController('posts', (c) => ({\n  publish: c.post('/:id/publish', async ({ params }) => {\n    const post = await Post.findOrFail(params.id)\n    return post.update({ status: 'published', publishedAt: new Date() })\n  }, { permission: 'posts.publish' }),\n}), { prefix: '/posts', tags: ['posts'] })\n```\n\nCall the API with the typed client — every method, argument, and response type is inferred from the same definitions, with no codegen step:\n\n```ts title=\"quick-start.ts\"\nimport { createClient } from '@kwiva/client'\n\nexport const client = createClient({ baseUrl: 'https://api.acme.dev' })\n\nconst { data } = await client.posts.list({ page: 1 })\nconst post = await client.posts.get('pst_123')\nawait client.posts.publish('pst_123')\n```\n\n## The Endpoints [#the-endpoints]\n\n* `/openapi.json` serves the generated OpenAPI 3.1 spec, with optional interactive docs at `/docs`.\n* `/mcp` exposes model and controller routes as agent-callable tools when MCP is enabled.\n* `/healthz` and `/readyz` provide liveness and readiness probes.\n\nAll rendered from the same manifest, all consistent with the routes you declared. See [OpenAPI](/docs/api/openapi) and the [MCP server](/docs/ai-mcp/mcp-server) pages.\n\n## API and the HTTP Layer [#api-and-the-http-layer]\n\nThe API surface is the outward face of the HTTP layer. Controllers, middleware, guards, validation, and error mapping are declared in `@kwiva/http`; the API section documents the contract that surface produces — URLs, status codes, envelopes, and the typed client that consumes them. If you are writing routes, start with [Controllers](/docs/http/controllers); if you are designing the contract, start here.\n\n## Generated vs Authored [#generated-vs-authored]\n\nTwo things produce routes. Knowing which handles a given path tells you where to change it:\n\n| Path                           | Produced by        | Change by editing   |\n| ------------------------------ | ------------------ | ------------------- |\n| `/api/posts`, `/api/posts/:id` | `defineModel`      | the model file      |\n| `/api/posts/:id/publish`       | `defineController` | the controller      |\n| `/api/v1/...`                  | versioning config  | `src/config/api.ts` |\n| `/openapi.json`, `/docs`       | manifest renderer  | nothing — automatic |\n| `/healthz`, `/readyz`          | server routes      | `src/routes/*.ts`   |\n\nThe line is stable: model files own CRUD, controller files own custom behavior, server routes own infrastructure. Change one and the projections follow; there is no cross-editing between them.\n\n## Conventions at a Glance [#conventions-at-a-glance]\n\n* Collections are lowercase plural; custom segments are kebab-case; no verbs in paths.\n* Five deterministic routes per model, plus custom actions.\n* `PATCH` is partial, `DELETE` returns 204, lists use the paginated envelope.\n* All failures share one taxonomy and one envelope.\n* The typed client is the reference consumer; OpenAPI is the reference document.\n\nThese are not preferences; they are the contract tooling depends on.\n\n## The API Lifecycle, End to End [#the-api-lifecycle-end-to-end]\n\nA call to `client.posts.list({ page: 1 })` travels the same pipeline as a raw `curl`: parse, validation, guards, handler, serialization. On the server the client skips the network hop but not the pipeline — policies and validation still run, which keeps in-process calls honest. See [Request Lifecycle](/docs/http/lifecycle) and [Generated Endpoints](/docs/api/generated-endpoints).\n\n## REST, Generated, and Custom Actions [#rest-generated-and-custom-actions]\n\nRoutes fall into three authored shapes that stay consistent:\n\n* Model-generated CRUD — five routes per model, permissions from the model option\n* Custom actions — one route per action, declared in the controller\n* REST-only — plain paths, full control\n\nThe three share validation, guards, the envelope, the client, and the spec. See [Generated Endpoints](/docs/api/generated-endpoints) and [REST Conventions](/docs/api/rest).\n\n## Auth and Permissions in One Sentence [#auth-and-permissions-in-one-sentence]\n\nAuthentication answers who is calling; authorization answers what they may do. The `auth` middleware asserts a session, guards assert specifics, and route `permission` keys assert ability. See [API Authentication](/docs/api/authentication) and [Authorization](/docs/authorization).\n\n## The Versioned Contract [#the-versioned-contract]\n\nThe API ships under a versioning policy you configure once. Public behavior that callers depend on — method names, request shapes, response envelopes, error codes — changes only across a version bump, never silently within one. See [REST conventions: versioning](/docs/api/rest).\n\n## What the Framework Enforces [#what-the-framework-enforces]\n\nThe manifest is the single source of truth for routes, schemas, permissions, and tags. Because every projection — client, OpenAPI, MCP, Studio, the dev overlay — derives from it, the framework enforces consistency at the architecture level: a route that contradicts the manifest, a client method that drifts from a route, or a policy that lacks a route cannot exist quietly. The section pages that follow are the detailed statements of that contract.\n\n## What's Next [#whats-next]\n\n* [REST Conventions](/docs/api/rest) — the URL, status code, and envelope contract\n* [Typed RPC](/docs/api/rpc) — how types flow end-to-end without codegen\n* [Controllers](/docs/http/controllers) — the `defineController` surface\n* [Models](/docs/data/models) — the `defineModel` source of truth\n* [Your First API](/docs/getting-started/first-api) — build an API from scratch\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva's API layer turns one set of declarations into a complete, always-in-sync HTTP surface. From your `defineModel` and `defineController` files in `src/app/`, the framework derives a deterministic REST API, a fully typed RPC client, an OpenAPI 3.1 specification, Studio screens, and MCP tools — all through the same route manifest. The conventional REST surface, the generated model routes, and your own controller actions are not three separate systems. They are one system: deterministic model routes, custom controller actions, and a client that never drifts."
		},
		{
			"heading": void 0,
			"content": "Everything in this section is derived. You never write route files twice, hand-maintain a spec, or regenerate a client SDK. The declarations are the contract, and every exported surface is a projection of the same route manifest."
		},
		{
			"heading": "one-model-one-manifest",
			"content": "The route manifest records path, method, schemas, response type, permission, and tags for every route — generated model routes and authored controller routes alike. `@kwiva/http` renders OpenAPI from it, `@kwiva/client` derives method types from it, and `@kwiva/mcp` exposes tools from it. Because every consumer reads the same intermediate representation, there is no second source of truth to keep in sync and no drift to fix."
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "Page"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "Covers"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "REST Conventions"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "URL patterns, method mapping, status codes, pagination, naming, error envelope"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "Generated Endpoints"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "The deterministic 5 routes per model, custom actions, permission gating"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "Typed RPC"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "End-to-end types from controllers and models, zero runtime codegen"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "Client SDK"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "`@kwiva/client`, SSR-safe usage, `createTestClient` for in-process tests"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "OpenAPI"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "The auto-generated spec, `/openapi.json`, build artifact"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "API Authentication"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "Session cookies, token sessions, middleware, per-route protection"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "API Errors"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "The error taxonomy, envelope shape, client-side typed handling"
		},
		{
			"heading": "what-the-api-layer-includes",
			"content": "The pages above read in two directions: conventions first for authors who shape the API, then the client and spec for consumers of it. Both directions meet in the manifest."
		},
		{
			"heading": "quick-start",
			"content": "Define a model once — the framework generates the five standard routes:"
		},
		{
			"heading": "quick-start",
			"content": "Add custom behavior with a controller:"
		},
		{
			"heading": "quick-start",
			"content": "Call the API with the typed client — every method, argument, and response type is inferred from the same definitions, with no codegen step:"
		},
		{
			"heading": "the-endpoints",
			"content": "`/openapi.json` serves the generated OpenAPI 3.1 spec, with optional interactive docs at `/docs`."
		},
		{
			"heading": "the-endpoints",
			"content": "`/mcp` exposes model and controller routes as agent-callable tools when MCP is enabled."
		},
		{
			"heading": "the-endpoints",
			"content": "`/healthz` and `/readyz` provide liveness and readiness probes."
		},
		{
			"heading": "the-endpoints",
			"content": "All rendered from the same manifest, all consistent with the routes you declared. See OpenAPI and the MCP server pages."
		},
		{
			"heading": "api-and-the-http-layer",
			"content": "The API surface is the outward face of the HTTP layer. Controllers, middleware, guards, validation, and error mapping are declared in `@kwiva/http`; the API section documents the contract that surface produces — URLs, status codes, envelopes, and the typed client that consumes them. If you are writing routes, start with Controllers; if you are designing the contract, start here."
		},
		{
			"heading": "generated-vs-authored",
			"content": "Two things produce routes. Knowing which handles a given path tells you where to change it:"
		},
		{
			"heading": "generated-vs-authored",
			"content": "Path"
		},
		{
			"heading": "generated-vs-authored",
			"content": "Produced by"
		},
		{
			"heading": "generated-vs-authored",
			"content": "Change by editing"
		},
		{
			"heading": "generated-vs-authored",
			"content": "`/api/posts`, `/api/posts/:id`"
		},
		{
			"heading": "generated-vs-authored",
			"content": "`defineModel`"
		},
		{
			"heading": "generated-vs-authored",
			"content": "the model file"
		},
		{
			"heading": "generated-vs-authored",
			"content": "`/api/posts/:id/publish`"
		},
		{
			"heading": "generated-vs-authored",
			"content": "`defineController`"
		},
		{
			"heading": "generated-vs-authored",
			"content": "the controller"
		},
		{
			"heading": "generated-vs-authored",
			"content": "`/api/v1/...`"
		},
		{
			"heading": "generated-vs-authored",
			"content": "versioning config"
		},
		{
			"heading": "generated-vs-authored",
			"content": "`src/config/api.ts`"
		},
		{
			"heading": "generated-vs-authored",
			"content": "`/openapi.json`, `/docs`"
		},
		{
			"heading": "generated-vs-authored",
			"content": "manifest renderer"
		},
		{
			"heading": "generated-vs-authored",
			"content": "nothing — automatic"
		},
		{
			"heading": "generated-vs-authored",
			"content": "`/healthz`, `/readyz`"
		},
		{
			"heading": "generated-vs-authored",
			"content": "server routes"
		},
		{
			"heading": "generated-vs-authored",
			"content": "`src/routes/*.ts`"
		},
		{
			"heading": "generated-vs-authored",
			"content": "The line is stable: model files own CRUD, controller files own custom behavior, server routes own infrastructure. Change one and the projections follow; there is no cross-editing between them."
		},
		{
			"heading": "conventions-at-a-glance",
			"content": "Collections are lowercase plural; custom segments are kebab-case; no verbs in paths."
		},
		{
			"heading": "conventions-at-a-glance",
			"content": "Five deterministic routes per model, plus custom actions."
		},
		{
			"heading": "conventions-at-a-glance",
			"content": "`PATCH` is partial, `DELETE` returns 204, lists use the paginated envelope."
		},
		{
			"heading": "conventions-at-a-glance",
			"content": "All failures share one taxonomy and one envelope."
		},
		{
			"heading": "conventions-at-a-glance",
			"content": "The typed client is the reference consumer; OpenAPI is the reference document."
		},
		{
			"heading": "conventions-at-a-glance",
			"content": "These are not preferences; they are the contract tooling depends on."
		},
		{
			"heading": "the-api-lifecycle-end-to-end",
			"content": "A call to `client.posts.list({ page: 1 })` travels the same pipeline as a raw `curl`: parse, validation, guards, handler, serialization. On the server the client skips the network hop but not the pipeline — policies and validation still run, which keeps in-process calls honest. See Request Lifecycle and Generated Endpoints."
		},
		{
			"heading": "rest-generated-and-custom-actions",
			"content": "Routes fall into three authored shapes that stay consistent:"
		},
		{
			"heading": "rest-generated-and-custom-actions",
			"content": "Model-generated CRUD — five routes per model, permissions from the model option"
		},
		{
			"heading": "rest-generated-and-custom-actions",
			"content": "Custom actions — one route per action, declared in the controller"
		},
		{
			"heading": "rest-generated-and-custom-actions",
			"content": "REST-only — plain paths, full control"
		},
		{
			"heading": "rest-generated-and-custom-actions",
			"content": "The three share validation, guards, the envelope, the client, and the spec. See Generated Endpoints and REST Conventions."
		},
		{
			"heading": "auth-and-permissions-in-one-sentence",
			"content": "Authentication answers who is calling; authorization answers what they may do. The `auth` middleware asserts a session, guards assert specifics, and route `permission` keys assert ability. See API Authentication and Authorization."
		},
		{
			"heading": "the-versioned-contract",
			"content": "The API ships under a versioning policy you configure once. Public behavior that callers depend on — method names, request shapes, response envelopes, error codes — changes only across a version bump, never silently within one. See REST conventions: versioning."
		},
		{
			"heading": "what-the-framework-enforces",
			"content": "The manifest is the single source of truth for routes, schemas, permissions, and tags. Because every projection — client, OpenAPI, MCP, Studio, the dev overlay — derives from it, the framework enforces consistency at the architecture level: a route that contradicts the manifest, a client method that drifts from a route, or a policy that lacks a route cannot exist quietly. The section pages that follow are the detailed statements of that contract."
		},
		{
			"heading": "whats-next",
			"content": "REST Conventions — the URL, status code, and envelope contract"
		},
		{
			"heading": "whats-next",
			"content": "Typed RPC — how types flow end-to-end without codegen"
		},
		{
			"heading": "whats-next",
			"content": "Controllers — the `defineController` surface"
		},
		{
			"heading": "whats-next",
			"content": "Models — the `defineModel` source of truth"
		},
		{
			"heading": "whats-next",
			"content": "Your First API — build an API from scratch"
		}
	],
	"headings": [
		{
			"id": "one-model-one-manifest",
			"content": "One Model, One Manifest"
		},
		{
			"id": "what-the-api-layer-includes",
			"content": "What the API Layer Includes"
		},
		{
			"id": "quick-start",
			"content": "Quick Start"
		},
		{
			"id": "the-endpoints",
			"content": "The Endpoints"
		},
		{
			"id": "api-and-the-http-layer",
			"content": "API and the HTTP Layer"
		},
		{
			"id": "generated-vs-authored",
			"content": "Generated vs Authored"
		},
		{
			"id": "conventions-at-a-glance",
			"content": "Conventions at a Glance"
		},
		{
			"id": "the-api-lifecycle-end-to-end",
			"content": "The API Lifecycle, End to End"
		},
		{
			"id": "rest-generated-and-custom-actions",
			"content": "REST, Generated, and Custom Actions"
		},
		{
			"id": "auth-and-permissions-in-one-sentence",
			"content": "Auth and Permissions in One Sentence"
		},
		{
			"id": "the-versioned-contract",
			"content": "The Versioned Contract"
		},
		{
			"id": "what-the-framework-enforces",
			"content": "What the Framework Enforces"
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
		url: "#one-model-one-manifest",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One Model, One Manifest" })
	},
	{
		depth: 2,
		url: "#what-the-api-layer-includes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What the API Layer Includes" })
	},
	{
		depth: 2,
		url: "#quick-start",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Quick Start" })
	},
	{
		depth: 2,
		url: "#the-endpoints",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Endpoints" })
	},
	{
		depth: 2,
		url: "#api-and-the-http-layer",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "API and the HTTP Layer" })
	},
	{
		depth: 2,
		url: "#generated-vs-authored",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generated vs Authored" })
	},
	{
		depth: 2,
		url: "#conventions-at-a-glance",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Conventions at a Glance" })
	},
	{
		depth: 2,
		url: "#the-api-lifecycle-end-to-end",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The API Lifecycle, End to End" })
	},
	{
		depth: 2,
		url: "#rest-generated-and-custom-actions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "REST, Generated, and Custom Actions" })
	},
	{
		depth: 2,
		url: "#auth-and-permissions-in-one-sentence",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Auth and Permissions in One Sentence" })
	},
	{
		depth: 2,
		url: "#the-versioned-contract",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Versioned Contract" })
	},
	{
		depth: 2,
		url: "#what-the-framework-enforces",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What the Framework Enforces" })
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva's API layer turns one set of declarations into a complete, always-in-sync HTTP surface. From your ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
			" files in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/" }),
			", the framework derives a deterministic REST API, a fully typed RPC client, an OpenAPI 3.1 specification, Studio screens, and MCP tools — all through the same route manifest. The conventional REST surface, the generated model routes, and your own controller actions are not three separate systems. They are one system: deterministic model routes, custom controller actions, and a client that never drifts."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Everything in this section is derived. You never write route files twice, hand-maintain a spec, or regenerate a client SDK. The declarations are the contract, and every exported surface is a projection of the same route manifest." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "one-model-one-manifest",
			children: "One Model, One Manifest"
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
			title: "one-model-one-manifest.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/models/posts.ts       defineModel('posts', ...)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/http/controllers/     defineController('posts', ...)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                 │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                 ▼" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "           route manifest (IR)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                 │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   ┌──────┬──────┼─────┬──────┬──────┐" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   ▼      ▼      ▼     ▼      ▼      ▼" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " REST   RPC   OpenAPI  Studio  MCP  validation" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The route manifest records path, method, schemas, response type, permission, and tags for every route — generated model routes and authored controller routes alike. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
			" renders OpenAPI from it, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }),
			" derives method types from it, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/mcp" }),
			" exposes tools from it. Because every consumer reads the same intermediate representation, there is no second source of truth to keep in sync and no drift to fix."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-the-api-layer-includes",
			children: "What the API Layer Includes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Page" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Covers" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rest",
				children: "REST Conventions"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "URL patterns, method mapping, status codes, pagination, naming, error envelope" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "Generated Endpoints"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The deterministic 5 routes per model, custom actions, permission gating" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rpc",
				children: "Typed RPC"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "End-to-end types from controllers and models, zero runtime codegen" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/client",
				children: "Client SDK"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }),
				", SSR-safe usage, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createTestClient" }),
				" for in-process tests"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/openapi",
				children: "OpenAPI"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The auto-generated spec, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/openapi.json" }),
				", build artifact"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/authentication",
				children: "API Authentication"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Session cookies, token sessions, middleware, per-route protection" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/errors",
				children: "API Errors"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The error taxonomy, envelope shape, client-side typed handling" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pages above read in two directions: conventions first for authors who shape the API, then the client and spec for consumers of it. Both directions meet in the manifest." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "quick-start",
			children: "Quick Start"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Define a model once — the framework generates the five standard routes:" }),
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
			title: "src/app/models/posts.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/models/posts.ts"
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
							children: " { defineModel } "
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
							children: " '@kwiva/data'"
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
							children: " defineModel"
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
							children: "  title: f."
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
							children: "validation"
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
							children: "s"
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
							children: " s."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "min"
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
							children: "1"
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
							children: "max"
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
							children: "200"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")),"
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
							children: "  status: f."
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
							children: "'draft'"
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
							children: "'draft'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Add custom behavior with a controller:" }),
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Call the API with the typed client — every method, argument, and response type is inferred from the same definitions, with no codegen step:" }),
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
							children: "const"
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
							children: " client.posts."
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-endpoints",
			children: "The Endpoints"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/openapi.json" }),
				" serves the generated OpenAPI 3.1 spec, with optional interactive docs at ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/docs" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/mcp" }), " exposes model and controller routes as agent-callable tools when MCP is enabled."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/readyz" }),
				" provide liveness and readiness probes."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"All rendered from the same manifest, all consistent with the routes you declared. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/openapi",
				children: "OpenAPI"
			}),
			" and the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/ai-mcp/mcp-server",
				children: "MCP server"
			}),
			" pages."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "api-and-the-http-layer",
			children: "API and the HTTP Layer"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The API surface is the outward face of the HTTP layer. Controllers, middleware, guards, validation, and error mapping are declared in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
			"; the API section documents the contract that surface produces — URLs, status codes, envelopes, and the typed client that consumes them. If you are writing routes, start with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/controllers",
				children: "Controllers"
			}),
			"; if you are designing the contract, start here."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generated-vs-authored",
			children: "Generated vs Authored"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two things produce routes. Knowing which handles a given path tells you where to change it:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Path" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Produced by" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Change by editing" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "the model file" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id/publish" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "the controller" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/v1/..." }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "versioning config" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/api.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/openapi.json" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/docs" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "manifest renderer" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "nothing — automatic" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/readyz" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "server routes" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/routes/*.ts" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The line is stable: model files own CRUD, controller files own custom behavior, server routes own infrastructure. Change one and the projections follow; there is no cross-editing between them." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "conventions-at-a-glance",
			children: "Conventions at a Glance"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Collections are lowercase plural; custom segments are kebab-case; no verbs in paths." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Five deterministic routes per model, plus custom actions." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PATCH" }),
				" is partial, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DELETE" }),
				" returns 204, lists use the paginated envelope."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "All failures share one taxonomy and one envelope." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The typed client is the reference consumer; OpenAPI is the reference document." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "These are not preferences; they are the contract tooling depends on." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-api-lifecycle-end-to-end",
			children: "The API Lifecycle, End to End"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A call to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.list({ page: 1 })" }),
			" travels the same pipeline as a raw ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "curl" }),
			": parse, validation, guards, handler, serialization. On the server the client skips the network hop but not the pipeline — policies and validation still run, which keeps in-process calls honest. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Request Lifecycle"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "Generated Endpoints"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "rest-generated-and-custom-actions",
			children: "REST, Generated, and Custom Actions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Routes fall into three authored shapes that stay consistent:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Model-generated CRUD — five routes per model, permissions from the model option" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Custom actions — one route per action, declared in the controller" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "REST-only — plain paths, full control" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The three share validation, guards, the envelope, the client, and the spec. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "Generated Endpoints"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rest",
				children: "REST Conventions"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "auth-and-permissions-in-one-sentence",
			children: "Auth and Permissions in One Sentence"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Authentication answers who is calling; authorization answers what they may do. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }),
			" middleware asserts a session, guards assert specifics, and route ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" keys assert ability. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/authentication",
				children: "API Authentication"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization",
				children: "Authorization"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-versioned-contract",
			children: "The Versioned Contract"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The API ships under a versioning policy you configure once. Public behavior that callers depend on — method names, request shapes, response envelopes, error codes — changes only across a version bump, never silently within one. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rest",
				children: "REST conventions: versioning"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-the-framework-enforces",
			children: "What the Framework Enforces"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The manifest is the single source of truth for routes, schemas, permissions, and tags. Because every projection — client, OpenAPI, MCP, Studio, the dev overlay — derives from it, the framework enforces consistency at the architecture level: a route that contradicts the manifest, a client method that drifts from a route, or a policy that lacks a route cannot exist quietly. The section pages that follow are the detailed statements of that contract." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rest",
				children: "REST Conventions"
			}), " — the URL, status code, and envelope contract"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rpc",
				children: "Typed RPC"
			}), " — how types flow end-to-end without codegen"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/controllers",
					children: "Controllers"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
				" surface"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Models"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				" source of truth"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-api",
				children: "Your First API"
			}), " — build an API from scratch"] }),
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
