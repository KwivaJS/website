import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/studio/generated-ui.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Generated UI",
	"description": "List, detail, create, and edit screens derived from the model IR — columns, filters, forms, and actions with no Studio-side schema."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nThe core promise of Studio is that its entire interface is derived from the model definition. This page walks through exactly what is generated for each model, how each screen maps back to the model IR, and the guarantees that fall out of deriving — rather than duplicating — your schema.\n\nStudio generates, never approximates. A column is the field type's renderer, a filter is the field's allowed values, a form field is the field's validation, an action is the model's policy. Nothing is guessed, which is why the admin UI and the API agree on every detail.\n\n## Screens Per Model [#screens-per-model]\n\nEvery model produces four screens. The route shape is deterministic, which makes Studio predictable to navigate, document, and link into:\n\n| Screen | URL                      | Contents                                                                                   |\n| ------ | ------------------------ | ------------------------------------------------------------------------------------------ |\n| List   | `/studio/posts`          | DataTable: typed columns, enum filters, full-text search, pagination, row and bulk actions |\n| Detail | `/studio/posts/:id`      | Field groups and relation previews                                                         |\n| Create | `/studio/posts/new`      | Schema-derived form                                                                        |\n| Edit   | `/studio/posts/:id/edit` | The same form, prefilled                                                                   |\n\nThe URLs are derived from the model name, so a model named `products` lands at `/studio/products` regardless of which folder it lives in. This deterministic addressing is what lets you link Studio screens into documentation, dashboards, and notifications before iteration.\n\n## A Model Driving Four Screens [#a-model-driving-four-screens]\n\nTake a model:\n\n```ts title=\"src/app/models/posts.ts\"\n// src/app/models/posts.ts\nimport { defineModel } from '@kwiva/data'\n\nexport default defineModel('posts', (f) => ({\n  id: f.id(),\n  title: f.string().validation((s) => s.min(1).max(200)),\n  body: f.text().optional(),\n  status: f.enum('draft', 'published', 'archived').default('draft').indexed(),\n  authorId: f.uuid().indexed(),\n  publishedAt: f.timestamp().optional(),\n  author: f.belongsTo(() => User),\n  comments: f.hasMany(() => Comment),\n}), {\n  timestamps: true,\n  uniques: [['authorId', 'title']],\n  permission: 'posts',\n})\n```\n\nFrom this single declaration, Studio derives:\n\n* **Columns** — field types become cell renderers. A timestamp renders as a formatted date, an enum renders as a tagged value, a boolean renders as a switch-readable cell, and relations render as links into the related screen.\n* **Filters** — enum fields get dropdown filters over their allowed values; relation fields get filtered pickers over the related model.\n* **Form fields** — validation flows from the field DSL. A string with `max(200)` enforces that limit on input; an optional field is not required; a field with a default shows that default. There are no separately maintained validation schemas for Studio.\n* **Actions** — the `permission` namespace on the model maps to its policy, and every action is gated against the current user's abilities.\n\n## The List Screen [#the-list-screen]\n\nThe DataTable is the workhorse of Studio and the screen your operators will live in:\n\n* **Typed columns** derived from the model IR; add or remove visible columns per screen without touching the model\n* **Full-text search** across the model's searchable fields\n* **Field filters** mirroring the model's enums and relations\n* **Pagination** matching the pagination API of the generated routes\n* **Row actions** — per-row edit, delete, and any custom actions you declare\n* **Bulk actions** — delete and update selected rows in one operation (v1.x)\n\nBecause scoping and policies run server-side on the generated routes, the list screen never needs to reimplement access rules. It renders rows the API returned and hides actions the user cannot perform. The DataTable is also the customization seam for the whole screen — see [Customization](/docs/studio/customization).\n\n## The Create and Edit Screens [#the-create-and-edit-screens]\n\nCreate and Edit share one schema-derived form:\n\n* Fields render according to their type — text, textarea, enum select, relation picker, date, and so on\n* Validation rules from the field DSL apply before submit, and the same rules are enforced again on the API boundary\n* Fields marked optional are not required; fields with defaults are prefilled with them\n* A `readonly` override (see [Customization](/docs/studio/customization)) can freeze a field on either screen\n\nThe edit screen loads the existing row through the typed client and prefills the form from it — the exact same read path your application uses, so what operators see is what your API serves. Submitting the create form calls the same generated create route your client would call; there is no second write path.\n\n## The Detail Screen [#the-detail-screen]\n\nThe detail screen is a read view of a single row:\n\n* Fields grouped by type and relation\n* Relation previews — a `belongsTo` shows a link to the related row; a `hasMany` shows a preview of related rows with a link to their screen\n* For audited models, the change history for the row\n* Per-row actions carried over from the list, so an operator can act without navigating away\n\n## Relation Editors [#relation-editors]\n\nRelations from the model IR become first-class editing surfaces (v1.x):\n\n* A `belongsTo` field renders as a picker over the related model's list route\n* A `hasMany` or `belongsToMany` field can create or pick related rows inline, without leaving the current screen\n* Picked rows are validated against the field's relation rules, including the tenant scoping and policy context of the parent row\n\nRelation edits go through the same generated routes as everything else, so creating a related row from a Studio form is no different from creating it through your API. See [Relations](/docs/data/relations) for the model-side surface these editors derive from.\n\n## Audit Trail [#audit-trail]\n\nModels declared with `{ audit: true }` record `createdBy` and `updatedBy` from the session on every row. Studio surfaces that history on the detail screen for audited models, and the built-in Audit screen (v1.x) aggregates change history across all audited models.\n\nThe audit trail is not decorative gating — it rests on the same policy engine. Operators see change history only if their abilities permit it, and tenant scoping applies to history records just as it applies to the rows themselves.\n\n## No Duplicated Studio-Side Schema [#no-duplicated-studio-side-schema]\n\nStudio holds zero copies of your schema. There is no Studio config file that re-declares fields, no admin-specific validation, no separate list of admin resources. The single pipeline is:\n\n```plaintext title=\"no-duplicated-studio-side-schema.txt\"\ndefineModel ──► model IR ──► generated routes ──► typed client ──► Studio screens\n```\n\nThis is the guarantee that matters operationally: &#x2A;*model changes flow to Studio without code.** Add a field in development and it appears in the form and the table on the next load. Change a validation rule and the form enforces it immediately. Because the API and the admin UI read from the same IR, the two cannot disagree.\n\n## Soft-Delete Aware [#soft-delete-aware]\n\nWhen a model declares soft deletes, Studio is aware of it:\n\n* Trashed rows are shown distinctly in the list\n* Restore and purge actions appear alongside the standard actions\n* The screen toggles between the live view and the trashed view following the same semantics as the model's query API\n\nRestore and purge are themselves policy-gated actions, so only operators with the matching abilities can bring a row back or remove it permanently. See [Soft Deletes](/docs/data/soft-deletes).\n\n## Built-In Screens [#built-in-screens]\n\nBeyond per-model CRUD, Studio ships operational screens (several v1.x) that are not tied to any single model:\n\n| Screen           | Purpose                                                          |\n| ---------------- | ---------------------------------------------------------------- |\n| Users & sessions | Engine user management — ban, impersonate, force sign-out (v1.x) |\n| Tenants          | Tenant list, plan, owner (when tenancy is enabled)               |\n| Queue            | Job table — pending/failed/dead-letter, retry (v1.x)             |\n| Schedule         | Task runs and manual trigger (v1.x)                              |\n| Audit            | Change history for `{ audit: true }` models (v1.x)               |\n| Settings         | Model-backed settings tables                                     |\n| Addons           | Installed addons — contributions, versions, update (v1.x)        |\n\nThese screens reuse the same machinery as generated CRUD — they read through the typed client, check abilities, and respect tenant scoping — so the Queue screen can show a failed job to an operator who has the queue ability and to no one else.\n\n## Guarantees [#guarantees]\n\nRecapping what generated UI holds true:\n\n1. **Policy enforcement** — every action checks abilities; Studio is never a bypass.\n2. **Tenant scoping** — Studio renders only the resolved tenant's data.\n3. **No drift** — screens regenerate from the IR; schema and UI stay in lockstep.\n4. **No secondary schema** — validation, columns, filters, and forms all come from the model.\n\n## What's Next [#whats-next]\n\n* [Customization](/docs/studio/customization) — override individual screens or fields\n* [Configuration](/docs/studio/configuration) — enabling, guarding, and branding Studio\n* [Models](/docs/data/models) — every model option that drives a Studio screen\n* [Data Hooks](/docs/frontend/data-hooks) — the typed client surface Studio reuses\n* [Policies](/docs/authorization/policies) — the ability model behind every action\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The core promise of Studio is that its entire interface is derived from the model definition. This page walks through exactly what is generated for each model, how each screen maps back to the model IR, and the guarantees that fall out of deriving — rather than duplicating — your schema."
		},
		{
			"heading": void 0,
			"content": "Studio generates, never approximates. A column is the field type's renderer, a filter is the field's allowed values, a form field is the field's validation, an action is the model's policy. Nothing is guessed, which is why the admin UI and the API agree on every detail."
		},
		{
			"heading": "screens-per-model",
			"content": "Every model produces four screens. The route shape is deterministic, which makes Studio predictable to navigate, document, and link into:"
		},
		{
			"heading": "screens-per-model",
			"content": "Screen"
		},
		{
			"heading": "screens-per-model",
			"content": "URL"
		},
		{
			"heading": "screens-per-model",
			"content": "Contents"
		},
		{
			"heading": "screens-per-model",
			"content": "List"
		},
		{
			"heading": "screens-per-model",
			"content": "`/studio/posts`"
		},
		{
			"heading": "screens-per-model",
			"content": "DataTable: typed columns, enum filters, full-text search, pagination, row and bulk actions"
		},
		{
			"heading": "screens-per-model",
			"content": "Detail"
		},
		{
			"heading": "screens-per-model",
			"content": "`/studio/posts/:id`"
		},
		{
			"heading": "screens-per-model",
			"content": "Field groups and relation previews"
		},
		{
			"heading": "screens-per-model",
			"content": "Create"
		},
		{
			"heading": "screens-per-model",
			"content": "`/studio/posts/new`"
		},
		{
			"heading": "screens-per-model",
			"content": "Schema-derived form"
		},
		{
			"heading": "screens-per-model",
			"content": "Edit"
		},
		{
			"heading": "screens-per-model",
			"content": "`/studio/posts/:id/edit`"
		},
		{
			"heading": "screens-per-model",
			"content": "The same form, prefilled"
		},
		{
			"heading": "screens-per-model",
			"content": "The URLs are derived from the model name, so a model named `products` lands at `/studio/products` regardless of which folder it lives in. This deterministic addressing is what lets you link Studio screens into documentation, dashboards, and notifications before iteration."
		},
		{
			"heading": "a-model-driving-four-screens",
			"content": "Take a model:"
		},
		{
			"heading": "a-model-driving-four-screens",
			"content": "From this single declaration, Studio derives:"
		},
		{
			"heading": "a-model-driving-four-screens",
			"content": "**Columns** — field types become cell renderers. A timestamp renders as a formatted date, an enum renders as a tagged value, a boolean renders as a switch-readable cell, and relations render as links into the related screen."
		},
		{
			"heading": "a-model-driving-four-screens",
			"content": "**Filters** — enum fields get dropdown filters over their allowed values; relation fields get filtered pickers over the related model."
		},
		{
			"heading": "a-model-driving-four-screens",
			"content": "**Form fields** — validation flows from the field DSL. A string with `max(200)` enforces that limit on input; an optional field is not required; a field with a default shows that default. There are no separately maintained validation schemas for Studio."
		},
		{
			"heading": "a-model-driving-four-screens",
			"content": "**Actions** — the `permission` namespace on the model maps to its policy, and every action is gated against the current user's abilities."
		},
		{
			"heading": "the-list-screen",
			"content": "The DataTable is the workhorse of Studio and the screen your operators will live in:"
		},
		{
			"heading": "the-list-screen",
			"content": "**Typed columns** derived from the model IR; add or remove visible columns per screen without touching the model"
		},
		{
			"heading": "the-list-screen",
			"content": "**Full-text search** across the model's searchable fields"
		},
		{
			"heading": "the-list-screen",
			"content": "**Field filters** mirroring the model's enums and relations"
		},
		{
			"heading": "the-list-screen",
			"content": "**Pagination** matching the pagination API of the generated routes"
		},
		{
			"heading": "the-list-screen",
			"content": "**Row actions** — per-row edit, delete, and any custom actions you declare"
		},
		{
			"heading": "the-list-screen",
			"content": "**Bulk actions** — delete and update selected rows in one operation (v1.x)"
		},
		{
			"heading": "the-list-screen",
			"content": "Because scoping and policies run server-side on the generated routes, the list screen never needs to reimplement access rules. It renders rows the API returned and hides actions the user cannot perform. The DataTable is also the customization seam for the whole screen — see Customization."
		},
		{
			"heading": "the-create-and-edit-screens",
			"content": "Create and Edit share one schema-derived form:"
		},
		{
			"heading": "the-create-and-edit-screens",
			"content": "Fields render according to their type — text, textarea, enum select, relation picker, date, and so on"
		},
		{
			"heading": "the-create-and-edit-screens",
			"content": "Validation rules from the field DSL apply before submit, and the same rules are enforced again on the API boundary"
		},
		{
			"heading": "the-create-and-edit-screens",
			"content": "Fields marked optional are not required; fields with defaults are prefilled with them"
		},
		{
			"heading": "the-create-and-edit-screens",
			"content": "A `readonly` override (see Customization) can freeze a field on either screen"
		},
		{
			"heading": "the-create-and-edit-screens",
			"content": "The edit screen loads the existing row through the typed client and prefills the form from it — the exact same read path your application uses, so what operators see is what your API serves. Submitting the create form calls the same generated create route your client would call; there is no second write path."
		},
		{
			"heading": "the-detail-screen",
			"content": "The detail screen is a read view of a single row:"
		},
		{
			"heading": "the-detail-screen",
			"content": "Fields grouped by type and relation"
		},
		{
			"heading": "the-detail-screen",
			"content": "Relation previews — a `belongsTo` shows a link to the related row; a `hasMany` shows a preview of related rows with a link to their screen"
		},
		{
			"heading": "the-detail-screen",
			"content": "For audited models, the change history for the row"
		},
		{
			"heading": "the-detail-screen",
			"content": "Per-row actions carried over from the list, so an operator can act without navigating away"
		},
		{
			"heading": "relation-editors",
			"content": "Relations from the model IR become first-class editing surfaces (v1.x):"
		},
		{
			"heading": "relation-editors",
			"content": "A `belongsTo` field renders as a picker over the related model's list route"
		},
		{
			"heading": "relation-editors",
			"content": "A `hasMany` or `belongsToMany` field can create or pick related rows inline, without leaving the current screen"
		},
		{
			"heading": "relation-editors",
			"content": "Picked rows are validated against the field's relation rules, including the tenant scoping and policy context of the parent row"
		},
		{
			"heading": "relation-editors",
			"content": "Relation edits go through the same generated routes as everything else, so creating a related row from a Studio form is no different from creating it through your API. See Relations for the model-side surface these editors derive from."
		},
		{
			"heading": "audit-trail",
			"content": "Models declared with `{ audit: true }` record `createdBy` and `updatedBy` from the session on every row. Studio surfaces that history on the detail screen for audited models, and the built-in Audit screen (v1.x) aggregates change history across all audited models."
		},
		{
			"heading": "audit-trail",
			"content": "The audit trail is not decorative gating — it rests on the same policy engine. Operators see change history only if their abilities permit it, and tenant scoping applies to history records just as it applies to the rows themselves."
		},
		{
			"heading": "no-duplicated-studio-side-schema",
			"content": "Studio holds zero copies of your schema. There is no Studio config file that re-declares fields, no admin-specific validation, no separate list of admin resources. The single pipeline is:"
		},
		{
			"heading": "no-duplicated-studio-side-schema",
			"content": "This is the guarantee that matters operationally: &#x2A;*model changes flow to Studio without code.** Add a field in development and it appears in the form and the table on the next load. Change a validation rule and the form enforces it immediately. Because the API and the admin UI read from the same IR, the two cannot disagree."
		},
		{
			"heading": "soft-delete-aware",
			"content": "When a model declares soft deletes, Studio is aware of it:"
		},
		{
			"heading": "soft-delete-aware",
			"content": "Trashed rows are shown distinctly in the list"
		},
		{
			"heading": "soft-delete-aware",
			"content": "Restore and purge actions appear alongside the standard actions"
		},
		{
			"heading": "soft-delete-aware",
			"content": "The screen toggles between the live view and the trashed view following the same semantics as the model's query API"
		},
		{
			"heading": "soft-delete-aware",
			"content": "Restore and purge are themselves policy-gated actions, so only operators with the matching abilities can bring a row back or remove it permanently. See Soft Deletes."
		},
		{
			"heading": "built-in-screens",
			"content": "Beyond per-model CRUD, Studio ships operational screens (several v1.x) that are not tied to any single model:"
		},
		{
			"heading": "built-in-screens",
			"content": "Screen"
		},
		{
			"heading": "built-in-screens",
			"content": "Purpose"
		},
		{
			"heading": "built-in-screens",
			"content": "Users & sessions"
		},
		{
			"heading": "built-in-screens",
			"content": "Engine user management — ban, impersonate, force sign-out (v1.x)"
		},
		{
			"heading": "built-in-screens",
			"content": "Tenants"
		},
		{
			"heading": "built-in-screens",
			"content": "Tenant list, plan, owner (when tenancy is enabled)"
		},
		{
			"heading": "built-in-screens",
			"content": "Queue"
		},
		{
			"heading": "built-in-screens",
			"content": "Job table — pending/failed/dead-letter, retry (v1.x)"
		},
		{
			"heading": "built-in-screens",
			"content": "Schedule"
		},
		{
			"heading": "built-in-screens",
			"content": "Task runs and manual trigger (v1.x)"
		},
		{
			"heading": "built-in-screens",
			"content": "Audit"
		},
		{
			"heading": "built-in-screens",
			"content": "Change history for `{ audit: true }` models (v1.x)"
		},
		{
			"heading": "built-in-screens",
			"content": "Settings"
		},
		{
			"heading": "built-in-screens",
			"content": "Model-backed settings tables"
		},
		{
			"heading": "built-in-screens",
			"content": "Addons"
		},
		{
			"heading": "built-in-screens",
			"content": "Installed addons — contributions, versions, update (v1.x)"
		},
		{
			"heading": "built-in-screens",
			"content": "These screens reuse the same machinery as generated CRUD — they read through the typed client, check abilities, and respect tenant scoping — so the Queue screen can show a failed job to an operator who has the queue ability and to no one else."
		},
		{
			"heading": "guarantees",
			"content": "Recapping what generated UI holds true:"
		},
		{
			"heading": "guarantees",
			"content": "**Policy enforcement** — every action checks abilities; Studio is never a bypass."
		},
		{
			"heading": "guarantees",
			"content": "**Tenant scoping** — Studio renders only the resolved tenant's data."
		},
		{
			"heading": "guarantees",
			"content": "**No drift** — screens regenerate from the IR; schema and UI stay in lockstep."
		},
		{
			"heading": "guarantees",
			"content": "**No secondary schema** — validation, columns, filters, and forms all come from the model."
		},
		{
			"heading": "whats-next",
			"content": "Customization — override individual screens or fields"
		},
		{
			"heading": "whats-next",
			"content": "Configuration — enabling, guarding, and branding Studio"
		},
		{
			"heading": "whats-next",
			"content": "Models — every model option that drives a Studio screen"
		},
		{
			"heading": "whats-next",
			"content": "Data Hooks — the typed client surface Studio reuses"
		},
		{
			"heading": "whats-next",
			"content": "Policies — the ability model behind every action"
		}
	],
	"headings": [
		{
			"id": "screens-per-model",
			"content": "Screens Per Model"
		},
		{
			"id": "a-model-driving-four-screens",
			"content": "A Model Driving Four Screens"
		},
		{
			"id": "the-list-screen",
			"content": "The List Screen"
		},
		{
			"id": "the-create-and-edit-screens",
			"content": "The Create and Edit Screens"
		},
		{
			"id": "the-detail-screen",
			"content": "The Detail Screen"
		},
		{
			"id": "relation-editors",
			"content": "Relation Editors"
		},
		{
			"id": "audit-trail",
			"content": "Audit Trail"
		},
		{
			"id": "no-duplicated-studio-side-schema",
			"content": "No Duplicated Studio-Side Schema"
		},
		{
			"id": "soft-delete-aware",
			"content": "Soft-Delete Aware"
		},
		{
			"id": "built-in-screens",
			"content": "Built-In Screens"
		},
		{
			"id": "guarantees",
			"content": "Guarantees"
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
		url: "#screens-per-model",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Screens Per Model" })
	},
	{
		depth: 2,
		url: "#a-model-driving-four-screens",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "A Model Driving Four Screens" })
	},
	{
		depth: 2,
		url: "#the-list-screen",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The List Screen" })
	},
	{
		depth: 2,
		url: "#the-create-and-edit-screens",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Create and Edit Screens" })
	},
	{
		depth: 2,
		url: "#the-detail-screen",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Detail Screen" })
	},
	{
		depth: 2,
		url: "#relation-editors",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Relation Editors" })
	},
	{
		depth: 2,
		url: "#audit-trail",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Audit Trail" })
	},
	{
		depth: 2,
		url: "#no-duplicated-studio-side-schema",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "No Duplicated Studio-Side Schema" })
	},
	{
		depth: 2,
		url: "#soft-delete-aware",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Soft-Delete Aware" })
	},
	{
		depth: 2,
		url: "#built-in-screens",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Built-In Screens" })
	},
	{
		depth: 2,
		url: "#guarantees",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Guarantees" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The core promise of Studio is that its entire interface is derived from the model definition. This page walks through exactly what is generated for each model, how each screen maps back to the model IR, and the guarantees that fall out of deriving — rather than duplicating — your schema." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio generates, never approximates. A column is the field type's renderer, a filter is the field's allowed values, a form field is the field's validation, an action is the model's policy. Nothing is guessed, which is why the admin UI and the API agree on every detail." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "screens-per-model",
			children: "Screens Per Model"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every model produces four screens. The route shape is deterministic, which makes Studio predictable to navigate, document, and link into:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Screen" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "URL" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Contents" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "List" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "DataTable: typed columns, enum filters, full-text search, pagination, row and bulk actions" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Detail" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Field groups and relation previews" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Create" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts/new" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Schema-derived form" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edit" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts/:id/edit" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The same form, prefilled" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The URLs are derived from the model name, so a model named ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "products" }),
			" lands at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/products" }),
			" regardless of which folder it lives in. This deterministic addressing is what lets you link Studio screens into documentation, dashboards, and notifications before iteration."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "a-model-driving-four-screens",
			children: "A Model Driving Four Screens"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Take a model:" }),
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "From this single declaration, Studio derives:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Columns" }), " — field types become cell renderers. A timestamp renders as a formatted date, an enum renders as a tagged value, a boolean renders as a switch-readable cell, and relations render as links into the related screen."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Filters" }), " — enum fields get dropdown filters over their allowed values; relation fields get filtered pickers over the related model."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Form fields" }),
				" — validation flows from the field DSL. A string with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "max(200)" }),
				" enforces that limit on input; an optional field is not required; a field with a default shows that default. There are no separately maintained validation schemas for Studio."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Actions" }),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" namespace on the model maps to its policy, and every action is gated against the current user's abilities."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-list-screen",
			children: "The List Screen"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The DataTable is the workhorse of Studio and the screen your operators will live in:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Typed columns" }), " derived from the model IR; add or remove visible columns per screen without touching the model"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Full-text search" }), " across the model's searchable fields"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Field filters" }), " mirroring the model's enums and relations"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Pagination" }), " matching the pagination API of the generated routes"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Row actions" }), " — per-row edit, delete, and any custom actions you declare"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Bulk actions" }), " — delete and update selected rows in one operation (v1.x)"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because scoping and policies run server-side on the generated routes, the list screen never needs to reimplement access rules. It renders rows the API returned and hides actions the user cannot perform. The DataTable is also the customization seam for the whole screen — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/customization",
				children: "Customization"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-create-and-edit-screens",
			children: "The Create and Edit Screens"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Create and Edit share one schema-derived form:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Fields render according to their type — text, textarea, enum select, relation picker, date, and so on" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Validation rules from the field DSL apply before submit, and the same rules are enforced again on the API boundary" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Fields marked optional are not required; fields with defaults are prefilled with them" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readonly" }),
				" override (see ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/studio/customization",
					children: "Customization"
				}),
				") can freeze a field on either screen"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The edit screen loads the existing row through the typed client and prefills the form from it — the exact same read path your application uses, so what operators see is what your API serves. Submitting the create form calls the same generated create route your client would call; there is no second write path." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-detail-screen",
			children: "The Detail Screen"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The detail screen is a read view of a single row:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Fields grouped by type and relation" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Relation previews — a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "belongsTo" }),
				" shows a link to the related row; a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "hasMany" }),
				" shows a preview of related rows with a link to their screen"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "For audited models, the change history for the row" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Per-row actions carried over from the list, so an operator can act without navigating away" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "relation-editors",
			children: "Relation Editors"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Relations from the model IR become first-class editing surfaces (v1.x):" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "belongsTo" }),
				" field renders as a picker over the related model's list route"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "hasMany" }),
				" or ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "belongsToMany" }),
				" field can create or pick related rows inline, without leaving the current screen"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Picked rows are validated against the field's relation rules, including the tenant scoping and policy context of the parent row" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Relation edits go through the same generated routes as everything else, so creating a related row from a Studio form is no different from creating it through your API. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/relations",
				children: "Relations"
			}),
			" for the model-side surface these editors derive from."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "audit-trail",
			children: "Audit Trail"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Models declared with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ audit: true }" }),
			" record ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createdBy" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "updatedBy" }),
			" from the session on every row. Studio surfaces that history on the detail screen for audited models, and the built-in Audit screen (v1.x) aggregates change history across all audited models."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The audit trail is not decorative gating — it rests on the same policy engine. Operators see change history only if their abilities permit it, and tenant scoping applies to history records just as it applies to the rows themselves." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "no-duplicated-studio-side-schema",
			children: "No Duplicated Studio-Side Schema"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio holds zero copies of your schema. There is no Studio config file that re-declares fields, no admin-specific validation, no separate list of admin resources. The single pipeline is:" }),
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
			title: "no-duplicated-studio-side-schema.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineModel ──► model IR ──► generated routes ──► typed client ──► Studio screens" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This is the guarantee that matters operationally: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "model changes flow to Studio without code." }),
			" Add a field in development and it appears in the form and the table on the next load. Change a validation rule and the form enforces it immediately. Because the API and the admin UI read from the same IR, the two cannot disagree."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "soft-delete-aware",
			children: "Soft-Delete Aware"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "When a model declares soft deletes, Studio is aware of it:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Trashed rows are shown distinctly in the list" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Restore and purge actions appear alongside the standard actions" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The screen toggles between the live view and the trashed view following the same semantics as the model's query API" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Restore and purge are themselves policy-gated actions, so only operators with the matching abilities can bring a row back or remove it permanently. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/soft-deletes",
				children: "Soft Deletes"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "built-in-screens",
			children: "Built-In Screens"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Beyond per-model CRUD, Studio ships operational screens (several v1.x) that are not tied to any single model:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Screen" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Users & sessions" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Engine user management — ban, impersonate, force sign-out (v1.x)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tenants" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tenant list, plan, owner (when tenancy is enabled)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Queue" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Job table — pending/failed/dead-letter, retry (v1.x)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Schedule" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Task runs and manual trigger (v1.x)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Audit" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Change history for ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ audit: true }" }),
				" models (v1.x)"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Settings" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model-backed settings tables" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Addons" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Installed addons — contributions, versions, update (v1.x)" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "These screens reuse the same machinery as generated CRUD — they read through the typed client, check abilities, and respect tenant scoping — so the Queue screen can show a failed job to an operator who has the queue ability and to no one else." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "guarantees",
			children: "Guarantees"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Recapping what generated UI holds true:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Policy enforcement" }), " — every action checks abilities; Studio is never a bypass."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tenant scoping" }), " — Studio renders only the resolved tenant's data."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No drift" }), " — screens regenerate from the IR; schema and UI stay in lockstep."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No secondary schema" }), " — validation, columns, filters, and forms all come from the model."] }),
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
				href: "/docs/studio/customization",
				children: "Customization"
			}), " — override individual screens or fields"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/configuration",
				children: "Configuration"
			}), " — enabling, guarding, and branding Studio"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}), " — every model option that drives a Studio screen"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
			}), " — the typed client surface Studio reuses"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/policies",
				children: "Policies"
			}), " — the ability model behind every action"] }),
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
