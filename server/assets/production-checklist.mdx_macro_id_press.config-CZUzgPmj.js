import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/deployment/production-checklist.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Production Checklist",
	"description": "Run every pre-deploy and operational check — stateless multi-instance rules, externalized sessions, cache and storage, migration ordering, secrets, readiness and liveness, queue workers, the scheduler, and observability."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nThe production checklist is the difference between an app that works in dev and a platform that survives in production. It is organized around the property that makes Kwiva easy to scale: the app kernel is **stateless multi-instance by construction**. Every item below protects that property under load.\n\nWork the checklist in this order: prove the stateless model, externalize the shared stores, harden configuration and secrets, order migrations deliberately, wire health and graceful shutdown, deploy the background plane separately, add the security baseline, and only then ship observability.\n\n## Stateless Multi-Instance Rules [#stateless-multi-instance-rules]\n\nEvery instance is an identical, disposable replica. Check each:\n\n* [ ] No application state is held in process memory between requests. Per-request state lives in the request context; durable state lives in shared stores.\n* [ ] A request that lands on any instance produces the same result as on any other.\n* [ ] The instance count can scale to zero safely — nothing important is lost when a container or function is recycled.\n* [ ] Deployment and rollback are pointer-swaps (keep N builds; managed hosts roll back by env; self-hosters keep a tar of the built artifact).\n\nThese four checks are the contract beneath everything else. If an instance holds a session in memory, or a cache that only it can read, the fleet is no longer interchangeable and every subsequent check is built on sand.\n\n## Externalize Sessions, Cache, and Storage [#externalize-sessions-cache-and-storage]\n\nShared state must point at shared services in production. The framework's own defaults are the template: stateless app, externalized database, shared cache and queue, object storage.\n\n| State    | Production requirement                                                                                   | Config home              |\n| -------- | -------------------------------------------------------------------------------------------------------- | ------------------------ |\n| Sessions | Pluggable session store backed by a shared broker or database, not instance memory                       | session store config     |\n| Cache    | Shared cache mounts (broker or key-value backends); memory mounts are dev-only                           | `src/config/cache.ts`    |\n| Files    | Object-storage-compatible disk for uploads; the local disk is for development                            | `src/config/storage.ts`  |\n| Database | Production relational database over an env-defined connector; the file-backed dev database is never used | `src/config/database.ts` |\n\nRehearse a scale-down: kill one instance or function and confirm requests still succeed from the survivors. Do the same with a scale-up: add an instance mid-traffic and confirm it serves immediately from the shared stores. Both rehearsals should be automated in CI before you run them in production.\n\n## Secrets and Configuration [#secrets-and-configuration]\n\n* [ ] All secrets live in the environment or a secrets manager; none are committed, and none reach client bundles.\n* [ ] Typed env access validates required variables at boot — configure `env(...)` for every production variable so misconfiguration fails fast at startup, not mid-request.\n* [ ] Provider credentials for `kwiva deploy [provider]` are injected as environment tokens at deploy time.\n* [ ] Runtime configuration overrides (the deploy-time config channel) are set per environment: the preset env var in CI, app defaults via the `KWIVA_*` variables, base URL and port via their env vars.\n\n> \\[!WARNING]\n> A secret that reaches a client bundle is compromised by definition — the bundle ships to the browser. The `no-secrets-in-client` lint gate exists because production-grade secrecy is a convention you enforce in CI, not a runtime flag you remember to set.\n\n## Security Baseline: Rate Limits and Headers [#security-baseline-rate-limits-and-headers]\n\n* [ ] Rate limiting is enabled on the routes that need it — middleware and route rules are both available, so per-route limits sit next to the handlers they protect.\n* [ ] Security headers and the content security policy use the default presets, overridden only where a specific route genuinely requires it.\n* [ ] Session-based protection (CSRF) is active for state-changing requests.\n* [ ] A production release runs `kwiva check` clean, including the convention gates that fail engine imports, raw fetches in loaders, secrets in client bundles, and misplaced files.\n* [ ] Dependency audit runs against the release candidate (`kwiva check --audit` where available) and reported advisories are triaged.\n\nThe security baseline belongs in this checklist because every item except the last is a config decision — and config decisions are exactly what get skipped under deploy pressure.\n\n## Migration Ordering [#migration-ordering]\n\n* [ ] Run `kwiva db:migrate` as a single explicit step in the release pipeline — never let every scaled instance race to apply the same migration on boot.\n* [ ] Module migrations are ordered before application migrations and versioned by module version; release both together.\n* [ ] Trust the boot-time drift check: the kernel compares the model IR against the database and warns on drift, in development where it is cheap.\n* [ ] In production, run migrations ahead of the new application code where the schema change is backward compatible, and roll code-then-schema (or the reverse) deliberately — never by accident.\n\nFor destructive or backfill changes, use the expand-and-contract pattern: additive migration ahead of code, a task-based backfill during the transition, a consumer migration, then a later release that drops the old shape. The compatible-with-both-versions rule demands that any release changing routes or columns runs against both the old and new shapes for one deploy cycle.\n\n## Readiness and Liveness [#readiness-and-liveness]\n\n* [ ] `/healthz` serves both liveness and readiness to your orchestrator or load balancer.\n* [ ] Liveness keeps instances alive; readiness gates traffic until the instance can accept requests (after boot-time checks such as engine init and provider boot complete).\n* [ ] Graceful shutdown is wired: providers stop, the queue drains, the engine stops, the process exits. Background flush-out is bounded so shutdown never hangs.\n\n## Backups and Disaster Recovery [#backups-and-disaster-recovery]\n\n* [ ] The database is backed up on a schedule, and restores are rehearsed — a backup you have never restored is a hypothesis, not a recovery plan.\n* [ ] Object-storage disks have replication and versioning enabled; uploaded files are part of DR, not an afterthought.\n* [ ] The build artifact is retained — keep N builds (or a tar of `.output/`) so rollback and recovery never require recompiling.\n* [ ] Shared infrastructure (cache, queue, session store) is documented as rehydratable: a cold cache is a performance event, not a correctness event, and the fleet must recover from one.\n\nThe disaster-recovery posture follows from statelessness: because instance state is disposable, recovery is a matter of restoring the external stores and repointing to a retained artifact — never rebuilding an instance's memory.\n\n## Queue Workers and the Scheduler [#queue-workers-and-the-scheduler]\n\nWeb instances do not own the background plane:\n\n* [ ] Queue workers run as their own deployment unit, sized to the queue load — see [Queues](/docs/background-work/queues).\n* [ ] The scheduler (cron tasks) runs where it belongs — a single deployment unit with `onOneServer` semantics for jobs that must not double-fire across instances.\n* [ ] Failed jobs land in the dead-letter store and are retried through the retry workflow — investigate before they accumulate.\n* [ ] Idempotency keys protect jobs from double-execution across retries and redeploys.\n\n## Observability [#observability]\n\nProduction without visibility is a black box. Before launch:\n\n* [ ] Structured logs are shipped with request and tenant correlation — see [Logging](/docs/observability/logging).\n* [ ] Request tracing spans the full path — request → middleware → handler → query — see [Tracing](/docs/observability/tracing).\n* [ ] Metrics matter: queue depth, cache hit rate, request latency — see [Metrics](/docs/observability/metrics).\n* [ ] Health (`/healthz`) is wired into your monitoring, not just your load balancer.\n* [ ] Telemetry noise is budgeted: choose a sampling strategy for traces, and keep the metrics cardinality bounded, before traffic hides real signals.\n\n## The Final Gate [#the-final-gate]\n\n| Area       | Pre-deploy action                                                |\n| ---------- | ---------------------------------------------------------------- |\n| Build      | `kwiva build` completes clean for the target preset              |\n| Preview    | `kwiva preview` serves the built artifact locally                |\n| Migrations | `kwiva db:migrate` runs once, in order, verified                 |\n| Env        | All typed env variables validated at boot                        |\n| Health     | `/healthz` answers liveness and readiness                        |\n| Security   | Rate limits, headers, and CSRF verified for every route          |\n| Workers    | Queue workers and scheduler deployed as separate units           |\n| State      | Sessions, cache, and storage point at shared production services |\n| Rollback   | N builds retained; rollback path rehearsed                       |\n| Backups    | Database and storage backups verified by a restore drill         |\n\n## What's Next [#whats-next]\n\n* [Runtime Adapters](/docs/deployment/adapters) — confirm the preset matches the target host\n* [Containers](/docs/deployment/containers) — apply this checklist to image-based fleets\n* [Observability](/docs/observability) — logging, tracing, metrics, and the dev overlay\n* [Background Work](/docs/background-work) — deploy queue workers and the scheduler correctly\n* [Security](/docs/security) — secrets, headers, and audit posture before launch\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The production checklist is the difference between an app that works in dev and a platform that survives in production. It is organized around the property that makes Kwiva easy to scale: the app kernel is **stateless multi-instance by construction**. Every item below protects that property under load."
		},
		{
			"heading": void 0,
			"content": "Work the checklist in this order: prove the stateless model, externalize the shared stores, harden configuration and secrets, order migrations deliberately, wire health and graceful shutdown, deploy the background plane separately, add the security baseline, and only then ship observability."
		},
		{
			"heading": "stateless-multi-instance-rules",
			"content": "Every instance is an identical, disposable replica. Check each:"
		},
		{
			"heading": "stateless-multi-instance-rules",
			"content": "No application state is held in process memory between requests. Per-request state lives in the request context; durable state lives in shared stores."
		},
		{
			"heading": "stateless-multi-instance-rules",
			"content": "A request that lands on any instance produces the same result as on any other."
		},
		{
			"heading": "stateless-multi-instance-rules",
			"content": "The instance count can scale to zero safely — nothing important is lost when a container or function is recycled."
		},
		{
			"heading": "stateless-multi-instance-rules",
			"content": "Deployment and rollback are pointer-swaps (keep N builds; managed hosts roll back by env; self-hosters keep a tar of the built artifact)."
		},
		{
			"heading": "stateless-multi-instance-rules",
			"content": "These four checks are the contract beneath everything else. If an instance holds a session in memory, or a cache that only it can read, the fleet is no longer interchangeable and every subsequent check is built on sand."
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "Shared state must point at shared services in production. The framework's own defaults are the template: stateless app, externalized database, shared cache and queue, object storage."
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "State"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "Production requirement"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "Config home"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "Sessions"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "Pluggable session store backed by a shared broker or database, not instance memory"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "session store config"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "Cache"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "Shared cache mounts (broker or key-value backends); memory mounts are dev-only"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "`src/config/cache.ts`"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "Files"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "Object-storage-compatible disk for uploads; the local disk is for development"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "`src/config/storage.ts`"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "Database"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "Production relational database over an env-defined connector; the file-backed dev database is never used"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "`src/config/database.ts`"
		},
		{
			"heading": "externalize-sessions-cache-and-storage",
			"content": "Rehearse a scale-down: kill one instance or function and confirm requests still succeed from the survivors. Do the same with a scale-up: add an instance mid-traffic and confirm it serves immediately from the shared stores. Both rehearsals should be automated in CI before you run them in production."
		},
		{
			"heading": "secrets-and-configuration",
			"content": "All secrets live in the environment or a secrets manager; none are committed, and none reach client bundles."
		},
		{
			"heading": "secrets-and-configuration",
			"content": "Typed env access validates required variables at boot — configure `env(...)` for every production variable so misconfiguration fails fast at startup, not mid-request."
		},
		{
			"heading": "secrets-and-configuration",
			"content": "Provider credentials for `kwiva deploy [provider]` are injected as environment tokens at deploy time."
		},
		{
			"heading": "secrets-and-configuration",
			"content": "Runtime configuration overrides (the deploy-time config channel) are set per environment: the preset env var in CI, app defaults via the `KWIVA_*` variables, base URL and port via their env vars."
		},
		{
			"heading": "secrets-and-configuration",
			"content": "> \\[!WARNING]\n> A secret that reaches a client bundle is compromised by definition — the bundle ships to the browser. The `no-secrets-in-client` lint gate exists because production-grade secrecy is a convention you enforce in CI, not a runtime flag you remember to set."
		},
		{
			"heading": "security-baseline-rate-limits-and-headers",
			"content": "Rate limiting is enabled on the routes that need it — middleware and route rules are both available, so per-route limits sit next to the handlers they protect."
		},
		{
			"heading": "security-baseline-rate-limits-and-headers",
			"content": "Security headers and the content security policy use the default presets, overridden only where a specific route genuinely requires it."
		},
		{
			"heading": "security-baseline-rate-limits-and-headers",
			"content": "Session-based protection (CSRF) is active for state-changing requests."
		},
		{
			"heading": "security-baseline-rate-limits-and-headers",
			"content": "A production release runs `kwiva check` clean, including the convention gates that fail engine imports, raw fetches in loaders, secrets in client bundles, and misplaced files."
		},
		{
			"heading": "security-baseline-rate-limits-and-headers",
			"content": "Dependency audit runs against the release candidate (`kwiva check --audit` where available) and reported advisories are triaged."
		},
		{
			"heading": "security-baseline-rate-limits-and-headers",
			"content": "The security baseline belongs in this checklist because every item except the last is a config decision — and config decisions are exactly what get skipped under deploy pressure."
		},
		{
			"heading": "migration-ordering",
			"content": "Run `kwiva db:migrate` as a single explicit step in the release pipeline — never let every scaled instance race to apply the same migration on boot."
		},
		{
			"heading": "migration-ordering",
			"content": "Module migrations are ordered before application migrations and versioned by module version; release both together."
		},
		{
			"heading": "migration-ordering",
			"content": "Trust the boot-time drift check: the kernel compares the model IR against the database and warns on drift, in development where it is cheap."
		},
		{
			"heading": "migration-ordering",
			"content": "In production, run migrations ahead of the new application code where the schema change is backward compatible, and roll code-then-schema (or the reverse) deliberately — never by accident."
		},
		{
			"heading": "migration-ordering",
			"content": "For destructive or backfill changes, use the expand-and-contract pattern: additive migration ahead of code, a task-based backfill during the transition, a consumer migration, then a later release that drops the old shape. The compatible-with-both-versions rule demands that any release changing routes or columns runs against both the old and new shapes for one deploy cycle."
		},
		{
			"heading": "readiness-and-liveness",
			"content": "`/healthz` serves both liveness and readiness to your orchestrator or load balancer."
		},
		{
			"heading": "readiness-and-liveness",
			"content": "Liveness keeps instances alive; readiness gates traffic until the instance can accept requests (after boot-time checks such as engine init and provider boot complete)."
		},
		{
			"heading": "readiness-and-liveness",
			"content": "Graceful shutdown is wired: providers stop, the queue drains, the engine stops, the process exits. Background flush-out is bounded so shutdown never hangs."
		},
		{
			"heading": "backups-and-disaster-recovery",
			"content": "The database is backed up on a schedule, and restores are rehearsed — a backup you have never restored is a hypothesis, not a recovery plan."
		},
		{
			"heading": "backups-and-disaster-recovery",
			"content": "Object-storage disks have replication and versioning enabled; uploaded files are part of DR, not an afterthought."
		},
		{
			"heading": "backups-and-disaster-recovery",
			"content": "The build artifact is retained — keep N builds (or a tar of `.output/`) so rollback and recovery never require recompiling."
		},
		{
			"heading": "backups-and-disaster-recovery",
			"content": "Shared infrastructure (cache, queue, session store) is documented as rehydratable: a cold cache is a performance event, not a correctness event, and the fleet must recover from one."
		},
		{
			"heading": "backups-and-disaster-recovery",
			"content": "The disaster-recovery posture follows from statelessness: because instance state is disposable, recovery is a matter of restoring the external stores and repointing to a retained artifact — never rebuilding an instance's memory."
		},
		{
			"heading": "queue-workers-and-the-scheduler",
			"content": "Web instances do not own the background plane:"
		},
		{
			"heading": "queue-workers-and-the-scheduler",
			"content": "Queue workers run as their own deployment unit, sized to the queue load — see Queues."
		},
		{
			"heading": "queue-workers-and-the-scheduler",
			"content": "The scheduler (cron tasks) runs where it belongs — a single deployment unit with `onOneServer` semantics for jobs that must not double-fire across instances."
		},
		{
			"heading": "queue-workers-and-the-scheduler",
			"content": "Failed jobs land in the dead-letter store and are retried through the retry workflow — investigate before they accumulate."
		},
		{
			"heading": "queue-workers-and-the-scheduler",
			"content": "Idempotency keys protect jobs from double-execution across retries and redeploys."
		},
		{
			"heading": "observability",
			"content": "Production without visibility is a black box. Before launch:"
		},
		{
			"heading": "observability",
			"content": "Structured logs are shipped with request and tenant correlation — see Logging."
		},
		{
			"heading": "observability",
			"content": "Request tracing spans the full path — request → middleware → handler → query — see Tracing."
		},
		{
			"heading": "observability",
			"content": "Metrics matter: queue depth, cache hit rate, request latency — see Metrics."
		},
		{
			"heading": "observability",
			"content": "Health (`/healthz`) is wired into your monitoring, not just your load balancer."
		},
		{
			"heading": "observability",
			"content": "Telemetry noise is budgeted: choose a sampling strategy for traces, and keep the metrics cardinality bounded, before traffic hides real signals."
		},
		{
			"heading": "the-final-gate",
			"content": "Area"
		},
		{
			"heading": "the-final-gate",
			"content": "Pre-deploy action"
		},
		{
			"heading": "the-final-gate",
			"content": "Build"
		},
		{
			"heading": "the-final-gate",
			"content": "`kwiva build` completes clean for the target preset"
		},
		{
			"heading": "the-final-gate",
			"content": "Preview"
		},
		{
			"heading": "the-final-gate",
			"content": "`kwiva preview` serves the built artifact locally"
		},
		{
			"heading": "the-final-gate",
			"content": "Migrations"
		},
		{
			"heading": "the-final-gate",
			"content": "`kwiva db:migrate` runs once, in order, verified"
		},
		{
			"heading": "the-final-gate",
			"content": "Env"
		},
		{
			"heading": "the-final-gate",
			"content": "All typed env variables validated at boot"
		},
		{
			"heading": "the-final-gate",
			"content": "Health"
		},
		{
			"heading": "the-final-gate",
			"content": "`/healthz` answers liveness and readiness"
		},
		{
			"heading": "the-final-gate",
			"content": "Security"
		},
		{
			"heading": "the-final-gate",
			"content": "Rate limits, headers, and CSRF verified for every route"
		},
		{
			"heading": "the-final-gate",
			"content": "Workers"
		},
		{
			"heading": "the-final-gate",
			"content": "Queue workers and scheduler deployed as separate units"
		},
		{
			"heading": "the-final-gate",
			"content": "State"
		},
		{
			"heading": "the-final-gate",
			"content": "Sessions, cache, and storage point at shared production services"
		},
		{
			"heading": "the-final-gate",
			"content": "Rollback"
		},
		{
			"heading": "the-final-gate",
			"content": "N builds retained; rollback path rehearsed"
		},
		{
			"heading": "the-final-gate",
			"content": "Backups"
		},
		{
			"heading": "the-final-gate",
			"content": "Database and storage backups verified by a restore drill"
		},
		{
			"heading": "whats-next",
			"content": "Runtime Adapters — confirm the preset matches the target host"
		},
		{
			"heading": "whats-next",
			"content": "Containers — apply this checklist to image-based fleets"
		},
		{
			"heading": "whats-next",
			"content": "Observability — logging, tracing, metrics, and the dev overlay"
		},
		{
			"heading": "whats-next",
			"content": "Background Work — deploy queue workers and the scheduler correctly"
		},
		{
			"heading": "whats-next",
			"content": "Security — secrets, headers, and audit posture before launch"
		}
	],
	"headings": [
		{
			"id": "stateless-multi-instance-rules",
			"content": "Stateless Multi-Instance Rules"
		},
		{
			"id": "externalize-sessions-cache-and-storage",
			"content": "Externalize Sessions, Cache, and Storage"
		},
		{
			"id": "secrets-and-configuration",
			"content": "Secrets and Configuration"
		},
		{
			"id": "security-baseline-rate-limits-and-headers",
			"content": "Security Baseline: Rate Limits and Headers"
		},
		{
			"id": "migration-ordering",
			"content": "Migration Ordering"
		},
		{
			"id": "readiness-and-liveness",
			"content": "Readiness and Liveness"
		},
		{
			"id": "backups-and-disaster-recovery",
			"content": "Backups and Disaster Recovery"
		},
		{
			"id": "queue-workers-and-the-scheduler",
			"content": "Queue Workers and the Scheduler"
		},
		{
			"id": "observability",
			"content": "Observability"
		},
		{
			"id": "the-final-gate",
			"content": "The Final Gate"
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
		url: "#stateless-multi-instance-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Stateless Multi-Instance Rules" })
	},
	{
		depth: 2,
		url: "#externalize-sessions-cache-and-storage",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Externalize Sessions, Cache, and Storage" })
	},
	{
		depth: 2,
		url: "#secrets-and-configuration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Secrets and Configuration" })
	},
	{
		depth: 2,
		url: "#security-baseline-rate-limits-and-headers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Security Baseline: Rate Limits and Headers" })
	},
	{
		depth: 2,
		url: "#migration-ordering",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Migration Ordering" })
	},
	{
		depth: 2,
		url: "#readiness-and-liveness",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Readiness and Liveness" })
	},
	{
		depth: 2,
		url: "#backups-and-disaster-recovery",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Backups and Disaster Recovery" })
	},
	{
		depth: 2,
		url: "#queue-workers-and-the-scheduler",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Queue Workers and the Scheduler" })
	},
	{
		depth: 2,
		url: "#observability",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Observability" })
	},
	{
		depth: 2,
		url: "#the-final-gate",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Final Gate" })
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
		input: "input",
		li: "li",
		p: "p",
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
			"The production checklist is the difference between an app that works in dev and a platform that survives in production. It is organized around the property that makes Kwiva easy to scale: the app kernel is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "stateless multi-instance by construction" }),
			". Every item below protects that property under load."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Work the checklist in this order: prove the stateless model, externalize the shared stores, harden configuration and secrets, order migrations deliberately, wire health and graceful shutdown, deploy the background plane separately, add the security baseline, and only then ship observability." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "stateless-multi-instance-rules",
			children: "Stateless Multi-Instance Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every instance is an identical, disposable replica. Check each:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, {
			className: "contains-task-list",
			children: [
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"No application state is held in process memory between requests. Per-request state lives in the request context; durable state lives in shared stores."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"A request that lands on any instance produces the same result as on any other."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"The instance count can scale to zero safely — nothing important is lost when a container or function is recycled."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Deployment and rollback are pointer-swaps (keep N builds; managed hosts roll back by env; self-hosters keep a tar of the built artifact)."
					]
				}),
				"\n"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "These four checks are the contract beneath everything else. If an instance holds a session in memory, or a cache that only it can read, the fleet is no longer interchangeable and every subsequent check is built on sand." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "externalize-sessions-cache-and-storage",
			children: "Externalize Sessions, Cache, and Storage"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Shared state must point at shared services in production. The framework's own defaults are the template: stateless app, externalized database, shared cache and queue, object storage." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "State" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Production requirement" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Config home" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sessions" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pluggable session store backed by a shared broker or database, not instance memory" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "session store config" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cache" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Shared cache mounts (broker or key-value backends); memory mounts are dev-only" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/cache.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Files" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Object-storage-compatible disk for uploads; the local disk is for development" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/storage.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Database" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Production relational database over an env-defined connector; the file-backed dev database is never used" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/database.ts" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Rehearse a scale-down: kill one instance or function and confirm requests still succeed from the survivors. Do the same with a scale-up: add an instance mid-traffic and confirm it serves immediately from the shared stores. Both rehearsals should be automated in CI before you run them in production." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "secrets-and-configuration",
			children: "Secrets and Configuration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, {
			className: "contains-task-list",
			children: [
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"All secrets live in the environment or a secrets manager; none are committed, and none reach client bundles."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Typed env access validates required variables at boot — configure ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env(...)" }),
						" for every production variable so misconfiguration fails fast at startup, not mid-request."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Provider credentials for ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy [provider]" }),
						" are injected as environment tokens at deploy time."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Runtime configuration overrides (the deploy-time config channel) are set per environment: the preset env var in CI, app defaults via the ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_*" }),
						" variables, base URL and port via their env vars."
					]
				}),
				"\n"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!WARNING]\nA secret that reaches a client bundle is compromised by definition — the bundle ships to the browser. The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-secrets-in-client" }),
				" lint gate exists because production-grade secrecy is a convention you enforce in CI, not a runtime flag you remember to set."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "security-baseline-rate-limits-and-headers",
			children: "Security Baseline: Rate Limits and Headers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, {
			className: "contains-task-list",
			children: [
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Rate limiting is enabled on the routes that need it — middleware and route rules are both available, so per-route limits sit next to the handlers they protect."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Security headers and the content security policy use the default presets, overridden only where a specific route genuinely requires it."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Session-based protection (CSRF) is active for state-changing requests."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"A production release runs ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
						" clean, including the convention gates that fail engine imports, raw fetches in loaders, secrets in client bundles, and misplaced files."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Dependency audit runs against the release candidate (",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check --audit" }),
						" where available) and reported advisories are triaged."
					]
				}),
				"\n"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The security baseline belongs in this checklist because every item except the last is a config decision — and config decisions are exactly what get skipped under deploy pressure." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "migration-ordering",
			children: "Migration Ordering"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, {
			className: "contains-task-list",
			children: [
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Run ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
						" as a single explicit step in the release pipeline — never let every scaled instance race to apply the same migration on boot."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Module migrations are ordered before application migrations and versioned by module version; release both together."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Trust the boot-time drift check: the kernel compares the model IR against the database and warns on drift, in development where it is cheap."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"In production, run migrations ahead of the new application code where the schema change is backward compatible, and roll code-then-schema (or the reverse) deliberately — never by accident."
					]
				}),
				"\n"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "For destructive or backfill changes, use the expand-and-contract pattern: additive migration ahead of code, a task-based backfill during the transition, a consumer migration, then a later release that drops the old shape. The compatible-with-both-versions rule demands that any release changing routes or columns runs against both the old and new shapes for one deploy cycle." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "readiness-and-liveness",
			children: "Readiness and Liveness"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, {
			className: "contains-task-list",
			children: [
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }),
						" serves both liveness and readiness to your orchestrator or load balancer."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Liveness keeps instances alive; readiness gates traffic until the instance can accept requests (after boot-time checks such as engine init and provider boot complete)."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Graceful shutdown is wired: providers stop, the queue drains, the engine stops, the process exits. Background flush-out is bounded so shutdown never hangs."
					]
				}),
				"\n"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "backups-and-disaster-recovery",
			children: "Backups and Disaster Recovery"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, {
			className: "contains-task-list",
			children: [
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"The database is backed up on a schedule, and restores are rehearsed — a backup you have never restored is a hypothesis, not a recovery plan."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Object-storage disks have replication and versioning enabled; uploaded files are part of DR, not an afterthought."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"The build artifact is retained — keep N builds (or a tar of ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
						") so rollback and recovery never require recompiling."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Shared infrastructure (cache, queue, session store) is documented as rehydratable: a cold cache is a performance event, not a correctness event, and the fleet must recover from one."
					]
				}),
				"\n"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The disaster-recovery posture follows from statelessness: because instance state is disposable, recovery is a matter of restoring the external stores and repointing to a retained artifact — never rebuilding an instance's memory." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "queue-workers-and-the-scheduler",
			children: "Queue Workers and the Scheduler"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Web instances do not own the background plane:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, {
			className: "contains-task-list",
			children: [
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Queue workers run as their own deployment unit, sized to the queue load — see ",
						(0, import_jsx_runtime_react_server.jsx)(_components.a, {
							href: "/docs/background-work/queues",
							children: "Queues"
						}),
						"."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"The scheduler (cron tasks) runs where it belongs — a single deployment unit with ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onOneServer" }),
						" semantics for jobs that must not double-fire across instances."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Failed jobs land in the dead-letter store and are retried through the retry workflow — investigate before they accumulate."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Idempotency keys protect jobs from double-execution across retries and redeploys."
					]
				}),
				"\n"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "observability",
			children: "Observability"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Production without visibility is a black box. Before launch:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, {
			className: "contains-task-list",
			children: [
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Structured logs are shipped with request and tenant correlation — see ",
						(0, import_jsx_runtime_react_server.jsx)(_components.a, {
							href: "/docs/observability/logging",
							children: "Logging"
						}),
						"."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Request tracing spans the full path — request → middleware → handler → query — see ",
						(0, import_jsx_runtime_react_server.jsx)(_components.a, {
							href: "/docs/observability/tracing",
							children: "Tracing"
						}),
						"."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Metrics matter: queue depth, cache hit rate, request latency — see ",
						(0, import_jsx_runtime_react_server.jsx)(_components.a, {
							href: "/docs/observability/metrics",
							children: "Metrics"
						}),
						"."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Health (",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }),
						") is wired into your monitoring, not just your load balancer."
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Telemetry noise is budgeted: choose a sampling strategy for traces, and keep the metrics cardinality bounded, before traffic hides real signals."
					]
				}),
				"\n"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-final-gate",
			children: "The Final Gate"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Area" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Pre-deploy action" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }), " completes clean for the target preset"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Preview" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }), " serves the built artifact locally"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Migrations" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }), " runs once, in order, verified"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Env" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "All typed env variables validated at boot" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Health" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }), " answers liveness and readiness"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Security" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rate limits, headers, and CSRF verified for every route" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Workers" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Queue workers and scheduler deployed as separate units" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "State" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sessions, cache, and storage point at shared production services" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rollback" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "N builds retained; rollback path rehearsed" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Backups" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Database and storage backups verified by a restore drill" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/adapters",
				children: "Runtime Adapters"
			}), " — confirm the preset matches the target host"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/containers",
				children: "Containers"
			}), " — apply this checklist to image-based fleets"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}), " — logging, tracing, metrics, and the dev overlay"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work",
				children: "Background Work"
			}), " — deploy queue workers and the scheduler correctly"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security",
				children: "Security"
			}), " — secrets, headers, and audit posture before launch"] }),
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
