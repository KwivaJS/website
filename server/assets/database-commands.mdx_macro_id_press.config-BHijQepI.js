import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/cli/database-commands.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Database Commands",
	"description": "kwiva db:migrate, db:rollback, db:seed, db:reset, db:studio, db:status, db:diff, and db:push — the database lifecycle from the CLI."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nThe database commands own the lifecycle between your models and your database. Kwiva's data layer is model-first: migrations are generated from model definitions rather than hand-written SQL in isolation. The CLI applies, reverts, seeds, inspects, and diffs that schema — and lets you push model changes straight to the database in development when migration files would be overkill.\n\n## Full Reference [#full-reference]\n\n| Command                       | Action                                                               |\n| ----------------------------- | -------------------------------------------------------------------- |\n| `kwiva db:migrate`            | Apply pending migrations                                             |\n| `kwiva db:rollback --steps=n` | Revert the last `n` migrations                                       |\n| `kwiva db:status`             | List applied and pending migrations                                  |\n| `kwiva db:diff`               | Show the model-to-database diff proposal                             |\n| `kwiva db:seed [--seeder]`    | Run seeders, optionally one                                          |\n| `kwiva db:reset`              | Drop the database, migrate, seed                                     |\n| `kwiva db:push`               | Push the model schema to the database without migration files (v1.x) |\n| `kwiva db:browse`             | Open the data browser (v1.x)                                         |\n| `kwiva db:studio`             | Open Studio against the generated model schema                       |\n\n## The Model-First Model [#the-model-first-model]\n\nThe reason the command set looks the way it does is the data model's source of truth: your `defineModel` files. Migrations, factories, seeders, typed queries, and Studio screens all derive from the field DSL — so the schema you migrate is the schema you wrote as types.\n\n```text title=\"the-model-first-model.txt\"\ndefineModel('posts', ...) ──▶ migration (from model diff)\n                          ──▶ typed client  (list/get/create/update/delete)\n                          ──▶ Studio screens\n                          ──▶ OpenAPI + MCP tool schemas\n```\n\nThat is why `db:diff` exists: the database is always compared against the models, never treated as an independent artifact.\n\n## Migrate and Rollback [#migrate-and-rollback]\n\n```bash title=\"terminal\"\nkwiva db:migrate\nkwiva db:rollback          # revert the most recent batch\nkwiva db:rollback --steps=3\n```\n\n`kwiva db:migrate` applies every pending migration in `src/database/migrations/`. Because migrations are generated from model diffs, the sequence stays in lockstep with your `defineModel` definitions. `kwiva db:rollback` reverts the most recent batch, or `--steps=n` rolls back the last `n` migrations. The migrations table tracks what has been applied, so both commands operate on the exact current state — rollback knows precisely which batch it is undoing.\n\nMigrations from installed modules participate in the same sequence: module migrations are ordered **before** application migrations and versioned by module version, so `db:migrate` applies the composed schema in one deterministic pass.\n\n## Status and Diff [#status-and-diff]\n\n```bash title=\"terminal\"\nkwiva db:status      # applied / pending table\nkwiva db:diff        # model vs database — proposed changes\n```\n\n`kwiva db:status` shows which migrations have been applied and which are pending — the test before a deploy to check nothing is dangling. `kwiva db:diff` compares the live database against the model definitions and prints a diff proposal: the changes a new migration would capture. Its flow is write-model, preview-diff, accept:\n\n1. Change a `defineModel` field, relation, index, or constraint.\n2. Run `kwiva db:diff` and review the proposed schema change.\n3. Apply via the normal migration path.\n\nThis diff-first discipline is what keeps the model the single source of truth. A schema change is always reviewed twice — once as a diff against the live database, once as the migration that captures it. See [Migrations](/docs/data/migrations).\n\n## Seed and Reset [#seed-and-reset]\n\n```bash title=\"terminal\"\nkwiva db:seed\nkwiva db:seed --seeder=posts   # run one seeder\nkwiva db:reset                 # drop → migrate → seed\n```\n\n`kwiva db:seed` runs the seeders in `src/database/seeders/` in their declared order. Seeders are idempotent by convention, so re-running them does not duplicate data. `--seeder` runs a single seeder in isolation — useful when you add one seeder to an existing database and only want its rows.\n\n`kwiva db:reset` performs the full cycle — drop the database, re-apply migrations, re-seed — giving you a known-good state for fresh environments and CI runs. It is the \"start over clean\" command, which is exactly what makes it safe: it is explicit about destroying and rebuilding the entire schema. See [Seeders](/docs/data/seeders).\n\n## Push: Model Straight to Database [#push-model-straight-to-database]\n\n```bash title=\"terminal\"\nkwiva db:push      # v1.x\n```\n\n`db:push` synchronizes the database schema to match your model definitions without generating migration files. The model remains the source of truth — the database is brought to match it directly. This is the right tool in early development, where migrations would be pure churn and every field experiment would otherwise produce a migration file to delete. Once a schema stabilizes, switch to the migration path so the history is captured — `db:push` is a development tool, not a deployment path.\n\n## Studio [#studio]\n\n```bash title=\"terminal\"\nkwiva db:studio\n```\n\n`kwiva db:studio` opens Studio against the generated model schema — list, filter, create, edit, and delete screens derived from the model IR, with the same policy gating as the API. It is the operational view of what your models define: the same authorization that governs a request governs the Studio screen, so a role that cannot call the delete route cannot delete from Studio either. See [Studio](/docs/studio/).\n\n## Configuration [#configuration]\n\nConnections come from `src/config/database.ts` — driver, URL, pool, and migration table — with environment overrides validated at boot. The CLI reads the same config, so what `db:migrate` touches is exactly what the app connects to:\n\n```ts title=\"src/config/database.ts\"\n// src/config/database.ts\nexport default defineConfig('database', {\n  defaults: {\n    driver: 'postgres',            // driver, URL, pool, migration table\n    url: env('DATABASE_URL'),\n  },\n})\n```\n\nThe environment mapping is declared here once; `DATABASE_URL` must exist before boot or the app fails fast with a table of what is missing. There is no second place where the connection is defined that could drift from what the CLI operates against. See [Database Configuration](/docs/data/database-config).\n\n## Verify Before a Deploy [#verify-before-a-deploy]\n\nA minimal pre-deploy sequence:\n\n```bash title=\"terminal\"\nkwiva db:status        # confirm no unexpected pending migrations\nkwiva db:diff          # confirm the schema matches your models\nkwiva check            # confirm the exec/lint/format gate passes\n```\n\n`db:status` tells you nothing is dangling, `db:diff` tells you the live schema matches the models (or what a new migration would change), and `check` confirms the code that will use the schema is clean. Combine with the deployment pipeline for a schema that arrives in lockstep with the code that uses it. See [Deployment](/docs/deployment/).\n\n## Common Workflows [#common-workflows]\n\n* **A model has changed** — edit the field DSL, run `kwiva db:diff` to review, generate the migration, `kwiva db:migrate`.\n* **Fresh environment or CI** — `kwiva db:reset` for a deterministic known-good database.\n* **A seeder needs review** — `kwiva db:seed --seeder=<name>` to run it alone against existing data.\n* **Early prototype, unstable schema** — `kwiva db:push` (v1.x) to sync without migration files until the shape settles.\n\n## What's Next [#whats-next]\n\n* [Migrations](/docs/data/migrations) — model-diff-driven SQL migrations\n* [Seeders](/docs/data/seeders) — ordered, idempotent data seeding\n* [Factories](/docs/data/factories) — model-aware factories for seeds and tests\n* [Database Configuration](/docs/data/database-config) — connections, drivers, and pools\n* [CLI](/docs/cli/) — the rest of the command surface\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The database commands own the lifecycle between your models and your database. Kwiva's data layer is model-first: migrations are generated from model definitions rather than hand-written SQL in isolation. The CLI applies, reverts, seeds, inspects, and diffs that schema — and lets you push model changes straight to the database in development when migration files would be overkill."
		},
		{
			"heading": "full-reference",
			"content": "Command"
		},
		{
			"heading": "full-reference",
			"content": "Action"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva db:migrate`"
		},
		{
			"heading": "full-reference",
			"content": "Apply pending migrations"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva db:rollback --steps=n`"
		},
		{
			"heading": "full-reference",
			"content": "Revert the last `n` migrations"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva db:status`"
		},
		{
			"heading": "full-reference",
			"content": "List applied and pending migrations"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva db:diff`"
		},
		{
			"heading": "full-reference",
			"content": "Show the model-to-database diff proposal"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva db:seed [--seeder]`"
		},
		{
			"heading": "full-reference",
			"content": "Run seeders, optionally one"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva db:reset`"
		},
		{
			"heading": "full-reference",
			"content": "Drop the database, migrate, seed"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva db:push`"
		},
		{
			"heading": "full-reference",
			"content": "Push the model schema to the database without migration files (v1.x)"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva db:browse`"
		},
		{
			"heading": "full-reference",
			"content": "Open the data browser (v1.x)"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva db:studio`"
		},
		{
			"heading": "full-reference",
			"content": "Open Studio against the generated model schema"
		},
		{
			"heading": "the-model-first-model",
			"content": "The reason the command set looks the way it does is the data model's source of truth: your `defineModel` files. Migrations, factories, seeders, typed queries, and Studio screens all derive from the field DSL — so the schema you migrate is the schema you wrote as types."
		},
		{
			"heading": "the-model-first-model",
			"content": "That is why `db:diff` exists: the database is always compared against the models, never treated as an independent artifact."
		},
		{
			"heading": "migrate-and-rollback",
			"content": "`kwiva db:migrate` applies every pending migration in `src/database/migrations/`. Because migrations are generated from model diffs, the sequence stays in lockstep with your `defineModel` definitions. `kwiva db:rollback` reverts the most recent batch, or `--steps=n` rolls back the last `n` migrations. The migrations table tracks what has been applied, so both commands operate on the exact current state — rollback knows precisely which batch it is undoing."
		},
		{
			"heading": "migrate-and-rollback",
			"content": "Migrations from installed modules participate in the same sequence: module migrations are ordered **before** application migrations and versioned by module version, so `db:migrate` applies the composed schema in one deterministic pass."
		},
		{
			"heading": "status-and-diff",
			"content": "`kwiva db:status` shows which migrations have been applied and which are pending — the test before a deploy to check nothing is dangling. `kwiva db:diff` compares the live database against the model definitions and prints a diff proposal: the changes a new migration would capture. Its flow is write-model, preview-diff, accept:"
		},
		{
			"heading": "status-and-diff",
			"content": "Change a `defineModel` field, relation, index, or constraint."
		},
		{
			"heading": "status-and-diff",
			"content": "Run `kwiva db:diff` and review the proposed schema change."
		},
		{
			"heading": "status-and-diff",
			"content": "Apply via the normal migration path."
		},
		{
			"heading": "status-and-diff",
			"content": "This diff-first discipline is what keeps the model the single source of truth. A schema change is always reviewed twice — once as a diff against the live database, once as the migration that captures it. See Migrations."
		},
		{
			"heading": "seed-and-reset",
			"content": "`kwiva db:seed` runs the seeders in `src/database/seeders/` in their declared order. Seeders are idempotent by convention, so re-running them does not duplicate data. `--seeder` runs a single seeder in isolation — useful when you add one seeder to an existing database and only want its rows."
		},
		{
			"heading": "seed-and-reset",
			"content": "`kwiva db:reset` performs the full cycle — drop the database, re-apply migrations, re-seed — giving you a known-good state for fresh environments and CI runs. It is the \"start over clean\" command, which is exactly what makes it safe: it is explicit about destroying and rebuilding the entire schema. See Seeders."
		},
		{
			"heading": "push-model-straight-to-database",
			"content": "`db:push` synchronizes the database schema to match your model definitions without generating migration files. The model remains the source of truth — the database is brought to match it directly. This is the right tool in early development, where migrations would be pure churn and every field experiment would otherwise produce a migration file to delete. Once a schema stabilizes, switch to the migration path so the history is captured — `db:push` is a development tool, not a deployment path."
		},
		{
			"heading": "studio",
			"content": "`kwiva db:studio` opens Studio against the generated model schema — list, filter, create, edit, and delete screens derived from the model IR, with the same policy gating as the API. It is the operational view of what your models define: the same authorization that governs a request governs the Studio screen, so a role that cannot call the delete route cannot delete from Studio either. See Studio."
		},
		{
			"heading": "configuration",
			"content": "Connections come from `src/config/database.ts` — driver, URL, pool, and migration table — with environment overrides validated at boot. The CLI reads the same config, so what `db:migrate` touches is exactly what the app connects to:"
		},
		{
			"heading": "configuration",
			"content": "The environment mapping is declared here once; `DATABASE_URL` must exist before boot or the app fails fast with a table of what is missing. There is no second place where the connection is defined that could drift from what the CLI operates against. See Database Configuration."
		},
		{
			"heading": "verify-before-a-deploy",
			"content": "A minimal pre-deploy sequence:"
		},
		{
			"heading": "verify-before-a-deploy",
			"content": "`db:status` tells you nothing is dangling, `db:diff` tells you the live schema matches the models (or what a new migration would change), and `check` confirms the code that will use the schema is clean. Combine with the deployment pipeline for a schema that arrives in lockstep with the code that uses it. See Deployment."
		},
		{
			"heading": "common-workflows",
			"content": "**A model has changed** — edit the field DSL, run `kwiva db:diff` to review, generate the migration, `kwiva db:migrate`."
		},
		{
			"heading": "common-workflows",
			"content": "**Fresh environment or CI** — `kwiva db:reset` for a deterministic known-good database."
		},
		{
			"heading": "common-workflows",
			"content": "**A seeder needs review** — `kwiva db:seed --seeder=<name>` to run it alone against existing data."
		},
		{
			"heading": "common-workflows",
			"content": "**Early prototype, unstable schema** — `kwiva db:push` (v1.x) to sync without migration files until the shape settles."
		},
		{
			"heading": "whats-next",
			"content": "Migrations — model-diff-driven SQL migrations"
		},
		{
			"heading": "whats-next",
			"content": "Seeders — ordered, idempotent data seeding"
		},
		{
			"heading": "whats-next",
			"content": "Factories — model-aware factories for seeds and tests"
		},
		{
			"heading": "whats-next",
			"content": "Database Configuration — connections, drivers, and pools"
		},
		{
			"heading": "whats-next",
			"content": "CLI — the rest of the command surface"
		}
	],
	"headings": [
		{
			"id": "full-reference",
			"content": "Full Reference"
		},
		{
			"id": "the-model-first-model",
			"content": "The Model-First Model"
		},
		{
			"id": "migrate-and-rollback",
			"content": "Migrate and Rollback"
		},
		{
			"id": "status-and-diff",
			"content": "Status and Diff"
		},
		{
			"id": "seed-and-reset",
			"content": "Seed and Reset"
		},
		{
			"id": "push-model-straight-to-database",
			"content": "Push: Model Straight to Database"
		},
		{
			"id": "studio",
			"content": "Studio"
		},
		{
			"id": "configuration",
			"content": "Configuration"
		},
		{
			"id": "verify-before-a-deploy",
			"content": "Verify Before a Deploy"
		},
		{
			"id": "common-workflows",
			"content": "Common Workflows"
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
		url: "#full-reference",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Full Reference" })
	},
	{
		depth: 2,
		url: "#the-model-first-model",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Model-First Model" })
	},
	{
		depth: 2,
		url: "#migrate-and-rollback",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Migrate and Rollback" })
	},
	{
		depth: 2,
		url: "#status-and-diff",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Status and Diff" })
	},
	{
		depth: 2,
		url: "#seed-and-reset",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Seed and Reset" })
	},
	{
		depth: 2,
		url: "#push-model-straight-to-database",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Push: Model Straight to Database" })
	},
	{
		depth: 2,
		url: "#studio",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Studio" })
	},
	{
		depth: 2,
		url: "#configuration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Configuration" })
	},
	{
		depth: 2,
		url: "#verify-before-a-deploy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Verify Before a Deploy" })
	},
	{
		depth: 2,
		url: "#common-workflows",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Common Workflows" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The database commands own the lifecycle between your models and your database. Kwiva's data layer is model-first: migrations are generated from model definitions rather than hand-written SQL in isolation. The CLI applies, reverts, seeds, inspects, and diffs that schema — and lets you push model changes straight to the database in development when migration files would be overkill." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "full-reference",
			children: "Full Reference"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Action" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Apply pending migrations" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:rollback --steps=n" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Revert the last ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "n" }),
				" migrations"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:status" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "List applied and pending migrations" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:diff" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Show the model-to-database diff proposal" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:seed [--seeder]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run seeders, optionally one" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:reset" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Drop the database, migrate, seed" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:push" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Push the model schema to the database without migration files (v1.x)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:browse" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Open the data browser (v1.x)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:studio" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Open Studio against the generated model schema" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-model-first-model",
			children: "The Model-First Model"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The reason the command set looks the way it does is the data model's source of truth: your ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" files. Migrations, factories, seeders, typed queries, and Studio screens all derive from the field DSL — so the schema you migrate is the schema you wrote as types."
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
			title: "the-model-first-model.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineModel('posts', ...) ──▶ migration (from model diff)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                          ──▶ typed client  (list/get/create/update/delete)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                          ──▶ Studio screens" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                          ──▶ OpenAPI + MCP tool schemas" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"That is why ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:diff" }),
			" exists: the database is always compared against the models, never treated as an independent artifact."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "migrate-and-rollback",
			children: "Migrate and Rollback"
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
			title: "terminal",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "kwiva"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " db:migrate"
					})]
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " db:rollback"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "          # revert the most recent batch"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " db:rollback"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --steps=3"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
			" applies every pending migration in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/database/migrations/" }),
			". Because migrations are generated from model diffs, the sequence stays in lockstep with your ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" definitions. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:rollback" }),
			" reverts the most recent batch, or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--steps=n" }),
			" rolls back the last ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "n" }),
			" migrations. The migrations table tracks what has been applied, so both commands operate on the exact current state — rollback knows precisely which batch it is undoing."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Migrations from installed modules participate in the same sequence: module migrations are ordered ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "before" }),
			" application migrations and versioned by module version, so ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:migrate" }),
			" applies the composed schema in one deterministic pass."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "status-and-diff",
			children: "Status and Diff"
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
			title: "terminal",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
							children: " db:status"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "      # applied / pending table"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " db:diff"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "        # model vs database — proposed changes"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:status" }),
			" shows which migrations have been applied and which are pending — the test before a deploy to check nothing is dangling. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:diff" }),
			" compares the live database against the model definitions and prints a diff proposal: the changes a new migration would capture. Its flow is write-model, preview-diff, accept:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Change a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				" field, relation, index, or constraint."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Run ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:diff" }),
				" and review the proposed schema change."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Apply via the normal migration path." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This diff-first discipline is what keeps the model the single source of truth. A schema change is always reviewed twice — once as a diff against the live database, once as the migration that captures it. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/migrations",
				children: "Migrations"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "seed-and-reset",
			children: "Seed and Reset"
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
			title: "terminal",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "kwiva"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " db:seed"
					})]
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " db:seed"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --seeder=posts"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "   # run one seeder"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " db:reset"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                 # drop → migrate → seed"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:seed" }),
			" runs the seeders in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/database/seeders/" }),
			" in their declared order. Seeders are idempotent by convention, so re-running them does not duplicate data. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--seeder" }),
			" runs a single seeder in isolation — useful when you add one seeder to an existing database and only want its rows."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:reset" }),
			" performs the full cycle — drop the database, re-apply migrations, re-seed — giving you a known-good state for fresh environments and CI runs. It is the \"start over clean\" command, which is exactly what makes it safe: it is explicit about destroying and rebuilding the entire schema. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/seeders",
				children: "Seeders"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "push-model-straight-to-database",
			children: "Push: Model Straight to Database"
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
						children: " db:push"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "      # v1.x"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:push" }),
			" synchronizes the database schema to match your model definitions without generating migration files. The model remains the source of truth — the database is brought to match it directly. This is the right tool in early development, where migrations would be pure churn and every field experiment would otherwise produce a migration file to delete. Once a schema stabilizes, switch to the migration path so the history is captured — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:push" }),
			" is a development tool, not a deployment path."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "studio",
			children: "Studio"
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
			title: "terminal",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					},
					children: "kwiva"
				}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					},
					children: " db:studio"
				})]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:studio" }),
			" opens Studio against the generated model schema — list, filter, create, edit, and delete screens derived from the model IR, with the same policy gating as the API. It is the operational view of what your models define: the same authorization that governs a request governs the Studio screen, so a role that cannot call the delete route cannot delete from Studio either. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/",
				children: "Studio"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "configuration",
			children: "Configuration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Connections come from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/database.ts" }),
			" — driver, URL, pool, and migration table — with environment overrides validated at boot. The CLI reads the same config, so what ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:migrate" }),
			" touches is exactly what the app connects to:"
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
			title: "src/config/database.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/database.ts"
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
							children: "'database'"
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
							children: "    driver: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'postgres'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",            "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// driver, URL, pool, migration table"
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
							children: "    url: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "env"
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
							children: "'DATABASE_URL'"
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
			"The environment mapping is declared here once; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DATABASE_URL" }),
			" must exist before boot or the app fails fast with a table of what is missing. There is no second place where the connection is defined that could drift from what the CLI operates against. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/database-config",
				children: "Database Configuration"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "verify-before-a-deploy",
			children: "Verify Before a Deploy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A minimal pre-deploy sequence:" }),
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
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
							children: " db:status"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "        # confirm no unexpected pending migrations"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " db:diff"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "          # confirm the schema matches your models"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " check"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "            # confirm the exec/lint/format gate passes"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:status" }),
			" tells you nothing is dangling, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:diff" }),
			" tells you the live schema matches the models (or what a new migration would change), and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "check" }),
			" confirms the code that will use the schema is clean. Combine with the deployment pipeline for a schema that arrives in lockstep with the code that uses it. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/",
				children: "Deployment"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "common-workflows",
			children: "Common Workflows"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "A model has changed" }),
				" — edit the field DSL, run ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:diff" }),
				" to review, generate the migration, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Fresh environment or CI" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:reset" }),
				" for a deterministic known-good database."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "A seeder needs review" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:seed --seeder=<name>" }),
				" to run it alone against existing data."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Early prototype, unstable schema" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:push" }),
				" (v1.x) to sync without migration files until the shape settles."
			] }),
			"\n"
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
				href: "/docs/data/migrations",
				children: "Migrations"
			}), " — model-diff-driven SQL migrations"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/seeders",
				children: "Seeders"
			}), " — ordered, idempotent data seeding"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/factories",
				children: "Factories"
			}), " — model-aware factories for seeds and tests"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/database-config",
				children: "Database Configuration"
			}), " — connections, drivers, and pools"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/",
				children: "CLI"
			}), " — the rest of the command surface"] }),
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
