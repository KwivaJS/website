import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/observability/metrics.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Metrics",
	"description": "Counters and duration series for HTTP traffic, model queries, queue depth, cache hit rate, tasks, and SSR — sampled and exported on an interval."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nKwiva records metrics at every boundary the framework owns, then samples and exports them on a fixed interval through the same telemetry pipeline as tracing and logs. Like the rest of observability, metrics are zero-code: they exist because you used framework APIs, and they require no explicit instrumentation.\n\n## The Metrics Pipeline [#the-metrics-pipeline]\n\nThe pipeline works in four stages:\n\n1. **Record** — framework layers increment counters and observe durations at natural boundaries: an HTTP response completes, a query returns, a job finishes, a cache lookup resolves, a task runs, a page prerenders.\n2. **Sample** — the metric runtime aggregates values in memory.\n3. **Flush** — on the configured `interval` (default `10_000` milliseconds), point-in-time values are exported.\n4. **Forward** — data leaves through the configured exporters for your collector, dashboard, and alerting stack.\n\nThe interval setting lives in the telemetry config:\n\n```ts title=\"src/config/telemetry.ts\"\n// src/config/telemetry.ts\nexport default defineConfig('telemetry', {\n  defaults: {\n    sampleRate: 1.0,\n    exporters: { otlp: { endpoint: 'http://collector:4318' } },\n    metrics: { interval: 10_000 },\n  },\n})\n```\n\nWith no exporters configured, metric collection runs as a no-op with negligible overhead — a dev machine or single instance pays nothing until you enable forwarding.\n\n## Series Definitions [#series-definitions]\n\n| Series                                    | Kind          | Labels                      | What it tells you                        |\n| ----------------------------------------- | ------------- | --------------------------- | ---------------------------------------- |\n| `http_requests_total`                     | Total counter | `route`, `method`, `status` | Traffic volume and error ratio per route |\n| `http_request_duration`                   | Duration      | `route`, `method`, `status` | Latency distribution per route           |\n| `model_queries_total`                     | Total counter | `model`, `op`               | Query volume per model operation         |\n| `model_query_duration`                    | Duration      | `model`, `op`               | Query latency per model operation        |\n| `queue_depth`                             | Gauge         | `queue`                     | Pending work waiting on each queue       |\n| `job_duration`                            | Duration      | `queue`, `job`              | Execution time per job type              |\n| `job_failures_total`                      | Total counter | `queue`, `job`              | Failure volume per job type              |\n| `cache_hits_total` / `cache_misses_total` | Total counter | `layer`, `key prefix`       | Cache effectiveness per layer            |\n| `task_runs_total`                         | Total counter | `task`                      | Run volume per scheduled task            |\n| `task_duration`                           | Duration      | `task`                      | Execution time per scheduled task        |\n| `ssr_duration`                            | Duration      | `route`                     | Server-side render time per route        |\n| `hydration_duration`                      | Duration      | `route`                     | Client hydration time per route          |\n\nEach series carries enough labels to slice by route, model, queue, or task without losing the ability to roll up to a global view.\n\n## Reading the Series [#reading-the-series]\n\nThe series split cleanly between **volume** and **health signals**:\n\n* `_total` counters answer \"how much\": `http_requests_total`, `model_queries_total`, `job_failures_total`, `task_runs_total`.\n* Duration series answer \"how slow\": `http_request_duration`, `model_query_duration`, `job_duration`, `task_duration`, `ssr_duration`, `hydration_duration`.\n* Gauges answer \"how backed up\": `queue_depth`.\n* The two cache counters read together as a ratio.\n\nPair a volume series with its duration series and a failure counter, and a dashboard slice becomes a diagnosis: a route with rising volume, rising p99, and a nonzero error ratio is a route under stress; a route with flat volume and rising p99 is a regression.\n\n## Queue Depth [#queue-depth]\n\n`queue_depth` is the canary metric for background health. It is reported per queue and reflects pending work at the moment of the flush. A flat, healthy baseline with spikes on deploys and daily batch work is normal; a queue that climbs monotonically while jobs fail is your earliest signal that something downstream is stuck. Cross-check it with `job_failures_total` and `job_duration` — a full queue plus failure spikes is a poisoned worker; a full queue with healthy jobs is a throughput problem downstream.\n\n## Cache Hit Rate [#cache-hit-rate]\n\nCache health is expressed as a ratio of two counters:\n\n```text title=\"cache-hit-rate.txt\"\ncache hit rate = cache_hits_total / (cache_hits_total + cache_misses_total)\n```\n\nBoth counters are labeled by `layer` and `key prefix`, so you can compare the effectiveness of page-level route caching against model cache against the client cache — and, within a layer, against a specific prefix such as posts. Watch the ratio per prefix: a prefix that drops to near-zero hit rate after a deploy usually means an invalidation rule is too eager, and the cache is being cleared faster than it fills.\n\n## Request Latency [#request-latency]\n\n`http_request_duration` is the direct observable for what users experience. Because it is labeled by route, method, and status, you can distinguish a slow-but-200 endpoint from an endpoint that is slow because it is failing. Watch the tail (p95 and p99) rather than the mean: means hide one slow query among hundreds of fast ones, while the tail catches exactly the requests users complain about.\n\n## Model Query Metrics [#model-query-metrics]\n\nModel query series decompose the latency story one level down. Where `http_request_duration` says a route is slow, `model_query_duration` says which operation on which model is accountable — join them on the same span data from [Tracing](/docs/observability/tracing). `model_queries_total` by `op` also reveals N+1 patterns in the aggregate: a `list` route that issues far more `get` queries per request than the code appears to is a signal to re-read the relations, not the metrics.\n\n## Where to Consume Them [#where-to-consume-them]\n\nThree consumption paths exist for the same series:\n\n* **Dashboards** — point your metrics pipeline at the exporter endpoint and build views for traffic, latency, queue depth, and cache effectiveness.\n* **Alerting** — thresholds configured in the telemetry config emit events to a webhook channel when crossed. For example, a `jobFailureRate` threshold of `0.05` fires when job failures exceed five percent, and the event composes with the notifications module.\n* **Development** — the dev overlay and `kwiva console` expose a live view of the same counters, so you can watch series change as you exercise routes locally.\n\nThe three paths consume the same points, so a value that cracks a dashboard threshold and an alerting threshold is the same number — no dashboard-specific accumulation to reconcile.\n\n## Sampling in Production [#sampling-in-production]\n\nTrace sampling does not reduce data you lose — it reduces collection cost proportionally. Production guidance is a `sampleRate` of `0.1` (ten percent of traffic), which is enough to detect latency regressions and failure spikes while keeping export volume manageable. Metrics are aggregated, not per-request, so they are effectively always-on regardless of sample rate.\n\n> \\[!NOTE]\n> With no exporters configured, everything here — the pipeline, the series, the interval — runs as a no-op. Metrics cost you nothing until you point an exporter at them; when you do, the series above start leaving the process within one flush interval.\n\n## What's Next [#whats-next]\n\n* [Tracing](/docs/observability/tracing) — the span tree that explains what the counters measure\n* [Logging](/docs/observability/logging) — the correlated detail behind any metric anomaly\n* [Dev Overlay](/docs/observability/dev-overlay) — watch live series during development\n* [Background Work](/docs/background-work/observability) — queue depth and job series in depth\n* [Configuration](/docs/core-concepts/configuration) — tune `interval`, `sampleRate`, and exporters\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva records metrics at every boundary the framework owns, then samples and exports them on a fixed interval through the same telemetry pipeline as tracing and logs. Like the rest of observability, metrics are zero-code: they exist because you used framework APIs, and they require no explicit instrumentation."
		},
		{
			"heading": "the-metrics-pipeline",
			"content": "The pipeline works in four stages:"
		},
		{
			"heading": "the-metrics-pipeline",
			"content": "**Record** — framework layers increment counters and observe durations at natural boundaries: an HTTP response completes, a query returns, a job finishes, a cache lookup resolves, a task runs, a page prerenders."
		},
		{
			"heading": "the-metrics-pipeline",
			"content": "**Sample** — the metric runtime aggregates values in memory."
		},
		{
			"heading": "the-metrics-pipeline",
			"content": "**Flush** — on the configured `interval` (default `10_000` milliseconds), point-in-time values are exported."
		},
		{
			"heading": "the-metrics-pipeline",
			"content": "**Forward** — data leaves through the configured exporters for your collector, dashboard, and alerting stack."
		},
		{
			"heading": "the-metrics-pipeline",
			"content": "The interval setting lives in the telemetry config:"
		},
		{
			"heading": "the-metrics-pipeline",
			"content": "With no exporters configured, metric collection runs as a no-op with negligible overhead — a dev machine or single instance pays nothing until you enable forwarding."
		},
		{
			"heading": "series-definitions",
			"content": "Series"
		},
		{
			"heading": "series-definitions",
			"content": "Kind"
		},
		{
			"heading": "series-definitions",
			"content": "Labels"
		},
		{
			"heading": "series-definitions",
			"content": "What it tells you"
		},
		{
			"heading": "series-definitions",
			"content": "`http_requests_total`"
		},
		{
			"heading": "series-definitions",
			"content": "Total counter"
		},
		{
			"heading": "series-definitions",
			"content": "`route`, `method`, `status`"
		},
		{
			"heading": "series-definitions",
			"content": "Traffic volume and error ratio per route"
		},
		{
			"heading": "series-definitions",
			"content": "`http_request_duration`"
		},
		{
			"heading": "series-definitions",
			"content": "Duration"
		},
		{
			"heading": "series-definitions",
			"content": "`route`, `method`, `status`"
		},
		{
			"heading": "series-definitions",
			"content": "Latency distribution per route"
		},
		{
			"heading": "series-definitions",
			"content": "`model_queries_total`"
		},
		{
			"heading": "series-definitions",
			"content": "Total counter"
		},
		{
			"heading": "series-definitions",
			"content": "`model`, `op`"
		},
		{
			"heading": "series-definitions",
			"content": "Query volume per model operation"
		},
		{
			"heading": "series-definitions",
			"content": "`model_query_duration`"
		},
		{
			"heading": "series-definitions",
			"content": "Duration"
		},
		{
			"heading": "series-definitions",
			"content": "`model`, `op`"
		},
		{
			"heading": "series-definitions",
			"content": "Query latency per model operation"
		},
		{
			"heading": "series-definitions",
			"content": "`queue_depth`"
		},
		{
			"heading": "series-definitions",
			"content": "Gauge"
		},
		{
			"heading": "series-definitions",
			"content": "`queue`"
		},
		{
			"heading": "series-definitions",
			"content": "Pending work waiting on each queue"
		},
		{
			"heading": "series-definitions",
			"content": "`job_duration`"
		},
		{
			"heading": "series-definitions",
			"content": "Duration"
		},
		{
			"heading": "series-definitions",
			"content": "`queue`, `job`"
		},
		{
			"heading": "series-definitions",
			"content": "Execution time per job type"
		},
		{
			"heading": "series-definitions",
			"content": "`job_failures_total`"
		},
		{
			"heading": "series-definitions",
			"content": "Total counter"
		},
		{
			"heading": "series-definitions",
			"content": "`queue`, `job`"
		},
		{
			"heading": "series-definitions",
			"content": "Failure volume per job type"
		},
		{
			"heading": "series-definitions",
			"content": "`cache_hits_total` / `cache_misses_total`"
		},
		{
			"heading": "series-definitions",
			"content": "Total counter"
		},
		{
			"heading": "series-definitions",
			"content": "`layer`, `key prefix`"
		},
		{
			"heading": "series-definitions",
			"content": "Cache effectiveness per layer"
		},
		{
			"heading": "series-definitions",
			"content": "`task_runs_total`"
		},
		{
			"heading": "series-definitions",
			"content": "Total counter"
		},
		{
			"heading": "series-definitions",
			"content": "`task`"
		},
		{
			"heading": "series-definitions",
			"content": "Run volume per scheduled task"
		},
		{
			"heading": "series-definitions",
			"content": "`task_duration`"
		},
		{
			"heading": "series-definitions",
			"content": "Duration"
		},
		{
			"heading": "series-definitions",
			"content": "`task`"
		},
		{
			"heading": "series-definitions",
			"content": "Execution time per scheduled task"
		},
		{
			"heading": "series-definitions",
			"content": "`ssr_duration`"
		},
		{
			"heading": "series-definitions",
			"content": "Duration"
		},
		{
			"heading": "series-definitions",
			"content": "`route`"
		},
		{
			"heading": "series-definitions",
			"content": "Server-side render time per route"
		},
		{
			"heading": "series-definitions",
			"content": "`hydration_duration`"
		},
		{
			"heading": "series-definitions",
			"content": "Duration"
		},
		{
			"heading": "series-definitions",
			"content": "`route`"
		},
		{
			"heading": "series-definitions",
			"content": "Client hydration time per route"
		},
		{
			"heading": "series-definitions",
			"content": "Each series carries enough labels to slice by route, model, queue, or task without losing the ability to roll up to a global view."
		},
		{
			"heading": "reading-the-series",
			"content": "The series split cleanly between **volume** and **health signals**:"
		},
		{
			"heading": "reading-the-series",
			"content": "`_total` counters answer \"how much\": `http_requests_total`, `model_queries_total`, `job_failures_total`, `task_runs_total`."
		},
		{
			"heading": "reading-the-series",
			"content": "Duration series answer \"how slow\": `http_request_duration`, `model_query_duration`, `job_duration`, `task_duration`, `ssr_duration`, `hydration_duration`."
		},
		{
			"heading": "reading-the-series",
			"content": "Gauges answer \"how backed up\": `queue_depth`."
		},
		{
			"heading": "reading-the-series",
			"content": "The two cache counters read together as a ratio."
		},
		{
			"heading": "reading-the-series",
			"content": "Pair a volume series with its duration series and a failure counter, and a dashboard slice becomes a diagnosis: a route with rising volume, rising p99, and a nonzero error ratio is a route under stress; a route with flat volume and rising p99 is a regression."
		},
		{
			"heading": "queue-depth",
			"content": "`queue_depth` is the canary metric for background health. It is reported per queue and reflects pending work at the moment of the flush. A flat, healthy baseline with spikes on deploys and daily batch work is normal; a queue that climbs monotonically while jobs fail is your earliest signal that something downstream is stuck. Cross-check it with `job_failures_total` and `job_duration` — a full queue plus failure spikes is a poisoned worker; a full queue with healthy jobs is a throughput problem downstream."
		},
		{
			"heading": "cache-hit-rate",
			"content": "Cache health is expressed as a ratio of two counters:"
		},
		{
			"heading": "cache-hit-rate",
			"content": "Both counters are labeled by `layer` and `key prefix`, so you can compare the effectiveness of page-level route caching against model cache against the client cache — and, within a layer, against a specific prefix such as posts. Watch the ratio per prefix: a prefix that drops to near-zero hit rate after a deploy usually means an invalidation rule is too eager, and the cache is being cleared faster than it fills."
		},
		{
			"heading": "request-latency",
			"content": "`http_request_duration` is the direct observable for what users experience. Because it is labeled by route, method, and status, you can distinguish a slow-but-200 endpoint from an endpoint that is slow because it is failing. Watch the tail (p95 and p99) rather than the mean: means hide one slow query among hundreds of fast ones, while the tail catches exactly the requests users complain about."
		},
		{
			"heading": "model-query-metrics",
			"content": "Model query series decompose the latency story one level down. Where `http_request_duration` says a route is slow, `model_query_duration` says which operation on which model is accountable — join them on the same span data from Tracing. `model_queries_total` by `op` also reveals N+1 patterns in the aggregate: a `list` route that issues far more `get` queries per request than the code appears to is a signal to re-read the relations, not the metrics."
		},
		{
			"heading": "where-to-consume-them",
			"content": "Three consumption paths exist for the same series:"
		},
		{
			"heading": "where-to-consume-them",
			"content": "**Dashboards** — point your metrics pipeline at the exporter endpoint and build views for traffic, latency, queue depth, and cache effectiveness."
		},
		{
			"heading": "where-to-consume-them",
			"content": "**Alerting** — thresholds configured in the telemetry config emit events to a webhook channel when crossed. For example, a `jobFailureRate` threshold of `0.05` fires when job failures exceed five percent, and the event composes with the notifications module."
		},
		{
			"heading": "where-to-consume-them",
			"content": "**Development** — the dev overlay and `kwiva console` expose a live view of the same counters, so you can watch series change as you exercise routes locally."
		},
		{
			"heading": "where-to-consume-them",
			"content": "The three paths consume the same points, so a value that cracks a dashboard threshold and an alerting threshold is the same number — no dashboard-specific accumulation to reconcile."
		},
		{
			"heading": "sampling-in-production",
			"content": "Trace sampling does not reduce data you lose — it reduces collection cost proportionally. Production guidance is a `sampleRate` of `0.1` (ten percent of traffic), which is enough to detect latency regressions and failure spikes while keeping export volume manageable. Metrics are aggregated, not per-request, so they are effectively always-on regardless of sample rate."
		},
		{
			"heading": "sampling-in-production",
			"content": "> \\[!NOTE]\n> With no exporters configured, everything here — the pipeline, the series, the interval — runs as a no-op. Metrics cost you nothing until you point an exporter at them; when you do, the series above start leaving the process within one flush interval."
		},
		{
			"heading": "whats-next",
			"content": "Tracing — the span tree that explains what the counters measure"
		},
		{
			"heading": "whats-next",
			"content": "Logging — the correlated detail behind any metric anomaly"
		},
		{
			"heading": "whats-next",
			"content": "Dev Overlay — watch live series during development"
		},
		{
			"heading": "whats-next",
			"content": "Background Work — queue depth and job series in depth"
		},
		{
			"heading": "whats-next",
			"content": "Configuration — tune `interval`, `sampleRate`, and exporters"
		}
	],
	"headings": [
		{
			"id": "the-metrics-pipeline",
			"content": "The Metrics Pipeline"
		},
		{
			"id": "series-definitions",
			"content": "Series Definitions"
		},
		{
			"id": "reading-the-series",
			"content": "Reading the Series"
		},
		{
			"id": "queue-depth",
			"content": "Queue Depth"
		},
		{
			"id": "cache-hit-rate",
			"content": "Cache Hit Rate"
		},
		{
			"id": "request-latency",
			"content": "Request Latency"
		},
		{
			"id": "model-query-metrics",
			"content": "Model Query Metrics"
		},
		{
			"id": "where-to-consume-them",
			"content": "Where to Consume Them"
		},
		{
			"id": "sampling-in-production",
			"content": "Sampling in Production"
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
		url: "#the-metrics-pipeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Metrics Pipeline" })
	},
	{
		depth: 2,
		url: "#series-definitions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Series Definitions" })
	},
	{
		depth: 2,
		url: "#reading-the-series",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Reading the Series" })
	},
	{
		depth: 2,
		url: "#queue-depth",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Queue Depth" })
	},
	{
		depth: 2,
		url: "#cache-hit-rate",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Cache Hit Rate" })
	},
	{
		depth: 2,
		url: "#request-latency",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Request Latency" })
	},
	{
		depth: 2,
		url: "#model-query-metrics",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Model Query Metrics" })
	},
	{
		depth: 2,
		url: "#where-to-consume-them",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where to Consume Them" })
	},
	{
		depth: 2,
		url: "#sampling-in-production",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Sampling in Production" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva records metrics at every boundary the framework owns, then samples and exports them on a fixed interval through the same telemetry pipeline as tracing and logs. Like the rest of observability, metrics are zero-code: they exist because you used framework APIs, and they require no explicit instrumentation." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-metrics-pipeline",
			children: "The Metrics Pipeline"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pipeline works in four stages:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Record" }), " — framework layers increment counters and observe durations at natural boundaries: an HTTP response completes, a query returns, a job finishes, a cache lookup resolves, a task runs, a page prerenders."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Sample" }), " — the metric runtime aggregates values in memory."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Flush" }),
				" — on the configured ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "interval" }),
				" (default ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "10_000" }),
				" milliseconds), point-in-time values are exported."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Forward" }), " — data leaves through the configured exporters for your collector, dashboard, and alerting stack."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The interval setting lives in the telemetry config:" }),
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "With no exporters configured, metric collection runs as a no-op with negligible overhead — a dev machine or single instance pays nothing until you enable forwarding." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "series-definitions",
			children: "Series Definitions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Series" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Kind" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Labels" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it tells you" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http_requests_total" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Total counter" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "route" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "method" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "status" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Traffic volume and error ratio per route" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http_request_duration" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Duration" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "route" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "method" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "status" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Latency distribution per route" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "model_queries_total" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Total counter" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "model" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "op" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Query volume per model operation" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "model_query_duration" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Duration" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "model" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "op" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Query latency per model operation" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue_depth" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Gauge" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pending work waiting on each queue" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "job_duration" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Duration" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "job" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Execution time per job type" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "job_failures_total" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Total counter" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "job" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Failure volume per job type" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache_hits_total" }),
					" / ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache_misses_total" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Total counter" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "layer" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "key prefix" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cache effectiveness per layer" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task_runs_total" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Total counter" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run volume per scheduled task" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task_duration" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Duration" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Execution time per scheduled task" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ssr_duration" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Duration" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "route" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server-side render time per route" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "hydration_duration" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Duration" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "route" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Client hydration time per route" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each series carries enough labels to slice by route, model, queue, or task without losing the ability to roll up to a global view." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "reading-the-series",
			children: "Reading the Series"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The series split cleanly between ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "volume" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "health signals" }),
			":"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "_total" }),
				" counters answer \"how much\": ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http_requests_total" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "model_queries_total" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "job_failures_total" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task_runs_total" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Duration series answer \"how slow\": ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http_request_duration" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "model_query_duration" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "job_duration" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task_duration" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ssr_duration" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "hydration_duration" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Gauges answer \"how backed up\": ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue_depth" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The two cache counters read together as a ratio." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Pair a volume series with its duration series and a failure counter, and a dashboard slice becomes a diagnosis: a route with rising volume, rising p99, and a nonzero error ratio is a route under stress; a route with flat volume and rising p99 is a regression." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "queue-depth",
			children: "Queue Depth"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue_depth" }),
			" is the canary metric for background health. It is reported per queue and reflects pending work at the moment of the flush. A flat, healthy baseline with spikes on deploys and daily batch work is normal; a queue that climbs monotonically while jobs fail is your earliest signal that something downstream is stuck. Cross-check it with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "job_failures_total" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "job_duration" }),
			" — a full queue plus failure spikes is a poisoned worker; a full queue with healthy jobs is a throughput problem downstream."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "cache-hit-rate",
			children: "Cache Hit Rate"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Cache health is expressed as a ratio of two counters:" }),
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
			title: "cache-hit-rate.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "cache hit rate = cache_hits_total / (cache_hits_total + cache_misses_total)" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Both counters are labeled by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "layer" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "key prefix" }),
			", so you can compare the effectiveness of page-level route caching against model cache against the client cache — and, within a layer, against a specific prefix such as posts. Watch the ratio per prefix: a prefix that drops to near-zero hit rate after a deploy usually means an invalidation rule is too eager, and the cache is being cleared faster than it fills."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "request-latency",
			children: "Request Latency"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http_request_duration" }), " is the direct observable for what users experience. Because it is labeled by route, method, and status, you can distinguish a slow-but-200 endpoint from an endpoint that is slow because it is failing. Watch the tail (p95 and p99) rather than the mean: means hide one slow query among hundreds of fast ones, while the tail catches exactly the requests users complain about."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "model-query-metrics",
			children: "Model Query Metrics"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Model query series decompose the latency story one level down. Where ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http_request_duration" }),
			" says a route is slow, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "model_query_duration" }),
			" says which operation on which model is accountable — join them on the same span data from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Tracing"
			}),
			". ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "model_queries_total" }),
			" by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "op" }),
			" also reveals N+1 patterns in the aggregate: a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "list" }),
			" route that issues far more ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "get" }),
			" queries per request than the code appears to is a signal to re-read the relations, not the metrics."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-to-consume-them",
			children: "Where to Consume Them"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Three consumption paths exist for the same series:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Dashboards" }), " — point your metrics pipeline at the exporter endpoint and build views for traffic, latency, queue depth, and cache effectiveness."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Alerting" }),
				" — thresholds configured in the telemetry config emit events to a webhook channel when crossed. For example, a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "jobFailureRate" }),
				" threshold of ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "0.05" }),
				" fires when job failures exceed five percent, and the event composes with the notifications module."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Development" }),
				" — the dev overlay and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva console" }),
				" expose a live view of the same counters, so you can watch series change as you exercise routes locally."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The three paths consume the same points, so a value that cracks a dashboard threshold and an alerting threshold is the same number — no dashboard-specific accumulation to reconcile." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "sampling-in-production",
			children: "Sampling in Production"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Trace sampling does not reduce data you lose — it reduces collection cost proportionally. Production guidance is a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sampleRate" }),
			" of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "0.1" }),
			" (ten percent of traffic), which is enough to detect latency regressions and failure spikes while keeping export volume manageable. Metrics are aggregated, not per-request, so they are effectively always-on regardless of sample rate."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!NOTE]\nWith no exporters configured, everything here — the pipeline, the series, the interval — runs as a no-op. Metrics cost you nothing until you point an exporter at them; when you do, the series above start leaving the process within one flush interval." }),
			"\n"
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
				href: "/docs/observability/tracing",
				children: "Tracing"
			}), " — the span tree that explains what the counters measure"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/logging",
				children: "Logging"
			}), " — the correlated detail behind any metric anomaly"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/dev-overlay",
				children: "Dev Overlay"
			}), " — watch live series during development"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/observability",
				children: "Background Work"
			}), " — queue depth and job series in depth"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/configuration",
					children: "Configuration"
				}),
				" — tune ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "interval" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sampleRate" }),
				", and exporters"
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
