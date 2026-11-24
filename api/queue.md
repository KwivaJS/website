# Queue (/api/queue)



The `@kwiva/queue` package provides `defineJob`, the factory for background jobs, and a queue transport that moves them off the request path. Jobs run on a framework-owned transport backed by Redis or the database, carry payloads validated against a declared schema, and support retries with backoff, delayed dispatch, priority, idempotency, rate limiting, and a dead-letter queue. A job can be the target of a scheduled task, the handler behind a queued event listener, or a unit of work dispatched straight from a controller.

## The `defineJob` Factory [#the-definejob-factory]

```ts title="the-definejob-factory.ts"
import { defineJob } from '@kwiva/queue'
import { WelcomeMail } from '~/app/mail/welcome'

export default defineJob('send-welcome', async ({ payload, job, logger }) => {
  const user = await User.findOrFail(payload.userId)
  await mail.send(WelcomeMail(user))
  job.progress(50)
  return { delivered: true }
}, {
  queue: 'emails',
  schema: { userId: 'uuid' },
  attempts: 5,
  backoff: 'exponential',
  priority: 10,
  idempotencyKey: (payload) => `welcome:${payload.userId}`,
})
```

A job file lives in `src/app/jobs/` and is auto-discovered by name.

| Argument  | Type                        | Description                                          |
| --------- | --------------------------- | ---------------------------------------------------- |
| `name`    | `string`                    | Unique job name (e.g. `'send-welcome'`)              |
| `handler` | `(ctx) => Promise<unknown>` | The work to run; receives `{ payload, job, logger }` |
| `options` | `JobOptions`                | Queue, schema, and execution behavior                |

## Handler Context [#handler-context]

The handler receives a single context object, destructured in the signature above.

| Property  | Type                | Description                                |
| --------- | ------------------- | ------------------------------------------ |
| `payload` | typed from `schema` | The validated payload passed to `dispatch` |
| `job`     | `JobHandle`         | Runtime handle for the running attempt     |
| `logger`  | `Logger`            | Structured logger correlated with the job  |

### Reporting progress [#reporting-progress]

```ts title="reporting-progress.ts"
job.progress(50)
```

`job.progress(n)` records a 0–100 completion value against the running job. The handler's return value is captured as the job result for tracing and observability.

## Job Options [#job-options]

| Option           | Type                                              | Description                                                                    |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `queue`          | `string`                                          | Queue to run on; must be declared in the queue config. Defaults to `'default'` |
| `schema`         | `PayloadSchema`                                   | Validation shape for `payload`                                                 |
| `attempts`       | `number`                                          | Attempts before the job is failed                                              |
| `backoff`        | `'fixed' \| 'exponential' \| (attempt) => number` | Delay between attempts                                                         |
| `priority`       | `number`                                          | Priority value assigned at dispatch                                            |
| `rateLimit`      | `{ max: number; per: number }`                    | Per-job rate limit (v1.x)                                                      |
| `idempotencyKey` | `(payload) => string`                             | Deduplicates identical work                                                    |

### Payload validation and typing [#payload-validation-and-typing]

The `schema` option validates every payload at dispatch time and types it inside the handler. Shorthand tokens describe primitive shapes, and where a payload references a model identity the type is derived from the model IR so `payload.userId` is fully typed across dispatch and handler.

```ts title="payload-validation-and-typing.ts"
defineJob('backfill-report', async ({ payload }) => {
  await Report.build({ period: payload.period })
}, {
  schema: { period: 'string', force: 'boolean?' },
})
```

### Retries and backoff [#retries-and-backoff]

`attempts` bounds how many times the job runs before it is moved to the dead-letter queue. `backoff` controls the wait between attempts.

| Value                 | Behavior                                      |
| --------------------- | --------------------------------------------- |
| `'fixed'`             | Constant delay between attempts               |
| `'exponential'`       | Delay grows exponentially per attempt         |
| `(attempt) => number` | Custom function returning the seconds to wait |

### Idempotency keys [#idempotency-keys]

```ts title="idempotency-keys.ts"
idempotencyKey: (payload) => `welcome:${payload.userId}`
```

When a key is supplied, dispatching the same logical work twice is deduplicated: a second dispatch carrying an already-seen key is dropped. Deriving the key from the payload (as above) is the reliable pattern.

### Priority and rate limiting [#priority-and-rate-limiting]

`priority` assigns the job a priority weight in the queue. `rateLimit: { max, per }` caps how often a job can run within a window (v1.x); queues can carry their own rate limit as well (v1.x).

## Dispatch [#dispatch]

Dispatch is available both as a static method on the job and through the `queue` object.

```ts title="dispatch.ts"
import SendWelcome from '~/app/jobs/send-welcome'

await SendWelcome.dispatch({ userId: user.id })
await SendWelcome.dispatch({ userId: user.id }, { delay: 60 })
await SendWelcome.dispatch({ userId: user.id }, { queue: 'nightly' })
```

```ts title="dispatch-2.ts"
import { queue } from '@kwiva/queue'

await queue.dispatch(SendWelcome, { userId: user.id })
```

### Dispatch options [#dispatch-options]

| Option  | Type                 | Description                                     |
| ------- | -------------------- | ----------------------------------------------- |
| `delay` | `number \| DateTime` | Run the job later: seconds, or an absolute time |
| `queue` | `string`             | Override the queue for this dispatch            |

### Chaining [#chaining]

Chains run jobs in sequence, one after another (v1.x):

```ts title="chaining.ts"
await queue.chain([ImportRows, BuildReport, NotifyDone]).dispatch()
```

### Batching [#batching]

Batches dispatch a set of jobs together and report per-job outcomes (v1.x):

```ts title="batching.ts"
const { successes, failures } = await queue
  .batch(rows.map((row) => ImportRows.dispatch(row)))
  .then((result) => result)
```

## Workers [#workers]

Workers consume queues and run the jobs. Run a worker in a separate process with `kwiva queue:work`, scoped by `--queue` and scaled with `--concurrency`; use `kwiva queue:listen` in development for verbose, always-on consumption.

```bash title="terminal"
kwiva queue:work --queue=emails,default --concurrency=5
kwiva queue:listen
kwiva queue:work --queue=nightly --concurrency=1 --trace
```

| Flag                     | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `--queue=emails,default` | Comma-separated queues this worker consumes     |
| `--concurrency=N`        | Number of jobs the worker processes in parallel |
| `--trace`                | Links structured logs per job id                |

Workers deploy as their own process via `kwiva deploy --entry worker` using the standard deploy-anywhere presets, or run in-process during development.

## Dead-Letter Queue [#dead-letter-queue]

A job that exhausts `attempts` is not retried again. It is moved to the dead-letter queue — the `failed_jobs` table — where it can be inspected and requeued.

```bash title="terminal"
kwiva queue:failed          # list failed jobs
kwiva queue:retry <id>      # requeue a single failed job
kwiva queue:retry --all     # requeue every failed job
```

## Configuration and Transports [#configuration-and-transports]

Queues and drivers are declared in `src/config/queue.ts` with `defineConfig`.

```ts title="configuration-and-transports.ts"
import { defineConfig } from '@kwiva/config'

export default defineConfig('queue', {
  defaults: {
    driver: 'redis',
    url: 'redis://localhost:6379',
    default: 'default',
  },
  queues: {
    emails: { driver: 'redis' },
    nightly: { driver: 'database' },
  },
  env: {
    url: 'REDIS_URL',
  },
})
```

| Option             | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `defaults.driver`  | Transport driver used by default                       |
| `defaults.url`     | Connection URL for the transport                       |
| `defaults.default` | Name of the default queue                              |
| `queues`           | Named queues, each able to override the driver         |
| `env.url`          | Environment variable that overrides the connection URL |

### Transport drivers [#transport-drivers]

| Driver     | Use                   | Notes                                                             |
| ---------- | --------------------- | ----------------------------------------------------------------- |
| `redis`    | Production default    | Redis transport                                                   |
| `database` | Zero-infrastructure   | `kwiva_jobs` table polling, suited to file-backed databases       |
| `memory`   | Development and tests | Synchronous and instant; pairs with `queue.fake()` for assertions |

## Transaction-Aware Dispatch [#transaction-aware-dispatch]

Jobs dispatched inside a database transaction are held until the transaction commits, using the same mechanism as the event outbox. If the transaction rolls back, the dispatch is never delivered.

```ts title="transaction-aware-dispatch.ts"
await db.transaction(async (tx) => {
  await Order.create({ amount: payload.total })

  await SendWelcome.dispatch({ userId })
})
```

## Events and Jobs [#events-and-jobs]

Queued event listeners run through the queue transport by default. A listener marked synchronous opts out and executes inline; see [Events](/api/events) for listener configuration.

## Testing [#testing]

Swap the transport for an in-memory fake and assert what was pushed:

```ts title="testing.ts"
import { queue } from '@kwiva/queue'
import SendWelcome from '~/app/jobs/send-welcome'

queue.fake()

await SendWelcome.dispatch({ userId: 1 })

expect(queue.assertPushed('send-welcome', { userId: 1 })).toBe(true)
```

## Observability [#observability]

Each job produces an OTel span covering dispatch, start, and finish, including the time spent waiting in the queue. Metrics are collected for queue depth, throughput, failure rate, and dead-letter queue size. Run workers with `--trace` to correlate logs per job id.

## What to Read Next [#what-to-read-next]

* [Jobs](/docs/background-work/jobs) — Defining jobs guide
* [Queues & Workers](/docs/background-work/queues) — Worker commands and transports
* [Scheduling](/docs/background-work/scheduling) — Cron-driven tasks that dispatch jobs
* [Queue Observability](/docs/background-work/observability) — Spans, metrics, and logs
* [Events & Broadcasting](/docs/realtime/events) — Queued event listeners
* [Auth Hooks](/api/auth) — Dispatching jobs from `onSignUp` and friends
