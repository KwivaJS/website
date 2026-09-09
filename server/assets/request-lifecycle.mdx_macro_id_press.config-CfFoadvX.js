import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/architecture/request-lifecycle.mdx?macro_id=press.config.tsx%23architecture
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Request Lifecycle",
	"description": "One request, end to end — the ordered 14-step contract that middleware, guards, validation, and handlers rely on."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nEvery request that enters a Kwiva application crosses a strict, ordered pipeline. The order matters: middleware run before guards, validation runs before handlers, cache rules short-circuit before session loading. Understanding the sequence tells you *where* to hook in and *why* things behave the way they do.\n\n## The Full Sequence [#the-full-sequence]\n\n```plaintext title=\"the-full-sequence.txt\"\n 1. client request\n 2. runtime preset adapter            → Web Request normalization\n 3. framework HTTP pipeline entry\n 3.1  requestId assigned             (x-request-id: set or forwarded)\n 3.2  tracing span begins            (http {method, route})\n 3.3  onRequest middleware           (security headers, rate limit, CORS)\n 4. routing\n 4.1  route manifest match           (generated model routes, controllers, server routes)\n 4.2  route rules apply              (cache hit? → serve + bypass pipeline)\n 5. context assembly\n 5.1  parse query / parse body       (json, form, multipart)\n 5.2  cookies decoded, session load  (auth engine, database/redis store)\n 5.3  tenant resolution              (domain/path/header → ctx.tenant)\n 5.4  state/decorate/resolve         (typed app context)\n 6. onTransform middleware           (mutate parsed values)\n 7. validation                       (body/query/params/headers/cookies schemas)\n 8. onBeforeHandle                   (guards: requireAuth, policy check)\n 9. handler\n    ├─ API route  → controller action (service → model query → response object)\n    └─ page route → SSR render (beforeLoad → loaders → stream)\n10. onAfterHandle                    (response shaping, cache tags set)\n11. error path (any throw)           → taxonomy mapping → error response / error page\n12. onResponse                       (final headers, span close, metrics)\n13. engine writes response           (preset adapter)\n```\n\n### 1–3. Entry and pipeline start [#13-entry-and-pipeline-start]\n\nThe runtime preset adapter normalizes the incoming request into a standard Web `Request`. The framework assigns a request ID, opens a tracing span, and runs `onRequest` middleware — security headers, rate limiting, and CORS happen here, before any routing.\n\n### 4. Routing and route rules [#4-routing-and-route-rules]\n\nThe route manifest matches the request — a generated model route, a controller action, or a server route. Then route rules apply: if the path is cached (`cache`, `swr`, `isr`, `static`), the response is served directly and the rest of the pipeline is bypassed. This is why public cached pages skip auth entirely.\n\n### 5. Context assembly [#5-context-assembly]\n\nThe typed request context is built: query and body are parsed, cookies are decoded and the session is loaded, the tenant is resolved, and application state is derived via `state`/`decorate`/`resolve`. Everything the handler will need is available and typed.\n\n### 6–8. Transform, validate, guard [#68-transform-validate-guard]\n\n`onTransform` middleware can mutate parsed values. Then validation runs against the declared schemas — body, query, params, headers, cookies — compiled once for speed. Guards (`requireAuth`, policy checks) run *after* validation, so validated data is available to authorization logic.\n\n### 9. Handler [#9-handler]\n\nThe request reaches its handler. API routes call a controller action (service → model query → response object); page routes enter the SSR render path (`beforeLoad` → loaders → streamed HTML).\n\n### 10–13. Response and error path [#1013-response-and-error-path]\n\n`onAfterHandle` shapes the response and sets cache tags. Any thrown error enters the taxonomy mapping and becomes a typed error response or error page. `onResponse` finalizes headers, closes the tracing span, and records metrics. The engine writes the response through the preset adapter.\n\n## Timing Budgets [#timing-budgets]\n\nTargets for a representative application (p50):\n\n| Stage                         | Budget                      |\n| ----------------------------- | --------------------------- |\n| adapter → pipeline entry      | \\< 1 ms                     |\n| session + tenant resolve      | \\< 2 ms (db/redis hit)      |\n| validation                    | \\< 0.5 ms (schema compiled) |\n| handler (model list, 20 rows) | \\< 5 ms                     |\n| full API round-trip (local)   | \\< 15 ms                    |\n| SSR shell (stream start)      | \\< 50 ms                    |\n\nEach stage is a tracing span, so the development overlay can show the full waterfall for any request.\n\n## Ordering Guarantees [#ordering-guarantees]\n\n* Middleware run in `src/config/app.ts > middleware[]` order, **before** guards.\n* Guard `beforeHandle` runs **after** validation — the validated body is available for policy checks.\n* Cache and route rules short-circuit **before** session load; public ISR pages skip auth entirely.\n* Error mapping is the only code that can run after `onResponse` (it annotates the span with error attributes).\n\n## Session & Tenant Propagation [#session--tenant-propagation]\n\n* The session ID (cookie) is resolved through an engine-agnostic session store and exposed as typed `ctx.session`.\n* The tenant resolution strategy (`subdomain`, `path`, `header`, or `fixed` for single-tenant apps) is configured in `src/config/tenancy.ts`.\n* The resolved tenant is injected everywhere it matters: model query scoping, cache keys, storage prefixes, queue payloads, and log/trace attributes.\n\n## Background Work After Response [#background-work-after-response]\n\nEvents and queue dispatch happen inside handlers and acknowledge in-band (transaction-aware). For post-response work, `ctx.waitUntil(promise)` schedules work after the response — edge-safe and available on every preset.\n\n## What to Read Next [#what-to-read-next]\n\n* [HTTP Lifecycle](/docs/http/lifecycle) — The same sequence from the HTTP package's perspective\n* [Core Concepts: Lifecycle](/docs/core-concepts/lifecycle) — Boot lifecycle and hook points\n* [Tenancy](/docs/tenancy) — How tenant resolution and scoping fit the flow\n* [Observability](/docs/observability) — Spans, logs, and metrics along the path\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Every request that enters a Kwiva application crosses a strict, ordered pipeline. The order matters: middleware run before guards, validation runs before handlers, cache rules short-circuit before session loading. Understanding the sequence tells you *where* to hook in and *why* things behave the way they do."
		},
		{
			"heading": "13-entry-and-pipeline-start",
			"content": "The runtime preset adapter normalizes the incoming request into a standard Web `Request`. The framework assigns a request ID, opens a tracing span, and runs `onRequest` middleware — security headers, rate limiting, and CORS happen here, before any routing."
		},
		{
			"heading": "4-routing-and-route-rules",
			"content": "The route manifest matches the request — a generated model route, a controller action, or a server route. Then route rules apply: if the path is cached (`cache`, `swr`, `isr`, `static`), the response is served directly and the rest of the pipeline is bypassed. This is why public cached pages skip auth entirely."
		},
		{
			"heading": "5-context-assembly",
			"content": "The typed request context is built: query and body are parsed, cookies are decoded and the session is loaded, the tenant is resolved, and application state is derived via `state`/`decorate`/`resolve`. Everything the handler will need is available and typed."
		},
		{
			"heading": "68-transform-validate-guard",
			"content": "`onTransform` middleware can mutate parsed values. Then validation runs against the declared schemas — body, query, params, headers, cookies — compiled once for speed. Guards (`requireAuth`, policy checks) run *after* validation, so validated data is available to authorization logic."
		},
		{
			"heading": "9-handler",
			"content": "The request reaches its handler. API routes call a controller action (service → model query → response object); page routes enter the SSR render path (`beforeLoad` → loaders → streamed HTML)."
		},
		{
			"heading": "1013-response-and-error-path",
			"content": "`onAfterHandle` shapes the response and sets cache tags. Any thrown error enters the taxonomy mapping and becomes a typed error response or error page. `onResponse` finalizes headers, closes the tracing span, and records metrics. The engine writes the response through the preset adapter."
		},
		{
			"heading": "timing-budgets",
			"content": "Targets for a representative application (p50):"
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
			"content": "adapter → pipeline entry"
		},
		{
			"heading": "timing-budgets",
			"content": "\\< 1 ms"
		},
		{
			"heading": "timing-budgets",
			"content": "session + tenant resolve"
		},
		{
			"heading": "timing-budgets",
			"content": "\\< 2 ms (db/redis hit)"
		},
		{
			"heading": "timing-budgets",
			"content": "validation"
		},
		{
			"heading": "timing-budgets",
			"content": "\\< 0.5 ms (schema compiled)"
		},
		{
			"heading": "timing-budgets",
			"content": "handler (model list, 20 rows)"
		},
		{
			"heading": "timing-budgets",
			"content": "\\< 5 ms"
		},
		{
			"heading": "timing-budgets",
			"content": "full API round-trip (local)"
		},
		{
			"heading": "timing-budgets",
			"content": "\\< 15 ms"
		},
		{
			"heading": "timing-budgets",
			"content": "SSR shell (stream start)"
		},
		{
			"heading": "timing-budgets",
			"content": "\\< 50 ms"
		},
		{
			"heading": "timing-budgets",
			"content": "Each stage is a tracing span, so the development overlay can show the full waterfall for any request."
		},
		{
			"heading": "ordering-guarantees",
			"content": "Middleware run in `src/config/app.ts > middleware[]` order, **before** guards."
		},
		{
			"heading": "ordering-guarantees",
			"content": "Guard `beforeHandle` runs **after** validation — the validated body is available for policy checks."
		},
		{
			"heading": "ordering-guarantees",
			"content": "Cache and route rules short-circuit **before** session load; public ISR pages skip auth entirely."
		},
		{
			"heading": "ordering-guarantees",
			"content": "Error mapping is the only code that can run after `onResponse` (it annotates the span with error attributes)."
		},
		{
			"heading": "session--tenant-propagation",
			"content": "The session ID (cookie) is resolved through an engine-agnostic session store and exposed as typed `ctx.session`."
		},
		{
			"heading": "session--tenant-propagation",
			"content": "The tenant resolution strategy (`subdomain`, `path`, `header`, or `fixed` for single-tenant apps) is configured in `src/config/tenancy.ts`."
		},
		{
			"heading": "session--tenant-propagation",
			"content": "The resolved tenant is injected everywhere it matters: model query scoping, cache keys, storage prefixes, queue payloads, and log/trace attributes."
		},
		{
			"heading": "background-work-after-response",
			"content": "Events and queue dispatch happen inside handlers and acknowledge in-band (transaction-aware). For post-response work, `ctx.waitUntil(promise)` schedules work after the response — edge-safe and available on every preset."
		},
		{
			"heading": "what-to-read-next",
			"content": "HTTP Lifecycle — The same sequence from the HTTP package's perspective"
		},
		{
			"heading": "what-to-read-next",
			"content": "Core Concepts: Lifecycle — Boot lifecycle and hook points"
		},
		{
			"heading": "what-to-read-next",
			"content": "Tenancy — How tenant resolution and scoping fit the flow"
		},
		{
			"heading": "what-to-read-next",
			"content": "Observability — Spans, logs, and metrics along the path"
		}
	],
	"headings": [
		{
			"id": "the-full-sequence",
			"content": "The Full Sequence"
		},
		{
			"id": "13-entry-and-pipeline-start",
			"content": "1–3. Entry and pipeline start"
		},
		{
			"id": "4-routing-and-route-rules",
			"content": "4\\. Routing and route rules"
		},
		{
			"id": "5-context-assembly",
			"content": "5\\. Context assembly"
		},
		{
			"id": "68-transform-validate-guard",
			"content": "6–8. Transform, validate, guard"
		},
		{
			"id": "9-handler",
			"content": "9\\. Handler"
		},
		{
			"id": "1013-response-and-error-path",
			"content": "10–13. Response and error path"
		},
		{
			"id": "timing-budgets",
			"content": "Timing Budgets"
		},
		{
			"id": "ordering-guarantees",
			"content": "Ordering Guarantees"
		},
		{
			"id": "session--tenant-propagation",
			"content": "Session & Tenant Propagation"
		},
		{
			"id": "background-work-after-response",
			"content": "Background Work After Response"
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
		url: "#the-full-sequence",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Full Sequence" })
	},
	{
		depth: 3,
		url: "#13-entry-and-pipeline-start",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "1–3. Entry and pipeline start" })
	},
	{
		depth: 3,
		url: "#4-routing-and-route-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "4. Routing and route rules" })
	},
	{
		depth: 3,
		url: "#5-context-assembly",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "5. Context assembly" })
	},
	{
		depth: 3,
		url: "#68-transform-validate-guard",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "6–8. Transform, validate, guard" })
	},
	{
		depth: 3,
		url: "#9-handler",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "9. Handler" })
	},
	{
		depth: 3,
		url: "#1013-response-and-error-path",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "10–13. Response and error path" })
	},
	{
		depth: 2,
		url: "#timing-budgets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Timing Budgets" })
	},
	{
		depth: 2,
		url: "#ordering-guarantees",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Ordering Guarantees" })
	},
	{
		depth: 2,
		url: "#session--tenant-propagation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Session & Tenant Propagation" })
	},
	{
		depth: 2,
		url: "#background-work-after-response",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Background Work After Response" })
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
		em: "em",
		h2: "h2",
		h3: "h3",
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every request that enters a Kwiva application crosses a strict, ordered pipeline. The order matters: middleware run before guards, validation runs before handlers, cache rules short-circuit before session loading. Understanding the sequence tells you ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "where" }),
			" to hook in and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "why" }),
			" things behave the way they do."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-full-sequence",
			children: "The Full Sequence"
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
			title: "the-full-sequence.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 1. client request" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 2. runtime preset adapter            → Web Request normalization" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 3. framework HTTP pipeline entry" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 3.1  requestId assigned             (x-request-id: set or forwarded)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 3.2  tracing span begins            (http {method, route})" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 3.3  onRequest middleware           (security headers, rate limit, CORS)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 4. routing" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 4.1  route manifest match           (generated model routes, controllers, server routes)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 4.2  route rules apply              (cache hit? → serve + bypass pipeline)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 5. context assembly" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 5.1  parse query / parse body       (json, form, multipart)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 5.2  cookies decoded, session load  (auth engine, database/redis store)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 5.3  tenant resolution              (domain/path/header → ctx.tenant)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 5.4  state/decorate/resolve         (typed app context)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 6. onTransform middleware           (mutate parsed values)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 7. validation                       (body/query/params/headers/cookies schemas)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 8. onBeforeHandle                   (guards: requireAuth, policy check)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 9. handler" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    ├─ API route  → controller action (service → model query → response object)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    └─ page route → SSR render (beforeLoad → loaders → stream)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "10. onAfterHandle                    (response shaping, cache tags set)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "11. error path (any throw)           → taxonomy mapping → error response / error page" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "12. onResponse                       (final headers, span close, metrics)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "13. engine writes response           (preset adapter)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "13-entry-and-pipeline-start",
			children: "1–3. Entry and pipeline start"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The runtime preset adapter normalizes the incoming request into a standard Web ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Request" }),
			". The framework assigns a request ID, opens a tracing span, and runs ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onRequest" }),
			" middleware — security headers, rate limiting, and CORS happen here, before any routing."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "4-routing-and-route-rules",
			children: "4. Routing and route rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The route manifest matches the request — a generated model route, a controller action, or a server route. Then route rules apply: if the path is cached (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			"), the response is served directly and the rest of the pipeline is bypassed. This is why public cached pages skip auth entirely."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "5-context-assembly",
			children: "5. Context assembly"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The typed request context is built: query and body are parsed, cookies are decoded and the session is loaded, the tenant is resolved, and application state is derived via ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "state" }),
			"/",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "decorate" }),
			"/",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "resolve" }),
			". Everything the handler will need is available and typed."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "68-transform-validate-guard",
			children: "6–8. Transform, validate, guard"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onTransform" }),
			" middleware can mutate parsed values. Then validation runs against the declared schemas — body, query, params, headers, cookies — compiled once for speed. Guards (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requireAuth" }),
			", policy checks) run ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "after" }),
			" validation, so validated data is available to authorization logic."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "9-handler",
			children: "9. Handler"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The request reaches its handler. API routes call a controller action (service → model query → response object); page routes enter the SSR render path (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
			" → loaders → streamed HTML)."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "1013-response-and-error-path",
			children: "10–13. Response and error path"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onAfterHandle" }),
			" shapes the response and sets cache tags. Any thrown error enters the taxonomy mapping and becomes a typed error response or error page. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onResponse" }),
			" finalizes headers, closes the tracing span, and records metrics. The engine writes the response through the preset adapter."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "timing-budgets",
			children: "Timing Budgets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Targets for a representative application (p50):" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Stage" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Budget" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "adapter → pipeline entry" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "< 1 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "session + tenant resolve" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "< 2 ms (db/redis hit)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "validation" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "< 0.5 ms (schema compiled)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "handler (model list, 20 rows)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "< 5 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "full API round-trip (local)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "< 15 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR shell (stream start)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "< 50 ms" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each stage is a tracing span, so the development overlay can show the full waterfall for any request." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "ordering-guarantees",
			children: "Ordering Guarantees"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Middleware run in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts > middleware[]" }),
				" order, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "before" }),
				" guards."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Guard ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeHandle" }),
				" runs ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "after" }),
				" validation — the validated body is available for policy checks."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Cache and route rules short-circuit ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "before" }),
				" session load; public ISR pages skip auth entirely."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Error mapping is the only code that can run after ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onResponse" }),
				" (it annotates the span with error attributes)."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "session--tenant-propagation",
			children: "Session & Tenant Propagation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The session ID (cookie) is resolved through an engine-agnostic session store and exposed as typed ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The tenant resolution strategy (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "subdomain" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "path" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "header" }),
				", or ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fixed" }),
				" for single-tenant apps) is configured in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/tenancy.ts" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The resolved tenant is injected everywhere it matters: model query scoping, cache keys, storage prefixes, queue payloads, and log/trace attributes." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "background-work-after-response",
			children: "Background Work After Response"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Events and queue dispatch happen inside handlers and acknowledge in-band (transaction-aware). For post-response work, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.waitUntil(promise)" }),
			" schedules work after the response — edge-safe and available on every preset."
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
				href: "/docs/http/lifecycle",
				children: "HTTP Lifecycle"
			}), " — The same sequence from the HTTP package's perspective"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/lifecycle",
				children: "Core Concepts: Lifecycle"
			}), " — Boot lifecycle and hook points"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy",
				children: "Tenancy"
			}), " — How tenant resolution and scoping fit the flow"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}), " — Spans, logs, and metrics along the path"] }),
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
