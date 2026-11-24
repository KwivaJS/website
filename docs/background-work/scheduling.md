# Scheduled Tasks (/docs/background-work/scheduling)



# Scheduled Tasks [#scheduled-tasks]

## defineTask [#definetask]

```ts title="src/app/tasks/cleanup.ts"
import { defineTask } from "@kwiva/jobs";

export const CleanupOldLogs = defineTask({
  schedule: "0 2 * * *", // cron 5-field
  description: "Cleanup old logs",
  preventOverlapping: true,
  handler: async ({ logger, now }) => { /* cleanup */ },
});
```

## Cron [#cron]

`parseCron(expr)` — 5-field + macros (`@yearly` … `@minutely`).

## Scheduler [#scheduler]

`startScheduler({tasks, tickMs, timezone})` → `{tick, stop}`.

## Timezone [#timezone]

IANA timezones supported.

## Management [#management]

`withoutOverlapping(task)`, `assertValidTimeZone`, `runTask(task)` — manual run.

> \[!TIP]
> Start scheduler in `bootstrap/app.ts` or via `kwiva start`? No — `kwiva dev` includes scheduler if configured.
