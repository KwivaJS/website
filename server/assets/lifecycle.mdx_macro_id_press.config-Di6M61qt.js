import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/http/lifecycle.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Request Lifecycle",
	"description": "The complete 14-step request pipeline — adapter entry through response write, lifecycle events, scoping, ordering guarantees, and timing budgets."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nEvery HTTP request in a Kwiva application flows through one ordered pipeline. The same pipeline serves API routes, rendered pages, WebSocket upgrades, and server routes. Understanding it tells you exactly when middleware, guards, validation, and your handler run — and in what order.\n\nThe pipeline is framework-owned end to end. Its surface — middleware, guards, lifecycle events — is stable and documented; its internals are free to evolve without changing the guarantees app code relies on. This page walks the complete sequence, then the events, scoping, ordering guarantees, and timing budgets.\n\n## The Full Sequence [#the-full-sequence]\n\nThe pipeline runs fourteen ordered steps between the client and the engine writing the response:\n\n```plaintext title=\"the-full-sequence.txt\"\n  1. client request\n  2. preset adapter                     → Web Request normalization\n  3. pipeline entry\n       request ID assigned              (x-request-id: set or forwarded)\n       server span begins               (http method, route)\n       onRequest middleware             (security headers, rate limit, CORS)\n  4. route manifest match               (generated, controller, server routes)\n  5. route rules apply                  (cache hit → serve + bypass pipeline)\n  6. context assembly\n       parse query / parse body         (json, form, multipart)\n       cookies decode, session load     (engine-agnostic store)\n       tenant resolution                (domain, path, or header)\n       state / decorate / resolve       (typed app context)\n  7. onTransform                       → mutate parsed values\n  8. validation                        → body/query/params/headers/cookies\n  9. onBeforeHandle                    → guards: auth, tenant, policy checks\n 10. handler\n      ├─ API route   → controller action (service → model query → response)\n      └─ page route  → SSR render (beforeLoad → loaders → stream)\n 11. onAfterHandle                     → response shaping, cache tags\n 12. error path (any throw)            → taxonomy mapping → error response/page\n 13. onResponse                        → final headers, span close, metrics\n 14. engine writes response            → preset adapter\n```\n\nSteps 3 through 13 run inside `@kwiva/http`; steps 2 and 14 happen at the adapter boundary that normalizes incoming requests and writes the final response. Whatever runtime you deploy on — the local server, an edge worker — the normalization contract is the same: a Web `Request` in, a Web `Response` out.\n\n## Lifecycle Events [#lifecycle-events]\n\nThe pipeline is expressed as eight named events that middleware and guards can hook into:\n\n| Event            | Runs       | Purpose                                        |\n| ---------------- | ---------- | ---------------------------------------------- |\n| `onRequest`      | Entry      | Request ID, security headers, rate limit, CORS |\n| `onParse`        | Parsing    | Body parsing: JSON, form, multipart            |\n| `onTransform`    | Transform  | Mutate parsed values before validation         |\n| `onBeforeHandle` | Guards     | Auth, tenant, policy checks                    |\n| `onAfterHandle`  | Response   | Response shaping, cache tags                   |\n| `onResponse`     | Completion | Final headers, span close, metrics             |\n| `onError`        | Any throw  | Error taxonomy mapping                         |\n| `onStop`         | Shutdown   | Server shutdown hooks                          |\n\nThe first six run in order for every request. `onError` runs only when a stage throws or returns an error. `onStop` fires when the server shuts down, not per request.\n\n## Lifecycle-Scoped Middleware [#lifecycle-scoped-middleware]\n\nMiddleware can attach to any event, not just the overall request/response wrapper:\n\n```ts title=\"lifecycle-scoped-middleware.ts\"\nimport { defineMiddleware } from '@kwiva/http'\n\nexport default defineMiddleware.on('onRequest', async (ctx, next) => {\n  // earliest touchpoint — before routing and parsing\n  return next()\n})\n```\n\n```ts title=\"lifecycle-scoped-middleware-2.ts\"\nimport { defineMiddleware } from '@kwiva/http'\n\nexport default defineMiddleware.on('onResponse', async (ctx, next) => {\n  // final headers, after the handler and error stages\n  return next()\n})\n```\n\nEvent-scoped middleware gives you a stage without the request/response wrapper. Config arrays still reference middleware by name, and the `defineMiddleware.on` files run at their declared event in the configured order.\n\n## Scoping [#scoping]\n\nMiddleware and guard hooks are scoped so shared behavior lands close to the routes it protects:\n\n| Scope      | Declared on                                                      | Applies to                    |\n| ---------- | ---------------------------------------------------------------- | ----------------------------- |\n| App        | `defineApp`                                                      | Every request                 |\n| Controller | `defineController` options and mount guards                      | Every route in the controller |\n| Route      | `c.get.path, handler, options` and route-level middleware arrays | The single route              |\n\nA request through a guarded controller accumulates app middleware, controller middleware, guard `beforeHandle` hooks, and route middleware — in that order — before the handler runs.\n\n## State, Decorate, Resolve [#state-decorate-resolve]\n\nThe context is assembled from three app-level declarations in `defineApp`:\n\n```ts title=\"state-decorate-resolve.ts\"\nexport default defineApp({\n  state: { startTime: Date.now() },          // app-wide mutable store types\n  decorate: { client: createClient() },      // singletons available on ctx\n  resolve: [\n    ['tenant', async ({ headers }) => resolveTenant(headers)],   // per-request async\n    ['logger', ({ store }) => logger.child({ requestId: store.requestId })],\n  ],\n})\n```\n\n* `state` declares typed fields on `ctx.store`.\n* `decorate` attaches singletons that appear on the context.\n* `resolve` derives per-request values asynchronously during context assembly.\n\nHandlers see the assembled result — `ctx.tenant`, `ctx.logger`, `ctx.store.requestId` — all typechecked. Assembly happens once per request, during step 6, so every later stage reads the same resolved objects. See [Core Concepts: context](/docs/core-concepts/context).\n\n## Where Guards Hook In [#where-guards-hook-in]\n\nGuards run in `onBeforeHandle`, after validation. This ordering is a guarantee: a guard's `beforeHandle` receives the validated body and query, so policy checks can reason about the input the handler is about to receive. Guards also run after the middleware stack, so session and tenant are already resolved on the context.\n\n## Ordering Guarantees [#ordering-guarantees]\n\nFour guarantees are always true:\n\n* Middleware run in `src/config/app.ts > middleware` array order, before guards.\n* Guard `beforeHandle` runs after validation, with validated values available.\n* Route rules short-circuit before session load — public cached pages skip auth entirely.\n* Error mapping is the only code that can run after `onResponse`, and it only records span error attributes.\n\nThe cache short-circuit in step 5 is why public static and ISR pages can behave like static files: a cache hit never assembles the session, never runs middleware, and never reaches the handler. Anything cached must therefore be safe to serve without per-request identity.\n\n## Timing Budgets [#timing-budgets]\n\nThe pipeline is designed to be cheap at every stage. Example p50 targets for a typical list endpoint:\n\n| Stage                         | Budget                    |\n| ----------------------------- | ------------------------- |\n| Adapter to pipeline entry     | under 1 ms                |\n| Session and tenant resolve    | under 2 ms on a store hit |\n| Validation (compiled schema)  | under 0.5 ms              |\n| Handler (model list, 20 rows) | under 5 ms                |\n| Full API round-trip (local)   | under 15 ms               |\n| SSR shell (stream start)      | under 50 ms               |\n\nEach stage is a trace span, so the pipeline is observable from end to end — see [Observability](/docs/observability/tracing). The `kwiva dev` overlay renders the per-request waterfall, showing where each budget holds and where a slow query or a heavy policy sits in the sequence.\n\n## Work After the Response [#work-after-the-response]\n\nTwo patterns handle work that should not block the response:\n\n* Event emission and queue dispatch happen inside handlers transaction-aware, but acknowledge in-band — the client sees the response, the work is durable.\n* Post-response tasks can defer with `ctx.waitUntil(promise)`, which is edge-safe and keeps the connection alive only as long as the task needs.\n\n`waitUntil` is the mechanism for cleanup, metrics flushing, and best-effort work that must outlive the response with a bounded lifetime. See [Background Work](/docs/background-work) for durable, retried work like queues and jobs.\n\n## What's Next [#whats-next]\n\n1. [Middleware](/docs/http/middleware) — creating and scoping pipeline stages\n2. [Guards](/docs/http/guards) — checks that run between validation and the handler\n3. [Validation](/docs/http/validation) — the validation stage, in detail\n4. [Core Concepts: Lifecycle](/docs/core-concepts/lifecycle) — boot lifecycle and the request pipeline together\n5. [Observability](/docs/observability) — tracing every stage\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Every HTTP request in a Kwiva application flows through one ordered pipeline. The same pipeline serves API routes, rendered pages, WebSocket upgrades, and server routes. Understanding it tells you exactly when middleware, guards, validation, and your handler run — and in what order."
		},
		{
			"heading": void 0,
			"content": "The pipeline is framework-owned end to end. Its surface — middleware, guards, lifecycle events — is stable and documented; its internals are free to evolve without changing the guarantees app code relies on. This page walks the complete sequence, then the events, scoping, ordering guarantees, and timing budgets."
		},
		{
			"heading": "the-full-sequence",
			"content": "The pipeline runs fourteen ordered steps between the client and the engine writing the response:"
		},
		{
			"heading": "the-full-sequence",
			"content": "Steps 3 through 13 run inside `@kwiva/http`; steps 2 and 14 happen at the adapter boundary that normalizes incoming requests and writes the final response. Whatever runtime you deploy on — the local server, an edge worker — the normalization contract is the same: a Web `Request` in, a Web `Response` out."
		},
		{
			"heading": "lifecycle-events",
			"content": "The pipeline is expressed as eight named events that middleware and guards can hook into:"
		},
		{
			"heading": "lifecycle-events",
			"content": "Event"
		},
		{
			"heading": "lifecycle-events",
			"content": "Runs"
		},
		{
			"heading": "lifecycle-events",
			"content": "Purpose"
		},
		{
			"heading": "lifecycle-events",
			"content": "`onRequest`"
		},
		{
			"heading": "lifecycle-events",
			"content": "Entry"
		},
		{
			"heading": "lifecycle-events",
			"content": "Request ID, security headers, rate limit, CORS"
		},
		{
			"heading": "lifecycle-events",
			"content": "`onParse`"
		},
		{
			"heading": "lifecycle-events",
			"content": "Parsing"
		},
		{
			"heading": "lifecycle-events",
			"content": "Body parsing: JSON, form, multipart"
		},
		{
			"heading": "lifecycle-events",
			"content": "`onTransform`"
		},
		{
			"heading": "lifecycle-events",
			"content": "Transform"
		},
		{
			"heading": "lifecycle-events",
			"content": "Mutate parsed values before validation"
		},
		{
			"heading": "lifecycle-events",
			"content": "`onBeforeHandle`"
		},
		{
			"heading": "lifecycle-events",
			"content": "Guards"
		},
		{
			"heading": "lifecycle-events",
			"content": "Auth, tenant, policy checks"
		},
		{
			"heading": "lifecycle-events",
			"content": "`onAfterHandle`"
		},
		{
			"heading": "lifecycle-events",
			"content": "Response"
		},
		{
			"heading": "lifecycle-events",
			"content": "Response shaping, cache tags"
		},
		{
			"heading": "lifecycle-events",
			"content": "`onResponse`"
		},
		{
			"heading": "lifecycle-events",
			"content": "Completion"
		},
		{
			"heading": "lifecycle-events",
			"content": "Final headers, span close, metrics"
		},
		{
			"heading": "lifecycle-events",
			"content": "`onError`"
		},
		{
			"heading": "lifecycle-events",
			"content": "Any throw"
		},
		{
			"heading": "lifecycle-events",
			"content": "Error taxonomy mapping"
		},
		{
			"heading": "lifecycle-events",
			"content": "`onStop`"
		},
		{
			"heading": "lifecycle-events",
			"content": "Shutdown"
		},
		{
			"heading": "lifecycle-events",
			"content": "Server shutdown hooks"
		},
		{
			"heading": "lifecycle-events",
			"content": "The first six run in order for every request. `onError` runs only when a stage throws or returns an error. `onStop` fires when the server shuts down, not per request."
		},
		{
			"heading": "lifecycle-scoped-middleware",
			"content": "Middleware can attach to any event, not just the overall request/response wrapper:"
		},
		{
			"heading": "lifecycle-scoped-middleware",
			"content": "Event-scoped middleware gives you a stage without the request/response wrapper. Config arrays still reference middleware by name, and the `defineMiddleware.on` files run at their declared event in the configured order."
		},
		{
			"heading": "scoping",
			"content": "Middleware and guard hooks are scoped so shared behavior lands close to the routes it protects:"
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
			"content": "`c.get.path, handler, options` and route-level middleware arrays"
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
			"heading": "state-decorate-resolve",
			"content": "The context is assembled from three app-level declarations in `defineApp`:"
		},
		{
			"heading": "state-decorate-resolve",
			"content": "`state` declares typed fields on `ctx.store`."
		},
		{
			"heading": "state-decorate-resolve",
			"content": "`decorate` attaches singletons that appear on the context."
		},
		{
			"heading": "state-decorate-resolve",
			"content": "`resolve` derives per-request values asynchronously during context assembly."
		},
		{
			"heading": "state-decorate-resolve",
			"content": "Handlers see the assembled result — `ctx.tenant`, `ctx.logger`, `ctx.store.requestId` — all typechecked. Assembly happens once per request, during step 6, so every later stage reads the same resolved objects. See Core Concepts: context."
		},
		{
			"heading": "where-guards-hook-in",
			"content": "Guards run in `onBeforeHandle`, after validation. This ordering is a guarantee: a guard's `beforeHandle` receives the validated body and query, so policy checks can reason about the input the handler is about to receive. Guards also run after the middleware stack, so session and tenant are already resolved on the context."
		},
		{
			"heading": "ordering-guarantees",
			"content": "Four guarantees are always true:"
		},
		{
			"heading": "ordering-guarantees",
			"content": "Middleware run in `src/config/app.ts > middleware` array order, before guards."
		},
		{
			"heading": "ordering-guarantees",
			"content": "Guard `beforeHandle` runs after validation, with validated values available."
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
			"heading": "ordering-guarantees",
			"content": "The cache short-circuit in step 5 is why public static and ISR pages can behave like static files: a cache hit never assembles the session, never runs middleware, and never reaches the handler. Anything cached must therefore be safe to serve without per-request identity."
		},
		{
			"heading": "timing-budgets",
			"content": "The pipeline is designed to be cheap at every stage. Example p50 targets for a typical list endpoint:"
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
			"content": "Each stage is a trace span, so the pipeline is observable from end to end — see Observability. The `kwiva dev` overlay renders the per-request waterfall, showing where each budget holds and where a slow query or a heavy policy sits in the sequence."
		},
		{
			"heading": "work-after-the-response",
			"content": "Two patterns handle work that should not block the response:"
		},
		{
			"heading": "work-after-the-response",
			"content": "Event emission and queue dispatch happen inside handlers transaction-aware, but acknowledge in-band — the client sees the response, the work is durable."
		},
		{
			"heading": "work-after-the-response",
			"content": "Post-response tasks can defer with `ctx.waitUntil(promise)`, which is edge-safe and keeps the connection alive only as long as the task needs."
		},
		{
			"heading": "work-after-the-response",
			"content": "`waitUntil` is the mechanism for cleanup, metrics flushing, and best-effort work that must outlive the response with a bounded lifetime. See Background Work for durable, retried work like queues and jobs."
		},
		{
			"heading": "whats-next",
			"content": "Middleware — creating and scoping pipeline stages"
		},
		{
			"heading": "whats-next",
			"content": "Guards — checks that run between validation and the handler"
		},
		{
			"heading": "whats-next",
			"content": "Validation — the validation stage, in detail"
		},
		{
			"heading": "whats-next",
			"content": "Core Concepts: Lifecycle — boot lifecycle and the request pipeline together"
		},
		{
			"heading": "whats-next",
			"content": "Observability — tracing every stage"
		}
	],
	"headings": [
		{
			"id": "the-full-sequence",
			"content": "The Full Sequence"
		},
		{
			"id": "lifecycle-events",
			"content": "Lifecycle Events"
		},
		{
			"id": "lifecycle-scoped-middleware",
			"content": "Lifecycle-Scoped Middleware"
		},
		{
			"id": "scoping",
			"content": "Scoping"
		},
		{
			"id": "state-decorate-resolve",
			"content": "State, Decorate, Resolve"
		},
		{
			"id": "where-guards-hook-in",
			"content": "Where Guards Hook In"
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
		url: "#the-full-sequence",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Full Sequence" })
	},
	{
		depth: 2,
		url: "#lifecycle-events",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Lifecycle Events" })
	},
	{
		depth: 2,
		url: "#lifecycle-scoped-middleware",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Lifecycle-Scoped Middleware" })
	},
	{
		depth: 2,
		url: "#scoping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Scoping" })
	},
	{
		depth: 2,
		url: "#state-decorate-resolve",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "State, Decorate, Resolve" })
	},
	{
		depth: 2,
		url: "#where-guards-hook-in",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where Guards Hook In" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every HTTP request in a Kwiva application flows through one ordered pipeline. The same pipeline serves API routes, rendered pages, WebSocket upgrades, and server routes. Understanding it tells you exactly when middleware, guards, validation, and your handler run — and in what order." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pipeline is framework-owned end to end. Its surface — middleware, guards, lifecycle events — is stable and documented; its internals are free to evolve without changing the guarantees app code relies on. This page walks the complete sequence, then the events, scoping, ordering guarantees, and timing budgets." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-full-sequence",
			children: "The Full Sequence"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pipeline runs fourteen ordered steps between the client and the engine writing the response:" }),
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
			title: "the-full-sequence.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  1. client request" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  2. preset adapter                     → Web Request normalization" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  3. pipeline entry" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       request ID assigned              (x-request-id: set or forwarded)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       server span begins               (http method, route)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       onRequest middleware             (security headers, rate limit, CORS)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  4. route manifest match               (generated, controller, server routes)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  5. route rules apply                  (cache hit → serve + bypass pipeline)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  6. context assembly" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       parse query / parse body         (json, form, multipart)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       cookies decode, session load     (engine-agnostic store)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       tenant resolution                (domain, path, or header)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       state / decorate / resolve       (typed app context)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  7. onTransform                       → mutate parsed values" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  8. validation                        → body/query/params/headers/cookies" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  9. onBeforeHandle                    → guards: auth, tenant, policy checks" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 10. handler" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "      ├─ API route   → controller action (service → model query → response)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "      └─ page route  → SSR render (beforeLoad → loaders → stream)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 11. onAfterHandle                     → response shaping, cache tags" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 12. error path (any throw)            → taxonomy mapping → error response/page" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 13. onResponse                        → final headers, span close, metrics" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 14. engine writes response            → preset adapter" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Steps 3 through 13 run inside ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
			"; steps 2 and 14 happen at the adapter boundary that normalizes incoming requests and writes the final response. Whatever runtime you deploy on — the local server, an edge worker — the normalization contract is the same: a Web ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Request" }),
			" in, a Web ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Response" }),
			" out."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "lifecycle-events",
			children: "Lifecycle Events"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pipeline is expressed as eight named events that middleware and guards can hook into:" }),
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
			" fires when the server shuts down, not per request."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "lifecycle-scoped-middleware",
			children: "Lifecycle-Scoped Middleware"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Middleware can attach to any event, not just the overall request/response wrapper:" }),
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
			title: "lifecycle-scoped-middleware.ts",
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
			title: "lifecycle-scoped-middleware-2.ts",
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Event-scoped middleware gives you a stage without the request/response wrapper. Config arrays still reference middleware by name, and the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMiddleware.on" }),
			" files run at their declared event in the configured order."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "scoping",
			children: "Scoping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Middleware and guard hooks are scoped so shared behavior lands close to the routes it protects:" }),
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "c.get.path, handler, options" }), " and route-level middleware arrays"] }),
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
			id: "state-decorate-resolve",
			children: "State, Decorate, Resolve"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The context is assembled from three app-level declarations in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
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
			title: "state-decorate-resolve.ts",
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
							children: " defineApp"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({"
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
							children: "  state: { startTime: Date."
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
							children: "() },          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// app-wide mutable store types"
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
							children: "  decorate: { client: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "createClient"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "() },      "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// singletons available on ctx"
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
						children: "  resolve: ["
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
							children: "    ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'tenant'"
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
							children: " ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "headers"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }) "
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " resolveTenant"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(headers)],   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// per-request async"
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
							children: "    ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'logger'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "store"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }) "
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
							children: " logger."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "child"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ requestId: store.requestId })],"
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
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "state" }),
				" declares typed fields on ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.store" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "decorate" }), " attaches singletons that appear on the context."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "resolve" }), " derives per-request values asynchronously during context assembly."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Handlers see the assembled result — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.tenant" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.logger" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.store.requestId" }),
			" — all typechecked. Assembly happens once per request, during step 6, so every later stage reads the same resolved objects. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/context",
				children: "Core Concepts: context"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-guards-hook-in",
			children: "Where Guards Hook In"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Guards run in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onBeforeHandle" }),
			", after validation. This ordering is a guarantee: a guard's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeHandle" }),
			" receives the validated body and query, so policy checks can reason about the input the handler is about to receive. Guards also run after the middleware stack, so session and tenant are already resolved on the context."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "ordering-guarantees",
			children: "Ordering Guarantees"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Four guarantees are always true:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Middleware run in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts > middleware" }),
				" array order, before guards."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Guard ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeHandle" }),
				" runs after validation, with validated values available."
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The cache short-circuit in step 5 is why public static and ISR pages can behave like static files: a cache hit never assembles the session, never runs middleware, and never reaches the handler. Anything cached must therefore be safe to serve without per-request identity." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "timing-budgets",
			children: "Timing Budgets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pipeline is designed to be cheap at every stage. Example p50 targets for a typical list endpoint:" }),
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
			"Each stage is a trace span, so the pipeline is observable from end to end — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Observability"
			}),
			". The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" overlay renders the per-request waterfall, showing where each budget holds and where a slow query or a heavy policy sits in the sequence."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "work-after-the-response",
			children: "Work After the Response"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two patterns handle work that should not block the response:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Event emission and queue dispatch happen inside handlers transaction-aware, but acknowledge in-band — the client sees the response, the work is durable." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Post-response tasks can defer with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.waitUntil(promise)" }),
				", which is edge-safe and keeps the connection alive only as long as the task needs."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "waitUntil" }),
			" is the mechanism for cleanup, metrics flushing, and best-effort work that must outlive the response with a bounded lifetime. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work",
				children: "Background Work"
			}),
			" for durable, retried work like queues and jobs."
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
				href: "/docs/http/middleware",
				children: "Middleware"
			}), " — creating and scoping pipeline stages"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/guards",
				children: "Guards"
			}), " — checks that run between validation and the handler"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/validation",
				children: "Validation"
			}), " — the validation stage, in detail"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/lifecycle",
				children: "Core Concepts: Lifecycle"
			}), " — boot lifecycle and the request pipeline together"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}), " — tracing every stage"] }),
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
