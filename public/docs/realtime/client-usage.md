# Client-Side Realtime (/docs/realtime/client-usage)



The client side of Kwiva's realtime stack is built around typed hooks. Subscribing to a channel is a hook call; presence is a hook call; and every handler you pass receives payloads typed from the server's event definitions. No channel bookkeeping, no manual socket management, no stringly-typed payloads. The hooks live in `@kwiva/react` and sit on top of the same typed client the rest of your frontend uses, so the realtime surface and the REST surface share one type story.

## Subscribing with Hooks [#subscribing-with-hooks]

`useChannel` subscribes the component to a channel and provides the payload handling you wire to app state:

```tsx title="subscribing-with-hooks.tsx"
import { useChannel } from '@kwiva/react'

const { messages, send } = useChannel(`chat.${roomId}`, {
  onMessage: (m) => setMessages((prev) => [...prev, m]),
})
```

The channel name is passed in with its dynamic segment resolved (`chat.42`), the `onMessage` handler receives payloads typed from the server definitions, and `send` pushes a message back onto the channel. The subscription follows the component lifecycle — subscribe on mount, unsubscribe on unmount — and the hook re-subscribes when the channel name changes, so navigating between rooms requires no cleanup code.

Because the payload type comes from the event definitions, a change to an event's fields retypes every client handler at compile time — an `onMessage` that destructures a renamed field fails to build instead of failing at runtime.

| Value      | What it gives you                                                                   |
| ---------- | ----------------------------------------------------------------------------------- |
| `messages` | The incoming payload list for the channel, appended by `onMessage`                  |
| `send`     | The typed writer: accepts the channel's payload shape and hands it to the transport |

## Channel Lifecycle in a Component [#channel-lifecycle-in-a-component]

`useChannel` is lifecycle-aware, so the component never sees transient states as errors:

* Mount subscribes; unmount unsubscribes.
* Changing the channel name re-subscribes to the new channel with the same handler.
* Disconnects and reconnects are handled by the hook's reconnection logic.
* While disconnected, the component keeps rendering; messages resume on reconnect.

A single prop change from `chat.41` to `chat.42` moves the subscription without tearing down the component, and without any effect-cleanup boilerplate in your code. The hook handles subscribe/cleanup/resubscribe as one concern, which is the part that is identical for every component.

## Sending Messages [#sending-messages]

`send` is the typed writer side of a channel. It accepts the channel's payload shape and returns once the message is handed to the transport:

```tsx title="sending-messages.tsx"
const { messages, send } = useChannel(`chat.${roomId}`)

const submit = async (text: string) => {
  await send({ type: 'message', body: text })
}
```

Sending is validated on the server before broadcast, matching the security boundary: a malformed message is rejected at the channel, never echoed to the room. If the subscription was refused during the handshake, `send` surfaces that failure rather than pretending the channel exists.

## Reading Presence (v1.x) [#reading-presence-v1x]

Channels with presence enabled expose their member set through a dedicated hook:

```tsx title="reading-presence-v1.tsx"
import { usePresence } from '@kwiva/react'

const { members } = usePresence(`chat.${roomId}`)
```

The member set updates as clients join and leave, which powers online indicators and "who is here" panels without custom bookkeeping. Presence is part of the realtime fast-follow and layers cleanly onto the same channel definitions — enable `.presence(true)` on the channel and the hook has data to read.

## A Complete Component [#a-complete-component]

Putting the pieces together, a chat room is a small, fully typed component:

```tsx title="a-complete-component.tsx"
function Room({ roomId }: { roomId: string }) {
  const { messages, send } = useChannel(`chat.${roomId}`, {
    onMessage: (m) => enqueue(m),
  })
  const { members } = usePresence(`chat.${roomId}`)

  return (
    <div>
      <aside>{members.map((m) => m.name).join(', ')} online</aside>
      <ul>{messages.map((m) => <li key={m.id}>{m.body}</li>)}</ul>
      <Composer onSubmit={(text) => send({ type: 'message', body: text })} />
    </div>
  )
}
```

The room id flows into both hooks; presence and messages stay in sync because they subscribe to the same channel family, and neither hook needs imperative cleanup.

## Where Types Come From [#where-types-come-from]

Every payload your client handles originates server-side:

| Server definition            | What the client receives                     |
| ---------------------------- | -------------------------------------------- |
| `defineEvent` payload fields | Typed `onMessage` payloads                   |
| Channel message schemas      | Validated `send` payloads                    |
| Channel policy               | Whether the subscription is permitted at all |

There is no client-side schema file to keep in sync. Rename a field in an event definition and the client type improves — or breaks — automatically, which removes an entire class of "server says one shape, client expects another" bugs.

## Streaming Subscriptions [#streaming-subscriptions]

Channel subscriptions are also available imperatively through the typed client, which is useful outside components — in services, stores, or non-React frontends:

```ts title="streaming-subscriptions.ts"
const feed = client.chat.stream(`chat.${roomId}`)
```

The stream surfaces incoming payloads as they arrive and stays typed against the channel's definitions. Inside a component, the hook is the recommendation; when you need programmatic control — wiring into a state library, aggregating across several channels, or subscribing from a non-React page — the stream is the escape hatch.

## SSE Fallback [#sse-fallback]

WebSockets are the primary transport, but not every environment can carry them — some proxies and edge restrictions drop or buffer the upgrade request. When WebSockets are unavailable, clients fall back to server-sent events through the same subscription interface:

```ts title="sse-fallback.ts"
// force SSE when WebSockets are blocked by proxies or edge restrictions
const fallback = client.stream(`chat.${roomId}`)
```

The fallback keeps the same channel semantics: the payloads arriving are the same, and subscription authorization still applies. One-directional feeds where WebSockets would be overkill can use SSE directly from a server route:

```ts title="sse-fallback-2.ts"
c.get('/feed', ({ stream }) => stream((controller) => {
  posts.on('message', (m) => controller.enqueue(m))
  return () => controller.close()
}))
```

This is the recommended shape for news feeds, activity logs, and server-to-client metric pushes — the client learns about new content without polling, and the connection cost is a fraction of a bidirectional socket. Because the client subscription surface is identical across transports, choosing the transport is an operational decision, not a code change.

## Reconnection Behavior [#reconnection-behavior]

Connections are not treated as permanent. On an unexpected drop, the client reconnects with backoff rather than giving up or hammering the server, and — as part of the realtime fast-follow — missed messages are caught up by event id so a client that blinks out and returns does not permanently lose what it missed. The hook keeps the component mounted and rendering through the reconnection, so the UI does not flash error states during a transient network blip.

On deployments where realtime is unavailable entirely, such as fully static output, the client degrades gracefully: hooks simply stop receiving, and the interface stays safe to render.

## Picking a Transport [#picking-a-transport]

| Situation                                | Transport                             |
| ---------------------------------------- | ------------------------------------- |
| Bidirectional interaction, live presence | WebSocket channel                     |
| One-directional feed, limited upgrades   | Server-sent events                    |
| Blocked or capped by proxies or edge     | SSE fallback on the same channel      |
| Fully static deployment                  | Realtime disabled; components degrade |

Because the client subscription surface is the same across transports, choosing the transport is an operational decision, not a code change. The hooks and streams you write once keep working regardless of which row the deployment topology lands in.

## What's Next [#whats-next]

* [Channels](/docs/realtime/channels) — the definitions these hooks subscribe to
* [Events & Broadcasting](/docs/realtime/events) — the payload types your handlers receive
* [Scaling Realtime](/docs/realtime/scaling) — how subscriptions behave across instances
* [RPC Client](/docs/frontend/rpc-client) — the typed client behind streaming subscriptions
* [Data Hooks](/docs/frontend/data-hooks) — query hooks for the records channels announce
