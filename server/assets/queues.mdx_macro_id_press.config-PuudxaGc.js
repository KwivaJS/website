import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/background-work/queues.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Queues & Workers",
	"description": "Queue transport, worker processes, concurrency control, the dead-letter queue, rate limiting, and running workers in production."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nA queue is a named pipeline that holds dispatched work until a worker is ready to run it. A worker is a process that drains the queue, invoking the handler of each job it pulls. Together they are the transport half of the background layer: `defineJob` declares the work, and the queue guarantees it arrives, waits its turn, retries on failure, and eventually finishes — or lands in the dead-letter queue.\n\nThe transport is framework-owned and configurable. The same `defineJob` file runs unchanged no matter which driver moves its payload, so choosing a transport is a config decision rather than a code change.\n\n## Queue Concepts [#queue-concepts]\n\n* **A named queue** is a pipeline for a class of work. `emails`, `invoices`, and `nightly` are common examples. A job's `queue` option routes it; a worker subscribes by queue name.\n* **The default queue** is where jobs go when they declare no `queue` option. It is configured in `src/config/queue.ts`.\n* **The worker** is the built-in queue worker process, started from the CLI, that pulls jobs and runs their handlers with the configured concurrency.\n* **The dead-letter queue** is not a separate pipeline but a conclusion: jobs that exhaust their retries land in the `failed_jobs` table, where `kwiva queue:failed` and `kwiva queue:retry` manage them.\n\n## Configuration [#configuration]\n\nThe queue transport is declared once in `src/config/queue.ts`:\n\n```ts title=\"src/config/queue.ts\"\n// src/config/queue.ts\nimport { defineConfig } from '@kwiva/config'\n\nexport default defineConfig('queue', {\n  defaults: { driver: 'redis', url: 'redis://localhost:6379', default: 'default' },\n  queues: { emails: { driver: 'redis' }, nightly: { driver: 'database' } },\n  env: { url: 'REDIS_URL' },\n})\n```\n\nNamed queues can override the transport: `emails` stays on the shared driver while `nightly` moves to the database-backed driver, depending on what the workload needs. The `env.url` binding lets the connection URL come from an environment variable, so config stays environment-agnostic.\n\n| Config             | Meaning                                                |\n| ------------------ | ------------------------------------------------------ |\n| `defaults.driver`  | Transport driver used by default                       |\n| `defaults.url`     | Connection URL for the transport                       |\n| `defaults.default` | Name of the default queue                              |\n| `queues`           | Named queues, each able to override the driver         |\n| `env.url`          | Environment variable that overrides the connection URL |\n\n## Transport Drivers [#transport-drivers]\n\n| Driver     | Use                | Notes                                                            |\n| ---------- | ------------------ | ---------------------------------------------------------------- |\n| `redis`    | Production default | Fast, shared transport for multi-instance workers                |\n| `database` | Zero-infra         | Polls the `kwiva_jobs` table — SQLite-friendly, no extra service |\n| `memory`   | Dev and tests      | Synchronous and instant; `queue.fake()` enables assertions       |\n\nThe driver is a config decision, not a code change. Development defaults to `memory` or `database`; production typically uses `redis`. Switching a queue's driver is a one-line edit in `src/config/queue.ts`. The `memory` driver pairs with `queue.fake()` in tests, which swaps the transport for an in-memory recorder so assertions can verify dispatch without running handlers.\n\n## Running Workers [#running-workers]\n\n```bash title=\"terminal\"\nkwiva queue:work --queue=emails,default --concurrency=5\nkwiva queue:listen                 # verbose mode (dev)\n```\n\n* `kwiva queue:work` starts the built-in queue worker. `--queue` accepts a comma-separated list of queues to drain; `--concurrency` sets how many jobs run at once.\n* `kwiva queue:listen` is the verbose development variant, printing each poll and job as it happens.\n* `--trace` links the logs of every job attempt to a per-job correlation id, so you can follow one job through retries. See [Job Observability](/docs/background-work/observability).\n\n| Flag                     | Description                                     |\n| ------------------------ | ----------------------------------------------- |\n| `--queue=emails,default` | Comma-separated queues this worker consumes     |\n| `--concurrency=N`        | Number of jobs the worker processes in parallel |\n| `--trace`                | Links structured logs per job id                |\n\n## Concurrency Control [#concurrency-control]\n\nConcurrency is controlled where the worker starts, not where the job is defined. A single worker process can run many jobs in parallel:\n\n```bash title=\"terminal\"\nkwiva queue:work --queue=emails --concurrency=5\n```\n\nThis keeps throughput tuning an operational decision. Raise concurrency when jobs are I/O-bound and waiting on the network; lower it when jobs contend for CPU, a database, or a third-party API with its own limits. Per-job `rateLimit` (v1.x) is the complementary control for shaping the throughput of a single job type, and per-queue rate limiting (v1.x) shapes a whole pipeline.\n\n## Dead-Letter Queue and Failure Management [#dead-letter-queue-and-failure-management]\n\nA job that exhausts its `attempts` is moved to the `failed_jobs` table. The CLI owns the failure lifecycle:\n\n```bash title=\"terminal\"\nkwiva queue:failed                 # DLQ table listing\nkwiva queue:retry <id>             # republish one failed job\nkwiva queue:retry --all            # republish everything in the DLQ\nkwiva queue:clear <queue>          # drop all pending jobs in a queue\n```\n\n`kwiva queue:failed` lists each failure with its attempt history and error, so you can decide between retrying, fixing the root cause, and clearing the queue. The size of the dead-letter queue is also surfaced as a metric — an early warning for jobs that fail systematically.\n\n## Rate Limiting [#rate-limiting]\n\nPer-job rate limiting (v1.x) caps how often a given job type may run, which protects the systems jobs touch:\n\n```ts title=\"rate-limiting.ts\"\nexport default defineJob('sync-crm', async ({ payload }) => {\n  // ...\n}, {\n  queue: 'integrations',\n  attempts: 5,\n  backoff: 'exponential',\n  rateLimit: { max: 100, per: 60 },   // at most 100 executions per minute\n})\n```\n\nWhen a job type hits its window, the worker leaves it queued instead of running it again too soon. This is the right lever at the application layer — it protects an external service without deploying separate middleware. Rate limits can be attached per queue as well as per job (v1.x), which suits a shared service used by several job types.\n\n## Chaining and Batching [#chaining-and-batching]\n\nQueues support two composition forms (v1.x) from the dispatch side:\n\n```ts title=\"chaining-and-batching.ts\"\nawait queue.chain([ImportRows, BuildReport, NotifyDone]).dispatch()\n\nawait queue.batch(rows.map(r => ImportRows.dispatch(r)))\n  .then(({ successes, failures }) => ...)\n```\n\n`queue.chain` runs members strictly in order, each queued after its predecessor succeeds. `queue.batch` fans out concurrently and reports on the aggregate outcome. Both treat promise-based offloading to the transport the same way single dispatch does, so transactional guarantees apply evenly. See [Jobs — Chaining and Batches](/docs/background-work/jobs).\n\n## Semantics at a Glance [#semantics-at-a-glance]\n\n| Feature                      | Surface                      | Status |\n| ---------------------------- | ---------------------------- | ------ |\n| Retries + backoff            | `attempts`, `backoff`        | v1     |\n| Delayed dispatch             | `delay`                      | v1     |\n| Priority                     | `priority`                   | v1     |\n| Concurrency                  | worker `--concurrency`       | v1     |\n| Dead-letter queue            | `failed_jobs` table + CLI    | v1     |\n| Idempotency                  | `idempotencyKey` dedupe      | v1     |\n| Progress reporting           | `job.progress(n)`            | v1     |\n| Rate limiting                | per-job and per-queue        | v1.x   |\n| Chains                       | `queue.chain`                | v1.x   |\n| Batches                      | `queue.batch(...).then()`    | v1.x   |\n| Model-aligned payload typing | `schema` typed from model IR | v1     |\n\n## Running Workers in Production [#running-workers-in-production]\n\nTwo deployment shapes are supported:\n\n* **Separate worker process (recommended).** Deploy the worker as its own process so background work scales and fails independently of the web tier: `kwiva deploy --entry worker` produces a worker entry on the node and bun presets.\n* **In-process for development.** Workers inside the dev server are fine locally, where a single process keeps everything simple.\n\nRules that hold in production:\n\n1. Do not run the worker where jobs must not block web requests.\n2. Give the worker its own concurrency and health supervision; a busy worker should not take down the web tier.\n3. Point workers at the same transport that dispatched the jobs — several worker instances can drain one queue, and that is the intended scaling model.\n\nScaling is horizontal by construction: add worker processes pointed at the same transport to consume more. The transport, not the process count, is what orders and dedupes work. Deployment details live in [Deployment](/docs/deployment/).\n\n## Transaction-Aware Dispatch [#transaction-aware-dispatch]\n\nJobs dispatched inside a database transaction are held until the transaction commits, using the same mechanism as the event outbox. If the transaction rolls back, the dispatch is never delivered:\n\n```ts title=\"transaction-aware-dispatch.ts\"\nawait db.transaction(async (tx) => {\n  await Order.create({ amount: payload.total })\n\n  await SendWelcome.dispatch({ userId })\n})\n```\n\nThis closes the gap between \"the row is committed\" and \"the work is enqueued\", so background work never runs against data the caller later rolled back. See [Transactions](/docs/data/transactions).\n\n## What's Next [#whats-next]\n\n* [Jobs](/docs/background-work/jobs) — defining work, dispatch options, and retries\n* [Scheduled Tasks](/docs/background-work/scheduling) — cron-driven work that hands off to queues\n* [Job Observability](/docs/background-work/observability) — queue depth, DLQ size, and per-job traces\n* [Testing](/docs/testing/) — `queue.fake()` and dispatch assertions\n* [Deployment](/docs/deployment/) — running workers as separate processes\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "A queue is a named pipeline that holds dispatched work until a worker is ready to run it. A worker is a process that drains the queue, invoking the handler of each job it pulls. Together they are the transport half of the background layer: `defineJob` declares the work, and the queue guarantees it arrives, waits its turn, retries on failure, and eventually finishes — or lands in the dead-letter queue."
		},
		{
			"heading": void 0,
			"content": "The transport is framework-owned and configurable. The same `defineJob` file runs unchanged no matter which driver moves its payload, so choosing a transport is a config decision rather than a code change."
		},
		{
			"heading": "queue-concepts",
			"content": "**A named queue** is a pipeline for a class of work. `emails`, `invoices`, and `nightly` are common examples. A job's `queue` option routes it; a worker subscribes by queue name."
		},
		{
			"heading": "queue-concepts",
			"content": "**The default queue** is where jobs go when they declare no `queue` option. It is configured in `src/config/queue.ts`."
		},
		{
			"heading": "queue-concepts",
			"content": "**The worker** is the built-in queue worker process, started from the CLI, that pulls jobs and runs their handlers with the configured concurrency."
		},
		{
			"heading": "queue-concepts",
			"content": "**The dead-letter queue** is not a separate pipeline but a conclusion: jobs that exhaust their retries land in the `failed_jobs` table, where `kwiva queue:failed` and `kwiva queue:retry` manage them."
		},
		{
			"heading": "configuration",
			"content": "The queue transport is declared once in `src/config/queue.ts`:"
		},
		{
			"heading": "configuration",
			"content": "Named queues can override the transport: `emails` stays on the shared driver while `nightly` moves to the database-backed driver, depending on what the workload needs. The `env.url` binding lets the connection URL come from an environment variable, so config stays environment-agnostic."
		},
		{
			"heading": "configuration",
			"content": "Config"
		},
		{
			"heading": "configuration",
			"content": "Meaning"
		},
		{
			"heading": "configuration",
			"content": "`defaults.driver`"
		},
		{
			"heading": "configuration",
			"content": "Transport driver used by default"
		},
		{
			"heading": "configuration",
			"content": "`defaults.url`"
		},
		{
			"heading": "configuration",
			"content": "Connection URL for the transport"
		},
		{
			"heading": "configuration",
			"content": "`defaults.default`"
		},
		{
			"heading": "configuration",
			"content": "Name of the default queue"
		},
		{
			"heading": "configuration",
			"content": "`queues`"
		},
		{
			"heading": "configuration",
			"content": "Named queues, each able to override the driver"
		},
		{
			"heading": "configuration",
			"content": "`env.url`"
		},
		{
			"heading": "configuration",
			"content": "Environment variable that overrides the connection URL"
		},
		{
			"heading": "transport-drivers",
			"content": "Driver"
		},
		{
			"heading": "transport-drivers",
			"content": "Use"
		},
		{
			"heading": "transport-drivers",
			"content": "Notes"
		},
		{
			"heading": "transport-drivers",
			"content": "`redis`"
		},
		{
			"heading": "transport-drivers",
			"content": "Production default"
		},
		{
			"heading": "transport-drivers",
			"content": "Fast, shared transport for multi-instance workers"
		},
		{
			"heading": "transport-drivers",
			"content": "`database`"
		},
		{
			"heading": "transport-drivers",
			"content": "Zero-infra"
		},
		{
			"heading": "transport-drivers",
			"content": "Polls the `kwiva_jobs` table — SQLite-friendly, no extra service"
		},
		{
			"heading": "transport-drivers",
			"content": "`memory`"
		},
		{
			"heading": "transport-drivers",
			"content": "Dev and tests"
		},
		{
			"heading": "transport-drivers",
			"content": "Synchronous and instant; `queue.fake()` enables assertions"
		},
		{
			"heading": "transport-drivers",
			"content": "The driver is a config decision, not a code change. Development defaults to `memory` or `database`; production typically uses `redis`. Switching a queue's driver is a one-line edit in `src/config/queue.ts`. The `memory` driver pairs with `queue.fake()` in tests, which swaps the transport for an in-memory recorder so assertions can verify dispatch without running handlers."
		},
		{
			"heading": "running-workers",
			"content": "`kwiva queue:work` starts the built-in queue worker. `--queue` accepts a comma-separated list of queues to drain; `--concurrency` sets how many jobs run at once."
		},
		{
			"heading": "running-workers",
			"content": "`kwiva queue:listen` is the verbose development variant, printing each poll and job as it happens."
		},
		{
			"heading": "running-workers",
			"content": "`--trace` links the logs of every job attempt to a per-job correlation id, so you can follow one job through retries. See Job Observability."
		},
		{
			"heading": "running-workers",
			"content": "Flag"
		},
		{
			"heading": "running-workers",
			"content": "Description"
		},
		{
			"heading": "running-workers",
			"content": "`--queue=emails,default`"
		},
		{
			"heading": "running-workers",
			"content": "Comma-separated queues this worker consumes"
		},
		{
			"heading": "running-workers",
			"content": "`--concurrency=N`"
		},
		{
			"heading": "running-workers",
			"content": "Number of jobs the worker processes in parallel"
		},
		{
			"heading": "running-workers",
			"content": "`--trace`"
		},
		{
			"heading": "running-workers",
			"content": "Links structured logs per job id"
		},
		{
			"heading": "concurrency-control",
			"content": "Concurrency is controlled where the worker starts, not where the job is defined. A single worker process can run many jobs in parallel:"
		},
		{
			"heading": "concurrency-control",
			"content": "This keeps throughput tuning an operational decision. Raise concurrency when jobs are I/O-bound and waiting on the network; lower it when jobs contend for CPU, a database, or a third-party API with its own limits. Per-job `rateLimit` (v1.x) is the complementary control for shaping the throughput of a single job type, and per-queue rate limiting (v1.x) shapes a whole pipeline."
		},
		{
			"heading": "dead-letter-queue-and-failure-management",
			"content": "A job that exhausts its `attempts` is moved to the `failed_jobs` table. The CLI owns the failure lifecycle:"
		},
		{
			"heading": "dead-letter-queue-and-failure-management",
			"content": "`kwiva queue:failed` lists each failure with its attempt history and error, so you can decide between retrying, fixing the root cause, and clearing the queue. The size of the dead-letter queue is also surfaced as a metric — an early warning for jobs that fail systematically."
		},
		{
			"heading": "rate-limiting",
			"content": "Per-job rate limiting (v1.x) caps how often a given job type may run, which protects the systems jobs touch:"
		},
		{
			"heading": "rate-limiting",
			"content": "When a job type hits its window, the worker leaves it queued instead of running it again too soon. This is the right lever at the application layer — it protects an external service without deploying separate middleware. Rate limits can be attached per queue as well as per job (v1.x), which suits a shared service used by several job types."
		},
		{
			"heading": "chaining-and-batching",
			"content": "Queues support two composition forms (v1.x) from the dispatch side:"
		},
		{
			"heading": "chaining-and-batching",
			"content": "`queue.chain` runs members strictly in order, each queued after its predecessor succeeds. `queue.batch` fans out concurrently and reports on the aggregate outcome. Both treat promise-based offloading to the transport the same way single dispatch does, so transactional guarantees apply evenly. See Jobs — Chaining and Batches."
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Feature"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Surface"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Status"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Retries + backoff"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "`attempts`, `backoff`"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "v1"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Delayed dispatch"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "`delay`"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "v1"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Priority"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "`priority`"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "v1"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Concurrency"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "worker `--concurrency`"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "v1"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Dead-letter queue"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "`failed_jobs` table + CLI"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "v1"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Idempotency"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "`idempotencyKey` dedupe"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "v1"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Progress reporting"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "`job.progress(n)`"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "v1"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Rate limiting"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "per-job and per-queue"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "v1.x"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Chains"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "`queue.chain`"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "v1.x"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Batches"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "`queue.batch(...).then()`"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "v1.x"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "Model-aligned payload typing"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "`schema` typed from model IR"
		},
		{
			"heading": "semantics-at-a-glance",
			"content": "v1"
		},
		{
			"heading": "running-workers-in-production",
			"content": "Two deployment shapes are supported:"
		},
		{
			"heading": "running-workers-in-production",
			"content": "**Separate worker process (recommended).** Deploy the worker as its own process so background work scales and fails independently of the web tier: `kwiva deploy --entry worker` produces a worker entry on the node and bun presets."
		},
		{
			"heading": "running-workers-in-production",
			"content": "**In-process for development.** Workers inside the dev server are fine locally, where a single process keeps everything simple."
		},
		{
			"heading": "running-workers-in-production",
			"content": "Rules that hold in production:"
		},
		{
			"heading": "running-workers-in-production",
			"content": "Do not run the worker where jobs must not block web requests."
		},
		{
			"heading": "running-workers-in-production",
			"content": "Give the worker its own concurrency and health supervision; a busy worker should not take down the web tier."
		},
		{
			"heading": "running-workers-in-production",
			"content": "Point workers at the same transport that dispatched the jobs — several worker instances can drain one queue, and that is the intended scaling model."
		},
		{
			"heading": "running-workers-in-production",
			"content": "Scaling is horizontal by construction: add worker processes pointed at the same transport to consume more. The transport, not the process count, is what orders and dedupes work. Deployment details live in Deployment."
		},
		{
			"heading": "transaction-aware-dispatch",
			"content": "Jobs dispatched inside a database transaction are held until the transaction commits, using the same mechanism as the event outbox. If the transaction rolls back, the dispatch is never delivered:"
		},
		{
			"heading": "transaction-aware-dispatch",
			"content": "This closes the gap between \"the row is committed\" and \"the work is enqueued\", so background work never runs against data the caller later rolled back. See Transactions."
		},
		{
			"heading": "whats-next",
			"content": "Jobs — defining work, dispatch options, and retries"
		},
		{
			"heading": "whats-next",
			"content": "Scheduled Tasks — cron-driven work that hands off to queues"
		},
		{
			"heading": "whats-next",
			"content": "Job Observability — queue depth, DLQ size, and per-job traces"
		},
		{
			"heading": "whats-next",
			"content": "Testing — `queue.fake()` and dispatch assertions"
		},
		{
			"heading": "whats-next",
			"content": "Deployment — running workers as separate processes"
		}
	],
	"headings": [
		{
			"id": "queue-concepts",
			"content": "Queue Concepts"
		},
		{
			"id": "configuration",
			"content": "Configuration"
		},
		{
			"id": "transport-drivers",
			"content": "Transport Drivers"
		},
		{
			"id": "running-workers",
			"content": "Running Workers"
		},
		{
			"id": "concurrency-control",
			"content": "Concurrency Control"
		},
		{
			"id": "dead-letter-queue-and-failure-management",
			"content": "Dead-Letter Queue and Failure Management"
		},
		{
			"id": "rate-limiting",
			"content": "Rate Limiting"
		},
		{
			"id": "chaining-and-batching",
			"content": "Chaining and Batching"
		},
		{
			"id": "semantics-at-a-glance",
			"content": "Semantics at a Glance"
		},
		{
			"id": "running-workers-in-production",
			"content": "Running Workers in Production"
		},
		{
			"id": "transaction-aware-dispatch",
			"content": "Transaction-Aware Dispatch"
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
		url: "#queue-concepts",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Queue Concepts" })
	},
	{
		depth: 2,
		url: "#configuration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Configuration" })
	},
	{
		depth: 2,
		url: "#transport-drivers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Transport Drivers" })
	},
	{
		depth: 2,
		url: "#running-workers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Running Workers" })
	},
	{
		depth: 2,
		url: "#concurrency-control",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Concurrency Control" })
	},
	{
		depth: 2,
		url: "#dead-letter-queue-and-failure-management",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Dead-Letter Queue and Failure Management" })
	},
	{
		depth: 2,
		url: "#rate-limiting",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Rate Limiting" })
	},
	{
		depth: 2,
		url: "#chaining-and-batching",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Chaining and Batching" })
	},
	{
		depth: 2,
		url: "#semantics-at-a-glance",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Semantics at a Glance" })
	},
	{
		depth: 2,
		url: "#running-workers-in-production",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Running Workers in Production" })
	},
	{
		depth: 2,
		url: "#transaction-aware-dispatch",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Transaction-Aware Dispatch" })
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A queue is a named pipeline that holds dispatched work until a worker is ready to run it. A worker is a process that drains the queue, invoking the handler of each job it pulls. Together they are the transport half of the background layer: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }),
			" declares the work, and the queue guarantees it arrives, waits its turn, retries on failure, and eventually finishes — or lands in the dead-letter queue."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The transport is framework-owned and configurable. The same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }),
			" file runs unchanged no matter which driver moves its payload, so choosing a transport is a config decision rather than a code change."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "queue-concepts",
			children: "Queue Concepts"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "A named queue" }),
				" is a pipeline for a class of work. ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "emails" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "nightly" }),
				" are common examples. A job's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue" }),
				" option routes it; a worker subscribes by queue name."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "The default queue" }),
				" is where jobs go when they declare no ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue" }),
				" option. It is configured in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/queue.ts" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "The worker" }), " is the built-in queue worker process, started from the CLI, that pulls jobs and runs their handlers with the configured concurrency."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "The dead-letter queue" }),
				" is not a separate pipeline but a conclusion: jobs that exhaust their retries land in the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "failed_jobs" }),
				" table, where ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:failed" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:retry" }),
				" manage them."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "configuration",
			children: "Configuration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The queue transport is declared once in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/queue.ts" }),
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
			title: "src/config/queue.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/queue.ts"
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
							children: "'queue'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  defaults: { driver: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'redis'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", url: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'redis://localhost:6379'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", default: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'default'"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  queues: { emails: { driver: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'redis'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }, nightly: { driver: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'database'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } },"
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
							children: "  env: { url: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'REDIS_URL'"
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
			"Named queues can override the transport: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "emails" }),
			" stays on the shared driver while ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "nightly" }),
			" moves to the database-backed driver, depending on what the workload needs. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env.url" }),
			" binding lets the connection URL come from an environment variable, so config stays environment-agnostic."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Config" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defaults.driver" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Transport driver used by default" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defaults.url" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Connection URL for the transport" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defaults.default" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Name of the default queue" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queues" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Named queues, each able to override the driver" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env.url" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Environment variable that overrides the connection URL" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "transport-drivers",
			children: "Transport Drivers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Driver" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Use" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Notes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "redis" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Production default" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Fast, shared transport for multi-instance workers" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "database" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Zero-infra" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Polls the ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva_jobs" }),
					" table — SQLite-friendly, no extra service"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "memory" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dev and tests" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Synchronous and instant; ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.fake()" }),
					" enables assertions"
				] })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The driver is a config decision, not a code change. Development defaults to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "memory" }),
			" or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "database" }),
			"; production typically uses ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "redis" }),
			". Switching a queue's driver is a one-line edit in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/queue.ts" }),
			". The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "memory" }),
			" driver pairs with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.fake()" }),
			" in tests, which swaps the transport for an in-memory recorder so assertions can verify dispatch without running handlers."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "running-workers",
			children: "Running Workers"
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
							children: " queue:listen"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                 # verbose mode (dev)"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:work" }),
				" starts the built-in queue worker. ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--queue" }),
				" accepts a comma-separated list of queues to drain; ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--concurrency" }),
				" sets how many jobs run at once."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:listen" }), " is the verbose development variant, printing each poll and job as it happens."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--trace" }),
				" links the logs of every job attempt to a per-job correlation id, so you can follow one job through retries. See ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/background-work/observability",
					children: "Job Observability"
				}),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Flag" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Description" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--queue=emails,default" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Comma-separated queues this worker consumes" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--concurrency=N" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Number of jobs the worker processes in parallel" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--trace" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Links structured logs per job id" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "concurrency-control",
			children: "Concurrency Control"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Concurrency is controlled where the worker starts, not where the job is defined. A single worker process can run many jobs in parallel:" }),
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
						children: " --queue=emails"
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
			"This keeps throughput tuning an operational decision. Raise concurrency when jobs are I/O-bound and waiting on the network; lower it when jobs contend for CPU, a database, or a third-party API with its own limits. Per-job ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rateLimit" }),
			" (v1.x) is the complementary control for shaping the throughput of a single job type, and per-queue rate limiting (v1.x) shapes a whole pipeline."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "dead-letter-queue-and-failure-management",
			children: "Dead-Letter Queue and Failure Management"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A job that exhausts its ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "attempts" }),
			" is moved to the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "failed_jobs" }),
			" table. The CLI owns the failure lifecycle:"
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
							children: "                 # DLQ table listing"
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
							children: " queue:retry"
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
							children: "i"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "d"
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
							children: "             # republish one failed job"
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
							children: " queue:retry"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --all"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "            # republish everything in the DLQ"
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
							children: "          # drop all pending jobs in a queue"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:failed" }), " lists each failure with its attempt history and error, so you can decide between retrying, fixing the root cause, and clearing the queue. The size of the dead-letter queue is also surfaced as a metric — an early warning for jobs that fail systematically."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "rate-limiting",
			children: "Rate Limiting"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Per-job rate limiting (v1.x) caps how often a given job type may run, which protects the systems jobs touch:" }),
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
			title: "rate-limiting.ts",
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
							children: "'sync-crm'"
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
							children: "'integrations'"
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
							children: " },   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// at most 100 executions per minute"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "When a job type hits its window, the worker leaves it queued instead of running it again too soon. This is the right lever at the application layer — it protects an external service without deploying separate middleware. Rate limits can be attached per queue as well as per job (v1.x), which suits a shared service used by several job types." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "chaining-and-batching",
			children: "Chaining and Batching"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Queues support two composition forms (v1.x) from the dispatch side:" }),
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
			title: "chaining-and-batching.ts",
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
			" runs members strictly in order, each queued after its predecessor succeeds. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.batch" }),
			" fans out concurrently and reports on the aggregate outcome. Both treat promise-based offloading to the transport the same way single dispatch does, so transactional guarantees apply evenly. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/jobs",
				children: "Jobs — Chaining and Batches"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "semantics-at-a-glance",
			children: "Semantics at a Glance"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Feature" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Status" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Retries + backoff" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "attempts" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "backoff" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Delayed dispatch" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delay" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Priority" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "priority" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Concurrency" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["worker ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--concurrency" })] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dead-letter queue" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "failed_jobs" }), " table + CLI"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Idempotency" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "idempotencyKey" }), " dedupe"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Progress reporting" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "job.progress(n)" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rate limiting" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "per-job and per-queue" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1.x" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Chains" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.chain" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1.x" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Batches" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.batch(...).then()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1.x" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model-aligned payload typing" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schema" }), " typed from model IR"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "running-workers-in-production",
			children: "Running Workers in Production"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two deployment shapes are supported:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Separate worker process (recommended)." }),
				" Deploy the worker as its own process so background work scales and fails independently of the web tier: ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy --entry worker" }),
				" produces a worker entry on the node and bun presets."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "In-process for development." }), " Workers inside the dev server are fine locally, where a single process keeps everything simple."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Rules that hold in production:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Do not run the worker where jobs must not block web requests." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Give the worker its own concurrency and health supervision; a busy worker should not take down the web tier." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Point workers at the same transport that dispatched the jobs — several worker instances can drain one queue, and that is the intended scaling model." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Scaling is horizontal by construction: add worker processes pointed at the same transport to consume more. The transport, not the process count, is what orders and dedupes work. Deployment details live in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/",
				children: "Deployment"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "transaction-aware-dispatch",
			children: "Transaction-Aware Dispatch"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Jobs dispatched inside a database transaction are held until the transaction commits, using the same mechanism as the event outbox. If the transaction rolls back, the dispatch is never delivered:" }),
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
			title: "transaction-aware-dispatch.ts",
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
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " db."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "transaction"
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
							children: " ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "tx"
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
							children: "  await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " Order."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "create"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ amount: payload.total })"
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
							children: "  await"
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
			"This closes the gap between \"the row is committed\" and \"the work is enqueued\", so background work never runs against data the caller later rolled back. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/transactions",
				children: "Transactions"
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
			}), " — defining work, dispatch options, and retries"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/scheduling",
				children: "Scheduled Tasks"
			}), " — cron-driven work that hands off to queues"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/observability",
				children: "Job Observability"
			}), " — queue depth, DLQ size, and per-job traces"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/testing/",
					children: "Testing"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.fake()" }),
				" and dispatch assertions"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/",
				children: "Deployment"
			}), " — running workers as separate processes"] }),
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
