# Engineering 03 — Observability

**Status**: Locked (ADR-0014) · **Updated**: 2026-09-08 · **Docset**: v0.3

OpenTelemetry-first: tracing, structured logging, metrics — woven through the framework surface, zero-config defaults.

## Tracing

Every request gets a tree of spans:

```
http GET /api/posts (server)
 ├─ middleware.request-id
 ├─ middleware.session
 ├─ middleware.tenant
 ├─ validation (route schema)
 ├─ controller posts.list
 │   └─ model posts.query (sql + params normalized)
 ├─ cache.get posts:...
 └─ http.response (status, size)
```

Also traced: jobs (dispatch→run), tasks, events (emit→listener), MCP tool calls, SSR renders (loader/render/stream stages).

```ts
// custom spans in app code
import { trace } from '@kwiva/core'

await trace('billing.recalc', async (span) => {
  span.setAttr('tenantId', tenant.id)
  ...
})
```

## Log schema (structured, JSON by default)

```jsonc
{ "ts": 0, "level": "info", "msg": "request",
  "requestId": "req_01J...", "traceId": "...", "spanId": "...",
  "route": "/api/posts", "method": "GET", "status": 200, "durationMs": 12,
  "tenantId": "tnt_...", "userId": "usr_..." }
```

```ts
import { logger } from '@kwiva/core'
logger.child({ tenantId }).info({ deleted: 3 }, 'cleanup done')
```

Correlation: `requestId` (header `x-request-id`) + OTel `traceId` attach to every log line in scope.

## Metrics (OTel)

| Metric | Labels |
|---|---|
| `http_requests_total`, `http_request_duration` | route, method, status |
| `model_queries_total`, `model_query_duration` | model, op |
| `queue_depth`, `job_duration`, `job_failures_total` | queue, job |
| `cache_hits_total` / `cache_misses_total` | layer, key prefix |
| `task_runs_total`, `task_duration` | task |
| `ssr_duration`, `hydration_duration` | route |

## Exporters

```ts
// src/config/telemetry.ts
export default defineConfig('telemetry', {
  defaults: {
    sampleRate: 1.0,                     // dev 1.0; prod guidance 0.1
    exporters: { otlp: { endpoint: 'http://collector:4318' } },
    logs: { level: 'info', pretty: true /* dev */ },
    metrics: { interval: 10_000 },
  },
})
```

OTLP over HTTP by default (collector-compatible); no exporters configured → no-op with negligible overhead.

## Dev experience

- `kwiva dev` overlay: request timeline, spans waterfall, cache decisions (v1.x).
- `server-timing` headers in dev (`engineering/03` parity: Elysia server-timing plugin).
- `kwiva console`: `app.trace.last()`, `app.logs.tail(20)`.

## Health

- `/healthz` — liveness (process up).
- `/readyz` — readiness (db ping, queue ping, storage ping; configurable list).

## Alerts (v1.x)

Thresholds configured in telemetry (`alerts: { jobFailureRate: 0.05 }`) emit events to a webhook channel — composable with the notifications module.

## Principles

1. Zero-code telemetry: spans/metrics/logs exist because you used framework APIs, not because you instrumented.
2. Never break the app for telemetry: exporter failures are swallowed + counted.
3. PII discipline: user ids, not emails, in span attributes by default; full-text values never in spans (query text is normalized, params redacted).
