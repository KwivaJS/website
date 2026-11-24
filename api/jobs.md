# @kwiva/jobs (/api/jobs)



# @kwiva/jobs [#kwivajobs]

Queue/jobs package: `defineJob`/`defineTask`, dispatch, workers, middleware, unique keys, durable outbox, priority, observability.

## Define [#define]

| Symbol                                             | Kind     | Signature                                                                                         |
| -------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `defineJob<TInput>(options)`                       | function | frozen `Job<TInput>` (tries ≥ 1, backoff ≥ 0, timeoutMs > 0, jitter default true)                 |
| `defineTask(options)`                              | function | `Task{kind:"task", schedule?, description?, preventOverlapping, onSuccess?, onFailure?, handler}` |
| `validateJobInput(job, raw)`                       | function | → validated input                                                                                 |
| `computeBackoffDelay(job, failedAttempt, random?)` | function | fixed/exponential, capped, jittered                                                               |

## Dispatch [#dispatch]

| Symbol                                     | Kind      | Signature                                                    |
| ------------------------------------------ | --------- | ------------------------------------------------------------ |
| `dispatch(job, input, opts?)`              | function  | → `Promise<string>` (record id)                              |
| `dispatchAfterResponse(job, input, opts?)` | function  | void (after-response scope)                                  |
| `dispatchSync(job, input, opts?)`          | function  | → result (1 attempt, no retries)                             |
| `dispatchChain(entries, opts?)`            | function  | sequential; `ChainResult{ok, results, failedIndex?, error?}` |
| `dispatchBatch(options)`                   | function  | → `BatchResult{ok, results, errors, skipped, handle}`        |
| `setDispatcher(fn)` / `resetDispatcher()`  | functions | fakeQueue seam                                               |

## Queue [#queue]

| Symbol                                                                                                                            | Kind      | Signature                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `createMemoryQueue(options?)`                                                                                                     | function  | `MemoryQueue{enqueue, due(now, queue?), ack, fail, has, size(queue?), pending(), failures(), clear()}` |
| `uniqueOwner(key, now?)` / `claimUnique/releaseUnique/settleUnique/clearUnique`                                                   | functions | dedupe ledger                                                                                          |
| `createJobCipher(key)` → `{encrypt, decrypt}`; `setJobCipher/getJobCipher`; `encryptJobInput/decryptJobInput/isEncryptedJobInput` | functions | AES-256-GCM                                                                                            |
| `enqueueOutbox(job, input, opts?)` / `drainOutbox(opts?)` / `getOutboxStore/setOutboxStore/resetOutboxStore`                      | functions | transactional outbox                                                                                   |
| `setDefaultEngine/getDefaultEngine/resetDefaultEngine`, `setConnectionPriorities/...`                                             | functions | engine seams                                                                                           |

## Worker + scheduler [#worker--scheduler]

| Symbol                                                                   | Kind      | Signature                                    |
| ------------------------------------------------------------------------ | --------- | -------------------------------------------- |
| `startWorker({queues?, concurrency = 4, pollMs = 100, ...})`             | function  | → `WorkerHandle{stop, stats, stopWhenEmpty}` |
| `executeWithRetry(job, input, opts?)`                                    | function  | → `RetryResult{ok, value/error, attempts}`   |
| `defaultSleeper(ms)`                                                     | function  | —                                            |
| `parseCron(expr)`, `isDue(expr, date, tz?)`, `nextRun(expr, from?, tz?)` | functions | 5-field cron + `@yearly`..`@minutely` macros |
| `startScheduler({tasks, tickMs?, timezone?})`                            | function  | → `{tick, stop}`                             |

## Middleware [#middleware]

`throttle(key, options)` (max, windowMs, releaseMs) — over limit → `JobReleaseError{delayMs}`; `withoutOverlap(key, options?)` (`{releaseMs?, ttlMs?}`); `skipIfBatchCancelled()`; `clearThrottleBuckets/clearOverlapLocks/markBatchCancelled/isBatchCancelled/clearBatchCancelled`.

## Failed + observability [#failed--observability]

| Symbol                                                                      | Kind      | Signature                                                                                   |
| --------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| `failedJobs()`                                                              | function  | append-only registry (`FailedJob{id, queue, attempts, input, error, errorCode?, failedAt}`) |
| `recordFailed/removeFailed/pruneFailed/clearFailed`                         | functions | —                                                                                           |
| `retryFailed(id, opts?)`, `retryAllFailed(opts?)`, `describeFailure(error)` | functions | —                                                                                           |
| `queueMetrics(engine?)`                                                     | function  | `QueueMetrics{pending, pendingByQueue, failed, processed, succeeded, inFlight, workers}`    |
| `onJobEvent(event, handler)` / `offJobEvent` / `clearJobEvents`             | functions | `JobEvent ∈ "processing"\|"retrying"\|"processed"\|"failed"`                                |

## Batch [#batch]

`createBatchRecord(total)`, `getBatchRecord(id)`, `batchProgress(id)`, `cancelBatch(id)`, `isBatchRecordCancelled(id)`, `clearBatchRecord(id)`, `clearBatchRecords()`, `BatchProgress{total, pending, completed, failed, skipped, cancelled}`.

## Testing [#testing]

| Symbol        | Kind     | Signature                                                                                                                 |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `fakeQueue()` | function | → `QueueFake{dispatched, assertDispatched, assertNotDispatched, assertNothingDispatched, assertDispatchedCount, restore}` |

## Usage [#usage]

```ts title="src/app/jobs/send-welcome.ts"
import { defineJob } from "@kwiva/jobs";
import { dispatch } from "@kwiva/jobs";
import { sendWelcomeMail } from "@kwiva/mail";

export const SendWelcomeJob = defineJob({
  handler(input) {
    sendWelcomeMail(input.userId);
  },
  onSuccess() {
    // audit
  },
});

await dispatch(SendWelcomeJob, { userId: 123 }, { delayMs: 5000 });
```

> \[!TIP]
> `kwiva dev` picks up jobs automatically; workers run via `startWorker({queues: ["default"]})`.
