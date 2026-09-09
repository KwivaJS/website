import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/tenancy/configuration.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Tenancy Configuration",
	"description": "Configure tenancy in src/config/tenancy.ts — resolution strategy, tenantField, scoped models, and per-tenant config overrides."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nTenancy is configured from a single module in the config folder. Everything that governs resolution, scoping, and isolation lives in `src/config/tenancy.ts`, following the framework rule that configuration lives in one place — with inline `defineX` options winning when a specific construct needs to differ.\n\nThe module exists because tenancy is a correctness boundary. A misconfigured resolution mode in production is a data-exposure bug, not a cosmetic one, so the framework type-checks the module, validates environment overrides at boot, and gives every value a single typed read path.\n\n## The Config Module [#the-config-module]\n\n```ts title=\"src/config/tenancy.ts\"\n// src/config/tenancy.ts\nexport default defineConfig('tenancy', {\n  defaults: {\n    mode: 'domain',            // 'domain' | 'path' | 'header' | 'fixed' | 'org' (v1.x) | 'none'\n    tenantField: 'tenantId',   // model column used for scoping\n    models: '*',               // or ['projects', 'invoices'] — scoped models only\n    cache: { scoped: true },   // tenant-prefixed cache keys\n    storage: { scoped: true }, // tenant-prefixed paths\n  },\n})\n```\n\nThe module is a typed config module like any other: defaults are type-checked, environment overrides can be mapped through the `env` block, and reading the value anywhere goes through `config('tenancy.mode')`.\n\n## Choosing a Resolution Strategy [#choosing-a-resolution-strategy]\n\nThe `mode` key selects how the tenant is identified on each request:\n\n| Mode     | Resolution                          | Example                                    |\n| -------- | ----------------------------------- | ------------------------------------------ |\n| `domain` | subdomain to Tenant lookup          | `acme.app.dev` resolves to tenant `acme`   |\n| `path`   | first path segment                  | `/t/acme/...` resolves to tenant `acme`    |\n| `header` | `x-tenant-id` request header        | internal tools and API clients             |\n| `fixed`  | a single configured tenant          | single-tenant app with the same guarantees |\n| `org`    | authenticated org membership (v1.x) | orgs mapped to tenants via the auth layer  |\n| `none`   | disabled                            | solo app — scoping off, zero overhead      |\n\nDomain mode is the default and the right choice for most product-style multi-tenant apps: each customer owns a subdomain and is isolated by it. Path mode suits workspaces reached through a shared host. Header mode fits machine-to-machine traffic where no domain or path structure exists. Fixed mode gives a single-tenant deployment the identical isolation guarantees without resolution work, and `none` is for apps that want none of it.\n\n### Choosing by traffic shape [#choosing-by-traffic-shape]\n\n| Traffic shape                                  | Recommended mode |\n| ---------------------------------------------- | ---------------- |\n| Product customers on subdomains                | `domain`         |\n| Workspaces behind a shared host                | `path`           |\n| Internal tools and API clients                 | `header`         |\n| Single-tenant deployment of a multi-tenant app | `fixed`          |\n| Auth orgs map to tenants                       | `org` (v1.x)     |\n| Solo app, no tenants                           | `none`           |\n\nThe choice is about where tenant identity lives in the request, and every mode except `none` produces the same `ctx.tenant` downstream — the resolution strategy never changes what scoping, storage, or cache do afterward.\n\n## Configuring the Tenant Field [#configuring-the-tenant-field]\n\nThe `tenantField` option names the model column used for scoping. The default is `tenantId`.\n\nThere are two places the field can be set:\n\n1. **Globally** in `src/config/tenancy.ts`, which applies the field to every scoped model\n2. **Per model** on the `defineModel` options, which overrides the global default for that model\n\n```ts title=\"configuring-the-tenant-field.ts\"\ndefineModel('projects', (f) => ({ ... }), { tenantField: 'tenantId' })\n```\n\nBoth are legitimate, and per-model wins. The rule of thumb: set it globally once, then tune per model only where the naming differs.\n\n### The convention: `tenantId` [#the-convention-tenantid]\n\nThe default column name is `tenantId`, and it pays to keep it. The query engine injects `where tenantId = ctx.tenant.id` into every scoped operation, the migration generates the column, and the tenant context carries the `id` that matches it. Using the default keeps the mapping from the tenant context to the scoping predicate a zero-config correspondence.\n\n## Choosing Which Models Are Scoped [#choosing-which-models-are-scoped]\n\nThe `models` option narrows scoping to a specific set:\n\n```ts title=\"choosing-which-models-are-scoped.ts\"\ndefaults: {\n  models: ['projects', 'invoices'], // only these get tenant predicates\n}\n```\n\nThe default is `models: '*'`, meaning every model participates. Scope this down when you have cross-tenant reference data — for example a lookup table of countries or tax codes — that should be readable by every tenant. Keep in mind the trade-off: unscoped models are shared by construction, so their rows must be safe to expose across tenants.\n\n> \\[!WARNING]\n> Every model that gets a tenant predicate also gets the isolation guarantee — and every model excluded from the list is shared by construction. Decide the `models` list consciously: global reference data belongs out of the list, tenant-owned business data belongs in it.\n\n## Cache and Storage Scoping [#cache-and-storage-scoping]\n\nThe `cache` and `storage` blocks control derived-state isolation:\n\n```ts title=\"cache-and-storage-scoping.ts\"\ndefaults: {\n  cache: { scoped: true },   // keys become {tenantId}:{key}\n  storage: { scoped: true }, // paths become storage/{tenantId}/...\n}\n```\n\nBoth default to scoped. Leave them true for tenant isolation guarantees; set `scoped: false` only for assets and caches you intend to share globally, such as a public logo bucket. Isolating state is what makes multi-instance deployments correct — see [Isolation](/docs/tenancy/isolation).\n\n### What each flag covers [#what-each-flag-covers]\n\n| Flag                        | Effect when true                     | Effect when false     |\n| --------------------------- | ------------------------------------ | --------------------- |\n| `cache: { scoped: true }`   | Keys prefixed with the tenant id     | Keys shared globally  |\n| `storage: { scoped: true }` | Paths under `storage/{tenantId}/...` | Paths shared globally |\n\nThe rule of thumb: tenant-owned derived state is scoped, and only explicitly public assets — brand media, product-wide computed values — are shared. The flags make the distinction explicit at one glance rather than scattering it through call sites.\n\n## Per-Tenant Config Overrides [#per-tenant-config-overrides]\n\nWhere a deployment needs tenant-specific behavior — different rate limits, different storage quotas, different feature flags — tenancy supports tenant-aware config overrides (v1.x). The override layer resolves per request against the configured tenant and merges over the defaults for that tenant's scope.\n\nThe mechanism follows the config precedence rule: global defaults first, tenant overrides applied for the resolved tenant, and anything more specific on a construct beating both. This keeps tenancy configuration in the config folder rather than scattered through application code.\n\n## Env and Runtime Overrides [#env-and-runtime-overrides]\n\nLike every config module, `tenancy` can map environment variables through its `env` block:\n\n```ts title=\"env-and-runtime-overrides.ts\"\nexport default defineConfig('tenancy', {\n  defaults: { mode: 'domain' },\n  env: { mode: 'TENANCY_MODE' },\n})\n```\n\nTyped env access applies here as it does everywhere: `env('TENANCY_MODE')` validates at boot, and using an undeclared variable fails fast at compile time and boot time. That matters for tenancy because a misconfigured resolution mode in production is a correctness bug, not a cosmetic one.\n\n## What's Next [#whats-next]\n\n* [Resolution](/docs/tenancy/resolution) — how each strategy resolves the tenant per request\n* [Scoping](/docs/tenancy/scoping) — how `tenantField` scopes every query\n* [Isolation](/docs/tenancy/isolation) — storage, cache, queue, and audit separation\n* [Configuration](/docs/core-concepts/configuration) — the config folder and precedence rules\n* [Models](/docs/data/models) — the `tenantField` and `permission` model options\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Tenancy is configured from a single module in the config folder. Everything that governs resolution, scoping, and isolation lives in `src/config/tenancy.ts`, following the framework rule that configuration lives in one place — with inline `defineX` options winning when a specific construct needs to differ."
		},
		{
			"heading": void 0,
			"content": "The module exists because tenancy is a correctness boundary. A misconfigured resolution mode in production is a data-exposure bug, not a cosmetic one, so the framework type-checks the module, validates environment overrides at boot, and gives every value a single typed read path."
		},
		{
			"heading": "the-config-module",
			"content": "The module is a typed config module like any other: defaults are type-checked, environment overrides can be mapped through the `env` block, and reading the value anywhere goes through `config('tenancy.mode')`."
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "The `mode` key selects how the tenant is identified on each request:"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "Mode"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "Resolution"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "Example"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "`domain`"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "subdomain to Tenant lookup"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "`acme.app.dev` resolves to tenant `acme`"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "`path`"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "first path segment"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "`/t/acme/...` resolves to tenant `acme`"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "`header`"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "`x-tenant-id` request header"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "internal tools and API clients"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "`fixed`"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "a single configured tenant"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "single-tenant app with the same guarantees"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "`org`"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "authenticated org membership (v1.x)"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "orgs mapped to tenants via the auth layer"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "`none`"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "disabled"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "solo app — scoping off, zero overhead"
		},
		{
			"heading": "choosing-a-resolution-strategy",
			"content": "Domain mode is the default and the right choice for most product-style multi-tenant apps: each customer owns a subdomain and is isolated by it. Path mode suits workspaces reached through a shared host. Header mode fits machine-to-machine traffic where no domain or path structure exists. Fixed mode gives a single-tenant deployment the identical isolation guarantees without resolution work, and `none` is for apps that want none of it."
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "Traffic shape"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "Recommended mode"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "Product customers on subdomains"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "`domain`"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "Workspaces behind a shared host"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "`path`"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "Internal tools and API clients"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "`header`"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "Single-tenant deployment of a multi-tenant app"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "`fixed`"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "Auth orgs map to tenants"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "`org` (v1.x)"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "Solo app, no tenants"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "`none`"
		},
		{
			"heading": "choosing-by-traffic-shape",
			"content": "The choice is about where tenant identity lives in the request, and every mode except `none` produces the same `ctx.tenant` downstream — the resolution strategy never changes what scoping, storage, or cache do afterward."
		},
		{
			"heading": "configuring-the-tenant-field",
			"content": "The `tenantField` option names the model column used for scoping. The default is `tenantId`."
		},
		{
			"heading": "configuring-the-tenant-field",
			"content": "There are two places the field can be set:"
		},
		{
			"heading": "configuring-the-tenant-field",
			"content": "**Globally** in `src/config/tenancy.ts`, which applies the field to every scoped model"
		},
		{
			"heading": "configuring-the-tenant-field",
			"content": "**Per model** on the `defineModel` options, which overrides the global default for that model"
		},
		{
			"heading": "configuring-the-tenant-field",
			"content": "Both are legitimate, and per-model wins. The rule of thumb: set it globally once, then tune per model only where the naming differs."
		},
		{
			"heading": "the-convention-tenantid",
			"content": "The default column name is `tenantId`, and it pays to keep it. The query engine injects `where tenantId = ctx.tenant.id` into every scoped operation, the migration generates the column, and the tenant context carries the `id` that matches it. Using the default keeps the mapping from the tenant context to the scoping predicate a zero-config correspondence."
		},
		{
			"heading": "choosing-which-models-are-scoped",
			"content": "The `models` option narrows scoping to a specific set:"
		},
		{
			"heading": "choosing-which-models-are-scoped",
			"content": "The default is `models: '*'`, meaning every model participates. Scope this down when you have cross-tenant reference data — for example a lookup table of countries or tax codes — that should be readable by every tenant. Keep in mind the trade-off: unscoped models are shared by construction, so their rows must be safe to expose across tenants."
		},
		{
			"heading": "choosing-which-models-are-scoped",
			"content": "> \\[!WARNING]\n> Every model that gets a tenant predicate also gets the isolation guarantee — and every model excluded from the list is shared by construction. Decide the `models` list consciously: global reference data belongs out of the list, tenant-owned business data belongs in it."
		},
		{
			"heading": "cache-and-storage-scoping",
			"content": "The `cache` and `storage` blocks control derived-state isolation:"
		},
		{
			"heading": "cache-and-storage-scoping",
			"content": "Both default to scoped. Leave them true for tenant isolation guarantees; set `scoped: false` only for assets and caches you intend to share globally, such as a public logo bucket. Isolating state is what makes multi-instance deployments correct — see Isolation."
		},
		{
			"heading": "what-each-flag-covers",
			"content": "Flag"
		},
		{
			"heading": "what-each-flag-covers",
			"content": "Effect when true"
		},
		{
			"heading": "what-each-flag-covers",
			"content": "Effect when false"
		},
		{
			"heading": "what-each-flag-covers",
			"content": "`cache: { scoped: true }`"
		},
		{
			"heading": "what-each-flag-covers",
			"content": "Keys prefixed with the tenant id"
		},
		{
			"heading": "what-each-flag-covers",
			"content": "Keys shared globally"
		},
		{
			"heading": "what-each-flag-covers",
			"content": "`storage: { scoped: true }`"
		},
		{
			"heading": "what-each-flag-covers",
			"content": "Paths under `storage/{tenantId}/...`"
		},
		{
			"heading": "what-each-flag-covers",
			"content": "Paths shared globally"
		},
		{
			"heading": "what-each-flag-covers",
			"content": "The rule of thumb: tenant-owned derived state is scoped, and only explicitly public assets — brand media, product-wide computed values — are shared. The flags make the distinction explicit at one glance rather than scattering it through call sites."
		},
		{
			"heading": "per-tenant-config-overrides",
			"content": "Where a deployment needs tenant-specific behavior — different rate limits, different storage quotas, different feature flags — tenancy supports tenant-aware config overrides (v1.x). The override layer resolves per request against the configured tenant and merges over the defaults for that tenant's scope."
		},
		{
			"heading": "per-tenant-config-overrides",
			"content": "The mechanism follows the config precedence rule: global defaults first, tenant overrides applied for the resolved tenant, and anything more specific on a construct beating both. This keeps tenancy configuration in the config folder rather than scattered through application code."
		},
		{
			"heading": "env-and-runtime-overrides",
			"content": "Like every config module, `tenancy` can map environment variables through its `env` block:"
		},
		{
			"heading": "env-and-runtime-overrides",
			"content": "Typed env access applies here as it does everywhere: `env('TENANCY_MODE')` validates at boot, and using an undeclared variable fails fast at compile time and boot time. That matters for tenancy because a misconfigured resolution mode in production is a correctness bug, not a cosmetic one."
		},
		{
			"heading": "whats-next",
			"content": "Resolution — how each strategy resolves the tenant per request"
		},
		{
			"heading": "whats-next",
			"content": "Scoping — how `tenantField` scopes every query"
		},
		{
			"heading": "whats-next",
			"content": "Isolation — storage, cache, queue, and audit separation"
		},
		{
			"heading": "whats-next",
			"content": "Configuration — the config folder and precedence rules"
		},
		{
			"heading": "whats-next",
			"content": "Models — the `tenantField` and `permission` model options"
		}
	],
	"headings": [
		{
			"id": "the-config-module",
			"content": "The Config Module"
		},
		{
			"id": "choosing-a-resolution-strategy",
			"content": "Choosing a Resolution Strategy"
		},
		{
			"id": "choosing-by-traffic-shape",
			"content": "Choosing by traffic shape"
		},
		{
			"id": "configuring-the-tenant-field",
			"content": "Configuring the Tenant Field"
		},
		{
			"id": "the-convention-tenantid",
			"content": "The convention: `tenantId`"
		},
		{
			"id": "choosing-which-models-are-scoped",
			"content": "Choosing Which Models Are Scoped"
		},
		{
			"id": "cache-and-storage-scoping",
			"content": "Cache and Storage Scoping"
		},
		{
			"id": "what-each-flag-covers",
			"content": "What each flag covers"
		},
		{
			"id": "per-tenant-config-overrides",
			"content": "Per-Tenant Config Overrides"
		},
		{
			"id": "env-and-runtime-overrides",
			"content": "Env and Runtime Overrides"
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
		url: "#the-config-module",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Config Module" })
	},
	{
		depth: 2,
		url: "#choosing-a-resolution-strategy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Choosing a Resolution Strategy" })
	},
	{
		depth: 3,
		url: "#choosing-by-traffic-shape",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Choosing by traffic shape" })
	},
	{
		depth: 2,
		url: "#configuring-the-tenant-field",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Configuring the Tenant Field" })
	},
	{
		depth: 3,
		url: "#the-convention-tenantid",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["The convention: ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "tenantId" })] })
	},
	{
		depth: 2,
		url: "#choosing-which-models-are-scoped",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Choosing Which Models Are Scoped" })
	},
	{
		depth: 2,
		url: "#cache-and-storage-scoping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Cache and Storage Scoping" })
	},
	{
		depth: 3,
		url: "#what-each-flag-covers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What each flag covers" })
	},
	{
		depth: 2,
		url: "#per-tenant-config-overrides",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Per-Tenant Config Overrides" })
	},
	{
		depth: 2,
		url: "#env-and-runtime-overrides",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Env and Runtime Overrides" })
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
		h3: "h3",
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
			"Tenancy is configured from a single module in the config folder. Everything that governs resolution, scoping, and isolation lives in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/tenancy.ts" }),
			", following the framework rule that configuration lives in one place — with inline ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" options winning when a specific construct needs to differ."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The module exists because tenancy is a correctness boundary. A misconfigured resolution mode in production is a data-exposure bug, not a cosmetic one, so the framework type-checks the module, validates environment overrides at boot, and gives every value a single typed read path." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-config-module",
			children: "The Config Module"
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
			title: "src/config/tenancy.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/tenancy.ts"
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
							children: ",            "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// 'domain' | 'path' | 'header' | 'fixed' | 'org' (v1.x) | 'none'"
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
							children: ",   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// model column used for scoping"
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
							children: ",               "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// or ['projects', 'invoices'] — scoped models only"
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
							children: " },   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// tenant-prefixed cache keys"
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
							children: " }, "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// tenant-prefixed paths"
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
			"The module is a typed config module like any other: defaults are type-checked, environment overrides can be mapped through the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }),
			" block, and reading the value anywhere goes through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config('tenancy.mode')" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "choosing-a-resolution-strategy",
			children: "Choosing a Resolution Strategy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "mode" }),
			" key selects how the tenant is identified on each request:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Resolution" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "domain" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "subdomain to Tenant lookup" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "acme.app.dev" }),
					" resolves to tenant ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "acme" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "path" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "first path segment" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/t/acme/..." }),
					" resolves to tenant ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "acme" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "header" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-tenant-id" }), " request header"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "internal tools and API clients" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fixed" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "a single configured tenant" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "single-tenant app with the same guarantees" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "org" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "authenticated org membership (v1.x)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "orgs mapped to tenants via the auth layer" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "none" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "disabled" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "solo app — scoping off, zero overhead" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Domain mode is the default and the right choice for most product-style multi-tenant apps: each customer owns a subdomain and is isolated by it. Path mode suits workspaces reached through a shared host. Header mode fits machine-to-machine traffic where no domain or path structure exists. Fixed mode gives a single-tenant deployment the identical isolation guarantees without resolution work, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "none" }),
			" is for apps that want none of it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "choosing-by-traffic-shape",
			children: "Choosing by traffic shape"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Traffic shape" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Recommended mode" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Product customers on subdomains" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "domain" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Workspaces behind a shared host" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "path" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Internal tools and API clients" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "header" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Single-tenant deployment of a multi-tenant app" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fixed" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Auth orgs map to tenants" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "org" }), " (v1.x)"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Solo app, no tenants" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "none" }) })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The choice is about where tenant identity lives in the request, and every mode except ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "none" }),
			" produces the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.tenant" }),
			" downstream — the resolution strategy never changes what scoping, storage, or cache do afterward."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "configuring-the-tenant-field",
			children: "Configuring the Tenant Field"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }),
			" option names the model column used for scoping. The default is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "There are two places the field can be set:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Globally" }),
				" in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/tenancy.ts" }),
				", which applies the field to every scoped model"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Per model" }),
				" on the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				" options, which overrides the global default for that model"
			] }),
			"\n"
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
			title: "configuring-the-tenant-field.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "defineModel"
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
						children: " ({ "
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
						children: " }), { tenantField: "
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
						children: " })"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Both are legitimate, and per-model wins. The rule of thumb: set it globally once, then tune per model only where the naming differs." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "the-convention-tenantid",
			children: ["The convention: ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" })]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The default column name is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
			", and it pays to keep it. The query engine injects ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where tenantId = ctx.tenant.id" }),
			" into every scoped operation, the migration generates the column, and the tenant context carries the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "id" }),
			" that matches it. Using the default keeps the mapping from the tenant context to the scoping predicate a zero-config correspondence."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "choosing-which-models-are-scoped",
			children: "Choosing Which Models Are Scoped"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" }),
			" option narrows scoping to a specific set:"
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
			title: "choosing-which-models-are-scoped.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "defaults"
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
							children: "  models"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ["
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
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'invoices'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "], "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// only these get tenant predicates"
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
			"The default is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models: '*'" }),
			", meaning every model participates. Scope this down when you have cross-tenant reference data — for example a lookup table of countries or tax codes — that should be readable by every tenant. Keep in mind the trade-off: unscoped models are shared by construction, so their rows must be safe to expose across tenants."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!WARNING]\nEvery model that gets a tenant predicate also gets the isolation guarantee — and every model excluded from the list is shared by construction. Decide the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" }),
				" list consciously: global reference data belongs out of the list, tenant-owned business data belongs in it."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "cache-and-storage-scoping",
			children: "Cache and Storage Scoping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage" }),
			" blocks control derived-state isolation:"
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
			title: "cache-and-storage-scoping.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "defaults"
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
							children: "  cache"
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
							children: "scoped"
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
							children: " },   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// keys become {tenantId}:{key}"
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
							children: "  storage"
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
							children: "scoped"
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
							children: " }, "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// paths become storage/{tenantId}/..."
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
			"Both default to scoped. Leave them true for tenant isolation guarantees; set ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "scoped: false" }),
			" only for assets and caches you intend to share globally, such as a public logo bucket. Isolating state is what makes multi-instance deployments correct — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Isolation"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "what-each-flag-covers",
			children: "What each flag covers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Flag" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Effect when true" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Effect when false" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache: { scoped: true }" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Keys prefixed with the tenant id" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Keys shared globally" })
		] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage: { scoped: true }" }) }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Paths under ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage/{tenantId}/..." })] }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Paths shared globally" })
		] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The rule of thumb: tenant-owned derived state is scoped, and only explicitly public assets — brand media, product-wide computed values — are shared. The flags make the distinction explicit at one glance rather than scattering it through call sites." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "per-tenant-config-overrides",
			children: "Per-Tenant Config Overrides"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Where a deployment needs tenant-specific behavior — different rate limits, different storage quotas, different feature flags — tenancy supports tenant-aware config overrides (v1.x). The override layer resolves per request against the configured tenant and merges over the defaults for that tenant's scope." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The mechanism follows the config precedence rule: global defaults first, tenant overrides applied for the resolved tenant, and anything more specific on a construct beating both. This keeps tenancy configuration in the config folder rather than scattered through application code." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "env-and-runtime-overrides",
			children: "Env and Runtime Overrides"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Like every config module, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenancy" }),
			" can map environment variables through its ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }),
			" block:"
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
			title: "env-and-runtime-overrides.ts",
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  defaults: { mode: "
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
							children: "  env: { mode: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'TENANCY_MODE'"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Typed env access applies here as it does everywhere: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env('TENANCY_MODE')" }),
			" validates at boot, and using an undeclared variable fails fast at compile time and boot time. That matters for tenancy because a misconfigured resolution mode in production is a correctness bug, not a cosmetic one."
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
				href: "/docs/tenancy/resolution",
				children: "Resolution"
			}), " — how each strategy resolves the tenant per request"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/tenancy/scoping",
					children: "Scoping"
				}),
				" — how ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }),
				" scopes every query"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Isolation"
			}), " — storage, cache, queue, and audit separation"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/configuration",
				children: "Configuration"
			}), " — the config folder and precedence rules"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Models"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" model options"
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
