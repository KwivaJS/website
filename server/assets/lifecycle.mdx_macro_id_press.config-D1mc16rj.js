import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/core-concepts/lifecycle.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Lifecycle",
	"description": "Every Kwiva application runs two lifecycles — a boot sequence that composes the kernel and a request pipeline that processes each call from entry to response."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nKwiva applications run two distinct lifecycles. The **boot lifecycle** runs once per process: it loads config, discovers capabilities, assembles the kernel, and starts serving. The **request lifecycle** runs for every request that arrives afterwards: a fixed, ordered pipeline that every API call, rendered page, and WebSocket upgrade traverses. Understanding both tells you exactly when your code runs, what is available to it, and in what order.\n\n## Application Boot Lifecycle [#application-boot-lifecycle]\n\nBoot is composed by `defineApp` in a fixed order (see [Applications](/docs/core-concepts/applications) for the kernel):\n\n1. **Configuration loading** — `src/config/*.ts` modules are loaded and merged through `kwiva.config.ts`.\n2. **Environment validation** — declared env vars are checked; missing or invalid values fail fast.\n3. **Module contribution merge** — models, config, and migrations from `defineModule` packages join the app.\n4. **Model scan to IR** — model definitions become the model IR, with a migration drift check that warns in development.\n5. **Route registration** — generated model routes, controllers, server routes, and module routes mount into the pipeline.\n6. **Middleware stack assembly** — middleware runs in the order declared in `src/config/app.ts > middleware[]`.\n7. **Provider boot** — telemetry, queue, storage, and custom providers initialize.\n8. **Engine init** — storage mounts, cache, task scheduler, and realtime channels start.\n9. **Listen** — the preset adapter begins accepting requests.\n\nShutdown inverts the order: providers stop, the queue drains, and the engine layer stops. Hooks on `defineModule` and `definePlugin` (see [Modules](/docs/core-concepts/modules) and [Plugins](/docs/core-concepts/plugins)) run at the points where the kernel hands control to them — booting, setup, starting, and stopping.\n\nA boot failure is intentionally loud: because config and env validate first, a misconfigured application never starts in a half-working state.\n\n## The Request Pipeline [#the-request-pipeline]\n\nEvery request flows through one ordered pipeline. The same pipeline serves API routes, rendered pages, WebSocket upgrades, and server routes — there is no separate processing path for each kind of work. The full request pipeline runs fourteen ordered steps between the client and the engine writing the response:\n\n```plaintext title=\"the-request-pipeline.txt\"\n   1. client request\n   2. preset adapter                     → Web Request normalization\n   3. pipeline entry\n        request ID assigned              (x-request-id: set or forwarded)\n        server span begins               (http method, route)\n        onRequest middleware             (security headers, rate limit, CORS)\n   4. route manifest match               (generated, controller, server routes)\n   5. route rules apply                  (cache hit → serve + bypass pipeline)\n   6. context assembly\n        parse query / parse body         (json, form, multipart)\n        cookies decode, session load     (engine-agnostic store)\n        tenant resolution                (domain, path, or header)\n        state / decorate / resolve       (typed app context)\n   7. onTransform                       → mutate parsed values\n   8. validation                        → body/query/params/headers/cookies\n   9. onBeforeHandle                    → guards: auth, tenant, policy checks\n  10. handler\n       ├─ API route   → controller action (service → model query → response)\n       └─ page route  → SSR render (beforeLoad → loaders → stream)\n  11. onAfterHandle                     → response shaping, cache tags\n  12. error path (any throw)            → taxonomy mapping → error response/page\n  13. onResponse                        → final headers, span close, metrics\n  14. engine writes response            → preset adapter\n```\n\nSteps 3 through 13 run inside `@kwiva/http`; steps 2 and 14 happen at the adapter boundary. Whatever runtime you deploy on, the normalization contract is the same — a Web `Request` in, a Web `Response` out.\n\nThe full sequence, including the error path that can replace step 13 on any throw, is documented on [Request Lifecycle](/docs/http/lifecycle). The sections below cover the parts most relevant to application code.\n\n## Lifecycle Events and Hook Points [#lifecycle-events-and-hook-points]\n\nThe pipeline is expressed as eight named events. Middleware attaches to any of them; guards attach to `onBeforeHandle`:\n\n| Event            | Runs       | Purpose                                        |\n| ---------------- | ---------- | ---------------------------------------------- |\n| `onRequest`      | Entry      | Request ID, security headers, rate limit, CORS |\n| `onParse`        | Parsing    | Body parsing: JSON, form, multipart            |\n| `onTransform`    | Transform  | Mutate parsed values before validation         |\n| `onBeforeHandle` | Guards     | Auth, tenant, policy checks                    |\n| `onAfterHandle`  | Response   | Response shaping, cache tags                   |\n| `onResponse`     | Completion | Final headers, span close, metrics             |\n| `onError`        | Any throw  | Error taxonomy mapping                         |\n| `onStop`         | Shutdown   | Server shutdown hooks                          |\n\nThe first six run in order for every request. `onError` runs only when a stage throws or returns an error. `onStop` fires at shutdown, not per request.\n\n## Middleware Lifecycle [#middleware-lifecycle]\n\nMiddleware is a named, reusable pipeline stage. The base form wraps the rest of the pipeline:\n\n```ts title=\"middleware-lifecycle.ts\"\nimport { defineMiddleware } from '@kwiva/http'\n\nexport default defineMiddleware('timing', async (ctx, next) => {\n  const start = performance.now()\n  const response = await next()\n  console.log(`request took ${performance.now() - start}ms`)\n  return response\n})\n```\n\nBecause middleware can attach to any event, scoping to a specific moment is explicit:\n\n```ts title=\"middleware-lifecycle-2.ts\"\nexport default defineMiddleware.on('onRequest', async (ctx, next) => {\n  // earliest touchpoint — before routing and parsing\n  return next()\n})\n```\n\n```ts title=\"middleware-lifecycle-3.ts\"\nexport default defineMiddleware.on('onResponse', async (ctx, next) => {\n  // final headers, after the handler and error stages\n  return next()\n})\n```\n\n## Scoping [#scoping]\n\nHooks and middleware apply in three scopes, so shared behavior lands close to what it protects:\n\n| Scope      | Declared on                                                       | Applies to                    |\n| ---------- | ----------------------------------------------------------------- | ----------------------------- |\n| App        | `defineApp`                                                       | Every request                 |\n| Controller | `defineController` options and mount guards                       | Every route in the controller |\n| Route      | `c.get(path, handler, options)` and route-level middleware arrays | The single route              |\n\nA request through a guarded controller accumulates app middleware, controller middleware, guard `beforeHandle` hooks, and route middleware — in that order — before the handler runs.\n\n## Ordering Guarantees [#ordering-guarantees]\n\nFour guarantees always hold, and user code can rely on them:\n\n* Middleware run in `src/config/app.ts > middleware[]` order, before guards.\n* Guard `beforeHandle` runs after validation — the validated body and query are available to policy checks.\n* Route rules short-circuit before session load — public cached pages skip auth entirely.\n* Error mapping is the only code that can run after `onResponse`, and it only records span error attributes.\n\n## Timing Budgets [#timing-budgets]\n\nThe pipeline is designed to be cheap at every stage. Representative p50 targets for a typical list endpoint:\n\n| Stage                         | Budget                    |\n| ----------------------------- | ------------------------- |\n| Adapter to pipeline entry     | under 1 ms                |\n| Session and tenant resolve    | under 2 ms on a store hit |\n| Validation (compiled schema)  | under 0.5 ms              |\n| Handler (model list, 20 rows) | under 5 ms                |\n| Full API round-trip (local)   | under 15 ms               |\n| SSR shell (stream start)      | under 50 ms               |\n\nEach stage is a trace span, so the pipeline is observable end to end — see [Observability: tracing](/docs/observability/tracing).\n\n## Session and Tenant Propagation [#session-and-tenant-propagation]\n\nTwo cross-cutting values resolve during context assembly and ride through the request:\n\n* **Session** — the session id from the cookie loads a typed session onto the context (`ctx.session`), backed by the session store configured in `src/config/session.ts`. See [Sessions](/docs/auth/sessions).\n* **Tenant** — resolution strategies live in `src/config/tenancy.ts` (`subdomain`, `path`, `header`, `fixed` for single-tenant). The resolved tenant flows into model query scoping, cache keys, storage prefixes, queue payloads, and log and trace attributes. See [Tenancy](/docs/tenancy).\n\n## Work After the Response [#work-after-the-response]\n\nTwo patterns handle work that must not block the response:\n\n* Event emission and queue dispatch happen inside handlers transaction-aware but acknowledge in-band — the client sees the response and the work is durable.\n* Post-response tasks defer with `ctx.waitUntil(promise)`, which is edge-safe and keeps the connection alive only as long as the work needs. See [Context](/docs/core-concepts/context).\n\n## What's Next [#whats-next]\n\n1. [Request Lifecycle](/docs/http/lifecycle) — the complete pipeline, scoping, and guarantees\n2. [Middleware](/docs/http/middleware) — creating and scoping pipeline stages\n3. [Context](/docs/core-concepts/context) — the object assembled once, then threaded through every stage\n4. [Applications](/docs/core-concepts/applications) — the boot sequence the kernel runs\n5. [Architecture: Request Lifecycle](/architecture/request-lifecycle) — the lifecycle in system terms\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva applications run two distinct lifecycles. The **boot lifecycle** runs once per process: it loads config, discovers capabilities, assembles the kernel, and starts serving. The **request lifecycle** runs for every request that arrives afterwards: a fixed, ordered pipeline that every API call, rendered page, and WebSocket upgrade traverses. Understanding both tells you exactly when your code runs, what is available to it, and in what order."
		},
		{
			"heading": "application-boot-lifecycle",
			"content": "Boot is composed by `defineApp` in a fixed order (see Applications for the kernel):"
		},
		{
			"heading": "application-boot-lifecycle",
			"content": "**Configuration loading** — `src/config/*.ts` modules are loaded and merged through `kwiva.config.ts`."
		},
		{
			"heading": "application-boot-lifecycle",
			"content": "**Environment validation** — declared env vars are checked; missing or invalid values fail fast."
		},
		{
			"heading": "application-boot-lifecycle",
			"content": "**Module contribution merge** — models, config, and migrations from `defineModule` packages join the app."
		},
		{
			"heading": "application-boot-lifecycle",
			"content": "**Model scan to IR** — model definitions become the model IR, with a migration drift check that warns in development."
		},
		{
			"heading": "application-boot-lifecycle",
			"content": "**Route registration** — generated model routes, controllers, server routes, and module routes mount into the pipeline."
		},
		{
			"heading": "application-boot-lifecycle",
			"content": "**Middleware stack assembly** — middleware runs in the order declared in `src/config/app.ts > middleware[]`."
		},
		{
			"heading": "application-boot-lifecycle",
			"content": "**Provider boot** — telemetry, queue, storage, and custom providers initialize."
		},
		{
			"heading": "application-boot-lifecycle",
			"content": "**Engine init** — storage mounts, cache, task scheduler, and realtime channels start."
		},
		{
			"heading": "application-boot-lifecycle",
			"content": "**Listen** — the preset adapter begins accepting requests."
		},
		{
			"heading": "application-boot-lifecycle",
			"content": "Shutdown inverts the order: providers stop, the queue drains, and the engine layer stops. Hooks on `defineModule` and `definePlugin` (see Modules and Plugins) run at the points where the kernel hands control to them — booting, setup, starting, and stopping."
		},
		{
			"heading": "application-boot-lifecycle",
			"content": "A boot failure is intentionally loud: because config and env validate first, a misconfigured application never starts in a half-working state."
		},
		{
			"heading": "the-request-pipeline",
			"content": "Every request flows through one ordered pipeline. The same pipeline serves API routes, rendered pages, WebSocket upgrades, and server routes — there is no separate processing path for each kind of work. The full request pipeline runs fourteen ordered steps between the client and the engine writing the response:"
		},
		{
			"heading": "the-request-pipeline",
			"content": "Steps 3 through 13 run inside `@kwiva/http`; steps 2 and 14 happen at the adapter boundary. Whatever runtime you deploy on, the normalization contract is the same — a Web `Request` in, a Web `Response` out."
		},
		{
			"heading": "the-request-pipeline",
			"content": "The full sequence, including the error path that can replace step 13 on any throw, is documented on Request Lifecycle. The sections below cover the parts most relevant to application code."
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "The pipeline is expressed as eight named events. Middleware attaches to any of them; guards attach to `onBeforeHandle`:"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Event"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Runs"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Purpose"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "`onRequest`"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Entry"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Request ID, security headers, rate limit, CORS"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "`onParse`"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Parsing"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Body parsing: JSON, form, multipart"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "`onTransform`"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Transform"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Mutate parsed values before validation"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "`onBeforeHandle`"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Guards"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Auth, tenant, policy checks"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "`onAfterHandle`"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Response"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Response shaping, cache tags"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "`onResponse`"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Completion"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Final headers, span close, metrics"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "`onError`"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Any throw"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Error taxonomy mapping"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "`onStop`"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Shutdown"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "Server shutdown hooks"
		},
		{
			"heading": "lifecycle-events-and-hook-points",
			"content": "The first six run in order for every request. `onError` runs only when a stage throws or returns an error. `onStop` fires at shutdown, not per request."
		},
		{
			"heading": "middleware-lifecycle",
			"content": "Middleware is a named, reusable pipeline stage. The base form wraps the rest of the pipeline:"
		},
		{
			"heading": "middleware-lifecycle",
			"content": "Because middleware can attach to any event, scoping to a specific moment is explicit:"
		},
		{
			"heading": "scoping",
			"content": "Hooks and middleware apply in three scopes, so shared behavior lands close to what it protects:"
		},
		{
			"heading": "scoping",
			"content": "Scope"
		},
		{
			"heading": "scoping",
			"content": "Declared on"
		},
		{
			"heading": "scoping",
			"content": "Applies to"
		},
		{
			"heading": "scoping",
			"content": "App"
		},
		{
			"heading": "scoping",
			"content": "`defineApp`"
		},
		{
			"heading": "scoping",
			"content": "Every request"
		},
		{
			"heading": "scoping",
			"content": "Controller"
		},
		{
			"heading": "scoping",
			"content": "`defineController` options and mount guards"
		},
		{
			"heading": "scoping",
			"content": "Every route in the controller"
		},
		{
			"heading": "scoping",
			"content": "Route"
		},
		{
			"heading": "scoping",
			"content": "`c.get(path, handler, options)` and route-level middleware arrays"
		},
		{
			"heading": "scoping",
			"content": "The single route"
		},
		{
			"heading": "scoping",
			"content": "A request through a guarded controller accumulates app middleware, controller middleware, guard `beforeHandle` hooks, and route middleware — in that order — before the handler runs."
		},
		{
			"heading": "ordering-guarantees",
			"content": "Four guarantees always hold, and user code can rely on them:"
		},
		{
			"heading": "ordering-guarantees",
			"content": "Middleware run in `src/config/app.ts > middleware[]` order, before guards."
		},
		{
			"heading": "ordering-guarantees",
			"content": "Guard `beforeHandle` runs after validation — the validated body and query are available to policy checks."
		},
		{
			"heading": "ordering-guarantees",
			"content": "Route rules short-circuit before session load — public cached pages skip auth entirely."
		},
		{
			"heading": "ordering-guarantees",
			"content": "Error mapping is the only code that can run after `onResponse`, and it only records span error attributes."
		},
		{
			"heading": "timing-budgets",
			"content": "The pipeline is designed to be cheap at every stage. Representative p50 targets for a typical list endpoint:"
		},
		{
			"heading": "timing-budgets",
			"content": "Stage"
		},
		{
			"heading": "timing-budgets",
			"content": "Budget"
		},
		{
			"heading": "timing-budgets",
			"content": "Adapter to pipeline entry"
		},
		{
			"heading": "timing-budgets",
			"content": "under 1 ms"
		},
		{
			"heading": "timing-budgets",
			"content": "Session and tenant resolve"
		},
		{
			"heading": "timing-budgets",
			"content": "under 2 ms on a store hit"
		},
		{
			"heading": "timing-budgets",
			"content": "Validation (compiled schema)"
		},
		{
			"heading": "timing-budgets",
			"content": "under 0.5 ms"
		},
		{
			"heading": "timing-budgets",
			"content": "Handler (model list, 20 rows)"
		},
		{
			"heading": "timing-budgets",
			"content": "under 5 ms"
		},
		{
			"heading": "timing-budgets",
			"content": "Full API round-trip (local)"
		},
		{
			"heading": "timing-budgets",
			"content": "under 15 ms"
		},
		{
			"heading": "timing-budgets",
			"content": "SSR shell (stream start)"
		},
		{
			"heading": "timing-budgets",
			"content": "under 50 ms"
		},
		{
			"heading": "timing-budgets",
			"content": "Each stage is a trace span, so the pipeline is observable end to end — see Observability: tracing."
		},
		{
			"heading": "session-and-tenant-propagation",
			"content": "Two cross-cutting values resolve during context assembly and ride through the request:"
		},
		{
			"heading": "session-and-tenant-propagation",
			"content": "**Session** — the session id from the cookie loads a typed session onto the context (`ctx.session`), backed by the session store configured in `src/config/session.ts`. See Sessions."
		},
		{
			"heading": "session-and-tenant-propagation",
			"content": "**Tenant** — resolution strategies live in `src/config/tenancy.ts` (`subdomain`, `path`, `header`, `fixed` for single-tenant). The resolved tenant flows into model query scoping, cache keys, storage prefixes, queue payloads, and log and trace attributes. See Tenancy."
		},
		{
			"heading": "work-after-the-response",
			"content": "Two patterns handle work that must not block the response:"
		},
		{
			"heading": "work-after-the-response",
			"content": "Event emission and queue dispatch happen inside handlers transaction-aware but acknowledge in-band — the client sees the response and the work is durable."
		},
		{
			"heading": "work-after-the-response",
			"content": "Post-response tasks defer with `ctx.waitUntil(promise)`, which is edge-safe and keeps the connection alive only as long as the work needs. See Context."
		},
		{
			"heading": "whats-next",
			"content": "Request Lifecycle — the complete pipeline, scoping, and guarantees"
		},
		{
			"heading": "whats-next",
			"content": "Middleware — creating and scoping pipeline stages"
		},
		{
			"heading": "whats-next",
			"content": "Context — the object assembled once, then threaded through every stage"
		},
		{
			"heading": "whats-next",
			"content": "Applications — the boot sequence the kernel runs"
		},
		{
			"heading": "whats-next",
			"content": "Architecture: Request Lifecycle — the lifecycle in system terms"
		}
	],
	"headings": [
		{
			"id": "application-boot-lifecycle",
			"content": "Application Boot Lifecycle"
		},
		{
			"id": "the-request-pipeline",
			"content": "The Request Pipeline"
		},
		{
			"id": "lifecycle-events-and-hook-points",
			"content": "Lifecycle Events and Hook Points"
		},
		{
			"id": "middleware-lifecycle",
			"content": "Middleware Lifecycle"
		},
		{
			"id": "scoping",
			"content": "Scoping"
		},
		{
			"id": "ordering-guarantees",
			"content": "Ordering Guarantees"
		},
		{
			"id": "timing-budgets",
			"content": "Timing Budgets"
		},
		{
			"id": "session-and-tenant-propagation",
			"content": "Session and Tenant Propagation"
		},
		{
			"id": "work-after-the-response",
			"content": "Work After the Response"
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
		url: "#application-boot-lifecycle",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Application Boot Lifecycle" })
	},
	{
		depth: 2,
		url: "#the-request-pipeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Request Pipeline" })
	},
	{
		depth: 2,
		url: "#lifecycle-events-and-hook-points",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Lifecycle Events and Hook Points" })
	},
	{
		depth: 2,
		url: "#middleware-lifecycle",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Middleware Lifecycle" })
	},
	{
		depth: 2,
		url: "#scoping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Scoping" })
	},
	{
		depth: 2,
		url: "#ordering-guarantees",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Ordering Guarantees" })
	},
	{
		depth: 2,
		url: "#timing-budgets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Timing Budgets" })
	},
	{
		depth: 2,
		url: "#session-and-tenant-propagation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Session and Tenant Propagation" })
	},
	{
		depth: 2,
		url: "#work-after-the-response",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Work After the Response" })
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
			"Kwiva applications run two distinct lifecycles. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "boot lifecycle" }),
			" runs once per process: it loads config, discovers capabilities, assembles the kernel, and starts serving. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "request lifecycle" }),
			" runs for every request that arrives afterwards: a fixed, ordered pipeline that every API call, rendered page, and WebSocket upgrade traverses. Understanding both tells you exactly when your code runs, what is available to it, and in what order."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "application-boot-lifecycle",
			children: "Application Boot Lifecycle"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Boot is composed by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
			" in a fixed order (see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}),
			" for the kernel):"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Configuration loading" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/*.ts" }),
				" modules are loaded and merged through ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Environment validation" }), " — declared env vars are checked; missing or invalid values fail fast."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Module contribution merge" }),
				" — models, config, and migrations from ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
				" packages join the app."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Model scan to IR" }), " — model definitions become the model IR, with a migration drift check that warns in development."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Route registration" }), " — generated model routes, controllers, server routes, and module routes mount into the pipeline."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Middleware stack assembly" }),
				" — middleware runs in the order declared in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts > middleware[]" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Provider boot" }), " — telemetry, queue, storage, and custom providers initialize."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Engine init" }), " — storage mounts, cache, task scheduler, and realtime channels start."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Listen" }), " — the preset adapter begins accepting requests."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Shutdown inverts the order: providers stop, the queue drains, and the engine layer stops. Hooks on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePlugin" }),
			" (see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/modules",
				children: "Modules"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/plugins",
				children: "Plugins"
			}),
			") run at the points where the kernel hands control to them — booting, setup, starting, and stopping."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A boot failure is intentionally loud: because config and env validate first, a misconfigured application never starts in a half-working state." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-request-pipeline",
			children: "The Request Pipeline"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every request flows through one ordered pipeline. The same pipeline serves API routes, rendered pages, WebSocket upgrades, and server routes — there is no separate processing path for each kind of work. The full request pipeline runs fourteen ordered steps between the client and the engine writing the response:" }),
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
			title: "the-request-pipeline.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   1. client request" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   2. preset adapter                     → Web Request normalization" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   3. pipeline entry" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        request ID assigned              (x-request-id: set or forwarded)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        server span begins               (http method, route)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        onRequest middleware             (security headers, rate limit, CORS)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   4. route manifest match               (generated, controller, server routes)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   5. route rules apply                  (cache hit → serve + bypass pipeline)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   6. context assembly" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        parse query / parse body         (json, form, multipart)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        cookies decode, session load     (engine-agnostic store)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        tenant resolution                (domain, path, or header)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "        state / decorate / resolve       (typed app context)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   7. onTransform                       → mutate parsed values" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   8. validation                        → body/query/params/headers/cookies" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   9. onBeforeHandle                    → guards: auth, tenant, policy checks" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  10. handler" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       ├─ API route   → controller action (service → model query → response)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       └─ page route  → SSR render (beforeLoad → loaders → stream)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  11. onAfterHandle                     → response shaping, cache tags" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  12. error path (any throw)            → taxonomy mapping → error response/page" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  13. onResponse                        → final headers, span close, metrics" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  14. engine writes response            → preset adapter" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Steps 3 through 13 run inside ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
			"; steps 2 and 14 happen at the adapter boundary. Whatever runtime you deploy on, the normalization contract is the same — a Web ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Request" }),
			" in, a Web ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Response" }),
			" out."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The full sequence, including the error path that can replace step 13 on any throw, is documented on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Request Lifecycle"
			}),
			". The sections below cover the parts most relevant to application code."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "lifecycle-events-and-hook-points",
			children: "Lifecycle Events and Hook Points"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The pipeline is expressed as eight named events. Middleware attaches to any of them; guards attach to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onBeforeHandle" }),
			":"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Event" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Runs" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onRequest" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Entry" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Request ID, security headers, rate limit, CORS" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onParse" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Parsing" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Body parsing: JSON, form, multipart" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onTransform" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Transform" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Mutate parsed values before validation" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onBeforeHandle" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Guards" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Auth, tenant, policy checks" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onAfterHandle" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Response" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Response shaping, cache tags" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onResponse" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Completion" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Final headers, span close, metrics" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Any throw" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Error taxonomy mapping" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onStop" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Shutdown" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server shutdown hooks" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The first six run in order for every request. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
			" runs only when a stage throws or returns an error. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onStop" }),
			" fires at shutdown, not per request."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "middleware-lifecycle",
			children: "Middleware Lifecycle"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Middleware is a named, reusable pipeline stage. The base form wraps the rest of the pipeline:" }),
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
			title: "middleware-lifecycle.ts",
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
							children: " { defineMiddleware } "
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
							children: " '@kwiva/http'"
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
							children: " defineMiddleware"
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
							children: "'timing'"
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
							children: "ctx"
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
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "next"
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
							children: " start"
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
							children: " performance."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "now"
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
							children: " response"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " next"
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
							children: "  console."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "log"
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
							children: "`request took ${"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "performance"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "now"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "() "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "-"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " start"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "}ms`"
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
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "  return"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " response"
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
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because middleware can attach to any event, scoping to a specific moment is explicit:" }),
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
			title: "middleware-lifecycle-2.ts",
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " defineMiddleware."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "on"
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
							children: "'onRequest'"
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
							children: "ctx"
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
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "next"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // earliest touchpoint — before routing and parsing"
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
							children: "  return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " next"
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
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "middleware-lifecycle-3.ts",
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " defineMiddleware."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "on"
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
							children: "'onResponse'"
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
							children: "ctx"
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
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "next"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // final headers, after the handler and error stages"
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
							children: "  return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " next"
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
			id: "scoping",
			children: "Scoping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Hooks and middleware apply in three scopes, so shared behavior lands close to what it protects:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Scope" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Declared on" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Applies to" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "App" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Every request" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controller" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }), " options and mount guards"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Every route in the controller" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "c.get(path, handler, options)" }), " and route-level middleware arrays"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The single route" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A request through a guarded controller accumulates app middleware, controller middleware, guard ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeHandle" }),
			" hooks, and route middleware — in that order — before the handler runs."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "ordering-guarantees",
			children: "Ordering Guarantees"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Four guarantees always hold, and user code can rely on them:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Middleware run in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts > middleware[]" }),
				" order, before guards."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Guard ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeHandle" }),
				" runs after validation — the validated body and query are available to policy checks."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Route rules short-circuit before session load — public cached pages skip auth entirely." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Error mapping is the only code that can run after ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onResponse" }),
				", and it only records span error attributes."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "timing-budgets",
			children: "Timing Budgets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pipeline is designed to be cheap at every stage. Representative p50 targets for a typical list endpoint:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Stage" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Budget" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Adapter to pipeline entry" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "under 1 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Session and tenant resolve" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "under 2 ms on a store hit" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Validation (compiled schema)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "under 0.5 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Handler (model list, 20 rows)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "under 5 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Full API round-trip (local)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "under 15 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR shell (stream start)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "under 50 ms" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each stage is a trace span, so the pipeline is observable end to end — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Observability: tracing"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "session-and-tenant-propagation",
			children: "Session and Tenant Propagation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two cross-cutting values resolve during context assembly and ride through the request:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Session" }),
				" — the session id from the cookie loads a typed session onto the context (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
				"), backed by the session store configured in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/session.ts" }),
				". See ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/auth/sessions",
					children: "Sessions"
				}),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tenant" }),
				" — resolution strategies live in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/tenancy.ts" }),
				" (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "subdomain" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "path" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "header" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fixed" }),
				" for single-tenant). The resolved tenant flows into model query scoping, cache keys, storage prefixes, queue payloads, and log and trace attributes. See ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/tenancy",
					children: "Tenancy"
				}),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "work-after-the-response",
			children: "Work After the Response"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two patterns handle work that must not block the response:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Event emission and queue dispatch happen inside handlers transaction-aware but acknowledge in-band — the client sees the response and the work is durable." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Post-response tasks defer with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.waitUntil(promise)" }),
				", which is edge-safe and keeps the connection alive only as long as the work needs. See ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/context",
					children: "Context"
				}),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Request Lifecycle"
			}), " — the complete pipeline, scoping, and guarantees"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/middleware",
				children: "Middleware"
			}), " — creating and scoping pipeline stages"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/context",
				children: "Context"
			}), " — the object assembled once, then threaded through every stage"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}), " — the boot sequence the kernel runs"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/request-lifecycle",
				children: "Architecture: Request Lifecycle"
			}), " — the lifecycle in system terms"] }),
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
