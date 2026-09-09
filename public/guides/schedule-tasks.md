# How do I schedule a task? (/guides/schedule-tasks)



Scheduled tasks run recurring work — cleanup, digests, backups — on a cron schedule executed by the scheduler. Reach for a task when you need recurring, engine-native execution and don't need a queue.

## Prerequisites [#prerequisites]

* A Kwiva project with the config folder layout (`src/config/`)
* A model the task operates on (the examples use a `Session` model)
* A way to keep a scheduler running, either a process or an external cron entry

## Generate the task [#generate-the-task]

Scaffold the task into `src/app/tasks/` with the CLI generator:

```bash title="terminal"
kwiva make:task cleanup-sessions
```

## Define the task [#define-the-task]

`defineTask` takes a task name, a handler, and options. The handler receives `payload`, `logger`, and `config`.

```ts title="define-the-task.ts"
import { defineTask } from '@kwiva/http'

export default defineTask(
  'cleanup-sessions',
  async ({ payload, logger }) => {
    const n = await Session.query().where('expiresAt', '<', new Date()).delete()
    logger.info({ deleted: n }, 'session cleanup done')
    return { deleted: n }
  },
  {
    timeout: 30_000,
    retries: 2,
  },
)
```

Tasks are engine-native and don't require a queue transport. If you later need queue semantics — durable retries, rate limiting — the same construct can be defined as a job instead.

## Register the cron entry [#register-the-cron-entry]

Schedule the task in `src/config/schedule.ts`. List it under `defaults.tasks`, keyed by task name:

```ts title="register-the-cron-entry.ts"
import { defineConfig } from '@kwiva/config'

export default defineConfig('schedule', {
  defaults: {
    tz: 'UTC',
    tasks: {
      'cleanup-sessions': {
        cron: '0 3 * * *',
        withoutOverlapping: true,
      },
    },
  },
})
```

`cron` accepts standard 5-field expressions, with seconds optional. `withoutOverlapping` locks the task so runs never overlap, and `onOneServer` uses a distributed lock so a multi-instance deployment runs it once. For heavy work, set `queue: 'emails'` to dispatch the task as a job; `runAt: '04:00'` is daily-time sugar that expands to a cron expression.

## Run the scheduler [#run-the-scheduler]

```bash title="terminal"
kwiva schedule:list
kwiva schedule:work
kwiva schedule:run
```

`schedule:list` prints the task table with next run times. `schedule:work` runs the scheduler in the foreground and is docker-friendly. `schedule:run` executes a single tick — point a system cron entry at it (`* * * * * kwiva schedule:run`).

## Run a task on demand [#run-a-task-on-demand]

Run one task manually, from the CLI or from code:

```bash title="terminal"
kwiva task:run cleanup-sessions --payload='{"dry":true}'
```

```ts title="run-a-task-on-demand.ts"
import { tasks } from '@kwiva/http'

await tasks.run('cleanup-sessions', { payload: { dry: true } })
const info = await tasks.status('cleanup-sessions')
```

`tasks.run` triggers the handler immediately, and `tasks.status` reports the last run's duration and result.

## Verify it works [#verify-it-works]

1. Run `kwiva schedule:list` and confirm `cleanup-sessions` appears with its next run time.
2. Run `kwiva task:run cleanup-sessions` and confirm the handler logs its result.
3. Seed a few rows with past `expiresAt` values, let a scheduler tick fire, and check the deleted count in the log.

## Related Documentation [#related-documentation]

* [Scheduled Tasks](/docs/background-work/scheduling) — `defineTask` and the schedule config
* [Jobs](/docs/background-work/jobs) — Queue-based background work
* [Background Work](/docs/background-work) — Overview of jobs, queues, and tasks
* [Configuration](/docs/getting-started/configuration) — Config modules and env binding
* [CLI Generators](/docs/cli/generators) — `kwiva make:*` scaffolds
