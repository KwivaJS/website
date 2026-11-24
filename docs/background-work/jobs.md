# Jobs (/docs/background-work/jobs)



# Jobs [#jobs]

## defineJob [#definejob]

```ts title="src/app/jobs/send-welcome.ts"
import { defineJob } from "@kwiva/jobs";

export const SendWelcomeJob = defineJob({
  handler(input) {
    // do work
  },
  onSuccess() { /* audit */ },
  onFailure() { /* retry/audit */ },
});
```

## Job options (full) [#job-options-full]

| Field         | Notes                                               |
| ------------- | --------------------------------------------------- |
| `queue`       | target queue (default `default`)                    |
| `tries`       | max attempts (default 5)                            |
| `backoff`     | `{strategy: "fixed"\|"exponential", baseMs, maxMs}` |
| `timeoutMs`   | —                                                   |
| `jitter`      | default true                                        |
| `unique`      | `{key(input), ttlMs?}`                              |
| `afterCommit` | run after response                                  |
| `priority`    | queue priority                                      |
| `encrypted`   | AES-256-GCM payload                                 |
| `middleware`  | `[throttle, withoutOverlap, ...]`                   |
| `input`       | Standard Schema for input validation                |

## Dispatch [#dispatch]

`dispatch(job, input, {queue?, delayMs?, runAt?, priority?, afterCommit?})` → `Promise<string>` (record id).

`dispatchSync(job, input)` — one attempt, throws on failure.

## Retry logic [#retry-logic]

On failure: decrement tries, requeue with backoff; `JobReleaseError{delayMs}` — for manual retry.

## Idempotency [#idempotency]

`unique: {key(input), ttlMs}` — dedupes; `claimUnique/releaseUnique/settleUnique`.

## Dead letters [#dead-letters]

On exhausted retries: `failedJobs()`, `retryFailed(id)`.

> \[!TIP]
> `dispatchAfterResponse` — for "send after response" flows.
