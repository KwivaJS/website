import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/background-work/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Background Work",
	"description": "Jobs, queues, scheduled tasks, and job observability — the work Kwiva runs reliably, off the request path."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nKwiva's background work layer covers everything an application must do that does not belong inside a single request: sending email, pushing webhooks, generating reports, importing data, syncing with third-party services, and anything that should survive a failure and retry. The framework groups these concerns under four primitives — jobs, queues and workers, scheduled tasks, and job observability — all built on the same `defineX` convention as the rest of the framework, so background code feels identical to foreground code.\n\nThere is nothing special to install and no external scheduler to babysit. A job is a file in `src/app/jobs/`, a queue is a named pipeline declared in `src/config/queue.ts`, a task is a file in `src/app/tasks/` scheduled from `src/config/schedule.ts`, and observability falls out automatically. Discovery is by convention; retries, backoff, and the dead-letter queue are built in.\n\n## When to Use Background Work [#when-to-use-background-work]\n\nMove work off the request path when it is:\n\n* **Slow** — an email send, a report render, or a bulk import could add seconds to a response that should take milliseconds.\n* **Reliable-by-requirement** — a payment confirmation webhook that must eventually be delivered, even after a network failure.\n* **Batch-shaped** — work that processes hundreds or thousands of rows and must survive a crash partway through.\n* **Time-dependent** — nightly aggregation, session cleanup, digest generation, or recurring maintenance.\n* **Fan-out** — one action that must trigger several independent side effects.\n\nThe framework provides three execution models for this work: **jobs** (`defineJob`) for queue-backed units of work, **scheduled tasks** (`defineTask`) for cron-driven execution, and **events** (`defineEvent`) for decoupled reactions that run through the queue by default. Each model shares the same transport underneath, which is why reliability, observability, and failure handling do not reshuffle between them.\n\n## The Four Pieces [#the-four-pieces]\n\n| Topic                                                    | Purpose                                                                                        |\n| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |\n| [Jobs](/docs/background-work/jobs)                       | `defineJob` — the unit of work, its payload schema, retries, delays, priority, and idempotency |\n| [Queues & Workers](/docs/background-work/queues)         | Queue transport, concurrency control, the dead-letter queue, and running workers in production |\n| [Scheduled Tasks](/docs/background-work/scheduling)      | `defineTask` plus the cron table in `src/config/schedule.ts` and the scheduler runners         |\n| [Job Observability](/docs/background-work/observability) | Queue depth, failed jobs, progress, structured logs, and correlation IDs                       |\n\n## One Mental Model [#one-mental-model]\n\nThe background layer lives in exactly two app-facing directories plus two config modules:\n\n```plaintext title=\"one-mental-model.txt\"\nsrc/app/jobs/           ← defineJob — one file per unit of work\nsrc/config/queue.ts     ← transport driver + named queues\nsrc/app/tasks/          ← defineTask — cron-driven unit of work\nsrc/config/schedule.ts  ← cron table, overlap control, timezone\n```\n\nA job declares what it does and how the queue should treat it. The queue config declares where work lives (a transport driver and which named queues exist). A task declares work that is run on a schedule rather than dispatched on demand. Nothing is registered by hand — both directories are auto-discovered, and the schedule is read from typed config.\n\n## The Primitives at a Glance [#the-primitives-at-a-glance]\n\n| Primitive      | Export        | Runs when            | Reliability                         |\n| -------------- | ------------- | -------------------- | ----------------------------------- |\n| Job            | `defineJob`   | Dispatched on demand | Retries + backoff, DLQ, idempotency |\n| Task           | `defineTask`  | On a cron schedule   | Timeout, retries, overlap locks     |\n| Event listener | `defineEvent` | When the event emits | Queued execution, retries via queue |\n\nThe boundaries are intentionally porous. A task can dispatch a job when heavy work needs queue semantics, and an event listener is itself a job under the hood. Pick the primitive that matches how the work is triggered — on demand, on a cron, or as a reaction — and let the transport own the rest.\n\n## How Background Work Fits Together [#how-background-work-fits-together]\n\n* **Events run through the queue by default.** A listener on a `defineEvent` is pushed onto the queue, so side effects stay off the request path without extra wiring. Sync execution is an opt-out.\n* **Dispatch is transaction-aware.** A job dispatched inside a database transaction is held until the commit — the same mechanism as the event outbox — so you never enqueue work from a transaction that later rolls back.\n* **Tasks can dispatch jobs.** A scheduled task that detects heavy work hands off to `queue.dispatch` so the queue owns reliability and batching.\n* **Everything is typed from the model IR.** When a job payload references an entity backed by a model, the payload schema and types flow from that model's definition — no duplicate type declarations.\n* **Failures have a home.** Every exhausted job lands in the `failed_jobs` table, where `kwiva queue:failed` and `kwiva queue:retry` manage it, and the DLQ size is a first-class metric.\n\n## The Reliability Story [#the-reliability-story]\n\nBackground work is where an application's promises are kept. The framework makes the delivery guarantees explicit and consistent across all three execution models:\n\n* **At-least-once delivery.** Jobs dispatched to the queue are delivered to a worker, and delivery is retried until the handler reports success. A worker crash mid-run does not lose the job.\n* **Retries with backoff.** A job that fails is retried according to its `attempts` and `backoff` configuration — linear or exponential — before any human involvement. Transient failures resolve themselves; persistent ones become visible.\n* **A dead-letter queue.** A job that exhausts every attempt does not disappear. It lands in the `failed_jobs` table, listed by `kwiva queue:failed` and republishable with `kwiva queue:retry`. The DLQ is both a safety net and an early-warning metric.\n* **Idempotency where it matters.** Dispatch with an `idempotencyKey` so a duplicate dispatch — a double-submitted webhook, a retried request — enqueues once, not twice. See [Jobs](/docs/background-work/jobs) for the full option surface.\n* **Transaction-aware dispatch.** Dispatch inside a database transaction is held until commit, using the same mechanism as the event outbox. Work is never enqueued from a transaction that later rolls back.\n\nNone of these are features you bolt on per job type; they are the baseline of the layer. A job that retries with exponential backoff and lands in the DLQ when it has had enough is the default posture, not a configuration you are responsible for remembering.\n\nReliability would be unmanageable without observability, and the two ship together: every job produces a trace spanning wait time and execution, a structured log entry with a correlation id, and the four queue-level metrics — depth, throughput, failure rate, and DLQ size. See [Job Observability](/docs/background-work/observability).\n\n## Development Experience [#development-experience]\n\nBackground work is developed with the same loop as the rest of the framework:\n\n* **Generate a job** with `kwiva make:job` and get a typed stub in `src/app/jobs/`.\n* **Typed payloads** — when a payload references a model-backed entity, its schema and types flow from the model IR. No duplicate type declarations to keep in sync.\n* **Run the worker in development** with `kwiva queue:work` or the verbose `kwiva queue:listen`, watching jobs as they poll and run.\n* **Test with a fake queue** — `queue.fake()` swaps the transport for an in-memory recorder and `assertPushed` verifies dispatch without running handlers. See [Testing](/docs/testing/).\n* **Manually trigger tasks** with `kwiva task:run name --payload='{\"dry\":true}'` to exercise scheduled work on demand.\n\nBecause discovery is by convention and configuration is typed, the background layer is legible from the first job: the directories say what work exists, the config files say how it runs, and the CLI says what is happening right now.\n\n## Quick Start [#quick-start]\n\nScaffold a job with the CLI generator:\n\n```bash title=\"terminal\"\nkwiva make:job send-welcome\n```\n\nThis creates `src/app/jobs/send-welcome.ts` with a typed stub. Fill in the handler, then dispatch from anywhere in the app:\n\n```ts title=\"quick-start.ts\"\nimport SendWelcome from '../app/jobs/send-welcome'\n\nawait SendWelcome.dispatch({ userId: user.id })\n```\n\nStart the built-in queue worker to process it:\n\n```bash title=\"terminal\"\nkwiva queue:work --queue=emails,default --concurrency=5\n```\n\nThe job runs, failures retry with exponential backoff, and a failed job lands in the dead-letter queue where `kwiva queue:retry` can push it back. Scheduling a recurring version of the same work is a `defineTask` plus one entry in `src/config/schedule.ts` — see [Scheduled Tasks](/docs/background-work/scheduling). Testing the whole loop with a fake queue is covered on the [Jobs](/docs/background-work/jobs) page and in [Testing](/docs/testing/).\n\n## What's Next [#whats-next]\n\n* [Jobs](/docs/background-work/jobs) — define work, dispatch it, and control retries\n* [Queues & Workers](/docs/background-work/queues) — transport, concurrency, and production workers\n* [Scheduled Tasks](/docs/background-work/scheduling) — cron-driven execution with `defineTask`\n* [Job Observability](/docs/background-work/observability) — understand what your queues are doing\n* [Data Layer](/docs/data/) — the models your jobs read and write\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva's background work layer covers everything an application must do that does not belong inside a single request: sending email, pushing webhooks, generating reports, importing data, syncing with third-party services, and anything that should survive a failure and retry. The framework groups these concerns under four primitives — jobs, queues and workers, scheduled tasks, and job observability — all built on the same `defineX` convention as the rest of the framework, so background code feels identical to foreground code."
		},
		{
			"heading": void 0,
			"content": "There is nothing special to install and no external scheduler to babysit. A job is a file in `src/app/jobs/`, a queue is a named pipeline declared in `src/config/queue.ts`, a task is a file in `src/app/tasks/` scheduled from `src/config/schedule.ts`, and observability falls out automatically. Discovery is by convention; retries, backoff, and the dead-letter queue are built in."
		},
		{
			"heading": "when-to-use-background-work",
			"content": "Move work off the request path when it is:"
		},
		{
			"heading": "when-to-use-background-work",
			"content": "**Slow** — an email send, a report render, or a bulk import could add seconds to a response that should take milliseconds."
		},
		{
			"heading": "when-to-use-background-work",
			"content": "**Reliable-by-requirement** — a payment confirmation webhook that must eventually be delivered, even after a network failure."
		},
		{
			"heading": "when-to-use-background-work",
			"content": "**Batch-shaped** — work that processes hundreds or thousands of rows and must survive a crash partway through."
		},
		{
			"heading": "when-to-use-background-work",
			"content": "**Time-dependent** — nightly aggregation, session cleanup, digest generation, or recurring maintenance."
		},
		{
			"heading": "when-to-use-background-work",
			"content": "**Fan-out** — one action that must trigger several independent side effects."
		},
		{
			"heading": "when-to-use-background-work",
			"content": "The framework provides three execution models for this work: **jobs** (`defineJob`) for queue-backed units of work, **scheduled tasks** (`defineTask`) for cron-driven execution, and **events** (`defineEvent`) for decoupled reactions that run through the queue by default. Each model shares the same transport underneath, which is why reliability, observability, and failure handling do not reshuffle between them."
		},
		{
			"heading": "the-four-pieces",
			"content": "Topic"
		},
		{
			"heading": "the-four-pieces",
			"content": "Purpose"
		},
		{
			"heading": "the-four-pieces",
			"content": "Jobs"
		},
		{
			"heading": "the-four-pieces",
			"content": "`defineJob` — the unit of work, its payload schema, retries, delays, priority, and idempotency"
		},
		{
			"heading": "the-four-pieces",
			"content": "Queues & Workers"
		},
		{
			"heading": "the-four-pieces",
			"content": "Queue transport, concurrency control, the dead-letter queue, and running workers in production"
		},
		{
			"heading": "the-four-pieces",
			"content": "Scheduled Tasks"
		},
		{
			"heading": "the-four-pieces",
			"content": "`defineTask` plus the cron table in `src/config/schedule.ts` and the scheduler runners"
		},
		{
			"heading": "the-four-pieces",
			"content": "Job Observability"
		},
		{
			"heading": "the-four-pieces",
			"content": "Queue depth, failed jobs, progress, structured logs, and correlation IDs"
		},
		{
			"heading": "one-mental-model",
			"content": "The background layer lives in exactly two app-facing directories plus two config modules:"
		},
		{
			"heading": "one-mental-model",
			"content": "A job declares what it does and how the queue should treat it. The queue config declares where work lives (a transport driver and which named queues exist). A task declares work that is run on a schedule rather than dispatched on demand. Nothing is registered by hand — both directories are auto-discovered, and the schedule is read from typed config."
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "Primitive"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "Export"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "Runs when"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "Reliability"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "Job"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "`defineJob`"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "Dispatched on demand"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "Retries + backoff, DLQ, idempotency"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "Task"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "`defineTask`"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "On a cron schedule"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "Timeout, retries, overlap locks"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "Event listener"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "`defineEvent`"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "When the event emits"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "Queued execution, retries via queue"
		},
		{
			"heading": "the-primitives-at-a-glance",
			"content": "The boundaries are intentionally porous. A task can dispatch a job when heavy work needs queue semantics, and an event listener is itself a job under the hood. Pick the primitive that matches how the work is triggered — on demand, on a cron, or as a reaction — and let the transport own the rest."
		},
		{
			"heading": "how-background-work-fits-together",
			"content": "**Events run through the queue by default.** A listener on a `defineEvent` is pushed onto the queue, so side effects stay off the request path without extra wiring. Sync execution is an opt-out."
		},
		{
			"heading": "how-background-work-fits-together",
			"content": "**Dispatch is transaction-aware.** A job dispatched inside a database transaction is held until the commit — the same mechanism as the event outbox — so you never enqueue work from a transaction that later rolls back."
		},
		{
			"heading": "how-background-work-fits-together",
			"content": "**Tasks can dispatch jobs.** A scheduled task that detects heavy work hands off to `queue.dispatch` so the queue owns reliability and batching."
		},
		{
			"heading": "how-background-work-fits-together",
			"content": "**Everything is typed from the model IR.** When a job payload references an entity backed by a model, the payload schema and types flow from that model's definition — no duplicate type declarations."
		},
		{
			"heading": "how-background-work-fits-together",
			"content": "**Failures have a home.** Every exhausted job lands in the `failed_jobs` table, where `kwiva queue:failed` and `kwiva queue:retry` manage it, and the DLQ size is a first-class metric."
		},
		{
			"heading": "the-reliability-story",
			"content": "Background work is where an application's promises are kept. The framework makes the delivery guarantees explicit and consistent across all three execution models:"
		},
		{
			"heading": "the-reliability-story",
			"content": "**At-least-once delivery.** Jobs dispatched to the queue are delivered to a worker, and delivery is retried until the handler reports success. A worker crash mid-run does not lose the job."
		},
		{
			"heading": "the-reliability-story",
			"content": "**Retries with backoff.** A job that fails is retried according to its `attempts` and `backoff` configuration — linear or exponential — before any human involvement. Transient failures resolve themselves; persistent ones become visible."
		},
		{
			"heading": "the-reliability-story",
			"content": "**A dead-letter queue.** A job that exhausts every attempt does not disappear. It lands in the `failed_jobs` table, listed by `kwiva queue:failed` and republishable with `kwiva queue:retry`. The DLQ is both a safety net and an early-warning metric."
		},
		{
			"heading": "the-reliability-story",
			"content": "**Idempotency where it matters.** Dispatch with an `idempotencyKey` so a duplicate dispatch — a double-submitted webhook, a retried request — enqueues once, not twice. See Jobs for the full option surface."
		},
		{
			"heading": "the-reliability-story",
			"content": "**Transaction-aware dispatch.** Dispatch inside a database transaction is held until commit, using the same mechanism as the event outbox. Work is never enqueued from a transaction that later rolls back."
		},
		{
			"heading": "the-reliability-story",
			"content": "None of these are features you bolt on per job type; they are the baseline of the layer. A job that retries with exponential backoff and lands in the DLQ when it has had enough is the default posture, not a configuration you are responsible for remembering."
		},
		{
			"heading": "the-reliability-story",
			"content": "Reliability would be unmanageable without observability, and the two ship together: every job produces a trace spanning wait time and execution, a structured log entry with a correlation id, and the four queue-level metrics — depth, throughput, failure rate, and DLQ size. See Job Observability."
		},
		{
			"heading": "development-experience",
			"content": "Background work is developed with the same loop as the rest of the framework:"
		},
		{
			"heading": "development-experience",
			"content": "**Generate a job** with `kwiva make:job` and get a typed stub in `src/app/jobs/`."
		},
		{
			"heading": "development-experience",
			"content": "**Typed payloads** — when a payload references a model-backed entity, its schema and types flow from the model IR. No duplicate type declarations to keep in sync."
		},
		{
			"heading": "development-experience",
			"content": "**Run the worker in development** with `kwiva queue:work` or the verbose `kwiva queue:listen`, watching jobs as they poll and run."
		},
		{
			"heading": "development-experience",
			"content": "**Test with a fake queue** — `queue.fake()` swaps the transport for an in-memory recorder and `assertPushed` verifies dispatch without running handlers. See Testing."
		},
		{
			"heading": "development-experience",
			"content": "**Manually trigger tasks** with `kwiva task:run name --payload='{\"dry\":true}'` to exercise scheduled work on demand."
		},
		{
			"heading": "development-experience",
			"content": "Because discovery is by convention and configuration is typed, the background layer is legible from the first job: the directories say what work exists, the config files say how it runs, and the CLI says what is happening right now."
		},
		{
			"heading": "quick-start",
			"content": "Scaffold a job with the CLI generator:"
		},
		{
			"heading": "quick-start",
			"content": "This creates `src/app/jobs/send-welcome.ts` with a typed stub. Fill in the handler, then dispatch from anywhere in the app:"
		},
		{
			"heading": "quick-start",
			"content": "Start the built-in queue worker to process it:"
		},
		{
			"heading": "quick-start",
			"content": "The job runs, failures retry with exponential backoff, and a failed job lands in the dead-letter queue where `kwiva queue:retry` can push it back. Scheduling a recurring version of the same work is a `defineTask` plus one entry in `src/config/schedule.ts` — see Scheduled Tasks. Testing the whole loop with a fake queue is covered on the Jobs page and in Testing."
		},
		{
			"heading": "whats-next",
			"content": "Jobs — define work, dispatch it, and control retries"
		},
		{
			"heading": "whats-next",
			"content": "Queues & Workers — transport, concurrency, and production workers"
		},
		{
			"heading": "whats-next",
			"content": "Scheduled Tasks — cron-driven execution with `defineTask`"
		},
		{
			"heading": "whats-next",
			"content": "Job Observability — understand what your queues are doing"
		},
		{
			"heading": "whats-next",
			"content": "Data Layer — the models your jobs read and write"
		}
	],
	"headings": [
		{
			"id": "when-to-use-background-work",
			"content": "When to Use Background Work"
		},
		{
			"id": "the-four-pieces",
			"content": "The Four Pieces"
		},
		{
			"id": "one-mental-model",
			"content": "One Mental Model"
		},
		{
			"id": "the-primitives-at-a-glance",
			"content": "The Primitives at a Glance"
		},
		{
			"id": "how-background-work-fits-together",
			"content": "How Background Work Fits Together"
		},
		{
			"id": "the-reliability-story",
			"content": "The Reliability Story"
		},
		{
			"id": "development-experience",
			"content": "Development Experience"
		},
		{
			"id": "quick-start",
			"content": "Quick Start"
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
		url: "#when-to-use-background-work",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When to Use Background Work" })
	},
	{
		depth: 2,
		url: "#the-four-pieces",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Four Pieces" })
	},
	{
		depth: 2,
		url: "#one-mental-model",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One Mental Model" })
	},
	{
		depth: 2,
		url: "#the-primitives-at-a-glance",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Primitives at a Glance" })
	},
	{
		depth: 2,
		url: "#how-background-work-fits-together",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How Background Work Fits Together" })
	},
	{
		depth: 2,
		url: "#the-reliability-story",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Reliability Story" })
	},
	{
		depth: 2,
		url: "#development-experience",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Development Experience" })
	},
	{
		depth: 2,
		url: "#quick-start",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Quick Start" })
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
		strong: "strong",
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
			"Kwiva's background work layer covers everything an application must do that does not belong inside a single request: sending email, pushing webhooks, generating reports, importing data, syncing with third-party services, and anything that should survive a failure and retry. The framework groups these concerns under four primitives — jobs, queues and workers, scheduled tasks, and job observability — all built on the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" convention as the rest of the framework, so background code feels identical to foreground code."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"There is nothing special to install and no external scheduler to babysit. A job is a file in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/" }),
			", a queue is a named pipeline declared in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/queue.ts" }),
			", a task is a file in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/tasks/" }),
			" scheduled from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/schedule.ts" }),
			", and observability falls out automatically. Discovery is by convention; retries, backoff, and the dead-letter queue are built in."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-to-use-background-work",
			children: "When to Use Background Work"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Move work off the request path when it is:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Slow" }), " — an email send, a report render, or a bulk import could add seconds to a response that should take milliseconds."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Reliable-by-requirement" }), " — a payment confirmation webhook that must eventually be delivered, even after a network failure."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Batch-shaped" }), " — work that processes hundreds or thousands of rows and must survive a crash partway through."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Time-dependent" }), " — nightly aggregation, session cleanup, digest generation, or recurring maintenance."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Fan-out" }), " — one action that must trigger several independent side effects."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The framework provides three execution models for this work: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "jobs" }),
			" (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }),
			") for queue-backed units of work, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "scheduled tasks" }),
			" (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }),
			") for cron-driven execution, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "events" }),
			" (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }),
			") for decoupled reactions that run through the queue by default. Each model shares the same transport underneath, which is why reliability, observability, and failure handling do not reshuffle between them."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-four-pieces",
			children: "The Four Pieces"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Topic" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/jobs",
				children: "Jobs"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }), " — the unit of work, its payload schema, retries, delays, priority, and idempotency"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/queues",
				children: "Queues & Workers"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Queue transport, concurrency control, the dead-letter queue, and running workers in production" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/scheduling",
				children: "Scheduled Tasks"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }),
				" plus the cron table in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/schedule.ts" }),
				" and the scheduler runners"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/observability",
				children: "Job Observability"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Queue depth, failed jobs, progress, structured logs, and correlation IDs" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "one-mental-model",
			children: "One Mental Model"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The background layer lives in exactly two app-facing directories plus two config modules:" }),
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
			title: "one-mental-model.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/jobs/           ← defineJob — one file per unit of work" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/config/queue.ts     ← transport driver + named queues" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/tasks/          ← defineTask — cron-driven unit of work" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/config/schedule.ts  ← cron table, overlap control, timezone" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A job declares what it does and how the queue should treat it. The queue config declares where work lives (a transport driver and which named queues exist). A task declares work that is run on a schedule rather than dispatched on demand. Nothing is registered by hand — both directories are auto-discovered, and the schedule is read from typed config." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-primitives-at-a-glance",
			children: "The Primitives at a Glance"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Primitive" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Export" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Runs when" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Reliability" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Job" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dispatched on demand" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Retries + backoff, DLQ, idempotency" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Task" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "On a cron schedule" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Timeout, retries, overlap locks" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Event listener" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "When the event emits" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Queued execution, retries via queue" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The boundaries are intentionally porous. A task can dispatch a job when heavy work needs queue semantics, and an event listener is itself a job under the hood. Pick the primitive that matches how the work is triggered — on demand, on a cron, or as a reaction — and let the transport own the rest." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-background-work-fits-together",
			children: "How Background Work Fits Together"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Events run through the queue by default." }),
				" A listener on a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }),
				" is pushed onto the queue, so side effects stay off the request path without extra wiring. Sync execution is an opt-out."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Dispatch is transaction-aware." }), " A job dispatched inside a database transaction is held until the commit — the same mechanism as the event outbox — so you never enqueue work from a transaction that later rolls back."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tasks can dispatch jobs." }),
				" A scheduled task that detects heavy work hands off to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.dispatch" }),
				" so the queue owns reliability and batching."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Everything is typed from the model IR." }), " When a job payload references an entity backed by a model, the payload schema and types flow from that model's definition — no duplicate type declarations."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Failures have a home." }),
				" Every exhausted job lands in the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "failed_jobs" }),
				" table, where ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:failed" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:retry" }),
				" manage it, and the DLQ size is a first-class metric."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-reliability-story",
			children: "The Reliability Story"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Background work is where an application's promises are kept. The framework makes the delivery guarantees explicit and consistent across all three execution models:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "At-least-once delivery." }), " Jobs dispatched to the queue are delivered to a worker, and delivery is retried until the handler reports success. A worker crash mid-run does not lose the job."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Retries with backoff." }),
				" A job that fails is retried according to its ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "attempts" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "backoff" }),
				" configuration — linear or exponential — before any human involvement. Transient failures resolve themselves; persistent ones become visible."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "A dead-letter queue." }),
				" A job that exhausts every attempt does not disappear. It lands in the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "failed_jobs" }),
				" table, listed by ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:failed" }),
				" and republishable with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:retry" }),
				". The DLQ is both a safety net and an early-warning metric."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Idempotency where it matters." }),
				" Dispatch with an ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "idempotencyKey" }),
				" so a duplicate dispatch — a double-submitted webhook, a retried request — enqueues once, not twice. See ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/background-work/jobs",
					children: "Jobs"
				}),
				" for the full option surface."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Transaction-aware dispatch." }), " Dispatch inside a database transaction is held until commit, using the same mechanism as the event outbox. Work is never enqueued from a transaction that later rolls back."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "None of these are features you bolt on per job type; they are the baseline of the layer. A job that retries with exponential backoff and lands in the DLQ when it has had enough is the default posture, not a configuration you are responsible for remembering." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Reliability would be unmanageable without observability, and the two ship together: every job produces a trace spanning wait time and execution, a structured log entry with a correlation id, and the four queue-level metrics — depth, throughput, failure rate, and DLQ size. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/observability",
				children: "Job Observability"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "development-experience",
			children: "Development Experience"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Background work is developed with the same loop as the rest of the framework:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Generate a job" }),
				" with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:job" }),
				" and get a typed stub in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Typed payloads" }), " — when a payload references a model-backed entity, its schema and types flow from the model IR. No duplicate type declarations to keep in sync."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Run the worker in development" }),
				" with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:work" }),
				" or the verbose ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:listen" }),
				", watching jobs as they poll and run."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Test with a fake queue" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.fake()" }),
				" swaps the transport for an in-memory recorder and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "assertPushed" }),
				" verifies dispatch without running handlers. See ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/testing/",
					children: "Testing"
				}),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Manually trigger tasks" }),
				" with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva task:run name --payload='{\"dry\":true}'" }),
				" to exercise scheduled work on demand."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because discovery is by convention and configuration is typed, the background layer is legible from the first job: the directories say what work exists, the config files say how it runs, and the CLI says what is happening right now." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "quick-start",
			children: "Quick Start"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Scaffold a job with the CLI generator:" }),
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
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
						children: " make:job"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " send-welcome"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This creates ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/send-welcome.ts" }),
			" with a typed stub. Fill in the handler, then dispatch from anywhere in the app:"
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
			title: "quick-start.ts",
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
							children: "({ userId: user.id })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Start the built-in queue worker to process it:" }),
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
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
						children: " queue:work"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: " --queue=emails,default"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: " --concurrency=5"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The job runs, failures retry with exponential backoff, and a failed job lands in the dead-letter queue where ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:retry" }),
			" can push it back. Scheduling a recurring version of the same work is a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }),
			" plus one entry in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/schedule.ts" }),
			" — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/scheduling",
				children: "Scheduled Tasks"
			}),
			". Testing the whole loop with a fake queue is covered on the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/jobs",
				children: "Jobs"
			}),
			" page and in ",
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
				href: "/docs/background-work/jobs",
				children: "Jobs"
			}), " — define work, dispatch it, and control retries"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/queues",
				children: "Queues & Workers"
			}), " — transport, concurrency, and production workers"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/background-work/scheduling",
					children: "Scheduled Tasks"
				}),
				" — cron-driven execution with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/observability",
				children: "Job Observability"
			}), " — understand what your queues are doing"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/",
				children: "Data Layer"
			}), " — the models your jobs read and write"] }),
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
