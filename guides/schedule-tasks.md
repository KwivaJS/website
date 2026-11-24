# How do I schedule a task? (/guides/schedule-tasks)



# Schedule Tasks [#schedule-tasks]

```ts title="src/app/tasks/cleanup-old-todos.ts"
import { defineTask } from "@kwiva/jobs";

export const CleanupOldTodos = defineTask({
  schedule: "0 2 * * *",
  description: "Delete todos older than 30 days",
  preventOverlapping: true,
  handler: async ({ logger }) => {
    logger.info("cleanup.started");
    // cleanup logic
  },
});
```

## Scheduler setup [#scheduler-setup]

```ts title="src/bootstrap/app.ts"
import { startScheduler } from "@kwiva/jobs";
startScheduler({ tasks: [CleanupOldTodos] });
```

## Cron [#cron]

* 5-field format (`*`, `*/5`, `0 2 * * *`)
* Macros: `@yearly`, `@monthly`, `@weekly`, `@daily`, `@hourly`, `@minutely`
* Timezone via config (`timezone: "America/New_York"`)

## Notes [#notes]

* `preventOverlapping` — skips overlapping runs
* Manual run: `runTask(CleanupOldTodos)`
* Test via `tick()` on `startScheduler` or `runTask`

> \[!TIP]
> `parseCron` for preflighting schedules (see [Jobs API](/api/jobs#scheduler)).
