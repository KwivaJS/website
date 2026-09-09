# Data 05 — Tasks & Scheduling

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

`defineTask` + the schedule config: Laravel-scheduler semantics executed by the Nitro tasks engine (hidden).

## Define a task

```ts
// src/app/tasks/cleanup-sessions.ts
import { defineTask } from '@kwiva/http'

export default defineTask('cleanup-sessions', async ({ payload, logger, config }) => {
  const n = await Session.query().where('expiresAt', '<', new Date()).delete()
  logger.info({ deleted: n }, 'session cleanup done')
  return { deleted: n }
}, { timeout: 30_000, retries: 2 })
```

Tasks can also be `defineJob`s — tasks are the right tool when there's no queue requirement (cron-driven, engine-native execution).

## The schedule

```ts
// src/config/schedule.ts
import { defineConfig } from '@kwiva/config'

export default defineConfig('schedule', {
  defaults: {
    tz: 'UTC',
    tasks: {
      'cleanup-sessions': { cron: '0 3 * * *', withoutOverlapping: true },
      'generate-digest':  { cron: '*/15 * * * *', onOneServer: true, queue: 'emails' },
      'backup-database':  { cron: '0 4 * * 0', runAt: '04:00' },
    },
  },
})
```

| Option | Parity (L) | Notes |
|---|---|---|
| `cron` | schedule expression | 5-field + seconds optional |
| `withoutOverlapping` | lock-based | per-task mutex |
| `onOneServer` | distributed lock | redis lock when multi-instance |
| `timezone` / `tz` | per-schedule | default UTC |
| `queue` | dispatch as job | heavy tasks → queue |
| `runAt` | daily time sugar | expands to cron |
| `between`/`unlessBetween` | window constraints | v1.x |

## Runners

```bash
kwiva schedule:list                 # table of tasks + next run times
kwiva schedule:work                 # foreground scheduler (docker-friendly)
kwiva schedule:run                  # single tick (system cron entry: * * * * *)
kwiva task:run cleanup-sessions --payload='{"dry":true}'
```

External cron option: the engine's task routes are exposed secret-protected (`/api/__tasks/{name}`) for platform schedulers (Vercel Cron, Cloudflare Scheduled Workers).

## Task APIs in code

```ts
import { tasks } from '@kwiva/http'

await tasks.run('cleanup-sessions', { payload: { dry: true } })
const info = await tasks.status('cleanup-sessions')   // last run, duration, result
```

## Observability

- Each run: OTel span + structured log (`task.run` event with duration/result).
- Failures: retries then DLQ-style `task_failures` metric + alert hook (`src/config/telemetry.ts > alerts`).
- `kwiva schedule:list --json` for dashboards.

## Common patterns

| Need | Pattern |
|---|---|
| Nightly cleanup | task + `withoutOverlapping` |
| 15-min digest | task → dispatch `defineJob` on the emails queue |
| Backups | task → dump → `storage.put('backups/…')` → retention task deletes old |
| Cache warmup | post-deploy task (release hook) → prefetch hot queries |
| Outbox pump | v1.x built-in task forwarding committed events to listeners/broadcast |
