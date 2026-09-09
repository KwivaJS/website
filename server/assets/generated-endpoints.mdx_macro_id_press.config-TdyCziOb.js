import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/api/generated-endpoints.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Generated Endpoints",
	"description": "The deterministic 5 routes per model, query contracts, custom actions, and permission gating."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nEvery model generates the same deterministic set of endpoints. Count on it: five routes per model, identical for a blog post or a billing invoice, because the routes are derived from the model file rather than declared by hand. Tooling, Studio, documentation, and the typed client all rely on this shape.\n\nStability is the point. Because the five routes are always the same, an API consumer can predict the full surface of a new model without reading its source, and the framework can generate the schemas, the client methods, and the OpenAPI paths for every model mechanically.\n\n## The Five Routes [#the-five-routes]\n\n| Method   | Path             | Request                                                 | Response                                |\n| -------- | ---------------- | ------------------------------------------------------- | --------------------------------------- |\n| `GET`    | `/api/posts`     | query: `where`, `page`, `limit`, `orderBy`, `with`, `q` | `` `{ data, total, page, lastPage }` `` |\n| `GET`    | `/api/posts/:id` | —                                                       | `Post`                                  |\n| `POST`   | `/api/posts`     | validated body                                          | `Post` (201)                            |\n| `PATCH`  | `/api/posts/:id` | validated partial body                                  | `Post`                                  |\n| `DELETE` | `/api/posts/:id` | —                                                       | 204                                     |\n\nRequests, bodies, and responses are fully typed — because they all derive from `defineModel` and the same route manifest that feeds the client, Studio, OpenAPI, and MCP tools.\n\n## Where the Routes Come From [#where-the-routes-come-from]\n\nGenerated routes come from a single model file:\n\n```ts title=\"src/app/models/posts.ts\"\n// src/app/models/posts.ts\nimport { defineModel } from '@kwiva/data'\n\nexport default defineModel('posts', (f) => ({\n  id: f.id(),\n  title: f.string().validation((s) => s.min(1).max(200)),\n  body: f.text().optional(),\n  status: f.enum('draft', 'published', 'archived').default('draft').indexed(),\n  publishedAt: f.timestamp().optional(),\n  authorId: f.uuid().indexed(),\n  author: f.belongsTo(() => User),\n  comments: f.hasMany(() => Comment),\n}), {\n  timestamps: true,\n  permission: 'posts',\n})\n```\n\nChange the model and every generated route, its schema, and its client signature change together. There is no separate route file to update and no drift to fix.\n\n## Reading a List [#reading-a-list]\n\nThe list route accepts `where`, `page`, `limit`, `orderBy`, `with`, and `q` as query parameters:\n\n```plaintext title=\"reading-a-list.txt\"\nGET /api/posts?page=1&limit=20\n```\n\nPrefer the typed client for structured queries — filters are checked against the model at compile time:\n\n```ts title=\"reading-a-list-2.ts\"\nconst { data } = await client.posts.list({\n  where: { status: 'published' },\n  with: ['comments'],\n  page: 1,\n  limit: 20,\n})\n```\n\nThe `where` argument is schema-checked against the model; unknown fields return a `VALIDATION` error. The `with` argument accepts only declared relations. The pagination contract — `page`, `limit`, `orderBy`, `q` — is validated the same way. See [REST conventions: pagination](/docs/api/rest) and [Data: pagination](/docs/data/pagination).\n\n## Create and Update [#create-and-update]\n\n`POST` and `PATCH` carry validated bodies from the model's field DSL and any route-level schemas:\n\n```ts title=\"create-and-update.ts\"\nconst created = await client.posts.create({ title: 'Hello', status: 'draft' })\nconst updated = await client.posts.update(id, { status: 'published' })\n```\n\n`PATCH` is a partial update — send only the fields you change. A `PATCH` body is validated as a partial of the model: fields present are checked against the field DSL, and fields omitted are left untouched. `POST` validates a full create shape, applying model defaults for anything not supplied.\n\n## Custom Actions [#custom-actions]\n\nThe five routes are the baseline, not the ceiling. Add application-specific actions with a controller:\n\n```ts title=\"src/app/http/controllers/posts.ts\"\n// src/app/http/controllers/posts.ts\nimport { defineController } from '@kwiva/http'\n\nexport default defineController('posts', (c) => ({\n  publish: c.post('/:id/publish', async ({ params }) => {\n    const post = await Post.findOrFail(params.id)\n    return post.update({ status: 'published', publishedAt: new Date() })\n  }, {\n    body: { note: 'string?' },\n    permission: 'posts.publish',\n  }),\n}), { prefix: '/posts', tags: ['posts'] })\n```\n\nThis mounts `POST /api/posts/:id/publish`, validates the optional body, and appears in OpenAPI and the typed client exactly like a generated route. A custom action adds to the deterministic five — the shape you can count on, plus the behavior you actually need.\n\n## Permission Gating [#permission-gating]\n\nEvery generated route is gated by the model's `permission` option:\n\n* `permission: 'posts'` requires `posts.read`, `posts.create`, `posts.update`, `posts.delete` for the corresponding routes.\n* `permission: false` disables gating entirely — use for fully public models.\n\nPermission checks run through `definePolicy` in the `onBeforeHandle` stage of the request lifecycle, after validation, so a policy can make decisions against the validated body. The same namespace gates Studio screens and MCP tools, so one decision surface governs every entry point. See [Authorization: permissions](/docs/authorization/permissions) and [Authorization: enforcement](/docs/authorization/enforcement).\n\n> \\[!NOTE]\n> The five list, get, create, update, and delete operations map to `posts.read`, `posts.read`, `posts.create`, `posts.update`, and `posts.delete`. A missing session maps to `UNAUTHORIZED`; a present session without the ability maps to `FORBIDDEN`; both return before the route executes.\n\n## Generated Routes and the Manifest [#generated-routes-and-the-manifest]\n\nGenerated routes are first-class manifest entries. They carry path, method, schemas, response types, permission, and tags into the same intermediate representation as every controller route — which is why the typed client offers `client.posts.list`, `/docs` documents them, and MCP exposes them as tools without any per-route wiring.\n\n## Deterministic Routing by Model Name [#deterministic-routing-by-model-name]\n\nThe routes derive their paths from the model name: `posts` produces `/api/posts`, `blog-posts` produces `/api/blog-posts`. The client methods (`client.posts.list`, `client.posts.get`) follow the same naming, and Studio organizes by the same identity. One name, five routes, everywhere consistent.\n\n## List Filtering and Eager Loading [#list-filtering-and-eager-loading]\n\n`where` accepts the model's fields as filter keys; `with` accepts only declared relations. Both are schema-checked before the query builder runs, so a malformed filter returns `VALIDATION` instead of executing. See [Data: queries](/docs/data/queries) for the full filter surface.\n\n## Partial Updates [#partial-updates]\n\n`PATCH` validates as a partial: the body is checked against the model's create shape, but only the fields supplied are set. Sending `{ status: 'published' }` leaves title untouched. Update is partial by contract — there is no generated full-replacement path to accidentally wipe a row.\n\n## The 204 Contract [#the-204-contract]\n\n`DELETE` resolves with 204 and no body. The typed client models this as a success with no payload, so `res.ok` is true and there is nothing to read. Consumers that expect a JSON body for deletions are expecting behavior the framework intentionally omits.\n\n## Custom Actions Depend on Permissions [#custom-actions-depend-on-permissions]\n\nA custom action carries its own `permission` key. Generated routes get theirs from the model option; custom actions declare their own per action — `posts.publish`, `reports.export` — and gate exactly that path. See [Authorization: permissions](/docs/authorization/permissions).\n\n## The Full Generated Surface [#the-full-generated-surface]\n\n| Method   | Path             | Purpose                   | Permission     |\n| -------- | ---------------- | ------------------------- | -------------- |\n| `GET`    | `/api/posts`     | list, filters, pagination | `posts.read`   |\n| `GET`    | `/api/posts/:id` | single record             | `posts.read`   |\n| `POST`   | `/api/posts`     | create                    | `posts.create` |\n| `PATCH`  | `/api/posts/:id` | partial update            | `posts.update` |\n| `DELETE` | `/api/posts/:id` | delete                    | `posts.delete` |\n\nForward relations expose nested paths such as `/api/posts/:id/comments` when the model declares them, and the generated client types those too.\n\n## Generated Serialization [#generated-serialization]\n\nResponses serialize through the model IR with `fields`, relations, and transforms applied — not raw rows. Paginated lists use the shared envelope; single resources serialize directly. The shape a consumer sees is the model IR, which is also what OpenAPI documents. See [Models](/docs/data/models).\n\n## What's Next [#whats-next]\n\n* [REST Conventions](/docs/api/rest) — the URL, status, and envelope contract\n* [Typed RPC](/docs/api/rpc) — call generated routes with full type inference\n* [Controllers](/docs/http/controllers) — `defineController` and custom actions\n* [Models](/docs/data/models) — the `defineModel` source of truth\n* [Permissions](/docs/authorization/permissions) — permission namespaces and enforcement\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Every model generates the same deterministic set of endpoints. Count on it: five routes per model, identical for a blog post or a billing invoice, because the routes are derived from the model file rather than declared by hand. Tooling, Studio, documentation, and the typed client all rely on this shape."
		},
		{
			"heading": void 0,
			"content": "Stability is the point. Because the five routes are always the same, an API consumer can predict the full surface of a new model without reading its source, and the framework can generate the schemas, the client methods, and the OpenAPI paths for every model mechanically."
		},
		{
			"heading": "the-five-routes",
			"content": "Method"
		},
		{
			"heading": "the-five-routes",
			"content": "Path"
		},
		{
			"heading": "the-five-routes",
			"content": "Request"
		},
		{
			"heading": "the-five-routes",
			"content": "Response"
		},
		{
			"heading": "the-five-routes",
			"content": "`GET`"
		},
		{
			"heading": "the-five-routes",
			"content": "`/api/posts`"
		},
		{
			"heading": "the-five-routes",
			"content": "query: `where`, `page`, `limit`, `orderBy`, `with`, `q`"
		},
		{
			"heading": "the-five-routes",
			"content": "`` `{ data, total, page, lastPage }` ``"
		},
		{
			"heading": "the-five-routes",
			"content": "`GET`"
		},
		{
			"heading": "the-five-routes",
			"content": "`/api/posts/:id`"
		},
		{
			"heading": "the-five-routes",
			"content": "—"
		},
		{
			"heading": "the-five-routes",
			"content": "`Post`"
		},
		{
			"heading": "the-five-routes",
			"content": "`POST`"
		},
		{
			"heading": "the-five-routes",
			"content": "`/api/posts`"
		},
		{
			"heading": "the-five-routes",
			"content": "validated body"
		},
		{
			"heading": "the-five-routes",
			"content": "`Post` (201)"
		},
		{
			"heading": "the-five-routes",
			"content": "`PATCH`"
		},
		{
			"heading": "the-five-routes",
			"content": "`/api/posts/:id`"
		},
		{
			"heading": "the-five-routes",
			"content": "validated partial body"
		},
		{
			"heading": "the-five-routes",
			"content": "`Post`"
		},
		{
			"heading": "the-five-routes",
			"content": "`DELETE`"
		},
		{
			"heading": "the-five-routes",
			"content": "`/api/posts/:id`"
		},
		{
			"heading": "the-five-routes",
			"content": "—"
		},
		{
			"heading": "the-five-routes",
			"content": "204"
		},
		{
			"heading": "the-five-routes",
			"content": "Requests, bodies, and responses are fully typed — because they all derive from `defineModel` and the same route manifest that feeds the client, Studio, OpenAPI, and MCP tools."
		},
		{
			"heading": "where-the-routes-come-from",
			"content": "Generated routes come from a single model file:"
		},
		{
			"heading": "where-the-routes-come-from",
			"content": "Change the model and every generated route, its schema, and its client signature change together. There is no separate route file to update and no drift to fix."
		},
		{
			"heading": "reading-a-list",
			"content": "The list route accepts `where`, `page`, `limit`, `orderBy`, `with`, and `q` as query parameters:"
		},
		{
			"heading": "reading-a-list",
			"content": "Prefer the typed client for structured queries — filters are checked against the model at compile time:"
		},
		{
			"heading": "reading-a-list",
			"content": "The `where` argument is schema-checked against the model; unknown fields return a `VALIDATION` error. The `with` argument accepts only declared relations. The pagination contract — `page`, `limit`, `orderBy`, `q` — is validated the same way. See REST conventions: pagination and Data: pagination."
		},
		{
			"heading": "create-and-update",
			"content": "`POST` and `PATCH` carry validated bodies from the model's field DSL and any route-level schemas:"
		},
		{
			"heading": "create-and-update",
			"content": "`PATCH` is a partial update — send only the fields you change. A `PATCH` body is validated as a partial of the model: fields present are checked against the field DSL, and fields omitted are left untouched. `POST` validates a full create shape, applying model defaults for anything not supplied."
		},
		{
			"heading": "custom-actions",
			"content": "The five routes are the baseline, not the ceiling. Add application-specific actions with a controller:"
		},
		{
			"heading": "custom-actions",
			"content": "This mounts `POST /api/posts/:id/publish`, validates the optional body, and appears in OpenAPI and the typed client exactly like a generated route. A custom action adds to the deterministic five — the shape you can count on, plus the behavior you actually need."
		},
		{
			"heading": "permission-gating",
			"content": "Every generated route is gated by the model's `permission` option:"
		},
		{
			"heading": "permission-gating",
			"content": "`permission: 'posts'` requires `posts.read`, `posts.create`, `posts.update`, `posts.delete` for the corresponding routes."
		},
		{
			"heading": "permission-gating",
			"content": "`permission: false` disables gating entirely — use for fully public models."
		},
		{
			"heading": "permission-gating",
			"content": "Permission checks run through `definePolicy` in the `onBeforeHandle` stage of the request lifecycle, after validation, so a policy can make decisions against the validated body. The same namespace gates Studio screens and MCP tools, so one decision surface governs every entry point. See Authorization: permissions and Authorization: enforcement."
		},
		{
			"heading": "permission-gating",
			"content": "> \\[!NOTE]\n> The five list, get, create, update, and delete operations map to `posts.read`, `posts.read`, `posts.create`, `posts.update`, and `posts.delete`. A missing session maps to `UNAUTHORIZED`; a present session without the ability maps to `FORBIDDEN`; both return before the route executes."
		},
		{
			"heading": "generated-routes-and-the-manifest",
			"content": "Generated routes are first-class manifest entries. They carry path, method, schemas, response types, permission, and tags into the same intermediate representation as every controller route — which is why the typed client offers `client.posts.list`, `/docs` documents them, and MCP exposes them as tools without any per-route wiring."
		},
		{
			"heading": "deterministic-routing-by-model-name",
			"content": "The routes derive their paths from the model name: `posts` produces `/api/posts`, `blog-posts` produces `/api/blog-posts`. The client methods (`client.posts.list`, `client.posts.get`) follow the same naming, and Studio organizes by the same identity. One name, five routes, everywhere consistent."
		},
		{
			"heading": "list-filtering-and-eager-loading",
			"content": "`where` accepts the model's fields as filter keys; `with` accepts only declared relations. Both are schema-checked before the query builder runs, so a malformed filter returns `VALIDATION` instead of executing. See Data: queries for the full filter surface."
		},
		{
			"heading": "partial-updates",
			"content": "`PATCH` validates as a partial: the body is checked against the model's create shape, but only the fields supplied are set. Sending `{ status: 'published' }` leaves title untouched. Update is partial by contract — there is no generated full-replacement path to accidentally wipe a row."
		},
		{
			"heading": "the-204-contract",
			"content": "`DELETE` resolves with 204 and no body. The typed client models this as a success with no payload, so `res.ok` is true and there is nothing to read. Consumers that expect a JSON body for deletions are expecting behavior the framework intentionally omits."
		},
		{
			"heading": "custom-actions-depend-on-permissions",
			"content": "A custom action carries its own `permission` key. Generated routes get theirs from the model option; custom actions declare their own per action — `posts.publish`, `reports.export` — and gate exactly that path. See Authorization: permissions."
		},
		{
			"heading": "the-full-generated-surface",
			"content": "Method"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "Path"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "Purpose"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "Permission"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`GET`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`/api/posts`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "list, filters, pagination"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`posts.read`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`GET`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`/api/posts/:id`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "single record"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`posts.read`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`POST`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`/api/posts`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "create"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`posts.create`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`PATCH`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`/api/posts/:id`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "partial update"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`posts.update`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`DELETE`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`/api/posts/:id`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "delete"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "`posts.delete`"
		},
		{
			"heading": "the-full-generated-surface",
			"content": "Forward relations expose nested paths such as `/api/posts/:id/comments` when the model declares them, and the generated client types those too."
		},
		{
			"heading": "generated-serialization",
			"content": "Responses serialize through the model IR with `fields`, relations, and transforms applied — not raw rows. Paginated lists use the shared envelope; single resources serialize directly. The shape a consumer sees is the model IR, which is also what OpenAPI documents. See Models."
		},
		{
			"heading": "whats-next",
			"content": "REST Conventions — the URL, status, and envelope contract"
		},
		{
			"heading": "whats-next",
			"content": "Typed RPC — call generated routes with full type inference"
		},
		{
			"heading": "whats-next",
			"content": "Controllers — `defineController` and custom actions"
		},
		{
			"heading": "whats-next",
			"content": "Models — the `defineModel` source of truth"
		},
		{
			"heading": "whats-next",
			"content": "Permissions — permission namespaces and enforcement"
		}
	],
	"headings": [
		{
			"id": "the-five-routes",
			"content": "The Five Routes"
		},
		{
			"id": "where-the-routes-come-from",
			"content": "Where the Routes Come From"
		},
		{
			"id": "reading-a-list",
			"content": "Reading a List"
		},
		{
			"id": "create-and-update",
			"content": "Create and Update"
		},
		{
			"id": "custom-actions",
			"content": "Custom Actions"
		},
		{
			"id": "permission-gating",
			"content": "Permission Gating"
		},
		{
			"id": "generated-routes-and-the-manifest",
			"content": "Generated Routes and the Manifest"
		},
		{
			"id": "deterministic-routing-by-model-name",
			"content": "Deterministic Routing by Model Name"
		},
		{
			"id": "list-filtering-and-eager-loading",
			"content": "List Filtering and Eager Loading"
		},
		{
			"id": "partial-updates",
			"content": "Partial Updates"
		},
		{
			"id": "the-204-contract",
			"content": "The 204 Contract"
		},
		{
			"id": "custom-actions-depend-on-permissions",
			"content": "Custom Actions Depend on Permissions"
		},
		{
			"id": "the-full-generated-surface",
			"content": "The Full Generated Surface"
		},
		{
			"id": "generated-serialization",
			"content": "Generated Serialization"
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
		url: "#the-five-routes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Five Routes" })
	},
	{
		depth: 2,
		url: "#where-the-routes-come-from",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where the Routes Come From" })
	},
	{
		depth: 2,
		url: "#reading-a-list",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Reading a List" })
	},
	{
		depth: 2,
		url: "#create-and-update",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Create and Update" })
	},
	{
		depth: 2,
		url: "#custom-actions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Custom Actions" })
	},
	{
		depth: 2,
		url: "#permission-gating",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Permission Gating" })
	},
	{
		depth: 2,
		url: "#generated-routes-and-the-manifest",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generated Routes and the Manifest" })
	},
	{
		depth: 2,
		url: "#deterministic-routing-by-model-name",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Deterministic Routing by Model Name" })
	},
	{
		depth: 2,
		url: "#list-filtering-and-eager-loading",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "List Filtering and Eager Loading" })
	},
	{
		depth: 2,
		url: "#partial-updates",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Partial Updates" })
	},
	{
		depth: 2,
		url: "#the-204-contract",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The 204 Contract" })
	},
	{
		depth: 2,
		url: "#custom-actions-depend-on-permissions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Custom Actions Depend on Permissions" })
	},
	{
		depth: 2,
		url: "#the-full-generated-surface",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Full Generated Surface" })
	},
	{
		depth: 2,
		url: "#generated-serialization",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generated Serialization" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every model generates the same deterministic set of endpoints. Count on it: five routes per model, identical for a blog post or a billing invoice, because the routes are derived from the model file rather than declared by hand. Tooling, Studio, documentation, and the typed client all rely on this shape." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Stability is the point. Because the five routes are always the same, an API consumer can predict the full surface of a new model without reading its source, and the framework can generate the schemas, the client methods, and the OpenAPI paths for every model mechanically." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-five-routes",
			children: "The Five Routes"
		}),
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
					"query: ",
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Requests, bodies, and responses are fully typed — because they all derive from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" and the same route manifest that feeds the client, Studio, OpenAPI, and MCP tools."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-the-routes-come-from",
			children: "Where the Routes Come From"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Generated routes come from a single model file:" }),
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
							children: "  body: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "text"
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
							children: "optional"
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
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'archived'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  publishedAt: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "timestamp"
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
							children: "optional"
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
							children: "  authorId: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "uuid"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  author: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "belongsTo"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(() "
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
							children: " User),"
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
							children: "  comments: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "hasMany"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(() "
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
							children: " Comment),"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Change the model and every generated route, its schema, and its client signature change together. There is no separate route file to update and no drift to fix." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "reading-a-list",
			children: "Reading a List"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The list route accepts ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "page" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "limit" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "orderBy" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "with" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "q" }),
			" as query parameters:"
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
			title: "reading-a-list.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "GET /api/posts?page=1&limit=20" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Prefer the typed client for structured queries — filters are checked against the model at compile time:" }),
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
			title: "reading-a-list-2.ts",
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
							children: "  where: { status: "
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
							children: "  with: ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'comments'"
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
							children: "  page: "
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
							children: "  limit: "
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
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
			" argument is schema-checked against the model; unknown fields return a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "VALIDATION" }),
			" error. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "with" }),
			" argument accepts only declared relations. The pagination contract — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "page" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "limit" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "orderBy" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "q" }),
			" — is validated the same way. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rest",
				children: "REST conventions: pagination"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/pagination",
				children: "Data: pagination"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "create-and-update",
			children: "Create and Update"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PATCH" }),
			" carry validated bodies from the model's field DSL and any route-level schemas:"
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
			title: "create-and-update.ts",
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " created"
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
							children: "create"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ title: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Hello'"
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
							children: " updated"
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
							children: "update"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(id, { status: "
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
							children: " })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PATCH" }),
			" is a partial update — send only the fields you change. A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PATCH" }),
			" body is validated as a partial of the model: fields present are checked against the field DSL, and fields omitted are left untouched. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST" }),
			" validates a full create shape, applying model defaults for anything not supplied."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "custom-actions",
			children: "Custom Actions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The five routes are the baseline, not the ceiling. Add application-specific actions with a controller:" }),
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
							children: "    body: { note: "
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This mounts ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST /api/posts/:id/publish" }),
			", validates the optional body, and appears in OpenAPI and the typed client exactly like a generated route. A custom action adds to the deterministic five — the shape you can count on, plus the behavior you actually need."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "permission-gating",
			children: "Permission Gating"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every generated route is gated by the model's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" option:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission: 'posts'" }),
				" requires ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.read" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.create" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.update" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.delete" }),
				" for the corresponding routes."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission: false" }), " disables gating entirely — use for fully public models."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Permission checks run through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			" in the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onBeforeHandle" }),
			" stage of the request lifecycle, after validation, so a policy can make decisions against the validated body. The same namespace gates Studio screens and MCP tools, so one decision surface governs every entry point. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/permissions",
				children: "Authorization: permissions"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/enforcement",
				children: "Authorization: enforcement"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nThe five list, get, create, update, and delete operations map to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.read" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.read" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.create" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.update" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.delete" }),
				". A missing session maps to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "UNAUTHORIZED" }),
				"; a present session without the ability maps to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "FORBIDDEN" }),
				"; both return before the route executes."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generated-routes-and-the-manifest",
			children: "Generated Routes and the Manifest"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Generated routes are first-class manifest entries. They carry path, method, schemas, response types, permission, and tags into the same intermediate representation as every controller route — which is why the typed client offers ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.list" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/docs" }),
			" documents them, and MCP exposes them as tools without any per-route wiring."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "deterministic-routing-by-model-name",
			children: "Deterministic Routing by Model Name"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The routes derive their paths from the model name: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
			" produces ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "blog-posts" }),
			" produces ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/blog-posts" }),
			". The client methods (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.list" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.get" }),
			") follow the same naming, and Studio organizes by the same identity. One name, five routes, everywhere consistent."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "list-filtering-and-eager-loading",
			children: "List Filtering and Eager Loading"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
			" accepts the model's fields as filter keys; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "with" }),
			" accepts only declared relations. Both are schema-checked before the query builder runs, so a malformed filter returns ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "VALIDATION" }),
			" instead of executing. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/queries",
				children: "Data: queries"
			}),
			" for the full filter surface."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "partial-updates",
			children: "Partial Updates"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PATCH" }),
			" validates as a partial: the body is checked against the model's create shape, but only the fields supplied are set. Sending ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ status: 'published' }" }),
			" leaves title untouched. Update is partial by contract — there is no generated full-replacement path to accidentally wipe a row."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-204-contract",
			children: "The 204 Contract"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DELETE" }),
			" resolves with 204 and no body. The typed client models this as a success with no payload, so ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.ok" }),
			" is true and there is nothing to read. Consumers that expect a JSON body for deletions are expecting behavior the framework intentionally omits."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "custom-actions-depend-on-permissions",
			children: "Custom Actions Depend on Permissions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A custom action carries its own ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" key. Generated routes get theirs from the model option; custom actions declare their own per action — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "reports.export" }),
			" — and gate exactly that path. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/permissions",
				children: "Authorization: permissions"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-full-generated-surface",
			children: "The Full Generated Surface"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Method" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Path" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Permission" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "list, filters, pagination" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.read" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "single record" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.read" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "create" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.create" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PATCH" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "partial update" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.update" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DELETE" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "delete" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.delete" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Forward relations expose nested paths such as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id/comments" }),
			" when the model declares them, and the generated client types those too."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generated-serialization",
			children: "Generated Serialization"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Responses serialize through the model IR with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fields" }),
			", relations, and transforms applied — not raw rows. Paginated lists use the shared envelope; single resources serialize directly. The shape a consumer sees is the model IR, which is also what OpenAPI documents. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}),
			"."
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
				href: "/docs/api/rest",
				children: "REST Conventions"
			}), " — the URL, status, and envelope contract"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rpc",
				children: "Typed RPC"
			}), " — call generated routes with full type inference"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/controllers",
					children: "Controllers"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
				" and custom actions"
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
				href: "/docs/authorization/permissions",
				children: "Permissions"
			}), " — permission namespaces and enforcement"] }),
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
