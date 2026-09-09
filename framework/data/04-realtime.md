# Data 04 — Realtime: Events, Channels, Broadcast

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

Domain events (in-process + queued), broadcast channels (WebSockets via CrossWS engine), presence, and the client subscription hooks.

## Events

```ts
// src/app/events/message-posted.ts
import { defineEvent } from '@kwiva/events'

export const MessagePosted = defineEvent('message.posted', (f) => ({
  roomId: f.uuid(),
  messageId: f.uuid(),
  tenantId: f.uuid().optional(),
}), {
  broadcast: (e) => `chat.${e.roomId}`,     // → channel name (policy-checked)
  listeners: ['send-webhook', 'update-stats'],
  queued: true,                             // listeners run on the queue
})
```

```ts
await MessagePosted.emit({ roomId, messageId })

// listeners
MessagePosted.on('send-webhook', async (event) => { ... })
// or as files: src/app/events/listeners/send-webhook.ts (auto-discovered)
```

- Wildcards (v1.x): `events.on('user.*', handler)`.
- Transactional outbox (v1.x): emits inside a DB transaction are stored and delivered post-commit — never lost.

## Channels (WebSocket broadcast)

```ts
import { channel } from '@kwiva/http'

export const chat = channel('chat.{roomId}')
  .policy(({ params, session }) => session.user && isMember(session.user, params.roomId))
  .on('message', ({ payload }) => broadcast(payload))
  .presence(true)                          // v1.x: join/leave tracking

// server-side emit
import { broadcast } from '@kwiva/http'
broadcast('chat.42', { type: 'message', ... })
```

- Subscribe auth: policy-checked on upgrade (WS handshake) — same policies as REST.
- Model broadcasts: `Post.onCreated(() => broadcast('posts'))` hook sugar.

## Client subscriptions

```tsx
import { useChannel, usePresence } from '@kwiva/react'

const { messages, send } = useChannel(`chat.${roomId}`, {
  onMessage: (m) => ...,                    // typed payloads from event definitions
})
const { members } = usePresence(`chat.${roomId}`)   // v1.x
```

- Reconnect with backoff; missed-message catch-up via event id (v1.x).
- SSE fallback when WS is unavailable (proxies/edge restrictions) — `client.stream(channel)`.

## Engine mapping

| Environment | Transport |
|---|---|
| bun/node server presets | CrossWS over the server's WS upgrade |
| Cloudflare | Durable Objects (stateful channels) via the preset's ws wiring |
| static | realtime disabled (client degrades gracefully) |

## SSE (server-sent events)

```ts
c.get('/feed', ({ stream }) => stream((controller) => {
  posts.on('message', (m) => controller.enqueue(m))
  return () => controller.close()
}))
```

For one-directional feeds where WS is overkill; same channel policy semantics.

## Broadcast fan-out at scale (v2)

- Redis pub/sub adapter across instances (`src/config/api.ts > broadcast.driver: 'redis'`) — instances subscribe and forward to their local sockets.
