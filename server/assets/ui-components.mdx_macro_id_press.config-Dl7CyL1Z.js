import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/frontend/ui-components.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "UI Components",
	"description": "The built-in UI kit — tokens, primitives, components, patterns, DataTable, forms, and theming."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva ships a built-in UI kit — a component layer that provides the default look for generated screens and page scaffolds. It is fully replaceable: applications can use the kit, plain utility-first CSS, or their own component system. The framework requires only the token surface that the generated Studio screens use.\n\nThe kit is layered on **Base UI** primitives and **Tailwind v4** styling, and it is model-aware where it counts: its headline pieces are typed by the data layer, so screens are **derived, not duplicated**. Change the model, and the tables and forms that describe it change with it.\n\n## Scope of the Kit [#scope-of-the-kit]\n\nThe kit's job has two halves:\n\n* **Ship a coherent default look** for generated screens and scaffolds, so a new app is presentable before any styling work.\n* **Stay fully replaceable** — the framework only requires the token surface, so a team can restyle entirely without fighting the framework.\n\nAnything that is not presentational — data access, validation, navigation typing — lives in `@kwiva/react` and `@kwiva/client`, not in the kit. The kit is the last mile between model metadata and pixels.\n\n## Layering [#layering]\n\nThe kit is organized into four layers:\n\n```plaintext title=\"layering.txt\"\nthe built-in UI kit\n ├─ tokens      design tokens: colors, radii, spacing, dark mode\n ├─ primitives  accessible components: dialog, popover, select, tabs, toast\n ├─ components  DataTable, form fields, Sidebar, Topbar, EmptyState, Avatar, Badge\n └─ patterns    CrudPage, SettingsPage — used by Studio and scaffolds\n```\n\n* **Tokens** are the only cross-package contract between the kit and the rest of the app.\n* **Primitives** establish the accessibility baseline — focus management and aria wiring — so higher layers inherit it.\n* **Components** compose primitives into model-aware, data-aware surfaces.\n* **Patterns** combine components into whole screen shapes used by Studio and generated scaffolds.\n\nBecause accessibility lives in the primitives layer, every higher-layer component inherits focus management and aria wiring for free. See [Studio: Generated UI](/docs/studio/generated-ui) for how patterns drive screens.\n\n## The Component Inventory [#the-component-inventory]\n\nThe kit's shipped surface covers the shapes an admin surface needs most. A representative inventory:\n\n| Group      | Components                              | Notes                                           |\n| ---------- | --------------------------------------- | ----------------------------------------------- |\n| Layout     | `Sidebar`, `Topbar`, `EmptyState`       | Composes the shell of most admin screens        |\n| Data       | `DataTable`                             | Model-typed columns, filters, server pagination |\n| Forms      | `Form.Text`, `Form.Select`, `Form.Date` | Field metadata derived from `defineModel`       |\n| Feedback   | `Badge`, `Avatar`, `Toast`              | Primitive-backed, token-styled                  |\n| Navigation | `Link`                                  | The typed, preloading link from the router      |\n| Patterns   | `CrudPage`, `SettingsPage`              | Whole screens used by Studio and scaffolds      |\n\nNothing in this group is load-bearing for the framework itself — the only requirement is the token surface. A team that prefers a different table or form library swaps those pieces without touching the data layer or the server.\n\n## Layout Primitives & Link [#layout-primitives--link]\n\nThe kit ships layout primitives (Sidebar, Topbar, EmptyState) and the `Link` navigation component for consistent application chrome. Layout chrome composes the same way pages do — a `Sidebar` plus an `EmptyState` covers the shell of most admin screens, and `Link` carries the typed, preloading navigation described in [Navigation & Link](/docs/frontend/navigation).\n\n## Form Primitives [#form-primitives]\n\nForms are derived from `defineModel`. Field metadata — validation rules, enums, optionality — comes from the field DSL, so the form needs no second schema:\n\n```tsx title=\"form-primitives.tsx\"\nimport { Form } from '@kwiva/ui-kit'\n\n<Form model={Post} onSubmit={save.mutate}>\n  <Form.Text name=\"title\" />\n  <Form.Select enum=\"status\" />\n  <Form.Date name=\"publishedAt\" />\n</Form>\n```\n\nServer-side validation errors map per field through the typed client's error contract, so a model's `min`/`max` rules surface under the exact field that failed. On the client, the same schema powers inline validation before submit, via `useForm` — see [Data Hooks](/docs/frontend/data-hooks) and [Data Validation](/docs/data/validation).\n\n## DataTable [#datatable]\n\n`DataTable` is the workhorse of generated screens — server-driven pagination and filtering through the typed list endpoint of the model:\n\n```tsx title=\"datatable.tsx\"\nimport { DataTable } from '@kwiva/ui-kit'\n\n<DataTable\n  model={Post}                                   // typed columns from the model IR\n  columns={['title', 'status', 'author', 'publishedAt']}\n  filters={{ status: ['draft', 'published'] }}   // generated from enum fields\n  search={['title']}                             // full-text where allowed\n  rowActions={[{ label: 'Edit', to: p => `/posts/${p.id}/edit` }]}\n  bulkActions={[{ label: 'Archive', run: rows => client.posts.archiveMany(rows.map(r => r.id)) }]}\n/>\n```\n\n* Columns, filter options, and searchable fields derive from the model IR\n* Filtering and pagination run server-side through the typed client\n* Actions are policy-aware — hidden without the matching permission\n* Row actions navigate through the typed router; bulk actions dispatch through the typed client\n\nThe same table powers Studio's generated list screens, which is why a model change (a new enum, a reordered field list) updates the generated admin without touching the screen code.\n\n## Tokens & Theming [#tokens--theming]\n\nTokens are declared in a stylesheet that ships with the preset and can be overridden per app:\n\n```css title=\"tokens-theming.css\"\n/* src/styles/tokens.css — the default preset, overridable */\n@import 'tailwindcss';\n@theme {\n  --color-ember: #e25822;\n  --color-ink: #2b2b2b;\n  --color-crust: #faf3e8;\n  --radius-card: 12px;\n}\n```\n\nTheme selection lives in configuration and the root provider:\n\n| Surface                    | Role                                  |\n| -------------------------- | ------------------------------------- |\n| `src/config/ui.ts > theme` | Default theme for the app             |\n| `<Providers theme=...>`    | Theme override at the top of the tree |\n\nDark mode is token-swapped — the same components re-theme without layout changes. Because tokens are the only cross-package contract, restyling is a token change, not a component fork.\n\n## Patterns: Whole Screens [#patterns-whole-screens]\n\nPatterns combine components into screen-shaped surfaces used by Studio and generated scaffolds. `CrudPage` is the canonical example — a DataTable plus a create/edit form shell, wired to the model's list and mutation endpoints:\n\n```tsx title=\"patterns-whole-screens.tsx\"\n<CrudPage\n  model={Post}\n  columns={['title', 'status', 'author', 'publishedAt']}\n  fields={['title', 'body', 'status', 'publishedAt']}\n  onCreate={client.posts.create}\n  onUpdate={client.posts.update}\n  onDelete={client.posts.delete}\n/>\n```\n\n`SettingsPage` composes the same way for configuration surfaces — form sections, token-styled chrome, and the standard SettingsPage shell. Patterns inherit everything below them: model-typed columns, server validation mapping, policy-aware actions, and the accessibility baseline.\n\n## Accessibility & i18n [#accessibility--i18n]\n\n* Base UI primitives are the accessibility baseline — focus management and aria wiring live once at the primitive layer\n* All components read labels from the i18n catalog (v1.x) — generated scaffolds are translatable by default\n* The compact runtime mode is supported — components avoid runtime-specific APIs, so the same tree renders under either runtime\n\n## Styling Conventions [#styling-conventions]\n\n* Tailwind v4 utility-first styling; tokens as the only cross-package contract\n* `src/ui/styles/` holds app-level CSS entries, generated by `kwiva new`\n* The build pipeline handles CSS through its own CSS plugin plus the Tailwind v4 fast engine\n\n## The Kit Exists to Extend Studio [#the-kit-exists-to-extend-studio]\n\nStudio generates schema-derived screens from the model IR, and it renders them with this kit. Its purpose is twofold: Studio ships with a coherent default look, and that look is **extendable** — override screens per model or restyle entirely via the token surface. Because the kit and Studio read the same model metadata, a customization that works in one applies to the other. See [Studio](/docs/studio/generated-ui) and [Customization](/docs/studio/customization).\n\n## Usage Rules [#usage-rules]\n\n* Applications may use the kit, plain utility-first CSS, or their own system\n* The framework requires only the token surface Studio uses\n* No component code leaks into the data layer or server code — components render on the client boundary\n* The compact runtime mode is supported: components avoid runtime-specific APIs\n* The compact runtime mode is supported — components stay framework-agnostic within the React compat surface\n\n## What's Next [#whats-next]\n\n* [Studio](/docs/studio/generated-ui) — how the kit renders generated screens\n* [Studio Customization](/docs/studio/customization) — overriding screens per model\n* [Pages](/docs/frontend/pages) — where components and patterns live\n* [Navigation & Link](/docs/frontend/navigation) — the typed `Link` shipped by the kit\n* [Data Models](/docs/data/models) — the field DSL components derive from\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva ships a built-in UI kit — a component layer that provides the default look for generated screens and page scaffolds. It is fully replaceable: applications can use the kit, plain utility-first CSS, or their own component system. The framework requires only the token surface that the generated Studio screens use."
		},
		{
			"heading": void 0,
			"content": "The kit is layered on **Base UI** primitives and **Tailwind v4** styling, and it is model-aware where it counts: its headline pieces are typed by the data layer, so screens are **derived, not duplicated**. Change the model, and the tables and forms that describe it change with it."
		},
		{
			"heading": "scope-of-the-kit",
			"content": "The kit's job has two halves:"
		},
		{
			"heading": "scope-of-the-kit",
			"content": "**Ship a coherent default look** for generated screens and scaffolds, so a new app is presentable before any styling work."
		},
		{
			"heading": "scope-of-the-kit",
			"content": "**Stay fully replaceable** — the framework only requires the token surface, so a team can restyle entirely without fighting the framework."
		},
		{
			"heading": "scope-of-the-kit",
			"content": "Anything that is not presentational — data access, validation, navigation typing — lives in `@kwiva/react` and `@kwiva/client`, not in the kit. The kit is the last mile between model metadata and pixels."
		},
		{
			"heading": "layering",
			"content": "The kit is organized into four layers:"
		},
		{
			"heading": "layering",
			"content": "**Tokens** are the only cross-package contract between the kit and the rest of the app."
		},
		{
			"heading": "layering",
			"content": "**Primitives** establish the accessibility baseline — focus management and aria wiring — so higher layers inherit it."
		},
		{
			"heading": "layering",
			"content": "**Components** compose primitives into model-aware, data-aware surfaces."
		},
		{
			"heading": "layering",
			"content": "**Patterns** combine components into whole screen shapes used by Studio and generated scaffolds."
		},
		{
			"heading": "layering",
			"content": "Because accessibility lives in the primitives layer, every higher-layer component inherits focus management and aria wiring for free. See Studio: Generated UI for how patterns drive screens."
		},
		{
			"heading": "the-component-inventory",
			"content": "The kit's shipped surface covers the shapes an admin surface needs most. A representative inventory:"
		},
		{
			"heading": "the-component-inventory",
			"content": "Group"
		},
		{
			"heading": "the-component-inventory",
			"content": "Components"
		},
		{
			"heading": "the-component-inventory",
			"content": "Notes"
		},
		{
			"heading": "the-component-inventory",
			"content": "Layout"
		},
		{
			"heading": "the-component-inventory",
			"content": "`Sidebar`, `Topbar`, `EmptyState`"
		},
		{
			"heading": "the-component-inventory",
			"content": "Composes the shell of most admin screens"
		},
		{
			"heading": "the-component-inventory",
			"content": "Data"
		},
		{
			"heading": "the-component-inventory",
			"content": "`DataTable`"
		},
		{
			"heading": "the-component-inventory",
			"content": "Model-typed columns, filters, server pagination"
		},
		{
			"heading": "the-component-inventory",
			"content": "Forms"
		},
		{
			"heading": "the-component-inventory",
			"content": "`Form.Text`, `Form.Select`, `Form.Date`"
		},
		{
			"heading": "the-component-inventory",
			"content": "Field metadata derived from `defineModel`"
		},
		{
			"heading": "the-component-inventory",
			"content": "Feedback"
		},
		{
			"heading": "the-component-inventory",
			"content": "`Badge`, `Avatar`, `Toast`"
		},
		{
			"heading": "the-component-inventory",
			"content": "Primitive-backed, token-styled"
		},
		{
			"heading": "the-component-inventory",
			"content": "Navigation"
		},
		{
			"heading": "the-component-inventory",
			"content": "`Link`"
		},
		{
			"heading": "the-component-inventory",
			"content": "The typed, preloading link from the router"
		},
		{
			"heading": "the-component-inventory",
			"content": "Patterns"
		},
		{
			"heading": "the-component-inventory",
			"content": "`CrudPage`, `SettingsPage`"
		},
		{
			"heading": "the-component-inventory",
			"content": "Whole screens used by Studio and scaffolds"
		},
		{
			"heading": "the-component-inventory",
			"content": "Nothing in this group is load-bearing for the framework itself — the only requirement is the token surface. A team that prefers a different table or form library swaps those pieces without touching the data layer or the server."
		},
		{
			"heading": "layout-primitives--link",
			"content": "The kit ships layout primitives (Sidebar, Topbar, EmptyState) and the `Link` navigation component for consistent application chrome. Layout chrome composes the same way pages do — a `Sidebar` plus an `EmptyState` covers the shell of most admin screens, and `Link` carries the typed, preloading navigation described in Navigation & Link."
		},
		{
			"heading": "form-primitives",
			"content": "Forms are derived from `defineModel`. Field metadata — validation rules, enums, optionality — comes from the field DSL, so the form needs no second schema:"
		},
		{
			"heading": "form-primitives",
			"content": "Server-side validation errors map per field through the typed client's error contract, so a model's `min`/`max` rules surface under the exact field that failed. On the client, the same schema powers inline validation before submit, via `useForm` — see Data Hooks and Data Validation."
		},
		{
			"heading": "datatable",
			"content": "`DataTable` is the workhorse of generated screens — server-driven pagination and filtering through the typed list endpoint of the model:"
		},
		{
			"heading": "datatable",
			"content": "Columns, filter options, and searchable fields derive from the model IR"
		},
		{
			"heading": "datatable",
			"content": "Filtering and pagination run server-side through the typed client"
		},
		{
			"heading": "datatable",
			"content": "Actions are policy-aware — hidden without the matching permission"
		},
		{
			"heading": "datatable",
			"content": "Row actions navigate through the typed router; bulk actions dispatch through the typed client"
		},
		{
			"heading": "datatable",
			"content": "The same table powers Studio's generated list screens, which is why a model change (a new enum, a reordered field list) updates the generated admin without touching the screen code."
		},
		{
			"heading": "tokens--theming",
			"content": "Tokens are declared in a stylesheet that ships with the preset and can be overridden per app:"
		},
		{
			"heading": "tokens--theming",
			"content": "Theme selection lives in configuration and the root provider:"
		},
		{
			"heading": "tokens--theming",
			"content": "Surface"
		},
		{
			"heading": "tokens--theming",
			"content": "Role"
		},
		{
			"heading": "tokens--theming",
			"content": "`src/config/ui.ts > theme`"
		},
		{
			"heading": "tokens--theming",
			"content": "Default theme for the app"
		},
		{
			"heading": "tokens--theming",
			"content": "`<Providers theme=...>`"
		},
		{
			"heading": "tokens--theming",
			"content": "Theme override at the top of the tree"
		},
		{
			"heading": "tokens--theming",
			"content": "Dark mode is token-swapped — the same components re-theme without layout changes. Because tokens are the only cross-package contract, restyling is a token change, not a component fork."
		},
		{
			"heading": "patterns-whole-screens",
			"content": "Patterns combine components into screen-shaped surfaces used by Studio and generated scaffolds. `CrudPage` is the canonical example — a DataTable plus a create/edit form shell, wired to the model's list and mutation endpoints:"
		},
		{
			"heading": "patterns-whole-screens",
			"content": "`SettingsPage` composes the same way for configuration surfaces — form sections, token-styled chrome, and the standard SettingsPage shell. Patterns inherit everything below them: model-typed columns, server validation mapping, policy-aware actions, and the accessibility baseline."
		},
		{
			"heading": "accessibility--i18n",
			"content": "Base UI primitives are the accessibility baseline — focus management and aria wiring live once at the primitive layer"
		},
		{
			"heading": "accessibility--i18n",
			"content": "All components read labels from the i18n catalog (v1.x) — generated scaffolds are translatable by default"
		},
		{
			"heading": "accessibility--i18n",
			"content": "The compact runtime mode is supported — components avoid runtime-specific APIs, so the same tree renders under either runtime"
		},
		{
			"heading": "styling-conventions",
			"content": "Tailwind v4 utility-first styling; tokens as the only cross-package contract"
		},
		{
			"heading": "styling-conventions",
			"content": "`src/ui/styles/` holds app-level CSS entries, generated by `kwiva new`"
		},
		{
			"heading": "styling-conventions",
			"content": "The build pipeline handles CSS through its own CSS plugin plus the Tailwind v4 fast engine"
		},
		{
			"heading": "the-kit-exists-to-extend-studio",
			"content": "Studio generates schema-derived screens from the model IR, and it renders them with this kit. Its purpose is twofold: Studio ships with a coherent default look, and that look is **extendable** — override screens per model or restyle entirely via the token surface. Because the kit and Studio read the same model metadata, a customization that works in one applies to the other. See Studio and Customization."
		},
		{
			"heading": "usage-rules",
			"content": "Applications may use the kit, plain utility-first CSS, or their own system"
		},
		{
			"heading": "usage-rules",
			"content": "The framework requires only the token surface Studio uses"
		},
		{
			"heading": "usage-rules",
			"content": "No component code leaks into the data layer or server code — components render on the client boundary"
		},
		{
			"heading": "usage-rules",
			"content": "The compact runtime mode is supported: components avoid runtime-specific APIs"
		},
		{
			"heading": "usage-rules",
			"content": "The compact runtime mode is supported — components stay framework-agnostic within the React compat surface"
		},
		{
			"heading": "whats-next",
			"content": "Studio — how the kit renders generated screens"
		},
		{
			"heading": "whats-next",
			"content": "Studio Customization — overriding screens per model"
		},
		{
			"heading": "whats-next",
			"content": "Pages — where components and patterns live"
		},
		{
			"heading": "whats-next",
			"content": "Navigation & Link — the typed `Link` shipped by the kit"
		},
		{
			"heading": "whats-next",
			"content": "Data Models — the field DSL components derive from"
		}
	],
	"headings": [
		{
			"id": "scope-of-the-kit",
			"content": "Scope of the Kit"
		},
		{
			"id": "layering",
			"content": "Layering"
		},
		{
			"id": "the-component-inventory",
			"content": "The Component Inventory"
		},
		{
			"id": "layout-primitives--link",
			"content": "Layout Primitives & Link"
		},
		{
			"id": "form-primitives",
			"content": "Form Primitives"
		},
		{
			"id": "datatable",
			"content": "DataTable"
		},
		{
			"id": "tokens--theming",
			"content": "Tokens & Theming"
		},
		{
			"id": "patterns-whole-screens",
			"content": "Patterns: Whole Screens"
		},
		{
			"id": "accessibility--i18n",
			"content": "Accessibility & i18n"
		},
		{
			"id": "styling-conventions",
			"content": "Styling Conventions"
		},
		{
			"id": "the-kit-exists-to-extend-studio",
			"content": "The Kit Exists to Extend Studio"
		},
		{
			"id": "usage-rules",
			"content": "Usage Rules"
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
		url: "#scope-of-the-kit",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Scope of the Kit" })
	},
	{
		depth: 2,
		url: "#layering",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layering" })
	},
	{
		depth: 2,
		url: "#the-component-inventory",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Component Inventory" })
	},
	{
		depth: 2,
		url: "#layout-primitives--link",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layout Primitives & Link" })
	},
	{
		depth: 2,
		url: "#form-primitives",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Form Primitives" })
	},
	{
		depth: 2,
		url: "#datatable",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "DataTable" })
	},
	{
		depth: 2,
		url: "#tokens--theming",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Tokens & Theming" })
	},
	{
		depth: 2,
		url: "#patterns-whole-screens",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Patterns: Whole Screens" })
	},
	{
		depth: 2,
		url: "#accessibility--i18n",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Accessibility & i18n" })
	},
	{
		depth: 2,
		url: "#styling-conventions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Styling Conventions" })
	},
	{
		depth: 2,
		url: "#the-kit-exists-to-extend-studio",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Kit Exists to Extend Studio" })
	},
	{
		depth: 2,
		url: "#usage-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Usage Rules" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva ships a built-in UI kit — a component layer that provides the default look for generated screens and page scaffolds. It is fully replaceable: applications can use the kit, plain utility-first CSS, or their own component system. The framework requires only the token surface that the generated Studio screens use." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The kit is layered on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Base UI" }),
			" primitives and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tailwind v4" }),
			" styling, and it is model-aware where it counts: its headline pieces are typed by the data layer, so screens are ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "derived, not duplicated" }),
			". Change the model, and the tables and forms that describe it change with it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "scope-of-the-kit",
			children: "Scope of the Kit"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The kit's job has two halves:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Ship a coherent default look" }), " for generated screens and scaffolds, so a new app is presentable before any styling work."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Stay fully replaceable" }), " — the framework only requires the token surface, so a team can restyle entirely without fighting the framework."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Anything that is not presentational — data access, validation, navigation typing — lives in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }),
			", not in the kit. The kit is the last mile between model metadata and pixels."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layering",
			children: "Layering"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The kit is organized into four layers:" }),
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
			title: "layering.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "the built-in UI kit" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ tokens      design tokens: colors, radii, spacing, dark mode" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ primitives  accessible components: dialog, popover, select, tabs, toast" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ components  DataTable, form fields, Sidebar, Topbar, EmptyState, Avatar, Badge" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " └─ patterns    CrudPage, SettingsPage — used by Studio and scaffolds" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tokens" }), " are the only cross-package contract between the kit and the rest of the app."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Primitives" }), " establish the accessibility baseline — focus management and aria wiring — so higher layers inherit it."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Components" }), " compose primitives into model-aware, data-aware surfaces."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Patterns" }), " combine components into whole screen shapes used by Studio and generated scaffolds."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because accessibility lives in the primitives layer, every higher-layer component inherits focus management and aria wiring for free. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/generated-ui",
				children: "Studio: Generated UI"
			}),
			" for how patterns drive screens."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-component-inventory",
			children: "The Component Inventory"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The kit's shipped surface covers the shapes an admin surface needs most. A representative inventory:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Group" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Components" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Notes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Layout" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Sidebar" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Topbar" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "EmptyState" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Composes the shell of most admin screens" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Data" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DataTable" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model-typed columns, filters, server pagination" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Forms" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Form.Text" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Form.Select" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Form.Date" })
				] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Field metadata derived from ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Feedback" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Badge" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Avatar" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Toast" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Primitive-backed, token-styled" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Navigation" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Link" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The typed, preloading link from the router" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Patterns" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "CrudPage" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "SettingsPage" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Whole screens used by Studio and scaffolds" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Nothing in this group is load-bearing for the framework itself — the only requirement is the token surface. A team that prefers a different table or form library swaps those pieces without touching the data layer or the server." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layout-primitives--link",
			children: "Layout Primitives & Link"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The kit ships layout primitives (Sidebar, Topbar, EmptyState) and the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Link" }),
			" navigation component for consistent application chrome. Layout chrome composes the same way pages do — a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Sidebar" }),
			" plus an ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "EmptyState" }),
			" covers the shell of most admin screens, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Link" }),
			" carries the typed, preloading navigation described in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/navigation",
				children: "Navigation & Link"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "form-primitives",
			children: "Form Primitives"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Forms are derived from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			". Field metadata — validation rules, enums, optionality — comes from the field DSL, so the form needs no second schema:"
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
			title: "form-primitives.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
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
							children: " { Form } "
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
							children: " '@kwiva/ui-kit'"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "<"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Form"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "{Post} "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "onSubmit"
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
							children: "{save.mutate}>"
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
							children: "  <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Form.Text"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " name"
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
							children: "\"title\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " />"
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
							children: "  <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Form.Select"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " enum"
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
							children: "\"status\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " />"
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
							children: "  <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Form.Date"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " name"
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
							children: "\"publishedAt\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " />"
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
							children: "</"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Form"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Server-side validation errors map per field through the typed client's error contract, so a model's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "min" }),
			"/",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "max" }),
			" rules surface under the exact field that failed. On the client, the same schema powers inline validation before submit, via ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useForm" }),
			" — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/validation",
				children: "Data Validation"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "datatable",
			children: "DataTable"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DataTable" }), " is the workhorse of generated screens — server-driven pagination and filtering through the typed list endpoint of the model:"] }),
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
			title: "datatable.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
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
							children: " { DataTable } "
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
							children: " '@kwiva/ui-kit'"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "<"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "DataTable"
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
							children: "  model"
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
							children: "{Post}                                   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// typed columns from the model IR"
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
							children: "  columns"
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
							children: "{["
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
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'status'"
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
							children: "'author'"
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
							children: "'publishedAt'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "]}"
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
							children: "  filters"
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
							children: "{{ status: ["
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
							children: "] }}   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// generated from enum fields"
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
							children: "  search"
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
							children: "{["
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
							children: "]}                             "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// full-text where allowed"
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
							children: "  rowActions"
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
							children: "{[{ label: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Edit'"
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
							children: "to"
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
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "p"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " =>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " `/posts/${"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "p"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "id"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "}/edit`"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }]}"
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
							children: "  bulkActions"
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
							children: "{[{ label: "
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
							children: ": "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " =>"
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
							children: "archiveMany"
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
							children: "("
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " =>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " r.id)) }]}"
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
						children: "/>"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Columns, filter options, and searchable fields derive from the model IR" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Filtering and pagination run server-side through the typed client" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Actions are policy-aware — hidden without the matching permission" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Row actions navigate through the typed router; bulk actions dispatch through the typed client" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The same table powers Studio's generated list screens, which is why a model change (a new enum, a reordered field list) updates the generated admin without touching the screen code." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "tokens--theming",
			children: "Tokens & Theming"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tokens are declared in a stylesheet that ships with the preset and can be overridden per app:" }),
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
			title: "tokens-theming.css",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "/* src/styles/tokens.css — the default preset, overridable */"
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
							children: "@import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " 'tailwindcss'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ";"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "@theme"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " {"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  --color-ember: "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#B31D28",
							"--shiki-light-font-style": "italic",
							"--shiki-dark": "#FDAEB7",
							"--shiki-dark-font-style": "italic"
						},
						children: "#e25822;"
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
							children: "  --color-ink: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#B31D28",
								"--shiki-light-font-style": "italic",
								"--shiki-dark": "#FDAEB7",
								"--shiki-dark-font-style": "italic"
							},
							children: "#2b2b2b"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ";"
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
						children: "  --color-crust: "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#B31D28",
							"--shiki-light-font-style": "italic",
							"--shiki-dark": "#FDAEB7",
							"--shiki-dark-font-style": "italic"
						},
						children: "#faf3e8;"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  --radius-card: 12px;"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Theme selection lives in configuration and the root provider:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Role" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/ui.ts > theme" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Default theme for the app" })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "<Providers theme=...>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Theme override at the top of the tree" })] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Dark mode is token-swapped — the same components re-theme without layout changes. Because tokens are the only cross-package contract, restyling is a token change, not a component fork." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "patterns-whole-screens",
			children: "Patterns: Whole Screens"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Patterns combine components into screen-shaped surfaces used by Studio and generated scaffolds. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "CrudPage" }),
			" is the canonical example — a DataTable plus a create/edit form shell, wired to the model's list and mutation endpoints:"
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
			title: "patterns-whole-screens.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "<"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "CrudPage"
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
							children: "  model"
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
							children: "{Post}"
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
							children: "  columns"
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
							children: "{["
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
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'status'"
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
							children: "'author'"
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
							children: "'publishedAt'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "]}"
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
							children: "  fields"
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
							children: "{["
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
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'body'"
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
							children: "'status'"
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
							children: "'publishedAt'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "]}"
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
							children: "  onCreate"
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
							children: "{client.posts.create}"
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
							children: "  onUpdate"
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
							children: "{client.posts.update}"
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
							children: "  onDelete"
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
							children: "{client.posts.delete}"
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
						children: "/>"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "SettingsPage" }), " composes the same way for configuration surfaces — form sections, token-styled chrome, and the standard SettingsPage shell. Patterns inherit everything below them: model-typed columns, server validation mapping, policy-aware actions, and the accessibility baseline."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "accessibility--i18n",
			children: "Accessibility & i18n"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Base UI primitives are the accessibility baseline — focus management and aria wiring live once at the primitive layer" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "All components read labels from the i18n catalog (v1.x) — generated scaffolds are translatable by default" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The compact runtime mode is supported — components avoid runtime-specific APIs, so the same tree renders under either runtime" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "styling-conventions",
			children: "Styling Conventions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Tailwind v4 utility-first styling; tokens as the only cross-package contract" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/styles/" }),
				" holds app-level CSS entries, generated by ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva new" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The build pipeline handles CSS through its own CSS plugin plus the Tailwind v4 fast engine" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-kit-exists-to-extend-studio",
			children: "The Kit Exists to Extend Studio"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Studio generates schema-derived screens from the model IR, and it renders them with this kit. Its purpose is twofold: Studio ships with a coherent default look, and that look is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "extendable" }),
			" — override screens per model or restyle entirely via the token surface. Because the kit and Studio read the same model metadata, a customization that works in one applies to the other. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/generated-ui",
				children: "Studio"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/customization",
				children: "Customization"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "usage-rules",
			children: "Usage Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Applications may use the kit, plain utility-first CSS, or their own system" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The framework requires only the token surface Studio uses" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "No component code leaks into the data layer or server code — components render on the client boundary" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The compact runtime mode is supported: components avoid runtime-specific APIs" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The compact runtime mode is supported — components stay framework-agnostic within the React compat surface" }),
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
				href: "/docs/studio/generated-ui",
				children: "Studio"
			}), " — how the kit renders generated screens"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/customization",
				children: "Studio Customization"
			}), " — overriding screens per model"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/pages",
				children: "Pages"
			}), " — where components and patterns live"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/frontend/navigation",
					children: "Navigation & Link"
				}),
				" — the typed ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Link" }),
				" shipped by the kit"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Data Models"
			}), " — the field DSL components derive from"] }),
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
