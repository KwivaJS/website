import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/getting-started/first-deployment.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Your First Deployment",
	"description": "Build your Kwiva application once and deploy anywhere — zero-config provider detection, explicit presets, single-binary output, edge constraints, and a production checklist."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nDeployment in Kwiva is build-time only: one production build produces deployable output for your target runtime, and the same codebase deploys to a Node server, a serverless platform, an edge runtime, a static host — or as a single binary. No application code changes between targets; the differences live in the deploy preset.\n\n## Build for Production [#build-for-production]\n\n```bash title=\"terminal\"\nkwiva build\n```\n\n`kwiva build` runs the full pipeline — bundling, transforming, type-checked declarations, and minification — and emits:\n\n* **Server bundle** — the server runtime for the selected preset, written to `.output/`\n* **Client bundle** — optimized JavaScript with code splitting and tree shaking\n* **Static assets** — optimized, fingerprinted, and emitted alongside the server output\n* **Route rules** — caching, ISR, and prerendering applied per route\n\nOptional build flags:\n\n| Flag              | Purpose                                                 |\n| ----------------- | ------------------------------------------------------- |\n| `--preset <name>` | Select the deploy preset explicitly                     |\n| `--binary`        | Compile a single standalone executable                  |\n| `--docs`          | Emit the OpenAPI/REST documentation alongside the build |\n\n## How Deployment Works [#how-deployment-works]\n\n1. `kwiva build` produces the client output (tree-shaken, minified) and the server output for one preset\n2. The preset is chosen from, in order of precedence: the `deploy.preset` value in `kwiva.config.ts`, a `--preset` flag, a preselect env variable, or **CI auto-detection** for known providers\n3. `kwiva deploy` runs that provider's deploy path — uploading serverless functions, publishing a worker, pushing static files, or producing a compiled binary\n4. Self-hosting is equally supported: run the emitted server entry directly from `.output/`\n\nBecause presets emit a standard server entry, you can smoke-test any target locally:\n\n```bash title=\"terminal\"\nbun .output/server/index.mjs\n```\n\n## Modes and Their Deploy Defaults [#modes-and-their-deploy-defaults]\n\nThe scaffold-time mode controls the default preset:\n\n| Mode         | Default preset                      | What ships                         |\n| ------------ | ----------------------------------- | ---------------------------------- |\n| `fullstack`  | `node_server` (auto-detected in CI) | SSR + API                          |\n| `api+spa`    | `node_server` + client build        | API with an SPA shell              |\n| `static`     | `static`                            | Prerendered HTML; no server needed |\n| `standalone` | `bun-server` + compiled binary      | Single zero-dependency file        |\n| `edge`       | `cloudflare_worker`                 | Edge-safe worker                   |\n\n## Zero-Config Auto-Detection [#zero-config-auto-detection]\n\nMost providers are auto-detected in CI — nothing to configure:\n\n```bash title=\"terminal\"\nkwiva build\nkwiva deploy\n```\n\nAuto-detected targets include AWS Amplify, Azure Static Web Apps, Cloudflare Pages and Workers, Firebase App Hosting, Netlify, Stormkit, Vercel, and Zeabur. When auto-detection isn't possible, pick a preset explicitly:\n\n```bash title=\"terminal\"\n# Explicit provider\nkwiva deploy cloudflare\nkwiva deploy vercel\nkwiva deploy netlify\n\n# Explicit preset at build time\nkwiva build --preset=cloudflare_worker\nkwiva build --preset=aws-lambda\n```\n\nYou can also pin the preset in `kwiva.config.ts`:\n\n```ts title=\"zero-config-auto-detection.ts\"\nexport default defineConfig({\n  load: './src/config',\n  deploy: { preset: 'node_server' },\n})\n```\n\n### Common Presets [#common-presets]\n\n| Preset                                   | Class                                  |\n| ---------------------------------------- | -------------------------------------- |\n| `node_server`                            | Default production server              |\n| `bun-server` / `bun`                     | Bun runtime, ideal for the binary path |\n| `static`                                 | Fully prerendered static output        |\n| `cloudflare_worker` / `cloudflare_pages` | Edge / worker deployment               |\n| `vercel` / `vercel-edge`                 | Serverless functions or edge functions |\n| `netlify` / `netlify-edge`               | Functions and edge functions           |\n| `aws-lambda`                             | Lambda functions                       |\n| `service-worker`                         | Offline / PWA style                    |\n\n## Single Binary [#single-binary]\n\n```bash title=\"terminal\"\nkwiva build --binary\n# Produces a standalone executable — copy it onto any host\n```\n\nThe standalone output runs the whole application as one file, which is ideal for internal tools, microservices, and background workers.\n\n## Edge Presets [#edge-presets]\n\nEdge targets ship the same application under a small set of edge-safe constraints:\n\n* Loaders and handlers must be statically importable — no dynamic `node:*` imports at runtime\n* No long-lived in-memory state across requests — use the framework's storage and cache APIs\n* No raw sockets — use channels and WebSockets through the framework's realtime surface\n* Database access goes through the model layer over an env-defined connector\n* Config and env reads happen at startup, then flow through the injected typed context\n* Prefer platform web APIs over runtime-exclusive ones\n\nProvider-specific notes worth knowing:\n\n| Provider   | Note                                                                                                           |\n| ---------- | -------------------------------------------------------------------------------------------------------------- |\n| Cloudflare | Set `compatibility_date`; use `waitUntil` for post-response work and the platform's KV/R2 for stateful sockets |\n| Vercel     | Streaming may require a streaming-capable function runtime; edge presets use `vercel-edge`                     |\n| Netlify    | Headers and redirects are configured via the `netlify.config` surface                                          |\n| AWS        | Enable response streaming explicitly on Lambda; scale horizontally rather than multi-core                      |\n| Bun binary | Target the right platform triplet for your host (musl/glibc/Windows support varies)                            |\n\n## Preview Locally [#preview-locally]\n\nPreview the production build exactly as it will behave when deployed:\n\n```bash title=\"terminal\"\nkwiva preview\n```\n\nFor a raw smoke test of a specific preset:\n\n```bash title=\"terminal\"\nkwiva build --preset=node_server\nbun .output/server/index.mjs\n```\n\n## Environment Variables for Production [#environment-variables-for-production]\n\nThe same typed env system used in development applies to production — declare variables once in `src/config/`, provide values per environment:\n\n```bash title=\"terminal\"\n# .env.production\nDATABASE_URL=postgresql://...\nAPP_KEY=your-signing-key\n```\n\nTwo rules to remember:\n\n* Only `KWIVA_PUBLIC_*` variables are safe to embed in client bundles; everything else must stay server-side\n* `kwiva build` sets the environment to `production` and fails fast on missing required variables\n\nPlatform secret stores (the provider's built-in env config) feed runtime env into the config modules at deploy time — no `.env` files end up in your images.\n\n## Rollback [#rollback]\n\nDeployment is reproducible per build. Keep recent `.output/` artifacts; provider-based deployments (Vercel, Cloudflare, Netlify) support env-based rollback to a previous build, and self-hosters can restore a kept artifact directly.\n\n## Production Checklist [#production-checklist]\n\nBefore you ship:\n\n1. Run `kwiva check` — format, lint, and typecheck are clean\n2. Run `kwiva test` — the full suite passes (unit, integration, API, e2e)\n3. Run `kwiva db:migrate` — the database is up to date\n4. Set all required environment variables and verify with boot-time validation\n5. Build and smoke-test with `kwiva preview`\n6. Deploy with `kwiva deploy <provider>` or your CI auto-detection\n\n> \\[!WARNING]\n> Run `kwiva check` and `kwiva test` before any production build. The lint gates also enforce the project conventions (lowercase files, `@kwiva/*`-only imports), so a clean `kwiva check` is your guarantee that the codebase is deploy-conformant.\n\n## What to Read Next [#what-to-read-next]\n\n* [Deployment Overview](/docs/deployment) — the complete deployment guide\n* [Runtime Adapters](/docs/deployment/adapters) — every supported runtime\n* [Production Checklist](/docs/deployment/production-checklist) — pre-deployment verification\n* [Serverless](/docs/deployment/serverless) — serverless functions and providers\n* [Containers](/docs/deployment/containers) — containerized deployment\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Deployment in Kwiva is build-time only: one production build produces deployable output for your target runtime, and the same codebase deploys to a Node server, a serverless platform, an edge runtime, a static host — or as a single binary. No application code changes between targets; the differences live in the deploy preset."
		},
		{
			"heading": "build-for-production",
			"content": "`kwiva build` runs the full pipeline — bundling, transforming, type-checked declarations, and minification — and emits:"
		},
		{
			"heading": "build-for-production",
			"content": "**Server bundle** — the server runtime for the selected preset, written to `.output/`"
		},
		{
			"heading": "build-for-production",
			"content": "**Client bundle** — optimized JavaScript with code splitting and tree shaking"
		},
		{
			"heading": "build-for-production",
			"content": "**Static assets** — optimized, fingerprinted, and emitted alongside the server output"
		},
		{
			"heading": "build-for-production",
			"content": "**Route rules** — caching, ISR, and prerendering applied per route"
		},
		{
			"heading": "build-for-production",
			"content": "Optional build flags:"
		},
		{
			"heading": "build-for-production",
			"content": "Flag"
		},
		{
			"heading": "build-for-production",
			"content": "Purpose"
		},
		{
			"heading": "build-for-production",
			"content": "`--preset <name>`"
		},
		{
			"heading": "build-for-production",
			"content": "Select the deploy preset explicitly"
		},
		{
			"heading": "build-for-production",
			"content": "`--binary`"
		},
		{
			"heading": "build-for-production",
			"content": "Compile a single standalone executable"
		},
		{
			"heading": "build-for-production",
			"content": "`--docs`"
		},
		{
			"heading": "build-for-production",
			"content": "Emit the OpenAPI/REST documentation alongside the build"
		},
		{
			"heading": "how-deployment-works",
			"content": "`kwiva build` produces the client output (tree-shaken, minified) and the server output for one preset"
		},
		{
			"heading": "how-deployment-works",
			"content": "The preset is chosen from, in order of precedence: the `deploy.preset` value in `kwiva.config.ts`, a `--preset` flag, a preselect env variable, or **CI auto-detection** for known providers"
		},
		{
			"heading": "how-deployment-works",
			"content": "`kwiva deploy` runs that provider's deploy path — uploading serverless functions, publishing a worker, pushing static files, or producing a compiled binary"
		},
		{
			"heading": "how-deployment-works",
			"content": "Self-hosting is equally supported: run the emitted server entry directly from `.output/`"
		},
		{
			"heading": "how-deployment-works",
			"content": "Because presets emit a standard server entry, you can smoke-test any target locally:"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "The scaffold-time mode controls the default preset:"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "Mode"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "Default preset"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "What ships"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "`fullstack`"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "`node_server` (auto-detected in CI)"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "SSR + API"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "`api+spa`"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "`node_server` + client build"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "API with an SPA shell"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "`static`"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "`static`"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "Prerendered HTML; no server needed"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "`standalone`"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "`bun-server` + compiled binary"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "Single zero-dependency file"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "`edge`"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "`cloudflare_worker`"
		},
		{
			"heading": "modes-and-their-deploy-defaults",
			"content": "Edge-safe worker"
		},
		{
			"heading": "zero-config-auto-detection",
			"content": "Most providers are auto-detected in CI — nothing to configure:"
		},
		{
			"heading": "zero-config-auto-detection",
			"content": "Auto-detected targets include AWS Amplify, Azure Static Web Apps, Cloudflare Pages and Workers, Firebase App Hosting, Netlify, Stormkit, Vercel, and Zeabur. When auto-detection isn't possible, pick a preset explicitly:"
		},
		{
			"heading": "zero-config-auto-detection",
			"content": "You can also pin the preset in `kwiva.config.ts`:"
		},
		{
			"heading": "common-presets",
			"content": "Preset"
		},
		{
			"heading": "common-presets",
			"content": "Class"
		},
		{
			"heading": "common-presets",
			"content": "`node_server`"
		},
		{
			"heading": "common-presets",
			"content": "Default production server"
		},
		{
			"heading": "common-presets",
			"content": "`bun-server` / `bun`"
		},
		{
			"heading": "common-presets",
			"content": "Bun runtime, ideal for the binary path"
		},
		{
			"heading": "common-presets",
			"content": "`static`"
		},
		{
			"heading": "common-presets",
			"content": "Fully prerendered static output"
		},
		{
			"heading": "common-presets",
			"content": "`cloudflare_worker` / `cloudflare_pages`"
		},
		{
			"heading": "common-presets",
			"content": "Edge / worker deployment"
		},
		{
			"heading": "common-presets",
			"content": "`vercel` / `vercel-edge`"
		},
		{
			"heading": "common-presets",
			"content": "Serverless functions or edge functions"
		},
		{
			"heading": "common-presets",
			"content": "`netlify` / `netlify-edge`"
		},
		{
			"heading": "common-presets",
			"content": "Functions and edge functions"
		},
		{
			"heading": "common-presets",
			"content": "`aws-lambda`"
		},
		{
			"heading": "common-presets",
			"content": "Lambda functions"
		},
		{
			"heading": "common-presets",
			"content": "`service-worker`"
		},
		{
			"heading": "common-presets",
			"content": "Offline / PWA style"
		},
		{
			"heading": "single-binary",
			"content": "The standalone output runs the whole application as one file, which is ideal for internal tools, microservices, and background workers."
		},
		{
			"heading": "edge-presets",
			"content": "Edge targets ship the same application under a small set of edge-safe constraints:"
		},
		{
			"heading": "edge-presets",
			"content": "Loaders and handlers must be statically importable — no dynamic `node:*` imports at runtime"
		},
		{
			"heading": "edge-presets",
			"content": "No long-lived in-memory state across requests — use the framework's storage and cache APIs"
		},
		{
			"heading": "edge-presets",
			"content": "No raw sockets — use channels and WebSockets through the framework's realtime surface"
		},
		{
			"heading": "edge-presets",
			"content": "Database access goes through the model layer over an env-defined connector"
		},
		{
			"heading": "edge-presets",
			"content": "Config and env reads happen at startup, then flow through the injected typed context"
		},
		{
			"heading": "edge-presets",
			"content": "Prefer platform web APIs over runtime-exclusive ones"
		},
		{
			"heading": "edge-presets",
			"content": "Provider-specific notes worth knowing:"
		},
		{
			"heading": "edge-presets",
			"content": "Provider"
		},
		{
			"heading": "edge-presets",
			"content": "Note"
		},
		{
			"heading": "edge-presets",
			"content": "Cloudflare"
		},
		{
			"heading": "edge-presets",
			"content": "Set `compatibility_date`; use `waitUntil` for post-response work and the platform's KV/R2 for stateful sockets"
		},
		{
			"heading": "edge-presets",
			"content": "Vercel"
		},
		{
			"heading": "edge-presets",
			"content": "Streaming may require a streaming-capable function runtime; edge presets use `vercel-edge`"
		},
		{
			"heading": "edge-presets",
			"content": "Netlify"
		},
		{
			"heading": "edge-presets",
			"content": "Headers and redirects are configured via the `netlify.config` surface"
		},
		{
			"heading": "edge-presets",
			"content": "AWS"
		},
		{
			"heading": "edge-presets",
			"content": "Enable response streaming explicitly on Lambda; scale horizontally rather than multi-core"
		},
		{
			"heading": "edge-presets",
			"content": "Bun binary"
		},
		{
			"heading": "edge-presets",
			"content": "Target the right platform triplet for your host (musl/glibc/Windows support varies)"
		},
		{
			"heading": "preview-locally",
			"content": "Preview the production build exactly as it will behave when deployed:"
		},
		{
			"heading": "preview-locally",
			"content": "For a raw smoke test of a specific preset:"
		},
		{
			"heading": "environment-variables-for-production",
			"content": "The same typed env system used in development applies to production — declare variables once in `src/config/`, provide values per environment:"
		},
		{
			"heading": "environment-variables-for-production",
			"content": "Two rules to remember:"
		},
		{
			"heading": "environment-variables-for-production",
			"content": "Only `KWIVA_PUBLIC_*` variables are safe to embed in client bundles; everything else must stay server-side"
		},
		{
			"heading": "environment-variables-for-production",
			"content": "`kwiva build` sets the environment to `production` and fails fast on missing required variables"
		},
		{
			"heading": "environment-variables-for-production",
			"content": "Platform secret stores (the provider's built-in env config) feed runtime env into the config modules at deploy time — no `.env` files end up in your images."
		},
		{
			"heading": "rollback",
			"content": "Deployment is reproducible per build. Keep recent `.output/` artifacts; provider-based deployments (Vercel, Cloudflare, Netlify) support env-based rollback to a previous build, and self-hosters can restore a kept artifact directly."
		},
		{
			"heading": "production-checklist",
			"content": "Before you ship:"
		},
		{
			"heading": "production-checklist",
			"content": "Run `kwiva check` — format, lint, and typecheck are clean"
		},
		{
			"heading": "production-checklist",
			"content": "Run `kwiva test` — the full suite passes (unit, integration, API, e2e)"
		},
		{
			"heading": "production-checklist",
			"content": "Run `kwiva db:migrate` — the database is up to date"
		},
		{
			"heading": "production-checklist",
			"content": "Set all required environment variables and verify with boot-time validation"
		},
		{
			"heading": "production-checklist",
			"content": "Build and smoke-test with `kwiva preview`"
		},
		{
			"heading": "production-checklist",
			"content": "Deploy with `kwiva deploy <provider>` or your CI auto-detection"
		},
		{
			"heading": "production-checklist",
			"content": "> \\[!WARNING]\n> Run `kwiva check` and `kwiva test` before any production build. The lint gates also enforce the project conventions (lowercase files, `@kwiva/*`-only imports), so a clean `kwiva check` is your guarantee that the codebase is deploy-conformant."
		},
		{
			"heading": "what-to-read-next",
			"content": "Deployment Overview — the complete deployment guide"
		},
		{
			"heading": "what-to-read-next",
			"content": "Runtime Adapters — every supported runtime"
		},
		{
			"heading": "what-to-read-next",
			"content": "Production Checklist — pre-deployment verification"
		},
		{
			"heading": "what-to-read-next",
			"content": "Serverless — serverless functions and providers"
		},
		{
			"heading": "what-to-read-next",
			"content": "Containers — containerized deployment"
		}
	],
	"headings": [
		{
			"id": "build-for-production",
			"content": "Build for Production"
		},
		{
			"id": "how-deployment-works",
			"content": "How Deployment Works"
		},
		{
			"id": "modes-and-their-deploy-defaults",
			"content": "Modes and Their Deploy Defaults"
		},
		{
			"id": "zero-config-auto-detection",
			"content": "Zero-Config Auto-Detection"
		},
		{
			"id": "common-presets",
			"content": "Common Presets"
		},
		{
			"id": "single-binary",
			"content": "Single Binary"
		},
		{
			"id": "edge-presets",
			"content": "Edge Presets"
		},
		{
			"id": "preview-locally",
			"content": "Preview Locally"
		},
		{
			"id": "environment-variables-for-production",
			"content": "Environment Variables for Production"
		},
		{
			"id": "rollback",
			"content": "Rollback"
		},
		{
			"id": "production-checklist",
			"content": "Production Checklist"
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
		url: "#build-for-production",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Build for Production" })
	},
	{
		depth: 2,
		url: "#how-deployment-works",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How Deployment Works" })
	},
	{
		depth: 2,
		url: "#modes-and-their-deploy-defaults",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Modes and Their Deploy Defaults" })
	},
	{
		depth: 2,
		url: "#zero-config-auto-detection",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Zero-Config Auto-Detection" })
	},
	{
		depth: 3,
		url: "#common-presets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Common Presets" })
	},
	{
		depth: 2,
		url: "#single-binary",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Single Binary" })
	},
	{
		depth: 2,
		url: "#edge-presets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Edge Presets" })
	},
	{
		depth: 2,
		url: "#preview-locally",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Preview Locally" })
	},
	{
		depth: 2,
		url: "#environment-variables-for-production",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Environment Variables for Production" })
	},
	{
		depth: 2,
		url: "#rollback",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Rollback" })
	},
	{
		depth: 2,
		url: "#production-checklist",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Production Checklist" })
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
		blockquote: "blockquote",
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Deployment in Kwiva is build-time only: one production build produces deployable output for your target runtime, and the same codebase deploys to a Node server, a serverless platform, an edge runtime, a static host — or as a single binary. No application code changes between targets; the differences live in the deploy preset." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "build-for-production",
			children: "Build for Production"
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
					children: "kwiva"
				}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					},
					children: " build"
				})]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }), " runs the full pipeline — bundling, transforming, type-checked declarations, and minification — and emits:"] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Server bundle" }),
				" — the server runtime for the selected preset, written to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Client bundle" }), " — optimized JavaScript with code splitting and tree shaking"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Static assets" }), " — optimized, fingerprinted, and emitted alongside the server output"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Route rules" }), " — caching, ISR, and prerendering applied per route"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Optional build flags:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Flag" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--preset <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Select the deploy preset explicitly" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--binary" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Compile a single standalone executable" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--docs" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Emit the OpenAPI/REST documentation alongside the build" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-deployment-works",
			children: "How Deployment Works"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }), " produces the client output (tree-shaken, minified) and the server output for one preset"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The preset is chosen from, in order of precedence: the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deploy.preset" }),
				" value in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
				", a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--preset" }),
				" flag, a preselect env variable, or ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "CI auto-detection" }),
				" for known providers"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy" }), " runs that provider's deploy path — uploading serverless functions, publishing a worker, pushing static files, or producing a compiled binary"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: ["Self-hosting is equally supported: run the emitted server entry directly from ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" })] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because presets emit a standard server entry, you can smoke-test any target locally:" }),
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "modes-and-their-deploy-defaults",
			children: "Modes and Their Deploy Defaults"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The scaffold-time mode controls the default preset:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Default preset" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What ships" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }), " (auto-detected in CI)"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR + API" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }), " + client build"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API with an SPA shell" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Prerendered HTML; no server needed" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun-server" }), " + compiled binary"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Single zero-dependency file" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cloudflare_worker" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge-safe worker" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "zero-config-auto-detection",
			children: "Zero-Config Auto-Detection"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Most providers are auto-detected in CI — nothing to configure:" }),
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
						children: " build"
					})]
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
						children: " deploy"
					})]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Auto-detected targets include AWS Amplify, Azure Static Web Apps, Cloudflare Pages and Workers, Firebase App Hosting, Netlify, Stormkit, Vercel, and Zeabur. When auto-detection isn't possible, pick a preset explicitly:" }),
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "# Explicit provider"
					})
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
							children: " deploy"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " cloudflare"
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
							children: " deploy"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " vercel"
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
							children: " deploy"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " netlify"
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
						children: "# Explicit preset at build time"
					})
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
							children: " --preset=cloudflare_worker"
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
							children: " --preset=aws-lambda"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"You can also pin the preset in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
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
			title: "zero-config-auto-detection.ts",
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
							children: " defineConfig"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({"
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
							children: "  load: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./src/config'"
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
							children: "  deploy: { preset: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'node_server'"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "common-presets",
			children: "Common Presets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Preset" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Class" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Default production server" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun-server" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Bun runtime, ideal for the binary path" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Fully prerendered static output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cloudflare_worker" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cloudflare_pages" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge / worker deployment" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "vercel" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "vercel-edge" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Serverless functions or edge functions" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "netlify" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "netlify-edge" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Functions and edge functions" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "aws-lambda" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Lambda functions" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "service-worker" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Offline / PWA style" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "single-binary",
			children: "Single Binary"
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
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "# Produces a standalone executable — copy it onto any host"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The standalone output runs the whole application as one file, which is ideal for internal tools, microservices, and background workers." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "edge-presets",
			children: "Edge Presets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Edge targets ship the same application under a small set of edge-safe constraints:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Loaders and handlers must be statically importable — no dynamic ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node:*" }),
				" imports at runtime"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "No long-lived in-memory state across requests — use the framework's storage and cache APIs" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "No raw sockets — use channels and WebSockets through the framework's realtime surface" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Database access goes through the model layer over an env-defined connector" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Config and env reads happen at startup, then flow through the injected typed context" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Prefer platform web APIs over runtime-exclusive ones" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Provider-specific notes worth knowing:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Provider" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Note" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cloudflare" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Set ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "compatibility_date" }),
				"; use ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "waitUntil" }),
				" for post-response work and the platform's KV/R2 for stateful sockets"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Vercel" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Streaming may require a streaming-capable function runtime; edge presets use ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "vercel-edge" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Netlify" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Headers and redirects are configured via the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "netlify.config" }),
				" surface"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "AWS" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Enable response streaming explicitly on Lambda; scale horizontally rather than multi-core" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Bun binary" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Target the right platform triplet for your host (musl/glibc/Windows support varies)" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "preview-locally",
			children: "Preview Locally"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Preview the production build exactly as it will behave when deployed:" }),
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
					children: "kwiva"
				}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					},
					children: " preview"
				})]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "For a raw smoke test of a specific preset:" }),
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
							children: " --preset=node_server"
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
						children: "bun"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "environment-variables-for-production",
			children: "Environment Variables for Production"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same typed env system used in development applies to production — declare variables once in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/" }),
			", provide values per environment:"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "# .env.production"
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
							children: "DATABASE_URL"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "postgresql://..."
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
							children: "APP_KEY"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "your-signing-key"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two rules to remember:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Only ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_PUBLIC_*" }),
				" variables are safe to embed in client bundles; everything else must stay server-side"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }),
				" sets the environment to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "production" }),
				" and fails fast on missing required variables"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Platform secret stores (the provider's built-in env config) feed runtime env into the config modules at deploy time — no ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env" }),
			" files end up in your images."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "rollback",
			children: "Rollback"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Deployment is reproducible per build. Keep recent ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			" artifacts; provider-based deployments (Vercel, Cloudflare, Netlify) support env-based rollback to a previous build, and self-hosters can restore a kept artifact directly."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "production-checklist",
			children: "Production Checklist"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Before you ship:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Run ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				" — format, lint, and typecheck are clean"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Run ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test" }),
				" — the full suite passes (unit, integration, API, e2e)"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Run ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
				" — the database is up to date"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Set all required environment variables and verify with boot-time validation" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: ["Build and smoke-test with ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" })] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Deploy with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy <provider>" }),
				" or your CI auto-detection"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!WARNING]\nRun ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test" }),
				" before any production build. The lint gates also enforce the project conventions (lowercase files, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				"-only imports), so a clean ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				" is your guarantee that the codebase is deploy-conformant."
			] }),
			"\n"
		] }),
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
				children: "Deployment Overview"
			}), " — the complete deployment guide"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/adapters",
				children: "Runtime Adapters"
			}), " — every supported runtime"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}), " — pre-deployment verification"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/serverless",
				children: "Serverless"
			}), " — serverless functions and providers"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/containers",
				children: "Containers"
			}), " — containerized deployment"] }),
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
