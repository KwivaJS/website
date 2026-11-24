# WebSockets (/docs/http/websockets)



# WebSockets [#websockets]

## Channels [#channels]

```ts title="src/app/http/ws/channels.ts"
import { channel, broadcast, presence } from "@kwiva/http";

export const MessagesChannel = channel("messages").policy((user) => !!user);
export const OnlinePresence = presence("users:{id}").onJoin(...).onLeave(...).room("lobby");
```

## WS routes [#ws-routes]

```ts
export const ChatController = defineController({
  prefix: "/ws/chat",
  routes(api) {
    api.ws("/messages", {
      handler: async function* (ctx) {
        // yield per incoming message
        await handleIncoming(ctx.message);
      },
    });
  },
});
```

## Broadcasts [#broadcasts]

```ts title="src/app/http/ws/broadcast.ts"
export function broadcastNewTodo(todo) { broadcast("todo.new", todo); }
```

`broadcast(name, payload)` — hub-level; `topicCount(topic)`.

## Presence [#presence]

`Presence{pattern, onJoin, onLeave, room(key), join(key, user), leave(key, userId), members(key)}` — auto-leave on close.

## `AsyncQueue` [#asyncqueue]

`AsyncQueue<T>` — `push/take/close`.

## Event bridge (`@kwiva/events`) [#event-bridge-kwivaevents]

`broadcastEvent(event, data, overrides)` / `emitAndBroadcast` — maps `event.broadcastOn` → channel + `async fn` returning channel names.

## Client [#client]

* SSE fallback (`toSSEResponse` on client) — fetch loop
* `@kwiva/client` `useWsSubscription`

## Scaling [#scaling]

* In-process hub; single instance recommended for chat; multi-instance coordination requires adapter (external queue for ws).

> \[!TIP]
> `mountWsRoutes(app, routes, appCtx)` at boot; channels by name.
