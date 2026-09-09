# ADR-0014 — OpenTelemetry-First Observability

**Status**: Accepted · **Updated**: 2026-09-08

## Context

Kwiva apps need consistent traces, metrics, logs, and error surfaces across server, data, queues, tasks, and optional client — with pluggable backends (OTLP, Sentry, Prometheus, vendor consoles).

## Decision

**OpenTelemetry-first** instrumentation as the single contract:
- Spans/metrics woven at: the request lifecycle (owned pipeline), handlers, model layer (`db.*`), queue/tasks (`queue.*`, `task.*`), cache (hit/miss), realtime, and (opt-in) browser Web Vitals.
- Exporters pluggable via `telemetry.exporters` (`otlp`, `console`, `prometheus:/metrics`, custom); `KWIVA_OTEL_EXPORTERS` env respected.
- Structured JSON logs with requestId/traceId correlation; semantic-versioned attribute keys forward-compatible with vendor dashboards.
- Cost guardrails: sampling config, bounded cardinality route tags, error-span always sampled.

## Consequences

- Observability works out of the box against any OTel backend; avoids per-vendor SDK sprawl.
- Adds dependency surface (otel SDK) — pinned + tree-shaken when `telemetry.disabled`.
- Requires discipline (attribute naming, sampling) documented to keep data useful.

**Related**: ADR-0013, `docs/framework/engineering/03-observability.md`, `docs/framework/server/01-request-lifecycle.md`