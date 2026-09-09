import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/studio/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Studio",
	"description": "Kwiva Studio — the schema-derived operations UI generated from your models, policy-aware and tenant-scoped by default."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva Studio (`@kwiva/studio`) is the generated operations UI for your application. Point it at your models and it produces a complete set of list, filter, create, edit, and delete screens — no drag-and-drop CMS, no hand-built admin boilerplate, and above all no drift. It is the runtime back office: the trustworthy operations surface for user management, moderation, inventory, invoicing, and tenant administration that ships with every app that opts in.\n\nStudio is generated from the same definitions as the rest of your stack. Because it derives its screens from the model IR — the same intermediate representation that produces your database, REST routes, and typed client — the operations UI and your public API can never disagree about a field, a validation rule, or a permission.\n\n## Overview [#overview]\n\nStudio is built on one idea: &#x2A;*screens derive from the model definition.** Every `defineModel` in `src/app/models/` becomes a first-class administrative surface:\n\n* **Columns** are inferred from field types\n* **Filters** are inferred from enums and relations\n* **Form fields** are inferred from field validation and labels\n* **Actions** are derived from your authorization policies\n\nThere is no Studio-side schema. That means when you change a model, Studio changes with it — regeneration is not a step you run, it is the artifact itself. Add a field in development and it appears in the form and the table on the next load; tighten a validation chain and the form enforces it immediately.\n\nStudio is also a client of the same generated REST routes and typed client your application already uses. It has no separate API, which keeps three guarantees simple to reason about:\n\n1. **Policy enforcement** — every action checks abilities through the policy engine; Studio is not a bypass.\n2. **Tenant scoping** — Studio sees only the resolved tenant, so the rule that protects your public routes protects your admin screens identically.\n3. **No drift** — screens regenerate from the model IR, so schema changes flow into Studio without a line of UI code.\n\n## Key Components [#key-components]\n\n| Component                                   | Description                                                           |\n| ------------------------------------------- | --------------------------------------------------------------------- |\n| [Configuration](/docs/studio/configuration) | Enabling Studio, the mount route, the access guard, and branding      |\n| [Generated UI](/docs/studio/generated-ui)   | The list, detail, create, and edit screens derived per model          |\n| [Customization](/docs/studio/customization) | Overriding screens per model with `defineStudioScreen` and the UI kit |\n\n## The Mental Model [#the-mental-model]\n\n```plaintext title=\"the-mental-model.txt\"\nController stays slim                     Studio stays generated\n       │                                        │\ndefineModel ──► model IR ──► REST routes ──► @kwiva/client ──► Studio screens\n       │                                        │\n       └─► migrations, seeders, OpenAPI, MCP    └─► policy checks on every action\n```\n\nStudio is one more consumer of the same derivation pipeline that feeds migrations, OpenAPI, and MCP tooling. There is exactly one source of truth — the model — and every downstream artifact, including the admin UI, is a projection of it.\n\n## What Studio Generates [#what-studio-generates]\n\nFor every model you define, Studio derives four screens under a deterministic URL scheme:\n\n| Screen | URL                      | What it gives you                                        |\n| ------ | ------------------------ | -------------------------------------------------------- |\n| List   | `/studio/posts`          | Table, filters, search, pagination, row and bulk actions |\n| Detail | `/studio/posts/:id`      | Field groups, relation previews, change history          |\n| Create | `/studio/posts/new`      | A schema-derived form                                    |\n| Edit   | `/studio/posts/:id/edit` | The same form, prefilled                                 |\n\nAdd `defineStudioScreen` overrides or build fully custom pages in your app code, and they mount through the same navigation and guards as the generated screens. See [Generated UI](/docs/studio/generated-ui) for the full surface and [Customization](/docs/studio/customization) for the override hooks.\n\n## What Makes It Trustworthy [#what-makes-it-trustworthy]\n\nThe word to notice about Studio is not \"generated\" — it is \"derived.\" Because every screen is a projection of the model, the properties you already trust about your API are properties of the back office by construction:\n\n* **Validation** — the form enforces the exact field chains your routes validate against\n* **Permissions** — the same abilities that gate your routes gate every Studio action\n* **Tenancy** — the resolved tenant constrains list, detail, create, and edit identically\n* **Audit** — audited models record `createdBy` and `updatedBy` from the session, surfaced in the UI\n* **Soft deletes** — trashed rows appear distinctly with restore and purge actions\n\nThere is no mode in which Studio is a bypass. It is a client of the same generated routes and typed client your application uses, so it inherits every runtime guarantee without re-implementing any of them.\n\n## Quick Start [#quick-start]\n\nEnable Studio in your app configuration, then open it from the CLI. The fastest path:\n\n```bash title=\"terminal\"\nkwiva db:studio\n```\n\nBefore that works, turn it on in `src/config/app.ts`:\n\n```ts title=\"src/config/app.ts\"\n// src/config/app.ts\nexport default defineConfig('app', {\n  defaults: {\n    studio: { enabled: true, route: '/studio', guard: 'admin-role' },\n  },\n})\n```\n\nStudio now mounts at `/studio`, requires the configured gate (an admin role by default), and renders an operations screen for every model you have defined. Each model gets four screens automatically — list, detail, create, and edit — served under deterministic URLs like `/studio/posts`, `/studio/posts/:id`, `/studio/posts/new`, and `/studio/posts/:id/edit`.\n\n## When to Use Studio [#when-to-use-studio]\n\nReach for Studio whenever you need a trustworthy back office: user management, moderation queues, inventory, invoicing, tenant administration. It ships with the same guarantees as your API — policy checks, tenant scoping, audit trails on audited models — so it is the safe default for internal operations before you invest in custom admin screens.\n\nStudio's operating envelope:\n\n* **Every model by default** — any `defineModel` becomes an operations surface without additional code.\n* **Policy-aware** — screens show and hide actions according to the abilities of whoever is logged in.\n* **Tenant-scoped** — users see only their tenant's rows; platform staff can operate across tenants through the `asAdmin` escape hatch.\n* **Soft-delete aware** — trashed rows are shown with restore and purge actions.\n* **Obvious to operate** — the generated navigation groups models, and custom pages can extend it.\n\n## Studio vs Other Surfaces [#studio-vs-other-surfaces]\n\nStudio is the runtime operations UI, but it is not the only window into your data. It is distinct from the dev-time data browser (`kwiva db:browse`), which is a read-mostly inspection tool for development. It also differs from the generated REST API and MCP tools: those are machine surfaces, while Studio is the human surface for the same models. All four derive from the same IR, so the answers they give never disagree.\n\n| Surface           | Audience            | Primary use                       | Mutates?            |\n| ----------------- | ------------------- | --------------------------------- | ------------------- |\n| Studio            | Operators and staff | Full CRUD back office             | Yes, policy-checked |\n| `kwiva db:browse` | Developers          | Dev-time data inspection          | Read-mostly         |\n| REST / RPC API    | Application code    | Machine access to the same models | Yes, policy-checked |\n| MCP tools         | AI agents           | Programmatic agent access         | Config-throttled    |\n\nThe distinction is audience and environment, not schema. One `defineModel` feeds all four, so the canonical shape of a record is never maintained in four places.\n\n## The Studio Development Loop [#the-studio-development-loop]\n\nStudio fits into the normal dev workflow without added ritual:\n\n1. **Enable it** — add the `studio` config block to `src/config/app.ts`.\n2. **Open it** — `kwiva db:studio` (or visit the configured route, `/studio` by default).\n3. **Iterate on models** — add or change fields in `src/app/models/` and the screens update on the next load; no Studio code changes.\n4. **Override when needed** — swap in a `defineStudioScreen` file or a custom page only where the generated surface does not cover the workflow.\n5. **Ship it** — Studio rides the same process and route as every other HTTP surface, and its bundle is separate from the public app, so operations UI never leaks into customer pages.\n\nBecause the loop is driven by model changes, Studio shows up in the same diffs your data layer shows up in — there is no separate admin module to version, keyboard-away from the product.\n\n## What's Next [#whats-next]\n\n* [Generated UI](/docs/studio/generated-ui) — what Studio produces for each model\n* [Configuration](/docs/studio/configuration) — mounting, guarding, and auditing Studio\n* [Customization](/docs/studio/customization) — swap in custom screens per model\n* [Models](/docs/data/models) — the definitions that drive every Studio screen\n* [Policies](/docs/authorization/policies) — how abilities gate Studio actions\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva Studio (`@kwiva/studio`) is the generated operations UI for your application. Point it at your models and it produces a complete set of list, filter, create, edit, and delete screens — no drag-and-drop CMS, no hand-built admin boilerplate, and above all no drift. It is the runtime back office: the trustworthy operations surface for user management, moderation, inventory, invoicing, and tenant administration that ships with every app that opts in."
		},
		{
			"heading": void 0,
			"content": "Studio is generated from the same definitions as the rest of your stack. Because it derives its screens from the model IR — the same intermediate representation that produces your database, REST routes, and typed client — the operations UI and your public API can never disagree about a field, a validation rule, or a permission."
		},
		{
			"heading": "overview",
			"content": "Studio is built on one idea: &#x2A;*screens derive from the model definition.** Every `defineModel` in `src/app/models/` becomes a first-class administrative surface:"
		},
		{
			"heading": "overview",
			"content": "**Columns** are inferred from field types"
		},
		{
			"heading": "overview",
			"content": "**Filters** are inferred from enums and relations"
		},
		{
			"heading": "overview",
			"content": "**Form fields** are inferred from field validation and labels"
		},
		{
			"heading": "overview",
			"content": "**Actions** are derived from your authorization policies"
		},
		{
			"heading": "overview",
			"content": "There is no Studio-side schema. That means when you change a model, Studio changes with it — regeneration is not a step you run, it is the artifact itself. Add a field in development and it appears in the form and the table on the next load; tighten a validation chain and the form enforces it immediately."
		},
		{
			"heading": "overview",
			"content": "Studio is also a client of the same generated REST routes and typed client your application already uses. It has no separate API, which keeps three guarantees simple to reason about:"
		},
		{
			"heading": "overview",
			"content": "**Policy enforcement** — every action checks abilities through the policy engine; Studio is not a bypass."
		},
		{
			"heading": "overview",
			"content": "**Tenant scoping** — Studio sees only the resolved tenant, so the rule that protects your public routes protects your admin screens identically."
		},
		{
			"heading": "overview",
			"content": "**No drift** — screens regenerate from the model IR, so schema changes flow into Studio without a line of UI code."
		},
		{
			"heading": "key-components",
			"content": "Component"
		},
		{
			"heading": "key-components",
			"content": "Description"
		},
		{
			"heading": "key-components",
			"content": "Configuration"
		},
		{
			"heading": "key-components",
			"content": "Enabling Studio, the mount route, the access guard, and branding"
		},
		{
			"heading": "key-components",
			"content": "Generated UI"
		},
		{
			"heading": "key-components",
			"content": "The list, detail, create, and edit screens derived per model"
		},
		{
			"heading": "key-components",
			"content": "Customization"
		},
		{
			"heading": "key-components",
			"content": "Overriding screens per model with `defineStudioScreen` and the UI kit"
		},
		{
			"heading": "the-mental-model",
			"content": "Studio is one more consumer of the same derivation pipeline that feeds migrations, OpenAPI, and MCP tooling. There is exactly one source of truth — the model — and every downstream artifact, including the admin UI, is a projection of it."
		},
		{
			"heading": "what-studio-generates",
			"content": "For every model you define, Studio derives four screens under a deterministic URL scheme:"
		},
		{
			"heading": "what-studio-generates",
			"content": "Screen"
		},
		{
			"heading": "what-studio-generates",
			"content": "URL"
		},
		{
			"heading": "what-studio-generates",
			"content": "What it gives you"
		},
		{
			"heading": "what-studio-generates",
			"content": "List"
		},
		{
			"heading": "what-studio-generates",
			"content": "`/studio/posts`"
		},
		{
			"heading": "what-studio-generates",
			"content": "Table, filters, search, pagination, row and bulk actions"
		},
		{
			"heading": "what-studio-generates",
			"content": "Detail"
		},
		{
			"heading": "what-studio-generates",
			"content": "`/studio/posts/:id`"
		},
		{
			"heading": "what-studio-generates",
			"content": "Field groups, relation previews, change history"
		},
		{
			"heading": "what-studio-generates",
			"content": "Create"
		},
		{
			"heading": "what-studio-generates",
			"content": "`/studio/posts/new`"
		},
		{
			"heading": "what-studio-generates",
			"content": "A schema-derived form"
		},
		{
			"heading": "what-studio-generates",
			"content": "Edit"
		},
		{
			"heading": "what-studio-generates",
			"content": "`/studio/posts/:id/edit`"
		},
		{
			"heading": "what-studio-generates",
			"content": "The same form, prefilled"
		},
		{
			"heading": "what-studio-generates",
			"content": "Add `defineStudioScreen` overrides or build fully custom pages in your app code, and they mount through the same navigation and guards as the generated screens. See Generated UI for the full surface and Customization for the override hooks."
		},
		{
			"heading": "what-makes-it-trustworthy",
			"content": "The word to notice about Studio is not \"generated\" — it is \"derived.\" Because every screen is a projection of the model, the properties you already trust about your API are properties of the back office by construction:"
		},
		{
			"heading": "what-makes-it-trustworthy",
			"content": "**Validation** — the form enforces the exact field chains your routes validate against"
		},
		{
			"heading": "what-makes-it-trustworthy",
			"content": "**Permissions** — the same abilities that gate your routes gate every Studio action"
		},
		{
			"heading": "what-makes-it-trustworthy",
			"content": "**Tenancy** — the resolved tenant constrains list, detail, create, and edit identically"
		},
		{
			"heading": "what-makes-it-trustworthy",
			"content": "**Audit** — audited models record `createdBy` and `updatedBy` from the session, surfaced in the UI"
		},
		{
			"heading": "what-makes-it-trustworthy",
			"content": "**Soft deletes** — trashed rows appear distinctly with restore and purge actions"
		},
		{
			"heading": "what-makes-it-trustworthy",
			"content": "There is no mode in which Studio is a bypass. It is a client of the same generated routes and typed client your application uses, so it inherits every runtime guarantee without re-implementing any of them."
		},
		{
			"heading": "quick-start",
			"content": "Enable Studio in your app configuration, then open it from the CLI. The fastest path:"
		},
		{
			"heading": "quick-start",
			"content": "Before that works, turn it on in `src/config/app.ts`:"
		},
		{
			"heading": "quick-start",
			"content": "Studio now mounts at `/studio`, requires the configured gate (an admin role by default), and renders an operations screen for every model you have defined. Each model gets four screens automatically — list, detail, create, and edit — served under deterministic URLs like `/studio/posts`, `/studio/posts/:id`, `/studio/posts/new`, and `/studio/posts/:id/edit`."
		},
		{
			"heading": "when-to-use-studio",
			"content": "Reach for Studio whenever you need a trustworthy back office: user management, moderation queues, inventory, invoicing, tenant administration. It ships with the same guarantees as your API — policy checks, tenant scoping, audit trails on audited models — so it is the safe default for internal operations before you invest in custom admin screens."
		},
		{
			"heading": "when-to-use-studio",
			"content": "Studio's operating envelope:"
		},
		{
			"heading": "when-to-use-studio",
			"content": "**Every model by default** — any `defineModel` becomes an operations surface without additional code."
		},
		{
			"heading": "when-to-use-studio",
			"content": "**Policy-aware** — screens show and hide actions according to the abilities of whoever is logged in."
		},
		{
			"heading": "when-to-use-studio",
			"content": "**Tenant-scoped** — users see only their tenant's rows; platform staff can operate across tenants through the `asAdmin` escape hatch."
		},
		{
			"heading": "when-to-use-studio",
			"content": "**Soft-delete aware** — trashed rows are shown with restore and purge actions."
		},
		{
			"heading": "when-to-use-studio",
			"content": "**Obvious to operate** — the generated navigation groups models, and custom pages can extend it."
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Studio is the runtime operations UI, but it is not the only window into your data. It is distinct from the dev-time data browser (`kwiva db:browse`), which is a read-mostly inspection tool for development. It also differs from the generated REST API and MCP tools: those are machine surfaces, while Studio is the human surface for the same models. All four derive from the same IR, so the answers they give never disagree."
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Surface"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Audience"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Primary use"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Mutates?"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Studio"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Operators and staff"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Full CRUD back office"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Yes, policy-checked"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "`kwiva db:browse`"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Developers"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Dev-time data inspection"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Read-mostly"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "REST / RPC API"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Application code"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Machine access to the same models"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Yes, policy-checked"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "MCP tools"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "AI agents"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Programmatic agent access"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "Config-throttled"
		},
		{
			"heading": "studio-vs-other-surfaces",
			"content": "The distinction is audience and environment, not schema. One `defineModel` feeds all four, so the canonical shape of a record is never maintained in four places."
		},
		{
			"heading": "the-studio-development-loop",
			"content": "Studio fits into the normal dev workflow without added ritual:"
		},
		{
			"heading": "the-studio-development-loop",
			"content": "**Enable it** — add the `studio` config block to `src/config/app.ts`."
		},
		{
			"heading": "the-studio-development-loop",
			"content": "**Open it** — `kwiva db:studio` (or visit the configured route, `/studio` by default)."
		},
		{
			"heading": "the-studio-development-loop",
			"content": "**Iterate on models** — add or change fields in `src/app/models/` and the screens update on the next load; no Studio code changes."
		},
		{
			"heading": "the-studio-development-loop",
			"content": "**Override when needed** — swap in a `defineStudioScreen` file or a custom page only where the generated surface does not cover the workflow."
		},
		{
			"heading": "the-studio-development-loop",
			"content": "**Ship it** — Studio rides the same process and route as every other HTTP surface, and its bundle is separate from the public app, so operations UI never leaks into customer pages."
		},
		{
			"heading": "the-studio-development-loop",
			"content": "Because the loop is driven by model changes, Studio shows up in the same diffs your data layer shows up in — there is no separate admin module to version, keyboard-away from the product."
		},
		{
			"heading": "whats-next",
			"content": "Generated UI — what Studio produces for each model"
		},
		{
			"heading": "whats-next",
			"content": "Configuration — mounting, guarding, and auditing Studio"
		},
		{
			"heading": "whats-next",
			"content": "Customization — swap in custom screens per model"
		},
		{
			"heading": "whats-next",
			"content": "Models — the definitions that drive every Studio screen"
		},
		{
			"heading": "whats-next",
			"content": "Policies — how abilities gate Studio actions"
		}
	],
	"headings": [
		{
			"id": "overview",
			"content": "Overview"
		},
		{
			"id": "key-components",
			"content": "Key Components"
		},
		{
			"id": "the-mental-model",
			"content": "The Mental Model"
		},
		{
			"id": "what-studio-generates",
			"content": "What Studio Generates"
		},
		{
			"id": "what-makes-it-trustworthy",
			"content": "What Makes It Trustworthy"
		},
		{
			"id": "quick-start",
			"content": "Quick Start"
		},
		{
			"id": "when-to-use-studio",
			"content": "When to Use Studio"
		},
		{
			"id": "studio-vs-other-surfaces",
			"content": "Studio vs Other Surfaces"
		},
		{
			"id": "the-studio-development-loop",
			"content": "The Studio Development Loop"
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
		url: "#overview",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Overview" })
	},
	{
		depth: 2,
		url: "#key-components",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Key Components" })
	},
	{
		depth: 2,
		url: "#the-mental-model",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Mental Model" })
	},
	{
		depth: 2,
		url: "#what-studio-generates",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Studio Generates" })
	},
	{
		depth: 2,
		url: "#what-makes-it-trustworthy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Makes It Trustworthy" })
	},
	{
		depth: 2,
		url: "#quick-start",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Quick Start" })
	},
	{
		depth: 2,
		url: "#when-to-use-studio",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When to Use Studio" })
	},
	{
		depth: 2,
		url: "#studio-vs-other-surfaces",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Studio vs Other Surfaces" })
	},
	{
		depth: 2,
		url: "#the-studio-development-loop",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Studio Development Loop" })
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva Studio (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/studio" }),
			") is the generated operations UI for your application. Point it at your models and it produces a complete set of list, filter, create, edit, and delete screens — no drag-and-drop CMS, no hand-built admin boilerplate, and above all no drift. It is the runtime back office: the trustworthy operations surface for user management, moderation, inventory, invoicing, and tenant administration that ships with every app that opts in."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio is generated from the same definitions as the rest of your stack. Because it derives its screens from the model IR — the same intermediate representation that produces your database, REST routes, and typed client — the operations UI and your public API can never disagree about a field, a validation rule, or a permission." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "overview",
			children: "Overview"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Studio is built on one idea: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "screens derive from the model definition." }),
			" Every ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/" }),
			" becomes a first-class administrative surface:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Columns" }), " are inferred from field types"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Filters" }), " are inferred from enums and relations"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Form fields" }), " are inferred from field validation and labels"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Actions" }), " are derived from your authorization policies"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "There is no Studio-side schema. That means when you change a model, Studio changes with it — regeneration is not a step you run, it is the artifact itself. Add a field in development and it appears in the form and the table on the next load; tighten a validation chain and the form enforces it immediately." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio is also a client of the same generated REST routes and typed client your application already uses. It has no separate API, which keeps three guarantees simple to reason about:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Policy enforcement" }), " — every action checks abilities through the policy engine; Studio is not a bypass."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tenant scoping" }), " — Studio sees only the resolved tenant, so the rule that protects your public routes protects your admin screens identically."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No drift" }), " — screens regenerate from the model IR, so schema changes flow into Studio without a line of UI code."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "key-components",
			children: "Key Components"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Component" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Description" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/configuration",
				children: "Configuration"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Enabling Studio, the mount route, the access guard, and branding" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/generated-ui",
				children: "Generated UI"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The list, detail, create, and edit screens derived per model" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/customization",
				children: "Customization"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Overriding screens per model with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }),
				" and the UI kit"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-mental-model",
			children: "The Mental Model"
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
			title: "the-mental-model.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Controller stays slim                     Studio stays generated" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       │                                        │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineModel ──► model IR ──► REST routes ──► @kwiva/client ──► Studio screens" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       │                                        │" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       └─► migrations, seeders, OpenAPI, MCP    └─► policy checks on every action" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio is one more consumer of the same derivation pipeline that feeds migrations, OpenAPI, and MCP tooling. There is exactly one source of truth — the model — and every downstream artifact, including the admin UI, is a projection of it." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-studio-generates",
			children: "What Studio Generates"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "For every model you define, Studio derives four screens under a deterministic URL scheme:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Screen" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "URL" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it gives you" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "List" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Table, filters, search, pagination, row and bulk actions" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Detail" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Field groups, relation previews, change history" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Create" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts/new" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A schema-derived form" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edit" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts/:id/edit" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The same form, prefilled" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Add ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }),
			" overrides or build fully custom pages in your app code, and they mount through the same navigation and guards as the generated screens. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/generated-ui",
				children: "Generated UI"
			}),
			" for the full surface and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/customization",
				children: "Customization"
			}),
			" for the override hooks."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-makes-it-trustworthy",
			children: "What Makes It Trustworthy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The word to notice about Studio is not \"generated\" — it is \"derived.\" Because every screen is a projection of the model, the properties you already trust about your API are properties of the back office by construction:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Validation" }), " — the form enforces the exact field chains your routes validate against"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Permissions" }), " — the same abilities that gate your routes gate every Studio action"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tenancy" }), " — the resolved tenant constrains list, detail, create, and edit identically"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Audit" }),
				" — audited models record ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createdBy" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "updatedBy" }),
				" from the session, surfaced in the UI"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Soft deletes" }), " — trashed rows appear distinctly with restore and purge actions"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "There is no mode in which Studio is a bypass. It is a client of the same generated routes and typed client your application uses, so it inherits every runtime guarantee without re-implementing any of them." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "quick-start",
			children: "Quick Start"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Enable Studio in your app configuration, then open it from the CLI. The fastest path:" }),
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
			"Before that works, turn it on in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts" }),
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
			title: "src/config/app.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/app.ts"
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
							children: "'app'"
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
							children: "    studio: { enabled: "
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
							children: ", route: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'/studio'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", guard: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'admin-role'"
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
			"Studio now mounts at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio" }),
			", requires the configured gate (an admin role by default), and renders an operations screen for every model you have defined. Each model gets four screens automatically — list, detail, create, and edit — served under deterministic URLs like ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts/:id" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts/new" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts/:id/edit" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-to-use-studio",
			children: "When to Use Studio"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Reach for Studio whenever you need a trustworthy back office: user management, moderation queues, inventory, invoicing, tenant administration. It ships with the same guarantees as your API — policy checks, tenant scoping, audit trails on audited models — so it is the safe default for internal operations before you invest in custom admin screens." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio's operating envelope:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Every model by default" }),
				" — any ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				" becomes an operations surface without additional code."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Policy-aware" }), " — screens show and hide actions according to the abilities of whoever is logged in."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tenant-scoped" }),
				" — users see only their tenant's rows; platform staff can operate across tenants through the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "asAdmin" }),
				" escape hatch."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Soft-delete aware" }), " — trashed rows are shown with restore and purge actions."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Obvious to operate" }), " — the generated navigation groups models, and custom pages can extend it."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "studio-vs-other-surfaces",
			children: "Studio vs Other Surfaces"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Studio is the runtime operations UI, but it is not the only window into your data. It is distinct from the dev-time data browser (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:browse" }),
			"), which is a read-mostly inspection tool for development. It also differs from the generated REST API and MCP tools: those are machine surfaces, while Studio is the human surface for the same models. All four derive from the same IR, so the answers they give never disagree."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Audience" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Primary use" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mutates?" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Studio" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Operators and staff" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Full CRUD back office" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Yes, policy-checked" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:browse" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Developers" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dev-time data inspection" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Read-mostly" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "REST / RPC API" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Application code" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Machine access to the same models" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Yes, policy-checked" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP tools" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "AI agents" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Programmatic agent access" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Config-throttled" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The distinction is audience and environment, not schema. One ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" feeds all four, so the canonical shape of a record is never maintained in four places."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-studio-development-loop",
			children: "The Studio Development Loop"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio fits into the normal dev workflow without added ritual:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Enable it" }),
				" — add the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "studio" }),
				" config block to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Open it" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:studio" }),
				" (or visit the configured route, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio" }),
				" by default)."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Iterate on models" }),
				" — add or change fields in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/" }),
				" and the screens update on the next load; no Studio code changes."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Override when needed" }),
				" — swap in a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }),
				" file or a custom page only where the generated surface does not cover the workflow."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Ship it" }), " — Studio rides the same process and route as every other HTTP surface, and its bundle is separate from the public app, so operations UI never leaks into customer pages."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the loop is driven by model changes, Studio shows up in the same diffs your data layer shows up in — there is no separate admin module to version, keyboard-away from the product." }),
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
			}), " — what Studio produces for each model"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/configuration",
				children: "Configuration"
			}), " — mounting, guarding, and auditing Studio"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/customization",
				children: "Customization"
			}), " — swap in custom screens per model"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}), " — the definitions that drive every Studio screen"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/policies",
				children: "Policies"
			}), " — how abilities gate Studio actions"] }),
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
