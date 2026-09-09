import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/background-work/scheduling.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Scheduled Tasks",
	"description": "defineTask, the cron table in src/config/schedule.ts, overlap control, timezone handling, manual runs, and external cron triggers."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nScheduled tasks are the cron half of the background layer. A task is a unit of work that runs on a schedule decided in configuration, executed by the framework's internal engine rather than by the queue. Use tasks when there is no queue requirement — recurring, engine-native execution is the point. When a scheduled unit of work needs queue semantics, a task hands off by dispatching a `defineJob`.\n\nThe schedule is declarative and lives in one file. Tasks define the work; `src/config/schedule.ts` decides when it runs, on which instances, and whether it hands off to a queue. There is no cron scattered through the codebase and no separate scheduler service to keep alive in code.\n\n## Defining a Task [#defining-a-task]\n\nTasks live one per file in `src/app/tasks/` as `defineTask` calls:\n\n```ts title=\"src/app/tasks/cleanup-sessions.ts\"\n// src/app/tasks/cleanup-sessions.ts\nimport { defineTask } from '@kwiva/http'\n\nexport default defineTask('cleanup-sessions', async ({ payload, logger, config }) => {\n  const n = await Session.query().where('expiresAt', '<', new Date()).delete()\n  logger.info({ deleted: n }, 'session cleanup done')\n  return { deleted: n }\n}, { timeout: 30_000, retries: 2 })\n```\n\nThe handler receives the payload, a `logger`, and the app `config`, and returns a result object. `timeout` caps a single run in milliseconds; `retries` bounds automatic re-runs on failure. Tasks can also be `defineJob`s — choose tasks when cron is the whole story, and jobs when the work also needs queue transport, retries with backoff, or priority.\n\n## The Schedule [#the-schedule]\n\nThe schedule is config, not code scattered through tasks. All cron expressions live in `src/config/schedule.ts`:\n\n```ts title=\"src/config/schedule.ts\"\n// src/config/schedule.ts\nimport { defineConfig } from '@kwiva/config'\n\nexport default defineConfig('schedule', {\n  defaults: {\n    tz: 'UTC',\n    tasks: {\n      'cleanup-sessions': { cron: '0 3 * * *', withoutOverlapping: true },\n      'generate-digest':  { cron: '*/15 * * * *', onOneServer: true, queue: 'emails' },\n      'backup-database':  { cron: '0 4 * * 0', runAt: '04:00' },\n    },\n  },\n})\n```\n\nEach entry maps a task name to a schedule. The task itself is defined in `src/app/tasks/`; the config decides when it runs, on which instances, and whether it hands off to a queue. The schedule module is read by the scheduler runner, which is how the same config serves `schedule:list`, `schedule:work`, and `schedule:run`.\n\n## Schedule Options [#schedule-options]\n\n| Option                      | What it controls                                                                               |\n| --------------------------- | ---------------------------------------------------------------------------------------------- |\n| `cron`                      | Schedule expression — standard five fields, with seconds as an optional extension              |\n| `withoutOverlapping`        | Per-task mutex: never start the next run while a previous run is still going                   |\n| `onOneServer`               | Distributed lock so only one instance of the deployment runs the task, even with many replicas |\n| `timezone` / `tz`           | Timezone for evaluating the cron expression — defaults to `UTC`                                |\n| `queue`                     | Dispatch the task as a job on the named queue for heavy work                                   |\n| `runAt`                     | Daily-time sugar, e.g. `runAt: '04:00'`, which expands to the equivalent cron expression       |\n| `between` / `unlessBetween` | Window constraints restricting when the task may run (v1.x)                                    |\n\nThe two lock options answer the classic scheduler questions. `withoutOverlapping` protects a task against itself — a slow run must finish before the next tick starts. `onOneServer` protects against multiple replicas running the same task simultaneously; when several instances are deployed, `onOneServer` coordinates via a shared lock so a nightly job runs exactly once across the fleet. A task that must run everywhere — a per-instance warmup, for example — simply configures neither.\n\n## Runners [#runners]\n\n```bash title=\"terminal\"\nkwiva schedule:list                 # table of tasks + next run times\nkwiva schedule:work                 # foreground scheduler (docker-friendly)\nkwiva schedule:run                  # single tick (system cron entry: * * * * *)\nkwiva task:run cleanup-sessions --payload='{\"dry\":true}'\n```\n\nThree scheduling shapes cover deployment:\n\n* `kwiva schedule:list` prints the schedule with each task's next run time — and `--json` renders it machine-readable for dashboards.\n* `kwiva schedule:work` runs the scheduler in the foreground, keeping the loop alive inside a container.\n* `kwiva schedule:run` performs a single tick. Wire it to a system cron entry that fires every minute and the external scheduler owns the loop.\n\nFor one-off runs, `kwiva task:run <name> --payload=<json>` executes any task immediately with the given payload — the same code path as scheduled execution, useful for manual maintenance and for testing a task before it goes on the schedule.\n\n## Task APIs in Code [#task-apis-in-code]\n\nTasks are also callable from application code through the autogenerated task API:\n\n```ts title=\"task-apis-in-code.ts\"\nimport { tasks } from '@kwiva/http'\n\nawait tasks.run('cleanup-sessions', { payload: { dry: true } })\nconst info = await tasks.status('cleanup-sessions')   // last run, duration, result\n```\n\n`tasks.run` triggers execution with a payload; `tasks.status` reports the previous run's outcome, duration, and result. This is the same surface the engine exposes publicly, which is how external schedulers invoke tasks.\n\n## External Cron Triggers [#external-cron-triggers]\n\nWhen the platform provides its own scheduler — a serverless cron, or a scheduled trigger with a fixed cron window — Kwiva exposes each task as a secret-protected endpoint for it to call:\n\n```plaintext title=\"external-cron-triggers.txt\"\n/api/__tasks/{name}\n```\n\nThe endpoint is guarded by a secret so only your scheduler can trigger work. The pattern: configure your platform scheduler to issue an HTTP request to the task endpoint on its own cadence, and Kwiva accepts the fire-and-forget trigger. This lets the deployment platform own cron while the task handler stays in the framework. See [Deployment](/docs/deployment/).\n\n## Scheduling in Code (Planned) [#scheduling-in-code-planned]\n\nThe config-first schedule is the documented surface today. A declarative `defineSchedule` form for expressing the same cron table in code is planned (v1.x), for teams that prefer schedules to live next to their tasks rather than in a single config module. Until it lands, `src/config/schedule.ts` remains the single source of truth, and every runner reads from it.\n\n## Observability [#observability]\n\nEvery task run produces a structured `task.run` log event carrying duration and result, plus a trace span for the run. Failures retry per the task's `retries` option, then feed a `task_failures` metric and an alert hook configured in `src/config/telemetry.ts`. `kwiva schedule:list --json` provides the run bookkeeping for external dashboards. Details in [Job Observability](/docs/background-work/observability).\n\n## Common Patterns [#common-patterns]\n\n| Need             | Pattern                                                                                        |\n| ---------------- | ---------------------------------------------------------------------------------------------- |\n| Nightly cleanup  | Task with `withoutOverlapping`                                                                 |\n| 15-minute digest | Task that dispatches a `defineJob` onto the `emails` queue                                     |\n| Backups          | Task dumps data, writes to `storage.put('backups/...')`, and a retention task prunes old files |\n| Cache warmup     | Post-deploy task that prefetches hot queries                                                   |\n| Outbox pump      | Built-in task (v1.x) that forwards committed events to listeners and broadcast                 |\n\n## Choosing Between Tasks and Jobs [#choosing-between-tasks-and-jobs]\n\n| Question                                                                                  | Answer                                            |\n| ----------------------------------------------------------------------------------------- | ------------------------------------------------- |\n| Is the work triggered by a clock?                                                         | Task                                              |\n| Does the work need queue semantics — durable retries with backoff, priority, rate limits? | Job                                               |\n| Is the work both scheduled and heavy?                                                     | Task that dispatches a job via the `queue` option |\n| Is the work a response to something that happened?                                        | Event listener (queued by default)                |\n\nThe boundaries are porous on purpose. A task can hand off to the queue, an event listener is a job under the hood, and a job can be dispatched from a task. The primitive matches the trigger, and the transport owns the reliability.\n\n## What's Next [#whats-next]\n\n* [Jobs](/docs/background-work/jobs) — the queue-backed counterpart to tasks\n* [Queues & Workers](/docs/background-work/queues) — where heavy tasks dispatch their work\n* [Job Observability](/docs/background-work/observability) — structured logs, metrics, and alerting\n* [Configuration](/docs/core-concepts/configuration) — the typed config system behind `src/config/schedule.ts`\n* [Deployment](/docs/deployment/) — running the scheduler and worker in production\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Scheduled tasks are the cron half of the background layer. A task is a unit of work that runs on a schedule decided in configuration, executed by the framework's internal engine rather than by the queue. Use tasks when there is no queue requirement — recurring, engine-native execution is the point. When a scheduled unit of work needs queue semantics, a task hands off by dispatching a `defineJob`."
		},
		{
			"heading": void 0,
			"content": "The schedule is declarative and lives in one file. Tasks define the work; `src/config/schedule.ts` decides when it runs, on which instances, and whether it hands off to a queue. There is no cron scattered through the codebase and no separate scheduler service to keep alive in code."
		},
		{
			"heading": "defining-a-task",
			"content": "Tasks live one per file in `src/app/tasks/` as `defineTask` calls:"
		},
		{
			"heading": "defining-a-task",
			"content": "The handler receives the payload, a `logger`, and the app `config`, and returns a result object. `timeout` caps a single run in milliseconds; `retries` bounds automatic re-runs on failure. Tasks can also be `defineJob`s — choose tasks when cron is the whole story, and jobs when the work also needs queue transport, retries with backoff, or priority."
		},
		{
			"heading": "the-schedule",
			"content": "The schedule is config, not code scattered through tasks. All cron expressions live in `src/config/schedule.ts`:"
		},
		{
			"heading": "the-schedule",
			"content": "Each entry maps a task name to a schedule. The task itself is defined in `src/app/tasks/`; the config decides when it runs, on which instances, and whether it hands off to a queue. The schedule module is read by the scheduler runner, which is how the same config serves `schedule:list`, `schedule:work`, and `schedule:run`."
		},
		{
			"heading": "schedule-options",
			"content": "Option"
		},
		{
			"heading": "schedule-options",
			"content": "What it controls"
		},
		{
			"heading": "schedule-options",
			"content": "`cron`"
		},
		{
			"heading": "schedule-options",
			"content": "Schedule expression — standard five fields, with seconds as an optional extension"
		},
		{
			"heading": "schedule-options",
			"content": "`withoutOverlapping`"
		},
		{
			"heading": "schedule-options",
			"content": "Per-task mutex: never start the next run while a previous run is still going"
		},
		{
			"heading": "schedule-options",
			"content": "`onOneServer`"
		},
		{
			"heading": "schedule-options",
			"content": "Distributed lock so only one instance of the deployment runs the task, even with many replicas"
		},
		{
			"heading": "schedule-options",
			"content": "`timezone` / `tz`"
		},
		{
			"heading": "schedule-options",
			"content": "Timezone for evaluating the cron expression — defaults to `UTC`"
		},
		{
			"heading": "schedule-options",
			"content": "`queue`"
		},
		{
			"heading": "schedule-options",
			"content": "Dispatch the task as a job on the named queue for heavy work"
		},
		{
			"heading": "schedule-options",
			"content": "`runAt`"
		},
		{
			"heading": "schedule-options",
			"content": "Daily-time sugar, e.g. `runAt: '04:00'`, which expands to the equivalent cron expression"
		},
		{
			"heading": "schedule-options",
			"content": "`between` / `unlessBetween`"
		},
		{
			"heading": "schedule-options",
			"content": "Window constraints restricting when the task may run (v1.x)"
		},
		{
			"heading": "schedule-options",
			"content": "The two lock options answer the classic scheduler questions. `withoutOverlapping` protects a task against itself — a slow run must finish before the next tick starts. `onOneServer` protects against multiple replicas running the same task simultaneously; when several instances are deployed, `onOneServer` coordinates via a shared lock so a nightly job runs exactly once across the fleet. A task that must run everywhere — a per-instance warmup, for example — simply configures neither."
		},
		{
			"heading": "runners",
			"content": "Three scheduling shapes cover deployment:"
		},
		{
			"heading": "runners",
			"content": "`kwiva schedule:list` prints the schedule with each task's next run time — and `--json` renders it machine-readable for dashboards."
		},
		{
			"heading": "runners",
			"content": "`kwiva schedule:work` runs the scheduler in the foreground, keeping the loop alive inside a container."
		},
		{
			"heading": "runners",
			"content": "`kwiva schedule:run` performs a single tick. Wire it to a system cron entry that fires every minute and the external scheduler owns the loop."
		},
		{
			"heading": "runners",
			"content": "For one-off runs, `kwiva task:run <name> --payload=<json>` executes any task immediately with the given payload — the same code path as scheduled execution, useful for manual maintenance and for testing a task before it goes on the schedule."
		},
		{
			"heading": "task-apis-in-code",
			"content": "Tasks are also callable from application code through the autogenerated task API:"
		},
		{
			"heading": "task-apis-in-code",
			"content": "`tasks.run` triggers execution with a payload; `tasks.status` reports the previous run's outcome, duration, and result. This is the same surface the engine exposes publicly, which is how external schedulers invoke tasks."
		},
		{
			"heading": "external-cron-triggers",
			"content": "When the platform provides its own scheduler — a serverless cron, or a scheduled trigger with a fixed cron window — Kwiva exposes each task as a secret-protected endpoint for it to call:"
		},
		{
			"heading": "external-cron-triggers",
			"content": "The endpoint is guarded by a secret so only your scheduler can trigger work. The pattern: configure your platform scheduler to issue an HTTP request to the task endpoint on its own cadence, and Kwiva accepts the fire-and-forget trigger. This lets the deployment platform own cron while the task handler stays in the framework. See Deployment."
		},
		{
			"heading": "scheduling-in-code-planned",
			"content": "The config-first schedule is the documented surface today. A declarative `defineSchedule` form for expressing the same cron table in code is planned (v1.x), for teams that prefer schedules to live next to their tasks rather than in a single config module. Until it lands, `src/config/schedule.ts` remains the single source of truth, and every runner reads from it."
		},
		{
			"heading": "observability",
			"content": "Every task run produces a structured `task.run` log event carrying duration and result, plus a trace span for the run. Failures retry per the task's `retries` option, then feed a `task_failures` metric and an alert hook configured in `src/config/telemetry.ts`. `kwiva schedule:list --json` provides the run bookkeeping for external dashboards. Details in Job Observability."
		},
		{
			"heading": "common-patterns",
			"content": "Need"
		},
		{
			"heading": "common-patterns",
			"content": "Pattern"
		},
		{
			"heading": "common-patterns",
			"content": "Nightly cleanup"
		},
		{
			"heading": "common-patterns",
			"content": "Task with `withoutOverlapping`"
		},
		{
			"heading": "common-patterns",
			"content": "15-minute digest"
		},
		{
			"heading": "common-patterns",
			"content": "Task that dispatches a `defineJob` onto the `emails` queue"
		},
		{
			"heading": "common-patterns",
			"content": "Backups"
		},
		{
			"heading": "common-patterns",
			"content": "Task dumps data, writes to `storage.put('backups/...')`, and a retention task prunes old files"
		},
		{
			"heading": "common-patterns",
			"content": "Cache warmup"
		},
		{
			"heading": "common-patterns",
			"content": "Post-deploy task that prefetches hot queries"
		},
		{
			"heading": "common-patterns",
			"content": "Outbox pump"
		},
		{
			"heading": "common-patterns",
			"content": "Built-in task (v1.x) that forwards committed events to listeners and broadcast"
		},
		{
			"heading": "choosing-between-tasks-and-jobs",
			"content": "Question"
		},
		{
			"heading": "choosing-between-tasks-and-jobs",
			"content": "Answer"
		},
		{
			"heading": "choosing-between-tasks-and-jobs",
			"content": "Is the work triggered by a clock?"
		},
		{
			"heading": "choosing-between-tasks-and-jobs",
			"content": "Task"
		},
		{
			"heading": "choosing-between-tasks-and-jobs",
			"content": "Does the work need queue semantics — durable retries with backoff, priority, rate limits?"
		},
		{
			"heading": "choosing-between-tasks-and-jobs",
			"content": "Job"
		},
		{
			"heading": "choosing-between-tasks-and-jobs",
			"content": "Is the work both scheduled and heavy?"
		},
		{
			"heading": "choosing-between-tasks-and-jobs",
			"content": "Task that dispatches a job via the `queue` option"
		},
		{
			"heading": "choosing-between-tasks-and-jobs",
			"content": "Is the work a response to something that happened?"
		},
		{
			"heading": "choosing-between-tasks-and-jobs",
			"content": "Event listener (queued by default)"
		},
		{
			"heading": "choosing-between-tasks-and-jobs",
			"content": "The boundaries are porous on purpose. A task can hand off to the queue, an event listener is a job under the hood, and a job can be dispatched from a task. The primitive matches the trigger, and the transport owns the reliability."
		},
		{
			"heading": "whats-next",
			"content": "Jobs — the queue-backed counterpart to tasks"
		},
		{
			"heading": "whats-next",
			"content": "Queues & Workers — where heavy tasks dispatch their work"
		},
		{
			"heading": "whats-next",
			"content": "Job Observability — structured logs, metrics, and alerting"
		},
		{
			"heading": "whats-next",
			"content": "Configuration — the typed config system behind `src/config/schedule.ts`"
		},
		{
			"heading": "whats-next",
			"content": "Deployment — running the scheduler and worker in production"
		}
	],
	"headings": [
		{
			"id": "defining-a-task",
			"content": "Defining a Task"
		},
		{
			"id": "the-schedule",
			"content": "The Schedule"
		},
		{
			"id": "schedule-options",
			"content": "Schedule Options"
		},
		{
			"id": "runners",
			"content": "Runners"
		},
		{
			"id": "task-apis-in-code",
			"content": "Task APIs in Code"
		},
		{
			"id": "external-cron-triggers",
			"content": "External Cron Triggers"
		},
		{
			"id": "scheduling-in-code-planned",
			"content": "Scheduling in Code (Planned)"
		},
		{
			"id": "observability",
			"content": "Observability"
		},
		{
			"id": "common-patterns",
			"content": "Common Patterns"
		},
		{
			"id": "choosing-between-tasks-and-jobs",
			"content": "Choosing Between Tasks and Jobs"
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
		url: "#defining-a-task",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Defining a Task" })
	},
	{
		depth: 2,
		url: "#the-schedule",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Schedule" })
	},
	{
		depth: 2,
		url: "#schedule-options",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Schedule Options" })
	},
	{
		depth: 2,
		url: "#runners",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Runners" })
	},
	{
		depth: 2,
		url: "#task-apis-in-code",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Task APIs in Code" })
	},
	{
		depth: 2,
		url: "#external-cron-triggers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "External Cron Triggers" })
	},
	{
		depth: 2,
		url: "#scheduling-in-code-planned",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Scheduling in Code (Planned)" })
	},
	{
		depth: 2,
		url: "#observability",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Observability" })
	},
	{
		depth: 2,
		url: "#common-patterns",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Common Patterns" })
	},
	{
		depth: 2,
		url: "#choosing-between-tasks-and-jobs",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Choosing Between Tasks and Jobs" })
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
			"Scheduled tasks are the cron half of the background layer. A task is a unit of work that runs on a schedule decided in configuration, executed by the framework's internal engine rather than by the queue. Use tasks when there is no queue requirement — recurring, engine-native execution is the point. When a scheduled unit of work needs queue semantics, a task hands off by dispatching a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The schedule is declarative and lives in one file. Tasks define the work; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/schedule.ts" }),
			" decides when it runs, on which instances, and whether it hands off to a queue. There is no cron scattered through the codebase and no separate scheduler service to keep alive in code."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "defining-a-task",
			children: "Defining a Task"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Tasks live one per file in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/tasks/" }),
			" as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }),
			" calls:"
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
			title: "src/app/tasks/cleanup-sessions.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/tasks/cleanup-sessions.ts"
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
							children: " { defineTask } "
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
							children: " '@kwiva/http'"
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
							children: " defineTask"
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
							children: "'cleanup-sessions'"
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
							children: "logger"
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
							children: "config"
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
							children: " n"
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
							children: " Session."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "query"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "where"
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
							children: "'expiresAt'"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'<'"
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
							children: "new"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " Date"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "())."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "delete"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  logger."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "info"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ deleted: n }, "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'session cleanup done'"
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
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "  return"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " { deleted: n }"
					})]
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
							children: "}, { timeout: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "30_000"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", retries: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "2"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The handler receives the payload, a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "logger" }),
			", and the app ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config" }),
			", and returns a result object. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "timeout" }),
			" caps a single run in milliseconds; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "retries" }),
			" bounds automatic re-runs on failure. Tasks can also be ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }),
			"s — choose tasks when cron is the whole story, and jobs when the work also needs queue transport, retries with backoff, or priority."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-schedule",
			children: "The Schedule"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The schedule is config, not code scattered through tasks. All cron expressions live in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/schedule.ts" }),
			":"
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
			title: "src/config/schedule.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/schedule.ts"
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
							children: " { defineConfig } "
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
							children: " '@kwiva/config'"
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
							children: " defineConfig"
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
							children: "'schedule'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", {"
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
						children: "  defaults: {"
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
							children: "    tz: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'UTC'"
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
						children: "    tasks: {"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "      'cleanup-sessions'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": { cron: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'0 3 * * *'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", withoutOverlapping: "
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
							children: " },"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "      'generate-digest'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":  { cron: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'*/15 * * * *'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", onOneServer: "
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
							children: ", queue: "
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
							children: " },"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "      'backup-database'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":  { cron: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'0 4 * * 0'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", runAt: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'04:00'"
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
						children: "    },"
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
						children: "  },"
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
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each entry maps a task name to a schedule. The task itself is defined in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/tasks/" }),
			"; the config decides when it runs, on which instances, and whether it hands off to a queue. The schedule module is read by the scheduler runner, which is how the same config serves ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schedule:list" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schedule:work" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schedule:run" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "schedule-options",
			children: "Schedule Options"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Option" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it controls" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cron" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Schedule expression — standard five fields, with seconds as an optional extension" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withoutOverlapping" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Per-task mutex: never start the next run while a previous run is still going" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onOneServer" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Distributed lock so only one instance of the deployment runs the task, even with many replicas" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "timezone" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tz" })
			] }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Timezone for evaluating the cron expression — defaults to ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "UTC" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dispatch the task as a job on the named queue for heavy work" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "runAt" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Daily-time sugar, e.g. ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "runAt: '04:00'" }),
				", which expands to the equivalent cron expression"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "between" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "unlessBetween" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Window constraints restricting when the task may run (v1.x)" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The two lock options answer the classic scheduler questions. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withoutOverlapping" }),
			" protects a task against itself — a slow run must finish before the next tick starts. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onOneServer" }),
			" protects against multiple replicas running the same task simultaneously; when several instances are deployed, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onOneServer" }),
			" coordinates via a shared lock so a nightly job runs exactly once across the fleet. A task that must run everywhere — a per-instance warmup, for example — simply configures neither."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "runners",
			children: "Runners"
		}),
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
			title: "terminal",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " schedule:list"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                 # table of tasks + next run times"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " schedule:work"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                 # foreground scheduler (docker-friendly)"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " schedule:run"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                  # single tick (system cron entry: * * * * *)"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " task:run"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " cleanup-sessions"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --payload="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'{\"dry\":true}'"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Three scheduling shapes cover deployment:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva schedule:list" }),
				" prints the schedule with each task's next run time — and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--json" }),
				" renders it machine-readable for dashboards."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva schedule:work" }), " runs the scheduler in the foreground, keeping the loop alive inside a container."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva schedule:run" }), " performs a single tick. Wire it to a system cron entry that fires every minute and the external scheduler owns the loop."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For one-off runs, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva task:run <name> --payload=<json>" }),
			" executes any task immediately with the given payload — the same code path as scheduled execution, useful for manual maintenance and for testing a task before it goes on the schedule."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "task-apis-in-code",
			children: "Task APIs in Code"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tasks are also callable from application code through the autogenerated task API:" }),
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
			title: "task-apis-in-code.ts",
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
							children: " { tasks } "
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
							children: " '@kwiva/http'"
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
							children: " tasks."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "run"
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
							children: "'cleanup-sessions'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { payload: { dry: "
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
							children: " } })"
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " info"
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
							children: " tasks."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "status"
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
							children: "'cleanup-sessions'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// last run, duration, result"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tasks.run" }),
			" triggers execution with a payload; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tasks.status" }),
			" reports the previous run's outcome, duration, and result. This is the same surface the engine exposes publicly, which is how external schedulers invoke tasks."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "external-cron-triggers",
			children: "External Cron Triggers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "When the platform provides its own scheduler — a serverless cron, or a scheduled trigger with a fixed cron window — Kwiva exposes each task as a secret-protected endpoint for it to call:" }),
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
			title: "external-cron-triggers.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/api/__tasks/{name}" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The endpoint is guarded by a secret so only your scheduler can trigger work. The pattern: configure your platform scheduler to issue an HTTP request to the task endpoint on its own cadence, and Kwiva accepts the fire-and-forget trigger. This lets the deployment platform own cron while the task handler stays in the framework. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/",
				children: "Deployment"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "scheduling-in-code-planned",
			children: "Scheduling in Code (Planned)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The config-first schedule is the documented surface today. A declarative ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineSchedule" }),
			" form for expressing the same cron table in code is planned (v1.x), for teams that prefer schedules to live next to their tasks rather than in a single config module. Until it lands, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/schedule.ts" }),
			" remains the single source of truth, and every runner reads from it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "observability",
			children: "Observability"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every task run produces a structured ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task.run" }),
			" log event carrying duration and result, plus a trace span for the run. Failures retry per the task's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "retries" }),
			" option, then feed a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task_failures" }),
			" metric and an alert hook configured in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/telemetry.ts" }),
			". ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva schedule:list --json" }),
			" provides the run bookkeeping for external dashboards. Details in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/observability",
				children: "Job Observability"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "common-patterns",
			children: "Common Patterns"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Need" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Pattern" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Nightly cleanup" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Task with ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withoutOverlapping" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "15-minute digest" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Task that dispatches a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }),
				" onto the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "emails" }),
				" queue"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Backups" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Task dumps data, writes to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage.put('backups/...')" }),
				", and a retention task prunes old files"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cache warmup" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Post-deploy task that prefetches hot queries" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Outbox pump" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Built-in task (v1.x) that forwards committed events to listeners and broadcast" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "choosing-between-tasks-and-jobs",
			children: "Choosing Between Tasks and Jobs"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Question" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Answer" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Is the work triggered by a clock?" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Task" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Does the work need queue semantics — durable retries with backoff, priority, rate limits?" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Job" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Is the work both scheduled and heavy?" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Task that dispatches a job via the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue" }),
				" option"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Is the work a response to something that happened?" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Event listener (queued by default)" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The boundaries are porous on purpose. A task can hand off to the queue, an event listener is a job under the hood, and a job can be dispatched from a task. The primitive matches the trigger, and the transport owns the reliability." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/jobs",
				children: "Jobs"
			}), " — the queue-backed counterpart to tasks"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/queues",
				children: "Queues & Workers"
			}), " — where heavy tasks dispatch their work"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/observability",
				children: "Job Observability"
			}), " — structured logs, metrics, and alerting"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/configuration",
					children: "Configuration"
				}),
				" — the typed config system behind ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/schedule.ts" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/",
				children: "Deployment"
			}), " — running the scheduler and worker in production"] }),
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
