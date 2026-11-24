# Job Observability (/docs/background-work/observability)



# Job Observability [#job-observability]

## Metrics [#metrics]

```ts
import { queueMetrics } from "@kwiva/jobs";
queueMetrics(); // {pending, pendingByQueue, failed, processed, succeeded, inFlight, workers}
```

## Events [#events]

`onJobEvent(event, handler)` — events: `processing | retrying | processed | failed`.

## Failed jobs [#failed-jobs]

`failedJobs()` — `FailedJob{id, queue, attempts, input, error, errorCode?, failedAt}`.

## Retry [#retry]

`retryFailed(id)`, `retryAllFailed()`.

## Logs [#logs]

`ctx.logger` in worker — structured JSON via `@kwiva/core` logger.

## Dev overlay [#dev-overlay]

Available in dev — see [Dev Overlay](/docs/observability/dev-overlay).
