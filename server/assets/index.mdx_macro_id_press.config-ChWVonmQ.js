import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/observability/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Observability",
	"description": "Distributed tracing, structured logs, and metrics that light up from the framework surface — zero-config defaults in every Kwiva application."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva's observability layer is woven through the framework surface rather than bolted on. Because requests, model queries, jobs, tasks, events, and page renders all pass through framework-owned machinery, the tracing runtime, the structured logger, and the metrics pipeline capture data automatically. You get telemetry because you used the framework APIs — not because you instrumented your code.\n\nWhen a request arrives, a single correlation story unfolds across the stack: the `request-id` middleware assigns a correlation ID, the session and tenant middleware attach context, the route schema is validated, the controller runs, and each model query is traced. By the time the response leaves, one `requestId` and one `traceId` bind every log line, span, and metric for that call.\n\n## The Correlation Story [#the-correlation-story]\n\nA production request rarely stays in one place. Kwiva makes every hop visible and slotable into a single narrative:\n\n```text title=\"the-correlation-story.txt\"\nrequest arrives\n  ├─ request-id middleware assigns a correlation ID\n  ├─ session and tenant middleware attach context\n  ├─ route schema is validated\n  ├─ handler runs\n  │   └─ every model query is traced\n  └─ response completes and logs its status and duration\n```\n\nEvery log line emitted inside that scope carries `requestId`, `traceId`, and `spanId`, so you can start from a user report, grab the correlation ID from the `x-request-id` header, and follow the whole request through logs, spans, and metrics.\n\n## The Three Pillars [#the-three-pillars]\n\nObservability in Kwiva ships as three tightly coupled surfaces, plus a development overlay:\n\n* **Tracing** — every request becomes a tree of spans, from middleware through the handler and into every model query. Jobs, tasks, events, MCP tool calls, and SSR renders are traced the same way.\n* **Logging** — structured, JSON-by-default logs with request, tenant, and user correlation attached automatically.\n* **Metrics** — counters and duration series for HTTP traffic, model queries, queue depth, cache hit rate, tasks, and SSR, sampled on an interval and exported to your pipeline.\n\nThe fourth surface — the development overlay — turns the same data into an in-flight view of your app while you work.\n\n## Zero-Config Defaults [#zero-config-defaults]\n\nObservability follows the rest of the framework's posture: it works out of the box, and you opt into more. A freshly scaffolded application ships with:\n\n* A request span tree per request, with span attributes for the request, session, tenant, route schema validation, controller, model queries (normalized SQL, redacted parameters), cache lookups, and response status and size\n* Structured JSON logs with correlation fields on every line that falls inside a request, job, task, or event scope\n* Metric series recorded at every framework boundary and flushed on a configured interval\n\nWhen no exporters are configured, all of it runs as a **no-op with negligible overhead** — dev machines and single-instance apps pay nothing until you point telemetry at something. Data only leaves the process when you configure an exporter. See [Tracing](/docs/observability/tracing) for the span tree, [Logging](/docs/observability/logging) for the log schema, and [Metrics](/docs/observability/metrics) for the series.\n\n## Beyond the Process [#beyond-the-process]\n\nTelemetry exports through the OpenTelemetry contract — traces and metrics over OTLP to a collector-compatible endpoint by default:\n\n```ts title=\"src/config/telemetry.ts\"\n// src/config/telemetry.ts\nexport default defineConfig('telemetry', {\n  defaults: {\n    sampleRate: 1.0,                     // dev 1.0; production guidance 0.1\n    exporters: { otlp: { endpoint: 'http://collector:4318' } },\n    logs: { level: 'info', pretty: true /* dev */ },\n    metrics: { interval: 10_000 },\n  },\n})\n```\n\nOne configuration file drives the whole pipeline: sampling, exporters, log level, and metric flush interval. The same `defineConfig` pattern you use for database and security settings owns telemetry, and the collectible surface is consistent regardless of which vendor consumes it — your spans and metrics are vendor-neutral until the export step.\n\n## Health Endpoints [#health-endpoints]\n\nEvery application ships two health endpoints:\n\n* `/healthz` — liveness. Returns OK when the process is up.\n* `/readyz` — readiness. Pings the database, the queue, and storage, and returns OK only when all configured dependencies respond.\n\nReadiness is the right signal for orchestrators and load balancers; liveness is the right signal for process supervisors. Both are documented on [Tracing](/docs/observability/tracing).\n\n## Which Data Flows Where [#which-data-flows-where]\n\nThe three pillars split cleanly by consumer:\n\n| Data                | Consumed by                                                    |\n| ------------------- | -------------------------------------------------------------- |\n| Traces (span trees) | Local debugging, distributed investigations, latency forensics |\n| Logs (JSON lines)   | Log stores, correlation lookups, terminal work                 |\n| Metrics (series)    | Dashboards, alerting, capacity planning                        |\n\nThe same underlying events feed all three from the shared tracing runtime — a request is one event that publishes a span, log lines, and counter increments. There is no second instrumentation pass to keep the pillars in agreement.\n\n## Design Principles [#design-principles]\n\nThree principles keep observability safe to ship everywhere:\n\n1. **Zero-code telemetry.** Spans, log lines, and metrics exist because you used framework APIs, never because you wired up instrumentation by hand.\n2. **Never break the app for telemetry.** Exporter failures are swallowed and counted. If your collector is down, the app keeps serving.\n3. **PII discipline.** Span attributes carry user IDs, not emails, by default. Query text is normalized and parameter values are redacted — full-text values never appear in spans.\n\n## The Development Surface [#the-development-surface]\n\nThe same telemetry that feeds a collector renders in the development overlay while you work — request timeline, span waterfall, errors with their correlation IDs, and the query list. You can also read it programmatically in the `kwiva console` REPL:\n\n```text title=\"the-development-surface.txt\"\napp.trace.last()      // the most recent span tree\napp.logs.tail(20)     // the last 20 log lines\n```\n\nThe dev overlay is documented on its own page, and the guarantee it makes is the same one production makes: the data you debug with locally is the data that flows to your collector later — nothing extra to implement to graduate.\n\n## From Signals to Answers [#from-signals-to-answers]\n\nTelemetry is the raw material; the framework also helps turn signals into answers. Because spans, logs, and metrics share one schema, the debugging workflow is short regardless of scale:\n\n1. A report arrives with a `requestId` (or you grab `x-request-id` from the failing response)\n2. Log lookup resolves the request to its `traceId`, and all background work joins the same trace\n3. The span waterfall identifies the accountable layer — the model query, a cache miss, or a third-party hop\n4. The correlated series confirm the pattern at volume: a one-off failure trace is an incident; a rising failure counter is a trend\n\nGood telemetry shortens the loop between \"something is slow\" and \"here is the span and the query.\" This documentation shows the whole path.\n\n## At a Glance [#at-a-glance]\n\n| Page                                           | What it covers                                                         |\n| ---------------------------------------------- | ---------------------------------------------------------------------- |\n| [Logging](/docs/observability/logging)         | Structured JSON logs, correlation IDs, log levels, adding context      |\n| [Tracing](/docs/observability/tracing)         | Span trees, model query spans, distributed context, health endpoints   |\n| [Metrics](/docs/observability/metrics)         | HTTP, query, queue, cache, task, and SSR series; where to consume them |\n| [Dev Overlay](/docs/observability/dev-overlay) | Request timeline, span waterfall, query list, server timing            |\n\n## What's Next [#whats-next]\n\n* [Logging](/docs/observability/logging) — see the default log schema and correlation fields\n* [Tracing](/docs/observability/tracing) — follow a request through its span tree\n* [Metrics](/docs/observability/metrics) — explore the built-in metric series\n* [Dev Overlay](/docs/observability/dev-overlay) — learn what you see while developing\n* [Background Work](/docs/background-work) — how jobs, queues, and tasks are traced\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva's observability layer is woven through the framework surface rather than bolted on. Because requests, model queries, jobs, tasks, events, and page renders all pass through framework-owned machinery, the tracing runtime, the structured logger, and the metrics pipeline capture data automatically. You get telemetry because you used the framework APIs — not because you instrumented your code."
		},
		{
			"heading": void 0,
			"content": "When a request arrives, a single correlation story unfolds across the stack: the `request-id` middleware assigns a correlation ID, the session and tenant middleware attach context, the route schema is validated, the controller runs, and each model query is traced. By the time the response leaves, one `requestId` and one `traceId` bind every log line, span, and metric for that call."
		},
		{
			"heading": "the-correlation-story",
			"content": "A production request rarely stays in one place. Kwiva makes every hop visible and slotable into a single narrative:"
		},
		{
			"heading": "the-correlation-story",
			"content": "Every log line emitted inside that scope carries `requestId`, `traceId`, and `spanId`, so you can start from a user report, grab the correlation ID from the `x-request-id` header, and follow the whole request through logs, spans, and metrics."
		},
		{
			"heading": "the-three-pillars",
			"content": "Observability in Kwiva ships as three tightly coupled surfaces, plus a development overlay:"
		},
		{
			"heading": "the-three-pillars",
			"content": "**Tracing** — every request becomes a tree of spans, from middleware through the handler and into every model query. Jobs, tasks, events, MCP tool calls, and SSR renders are traced the same way."
		},
		{
			"heading": "the-three-pillars",
			"content": "**Logging** — structured, JSON-by-default logs with request, tenant, and user correlation attached automatically."
		},
		{
			"heading": "the-three-pillars",
			"content": "**Metrics** — counters and duration series for HTTP traffic, model queries, queue depth, cache hit rate, tasks, and SSR, sampled on an interval and exported to your pipeline."
		},
		{
			"heading": "the-three-pillars",
			"content": "The fourth surface — the development overlay — turns the same data into an in-flight view of your app while you work."
		},
		{
			"heading": "zero-config-defaults",
			"content": "Observability follows the rest of the framework's posture: it works out of the box, and you opt into more. A freshly scaffolded application ships with:"
		},
		{
			"heading": "zero-config-defaults",
			"content": "A request span tree per request, with span attributes for the request, session, tenant, route schema validation, controller, model queries (normalized SQL, redacted parameters), cache lookups, and response status and size"
		},
		{
			"heading": "zero-config-defaults",
			"content": "Structured JSON logs with correlation fields on every line that falls inside a request, job, task, or event scope"
		},
		{
			"heading": "zero-config-defaults",
			"content": "Metric series recorded at every framework boundary and flushed on a configured interval"
		},
		{
			"heading": "zero-config-defaults",
			"content": "When no exporters are configured, all of it runs as a **no-op with negligible overhead** — dev machines and single-instance apps pay nothing until you point telemetry at something. Data only leaves the process when you configure an exporter. See Tracing for the span tree, Logging for the log schema, and Metrics for the series."
		},
		{
			"heading": "beyond-the-process",
			"content": "Telemetry exports through the OpenTelemetry contract — traces and metrics over OTLP to a collector-compatible endpoint by default:"
		},
		{
			"heading": "beyond-the-process",
			"content": "One configuration file drives the whole pipeline: sampling, exporters, log level, and metric flush interval. The same `defineConfig` pattern you use for database and security settings owns telemetry, and the collectible surface is consistent regardless of which vendor consumes it — your spans and metrics are vendor-neutral until the export step."
		},
		{
			"heading": "health-endpoints",
			"content": "Every application ships two health endpoints:"
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
			"content": "Readiness is the right signal for orchestrators and load balancers; liveness is the right signal for process supervisors. Both are documented on Tracing."
		},
		{
			"heading": "which-data-flows-where",
			"content": "The three pillars split cleanly by consumer:"
		},
		{
			"heading": "which-data-flows-where",
			"content": "Data"
		},
		{
			"heading": "which-data-flows-where",
			"content": "Consumed by"
		},
		{
			"heading": "which-data-flows-where",
			"content": "Traces (span trees)"
		},
		{
			"heading": "which-data-flows-where",
			"content": "Local debugging, distributed investigations, latency forensics"
		},
		{
			"heading": "which-data-flows-where",
			"content": "Logs (JSON lines)"
		},
		{
			"heading": "which-data-flows-where",
			"content": "Log stores, correlation lookups, terminal work"
		},
		{
			"heading": "which-data-flows-where",
			"content": "Metrics (series)"
		},
		{
			"heading": "which-data-flows-where",
			"content": "Dashboards, alerting, capacity planning"
		},
		{
			"heading": "which-data-flows-where",
			"content": "The same underlying events feed all three from the shared tracing runtime — a request is one event that publishes a span, log lines, and counter increments. There is no second instrumentation pass to keep the pillars in agreement."
		},
		{
			"heading": "design-principles",
			"content": "Three principles keep observability safe to ship everywhere:"
		},
		{
			"heading": "design-principles",
			"content": "**Zero-code telemetry.** Spans, log lines, and metrics exist because you used framework APIs, never because you wired up instrumentation by hand."
		},
		{
			"heading": "design-principles",
			"content": "**Never break the app for telemetry.** Exporter failures are swallowed and counted. If your collector is down, the app keeps serving."
		},
		{
			"heading": "design-principles",
			"content": "**PII discipline.** Span attributes carry user IDs, not emails, by default. Query text is normalized and parameter values are redacted — full-text values never appear in spans."
		},
		{
			"heading": "the-development-surface",
			"content": "The same telemetry that feeds a collector renders in the development overlay while you work — request timeline, span waterfall, errors with their correlation IDs, and the query list. You can also read it programmatically in the `kwiva console` REPL:"
		},
		{
			"heading": "the-development-surface",
			"content": "The dev overlay is documented on its own page, and the guarantee it makes is the same one production makes: the data you debug with locally is the data that flows to your collector later — nothing extra to implement to graduate."
		},
		{
			"heading": "from-signals-to-answers",
			"content": "Telemetry is the raw material; the framework also helps turn signals into answers. Because spans, logs, and metrics share one schema, the debugging workflow is short regardless of scale:"
		},
		{
			"heading": "from-signals-to-answers",
			"content": "A report arrives with a `requestId` (or you grab `x-request-id` from the failing response)"
		},
		{
			"heading": "from-signals-to-answers",
			"content": "Log lookup resolves the request to its `traceId`, and all background work joins the same trace"
		},
		{
			"heading": "from-signals-to-answers",
			"content": "The span waterfall identifies the accountable layer — the model query, a cache miss, or a third-party hop"
		},
		{
			"heading": "from-signals-to-answers",
			"content": "The correlated series confirm the pattern at volume: a one-off failure trace is an incident; a rising failure counter is a trend"
		},
		{
			"heading": "from-signals-to-answers",
			"content": "Good telemetry shortens the loop between \"something is slow\" and \"here is the span and the query.\" This documentation shows the whole path."
		},
		{
			"heading": "at-a-glance",
			"content": "Page"
		},
		{
			"heading": "at-a-glance",
			"content": "What it covers"
		},
		{
			"heading": "at-a-glance",
			"content": "Logging"
		},
		{
			"heading": "at-a-glance",
			"content": "Structured JSON logs, correlation IDs, log levels, adding context"
		},
		{
			"heading": "at-a-glance",
			"content": "Tracing"
		},
		{
			"heading": "at-a-glance",
			"content": "Span trees, model query spans, distributed context, health endpoints"
		},
		{
			"heading": "at-a-glance",
			"content": "Metrics"
		},
		{
			"heading": "at-a-glance",
			"content": "HTTP, query, queue, cache, task, and SSR series; where to consume them"
		},
		{
			"heading": "at-a-glance",
			"content": "Dev Overlay"
		},
		{
			"heading": "at-a-glance",
			"content": "Request timeline, span waterfall, query list, server timing"
		},
		{
			"heading": "whats-next",
			"content": "Logging — see the default log schema and correlation fields"
		},
		{
			"heading": "whats-next",
			"content": "Tracing — follow a request through its span tree"
		},
		{
			"heading": "whats-next",
			"content": "Metrics — explore the built-in metric series"
		},
		{
			"heading": "whats-next",
			"content": "Dev Overlay — learn what you see while developing"
		},
		{
			"heading": "whats-next",
			"content": "Background Work — how jobs, queues, and tasks are traced"
		}
	],
	"headings": [
		{
			"id": "the-correlation-story",
			"content": "The Correlation Story"
		},
		{
			"id": "the-three-pillars",
			"content": "The Three Pillars"
		},
		{
			"id": "zero-config-defaults",
			"content": "Zero-Config Defaults"
		},
		{
			"id": "beyond-the-process",
			"content": "Beyond the Process"
		},
		{
			"id": "health-endpoints",
			"content": "Health Endpoints"
		},
		{
			"id": "which-data-flows-where",
			"content": "Which Data Flows Where"
		},
		{
			"id": "design-principles",
			"content": "Design Principles"
		},
		{
			"id": "the-development-surface",
			"content": "The Development Surface"
		},
		{
			"id": "from-signals-to-answers",
			"content": "From Signals to Answers"
		},
		{
			"id": "at-a-glance",
			"content": "At a Glance"
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
		url: "#the-correlation-story",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Correlation Story" })
	},
	{
		depth: 2,
		url: "#the-three-pillars",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Three Pillars" })
	},
	{
		depth: 2,
		url: "#zero-config-defaults",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Zero-Config Defaults" })
	},
	{
		depth: 2,
		url: "#beyond-the-process",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Beyond the Process" })
	},
	{
		depth: 2,
		url: "#health-endpoints",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Health Endpoints" })
	},
	{
		depth: 2,
		url: "#which-data-flows-where",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Which Data Flows Where" })
	},
	{
		depth: 2,
		url: "#design-principles",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Design Principles" })
	},
	{
		depth: 2,
		url: "#the-development-surface",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Development Surface" })
	},
	{
		depth: 2,
		url: "#from-signals-to-answers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "From Signals to Answers" })
	},
	{
		depth: 2,
		url: "#at-a-glance",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "At a Glance" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva's observability layer is woven through the framework surface rather than bolted on. Because requests, model queries, jobs, tasks, events, and page renders all pass through framework-owned machinery, the tracing runtime, the structured logger, and the metrics pipeline capture data automatically. You get telemetry because you used the framework APIs — not because you instrumented your code." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"When a request arrives, a single correlation story unfolds across the stack: the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "request-id" }),
			" middleware assigns a correlation ID, the session and tenant middleware attach context, the route schema is validated, the controller runs, and each model query is traced. By the time the response leaves, one ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
			" and one ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "traceId" }),
			" bind every log line, span, and metric for that call."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-correlation-story",
			children: "The Correlation Story"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A production request rarely stays in one place. Kwiva makes every hop visible and slotable into a single narrative:" }),
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
			title: "the-correlation-story.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "request arrives" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─ request-id middleware assigns a correlation ID" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─ session and tenant middleware attach context" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─ route schema is validated" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─ handler runs" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  │   └─ every model query is traced" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  └─ response completes and logs its status and duration" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every log line emitted inside that scope carries ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "traceId" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "spanId" }),
			", so you can start from a user report, grab the correlation ID from the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-request-id" }),
			" header, and follow the whole request through logs, spans, and metrics."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-three-pillars",
			children: "The Three Pillars"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Observability in Kwiva ships as three tightly coupled surfaces, plus a development overlay:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tracing" }), " — every request becomes a tree of spans, from middleware through the handler and into every model query. Jobs, tasks, events, MCP tool calls, and SSR renders are traced the same way."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Logging" }), " — structured, JSON-by-default logs with request, tenant, and user correlation attached automatically."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Metrics" }), " — counters and duration series for HTTP traffic, model queries, queue depth, cache hit rate, tasks, and SSR, sampled on an interval and exported to your pipeline."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The fourth surface — the development overlay — turns the same data into an in-flight view of your app while you work." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "zero-config-defaults",
			children: "Zero-Config Defaults"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Observability follows the rest of the framework's posture: it works out of the box, and you opt into more. A freshly scaffolded application ships with:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "A request span tree per request, with span attributes for the request, session, tenant, route schema validation, controller, model queries (normalized SQL, redacted parameters), cache lookups, and response status and size" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Structured JSON logs with correlation fields on every line that falls inside a request, job, task, or event scope" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Metric series recorded at every framework boundary and flushed on a configured interval" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"When no exporters are configured, all of it runs as a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "no-op with negligible overhead" }),
			" — dev machines and single-instance apps pay nothing until you point telemetry at something. Data only leaves the process when you configure an exporter. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Tracing"
			}),
			" for the span tree, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/logging",
				children: "Logging"
			}),
			" for the log schema, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/metrics",
				children: "Metrics"
			}),
			" for the series."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "beyond-the-process",
			children: "Beyond the Process"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Telemetry exports through the OpenTelemetry contract — traces and metrics over OTLP to a collector-compatible endpoint by default:" }),
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
			title: "src/config/telemetry.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/telemetry.ts"
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
							children: ",                     "
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
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: " /* dev */"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"One configuration file drives the whole pipeline: sampling, exporters, log level, and metric flush interval. The same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
			" pattern you use for database and security settings owns telemetry, and the collectible surface is consistent regardless of which vendor consumes it — your spans and metrics are vendor-neutral until the export step."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "health-endpoints",
			children: "Health Endpoints"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every application ships two health endpoints:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }), " — liveness. Returns OK when the process is up."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/readyz" }), " — readiness. Pings the database, the queue, and storage, and returns OK only when all configured dependencies respond."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Readiness is the right signal for orchestrators and load balancers; liveness is the right signal for process supervisors. Both are documented on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Tracing"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "which-data-flows-where",
			children: "Which Data Flows Where"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The three pillars split cleanly by consumer:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Data" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Consumed by" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Traces (span trees)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Local debugging, distributed investigations, latency forensics" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Logs (JSON lines)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Log stores, correlation lookups, terminal work" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Metrics (series)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dashboards, alerting, capacity planning" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The same underlying events feed all three from the shared tracing runtime — a request is one event that publishes a span, log lines, and counter increments. There is no second instrumentation pass to keep the pillars in agreement." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "design-principles",
			children: "Design Principles"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Three principles keep observability safe to ship everywhere:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Zero-code telemetry." }), " Spans, log lines, and metrics exist because you used framework APIs, never because you wired up instrumentation by hand."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Never break the app for telemetry." }), " Exporter failures are swallowed and counted. If your collector is down, the app keeps serving."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "PII discipline." }), " Span attributes carry user IDs, not emails, by default. Query text is normalized and parameter values are redacted — full-text values never appear in spans."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-development-surface",
			children: "The Development Surface"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same telemetry that feeds a collector renders in the development overlay while you work — request timeline, span waterfall, errors with their correlation IDs, and the query list. You can also read it programmatically in the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva console" }),
			" REPL:"
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
			title: "the-development-surface.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "app.trace.last()      // the most recent span tree" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "app.logs.tail(20)     // the last 20 log lines" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The dev overlay is documented on its own page, and the guarantee it makes is the same one production makes: the data you debug with locally is the data that flows to your collector later — nothing extra to implement to graduate." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "from-signals-to-answers",
			children: "From Signals to Answers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Telemetry is the raw material; the framework also helps turn signals into answers. Because spans, logs, and metrics share one schema, the debugging workflow is short regardless of scale:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A report arrives with a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
				" (or you grab ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-request-id" }),
				" from the failing response)"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Log lookup resolves the request to its ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "traceId" }),
				", and all background work joins the same trace"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The span waterfall identifies the accountable layer — the model query, a cache miss, or a third-party hop" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The correlated series confirm the pattern at volume: a one-off failure trace is an incident; a rising failure counter is a trend" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Good telemetry shortens the loop between \"something is slow\" and \"here is the span and the query.\" This documentation shows the whole path." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "at-a-glance",
			children: "At a Glance"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Page" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it covers" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/logging",
				children: "Logging"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Structured JSON logs, correlation IDs, log levels, adding context" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Tracing"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Span trees, model query spans, distributed context, health endpoints" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/metrics",
				children: "Metrics"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "HTTP, query, queue, cache, task, and SSR series; where to consume them" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/dev-overlay",
				children: "Dev Overlay"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Request timeline, span waterfall, query list, server timing" })] })
		] })] }),
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
			}), " — see the default log schema and correlation fields"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Tracing"
			}), " — follow a request through its span tree"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/metrics",
				children: "Metrics"
			}), " — explore the built-in metric series"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/dev-overlay",
				children: "Dev Overlay"
			}), " — learn what you see while developing"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work",
				children: "Background Work"
			}), " — how jobs, queues, and tasks are traced"] }),
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
