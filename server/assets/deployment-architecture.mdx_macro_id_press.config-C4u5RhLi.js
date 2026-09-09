import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/architecture/deployment-architecture.mdx?macro_id=press.config.tsx%23architecture
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Deployment Architecture",
	"description": "One codebase, many targets — mode presets, deploy presets, the edge-safe constraint set, and the adapter decision flow."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva's deployment philosophy is simple: &#x2A;*deploying is a build-time choice, never a code change.** The application is written runtime-agnostic against web-standard `Request`/`Response`; the build produces an artifact for the target you select. This page explains the modes, presets, and constraints that make \"one codebase, many targets\" real.\n\n## How Deployment Works [#how-deployment-works]\n\n1. `kwiva build` runs the client build (with minification) plus the server build, configured by the framework core.\n2. The build emits an output directory (`server/` + `public/`) for the selected **preset**.\n3. The preset is selected by a deployment preset env var, a `--preset` flag, `kwiva.config.ts > deploy.preset`, or CI auto-detection.\n4. `kwiva deploy` is a thin wrapper that runs the provider's deploy path.\n\nWhatever the preset, the application sees the same framework API surface — deploy differences stay in the engine.\n\n## Mode Presets [#mode-presets]\n\nModes are chosen at scaffold time (`kwiva new --mode=...`) and change what the build produces:\n\n| Mode                  | Default preset                      | What changes                             |\n| --------------------- | ----------------------------------- | ---------------------------------------- |\n| `fullstack` (default) | server preset (auto-detected in CI) | SSR + API                                |\n| `api+spa`             | server preset + client build only   | no SSR renderer; SPA served              |\n| `static`              | static                              | everything prerendered; no server needed |\n| `standalone`          | Bun server + single-binary compile  | one file, zero-dependency artifact       |\n| `edge`                | worker preset (recommended default) | edge-safe constraint set enforced        |\n\n## Target Presets [#target-presets]\n\nThe portability layer provides two families of presets.\n\n### Zero-config, auto-detected providers [#zero-config-auto-detected-providers]\n\nThese are detected in CI with no configuration:\n\n| Target                     | What it produces           |\n| -------------------------- | -------------------------- |\n| AWS Amplify                | server output + static     |\n| Azure Static Web Apps      | API runtime + static       |\n| Cloudflare Pages / Workers | worker script(s)           |\n| Firebase App Hosting       | functions                  |\n| Netlify                    | functions + edge functions |\n| Vercel                     | serverless functions       |\n| Stormkit                   | server output              |\n| Zeabur                     | server output              |\n\n### Explicit presets [#explicit-presets]\n\n| Preset class                  | Notes                                                     |\n| ----------------------------- | --------------------------------------------------------- |\n| Node server                   | default production output; cluster variant for multi-core |\n| Bun server                    | ideal single-binary path                                  |\n| Deno server                   | Deno output                                               |\n| Cloudflare module             | worker (module format)                                    |\n| Vercel edge / Netlify edge    | edge functions                                            |\n| AWS Lambda                    | response streaming opt-in                                 |\n| Fastly Compute                | edge platform                                             |\n| Static                        | prerender everything                                      |\n| Service worker                | offline/PWA-style output                                  |\n| PaaS/hosted (via Node preset) | env `PORT` respected                                      |\n\nSelf-host any preset by running the generated entry directly — a Node artifact, a Bun artifact, or a compiled single binary.\n\n## The Edge-Safe Constraint Set [#the-edge-safe-constraint-set]\n\nFor edge presets, Kwiva documents a small writeable surface that keeps your app portable:\n\n* Loaders and handlers must be statically importable (no dynamic import of `node:*` at runtime).\n* No long-lived in-memory state across requests — use storage/cache APIs.\n* No raw sockets or `net` — use channels/WebSockets through the framework.\n* Database access goes through the model layer over an env-defined connector.\n* Avoid `process.env` reads beyond startup — inject via typed env/config.\n* Don't rely on runtime-exclusive APIs — use platform web APIs.\n\n## Environment & Metadata [#environment--metadata]\n\nThe build emits a manifest (deployment ID injectable). Key environment inputs:\n\n| Variable           | Purpose                                      |\n| ------------------ | -------------------------------------------- |\n| preset env var     | force a preset in CI                         |\n| base URL env       | subpath serving                              |\n| `PORT`             | PaaS port (Railway, Render, DigitalOcean, …) |\n| provider tokens    | for the deploy CLI                           |\n| `KWIVA_*` defaults | app-level config overrides                   |\n\n## Testing Deploys Locally [#testing-deploys-locally]\n\n* `kwiva preview` runs the built preset locally.\n* `kwiva build --preset <x>` then run the emitted entry — a raw smoke test per preset.\n\n## Adapter Decision Flow [#adapter-decision-flow]\n\n```plaintext title=\"adapter-decision-flow.txt\"\nIs SSR/edge required?\n ├─ no → static mode\n ├─ yes → is the provider auto-detected in CI?\n │    ├─ no → set the preset env/config\n │    └─ yes → nothing to do\n └─ special cases?\n      - passthrough caching    → route rule swr\n      - per-page static        → route rule static\n      - websockets on edge     → edge durable objects + channels pattern\n      - single binary internal → standalone (compile)\n```\n\n## What to Read Next [#what-to-read-next]\n\n* [Deployment](/docs/deployment) — Deployment overview and philosophy\n* [Runtime Adapters](/docs/deployment/adapters) — Presets and mode presets in detail\n* [Node/Bun Deployment](/docs/deployment/node-bun) — Servers and single-binary mode\n* [Serverless](/docs/deployment/serverless) — Serverless targets\n* [Production Checklist](/docs/deployment/production-checklist) — Before you ship\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva's deployment philosophy is simple: &#x2A;*deploying is a build-time choice, never a code change.** The application is written runtime-agnostic against web-standard `Request`/`Response`; the build produces an artifact for the target you select. This page explains the modes, presets, and constraints that make \"one codebase, many targets\" real."
		},
		{
			"heading": "how-deployment-works",
			"content": "`kwiva build` runs the client build (with minification) plus the server build, configured by the framework core."
		},
		{
			"heading": "how-deployment-works",
			"content": "The build emits an output directory (`server/` + `public/`) for the selected **preset**."
		},
		{
			"heading": "how-deployment-works",
			"content": "The preset is selected by a deployment preset env var, a `--preset` flag, `kwiva.config.ts > deploy.preset`, or CI auto-detection."
		},
		{
			"heading": "how-deployment-works",
			"content": "`kwiva deploy` is a thin wrapper that runs the provider's deploy path."
		},
		{
			"heading": "how-deployment-works",
			"content": "Whatever the preset, the application sees the same framework API surface — deploy differences stay in the engine."
		},
		{
			"heading": "mode-presets",
			"content": "Modes are chosen at scaffold time (`kwiva new --mode=...`) and change what the build produces:"
		},
		{
			"heading": "mode-presets",
			"content": "Mode"
		},
		{
			"heading": "mode-presets",
			"content": "Default preset"
		},
		{
			"heading": "mode-presets",
			"content": "What changes"
		},
		{
			"heading": "mode-presets",
			"content": "`fullstack` (default)"
		},
		{
			"heading": "mode-presets",
			"content": "server preset (auto-detected in CI)"
		},
		{
			"heading": "mode-presets",
			"content": "SSR + API"
		},
		{
			"heading": "mode-presets",
			"content": "`api+spa`"
		},
		{
			"heading": "mode-presets",
			"content": "server preset + client build only"
		},
		{
			"heading": "mode-presets",
			"content": "no SSR renderer; SPA served"
		},
		{
			"heading": "mode-presets",
			"content": "`static`"
		},
		{
			"heading": "mode-presets",
			"content": "static"
		},
		{
			"heading": "mode-presets",
			"content": "everything prerendered; no server needed"
		},
		{
			"heading": "mode-presets",
			"content": "`standalone`"
		},
		{
			"heading": "mode-presets",
			"content": "Bun server + single-binary compile"
		},
		{
			"heading": "mode-presets",
			"content": "one file, zero-dependency artifact"
		},
		{
			"heading": "mode-presets",
			"content": "`edge`"
		},
		{
			"heading": "mode-presets",
			"content": "worker preset (recommended default)"
		},
		{
			"heading": "mode-presets",
			"content": "edge-safe constraint set enforced"
		},
		{
			"heading": "target-presets",
			"content": "The portability layer provides two families of presets."
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "These are detected in CI with no configuration:"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "Target"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "What it produces"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "AWS Amplify"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "server output + static"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "Azure Static Web Apps"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "API runtime + static"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "Cloudflare Pages / Workers"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "worker script(s)"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "Firebase App Hosting"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "functions"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "Netlify"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "functions + edge functions"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "Vercel"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "serverless functions"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "Stormkit"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "server output"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "Zeabur"
		},
		{
			"heading": "zero-config-auto-detected-providers",
			"content": "server output"
		},
		{
			"heading": "explicit-presets",
			"content": "Preset class"
		},
		{
			"heading": "explicit-presets",
			"content": "Notes"
		},
		{
			"heading": "explicit-presets",
			"content": "Node server"
		},
		{
			"heading": "explicit-presets",
			"content": "default production output; cluster variant for multi-core"
		},
		{
			"heading": "explicit-presets",
			"content": "Bun server"
		},
		{
			"heading": "explicit-presets",
			"content": "ideal single-binary path"
		},
		{
			"heading": "explicit-presets",
			"content": "Deno server"
		},
		{
			"heading": "explicit-presets",
			"content": "Deno output"
		},
		{
			"heading": "explicit-presets",
			"content": "Cloudflare module"
		},
		{
			"heading": "explicit-presets",
			"content": "worker (module format)"
		},
		{
			"heading": "explicit-presets",
			"content": "Vercel edge / Netlify edge"
		},
		{
			"heading": "explicit-presets",
			"content": "edge functions"
		},
		{
			"heading": "explicit-presets",
			"content": "AWS Lambda"
		},
		{
			"heading": "explicit-presets",
			"content": "response streaming opt-in"
		},
		{
			"heading": "explicit-presets",
			"content": "Fastly Compute"
		},
		{
			"heading": "explicit-presets",
			"content": "edge platform"
		},
		{
			"heading": "explicit-presets",
			"content": "Static"
		},
		{
			"heading": "explicit-presets",
			"content": "prerender everything"
		},
		{
			"heading": "explicit-presets",
			"content": "Service worker"
		},
		{
			"heading": "explicit-presets",
			"content": "offline/PWA-style output"
		},
		{
			"heading": "explicit-presets",
			"content": "PaaS/hosted (via Node preset)"
		},
		{
			"heading": "explicit-presets",
			"content": "env `PORT` respected"
		},
		{
			"heading": "explicit-presets",
			"content": "Self-host any preset by running the generated entry directly — a Node artifact, a Bun artifact, or a compiled single binary."
		},
		{
			"heading": "the-edge-safe-constraint-set",
			"content": "For edge presets, Kwiva documents a small writeable surface that keeps your app portable:"
		},
		{
			"heading": "the-edge-safe-constraint-set",
			"content": "Loaders and handlers must be statically importable (no dynamic import of `node:*` at runtime)."
		},
		{
			"heading": "the-edge-safe-constraint-set",
			"content": "No long-lived in-memory state across requests — use storage/cache APIs."
		},
		{
			"heading": "the-edge-safe-constraint-set",
			"content": "No raw sockets or `net` — use channels/WebSockets through the framework."
		},
		{
			"heading": "the-edge-safe-constraint-set",
			"content": "Database access goes through the model layer over an env-defined connector."
		},
		{
			"heading": "the-edge-safe-constraint-set",
			"content": "Avoid `process.env` reads beyond startup — inject via typed env/config."
		},
		{
			"heading": "the-edge-safe-constraint-set",
			"content": "Don't rely on runtime-exclusive APIs — use platform web APIs."
		},
		{
			"heading": "environment--metadata",
			"content": "The build emits a manifest (deployment ID injectable). Key environment inputs:"
		},
		{
			"heading": "environment--metadata",
			"content": "Variable"
		},
		{
			"heading": "environment--metadata",
			"content": "Purpose"
		},
		{
			"heading": "environment--metadata",
			"content": "preset env var"
		},
		{
			"heading": "environment--metadata",
			"content": "force a preset in CI"
		},
		{
			"heading": "environment--metadata",
			"content": "base URL env"
		},
		{
			"heading": "environment--metadata",
			"content": "subpath serving"
		},
		{
			"heading": "environment--metadata",
			"content": "`PORT`"
		},
		{
			"heading": "environment--metadata",
			"content": "PaaS port (Railway, Render, DigitalOcean, …)"
		},
		{
			"heading": "environment--metadata",
			"content": "provider tokens"
		},
		{
			"heading": "environment--metadata",
			"content": "for the deploy CLI"
		},
		{
			"heading": "environment--metadata",
			"content": "`KWIVA_*` defaults"
		},
		{
			"heading": "environment--metadata",
			"content": "app-level config overrides"
		},
		{
			"heading": "testing-deploys-locally",
			"content": "`kwiva preview` runs the built preset locally."
		},
		{
			"heading": "testing-deploys-locally",
			"content": "`kwiva build --preset <x>` then run the emitted entry — a raw smoke test per preset."
		},
		{
			"heading": "what-to-read-next",
			"content": "Deployment — Deployment overview and philosophy"
		},
		{
			"heading": "what-to-read-next",
			"content": "Runtime Adapters — Presets and mode presets in detail"
		},
		{
			"heading": "what-to-read-next",
			"content": "Node/Bun Deployment — Servers and single-binary mode"
		},
		{
			"heading": "what-to-read-next",
			"content": "Serverless — Serverless targets"
		},
		{
			"heading": "what-to-read-next",
			"content": "Production Checklist — Before you ship"
		}
	],
	"headings": [
		{
			"id": "how-deployment-works",
			"content": "How Deployment Works"
		},
		{
			"id": "mode-presets",
			"content": "Mode Presets"
		},
		{
			"id": "target-presets",
			"content": "Target Presets"
		},
		{
			"id": "zero-config-auto-detected-providers",
			"content": "Zero-config, auto-detected providers"
		},
		{
			"id": "explicit-presets",
			"content": "Explicit presets"
		},
		{
			"id": "the-edge-safe-constraint-set",
			"content": "The Edge-Safe Constraint Set"
		},
		{
			"id": "environment--metadata",
			"content": "Environment & Metadata"
		},
		{
			"id": "testing-deploys-locally",
			"content": "Testing Deploys Locally"
		},
		{
			"id": "adapter-decision-flow",
			"content": "Adapter Decision Flow"
		},
		{
			"id": "what-to-read-next",
			"content": "What to Read Next"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#how-deployment-works",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How Deployment Works" })
	},
	{
		depth: 2,
		url: "#mode-presets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Mode Presets" })
	},
	{
		depth: 2,
		url: "#target-presets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Target Presets" })
	},
	{
		depth: 3,
		url: "#zero-config-auto-detected-providers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Zero-config, auto-detected providers" })
	},
	{
		depth: 3,
		url: "#explicit-presets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Explicit presets" })
	},
	{
		depth: 2,
		url: "#the-edge-safe-constraint-set",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Edge-Safe Constraint Set" })
	},
	{
		depth: 2,
		url: "#environment--metadata",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Environment & Metadata" })
	},
	{
		depth: 2,
		url: "#testing-deploys-locally",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Testing Deploys Locally" })
	},
	{
		depth: 2,
		url: "#adapter-decision-flow",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Adapter Decision Flow" })
	},
	{
		depth: 2,
		url: "#what-to-read-next",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What to Read Next" })
	}
];
function _createMdxContent(props) {
	const _components = {
		a: "a",
		code: "code",
		h2: "h2",
		h3: "h3",
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
			"Kwiva's deployment philosophy is simple: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "deploying is a build-time choice, never a code change." }),
			" The application is written runtime-agnostic against web-standard ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Request" }),
			"/",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Response" }),
			"; the build produces an artifact for the target you select. This page explains the modes, presets, and constraints that make \"one codebase, many targets\" real."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-deployment-works",
			children: "How Deployment Works"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }), " runs the client build (with minification) plus the server build, configured by the framework core."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The build emits an output directory (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "server/" }),
				" + ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "public/" }),
				") for the selected ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "preset" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The preset is selected by a deployment preset env var, a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--preset" }),
				" flag, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts > deploy.preset" }),
				", or CI auto-detection."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy" }), " is a thin wrapper that runs the provider's deploy path."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Whatever the preset, the application sees the same framework API surface — deploy differences stay in the engine." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "mode-presets",
			children: "Mode Presets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Modes are chosen at scaffold time (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva new --mode=..." }),
			") and change what the build produces:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Default preset" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What changes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }), " (default)"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "server preset (auto-detected in CI)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR + API" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "server preset + client build only" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "no SSR renderer; SPA served" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "static" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "everything prerendered; no server needed" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Bun server + single-binary compile" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "one file, zero-dependency artifact" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "worker preset (recommended default)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "edge-safe constraint set enforced" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "target-presets",
			children: "Target Presets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The portability layer provides two families of presets." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "zero-config-auto-detected-providers",
			children: "Zero-config, auto-detected providers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "These are detected in CI with no configuration:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Target" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it produces" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "AWS Amplify" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "server output + static" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Azure Static Web Apps" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API runtime + static" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cloudflare Pages / Workers" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "worker script(s)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Firebase App Hosting" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "functions" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Netlify" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "functions + edge functions" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Vercel" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "serverless functions" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Stormkit" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "server output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Zeabur" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "server output" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "explicit-presets",
			children: "Explicit presets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Preset class" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Notes" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Node server" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "default production output; cluster variant for multi-core" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Bun server" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "ideal single-binary path" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Deno server" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Deno output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cloudflare module" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "worker (module format)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Vercel edge / Netlify edge" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "edge functions" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "AWS Lambda" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "response streaming opt-in" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Fastly Compute" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "edge platform" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Static" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "prerender everything" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Service worker" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "offline/PWA-style output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "PaaS/hosted (via Node preset)" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"env ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PORT" }),
				" respected"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Self-host any preset by running the generated entry directly — a Node artifact, a Bun artifact, or a compiled single binary." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-edge-safe-constraint-set",
			children: "The Edge-Safe Constraint Set"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "For edge presets, Kwiva documents a small writeable surface that keeps your app portable:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Loaders and handlers must be statically importable (no dynamic import of ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node:*" }),
				" at runtime)."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "No long-lived in-memory state across requests — use storage/cache APIs." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"No raw sockets or ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "net" }),
				" — use channels/WebSockets through the framework."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Database access goes through the model layer over an env-defined connector." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Avoid ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "process.env" }),
				" reads beyond startup — inject via typed env/config."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Don't rely on runtime-exclusive APIs — use platform web APIs." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "environment--metadata",
			children: "Environment & Metadata"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The build emits a manifest (deployment ID injectable). Key environment inputs:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Variable" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "preset env var" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "force a preset in CI" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "base URL env" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "subpath serving" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PORT" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "PaaS port (Railway, Render, DigitalOcean, …)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "provider tokens" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "for the deploy CLI" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_*" }), " defaults"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "app-level config overrides" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "testing-deploys-locally",
			children: "Testing Deploys Locally"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }), " runs the built preset locally."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --preset <x>" }), " then run the emitted entry — a raw smoke test per preset."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "adapter-decision-flow",
			children: "Adapter Decision Flow"
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
			title: "adapter-decision-flow.txt",
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
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ yes → is the provider auto-detected in CI?" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " │    ├─ no → set the preset env/config" })
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
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "      - websockets on edge     → edge durable objects + channels pattern" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "      - single binary internal → standalone (compile)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-to-read-next",
			children: "What to Read Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment",
				children: "Deployment"
			}), " — Deployment overview and philosophy"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/adapters",
				children: "Runtime Adapters"
			}), " — Presets and mode presets in detail"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/node-bun",
				children: "Node/Bun Deployment"
			}), " — Servers and single-binary mode"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/serverless",
				children: "Serverless"
			}), " — Serverless targets"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}), " — Before you ship"] }),
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
