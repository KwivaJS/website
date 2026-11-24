# Tracing (/docs/observability/tracing)



# Tracing [#tracing]

## Spans [#spans]

Every handler execution creates a span tree:

```
[request] (correlation id)
├── [middleware]
│   └── [handler] → span
├── [db.query] (kysely)
```

## Exporters [#exporters]

* OpenTelemetry exporter (OTLP) — see research
* Console exporter (dev)

## `observe` API [#observe-api]

`createSpan`, `span`, `withTrace`.

> \[!TIP]
> Only after Phase J.
