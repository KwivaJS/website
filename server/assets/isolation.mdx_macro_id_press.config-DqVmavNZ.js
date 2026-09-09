import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/tenancy/isolation.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Tenant Isolation",
	"description": "Isolate tenant state across storage, cache, queue, sessions, and broadcast — and keep every instance interchangeable in multi-instance deployments."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nQuery scoping protects tenant data at the row level. Tenant isolation extends the same boundary to every piece of derived state a tenant can produce: files, cached values, queued work, sessions, and realtime traffic. Isolation is what makes multi-tenant safe and, at the same time, what makes multi-instance correct.\n\nThe pattern is uniform — every key, path, and payload gains the tenant identity, and every consumer of that state expects it. Nothing that crosses a process or instance boundary is tenant-blind, which is the property that makes instances interchangeable.\n\n## Isolation Dimensions [#isolation-dimensions]\n\nKwiva isolates tenant state automatically across the infrastructural surfaces:\n\n| Dimension | Mechanism                                    | Example                                    |\n| --------- | -------------------------------------------- | ------------------------------------------ |\n| Storage   | tenant-prefixed paths                        | `storage/{tenantId}/...`                   |\n| Cache     | tenant-prefixed keys                         | `{tenantId}:{key}`                         |\n| Queue     | tenant id carried in payloads                | workers re-hydrate context before handlers |\n| Broadcast | membership policy-checked per tenant         | channels reject cross-tenant subscribe     |\n| Session   | session state belongs to the resolved tenant | sign-in stays tenant-scoped                |\n| Audit     | audit rows carry the tenant                  | change history is scoped like data         |\n\nThe pattern is uniform: &#x2A;*every key, path, and payload gains the tenant identity, and every consumer of that state expects it.** Nothing that crosses a process or instance boundary is tenant-blind.\n\n## Storage Isolation [#storage-isolation]\n\nWhen the storage config is scoped (the default), uploaded and generated files land in tenant-prefixed paths:\n\n```plaintext title=\"storage-isolation.txt\"\nstorage/{tenantId}/logos/plan.png\nstorage/{tenantId}/exports/report.pdf\n```\n\nA tenant reading, writing, or signing a URL for storage resources gets the tenant-scoped path automatically. Two tenants can store a file named `plan.png` without colliding, and one tenant's file listing never reveals another's. Set `storage: { scoped: false }` only for explicitly shared assets, such as public or product-wide resources.\n\nThe storage layer composes with the rest of isolation: keys are prefixed by the same tenant identity that scopes queries, so a file reference and the row that owns it stay in the same boundary.\n\n## Cache Scoping [#cache-scoping]\n\nCache keys are scoped the same way — `cache.set` and friends compose the tenant prefix into the key:\n\n```plaintext title=\"cache-scoping.txt\"\n{tenantId}:posts:list:page-1\n{tenantId}:counts:dashboard\n```\n\nTwo consequences follow:\n\n1. **No cross-tenant cache poisoning** — invalidation keys are per tenant, so a product-wide `invalidateTags(['posts'])` cannot evict or serve another tenant's entries incorrectly\n2. **Correct multi-instance behavior** — because keys are distinct per tenant, every instance reads and writes the same logical cache with no shared-state hazards\n\nTags and TTLs behave unchanged; only the key namespace is tenant-aware.\n\n## Queue Isolation [#queue-isolation]\n\nQueued work is a special case, because a job outlives the request that dispatched it. Kwiva handles this by carrying the tenant in the payload:\n\n* Dispatched jobs carry `tenantId`\n* Workers look up the payload, re-hydrate the tenant context, and run the handler inside it before touching the queue payload's data\n* Every handler's queries are therefore scoped against the same tenant the requester operated under\n\nThis closes the gap that plagues naively built multi-tenant queues: a job dispatched for tenant A can never execute its writes against tenant B's rows, because the tenant context is restored before the handler body runs.\n\nThe re-hydration step is what makes queue handlers effectively identical to request handlers: by the time the handler runs, `ctx.tenant` is populated, queries scope, and storage and cache keys prefix — nothing in the job body needs to manage tenancy explicitly.\n\n## Broadcast and Realtime Isolation [#broadcast-and-realtime-isolation]\n\nRealtime channels are checkpoints too. Subscribing to a channel is a policy-checked operation, and membership is evaluated per tenant:\n\n* A channel like `chat.{roomId}` cannot be joined across tenant boundaries\n* Events broadcast with `UserSignedUp.broadcast('user.{id}')` reach only sessions whose tenant context matches\n* Model events broadcast to a public channel naturally ride the tenant-aware key so no cross-tenant push happens\n\nPractically: an operator for tenant A never receives another tenant's realtime traffic, even when both listen to the same channel name. Subscription is checked at the handshake, and delivery is dialed by tenant, so the same channel-name string means different audiences in different tenants.\n\n## Shared Versus Isolated Resources [#shared-versus-isolated-resources]\n\nNot every resource must be isolated, and the framework keeps the choice explicit:\n\n| Resource              | Default                      | When to share                                                 |\n| --------------------- | ---------------------------- | ------------------------------------------------------------- |\n| Database rows         | scoped via `tenantField`     | reference data excluded from `models: '*'`                    |\n| Storage paths         | scoped                       | public assets, brand media                                    |\n| Cache keys            | scoped                       | product-wide computed values                                  |\n| Connections and pools | shared by design             | pooling is economic; isolation is per-key, not per-connection |\n| Tenants themselves    | shared (the table is global) | tenant records must be resolvable for lookups                 |\n\nThe rule of thumb: &#x2A;*rows, state, and derived artifacts are scoped; infrastructure is shared.** Sharing a pool or a connection is safe precisely because the isolation happens in the key, path, and query layers above it.\n\nThe tenant table is the one table meant to be global — every request must be able to resolve any tenant from it. Its global read surface is deliberate and bounded; every other owned row is scoped.\n\n## Audit [#audit]\n\nAudit rows inherit the tenant boundary. `{ audit: true }` models record `createdBy` and `updatedBy` from the session, and the resulting history is scoped like the data it describes — a tenant sees its own change history, platform staff with an admin scope see the full trail. The relationship-aware Studio surfaces this per tenant, consistent with its data scoping.\n\n## Multi-Instance Correctness [#multi-instance-correctness]\n\nIsolation is what makes stateless multi-instance deployment truthful:\n\n* All state is externalized — rows carry `tenantId`, cache keys are prefixed, storage is tenant-pathed\n* Instances are interchangeable: no instance holds tenant-local state that another instance cannot see or produce\n* Schedule locks with `onOneServer` prevent per-tenant cron duplication when multiple workers compete for the same schedule\n* Per-tenant rate limits (`rateLimit: { per: 'tenant' }`, v1.x) keep one noisy tenant from exhausting shared infrastructure\n\nThe scalability promise — add instances, not locks — holds because tenant state is addressable from anywhere by its tenant-scoped key.\n\n> \\[!TIP]\n> When you persist a new kind of state, ask the isolation question immediately: does it carry the tenant identity in its key, path, or payload? If not, it becomes tenant-blind state the moment a second instance reads it — exactly the class of bug isolation exists to prevent.\n\n## Testing Isolation [#testing-isolation]\n\nIsolation participates in the test harness exactly like scoping:\n\n```ts title=\"testing-isolation.ts\"\nwithApp(async (app) => {\n  const acme = app.asTenant('acme')\n  const client = createTestClient(app, { tenant: acme })\n  // storage and cache writes are tenant-scoped; cross-tenant asserts 404\n})\n```\n\nFakes apply the same rule: `storage.fake()` records tenant-scoped paths, and `queue.fake()` asserts payloads carrying the tenant identity. An isolation regression — a key without a prefix, a job without a tenant — fails loudly in the harness. The invariant suite (`kwiva test --tenancy`) runs the full matrix across two tenants, so the guarantees hold end-to-end, not merely in unit tests.\n\n## What's Next [#whats-next]\n\n* [Scoping](/docs/tenancy/scoping) — the query boundary isolation builds on\n* [Resolution](/docs/tenancy/resolution) — where the tenant identity comes from\n* [Testing](/docs/testing/integration-testing) — exercising tenancy with `withApp` and fakes\n* [Storage](/docs/data/storage) — the disk layer that honors tenant paths\n* [Authorization](/docs/authorization) — how policies gate the same boundaries\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Query scoping protects tenant data at the row level. Tenant isolation extends the same boundary to every piece of derived state a tenant can produce: files, cached values, queued work, sessions, and realtime traffic. Isolation is what makes multi-tenant safe and, at the same time, what makes multi-instance correct."
		},
		{
			"heading": void 0,
			"content": "The pattern is uniform — every key, path, and payload gains the tenant identity, and every consumer of that state expects it. Nothing that crosses a process or instance boundary is tenant-blind, which is the property that makes instances interchangeable."
		},
		{
			"heading": "isolation-dimensions",
			"content": "Kwiva isolates tenant state automatically across the infrastructural surfaces:"
		},
		{
			"heading": "isolation-dimensions",
			"content": "Dimension"
		},
		{
			"heading": "isolation-dimensions",
			"content": "Mechanism"
		},
		{
			"heading": "isolation-dimensions",
			"content": "Example"
		},
		{
			"heading": "isolation-dimensions",
			"content": "Storage"
		},
		{
			"heading": "isolation-dimensions",
			"content": "tenant-prefixed paths"
		},
		{
			"heading": "isolation-dimensions",
			"content": "`storage/{tenantId}/...`"
		},
		{
			"heading": "isolation-dimensions",
			"content": "Cache"
		},
		{
			"heading": "isolation-dimensions",
			"content": "tenant-prefixed keys"
		},
		{
			"heading": "isolation-dimensions",
			"content": "`{tenantId}:{key}`"
		},
		{
			"heading": "isolation-dimensions",
			"content": "Queue"
		},
		{
			"heading": "isolation-dimensions",
			"content": "tenant id carried in payloads"
		},
		{
			"heading": "isolation-dimensions",
			"content": "workers re-hydrate context before handlers"
		},
		{
			"heading": "isolation-dimensions",
			"content": "Broadcast"
		},
		{
			"heading": "isolation-dimensions",
			"content": "membership policy-checked per tenant"
		},
		{
			"heading": "isolation-dimensions",
			"content": "channels reject cross-tenant subscribe"
		},
		{
			"heading": "isolation-dimensions",
			"content": "Session"
		},
		{
			"heading": "isolation-dimensions",
			"content": "session state belongs to the resolved tenant"
		},
		{
			"heading": "isolation-dimensions",
			"content": "sign-in stays tenant-scoped"
		},
		{
			"heading": "isolation-dimensions",
			"content": "Audit"
		},
		{
			"heading": "isolation-dimensions",
			"content": "audit rows carry the tenant"
		},
		{
			"heading": "isolation-dimensions",
			"content": "change history is scoped like data"
		},
		{
			"heading": "isolation-dimensions",
			"content": "The pattern is uniform: &#x2A;*every key, path, and payload gains the tenant identity, and every consumer of that state expects it.** Nothing that crosses a process or instance boundary is tenant-blind."
		},
		{
			"heading": "storage-isolation",
			"content": "When the storage config is scoped (the default), uploaded and generated files land in tenant-prefixed paths:"
		},
		{
			"heading": "storage-isolation",
			"content": "A tenant reading, writing, or signing a URL for storage resources gets the tenant-scoped path automatically. Two tenants can store a file named `plan.png` without colliding, and one tenant's file listing never reveals another's. Set `storage: { scoped: false }` only for explicitly shared assets, such as public or product-wide resources."
		},
		{
			"heading": "storage-isolation",
			"content": "The storage layer composes with the rest of isolation: keys are prefixed by the same tenant identity that scopes queries, so a file reference and the row that owns it stay in the same boundary."
		},
		{
			"heading": "cache-scoping",
			"content": "Cache keys are scoped the same way — `cache.set` and friends compose the tenant prefix into the key:"
		},
		{
			"heading": "cache-scoping",
			"content": "Two consequences follow:"
		},
		{
			"heading": "cache-scoping",
			"content": "**No cross-tenant cache poisoning** — invalidation keys are per tenant, so a product-wide `invalidateTags(['posts'])` cannot evict or serve another tenant's entries incorrectly"
		},
		{
			"heading": "cache-scoping",
			"content": "**Correct multi-instance behavior** — because keys are distinct per tenant, every instance reads and writes the same logical cache with no shared-state hazards"
		},
		{
			"heading": "cache-scoping",
			"content": "Tags and TTLs behave unchanged; only the key namespace is tenant-aware."
		},
		{
			"heading": "queue-isolation",
			"content": "Queued work is a special case, because a job outlives the request that dispatched it. Kwiva handles this by carrying the tenant in the payload:"
		},
		{
			"heading": "queue-isolation",
			"content": "Dispatched jobs carry `tenantId`"
		},
		{
			"heading": "queue-isolation",
			"content": "Workers look up the payload, re-hydrate the tenant context, and run the handler inside it before touching the queue payload's data"
		},
		{
			"heading": "queue-isolation",
			"content": "Every handler's queries are therefore scoped against the same tenant the requester operated under"
		},
		{
			"heading": "queue-isolation",
			"content": "This closes the gap that plagues naively built multi-tenant queues: a job dispatched for tenant A can never execute its writes against tenant B's rows, because the tenant context is restored before the handler body runs."
		},
		{
			"heading": "queue-isolation",
			"content": "The re-hydration step is what makes queue handlers effectively identical to request handlers: by the time the handler runs, `ctx.tenant` is populated, queries scope, and storage and cache keys prefix — nothing in the job body needs to manage tenancy explicitly."
		},
		{
			"heading": "broadcast-and-realtime-isolation",
			"content": "Realtime channels are checkpoints too. Subscribing to a channel is a policy-checked operation, and membership is evaluated per tenant:"
		},
		{
			"heading": "broadcast-and-realtime-isolation",
			"content": "A channel like `chat.{roomId}` cannot be joined across tenant boundaries"
		},
		{
			"heading": "broadcast-and-realtime-isolation",
			"content": "Events broadcast with `UserSignedUp.broadcast('user.{id}')` reach only sessions whose tenant context matches"
		},
		{
			"heading": "broadcast-and-realtime-isolation",
			"content": "Model events broadcast to a public channel naturally ride the tenant-aware key so no cross-tenant push happens"
		},
		{
			"heading": "broadcast-and-realtime-isolation",
			"content": "Practically: an operator for tenant A never receives another tenant's realtime traffic, even when both listen to the same channel name. Subscription is checked at the handshake, and delivery is dialed by tenant, so the same channel-name string means different audiences in different tenants."
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "Not every resource must be isolated, and the framework keeps the choice explicit:"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "Resource"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "Default"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "When to share"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "Database rows"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "scoped via `tenantField`"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "reference data excluded from `models: '*'`"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "Storage paths"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "scoped"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "public assets, brand media"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "Cache keys"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "scoped"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "product-wide computed values"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "Connections and pools"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "shared by design"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "pooling is economic; isolation is per-key, not per-connection"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "Tenants themselves"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "shared (the table is global)"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "tenant records must be resolvable for lookups"
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "The rule of thumb: &#x2A;*rows, state, and derived artifacts are scoped; infrastructure is shared.** Sharing a pool or a connection is safe precisely because the isolation happens in the key, path, and query layers above it."
		},
		{
			"heading": "shared-versus-isolated-resources",
			"content": "The tenant table is the one table meant to be global — every request must be able to resolve any tenant from it. Its global read surface is deliberate and bounded; every other owned row is scoped."
		},
		{
			"heading": "audit",
			"content": "Audit rows inherit the tenant boundary. `{ audit: true }` models record `createdBy` and `updatedBy` from the session, and the resulting history is scoped like the data it describes — a tenant sees its own change history, platform staff with an admin scope see the full trail. The relationship-aware Studio surfaces this per tenant, consistent with its data scoping."
		},
		{
			"heading": "multi-instance-correctness",
			"content": "Isolation is what makes stateless multi-instance deployment truthful:"
		},
		{
			"heading": "multi-instance-correctness",
			"content": "All state is externalized — rows carry `tenantId`, cache keys are prefixed, storage is tenant-pathed"
		},
		{
			"heading": "multi-instance-correctness",
			"content": "Instances are interchangeable: no instance holds tenant-local state that another instance cannot see or produce"
		},
		{
			"heading": "multi-instance-correctness",
			"content": "Schedule locks with `onOneServer` prevent per-tenant cron duplication when multiple workers compete for the same schedule"
		},
		{
			"heading": "multi-instance-correctness",
			"content": "Per-tenant rate limits (`rateLimit: { per: 'tenant' }`, v1.x) keep one noisy tenant from exhausting shared infrastructure"
		},
		{
			"heading": "multi-instance-correctness",
			"content": "The scalability promise — add instances, not locks — holds because tenant state is addressable from anywhere by its tenant-scoped key."
		},
		{
			"heading": "multi-instance-correctness",
			"content": "> \\[!TIP]\n> When you persist a new kind of state, ask the isolation question immediately: does it carry the tenant identity in its key, path, or payload? If not, it becomes tenant-blind state the moment a second instance reads it — exactly the class of bug isolation exists to prevent."
		},
		{
			"heading": "testing-isolation",
			"content": "Isolation participates in the test harness exactly like scoping:"
		},
		{
			"heading": "testing-isolation",
			"content": "Fakes apply the same rule: `storage.fake()` records tenant-scoped paths, and `queue.fake()` asserts payloads carrying the tenant identity. An isolation regression — a key without a prefix, a job without a tenant — fails loudly in the harness. The invariant suite (`kwiva test --tenancy`) runs the full matrix across two tenants, so the guarantees hold end-to-end, not merely in unit tests."
		},
		{
			"heading": "whats-next",
			"content": "Scoping — the query boundary isolation builds on"
		},
		{
			"heading": "whats-next",
			"content": "Resolution — where the tenant identity comes from"
		},
		{
			"heading": "whats-next",
			"content": "Testing — exercising tenancy with `withApp` and fakes"
		},
		{
			"heading": "whats-next",
			"content": "Storage — the disk layer that honors tenant paths"
		},
		{
			"heading": "whats-next",
			"content": "Authorization — how policies gate the same boundaries"
		}
	],
	"headings": [
		{
			"id": "isolation-dimensions",
			"content": "Isolation Dimensions"
		},
		{
			"id": "storage-isolation",
			"content": "Storage Isolation"
		},
		{
			"id": "cache-scoping",
			"content": "Cache Scoping"
		},
		{
			"id": "queue-isolation",
			"content": "Queue Isolation"
		},
		{
			"id": "broadcast-and-realtime-isolation",
			"content": "Broadcast and Realtime Isolation"
		},
		{
			"id": "shared-versus-isolated-resources",
			"content": "Shared Versus Isolated Resources"
		},
		{
			"id": "audit",
			"content": "Audit"
		},
		{
			"id": "multi-instance-correctness",
			"content": "Multi-Instance Correctness"
		},
		{
			"id": "testing-isolation",
			"content": "Testing Isolation"
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
		url: "#isolation-dimensions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Isolation Dimensions" })
	},
	{
		depth: 2,
		url: "#storage-isolation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Storage Isolation" })
	},
	{
		depth: 2,
		url: "#cache-scoping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Cache Scoping" })
	},
	{
		depth: 2,
		url: "#queue-isolation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Queue Isolation" })
	},
	{
		depth: 2,
		url: "#broadcast-and-realtime-isolation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Broadcast and Realtime Isolation" })
	},
	{
		depth: 2,
		url: "#shared-versus-isolated-resources",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Shared Versus Isolated Resources" })
	},
	{
		depth: 2,
		url: "#audit",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Audit" })
	},
	{
		depth: 2,
		url: "#multi-instance-correctness",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Multi-Instance Correctness" })
	},
	{
		depth: 2,
		url: "#testing-isolation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Testing Isolation" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Query scoping protects tenant data at the row level. Tenant isolation extends the same boundary to every piece of derived state a tenant can produce: files, cached values, queued work, sessions, and realtime traffic. Isolation is what makes multi-tenant safe and, at the same time, what makes multi-instance correct." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pattern is uniform — every key, path, and payload gains the tenant identity, and every consumer of that state expects it. Nothing that crosses a process or instance boundary is tenant-blind, which is the property that makes instances interchangeable." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "isolation-dimensions",
			children: "Isolation Dimensions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva isolates tenant state automatically across the infrastructural surfaces:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Dimension" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mechanism" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Storage" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "tenant-prefixed paths" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage/{tenantId}/..." }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cache" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "tenant-prefixed keys" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{tenantId}:{key}" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Queue" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "tenant id carried in payloads" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "workers re-hydrate context before handlers" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Broadcast" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "membership policy-checked per tenant" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "channels reject cross-tenant subscribe" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Session" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "session state belongs to the resolved tenant" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "sign-in stays tenant-scoped" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Audit" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "audit rows carry the tenant" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "change history is scoped like data" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The pattern is uniform: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "every key, path, and payload gains the tenant identity, and every consumer of that state expects it." }),
			" Nothing that crosses a process or instance boundary is tenant-blind."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "storage-isolation",
			children: "Storage Isolation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "When the storage config is scoped (the default), uploaded and generated files land in tenant-prefixed paths:" }),
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
			title: "storage-isolation.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "storage/{tenantId}/logos/plan.png" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "storage/{tenantId}/exports/report.pdf" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A tenant reading, writing, or signing a URL for storage resources gets the tenant-scoped path automatically. Two tenants can store a file named ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "plan.png" }),
			" without colliding, and one tenant's file listing never reveals another's. Set ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage: { scoped: false }" }),
			" only for explicitly shared assets, such as public or product-wide resources."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The storage layer composes with the rest of isolation: keys are prefixed by the same tenant identity that scopes queries, so a file reference and the row that owns it stay in the same boundary." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "cache-scoping",
			children: "Cache Scoping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Cache keys are scoped the same way — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache.set" }),
			" and friends compose the tenant prefix into the key:"
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
			title: "cache-scoping.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "{tenantId}:posts:list:page-1" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "{tenantId}:counts:dashboard" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two consequences follow:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No cross-tenant cache poisoning" }),
				" — invalidation keys are per tenant, so a product-wide ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidateTags(['posts'])" }),
				" cannot evict or serve another tenant's entries incorrectly"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Correct multi-instance behavior" }), " — because keys are distinct per tenant, every instance reads and writes the same logical cache with no shared-state hazards"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tags and TTLs behave unchanged; only the key namespace is tenant-aware." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "queue-isolation",
			children: "Queue Isolation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Queued work is a special case, because a job outlives the request that dispatched it. Kwiva handles this by carrying the tenant in the payload:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: ["Dispatched jobs carry ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" })] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Workers look up the payload, re-hydrate the tenant context, and run the handler inside it before touching the queue payload's data" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Every handler's queries are therefore scoped against the same tenant the requester operated under" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This closes the gap that plagues naively built multi-tenant queues: a job dispatched for tenant A can never execute its writes against tenant B's rows, because the tenant context is restored before the handler body runs." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The re-hydration step is what makes queue handlers effectively identical to request handlers: by the time the handler runs, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.tenant" }),
			" is populated, queries scope, and storage and cache keys prefix — nothing in the job body needs to manage tenancy explicitly."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "broadcast-and-realtime-isolation",
			children: "Broadcast and Realtime Isolation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Realtime channels are checkpoints too. Subscribing to a channel is a policy-checked operation, and membership is evaluated per tenant:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A channel like ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.{roomId}" }),
				" cannot be joined across tenant boundaries"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Events broadcast with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "UserSignedUp.broadcast('user.{id}')" }),
				" reach only sessions whose tenant context matches"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Model events broadcast to a public channel naturally ride the tenant-aware key so no cross-tenant push happens" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Practically: an operator for tenant A never receives another tenant's realtime traffic, even when both listen to the same channel name. Subscription is checked at the handshake, and delivery is dialed by tenant, so the same channel-name string means different audiences in different tenants." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "shared-versus-isolated-resources",
			children: "Shared Versus Isolated Resources"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Not every resource must be isolated, and the framework keeps the choice explicit:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Resource" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Default" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "When to share" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Database rows" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["scoped via ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" })] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["reference data excluded from ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models: '*'" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Storage paths" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "scoped" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "public assets, brand media" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cache keys" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "scoped" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "product-wide computed values" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Connections and pools" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "shared by design" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "pooling is economic; isolation is per-key, not per-connection" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tenants themselves" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "shared (the table is global)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "tenant records must be resolvable for lookups" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The rule of thumb: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "rows, state, and derived artifacts are scoped; infrastructure is shared." }),
			" Sharing a pool or a connection is safe precisely because the isolation happens in the key, path, and query layers above it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The tenant table is the one table meant to be global — every request must be able to resolve any tenant from it. Its global read surface is deliberate and bounded; every other owned row is scoped." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "audit",
			children: "Audit"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Audit rows inherit the tenant boundary. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ audit: true }" }),
			" models record ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createdBy" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "updatedBy" }),
			" from the session, and the resulting history is scoped like the data it describes — a tenant sees its own change history, platform staff with an admin scope see the full trail. The relationship-aware Studio surfaces this per tenant, consistent with its data scoping."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "multi-instance-correctness",
			children: "Multi-Instance Correctness"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Isolation is what makes stateless multi-instance deployment truthful:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"All state is externalized — rows carry ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
				", cache keys are prefixed, storage is tenant-pathed"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Instances are interchangeable: no instance holds tenant-local state that another instance cannot see or produce" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Schedule locks with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onOneServer" }),
				" prevent per-tenant cron duplication when multiple workers compete for the same schedule"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Per-tenant rate limits (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rateLimit: { per: 'tenant' }" }),
				", v1.x) keep one noisy tenant from exhausting shared infrastructure"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The scalability promise — add instances, not locks — holds because tenant state is addressable from anywhere by its tenant-scoped key." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!TIP]\nWhen you persist a new kind of state, ask the isolation question immediately: does it carry the tenant identity in its key, path, or payload? If not, it becomes tenant-blind state the moment a second instance reads it — exactly the class of bug isolation exists to prevent." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "testing-isolation",
			children: "Testing Isolation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Isolation participates in the test harness exactly like scoping:" }),
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
			title: "testing-isolation.ts",
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
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // storage and cache writes are tenant-scoped; cross-tenant asserts 404"
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
			"Fakes apply the same rule: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage.fake()" }),
			" records tenant-scoped paths, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.fake()" }),
			" asserts payloads carrying the tenant identity. An isolation regression — a key without a prefix, a job without a tenant — fails loudly in the harness. The invariant suite (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test --tenancy" }),
			") runs the full matrix across two tenants, so the guarantees hold end-to-end, not merely in unit tests."
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
				href: "/docs/tenancy/scoping",
				children: "Scoping"
			}), " — the query boundary isolation builds on"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/resolution",
				children: "Resolution"
			}), " — where the tenant identity comes from"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/testing/integration-testing",
					children: "Testing"
				}),
				" — exercising tenancy with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" }),
				" and fakes"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/storage",
				children: "Storage"
			}), " — the disk layer that honors tenant paths"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization",
				children: "Authorization"
			}), " — how policies gate the same boundaries"] }),
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
