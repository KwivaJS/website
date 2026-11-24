# Queues & Workers (/docs/background-work/queues)



# Queues & Workers [#queues--workers]

## In-memory queue (default) [#in-memory-queue-default]

```ts
import { createMemoryQueue, setDefaultEngine } from "@kwiva/jobs";
setDefaultEngine(createMemoryQueue());
```

## Workers [#workers]

```ts
import { startWorker } from "@kwiva/jobs";
const worker = startWorker({ queues: ["default"], concurrency: 4 });
// later: await worker.stop()
```

## Concurrency [#concurrency]

`concurrency` (default 4) — parallel job executions.

## Polling [#polling]

Workers poll `due(now, queue?)`; default poll 100ms, `maxPollMs` 5s.

## Custom engines [#custom-engines]

`setDefaultEngine/getDefaultEngine/resetDefaultEngine`.

## Outbox [#outbox]

`enqueueOutbox/drainOutbox` — after-commit.

> \[!TIP]
> pg-boss is an opt-in transport (`@kwiva/jobs-pg-boss`).
