# Observability (/docs/observability)



Kwiva's observability layer is woven through the framework surface rather than bolted on. Because requests, model queries, jobs, tasks, events, and page renders all pass through framework-owned machinery, the tracing runtime, the structured logger, and the metrics pipeline capture data automatically. You get telemetry because you used the framework APIs — not because you instrumented your code.

When a request arrives, a single correlation story unfolds across the stack: the `request-id` middleware assigns a correlation ID, the session and tenant middleware attach context, the route schema is validated, the controller runs, and each model query is traced. By the time the response leaves, one `requestId` and one `traceId` bind every log line, span, and metric for that call.

## The Correlation Story [#the-correlation-story]

A production request rarely stays in one place. Kwiva makes every hop visible and slotable into a single narrative:

```text title="the-correlation-story.txt"
request arrives
  ├─ request-id middleware assigns a correlation ID
  ├─ session and tenant middleware attach context
  ├─ route schema is validated
  ├─ handler runs
  │   └─ every model query is traced
  └─ response completes and logs its status and duration
```

Every log line emitted inside that scope carries `requestId`, `traceId`, and `spanId`, so you can start from a user report, grab the correlation ID from the `x-request-id` header, and follow the whole request through logs, spans, and metrics.

## The Three Pillars [#the-three-pillars]

Observability in Kwiva ships as three tightly coupled surfaces, plus a development overlay:

* **Tracing** — every request becomes a tree of spans, from middleware through the handler and into every model query. Jobs, tasks, events, MCP tool calls, and SSR renders are traced the same way.
* **Logging** — structured, JSON-by-default logs with request, tenant, and user correlation attached automatically.
* **Metrics** — counters and duration series for HTTP traffic, model queries, queue depth, cache hit rate, tasks, and SSR, sampled on an interval and exported to your pipeline.

The fourth surface — the development overlay — turns the same data into an in-flight view of your app while you work.

## Zero-Config Defaults [#zero-config-defaults]

Observability follows the rest of the framework's posture: it works out of the box, and you opt into more. A freshly scaffolded application ships with:

* A request span tree per request, with span attributes for the request, session, tenant, route schema validation, controller, model queries (normalized SQL, redacted parameters), cache lookups, and response status and size
* Structured JSON logs with correlation fields on every line that falls inside a request, job, task, or event scope
* Metric series recorded at every framework boundary and flushed on a configured interval

When no exporters are configured, all of it runs as a **no-op with negligible overhead** — dev machines and single-instance apps pay nothing until you point telemetry at something. Data only leaves the process when you configure an exporter. See [Tracing](/docs/observability/tracing) for the span tree, [Logging](/docs/observability/logging) for the log schema, and [Metrics](/docs/observability/metrics) for the series.

## Beyond the Process [#beyond-the-process]

Telemetry exports through the OpenTelemetry contract — traces and metrics over OTLP to a collector-compatible endpoint by default:

```ts title="src/config/telemetry.ts"
// src/config/telemetry.ts
export default defineConfig('telemetry', {
  defaults: {
    sampleRate: 1.0,                     // dev 1.0; production guidance 0.1
    exporters: { otlp: { endpoint: 'http://collector:4318' } },
    logs: { level: 'info', pretty: true /* dev */ },
    metrics: { interval: 10_000 },
  },
})
```

One configuration file drives the whole pipeline: sampling, exporters, log level, and metric flush interval. The same `defineConfig` pattern you use for database and security settings owns telemetry, and the collectible surface is consistent regardless of which vendor consumes it — your spans and metrics are vendor-neutral until the export step.

## Health Endpoints [#health-endpoints]

Every application ships two health endpoints:

* `/healthz` — liveness. Returns OK when the process is up.
* `/readyz` — readiness. Pings the database, the queue, and storage, and returns OK only when all configured dependencies respond.

Readiness is the right signal for orchestrators and load balancers; liveness is the right signal for process supervisors. Both are documented on [Tracing](/docs/observability/tracing).

## Which Data Flows Where [#which-data-flows-where]

The three pillars split cleanly by consumer:

| Data                | Consumed by                                                    |
| ------------------- | -------------------------------------------------------------- |
| Traces (span trees) | Local debugging, distributed investigations, latency forensics |
| Logs (JSON lines)   | Log stores, correlation lookups, terminal work                 |
| Metrics (series)    | Dashboards, alerting, capacity planning                        |

The same underlying events feed all three from the shared tracing runtime — a request is one event that publishes a span, log lines, and counter increments. There is no second instrumentation pass to keep the pillars in agreement.

## Design Principles [#design-principles]

Three principles keep observability safe to ship everywhere:

1. **Zero-code telemetry.** Spans, log lines, and metrics exist because you used framework APIs, never because you wired up instrumentation by hand.
2. **Never break the app for telemetry.** Exporter failures are swallowed and counted. If your collector is down, the app keeps serving.
3. **PII discipline.** Span attributes carry user IDs, not emails, by default. Query text is normalized and parameter values are redacted — full-text values never appear in spans.

## The Development Surface [#the-development-surface]

The same telemetry that feeds a collector renders in the development overlay while you work — request timeline, span waterfall, errors with their correlation IDs, and the query list. You can also read it programmatically in the `kwiva console` REPL:

```text title="the-development-surface.txt"
app.trace.last()      // the most recent span tree
app.logs.tail(20)     // the last 20 log lines
```

The dev overlay is documented on its own page, and the guarantee it makes is the same one production makes: the data you debug with locally is the data that flows to your collector later — nothing extra to implement to graduate.

## From Signals to Answers [#from-signals-to-answers]

Telemetry is the raw material; the framework also helps turn signals into answers. Because spans, logs, and metrics share one schema, the debugging workflow is short regardless of scale:

1. A report arrives with a `requestId` (or you grab `x-request-id` from the failing response)
2. Log lookup resolves the request to its `traceId`, and all background work joins the same trace
3. The span waterfall identifies the accountable layer — the model query, a cache miss, or a third-party hop
4. The correlated series confirm the pattern at volume: a one-off failure trace is an incident; a rising failure counter is a trend

Good telemetry shortens the loop between "something is slow" and "here is the span and the query." This documentation shows the whole path.

## At a Glance [#at-a-glance]

| Page                                           | What it covers                                                         |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| [Logging](/docs/observability/logging)         | Structured JSON logs, correlation IDs, log levels, adding context      |
| [Tracing](/docs/observability/tracing)         | Span trees, model query spans, distributed context, health endpoints   |
| [Metrics](/docs/observability/metrics)         | HTTP, query, queue, cache, task, and SSR series; where to consume them |
| [Dev Overlay](/docs/observability/dev-overlay) | Request timeline, span waterfall, query list, server timing            |

## What's Next [#whats-next]

* [Logging](/docs/observability/logging) — see the default log schema and correlation fields
* [Tracing](/docs/observability/tracing) — follow a request through its span tree
* [Metrics](/docs/observability/metrics) — explore the built-in metric series
* [Dev Overlay](/docs/observability/dev-overlay) — learn what you see while developing
* [Background Work](/docs/background-work) — how jobs, queues, and tasks are traced
