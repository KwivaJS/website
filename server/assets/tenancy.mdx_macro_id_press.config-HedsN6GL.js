import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/guides/tenancy.mdx?macro_id=press.config.tsx%23guides
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "How do I configure tenancy?",
	"description": "Turn on tenant scoping with src/config/tenancy.ts — resolution modes, scoped models, and cross-tenant isolation."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nTenancy gives every tenant its own view of the data: requests resolve to a tenant, queries auto-scope to it, and cross-tenant access is indistinguishable from a 404. Turn it on from one config file and the rest stays invisible in application code.\n\n## Prerequisites [#prerequisites]\n\n* A Kwiva project with a tenants model (the scaffolded flow provisions tenant + owner)\n* A `tenantId`-style column available on the models you want to scope\n* `src/config/tenancy.ts` present in the config folder\n\n## Enable tenancy [#enable-tenancy]\n\nConfigure tenancy in `src/config/tenancy.ts`:\n\n```ts title=\"enable-tenancy.ts\"\nimport { defineConfig } from '@kwiva/config'\n\nexport default defineConfig('tenancy', {\n  defaults: {\n    mode: 'domain',\n    tenantField: 'tenantId',\n    models: '*',\n    cache: { scoped: true },\n    storage: { scoped: true },\n  },\n})\n```\n\n* `mode` selects the resolution strategy (next step).\n* `tenantField` is the model column used for scoping.\n* `models: '*'` scopes every model; pass a list like `['projects', 'invoices']` to scope only those.\n* `cache` and `storage` scope per-tenant state with tenant-prefixed keys and paths.\n\n## Choose a resolution strategy [#choose-a-resolution-strategy]\n\n| Mode     | Resolution               | Example                                    |\n| -------- | ------------------------ | ------------------------------------------ |\n| `domain` | Subdomain → tenant       | `acme.app.dev` → tenant `acme`             |\n| `path`   | First path segment       | `/t/acme/...`                              |\n| `header` | `x-tenant-id` header     | API clients, internal tools                |\n| `fixed`  | Single configured tenant | Single-tenant app with the same guarantees |\n| `org`    | Auth org membership      | Org is the tenant                          |\n| `none`   | Disabled                 | Solo apps, zero overhead                   |\n\nThe tenant is resolved once per request by the tenant middleware and exposed as typed `ctx.tenant` (`{ id, name, ownerId }`). Domain mode looks the tenant up by its `slug`.\n\n## Scope the models [#scope-the-models]\n\nWith `models: '*'` every model is already scoped. You can also opt a model in explicitly via `tenantField`:\n\n```ts title=\"scope-the-models.ts\"\nimport { defineModel } from '@kwiva/data'\n\nexport default defineModel('projects', (f) => ({\n  id: f.id(),\n  name: f.string(),\n}), {\n  tenantField: 'tenantId',\n})\n```\n\nOnce opted in, every query — list, get, update, delete — auto-injects `where tenantId = ctx.tenant.id`. Writes stamp `tenantId` from context, and a client-supplied value is stripped by the server. Cross-tenant access attempts return the same result as a missing row, so no existence leaks. Admin scopes can escape via `tenant.asAdmin()`, available inside policies only.\n\n## Isolate per-tenant state [#isolate-per-tenant-state]\n\nBeyond rows, state isolation is automatic across the rest of the stack:\n\n* Cache keys are prefixed `{tenantId}:{key}`.\n* Storage paths are written under `storage/{tenantId}/`.\n* Queue payloads carry `tenantId`, and workers re-hydrate the tenant context before running handlers.\n* Realtime channels are policy-checked per tenant.\n\n## Verify it works [#verify-it-works]\n\nDrive requests as a specific tenant in tests to confirm isolation:\n\n```ts title=\"verify-it-works.ts\"\nwithApp(async (app) => {\n  const acme = app.asTenant('acme')\n  const client = createTestClient(app, { tenant: acme })\n})\n```\n\n1. Create a row as tenant `acme`, then request it as a second tenant and confirm the response is a 404.\n2. Confirm `acme` can still read, update, and delete its own rows.\n3. Check stored cache keys and storage paths carry the `{tenantId}:` prefix.\n\n## Related Documentation [#related-documentation]\n\n* [Tenancy Configuration](/docs/tenancy/configuration) — `mode`, `tenantField`, `models`\n* [Tenant Resolution](/docs/tenancy/resolution) — Domain, path, header strategies\n* [Tenant Scoping](/docs/tenancy/scoping) — Auto-injected query filters\n* [Tenant Isolation](/docs/tenancy/isolation) — Storage, cache, queue isolation\n* [Tenancy](/docs/tenancy) — Tenancy overview\n* [Models](/docs/data/models) — The `defineModel` reference\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Tenancy gives every tenant its own view of the data: requests resolve to a tenant, queries auto-scope to it, and cross-tenant access is indistinguishable from a 404. Turn it on from one config file and the rest stays invisible in application code."
		},
		{
			"heading": "prerequisites",
			"content": "A Kwiva project with a tenants model (the scaffolded flow provisions tenant + owner)"
		},
		{
			"heading": "prerequisites",
			"content": "A `tenantId`-style column available on the models you want to scope"
		},
		{
			"heading": "prerequisites",
			"content": "`src/config/tenancy.ts` present in the config folder"
		},
		{
			"heading": "enable-tenancy",
			"content": "Configure tenancy in `src/config/tenancy.ts`:"
		},
		{
			"heading": "enable-tenancy",
			"content": "`mode` selects the resolution strategy (next step)."
		},
		{
			"heading": "enable-tenancy",
			"content": "`tenantField` is the model column used for scoping."
		},
		{
			"heading": "enable-tenancy",
			"content": "`models: '*'` scopes every model; pass a list like `['projects', 'invoices']` to scope only those."
		},
		{
			"heading": "enable-tenancy",
			"content": "`cache` and `storage` scope per-tenant state with tenant-prefixed keys and paths."
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "Mode"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "Resolution"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "Example"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "`domain`"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "Subdomain → tenant"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "`acme.app.dev` → tenant `acme`"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "`path`"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "First path segment"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "`/t/acme/...`"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "`header`"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "`x-tenant-id` header"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "API clients, internal tools"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "`fixed`"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "Single configured tenant"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "Single-tenant app with the same guarantees"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "`org`"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "Auth org membership"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "Org is the tenant"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "`none`"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "Disabled"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "Solo apps, zero overhead"
		},
		{
			"heading": "choose-a-resolution-strategy",
			"content": "The tenant is resolved once per request by the tenant middleware and exposed as typed `ctx.tenant` (`{ id, name, ownerId }`). Domain mode looks the tenant up by its `slug`."
		},
		{
			"heading": "scope-the-models",
			"content": "With `models: '*'` every model is already scoped. You can also opt a model in explicitly via `tenantField`:"
		},
		{
			"heading": "scope-the-models",
			"content": "Once opted in, every query — list, get, update, delete — auto-injects `where tenantId = ctx.tenant.id`. Writes stamp `tenantId` from context, and a client-supplied value is stripped by the server. Cross-tenant access attempts return the same result as a missing row, so no existence leaks. Admin scopes can escape via `tenant.asAdmin()`, available inside policies only."
		},
		{
			"heading": "isolate-per-tenant-state",
			"content": "Beyond rows, state isolation is automatic across the rest of the stack:"
		},
		{
			"heading": "isolate-per-tenant-state",
			"content": "Cache keys are prefixed `{tenantId}:{key}`."
		},
		{
			"heading": "isolate-per-tenant-state",
			"content": "Storage paths are written under `storage/{tenantId}/`."
		},
		{
			"heading": "isolate-per-tenant-state",
			"content": "Queue payloads carry `tenantId`, and workers re-hydrate the tenant context before running handlers."
		},
		{
			"heading": "isolate-per-tenant-state",
			"content": "Realtime channels are policy-checked per tenant."
		},
		{
			"heading": "verify-it-works",
			"content": "Drive requests as a specific tenant in tests to confirm isolation:"
		},
		{
			"heading": "verify-it-works",
			"content": "Create a row as tenant `acme`, then request it as a second tenant and confirm the response is a 404."
		},
		{
			"heading": "verify-it-works",
			"content": "Confirm `acme` can still read, update, and delete its own rows."
		},
		{
			"heading": "verify-it-works",
			"content": "Check stored cache keys and storage paths carry the `{tenantId}:` prefix."
		},
		{
			"heading": "related-documentation",
			"content": "Tenancy Configuration — `mode`, `tenantField`, `models`"
		},
		{
			"heading": "related-documentation",
			"content": "Tenant Resolution — Domain, path, header strategies"
		},
		{
			"heading": "related-documentation",
			"content": "Tenant Scoping — Auto-injected query filters"
		},
		{
			"heading": "related-documentation",
			"content": "Tenant Isolation — Storage, cache, queue isolation"
		},
		{
			"heading": "related-documentation",
			"content": "Tenancy — Tenancy overview"
		},
		{
			"heading": "related-documentation",
			"content": "Models — The `defineModel` reference"
		}
	],
	"headings": [
		{
			"id": "prerequisites",
			"content": "Prerequisites"
		},
		{
			"id": "enable-tenancy",
			"content": "Enable tenancy"
		},
		{
			"id": "choose-a-resolution-strategy",
			"content": "Choose a resolution strategy"
		},
		{
			"id": "scope-the-models",
			"content": "Scope the models"
		},
		{
			"id": "isolate-per-tenant-state",
			"content": "Isolate per-tenant state"
		},
		{
			"id": "verify-it-works",
			"content": "Verify it works"
		},
		{
			"id": "related-documentation",
			"content": "Related Documentation"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#prerequisites",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Prerequisites" })
	},
	{
		depth: 2,
		url: "#enable-tenancy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Enable tenancy" })
	},
	{
		depth: 2,
		url: "#choose-a-resolution-strategy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Choose a resolution strategy" })
	},
	{
		depth: 2,
		url: "#scope-the-models",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Scope the models" })
	},
	{
		depth: 2,
		url: "#isolate-per-tenant-state",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Isolate per-tenant state" })
	},
	{
		depth: 2,
		url: "#verify-it-works",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Verify it works" })
	},
	{
		depth: 2,
		url: "#related-documentation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Related Documentation" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tenancy gives every tenant its own view of the data: requests resolve to a tenant, queries auto-scope to it, and cross-tenant access is indistinguishable from a 404. Turn it on from one config file and the rest stays invisible in application code." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "prerequisites",
			children: "Prerequisites"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "A Kwiva project with a tenants model (the scaffolded flow provisions tenant + owner)" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
				"-style column available on the models you want to scope"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/tenancy.ts" }), " present in the config folder"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "enable-tenancy",
			children: "Enable tenancy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Configure tenancy in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/tenancy.ts" }),
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
			title: "enable-tenancy.ts",
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
							children: "'tenancy'"
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
							children: "    mode: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'domain'"
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
							children: "    tenantField: "
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
							children: "    models: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'*'"
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
							children: "    cache: { scoped: "
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
							children: " },"
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
							children: "    storage: { scoped: "
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "mode" }), " selects the resolution strategy (next step)."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }), " is the model column used for scoping."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models: '*'" }),
				" scopes every model; pass a list like ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "['projects', 'invoices']" }),
				" to scope only those."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage" }),
				" scope per-tenant state with tenant-prefixed keys and paths."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "choose-a-resolution-strategy",
			children: "Choose a resolution strategy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Resolution" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "domain" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Subdomain → tenant" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "acme.app.dev" }),
					" → tenant ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "acme" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "path" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "First path segment" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/t/acme/..." }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "header" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-tenant-id" }), " header"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API clients, internal tools" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fixed" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Single configured tenant" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Single-tenant app with the same guarantees" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "org" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Auth org membership" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Org is the tenant" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "none" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Disabled" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Solo apps, zero overhead" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The tenant is resolved once per request by the tenant middleware and exposed as typed ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.tenant" }),
			" (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ id, name, ownerId }" }),
			"). Domain mode looks the tenant up by its ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "slug" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "scope-the-models",
			children: "Scope the models"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"With ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models: '*'" }),
			" every model is already scoped. You can also opt a model in explicitly via ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }),
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
			title: "scope-the-models.ts",
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
							children: "'projects'"
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
							children: "  name: f."
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
			"Once opted in, every query — list, get, update, delete — auto-injects ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where tenantId = ctx.tenant.id" }),
			". Writes stamp ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
			" from context, and a client-supplied value is stripped by the server. Cross-tenant access attempts return the same result as a missing row, so no existence leaks. Admin scopes can escape via ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenant.asAdmin()" }),
			", available inside policies only."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "isolate-per-tenant-state",
			children: "Isolate per-tenant state"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Beyond rows, state isolation is automatic across the rest of the stack:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Cache keys are prefixed ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{tenantId}:{key}" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Storage paths are written under ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage/{tenantId}/" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Queue payloads carry ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
				", and workers re-hydrate the tenant context before running handlers."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Realtime channels are policy-checked per tenant." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "verify-it-works",
			children: "Verify it works"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Drive requests as a specific tenant in tests to confirm isolation:" }),
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
			title: "verify-it-works.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "withApp"
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
							children: "async"
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
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "app"
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
							children: "  const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " acme"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " app."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "asTenant"
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
							children: "'acme'"
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
							children: "  const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " client"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " createTestClient"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(app, { tenant: acme })"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Create a row as tenant ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "acme" }),
				", then request it as a second tenant and confirm the response is a 404."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Confirm ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "acme" }),
				" can still read, update, and delete its own rows."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Check stored cache keys and storage paths carry the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{tenantId}:" }),
				" prefix."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "related-documentation",
			children: "Related Documentation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/tenancy/configuration",
					children: "Tenancy Configuration"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "mode" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/resolution",
				children: "Tenant Resolution"
			}), " — Domain, path, header strategies"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/scoping",
				children: "Tenant Scoping"
			}), " — Auto-injected query filters"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Tenant Isolation"
			}), " — Storage, cache, queue isolation"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy",
				children: "Tenancy"
			}), " — Tenancy overview"] }),
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
