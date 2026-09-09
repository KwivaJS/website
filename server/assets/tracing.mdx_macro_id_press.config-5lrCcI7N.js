import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/observability/tracing.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Tracing",
	"description": "A span tree for every request, model query, job, task, and event — correlated with logs and exported to a collector."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nEvery request handled by Kwiva produces a tree of trace spans automatically. The tracing runtime wraps the framework's own machinery — middleware, validation, controllers, model queries, cache lookups, and responses — so you get a full picture of where time goes without adding a single span by hand.\n\n## One Tree per Request [#one-tree-per-request]\n\nA typical request produces a shape like this:\n\n```text title=\"one-tree-per-request.txt\"\nhttp GET /api/posts (server)\n ├─ middleware.request-id\n ├─ middleware.session\n ├─ middleware.tenant\n ├─ validation (route schema)\n ├─ controller posts.list\n │   └─ model posts.query (sql + params normalized)\n ├─ cache.get posts:...\n └─ http.response (status, size)\n```\n\nEach span nests inside the one before it. The `controller posts.list` span, for instance, contains every model query it performed, and the query spans carry normalized SQL and redacted parameters — never raw values. The tree is the request's actual cost accounting, in order.\n\n## What Gets Spans [#what-gets-spans]\n\nSpans are not limited to HTTP. Every unit of work the framework owns is traced on the same runtime:\n\n| Work           | Spans produced                                                     |\n| -------------- | ------------------------------------------------------------------ |\n| Requests       | Middleware chain, validation, controller, queries, cache, response |\n| Jobs           | Dispatch to run, including retry attempts                          |\n| Tasks          | Scheduled task execution                                           |\n| Events         | Emit to listener for every registered listener                     |\n| MCP tool calls | Tool invocation and input validation                               |\n| SSR renders    | Loader, render, and stream stages                                  |\n\nBreadth like this is what makes tracing useful: a user reporting a slow page, a job that deadlocks, or an event handler that drags can all be traced through the same runtime and queried the same way.\n\n## Reading a Tree [#reading-a-tree]\n\nThe tree's shape is its explanation. A request that spends 900 milliseconds total with 800 of them inside `model posts.query` is a query problem, not a routing problem — the span tree says which layer owns the time. Retries within a job render as repeated attempt spans under the same job root, so a job that succeeds on the third try tells a complete story instead of a single ambiguous duration.\n\n## Model Query Spans [#model-query-spans]\n\nEvery query builder call is traced with two attributes that matter in production:\n\n* Normalized SQL — the query template, not the interpolated values\n* Redacted parameters — bound values are scrubbed before they reach a span\n\nThis is a deliberate PII and secret-safety decision. Trace data stays useful for debugging while never shipping full-text values or credentials to your collector. Query spans carry the model and operation as well, which makes them directly joinable to the metric series (`model_queries_total`, `model_query_duration`) on [Metrics](/docs/observability/metrics).\n\n## Custom Spans [#custom-spans]\n\nWhen you need a span for work that lives outside the framework boundaries, the same tracing runtime is exported for app code:\n\n```ts title=\"custom-spans.ts\"\nimport { trace } from '@kwiva/core'\n\nawait trace('billing.recalc', async (span) => {\n  span.setAttr('tenantId', tenant.id)\n  // ... your logic\n})\n```\n\nCustom spans nest inside the current request or job span automatically, so they join the existing tree instead of floating in isolation.\n\n> \\[!TIP]\n> Wrap anything long-running or externally observable — gateway calls, report generation, cache warming — in `trace`. A span that exists costs nothing when no exporter is configured, and it pays off the first time the operation is slow and you have to explain where the time went.\n\n## Distributed Context [#distributed-context]\n\nCorrelation IDs are the glue between tracing and logging. Within any scope, every log line carries `traceId` and `spanId` alongside `requestId`, and context propagates across framework hops — a request that dispatches a job, an event that triggers a listener, a page that streams a query all stay in one trace. To walk a failing request end to end:\n\n1. Get the `requestId` from the error report or the `x-request-id` header.\n2. Pull every log line with that `requestId` from your log store.\n3. Enlarge to `traceId` to include spans from background workers and event listeners.\n\nThe trace context follows the OpenTelemetry contract and the W3C trace context propagation standard, so a trace that hops a service boundary — outbound to a gateway, a worker, or a hosted render — carries the same identifiers to whatever honors the standard.\n\n## Sampling [#sampling]\n\nTrace data is collected at a configurable rate, applied at the root span so every descendant of a sampled request is exported as a complete tree — you never get a half-tree from mixed sampling decisions.\n\n* Development samples everything (`1.0`) so the dev overlay and local debugging are complete.\n* Production guidance is `0.1` — enough to detect latency regressions and failure spikes while keeping export volume manageable.\n* Errors are always sampled: a failing request is the one you want to see, independent of the roll of the dice.\n\nSampling affects collection, not metrics — metric series are aggregated and effectively always-on regardless of the trace sample rate.\n\n## Health Endpoints [#health-endpoints]\n\nTwo health endpoints ship with every application:\n\n* `/healthz` — liveness. Returns OK when the process is up.\n* `/readyz` — readiness. Pings the database, the queue, and storage, and returns OK only when all configured dependencies respond.\n\nReadiness checks are the correct target for orchestrators and load balancers; liveness is the correct target for process supervisors. Load balancers that add an instance before it is ready — or keep one that has lost its queue — get a definitive signal instead of timing out.\n\n## Configuration [#configuration]\n\nTelemetry configuration lives in `src/config/telemetry.ts`:\n\n```ts title=\"configuration.ts\"\nexport default defineConfig('telemetry', {\n  defaults: {\n    sampleRate: 1.0,          // dev 1.0; production guidance 0.1\n    exporters: { otlp: { endpoint: 'http://collector:4318' } },\n    logs: { level: 'info', pretty: true },   // dev\n    metrics: { interval: 10_000 },\n  },\n})\n```\n\nTwo settings matter most in production:\n\n* **`sampleRate`** — trace every request in development (`1.0`) and a fraction of traffic in production (guidance `0.1`). Sampling is applied at the root span so every descendant of a sampled request is exported as a complete tree.\n* **`exporters`** — data is exported over HTTP to a collector-compatible endpoint. With no exporters configured, tracing degrades to a no-op with negligible overhead.\n\nExporter failures never break the app: errors are swallowed and counted, which is the framework's standing principle that observability must not become a dependency of uptime.\n\n## What's Next [#whats-next]\n\n* [Logging](/docs/observability/logging) — how log lines attach to the same trace IDs\n* [Metrics](/docs/observability/metrics) — the counters and durations recorded alongside spans\n* [Dev Overlay](/docs/observability/dev-overlay) — see span waterfalls while developing\n* [Configuration](/docs/core-concepts/configuration) — how `defineConfig` modules and inline options work\n* [Production Checklist](/docs/deployment/production-checklist) — sampling and exporter settings before you ship\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Every request handled by Kwiva produces a tree of trace spans automatically. The tracing runtime wraps the framework's own machinery — middleware, validation, controllers, model queries, cache lookups, and responses — so you get a full picture of where time goes without adding a single span by hand."
		},
		{
			"heading": "one-tree-per-request",
			"content": "A typical request produces a shape like this:"
		},
		{
			"heading": "one-tree-per-request",
			"content": "Each span nests inside the one before it. The `controller posts.list` span, for instance, contains every model query it performed, and the query spans carry normalized SQL and redacted parameters — never raw values. The tree is the request's actual cost accounting, in order."
		},
		{
			"heading": "what-gets-spans",
			"content": "Spans are not limited to HTTP. Every unit of work the framework owns is traced on the same runtime:"
		},
		{
			"heading": "what-gets-spans",
			"content": "Work"
		},
		{
			"heading": "what-gets-spans",
			"content": "Spans produced"
		},
		{
			"heading": "what-gets-spans",
			"content": "Requests"
		},
		{
			"heading": "what-gets-spans",
			"content": "Middleware chain, validation, controller, queries, cache, response"
		},
		{
			"heading": "what-gets-spans",
			"content": "Jobs"
		},
		{
			"heading": "what-gets-spans",
			"content": "Dispatch to run, including retry attempts"
		},
		{
			"heading": "what-gets-spans",
			"content": "Tasks"
		},
		{
			"heading": "what-gets-spans",
			"content": "Scheduled task execution"
		},
		{
			"heading": "what-gets-spans",
			"content": "Events"
		},
		{
			"heading": "what-gets-spans",
			"content": "Emit to listener for every registered listener"
		},
		{
			"heading": "what-gets-spans",
			"content": "MCP tool calls"
		},
		{
			"heading": "what-gets-spans",
			"content": "Tool invocation and input validation"
		},
		{
			"heading": "what-gets-spans",
			"content": "SSR renders"
		},
		{
			"heading": "what-gets-spans",
			"content": "Loader, render, and stream stages"
		},
		{
			"heading": "what-gets-spans",
			"content": "Breadth like this is what makes tracing useful: a user reporting a slow page, a job that deadlocks, or an event handler that drags can all be traced through the same runtime and queried the same way."
		},
		{
			"heading": "reading-a-tree",
			"content": "The tree's shape is its explanation. A request that spends 900 milliseconds total with 800 of them inside `model posts.query` is a query problem, not a routing problem — the span tree says which layer owns the time. Retries within a job render as repeated attempt spans under the same job root, so a job that succeeds on the third try tells a complete story instead of a single ambiguous duration."
		},
		{
			"heading": "model-query-spans",
			"content": "Every query builder call is traced with two attributes that matter in production:"
		},
		{
			"heading": "model-query-spans",
			"content": "Normalized SQL — the query template, not the interpolated values"
		},
		{
			"heading": "model-query-spans",
			"content": "Redacted parameters — bound values are scrubbed before they reach a span"
		},
		{
			"heading": "model-query-spans",
			"content": "This is a deliberate PII and secret-safety decision. Trace data stays useful for debugging while never shipping full-text values or credentials to your collector. Query spans carry the model and operation as well, which makes them directly joinable to the metric series (`model_queries_total`, `model_query_duration`) on Metrics."
		},
		{
			"heading": "custom-spans",
			"content": "When you need a span for work that lives outside the framework boundaries, the same tracing runtime is exported for app code:"
		},
		{
			"heading": "custom-spans",
			"content": "Custom spans nest inside the current request or job span automatically, so they join the existing tree instead of floating in isolation."
		},
		{
			"heading": "custom-spans",
			"content": "> \\[!TIP]\n> Wrap anything long-running or externally observable — gateway calls, report generation, cache warming — in `trace`. A span that exists costs nothing when no exporter is configured, and it pays off the first time the operation is slow and you have to explain where the time went."
		},
		{
			"heading": "distributed-context",
			"content": "Correlation IDs are the glue between tracing and logging. Within any scope, every log line carries `traceId` and `spanId` alongside `requestId`, and context propagates across framework hops — a request that dispatches a job, an event that triggers a listener, a page that streams a query all stay in one trace. To walk a failing request end to end:"
		},
		{
			"heading": "distributed-context",
			"content": "Get the `requestId` from the error report or the `x-request-id` header."
		},
		{
			"heading": "distributed-context",
			"content": "Pull every log line with that `requestId` from your log store."
		},
		{
			"heading": "distributed-context",
			"content": "Enlarge to `traceId` to include spans from background workers and event listeners."
		},
		{
			"heading": "distributed-context",
			"content": "The trace context follows the OpenTelemetry contract and the W3C trace context propagation standard, so a trace that hops a service boundary — outbound to a gateway, a worker, or a hosted render — carries the same identifiers to whatever honors the standard."
		},
		{
			"heading": "sampling",
			"content": "Trace data is collected at a configurable rate, applied at the root span so every descendant of a sampled request is exported as a complete tree — you never get a half-tree from mixed sampling decisions."
		},
		{
			"heading": "sampling",
			"content": "Development samples everything (`1.0`) so the dev overlay and local debugging are complete."
		},
		{
			"heading": "sampling",
			"content": "Production guidance is `0.1` — enough to detect latency regressions and failure spikes while keeping export volume manageable."
		},
		{
			"heading": "sampling",
			"content": "Errors are always sampled: a failing request is the one you want to see, independent of the roll of the dice."
		},
		{
			"heading": "sampling",
			"content": "Sampling affects collection, not metrics — metric series are aggregated and effectively always-on regardless of the trace sample rate."
		},
		{
			"heading": "health-endpoints",
			"content": "Two health endpoints ship with every application:"
		},
		{
			"heading": "health-endpoints",
			"content": "`/healthz` — liveness. Returns OK when the process is up."
		},
		{
			"heading": "health-endpoints",
			"content": "`/readyz` — readiness. Pings the database, the queue, and storage, and returns OK only when all configured dependencies respond."
		},
		{
			"heading": "health-endpoints",
			"content": "Readiness checks are the correct target for orchestrators and load balancers; liveness is the correct target for process supervisors. Load balancers that add an instance before it is ready — or keep one that has lost its queue — get a definitive signal instead of timing out."
		},
		{
			"heading": "configuration",
			"content": "Telemetry configuration lives in `src/config/telemetry.ts`:"
		},
		{
			"heading": "configuration",
			"content": "Two settings matter most in production:"
		},
		{
			"heading": "configuration",
			"content": "**`sampleRate`** — trace every request in development (`1.0`) and a fraction of traffic in production (guidance `0.1`). Sampling is applied at the root span so every descendant of a sampled request is exported as a complete tree."
		},
		{
			"heading": "configuration",
			"content": "**`exporters`** — data is exported over HTTP to a collector-compatible endpoint. With no exporters configured, tracing degrades to a no-op with negligible overhead."
		},
		{
			"heading": "configuration",
			"content": "Exporter failures never break the app: errors are swallowed and counted, which is the framework's standing principle that observability must not become a dependency of uptime."
		},
		{
			"heading": "whats-next",
			"content": "Logging — how log lines attach to the same trace IDs"
		},
		{
			"heading": "whats-next",
			"content": "Metrics — the counters and durations recorded alongside spans"
		},
		{
			"heading": "whats-next",
			"content": "Dev Overlay — see span waterfalls while developing"
		},
		{
			"heading": "whats-next",
			"content": "Configuration — how `defineConfig` modules and inline options work"
		},
		{
			"heading": "whats-next",
			"content": "Production Checklist — sampling and exporter settings before you ship"
		}
	],
	"headings": [
		{
			"id": "one-tree-per-request",
			"content": "One Tree per Request"
		},
		{
			"id": "what-gets-spans",
			"content": "What Gets Spans"
		},
		{
			"id": "reading-a-tree",
			"content": "Reading a Tree"
		},
		{
			"id": "model-query-spans",
			"content": "Model Query Spans"
		},
		{
			"id": "custom-spans",
			"content": "Custom Spans"
		},
		{
			"id": "distributed-context",
			"content": "Distributed Context"
		},
		{
			"id": "sampling",
			"content": "Sampling"
		},
		{
			"id": "health-endpoints",
			"content": "Health Endpoints"
		},
		{
			"id": "configuration",
			"content": "Configuration"
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
		url: "#one-tree-per-request",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One Tree per Request" })
	},
	{
		depth: 2,
		url: "#what-gets-spans",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Gets Spans" })
	},
	{
		depth: 2,
		url: "#reading-a-tree",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Reading a Tree" })
	},
	{
		depth: 2,
		url: "#model-query-spans",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Model Query Spans" })
	},
	{
		depth: 2,
		url: "#custom-spans",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Custom Spans" })
	},
	{
		depth: 2,
		url: "#distributed-context",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Distributed Context" })
	},
	{
		depth: 2,
		url: "#sampling",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Sampling" })
	},
	{
		depth: 2,
		url: "#health-endpoints",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Health Endpoints" })
	},
	{
		depth: 2,
		url: "#configuration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Configuration" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every request handled by Kwiva produces a tree of trace spans automatically. The tracing runtime wraps the framework's own machinery — middleware, validation, controllers, model queries, cache lookups, and responses — so you get a full picture of where time goes without adding a single span by hand." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "one-tree-per-request",
			children: "One Tree per Request"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A typical request produces a shape like this:" }),
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
			title: "one-tree-per-request.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "http GET /api/posts (server)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ middleware.request-id" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ middleware.session" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ middleware.tenant" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ validation (route schema)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ controller posts.list" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " │   └─ model posts.query (sql + params normalized)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ cache.get posts:..." })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " └─ http.response (status, size)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each span nests inside the one before it. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "controller posts.list" }),
			" span, for instance, contains every model query it performed, and the query spans carry normalized SQL and redacted parameters — never raw values. The tree is the request's actual cost accounting, in order."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-gets-spans",
			children: "What Gets Spans"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Spans are not limited to HTTP. Every unit of work the framework owns is traced on the same runtime:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Work" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Spans produced" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Requests" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Middleware chain, validation, controller, queries, cache, response" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Jobs" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dispatch to run, including retry attempts" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tasks" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scheduled task execution" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Events" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Emit to listener for every registered listener" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP tool calls" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tool invocation and input validation" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR renders" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Loader, render, and stream stages" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Breadth like this is what makes tracing useful: a user reporting a slow page, a job that deadlocks, or an event handler that drags can all be traced through the same runtime and queried the same way." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "reading-a-tree",
			children: "Reading a Tree"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The tree's shape is its explanation. A request that spends 900 milliseconds total with 800 of them inside ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "model posts.query" }),
			" is a query problem, not a routing problem — the span tree says which layer owns the time. Retries within a job render as repeated attempt spans under the same job root, so a job that succeeds on the third try tells a complete story instead of a single ambiguous duration."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "model-query-spans",
			children: "Model Query Spans"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every query builder call is traced with two attributes that matter in production:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Normalized SQL — the query template, not the interpolated values" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Redacted parameters — bound values are scrubbed before they reach a span" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This is a deliberate PII and secret-safety decision. Trace data stays useful for debugging while never shipping full-text values or credentials to your collector. Query spans carry the model and operation as well, which makes them directly joinable to the metric series (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "model_queries_total" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "model_query_duration" }),
			") on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/metrics",
				children: "Metrics"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "custom-spans",
			children: "Custom Spans"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "When you need a span for work that lives outside the framework boundaries, the same tracing runtime is exported for app code:" }),
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
			title: "custom-spans.ts",
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
							children: " { trace } "
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
							children: " '@kwiva/core'"
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
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " trace"
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
							children: "'billing.recalc'"
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
							children: "span"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  span."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "setAttr"
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
							children: "'tenantId'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", tenant.id)"
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
						children: "  // ... your logic"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Custom spans nest inside the current request or job span automatically, so they join the existing tree instead of floating in isolation." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!TIP]\nWrap anything long-running or externally observable — gateway calls, report generation, cache warming — in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "trace" }),
				". A span that exists costs nothing when no exporter is configured, and it pays off the first time the operation is slow and you have to explain where the time went."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "distributed-context",
			children: "Distributed Context"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Correlation IDs are the glue between tracing and logging. Within any scope, every log line carries ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "traceId" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "spanId" }),
			" alongside ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
			", and context propagates across framework hops — a request that dispatches a job, an event that triggers a listener, a page that streams a query all stay in one trace. To walk a failing request end to end:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Get the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
				" from the error report or the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-request-id" }),
				" header."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Pull every log line with that ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
				" from your log store."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Enlarge to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "traceId" }),
				" to include spans from background workers and event listeners."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The trace context follows the OpenTelemetry contract and the W3C trace context propagation standard, so a trace that hops a service boundary — outbound to a gateway, a worker, or a hosted render — carries the same identifiers to whatever honors the standard." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "sampling",
			children: "Sampling"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Trace data is collected at a configurable rate, applied at the root span so every descendant of a sampled request is exported as a complete tree — you never get a half-tree from mixed sampling decisions." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Development samples everything (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "1.0" }),
				") so the dev overlay and local debugging are complete."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Production guidance is ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "0.1" }),
				" — enough to detect latency regressions and failure spikes while keeping export volume manageable."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Errors are always sampled: a failing request is the one you want to see, independent of the roll of the dice." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Sampling affects collection, not metrics — metric series are aggregated and effectively always-on regardless of the trace sample rate." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "health-endpoints",
			children: "Health Endpoints"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two health endpoints ship with every application:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }), " — liveness. Returns OK when the process is up."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/readyz" }), " — readiness. Pings the database, the queue, and storage, and returns OK only when all configured dependencies respond."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Readiness checks are the correct target for orchestrators and load balancers; liveness is the correct target for process supervisors. Load balancers that add an instance before it is ready — or keep one that has lost its queue — get a definitive signal instead of timing out." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "configuration",
			children: "Configuration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Telemetry configuration lives in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/telemetry.ts" }),
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
			title: "configuration.ts",
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
							children: "'telemetry'"
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
							children: "    sampleRate: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "1.0"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// dev 1.0; production guidance 0.1"
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
							children: "    exporters: { otlp: { endpoint: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'http://collector:4318'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "    logs: { level: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'info'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", pretty: "
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
							children: "// dev"
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
							children: "    metrics: { interval: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "10_000"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two settings matter most in production:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sampleRate" }) }),
				" — trace every request in development (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "1.0" }),
				") and a fraction of traffic in production (guidance ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "0.1" }),
				"). Sampling is applied at the root span so every descendant of a sampled request is exported as a complete tree."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "exporters" }) }), " — data is exported over HTTP to a collector-compatible endpoint. With no exporters configured, tracing degrades to a no-op with negligible overhead."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Exporter failures never break the app: errors are swallowed and counted, which is the framework's standing principle that observability must not become a dependency of uptime." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/logging",
				children: "Logging"
			}), " — how log lines attach to the same trace IDs"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/metrics",
				children: "Metrics"
			}), " — the counters and durations recorded alongside spans"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/dev-overlay",
				children: "Dev Overlay"
			}), " — see span waterfalls while developing"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/configuration",
					children: "Configuration"
				}),
				" — how ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
				" modules and inline options work"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}), " — sampling and exporter settings before you ship"] }),
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
