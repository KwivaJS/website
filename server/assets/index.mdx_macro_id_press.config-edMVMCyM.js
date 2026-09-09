import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/tenancy/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Multi-Tenancy",
	"description": "Tenancy-first data access — tenant resolution, automatic query scoping, and per-tenant isolation, on by design and invisible in app code."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nMulti-tenancy in Kwiva is not an add-on you bolt on after the fact. It is a design posture: **tenancy-first data access**. Tenant resolution, query scoping, and per-tenant state isolation are on by design and, in the common case, invisible in your application code. The framework treats multi-tenant data leakage as a catastrophic failure class and engineers against it structurally — not with review checklists but with query scoping that cannot be forgotten.\n\n## Overview [#overview]\n\nKwiva's tenancy answers three questions for every request:\n\n1. **Which tenant is this?** — resolved once per request from the domain, path, or header\n2. **What can this tenant see?** — every model query scoped to the resolved tenant, by construction\n3. **What must stay separate?** — storage paths, cache keys, queue payloads, and broadcast channels isolated per tenant\n\nThe design principle is deliberately strict: &#x2A;*data access is scoped at the query boundary, not passed around by convention.** An unscoped query is not a style violation — it is close to impossible, because the query engine injects the tenant predicate automatically whenever a model opts in.\n\n```ts title=\"src/config/tenancy.ts\"\n// src/config/tenancy.ts\nexport default defineConfig('tenancy', {\n  defaults: {\n    mode: 'domain',            // 'domain' | 'path' | 'header' | 'fixed' | 'org' (v1.x) | 'none'\n    tenantField: 'tenantId',\n    models: '*',\n    cache: { scoped: true },\n    storage: { scoped: true },\n  },\n})\n```\n\n## What Tenancy Gives You [#what-tenancy-gives-you]\n\n| Concern                        | Mechanism                                                                          |\n| ------------------------------ | ---------------------------------------------------------------------------------- |\n| Resolve the tenant per request | `tenant` middleware over domain, path, or header strategy                          |\n| Scope every query              | `tenantField` auto-injects the tenant predicate into list, get, update, and delete |\n| Constrain writes               | the server stamps `tenantId` and strips it from client payloads                    |\n| Hide cross-tenant data         | access attempts are indistinguishable from 404s — no existence leak                |\n| Isolate derived state          | cache keys, storage paths, queue payloads, and broadcast channels are tenant-aware |\n| Escape for platform staff      | `tenant.asAdmin()` inside policies only                                            |\n\n## Key Components [#key-components]\n\n| Component                                    | Description                                                         |\n| -------------------------------------------- | ------------------------------------------------------------------- |\n| [Configuration](/docs/tenancy/configuration) | The `tenancy` config module, resolution strategy, and `tenantField` |\n| [Resolution](/docs/tenancy/resolution)       | How the tenant is resolved from domain, path, or header per request |\n| [Scoping](/docs/tenancy/scoping)             | The automatic injection of tenant predicates into every query       |\n| [Isolation](/docs/tenancy/isolation)         | Tenant-aware storage, cache, queue, and broadcast separation        |\n\n## The Tenant Model [#the-tenant-model]\n\nTenancy expects a tenant record to resolve against. The scaffolded shape includes a slug for domain lookup, an owner, and a plan:\n\n```ts title=\"the-tenant-model.ts\"\ndefineModel('tenants', (f) => ({\n  id: f.id(),\n  name: f.string(),\n  slug: f.string().unique(),          // domain mode lookup\n  ownerId: f.uuid(),\n  plan: f.enum('free', 'pro').default('free'),\n}), { permission: 'tenants' })\n```\n\nThe provisioning flow is scaffolded too: sign up, create the tenant plus an owner membership, then open the tenant's Studio at `/studio`. Resolution strategies point at this data — a subdomain resolves to the tenant whose `slug` matches.\n\n## Deployment Models [#deployment-models]\n\nTenancy supports three deployment shapes with one consistent boundary layer:\n\n| Model               | Layout                                      | Default?                         |\n| ------------------- | ------------------------------------------- | -------------------------------- |\n| Shared schema       | One database, rows carry `tenantId`         | Default                          |\n| Database-per-tenant | A database per tenant                       | Optional, compliance-heavy cases |\n| Hybrid              | Mixed — shared schema plus isolated tenants | Optional                         |\n\nThe default is &#x2A;*single database, shared schema, rows carrying `tenantId`** — the cheapest model with the strongest tooling, because the query engine scopes every access regardless of which row is involved. For compliance-heavy cases, **database-per-tenant** mode is supported and documented — and it never bypasses the row-level checks. Even a dedicated database is treated as an additional boundary, not a substitute for query scoping, so the security model does not weaken when tenants are physically separated. Hybrid deployments mix both where specific tenants need isolation while the rest share.\n\nWhatever the physical layout, the application-facing contract is the same: scale models by `tenantField`, resolve a tenant per request, and let the framework enforce the boundary.\n\n## Migrations and Seeding [#migrations-and-seeding]\n\nMigrations treat tenancy as a first-class concern. Models declaring `tenantField` generate the column and its index alongside every other field, so the predicate the query engine injects is always backed by an indexed column — scoping stays fast as a tenant's row count grows. Tenant data seeding follows the normal seeder path and composes with the test harness:\n\n```ts title=\"migrations-and-seeding.ts\"\nwithApp(async (app) => {\n  const acme = app.asTenant('acme')\n  const globex = app.asTenant('globex')\n  // seed both tenants through their scoped clients\n})\n```\n\nThe invariant test suite (`kwiva test --tenancy`) seeds two tenants and asserts isolation end-to-end — cross-tenant reads must 404, cross-tenant writes must be rejected, and derived state must stay prefixed. Isolation is a tested property, not a hopeful convention.\n\n## Multi-Instance Correctness [#multi-instance-correctness]\n\nTenancy is built for the scalability pillar — stateless multi-instance operation from day one:\n\n* All state is externalized: rows carry `tenantId`, cache keys are prefixed, storage lives in tenant paths\n* Instances are interchangeable, because no instance holds tenant-local state\n* Schedule locks with `onOneServer` prevent per-tenant cron duplication\n* Per-tenant rate limits are planned as `rateLimit: { per: 'tenant' }` (v1.x)\n\nBecause every piece of state is addressable by tenant-scoped key, any instance can serve any tenant. The scalability promise — add instances, not locks — holds because there is nothing tenant-local to migrate when a request lands on a different node.\n\n## Cross-Tenant Hazards [#cross-tenant-hazards]\n\nThe hazards tenancy guards against, and what closes each one:\n\n| Hazard                                 | Closed by                                                         |\n| -------------------------------------- | ----------------------------------------------------------------- |\n| Cross-tenant read via crafted id       | Injected query predicate; missing rows are 404s                   |\n| Cross-tenant write via crafted payload | Server stamps `tenantId`; client payloads are stripped            |\n| Cache collision between tenants        | Tenant-prefixed cache keys                                        |\n| Job operating on the wrong tenant      | `tenantId` carried in payload, context re-hydrated before handler |\n| Realtime leakage                       | Policy-checked, tenant-scoped channel membership                  |\n| Unscoped raw SQL                       | Escape-hatch discipline — raw SQL is labeled and audited          |\n\nThe escape hatch for legitimate platform staff is `tenant.asAdmin()`, and it is callable from policies only — every cross-tenant access names itself as an explicit elevated operation. See [Scoping](/docs/tenancy/scoping) for the hatch in detail.\n\n## Solo Apps [#solo-apps]\n\nNot every application is multi-tenant. The `none` mode turns scoping off entirely — solo apps keep the model without paying resolution or scoping cost. The same tenancy guarantees that protect multi-tenant deployments simply do not apply to a single-tenant app that opted out.\n\n## What's Next [#whats-next]\n\n* [Configuration](/docs/tenancy/configuration) — modes, `tenantField`, and scoped storage flags\n* [Resolution](/docs/tenancy/resolution) — domain, path, and header resolution in detail\n* [Scoping](/docs/tenancy/scoping) — how every query is scoped by construction\n* [Isolation](/docs/tenancy/isolation) — storage, cache, queue, and audit separation\n* [Models](/docs/data/models) — the `tenantField` model option and the model IR\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Multi-tenancy in Kwiva is not an add-on you bolt on after the fact. It is a design posture: **tenancy-first data access**. Tenant resolution, query scoping, and per-tenant state isolation are on by design and, in the common case, invisible in your application code. The framework treats multi-tenant data leakage as a catastrophic failure class and engineers against it structurally — not with review checklists but with query scoping that cannot be forgotten."
		},
		{
			"heading": "overview",
			"content": "Kwiva's tenancy answers three questions for every request:"
		},
		{
			"heading": "overview",
			"content": "**Which tenant is this?** — resolved once per request from the domain, path, or header"
		},
		{
			"heading": "overview",
			"content": "**What can this tenant see?** — every model query scoped to the resolved tenant, by construction"
		},
		{
			"heading": "overview",
			"content": "**What must stay separate?** — storage paths, cache keys, queue payloads, and broadcast channels isolated per tenant"
		},
		{
			"heading": "overview",
			"content": "The design principle is deliberately strict: &#x2A;*data access is scoped at the query boundary, not passed around by convention.** An unscoped query is not a style violation — it is close to impossible, because the query engine injects the tenant predicate automatically whenever a model opts in."
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "Concern"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "Mechanism"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "Resolve the tenant per request"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "`tenant` middleware over domain, path, or header strategy"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "Scope every query"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "`tenantField` auto-injects the tenant predicate into list, get, update, and delete"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "Constrain writes"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "the server stamps `tenantId` and strips it from client payloads"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "Hide cross-tenant data"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "access attempts are indistinguishable from 404s — no existence leak"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "Isolate derived state"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "cache keys, storage paths, queue payloads, and broadcast channels are tenant-aware"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "Escape for platform staff"
		},
		{
			"heading": "what-tenancy-gives-you",
			"content": "`tenant.asAdmin()` inside policies only"
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
			"content": "The `tenancy` config module, resolution strategy, and `tenantField`"
		},
		{
			"heading": "key-components",
			"content": "Resolution"
		},
		{
			"heading": "key-components",
			"content": "How the tenant is resolved from domain, path, or header per request"
		},
		{
			"heading": "key-components",
			"content": "Scoping"
		},
		{
			"heading": "key-components",
			"content": "The automatic injection of tenant predicates into every query"
		},
		{
			"heading": "key-components",
			"content": "Isolation"
		},
		{
			"heading": "key-components",
			"content": "Tenant-aware storage, cache, queue, and broadcast separation"
		},
		{
			"heading": "the-tenant-model",
			"content": "Tenancy expects a tenant record to resolve against. The scaffolded shape includes a slug for domain lookup, an owner, and a plan:"
		},
		{
			"heading": "the-tenant-model",
			"content": "The provisioning flow is scaffolded too: sign up, create the tenant plus an owner membership, then open the tenant's Studio at `/studio`. Resolution strategies point at this data — a subdomain resolves to the tenant whose `slug` matches."
		},
		{
			"heading": "deployment-models",
			"content": "Tenancy supports three deployment shapes with one consistent boundary layer:"
		},
		{
			"heading": "deployment-models",
			"content": "Model"
		},
		{
			"heading": "deployment-models",
			"content": "Layout"
		},
		{
			"heading": "deployment-models",
			"content": "Default?"
		},
		{
			"heading": "deployment-models",
			"content": "Shared schema"
		},
		{
			"heading": "deployment-models",
			"content": "One database, rows carry `tenantId`"
		},
		{
			"heading": "deployment-models",
			"content": "Default"
		},
		{
			"heading": "deployment-models",
			"content": "Database-per-tenant"
		},
		{
			"heading": "deployment-models",
			"content": "A database per tenant"
		},
		{
			"heading": "deployment-models",
			"content": "Optional, compliance-heavy cases"
		},
		{
			"heading": "deployment-models",
			"content": "Hybrid"
		},
		{
			"heading": "deployment-models",
			"content": "Mixed — shared schema plus isolated tenants"
		},
		{
			"heading": "deployment-models",
			"content": "Optional"
		},
		{
			"heading": "deployment-models",
			"content": "The default is &#x2A;*single database, shared schema, rows carrying `tenantId`** — the cheapest model with the strongest tooling, because the query engine scopes every access regardless of which row is involved. For compliance-heavy cases, **database-per-tenant** mode is supported and documented — and it never bypasses the row-level checks. Even a dedicated database is treated as an additional boundary, not a substitute for query scoping, so the security model does not weaken when tenants are physically separated. Hybrid deployments mix both where specific tenants need isolation while the rest share."
		},
		{
			"heading": "deployment-models",
			"content": "Whatever the physical layout, the application-facing contract is the same: scale models by `tenantField`, resolve a tenant per request, and let the framework enforce the boundary."
		},
		{
			"heading": "migrations-and-seeding",
			"content": "Migrations treat tenancy as a first-class concern. Models declaring `tenantField` generate the column and its index alongside every other field, so the predicate the query engine injects is always backed by an indexed column — scoping stays fast as a tenant's row count grows. Tenant data seeding follows the normal seeder path and composes with the test harness:"
		},
		{
			"heading": "migrations-and-seeding",
			"content": "The invariant test suite (`kwiva test --tenancy`) seeds two tenants and asserts isolation end-to-end — cross-tenant reads must 404, cross-tenant writes must be rejected, and derived state must stay prefixed. Isolation is a tested property, not a hopeful convention."
		},
		{
			"heading": "multi-instance-correctness",
			"content": "Tenancy is built for the scalability pillar — stateless multi-instance operation from day one:"
		},
		{
			"heading": "multi-instance-correctness",
			"content": "All state is externalized: rows carry `tenantId`, cache keys are prefixed, storage lives in tenant paths"
		},
		{
			"heading": "multi-instance-correctness",
			"content": "Instances are interchangeable, because no instance holds tenant-local state"
		},
		{
			"heading": "multi-instance-correctness",
			"content": "Schedule locks with `onOneServer` prevent per-tenant cron duplication"
		},
		{
			"heading": "multi-instance-correctness",
			"content": "Per-tenant rate limits are planned as `rateLimit: { per: 'tenant' }` (v1.x)"
		},
		{
			"heading": "multi-instance-correctness",
			"content": "Because every piece of state is addressable by tenant-scoped key, any instance can serve any tenant. The scalability promise — add instances, not locks — holds because there is nothing tenant-local to migrate when a request lands on a different node."
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "The hazards tenancy guards against, and what closes each one:"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Hazard"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Closed by"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Cross-tenant read via crafted id"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Injected query predicate; missing rows are 404s"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Cross-tenant write via crafted payload"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Server stamps `tenantId`; client payloads are stripped"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Cache collision between tenants"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Tenant-prefixed cache keys"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Job operating on the wrong tenant"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "`tenantId` carried in payload, context re-hydrated before handler"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Realtime leakage"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Policy-checked, tenant-scoped channel membership"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Unscoped raw SQL"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "Escape-hatch discipline — raw SQL is labeled and audited"
		},
		{
			"heading": "cross-tenant-hazards",
			"content": "The escape hatch for legitimate platform staff is `tenant.asAdmin()`, and it is callable from policies only — every cross-tenant access names itself as an explicit elevated operation. See Scoping for the hatch in detail."
		},
		{
			"heading": "solo-apps",
			"content": "Not every application is multi-tenant. The `none` mode turns scoping off entirely — solo apps keep the model without paying resolution or scoping cost. The same tenancy guarantees that protect multi-tenant deployments simply do not apply to a single-tenant app that opted out."
		},
		{
			"heading": "whats-next",
			"content": "Configuration — modes, `tenantField`, and scoped storage flags"
		},
		{
			"heading": "whats-next",
			"content": "Resolution — domain, path, and header resolution in detail"
		},
		{
			"heading": "whats-next",
			"content": "Scoping — how every query is scoped by construction"
		},
		{
			"heading": "whats-next",
			"content": "Isolation — storage, cache, queue, and audit separation"
		},
		{
			"heading": "whats-next",
			"content": "Models — the `tenantField` model option and the model IR"
		}
	],
	"headings": [
		{
			"id": "overview",
			"content": "Overview"
		},
		{
			"id": "what-tenancy-gives-you",
			"content": "What Tenancy Gives You"
		},
		{
			"id": "key-components",
			"content": "Key Components"
		},
		{
			"id": "the-tenant-model",
			"content": "The Tenant Model"
		},
		{
			"id": "deployment-models",
			"content": "Deployment Models"
		},
		{
			"id": "migrations-and-seeding",
			"content": "Migrations and Seeding"
		},
		{
			"id": "multi-instance-correctness",
			"content": "Multi-Instance Correctness"
		},
		{
			"id": "cross-tenant-hazards",
			"content": "Cross-Tenant Hazards"
		},
		{
			"id": "solo-apps",
			"content": "Solo Apps"
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
		url: "#what-tenancy-gives-you",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Tenancy Gives You" })
	},
	{
		depth: 2,
		url: "#key-components",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Key Components" })
	},
	{
		depth: 2,
		url: "#the-tenant-model",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Tenant Model" })
	},
	{
		depth: 2,
		url: "#deployment-models",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Deployment Models" })
	},
	{
		depth: 2,
		url: "#migrations-and-seeding",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Migrations and Seeding" })
	},
	{
		depth: 2,
		url: "#multi-instance-correctness",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Multi-Instance Correctness" })
	},
	{
		depth: 2,
		url: "#cross-tenant-hazards",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Cross-Tenant Hazards" })
	},
	{
		depth: 2,
		url: "#solo-apps",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Solo Apps" })
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
			"Multi-tenancy in Kwiva is not an add-on you bolt on after the fact. It is a design posture: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "tenancy-first data access" }),
			". Tenant resolution, query scoping, and per-tenant state isolation are on by design and, in the common case, invisible in your application code. The framework treats multi-tenant data leakage as a catastrophic failure class and engineers against it structurally — not with review checklists but with query scoping that cannot be forgotten."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "overview",
			children: "Overview"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva's tenancy answers three questions for every request:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Which tenant is this?" }), " — resolved once per request from the domain, path, or header"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "What can this tenant see?" }), " — every model query scoped to the resolved tenant, by construction"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "What must stay separate?" }), " — storage paths, cache keys, queue payloads, and broadcast channels isolated per tenant"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The design principle is deliberately strict: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "data access is scoped at the query boundary, not passed around by convention." }),
			" An unscoped query is not a style violation — it is close to impossible, because the query engine injects the tenant predicate automatically whenever a model opts in."
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-tenancy-gives-you",
			children: "What Tenancy Gives You"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Concern" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mechanism" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Resolve the tenant per request" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenant" }), " middleware over domain, path, or header strategy"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scope every query" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }), " auto-injects the tenant predicate into list, get, update, and delete"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Constrain writes" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"the server stamps ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
				" and strips it from client payloads"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Hide cross-tenant data" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "access attempts are indistinguishable from 404s — no existence leak" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Isolate derived state" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "cache keys, storage paths, queue payloads, and broadcast channels are tenant-aware" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Escape for platform staff" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenant.asAdmin()" }), " inside policies only"] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "key-components",
			children: "Key Components"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Component" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Description" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/configuration",
				children: "Configuration"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenancy" }),
				" config module, resolution strategy, and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" })
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/resolution",
				children: "Resolution"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "How the tenant is resolved from domain, path, or header per request" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/scoping",
				children: "Scoping"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The automatic injection of tenant predicates into every query" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Isolation"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tenant-aware storage, cache, queue, and broadcast separation" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-tenant-model",
			children: "The Tenant Model"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tenancy expects a tenant record to resolve against. The scaffolded shape includes a slug for domain lookup, an owner, and a plan:" }),
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
			title: "the-tenant-model.ts",
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
							children: "'tenants'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  slug: f."
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
							children: "(),          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// domain mode lookup"
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
							children: "  ownerId: f."
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
							children: "  plan: f."
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
							children: "'free'"
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
							children: "'pro'"
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
							children: "'free'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "}), { permission: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'tenants'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The provisioning flow is scaffolded too: sign up, create the tenant plus an owner membership, then open the tenant's Studio at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/studio" }),
			". Resolution strategies point at this data — a subdomain resolves to the tenant whose ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "slug" }),
			" matches."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "deployment-models",
			children: "Deployment Models"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tenancy supports three deployment shapes with one consistent boundary layer:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Model" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Layout" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Default?" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Shared schema" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["One database, rows carry ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" })] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Default" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Database-per-tenant" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A database per tenant" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Optional, compliance-heavy cases" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Hybrid" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Mixed — shared schema plus isolated tenants" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Optional" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The default is ",
			(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: ["single database, shared schema, rows carrying ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" })] }),
			" — the cheapest model with the strongest tooling, because the query engine scopes every access regardless of which row is involved. For compliance-heavy cases, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "database-per-tenant" }),
			" mode is supported and documented — and it never bypasses the row-level checks. Even a dedicated database is treated as an additional boundary, not a substitute for query scoping, so the security model does not weaken when tenants are physically separated. Hybrid deployments mix both where specific tenants need isolation while the rest share."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Whatever the physical layout, the application-facing contract is the same: scale models by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }),
			", resolve a tenant per request, and let the framework enforce the boundary."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "migrations-and-seeding",
			children: "Migrations and Seeding"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Migrations treat tenancy as a first-class concern. Models declaring ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }),
			" generate the column and its index alongside every other field, so the predicate the query engine injects is always backed by an indexed column — scoping stays fast as a tenant's row count grows. Tenant data seeding follows the normal seeder path and composes with the test harness:"
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
			title: "migrations-and-seeding.ts",
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
							children: " globex"
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
							children: "'globex'"
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
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // seed both tenants through their scoped clients"
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
			"The invariant test suite (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test --tenancy" }),
			") seeds two tenants and asserts isolation end-to-end — cross-tenant reads must 404, cross-tenant writes must be rejected, and derived state must stay prefixed. Isolation is a tested property, not a hopeful convention."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "multi-instance-correctness",
			children: "Multi-Instance Correctness"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tenancy is built for the scalability pillar — stateless multi-instance operation from day one:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"All state is externalized: rows carry ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
				", cache keys are prefixed, storage lives in tenant paths"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Instances are interchangeable, because no instance holds tenant-local state" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Schedule locks with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onOneServer" }),
				" prevent per-tenant cron duplication"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Per-tenant rate limits are planned as ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rateLimit: { per: 'tenant' }" }),
				" (v1.x)"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because every piece of state is addressable by tenant-scoped key, any instance can serve any tenant. The scalability promise — add instances, not locks — holds because there is nothing tenant-local to migrate when a request lands on a different node." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "cross-tenant-hazards",
			children: "Cross-Tenant Hazards"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The hazards tenancy guards against, and what closes each one:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Hazard" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Closed by" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cross-tenant read via crafted id" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Injected query predicate; missing rows are 404s" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cross-tenant write via crafted payload" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Server stamps ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
				"; client payloads are stripped"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cache collision between tenants" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tenant-prefixed cache keys" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Job operating on the wrong tenant" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }), " carried in payload, context re-hydrated before handler"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Realtime leakage" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Policy-checked, tenant-scoped channel membership" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Unscoped raw SQL" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Escape-hatch discipline — raw SQL is labeled and audited" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The escape hatch for legitimate platform staff is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenant.asAdmin()" }),
			", and it is callable from policies only — every cross-tenant access names itself as an explicit elevated operation. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/scoping",
				children: "Scoping"
			}),
			" for the hatch in detail."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "solo-apps",
			children: "Solo Apps"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Not every application is multi-tenant. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "none" }),
			" mode turns scoping off entirely — solo apps keep the model without paying resolution or scoping cost. The same tenancy guarantees that protect multi-tenant deployments simply do not apply to a single-tenant app that opted out."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/tenancy/configuration",
					children: "Configuration"
				}),
				" — modes, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }),
				", and scoped storage flags"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/resolution",
				children: "Resolution"
			}), " — domain, path, and header resolution in detail"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/scoping",
				children: "Scoping"
			}), " — how every query is scoped by construction"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Isolation"
			}), " — storage, cache, queue, and audit separation"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Models"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }),
				" model option and the model IR"
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
