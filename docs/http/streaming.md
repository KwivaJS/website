# Streaming & SSE (/docs/http/streaming)



# Streaming & SSE [#streaming--sse]

## Server-side SSE [#server-side-sse]

```ts title="src/app/http/controllers/events.ts"
import { stream } from "@kwiva/http";

api.get("/stream", () => stream(async (controller) => {
  const promise = watchTodos((todo) => controller.enqueue(todo.toJSON()));
  controller.closed = () => { await promise; };
  return () => promise;
}, { heartbeatMs: 15_000, event: "todo" }));
```

## SSE payload format [#sse-payload-format]

`frame(id, event, data)` → `data: <json>\nid: <id>\nevent: <event>\n\n` (only if `event` provided); `controller.closed` on client disconnect.

## Client-side consumption [#client-side-consumption]

```ts title="src/app/ui/pages/events.tsx"
const response = await fetch("/api/events/stream");
const reader = response.body.getReader();
```

Or via `@kwiva/events` (see [Events → broadcast metadata](/docs/realtime/events)).

> \[!TIP]
> `controller.enqueue` is sync-or-async (yields are sent as soon as possible); `controller.close()` ends stream.
