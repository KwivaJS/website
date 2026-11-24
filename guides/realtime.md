# How do I enable realtime? (/guides/realtime)



# Enable Realtime [#enable-realtime]

## 1. Define a channel [#1-define-a-channel]

```ts title="src/app/http/ws/channels.ts"
import { channel } from "@kwiva/http";
export const TodoUpdates = channel("todos.updates").policy((user) => !!user);
```

## 2. Hook to events [#2-hook-to-events]

```ts title="src/app/events/todo-updated.ts"
import { defineEvent, broadcast } from "@kwiva/events";
export const TodoUpdated = defineEvent<{ id: string; title: string }>({
  broadcastOn: { module: "todos" },
  broadcastAs: "todos.updated",
});
```

## 3. Client [#3-client]

```tsx
import { useWsSubscription } from "@kwiva/client";
const { data, error, status } = useWsSubscription("TodosUpdates");
```

## 4. Broadcast from server [#4-broadcast-from-server]

```ts
export function broadcastUpdate(todo) { broadcast("todos.updates", todo); }
```

> \[!TIP]
> For non-WS events: [Client-Side Realtime](/docs/realtime/client-usage).
