# @kwiva/events (/api/events)



# @kwiva/events [#kwivaevents]

Events package: `defineEvent` (sync/queued, broadcast metadata, channelFor), listeners (`defineListener` with retry/backoff options), subscribers (`defineSubscriber`), config, fakes (`fakeEvents`).

## defineEvent [#defineevent]

```ts
export const TodoCreated = defineEvent<{ id: string; title: string }>({
  broadcastOn: { module: "todos" },
  listeners: { todosChanged: defineListener({ on: TodoCreated, handle: async ({ id }) => { /* audit */ } }) },
});
```

## defineListener [#definelistener]

```ts
export const HandleTodoCreated = defineListener({
  on: TodoCreated,
  queue: { tries: 3, backoff: { maxMs: 60_000 } },
  shouldHandle(payload) { return payload.userId !== "internal"; },
  handle(payload) { /* send mail */ },
  failed(payload, error) { /* audit */ },
});
```

## Subscribers [#subscribers]

`onEvent(TodoCreated, (payload) => {...})` (sync), `defineSubscriber({name: "subscriber", events: [TodoCreated, TodoUpdated]})`.

## Broadcast → channel mapping [#broadcast--channel-mapping]

`broadcastOn: {module, ...}` → WS `channelFor(data)` — see [realtime channels](/docs/realtime/channels).

## Fake [#fake]

```ts
import { fakeEvents, assertEmitted, assertNotEmitted, restoreEvents } from "@kwiva/events";
```

> \[!TIP]
> `defineEvent` is frozen at definition; `queue.tries/backoff` duplicates of job settings — jobs vs events have separate retry systems.
