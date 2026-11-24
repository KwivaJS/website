# Client-Side Realtime (/docs/realtime/client-usage)



# Client-Side Realtime [#client-side-realtime]

`@kwiva/client` — WS hooks.

```tsx
import { useWsSubscription, useConnectionState } from "@kwiva/client";

const { data, error, status, send } = useWsSubscription("NotificationsChannel");
```

## `useConnectionState` — returns `{status}` where status is `"idle"|"active"|"error"`. [#useconnectionstate--returns-status-where-status-is-idleactiveerror]

## Subscriptions [#subscriptions]

`connectRoute(routeId, args, {reconnect?})` — returns `ManagedSocket{send, close, status}`.

## SSE fallback [#sse-fallback]

`toSSEResponse` — fetch loop with `readAsStream`.

## Status enum [#status-enum]

* WS: `idle | active | error | completed`
* Connections: `idle | connecting | connected | disconnected`

> \[!TIP]
> With @kwiva/events, see [Events & Broadcasting](/docs/realtime/events).
