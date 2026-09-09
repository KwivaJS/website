import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/deployment/adapters.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Runtime Adapters",
	"description": "Runtime adapters package the built application into the exact shape a target expects — Node, Bun, serverless, edge, static, or single binary — without any application-code changes."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\n## What Is a Runtime Adapter? [#what-is-a-runtime-adapter]\n\nA **runtime adapter** — also called a **deploy preset** — is a build-time transformation that packages the composed server into the shape a target runtime expects. Adapting is the last step of `kwiva build` and involves no application code.\n\nEverything resolves through one pipeline:\n\n```text title=\"what-is-a-runtime-adapter.txt\"\ndefineApp kernel\n   ├─ composed web-standard handler\n   ├─ server build (framework-owned engine)\n   └─ preset output (.output/)  → node · bun · serverless · edge · static · binary\n```\n\nThe application never changes between targets. Adapters are a property of the build, not of the code: `src/bootstrap/app.ts` composes the kernel once, and the selected adapter only decides how that kernel gets boxed, shipped, and started on a host. The same controllers, models, middleware, and pages build for a shared Node server, a serverless function platform, an edge worker, a container image, and a single binary without a single `defineX` file changing.\n\n## How Adapters Work [#how-adapters-work]\n\n`kwiva build` runs the client build and the server build, then emits `.output/` with `server/` and `public/`. The adapter decides how that output is presented to the runtime. For hosted and PaaS targets the adapter is most often selected by **auto-detection in CI** — build once and your continuous-integration runner picks the right adapter. The preset is otherwise selected in one of four ways:\n\n| Mechanism       | Where                           | Notes                                           |\n| --------------- | ------------------------------- | ----------------------------------------------- |\n| `--preset` flag | `kwiva build --preset <preset>` | Explicit, per-build                             |\n| preset env var  | Build environment               | Force a preset in CI                            |\n| `deploy.preset` | `kwiva.config.ts`               | Committed default                               |\n| Auto-detection  | CI                              | Recognized platforms are selected automatically |\n\nExplicit selection always wins over auto-detection, so a pinned `deploy.preset` in your committed config is the safest way to make a non-automatable or self-hosted target reproducible across machines.\n\n## The Adapter Matrix [#the-adapter-matrix]\n\n| Category             | Preset identifiers                                                                                                  | Use when                                                            |\n| -------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |\n| Node runtime         | `node_server`                                                                                                       | The default production preset; any host that can run Node           |\n| Node multi-core      | `node`, `node_cluster`                                                                                              | One process with cluster support across cores                       |\n| Bun runtime          | `bun-server`, `bun`                                                                                                 | The primary runtime; the path to single-binary output               |\n| Deno runtime         | `deno-server`, `deno`                                                                                               | A Deno-based host                                                   |\n| Serverless functions | `aws-lambda`, `aws-lambda-sst`                                                                                      | Function-based serverless platforms; enable streaming explicitly    |\n| Edge                 | `cloudflare-module`, `vercel-edge`, `netlify-edge`, `fastly-edge`                                                   | Edge runtimes; the edge-safe constraint set applies                 |\n| Static               | `static`                                                                                                            | Prerender everything; no server needed                              |\n| Single binary        | `standalone`                                                                                                        | `kwiva build --binary` — one executable, zero external dependencies |\n| Hosted / PaaS        | `cleavr`, `digitalocean`, `render-com`, `railway`, `heroku` via the Node preset, `zephyr`, `iis`, `azure-functions` | Managed hosts; the `PORT` env var is respected                      |\n\nRecognized serverless and edge platforms, host their own build integrations, and are **auto-detected in CI** — including AWS Amplify, Azure Static Web Apps, Cloudflare Pages and Workers, Firebase App Hosting, Netlify, Stormkit, Vercel, and Zeabur. When a provider is auto-detected, nothing needs to be configured: the build output is shaped for that platform automatically.\n\n## Adapters per Scaffold Mode [#adapters-per-scaffold-mode]\n\nThe mode chosen at scaffold time picks a sensible default:\n\n| Mode                  | Default adapter                                   | What changes                                        |\n| --------------------- | ------------------------------------------------- | --------------------------------------------------- |\n| `fullstack` (default) | Node runtime (`node_server`, auto-detected in CI) | SSR + API                                           |\n| `api+spa`             | Node runtime + client build only                  | No SSR renderer; SPA served                         |\n| `static`              | `static`                                          | Prerender; no server needed                         |\n| `standalone`          | `bun-server` + compile                            | Single-file, zero-dependency artifact               |\n| `edge`                | Edge worker adapter                               | Edge-safe constraint set is enforced and documented |\n\n## Choosing an Adapter [#choosing-an-adapter]\n\nThe adapter decision flow:\n\n```text title=\"choosing-an-adapter.txt\"\nIs SSR/edge required?\n ├─ no → static mode\n ├─ yes → is the platform auto-detected in CI?\n │    ├─ no → set the preset env var or kwiva.config.ts > deploy.preset\n │    └─ yes → nothing to do\n └─ special cases?\n      - passthrough caching    → route rule swr\n      - per-page static        → route rule static\n      - websockets on edge     → durable storage + channels pattern\n      - single binary internal → standalone (kwiva build --binary)\n```\n\nSpecial cases bend the adapter choice but never the application code:\n\n* **Passthrough caching** — a `swr` route rule on the paths you want cached, so the host serves warm copies with stale-while-revalidate semantics.\n* **Per-page static** — a `static` route rule turns selected pages into prerendered output while the rest of the app stays dynamic.\n* **WebSockets on edge** — edge workers hold no connection state, so the channels pattern over durable storage carries stateful connections.\n* **A single binary for internal tooling** — `standalone` mode compiles the entire fullstack app into one executable for lean self-hosting.\n\n## Zero-Code-Change Swapping [#zero-code-change-swapping]\n\nBecause the application is written against Web Standards and imports only `@kwiva/*`, swapping adapters is a rebuild, not a refactor:\n\n```bash title=\"terminal\"\nkwiva build --preset node_server\nkwiva preview               # run it locally\n\nkwiva build --preset static # or go fully static\nkwiva preview\n```\n\nValidate locally with `kwiva preview`, or smoke-test a specific preset by building and running the generated entry directly:\n\n```bash title=\"terminal\"\nkwiva build --preset node_server\nnode .output/server/index.mjs\n```\n\nThe request pipeline is identical on every adapter — only the carrier differs. This is the same guarantee that makes `kwiva dev` and production behave alike: `kwiva dev` runs the same composed handler in-process, and production builds target the adapter; the pipeline between dev and prod is unchanged.\n\n## Edge-Safe Constraint Set [#edge-safe-constraint-set]\n\nEdge presets smooth most runtime differences for you, but Kwiva documents a small writeable surface to keep in mind when targeting an edge adapter:\n\n* Loaders and handlers must be statically importable — no runtime dynamic imports of platform internals.\n* No long-lived in-memory state across requests — use the `cache` and `storage` APIs.\n* No raw sockets — use the channels and WebSocket APIs.\n* Database access goes through the model layer over an env-defined connector.\n* Avoid reading `process.env` beyond startup — inject via typed env and config.\n* Do not use exclusive runtime-only APIs — prefer platform Web APIs.\n\n## Provider-Specific Gotchas [#provider-specific-gotchas]\n\nA few behaviors differ per platform and are worth knowing before you commit to one:\n\n| Platform           | Gotcha                                                                                                       |\n| ------------------ | ------------------------------------------------------------------------------------------------------------ |\n| Cloudflare Workers | Set a compatibility date; stateful WebSockets use durable storage plus the channels pattern                  |\n| Vercel             | Streaming requires a streaming function runtime; edge presets use the edge function output                   |\n| Netlify            | Headers and redirects go through the platform's function config; edge functions are distinct from serverless |\n| AWS Lambda         | Response streaming must be enabled explicitly; multi-core is not automatic — scale out by instance count     |\n| Bun binary         | Requires an AVX2-capable CPU; use syntax-only minification so function names survive for tracing             |\n\n## Testing Deploys Locally [#testing-deploys-locally]\n\nTwo workflows cover local validation:\n\n* `kwiva preview` — runs the built preset locally, exactly as a host would. The fastest feedback loop before pushing.\n* `kwiva build --preset <preset>` then `node .output/server/index.mjs` — a raw smoke test of a specific preset's generated entry.\n\nThe build also produces a deployment manifest with a printable artifact digest, so `kwiva deploy` can report the exact artifact and command it pushed. Rolling back is a pointer swap: keep N builds, and managed hosts roll back by environment while self-hosters keep a tar of `.output/`.\n\n## What's Next [#whats-next]\n\n* [Node/Bun Deployment](/docs/deployment/node-bun) — run the Node, Bun, and binary presets\n* [Serverless Deployment](/docs/deployment/serverless) — function-based targets and constraints\n* [Container Deployment](/docs/deployment/containers) — image-based hosting at scale\n* [Production Checklist](/docs/deployment/production-checklist) — pre-deploy and operational checks\n* [First Deployment](/docs/getting-started/first-deployment) — see the loop on a fresh project\n";
var structuredData = {
	"contents": [
		{
			"heading": "what-is-a-runtime-adapter",
			"content": "A **runtime adapter** — also called a **deploy preset** — is a build-time transformation that packages the composed server into the shape a target runtime expects. Adapting is the last step of `kwiva build` and involves no application code."
		},
		{
			"heading": "what-is-a-runtime-adapter",
			"content": "Everything resolves through one pipeline:"
		},
		{
			"heading": "what-is-a-runtime-adapter",
			"content": "The application never changes between targets. Adapters are a property of the build, not of the code: `src/bootstrap/app.ts` composes the kernel once, and the selected adapter only decides how that kernel gets boxed, shipped, and started on a host. The same controllers, models, middleware, and pages build for a shared Node server, a serverless function platform, an edge worker, a container image, and a single binary without a single `defineX` file changing."
		},
		{
			"heading": "how-adapters-work",
			"content": "`kwiva build` runs the client build and the server build, then emits `.output/` with `server/` and `public/`. The adapter decides how that output is presented to the runtime. For hosted and PaaS targets the adapter is most often selected by **auto-detection in CI** — build once and your continuous-integration runner picks the right adapter. The preset is otherwise selected in one of four ways:"
		},
		{
			"heading": "how-adapters-work",
			"content": "Mechanism"
		},
		{
			"heading": "how-adapters-work",
			"content": "Where"
		},
		{
			"heading": "how-adapters-work",
			"content": "Notes"
		},
		{
			"heading": "how-adapters-work",
			"content": "`--preset` flag"
		},
		{
			"heading": "how-adapters-work",
			"content": "`kwiva build --preset <preset>`"
		},
		{
			"heading": "how-adapters-work",
			"content": "Explicit, per-build"
		},
		{
			"heading": "how-adapters-work",
			"content": "preset env var"
		},
		{
			"heading": "how-adapters-work",
			"content": "Build environment"
		},
		{
			"heading": "how-adapters-work",
			"content": "Force a preset in CI"
		},
		{
			"heading": "how-adapters-work",
			"content": "`deploy.preset`"
		},
		{
			"heading": "how-adapters-work",
			"content": "`kwiva.config.ts`"
		},
		{
			"heading": "how-adapters-work",
			"content": "Committed default"
		},
		{
			"heading": "how-adapters-work",
			"content": "Auto-detection"
		},
		{
			"heading": "how-adapters-work",
			"content": "CI"
		},
		{
			"heading": "how-adapters-work",
			"content": "Recognized platforms are selected automatically"
		},
		{
			"heading": "how-adapters-work",
			"content": "Explicit selection always wins over auto-detection, so a pinned `deploy.preset` in your committed config is the safest way to make a non-automatable or self-hosted target reproducible across machines."
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Category"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Preset identifiers"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Use when"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Node runtime"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "`node_server`"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "The default production preset; any host that can run Node"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Node multi-core"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "`node`, `node_cluster`"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "One process with cluster support across cores"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Bun runtime"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "`bun-server`, `bun`"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "The primary runtime; the path to single-binary output"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Deno runtime"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "`deno-server`, `deno`"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "A Deno-based host"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Serverless functions"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "`aws-lambda`, `aws-lambda-sst`"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Function-based serverless platforms; enable streaming explicitly"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Edge"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "`cloudflare-module`, `vercel-edge`, `netlify-edge`, `fastly-edge`"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Edge runtimes; the edge-safe constraint set applies"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Static"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "`static`"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Prerender everything; no server needed"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Single binary"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "`standalone`"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "`kwiva build --binary` — one executable, zero external dependencies"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Hosted / PaaS"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "`cleavr`, `digitalocean`, `render-com`, `railway`, `heroku` via the Node preset, `zephyr`, `iis`, `azure-functions`"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Managed hosts; the `PORT` env var is respected"
		},
		{
			"heading": "the-adapter-matrix",
			"content": "Recognized serverless and edge platforms, host their own build integrations, and are **auto-detected in CI** — including AWS Amplify, Azure Static Web Apps, Cloudflare Pages and Workers, Firebase App Hosting, Netlify, Stormkit, Vercel, and Zeabur. When a provider is auto-detected, nothing needs to be configured: the build output is shaped for that platform automatically."
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "The mode chosen at scaffold time picks a sensible default:"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "Mode"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "Default adapter"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "What changes"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "`fullstack` (default)"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "Node runtime (`node_server`, auto-detected in CI)"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "SSR + API"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "`api+spa`"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "Node runtime + client build only"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "No SSR renderer; SPA served"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "`static`"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "`static`"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "Prerender; no server needed"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "`standalone`"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "`bun-server` + compile"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "Single-file, zero-dependency artifact"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "`edge`"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "Edge worker adapter"
		},
		{
			"heading": "adapters-per-scaffold-mode",
			"content": "Edge-safe constraint set is enforced and documented"
		},
		{
			"heading": "choosing-an-adapter",
			"content": "The adapter decision flow:"
		},
		{
			"heading": "choosing-an-adapter",
			"content": "Special cases bend the adapter choice but never the application code:"
		},
		{
			"heading": "choosing-an-adapter",
			"content": "**Passthrough caching** — a `swr` route rule on the paths you want cached, so the host serves warm copies with stale-while-revalidate semantics."
		},
		{
			"heading": "choosing-an-adapter",
			"content": "**Per-page static** — a `static` route rule turns selected pages into prerendered output while the rest of the app stays dynamic."
		},
		{
			"heading": "choosing-an-adapter",
			"content": "**WebSockets on edge** — edge workers hold no connection state, so the channels pattern over durable storage carries stateful connections."
		},
		{
			"heading": "choosing-an-adapter",
			"content": "**A single binary for internal tooling** — `standalone` mode compiles the entire fullstack app into one executable for lean self-hosting."
		},
		{
			"heading": "zero-code-change-swapping",
			"content": "Because the application is written against Web Standards and imports only `@kwiva/*`, swapping adapters is a rebuild, not a refactor:"
		},
		{
			"heading": "zero-code-change-swapping",
			"content": "Validate locally with `kwiva preview`, or smoke-test a specific preset by building and running the generated entry directly:"
		},
		{
			"heading": "zero-code-change-swapping",
			"content": "The request pipeline is identical on every adapter — only the carrier differs. This is the same guarantee that makes `kwiva dev` and production behave alike: `kwiva dev` runs the same composed handler in-process, and production builds target the adapter; the pipeline between dev and prod is unchanged."
		},
		{
			"heading": "edge-safe-constraint-set",
			"content": "Edge presets smooth most runtime differences for you, but Kwiva documents a small writeable surface to keep in mind when targeting an edge adapter:"
		},
		{
			"heading": "edge-safe-constraint-set",
			"content": "Loaders and handlers must be statically importable — no runtime dynamic imports of platform internals."
		},
		{
			"heading": "edge-safe-constraint-set",
			"content": "No long-lived in-memory state across requests — use the `cache` and `storage` APIs."
		},
		{
			"heading": "edge-safe-constraint-set",
			"content": "No raw sockets — use the channels and WebSocket APIs."
		},
		{
			"heading": "edge-safe-constraint-set",
			"content": "Database access goes through the model layer over an env-defined connector."
		},
		{
			"heading": "edge-safe-constraint-set",
			"content": "Avoid reading `process.env` beyond startup — inject via typed env and config."
		},
		{
			"heading": "edge-safe-constraint-set",
			"content": "Do not use exclusive runtime-only APIs — prefer platform Web APIs."
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "A few behaviors differ per platform and are worth knowing before you commit to one:"
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "Platform"
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "Gotcha"
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "Cloudflare Workers"
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "Set a compatibility date; stateful WebSockets use durable storage plus the channels pattern"
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "Vercel"
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "Streaming requires a streaming function runtime; edge presets use the edge function output"
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "Netlify"
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "Headers and redirects go through the platform's function config; edge functions are distinct from serverless"
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "AWS Lambda"
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "Response streaming must be enabled explicitly; multi-core is not automatic — scale out by instance count"
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "Bun binary"
		},
		{
			"heading": "provider-specific-gotchas",
			"content": "Requires an AVX2-capable CPU; use syntax-only minification so function names survive for tracing"
		},
		{
			"heading": "testing-deploys-locally",
			"content": "Two workflows cover local validation:"
		},
		{
			"heading": "testing-deploys-locally",
			"content": "`kwiva preview` — runs the built preset locally, exactly as a host would. The fastest feedback loop before pushing."
		},
		{
			"heading": "testing-deploys-locally",
			"content": "`kwiva build --preset <preset>` then `node .output/server/index.mjs` — a raw smoke test of a specific preset's generated entry."
		},
		{
			"heading": "testing-deploys-locally",
			"content": "The build also produces a deployment manifest with a printable artifact digest, so `kwiva deploy` can report the exact artifact and command it pushed. Rolling back is a pointer swap: keep N builds, and managed hosts roll back by environment while self-hosters keep a tar of `.output/`."
		},
		{
			"heading": "whats-next",
			"content": "Node/Bun Deployment — run the Node, Bun, and binary presets"
		},
		{
			"heading": "whats-next",
			"content": "Serverless Deployment — function-based targets and constraints"
		},
		{
			"heading": "whats-next",
			"content": "Container Deployment — image-based hosting at scale"
		},
		{
			"heading": "whats-next",
			"content": "Production Checklist — pre-deploy and operational checks"
		},
		{
			"heading": "whats-next",
			"content": "First Deployment — see the loop on a fresh project"
		}
	],
	"headings": [
		{
			"id": "what-is-a-runtime-adapter",
			"content": "What Is a Runtime Adapter?"
		},
		{
			"id": "how-adapters-work",
			"content": "How Adapters Work"
		},
		{
			"id": "the-adapter-matrix",
			"content": "The Adapter Matrix"
		},
		{
			"id": "adapters-per-scaffold-mode",
			"content": "Adapters per Scaffold Mode"
		},
		{
			"id": "choosing-an-adapter",
			"content": "Choosing an Adapter"
		},
		{
			"id": "zero-code-change-swapping",
			"content": "Zero-Code-Change Swapping"
		},
		{
			"id": "edge-safe-constraint-set",
			"content": "Edge-Safe Constraint Set"
		},
		{
			"id": "provider-specific-gotchas",
			"content": "Provider-Specific Gotchas"
		},
		{
			"id": "testing-deploys-locally",
			"content": "Testing Deploys Locally"
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
		url: "#what-is-a-runtime-adapter",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Is a Runtime Adapter?" })
	},
	{
		depth: 2,
		url: "#how-adapters-work",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How Adapters Work" })
	},
	{
		depth: 2,
		url: "#the-adapter-matrix",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Adapter Matrix" })
	},
	{
		depth: 2,
		url: "#adapters-per-scaffold-mode",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Adapters per Scaffold Mode" })
	},
	{
		depth: 2,
		url: "#choosing-an-adapter",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Choosing an Adapter" })
	},
	{
		depth: 2,
		url: "#zero-code-change-swapping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Zero-Code-Change Swapping" })
	},
	{
		depth: 2,
		url: "#edge-safe-constraint-set",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Edge-Safe Constraint Set" })
	},
	{
		depth: 2,
		url: "#provider-specific-gotchas",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Provider-Specific Gotchas" })
	},
	{
		depth: 2,
		url: "#testing-deploys-locally",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Testing Deploys Locally" })
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
			id: "what-is-a-runtime-adapter",
			children: "What Is a Runtime Adapter?"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "runtime adapter" }),
			" — also called a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "deploy preset" }),
			" — is a build-time transformation that packages the composed server into the shape a target runtime expects. Adapting is the last step of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }),
			" and involves no application code."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Everything resolves through one pipeline:" }),
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
			title: "what-is-a-runtime-adapter.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineApp kernel" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   ├─ composed web-standard handler" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   ├─ server build (framework-owned engine)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   └─ preset output (.output/)  → node · bun · serverless · edge · static · binary" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The application never changes between targets. Adapters are a property of the build, not of the code: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/bootstrap/app.ts" }),
			" composes the kernel once, and the selected adapter only decides how that kernel gets boxed, shipped, and started on a host. The same controllers, models, middleware, and pages build for a shared Node server, a serverless function platform, an edge worker, a container image, and a single binary without a single ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" file changing."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-adapters-work",
			children: "How Adapters Work"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }),
			" runs the client build and the server build, then emits ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			" with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "server/" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "public/" }),
			". The adapter decides how that output is presented to the runtime. For hosted and PaaS targets the adapter is most often selected by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "auto-detection in CI" }),
			" — build once and your continuous-integration runner picks the right adapter. The preset is otherwise selected in one of four ways:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mechanism" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Where" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Notes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--preset" }), " flag"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --preset <preset>" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Explicit, per-build" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "preset env var" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build environment" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Force a preset in CI" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deploy.preset" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Committed default" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Auto-detection" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "CI" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Recognized platforms are selected automatically" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Explicit selection always wins over auto-detection, so a pinned ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deploy.preset" }),
			" in your committed config is the safest way to make a non-automatable or self-hosted target reproducible across machines."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-adapter-matrix",
			children: "The Adapter Matrix"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Category" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Preset identifiers" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Use when" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Node runtime" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The default production preset; any host that can run Node" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Node multi-core" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_cluster" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "One process with cluster support across cores" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Bun runtime" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun-server" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The primary runtime; the path to single-binary output" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Deno runtime" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deno-server" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deno" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A Deno-based host" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Serverless functions" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "aws-lambda" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "aws-lambda-sst" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Function-based serverless platforms; enable streaming explicitly" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cloudflare-module" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "vercel-edge" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "netlify-edge" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fastly-edge" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge runtimes; the edge-safe constraint set applies" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Static" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Prerender everything; no server needed" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Single binary" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --binary" }), " — one executable, zero external dependencies"] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Hosted / PaaS" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cleavr" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "digitalocean" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "render-com" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "railway" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "heroku" }),
					" via the Node preset, ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "zephyr" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "iis" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "azure-functions" })
				] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Managed hosts; the ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PORT" }),
					" env var is respected"
				] })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Recognized serverless and edge platforms, host their own build integrations, and are ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "auto-detected in CI" }),
			" — including AWS Amplify, Azure Static Web Apps, Cloudflare Pages and Workers, Firebase App Hosting, Netlify, Stormkit, Vercel, and Zeabur. When a provider is auto-detected, nothing needs to be configured: the build output is shaped for that platform automatically."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "adapters-per-scaffold-mode",
			children: "Adapters per Scaffold Mode"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The mode chosen at scaffold time picks a sensible default:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Default adapter" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What changes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }), " (default)"] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Node runtime (",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }),
					", auto-detected in CI)"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR + API" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Node runtime + client build only" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "No SSR renderer; SPA served" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Prerender; no server needed" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun-server" }), " + compile"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Single-file, zero-dependency artifact" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge worker adapter" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge-safe constraint set is enforced and documented" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "choosing-an-adapter",
			children: "Choosing an Adapter"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The adapter decision flow:" }),
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
			title: "choosing-an-adapter.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Is SSR/edge required?" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ no → static mode" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ yes → is the platform auto-detected in CI?" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " │    ├─ no → set the preset env var or kwiva.config.ts > deploy.preset" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " │    └─ yes → nothing to do" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " └─ special cases?" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "      - passthrough caching    → route rule swr" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "      - per-page static        → route rule static" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "      - websockets on edge     → durable storage + channels pattern" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "      - single binary internal → standalone (kwiva build --binary)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Special cases bend the adapter choice but never the application code:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Passthrough caching" }),
				" — a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr" }),
				" route rule on the paths you want cached, so the host serves warm copies with stale-while-revalidate semantics."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Per-page static" }),
				" — a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
				" route rule turns selected pages into prerendered output while the rest of the app stays dynamic."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "WebSockets on edge" }), " — edge workers hold no connection state, so the channels pattern over durable storage carries stateful connections."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "A single binary for internal tooling" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }),
				" mode compiles the entire fullstack app into one executable for lean self-hosting."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "zero-code-change-swapping",
			children: "Zero-Code-Change Swapping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the application is written against Web Standards and imports only ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
			", swapping adapters is a rebuild, not a refactor:"
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
							children: " preview"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "               # run it locally"
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
							children: " static"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: " # or go fully static"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "kwiva"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " preview"
					})]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Validate locally with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }),
			", or smoke-test a specific preset by building and running the generated entry directly:"
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
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The request pipeline is identical on every adapter — only the carrier differs. This is the same guarantee that makes ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" and production behave alike: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" runs the same composed handler in-process, and production builds target the adapter; the pipeline between dev and prod is unchanged."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "edge-safe-constraint-set",
			children: "Edge-Safe Constraint Set"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Edge presets smooth most runtime differences for you, but Kwiva documents a small writeable surface to keep in mind when targeting an edge adapter:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Loaders and handlers must be statically importable — no runtime dynamic imports of platform internals." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"No long-lived in-memory state across requests — use the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage" }),
				" APIs."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "No raw sockets — use the channels and WebSocket APIs." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Database access goes through the model layer over an env-defined connector." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Avoid reading ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "process.env" }),
				" beyond startup — inject via typed env and config."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Do not use exclusive runtime-only APIs — prefer platform Web APIs." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "provider-specific-gotchas",
			children: "Provider-Specific Gotchas"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A few behaviors differ per platform and are worth knowing before you commit to one:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Platform" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Gotcha" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cloudflare Workers" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Set a compatibility date; stateful WebSockets use durable storage plus the channels pattern" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Vercel" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Streaming requires a streaming function runtime; edge presets use the edge function output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Netlify" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Headers and redirects go through the platform's function config; edge functions are distinct from serverless" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "AWS Lambda" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Response streaming must be enabled explicitly; multi-core is not automatic — scale out by instance count" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Bun binary" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Requires an AVX2-capable CPU; use syntax-only minification so function names survive for tracing" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "testing-deploys-locally",
			children: "Testing Deploys Locally"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two workflows cover local validation:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }), " — runs the built preset locally, exactly as a host would. The fastest feedback loop before pushing."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --preset <preset>" }),
				" then ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node .output/server/index.mjs" }),
				" — a raw smoke test of a specific preset's generated entry."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The build also produces a deployment manifest with a printable artifact digest, so ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy" }),
			" can report the exact artifact and command it pushed. Rolling back is a pointer swap: keep N builds, and managed hosts roll back by environment while self-hosters keep a tar of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
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
				href: "/docs/deployment/node-bun",
				children: "Node/Bun Deployment"
			}), " — run the Node, Bun, and binary presets"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/serverless",
				children: "Serverless Deployment"
			}), " — function-based targets and constraints"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/containers",
				children: "Container Deployment"
			}), " — image-based hosting at scale"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}), " — pre-deploy and operational checks"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-deployment",
				children: "First Deployment"
			}), " — see the loop on a fresh project"] }),
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
