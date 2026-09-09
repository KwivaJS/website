import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/deployment/containers.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Container Deployment",
	"description": "Run Kwiva in container images — build the artifact, assemble a minimal runtime image, set the startup command, run migrations on boot safely, and scale with shared session, cache, and storage stores."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\n## Overview [#overview]\n\nContainer deployment is self-hosting the built artifact: you build with a runtime preset, place `.output/` into a minimal runtime image, and let an orchestrator run and scale it. It is the clearest expression of Kwiva's stateless multi-instance model — every instance is identical and disposable, and shared state lives outside the container.\n\nA container fleet is just many copies of the same immutable artifact. Because the app kernel holds no durable state, each copy can be created, destroyed, or replaced at any moment without a correctness loss — the orchestrator's only job is keeping the right number of identical replicas in front of traffic.\n\n## Build the Artifact [#build-the-artifact]\n\nContainers use the runtime presets. Choose based on what your base image and clusters can run:\n\n```bash title=\"terminal\"\nkwiva build --preset node_server   # portable Node entry\nkwiva build --preset bun-server    # Bun runtime entry\n```\n\nThe build emits `.output/` with `server/` and `public/`. Only the runtime, the entry module, and the public assets need to reach the image.\n\n## Assemble a Minimal Runtime Image [#assemble-a-minimal-runtime-image]\n\n| Step        | Action                                                                                                   |\n| ----------- | -------------------------------------------------------------------------------------------------------- |\n| 1. Build    | `kwiva build --preset node_server` (or the Bun preset)                                                   |\n| 2. Assemble | Copy `.output/` into a minimal runtime image — runtime binary plus `server/` and `public/`, nothing else |\n| 3. Startup  | Run the generated entry — `node .output/server/index.mjs` or its Bun equivalent                          |\n| 4. Port     | Honor the `PORT` env var set by the orchestrator                                                         |\n| 5. Health   | Expose `/healthz` for liveness and readiness probes                                                      |\n\nA representative image (Node case):\n\n```dockerfile title=\"assemble-a-minimal-runtime-image.Dockerfile\"\nFROM node:22-slim\nWORKDIR /app\nCOPY .output/ .output/\nENV PORT=3000\nEXPOSE 3000\nCMD [\"node\", \".output/server/index.mjs\"]\n```\n\nKeeping the image minimal matters twice over: it is faster to pull across fleets, and it reduces the attack surface of what you run in production. A smaller mounted filesystem also shortens cold-pull on scale-out, so instance churn stays cheap.\n\n## Startup Command [#startup-command]\n\nThe container's startup command is just the entry module:\n\n```text title=\"startup-command.txt\"\nnode .output/server/index.mjs\n```\n\nThe same command that worked under `kwiva preview` is the command the container runs. No supervisor is required inside the image — the process managers and health probes of your orchestrator do that job outside the container. Keeping orchestration concerns out of the image (no init wrappers, no cron daemons, no process managers) preserves the single-responsibility contract: the image runs the app, the orchestrator manages the fleet.\n\nThe Node and Bun presets produce different images, and the choice should match what your clusters support. The Bun runtime gives you the framework's primary-runtime fast paths inside the image; the Node runtime gives you the most portable `.mjs` entry across managed Kubernetes distributions and serverless-on-container offerings. You can also change base runtimes later without touching application code — the image is assembled from the same artifact either way.\n\n## Single Binary in a Container [#single-binary-in-a-container]\n\nFor the leanest possible image, skip the runtime base image entirely and compile the binary:\n\n```bash title=\"terminal\"\nkwiva build --binary\n# copy the resulting executable into a distroless or scratch image\n```\n\nWhen the base image is minimal — distroless or scratch — target the musl or generic flavor of the binary so it links cleanly against the bare image's libc. The same syntax-only minification guidance from the binary path applies: keep `--minify-syntax` semantics so function names survive for tracing in the container, and remember the binary requires an AVX2-capable CPU. Deployment then reduces to copying one executable into a nearly empty image and running it behind the orchestrator's health probes.\n\n## Migrations on Boot [#migrations-on-boot]\n\nMigrations are applied with `kwiva db:migrate` and ordered deterministically — module migrations run before application migrations, each versioned by module version. What deserves a decision: **where** migrations run when you have scaled instances.\n\nRun migrations as a single, explicit step in the release pipeline rather than letting every scaled instance race to apply the same migration on boot:\n\n| Strategy                    | When to use                                                                                   |\n| --------------------------- | --------------------------------------------------------------------------------------------- |\n| Release-step migration      | Run `kwiva db:migrate` as a one-off job before rolling new instances                          |\n| Dedicated migrator instance | A single short-lived task runs migrations, then exits                                         |\n| Boot-time drift check       | The kernel warns on migration drift during boot — in development this surfaces problems early |\n\nThe framework checks the model IR against the database at boot and warns when the schema has drifted, so a release that forgot its migration step fails loudly rather than silently. That drift check is a warning in production, not a hard stop — long-running environments should treat it as an incident trigger and reconcile the migration step separately.\n\nFor non-additive schema changes, apply the release-order discipline deliberately: run backward-compatible migrations ahead of the new code, double-write during the transition window, and drop the old shape in a later release — never let scaled instances discover the incompatibility at boot.\n\n## Scaling Instances and Shared Stores [#scaling-instances-and-shared-stores]\n\nKwiva is **stateless multi-instance by construction**: all state lives in external services, so any instance can serve any request. Distributed agility depends on three shared stores:\n\n| State    | Store                                                                                 | Why externalize                                        |\n| -------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------ |\n| Sessions | Pluggable session store (cookie, shared broker, or database backends)                 | Any instance must resolve a session started on another |\n| Cache    | Cache mounts (memory, shared broker, or key-value backends) via `src/config/cache.ts` | Cache hits must be shared fleet-wide                   |\n| Files    | Storage disks (local or object-storage compatible) via `src/config/storage.ts`        | Uploaded files must be reachable from every instance   |\n\nInstance memory holds nothing durable. When the orchestrator scales to zero or restarts a node, requests simply land on fresh instances that read shared state. Connect those three stores to shared infrastructure before you scale past a single instance:\n\n* Sessions to the same pluggable session store all replicas read.\n* The cache to a shared broker or key-value backend — a memory mount is dev-only.\n* The storage disk to an object-storage-compatible backend — the local disk is for development.\n\n## Health Checks and Lifecycle [#health-checks-and-lifecycle]\n\n* `/healthz` answers liveness and readiness probes — wire both to your orchestrator.\n* Liveness keeps instances alive; readiness gates traffic until the instance can accept requests after boot-time checks (engine init, provider boot) complete.\n* Graceful shutdown is inverted boot: providers stop, the queue drains, the engine stops, the process exits. Background flush-out is bounded so shutdown never hangs.\n* Queue workers and the scheduler run as separate deployment units — see [Background Work](/docs/background-work) for running workers and scheduled tasks at scale.\n\nThe health contract matters because orchestrators act on it: a failing readiness check stops traffic to a sick instance, a liveness failure replaces it, and graceful shutdown orders the drain so in-flight requests finish before the process exits.\n\n## What's Next [#whats-next]\n\n* [Runtime Adapters](/docs/deployment/adapters) — pick the preset your image will run\n* [Node/Bun Deployment](/docs/deployment/node-bun) — the entry points and env vars a container uses\n* [Serverless Deployment](/docs/deployment/serverless) — the alternative for elastic, function-based hosting\n* [Production Checklist](/docs/deployment/production-checklist) — harden multi-instance deployments\n* [Background Work](/docs/background-work) — run queue workers and the scheduler alongside the web fleet\n";
var structuredData = {
	"contents": [
		{
			"heading": "overview",
			"content": "Container deployment is self-hosting the built artifact: you build with a runtime preset, place `.output/` into a minimal runtime image, and let an orchestrator run and scale it. It is the clearest expression of Kwiva's stateless multi-instance model — every instance is identical and disposable, and shared state lives outside the container."
		},
		{
			"heading": "overview",
			"content": "A container fleet is just many copies of the same immutable artifact. Because the app kernel holds no durable state, each copy can be created, destroyed, or replaced at any moment without a correctness loss — the orchestrator's only job is keeping the right number of identical replicas in front of traffic."
		},
		{
			"heading": "build-the-artifact",
			"content": "Containers use the runtime presets. Choose based on what your base image and clusters can run:"
		},
		{
			"heading": "build-the-artifact",
			"content": "The build emits `.output/` with `server/` and `public/`. Only the runtime, the entry module, and the public assets need to reach the image."
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "Step"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "Action"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "1. Build"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "`kwiva build --preset node_server` (or the Bun preset)"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "2. Assemble"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "Copy `.output/` into a minimal runtime image — runtime binary plus `server/` and `public/`, nothing else"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "3. Startup"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "Run the generated entry — `node .output/server/index.mjs` or its Bun equivalent"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "4. Port"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "Honor the `PORT` env var set by the orchestrator"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "5. Health"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "Expose `/healthz` for liveness and readiness probes"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "A representative image (Node case):"
		},
		{
			"heading": "assemble-a-minimal-runtime-image",
			"content": "Keeping the image minimal matters twice over: it is faster to pull across fleets, and it reduces the attack surface of what you run in production. A smaller mounted filesystem also shortens cold-pull on scale-out, so instance churn stays cheap."
		},
		{
			"heading": "startup-command",
			"content": "The container's startup command is just the entry module:"
		},
		{
			"heading": "startup-command",
			"content": "The same command that worked under `kwiva preview` is the command the container runs. No supervisor is required inside the image — the process managers and health probes of your orchestrator do that job outside the container. Keeping orchestration concerns out of the image (no init wrappers, no cron daemons, no process managers) preserves the single-responsibility contract: the image runs the app, the orchestrator manages the fleet."
		},
		{
			"heading": "startup-command",
			"content": "The Node and Bun presets produce different images, and the choice should match what your clusters support. The Bun runtime gives you the framework's primary-runtime fast paths inside the image; the Node runtime gives you the most portable `.mjs` entry across managed Kubernetes distributions and serverless-on-container offerings. You can also change base runtimes later without touching application code — the image is assembled from the same artifact either way."
		},
		{
			"heading": "single-binary-in-a-container",
			"content": "For the leanest possible image, skip the runtime base image entirely and compile the binary:"
		},
		{
			"heading": "single-binary-in-a-container",
			"content": "When the base image is minimal — distroless or scratch — target the musl or generic flavor of the binary so it links cleanly against the bare image's libc. The same syntax-only minification guidance from the binary path applies: keep `--minify-syntax` semantics so function names survive for tracing in the container, and remember the binary requires an AVX2-capable CPU. Deployment then reduces to copying one executable into a nearly empty image and running it behind the orchestrator's health probes."
		},
		{
			"heading": "migrations-on-boot",
			"content": "Migrations are applied with `kwiva db:migrate` and ordered deterministically — module migrations run before application migrations, each versioned by module version. What deserves a decision: **where** migrations run when you have scaled instances."
		},
		{
			"heading": "migrations-on-boot",
			"content": "Run migrations as a single, explicit step in the release pipeline rather than letting every scaled instance race to apply the same migration on boot:"
		},
		{
			"heading": "migrations-on-boot",
			"content": "Strategy"
		},
		{
			"heading": "migrations-on-boot",
			"content": "When to use"
		},
		{
			"heading": "migrations-on-boot",
			"content": "Release-step migration"
		},
		{
			"heading": "migrations-on-boot",
			"content": "Run `kwiva db:migrate` as a one-off job before rolling new instances"
		},
		{
			"heading": "migrations-on-boot",
			"content": "Dedicated migrator instance"
		},
		{
			"heading": "migrations-on-boot",
			"content": "A single short-lived task runs migrations, then exits"
		},
		{
			"heading": "migrations-on-boot",
			"content": "Boot-time drift check"
		},
		{
			"heading": "migrations-on-boot",
			"content": "The kernel warns on migration drift during boot — in development this surfaces problems early"
		},
		{
			"heading": "migrations-on-boot",
			"content": "The framework checks the model IR against the database at boot and warns when the schema has drifted, so a release that forgot its migration step fails loudly rather than silently. That drift check is a warning in production, not a hard stop — long-running environments should treat it as an incident trigger and reconcile the migration step separately."
		},
		{
			"heading": "migrations-on-boot",
			"content": "For non-additive schema changes, apply the release-order discipline deliberately: run backward-compatible migrations ahead of the new code, double-write during the transition window, and drop the old shape in a later release — never let scaled instances discover the incompatibility at boot."
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Kwiva is **stateless multi-instance by construction**: all state lives in external services, so any instance can serve any request. Distributed agility depends on three shared stores:"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "State"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Store"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Why externalize"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Sessions"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Pluggable session store (cookie, shared broker, or database backends)"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Any instance must resolve a session started on another"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Cache"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Cache mounts (memory, shared broker, or key-value backends) via `src/config/cache.ts`"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Cache hits must be shared fleet-wide"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Files"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Storage disks (local or object-storage compatible) via `src/config/storage.ts`"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Uploaded files must be reachable from every instance"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Instance memory holds nothing durable. When the orchestrator scales to zero or restarts a node, requests simply land on fresh instances that read shared state. Connect those three stores to shared infrastructure before you scale past a single instance:"
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "Sessions to the same pluggable session store all replicas read."
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "The cache to a shared broker or key-value backend — a memory mount is dev-only."
		},
		{
			"heading": "scaling-instances-and-shared-stores",
			"content": "The storage disk to an object-storage-compatible backend — the local disk is for development."
		},
		{
			"heading": "health-checks-and-lifecycle",
			"content": "`/healthz` answers liveness and readiness probes — wire both to your orchestrator."
		},
		{
			"heading": "health-checks-and-lifecycle",
			"content": "Liveness keeps instances alive; readiness gates traffic until the instance can accept requests after boot-time checks (engine init, provider boot) complete."
		},
		{
			"heading": "health-checks-and-lifecycle",
			"content": "Graceful shutdown is inverted boot: providers stop, the queue drains, the engine stops, the process exits. Background flush-out is bounded so shutdown never hangs."
		},
		{
			"heading": "health-checks-and-lifecycle",
			"content": "Queue workers and the scheduler run as separate deployment units — see Background Work for running workers and scheduled tasks at scale."
		},
		{
			"heading": "health-checks-and-lifecycle",
			"content": "The health contract matters because orchestrators act on it: a failing readiness check stops traffic to a sick instance, a liveness failure replaces it, and graceful shutdown orders the drain so in-flight requests finish before the process exits."
		},
		{
			"heading": "whats-next",
			"content": "Runtime Adapters — pick the preset your image will run"
		},
		{
			"heading": "whats-next",
			"content": "Node/Bun Deployment — the entry points and env vars a container uses"
		},
		{
			"heading": "whats-next",
			"content": "Serverless Deployment — the alternative for elastic, function-based hosting"
		},
		{
			"heading": "whats-next",
			"content": "Production Checklist — harden multi-instance deployments"
		},
		{
			"heading": "whats-next",
			"content": "Background Work — run queue workers and the scheduler alongside the web fleet"
		}
	],
	"headings": [
		{
			"id": "overview",
			"content": "Overview"
		},
		{
			"id": "build-the-artifact",
			"content": "Build the Artifact"
		},
		{
			"id": "assemble-a-minimal-runtime-image",
			"content": "Assemble a Minimal Runtime Image"
		},
		{
			"id": "startup-command",
			"content": "Startup Command"
		},
		{
			"id": "single-binary-in-a-container",
			"content": "Single Binary in a Container"
		},
		{
			"id": "migrations-on-boot",
			"content": "Migrations on Boot"
		},
		{
			"id": "scaling-instances-and-shared-stores",
			"content": "Scaling Instances and Shared Stores"
		},
		{
			"id": "health-checks-and-lifecycle",
			"content": "Health Checks and Lifecycle"
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
		url: "#overview",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Overview" })
	},
	{
		depth: 2,
		url: "#build-the-artifact",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Build the Artifact" })
	},
	{
		depth: 2,
		url: "#assemble-a-minimal-runtime-image",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Assemble a Minimal Runtime Image" })
	},
	{
		depth: 2,
		url: "#startup-command",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Startup Command" })
	},
	{
		depth: 2,
		url: "#single-binary-in-a-container",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Single Binary in a Container" })
	},
	{
		depth: 2,
		url: "#migrations-on-boot",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Migrations on Boot" })
	},
	{
		depth: 2,
		url: "#scaling-instances-and-shared-stores",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Scaling Instances and Shared Stores" })
	},
	{
		depth: 2,
		url: "#health-checks-and-lifecycle",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Health Checks and Lifecycle" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "overview",
			children: "Overview"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Container deployment is self-hosting the built artifact: you build with a runtime preset, place ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			" into a minimal runtime image, and let an orchestrator run and scale it. It is the clearest expression of Kwiva's stateless multi-instance model — every instance is identical and disposable, and shared state lives outside the container."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A container fleet is just many copies of the same immutable artifact. Because the app kernel holds no durable state, each copy can be created, destroyed, or replaced at any moment without a correctness loss — the orchestrator's only job is keeping the right number of identical replicas in front of traffic." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "build-the-artifact",
			children: "Build the Artifact"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Containers use the runtime presets. Choose based on what your base image and clusters can run:" }),
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
							children: " build"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --preset"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " node_server"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "   # portable Node entry"
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
							children: " build"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --preset"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " bun-server"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "    # Bun runtime entry"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The build emits ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			" with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "server/" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "public/" }),
			". Only the runtime, the entry module, and the public assets need to reach the image."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "assemble-a-minimal-runtime-image",
			children: "Assemble a Minimal Runtime Image"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Step" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Action" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "1. Build" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --preset node_server" }), " (or the Bun preset)"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "2. Assemble" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Copy ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
				" into a minimal runtime image — runtime binary plus ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "server/" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "public/" }),
				", nothing else"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "3. Startup" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Run the generated entry — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node .output/server/index.mjs" }),
				" or its Bun equivalent"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "4. Port" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Honor the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PORT" }),
				" env var set by the orchestrator"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "5. Health" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Expose ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }),
				" for liveness and readiness probes"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A representative image (Node case):" }),
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
			title: "assemble-a-minimal-runtime-image.Dockerfile",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "FROM"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " node:22-slim"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "WORKDIR"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " /app"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "COPY"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " .output/ .output/"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "ENV"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " PORT=3000"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "EXPOSE"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " 3000"
					})]
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
							children: "CMD"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"node\""
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
							children: "\".output/server/index.mjs\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "]"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Keeping the image minimal matters twice over: it is faster to pull across fleets, and it reduces the attack surface of what you run in production. A smaller mounted filesystem also shortens cold-pull on scale-out, so instance churn stays cheap." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "startup-command",
			children: "Startup Command"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The container's startup command is just the entry module:" }),
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
			title: "startup-command.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "node .output/server/index.mjs" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same command that worked under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }),
			" is the command the container runs. No supervisor is required inside the image — the process managers and health probes of your orchestrator do that job outside the container. Keeping orchestration concerns out of the image (no init wrappers, no cron daemons, no process managers) preserves the single-responsibility contract: the image runs the app, the orchestrator manages the fleet."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The Node and Bun presets produce different images, and the choice should match what your clusters support. The Bun runtime gives you the framework's primary-runtime fast paths inside the image; the Node runtime gives you the most portable ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".mjs" }),
			" entry across managed Kubernetes distributions and serverless-on-container offerings. You can also change base runtimes later without touching application code — the image is assembled from the same artifact either way."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "single-binary-in-a-container",
			children: "Single Binary in a Container"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "For the leanest possible image, skip the runtime base image entirely and compile the binary:" }),
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
							children: " build"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --binary"
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
						children: "# copy the resulting executable into a distroless or scratch image"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"When the base image is minimal — distroless or scratch — target the musl or generic flavor of the binary so it links cleanly against the bare image's libc. The same syntax-only minification guidance from the binary path applies: keep ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--minify-syntax" }),
			" semantics so function names survive for tracing in the container, and remember the binary requires an AVX2-capable CPU. Deployment then reduces to copying one executable into a nearly empty image and running it behind the orchestrator's health probes."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "migrations-on-boot",
			children: "Migrations on Boot"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Migrations are applied with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
			" and ordered deterministically — module migrations run before application migrations, each versioned by module version. What deserves a decision: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "where" }),
			" migrations run when you have scaled instances."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Run migrations as a single, explicit step in the release pipeline rather than letting every scaled instance race to apply the same migration on boot:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Strategy" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "When to use" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Release-step migration" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Run ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
				" as a one-off job before rolling new instances"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dedicated migrator instance" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A single short-lived task runs migrations, then exits" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Boot-time drift check" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The kernel warns on migration drift during boot — in development this surfaces problems early" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The framework checks the model IR against the database at boot and warns when the schema has drifted, so a release that forgot its migration step fails loudly rather than silently. That drift check is a warning in production, not a hard stop — long-running environments should treat it as an incident trigger and reconcile the migration step separately." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "For non-additive schema changes, apply the release-order discipline deliberately: run backward-compatible migrations ahead of the new code, double-write during the transition window, and drop the old shape in a later release — never let scaled instances discover the incompatibility at boot." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "scaling-instances-and-shared-stores",
			children: "Scaling Instances and Shared Stores"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "stateless multi-instance by construction" }),
			": all state lives in external services, so any instance can serve any request. Distributed agility depends on three shared stores:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "State" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Store" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Why externalize" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sessions" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pluggable session store (cookie, shared broker, or database backends)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Any instance must resolve a session started on another" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cache" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Cache mounts (memory, shared broker, or key-value backends) via ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/cache.ts" })] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cache hits must be shared fleet-wide" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Files" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Storage disks (local or object-storage compatible) via ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/storage.ts" })] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Uploaded files must be reachable from every instance" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Instance memory holds nothing durable. When the orchestrator scales to zero or restarts a node, requests simply land on fresh instances that read shared state. Connect those three stores to shared infrastructure before you scale past a single instance:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Sessions to the same pluggable session store all replicas read." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The cache to a shared broker or key-value backend — a memory mount is dev-only." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The storage disk to an object-storage-compatible backend — the local disk is for development." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "health-checks-and-lifecycle",
			children: "Health Checks and Lifecycle"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }), " answers liveness and readiness probes — wire both to your orchestrator."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Liveness keeps instances alive; readiness gates traffic until the instance can accept requests after boot-time checks (engine init, provider boot) complete." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Graceful shutdown is inverted boot: providers stop, the queue drains, the engine stops, the process exits. Background flush-out is bounded so shutdown never hangs." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Queue workers and the scheduler run as separate deployment units — see ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/background-work",
					children: "Background Work"
				}),
				" for running workers and scheduled tasks at scale."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The health contract matters because orchestrators act on it: a failing readiness check stops traffic to a sick instance, a liveness failure replaces it, and graceful shutdown orders the drain so in-flight requests finish before the process exits." }),
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
			}), " — pick the preset your image will run"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/node-bun",
				children: "Node/Bun Deployment"
			}), " — the entry points and env vars a container uses"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/serverless",
				children: "Serverless Deployment"
			}), " — the alternative for elastic, function-based hosting"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}), " — harden multi-instance deployments"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work",
				children: "Background Work"
			}), " — run queue workers and the scheduler alongside the web fleet"] }),
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
