# Channels (/docs/realtime/channels)



# Channels [#channels]

```ts title="src/app/http/ws/channels.ts"
import { channel } from "@kwiva/http";

export const NotificationsChannel = channel("notifications.{userId}").policy((user) => !!user);
export const PresenceChannel = channel("presence.{room}");
```

## Policies [#policies]

`channel().policy(fn)` — policy-checked at subscribe time.

## Dynamic segments [#dynamic-segments]

`channel("notifications.{userId}")` — `subscribe("notifications.42")` passes `{userId: "42"}` to policy fn.

## Presence [#presence]

`presence("users.{id}")` — `onJoin`, `onLeave`, `members()`.

## Notes [#notes]

See also [broadcast metadata via Events](/docs/realtime/events).
