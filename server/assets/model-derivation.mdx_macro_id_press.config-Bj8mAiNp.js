import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/architecture/model-derivation.mdx?macro_id=press.config.tsx%23architecture
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Model Derivation",
	"description": "One model declaration drives the database, REST API, typed RPC client, Studio, OpenAPI, and MCP tools through a single IR pipeline."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva's data architecture rests on a single idea: &#x2A;*declare the model once, derive everything from it.** A model isn't just a table definition — it's the source of truth for the database schema, migrations, seeders, REST routes, typed RPC client, generated admin UI, OpenAPI spec, and MCP tools.\n\n## One Model, Many Artifacts [#one-model-many-artifacts]\n\n```plaintext title=\"one-model-many-artifacts.txt\"\ndefineModel files ──scan──► model IR (intermediate representation)\n  ├─► database schema + migrations\n  ├─► REST API (5 routes per model)\n  ├─► typed RPC client SDK\n  ├─► Studio screens\n  ├─► OpenAPI spec\n  └─► MCP tools\n```\n\nThe IR is the contract between the declaration and every consumer. It's a typed intermediate representation produced by scanning your model files, and every derived artifact reads from the same IR — never from ad-hoc, hand-written generators.\n\n## The Model Declaration [#the-model-declaration]\n\nModels live one-per-file in `src/app/models/`:\n\n```ts title=\"src/app/models/posts.ts\"\n// src/app/models/posts.ts\nimport { defineModel } from '@kwiva/data'\n\nexport default defineModel('posts', (f) => ({\n  id: f.id(),\n  title: f.string().validation((s) => s.min(1).max(200)),\n  body: f.text().optional(),\n  status: f.enum('draft', 'published', 'archived').default('draft').indexed(),\n  publishedAt: f.timestamp().optional(),\n  authorId: f.uuid().indexed(),\n  author: f.belongsTo(() => User),\n  comments: f.hasMany(() => Comment),\n}), {\n  timestamps: true,\n  softDelete: true,\n  tenantField: 'tenantId',\n  permission: 'posts',\n})\n```\n\nField types (`id`, `string`, `text`, `integer`, `float`, `boolean`, `timestamp`, `date`, `json`, `enum`, `uuid`, `ulid`, `bytes`), modifiers (`.optional()`, `.default()`, `.unique()`, `.indexed()`, `.primaryKey()`, `.autoincrement()`, `.validation()`), relations, and model options all feed the IR. Field definitions double as the validation source — there's no second schema to keep in sync.\n\n## The IR Pipeline [#the-ir-pipeline]\n\nThe derivation pipeline runs at build and dev time:\n\n1. **Scan** — model files are discovered and parsed into the model IR.\n2. **Resolve** — relations are linked (lazy references keep files circular-import-free), options are validated, and types are resolved.\n3. **Derive** — every artifact is generated from the IR:\n   * database table definitions and migration files\n   * REST routes with validation, pagination, filters, policy checks, and tenant scoping\n   * typed RPC client types\n   * Studio screens\n   * OpenAPI components and schemas\n   * MCP tools\n\n## The Generated REST Surface [#the-generated-rest-surface]\n\nBy default, each model generates five deterministic routes (unless `routes: false`):\n\n| Route                   | Handler | Extras                                             |\n| ----------------------- | ------- | -------------------------------------------------- |\n| `GET /api/posts`        | list    | `where`, `page`, `orderBy`, `with` (all validated) |\n| `GET /api/posts/:id`    | get     | policy `posts.read`                                |\n| `POST /api/posts`       | create  | body validation, hooks, audit                      |\n| `PATCH /api/posts/:id`  | update  | policy, optimistic concurrency (v1.x)              |\n| `DELETE /api/posts/:id` | delete  | policy, soft-delete                                |\n\nCustom actions extend the surface via controllers: `POST /api/posts/:id/publish` is a controller action, not a sixth generated route.\n\n## Beyond REST [#beyond-rest]\n\n* **Typed RPC client** — `client.posts.list({ where: { status: 'published' }, page: 1 })` is typed from the same IR. Zero codegen at the type level.\n* **Studio** — generated list, filter, create, and edit screens derive columns and forms from the IR, so the admin UI can't drift from the schema.\n* **OpenAPI** — components and schemas are produced from the IR and served at `/openapi.json`.\n* **MCP tools** — models become agent-callable tools (list/get/create/update/delete), policy-checked.\n\n## Why Single-Source Derivation [#why-single-source-derivation]\n\n* **No type drift** — the client, Studio, and API all come from one declaration.\n* **Predictable surface** — the deterministic five-route shape is documentable and toolable.\n* **Convention over generation** — you declare intent; the framework produces the mechanics.\n* **Consistent permissions** — the `permission` option gates routes, Studio, and MCP uniformly through policies.\n\n## What to Read Next [#what-to-read-next]\n\n* [Models](/docs/data/models) — The `defineModel` reference\n* [Fields & DSL](/docs/data/fields) — Every field type and modifier\n* [Migrations](/docs/data/migrations) — Model diff → SQL\n* [Generated Endpoints](/docs/api/generated-endpoints) — The REST surface in detail\n* [Studio](/docs/studio) — The derived operations UI\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva's data architecture rests on a single idea: &#x2A;*declare the model once, derive everything from it.** A model isn't just a table definition — it's the source of truth for the database schema, migrations, seeders, REST routes, typed RPC client, generated admin UI, OpenAPI spec, and MCP tools."
		},
		{
			"heading": "one-model-many-artifacts",
			"content": "The IR is the contract between the declaration and every consumer. It's a typed intermediate representation produced by scanning your model files, and every derived artifact reads from the same IR — never from ad-hoc, hand-written generators."
		},
		{
			"heading": "the-model-declaration",
			"content": "Models live one-per-file in `src/app/models/`:"
		},
		{
			"heading": "the-model-declaration",
			"content": "Field types (`id`, `string`, `text`, `integer`, `float`, `boolean`, `timestamp`, `date`, `json`, `enum`, `uuid`, `ulid`, `bytes`), modifiers (`.optional()`, `.default()`, `.unique()`, `.indexed()`, `.primaryKey()`, `.autoincrement()`, `.validation()`), relations, and model options all feed the IR. Field definitions double as the validation source — there's no second schema to keep in sync."
		},
		{
			"heading": "the-ir-pipeline",
			"content": "The derivation pipeline runs at build and dev time:"
		},
		{
			"heading": "the-ir-pipeline",
			"content": "**Scan** — model files are discovered and parsed into the model IR."
		},
		{
			"heading": "the-ir-pipeline",
			"content": "**Resolve** — relations are linked (lazy references keep files circular-import-free), options are validated, and types are resolved."
		},
		{
			"heading": "the-ir-pipeline",
			"content": "**Derive** — every artifact is generated from the IR:"
		},
		{
			"heading": "the-ir-pipeline",
			"content": "database table definitions and migration files"
		},
		{
			"heading": "the-ir-pipeline",
			"content": "REST routes with validation, pagination, filters, policy checks, and tenant scoping"
		},
		{
			"heading": "the-ir-pipeline",
			"content": "typed RPC client types"
		},
		{
			"heading": "the-ir-pipeline",
			"content": "Studio screens"
		},
		{
			"heading": "the-ir-pipeline",
			"content": "OpenAPI components and schemas"
		},
		{
			"heading": "the-ir-pipeline",
			"content": "MCP tools"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "By default, each model generates five deterministic routes (unless `routes: false`):"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "Route"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "Handler"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "Extras"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "`GET /api/posts`"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "list"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "`where`, `page`, `orderBy`, `with` (all validated)"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "`GET /api/posts/:id`"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "get"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "policy `posts.read`"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "`POST /api/posts`"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "create"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "body validation, hooks, audit"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "`PATCH /api/posts/:id`"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "update"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "policy, optimistic concurrency (v1.x)"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "`DELETE /api/posts/:id`"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "delete"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "policy, soft-delete"
		},
		{
			"heading": "the-generated-rest-surface",
			"content": "Custom actions extend the surface via controllers: `POST /api/posts/:id/publish` is a controller action, not a sixth generated route."
		},
		{
			"heading": "beyond-rest",
			"content": "**Typed RPC client** — `client.posts.list({ where: { status: 'published' }, page: 1 })` is typed from the same IR. Zero codegen at the type level."
		},
		{
			"heading": "beyond-rest",
			"content": "**Studio** — generated list, filter, create, and edit screens derive columns and forms from the IR, so the admin UI can't drift from the schema."
		},
		{
			"heading": "beyond-rest",
			"content": "**OpenAPI** — components and schemas are produced from the IR and served at `/openapi.json`."
		},
		{
			"heading": "beyond-rest",
			"content": "**MCP tools** — models become agent-callable tools (list/get/create/update/delete), policy-checked."
		},
		{
			"heading": "why-single-source-derivation",
			"content": "**No type drift** — the client, Studio, and API all come from one declaration."
		},
		{
			"heading": "why-single-source-derivation",
			"content": "**Predictable surface** — the deterministic five-route shape is documentable and toolable."
		},
		{
			"heading": "why-single-source-derivation",
			"content": "**Convention over generation** — you declare intent; the framework produces the mechanics."
		},
		{
			"heading": "why-single-source-derivation",
			"content": "**Consistent permissions** — the `permission` option gates routes, Studio, and MCP uniformly through policies."
		},
		{
			"heading": "what-to-read-next",
			"content": "Models — The `defineModel` reference"
		},
		{
			"heading": "what-to-read-next",
			"content": "Fields & DSL — Every field type and modifier"
		},
		{
			"heading": "what-to-read-next",
			"content": "Migrations — Model diff → SQL"
		},
		{
			"heading": "what-to-read-next",
			"content": "Generated Endpoints — The REST surface in detail"
		},
		{
			"heading": "what-to-read-next",
			"content": "Studio — The derived operations UI"
		}
	],
	"headings": [
		{
			"id": "one-model-many-artifacts",
			"content": "One Model, Many Artifacts"
		},
		{
			"id": "the-model-declaration",
			"content": "The Model Declaration"
		},
		{
			"id": "the-ir-pipeline",
			"content": "The IR Pipeline"
		},
		{
			"id": "the-generated-rest-surface",
			"content": "The Generated REST Surface"
		},
		{
			"id": "beyond-rest",
			"content": "Beyond REST"
		},
		{
			"id": "why-single-source-derivation",
			"content": "Why Single-Source Derivation"
		},
		{
			"id": "what-to-read-next",
			"content": "What to Read Next"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#one-model-many-artifacts",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One Model, Many Artifacts" })
	},
	{
		depth: 2,
		url: "#the-model-declaration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Model Declaration" })
	},
	{
		depth: 2,
		url: "#the-ir-pipeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The IR Pipeline" })
	},
	{
		depth: 2,
		url: "#the-generated-rest-surface",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Generated REST Surface" })
	},
	{
		depth: 2,
		url: "#beyond-rest",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Beyond REST" })
	},
	{
		depth: 2,
		url: "#why-single-source-derivation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Why Single-Source Derivation" })
	},
	{
		depth: 2,
		url: "#what-to-read-next",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What to Read Next" })
	}
];
function _createMdxContent(props) {
	const _components = {
		a: "a",
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
			"Kwiva's data architecture rests on a single idea: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "declare the model once, derive everything from it." }),
			" A model isn't just a table definition — it's the source of truth for the database schema, migrations, seeders, REST routes, typed RPC client, generated admin UI, OpenAPI spec, and MCP tools."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "one-model-many-artifacts",
			children: "One Model, Many Artifacts"
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
			title: "one-model-many-artifacts.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineModel files ──scan──► model IR (intermediate representation)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─► database schema + migrations" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─► REST API (5 routes per model)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─► typed RPC client SDK" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─► Studio screens" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─► OpenAPI spec" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  └─► MCP tools" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The IR is the contract between the declaration and every consumer. It's a typed intermediate representation produced by scanning your model files, and every derived artifact reads from the same IR — never from ad-hoc, hand-written generators." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-model-declaration",
			children: "The Model Declaration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Models live one-per-file in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/" }),
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
							children: "  softDelete: "
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
							children: "  tenantField: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'tenantId'"
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
			"Field types (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "id" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "string" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "text" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "integer" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "float" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "boolean" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "timestamp" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "date" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "json" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "enum" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "uuid" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ulid" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bytes" }),
			"), modifiers (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".optional()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".default()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".unique()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".indexed()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".primaryKey()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".autoincrement()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".validation()" }),
			"), relations, and model options all feed the IR. Field definitions double as the validation source — there's no second schema to keep in sync."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-ir-pipeline",
			children: "The IR Pipeline"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The derivation pipeline runs at build and dev time:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Scan" }), " — model files are discovered and parsed into the model IR."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Resolve" }), " — relations are linked (lazy references keep files circular-import-free), options are validated, and types are resolved."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Derive" }),
				" — every artifact is generated from the IR:",
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
					"\n",
					(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "database table definitions and migration files" }),
					"\n",
					(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "REST routes with validation, pagination, filters, policy checks, and tenant scoping" }),
					"\n",
					(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "typed RPC client types" }),
					"\n",
					(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Studio screens" }),
					"\n",
					(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "OpenAPI components and schemas" }),
					"\n",
					(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "MCP tools" }),
					"\n"
				] }),
				"\n"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-generated-rest-surface",
			children: "The Generated REST Surface"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"By default, each model generates five deterministic routes (unless ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "routes: false" }),
			"):"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Route" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Handler" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Extras" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET /api/posts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "list" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "page" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "orderBy" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "with" }),
					" (all validated)"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET /api/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "get" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["policy ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.read" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST /api/posts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "create" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "body validation, hooks, audit" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PATCH /api/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "update" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "policy, optimistic concurrency (v1.x)" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DELETE /api/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "delete" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "policy, soft-delete" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Custom actions extend the surface via controllers: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST /api/posts/:id/publish" }),
			" is a controller action, not a sixth generated route."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "beyond-rest",
			children: "Beyond REST"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Typed RPC client" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.list({ where: { status: 'published' }, page: 1 })" }),
				" is typed from the same IR. Zero codegen at the type level."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Studio" }), " — generated list, filter, create, and edit screens derive columns and forms from the IR, so the admin UI can't drift from the schema."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "OpenAPI" }),
				" — components and schemas are produced from the IR and served at ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/openapi.json" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "MCP tools" }), " — models become agent-callable tools (list/get/create/update/delete), policy-checked."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "why-single-source-derivation",
			children: "Why Single-Source Derivation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No type drift" }), " — the client, Studio, and API all come from one declaration."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Predictable surface" }), " — the deterministic five-route shape is documentable and toolable."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Convention over generation" }), " — you declare intent; the framework produces the mechanics."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Consistent permissions" }),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" option gates routes, Studio, and MCP uniformly through policies."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-to-read-next",
			children: "What to Read Next"
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
				" reference"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/fields",
				children: "Fields & DSL"
			}), " — Every field type and modifier"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/migrations",
				children: "Migrations"
			}), " — Model diff → SQL"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "Generated Endpoints"
			}), " — The REST surface in detail"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio",
				children: "Studio"
			}), " — The derived operations UI"] }),
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
