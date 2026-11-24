# Realtime (/docs/realtime)



# Realtime [#realtime]

* **Events**: [Events & Broadcasting](/docs/realtime/events)
* **Channels**: [Channels](/docs/realtime/channels)
* **Client-side**: [Client-Side Realtime](/docs/realtime/client-usage)
* **Scaling**: [Scaling Realtime](/docs/realtime/scaling)

## Architecture [#architecture]

```
emitEvent → listener (sync/queued) → broadcast → channel → client hooks
```
