import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/advanced/model-ir.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Model IR",
	"description": "The single intermediate representation derived from defineModel — one IR feeds database schema, REST API, typed RPC client, Studio, OpenAPI, and MCP tools with no drift."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nThe model IR is the engineering spine of Kwiva. From the definitions in `src/app/models/`, the framework derives a single typed intermediate representation — the model IR — and every external artifact is generated from that one IR. This is why Kwiva can promise that your types, your API, your database, and your tooling can never disagree.\n\n## What the Model IR Is [#what-the-model-ir-is]\n\nWhen Kwiva runs `kwiva dev` or `kwiva build`, it scans `src/app/models/*.ts`, evaluates each `defineModel` call, and produces a typed intermediate representation capturing everything the definition declared:\n\n* Identity — the model name and its singular and plural references\n* Fields — name, type, modifiers such as optional, default, unique, indexed, and primary key\n* Relations — `belongsTo`, `hasMany`, `hasOne`, and `belongsToMany` as lazy references, with no circular imports\n* Validation — the field-level validation chaining, carried as the single validation source\n* Options — timestamps, audit fields, soft delete, tenant scoping, permissions, indexes, and uniques\n\nThe IR is written to the generated directory and rebuilt on every dev and build run:\n\n```plaintext title=\"what-the-model-ir-is.txt\"\nsrc/.kwiva/\n  model-ir.json         the typed model IR\n  route-manifest.json   the route IR, also derived from models and controllers\n  types/                generated ambient types\n```\n\nThat directory is a build product. Never edit it by hand — it is regenerated deterministically from your definitions each time.\n\n## The Derivation Pipeline [#the-derivation-pipeline]\n\nOne definition fans out into the entire data plane:\n\n```plaintext title=\"the-derivation-pipeline.txt\"\nsrc/app/models/*.ts ──► IR (typed intermediate representation)\n ├─► database schema + migrations + seeders      (@kwiva/data)\n ├─► typed REST API (route registration)         (@kwiva/http + @kwiva/data)\n ├─► typed RPC client SDK                        (@kwiva/client)\n ├─► Studio screens                              (@kwiva/studio)\n ├─► OpenAPI spec                                (@kwiva/http)\n └─► MCP tools (optional)                        (@kwiva/mcp)\n```\n\nA model like this:\n\n```ts title=\"src/app/models/posts.ts\"\n// src/app/models/posts.ts\nimport { defineModel } from '@kwiva/data'\n\nexport default defineModel('posts', (f) => ({\n  id: f.id(),\n  title: f.string().validation((s) => s.min(1).max(200)),\n  body: f.text().optional(),\n  status: f.enum('draft', 'published', 'archived').default('draft').indexed(),\n  authorId: f.uuid().indexed(),\n  publishedAt: f.timestamp().optional(),\n  author: f.belongsTo(() => User),\n  comments: f.hasMany(() => Comment),\n}), {\n  timestamps: true,\n  uniques: [['authorId', 'title']],\n  permission: 'posts',\n})\n```\n\n...becomes, in a single pass, a database table and migration, five REST endpoints, a fully typed client call, a Studio screen, an OpenAPI schema, and — if the model is opted in — MCP tools.\n\nRelations are written as lazy function references (`() => User`), which is what lets the scanner build the full graph without introducing circular imports between model files. The IR resolves those references into the typed relation graph once, and every downstream consumer reads that resolved graph.\n\n## A Single IR, Six Outputs [#a-single-ir-six-outputs]\n\n### Database schema and migrations [#database-schema-and-migrations]\n\n`@kwiva/data` translates the IR into schema and migrations. A model change produces a diff, and `kwiva db:migrate` turns that diff into SQL steps under `src/database/migrations/`. The same IR drives `seeders` and generated factories. Add a field, delete a relation, or add an index, and the diff against the live schema tells you precisely what a migration step must do — the diff is a derivation, not a guess.\n\n### Typed REST API [#typed-rest-api]\n\n`@kwiva/http` and `@kwiva/data` register exactly five generated routes per model — `list`, `get`, `create`, `update`, `delete` — plus any custom actions you add on a controller. Because the shape is deterministic, documentation and tooling can rely on it. Every model produces the same five-route contract, so client code, OpenAPI consumers, and Studio never have to discover the shape of a resource — they already know it.\n\n### Typed RPC client [#typed-rpc-client]\n\n`@kwiva/client` is generated from the same IR, so every model method and controller action appears on the client with end-to-end types. No separate schema is maintained on the client side that can drift from the server.\n\n```ts title=\"typed-rpc-client.ts\"\nimport { createClient } from '@kwiva/client'\nexport const client = createClient()\n\nconst { data } = await client.posts.list({ page: 1 })\nconst post = await client.posts.update(id, { title: 'New title' })\n```\n\nThe client is derived from the server's route manifest and model IR — it is the server's own types, projected across the wire, with zero handwritten duplication.\n\n### Studio [#studio]\n\n`@kwiva/studio` derives its screens from the IR: columns, filters, and forms all come from the model IR. There is no Studio-side duplication, so a new field on a model appears in Studio without configuring anything. The screens are re-derived, not hand-mirrored: whatever the model declares as its columns, filters, and validations is exactly what the generated interface shows.\n\n### OpenAPI [#openapi]\n\nThe route manifest — itself derived from the IR and controller schemas — produces the OpenAPI 3.1 specification, served from your route registration. Schemas, summaries, tags, and descriptions on controllers and routes flow into the spec directly, which is why there is no separate hand-maintained API document to keep in sync.\n\n### MCP tools [#mcp-tools]\n\n`@kwiva/mcp` turns opted-in models into agent-callable tools — `list`, `get`, `create`, `update`, `delete` — and controller actions into tools with their exact input and output types. Tool input schemas come straight from the route validation schemas in the IR.\n\n## The \"No Drift\" Guarantee [#the-no-drift-guarantee]\n\nThe no-drift guarantee is structural, not aspirational. Because there is exactly one IR, all six outputs above agree by construction — they are all compiled from the same input. The framework never runs a set of unrelated, hand-tuned generators that can fall out of sync.\n\nConcretely this means:\n\n1. A field added to a model appears in the migration, the REST schema, the client types, the Studio form, the OpenAPI spec, and the MCP tool in the same run.\n2. Validation defined on the field DSL is the validation everywhere — there are no duplicate schemas to keep in sync.\n3. The five generated routes per model are deterministic, which keeps client, OpenAPI, Studio, and MCP predictable for tooling and documentation.\n4. Collection-level permissions declared on a model gate the generated routes and Studio through the same policy namespace.\n\nA single derivation pass is the whole mechanism. Where other stacks maintain a database schema, an API schema, a client SDK, and an admin UI independently, Kwiva compiles all of them from one IR — so the question \"which one is out of date?\" has no answer.\n\n## Types Flow End-to-End [#types-flow-end-to-end]\n\nThe IR is also the hub of the type graph. Types flow from the definitions through the entire stack:\n\n```plaintext title=\"types-flow-end-to-end.txt\"\ndefineModel → defineController → @kwiva/client → definePage loader → data hooks\n```\n\nThere is no codegen step for types — no separate generated `.d.ts` to regenerate and forget — and no manual type annotations anywhere in the chain. The type universe that the compiler sees is the same one the database schema describes. The framework runs \"serial derivation from one IR\": resolver, client, Studio, OpenAPI, and MCP all generate from the single model IR rather than from ad-hoc per-output generators.\n\n## When the IR Is Built [#when-the-ir-is-built]\n\nThe IR is produced during step 2 of every build, right after the application scan:\n\n1. Collect — scan models, controllers, pages, config, and routes\n2. Build the IR — model IR plus route manifest, written to `src/.kwiva/`\n3. Build the client — routes chunked per page\n4. Build the server — one server bundle through the engine preset\n5. Prerender — crawl or explicit list for static and ISR routes\n\nIn development the same IR is built continuously, so a model edit is reflected in the client, OpenAPI, and MCP surface immediately. The dev loop re-derives on filesystem change — there is no \"regenerate types\" step a developer can forget.\n\n## What's Next [#whats-next]\n\n* [Models](/docs/data/models) — The `defineModel` factory that feeds the IR\n* [Generated Endpoints](/docs/api/generated-endpoints) — The five deterministic routes per model\n* [RPC Client](/docs/frontend/rpc-client) — The typed client generated from the same IR\n* [Studio Screens](/docs/studio/generated-ui) — The IR-derived admin interface\n* [Tool Generation](/docs/ai-mcp/tool-generation) — How the IR becomes agent-callable tools\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The model IR is the engineering spine of Kwiva. From the definitions in `src/app/models/`, the framework derives a single typed intermediate representation — the model IR — and every external artifact is generated from that one IR. This is why Kwiva can promise that your types, your API, your database, and your tooling can never disagree."
		},
		{
			"heading": "what-the-model-ir-is",
			"content": "When Kwiva runs `kwiva dev` or `kwiva build`, it scans `src/app/models/*.ts`, evaluates each `defineModel` call, and produces a typed intermediate representation capturing everything the definition declared:"
		},
		{
			"heading": "what-the-model-ir-is",
			"content": "Identity — the model name and its singular and plural references"
		},
		{
			"heading": "what-the-model-ir-is",
			"content": "Fields — name, type, modifiers such as optional, default, unique, indexed, and primary key"
		},
		{
			"heading": "what-the-model-ir-is",
			"content": "Relations — `belongsTo`, `hasMany`, `hasOne`, and `belongsToMany` as lazy references, with no circular imports"
		},
		{
			"heading": "what-the-model-ir-is",
			"content": "Validation — the field-level validation chaining, carried as the single validation source"
		},
		{
			"heading": "what-the-model-ir-is",
			"content": "Options — timestamps, audit fields, soft delete, tenant scoping, permissions, indexes, and uniques"
		},
		{
			"heading": "what-the-model-ir-is",
			"content": "The IR is written to the generated directory and rebuilt on every dev and build run:"
		},
		{
			"heading": "what-the-model-ir-is",
			"content": "That directory is a build product. Never edit it by hand — it is regenerated deterministically from your definitions each time."
		},
		{
			"heading": "the-derivation-pipeline",
			"content": "One definition fans out into the entire data plane:"
		},
		{
			"heading": "the-derivation-pipeline",
			"content": "A model like this:"
		},
		{
			"heading": "the-derivation-pipeline",
			"content": "...becomes, in a single pass, a database table and migration, five REST endpoints, a fully typed client call, a Studio screen, an OpenAPI schema, and — if the model is opted in — MCP tools."
		},
		{
			"heading": "the-derivation-pipeline",
			"content": "Relations are written as lazy function references (`() => User`), which is what lets the scanner build the full graph without introducing circular imports between model files. The IR resolves those references into the typed relation graph once, and every downstream consumer reads that resolved graph."
		},
		{
			"heading": "database-schema-and-migrations",
			"content": "`@kwiva/data` translates the IR into schema and migrations. A model change produces a diff, and `kwiva db:migrate` turns that diff into SQL steps under `src/database/migrations/`. The same IR drives `seeders` and generated factories. Add a field, delete a relation, or add an index, and the diff against the live schema tells you precisely what a migration step must do — the diff is a derivation, not a guess."
		},
		{
			"heading": "typed-rest-api",
			"content": "`@kwiva/http` and `@kwiva/data` register exactly five generated routes per model — `list`, `get`, `create`, `update`, `delete` — plus any custom actions you add on a controller. Because the shape is deterministic, documentation and tooling can rely on it. Every model produces the same five-route contract, so client code, OpenAPI consumers, and Studio never have to discover the shape of a resource — they already know it."
		},
		{
			"heading": "typed-rpc-client",
			"content": "`@kwiva/client` is generated from the same IR, so every model method and controller action appears on the client with end-to-end types. No separate schema is maintained on the client side that can drift from the server."
		},
		{
			"heading": "typed-rpc-client",
			"content": "The client is derived from the server's route manifest and model IR — it is the server's own types, projected across the wire, with zero handwritten duplication."
		},
		{
			"heading": "studio",
			"content": "`@kwiva/studio` derives its screens from the IR: columns, filters, and forms all come from the model IR. There is no Studio-side duplication, so a new field on a model appears in Studio without configuring anything. The screens are re-derived, not hand-mirrored: whatever the model declares as its columns, filters, and validations is exactly what the generated interface shows."
		},
		{
			"heading": "openapi",
			"content": "The route manifest — itself derived from the IR and controller schemas — produces the OpenAPI 3.1 specification, served from your route registration. Schemas, summaries, tags, and descriptions on controllers and routes flow into the spec directly, which is why there is no separate hand-maintained API document to keep in sync."
		},
		{
			"heading": "mcp-tools",
			"content": "`@kwiva/mcp` turns opted-in models into agent-callable tools — `list`, `get`, `create`, `update`, `delete` — and controller actions into tools with their exact input and output types. Tool input schemas come straight from the route validation schemas in the IR."
		},
		{
			"heading": "the-no-drift-guarantee",
			"content": "The no-drift guarantee is structural, not aspirational. Because there is exactly one IR, all six outputs above agree by construction — they are all compiled from the same input. The framework never runs a set of unrelated, hand-tuned generators that can fall out of sync."
		},
		{
			"heading": "the-no-drift-guarantee",
			"content": "Concretely this means:"
		},
		{
			"heading": "the-no-drift-guarantee",
			"content": "A field added to a model appears in the migration, the REST schema, the client types, the Studio form, the OpenAPI spec, and the MCP tool in the same run."
		},
		{
			"heading": "the-no-drift-guarantee",
			"content": "Validation defined on the field DSL is the validation everywhere — there are no duplicate schemas to keep in sync."
		},
		{
			"heading": "the-no-drift-guarantee",
			"content": "The five generated routes per model are deterministic, which keeps client, OpenAPI, Studio, and MCP predictable for tooling and documentation."
		},
		{
			"heading": "the-no-drift-guarantee",
			"content": "Collection-level permissions declared on a model gate the generated routes and Studio through the same policy namespace."
		},
		{
			"heading": "the-no-drift-guarantee",
			"content": "A single derivation pass is the whole mechanism. Where other stacks maintain a database schema, an API schema, a client SDK, and an admin UI independently, Kwiva compiles all of them from one IR — so the question \"which one is out of date?\" has no answer."
		},
		{
			"heading": "types-flow-end-to-end",
			"content": "The IR is also the hub of the type graph. Types flow from the definitions through the entire stack:"
		},
		{
			"heading": "types-flow-end-to-end",
			"content": "There is no codegen step for types — no separate generated `.d.ts` to regenerate and forget — and no manual type annotations anywhere in the chain. The type universe that the compiler sees is the same one the database schema describes. The framework runs \"serial derivation from one IR\": resolver, client, Studio, OpenAPI, and MCP all generate from the single model IR rather than from ad-hoc per-output generators."
		},
		{
			"heading": "when-the-ir-is-built",
			"content": "The IR is produced during step 2 of every build, right after the application scan:"
		},
		{
			"heading": "when-the-ir-is-built",
			"content": "Collect — scan models, controllers, pages, config, and routes"
		},
		{
			"heading": "when-the-ir-is-built",
			"content": "Build the IR — model IR plus route manifest, written to `src/.kwiva/`"
		},
		{
			"heading": "when-the-ir-is-built",
			"content": "Build the client — routes chunked per page"
		},
		{
			"heading": "when-the-ir-is-built",
			"content": "Build the server — one server bundle through the engine preset"
		},
		{
			"heading": "when-the-ir-is-built",
			"content": "Prerender — crawl or explicit list for static and ISR routes"
		},
		{
			"heading": "when-the-ir-is-built",
			"content": "In development the same IR is built continuously, so a model edit is reflected in the client, OpenAPI, and MCP surface immediately. The dev loop re-derives on filesystem change — there is no \"regenerate types\" step a developer can forget."
		},
		{
			"heading": "whats-next",
			"content": "Models — The `defineModel` factory that feeds the IR"
		},
		{
			"heading": "whats-next",
			"content": "Generated Endpoints — The five deterministic routes per model"
		},
		{
			"heading": "whats-next",
			"content": "RPC Client — The typed client generated from the same IR"
		},
		{
			"heading": "whats-next",
			"content": "Studio Screens — The IR-derived admin interface"
		},
		{
			"heading": "whats-next",
			"content": "Tool Generation — How the IR becomes agent-callable tools"
		}
	],
	"headings": [
		{
			"id": "what-the-model-ir-is",
			"content": "What the Model IR Is"
		},
		{
			"id": "the-derivation-pipeline",
			"content": "The Derivation Pipeline"
		},
		{
			"id": "a-single-ir-six-outputs",
			"content": "A Single IR, Six Outputs"
		},
		{
			"id": "database-schema-and-migrations",
			"content": "Database schema and migrations"
		},
		{
			"id": "typed-rest-api",
			"content": "Typed REST API"
		},
		{
			"id": "typed-rpc-client",
			"content": "Typed RPC client"
		},
		{
			"id": "studio",
			"content": "Studio"
		},
		{
			"id": "openapi",
			"content": "OpenAPI"
		},
		{
			"id": "mcp-tools",
			"content": "MCP tools"
		},
		{
			"id": "the-no-drift-guarantee",
			"content": "The \"No Drift\" Guarantee"
		},
		{
			"id": "types-flow-end-to-end",
			"content": "Types Flow End-to-End"
		},
		{
			"id": "when-the-ir-is-built",
			"content": "When the IR Is Built"
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
		url: "#what-the-model-ir-is",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What the Model IR Is" })
	},
	{
		depth: 2,
		url: "#the-derivation-pipeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Derivation Pipeline" })
	},
	{
		depth: 2,
		url: "#a-single-ir-six-outputs",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "A Single IR, Six Outputs" })
	},
	{
		depth: 3,
		url: "#database-schema-and-migrations",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Database schema and migrations" })
	},
	{
		depth: 3,
		url: "#typed-rest-api",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Typed REST API" })
	},
	{
		depth: 3,
		url: "#typed-rpc-client",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Typed RPC client" })
	},
	{
		depth: 3,
		url: "#studio",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Studio" })
	},
	{
		depth: 3,
		url: "#openapi",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "OpenAPI" })
	},
	{
		depth: 3,
		url: "#mcp-tools",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "MCP tools" })
	},
	{
		depth: 2,
		url: "#the-no-drift-guarantee",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The \"No Drift\" Guarantee" })
	},
	{
		depth: 2,
		url: "#types-flow-end-to-end",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Types Flow End-to-End" })
	},
	{
		depth: 2,
		url: "#when-the-ir-is-built",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When the IR Is Built" })
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
		ul: "ul",
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The model IR is the engineering spine of Kwiva. From the definitions in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/" }),
			", the framework derives a single typed intermediate representation — the model IR — and every external artifact is generated from that one IR. This is why Kwiva can promise that your types, your API, your database, and your tooling can never disagree."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-the-model-ir-is",
			children: "What the Model IR Is"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"When Kwiva runs ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }),
			", it scans ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/*.ts" }),
			", evaluates each ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" call, and produces a typed intermediate representation capturing everything the definition declared:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Identity — the model name and its singular and plural references" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Fields — name, type, modifiers such as optional, default, unique, indexed, and primary key" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Relations — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "belongsTo" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "hasMany" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "hasOne" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "belongsToMany" }),
				" as lazy references, with no circular imports"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Validation — the field-level validation chaining, carried as the single validation source" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Options — timestamps, audit fields, soft delete, tenant scoping, permissions, indexes, and uniques" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The IR is written to the generated directory and rebuilt on every dev and build run:" }),
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
			title: "what-the-model-ir-is.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/.kwiva/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  model-ir.json         the typed model IR" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  route-manifest.json   the route IR, also derived from models and controllers" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  types/                generated ambient types" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "That directory is a build product. Never edit it by hand — it is regenerated deterministically from your definitions each time." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-derivation-pipeline",
			children: "The Derivation Pipeline"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "One definition fans out into the entire data plane:" }),
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
			title: "the-derivation-pipeline.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/models/*.ts ──► IR (typed intermediate representation)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─► database schema + migrations + seeders      (@kwiva/data)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─► typed REST API (route registration)         (@kwiva/http + @kwiva/data)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─► typed RPC client SDK                        (@kwiva/client)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─► Studio screens                              (@kwiva/studio)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─► OpenAPI spec                                (@kwiva/http)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " └─► MCP tools (optional)                        (@kwiva/mcp)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A model like this:" }),
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
							children: "  uniques: [["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'authorId'"
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
							children: "'title'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "]],"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "...becomes, in a single pass, a database table and migration, five REST endpoints, a fully typed client call, a Studio screen, an OpenAPI schema, and — if the model is opted in — MCP tools." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Relations are written as lazy function references (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "() => User" }),
			"), which is what lets the scanner build the full graph without introducing circular imports between model files. The IR resolves those references into the typed relation graph once, and every downstream consumer reads that resolved graph."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "a-single-ir-six-outputs",
			children: "A Single IR, Six Outputs"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "database-schema-and-migrations",
			children: "Database schema and migrations"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }),
			" translates the IR into schema and migrations. A model change produces a diff, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
			" turns that diff into SQL steps under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/database/migrations/" }),
			". The same IR drives ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "seeders" }),
			" and generated factories. Add a field, delete a relation, or add an index, and the diff against the live schema tells you precisely what a migration step must do — the diff is a derivation, not a guess."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "typed-rest-api",
			children: "Typed REST API"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }),
			" register exactly five generated routes per model — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "list" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "get" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "create" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "update" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delete" }),
			" — plus any custom actions you add on a controller. Because the shape is deterministic, documentation and tooling can rely on it. Every model produces the same five-route contract, so client code, OpenAPI consumers, and Studio never have to discover the shape of a resource — they already know it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "typed-rpc-client",
			children: "Typed RPC client"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }), " is generated from the same IR, so every model method and controller action appears on the client with end-to-end types. No separate schema is maintained on the client side that can drift from the server."] }),
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
			title: "typed-rpc-client.ts",
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
							children: "()"
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
							children: "update"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(id, { title: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'New title'"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The client is derived from the server's route manifest and model IR — it is the server's own types, projected across the wire, with zero handwritten duplication." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "studio",
			children: "Studio"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/studio" }), " derives its screens from the IR: columns, filters, and forms all come from the model IR. There is no Studio-side duplication, so a new field on a model appears in Studio without configuring anything. The screens are re-derived, not hand-mirrored: whatever the model declares as its columns, filters, and validations is exactly what the generated interface shows."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "openapi",
			children: "OpenAPI"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The route manifest — itself derived from the IR and controller schemas — produces the OpenAPI 3.1 specification, served from your route registration. Schemas, summaries, tags, and descriptions on controllers and routes flow into the spec directly, which is why there is no separate hand-maintained API document to keep in sync." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "mcp-tools",
			children: "MCP tools"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/mcp" }),
			" turns opted-in models into agent-callable tools — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "list" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "get" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "create" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "update" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delete" }),
			" — and controller actions into tools with their exact input and output types. Tool input schemas come straight from the route validation schemas in the IR."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-no-drift-guarantee",
			children: "The \"No Drift\" Guarantee"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The no-drift guarantee is structural, not aspirational. Because there is exactly one IR, all six outputs above agree by construction — they are all compiled from the same input. The framework never runs a set of unrelated, hand-tuned generators that can fall out of sync." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Concretely this means:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "A field added to a model appears in the migration, the REST schema, the client types, the Studio form, the OpenAPI spec, and the MCP tool in the same run." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Validation defined on the field DSL is the validation everywhere — there are no duplicate schemas to keep in sync." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The five generated routes per model are deterministic, which keeps client, OpenAPI, Studio, and MCP predictable for tooling and documentation." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Collection-level permissions declared on a model gate the generated routes and Studio through the same policy namespace." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A single derivation pass is the whole mechanism. Where other stacks maintain a database schema, an API schema, a client SDK, and an admin UI independently, Kwiva compiles all of them from one IR — so the question \"which one is out of date?\" has no answer." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "types-flow-end-to-end",
			children: "Types Flow End-to-End"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The IR is also the hub of the type graph. Types flow from the definitions through the entire stack:" }),
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
			title: "types-flow-end-to-end.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineModel → defineController → @kwiva/client → definePage loader → data hooks" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"There is no codegen step for types — no separate generated ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".d.ts" }),
			" to regenerate and forget — and no manual type annotations anywhere in the chain. The type universe that the compiler sees is the same one the database schema describes. The framework runs \"serial derivation from one IR\": resolver, client, Studio, OpenAPI, and MCP all generate from the single model IR rather than from ad-hoc per-output generators."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-the-ir-is-built",
			children: "When the IR Is Built"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The IR is produced during step 2 of every build, right after the application scan:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Collect — scan models, controllers, pages, config, and routes" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: ["Build the IR — model IR plus route manifest, written to ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/" })] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Build the client — routes chunked per page" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Build the server — one server bundle through the engine preset" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Prerender — crawl or explicit list for static and ISR routes" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "In development the same IR is built continuously, so a model edit is reflected in the client, OpenAPI, and MCP surface immediately. The dev loop re-derives on filesystem change — there is no \"regenerate types\" step a developer can forget." }),
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
					href: "/docs/data/models",
					children: "Models"
				}),
				" — The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				" factory that feeds the IR"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "Generated Endpoints"
			}), " — The five deterministic routes per model"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/rpc-client",
				children: "RPC Client"
			}), " — The typed client generated from the same IR"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/generated-ui",
				children: "Studio Screens"
			}), " — The IR-derived admin interface"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/ai-mcp/tool-generation",
				children: "Tool Generation"
			}), " — How the IR becomes agent-callable tools"] }),
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
