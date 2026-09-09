import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/data/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Data",
	"description": "The data layer — defineModel, derived artifacts, the model IR, and a tenancy-first runtime."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nThe data layer is the foundation of every Kwiva application. It is **model-driven** rather than migration-driven: one `defineModel` declaration in `src/app/models/` is the single source of truth, and everything that touches your data — the schema, migrations, REST and RPC APIs, the typed client, Kwiva Studio screens, the OpenAPI document, search indexes, and MCP tools — is derived from it. You describe what a resource looks like once, and the framework guarantees the rest of the system cannot drift from that description.\n\nThis section documents the full surface: the model and field DSL, relations, validation, the query builder, pagination, transactions (including the outbox pattern), migrations, seeders, factories, soft deletes, database configuration, and the storage abstraction.\n\n## Design Principles [#design-principles]\n\nFour principles shape the data layer:\n\n| Principle           | What it means                                                                                                                |\n| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |\n| One source of truth | The model file, not the database, owns the shape of your data. Schema, API, client, and UI are derived from it.              |\n| Function-based DSL  | Models are plain definitions returned from a factory — no classes, no decorators, no runtime reflection, no `this` pitfalls. |\n| Tenancy-first       | Tenant scoping is injected into every query and write at the data layer, not bolted on per handler.                          |\n| Escape hatches      | Raw SQL, hand-authored migrations, controllers, and route-level schemas are first-class when you need to leave the rails.    |\n\n## One Declaration, Many Artifacts [#one-declaration-many-artifacts]\n\n```ts title=\"src/app/models/posts.ts\"\n// src/app/models/posts.ts\nimport { defineModel } from '@kwiva/data'\n\nexport default defineModel('posts', (f) => ({\n  id: f.id(),\n  title: f.string().validation((s) => s.min(1).max(200)),\n  body: f.text().optional(),\n  status: f.enum('draft', 'published', 'archived').default('draft').indexed(),\n  views: f.integer().default(0),\n  author: f.belongsTo(() => User),\n  comments: f.hasMany(() => Comment),\n}), {\n  timestamps: true,\n  softDelete: true,\n  audit: true,\n  tenantField: 'tenantId',\n  permission: 'posts',\n})\n```\n\nFrom this single file the framework produces:\n\n| Artifact         | Where it lands                                     |\n| ---------------- | -------------------------------------------------- |\n| Database table   | Generated schema for the active driver             |\n| Migration file   | `src/database/migrations/*.ts`                     |\n| REST API routes  | `GET/POST/PATCH/DELETE` under `/api/posts`         |\n| Typed RPC client | `client.posts.list()` via `@kwiva/client`          |\n| Studio screens   | Auto-generated CRUD in Kwiva Studio                |\n| OpenAPI schema   | `/openapi.json` components and schemas             |\n| Validation rules | Field-level schemas compiled from the DSL          |\n| Permission gates | Policy checks from the `permission` option         |\n| MCP tools        | Tool definitions via `@kwiva/mcp`                  |\n| TypeScript types | Ambient types flowing into handlers and the client |\n| Search indexes   | Full-text search fields declared with `searchable` |\n\n## The Derivation Pipeline [#the-derivation-pipeline]\n\n```plaintext title=\"the-derivation-pipeline.txt\"\ndefineModel files\n  └─► model IR (src/.kwiva/model-ir.json)\n        ├─► SQL table definitions + migrations\n        ├─► REST routes (list / get / create / update / delete)\n        ├─► RPC client types (@kwiva/client)\n        ├─► Studio screens (@kwiva/studio)\n        ├─► OpenAPI components\n        └─► MCP tools (@kwiva/mcp)\n```\n\nThe pipeline runs during `kwiva dev` and on demand through the CLI. It scans `src/app/models/`, resolves the lazy relation references (so models compose without circular imports), and emits a deterministic intermediate representation. Field-level detail follows this chain:\n\n```plaintext title=\"the-derivation-pipeline-2.txt\"\nField definition → Type resolution → Modifier chain → Validation schema → Database column\n```\n\n## The Model IR [#the-model-ir]\n\nEvery consumer of the model layer is fed by the model IR — a generated, gitignored JSON document at `src/.kwiva/model-ir.json`. It captures fields, types, modifiers, relations, options, validation schemas, and permission metadata as plain data. Because the model definition is itself a plain object, generating the IR is deterministic and type-exact: the same types that flow into the query builder also flow into the REST validation and the client. See [Advanced: Model IR](/docs/advanced/model-ir) for the file format and how to consume it from tooling.\n\n## The Runtime Surface [#the-runtime-surface]\n\nModels are not just schema. At runtime each model exposes:\n\n* A **query builder**: `.query()` with `where`, `orderBy`, `select`, `join`, `limit`, aggregates, `groupBy`, `having`, and `raw`; eager loading with `.with()` and `.withCount()`; pagination with `.page()`.\n* **Static helpers**: `findOrFail`, `first`, `create`, `update`, `delete`, `restore`, `withTrashed`, `forceDelete`.\n* **Factories**: `.factory().count(n).create()` for test and seed data.\n* **Relations**: typed relationship access, including lazy references that keep models circular-import-free.\n\nAlongside models, `db` provides transactions (`db.transaction`) with the outbox pattern for transactional events, and `storage` provides the disk-based file abstraction. The CLI — `kwiva make:model`, `kwiva db:diff`, `kwiva db:migrate`, `kwiva db:seed`, and friends — drives the lifecycle documented in [CLI: Database Commands](/docs/cli/database-commands).\n\n## Tenancy-First Data Access [#tenancy-first-data-access]\n\nMulti-tenant SaaS data leakage is a catastrophic failure class, so tenancy is a first-class data-access concern rather than a flag you remember to check. When a model declares `tenantField: 'tenantId'`, the model layer injects the tenant scope into every query and write from the request's tenant context. Cross-tenant writes are rejected with a conflict; cross-tenant reads are indistinguishable from 404s. See [Tenancy](/docs/tenancy) for the full picture.\n\n> \\[!NOTE]\n> Every derived surface — routes, Studio, the client — inherits tenancy, validation, and permissions from the model. There is no second schema to keep in sync.\n\n## Section Guide [#section-guide]\n\n| Section                                       | Covers                                                                     |\n| --------------------------------------------- | -------------------------------------------------------------------------- |\n| [Models](/docs/data/models)                   | `defineModel`, ModelOptions, hooks, the derived surface                    |\n| [Fields & DSL](/docs/data/fields)             | Field types, modifiers, default/validation integration                     |\n| [Relations](/docs/data/relations)             | `belongsTo`, `hasMany`, `hasOne`, many-to-many, polymorphic, eager loading |\n| [Validation](/docs/data/validation)           | Field-level rules, Standard Schema, custom rules, error shape              |\n| [Queries](/docs/data/queries)                 | The full query builder: where, joins, aggregates, raw SQL, locks           |\n| [Pagination](/docs/data/pagination)           | Offset and cursor modes, defaults, client hooks                            |\n| [Transactions](/docs/data/transactions)       | ACID, savepoints, isolation, the outbox pattern                            |\n| [Migrations](/docs/data/migrations)           | Typed SQL-step files, `db:diff`, deploy-time strategy                      |\n| [Seeders](/docs/data/seeders)                 | Ordered, idempotent seed data                                              |\n| [Factories](/docs/data/factories)             | Model-aware test data generation, states                                   |\n| [Soft Deletes](/docs/data/soft-deletes)       | `deletedAt`, `withTrashed`, `restore`, `forceDelete`                       |\n| [Database Config](/docs/data/database-config) | Connections, pooling, drivers, logging                                     |\n| [Storage](/docs/data/storage)                 | Disks, uploads, signed URLs, tenant-scoped paths                           |\n\n## What's Next [#whats-next]\n\n1. [Models](/docs/data/models) — `defineModel` and ModelOptions in depth\n2. [Fields & DSL](/docs/data/fields) — field types, modifiers, and the validation chain\n3. [Your First Model](/docs/getting-started/first-model) — hands-on walkthrough\n4. [Guides: Create a Model](/guides/create-model) — build a resource end to end\n5. [Project Structure](/docs/getting-started/project-structure) — where models, migrations, and seeders live on disk\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The data layer is the foundation of every Kwiva application. It is **model-driven** rather than migration-driven: one `defineModel` declaration in `src/app/models/` is the single source of truth, and everything that touches your data — the schema, migrations, REST and RPC APIs, the typed client, Kwiva Studio screens, the OpenAPI document, search indexes, and MCP tools — is derived from it. You describe what a resource looks like once, and the framework guarantees the rest of the system cannot drift from that description."
		},
		{
			"heading": void 0,
			"content": "This section documents the full surface: the model and field DSL, relations, validation, the query builder, pagination, transactions (including the outbox pattern), migrations, seeders, factories, soft deletes, database configuration, and the storage abstraction."
		},
		{
			"heading": "design-principles",
			"content": "Four principles shape the data layer:"
		},
		{
			"heading": "design-principles",
			"content": "Principle"
		},
		{
			"heading": "design-principles",
			"content": "What it means"
		},
		{
			"heading": "design-principles",
			"content": "One source of truth"
		},
		{
			"heading": "design-principles",
			"content": "The model file, not the database, owns the shape of your data. Schema, API, client, and UI are derived from it."
		},
		{
			"heading": "design-principles",
			"content": "Function-based DSL"
		},
		{
			"heading": "design-principles",
			"content": "Models are plain definitions returned from a factory — no classes, no decorators, no runtime reflection, no `this` pitfalls."
		},
		{
			"heading": "design-principles",
			"content": "Tenancy-first"
		},
		{
			"heading": "design-principles",
			"content": "Tenant scoping is injected into every query and write at the data layer, not bolted on per handler."
		},
		{
			"heading": "design-principles",
			"content": "Escape hatches"
		},
		{
			"heading": "design-principles",
			"content": "Raw SQL, hand-authored migrations, controllers, and route-level schemas are first-class when you need to leave the rails."
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "From this single file the framework produces:"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Artifact"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Where it lands"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Database table"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Generated schema for the active driver"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Migration file"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "`src/database/migrations/*.ts`"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "REST API routes"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "`GET/POST/PATCH/DELETE` under `/api/posts`"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Typed RPC client"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "`client.posts.list()` via `@kwiva/client`"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Studio screens"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Auto-generated CRUD in Kwiva Studio"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "OpenAPI schema"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "`/openapi.json` components and schemas"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Validation rules"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Field-level schemas compiled from the DSL"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Permission gates"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Policy checks from the `permission` option"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "MCP tools"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Tool definitions via `@kwiva/mcp`"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "TypeScript types"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Ambient types flowing into handlers and the client"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Search indexes"
		},
		{
			"heading": "one-declaration-many-artifacts",
			"content": "Full-text search fields declared with `searchable`"
		},
		{
			"heading": "the-derivation-pipeline",
			"content": "The pipeline runs during `kwiva dev` and on demand through the CLI. It scans `src/app/models/`, resolves the lazy relation references (so models compose without circular imports), and emits a deterministic intermediate representation. Field-level detail follows this chain:"
		},
		{
			"heading": "the-model-ir",
			"content": "Every consumer of the model layer is fed by the model IR — a generated, gitignored JSON document at `src/.kwiva/model-ir.json`. It captures fields, types, modifiers, relations, options, validation schemas, and permission metadata as plain data. Because the model definition is itself a plain object, generating the IR is deterministic and type-exact: the same types that flow into the query builder also flow into the REST validation and the client. See Advanced: Model IR for the file format and how to consume it from tooling."
		},
		{
			"heading": "the-runtime-surface",
			"content": "Models are not just schema. At runtime each model exposes:"
		},
		{
			"heading": "the-runtime-surface",
			"content": "A **query builder**: `.query()` with `where`, `orderBy`, `select`, `join`, `limit`, aggregates, `groupBy`, `having`, and `raw`; eager loading with `.with()` and `.withCount()`; pagination with `.page()`."
		},
		{
			"heading": "the-runtime-surface",
			"content": "**Static helpers**: `findOrFail`, `first`, `create`, `update`, `delete`, `restore`, `withTrashed`, `forceDelete`."
		},
		{
			"heading": "the-runtime-surface",
			"content": "**Factories**: `.factory().count(n).create()` for test and seed data."
		},
		{
			"heading": "the-runtime-surface",
			"content": "**Relations**: typed relationship access, including lazy references that keep models circular-import-free."
		},
		{
			"heading": "the-runtime-surface",
			"content": "Alongside models, `db` provides transactions (`db.transaction`) with the outbox pattern for transactional events, and `storage` provides the disk-based file abstraction. The CLI — `kwiva make:model`, `kwiva db:diff`, `kwiva db:migrate`, `kwiva db:seed`, and friends — drives the lifecycle documented in CLI: Database Commands."
		},
		{
			"heading": "tenancy-first-data-access",
			"content": "Multi-tenant SaaS data leakage is a catastrophic failure class, so tenancy is a first-class data-access concern rather than a flag you remember to check. When a model declares `tenantField: 'tenantId'`, the model layer injects the tenant scope into every query and write from the request's tenant context. Cross-tenant writes are rejected with a conflict; cross-tenant reads are indistinguishable from 404s. See Tenancy for the full picture."
		},
		{
			"heading": "tenancy-first-data-access",
			"content": "> \\[!NOTE]\n> Every derived surface — routes, Studio, the client — inherits tenancy, validation, and permissions from the model. There is no second schema to keep in sync."
		},
		{
			"heading": "section-guide",
			"content": "Section"
		},
		{
			"heading": "section-guide",
			"content": "Covers"
		},
		{
			"heading": "section-guide",
			"content": "Models"
		},
		{
			"heading": "section-guide",
			"content": "`defineModel`, ModelOptions, hooks, the derived surface"
		},
		{
			"heading": "section-guide",
			"content": "Fields & DSL"
		},
		{
			"heading": "section-guide",
			"content": "Field types, modifiers, default/validation integration"
		},
		{
			"heading": "section-guide",
			"content": "Relations"
		},
		{
			"heading": "section-guide",
			"content": "`belongsTo`, `hasMany`, `hasOne`, many-to-many, polymorphic, eager loading"
		},
		{
			"heading": "section-guide",
			"content": "Validation"
		},
		{
			"heading": "section-guide",
			"content": "Field-level rules, Standard Schema, custom rules, error shape"
		},
		{
			"heading": "section-guide",
			"content": "Queries"
		},
		{
			"heading": "section-guide",
			"content": "The full query builder: where, joins, aggregates, raw SQL, locks"
		},
		{
			"heading": "section-guide",
			"content": "Pagination"
		},
		{
			"heading": "section-guide",
			"content": "Offset and cursor modes, defaults, client hooks"
		},
		{
			"heading": "section-guide",
			"content": "Transactions"
		},
		{
			"heading": "section-guide",
			"content": "ACID, savepoints, isolation, the outbox pattern"
		},
		{
			"heading": "section-guide",
			"content": "Migrations"
		},
		{
			"heading": "section-guide",
			"content": "Typed SQL-step files, `db:diff`, deploy-time strategy"
		},
		{
			"heading": "section-guide",
			"content": "Seeders"
		},
		{
			"heading": "section-guide",
			"content": "Ordered, idempotent seed data"
		},
		{
			"heading": "section-guide",
			"content": "Factories"
		},
		{
			"heading": "section-guide",
			"content": "Model-aware test data generation, states"
		},
		{
			"heading": "section-guide",
			"content": "Soft Deletes"
		},
		{
			"heading": "section-guide",
			"content": "`deletedAt`, `withTrashed`, `restore`, `forceDelete`"
		},
		{
			"heading": "section-guide",
			"content": "Database Config"
		},
		{
			"heading": "section-guide",
			"content": "Connections, pooling, drivers, logging"
		},
		{
			"heading": "section-guide",
			"content": "Storage"
		},
		{
			"heading": "section-guide",
			"content": "Disks, uploads, signed URLs, tenant-scoped paths"
		},
		{
			"heading": "whats-next",
			"content": "Models — `defineModel` and ModelOptions in depth"
		},
		{
			"heading": "whats-next",
			"content": "Fields & DSL — field types, modifiers, and the validation chain"
		},
		{
			"heading": "whats-next",
			"content": "Your First Model — hands-on walkthrough"
		},
		{
			"heading": "whats-next",
			"content": "Guides: Create a Model — build a resource end to end"
		},
		{
			"heading": "whats-next",
			"content": "Project Structure — where models, migrations, and seeders live on disk"
		}
	],
	"headings": [
		{
			"id": "design-principles",
			"content": "Design Principles"
		},
		{
			"id": "one-declaration-many-artifacts",
			"content": "One Declaration, Many Artifacts"
		},
		{
			"id": "the-derivation-pipeline",
			"content": "The Derivation Pipeline"
		},
		{
			"id": "the-model-ir",
			"content": "The Model IR"
		},
		{
			"id": "the-runtime-surface",
			"content": "The Runtime Surface"
		},
		{
			"id": "tenancy-first-data-access",
			"content": "Tenancy-First Data Access"
		},
		{
			"id": "section-guide",
			"content": "Section Guide"
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
		url: "#design-principles",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Design Principles" })
	},
	{
		depth: 2,
		url: "#one-declaration-many-artifacts",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One Declaration, Many Artifacts" })
	},
	{
		depth: 2,
		url: "#the-derivation-pipeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Derivation Pipeline" })
	},
	{
		depth: 2,
		url: "#the-model-ir",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Model IR" })
	},
	{
		depth: 2,
		url: "#the-runtime-surface",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Runtime Surface" })
	},
	{
		depth: 2,
		url: "#tenancy-first-data-access",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Tenancy-First Data Access" })
	},
	{
		depth: 2,
		url: "#section-guide",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Section Guide" })
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
			"The data layer is the foundation of every Kwiva application. It is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "model-driven" }),
			" rather than migration-driven: one ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" declaration in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/" }),
			" is the single source of truth, and everything that touches your data — the schema, migrations, REST and RPC APIs, the typed client, Kwiva Studio screens, the OpenAPI document, search indexes, and MCP tools — is derived from it. You describe what a resource looks like once, and the framework guarantees the rest of the system cannot drift from that description."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This section documents the full surface: the model and field DSL, relations, validation, the query builder, pagination, transactions (including the outbox pattern), migrations, seeders, factories, soft deletes, database configuration, and the storage abstraction." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "design-principles",
			children: "Design Principles"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Four principles shape the data layer:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Principle" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it means" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "One source of truth" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The model file, not the database, owns the shape of your data. Schema, API, client, and UI are derived from it." })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Function-based DSL" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Models are plain definitions returned from a factory — no classes, no decorators, no runtime reflection, no ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "this" }),
				" pitfalls."
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tenancy-first" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tenant scoping is injected into every query and write at the data layer, not bolted on per handler." })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Escape hatches" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Raw SQL, hand-authored migrations, controllers, and route-level schemas are first-class when you need to leave the rails." })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "one-declaration-many-artifacts",
			children: "One Declaration, Many Artifacts"
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
							children: "  views: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "integer"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "0"
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
							children: "  audit: "
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "From this single file the framework produces:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Artifact" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Where it lands" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Database table" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generated schema for the active driver" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Migration file" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/database/migrations/*.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "REST API routes" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET/POST/PATCH/DELETE" }),
				" under ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts" })
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Typed RPC client" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.list()" }),
				" via ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" })
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Studio screens" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Auto-generated CRUD in Kwiva Studio" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "OpenAPI schema" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/openapi.json" }), " components and schemas"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Validation rules" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Field-level schemas compiled from the DSL" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Permission gates" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Policy checks from the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" option"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP tools" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Tool definitions via ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/mcp" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "TypeScript types" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Ambient types flowing into handlers and the client" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Search indexes" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Full-text search fields declared with ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "searchable" })] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-derivation-pipeline",
			children: "The Derivation Pipeline"
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
			title: "the-derivation-pipeline.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineModel files" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  └─► model IR (src/.kwiva/model-ir.json)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        ├─► SQL table definitions + migrations" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        ├─► REST routes (list / get / create / update / delete)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        ├─► RPC client types (@kwiva/client)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        ├─► Studio screens (@kwiva/studio)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        ├─► OpenAPI components" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        └─► MCP tools (@kwiva/mcp)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The pipeline runs during ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" and on demand through the CLI. It scans ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/" }),
			", resolves the lazy relation references (so models compose without circular imports), and emits a deterministic intermediate representation. Field-level detail follows this chain:"
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
			title: "the-derivation-pipeline-2.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Field definition → Type resolution → Modifier chain → Validation schema → Database column" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-model-ir",
			children: "The Model IR"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every consumer of the model layer is fed by the model IR — a generated, gitignored JSON document at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/model-ir.json" }),
			". It captures fields, types, modifiers, relations, options, validation schemas, and permission metadata as plain data. Because the model definition is itself a plain object, generating the IR is deterministic and type-exact: the same types that flow into the query builder also flow into the REST validation and the client. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/model-ir",
				children: "Advanced: Model IR"
			}),
			" for the file format and how to consume it from tooling."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-runtime-surface",
			children: "The Runtime Surface"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Models are not just schema. At runtime each model exposes:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "query builder" }),
				": ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".query()" }),
				" with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "orderBy" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "select" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "join" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "limit" }),
				", aggregates, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "groupBy" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "having" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "raw" }),
				"; eager loading with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".with()" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".withCount()" }),
				"; pagination with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".page()" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Static helpers" }),
				": ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "findOrFail" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "first" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "create" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "update" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delete" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "restore" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withTrashed" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "forceDelete" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Factories" }),
				": ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".factory().count(n).create()" }),
				" for test and seed data."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Relations" }), ": typed relationship access, including lazy references that keep models circular-import-free."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Alongside models, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db" }),
			" provides transactions (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db.transaction" }),
			") with the outbox pattern for transactional events, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage" }),
			" provides the disk-based file abstraction. The CLI — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:model" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:diff" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:seed" }),
			", and friends — drives the lifecycle documented in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/database-commands",
				children: "CLI: Database Commands"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "tenancy-first-data-access",
			children: "Tenancy-First Data Access"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Multi-tenant SaaS data leakage is a catastrophic failure class, so tenancy is a first-class data-access concern rather than a flag you remember to check. When a model declares ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField: 'tenantId'" }),
			", the model layer injects the tenant scope into every query and write from the request's tenant context. Cross-tenant writes are rejected with a conflict; cross-tenant reads are indistinguishable from 404s. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy",
				children: "Tenancy"
			}),
			" for the full picture."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!NOTE]\nEvery derived surface — routes, Studio, the client — inherits tenancy, validation, and permissions from the model. There is no second schema to keep in sync." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "section-guide",
			children: "Section Guide"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Section" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Covers" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }), ", ModelOptions, hooks, the derived surface"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/fields",
				children: "Fields & DSL"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Field types, modifiers, default/validation integration" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/relations",
				children: "Relations"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "belongsTo" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "hasMany" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "hasOne" }),
				", many-to-many, polymorphic, eager loading"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/validation",
				children: "Validation"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Field-level rules, Standard Schema, custom rules, error shape" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/queries",
				children: "Queries"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The full query builder: where, joins, aggregates, raw SQL, locks" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/pagination",
				children: "Pagination"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Offset and cursor modes, defaults, client hooks" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/transactions",
				children: "Transactions"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "ACID, savepoints, isolation, the outbox pattern" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/migrations",
				children: "Migrations"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Typed SQL-step files, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:diff" }),
				", deploy-time strategy"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/seeders",
				children: "Seeders"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Ordered, idempotent seed data" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/factories",
				children: "Factories"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model-aware test data generation, states" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/soft-deletes",
				children: "Soft Deletes"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deletedAt" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withTrashed" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "restore" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "forceDelete" })
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/database-config",
				children: "Database Config"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Connections, pooling, drivers, logging" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/storage",
				children: "Storage"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Disks, uploads, signed URLs, tenant-scoped paths" })] })
		] })] }),
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
					href: "/docs/data/models",
					children: "Models"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				" and ModelOptions in depth"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/fields",
				children: "Fields & DSL"
			}), " — field types, modifiers, and the validation chain"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-model",
				children: "Your First Model"
			}), " — hands-on walkthrough"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/guides/create-model",
				children: "Guides: Create a Model"
			}), " — build a resource end to end"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/project-structure",
				children: "Project Structure"
			}), " — where models, migrations, and seeders live on disk"] }),
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
