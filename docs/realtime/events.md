# Events & Broadcasting (/docs/realtime/events)



# Events & Broadcasting [#events--broadcasting]

```ts title="src/app/events/todo-created.ts"
import { defineEvent } from "@kwiva/events";

export const TodoCreated = defineEvent<{ id: string; title: string }>({
  broadcastOn: { module: "todos" },
  broadcastAs: "todos.created",
  broadcastWith: (data) => ({ id: data.id, title: data.title }),
  broadcastWhen: (data) => !!data.id,
});
```

## Listener [#listener]

```ts title="src/app/listeners/notify-team.ts"
import { defineListener } from "@kwiva/events";
import { TodoCreated } from "@kwiva/events";

export const NotifyTeamListener = defineListener({
  on: TodoCreated,
  queue: { tries: 3, backoffMs: 1000 },
  shouldHandle(data) { return data.title !== "internal"; },
  handle: async (data) => { /* audit, notify */ },
});
```

## Broadcast → channels [#broadcast--channels]

`channelFor(data)` — maps `broadcastOn` to channel names.

## Transactional outbox [#transactional-outbox]

`enqueueOutbox(TodoCreated, data)` — dispatched via `drainOutbox()`.
