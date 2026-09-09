# Data 03 — Queue & Jobs

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

`defineJob` + queue transport: Laravel-grade queue semantics on a Kwiva-owned transport (Redis or database), jobs typed from the model IR.

## Define a job

```ts
// src/app/jobs/send-welcome.ts
import { defineJob } from '@kwiva/queue'
import { WelcomeMail } from '../mail/welcome'

export default defineJob('send-welcome', async ({ payload, job, logger }) => {
  const user = await User.findOrFail(payload.userId)
  await mail.send(WelcomeMail(user))
  job.progress(50)
  await client.track({ event: 'welcome_sent', userId: user.id })
  return { delivered: true }
}, {
  queue: 'emails',                     // declared in src/config/queue.ts
  schema: { userId: 'uuid' },          // payload validated (typed from model IR where referenced)
  attempts: 5,
  backoff: 'exponential',              // 'fixed' | 'exponential' | fn(attempt)
  priority: 10,
  rateLimit: { max: 100, per: 60 },    // v1.x
  idempotencyKey: (p) => `welcome:${p.userId}`,
})
```

## Dispatch

```ts
import SendWelcome from '../app/jobs/send-welcome'

await SendWelcome.dispatch({ userId: user.id })            // default queue
await SendWelcome.dispatch({ userId }, { delay: 60 })      // 60s
await SendWelcome.dispatch({ userId }, { queue: 'nightly' })

// chains + batches (v1.x)
await queue.chain([ImportRows, BuildReport, NotifyDone]).dispatch()
await queue.batch(rows.map(r => ImportRows.dispatch(r)))
  .then(({ successes, failures }) => ...)
```

## Workers

```bash
kwiva queue:work --queue=emails,default --concurrency=5
kwiva queue:listen                 # verbose mode (dev)
kwiva queue:failed                 # DLQ table listing
kwiva queue:retry <id> | --all
kwiva queue:clear <queue>
```

Worker deployment: separate process via `kwiva deploy --entry worker` (node/bun presets), or in-process for dev.

## Semantics (full parity table)

| Feature | Surface | Status |
|---|---|---|
| Retries + backoff | `attempts`, `backoff` | v1 |
| Delayed dispatch | `delay` | v1 |
| Priority | `priority` | v1 |
| Concurrency | worker `--concurrency` | v1 |
| DLQ | `failed_jobs` table + CLI | v1 |
| Idempotency | `idempotencyKey` dedupe | v1 |
| Progress reporting | `job.progress(n)` | v1 |
| Rate limiting | per-job + per-queue | v1.x |
| Chains | `queue.chain` | v1.x |
| Batches | `queue.batch(...).then()` | v1.x |
| Model-aligned payload typing | `schema` typed from model IR | v1 (Q parity) |

## Events ↔ jobs

- Queued listeners: `defineEvent` listeners run through the queue by default (sync opt-out) — [data/04](04-realtime.md) covers events, [data/03'] this covers transport.
- Transaction-aware dispatch: jobs dispatched inside `db.transaction` are held until commit (same mechanism as the event outbox).

## Transport

| Driver | Use | Notes |
|---|---|---|
| `redis` | prod default | redis driver via Bun redis client |
| `database` | zero-infra | `kwiva_jobs` table polling — SQLite-friendly |
| `memory` | dev/test | synchronous, instant; `queue.fake()` for assertions |

```ts
// src/config/queue.ts
export default defineConfig('queue', {
  defaults: { driver: 'redis', url: 'redis://localhost:6379', default: 'default' },
  queues: { emails: { driver: 'redis' }, nightly: { driver: 'database' } },
  env: { url: 'REDIS_URL' },
})
```

## Observability

- Per-job OTel span (dispatch → start → finish) with queue wait time.
- Metrics: queue depth, throughput, failure rate, DLQ size.
- `kwiva queue:work --trace` links logs per job id.

## Testing

```ts
queue.fake()
await SendWelcome.dispatch({ userId })
expect(queue.assertPushed('send-welcome', { userId })).toBe(true)
```
