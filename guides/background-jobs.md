# How do I create a background job? (/guides/background-jobs)



# Background Jobs [#background-jobs]

## 1. Generate [#1-generate]

```bash title="terminal"
kwiva make:job SendReminder
```

## 2. Author [#2-author]

```ts title="src/app/jobs/send-reminder.ts"
import { defineJob, dispatch } from "@kwiva/jobs";
import { sendReminderMail } from "@kwiva/mail";

export const SendReminderJob = defineJob({
  handler: async (input) => {
    await sendReminderMail(input.userId);
  },
  onSuccess: () => { /* audit */ },
});

// Dispatch somewhere in a controller or route:
export const ScheduleReminder = defineController({
  routes(api) {
    api.post("/reminders", async (ctx) => {
      const id = await dispatch(SendReminderJob, { userId: 1 }, { delayMs: 3600_000 });
      return { id };
    });
  },
});
```

## 3. Start a worker [#3-start-a-worker]

```ts title="src/bootstrap/app.ts"
import { startWorker } from "@kwiva/jobs";
startWorker({ queues: ["default"] });
```

## Notes [#notes]

* Retries default: `tries: 5`
* Use `dispatchSync` for one-shot tasks
* Test via `fakeQueue()` (see [Testing](/docs/testing/unit-testing))

> \[!TIP]
> For scheduled jobs: [Scheduled Tasks](/docs/background-work/scheduling).
