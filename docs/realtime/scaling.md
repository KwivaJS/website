# Scaling Realtime (/docs/realtime/scaling)



# Scaling Realtime [#scaling-realtime]

## Single instance (recommended) [#single-instance-recommended]

Simple hub in `@kwiva/http` — `broadcast`, `subscribe`, `topicCount`, `resetHub`.

## Multi-instance [#multi-instance]

Requires: external broker or partitioned queues for broadcast; coordination via `presence` maps; zero-downtime redeploys via WS close codes.

> \[!TIP]
> For chat, in-process hub suffices. For global notifications, use DB outbox + polling loop as fallback.
