import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/background-work/observability.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Job Observability",
	"description": "Queue depth, failed jobs, job progress, structured logs, and correlation IDs for the background layer."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nBackground work is invisible by definition — it never serves a request you can watch. Observability for the background layer exists to make it visible again: to see how deep each queue is, how many jobs have failed, how far a long job has gotten, and exactly which logs belong to which job attempt. Kwiva instruments the entire lifecycle automatically, so the information is available the moment a queue starts running.\n\nThe background layer and the web layer share one observability pipeline. A trace started in a controller that dispatches a job continues into the worker that runs it; a log line from a task run joins the same structured pipeline as request logs. There is no second observability system to learn for background work.\n\n## What Is Tracked Automatically [#what-is-tracked-automatically]\n\nEvery job that moves through the transport produces a trace from dispatch to start to finish, including queue wait time:\n\n```plaintext title=\"what-is-tracked-automatically.txt\"\ndispatch ──► (queued) ──► start ──► (handler) ──► finish / failed\n                └──────── wait time ────────┘\n```\n\nBecause dispatch and execution are separate processes, the full span bridges both: you can see not only how long a job ran but how long it waited before a worker picked it up. High wait times mean a queue is backed up; long run times mean the job itself is slow. The span is emitted per job and per attempt, so retries are visible as distinct segments of the same job's history.\n\nAlongside traces, the framework maintains a small set of queue metrics:\n\n| Metric       | What it tells you                                             |\n| ------------ | ------------------------------------------------------------- |\n| Queue depth  | How much work is pending per queue                            |\n| Throughput   | How many jobs complete per interval                           |\n| Failure rate | The share of runs that fail and consume a retry               |\n| DLQ size     | Jobs that exhausted retries and entered the dead-letter queue |\n\nDLQ size is the metric that deserves a watch. It stays flat on a healthy system; when it grows, jobs are failing systematically and someone must decide between retrying, fixing the cause, and clearing. See [Metrics](/docs/observability/metrics) for where these land on dashboards.\n\n## Inspecting the Queue [#inspecting-the-queue]\n\nThe CLI is the fastest surface for looking at the current state:\n\n```bash title=\"terminal\"\nkwiva queue:failed        # dead-letter queue listing with attempt history + error\nkwiva queue:clear <queue> # drop pending work in a queue\n```\n\n`kwiva queue:failed` lists each dead job with the attempts behind it and the error that ended it. `kwiva queue:retry <id>` or `--retry --all` republishes. This is the day-to-day operational loop: observe the failure, decide, retry or clear. Queue depth, throughput, and failure rate are emitted continuously for whatever collection backend your metrics configuration points at.\n\n## Job Progress [#job-progress]\n\nA job can report its own progression through the `job` object:\n\n```ts title=\"job-progress.ts\"\njob.progress(50)\n```\n\nProgress is advisory state attached to the job record. For a long-running, multi-phase job — an import with distinct read/transform/write phases — progress makes \"is it stuck or progressing?\" trivially answerable. Progress does not change scheduling behavior; it exists so operators and Studio can see a job is alive and moving.\n\n## Structured Job Logs [#structured-job-logs]\n\nEach job handler receives a `logger` scoped to that execution:\n\n```ts title=\"structured-job-logs.ts\"\nexport default defineJob('import-rows', async ({ payload, job, logger }) => {\n  const rows = await readFile(payload.path)\n  logger.info({ rows: rows.length, jobId: job.id }, 'import rows loaded')\n  // ...\n})\n```\n\nThe logger emits structured records — event name plus fields — rather than formatted text, so downstream tooling can filter and aggregate. Logs from a single job execution share one job id, which makes every line from a multi-attempt saga greppable in one pass. See [Logging](/docs/observability/logging) for the record shape.\n\n## Correlation IDs [#correlation-ids]\n\nLogs and traces are linked through correlation ids. Each job attempt carries an id that is propagated into every span and log record the attempt produces, and across retries of the same job. To follow one job through its retries:\n\n```bash title=\"terminal\"\nkwiva queue:work --trace\n```\n\n`--trace` enables link-gathering on the worker so logs are grouped per job id. In a system where the web tier, workers, and tasks all log to the same pipeline, the correlation id is what lets a tracing tool walk from the HTTP request that enqueued a job to the job's eventual completion. A dispatch started in a controller and completed on a worker are one correlated story, not two unrelated events.\n\n## Worker Status [#worker-status]\n\n`--trace` also surfaces worker state while it runs: which queues a worker drains, its concurrency, and per-attempt outcomes. Combined with queue depth, that answers the two operational questions that matter most — \"is work sitting in the queue?\" and \"is the worker processing it?\" — without SSHing into a box.\n\n## Scheduled Task Reporting [#scheduled-task-reporting]\n\nScheduled tasks report through the same machinery. Each `task.run` produces a structured log event with duration and result, and a corresponding span. Failures follow retries, then a `task_failures` metric with an alert hook configured in `src/config/telemetry.ts`. For run bookkeeping:\n\n```bash title=\"terminal\"\nkwiva schedule:list --json\n```\n\nrenders the schedule with next run times as machine-readable data for dashboards and monitors. See [Scheduled Tasks](/docs/background-work/scheduling).\n\n## Where Metrics Land [#where-metrics-land]\n\nMetrics flow to the exporter configured in `src/config/telemetry.ts`, along with request tracing from the HTTP layer. The background layer and the web layer share one observability pipeline, so queue depth sits next to request latency in the same dashboard. Alert thresholds on DLQ size and failure rate are configured in the same module, so a failing queue pages the same place a failing endpoint does. See [Observability](/docs/observability/).\n\n## Building an Operational Loop [#building-an-operational-loop]\n\nThe practical rhythm for running queues in production:\n\n1. **Watch queue depth** — a sustained backlog with idle workers means the worker is misconfigured or down.\n2. **Watch failure rate and DLQ size** — a growing DLQ means the job is failing systematically, not transiently.\n3. **Read the DLQ** — `kwiva queue:failed` shows the attempt history and the error; decide between retry, fix, and clear.\n4. **Follow correlation ids** — on any retry, `--trace` links every log line of the job across attempts and processes.\n\nThe loop is the same at one instance or fifty: the state is in the transport, the traces are in the pipeline, and the CLI is the tool for the day-to-day decisions.\n\n## What's Next [#whats-next]\n\n* [Jobs](/docs/background-work/jobs) — the unit of work these traces describe\n* [Queues & Workers](/docs/background-work/queues) — where queue depth and DLQ size are managed\n* [Scheduled Tasks](/docs/background-work/scheduling) — `task.run` logs and the `task_failures` metric\n* [Observability](/docs/observability/) — the shared tracing, logging, and metrics pipeline\n* [Observability — Metrics](/docs/observability/metrics) — exported metrics and dashboards\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Background work is invisible by definition — it never serves a request you can watch. Observability for the background layer exists to make it visible again: to see how deep each queue is, how many jobs have failed, how far a long job has gotten, and exactly which logs belong to which job attempt. Kwiva instruments the entire lifecycle automatically, so the information is available the moment a queue starts running."
		},
		{
			"heading": void 0,
			"content": "The background layer and the web layer share one observability pipeline. A trace started in a controller that dispatches a job continues into the worker that runs it; a log line from a task run joins the same structured pipeline as request logs. There is no second observability system to learn for background work."
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "Every job that moves through the transport produces a trace from dispatch to start to finish, including queue wait time:"
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "Because dispatch and execution are separate processes, the full span bridges both: you can see not only how long a job ran but how long it waited before a worker picked it up. High wait times mean a queue is backed up; long run times mean the job itself is slow. The span is emitted per job and per attempt, so retries are visible as distinct segments of the same job's history."
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "Alongside traces, the framework maintains a small set of queue metrics:"
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "Metric"
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "What it tells you"
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "Queue depth"
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "How much work is pending per queue"
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "Throughput"
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "How many jobs complete per interval"
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "Failure rate"
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "The share of runs that fail and consume a retry"
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "DLQ size"
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "Jobs that exhausted retries and entered the dead-letter queue"
		},
		{
			"heading": "what-is-tracked-automatically",
			"content": "DLQ size is the metric that deserves a watch. It stays flat on a healthy system; when it grows, jobs are failing systematically and someone must decide between retrying, fixing the cause, and clearing. See Metrics for where these land on dashboards."
		},
		{
			"heading": "inspecting-the-queue",
			"content": "The CLI is the fastest surface for looking at the current state:"
		},
		{
			"heading": "inspecting-the-queue",
			"content": "`kwiva queue:failed` lists each dead job with the attempts behind it and the error that ended it. `kwiva queue:retry <id>` or `--retry --all` republishes. This is the day-to-day operational loop: observe the failure, decide, retry or clear. Queue depth, throughput, and failure rate are emitted continuously for whatever collection backend your metrics configuration points at."
		},
		{
			"heading": "job-progress",
			"content": "A job can report its own progression through the `job` object:"
		},
		{
			"heading": "job-progress",
			"content": "Progress is advisory state attached to the job record. For a long-running, multi-phase job — an import with distinct read/transform/write phases — progress makes \"is it stuck or progressing?\" trivially answerable. Progress does not change scheduling behavior; it exists so operators and Studio can see a job is alive and moving."
		},
		{
			"heading": "structured-job-logs",
			"content": "Each job handler receives a `logger` scoped to that execution:"
		},
		{
			"heading": "structured-job-logs",
			"content": "The logger emits structured records — event name plus fields — rather than formatted text, so downstream tooling can filter and aggregate. Logs from a single job execution share one job id, which makes every line from a multi-attempt saga greppable in one pass. See Logging for the record shape."
		},
		{
			"heading": "correlation-ids",
			"content": "Logs and traces are linked through correlation ids. Each job attempt carries an id that is propagated into every span and log record the attempt produces, and across retries of the same job. To follow one job through its retries:"
		},
		{
			"heading": "correlation-ids",
			"content": "`--trace` enables link-gathering on the worker so logs are grouped per job id. In a system where the web tier, workers, and tasks all log to the same pipeline, the correlation id is what lets a tracing tool walk from the HTTP request that enqueued a job to the job's eventual completion. A dispatch started in a controller and completed on a worker are one correlated story, not two unrelated events."
		},
		{
			"heading": "worker-status",
			"content": "`--trace` also surfaces worker state while it runs: which queues a worker drains, its concurrency, and per-attempt outcomes. Combined with queue depth, that answers the two operational questions that matter most — \"is work sitting in the queue?\" and \"is the worker processing it?\" — without SSHing into a box."
		},
		{
			"heading": "scheduled-task-reporting",
			"content": "Scheduled tasks report through the same machinery. Each `task.run` produces a structured log event with duration and result, and a corresponding span. Failures follow retries, then a `task_failures` metric with an alert hook configured in `src/config/telemetry.ts`. For run bookkeeping:"
		},
		{
			"heading": "scheduled-task-reporting",
			"content": "renders the schedule with next run times as machine-readable data for dashboards and monitors. See Scheduled Tasks."
		},
		{
			"heading": "where-metrics-land",
			"content": "Metrics flow to the exporter configured in `src/config/telemetry.ts`, along with request tracing from the HTTP layer. The background layer and the web layer share one observability pipeline, so queue depth sits next to request latency in the same dashboard. Alert thresholds on DLQ size and failure rate are configured in the same module, so a failing queue pages the same place a failing endpoint does. See Observability."
		},
		{
			"heading": "building-an-operational-loop",
			"content": "The practical rhythm for running queues in production:"
		},
		{
			"heading": "building-an-operational-loop",
			"content": "**Watch queue depth** — a sustained backlog with idle workers means the worker is misconfigured or down."
		},
		{
			"heading": "building-an-operational-loop",
			"content": "**Watch failure rate and DLQ size** — a growing DLQ means the job is failing systematically, not transiently."
		},
		{
			"heading": "building-an-operational-loop",
			"content": "**Read the DLQ** — `kwiva queue:failed` shows the attempt history and the error; decide between retry, fix, and clear."
		},
		{
			"heading": "building-an-operational-loop",
			"content": "**Follow correlation ids** — on any retry, `--trace` links every log line of the job across attempts and processes."
		},
		{
			"heading": "building-an-operational-loop",
			"content": "The loop is the same at one instance or fifty: the state is in the transport, the traces are in the pipeline, and the CLI is the tool for the day-to-day decisions."
		},
		{
			"heading": "whats-next",
			"content": "Jobs — the unit of work these traces describe"
		},
		{
			"heading": "whats-next",
			"content": "Queues & Workers — where queue depth and DLQ size are managed"
		},
		{
			"heading": "whats-next",
			"content": "Scheduled Tasks — `task.run` logs and the `task_failures` metric"
		},
		{
			"heading": "whats-next",
			"content": "Observability — the shared tracing, logging, and metrics pipeline"
		},
		{
			"heading": "whats-next",
			"content": "Observability — Metrics — exported metrics and dashboards"
		}
	],
	"headings": [
		{
			"id": "what-is-tracked-automatically",
			"content": "What Is Tracked Automatically"
		},
		{
			"id": "inspecting-the-queue",
			"content": "Inspecting the Queue"
		},
		{
			"id": "job-progress",
			"content": "Job Progress"
		},
		{
			"id": "structured-job-logs",
			"content": "Structured Job Logs"
		},
		{
			"id": "correlation-ids",
			"content": "Correlation IDs"
		},
		{
			"id": "worker-status",
			"content": "Worker Status"
		},
		{
			"id": "scheduled-task-reporting",
			"content": "Scheduled Task Reporting"
		},
		{
			"id": "where-metrics-land",
			"content": "Where Metrics Land"
		},
		{
			"id": "building-an-operational-loop",
			"content": "Building an Operational Loop"
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
		url: "#what-is-tracked-automatically",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Is Tracked Automatically" })
	},
	{
		depth: 2,
		url: "#inspecting-the-queue",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Inspecting the Queue" })
	},
	{
		depth: 2,
		url: "#job-progress",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Job Progress" })
	},
	{
		depth: 2,
		url: "#structured-job-logs",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Structured Job Logs" })
	},
	{
		depth: 2,
		url: "#correlation-ids",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Correlation IDs" })
	},
	{
		depth: 2,
		url: "#worker-status",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Worker Status" })
	},
	{
		depth: 2,
		url: "#scheduled-task-reporting",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Scheduled Task Reporting" })
	},
	{
		depth: 2,
		url: "#where-metrics-land",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where Metrics Land" })
	},
	{
		depth: 2,
		url: "#building-an-operational-loop",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Building an Operational Loop" })
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
		ol: "ol",
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Background work is invisible by definition — it never serves a request you can watch. Observability for the background layer exists to make it visible again: to see how deep each queue is, how many jobs have failed, how far a long job has gotten, and exactly which logs belong to which job attempt. Kwiva instruments the entire lifecycle automatically, so the information is available the moment a queue starts running." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The background layer and the web layer share one observability pipeline. A trace started in a controller that dispatches a job continues into the worker that runs it; a log line from a task run joins the same structured pipeline as request logs. There is no second observability system to learn for background work." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-is-tracked-automatically",
			children: "What Is Tracked Automatically"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every job that moves through the transport produces a trace from dispatch to start to finish, including queue wait time:" }),
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
			title: "what-is-tracked-automatically.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "dispatch ──► (queued) ──► start ──► (handler) ──► finish / failed" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                └──────── wait time ────────┘" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because dispatch and execution are separate processes, the full span bridges both: you can see not only how long a job ran but how long it waited before a worker picked it up. High wait times mean a queue is backed up; long run times mean the job itself is slow. The span is emitted per job and per attempt, so retries are visible as distinct segments of the same job's history." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Alongside traces, the framework maintains a small set of queue metrics:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Metric" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it tells you" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Queue depth" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "How much work is pending per queue" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Throughput" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "How many jobs complete per interval" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Failure rate" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The share of runs that fail and consume a retry" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "DLQ size" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Jobs that exhausted retries and entered the dead-letter queue" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"DLQ size is the metric that deserves a watch. It stays flat on a healthy system; when it grows, jobs are failing systematically and someone must decide between retrying, fixing the cause, and clearing. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/metrics",
				children: "Metrics"
			}),
			" for where these land on dashboards."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "inspecting-the-queue",
			children: "Inspecting the Queue"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The CLI is the fastest surface for looking at the current state:" }),
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
							children: " queue:failed"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "        # dead-letter queue listing with attempt history + error"
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
							children: " queue:clear"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "queu"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "e"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: ">"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: " # drop pending work in a queue"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:failed" }),
			" lists each dead job with the attempts behind it and the error that ended it. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:retry <id>" }),
			" or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--retry --all" }),
			" republishes. This is the day-to-day operational loop: observe the failure, decide, retry or clear. Queue depth, throughput, and failure rate are emitted continuously for whatever collection backend your metrics configuration points at."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "job-progress",
			children: "Job Progress"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A job can report its own progression through the ",
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
			title: "job-progress.ts",
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Progress is advisory state attached to the job record. For a long-running, multi-phase job — an import with distinct read/transform/write phases — progress makes \"is it stuck or progressing?\" trivially answerable. Progress does not change scheduling behavior; it exists so operators and Studio can see a job is alive and moving." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "structured-job-logs",
			children: "Structured Job Logs"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each job handler receives a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "logger" }),
			" scoped to that execution:"
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
			title: "structured-job-logs.ts",
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
							children: "'import-rows'"
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
							children: " rows"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " readFile"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(payload.path)"
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
							children: "({ rows: rows."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "length"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", jobId: job.id }, "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'import rows loaded'"
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
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The logger emits structured records — event name plus fields — rather than formatted text, so downstream tooling can filter and aggregate. Logs from a single job execution share one job id, which makes every line from a multi-attempt saga greppable in one pass. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/logging",
				children: "Logging"
			}),
			" for the record shape."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "correlation-ids",
			children: "Correlation IDs"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Logs and traces are linked through correlation ids. Each job attempt carries an id that is propagated into every span and log record the attempt produces, and across retries of the same job. To follow one job through its retries:" }),
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
						children: " --trace"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--trace" }), " enables link-gathering on the worker so logs are grouped per job id. In a system where the web tier, workers, and tasks all log to the same pipeline, the correlation id is what lets a tracing tool walk from the HTTP request that enqueued a job to the job's eventual completion. A dispatch started in a controller and completed on a worker are one correlated story, not two unrelated events."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "worker-status",
			children: "Worker Status"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--trace" }), " also surfaces worker state while it runs: which queues a worker drains, its concurrency, and per-attempt outcomes. Combined with queue depth, that answers the two operational questions that matter most — \"is work sitting in the queue?\" and \"is the worker processing it?\" — without SSHing into a box."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "scheduled-task-reporting",
			children: "Scheduled Task Reporting"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Scheduled tasks report through the same machinery. Each ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task.run" }),
			" produces a structured log event with duration and result, and a corresponding span. Failures follow retries, then a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task_failures" }),
			" metric with an alert hook configured in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/telemetry.ts" }),
			". For run bookkeeping:"
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
						children: " schedule:list"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: " --json"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"renders the schedule with next run times as machine-readable data for dashboards and monitors. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/scheduling",
				children: "Scheduled Tasks"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-metrics-land",
			children: "Where Metrics Land"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Metrics flow to the exporter configured in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/telemetry.ts" }),
			", along with request tracing from the HTTP layer. The background layer and the web layer share one observability pipeline, so queue depth sits next to request latency in the same dashboard. Alert thresholds on DLQ size and failure rate are configured in the same module, so a failing queue pages the same place a failing endpoint does. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/",
				children: "Observability"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "building-an-operational-loop",
			children: "Building an Operational Loop"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The practical rhythm for running queues in production:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Watch queue depth" }), " — a sustained backlog with idle workers means the worker is misconfigured or down."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Watch failure rate and DLQ size" }), " — a growing DLQ means the job is failing systematically, not transiently."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Read the DLQ" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:failed" }),
				" shows the attempt history and the error; decide between retry, fix, and clear."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Follow correlation ids" }),
				" — on any retry, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--trace" }),
				" links every log line of the job across attempts and processes."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The loop is the same at one instance or fifty: the state is in the transport, the traces are in the pipeline, and the CLI is the tool for the day-to-day decisions." }),
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
			}), " — the unit of work these traces describe"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/queues",
				children: "Queues & Workers"
			}), " — where queue depth and DLQ size are managed"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/background-work/scheduling",
					children: "Scheduled Tasks"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task.run" }),
				" logs and the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task_failures" }),
				" metric"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/",
				children: "Observability"
			}), " — the shared tracing, logging, and metrics pipeline"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/metrics",
				children: "Observability — Metrics"
			}), " — exported metrics and dashboards"] }),
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
