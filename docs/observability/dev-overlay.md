# Dev Overlay (/docs/observability/dev-overlay)



# Dev Overlay [#dev-overlay]

Available during `kwiva dev`: a live timeline of requests, spans, errors, DB queries, and cache activity.

## How to enable [#how-to-enable]

Set `DEBUG=1` or add `devOverlay` to `src/config/app.ts`:

```ts
export default defineConfig({
  // @ts-expect-error dev-only
  devOverlay: true,
});
```

## Panels [#panels]

* Request timeline (HTTP + WS)
* Span waterfall
* Error list (located)
* DB query log
* Cache hit/miss

## Related [#related]

* [Logging](/docs/observability/logging)
* [Tracing](/docs/observability/tracing)
* [Metrics](/docs/observability/metrics)
