import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/api/openapi.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "OpenAPI",
	"description": "Auto-generation from the route manifest, endpoints, spec shaping, and build artifacts."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nKwiva produces an OpenAPI 3.1 specification automatically — no annotations, no per-route plugins, no hand-written spec files. The document renders from the route manifest at boot, so it is correct by construction for every route your app exposes.\n\nThe spec is a projection, not a maintenance burden. Every path, schema, and error response in the document is derived from declarations that already exist, which is why the document cannot drift from the running API.\n\n## Where the Spec Comes From [#where-the-spec-comes-from]\n\nThe route manifest is the intermediate representation of every route: path, method, request and response schemas, permission, tags, and summary. `@kwiva/http` renders the OpenAPI document from it once at boot, not by visiting each route. Model schemas, enums, relations, pagination shapes, and error responses all derive from the same representation.\n\n```plaintext title=\"where-the-spec-comes-from.txt\"\nroute manifest ──► OpenAPI 3.1 ──► /openapi.json ──► /docs\n```\n\nBecause rendering happens from the IR rather than by inspecting live routes, the document is complete, stable, and identical across worker restarts.\n\n## Endpoints [#endpoints]\n\n| Path            | Purpose                                  |\n| --------------- | ---------------------------------------- |\n| `/openapi.json` | the generated specification              |\n| `/docs`         | interactive API documentation (optional) |\n\nThe interactive docs render against the generated spec with no additional setup. Paths in the document are relative to the API prefix.\n\n### What the document contains [#what-the-document-contains]\n\nBecause the document renders from the full route manifest, it is complete rather than minimal. For every operation it includes:\n\n* **Request schemas** — body, query, params, headers, and cookies from route validation.\n* **Response schemas** — the model shapes each route returns, including the paginated list envelope.\n* **Enums and relations** — model field types and declared relations as reusable components.\n* **Error responses** — the error taxonomy mapped onto the status codes each operation can produce.\n* **Metadata** — `summary`, `tags`, and `description` from controller and route options.\n\n## A Generated Path [#a-generated-path]\n\nA `posts` model and controller produce entries like this:\n\n```json title=\"a-generated-path.json\"\n{\n  \"/posts\": {\n    \"get\": {\n      \"tags\": [\"posts\"],\n      \"summary\": \"List posts\",\n      \"responses\": {\n        \"200\": { \"description\": \"Paginated list of posts\" }\n      }\n    }\n  }\n}\n```\n\nEvery property in the document flows from an actual declaration — nothing is guessed and nothing is hard-coded.\n\n## Shaping the Spec [#shaping-the-spec]\n\nThe spec improves as you add metadata to declarations:\n\n* **Controller level** — `tags` and `prefix` from `defineController` organize operations.\n* **Route level** — `summary`, `tags`, and `description` on a handler flow directly into OpenAPI.\n* **Model level** — field `description()` flows into the schema descriptions.\n\n```ts title=\"shaping-the-spec.ts\"\ndefineController('posts', (c) => ({\n  publish: c.post('/:id/publish', async ({ params }) => {\n    // ...\n  }, {\n    summary: 'Publish a post',\n    description: 'Transitions a draft post to published.',\n    permission: 'posts.publish',\n  }),\n}), { prefix: '/posts', tags: ['posts'] })\n```\n\nDescriptions are worth writing well: they are the copy human readers of your API documentation see. Model fields without a `description()` still appear in the spec, typed from the field DSL — metadata only ever enriches the document, never gates it.\n\n> \\[!TIP]\n> Write the `description` next to the route — it rides the same option object as permission and schemas — rather than in a separate file. The declaration is where you will find it six months later, and the spec inherits it without any republishing step.\n\n## Error Responses in the Spec [#error-responses-in-the-spec]\n\nEach operation documents the failure codes its stage can produce. Validation-bearing routes declare the 422 `VALIDATION` response with the field-mapped `issues` shape; permission-bearing routes declare `UNAUTHORIZED` and `FORBIDDEN`. Consumers of the document get the same taxonomy contract the typed client enforces at compile time. See [API Errors](/docs/api/errors).\n\n## Build Artifact [#build-artifact]\n\nEmit the spec as a build artifact for external consumers:\n\n```bash title=\"terminal\"\nkwiva build --docs\n```\n\nThe produced OpenAPI document can be checked into a contract registry, fed into API testing, or handed to consumer tooling that expects a static spec.\n\n## Zero Maintenance [#zero-maintenance]\n\nBecause the document is derived, it can never drift:\n\n* Add a field to a model → schemas and responses update.\n* Add a route → a path object appears.\n* Change validation → request schemas follow.\n* Remove a route → the path object disappears.\n\nNothing in the OpenAPI spec is ever hand-edited, and there is no separate spec file to remember to update. The model and controller declarations are the single source of truth.\n\n## OpenAPI, Client, and MCP [#openapi-client-and-mcp]\n\nThe same manifest that renders the spec also types the client and drives MCP tools. A change to a route lands in `/openapi.json`, in the RPC client's method signatures, and in the exposed agent tools simultaneously — three surfaces, one upstream declaration.\n\n## OpenAPI 3.1 [#openapi-31]\n\nThe emitted document targets OpenAPI 3.1, which brings JSON Schema 2020-12 semantics: nullable fields, single-type arrays, and `oneOf` unions render from the model IR without the 3.0 workarounds older tooling needed.\n\n## Security Schemes [#security-schemes]\n\nAuthentication surfaces appear in the document. Cookie-based session auth is declared for the routes it protects and bearer auth for `jwt`-strategy APIs, so consumers can see which operations require a session and which are public. See [API Authentication](/docs/api/authentication).\n\n## Reusable Components [#reusable-components]\n\nModel schemas, enums, and relation shapes are emitted as components and referenced by operations, which keeps the document small and the schemas consistent. The paginated list envelope is a shared component too, so every list endpoint references one definition instead of repeating it.\n\n## Tags and Grouping [#tags-and-grouping]\n\n`tags` from controllers and models organize operations in both `/docs` and external tooling. A controller's `tags` option groups its routes; model routes group under the model name. See [Controllers: per-route options](/docs/http/controllers).\n\n## Programmatic Consumption [#programmatic-consumption]\n\nBecause `/openapi.json` is a static document, any OpenAPI tool — client generators, contract testing, gateway configuration, mock servers — reads it directly. `kwiva build --docs` emits the same document as a file for registries and CI checks. See [API Testing](/docs/testing/api-testing).\n\n## OpenAPI and the Rest [#openapi-and-the-rest]\n\nThe specification describes REST first — generated CRUD, custom actions, and pure REST controllers — plus streaming operations where the handler declares them, and WebSocket handshakes as upgrade operations. Each operation is tagged by its controller or model, so grouping is consistent from the CLI to `/docs`. See [API Overview](/docs/api).\n\n## The Document Is Reproducible [#the-document-is-reproducible]\n\nThe document is fully derived from code and config: identical inputs produce an identical spec. That reproducibility is what lets CI compare a committed spec against a regenerated one — a diff means a route, schema, or tag changed somewhere. Teams that gate on the spec can fail the build when the diff is unplanned. See [API Testing](/docs/testing/api-testing).\n\n## Your Schema vs OpenAPI [#your-schema-vs-openapi]\n\nYour schema declarations are the source for components. `defineModel` field types, enum values, `min`, `max`, `optional`, and relation shapes are the only vocabulary OpenAPI needs — there is no parallel spec-authoring step. Custom types surface as referenceable components rather than inline copies. See [Models](/docs/data/models).\n\n## What's Next [#whats-next]\n\n* [Generated Endpoints](/docs/api/generated-endpoints) — the routes described by the spec\n* [REST Conventions](/docs/api/rest) — the contract the spec documents\n* [Model IR](/docs/advanced/model-ir) — the representation behind the document\n* [Controllers](/docs/http/controllers) — `summary`, `tags`, and `description`\n* [Models](/docs/data/models) — field `description()` and schema derivation\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva produces an OpenAPI 3.1 specification automatically — no annotations, no per-route plugins, no hand-written spec files. The document renders from the route manifest at boot, so it is correct by construction for every route your app exposes."
		},
		{
			"heading": void 0,
			"content": "The spec is a projection, not a maintenance burden. Every path, schema, and error response in the document is derived from declarations that already exist, which is why the document cannot drift from the running API."
		},
		{
			"heading": "where-the-spec-comes-from",
			"content": "The route manifest is the intermediate representation of every route: path, method, request and response schemas, permission, tags, and summary. `@kwiva/http` renders the OpenAPI document from it once at boot, not by visiting each route. Model schemas, enums, relations, pagination shapes, and error responses all derive from the same representation."
		},
		{
			"heading": "where-the-spec-comes-from",
			"content": "Because rendering happens from the IR rather than by inspecting live routes, the document is complete, stable, and identical across worker restarts."
		},
		{
			"heading": "endpoints",
			"content": "Path"
		},
		{
			"heading": "endpoints",
			"content": "Purpose"
		},
		{
			"heading": "endpoints",
			"content": "`/openapi.json`"
		},
		{
			"heading": "endpoints",
			"content": "the generated specification"
		},
		{
			"heading": "endpoints",
			"content": "`/docs`"
		},
		{
			"heading": "endpoints",
			"content": "interactive API documentation (optional)"
		},
		{
			"heading": "endpoints",
			"content": "The interactive docs render against the generated spec with no additional setup. Paths in the document are relative to the API prefix."
		},
		{
			"heading": "what-the-document-contains",
			"content": "Because the document renders from the full route manifest, it is complete rather than minimal. For every operation it includes:"
		},
		{
			"heading": "what-the-document-contains",
			"content": "**Request schemas** — body, query, params, headers, and cookies from route validation."
		},
		{
			"heading": "what-the-document-contains",
			"content": "**Response schemas** — the model shapes each route returns, including the paginated list envelope."
		},
		{
			"heading": "what-the-document-contains",
			"content": "**Enums and relations** — model field types and declared relations as reusable components."
		},
		{
			"heading": "what-the-document-contains",
			"content": "**Error responses** — the error taxonomy mapped onto the status codes each operation can produce."
		},
		{
			"heading": "what-the-document-contains",
			"content": "**Metadata** — `summary`, `tags`, and `description` from controller and route options."
		},
		{
			"heading": "a-generated-path",
			"content": "A `posts` model and controller produce entries like this:"
		},
		{
			"heading": "a-generated-path",
			"content": "Every property in the document flows from an actual declaration — nothing is guessed and nothing is hard-coded."
		},
		{
			"heading": "shaping-the-spec",
			"content": "The spec improves as you add metadata to declarations:"
		},
		{
			"heading": "shaping-the-spec",
			"content": "**Controller level** — `tags` and `prefix` from `defineController` organize operations."
		},
		{
			"heading": "shaping-the-spec",
			"content": "**Route level** — `summary`, `tags`, and `description` on a handler flow directly into OpenAPI."
		},
		{
			"heading": "shaping-the-spec",
			"content": "**Model level** — field `description()` flows into the schema descriptions."
		},
		{
			"heading": "shaping-the-spec",
			"content": "Descriptions are worth writing well: they are the copy human readers of your API documentation see. Model fields without a `description()` still appear in the spec, typed from the field DSL — metadata only ever enriches the document, never gates it."
		},
		{
			"heading": "shaping-the-spec",
			"content": "> \\[!TIP]\n> Write the `description` next to the route — it rides the same option object as permission and schemas — rather than in a separate file. The declaration is where you will find it six months later, and the spec inherits it without any republishing step."
		},
		{
			"heading": "error-responses-in-the-spec",
			"content": "Each operation documents the failure codes its stage can produce. Validation-bearing routes declare the 422 `VALIDATION` response with the field-mapped `issues` shape; permission-bearing routes declare `UNAUTHORIZED` and `FORBIDDEN`. Consumers of the document get the same taxonomy contract the typed client enforces at compile time. See API Errors."
		},
		{
			"heading": "build-artifact",
			"content": "Emit the spec as a build artifact for external consumers:"
		},
		{
			"heading": "build-artifact",
			"content": "The produced OpenAPI document can be checked into a contract registry, fed into API testing, or handed to consumer tooling that expects a static spec."
		},
		{
			"heading": "zero-maintenance",
			"content": "Because the document is derived, it can never drift:"
		},
		{
			"heading": "zero-maintenance",
			"content": "Add a field to a model → schemas and responses update."
		},
		{
			"heading": "zero-maintenance",
			"content": "Add a route → a path object appears."
		},
		{
			"heading": "zero-maintenance",
			"content": "Change validation → request schemas follow."
		},
		{
			"heading": "zero-maintenance",
			"content": "Remove a route → the path object disappears."
		},
		{
			"heading": "zero-maintenance",
			"content": "Nothing in the OpenAPI spec is ever hand-edited, and there is no separate spec file to remember to update. The model and controller declarations are the single source of truth."
		},
		{
			"heading": "openapi-client-and-mcp",
			"content": "The same manifest that renders the spec also types the client and drives MCP tools. A change to a route lands in `/openapi.json`, in the RPC client's method signatures, and in the exposed agent tools simultaneously — three surfaces, one upstream declaration."
		},
		{
			"heading": "openapi-31",
			"content": "The emitted document targets OpenAPI 3.1, which brings JSON Schema 2020-12 semantics: nullable fields, single-type arrays, and `oneOf` unions render from the model IR without the 3.0 workarounds older tooling needed."
		},
		{
			"heading": "security-schemes",
			"content": "Authentication surfaces appear in the document. Cookie-based session auth is declared for the routes it protects and bearer auth for `jwt`-strategy APIs, so consumers can see which operations require a session and which are public. See API Authentication."
		},
		{
			"heading": "reusable-components",
			"content": "Model schemas, enums, and relation shapes are emitted as components and referenced by operations, which keeps the document small and the schemas consistent. The paginated list envelope is a shared component too, so every list endpoint references one definition instead of repeating it."
		},
		{
			"heading": "tags-and-grouping",
			"content": "`tags` from controllers and models organize operations in both `/docs` and external tooling. A controller's `tags` option groups its routes; model routes group under the model name. See Controllers: per-route options."
		},
		{
			"heading": "programmatic-consumption",
			"content": "Because `/openapi.json` is a static document, any OpenAPI tool — client generators, contract testing, gateway configuration, mock servers — reads it directly. `kwiva build --docs` emits the same document as a file for registries and CI checks. See API Testing."
		},
		{
			"heading": "openapi-and-the-rest",
			"content": "The specification describes REST first — generated CRUD, custom actions, and pure REST controllers — plus streaming operations where the handler declares them, and WebSocket handshakes as upgrade operations. Each operation is tagged by its controller or model, so grouping is consistent from the CLI to `/docs`. See API Overview."
		},
		{
			"heading": "the-document-is-reproducible",
			"content": "The document is fully derived from code and config: identical inputs produce an identical spec. That reproducibility is what lets CI compare a committed spec against a regenerated one — a diff means a route, schema, or tag changed somewhere. Teams that gate on the spec can fail the build when the diff is unplanned. See API Testing."
		},
		{
			"heading": "your-schema-vs-openapi",
			"content": "Your schema declarations are the source for components. `defineModel` field types, enum values, `min`, `max`, `optional`, and relation shapes are the only vocabulary OpenAPI needs — there is no parallel spec-authoring step. Custom types surface as referenceable components rather than inline copies. See Models."
		},
		{
			"heading": "whats-next",
			"content": "Generated Endpoints — the routes described by the spec"
		},
		{
			"heading": "whats-next",
			"content": "REST Conventions — the contract the spec documents"
		},
		{
			"heading": "whats-next",
			"content": "Model IR — the representation behind the document"
		},
		{
			"heading": "whats-next",
			"content": "Controllers — `summary`, `tags`, and `description`"
		},
		{
			"heading": "whats-next",
			"content": "Models — field `description()` and schema derivation"
		}
	],
	"headings": [
		{
			"id": "where-the-spec-comes-from",
			"content": "Where the Spec Comes From"
		},
		{
			"id": "endpoints",
			"content": "Endpoints"
		},
		{
			"id": "what-the-document-contains",
			"content": "What the document contains"
		},
		{
			"id": "a-generated-path",
			"content": "A Generated Path"
		},
		{
			"id": "shaping-the-spec",
			"content": "Shaping the Spec"
		},
		{
			"id": "error-responses-in-the-spec",
			"content": "Error Responses in the Spec"
		},
		{
			"id": "build-artifact",
			"content": "Build Artifact"
		},
		{
			"id": "zero-maintenance",
			"content": "Zero Maintenance"
		},
		{
			"id": "openapi-client-and-mcp",
			"content": "OpenAPI, Client, and MCP"
		},
		{
			"id": "openapi-31",
			"content": "OpenAPI 3.1"
		},
		{
			"id": "security-schemes",
			"content": "Security Schemes"
		},
		{
			"id": "reusable-components",
			"content": "Reusable Components"
		},
		{
			"id": "tags-and-grouping",
			"content": "Tags and Grouping"
		},
		{
			"id": "programmatic-consumption",
			"content": "Programmatic Consumption"
		},
		{
			"id": "openapi-and-the-rest",
			"content": "OpenAPI and the Rest"
		},
		{
			"id": "the-document-is-reproducible",
			"content": "The Document Is Reproducible"
		},
		{
			"id": "your-schema-vs-openapi",
			"content": "Your Schema vs OpenAPI"
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
		url: "#where-the-spec-comes-from",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where the Spec Comes From" })
	},
	{
		depth: 2,
		url: "#endpoints",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Endpoints" })
	},
	{
		depth: 3,
		url: "#what-the-document-contains",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What the document contains" })
	},
	{
		depth: 2,
		url: "#a-generated-path",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "A Generated Path" })
	},
	{
		depth: 2,
		url: "#shaping-the-spec",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Shaping the Spec" })
	},
	{
		depth: 2,
		url: "#error-responses-in-the-spec",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Error Responses in the Spec" })
	},
	{
		depth: 2,
		url: "#build-artifact",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Build Artifact" })
	},
	{
		depth: 2,
		url: "#zero-maintenance",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Zero Maintenance" })
	},
	{
		depth: 2,
		url: "#openapi-client-and-mcp",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "OpenAPI, Client, and MCP" })
	},
	{
		depth: 2,
		url: "#openapi-31",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "OpenAPI 3.1" })
	},
	{
		depth: 2,
		url: "#security-schemes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Security Schemes" })
	},
	{
		depth: 2,
		url: "#reusable-components",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Reusable Components" })
	},
	{
		depth: 2,
		url: "#tags-and-grouping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Tags and Grouping" })
	},
	{
		depth: 2,
		url: "#programmatic-consumption",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Programmatic Consumption" })
	},
	{
		depth: 2,
		url: "#openapi-and-the-rest",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "OpenAPI and the Rest" })
	},
	{
		depth: 2,
		url: "#the-document-is-reproducible",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Document Is Reproducible" })
	},
	{
		depth: 2,
		url: "#your-schema-vs-openapi",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Your Schema vs OpenAPI" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva produces an OpenAPI 3.1 specification automatically — no annotations, no per-route plugins, no hand-written spec files. The document renders from the route manifest at boot, so it is correct by construction for every route your app exposes." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The spec is a projection, not a maintenance burden. Every path, schema, and error response in the document is derived from declarations that already exist, which is why the document cannot drift from the running API." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-the-spec-comes-from",
			children: "Where the Spec Comes From"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The route manifest is the intermediate representation of every route: path, method, request and response schemas, permission, tags, and summary. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
			" renders the OpenAPI document from it once at boot, not by visiting each route. Model schemas, enums, relations, pagination shapes, and error responses all derive from the same representation."
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
			title: "where-the-spec-comes-from.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "route manifest ──► OpenAPI 3.1 ──► /openapi.json ──► /docs" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because rendering happens from the IR rather than by inspecting live routes, the document is complete, stable, and identical across worker restarts." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "endpoints",
			children: "Endpoints"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Path" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/openapi.json" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "the generated specification" })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/docs" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "interactive API documentation (optional)" })] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The interactive docs render against the generated spec with no additional setup. Paths in the document are relative to the API prefix." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "what-the-document-contains",
			children: "What the document contains"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the document renders from the full route manifest, it is complete rather than minimal. For every operation it includes:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Request schemas" }), " — body, query, params, headers, and cookies from route validation."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Response schemas" }), " — the model shapes each route returns, including the paginated list envelope."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Enums and relations" }), " — model field types and declared relations as reusable components."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Error responses" }), " — the error taxonomy mapped onto the status codes each operation can produce."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Metadata" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "summary" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tags" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "description" }),
				" from controller and route options."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "a-generated-path",
			children: "A Generated Path"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
			" model and controller produce entries like this:"
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
			title: "a-generated-path.json",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "{"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "  \"/posts\""
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": {"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "    \"get\""
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": {"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "      \"tags\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"posts\""
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "      \"summary\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"List posts\""
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
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "      \"responses\""
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": {"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "        \"200\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "\"description\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"Paginated list of posts\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }"
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
						children: "      }"
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
						children: "    }"
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
						children: "}"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every property in the document flows from an actual declaration — nothing is guessed and nothing is hard-coded." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "shaping-the-spec",
			children: "Shaping the Spec"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The spec improves as you add metadata to declarations:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Controller level" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tags" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prefix" }),
				" from ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
				" organize operations."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Route level" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "summary" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tags" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "description" }),
				" on a handler flow directly into OpenAPI."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Model level" }),
				" — field ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "description()" }),
				" flows into the schema descriptions."
			] }),
			"\n"
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
			title: "shaping-the-spec.ts",
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
							children: "defineController"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "    // ..."
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
							children: "    summary: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Publish a post'"
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
							children: "    description: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Transitions a draft post to published.'"
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
			"Descriptions are worth writing well: they are the copy human readers of your API documentation see. Model fields without a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "description()" }),
			" still appear in the spec, typed from the field DSL — metadata only ever enriches the document, never gates it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!TIP]\nWrite the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "description" }),
				" next to the route — it rides the same option object as permission and schemas — rather than in a separate file. The declaration is where you will find it six months later, and the spec inherits it without any republishing step."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "error-responses-in-the-spec",
			children: "Error Responses in the Spec"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each operation documents the failure codes its stage can produce. Validation-bearing routes declare the 422 ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "VALIDATION" }),
			" response with the field-mapped ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "issues" }),
			" shape; permission-bearing routes declare ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "UNAUTHORIZED" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "FORBIDDEN" }),
			". Consumers of the document get the same taxonomy contract the typed client enforces at compile time. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/errors",
				children: "API Errors"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "build-artifact",
			children: "Build Artifact"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Emit the spec as a build artifact for external consumers:" }),
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
			title: "terminal",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "kwiva"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " build"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: " --docs"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The produced OpenAPI document can be checked into a contract registry, fed into API testing, or handed to consumer tooling that expects a static spec." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "zero-maintenance",
			children: "Zero Maintenance"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the document is derived, it can never drift:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Add a field to a model → schemas and responses update." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Add a route → a path object appears." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Change validation → request schemas follow." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Remove a route → the path object disappears." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Nothing in the OpenAPI spec is ever hand-edited, and there is no separate spec file to remember to update. The model and controller declarations are the single source of truth." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "openapi-client-and-mcp",
			children: "OpenAPI, Client, and MCP"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same manifest that renders the spec also types the client and drives MCP tools. A change to a route lands in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/openapi.json" }),
			", in the RPC client's method signatures, and in the exposed agent tools simultaneously — three surfaces, one upstream declaration."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "openapi-31",
			children: "OpenAPI 3.1"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The emitted document targets OpenAPI 3.1, which brings JSON Schema 2020-12 semantics: nullable fields, single-type arrays, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "oneOf" }),
			" unions render from the model IR without the 3.0 workarounds older tooling needed."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "security-schemes",
			children: "Security Schemes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Authentication surfaces appear in the document. Cookie-based session auth is declared for the routes it protects and bearer auth for ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "jwt" }),
			"-strategy APIs, so consumers can see which operations require a session and which are public. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/authentication",
				children: "API Authentication"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "reusable-components",
			children: "Reusable Components"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Model schemas, enums, and relation shapes are emitted as components and referenced by operations, which keeps the document small and the schemas consistent. The paginated list envelope is a shared component too, so every list endpoint references one definition instead of repeating it." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "tags-and-grouping",
			children: "Tags and Grouping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tags" }),
			" from controllers and models organize operations in both ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/docs" }),
			" and external tooling. A controller's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tags" }),
			" option groups its routes; model routes group under the model name. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/controllers",
				children: "Controllers: per-route options"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "programmatic-consumption",
			children: "Programmatic Consumption"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/openapi.json" }),
			" is a static document, any OpenAPI tool — client generators, contract testing, gateway configuration, mock servers — reads it directly. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --docs" }),
			" emits the same document as a file for registries and CI checks. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/api-testing",
				children: "API Testing"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "openapi-and-the-rest",
			children: "OpenAPI and the Rest"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The specification describes REST first — generated CRUD, custom actions, and pure REST controllers — plus streaming operations where the handler declares them, and WebSocket handshakes as upgrade operations. Each operation is tagged by its controller or model, so grouping is consistent from the CLI to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/docs" }),
			". See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api",
				children: "API Overview"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-document-is-reproducible",
			children: "The Document Is Reproducible"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The document is fully derived from code and config: identical inputs produce an identical spec. That reproducibility is what lets CI compare a committed spec against a regenerated one — a diff means a route, schema, or tag changed somewhere. Teams that gate on the spec can fail the build when the diff is unplanned. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/api-testing",
				children: "API Testing"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "your-schema-vs-openapi",
			children: "Your Schema vs OpenAPI"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Your schema declarations are the source for components. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" field types, enum values, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "min" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "max" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "optional" }),
			", and relation shapes are the only vocabulary OpenAPI needs — there is no parallel spec-authoring step. Custom types surface as referenceable components rather than inline copies. See ",
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
				href: "/docs/api/generated-endpoints",
				children: "Generated Endpoints"
			}), " — the routes described by the spec"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rest",
				children: "REST Conventions"
			}), " — the contract the spec documents"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/model-ir",
				children: "Model IR"
			}), " — the representation behind the document"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/controllers",
					children: "Controllers"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "summary" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tags" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "description" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Models"
				}),
				" — field ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "description()" }),
				" and schema derivation"
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
