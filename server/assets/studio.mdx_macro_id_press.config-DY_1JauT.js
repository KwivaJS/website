import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/api/studio.mdx?macro_id=press.config.tsx%23apiRef
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Studio",
	"description": "@kwiva/studio — the generated operations UI. Schema-derived CRUD screens for every model, policy- and tenant-aware, with no drift from your models."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva Studio is the generated operations UI. Given your models, it produces list, detail, create, and edit screens automatically — every column, filter, form field, and action derives from the model's intermediate representation. Studio is a client of the same generated REST routes and typed client your app uses; there is no separate API to maintain.\n\n## Enable [#enable]\n\nStudio is configured through the app config:\n\n```ts title=\"src/config/app.ts\"\n// src/config/app.ts\nimport { defineConfig } from '@kwiva/config'\n\nexport default defineConfig('app', {\n  defaults: { studio: { enabled: true, route: '/studio', guard: 'admin-role' } },\n})\n```\n\nMounts at `/studio` and requires `role === 'admin'` (or a custom gate).\n\n## Generated Screens [#generated-screens]\n\nPer model:\n\n| Screen | URL                      | Contents                                                                           |\n| ------ | ------------------------ | ---------------------------------------------------------------------------------- |\n| List   | `/studio/posts`          | Typed data table, enum filters, full-text search, pagination, row and bulk actions |\n| Detail | `/studio/posts/:id`      | Field groups, relation previews                                                    |\n| Create | `/studio/posts/new`      | Schema-derived form                                                                |\n| Edit   | `/studio/posts/:id/edit` | Same form, prefilled                                                               |\n\nEverything derives from the model IR: columns (field types → cell renderers), filters (enums and relations), form fields (validation and labels), and actions (policies).\n\n## Customization [#customization]\n\nOverride a model's screens with `defineStudioScreen`:\n\n```tsx title=\"src/app/studio/posts.tsx\"\n// src/app/studio/posts.tsx\nimport { defineStudioScreen } from '@kwiva/studio'\nimport { PostsTable } from '../ui/components/posts-table'\n\nexport default defineStudioScreen('posts', {\n  table: PostsTable,                       // custom data table component\n  fields: { title: { readonly: true } },   // per-field overrides\n  actions: [\n    { label: 'Publish', ability: 'posts.publish', run: (p) => client.posts.publish(p.id) },\n  ],\n  navigation: { group: 'Content', icon: 'document' },\n})\n```\n\n* **Partial overrides** — change one field or action; the rest stays generated.\n* **Fully custom screens** — built with `@kwiva/react` and `@kwiva/ui-kit` patterns.\n* **Navigation** — the tree is auto-generated from models; custom pages add sections.\n\n## Built-In Screens [#built-in-screens]\n\nBeyond per-model CRUD, Studio ships operational screens (several v1.x):\n\n| Screen           | Purpose                                                   |\n| ---------------- | --------------------------------------------------------- |\n| Users & sessions | User management — ban, impersonate, force sign-out (v1.x) |\n| Tenants          | Tenant list, plan, owner (when tenancy is enabled)        |\n| Queue            | Job table — pending/failed/dead-letter, retry (v1.x)      |\n| Schedule         | Task runs and manual trigger (v1.x)                       |\n| Audit            | Change history for `{ audit: true }` models (v1.x)        |\n| Settings         | Model-backed settings tables                              |\n| Addons           | Installed addons — contributions, versions, update (v1.x) |\n\n## Guarantees [#guarantees]\n\n* **Policy enforcement** — every action checks abilities; Studio is not a bypass of authorization.\n* **Tenant scoping** — Studio sees only the resolved tenant; platform staff can operate as admin.\n* **No drift** — screens regenerate from the IR, so model changes flow into Studio without code.\n* **Soft-delete aware** — trashed rows are shown with restore and purge actions.\n\n## Theming [#theming]\n\n`studio: { branding }` config accepts a logo, title, and theme. Studio is fully themeable — it can be branded as your product's back office.\n\nStudio's bundle is a separate route chunk, so it never ships to public pages. It's distinct from `kwiva db:browse`, the dev-time data browser — Studio is the runtime operations UI.\n\n## What to Read Next [#what-to-read-next]\n\n* [Studio Overview](/docs/studio) — What Studio is and how it's generated\n* [Studio Configuration](/docs/studio/configuration) — Enabling, routes, and branding\n* [Generated UI](/docs/studio/generated-ui) — The schema-derived screens\n* [Customization](/docs/studio/customization) — `defineStudioScreen` and custom screens\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva Studio is the generated operations UI. Given your models, it produces list, detail, create, and edit screens automatically — every column, filter, form field, and action derives from the model's intermediate representation. Studio is a client of the same generated REST routes and typed client your app uses; there is no separate API to maintain."
		},
		{
			"heading": "enable",
			"content": "Studio is configured through the app config:"
		},
		{
			"heading": "enable",
			"content": "Mounts at `/studio` and requires `role === 'admin'` (or a custom gate)."
		},
		{
			"heading": "generated-screens",
			"content": "Per model:"
		},
		{
			"heading": "generated-screens",
			"content": "Screen"
		},
		{
			"heading": "generated-screens",
			"content": "URL"
		},
		{
			"heading": "generated-screens",
			"content": "Contents"
		},
		{
			"heading": "generated-screens",
			"content": "List"
		},
		{
			"heading": "generated-screens",
			"content": "`/studio/posts`"
		},
		{
			"heading": "generated-screens",
			"content": "Typed data table, enum filters, full-text search, pagination, row and bulk actions"
		},
		{
			"heading": "generated-screens",
			"content": "Detail"
		},
		{
			"heading": "generated-screens",
			"content": "`/studio/posts/:id`"
		},
		{
			"heading": "generated-screens",
			"content": "Field groups, relation previews"
		},
		{
			"heading": "generated-screens",
			"content": "Create"
		},
		{
			"heading": "generated-screens",
			"content": "`/studio/posts/new`"
		},
		{
			"heading": "generated-screens",
			"content": "Schema-derived form"
		},
		{
			"heading": "generated-screens",
			"content": "Edit"
		},
		{
			"heading": "generated-screens",
			"content": "`/studio/posts/:id/edit`"
		},
		{
			"heading": "generated-screens",
			"content": "Same form, prefilled"
		},
		{
			"heading": "generated-screens",
			"content": "Everything derives from the model IR: columns (field types → cell renderers), filters (enums and relations), form fields (validation and labels), and actions (policies)."
		},
		{
			"heading": "customization",
			"content": "Override a model's screens with `defineStudioScreen`:"
		},
		{
			"heading": "customization",
			"content": "**Partial overrides** — change one field or action; the rest stays generated."
		},
		{
			"heading": "customization",
			"content": "**Fully custom screens** — built with `@kwiva/react` and `@kwiva/ui-kit` patterns."
		},
		{
			"heading": "customization",
			"content": "**Navigation** — the tree is auto-generated from models; custom pages add sections."
		},
		{
			"heading": "built-in-screens",
			"content": "Beyond per-model CRUD, Studio ships operational screens (several v1.x):"
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
			"content": "User management — ban, impersonate, force sign-out (v1.x)"
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
			"heading": "guarantees",
			"content": "**Policy enforcement** — every action checks abilities; Studio is not a bypass of authorization."
		},
		{
			"heading": "guarantees",
			"content": "**Tenant scoping** — Studio sees only the resolved tenant; platform staff can operate as admin."
		},
		{
			"heading": "guarantees",
			"content": "**No drift** — screens regenerate from the IR, so model changes flow into Studio without code."
		},
		{
			"heading": "guarantees",
			"content": "**Soft-delete aware** — trashed rows are shown with restore and purge actions."
		},
		{
			"heading": "theming",
			"content": "`studio: { branding }` config accepts a logo, title, and theme. Studio is fully themeable — it can be branded as your product's back office."
		},
		{
			"heading": "theming",
			"content": "Studio's bundle is a separate route chunk, so it never ships to public pages. It's distinct from `kwiva db:browse`, the dev-time data browser — Studio is the runtime operations UI."
		},
		{
			"heading": "what-to-read-next",
			"content": "Studio Overview — What Studio is and how it's generated"
		},
		{
			"heading": "what-to-read-next",
			"content": "Studio Configuration — Enabling, routes, and branding"
		},
		{
			"heading": "what-to-read-next",
			"content": "Generated UI — The schema-derived screens"
		},
		{
			"heading": "what-to-read-next",
			"content": "Customization — `defineStudioScreen` and custom screens"
		}
	],
	"headings": [
		{
			"id": "enable",
			"content": "Enable"
		},
		{
			"id": "generated-screens",
			"content": "Generated Screens"
		},
		{
			"id": "customization",
			"content": "Customization"
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
			"id": "theming",
			"content": "Theming"
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
		url: "#enable",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Enable" })
	},
	{
		depth: 2,
		url: "#generated-screens",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generated Screens" })
	},
	{
		depth: 2,
		url: "#customization",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Customization" })
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
		url: "#theming",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Theming" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva Studio is the generated operations UI. Given your models, it produces list, detail, create, and edit screens automatically — every column, filter, form field, and action derives from the model's intermediate representation. Studio is a client of the same generated REST routes and typed client your app uses; there is no separate API to maintain." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "enable",
			children: "Enable"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Studio is configured through the app config:" }),
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
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { defineConfig } "
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
							children: " '@kwiva/config'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  defaults: { studio: { enabled: "
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
							children: " } },"
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
			"Mounts at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio" }),
			" and requires ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role === 'admin'" }),
			" (or a custom gate)."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generated-screens",
			children: "Generated Screens"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Per model:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Screen" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "URL" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Contents" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "List" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Typed data table, enum filters, full-text search, pagination, row and bulk actions" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Detail" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Field groups, relation previews" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Create" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts/new" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Schema-derived form" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edit" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio/posts/:id/edit" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Same form, prefilled" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Everything derives from the model IR: columns (field types → cell renderers), filters (enums and relations), form fields (validation and labels), and actions (policies)." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "customization",
			children: "Customization"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Override a model's screens with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }),
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
						children: "// src/app/studio/posts.tsx"
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
						children: "  table: PostsTable,                       "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// custom data table component"
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
							children: " } },   "
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Partial overrides" }), " — change one field or action; the rest stays generated."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Fully custom screens" }),
				" — built with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/ui-kit" }),
				" patterns."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Navigation" }), " — the tree is auto-generated from models; custom pages add sections."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "built-in-screens",
			children: "Built-In Screens"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Beyond per-model CRUD, Studio ships operational screens (several v1.x):" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Screen" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Users & sessions" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "User management — ban, impersonate, force sign-out (v1.x)" })] }),
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "guarantees",
			children: "Guarantees"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Policy enforcement" }), " — every action checks abilities; Studio is not a bypass of authorization."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tenant scoping" }), " — Studio sees only the resolved tenant; platform staff can operate as admin."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No drift" }), " — screens regenerate from the IR, so model changes flow into Studio without code."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Soft-delete aware" }), " — trashed rows are shown with restore and purge actions."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "theming",
			children: "Theming"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "studio: { branding }" }), " config accepts a logo, title, and theme. Studio is fully themeable — it can be branded as your product's back office."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Studio's bundle is a separate route chunk, so it never ships to public pages. It's distinct from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:browse" }),
			", the dev-time data browser — Studio is the runtime operations UI."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-to-read-next",
			children: "What to Read Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio",
				children: "Studio Overview"
			}), " — What Studio is and how it's generated"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/configuration",
				children: "Studio Configuration"
			}), " — Enabling, routes, and branding"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/studio/generated-ui",
				children: "Generated UI"
			}), " — The schema-derived screens"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/studio/customization",
					children: "Customization"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }),
				" and custom screens"
			] }),
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
