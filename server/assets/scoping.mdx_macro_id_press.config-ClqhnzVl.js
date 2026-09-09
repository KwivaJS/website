import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/tenancy/scoping.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Tenant Scoping",
	"description": "Every query is auto-scoped through tenantField — cross-tenant reads and writes are prevented by construction, with a policy-only escape hatch."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nScoping is where tenancy does its heaviest lifting. Once a tenant is resolved for a request, the data layer guarantees that every operation on a scoped model stays inside that tenant's boundary. The mechanics are simple and the enforcement is structural: &#x2A;*you do not remember to scope queries, because the query engine scopes them for you.**\n\n## Opting a Model In [#opting-a-model-in]\n\nA model participates in scoping through the `tenantField` option:\n\n```ts title=\"opting-a-model-in.ts\"\ndefineModel('projects', (f) => ({ ... }), { tenantField: 'tenantId' })\n```\n\nThe field can be set globally in the tenancy configuration or per model; per-model wins. When a model opts in, its `tenantField` column becomes the boundary for every query touchpoint.\n\nScoping is secure-by-construction at the data layer rather than convention-by-handlers. The predicate is injected by the query engine itself, so there is no helper you can forget to call and no where-clause you can accidentally omit — the boundary is part of the query's own construction.\n\n## The Scoping Rules [#the-scoping-rules]\n\nScoping is enforced across the full lifecycle of a model's data:\n\n| Operation | Rule                                                                      |\n| --------- | ------------------------------------------------------------------------- |\n| List      | every query auto-injects `where tenantId = ctx.tenant.id`                 |\n| Get       | single-row reads carry the same predicate                                 |\n| Update    | loads and updates only within the tenant                                  |\n| Delete    | deletes only within the tenant                                            |\n| Write     | `tenantId` is stamped from context; the client payload cannot override it |\n\nBecause the predicate is injected by the query engine, handlers written against scoped models simply work:\n\n```ts title=\"the-scoping-rules.ts\"\n// list returns only this tenant's rows — nothing special written here\nconst projects = await Project.query()\n  .where('status', 'active')\n  .page(page ?? 1, 20)\n```\n\nThe handler expresses intent; the tenant boundary is applied underneath. The same holds for relations: queries that join or load related scoped models stay inside the tenant boundary, so a tenant can never walk into another tenant's data through a relationship.\n\n## Writes Are Stamped, Not Trusted [#writes-are-stamped-not-trusted]\n\nThe write path is where accidental cross-tenant leaks usually start, so Kwiva removes the possibility rather than exhorting discipline:\n\n* On create, `tenantId` is stamped from the request context\n* On every write, `tenantId` is stripped from the client payload — the server treats it as non-authoritative\n* A crafted request that supplies a different `tenantId` cannot claim a row it does not own\n\nThis is the same posture as the rest of the data layer: the framework enforces invariants so application code cannot accidentally violate them. The client never supplies its own tenancy — identity is derived from the resolved context, and a payload field attempting to override it is discarded before the write proceeds.\n\n## Generated Routes Respect the Tenant [#generated-routes-respect-the-tenant]\n\nThe five generated routes per model — list, get, create, update, delete — all run inside the tenant boundary along with any custom controller actions you write against scoped models. There is no separate \"tenant routes\" and \"public routes\" split for the same model; scoping applies uniformly to the generated API, the typed client, and Studio screens, because all of them read through the same query path.\n\nThat uniformity is what makes the guarantee verifiable: &#x2A;*a cross-tenant read or write is prevented by construction, not by testing discipline.** A custom controller action, an agent MCP tool, and a Studio screen all reach the model through the same scoped query layer.\n\n## Indistinguishable From 404 [#indistinguishable-from-404]\n\nScoping is deliberately non-disclosing. When a request targets a row that exists but belongs to another tenant:\n\n```plaintext title=\"indistinguishable-from-404.txt\"\nGET /api/projects/xyz   (xyz belongs to tenant B, request is tenant A)\n→ 404\n```\n\nThe response is indistinguishable from a missing row. The caller cannot distinguish \"not found\" from \"not yours\" — there is no existence leak. This protects tenant data from enumeration attacks and keeps error surfaces consistent across the API. Cross-tenant writes follow the same discipline: a write to another tenant's row fails as if the row did not exist, so an attacker cannot probe a boundary by observing error codes.\n\n## The Escape Hatch: Policies Only [#the-escape-hatch-policies-only]\n\nLegitimate platform operations sometimes need to cross tenant boundaries — support staff viewing a customer's account, an admin repairing a broken tenant. That is what the policy-level escape hatch is for:\n\n```ts title=\"the-escape-hatch-policies-only.ts\"\n// inside a policy only\nconst rows = await tenant.asAdmin(() => Project.query().all())\n```\n\nThree properties matter here:\n\n1. **It lives in policies** — `tenant.asAdmin()` is callable from policy code only, not from arbitrary handlers\n2. **It is explicit** — every cross-tenant access names itself as an admin-scope operation\n3. **It is gated** — the policy still evaluates the calling user's abilities before the escape hatch runs\n\nThe escape hatch mirrors the `withTrashed` concept from soft deletes: the framework hides a category of data by default, and the elevated view is a named, deliberate action rather than a flag on the normal query.\n\n> \\[!WARNING]\n> `tenant.asAdmin()` is the one place tenancy can be widened — and only from policies. If you find yourself reaching for it in a handler, the operation is over-privileged: move the decision into a policy so the elevated scope stays gated by the user's actual abilities.\n\n### What the hatch is not [#what-the-hatch-is-not]\n\n`tenant.asAdmin()` is not a backdoor. It is callable only from policy code, it is explicitly named, and it runs after the policy has already evaluated the actor. Raw SQL remains the other escape route, and it is held to the same discipline: labeled and audited, precisely because it sits outside the query engine's automatic predicates.\n\n## Scoping and Policies [#scoping-and-policies]\n\nScoping and authorization compose rather than overlap:\n\n* **Scoping** answers \"which tenant's data may this request touch?\" by injecting the tenant predicate\n* **Policies** answer \"may this user perform this action?\" through `definePolicy` and the `permission` namespace\n\nBoth run on generated routes. A request passes the tenant boundary and the ability check — or fails either one — and neither check can be bypassed by calling the other surface. Studio screens, channels, and MCP tools inherit the same combined enforcement.\n\nThe two boundaries are orthogonal and both enforced. A request can hold the ability and still be stopped by scope; a request inside the tenant can still be stopped by policy. Defense-in-depth means the two checks are not interchangeable.\n\n## Indexing and Performance [#indexing-and-performance]\n\nThe injected predicate is only as fast as its index. The `tenantId` column is generated and indexed as part of the migration for scoped models, so the automatic `where tenantId = ctx.tenant.id` on every operation is an indexed lookup rather than a scan. Compose the tenant predicate with the rest of the filter, and list queries stay fast as both tenant count and per-tenant row count grow.\n\n## Testing Scoping [#testing-scoping]\n\nThe harness treats cross-tenant behavior as an assertable property:\n\n```ts title=\"testing-scoping.ts\"\nwithApp(async (app) => {\n  const acme = app.asTenant('acme')\n  const globex = app.asTenant('globex')\n  const acmeClient = createTestClient(app, { tenant: acme })\n\n  await acmeClient.projects.create({ name: 'Acme project' })\n\n  const globexClient = createTestClient(app, { tenant: globex })\n  // reading acme's project as globex asserts 404\n})\n```\n\nThe same factories seed rows for both tenants, and the assertion is the 404 rule itself: cross-tenant reads never succeed. The tenancy invariant suite (`kwiva test --tenancy`) runs this shape over a real two-tenant setup, so isolation is verified end-to-end rather than only in isolated unit assertions.\n\n## What's Next [#whats-next]\n\n* [Resolution](/docs/tenancy/resolution) — where the tenant that scopes queries comes from\n* [Isolation](/docs/tenancy/isolation) — scoping applied to storage, cache, and queue\n* [Policies](/docs/authorization/policies) — the policy-only `asAdmin` escape hatch\n* [Queries](/docs/data/queries) — the query builder every scoped operation flows through\n* [Models](/docs/data/models) — the `tenantField` model option\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Scoping is where tenancy does its heaviest lifting. Once a tenant is resolved for a request, the data layer guarantees that every operation on a scoped model stays inside that tenant's boundary. The mechanics are simple and the enforcement is structural: &#x2A;*you do not remember to scope queries, because the query engine scopes them for you.**"
		},
		{
			"heading": "opting-a-model-in",
			"content": "A model participates in scoping through the `tenantField` option:"
		},
		{
			"heading": "opting-a-model-in",
			"content": "The field can be set globally in the tenancy configuration or per model; per-model wins. When a model opts in, its `tenantField` column becomes the boundary for every query touchpoint."
		},
		{
			"heading": "opting-a-model-in",
			"content": "Scoping is secure-by-construction at the data layer rather than convention-by-handlers. The predicate is injected by the query engine itself, so there is no helper you can forget to call and no where-clause you can accidentally omit — the boundary is part of the query's own construction."
		},
		{
			"heading": "the-scoping-rules",
			"content": "Scoping is enforced across the full lifecycle of a model's data:"
		},
		{
			"heading": "the-scoping-rules",
			"content": "Operation"
		},
		{
			"heading": "the-scoping-rules",
			"content": "Rule"
		},
		{
			"heading": "the-scoping-rules",
			"content": "List"
		},
		{
			"heading": "the-scoping-rules",
			"content": "every query auto-injects `where tenantId = ctx.tenant.id`"
		},
		{
			"heading": "the-scoping-rules",
			"content": "Get"
		},
		{
			"heading": "the-scoping-rules",
			"content": "single-row reads carry the same predicate"
		},
		{
			"heading": "the-scoping-rules",
			"content": "Update"
		},
		{
			"heading": "the-scoping-rules",
			"content": "loads and updates only within the tenant"
		},
		{
			"heading": "the-scoping-rules",
			"content": "Delete"
		},
		{
			"heading": "the-scoping-rules",
			"content": "deletes only within the tenant"
		},
		{
			"heading": "the-scoping-rules",
			"content": "Write"
		},
		{
			"heading": "the-scoping-rules",
			"content": "`tenantId` is stamped from context; the client payload cannot override it"
		},
		{
			"heading": "the-scoping-rules",
			"content": "Because the predicate is injected by the query engine, handlers written against scoped models simply work:"
		},
		{
			"heading": "the-scoping-rules",
			"content": "The handler expresses intent; the tenant boundary is applied underneath. The same holds for relations: queries that join or load related scoped models stay inside the tenant boundary, so a tenant can never walk into another tenant's data through a relationship."
		},
		{
			"heading": "writes-are-stamped-not-trusted",
			"content": "The write path is where accidental cross-tenant leaks usually start, so Kwiva removes the possibility rather than exhorting discipline:"
		},
		{
			"heading": "writes-are-stamped-not-trusted",
			"content": "On create, `tenantId` is stamped from the request context"
		},
		{
			"heading": "writes-are-stamped-not-trusted",
			"content": "On every write, `tenantId` is stripped from the client payload — the server treats it as non-authoritative"
		},
		{
			"heading": "writes-are-stamped-not-trusted",
			"content": "A crafted request that supplies a different `tenantId` cannot claim a row it does not own"
		},
		{
			"heading": "writes-are-stamped-not-trusted",
			"content": "This is the same posture as the rest of the data layer: the framework enforces invariants so application code cannot accidentally violate them. The client never supplies its own tenancy — identity is derived from the resolved context, and a payload field attempting to override it is discarded before the write proceeds."
		},
		{
			"heading": "generated-routes-respect-the-tenant",
			"content": "The five generated routes per model — list, get, create, update, delete — all run inside the tenant boundary along with any custom controller actions you write against scoped models. There is no separate \"tenant routes\" and \"public routes\" split for the same model; scoping applies uniformly to the generated API, the typed client, and Studio screens, because all of them read through the same query path."
		},
		{
			"heading": "generated-routes-respect-the-tenant",
			"content": "That uniformity is what makes the guarantee verifiable: &#x2A;*a cross-tenant read or write is prevented by construction, not by testing discipline.** A custom controller action, an agent MCP tool, and a Studio screen all reach the model through the same scoped query layer."
		},
		{
			"heading": "indistinguishable-from-404",
			"content": "Scoping is deliberately non-disclosing. When a request targets a row that exists but belongs to another tenant:"
		},
		{
			"heading": "indistinguishable-from-404",
			"content": "The response is indistinguishable from a missing row. The caller cannot distinguish \"not found\" from \"not yours\" — there is no existence leak. This protects tenant data from enumeration attacks and keeps error surfaces consistent across the API. Cross-tenant writes follow the same discipline: a write to another tenant's row fails as if the row did not exist, so an attacker cannot probe a boundary by observing error codes."
		},
		{
			"heading": "the-escape-hatch-policies-only",
			"content": "Legitimate platform operations sometimes need to cross tenant boundaries — support staff viewing a customer's account, an admin repairing a broken tenant. That is what the policy-level escape hatch is for:"
		},
		{
			"heading": "the-escape-hatch-policies-only",
			"content": "Three properties matter here:"
		},
		{
			"heading": "the-escape-hatch-policies-only",
			"content": "**It lives in policies** — `tenant.asAdmin()` is callable from policy code only, not from arbitrary handlers"
		},
		{
			"heading": "the-escape-hatch-policies-only",
			"content": "**It is explicit** — every cross-tenant access names itself as an admin-scope operation"
		},
		{
			"heading": "the-escape-hatch-policies-only",
			"content": "**It is gated** — the policy still evaluates the calling user's abilities before the escape hatch runs"
		},
		{
			"heading": "the-escape-hatch-policies-only",
			"content": "The escape hatch mirrors the `withTrashed` concept from soft deletes: the framework hides a category of data by default, and the elevated view is a named, deliberate action rather than a flag on the normal query."
		},
		{
			"heading": "the-escape-hatch-policies-only",
			"content": "> \\[!WARNING]\n> `tenant.asAdmin()` is the one place tenancy can be widened — and only from policies. If you find yourself reaching for it in a handler, the operation is over-privileged: move the decision into a policy so the elevated scope stays gated by the user's actual abilities."
		},
		{
			"heading": "what-the-hatch-is-not",
			"content": "`tenant.asAdmin()` is not a backdoor. It is callable only from policy code, it is explicitly named, and it runs after the policy has already evaluated the actor. Raw SQL remains the other escape route, and it is held to the same discipline: labeled and audited, precisely because it sits outside the query engine's automatic predicates."
		},
		{
			"heading": "scoping-and-policies",
			"content": "Scoping and authorization compose rather than overlap:"
		},
		{
			"heading": "scoping-and-policies",
			"content": "**Scoping** answers \"which tenant's data may this request touch?\" by injecting the tenant predicate"
		},
		{
			"heading": "scoping-and-policies",
			"content": "**Policies** answer \"may this user perform this action?\" through `definePolicy` and the `permission` namespace"
		},
		{
			"heading": "scoping-and-policies",
			"content": "Both run on generated routes. A request passes the tenant boundary and the ability check — or fails either one — and neither check can be bypassed by calling the other surface. Studio screens, channels, and MCP tools inherit the same combined enforcement."
		},
		{
			"heading": "scoping-and-policies",
			"content": "The two boundaries are orthogonal and both enforced. A request can hold the ability and still be stopped by scope; a request inside the tenant can still be stopped by policy. Defense-in-depth means the two checks are not interchangeable."
		},
		{
			"heading": "indexing-and-performance",
			"content": "The injected predicate is only as fast as its index. The `tenantId` column is generated and indexed as part of the migration for scoped models, so the automatic `where tenantId = ctx.tenant.id` on every operation is an indexed lookup rather than a scan. Compose the tenant predicate with the rest of the filter, and list queries stay fast as both tenant count and per-tenant row count grow."
		},
		{
			"heading": "testing-scoping",
			"content": "The harness treats cross-tenant behavior as an assertable property:"
		},
		{
			"heading": "testing-scoping",
			"content": "The same factories seed rows for both tenants, and the assertion is the 404 rule itself: cross-tenant reads never succeed. The tenancy invariant suite (`kwiva test --tenancy`) runs this shape over a real two-tenant setup, so isolation is verified end-to-end rather than only in isolated unit assertions."
		},
		{
			"heading": "whats-next",
			"content": "Resolution — where the tenant that scopes queries comes from"
		},
		{
			"heading": "whats-next",
			"content": "Isolation — scoping applied to storage, cache, and queue"
		},
		{
			"heading": "whats-next",
			"content": "Policies — the policy-only `asAdmin` escape hatch"
		},
		{
			"heading": "whats-next",
			"content": "Queries — the query builder every scoped operation flows through"
		},
		{
			"heading": "whats-next",
			"content": "Models — the `tenantField` model option"
		}
	],
	"headings": [
		{
			"id": "opting-a-model-in",
			"content": "Opting a Model In"
		},
		{
			"id": "the-scoping-rules",
			"content": "The Scoping Rules"
		},
		{
			"id": "writes-are-stamped-not-trusted",
			"content": "Writes Are Stamped, Not Trusted"
		},
		{
			"id": "generated-routes-respect-the-tenant",
			"content": "Generated Routes Respect the Tenant"
		},
		{
			"id": "indistinguishable-from-404",
			"content": "Indistinguishable From 404"
		},
		{
			"id": "the-escape-hatch-policies-only",
			"content": "The Escape Hatch: Policies Only"
		},
		{
			"id": "what-the-hatch-is-not",
			"content": "What the hatch is not"
		},
		{
			"id": "scoping-and-policies",
			"content": "Scoping and Policies"
		},
		{
			"id": "indexing-and-performance",
			"content": "Indexing and Performance"
		},
		{
			"id": "testing-scoping",
			"content": "Testing Scoping"
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
		url: "#opting-a-model-in",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Opting a Model In" })
	},
	{
		depth: 2,
		url: "#the-scoping-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Scoping Rules" })
	},
	{
		depth: 2,
		url: "#writes-are-stamped-not-trusted",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Writes Are Stamped, Not Trusted" })
	},
	{
		depth: 2,
		url: "#generated-routes-respect-the-tenant",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generated Routes Respect the Tenant" })
	},
	{
		depth: 2,
		url: "#indistinguishable-from-404",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Indistinguishable From 404" })
	},
	{
		depth: 2,
		url: "#the-escape-hatch-policies-only",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Escape Hatch: Policies Only" })
	},
	{
		depth: 3,
		url: "#what-the-hatch-is-not",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What the hatch is not" })
	},
	{
		depth: 2,
		url: "#scoping-and-policies",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Scoping and Policies" })
	},
	{
		depth: 2,
		url: "#indexing-and-performance",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Indexing and Performance" })
	},
	{
		depth: 2,
		url: "#testing-scoping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Testing Scoping" })
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: ["Scoping is where tenancy does its heaviest lifting. Once a tenant is resolved for a request, the data layer guarantees that every operation on a scoped model stays inside that tenant's boundary. The mechanics are simple and the enforcement is structural: ", (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "you do not remember to scope queries, because the query engine scopes them for you." })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "opting-a-model-in",
			children: "Opting a Model In"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A model participates in scoping through the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }),
			" option:"
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
			title: "opting-a-model-in.ts",
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The field can be set globally in the tenancy configuration or per model; per-model wins. When a model opts in, its ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }),
			" column becomes the boundary for every query touchpoint."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Scoping is secure-by-construction at the data layer rather than convention-by-handlers. The predicate is injected by the query engine itself, so there is no helper you can forget to call and no where-clause you can accidentally omit — the boundary is part of the query's own construction." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-scoping-rules",
			children: "The Scoping Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Scoping is enforced across the full lifecycle of a model's data:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Operation" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Rule" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "List" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["every query auto-injects ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where tenantId = ctx.tenant.id" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Get" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "single-row reads carry the same predicate" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Update" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "loads and updates only within the tenant" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Delete" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "deletes only within the tenant" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Write" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }), " is stamped from context; the client payload cannot override it"] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the predicate is injected by the query engine, handlers written against scoped models simply work:" }),
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
			title: "the-scoping-rules.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// list returns only this tenant's rows — nothing special written here"
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " projects"
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
							children: " Project."
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
							children: "()"
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
							children: "  ."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "where"
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
							children: "'active'"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  ."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "page"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(page "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "??"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " 1"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "20"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The handler expresses intent; the tenant boundary is applied underneath. The same holds for relations: queries that join or load related scoped models stay inside the tenant boundary, so a tenant can never walk into another tenant's data through a relationship." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "writes-are-stamped-not-trusted",
			children: "Writes Are Stamped, Not Trusted"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The write path is where accidental cross-tenant leaks usually start, so Kwiva removes the possibility rather than exhorting discipline:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"On create, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
				" is stamped from the request context"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"On every write, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
				" is stripped from the client payload — the server treats it as non-authoritative"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A crafted request that supplies a different ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
				" cannot claim a row it does not own"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This is the same posture as the rest of the data layer: the framework enforces invariants so application code cannot accidentally violate them. The client never supplies its own tenancy — identity is derived from the resolved context, and a payload field attempting to override it is discarded before the write proceeds." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generated-routes-respect-the-tenant",
			children: "Generated Routes Respect the Tenant"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The five generated routes per model — list, get, create, update, delete — all run inside the tenant boundary along with any custom controller actions you write against scoped models. There is no separate \"tenant routes\" and \"public routes\" split for the same model; scoping applies uniformly to the generated API, the typed client, and Studio screens, because all of them read through the same query path." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"That uniformity is what makes the guarantee verifiable: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "a cross-tenant read or write is prevented by construction, not by testing discipline." }),
			" A custom controller action, an agent MCP tool, and a Studio screen all reach the model through the same scoped query layer."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "indistinguishable-from-404",
			children: "Indistinguishable From 404"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Scoping is deliberately non-disclosing. When a request targets a row that exists but belongs to another tenant:" }),
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
			title: "indistinguishable-from-404.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "GET /api/projects/xyz   (xyz belongs to tenant B, request is tenant A)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "→ 404" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The response is indistinguishable from a missing row. The caller cannot distinguish \"not found\" from \"not yours\" — there is no existence leak. This protects tenant data from enumeration attacks and keeps error surfaces consistent across the API. Cross-tenant writes follow the same discipline: a write to another tenant's row fails as if the row did not exist, so an attacker cannot probe a boundary by observing error codes." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-escape-hatch-policies-only",
			children: "The Escape Hatch: Policies Only"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Legitimate platform operations sometimes need to cross tenant boundaries — support staff viewing a customer's account, an admin repairing a broken tenant. That is what the policy-level escape hatch is for:" }),
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
			title: "the-escape-hatch-policies-only.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// inside a policy only"
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " rows"
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
							children: " tenant."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "asAdmin"
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
							children: " Project."
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
							children: "all"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "())"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Three properties matter here:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "It lives in policies" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenant.asAdmin()" }),
				" is callable from policy code only, not from arbitrary handlers"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "It is explicit" }), " — every cross-tenant access names itself as an admin-scope operation"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "It is gated" }), " — the policy still evaluates the calling user's abilities before the escape hatch runs"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The escape hatch mirrors the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withTrashed" }),
			" concept from soft deletes: the framework hides a category of data by default, and the elevated view is a named, deliberate action rather than a flag on the normal query."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!WARNING]\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenant.asAdmin()" }),
				" is the one place tenancy can be widened — and only from policies. If you find yourself reaching for it in a handler, the operation is over-privileged: move the decision into a policy so the elevated scope stays gated by the user's actual abilities."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "what-the-hatch-is-not",
			children: "What the hatch is not"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenant.asAdmin()" }), " is not a backdoor. It is callable only from policy code, it is explicitly named, and it runs after the policy has already evaluated the actor. Raw SQL remains the other escape route, and it is held to the same discipline: labeled and audited, precisely because it sits outside the query engine's automatic predicates."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "scoping-and-policies",
			children: "Scoping and Policies"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Scoping and authorization compose rather than overlap:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Scoping" }), " answers \"which tenant's data may this request touch?\" by injecting the tenant predicate"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Policies" }),
				" answer \"may this user perform this action?\" through ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
				" and the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" namespace"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Both run on generated routes. A request passes the tenant boundary and the ability check — or fails either one — and neither check can be bypassed by calling the other surface. Studio screens, channels, and MCP tools inherit the same combined enforcement." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The two boundaries are orthogonal and both enforced. A request can hold the ability and still be stopped by scope; a request inside the tenant can still be stopped by policy. Defense-in-depth means the two checks are not interchangeable." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "indexing-and-performance",
			children: "Indexing and Performance"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The injected predicate is only as fast as its index. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
			" column is generated and indexed as part of the migration for scoped models, so the automatic ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where tenantId = ctx.tenant.id" }),
			" on every operation is an indexed lookup rather than a scan. Compose the tenant predicate with the rest of the filter, and list queries stay fast as both tenant count and per-tenant row count grow."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "testing-scoping",
			children: "Testing Scoping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The harness treats cross-tenant behavior as an assertable property:" }),
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
			title: "testing-scoping.ts",
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
							children: " acmeClient"
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
							children: "  await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " acmeClient.projects."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "create"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ name: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Acme project'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })"
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
							children: "  const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " globexClient"
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
							children: "(app, { tenant: globex })"
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
						children: "  // reading acme's project as globex asserts 404"
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
			"The same factories seed rows for both tenants, and the assertion is the 404 rule itself: cross-tenant reads never succeed. The tenancy invariant suite (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test --tenancy" }),
			") runs this shape over a real two-tenant setup, so isolation is verified end-to-end rather than only in isolated unit assertions."
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
			}), " — where the tenant that scopes queries comes from"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Isolation"
			}), " — scoping applied to storage, cache, and queue"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/authorization/policies",
					children: "Policies"
				}),
				" — the policy-only ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "asAdmin" }),
				" escape hatch"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/queries",
				children: "Queries"
			}), " — the query builder every scoped operation flows through"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Models"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" }),
				" model option"
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
