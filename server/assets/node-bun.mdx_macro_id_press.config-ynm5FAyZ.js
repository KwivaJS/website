import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/deployment/node-bun.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Node/Bun Deployment",
	"description": "Run Kwiva on a Node or Bun runtime — build, start, configure environment variables, manage processes, and compile a single binary with kwiva build --binary."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\n## Overview [#overview]\n\nThe Node and Bun presets are the workhorses of Kwiva deployment. The Node preset ships the default production server; the Bun preset is the primary-runtime path and the foundation of single-binary output.\n\nApplication code is written against Web Standards — `Request`, `Response`, `fetch`, `WebSocket` — so the runtime differences stay inside the framework. You can build the same `.output/` for a Node host, a Bun host, or a compiled binary without changing a single `defineX` file. The request pipeline, the context, the validation stage, and the handler contract are identical across all three; only the carrier differs.\n\n## System Requirements [#system-requirements]\n\n* **Bun** is the primary runtime: native TypeScript execution in development, fast startup, and the dev server (`kwiva dev`) are all Bun-based. Bun also powers the test runner and single-binary compilation.\n* **Node** is a compatible output target: the Node presets emit portable `.mjs` output that any Node-capable host can run, with no code changes at the runtime layer.\n* **Edge** is reached through the engine presets, which keep deploy differences contained so the application sees the same framework API surface everywhere.\n\nBecause the app surface is runtime-agnostic, you can develop on Bun and deploy to Node, or compile a Bun binary for a target host, without branching your code. The compilation target is chosen at build time, never in the source.\n\n## Build for a Node or Bun Runtime [#build-for-a-node-or-bun-runtime]\n\n```bash title=\"terminal\"\nkwiva build                    # default preset for a Node runtime\nkwiva build --preset node_server\nkwiva build --preset bun-server\n```\n\nThe build emits `.output/` containing `server/` and `public/`. The `server/` entry is a portable module that any compatible runtime can boot.\n\n## Run on Node [#run-on-node]\n\n```bash title=\"terminal\"\nnode .output/server/index.mjs\n```\n\n* `node_server` is the **default production preset**.\n* The `PORT` env var is respected by hosted platforms.\n* For multi-core hosts, use the cluster presets (`node`, `node_cluster`) so one process spreads across cores.\n* The Node output is the fallback path for environments that only support Node (npm- or bundled installs on Node-only consumers), because the framework ships web-standard code behind the node preset output.\n\n## Run on Bun [#run-on-bun]\n\n```bash title=\"terminal\"\nbun .output/server/index.mjs\n```\n\nThe Bun preset uses the native Bun server with production features such as socket reuse across processes (`SO_REUSEPORT`). In development, `kwiva dev` runs the **same composed handler** in-process on the Bun dev server — no bundle step, native TypeScript execution. Only the carrier differs between dev and the Bun production preset.\n\n> \\[!NOTE]\n> The Bun runtime is where the framework's fast paths live. Because it executes TypeScript directly, development is a zero-transpile loop, and the production Bun preset reuses that native execution — which is why `kwiva dev` and a Bun-hosted production build behave identically.\n\n## The Single Binary [#the-single-binary]\n\n```bash title=\"terminal\"\nkwiva build --binary\n./server\n```\n\nThat simple workflow is one of Kwiva's most distinctive deployment paths:\n\n1. `kwiva build --binary` runs the Bun compile step against the Bun server preset.\n2. The output is a single executable with zero external dependencies.\n3. Deployment becomes copying one file onto a host and running it.\n\nThe `standalone` scaffold mode pairs with this path: a fullstack configuration compiled into a single artifact. Notes and gotchas for the binary path:\n\n* The binary requires a CPU capable of the **AVX2** instruction set.\n* Compile flags use **syntax-only minification** (not full minification) so function names survive for tracing and observability tooling. This matters when OpenTelemetry spans are enabled — stripped names would degrade the very traces you need in production.\n* When deploying to minimal images such as distroless or scratch bases, target the musl or generic flavors of the binary so it links cleanly against a bare runtime image.\n* Windows binary builds are limited — build for your target on Linux where possible.\n\n## Environment Variables [#environment-variables]\n\n| Variable                         | Purpose                                                    |\n| -------------------------------- | ---------------------------------------------------------- |\n| `KWIVA_PRESET`                   | Force a deploy preset in CI                                |\n| `KWIVA_APP_BASE_URL` / `baseURL` | Serve under a subpath                                      |\n| `PORT`                           | Port for hosted platforms                                  |\n| `KWIVA_API_SECRET`               | Runtime config override pattern for the app config channel |\n| `KWIVA_TENANT_MODE`              | App-level tenancy default                                  |\n| `KWIVA_DB_URL`                   | App-level database connection                              |\n| `KWIVA_CACHE_URL`                | App-level cache connection                                 |\n\nKwiva provides typed env access through `env(...)` validated at boot, so configuration failures are caught at startup rather than mid-request. The configuration layer (defaults → `src/config` → inline `defineX` options) always applies, with inline options winning. A variable that is missing or malformed fails the boot loudly, before the first request can be served, instead of surfacing as an opaque mid-request error.\n\n## Process Management and Scaling [#process-management-and-scaling]\n\n| Deployment         | How                                                                                                   |\n| ------------------ | ----------------------------------------------------------------------------------------------------- |\n| Single process     | Default presets                                                                                       |\n| Multi-core         | `node_cluster` preset, or socket reuse across workers on the Bun preset                               |\n| Multiple instances | Stateless app + externalized state (database, shared cache/queue, object storage) — enforced defaults |\n| Edge               | Edge worker presets with the edge-safe constraint set                                                 |\n| Binary             | `kwiva build --binary` (Bun compile)                                                                  |\n\nThe scaling model assumes every process is disposable. Under the Bun preset, socket reuse (`SO_REUSEPORT`) lets multiple workers share the same port, so an orchestrator can run several processes per node and spread connections across cores; the Node cluster presets achieve the same with in-process worker pools. When you scale past one process, durability moves out of the process: sessions resolve from a shared store, cache hits come from shared cache mounts, and uploaded files live in object storage.\n\nProduction servers are designed for orchestration: expose a health endpoint (`/healthz`) for liveness and readiness probes, respect `PORT`, and shut down gracefully. Graceful shutdown is driven by `defineApp` providers — on shutdown, providers stop, the queue drains, and the engine stops before the process exits.\n\n> \\[!TIP]\n> Treat your process as ephemeral even on a single long-lived VM. If you can `kill` the process and have the fleet recover — via an orchestrator restart, a process manager, or a health-checked supervisor — then your production setup is already prepared for the multi-instance version.\n\n## Dev/Prod Parity [#devprod-parity]\n\n`kwiva dev` runs the same composed handler in-process on the Bun dev server, executing TypeScript natively with no compile step. Production builds target an adapter. The request pipeline — context, lifecycle, validation, handlers — is identical in both; only the carrier differs.\n\nWhat behaves correctly under `kwiva dev` behaves the same under `node .output/server/index.mjs`, on a Bun runtime, or as a compiled binary. If a response header, a validation error, or a session cookie behaves one way in development, it behaves the same way in production — because the code path that produces it is the same code path.\n\n## What's Next [#whats-next]\n\n* [Runtime Adapters](/docs/deployment/adapters) — choose the right preset for a host\n* [Serverless Deployment](/docs/deployment/serverless) — compare function-based targets\n* [Container Deployment](/docs/deployment/containers) — run the same artifact in containers\n* [Production Checklist](/docs/deployment/production-checklist) — harden before shipping\n* [Observability](/docs/observability) — health endpoint, logs, and traces in production\n";
var structuredData = {
	"contents": [
		{
			"heading": "overview",
			"content": "The Node and Bun presets are the workhorses of Kwiva deployment. The Node preset ships the default production server; the Bun preset is the primary-runtime path and the foundation of single-binary output."
		},
		{
			"heading": "overview",
			"content": "Application code is written against Web Standards — `Request`, `Response`, `fetch`, `WebSocket` — so the runtime differences stay inside the framework. You can build the same `.output/` for a Node host, a Bun host, or a compiled binary without changing a single `defineX` file. The request pipeline, the context, the validation stage, and the handler contract are identical across all three; only the carrier differs."
		},
		{
			"heading": "system-requirements",
			"content": "**Bun** is the primary runtime: native TypeScript execution in development, fast startup, and the dev server (`kwiva dev`) are all Bun-based. Bun also powers the test runner and single-binary compilation."
		},
		{
			"heading": "system-requirements",
			"content": "**Node** is a compatible output target: the Node presets emit portable `.mjs` output that any Node-capable host can run, with no code changes at the runtime layer."
		},
		{
			"heading": "system-requirements",
			"content": "**Edge** is reached through the engine presets, which keep deploy differences contained so the application sees the same framework API surface everywhere."
		},
		{
			"heading": "system-requirements",
			"content": "Because the app surface is runtime-agnostic, you can develop on Bun and deploy to Node, or compile a Bun binary for a target host, without branching your code. The compilation target is chosen at build time, never in the source."
		},
		{
			"heading": "build-for-a-node-or-bun-runtime",
			"content": "The build emits `.output/` containing `server/` and `public/`. The `server/` entry is a portable module that any compatible runtime can boot."
		},
		{
			"heading": "run-on-node",
			"content": "`node_server` is the **default production preset**."
		},
		{
			"heading": "run-on-node",
			"content": "The `PORT` env var is respected by hosted platforms."
		},
		{
			"heading": "run-on-node",
			"content": "For multi-core hosts, use the cluster presets (`node`, `node_cluster`) so one process spreads across cores."
		},
		{
			"heading": "run-on-node",
			"content": "The Node output is the fallback path for environments that only support Node (npm- or bundled installs on Node-only consumers), because the framework ships web-standard code behind the node preset output."
		},
		{
			"heading": "run-on-bun",
			"content": "The Bun preset uses the native Bun server with production features such as socket reuse across processes (`SO_REUSEPORT`). In development, `kwiva dev` runs the **same composed handler** in-process on the Bun dev server — no bundle step, native TypeScript execution. Only the carrier differs between dev and the Bun production preset."
		},
		{
			"heading": "run-on-bun",
			"content": "> \\[!NOTE]\n> The Bun runtime is where the framework's fast paths live. Because it executes TypeScript directly, development is a zero-transpile loop, and the production Bun preset reuses that native execution — which is why `kwiva dev` and a Bun-hosted production build behave identically."
		},
		{
			"heading": "the-single-binary",
			"content": "That simple workflow is one of Kwiva's most distinctive deployment paths:"
		},
		{
			"heading": "the-single-binary",
			"content": "`kwiva build --binary` runs the Bun compile step against the Bun server preset."
		},
		{
			"heading": "the-single-binary",
			"content": "The output is a single executable with zero external dependencies."
		},
		{
			"heading": "the-single-binary",
			"content": "Deployment becomes copying one file onto a host and running it."
		},
		{
			"heading": "the-single-binary",
			"content": "The `standalone` scaffold mode pairs with this path: a fullstack configuration compiled into a single artifact. Notes and gotchas for the binary path:"
		},
		{
			"heading": "the-single-binary",
			"content": "The binary requires a CPU capable of the **AVX2** instruction set."
		},
		{
			"heading": "the-single-binary",
			"content": "Compile flags use **syntax-only minification** (not full minification) so function names survive for tracing and observability tooling. This matters when OpenTelemetry spans are enabled — stripped names would degrade the very traces you need in production."
		},
		{
			"heading": "the-single-binary",
			"content": "When deploying to minimal images such as distroless or scratch bases, target the musl or generic flavors of the binary so it links cleanly against a bare runtime image."
		},
		{
			"heading": "the-single-binary",
			"content": "Windows binary builds are limited — build for your target on Linux where possible."
		},
		{
			"heading": "environment-variables",
			"content": "Variable"
		},
		{
			"heading": "environment-variables",
			"content": "Purpose"
		},
		{
			"heading": "environment-variables",
			"content": "`KWIVA_PRESET`"
		},
		{
			"heading": "environment-variables",
			"content": "Force a deploy preset in CI"
		},
		{
			"heading": "environment-variables",
			"content": "`KWIVA_APP_BASE_URL` / `baseURL`"
		},
		{
			"heading": "environment-variables",
			"content": "Serve under a subpath"
		},
		{
			"heading": "environment-variables",
			"content": "`PORT`"
		},
		{
			"heading": "environment-variables",
			"content": "Port for hosted platforms"
		},
		{
			"heading": "environment-variables",
			"content": "`KWIVA_API_SECRET`"
		},
		{
			"heading": "environment-variables",
			"content": "Runtime config override pattern for the app config channel"
		},
		{
			"heading": "environment-variables",
			"content": "`KWIVA_TENANT_MODE`"
		},
		{
			"heading": "environment-variables",
			"content": "App-level tenancy default"
		},
		{
			"heading": "environment-variables",
			"content": "`KWIVA_DB_URL`"
		},
		{
			"heading": "environment-variables",
			"content": "App-level database connection"
		},
		{
			"heading": "environment-variables",
			"content": "`KWIVA_CACHE_URL`"
		},
		{
			"heading": "environment-variables",
			"content": "App-level cache connection"
		},
		{
			"heading": "environment-variables",
			"content": "Kwiva provides typed env access through `env(...)` validated at boot, so configuration failures are caught at startup rather than mid-request. The configuration layer (defaults → `src/config` → inline `defineX` options) always applies, with inline options winning. A variable that is missing or malformed fails the boot loudly, before the first request can be served, instead of surfacing as an opaque mid-request error."
		},
		{
			"heading": "process-management-and-scaling",
			"content": "Deployment"
		},
		{
			"heading": "process-management-and-scaling",
			"content": "How"
		},
		{
			"heading": "process-management-and-scaling",
			"content": "Single process"
		},
		{
			"heading": "process-management-and-scaling",
			"content": "Default presets"
		},
		{
			"heading": "process-management-and-scaling",
			"content": "Multi-core"
		},
		{
			"heading": "process-management-and-scaling",
			"content": "`node_cluster` preset, or socket reuse across workers on the Bun preset"
		},
		{
			"heading": "process-management-and-scaling",
			"content": "Multiple instances"
		},
		{
			"heading": "process-management-and-scaling",
			"content": "Stateless app + externalized state (database, shared cache/queue, object storage) — enforced defaults"
		},
		{
			"heading": "process-management-and-scaling",
			"content": "Edge"
		},
		{
			"heading": "process-management-and-scaling",
			"content": "Edge worker presets with the edge-safe constraint set"
		},
		{
			"heading": "process-management-and-scaling",
			"content": "Binary"
		},
		{
			"heading": "process-management-and-scaling",
			"content": "`kwiva build --binary` (Bun compile)"
		},
		{
			"heading": "process-management-and-scaling",
			"content": "The scaling model assumes every process is disposable. Under the Bun preset, socket reuse (`SO_REUSEPORT`) lets multiple workers share the same port, so an orchestrator can run several processes per node and spread connections across cores; the Node cluster presets achieve the same with in-process worker pools. When you scale past one process, durability moves out of the process: sessions resolve from a shared store, cache hits come from shared cache mounts, and uploaded files live in object storage."
		},
		{
			"heading": "process-management-and-scaling",
			"content": "Production servers are designed for orchestration: expose a health endpoint (`/healthz`) for liveness and readiness probes, respect `PORT`, and shut down gracefully. Graceful shutdown is driven by `defineApp` providers — on shutdown, providers stop, the queue drains, and the engine stops before the process exits."
		},
		{
			"heading": "process-management-and-scaling",
			"content": "> \\[!TIP]\n> Treat your process as ephemeral even on a single long-lived VM. If you can `kill` the process and have the fleet recover — via an orchestrator restart, a process manager, or a health-checked supervisor — then your production setup is already prepared for the multi-instance version."
		},
		{
			"heading": "devprod-parity",
			"content": "`kwiva dev` runs the same composed handler in-process on the Bun dev server, executing TypeScript natively with no compile step. Production builds target an adapter. The request pipeline — context, lifecycle, validation, handlers — is identical in both; only the carrier differs."
		},
		{
			"heading": "devprod-parity",
			"content": "What behaves correctly under `kwiva dev` behaves the same under `node .output/server/index.mjs`, on a Bun runtime, or as a compiled binary. If a response header, a validation error, or a session cookie behaves one way in development, it behaves the same way in production — because the code path that produces it is the same code path."
		},
		{
			"heading": "whats-next",
			"content": "Runtime Adapters — choose the right preset for a host"
		},
		{
			"heading": "whats-next",
			"content": "Serverless Deployment — compare function-based targets"
		},
		{
			"heading": "whats-next",
			"content": "Container Deployment — run the same artifact in containers"
		},
		{
			"heading": "whats-next",
			"content": "Production Checklist — harden before shipping"
		},
		{
			"heading": "whats-next",
			"content": "Observability — health endpoint, logs, and traces in production"
		}
	],
	"headings": [
		{
			"id": "overview",
			"content": "Overview"
		},
		{
			"id": "system-requirements",
			"content": "System Requirements"
		},
		{
			"id": "build-for-a-node-or-bun-runtime",
			"content": "Build for a Node or Bun Runtime"
		},
		{
			"id": "run-on-node",
			"content": "Run on Node"
		},
		{
			"id": "run-on-bun",
			"content": "Run on Bun"
		},
		{
			"id": "the-single-binary",
			"content": "The Single Binary"
		},
		{
			"id": "environment-variables",
			"content": "Environment Variables"
		},
		{
			"id": "process-management-and-scaling",
			"content": "Process Management and Scaling"
		},
		{
			"id": "devprod-parity",
			"content": "Dev/Prod Parity"
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
		url: "#system-requirements",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "System Requirements" })
	},
	{
		depth: 2,
		url: "#build-for-a-node-or-bun-runtime",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Build for a Node or Bun Runtime" })
	},
	{
		depth: 2,
		url: "#run-on-node",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Run on Node" })
	},
	{
		depth: 2,
		url: "#run-on-bun",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Run on Bun" })
	},
	{
		depth: 2,
		url: "#the-single-binary",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Single Binary" })
	},
	{
		depth: 2,
		url: "#environment-variables",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Environment Variables" })
	},
	{
		depth: 2,
		url: "#process-management-and-scaling",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Process Management and Scaling" })
	},
	{
		depth: 2,
		url: "#devprod-parity",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Dev/Prod Parity" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "overview",
			children: "Overview"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The Node and Bun presets are the workhorses of Kwiva deployment. The Node preset ships the default production server; the Bun preset is the primary-runtime path and the foundation of single-binary output." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Application code is written against Web Standards — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Request" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Response" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fetch" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "WebSocket" }),
			" — so the runtime differences stay inside the framework. You can build the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			" for a Node host, a Bun host, or a compiled binary without changing a single ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" file. The request pipeline, the context, the validation stage, and the handler contract are identical across all three; only the carrier differs."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "system-requirements",
			children: "System Requirements"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Bun" }),
				" is the primary runtime: native TypeScript execution in development, fast startup, and the dev server (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
				") are all Bun-based. Bun also powers the test runner and single-binary compilation."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Node" }),
				" is a compatible output target: the Node presets emit portable ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".mjs" }),
				" output that any Node-capable host can run, with no code changes at the runtime layer."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Edge" }), " is reached through the engine presets, which keep deploy differences contained so the application sees the same framework API surface everywhere."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the app surface is runtime-agnostic, you can develop on Bun and deploy to Node, or compile a Bun binary for a target host, without branching your code. The compilation target is chosen at build time, never in the source." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "build-for-a-node-or-bun-runtime",
			children: "Build for a Node or Bun Runtime"
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
							children: " build"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                    # default preset for a Node runtime"
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
							children: " node_server"
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
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The build emits ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			" containing ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "server/" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "public/" }),
			". The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "server/" }),
			" entry is a portable module that any compatible runtime can boot."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "run-on-node",
			children: "Run on Node"
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
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					},
					children: "node"
				}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					},
					children: " .output/server/index.mjs"
				})]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }),
				" is the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "default production preset" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PORT" }),
				" env var is respected by hosted platforms."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"For multi-core hosts, use the cluster presets (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_cluster" }),
				") so one process spreads across cores."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The Node output is the fallback path for environments that only support Node (npm- or bundled installs on Node-only consumers), because the framework ships web-standard code behind the node preset output." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "run-on-bun",
			children: "Run on Bun"
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
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					},
					children: "bun"
				}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					},
					children: " .output/server/index.mjs"
				})]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The Bun preset uses the native Bun server with production features such as socket reuse across processes (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "SO_REUSEPORT" }),
			"). In development, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" runs the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "same composed handler" }),
			" in-process on the Bun dev server — no bundle step, native TypeScript execution. Only the carrier differs between dev and the Bun production preset."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nThe Bun runtime is where the framework's fast paths live. Because it executes TypeScript directly, development is a zero-transpile loop, and the production Bun preset reuses that native execution — which is why ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
				" and a Bun-hosted production build behave identically."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-single-binary",
			children: "The Single Binary"
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
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "./server"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "That simple workflow is one of Kwiva's most distinctive deployment paths:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --binary" }), " runs the Bun compile step against the Bun server preset."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The output is a single executable with zero external dependencies." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Deployment becomes copying one file onto a host and running it." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }),
			" scaffold mode pairs with this path: a fullstack configuration compiled into a single artifact. Notes and gotchas for the binary path:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The binary requires a CPU capable of the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "AVX2" }),
				" instruction set."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Compile flags use ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "syntax-only minification" }),
				" (not full minification) so function names survive for tracing and observability tooling. This matters when OpenTelemetry spans are enabled — stripped names would degrade the very traces you need in production."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "When deploying to minimal images such as distroless or scratch bases, target the musl or generic flavors of the binary so it links cleanly against a bare runtime image." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Windows binary builds are limited — build for your target on Linux where possible." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "environment-variables",
			children: "Environment Variables"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Variable" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_PRESET" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Force a deploy preset in CI" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_APP_BASE_URL" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "baseURL" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Serve under a subpath" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PORT" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Port for hosted platforms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_API_SECRET" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Runtime config override pattern for the app config channel" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_TENANT_MODE" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "App-level tenancy default" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_DB_URL" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "App-level database connection" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_CACHE_URL" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "App-level cache connection" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva provides typed env access through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env(...)" }),
			" validated at boot, so configuration failures are caught at startup rather than mid-request. The configuration layer (defaults → ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config" }),
			" → inline ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" options) always applies, with inline options winning. A variable that is missing or malformed fails the boot loudly, before the first request can be served, instead of surfacing as an opaque mid-request error."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "process-management-and-scaling",
			children: "Process Management and Scaling"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Deployment" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "How" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Single process" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Default presets" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Multi-core" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_cluster" }), " preset, or socket reuse across workers on the Bun preset"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Multiple instances" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Stateless app + externalized state (database, shared cache/queue, object storage) — enforced defaults" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge worker presets with the edge-safe constraint set" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Binary" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --binary" }), " (Bun compile)"] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The scaling model assumes every process is disposable. Under the Bun preset, socket reuse (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "SO_REUSEPORT" }),
			") lets multiple workers share the same port, so an orchestrator can run several processes per node and spread connections across cores; the Node cluster presets achieve the same with in-process worker pools. When you scale past one process, durability moves out of the process: sessions resolve from a shared store, cache hits come from shared cache mounts, and uploaded files live in object storage."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Production servers are designed for orchestration: expose a health endpoint (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }),
			") for liveness and readiness probes, respect ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PORT" }),
			", and shut down gracefully. Graceful shutdown is driven by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
			" providers — on shutdown, providers stop, the queue drains, and the engine stops before the process exits."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!TIP]\nTreat your process as ephemeral even on a single long-lived VM. If you can ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kill" }),
				" the process and have the fleet recover — via an orchestrator restart, a process manager, or a health-checked supervisor — then your production setup is already prepared for the multi-instance version."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "devprod-parity",
			children: "Dev/Prod Parity"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }), " runs the same composed handler in-process on the Bun dev server, executing TypeScript natively with no compile step. Production builds target an adapter. The request pipeline — context, lifecycle, validation, handlers — is identical in both; only the carrier differs."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"What behaves correctly under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" behaves the same under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node .output/server/index.mjs" }),
			", on a Bun runtime, or as a compiled binary. If a response header, a validation error, or a session cookie behaves one way in development, it behaves the same way in production — because the code path that produces it is the same code path."
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
				href: "/docs/deployment/adapters",
				children: "Runtime Adapters"
			}), " — choose the right preset for a host"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/serverless",
				children: "Serverless Deployment"
			}), " — compare function-based targets"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/containers",
				children: "Container Deployment"
			}), " — run the same artifact in containers"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}), " — harden before shipping"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}), " — health endpoint, logs, and traces in production"] }),
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
