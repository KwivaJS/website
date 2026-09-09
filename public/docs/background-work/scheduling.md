# Scheduled Tasks (/docs/background-work/scheduling)



Scheduled tasks are the cron half of the background layer. A task is a unit of work that runs on a schedule decided in configuration, executed by the framework's internal engine rather than by the queue. Use tasks when there is no queue requirement — recurring, engine-native execution is the point. When a scheduled unit of work needs queue semantics, a task hands off by dispatching a `defineJob`.

The schedule is declarative and lives in one file. Tasks define the work; `src/config/schedule.ts` decides when it runs, on which instances, and whether it hands off to a queue. There is no cron scattered through the codebase and no separate scheduler service to keep alive in code.

## Defining a Task [#defining-a-task]

Tasks live one per file in `src/app/tasks/` as `defineTask` calls:

```ts title="src/app/tasks/cleanup-sessions.ts"
// src/app/tasks/cleanup-sessions.ts
import { defineTask } from '@kwiva/http'

export default defineTask('cleanup-sessions', async ({ payload, logger, config }) => {
  const n = await Session.query().where('expiresAt', '<', new Date()).delete()
  logger.info({ deleted: n }, 'session cleanup done')
  return { deleted: n }
}, { timeout: 30_000, retries: 2 })
```

The handler receives the payload, a `logger`, and the app `config`, and returns a result object. `timeout` caps a single run in milliseconds; `retries` bounds automatic re-runs on failure. Tasks can also be `defineJob`s — choose tasks when cron is the whole story, and jobs when the work also needs queue transport, retries with backoff, or priority.

## The Schedule [#the-schedule]

The schedule is config, not code scattered through tasks. All cron expressions live in `src/config/schedule.ts`:

```ts title="src/config/schedule.ts"
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

Each entry maps a task name to a schedule. The task itself is defined in `src/app/tasks/`; the config decides when it runs, on which instances, and whether it hands off to a queue. The schedule module is read by the scheduler runner, which is how the same config serves `schedule:list`, `schedule:work`, and `schedule:run`.

## Schedule Options [#schedule-options]

| Option                      | What it controls                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `cron`                      | Schedule expression — standard five fields, with seconds as an optional extension              |
| `withoutOverlapping`        | Per-task mutex: never start the next run while a previous run is still going                   |
| `onOneServer`               | Distributed lock so only one instance of the deployment runs the task, even with many replicas |
| `timezone` / `tz`           | Timezone for evaluating the cron expression — defaults to `UTC`                                |
| `queue`                     | Dispatch the task as a job on the named queue for heavy work                                   |
| `runAt`                     | Daily-time sugar, e.g. `runAt: '04:00'`, which expands to the equivalent cron expression       |
| `between` / `unlessBetween` | Window constraints restricting when the task may run (v1.x)                                    |

The two lock options answer the classic scheduler questions. `withoutOverlapping` protects a task against itself — a slow run must finish before the next tick starts. `onOneServer` protects against multiple replicas running the same task simultaneously; when several instances are deployed, `onOneServer` coordinates via a shared lock so a nightly job runs exactly once across the fleet. A task that must run everywhere — a per-instance warmup, for example — simply configures neither.

## Runners [#runners]

```bash title="terminal"
kwiva schedule:list                 # table of tasks + next run times
kwiva schedule:work                 # foreground scheduler (docker-friendly)
kwiva schedule:run                  # single tick (system cron entry: * * * * *)
kwiva task:run cleanup-sessions --payload='{"dry":true}'
```

Three scheduling shapes cover deployment:

* `kwiva schedule:list` prints the schedule with each task's next run time — and `--json` renders it machine-readable for dashboards.
* `kwiva schedule:work` runs the scheduler in the foreground, keeping the loop alive inside a container.
* `kwiva schedule:run` performs a single tick. Wire it to a system cron entry that fires every minute and the external scheduler owns the loop.

For one-off runs, `kwiva task:run <name> --payload=<json>` executes any task immediately with the given payload — the same code path as scheduled execution, useful for manual maintenance and for testing a task before it goes on the schedule.

## Task APIs in Code [#task-apis-in-code]

Tasks are also callable from application code through the autogenerated task API:

```ts title="task-apis-in-code.ts"
import { tasks } from '@kwiva/http'

await tasks.run('cleanup-sessions', { payload: { dry: true } })
const info = await tasks.status('cleanup-sessions')   // last run, duration, result
```

`tasks.run` triggers execution with a payload; `tasks.status` reports the previous run's outcome, duration, and result. This is the same surface the engine exposes publicly, which is how external schedulers invoke tasks.

## External Cron Triggers [#external-cron-triggers]

When the platform provides its own scheduler — a serverless cron, or a scheduled trigger with a fixed cron window — Kwiva exposes each task as a secret-protected endpoint for it to call:

```plaintext title="external-cron-triggers.txt"
/api/__tasks/{name}
```

The endpoint is guarded by a secret so only your scheduler can trigger work. The pattern: configure your platform scheduler to issue an HTTP request to the task endpoint on its own cadence, and Kwiva accepts the fire-and-forget trigger. This lets the deployment platform own cron while the task handler stays in the framework. See [Deployment](/docs/deployment/).

## Scheduling in Code (Planned) [#scheduling-in-code-planned]

The config-first schedule is the documented surface today. A declarative `defineSchedule` form for expressing the same cron table in code is planned (v1.x), for teams that prefer schedules to live next to their tasks rather than in a single config module. Until it lands, `src/config/schedule.ts` remains the single source of truth, and every runner reads from it.

## Observability [#observability]

Every task run produces a structured `task.run` log event carrying duration and result, plus a trace span for the run. Failures retry per the task's `retries` option, then feed a `task_failures` metric and an alert hook configured in `src/config/telemetry.ts`. `kwiva schedule:list --json` provides the run bookkeeping for external dashboards. Details in [Job Observability](/docs/background-work/observability).

## Common Patterns [#common-patterns]

| Need             | Pattern                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Nightly cleanup  | Task with `withoutOverlapping`                                                                 |
| 15-minute digest | Task that dispatches a `defineJob` onto the `emails` queue                                     |
| Backups          | Task dumps data, writes to `storage.put('backups/...')`, and a retention task prunes old files |
| Cache warmup     | Post-deploy task that prefetches hot queries                                                   |
| Outbox pump      | Built-in task (v1.x) that forwards committed events to listeners and broadcast                 |

## Choosing Between Tasks and Jobs [#choosing-between-tasks-and-jobs]

| Question                                                                                  | Answer                                            |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Is the work triggered by a clock?                                                         | Task                                              |
| Does the work need queue semantics — durable retries with backoff, priority, rate limits? | Job                                               |
| Is the work both scheduled and heavy?                                                     | Task that dispatches a job via the `queue` option |
| Is the work a response to something that happened?                                        | Event listener (queued by default)                |

The boundaries are porous on purpose. A task can hand off to the queue, an event listener is a job under the hood, and a job can be dispatched from a task. The primitive matches the trigger, and the transport owns the reliability.

## What's Next [#whats-next]

* [Jobs](/docs/background-work/jobs) — the queue-backed counterpart to tasks
* [Queues & Workers](/docs/background-work/queues) — where heavy tasks dispatch their work
* [Job Observability](/docs/background-work/observability) — structured logs, metrics, and alerting
* [Configuration](/docs/core-concepts/configuration) — the typed config system behind `src/config/schedule.ts`
* [Deployment](/docs/deployment/) — running the scheduler and worker in production
