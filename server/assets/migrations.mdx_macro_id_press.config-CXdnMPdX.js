import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/data/migrations.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Migrations",
	"description": "Typed SQL-step files generated from model diffs — apply, rollback, backfill, and deploy-time strategy."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nMigrations evolve your database schema over time. Kwiva's approach is diff-driven: `kwiva db:diff` compares the model IR against the live database and proposes a migration; `kwiva db:migrate` applies pending migrations forward; `kwiva db:rollback` reverses them. Every migration is a **typed, hand-editable SQL-step file** — generated where possible, authored freely when a change is too nuanced for a diff.\n\n## The Workflow [#the-workflow]\n\n```bash title=\"terminal\"\nkwiva make:model invoice    # model + migration + factory stub\nkwiva db:diff               # model IR vs live DB → migration proposal\nkwiva db:migrate            # apply pending\nkwiva db:rollback --steps=1 # reverse the last N applied\nkwiva db:status             # applied vs pending\nkwiva db:reset              # drop + migrate + seed\n```\n\n| Command                       | Purpose                                                          |\n| ----------------------------- | ---------------------------------------------------------------- |\n| `kwiva make:model invoice`    | Scaffold a model, its initial migration, and a factory stub      |\n| `kwiva db:diff`               | Compute the delta between schema and live database as a proposal |\n| `kwiva db:migrate`            | Apply pending migrations in order                                |\n| `kwiva db:rollback --steps=n` | Reverse the last `n` migrations via their `down` steps           |\n| `kwiva db:status`             | Report applied and pending migrations                            |\n| `kwiva db:reset`              | Drop all objects, re-migrate, re-seed — destructive, dev only    |\n| `kwiva db:browse`             | Interactive data browser (`v1.x`)                                |\n\n## Defining a Migration [#defining-a-migration]\n\nA migration is a pair of typed SQL steps:\n\n```ts title=\"src/database/migrations/0001_create_posts.ts\"\n// src/database/migrations/0001_create_posts.ts\nimport { defineMigration } from '@kwiva/data'\n\nexport default defineMigration({\n  up:   (sql) => sql`create table posts (...)`,\n  down: (sql) => sql`drop table posts`,\n})\n```\n\n| Shape  | Meaning                                                                     |\n| ------ | --------------------------------------------------------------------------- |\n| `up`   | The forward step, applied by `db:migrate`                                   |\n| `down` | The reverse step, applied by `db:rollback`                                  |\n| `sql`  | A typed template-literal helper with parameterization and dialect awareness |\n\nThe `sql` tag typechecks the statement and keeps the migration dialect-correct for the configured driver, so the same file shape works on the SQLite dev database and the Postgres production database.\n\n> \\[!NOTE]\n> Diff-generated migrations are complete but generic. Hand-editing is expected: rename with the data preserved, backfill columns, rewrite a constraint — the file is yours after generation.\n\n## Generated Migrations and Model Diffs [#generated-migrations-and-model-diffs]\n\nWhen a model changes, `kwiva db:diff` inspects what changed — a new field, a dropped field, an index, a unique constraint, a soft-delete flag — and writes a proposal migration. Accept it, review it, and it becomes the next numbered file. This keeps the model file as the source of truth and the migration files as the auditable changelog.\n\n## Numbering and Application Order [#numbering-and-application-order]\n\nMigration files are numbered (`0001_`, `0002_`) and applied in **lexicographic order**. `db:status` reads both the file list and a tracking table, so:\n\n| State       | Meaning                                                            |\n| ----------- | ------------------------------------------------------------------ |\n| Applied     | The migration exists in the tracking table and matches its file    |\n| Pending     | A file exists that has not been applied                            |\n| Rolled back | A migration was reversed by `db:rollback` and can be applied again |\n\nIdempotency is a property of the tracking step, not of the SQL: `db:migrate` applies only pending files, so running it twice is a no-op; re-applying a rolled-back migration runs only its `up` again.\n\n## Editing Generated Migrations [#editing-generated-migrations]\n\nDiff-generated migrations are complete but generic, and hand-editing is expected. The two guards are:\n\n* `up` then `down` must restore the prior state — the reversibility contract.\n* Columns that carry existing data need data-preserving statements (backfill before type change, rename rather than drop-and-recreate).\n\nA common edit is renaming a column: the diff proposes drop-and-add, but the data-preserving version is `ALTER TABLE ... RENAME COLUMN` followed by the new definition. Write it in the `sql` template, review the diff, migrate.\n\n## Data Migrations (Backfills) [#data-migrations-backfills]\n\nSchema changes are only half the job. Data migrations run arbitrary typed SQL against the live database:\n\n```ts title=\"src/database/migrations/0007_backfill_post_slugs.ts\"\n// src/database/migrations/0007_backfill_post_slugs.ts\nimport { defineMigration } from '@kwiva/data'\n\nexport default defineMigration({\n  up: async ({ db, logger }) => {\n    const posts = await db.raw<Post>('select id, title from posts where slug is null')\n    for (const p of posts) {\n      await db.execute('update posts set slug = $1 where id = $2', [slugify(p.title), p.id])\n    }\n    logger.info({ updated: posts.length }, 'backfilled slugs')\n  },\n  down: async ({ db }) => {\n    await db.execute('update posts set slug = null')\n  },\n})\n```\n\n| Capability      | Detail                                                                           |\n| --------------- | -------------------------------------------------------------------------------- |\n| `db.raw`        | Typed read against the live database                                             |\n| `db.execute`    | Parameterized write (never interpolate values)                                   |\n| `db.chunk`      | `db.chunk('posts', 1000, async (rows) => ...)` — process large tables in batches |\n| `logger`        | Structured logging in the migration context                                      |\n| Default wrapper | Migrations run transactionally; a failure rolls back the step                    |\n\nFor very large backfills, chunk with `db.chunk` and pair the migration with a scheduled task for zero-downtime runs — see [Background Work: Scheduling](/docs/background-work/scheduling).\n\n## Reversible by Default [#reversible-by-default]\n\nEvery migration carries a `down` step so rollbacks are real operations, not fiction. `db:rollback --steps=1` reverses schema via `down`; `db:reset` is a full drop-and-rerun for development. The contract: `up` then `down` must restore the previous state, which is why hand-written backfills include both directions.\n\n## Deploy-Time Strategy [#deploy-time-strategy]\n\nSchema changes land with the release, not after it. The supported patterns:\n\n| Scenario                              | Pattern                                                                        |\n| ------------------------------------- | ------------------------------------------------------------------------------ |\n| Additive (new table, nullable column) | Migrate **before** deploy — old code stays compatible                          |\n| Backfill                              | Expand columns → backfill via task → tighten contract in a later release       |\n| Destructive (drop column/table)       | Double-write window → migrate consumers → drop in a later release              |\n| Rollback                              | `db:rollback --steps=n` for schema; data rollbacks via each migration's `down` |\n\nReleases that change routes or columns must run against both old and new shapes for one deploy cycle — the compatibility window documented per release. The same discipline applies to the framework's own engine upgrades, where migration is a first-class CLI operation. See [Advanced: Architecture Internals](/docs/advanced/architecture-internals) and [Deployment: Production Checklist](/docs/deployment/production-checklist) for the surrounding release process.\n\n## Tenant-Aware Migrations [#tenant-aware-migrations]\n\nMulti-tenant schemas sometimes need per-tenant strategies — shared tables with a tenant column (the default), or per-tenant schema/table layouts for compliance-heavy cases. Tenant-aware migration modes are configured in `src/config/tenancy.ts` and are `v1.x`. Until then, tenant-scoped models use row-level tenancy with a single shared schema. See [Tenancy](/docs/tenancy).\n\n## What's Next [#whats-next]\n\n1. [Models](/docs/data/models) — the model IR that `db:diff` compares against\n2. [Database Config](/docs/data/database-config) — drivers, connections, and pools migrations run on\n3. [Seeders](/docs/data/seeders) — what `db:reset` runs after migrating\n4. [CLI: Database Commands](/docs/cli/database-commands) — every migration-related flag\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Migrations evolve your database schema over time. Kwiva's approach is diff-driven: `kwiva db:diff` compares the model IR against the live database and proposes a migration; `kwiva db:migrate` applies pending migrations forward; `kwiva db:rollback` reverses them. Every migration is a **typed, hand-editable SQL-step file** — generated where possible, authored freely when a change is too nuanced for a diff."
		},
		{
			"heading": "the-workflow",
			"content": "Command"
		},
		{
			"heading": "the-workflow",
			"content": "Purpose"
		},
		{
			"heading": "the-workflow",
			"content": "`kwiva make:model invoice`"
		},
		{
			"heading": "the-workflow",
			"content": "Scaffold a model, its initial migration, and a factory stub"
		},
		{
			"heading": "the-workflow",
			"content": "`kwiva db:diff`"
		},
		{
			"heading": "the-workflow",
			"content": "Compute the delta between schema and live database as a proposal"
		},
		{
			"heading": "the-workflow",
			"content": "`kwiva db:migrate`"
		},
		{
			"heading": "the-workflow",
			"content": "Apply pending migrations in order"
		},
		{
			"heading": "the-workflow",
			"content": "`kwiva db:rollback --steps=n`"
		},
		{
			"heading": "the-workflow",
			"content": "Reverse the last `n` migrations via their `down` steps"
		},
		{
			"heading": "the-workflow",
			"content": "`kwiva db:status`"
		},
		{
			"heading": "the-workflow",
			"content": "Report applied and pending migrations"
		},
		{
			"heading": "the-workflow",
			"content": "`kwiva db:reset`"
		},
		{
			"heading": "the-workflow",
			"content": "Drop all objects, re-migrate, re-seed — destructive, dev only"
		},
		{
			"heading": "the-workflow",
			"content": "`kwiva db:browse`"
		},
		{
			"heading": "the-workflow",
			"content": "Interactive data browser (`v1.x`)"
		},
		{
			"heading": "defining-a-migration",
			"content": "A migration is a pair of typed SQL steps:"
		},
		{
			"heading": "defining-a-migration",
			"content": "Shape"
		},
		{
			"heading": "defining-a-migration",
			"content": "Meaning"
		},
		{
			"heading": "defining-a-migration",
			"content": "`up`"
		},
		{
			"heading": "defining-a-migration",
			"content": "The forward step, applied by `db:migrate`"
		},
		{
			"heading": "defining-a-migration",
			"content": "`down`"
		},
		{
			"heading": "defining-a-migration",
			"content": "The reverse step, applied by `db:rollback`"
		},
		{
			"heading": "defining-a-migration",
			"content": "`sql`"
		},
		{
			"heading": "defining-a-migration",
			"content": "A typed template-literal helper with parameterization and dialect awareness"
		},
		{
			"heading": "defining-a-migration",
			"content": "The `sql` tag typechecks the statement and keeps the migration dialect-correct for the configured driver, so the same file shape works on the SQLite dev database and the Postgres production database."
		},
		{
			"heading": "defining-a-migration",
			"content": "> \\[!NOTE]\n> Diff-generated migrations are complete but generic. Hand-editing is expected: rename with the data preserved, backfill columns, rewrite a constraint — the file is yours after generation."
		},
		{
			"heading": "generated-migrations-and-model-diffs",
			"content": "When a model changes, `kwiva db:diff` inspects what changed — a new field, a dropped field, an index, a unique constraint, a soft-delete flag — and writes a proposal migration. Accept it, review it, and it becomes the next numbered file. This keeps the model file as the source of truth and the migration files as the auditable changelog."
		},
		{
			"heading": "numbering-and-application-order",
			"content": "Migration files are numbered (`0001_`, `0002_`) and applied in **lexicographic order**. `db:status` reads both the file list and a tracking table, so:"
		},
		{
			"heading": "numbering-and-application-order",
			"content": "State"
		},
		{
			"heading": "numbering-and-application-order",
			"content": "Meaning"
		},
		{
			"heading": "numbering-and-application-order",
			"content": "Applied"
		},
		{
			"heading": "numbering-and-application-order",
			"content": "The migration exists in the tracking table and matches its file"
		},
		{
			"heading": "numbering-and-application-order",
			"content": "Pending"
		},
		{
			"heading": "numbering-and-application-order",
			"content": "A file exists that has not been applied"
		},
		{
			"heading": "numbering-and-application-order",
			"content": "Rolled back"
		},
		{
			"heading": "numbering-and-application-order",
			"content": "A migration was reversed by `db:rollback` and can be applied again"
		},
		{
			"heading": "numbering-and-application-order",
			"content": "Idempotency is a property of the tracking step, not of the SQL: `db:migrate` applies only pending files, so running it twice is a no-op; re-applying a rolled-back migration runs only its `up` again."
		},
		{
			"heading": "editing-generated-migrations",
			"content": "Diff-generated migrations are complete but generic, and hand-editing is expected. The two guards are:"
		},
		{
			"heading": "editing-generated-migrations",
			"content": "`up` then `down` must restore the prior state — the reversibility contract."
		},
		{
			"heading": "editing-generated-migrations",
			"content": "Columns that carry existing data need data-preserving statements (backfill before type change, rename rather than drop-and-recreate)."
		},
		{
			"heading": "editing-generated-migrations",
			"content": "A common edit is renaming a column: the diff proposes drop-and-add, but the data-preserving version is `ALTER TABLE ... RENAME COLUMN` followed by the new definition. Write it in the `sql` template, review the diff, migrate."
		},
		{
			"heading": "data-migrations-backfills",
			"content": "Schema changes are only half the job. Data migrations run arbitrary typed SQL against the live database:"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "Capability"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "Detail"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "`db.raw`"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "Typed read against the live database"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "`db.execute`"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "Parameterized write (never interpolate values)"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "`db.chunk`"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "`db.chunk('posts', 1000, async (rows) => ...)` — process large tables in batches"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "`logger`"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "Structured logging in the migration context"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "Default wrapper"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "Migrations run transactionally; a failure rolls back the step"
		},
		{
			"heading": "data-migrations-backfills",
			"content": "For very large backfills, chunk with `db.chunk` and pair the migration with a scheduled task for zero-downtime runs — see Background Work: Scheduling."
		},
		{
			"heading": "reversible-by-default",
			"content": "Every migration carries a `down` step so rollbacks are real operations, not fiction. `db:rollback --steps=1` reverses schema via `down`; `db:reset` is a full drop-and-rerun for development. The contract: `up` then `down` must restore the previous state, which is why hand-written backfills include both directions."
		},
		{
			"heading": "deploy-time-strategy",
			"content": "Schema changes land with the release, not after it. The supported patterns:"
		},
		{
			"heading": "deploy-time-strategy",
			"content": "Scenario"
		},
		{
			"heading": "deploy-time-strategy",
			"content": "Pattern"
		},
		{
			"heading": "deploy-time-strategy",
			"content": "Additive (new table, nullable column)"
		},
		{
			"heading": "deploy-time-strategy",
			"content": "Migrate **before** deploy — old code stays compatible"
		},
		{
			"heading": "deploy-time-strategy",
			"content": "Backfill"
		},
		{
			"heading": "deploy-time-strategy",
			"content": "Expand columns → backfill via task → tighten contract in a later release"
		},
		{
			"heading": "deploy-time-strategy",
			"content": "Destructive (drop column/table)"
		},
		{
			"heading": "deploy-time-strategy",
			"content": "Double-write window → migrate consumers → drop in a later release"
		},
		{
			"heading": "deploy-time-strategy",
			"content": "Rollback"
		},
		{
			"heading": "deploy-time-strategy",
			"content": "`db:rollback --steps=n` for schema; data rollbacks via each migration's `down`"
		},
		{
			"heading": "deploy-time-strategy",
			"content": "Releases that change routes or columns must run against both old and new shapes for one deploy cycle — the compatibility window documented per release. The same discipline applies to the framework's own engine upgrades, where migration is a first-class CLI operation. See Advanced: Architecture Internals and Deployment: Production Checklist for the surrounding release process."
		},
		{
			"heading": "tenant-aware-migrations",
			"content": "Multi-tenant schemas sometimes need per-tenant strategies — shared tables with a tenant column (the default), or per-tenant schema/table layouts for compliance-heavy cases. Tenant-aware migration modes are configured in `src/config/tenancy.ts` and are `v1.x`. Until then, tenant-scoped models use row-level tenancy with a single shared schema. See Tenancy."
		},
		{
			"heading": "whats-next",
			"content": "Models — the model IR that `db:diff` compares against"
		},
		{
			"heading": "whats-next",
			"content": "Database Config — drivers, connections, and pools migrations run on"
		},
		{
			"heading": "whats-next",
			"content": "Seeders — what `db:reset` runs after migrating"
		},
		{
			"heading": "whats-next",
			"content": "CLI: Database Commands — every migration-related flag"
		}
	],
	"headings": [
		{
			"id": "the-workflow",
			"content": "The Workflow"
		},
		{
			"id": "defining-a-migration",
			"content": "Defining a Migration"
		},
		{
			"id": "generated-migrations-and-model-diffs",
			"content": "Generated Migrations and Model Diffs"
		},
		{
			"id": "numbering-and-application-order",
			"content": "Numbering and Application Order"
		},
		{
			"id": "editing-generated-migrations",
			"content": "Editing Generated Migrations"
		},
		{
			"id": "data-migrations-backfills",
			"content": "Data Migrations (Backfills)"
		},
		{
			"id": "reversible-by-default",
			"content": "Reversible by Default"
		},
		{
			"id": "deploy-time-strategy",
			"content": "Deploy-Time Strategy"
		},
		{
			"id": "tenant-aware-migrations",
			"content": "Tenant-Aware Migrations"
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
		url: "#the-workflow",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Workflow" })
	},
	{
		depth: 2,
		url: "#defining-a-migration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Defining a Migration" })
	},
	{
		depth: 2,
		url: "#generated-migrations-and-model-diffs",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generated Migrations and Model Diffs" })
	},
	{
		depth: 2,
		url: "#numbering-and-application-order",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Numbering and Application Order" })
	},
	{
		depth: 2,
		url: "#editing-generated-migrations",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Editing Generated Migrations" })
	},
	{
		depth: 2,
		url: "#data-migrations-backfills",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Data Migrations (Backfills)" })
	},
	{
		depth: 2,
		url: "#reversible-by-default",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Reversible by Default" })
	},
	{
		depth: 2,
		url: "#deploy-time-strategy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Deploy-Time Strategy" })
	},
	{
		depth: 2,
		url: "#tenant-aware-migrations",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Tenant-Aware Migrations" })
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
			"Migrations evolve your database schema over time. Kwiva's approach is diff-driven: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:diff" }),
			" compares the model IR against the live database and proposes a migration; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
			" applies pending migrations forward; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:rollback" }),
			" reverses them. Every migration is a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "typed, hand-editable SQL-step file" }),
			" — generated where possible, authored freely when a change is too nuanced for a diff."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-workflow",
			children: "The Workflow"
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
							children: " make:model"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " invoice"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "    # model + migration + factory stub"
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
							children: "               # model IR vs live DB → migration proposal"
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
							children: " db:migrate"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "            # apply pending"
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
							children: " --steps=1"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: " # reverse the last N applied"
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
							children: " db:status"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "             # applied vs pending"
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
							children: "              # drop + migrate + seed"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:model invoice" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scaffold a model, its initial migration, and a factory stub" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:diff" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Compute the delta between schema and live database as a proposal" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Apply pending migrations in order" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:rollback --steps=n" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Reverse the last ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "n" }),
				" migrations via their ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "down" }),
				" steps"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:status" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Report applied and pending migrations" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:reset" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Drop all objects, re-migrate, re-seed — destructive, dev only" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:browse" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Interactive data browser (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "v1.x" }),
				")"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "defining-a-migration",
			children: "Defining a Migration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A migration is a pair of typed SQL steps:" }),
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
			title: "src/database/migrations/0001_create_posts.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/database/migrations/0001_create_posts.ts"
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
							children: " { defineMigration } "
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
							children: " defineMigration"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  up"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":   ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "sql"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " sql"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "`create table posts (...)`"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  down"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "sql"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " sql"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "`drop table posts`"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Shape" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "up" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["The forward step, applied by ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:migrate" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "down" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["The reverse step, applied by ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:rollback" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sql" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A typed template-literal helper with parameterization and dialect awareness" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sql" }),
			" tag typechecks the statement and keeps the migration dialect-correct for the configured driver, so the same file shape works on the SQLite dev database and the Postgres production database."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!NOTE]\nDiff-generated migrations are complete but generic. Hand-editing is expected: rename with the data preserved, backfill columns, rewrite a constraint — the file is yours after generation." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generated-migrations-and-model-diffs",
			children: "Generated Migrations and Model Diffs"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"When a model changes, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:diff" }),
			" inspects what changed — a new field, a dropped field, an index, a unique constraint, a soft-delete flag — and writes a proposal migration. Accept it, review it, and it becomes the next numbered file. This keeps the model file as the source of truth and the migration files as the auditable changelog."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "numbering-and-application-order",
			children: "Numbering and Application Order"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Migration files are numbered (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "0001_" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "0002_" }),
			") and applied in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "lexicographic order" }),
			". ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:status" }),
			" reads both the file list and a tracking table, so:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "State" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Applied" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The migration exists in the tracking table and matches its file" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pending" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A file exists that has not been applied" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rolled back" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"A migration was reversed by ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:rollback" }),
				" and can be applied again"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Idempotency is a property of the tracking step, not of the SQL: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:migrate" }),
			" applies only pending files, so running it twice is a no-op; re-applying a rolled-back migration runs only its ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "up" }),
			" again."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "editing-generated-migrations",
			children: "Editing Generated Migrations"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Diff-generated migrations are complete but generic, and hand-editing is expected. The two guards are:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "up" }),
				" then ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "down" }),
				" must restore the prior state — the reversibility contract."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Columns that carry existing data need data-preserving statements (backfill before type change, rename rather than drop-and-recreate)." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A common edit is renaming a column: the diff proposes drop-and-add, but the data-preserving version is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ALTER TABLE ... RENAME COLUMN" }),
			" followed by the new definition. Write it in the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sql" }),
			" template, review the diff, migrate."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "data-migrations-backfills",
			children: "Data Migrations (Backfills)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Schema changes are only half the job. Data migrations run arbitrary typed SQL against the live database:" }),
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
			title: "src/database/migrations/0007_backfill_post_slugs.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/database/migrations/0007_backfill_post_slugs.ts"
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
							children: " { defineMigration } "
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
							children: " defineMigration"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  up"
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
							children: "db"
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
							children: "logger"
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
							children: " posts"
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
							children: " db."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "raw"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "<"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "Post"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'select id, title from posts where slug is null'"
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
							children: "    for"
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
							children: " p"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " of"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " posts) {"
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
							children: "      await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " db."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "execute"
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
							children: "'update posts set slug = $1 where id = $2'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "slugify"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(p.title), p.id])"
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
						children: "    }"
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
							children: "    logger."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "info"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ updated: posts."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "length"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }, "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'backfilled slugs'"
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
						children: "  },"
					})
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
							children: "  down"
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
							children: "db"
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
							children: "    await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " db."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "execute"
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
							children: "'update posts set slug = null'"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Capability" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Detail" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db.raw" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Typed read against the live database" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db.execute" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Parameterized write (never interpolate values)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db.chunk" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db.chunk('posts', 1000, async (rows) => ...)" }), " — process large tables in batches"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "logger" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Structured logging in the migration context" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Default wrapper" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Migrations run transactionally; a failure rolls back the step" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For very large backfills, chunk with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db.chunk" }),
			" and pair the migration with a scheduled task for zero-downtime runs — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/scheduling",
				children: "Background Work: Scheduling"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "reversible-by-default",
			children: "Reversible by Default"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every migration carries a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "down" }),
			" step so rollbacks are real operations, not fiction. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:rollback --steps=1" }),
			" reverses schema via ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "down" }),
			"; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:reset" }),
			" is a full drop-and-rerun for development. The contract: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "up" }),
			" then ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "down" }),
			" must restore the previous state, which is why hand-written backfills include both directions."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "deploy-time-strategy",
			children: "Deploy-Time Strategy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Schema changes land with the release, not after it. The supported patterns:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Scenario" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Pattern" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Additive (new table, nullable column)" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Migrate ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "before" }),
				" deploy — old code stays compatible"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Backfill" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Expand columns → backfill via task → tighten contract in a later release" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Destructive (drop column/table)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Double-write window → migrate consumers → drop in a later release" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rollback" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:rollback --steps=n" }),
				" for schema; data rollbacks via each migration's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "down" })
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Releases that change routes or columns must run against both old and new shapes for one deploy cycle — the compatibility window documented per release. The same discipline applies to the framework's own engine upgrades, where migration is a first-class CLI operation. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/architecture-internals",
				children: "Advanced: Architecture Internals"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Deployment: Production Checklist"
			}),
			" for the surrounding release process."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "tenant-aware-migrations",
			children: "Tenant-Aware Migrations"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Multi-tenant schemas sometimes need per-tenant strategies — shared tables with a tenant column (the default), or per-tenant schema/table layouts for compliance-heavy cases. Tenant-aware migration modes are configured in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/tenancy.ts" }),
			" and are ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "v1.x" }),
			". Until then, tenant-scoped models use row-level tenancy with a single shared schema. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy",
				children: "Tenancy"
			}),
			"."
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
					href: "/docs/data/models",
					children: "Models"
				}),
				" — the model IR that ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:diff" }),
				" compares against"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/database-config",
				children: "Database Config"
			}), " — drivers, connections, and pools migrations run on"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/seeders",
					children: "Seeders"
				}),
				" — what ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:reset" }),
				" runs after migrating"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/database-commands",
				children: "CLI: Database Commands"
			}), " — every migration-related flag"] }),
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
