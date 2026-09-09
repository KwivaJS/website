import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/data/soft-deletes.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Soft Deletes",
	"description": "The deletedAt column — automatic filtering, withTrashed, onlyTrashed, restore, forceDelete, and how relations behave."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nSoft deletes mark records as deleted without permanently removing them. A `deletedAt` timestamp is set instead of the row disappearing, trashed rows are excluded from normal queries, and the record can be restored — or eventually purged for real. Soft deletes are a model option, so the column, the filtering, and the derived API behavior all come from one flag.\n\n## Enabling [#enabling]\n\n```ts title=\"enabling.ts\"\nexport default defineModel('posts', (f) => ({\n  title: f.string(),\n}), {\n  softDelete: true,\n})\n```\n\nThe option adds the `deletedAt` timestamp column to the schema and turns the generated `DELETE` route into a soft delete.\n\n| Setting                       | Effect                                                         |\n| ----------------------------- | -------------------------------------------------------------- |\n| `softDelete: true`            | `deletedAt` column added; default queries exclude trashed rows |\n| `softDelete: false` (default) | Hard deletes; no timestamp column                              |\n\n## Query Behavior [#query-behavior]\n\n```ts title=\"query-behavior.ts\"\nconst active = await Post.query().get()                  // excludes trashed rows (default)\nconst withTrashed = await Post.query().withTrashed().get() // includes everything\nconst trashed = await Post.query().onlyTrashed().get()   // only deleted rows\n```\n\n| Scope              | What it returns                                                       |\n| ------------------ | --------------------------------------------------------------------- |\n| Default `.query()` | Non-trashed rows only — `deletedAt is null` is injected automatically |\n| `.withTrashed()`   | All rows, trashed or not                                              |\n| `.onlyTrashed()`   | Trashed rows only                                                     |\n\nScoping is injected into the query the same way tenant scoping is — invisible to the rest of your builder chain, and still applied inside joins and eager loads.\n\n## Deleting and Restoring [#deleting-and-restoring]\n\n| Operation              | Behavior                                     |\n| ---------------------- | -------------------------------------------- |\n| `row.delete()`         | Sets `deletedAt`, row stays in the table     |\n| `Post.restore(id)`     | Clears `deletedAt`, row becomes active again |\n| `Post.forceDelete(id)` | Physically removes the row                   |\n\n```ts title=\"deleting-and-restoring.ts\"\nconst post = await Post.findOrFail(id)\nawait post.delete()                    // soft delete\n\nawait Post.restore(id)                 // clear deletedAt\n\nawait Post.withTrashed().first(...)    // find the trashed row...\nawait Post.forceDelete(id)             // ...then purge it for real\n```\n\n> \\[!NOTE]\n> `findOrFail` and `first` respect the default scope — a trashed row is invisible to them unless the query uses `withTrashed()`. Restoration and purge are the only operations that must target trashed rows explicitly.\n\n## The Generated API [#the-generated-api]\n\nWhen `softDelete` is enabled, the derived surface follows the soft-delete contract:\n\n| Route                   | Behavior                                                   |\n| ----------------------- | ---------------------------------------------------------- |\n| `DELETE /api/posts/:id` | Soft deletes (sets `deletedAt`)                            |\n| `PATCH /api/posts/:id`  | Fails on trashed rows with the standard not-found response |\n| List / get              | Trashed rows invisible by default                          |\n\nThis means public API clients cannot accidentally resurrect or purge rows — recovery is a controlled, server-side action via `restore` / `forceDelete`.\n\n## Relations and Soft Deletes [#relations-and-soft-deletes]\n\nSoft-delete scoping composes with relations. A `hasMany` eager load on a soft-deleted model respects the related model's scope, and a parent can be hidden while children remain — the per-model scope is applied consistently.\n\nWhen restoring, consider the object graph: restoring a parent does **not** automatically restore its children. If a soft-deleted parent has soft-deleted dependents, restore them explicitly after re-inheriting visibility.\n\n## Uniques and Soft Deletes [#uniques-and-soft-deletes]\n\nA unique constraint on a soft-deleted table eventually collides with a recreated row:\n\n```ts title=\"uniques-and-soft-deletes.ts\"\nemail: f.string().unique(),\n```\n\nIf a deleted user's email stays in the table with `deletedAt` set, a new user asserting the same email conflicts. For identifier reuse, either include `deletedAt` in the composite unique constraint (`uniques: [['email', 'deletedAt']]`) or purge trashed rows before recreating. The trade-off is schema-level, so pick deliberately per model.\n\n## Hard Delete When Needed [#hard-delete-when-needed]\n\nHard purge is always available even on soft-deleting models. `forceDelete` is the documented escape hatch for retention windows, GDPR-style lifecycle rules, and cleanup tasks. Prefer combining it with `db.chunk` and a scheduled task when purging old trash at volume — see [Background Work: Scheduling](/docs/background-work/scheduling).\n\n## Soft vs. Hard Delete [#soft-vs-hard-delete]\n\n| Consideration         | Soft delete                                           | Hard delete                           |\n| --------------------- | ----------------------------------------------------- | ------------------------------------- |\n| Recoverability        | Row remains, `restore` is instant                     | Permanent unless restored from backup |\n| Query cost            | Every default query adds a `deletedAt is null` filter | No extra filter                       |\n| Referential integrity | Children survive their parent's soft delete           | Foreign keys govern cleanup           |\n| Retention             | Rows accumulate until purged                          | Table stays lean                      |\n| Audit value           | History is keepable on the row itself                 | History needs a separate log          |\n\nChoose soft deletes when recovery matters (user accounts, documents, content), and hard deletes when the row has no recoverable value (sessions, tokens, transient joins). Retention hygiene still applies to soft-deleted rows: schedule a purge of trash older than the retention window rather than letting it accumulate.\n\n## When to Use Soft Deletes [#when-to-use-soft-deletes]\n\nConcrete signals that a model should be soft-deletable:\n\n* Deletion is user-visible and reversible (a document in the trash).\n* Deletion cascades matter and you need to reason about the graph before purging.\n* Compliance or audit contexts require knowing *when* a record was removed.\n* Business rules reference \"records that still exist in some state\" (`onlyTrashed` counts, restore flows).\n\nWhen none of those hold, the extra filter and column are pure overhead — keep the model hard-delete and rely on backups for recovery.\n\n## Indexing and Retention [#indexing-and-retention]\n\nThe default scope predicates on `deletedAt is null`, so composite indexes that lead with it perform well for \"active rows\" lists:\n\n| Column                   | Suggest index                            |\n| ------------------------ | ---------------------------------------- |\n| `status`                 | `['status', 'deletedAt']`                |\n| `tenantId` + `createdAt` | `['tenantId', 'deletedAt', 'createdAt']` |\n\nDeclare these through the model's `indexes` option. Retention is a policy, not a column: prefer a scheduled task that `forceDelete`s trash older than your window, chunked with `db.chunk` for large tables.\n\n## What's Next [#whats-next]\n\n1. [Models](/docs/data/models) — the `softDelete` option and the option table\n2. [Queries](/docs/data/queries) — how scopes layer into the builder\n3. [Relations](/docs/data/relations) — soft-delete behavior inside eager loads\n4. [Tenancy](/docs/tenancy) — scoping composes the same way tenant scoping does\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Soft deletes mark records as deleted without permanently removing them. A `deletedAt` timestamp is set instead of the row disappearing, trashed rows are excluded from normal queries, and the record can be restored — or eventually purged for real. Soft deletes are a model option, so the column, the filtering, and the derived API behavior all come from one flag."
		},
		{
			"heading": "enabling",
			"content": "The option adds the `deletedAt` timestamp column to the schema and turns the generated `DELETE` route into a soft delete."
		},
		{
			"heading": "enabling",
			"content": "Setting"
		},
		{
			"heading": "enabling",
			"content": "Effect"
		},
		{
			"heading": "enabling",
			"content": "`softDelete: true`"
		},
		{
			"heading": "enabling",
			"content": "`deletedAt` column added; default queries exclude trashed rows"
		},
		{
			"heading": "enabling",
			"content": "`softDelete: false` (default)"
		},
		{
			"heading": "enabling",
			"content": "Hard deletes; no timestamp column"
		},
		{
			"heading": "query-behavior",
			"content": "Scope"
		},
		{
			"heading": "query-behavior",
			"content": "What it returns"
		},
		{
			"heading": "query-behavior",
			"content": "Default `.query()`"
		},
		{
			"heading": "query-behavior",
			"content": "Non-trashed rows only — `deletedAt is null` is injected automatically"
		},
		{
			"heading": "query-behavior",
			"content": "`.withTrashed()`"
		},
		{
			"heading": "query-behavior",
			"content": "All rows, trashed or not"
		},
		{
			"heading": "query-behavior",
			"content": "`.onlyTrashed()`"
		},
		{
			"heading": "query-behavior",
			"content": "Trashed rows only"
		},
		{
			"heading": "query-behavior",
			"content": "Scoping is injected into the query the same way tenant scoping is — invisible to the rest of your builder chain, and still applied inside joins and eager loads."
		},
		{
			"heading": "deleting-and-restoring",
			"content": "Operation"
		},
		{
			"heading": "deleting-and-restoring",
			"content": "Behavior"
		},
		{
			"heading": "deleting-and-restoring",
			"content": "`row.delete()`"
		},
		{
			"heading": "deleting-and-restoring",
			"content": "Sets `deletedAt`, row stays in the table"
		},
		{
			"heading": "deleting-and-restoring",
			"content": "`Post.restore(id)`"
		},
		{
			"heading": "deleting-and-restoring",
			"content": "Clears `deletedAt`, row becomes active again"
		},
		{
			"heading": "deleting-and-restoring",
			"content": "`Post.forceDelete(id)`"
		},
		{
			"heading": "deleting-and-restoring",
			"content": "Physically removes the row"
		},
		{
			"heading": "deleting-and-restoring",
			"content": "> \\[!NOTE]\n> `findOrFail` and `first` respect the default scope — a trashed row is invisible to them unless the query uses `withTrashed()`. Restoration and purge are the only operations that must target trashed rows explicitly."
		},
		{
			"heading": "the-generated-api",
			"content": "When `softDelete` is enabled, the derived surface follows the soft-delete contract:"
		},
		{
			"heading": "the-generated-api",
			"content": "Route"
		},
		{
			"heading": "the-generated-api",
			"content": "Behavior"
		},
		{
			"heading": "the-generated-api",
			"content": "`DELETE /api/posts/:id`"
		},
		{
			"heading": "the-generated-api",
			"content": "Soft deletes (sets `deletedAt`)"
		},
		{
			"heading": "the-generated-api",
			"content": "`PATCH /api/posts/:id`"
		},
		{
			"heading": "the-generated-api",
			"content": "Fails on trashed rows with the standard not-found response"
		},
		{
			"heading": "the-generated-api",
			"content": "List / get"
		},
		{
			"heading": "the-generated-api",
			"content": "Trashed rows invisible by default"
		},
		{
			"heading": "the-generated-api",
			"content": "This means public API clients cannot accidentally resurrect or purge rows — recovery is a controlled, server-side action via `restore` / `forceDelete`."
		},
		{
			"heading": "relations-and-soft-deletes",
			"content": "Soft-delete scoping composes with relations. A `hasMany` eager load on a soft-deleted model respects the related model's scope, and a parent can be hidden while children remain — the per-model scope is applied consistently."
		},
		{
			"heading": "relations-and-soft-deletes",
			"content": "When restoring, consider the object graph: restoring a parent does **not** automatically restore its children. If a soft-deleted parent has soft-deleted dependents, restore them explicitly after re-inheriting visibility."
		},
		{
			"heading": "uniques-and-soft-deletes",
			"content": "A unique constraint on a soft-deleted table eventually collides with a recreated row:"
		},
		{
			"heading": "uniques-and-soft-deletes",
			"content": "If a deleted user's email stays in the table with `deletedAt` set, a new user asserting the same email conflicts. For identifier reuse, either include `deletedAt` in the composite unique constraint (`uniques: [['email', 'deletedAt']]`) or purge trashed rows before recreating. The trade-off is schema-level, so pick deliberately per model."
		},
		{
			"heading": "hard-delete-when-needed",
			"content": "Hard purge is always available even on soft-deleting models. `forceDelete` is the documented escape hatch for retention windows, GDPR-style lifecycle rules, and cleanup tasks. Prefer combining it with `db.chunk` and a scheduled task when purging old trash at volume — see Background Work: Scheduling."
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Consideration"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Soft delete"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Hard delete"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Recoverability"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Row remains, `restore` is instant"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Permanent unless restored from backup"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Query cost"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Every default query adds a `deletedAt is null` filter"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "No extra filter"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Referential integrity"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Children survive their parent's soft delete"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Foreign keys govern cleanup"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Retention"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Rows accumulate until purged"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Table stays lean"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Audit value"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "History is keepable on the row itself"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "History needs a separate log"
		},
		{
			"heading": "soft-vs-hard-delete",
			"content": "Choose soft deletes when recovery matters (user accounts, documents, content), and hard deletes when the row has no recoverable value (sessions, tokens, transient joins). Retention hygiene still applies to soft-deleted rows: schedule a purge of trash older than the retention window rather than letting it accumulate."
		},
		{
			"heading": "when-to-use-soft-deletes",
			"content": "Concrete signals that a model should be soft-deletable:"
		},
		{
			"heading": "when-to-use-soft-deletes",
			"content": "Deletion is user-visible and reversible (a document in the trash)."
		},
		{
			"heading": "when-to-use-soft-deletes",
			"content": "Deletion cascades matter and you need to reason about the graph before purging."
		},
		{
			"heading": "when-to-use-soft-deletes",
			"content": "Compliance or audit contexts require knowing *when* a record was removed."
		},
		{
			"heading": "when-to-use-soft-deletes",
			"content": "Business rules reference \"records that still exist in some state\" (`onlyTrashed` counts, restore flows)."
		},
		{
			"heading": "when-to-use-soft-deletes",
			"content": "When none of those hold, the extra filter and column are pure overhead — keep the model hard-delete and rely on backups for recovery."
		},
		{
			"heading": "indexing-and-retention",
			"content": "The default scope predicates on `deletedAt is null`, so composite indexes that lead with it perform well for \"active rows\" lists:"
		},
		{
			"heading": "indexing-and-retention",
			"content": "Column"
		},
		{
			"heading": "indexing-and-retention",
			"content": "Suggest index"
		},
		{
			"heading": "indexing-and-retention",
			"content": "`status`"
		},
		{
			"heading": "indexing-and-retention",
			"content": "`['status', 'deletedAt']`"
		},
		{
			"heading": "indexing-and-retention",
			"content": "`tenantId` + `createdAt`"
		},
		{
			"heading": "indexing-and-retention",
			"content": "`['tenantId', 'deletedAt', 'createdAt']`"
		},
		{
			"heading": "indexing-and-retention",
			"content": "Declare these through the model's `indexes` option. Retention is a policy, not a column: prefer a scheduled task that `forceDelete`s trash older than your window, chunked with `db.chunk` for large tables."
		},
		{
			"heading": "whats-next",
			"content": "Models — the `softDelete` option and the option table"
		},
		{
			"heading": "whats-next",
			"content": "Queries — how scopes layer into the builder"
		},
		{
			"heading": "whats-next",
			"content": "Relations — soft-delete behavior inside eager loads"
		},
		{
			"heading": "whats-next",
			"content": "Tenancy — scoping composes the same way tenant scoping does"
		}
	],
	"headings": [
		{
			"id": "enabling",
			"content": "Enabling"
		},
		{
			"id": "query-behavior",
			"content": "Query Behavior"
		},
		{
			"id": "deleting-and-restoring",
			"content": "Deleting and Restoring"
		},
		{
			"id": "the-generated-api",
			"content": "The Generated API"
		},
		{
			"id": "relations-and-soft-deletes",
			"content": "Relations and Soft Deletes"
		},
		{
			"id": "uniques-and-soft-deletes",
			"content": "Uniques and Soft Deletes"
		},
		{
			"id": "hard-delete-when-needed",
			"content": "Hard Delete When Needed"
		},
		{
			"id": "soft-vs-hard-delete",
			"content": "Soft vs. Hard Delete"
		},
		{
			"id": "when-to-use-soft-deletes",
			"content": "When to Use Soft Deletes"
		},
		{
			"id": "indexing-and-retention",
			"content": "Indexing and Retention"
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
		url: "#enabling",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Enabling" })
	},
	{
		depth: 2,
		url: "#query-behavior",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Query Behavior" })
	},
	{
		depth: 2,
		url: "#deleting-and-restoring",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Deleting and Restoring" })
	},
	{
		depth: 2,
		url: "#the-generated-api",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Generated API" })
	},
	{
		depth: 2,
		url: "#relations-and-soft-deletes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Relations and Soft Deletes" })
	},
	{
		depth: 2,
		url: "#uniques-and-soft-deletes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Uniques and Soft Deletes" })
	},
	{
		depth: 2,
		url: "#hard-delete-when-needed",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Hard Delete When Needed" })
	},
	{
		depth: 2,
		url: "#soft-vs-hard-delete",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Soft vs. Hard Delete" })
	},
	{
		depth: 2,
		url: "#when-to-use-soft-deletes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When to Use Soft Deletes" })
	},
	{
		depth: 2,
		url: "#indexing-and-retention",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Indexing and Retention" })
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
		em: "em",
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
			"Soft deletes mark records as deleted without permanently removing them. A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deletedAt" }),
			" timestamp is set instead of the row disappearing, trashed rows are excluded from normal queries, and the record can be restored — or eventually purged for real. Soft deletes are a model option, so the column, the filtering, and the derived API behavior all come from one flag."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "enabling",
			children: "Enabling"
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
			title: "enabling.ts",
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
							children: "(),"
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
			"The option adds the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deletedAt" }),
			" timestamp column to the schema and turns the generated ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DELETE" }),
			" route into a soft delete."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Setting" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Effect" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "softDelete: true" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deletedAt" }), " column added; default queries exclude trashed rows"] })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "softDelete: false" }), " (default)"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Hard deletes; no timestamp column" })] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "query-behavior",
			children: "Query Behavior"
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
			title: "query-behavior.ts",
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
							children: " active"
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
							children: "get"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()                  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// excludes trashed rows (default)"
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
							children: " withTrashed"
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
							children: "withTrashed"
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
							children: "get"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "() "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// includes everything"
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
							children: " trashed"
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
							children: "onlyTrashed"
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
							children: "get"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// only deleted rows"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Scope" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it returns" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Default ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".query()" })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Non-trashed rows only — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deletedAt is null" }),
				" is injected automatically"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".withTrashed()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "All rows, trashed or not" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".onlyTrashed()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Trashed rows only" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Scoping is injected into the query the same way tenant scoping is — invisible to the rest of your builder chain, and still applied inside joins and eager loads." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "deleting-and-restoring",
			children: "Deleting and Restoring"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Operation" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "row.delete()" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Sets ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deletedAt" }),
				", row stays in the table"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Post.restore(id)" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Clears ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deletedAt" }),
				", row becomes active again"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Post.forceDelete(id)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Physically removes the row" })] })
		] })] }),
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
			title: "deleting-and-restoring.ts",
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
							children: "(id)"
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
							children: " post."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "delete"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()                    "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// soft delete"
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
							children: "await"
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
							children: "restore"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(id)                 "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// clear deletedAt"
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
							children: "await"
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
							children: "withTrashed"
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
							children: "first"
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
							children: ")    "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// find the trashed row..."
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
							children: " Post."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "forceDelete"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(id)             "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// ...then purge it for real"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "findOrFail" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "first" }),
				" respect the default scope — a trashed row is invisible to them unless the query uses ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withTrashed()" }),
				". Restoration and purge are the only operations that must target trashed rows explicitly."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-generated-api",
			children: "The Generated API"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"When ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "softDelete" }),
			" is enabled, the derived surface follows the soft-delete contract:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Route" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DELETE /api/posts/:id" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Soft deletes (sets ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deletedAt" }),
				")"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PATCH /api/posts/:id" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Fails on trashed rows with the standard not-found response" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "List / get" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Trashed rows invisible by default" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This means public API clients cannot accidentally resurrect or purge rows — recovery is a controlled, server-side action via ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "restore" }),
			" / ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "forceDelete" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "relations-and-soft-deletes",
			children: "Relations and Soft Deletes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Soft-delete scoping composes with relations. A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "hasMany" }),
			" eager load on a soft-deleted model respects the related model's scope, and a parent can be hidden while children remain — the per-model scope is applied consistently."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"When restoring, consider the object graph: restoring a parent does ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "not" }),
			" automatically restore its children. If a soft-deleted parent has soft-deleted dependents, restore them explicitly after re-inheriting visibility."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "uniques-and-soft-deletes",
			children: "Uniques and Soft Deletes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A unique constraint on a soft-deleted table eventually collides with a recreated row:" }),
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
			title: "uniques-and-soft-deletes.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "email"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": f."
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
						children: "unique"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "(),"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"If a deleted user's email stays in the table with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deletedAt" }),
			" set, a new user asserting the same email conflicts. For identifier reuse, either include ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deletedAt" }),
			" in the composite unique constraint (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "uniques: [['email', 'deletedAt']]" }),
			") or purge trashed rows before recreating. The trade-off is schema-level, so pick deliberately per model."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "hard-delete-when-needed",
			children: "Hard Delete When Needed"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Hard purge is always available even on soft-deleting models. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "forceDelete" }),
			" is the documented escape hatch for retention windows, GDPR-style lifecycle rules, and cleanup tasks. Prefer combining it with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db.chunk" }),
			" and a scheduled task when purging old trash at volume — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/scheduling",
				children: "Background Work: Scheduling"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "soft-vs-hard-delete",
			children: "Soft vs. Hard Delete"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Consideration" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Soft delete" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Hard delete" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Recoverability" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Row remains, ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "restore" }),
					" is instant"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Permanent unless restored from backup" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Query cost" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Every default query adds a ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deletedAt is null" }),
					" filter"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "No extra filter" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Referential integrity" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Children survive their parent's soft delete" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Foreign keys govern cleanup" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Retention" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rows accumulate until purged" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Table stays lean" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Audit value" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "History is keepable on the row itself" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "History needs a separate log" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Choose soft deletes when recovery matters (user accounts, documents, content), and hard deletes when the row has no recoverable value (sessions, tokens, transient joins). Retention hygiene still applies to soft-deleted rows: schedule a purge of trash older than the retention window rather than letting it accumulate." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-to-use-soft-deletes",
			children: "When to Use Soft Deletes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Concrete signals that a model should be soft-deletable:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Deletion is user-visible and reversible (a document in the trash)." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Deletion cascades matter and you need to reason about the graph before purging." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Compliance or audit contexts require knowing ",
				(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "when" }),
				" a record was removed."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Business rules reference \"records that still exist in some state\" (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onlyTrashed" }),
				" counts, restore flows)."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "When none of those hold, the extra filter and column are pure overhead — keep the model hard-delete and rely on backups for recovery." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "indexing-and-retention",
			children: "Indexing and Retention"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The default scope predicates on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deletedAt is null" }),
			", so composite indexes that lead with it perform well for \"active rows\" lists:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Column" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Suggest index" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "status" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "['status', 'deletedAt']" }) })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
			" + ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createdAt" })
		] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "['tenantId', 'deletedAt', 'createdAt']" }) })] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Declare these through the model's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "indexes" }),
			" option. Retention is a policy, not a column: prefer a scheduled task that ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "forceDelete" }),
			"s trash older than your window, chunked with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db.chunk" }),
			" for large tables."
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
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "softDelete" }),
				" option and the option table"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/queries",
				children: "Queries"
			}), " — how scopes layer into the builder"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/relations",
				children: "Relations"
			}), " — soft-delete behavior inside eager loads"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy",
				children: "Tenancy"
			}), " — scoping composes the same way tenant scoping does"] }),
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
