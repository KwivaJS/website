import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/background-work/jobs.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Jobs",
	"description": "defineJob — defining work, payload typing from the model IR, dispatch, retries, backoff, delays, priority, idempotency, and progress."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nA job is the unit of background work. One `defineJob` call declares what the work does, how the queue should treat it, and what kind of payload it accepts. Jobs live one per file in `src/app/jobs/` and are auto-discovered — no registration required. The factory comes from `@kwiva/queue`, and the queue transport it runs on is framework-owned: Redis or a database table, declared in config rather than treated as external middleware.\n\nJobs are the workhorse of the background layer. Anything slow, unreliable-if-inline, batch-shaped, or time-dependent fits here, and the framework's reliability guarantees — retries, backoff, delays, priority, and idempotency — apply to every job uniformly.\n\n## Defining a Job [#defining-a-job]\n\n`defineJob` takes three arguments: a name, an async handler, and an options object. The handler receives the validated payload plus a context with the current `job` record and a `logger` bound to this job:\n\n```ts title=\"src/app/jobs/send-welcome.ts\"\n// src/app/jobs/send-welcome.ts\nimport { defineJob } from '@kwiva/queue'\nimport { WelcomeMail } from '../mail/welcome'\n\nexport default defineJob('send-welcome', async ({ payload, job, logger }) => {\n  const user = await User.findOrFail(payload.userId)\n  await mail.send(WelcomeMail(user))\n  job.progress(50)\n  await client.track({ event: 'welcome_sent', userId: user.id })\n  return { delivered: true }\n}, {\n  queue: 'emails',                     // declared in src/config/queue.ts\n  schema: { userId: 'uuid' },          // payload validated (typed from model IR where referenced)\n  attempts: 5,\n  backoff: 'exponential',              // 'fixed' | 'exponential' | fn(attempt)\n  priority: 10,\n  rateLimit: { max: 100, per: 60 },    // v1.x\n  idempotencyKey: (p) => `welcome:${p.userId}`,\n})\n```\n\n| Argument  | Type                        | Description                                          |\n| --------- | --------------------------- | ---------------------------------------------------- |\n| `name`    | `string`                    | Unique job name, e.g. `'send-welcome'`               |\n| `handler` | `(ctx) => Promise<unknown>` | The work to run; receives `{ payload, job, logger }` |\n| `options` | `JobOptions`                | Queue, schema, and execution behavior                |\n\nThe handler's return value is the job result — available to observability tooling and to chain and batch callbacks. Throwing inside the handler marks the attempt as failed and triggers the retry policy.\n\n## Handler Context [#handler-context]\n\nThe handler receives a single context object:\n\n| Property  | Type                | Description                                                |\n| --------- | ------------------- | ---------------------------------------------------------- |\n| `payload` | typed from `schema` | The validated payload passed to `dispatch`                 |\n| `job`     | `JobHandle`         | Runtime handle for the running attempt, with `progress(n)` |\n| `logger`  | `Logger`            | Structured logger correlated with the job                  |\n\n## Payload Typing From the Model IR [#payload-typing-from-the-model-ir]\n\nEvery job defines its payload with a `schema` option. The schema is a single source for both validation and types. When a payload field references an entity that is backed by a model — a `userId` for a user model, for example — the field's type and validation rules flow from that model's definition through the model IR. There is no second schema to keep in sync, and no drift between what a route accepts, what the model stores, and what a job receives.\n\n```ts title=\"payload-typing-from-the-model-ir.ts\"\nexport default defineJob('process-invoice', async ({ payload }) => {\n  const invoice = await Invoice.findOrFail(payload.invoiceId)\n  // ...\n}, {\n  queue: 'invoices',\n  schema: { invoiceId: 'uuid', tier: 'string' },\n})\n```\n\nBecause jobs are files discovered by convention, the payload contracts of every job in the app are inspectable — `kwiva` tooling and Studio can enumerate exactly what each job expects. See [Model IR](/docs/advanced/model-ir) for the intermediate representation these types flow from.\n\n## Dispatch [#dispatch]\n\nDispatch is how work enters the queue. Every job object exposes a `dispatch` factory; the queue object exposes the same operation for explicit queue routing.\n\n```ts title=\"dispatch.ts\"\nimport SendWelcome from '../app/jobs/send-welcome'\nimport { queue } from '@kwiva/queue'\n\nawait SendWelcome.dispatch({ userId: user.id })              // default queue\nawait SendWelcome.dispatch({ userId }, { delay: 60 })        // 60s from now\nawait SendWelcome.dispatch({ userId }, { queue: 'nightly' }) // named queue\n\n// equivalent explicit form\nawait queue.dispatch(SendWelcome, { userId: user.id })\n```\n\nDispatch-time options override the job definition. In particular, `{ delay }` schedules later execution and `{ queue }` routes the payload to a specific named queue for this run.\n\n| Dispatch option | Type                                | Description                     |\n| --------------- | ----------------------------------- | ------------------------------- |\n| `delay`         | `number` (seconds) or absolute time | Run the job later               |\n| `queue`         | `string`                            | Override the queue for this run |\n\nDispatch is callable anywhere — a controller handler, a service, a page loader, and synchronously inside tests. Jobs dispatched inside a `db.transaction` are held until the commit, so a rolled-back transaction never leaks work into the queue (the same mechanism as the event outbox).\n\n## Job Options [#job-options]\n\n| Option           | Type                                      | What it controls                                                                 |\n| ---------------- | ----------------------------------------- | -------------------------------------------------------------------------------- |\n| `queue`          | `string`                                  | Which named queue (declared in `src/config/queue.ts`) handles the job            |\n| `schema`         | object                                    | Payload shape — validation and types, derived from the model IR where referenced |\n| `attempts`       | `number`                                  | Total attempts before the job is marked failed                                   |\n| `backoff`        | `'fixed' \\| 'exponential' \\| fn(attempt)` | Wait between retries                                                             |\n| `priority`       | `number`                                  | Relative priority inside the queue                                               |\n| `rateLimit`      | `{ max, per }`                            | Throughput cap for this job type (v1.x)                                          |\n| `idempotencyKey` | `(payload) => string`                     | Deduplication key for repeated dispatch                                          |\n\n## Retries and Exponential Backoff [#retries-and-exponential-backoff]\n\nFailures are expected; jobs retry them by default. `attempts` sets the ceiling — `attempts: 5` means the initial run plus four retries. `backoff` controls the pause between attempts:\n\n| Value           | Behavior                                                                                        |\n| --------------- | ----------------------------------------------------------------------------------------------- |\n| `'fixed'`       | A constant delay between attempts                                                               |\n| `'exponential'` | The wait grows exponentially with the attempt number, giving transient failures time to resolve |\n| `fn(attempt)`   | Full control, computing the delay in seconds from the attempt count                             |\n\n> \\[!NOTE]\n> Jitter within the exponential strategy, to desynchronize retry waves across many jobs that failed at once, is on the roadmap (v1.x). Until then, the function form of `backoff` lets you mix in your own jitter per attempt.\n\nA job that exhausts its attempts moves to the dead-letter queue and shows up in `kwiva queue:failed`. From there `kwiva queue:retry <id>` (or `--all`) republishes it.\n\n## Delays [#delays]\n\nA job can be scheduled for the future without a separate scheduling primitive:\n\n```ts title=\"delays.ts\"\nawait SendWelcome.dispatch({ userId }, { delay: 60 })\n```\n\n`delay` is expressed in seconds — the job is not visible to workers until the delay elapses. This pairs cleanly with scheduled tasks: a task that decides \"this should happen in an hour\" dispatches a delayed job rather than managing its own timer.\n\n## Priority [#priority]\n\n`{ priority: 10 }` declares how the worker should order pending work. Higher-priority jobs are picked up before lower-priority ones within the same queue, while `attempts` and `rateLimit` shape throughput. In practice, priority suits queues that mix interactive side effects with heavy batch work — a password-reset email should not queue behind a thousand-row import.\n\n## Idempotency Keys [#idempotency-keys]\n\nRepeated dispatch of the same logical work should not produce duplicate side effects. `idempotencyKey` accepts a function of the payload and returns a stable string:\n\n```ts title=\"idempotency-keys.ts\"\nidempotencyKey: (p) => `welcome:${p.userId}`,\n```\n\nIf a job with the same key is already pending or processed, the duplicate dispatch is dropped. This is the framework's answer to at-least-once delivery: the transport may deliver more than once, but the application dedupes. Deriving the key from the payload is the reliable pattern — never from volatile state.\n\n## Job Progression and Result Typing [#job-progression-and-result-typing]\n\nA long-running job can report progress via the `job` object:\n\n```ts title=\"job-progression-and-result-typing.ts\"\njob.progress(50)\n```\n\nProgress is surfaced in observability — Studio and queue tooling can show how far a multi-step job has come. Progress is advisory; it does not affect retries or scheduling, but it makes long jobs auditable in production.\n\nThe handler's return value is the job result, and that result is typed: chain callbacks and batch outcomes receive it, and observability records it. A chain member's output being available type-safely to the next member is what makes multi-phase pipelines testable and inspectable.\n\n## Chains and Batches [#chains-and-batches]\n\nTwo composition primitives (v1.x) let a single dispatch drive a sequence or a fan-out:\n\n```ts title=\"chains-and-batches.ts\"\n// run in order, each following the previous\nawait queue.chain([ImportRows, BuildReport, NotifyDone]).dispatch()\n\n// run concurrently, then inspect outcomes\nawait queue.batch(rows.map(r => ImportRows.dispatch(r)))\n  .then(({ successes, failures }) => ...)\n```\n\n`queue.chain` guarantees ordering; `queue.batch` fans out concurrently and reports on the aggregate outcome. Both compose with the per-job options above — a member of a chain can still have its own `attempts`, `backoff`, and `delay`. Both treat promise-based offloading to the transport the same way single dispatch does, so the transactional guarantees apply evenly.\n\n## Events and Jobs [#events-and-jobs]\n\nJobs and events share the transport. A listener on a `defineEvent` runs through the queue by default, so reacting to an event never blocks the request that raised it. If background work is really a reaction — \"when a user signs up, send a welcome\" — prefer an event listener over a hand-dispatched job. The pattern is identical, but the coupling lives in the event, not in the caller. See [Realtime Events](/docs/realtime/events).\n\n## Testing Jobs [#testing-jobs]\n\nJobs are plain functions of their payload, which makes them easy to test against a fake queue:\n\n```ts title=\"testing-jobs.ts\"\nqueue.fake()\nawait SendWelcome.dispatch({ userId })\nexpect(queue.assertPushed('send-welcome', { userId })).toBe(true)\n```\n\n`queue.fake()` swaps the transport for an in-memory recording, and `assertPushed` verifies dispatch without running the handler. Run the handler directly to test its logic; run it through the fake to test dispatch. See [Testing](/docs/testing/).\n\n## What's Next [#whats-next]\n\n* [Queues & Workers](/docs/background-work/queues) — transport, concurrency, and the dead-letter queue\n* [Scheduled Tasks](/docs/background-work/scheduling) — cron-driven work with `defineTask`\n* [Job Observability](/docs/background-work/observability) — progress, failures, and queue depth\n* [Testing](/docs/testing/) — fake the queue and assert on dispatch\n* [Realtime Events](/docs/realtime/events) — listeners that run through the queue by default\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "A job is the unit of background work. One `defineJob` call declares what the work does, how the queue should treat it, and what kind of payload it accepts. Jobs live one per file in `src/app/jobs/` and are auto-discovered — no registration required. The factory comes from `@kwiva/queue`, and the queue transport it runs on is framework-owned: Redis or a database table, declared in config rather than treated as external middleware."
		},
		{
			"heading": void 0,
			"content": "Jobs are the workhorse of the background layer. Anything slow, unreliable-if-inline, batch-shaped, or time-dependent fits here, and the framework's reliability guarantees — retries, backoff, delays, priority, and idempotency — apply to every job uniformly."
		},
		{
			"heading": "defining-a-job",
			"content": "`defineJob` takes three arguments: a name, an async handler, and an options object. The handler receives the validated payload plus a context with the current `job` record and a `logger` bound to this job:"
		},
		{
			"heading": "defining-a-job",
			"content": "Argument"
		},
		{
			"heading": "defining-a-job",
			"content": "Type"
		},
		{
			"heading": "defining-a-job",
			"content": "Description"
		},
		{
			"heading": "defining-a-job",
			"content": "`name`"
		},
		{
			"heading": "defining-a-job",
			"content": "`string`"
		},
		{
			"heading": "defining-a-job",
			"content": "Unique job name, e.g. `'send-welcome'`"
		},
		{
			"heading": "defining-a-job",
			"content": "`handler`"
		},
		{
			"heading": "defining-a-job",
			"content": "`(ctx) => Promise<unknown>`"
		},
		{
			"heading": "defining-a-job",
			"content": "The work to run; receives `{ payload, job, logger }`"
		},
		{
			"heading": "defining-a-job",
			"content": "`options`"
		},
		{
			"heading": "defining-a-job",
			"content": "`JobOptions`"
		},
		{
			"heading": "defining-a-job",
			"content": "Queue, schema, and execution behavior"
		},
		{
			"heading": "defining-a-job",
			"content": "The handler's return value is the job result — available to observability tooling and to chain and batch callbacks. Throwing inside the handler marks the attempt as failed and triggers the retry policy."
		},
		{
			"heading": "handler-context",
			"content": "The handler receives a single context object:"
		},
		{
			"heading": "handler-context",
			"content": "Property"
		},
		{
			"heading": "handler-context",
			"content": "Type"
		},
		{
			"heading": "handler-context",
			"content": "Description"
		},
		{
			"heading": "handler-context",
			"content": "`payload`"
		},
		{
			"heading": "handler-context",
			"content": "typed from `schema`"
		},
		{
			"heading": "handler-context",
			"content": "The validated payload passed to `dispatch`"
		},
		{
			"heading": "handler-context",
			"content": "`job`"
		},
		{
			"heading": "handler-context",
			"content": "`JobHandle`"
		},
		{
			"heading": "handler-context",
			"content": "Runtime handle for the running attempt, with `progress(n)`"
		},
		{
			"heading": "handler-context",
			"content": "`logger`"
		},
		{
			"heading": "handler-context",
			"content": "`Logger`"
		},
		{
			"heading": "handler-context",
			"content": "Structured logger correlated with the job"
		},
		{
			"heading": "payload-typing-from-the-model-ir",
			"content": "Every job defines its payload with a `schema` option. The schema is a single source for both validation and types. When a payload field references an entity that is backed by a model — a `userId` for a user model, for example — the field's type and validation rules flow from that model's definition through the model IR. There is no second schema to keep in sync, and no drift between what a route accepts, what the model stores, and what a job receives."
		},
		{
			"heading": "payload-typing-from-the-model-ir",
			"content": "Because jobs are files discovered by convention, the payload contracts of every job in the app are inspectable — `kwiva` tooling and Studio can enumerate exactly what each job expects. See Model IR for the intermediate representation these types flow from."
		},
		{
			"heading": "dispatch",
			"content": "Dispatch is how work enters the queue. Every job object exposes a `dispatch` factory; the queue object exposes the same operation for explicit queue routing."
		},
		{
			"heading": "dispatch",
			"content": "Dispatch-time options override the job definition. In particular, `{ delay }` schedules later execution and `{ queue }` routes the payload to a specific named queue for this run."
		},
		{
			"heading": "dispatch",
			"content": "Dispatch option"
		},
		{
			"heading": "dispatch",
			"content": "Type"
		},
		{
			"heading": "dispatch",
			"content": "Description"
		},
		{
			"heading": "dispatch",
			"content": "`delay`"
		},
		{
			"heading": "dispatch",
			"content": "`number` (seconds) or absolute time"
		},
		{
			"heading": "dispatch",
			"content": "Run the job later"
		},
		{
			"heading": "dispatch",
			"content": "`queue`"
		},
		{
			"heading": "dispatch",
			"content": "`string`"
		},
		{
			"heading": "dispatch",
			"content": "Override the queue for this run"
		},
		{
			"heading": "dispatch",
			"content": "Dispatch is callable anywhere — a controller handler, a service, a page loader, and synchronously inside tests. Jobs dispatched inside a `db.transaction` are held until the commit, so a rolled-back transaction never leaks work into the queue (the same mechanism as the event outbox)."
		},
		{
			"heading": "job-options",
			"content": "Option"
		},
		{
			"heading": "job-options",
			"content": "Type"
		},
		{
			"heading": "job-options",
			"content": "What it controls"
		},
		{
			"heading": "job-options",
			"content": "`queue`"
		},
		{
			"heading": "job-options",
			"content": "`string`"
		},
		{
			"heading": "job-options",
			"content": "Which named queue (declared in `src/config/queue.ts`) handles the job"
		},
		{
			"heading": "job-options",
			"content": "`schema`"
		},
		{
			"heading": "job-options",
			"content": "object"
		},
		{
			"heading": "job-options",
			"content": "Payload shape — validation and types, derived from the model IR where referenced"
		},
		{
			"heading": "job-options",
			"content": "`attempts`"
		},
		{
			"heading": "job-options",
			"content": "`number`"
		},
		{
			"heading": "job-options",
			"content": "Total attempts before the job is marked failed"
		},
		{
			"heading": "job-options",
			"content": "`backoff`"
		},
		{
			"heading": "job-options",
			"content": "`'fixed' \\| 'exponential' \\| fn(attempt)`"
		},
		{
			"heading": "job-options",
			"content": "Wait between retries"
		},
		{
			"heading": "job-options",
			"content": "`priority`"
		},
		{
			"heading": "job-options",
			"content": "`number`"
		},
		{
			"heading": "job-options",
			"content": "Relative priority inside the queue"
		},
		{
			"heading": "job-options",
			"content": "`rateLimit`"
		},
		{
			"heading": "job-options",
			"content": "`{ max, per }`"
		},
		{
			"heading": "job-options",
			"content": "Throughput cap for this job type (v1.x)"
		},
		{
			"heading": "job-options",
			"content": "`idempotencyKey`"
		},
		{
			"heading": "job-options",
			"content": "`(payload) => string`"
		},
		{
			"heading": "job-options",
			"content": "Deduplication key for repeated dispatch"
		},
		{
			"heading": "retries-and-exponential-backoff",
			"content": "Failures are expected; jobs retry them by default. `attempts` sets the ceiling — `attempts: 5` means the initial run plus four retries. `backoff` controls the pause between attempts:"
		},
		{
			"heading": "retries-and-exponential-backoff",
			"content": "Value"
		},
		{
			"heading": "retries-and-exponential-backoff",
			"content": "Behavior"
		},
		{
			"heading": "retries-and-exponential-backoff",
			"content": "`'fixed'`"
		},
		{
			"heading": "retries-and-exponential-backoff",
			"content": "A constant delay between attempts"
		},
		{
			"heading": "retries-and-exponential-backoff",
			"content": "`'exponential'`"
		},
		{
			"heading": "retries-and-exponential-backoff",
			"content": "The wait grows exponentially with the attempt number, giving transient failures time to resolve"
		},
		{
			"heading": "retries-and-exponential-backoff",
			"content": "`fn(attempt)`"
		},
		{
			"heading": "retries-and-exponential-backoff",
			"content": "Full control, computing the delay in seconds from the attempt count"
		},
		{
			"heading": "retries-and-exponential-backoff",
			"content": "> \\[!NOTE]\n> Jitter within the exponential strategy, to desynchronize retry waves across many jobs that failed at once, is on the roadmap (v1.x). Until then, the function form of `backoff` lets you mix in your own jitter per attempt."
		},
		{
			"heading": "retries-and-exponential-backoff",
			"content": "A job that exhausts its attempts moves to the dead-letter queue and shows up in `kwiva queue:failed`. From there `kwiva queue:retry <id>` (or `--all`) republishes it."
		},
		{
			"heading": "delays",
			"content": "A job can be scheduled for the future without a separate scheduling primitive:"
		},
		{
			"heading": "delays",
			"content": "`delay` is expressed in seconds — the job is not visible to workers until the delay elapses. This pairs cleanly with scheduled tasks: a task that decides \"this should happen in an hour\" dispatches a delayed job rather than managing its own timer."
		},
		{
			"heading": "priority",
			"content": "`{ priority: 10 }` declares how the worker should order pending work. Higher-priority jobs are picked up before lower-priority ones within the same queue, while `attempts` and `rateLimit` shape throughput. In practice, priority suits queues that mix interactive side effects with heavy batch work — a password-reset email should not queue behind a thousand-row import."
		},
		{
			"heading": "idempotency-keys",
			"content": "Repeated dispatch of the same logical work should not produce duplicate side effects. `idempotencyKey` accepts a function of the payload and returns a stable string:"
		},
		{
			"heading": "idempotency-keys",
			"content": "If a job with the same key is already pending or processed, the duplicate dispatch is dropped. This is the framework's answer to at-least-once delivery: the transport may deliver more than once, but the application dedupes. Deriving the key from the payload is the reliable pattern — never from volatile state."
		},
		{
			"heading": "job-progression-and-result-typing",
			"content": "A long-running job can report progress via the `job` object:"
		},
		{
			"heading": "job-progression-and-result-typing",
			"content": "Progress is surfaced in observability — Studio and queue tooling can show how far a multi-step job has come. Progress is advisory; it does not affect retries or scheduling, but it makes long jobs auditable in production."
		},
		{
			"heading": "job-progression-and-result-typing",
			"content": "The handler's return value is the job result, and that result is typed: chain callbacks and batch outcomes receive it, and observability records it. A chain member's output being available type-safely to the next member is what makes multi-phase pipelines testable and inspectable."
		},
		{
			"heading": "chains-and-batches",
			"content": "Two composition primitives (v1.x) let a single dispatch drive a sequence or a fan-out:"
		},
		{
			"heading": "chains-and-batches",
			"content": "`queue.chain` guarantees ordering; `queue.batch` fans out concurrently and reports on the aggregate outcome. Both compose with the per-job options above — a member of a chain can still have its own `attempts`, `backoff`, and `delay`. Both treat promise-based offloading to the transport the same way single dispatch does, so the transactional guarantees apply evenly."
		},
		{
			"heading": "events-and-jobs",
			"content": "Jobs and events share the transport. A listener on a `defineEvent` runs through the queue by default, so reacting to an event never blocks the request that raised it. If background work is really a reaction — \"when a user signs up, send a welcome\" — prefer an event listener over a hand-dispatched job. The pattern is identical, but the coupling lives in the event, not in the caller. See Realtime Events."
		},
		{
			"heading": "testing-jobs",
			"content": "Jobs are plain functions of their payload, which makes them easy to test against a fake queue:"
		},
		{
			"heading": "testing-jobs",
			"content": "`queue.fake()` swaps the transport for an in-memory recording, and `assertPushed` verifies dispatch without running the handler. Run the handler directly to test its logic; run it through the fake to test dispatch. See Testing."
		},
		{
			"heading": "whats-next",
			"content": "Queues & Workers — transport, concurrency, and the dead-letter queue"
		},
		{
			"heading": "whats-next",
			"content": "Scheduled Tasks — cron-driven work with `defineTask`"
		},
		{
			"heading": "whats-next",
			"content": "Job Observability — progress, failures, and queue depth"
		},
		{
			"heading": "whats-next",
			"content": "Testing — fake the queue and assert on dispatch"
		},
		{
			"heading": "whats-next",
			"content": "Realtime Events — listeners that run through the queue by default"
		}
	],
	"headings": [
		{
			"id": "defining-a-job",
			"content": "Defining a Job"
		},
		{
			"id": "handler-context",
			"content": "Handler Context"
		},
		{
			"id": "payload-typing-from-the-model-ir",
			"content": "Payload Typing From the Model IR"
		},
		{
			"id": "dispatch",
			"content": "Dispatch"
		},
		{
			"id": "job-options",
			"content": "Job Options"
		},
		{
			"id": "retries-and-exponential-backoff",
			"content": "Retries and Exponential Backoff"
		},
		{
			"id": "delays",
			"content": "Delays"
		},
		{
			"id": "priority",
			"content": "Priority"
		},
		{
			"id": "idempotency-keys",
			"content": "Idempotency Keys"
		},
		{
			"id": "job-progression-and-result-typing",
			"content": "Job Progression and Result Typing"
		},
		{
			"id": "chains-and-batches",
			"content": "Chains and Batches"
		},
		{
			"id": "events-and-jobs",
			"content": "Events and Jobs"
		},
		{
			"id": "testing-jobs",
			"content": "Testing Jobs"
		},
		{
			"id": "whats-next",
			"content": "What's Next"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#defining-a-job",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Defining a Job" })
	},
	{
		depth: 2,
		url: "#handler-context",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Handler Context" })
	},
	{
		depth: 2,
		url: "#payload-typing-from-the-model-ir",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Payload Typing From the Model IR" })
	},
	{
		depth: 2,
		url: "#dispatch",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Dispatch" })
	},
	{
		depth: 2,
		url: "#job-options",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Job Options" })
	},
	{
		depth: 2,
		url: "#retries-and-exponential-backoff",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Retries and Exponential Backoff" })
	},
	{
		depth: 2,
		url: "#delays",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Delays" })
	},
	{
		depth: 2,
		url: "#priority",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Priority" })
	},
	{
		depth: 2,
		url: "#idempotency-keys",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Idempotency Keys" })
	},
	{
		depth: 2,
		url: "#job-progression-and-result-typing",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Job Progression and Result Typing" })
	},
	{
		depth: 2,
		url: "#chains-and-batches",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Chains and Batches" })
	},
	{
		depth: 2,
		url: "#events-and-jobs",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Events and Jobs" })
	},
	{
		depth: 2,
		url: "#testing-jobs",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Testing Jobs" })
	},
	{
		depth: 2,
		url: "#whats-next",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What's Next" })
	}
];
function _createMdxContent(props) {
	const _components = {
		a: "a",
		blockquote: "blockquote",
		code: "code",
		h2: "h2",
		li: "li",
		p: "p",
		pre: "pre",
		span: "span",
		table: "table",
		tbody: "tbody",
		td: "td",
		th: "th",
		thead: "thead",
		tr: "tr",
		ul: "ul",
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A job is the unit of background work. One ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }),
			" call declares what the work does, how the queue should treat it, and what kind of payload it accepts. Jobs live one per file in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/" }),
			" and are auto-discovered — no registration required. The factory comes from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/queue" }),
			", and the queue transport it runs on is framework-owned: Redis or a database table, declared in config rather than treated as external middleware."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Jobs are the workhorse of the background layer. Anything slow, unreliable-if-inline, batch-shaped, or time-dependent fits here, and the framework's reliability guarantees — retries, backoff, delays, priority, and idempotency — apply to every job uniformly." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "defining-a-job",
			children: "Defining a Job"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }),
			" takes three arguments: a name, an async handler, and an options object. The handler receives the validated payload plus a context with the current ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "job" }),
			" record and a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "logger" }),
			" bound to this job:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "src/app/jobs/send-welcome.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/jobs/send-welcome.ts"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { defineJob } "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "from"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " '@kwiva/queue'"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { WelcomeMail } "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "from"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " '../mail/welcome'"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "export"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " default"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " defineJob"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'send-welcome'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "async"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "payload"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "job"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "logger"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }) "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "=>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " {"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "  const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " user"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " ="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " User."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "findOrFail"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(payload.userId)"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "  await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " mail."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "send"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "WelcomeMail"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(user))"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  job."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "progress"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "50"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "  await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " client."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "track"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ event: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'welcome_sent'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", userId: user.id })"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "  return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { delivered: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "true"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "}, {"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  queue: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'emails'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",                     "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// declared in src/config/queue.ts"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  schema: { userId: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'uuid'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " },          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// payload validated (typed from model IR where referenced)"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  attempts: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "5"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  backoff: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'exponential'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",              "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// 'fixed' | 'exponential' | fn(attempt)"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  priority: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "10"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  rateLimit: { max: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "100"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", per: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "60"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " },    "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// v1.x"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  idempotencyKey"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "p"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ") "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "=>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " `welcome:${"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "p"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "userId"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "}`"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Argument" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Type" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Description" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "name" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "string" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Unique job name, e.g. ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "'send-welcome'" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "handler" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "(ctx) => Promise<unknown>" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["The work to run; receives ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ payload, job, logger }" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "options" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "JobOptions" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Queue, schema, and execution behavior" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The handler's return value is the job result — available to observability tooling and to chain and batch callbacks. Throwing inside the handler marks the attempt as failed and triggers the retry policy." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "handler-context",
			children: "Handler Context"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The handler receives a single context object:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Property" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Type" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Description" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "payload" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["typed from ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schema" })] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["The validated payload passed to ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "dispatch" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "job" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "JobHandle" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Runtime handle for the running attempt, with ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "progress(n)" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "logger" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Logger" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Structured logger correlated with the job" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "payload-typing-from-the-model-ir",
			children: "Payload Typing From the Model IR"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every job defines its payload with a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schema" }),
			" option. The schema is a single source for both validation and types. When a payload field references an entity that is backed by a model — a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "userId" }),
			" for a user model, for example — the field's type and validation rules flow from that model's definition through the model IR. There is no second schema to keep in sync, and no drift between what a route accepts, what the model stores, and what a job receives."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "payload-typing-from-the-model-ir.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "export"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " default"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " defineJob"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'process-invoice'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "async"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "payload"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }) "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "=>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " {"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "  const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " invoice"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " ="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " Invoice."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "findOrFail"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(payload.invoiceId)"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // ..."
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "}, {"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  queue: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'invoices'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  schema: { invoiceId: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'uuid'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", tier: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'string'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " },"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because jobs are files discovered by convention, the payload contracts of every job in the app are inspectable — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva" }),
			" tooling and Studio can enumerate exactly what each job expects. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/model-ir",
				children: "Model IR"
			}),
			" for the intermediate representation these types flow from."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "dispatch",
			children: "Dispatch"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Dispatch is how work enters the queue. Every job object exposes a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "dispatch" }),
			" factory; the queue object exposes the same operation for explicit queue routing."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "dispatch.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " SendWelcome "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "from"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " '../app/jobs/send-welcome'"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { queue } "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "from"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " '@kwiva/queue'"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " SendWelcome."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "dispatch"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ userId: user.id })              "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// default queue"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " SendWelcome."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "dispatch"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ userId }, { delay: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "60"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })        "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// 60s from now"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " SendWelcome."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "dispatch"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ userId }, { queue: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'nightly'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }) "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// named queue"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// equivalent explicit form"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " queue."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "dispatch"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(SendWelcome, { userId: user.id })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Dispatch-time options override the job definition. In particular, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ delay }" }),
			" schedules later execution and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ queue }" }),
			" routes the payload to a specific named queue for this run."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Dispatch option" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Type" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Description" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delay" }) }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "number" }), " (seconds) or absolute time"] }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run the job later" })
		] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "string" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Override the queue for this run" })
		] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Dispatch is callable anywhere — a controller handler, a service, a page loader, and synchronously inside tests. Jobs dispatched inside a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db.transaction" }),
			" are held until the commit, so a rolled-back transaction never leaks work into the queue (the same mechanism as the event outbox)."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "job-options",
			children: "Job Options"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Option" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Type" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it controls" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "string" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Which named queue (declared in ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/queue.ts" }),
					") handles the job"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schema" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "object" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Payload shape — validation and types, derived from the model IR where referenced" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "attempts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "number" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Total attempts before the job is marked failed" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "backoff" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "'fixed' | 'exponential' | fn(attempt)" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Wait between retries" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "priority" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "number" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Relative priority inside the queue" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rateLimit" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ max, per }" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Throughput cap for this job type (v1.x)" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "idempotencyKey" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "(payload) => string" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Deduplication key for repeated dispatch" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "retries-and-exponential-backoff",
			children: "Retries and Exponential Backoff"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Failures are expected; jobs retry them by default. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "attempts" }),
			" sets the ceiling — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "attempts: 5" }),
			" means the initial run plus four retries. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "backoff" }),
			" controls the pause between attempts:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Value" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "'fixed'" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A constant delay between attempts" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "'exponential'" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The wait grows exponentially with the attempt number, giving transient failures time to resolve" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fn(attempt)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Full control, computing the delay in seconds from the attempt count" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nJitter within the exponential strategy, to desynchronize retry waves across many jobs that failed at once, is on the roadmap (v1.x). Until then, the function form of ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "backoff" }),
				" lets you mix in your own jitter per attempt."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A job that exhausts its attempts moves to the dead-letter queue and shows up in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:failed" }),
			". From there ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:retry <id>" }),
			" (or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--all" }),
			") republishes it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "delays",
			children: "Delays"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A job can be scheduled for the future without a separate scheduling primitive:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "delays.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "await"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " SendWelcome."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "dispatch"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "({ userId }, { delay: "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "60"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " })"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delay" }), " is expressed in seconds — the job is not visible to workers until the delay elapses. This pairs cleanly with scheduled tasks: a task that decides \"this should happen in an hour\" dispatches a delayed job rather than managing its own timer."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "priority",
			children: "Priority"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{ priority: 10 }" }),
			" declares how the worker should order pending work. Higher-priority jobs are picked up before lower-priority ones within the same queue, while ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "attempts" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rateLimit" }),
			" shape throughput. In practice, priority suits queues that mix interactive side effects with heavy batch work — a password-reset email should not queue behind a thousand-row import."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "idempotency-keys",
			children: "Idempotency Keys"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Repeated dispatch of the same logical work should not produce duplicate side effects. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "idempotencyKey" }),
			" accepts a function of the payload and returns a stable string:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "idempotency-keys.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "idempotencyKey"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": ("
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#E36209",
							"--shiki-dark": "#FFAB70"
						},
						children: "p"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ") "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "=>"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " `welcome:${"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "p"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: "."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "userId"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: "}`"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ","
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "If a job with the same key is already pending or processed, the duplicate dispatch is dropped. This is the framework's answer to at-least-once delivery: the transport may deliver more than once, but the application dedupes. Deriving the key from the payload is the reliable pattern — never from volatile state." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "job-progression-and-result-typing",
			children: "Job Progression and Result Typing"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A long-running job can report progress via the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "job" }),
			" object:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "job-progression-and-result-typing.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "job."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "progress"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "("
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "50"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ")"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Progress is surfaced in observability — Studio and queue tooling can show how far a multi-step job has come. Progress is advisory; it does not affect retries or scheduling, but it makes long jobs auditable in production." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The handler's return value is the job result, and that result is typed: chain callbacks and batch outcomes receive it, and observability records it. A chain member's output being available type-safely to the next member is what makes multi-phase pipelines testable and inspectable." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "chains-and-batches",
			children: "Chains and Batches"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two composition primitives (v1.x) let a single dispatch drive a sequence or a fan-out:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "chains-and-batches.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// run in order, each following the previous"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " queue."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "chain"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "([ImportRows, BuildReport, NotifyDone])."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "dispatch"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// run concurrently, then inspect outcomes"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " queue."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "batch"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(rows."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "map"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "r"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " =>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ImportRows."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "dispatch"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(r)))"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  ."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "then"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "successes"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "failures"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }) "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "=>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " ..."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.chain" }),
			" guarantees ordering; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.batch" }),
			" fans out concurrently and reports on the aggregate outcome. Both compose with the per-job options above — a member of a chain can still have its own ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "attempts" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "backoff" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delay" }),
			". Both treat promise-based offloading to the transport the same way single dispatch does, so the transactional guarantees apply evenly."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "events-and-jobs",
			children: "Events and Jobs"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Jobs and events share the transport. A listener on a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }),
			" runs through the queue by default, so reacting to an event never blocks the request that raised it. If background work is really a reaction — \"when a user signs up, send a welcome\" — prefer an event listener over a hand-dispatched job. The pattern is identical, but the coupling lives in the event, not in the caller. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/events",
				children: "Realtime Events"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "testing-jobs",
			children: "Testing Jobs"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Jobs are plain functions of their payload, which makes them easy to test against a fake queue:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "testing-jobs.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "queue."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "fake"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " SendWelcome."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "dispatch"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ userId })"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "expect"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(queue."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "assertPushed"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'send-welcome'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { userId }))."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "toBe"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "true"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.fake()" }),
			" swaps the transport for an in-memory recording, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "assertPushed" }),
			" verifies dispatch without running the handler. Run the handler directly to test its logic; run it through the fake to test dispatch. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/",
				children: "Testing"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/queues",
				children: "Queues & Workers"
			}), " — transport, concurrency, and the dead-letter queue"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/background-work/scheduling",
					children: "Scheduled Tasks"
				}),
				" — cron-driven work with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/observability",
				children: "Job Observability"
			}), " — progress, failures, and queue depth"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/",
				children: "Testing"
			}), " — fake the queue and assert on dispatch"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/events",
				children: "Realtime Events"
			}), " — listeners that run through the queue by default"] }),
			"\n"
		] })
	] });
}
function MDXContent(props = {}) {
	const { wrapper: MDXLayout } = props.components || {};
	return MDXLayout ? (0, import_jsx_runtime_react_server.jsx)(MDXLayout, {
		...props,
		children: (0, import_jsx_runtime_react_server.jsx)(_createMdxContent, { ...props })
	}) : _createMdxContent(props);
}
//#endregion
export { _markdown, MDXContent as default, frontmatter, lastModified, structuredData, toc };
