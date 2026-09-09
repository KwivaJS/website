import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/studio/customization.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Customization",
	"description": "Override Studio screens per model, use per-field and per-action hooks, extend the UI kit, add bulk actions, and know when to keep generated UI versus build custom."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nGenerated UI covers the common operations surface out of the box: list, detail, create, edit, delete, with search, filters, and pagination driven by the model. When a screen needs more — a domain-specific table, a read-only field, a publish button, a bulk workflow — Studio lets you override at every level of granularity without abandoning the pipeline that keeps the rest of the back office in sync with your models.\n\nCustomization is additive and incremental. There is no fork of Studio to maintain, no second schema to keep in sync. Every override sits on top of the derived screen; the model IR remains the source of truth for types, validation, relations, and permissions.\n\n## The Override Hierarchy [#the-override-hierarchy]\n\nStudio exposes three scopes of customization, each wider than the last:\n\n| Scope          | Hook                 | Typical use                             |\n| -------------- | -------------------- | --------------------------------------- |\n| Per field      | `fields` map         | `readonly`, label, visibility           |\n| Per model      | `defineStudioScreen` | Custom table, actions, navigation group |\n| Whole instance | Config + branding    | Theme, logo, title                      |\n\nStart at the narrowest scope that solves the problem. A readonly field is two lines and leaves everything else generated; a custom table is one override but assumes you want to own that screen's rendering.\n\n## Overrides by Model [#overrides-by-model]\n\nThe primary customization hook is `defineStudioScreen`, one file per model, composed on top of the generated screen:\n\n```tsx title=\"src/app/studio/posts.tsx\"\n// src/app/studio/posts.tsx — override a model's Studio screens\nimport { defineStudioScreen } from '@kwiva/studio'\nimport { PostsTable } from '../ui/components/posts-table'\n\nexport default defineStudioScreen('posts', {\n  table: PostsTable,                      // custom DataTable component\n  fields: { title: { readonly: true } },  // per-field overrides\n  actions: [\n    { label: 'Publish', ability: 'posts.publish', run: (p) => client.posts.publish(p.id) },\n  ],\n  navigation: { group: 'Content', icon: 'document' },\n})\n```\n\nEach hook is a slice of the generated screen:\n\n| Option        | What it overrides                                                            |\n| ------------- | ---------------------------------------------------------------------------- |\n| `table`       | The DataTable component for the list screen                                  |\n| `fields`      | Per-field settings, such as `readonly`, across forms and tables              |\n| `actions`     | Custom actions attached to rows, each with a label, ability, and run handler |\n| `bulkActions` | Selection-level workflows on the list screen (v1.x)                          |\n| `navigation`  | Where the model appears in the generated navigation tree                     |\n\nOverrides are &#x2A;*partial by design.** Override one field and the rest of the form stays generated. Declare one custom action and the standard actions remain. You are patching the derived screen, not replacing the pipeline.\n\n## Per-Field Overrides [#per-field-overrides]\n\nThe `fields` map addresses individual fields by name. The common use cases:\n\n* **Readonly fields** — freeze a field on the create or edit form, for example a system-assigned key or a computed value\n* **Label overrides** — present the field to operators with a domain term instead of the model name\n* **Visibility** — hide a field from the table or form while keeping it in the API\n\nSince the underlying field type, validation, and relation wiring still come from the model, a readonly override does not loosen validation — it only changes how the field renders. Operators cannot type into a readonly field, but the API still enforces the field's chain.\n\n## Custom Actions [#custom-actions]\n\nCustom actions let you attach operations that go beyond the five standard CRUD actions, and each one is policy-gated:\n\n```tsx title=\"custom-actions.tsx\"\nactions: [\n  { label: 'Archive', ability: 'posts.archive', run: (p) => client.posts.archive(p.id) },\n  { label: 'Restore', ability: 'posts.restore', run: (p) => client.posts.restore(p.id) },\n]\n```\n\n* `label` is what operators see\n* `ability` names the policy ability that gates the action; without the ability the action is hidden or disabled, never shown and rejected\n* `run` receives the row and calls your typed client — which routes through the same generated API your controllers use\n\nCustom abilities come from controller actions; the route manifest registers them so they are typed and discoverable, not strings floating in app code. Define `archive` on the `posts` controller, name it in the Route Manifest, and the ability `posts.archive` is real: typed in the action definition and checked by the policy engine at runtime.\n\n## Bulk Actions [#bulk-actions]\n\nBulk workflows build on the list screen's selection model (v1.x):\n\n```tsx title=\"bulk-actions.tsx\"\nbulkActions: [\n  { label: 'Mark published', ability: 'posts.publish',\n    run: (rows) => client.posts.publishMany(rows.map((r) => r.id)) },\n]\n```\n\nA bulk action receives the selected rows and must respect per-row abilities — Studio filters the selection against each row's policy before invoking the handler, so an operator cannot bulk-launch an action on rows they could only read. Bulk delete and bulk update are built in; everything else is this hook.\n\n## Fully Custom Screens [#fully-custom-screens]\n\nWhen a model's operations genuinely diverge from CRUD, drop below the screen override and build a page with the UI kit patterns — the same components Studio uses internally:\n\n* `DataTable` for list-style pages\n* Form patterns that mirror the schema-derived forms\n* `CrudPage` layout that composes table, filters, and actions\n\nCustom pages live in your app code, import the typed client directly, and mount through the same navigation system. They are first-class Studio surfaces: policy checks, tenant scoping, and the generated navigation tree still apply because those run on the routes and typed client they call.\n\nA custom screen useful for genuinely divergent workflows:\n\n```tsx title=\"src/app/studio/moderation.tsx\"\n// src/app/studio/moderation.tsx\nimport { CrudPage, DataTable } from '@kwiva/studio'\nimport { defineStudioScreen } from '@kwiva/studio'\n\nexport default defineStudioScreen('moderation', {\n  render: () => (\n    <CrudPage title=\"Moderation queue\">\n      <DataTable model=\"posts\" filter={{ status: 'pending' }} />\n    </CrudPage>\n  ),\n  navigation: { group: 'Operations', icon: 'shield' },\n})\n```\n\n`render` replaces the generated screen body wholesale while keeping the Studio shell, navigation, and guards — the escape hatch for screens that are not list/detail CRUD but still belong inside Studio.\n\nCustom pages that are not per-model CRUD — dashboards, cross-model workflows, settings — mount through `defineStudioScreen` with a `navigation` entry just like model screens do.\n\n## The UI Kit [#the-ui-kit]\n\n`@kwiva/studio` ships the components Studio renders with, exported for your own pages. The kit keeps a custom surface visually consistent with the generated one: the same form primitives, the same table behavior, the same shell. Using the kit for custom pages is how Studio stays a single coherent back office instead of a patchwork of generated screens and hand-built islands.\n\n## Guards and Access [#guards-and-access]\n\nEvery Studio page — generated or custom — is subject to the same access rules:\n\n1. **Instance guard** — the `guard` configured on Studio decides who enters the namespace at all\n2. **Page-level roles** — `defineStudioScreen` accepts `access: { roles: ['staff'] }` (v1.x) to restrict a screen further\n3. **Action abilities** — the per-action `ability` check on every button\n\nCustom screens do not bypass any of these. A custom page is reached through the same navigation, guarded by the same session, and its calls run through the same policy engine — because it calls the typed client, and the typed client call is checked server-side.\n\n## Theming and Dark Mode [#theming-and-dark-mode]\n\nThe Studio shell and the generated screens are themeable through the same theming system as the public UI. From config:\n\n```ts title=\"theming-and-dark-mode.ts\"\nstudio: {\n  enabled: true,\n  branding: { logo: '/logo.svg', title: 'Acme Admin', theme: 'dark' },\n}\n```\n\nThe theme key switches the generated surface between light and dark without CSS overrides of its own, and the UI kit components inherit the same theme tokens. Because Studio is derived UI, theming is configuration rather than restyling — operators get a coherent branded admin experience that matches your product's visual language. See [Configuration](/docs/studio/configuration) for the full `branding` block.\n\n## The Navigation Tree [#the-navigation-tree]\n\nStudio builds its navigation automatically from your models:\n\n* Each model becomes a section entry unless you override its `navigation` group or icon\n* Custom `defineStudioScreen` files can place models into domain groups, for example `Content` and `Commerce`\n* Fully custom pages register as additional sections alongside the generated ones\n\nTenant and access shaping applies to navigation as well — models the current user cannot read do not advertise screens they cannot open.\n\n## What Customization Does Not Touch [#what-customization-does-not-touch]\n\nCustomization stops at presentation. It never loosens the guarantees the generated surface carries:\n\n* **No schema drift** — overrides do not re-declare types; the model remains the source\n* **No validation bypass** — readonly and hidden fields still validate at the API boundary\n* **No permission bypass** — every custom action and page is policy-checked\n* **No tenant bypass** — custom screens render the resolved tenant and nothing else\n\nIf a customization depends on bypassing one of these, the model or policy belongs elsewhere.\n\n## Generated Versus Custom [#generated-versus-custom]\n\nThe trade-off is consistent with the rest of the framework: &#x2A;*keep what your model naturally expresses, and override only the divergence.**\n\nKeep generated when:\n\n* The surface is plain CRUD on a model\n* Operators need search, filters, and pagination without bespoke behavior\n* Field-level tweaks such as readonly or labels cover the gap\n\nMove to custom when:\n\n* A table needs domain-specific rendering, sorting, or grouping the model cannot express\n* The workflow spans models — a multi-step form that writes several rows\n* Actions are inherently UI-driven, such as drag-and-drop ordering or canvas-style editors\n\nBecause overrides are partial and custom pages reuse the typed client, migrating a screen from generated to custom is incremental. You can also reverse it: a custom experiment that turns out to be plain CRUD can go back to generated with a single `defineStudioScreen` removal.\n\n## What's Next [#whats-next]\n\n* [Generated UI](/docs/studio/generated-ui) — the screens you are overriding\n* [Policies](/docs/authorization/policies) — abilities and the `permission` namespace behind every action\n* [RPC Client](/docs/frontend/rpc-client) — the typed client custom actions and pages call\n* [Controllers](/docs/http/controllers) — where custom abilities and actions are defined\n* [Multi-Tenancy](/docs/tenancy) — how tenant scoping constrains custom screens\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Generated UI covers the common operations surface out of the box: list, detail, create, edit, delete, with search, filters, and pagination driven by the model. When a screen needs more — a domain-specific table, a read-only field, a publish button, a bulk workflow — Studio lets you override at every level of granularity without abandoning the pipeline that keeps the rest of the back office in sync with your models."
		},
		{
			"heading": void 0,
			"content": "Customization is additive and incremental. There is no fork of Studio to maintain, no second schema to keep in sync. Every override sits on top of the derived screen; the model IR remains the source of truth for types, validation, relations, and permissions."
		},
		{
			"heading": "the-override-hierarchy",
			"content": "Studio exposes three scopes of customization, each wider than the last:"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "Scope"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "Hook"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "Typical use"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "Per field"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "`fields` map"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "`readonly`, label, visibility"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "Per model"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "`defineStudioScreen`"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "Custom table, actions, navigation group"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "Whole instance"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "Config + branding"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "Theme, logo, title"
		},
		{
			"heading": "the-override-hierarchy",
			"content": "Start at the narrowest scope that solves the problem. A readonly field is two lines and leaves everything else generated; a custom table is one override but assumes you want to own that screen's rendering."
		},
		{
			"heading": "overrides-by-model",
			"content": "The primary customization hook is `defineStudioScreen`, one file per model, composed on top of the generated screen:"
		},
		{
			"heading": "overrides-by-model",
			"content": "Each hook is a slice of the generated screen:"
		},
		{
			"heading": "overrides-by-model",
			"content": "Option"
		},
		{
			"heading": "overrides-by-model",
			"content": "What it overrides"
		},
		{
			"heading": "overrides-by-model",
			"content": "`table`"
		},
		{
			"heading": "overrides-by-model",
			"content": "The DataTable component for the list screen"
		},
		{
			"heading": "overrides-by-model",
			"content": "`fields`"
		},
		{
			"heading": "overrides-by-model",
			"content": "Per-field settings, such as `readonly`, across forms and tables"
		},
		{
			"heading": "overrides-by-model",
			"content": "`actions`"
		},
		{
			"heading": "overrides-by-model",
			"content": "Custom actions attached to rows, each with a label, ability, and run handler"
		},
		{
			"heading": "overrides-by-model",
			"content": "`bulkActions`"
		},
		{
			"heading": "overrides-by-model",
			"content": "Selection-level workflows on the list screen (v1.x)"
		},
		{
			"heading": "overrides-by-model",
			"content": "`navigation`"
		},
		{
			"heading": "overrides-by-model",
			"content": "Where the model appears in the generated navigation tree"
		},
		{
			"heading": "overrides-by-model",
			"content": "Overrides are &#x2A;*partial by design.** Override one field and the rest of the form stays generated. Declare one custom action and the standard actions remain. You are patching the derived screen, not replacing the pipeline."
		},
		{
			"heading": "per-field-overrides",
			"content": "The `fields` map addresses individual fields by name. The common use cases:"
		},
		{
			"heading": "per-field-overrides",
			"content": "**Readonly fields** — freeze a field on the create or edit form, for example a system-assigned key or a computed value"
		},
		{
			"heading": "per-field-overrides",
			"content": "**Label overrides** — present the field to operators with a domain term instead of the model name"
		},
		{
			"heading": "per-field-overrides",
			"content": "**Visibility** — hide a field from the table or form while keeping it in the API"
		},
		{
			"heading": "per-field-overrides",
			"content": "Since the underlying field type, validation, and relation wiring still come from the model, a readonly override does not loosen validation — it only changes how the field renders. Operators cannot type into a readonly field, but the API still enforces the field's chain."
		},
		{
			"heading": "custom-actions",
			"content": "Custom actions let you attach operations that go beyond the five standard CRUD actions, and each one is policy-gated:"
		},
		{
			"heading": "custom-actions",
			"content": "`label` is what operators see"
		},
		{
			"heading": "custom-actions",
			"content": "`ability` names the policy ability that gates the action; without the ability the action is hidden or disabled, never shown and rejected"
		},
		{
			"heading": "custom-actions",
			"content": "`run` receives the row and calls your typed client — which routes through the same generated API your controllers use"
		},
		{
			"heading": "custom-actions",
			"content": "Custom abilities come from controller actions; the route manifest registers them so they are typed and discoverable, not strings floating in app code. Define `archive` on the `posts` controller, name it in the Route Manifest, and the ability `posts.archive` is real: typed in the action definition and checked by the policy engine at runtime."
		},
		{
			"heading": "bulk-actions",
			"content": "Bulk workflows build on the list screen's selection model (v1.x):"
		},
		{
			"heading": "bulk-actions",
			"content": "A bulk action receives the selected rows and must respect per-row abilities — Studio filters the selection against each row's policy before invoking the handler, so an operator cannot bulk-launch an action on rows they could only read. Bulk delete and bulk update are built in; everything else is this hook."
		},
		{
			"heading": "fully-custom-screens",
			"content": "When a model's operations genuinely diverge from CRUD, drop below the screen override and build a page with the UI kit patterns — the same components Studio uses internally:"
		},
		{
			"heading": "fully-custom-screens",
			"content": "`DataTable` for list-style pages"
		},
		{
			"heading": "fully-custom-screens",
			"content": "Form patterns that mirror the schema-derived forms"
		},
		{
			"heading": "fully-custom-screens",
			"content": "`CrudPage` layout that composes table, filters, and actions"
		},
		{
			"heading": "fully-custom-screens",
			"content": "Custom pages live in your app code, import the typed client directly, and mount through the same navigation system. They are first-class Studio surfaces: policy checks, tenant scoping, and the generated navigation tree still apply because those run on the routes and typed client they call."
		},
		{
			"heading": "fully-custom-screens",
			"content": "A custom screen useful for genuinely divergent workflows:"
		},
		{
			"heading": "fully-custom-screens",
			"content": "`render` replaces the generated screen body wholesale while keeping the Studio shell, navigation, and guards — the escape hatch for screens that are not list/detail CRUD but still belong inside Studio."
		},
		{
			"heading": "fully-custom-screens",
			"content": "Custom pages that are not per-model CRUD — dashboards, cross-model workflows, settings — mount through `defineStudioScreen` with a `navigation` entry just like model screens do."
		},
		{
			"heading": "the-ui-kit",
			"content": "`@kwiva/studio` ships the components Studio renders with, exported for your own pages. The kit keeps a custom surface visually consistent with the generated one: the same form primitives, the same table behavior, the same shell. Using the kit for custom pages is how Studio stays a single coherent back office instead of a patchwork of generated screens and hand-built islands."
		},
		{
			"heading": "guards-and-access",
			"content": "Every Studio page — generated or custom — is subject to the same access rules:"
		},
		{
			"heading": "guards-and-access",
			"content": "**Instance guard** — the `guard` configured on Studio decides who enters the namespace at all"
		},
		{
			"heading": "guards-and-access",
			"content": "**Page-level roles** — `defineStudioScreen` accepts `access: { roles: ['staff'] }` (v1.x) to restrict a screen further"
		},
		{
			"heading": "guards-and-access",
			"content": "**Action abilities** — the per-action `ability` check on every button"
		},
		{
			"heading": "guards-and-access",
			"content": "Custom screens do not bypass any of these. A custom page is reached through the same navigation, guarded by the same session, and its calls run through the same policy engine — because it calls the typed client, and the typed client call is checked server-side."
		},
		{
			"heading": "theming-and-dark-mode",
			"content": "The Studio shell and the generated screens are themeable through the same theming system as the public UI. From config:"
		},
		{
			"heading": "theming-and-dark-mode",
			"content": "The theme key switches the generated surface between light and dark without CSS overrides of its own, and the UI kit components inherit the same theme tokens. Because Studio is derived UI, theming is configuration rather than restyling — operators get a coherent branded admin experience that matches your product's visual language. See Configuration for the full `branding` block."
		},
		{
			"heading": "the-navigation-tree",
			"content": "Studio builds its navigation automatically from your models:"
		},
		{
			"heading": "the-navigation-tree",
			"content": "Each model becomes a section entry unless you override its `navigation` group or icon"
		},
		{
			"heading": "the-navigation-tree",
			"content": "Custom `defineStudioScreen` files can place models into domain groups, for example `Content` and `Commerce`"
		},
		{
			"heading": "the-navigation-tree",
			"content": "Fully custom pages register as additional sections alongside the generated ones"
		},
		{
			"heading": "the-navigation-tree",
			"content": "Tenant and access shaping applies to navigation as well — models the current user cannot read do not advertise screens they cannot open."
		},
		{
			"heading": "what-customization-does-not-touch",
			"content": "Customization stops at presentation. It never loosens the guarantees the generated surface carries:"
		},
		{
			"heading": "what-customization-does-not-touch",
			"content": "**No schema drift** — overrides do not re-declare types; the model remains the source"
		},
		{
			"heading": "what-customization-does-not-touch",
			"content": "**No validation bypass** — readonly and hidden fields still validate at the API boundary"
		},
		{
			"heading": "what-customization-does-not-touch",
			"content": "**No permission bypass** — every custom action and page is policy-checked"
		},
		{
			"heading": "what-customization-does-not-touch",
			"content": "**No tenant bypass** — custom screens render the resolved tenant and nothing else"
		},
		{
			"heading": "what-customization-does-not-touch",
			"content": "If a customization depends on bypassing one of these, the model or policy belongs elsewhere."
		},
		{
			"heading": "generated-versus-custom",
			"content": "The trade-off is consistent with the rest of the framework: &#x2A;*keep what your model naturally expresses, and override only the divergence.**"
		},
		{
			"heading": "generated-versus-custom",
			"content": "Keep generated when:"
		},
		{
			"heading": "generated-versus-custom",
			"content": "The surface is plain CRUD on a model"
		},
		{
			"heading": "generated-versus-custom",
			"content": "Operators need search, filters, and pagination without bespoke behavior"
		},
		{
			"heading": "generated-versus-custom",
			"content": "Field-level tweaks such as readonly or labels cover the gap"
		},
		{
			"heading": "generated-versus-custom",
			"content": "Move to custom when:"
		},
		{
			"heading": "generated-versus-custom",
			"content": "A table needs domain-specific rendering, sorting, or grouping the model cannot express"
		},
		{
			"heading": "generated-versus-custom",
			"content": "The workflow spans models — a multi-step form that writes several rows"
		},
		{
			"heading": "generated-versus-custom",
			"content": "Actions are inherently UI-driven, such as drag-and-drop ordering or canvas-style editors"
		},
		{
			"heading": "generated-versus-custom",
			"content": "Because overrides are partial and custom pages reuse the typed client, migrating a screen from generated to custom is incremental. You can also reverse it: a custom experiment that turns out to be plain CRUD can go back to generated with a single `defineStudioScreen` removal."
		},
		{
			"heading": "whats-next",
			"content": "Generated UI — the screens you are overriding"
		},
		{
			"heading": "whats-next",
			"content": "Policies — abilities and the `permission` namespace behind every action"
		},
		{
			"heading": "whats-next",
			"content": "RPC Client — the typed client custom actions and pages call"
		},
		{
			"heading": "whats-next",
			"content": "Controllers — where custom abilities and actions are defined"
		},
		{
			"heading": "whats-next",
			"content": "Multi-Tenancy — how tenant scoping constrains custom screens"
		}
	],
	"headings": [
		{
			"id": "the-override-hierarchy",
			"content": "The Override Hierarchy"
		},
		{
			"id": "overrides-by-model",
			"content": "Overrides by Model"
		},
		{
			"id": "per-field-overrides",
			"content": "Per-Field Overrides"
		},
		{
			"id": "custom-actions",
			"content": "Custom Actions"
		},
		{
			"id": "bulk-actions",
			"content": "Bulk Actions"
		},
		{
			"id": "fully-custom-screens",
			"content": "Fully Custom Screens"
		},
		{
			"id": "the-ui-kit",
			"content": "The UI Kit"
		},
		{
			"id": "guards-and-access",
			"content": "Guards and Access"
		},
		{
			"id": "theming-and-dark-mode",
			"content": "Theming and Dark Mode"
		},
		{
			"id": "the-navigation-tree",
			"content": "The Navigation Tree"
		},
		{
			"id": "what-customization-does-not-touch",
			"content": "What Customization Does Not Touch"
		},
		{
			"id": "generated-versus-custom",
			"content": "Generated Versus Custom"
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
		url: "#the-override-hierarchy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Override Hierarchy" })
	},
	{
		depth: 2,
		url: "#overrides-by-model",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Overrides by Model" })
	},
	{
		depth: 2,
		url: "#per-field-overrides",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Per-Field Overrides" })
	},
	{
		depth: 2,
		url: "#custom-actions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Custom Actions" })
	},
	{
		depth: 2,
		url: "#bulk-actions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Bulk Actions" })
	},
	{
		depth: 2,
		url: "#fully-custom-screens",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Fully Custom Screens" })
	},
	{
		depth: 2,
		url: "#the-ui-kit",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The UI Kit" })
	},
	{
		depth: 2,
		url: "#guards-and-access",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Guards and Access" })
	},
	{
		depth: 2,
		url: "#theming-and-dark-mode",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Theming and Dark Mode" })
	},
	{
		depth: 2,
		url: "#the-navigation-tree",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Navigation Tree" })
	},
	{
		depth: 2,
		url: "#what-customization-does-not-touch",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Customization Does Not Touch" })
	},
	{
		depth: 2,
		url: "#generated-versus-custom",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generated Versus Custom" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Generated UI covers the common operations surface out of the box: list, detail, create, edit, delete, with search, filters, and pagination driven by the model. When a screen needs more — a domain-specific table, a read-only field, a publish button, a bulk workflow — Studio lets you override at every level of granularity without abandoning the pipeline that keeps the rest of the back office in sync with your models." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Customization is additive and incremental. There is no fork of Studio to maintain, no second schema to keep in sync. Every override sits on top of the derived screen; the model IR remains the source of truth for types, validation, relations, and permissions." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-override-hierarchy",
			children: "The Override Hierarchy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio exposes three scopes of customization, each wider than the last:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Scope" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Hook" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Typical use" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Per field" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fields" }), " map"] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readonly" }), ", label, visibility"] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Per model" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Custom table, actions, navigation group" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Whole instance" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Config + branding" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Theme, logo, title" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Start at the narrowest scope that solves the problem. A readonly field is two lines and leaves everything else generated; a custom table is one override but assumes you want to own that screen's rendering." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "overrides-by-model",
			children: "Overrides by Model"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The primary customization hook is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }),
			", one file per model, composed on top of the generated screen:"
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
			title: "src/app/studio/posts.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/studio/posts.tsx — override a model's Studio screens"
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
							children: " { defineStudioScreen } "
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
							children: " '@kwiva/studio'"
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
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { PostsTable } "
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
							children: " '../ui/components/posts-table'"
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
							children: " defineStudioScreen"
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
							children: ", {"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  table: PostsTable,                      "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// custom DataTable component"
					})]
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
							children: "  fields: { title: { readonly: "
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
							children: " } },  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// per-field overrides"
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
						children: "  actions: ["
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
							children: "    { label: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Publish'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ability: "
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
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "run"
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
							children: "p"
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
							children: "(p.id) },"
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
						children: "  ],"
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
							children: "  navigation: { group: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Content'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", icon: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'document'"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each hook is a slice of the generated screen:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Option" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it overrides" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "table" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The DataTable component for the list screen" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fields" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Per-field settings, such as ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readonly" }),
				", across forms and tables"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "actions" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Custom actions attached to rows, each with a label, ability, and run handler" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bulkActions" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Selection-level workflows on the list screen (v1.x)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "navigation" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Where the model appears in the generated navigation tree" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Overrides are ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "partial by design." }),
			" Override one field and the rest of the form stays generated. Declare one custom action and the standard actions remain. You are patching the derived screen, not replacing the pipeline."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "per-field-overrides",
			children: "Per-Field Overrides"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fields" }),
			" map addresses individual fields by name. The common use cases:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Readonly fields" }), " — freeze a field on the create or edit form, for example a system-assigned key or a computed value"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Label overrides" }), " — present the field to operators with a domain term instead of the model name"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Visibility" }), " — hide a field from the table or form while keeping it in the API"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Since the underlying field type, validation, and relation wiring still come from the model, a readonly override does not loosen validation — it only changes how the field renders. Operators cannot type into a readonly field, but the API still enforces the field's chain." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "custom-actions",
			children: "Custom Actions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Custom actions let you attach operations that go beyond the five standard CRUD actions, and each one is policy-gated:" }),
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
			title: "custom-actions.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "actions"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": ["
					})]
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
							children: "  { label: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Archive'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ability: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'posts.archive'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "run"
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
							children: "p"
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
							children: " client.posts."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "archive"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(p.id) },"
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
							children: "  { label: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Restore'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ability: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'posts.restore'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "run"
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
							children: "p"
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
							children: " client.posts."
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
							children: "(p.id) },"
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
						children: "]"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "label" }), " is what operators see"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ability" }), " names the policy ability that gates the action; without the ability the action is hidden or disabled, never shown and rejected"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "run" }), " receives the row and calls your typed client — which routes through the same generated API your controllers use"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Custom abilities come from controller actions; the route manifest registers them so they are typed and discoverable, not strings floating in app code. Define ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "archive" }),
			" on the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
			" controller, name it in the Route Manifest, and the ability ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.archive" }),
			" is real: typed in the action definition and checked by the policy engine at runtime."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "bulk-actions",
			children: "Bulk Actions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Bulk workflows build on the list screen's selection model (v1.x):" }),
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
			title: "bulk-actions.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "bulkActions"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": ["
					})]
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
							children: "  { label: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Mark published'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ability: "
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "    run"
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
							children: "rows"
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
							children: " client.posts."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "publishMany"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(rows."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "map"
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
							children: "r"
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
							children: " r.id)) },"
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
						children: "]"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A bulk action receives the selected rows and must respect per-row abilities — Studio filters the selection against each row's policy before invoking the handler, so an operator cannot bulk-launch an action on rows they could only read. Bulk delete and bulk update are built in; everything else is this hook." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "fully-custom-screens",
			children: "Fully Custom Screens"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "When a model's operations genuinely diverge from CRUD, drop below the screen override and build a page with the UI kit patterns — the same components Studio uses internally:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DataTable" }), " for list-style pages"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Form patterns that mirror the schema-derived forms" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "CrudPage" }), " layout that composes table, filters, and actions"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Custom pages live in your app code, import the typed client directly, and mount through the same navigation system. They are first-class Studio surfaces: policy checks, tenant scoping, and the generated navigation tree still apply because those run on the routes and typed client they call." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A custom screen useful for genuinely divergent workflows:" }),
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
			title: "src/app/studio/moderation.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/studio/moderation.tsx"
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
							children: " { CrudPage, DataTable } "
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
							children: " '@kwiva/studio'"
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
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { defineStudioScreen } "
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
							children: " '@kwiva/studio'"
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
							children: " defineStudioScreen"
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
							children: "'moderation'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  render"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": () "
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
							children: " ("
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
							children: "    <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "CrudPage"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " title"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"Moderation queue\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">"
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
							children: "      <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "DataTable"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " model"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"posts\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " filter"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "{{ status: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'pending'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }} />"
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
							children: "    </"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "CrudPage"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">"
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
						children: "  ),"
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
							children: "  navigation: { group: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Operations'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", icon: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'shield'"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "render" }), " replaces the generated screen body wholesale while keeping the Studio shell, navigation, and guards — the escape hatch for screens that are not list/detail CRUD but still belong inside Studio."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Custom pages that are not per-model CRUD — dashboards, cross-model workflows, settings — mount through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }),
			" with a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "navigation" }),
			" entry just like model screens do."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-ui-kit",
			children: "The UI Kit"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/studio" }), " ships the components Studio renders with, exported for your own pages. The kit keeps a custom surface visually consistent with the generated one: the same form primitives, the same table behavior, the same shell. Using the kit for custom pages is how Studio stays a single coherent back office instead of a patchwork of generated screens and hand-built islands."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "guards-and-access",
			children: "Guards and Access"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every Studio page — generated or custom — is subject to the same access rules:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Instance guard" }),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "guard" }),
				" configured on Studio decides who enters the namespace at all"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Page-level roles" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }),
				" accepts ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "access: { roles: ['staff'] }" }),
				" (v1.x) to restrict a screen further"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Action abilities" }),
				" — the per-action ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ability" }),
				" check on every button"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Custom screens do not bypass any of these. A custom page is reached through the same navigation, guarded by the same session, and its calls run through the same policy engine — because it calls the typed client, and the typed client call is checked server-side." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "theming-and-dark-mode",
			children: "Theming and Dark Mode"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The Studio shell and the generated screens are themeable through the same theming system as the public UI. From config:" }),
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
			title: "theming-and-dark-mode.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "studio"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  enabled"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  branding"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "logo"
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
							children: "'/logo.svg'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "title"
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
							children: "'Acme Admin'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "theme"
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
							children: "'dark'"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The theme key switches the generated surface between light and dark without CSS overrides of its own, and the UI kit components inherit the same theme tokens. Because Studio is derived UI, theming is configuration rather than restyling — operators get a coherent branded admin experience that matches your product's visual language. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/configuration",
				children: "Configuration"
			}),
			" for the full ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "branding" }),
			" block."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-navigation-tree",
			children: "The Navigation Tree"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio builds its navigation automatically from your models:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Each model becomes a section entry unless you override its ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "navigation" }),
				" group or icon"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Custom ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }),
				" files can place models into domain groups, for example ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Content" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Commerce" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Fully custom pages register as additional sections alongside the generated ones" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tenant and access shaping applies to navigation as well — models the current user cannot read do not advertise screens they cannot open." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-customization-does-not-touch",
			children: "What Customization Does Not Touch"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Customization stops at presentation. It never loosens the guarantees the generated surface carries:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No schema drift" }), " — overrides do not re-declare types; the model remains the source"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No validation bypass" }), " — readonly and hidden fields still validate at the API boundary"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No permission bypass" }), " — every custom action and page is policy-checked"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No tenant bypass" }), " — custom screens render the resolved tenant and nothing else"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "If a customization depends on bypassing one of these, the model or policy belongs elsewhere." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generated-versus-custom",
			children: "Generated Versus Custom"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: ["The trade-off is consistent with the rest of the framework: ", (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "keep what your model naturally expresses, and override only the divergence." })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Keep generated when:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The surface is plain CRUD on a model" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Operators need search, filters, and pagination without bespoke behavior" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Field-level tweaks such as readonly or labels cover the gap" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Move to custom when:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "A table needs domain-specific rendering, sorting, or grouping the model cannot express" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The workflow spans models — a multi-step form that writes several rows" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Actions are inherently UI-driven, such as drag-and-drop ordering or canvas-style editors" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because overrides are partial and custom pages reuse the typed client, migrating a screen from generated to custom is incremental. You can also reverse it: a custom experiment that turns out to be plain CRUD can go back to generated with a single ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }),
			" removal."
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
				href: "/docs/studio/generated-ui",
				children: "Generated UI"
			}), " — the screens you are overriding"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/authorization/policies",
					children: "Policies"
				}),
				" — abilities and the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" namespace behind every action"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/rpc-client",
				children: "RPC Client"
			}), " — the typed client custom actions and pages call"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/controllers",
				children: "Controllers"
			}), " — where custom abilities and actions are defined"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy",
				children: "Multi-Tenancy"
			}), " — how tenant scoping constrains custom screens"] }),
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
