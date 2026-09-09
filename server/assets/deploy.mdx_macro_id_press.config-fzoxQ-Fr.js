import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/guides/deploy.mdx?macro_id=press.config.tsx%23guides
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "How do I deploy?",
	"description": "Build once and deploy to a Node or Bun server, a serverless platform, containers, or a single binary with deploy-anywhere presets."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nKwiva builds to deploy-anywhere presets, so one codebase targets a Node.js or Bun server, serverless platforms, containers, or a single binary. Deployment is build-time only — no application code changes.\n\n## Prerequisites [#prerequisites]\n\n* A Kwiva project with a [mode](/docs/deployment/adapters) chosen at scaffold time\n* [Bun](/docs/getting-started) 1.2+ and Node.js 18+ available\n* Production environment variables set (`.env.production`)\n\n## Choose a mode and a target [#choose-a-mode-and-a-target]\n\n| Mode                  | What it produces                         |\n| --------------------- | ---------------------------------------- |\n| `fullstack` (default) | SSR pages + API, built for `node_server` |\n| `api+spa`             | API server + static SPA, no SSR renderer |\n| `static`              | Prerendered HTML — no server needed      |\n| `standalone`          | Single-file, zero-dependency binary      |\n| `edge`                | Optimized for edge runtimes              |\n\nThen pick a runtime preset: `node_server`, `bun_server`, `vercel`, `netlify`, `cloudflare`, `aws-lambda`, or `standalone`.\n\n## Build for your target [#build-for-your-target]\n\n```bash title=\"terminal\"\nkwiva build --preset node_server\n```\n\n`kwiva build` compiles the client with the Rust-speed toolchain and builds the server for the preset, emitting `.output/` with `server/` and `public/`. The preset comes from the `--preset` flag, `deploy.preset` in `kwiva.config.ts`, or CI auto-detection — on Vercel, Cloudflare, and Netlify no flag is needed.\n\n## Run a Node or Bun server [#run-a-node-or-bun-server]\n\nBuild and start the output for the runtime you chose:\n\n```bash title=\"terminal\"\nkwiva build\nnode .output/server/index.mjs\n```\n\n```bash title=\"terminal\"\nkwiva build --preset bun_server\nbun .output/server/index.mjs\n```\n\n## Deploy to serverless [#deploy-to-serverless]\n\n| Platform           | Preset       |\n| ------------------ | ------------ |\n| Vercel             | `vercel`     |\n| Netlify            | `netlify`    |\n| Cloudflare Workers | `cloudflare` |\n| AWS Lambda         | `aws-lambda` |\n\n```bash title=\"terminal\"\nkwiva build --preset vercel\nkwiva deploy vercel\n```\n\n`kwiva deploy` runs the provider's own deploy path, so nothing about your application code changes between targets.\n\n## Run in containers or ship a binary [#run-in-containers-or-ship-a-binary]\n\nContainer deployments use the `node_server` or `bun_server` preset. Build an image with a Bun runtime:\n\n```dockerfile title=\"run-in-containers-or-ship-a-binary.Dockerfile\"\nFROM oven/bun:1 AS build\nWORKDIR /app\nCOPY . .\nRUN bun install && kwiva build --preset bun_server\n\nFROM oven/bun:1\nCOPY --from=build /app/.output /app/.output\nCMD [\"bun\", \"/app/.output/server/index.mjs\"]\n```\n\nRun it with Docker or orchestrate it with Kubernetes; it honors the `PORT` environment variable used by Railway, Render, and DigitalOcean. For a single-file artifact, compile the output into one executable:\n\n```bash title=\"terminal\"\nkwiva build --binary\n./server\n```\n\n## Verify it works [#verify-it-works]\n\n1. Preview the built output locally: `kwiva preview`.\n2. Run `kwiva build --preset node_server`, start the output, and fetch [http://localhost:3000/healthz](http://localhost:3000/healthz).\n3. Confirm the checklist first: all env vars set, `kwiva check` and `kwiva test` pass, `kwiva db:migrate` applied, queue workers running, Redis configured, an OTel exporter set, and secrets rotated.\n4. Build with the target preset, run `kwiva deploy <provider>`, and repeat the health check against the live URL.\n\n## Related Documentation [#related-documentation]\n\n* [Runtime Adapters](/docs/deployment/adapters) — Presets and mode presets\n* [Node/Bun Deployment](/docs/deployment/node-bun) — Server and single-binary targets\n* [Serverless Deployment](/docs/deployment/serverless) — Vercel, Netlify, Cloudflare, AWS\n* [Container Deployment](/docs/deployment/containers) — Docker and Kubernetes\n* [Production Checklist](/docs/deployment/production-checklist) — Pre-deploy checks\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva builds to deploy-anywhere presets, so one codebase targets a Node.js or Bun server, serverless platforms, containers, or a single binary. Deployment is build-time only — no application code changes."
		},
		{
			"heading": "prerequisites",
			"content": "A Kwiva project with a mode chosen at scaffold time"
		},
		{
			"heading": "prerequisites",
			"content": "Bun 1.2+ and Node.js 18+ available"
		},
		{
			"heading": "prerequisites",
			"content": "Production environment variables set (`.env.production`)"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "Mode"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "What it produces"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "`fullstack` (default)"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "SSR pages + API, built for `node_server`"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "`api+spa`"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "API server + static SPA, no SSR renderer"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "`static`"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "Prerendered HTML — no server needed"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "`standalone`"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "Single-file, zero-dependency binary"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "`edge`"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "Optimized for edge runtimes"
		},
		{
			"heading": "choose-a-mode-and-a-target",
			"content": "Then pick a runtime preset: `node_server`, `bun_server`, `vercel`, `netlify`, `cloudflare`, `aws-lambda`, or `standalone`."
		},
		{
			"heading": "build-for-your-target",
			"content": "`kwiva build` compiles the client with the Rust-speed toolchain and builds the server for the preset, emitting `.output/` with `server/` and `public/`. The preset comes from the `--preset` flag, `deploy.preset` in `kwiva.config.ts`, or CI auto-detection — on Vercel, Cloudflare, and Netlify no flag is needed."
		},
		{
			"heading": "run-a-node-or-bun-server",
			"content": "Build and start the output for the runtime you chose:"
		},
		{
			"heading": "deploy-to-serverless",
			"content": "Platform"
		},
		{
			"heading": "deploy-to-serverless",
			"content": "Preset"
		},
		{
			"heading": "deploy-to-serverless",
			"content": "Vercel"
		},
		{
			"heading": "deploy-to-serverless",
			"content": "`vercel`"
		},
		{
			"heading": "deploy-to-serverless",
			"content": "Netlify"
		},
		{
			"heading": "deploy-to-serverless",
			"content": "`netlify`"
		},
		{
			"heading": "deploy-to-serverless",
			"content": "Cloudflare Workers"
		},
		{
			"heading": "deploy-to-serverless",
			"content": "`cloudflare`"
		},
		{
			"heading": "deploy-to-serverless",
			"content": "AWS Lambda"
		},
		{
			"heading": "deploy-to-serverless",
			"content": "`aws-lambda`"
		},
		{
			"heading": "deploy-to-serverless",
			"content": "`kwiva deploy` runs the provider's own deploy path, so nothing about your application code changes between targets."
		},
		{
			"heading": "run-in-containers-or-ship-a-binary",
			"content": "Container deployments use the `node_server` or `bun_server` preset. Build an image with a Bun runtime:"
		},
		{
			"heading": "run-in-containers-or-ship-a-binary",
			"content": "Run it with Docker or orchestrate it with Kubernetes; it honors the `PORT` environment variable used by Railway, Render, and DigitalOcean. For a single-file artifact, compile the output into one executable:"
		},
		{
			"heading": "verify-it-works",
			"content": "Preview the built output locally: `kwiva preview`."
		},
		{
			"heading": "verify-it-works",
			"content": "Run `kwiva build --preset node_server`, start the output, and fetch http\\://localhost:3000/healthz."
		},
		{
			"heading": "verify-it-works",
			"content": "Confirm the checklist first: all env vars set, `kwiva check` and `kwiva test` pass, `kwiva db:migrate` applied, queue workers running, Redis configured, an OTel exporter set, and secrets rotated."
		},
		{
			"heading": "verify-it-works",
			"content": "Build with the target preset, run `kwiva deploy <provider>`, and repeat the health check against the live URL."
		},
		{
			"heading": "related-documentation",
			"content": "Runtime Adapters — Presets and mode presets"
		},
		{
			"heading": "related-documentation",
			"content": "Node/Bun Deployment — Server and single-binary targets"
		},
		{
			"heading": "related-documentation",
			"content": "Serverless Deployment — Vercel, Netlify, Cloudflare, AWS"
		},
		{
			"heading": "related-documentation",
			"content": "Container Deployment — Docker and Kubernetes"
		},
		{
			"heading": "related-documentation",
			"content": "Production Checklist — Pre-deploy checks"
		}
	],
	"headings": [
		{
			"id": "prerequisites",
			"content": "Prerequisites"
		},
		{
			"id": "choose-a-mode-and-a-target",
			"content": "Choose a mode and a target"
		},
		{
			"id": "build-for-your-target",
			"content": "Build for your target"
		},
		{
			"id": "run-a-node-or-bun-server",
			"content": "Run a Node or Bun server"
		},
		{
			"id": "deploy-to-serverless",
			"content": "Deploy to serverless"
		},
		{
			"id": "run-in-containers-or-ship-a-binary",
			"content": "Run in containers or ship a binary"
		},
		{
			"id": "verify-it-works",
			"content": "Verify it works"
		},
		{
			"id": "related-documentation",
			"content": "Related Documentation"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#prerequisites",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Prerequisites" })
	},
	{
		depth: 2,
		url: "#choose-a-mode-and-a-target",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Choose a mode and a target" })
	},
	{
		depth: 2,
		url: "#build-for-your-target",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Build for your target" })
	},
	{
		depth: 2,
		url: "#run-a-node-or-bun-server",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Run a Node or Bun server" })
	},
	{
		depth: 2,
		url: "#deploy-to-serverless",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Deploy to serverless" })
	},
	{
		depth: 2,
		url: "#run-in-containers-or-ship-a-binary",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Run in containers or ship a binary" })
	},
	{
		depth: 2,
		url: "#verify-it-works",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Verify it works" })
	},
	{
		depth: 2,
		url: "#related-documentation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Related Documentation" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva builds to deploy-anywhere presets, so one codebase targets a Node.js or Bun server, serverless platforms, containers, or a single binary. Deployment is build-time only — no application code changes." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "prerequisites",
			children: "Prerequisites"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A Kwiva project with a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/deployment/adapters",
					children: "mode"
				}),
				" chosen at scaffold time"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started",
				children: "Bun"
			}), " 1.2+ and Node.js 18+ available"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Production environment variables set (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env.production" }),
				")"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "choose-a-mode-and-a-target",
			children: "Choose a mode and a target"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it produces" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }), " (default)"] }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["SSR pages + API, built for ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API server + static SPA, no SSR renderer" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Prerendered HTML — no server needed" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Single-file, zero-dependency binary" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Optimized for edge runtimes" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Then pick a runtime preset: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun_server" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "vercel" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "netlify" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cloudflare" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "aws-lambda" }),
			", or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "build-for-your-target",
			children: "Build for your target"
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
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }),
			" compiles the client with the Rust-speed toolchain and builds the server for the preset, emitting ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			" with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "server/" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "public/" }),
			". The preset comes from the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--preset" }),
			" flag, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deploy.preset" }),
			" in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
			", or CI auto-detection — on Vercel, Cloudflare, and Netlify no flag is needed."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "run-a-node-or-bun-server",
			children: "Run a Node or Bun server"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Build and start the output for the runtime you chose:" }),
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
							children: " bun_server"
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
			id: "deploy-to-serverless",
			children: "Deploy to serverless"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Platform" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Preset" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Vercel" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "vercel" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Netlify" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "netlify" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cloudflare Workers" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cloudflare" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "AWS Lambda" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "aws-lambda" }) })] })
		] })] }),
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
							children: " vercel"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy" }), " runs the provider's own deploy path, so nothing about your application code changes between targets."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "run-in-containers-or-ship-a-binary",
			children: "Run in containers or ship a binary"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Container deployments use the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }),
			" or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun_server" }),
			" preset. Build an image with a Bun runtime:"
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
			title: "run-in-containers-or-ship-a-binary.Dockerfile",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "FROM"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " oven/bun:1 "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "AS"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " build"
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
						children: " . ."
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
						children: "RUN"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " bun install && kwiva build --preset bun_server"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
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
						children: " oven/bun:1"
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
						children: " --from=build /app/.output /app/.output"
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
							children: "\"bun\""
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
							children: "\"/app/.output/server/index.mjs\""
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Run it with Docker or orchestrate it with Kubernetes; it honors the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PORT" }),
			" environment variable used by Railway, Render, and DigitalOcean. For a single-file artifact, compile the output into one executable:"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "verify-it-works",
			children: "Verify it works"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Preview the built output locally: ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Run ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --preset node_server" }),
				", start the output, and fetch ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "http://localhost:3000/healthz",
					children: "http://localhost:3000/healthz"
				}),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Confirm the checklist first: all env vars set, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test" }),
				" pass, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
				" applied, queue workers running, Redis configured, an OTel exporter set, and secrets rotated."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Build with the target preset, run ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy <provider>" }),
				", and repeat the health check against the live URL."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "related-documentation",
			children: "Related Documentation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/adapters",
				children: "Runtime Adapters"
			}), " — Presets and mode presets"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/node-bun",
				children: "Node/Bun Deployment"
			}), " — Server and single-binary targets"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/serverless",
				children: "Serverless Deployment"
			}), " — Vercel, Netlify, Cloudflare, AWS"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/containers",
				children: "Container Deployment"
			}), " — Docker and Kubernetes"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}), " — Pre-deploy checks"] }),
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
