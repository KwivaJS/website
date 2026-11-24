# Streaming SSR (/docs/rendering/streaming)



# Streaming SSR [#streaming-ssr]

## Suspense [#suspense]

Plain React Suspense (`<Suspense>`).

## `stream()` (core, `@kwiva/http`) [#stream-core-kwivahttp]

```ts
export const response = stream(async (controller) => {
  controller.enqueue(<Suspense>{promise}</Suspense>); // via fetchPage
});
```

## Client consumption [#client-consumption]

Fetch + `readAsStream` — or use `@kwiva/http` `toSSEResponse`.

> \[!TIP]
> Also see [HTTP Streaming & SSE](/docs/http/streaming).
