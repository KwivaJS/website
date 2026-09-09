import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/deployment/serverless.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Serverless Deployment",
	"description": "Ship Kwiva to function-based serverless platforms — platform-agnostic output, stateless constraints, externalized state, cold-start notes, and the kwiva deploy provider flow."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\n## Overview [#overview]\n\nServerless adapters reinterpret the built application as **function output**: instead of a long-lived server process, each request is handled by an ephemeral, elastically-scaled function. The same models, controllers, middleware, and pages you wrote for a Node runtime deploy to a serverless host unchanged.\n\nKwiva's serverless story is deliberately platform-agnostic. One build pipeline produces `.output/` and the adapter shapes it for the target function runtime — with the serverless constraints baked into the docs so you know exactly what to design for.\n\nThe platform-agnosticism has a second payoff: the same artifact builds for edge runtimes (worker-style output that runs close to the user) and for classic region-based functions. Your code does not know or care which one it became — the differences live in the adapter and the constraint set.\n\n## Build for Serverless [#build-for-serverless]\n\n```bash title=\"terminal\"\nkwiva build --preset aws-lambda\nkwiva build --preset aws-lambda-sst\n```\n\nThe output is still `.output/` with `server/` and `public/`; the adapter packages the server entry as a function. Response streaming is available but must be enabled explicitly on the function runtime — check the adapter's configuration, because streaming is not automatic everywhere. On Lambda-family targets that means opting into the streaming response mode explicitly; if you need it, set it before you rely on streaming anywhere in the app.\n\n### Selection [#selection]\n\nMost serverless platforms are auto-detected when your continuous-integration runner deploys. When one is not, or you want to pin a target, choose explicitly:\n\n```bash title=\"terminal\"\nkwiva build                      # auto-detected in CI\nKWIVA_PRESET=aws-lambda kwiva build   # forced in the build environment\n```\n\nOr set `deploy.preset` in `kwiva.config.ts` as the committed default:\n\n```ts title=\"selection.ts\"\nexport default defineConfig({\n  deploy: {\n    preset: 'aws-lambda',\n  },\n})\n```\n\n`kwiva preview` runs any built preset locally, so you can validate the exact serverless artifact before pushing.\n\n> \\[!TIP]\n> Pin the preset explicitly when you deploy from your own machines or a generic runner. Auto-detection is a convenience for platforms that publish their own build pipeline signals; a committed `deploy.preset` is reproducible everywhere.\n\n## The Deploy Command Flow [#the-deploy-command-flow]\n\n```bash title=\"terminal\"\nkwiva deploy [provider]\n```\n\n`kwiva deploy` is a thin wrapper around the provider's deploy path:\n\n1. It runs the built artifact through the provider's own deploy tooling (functions upload, plain artifact sync, or platform API calls).\n2. It honors provider-specific credentials supplied as environment tokens to the deploy CLI.\n3. It prints the **artifact digest** and the deploy command it executed, so builds are traceable.\n\nSelf-hosting is always an option: keep the build, upload the artifact yourself, and run it however your serverless host expects.\n\n### Rollback [#rollback]\n\nKeep N previous builds. Managed serverless platforms handle env-based rollback for you; self-hosters keep a tar of `.output/`. Rolling back is therefore a pointer swap, not a code change. Because each deploy is a discrete artifact rather than an in-place mutation, reverting to the previous behavior is always one repoint away.\n\n## Stateless Constraints [#stateless-constraints]\n\nServerless functions are ephemeral and elastic. Design for these rules:\n\n* **No long-lived in-memory state across requests.** Use the `cache` and `storage` APIs instead of process-level singletons.\n* **Database access goes through the model layer** over an env-defined connector — never raw sockets or connection pooling hacks in app code.\n* **Read `process.env` only at startup.** Inject via typed env and config so functions stay pure between invocations.\n* **Avoid exclusive runtime-only APIs** — prefer platform Web APIs.\n* **Multi-core is not automatic** — serverless scales out by number of instances, not cores.\n* **Loaders and handlers must be statically importable** — no dynamic imports at runtime.\n\nThe app kernel is **stateless by construction**: sessions, cache, queue, and storage are externalized by default. That is what makes elastic scaling safe. An instance is never assumed to survive a single request, so the fleet can grow and shrink with traffic without any correctness loss.\n\n## Cold Starts and Externalized State [#cold-starts-and-externalized-state]\n\nFunctions may go idle and start cold on the next request. Mitigate in three ways:\n\n1. **Keep the function lean** — heavy initialization (like telemetry or queue transport setup) belongs in providers that run once at boot, not per request. If boot time is dominated by per-request work, move that work into the model and cache layers.\n2. **Externalize session state** — the session store is pluggable (cookie, shared broker, or database backends). When a request lands on any instance, the session must resolve from a shared store, not instance memory.\n3. **Externalize everything shared** — cache hits and queued jobs come from shared cache and queue infrastructure, and uploaded files live in object storage, so any instance can serve any request.\n\nCold starts are a platform property, not a framework property — Kwiva cannot eliminate them, but it removes every reason a cold function would behave incorrectly. A fresh instance boots, reads typed configuration, resolves a session from the shared store, and serves the request identically to a warm one.\n\n## Streaming and Connections [#streaming-and-connections]\n\nServerless adapters support response streaming where the runtime permits it. Long-lived connections are a different story:\n\n* **WebSockets** on serverless use the channels API, backed by durable storage for stateful connections.\n* **SSE** is available as a fallback when WebSockets are unavailable on the host.\n* Route rules that control caching semantics (swr, static, passthrough) behave per provider — check how your platform handles cache headers and invalidation.\n\nStreaming-first SSR works on function targets as long as the platform supports streaming responses; the SSR shell streams under 50 ms on the example application, while deferred loaders resolve in the background. Verdict first, bytes later — but only on runtimes that honor the streaming contract.\n\n## Edge Variants [#edge-variants]\n\nSeveral serverless adapters target **edge runtimes**: worker-style output that runs close to the user. The edge-safe constraint set applies in full — and the payoff is route rules like per-page static and passthrough caching that behave close to CDN semantics. WebSockets on the edge use the channels pattern over durable storage.\n\n| Function vs edge | Functions                     | Edge workers                        |\n| ---------------- | ----------------------------- | ----------------------------------- |\n| Runtime location | Regional datacenters          | Points of presence, close to users  |\n| Connection model | Request-scoped                | Request-scoped                      |\n| Caching payoff   | Route rules honored           | Route rules behave near-CDN         |\n| WebSockets       | Channels over durable storage | Channels over durable storage       |\n| State allowed    | Externalized only             | Externalized only, no local storage |\n\nWhether you deploy functions or edge workers, the constraint discipline is identical and the app code is unchanged — the adapter is the only difference.\n\n## What's Next [#whats-next]\n\n* [Runtime Adapters](/docs/deployment/adapters) — the full adapter matrix and selection flow\n* [Node/Bun Deployment](/docs/deployment/node-bun) — the always-available alternative\n* [Container Deployment](/docs/deployment/containers) — image-based hosting with the same artifact\n* [Production Checklist](/docs/deployment/production-checklist) — stateless and externalized-state checks\n* [Background Work](/docs/background-work) — where queue workers and tasks run\n";
var structuredData = {
	"contents": [
		{
			"heading": "overview",
			"content": "Serverless adapters reinterpret the built application as **function output**: instead of a long-lived server process, each request is handled by an ephemeral, elastically-scaled function. The same models, controllers, middleware, and pages you wrote for a Node runtime deploy to a serverless host unchanged."
		},
		{
			"heading": "overview",
			"content": "Kwiva's serverless story is deliberately platform-agnostic. One build pipeline produces `.output/` and the adapter shapes it for the target function runtime — with the serverless constraints baked into the docs so you know exactly what to design for."
		},
		{
			"heading": "overview",
			"content": "The platform-agnosticism has a second payoff: the same artifact builds for edge runtimes (worker-style output that runs close to the user) and for classic region-based functions. Your code does not know or care which one it became — the differences live in the adapter and the constraint set."
		},
		{
			"heading": "build-for-serverless",
			"content": "The output is still `.output/` with `server/` and `public/`; the adapter packages the server entry as a function. Response streaming is available but must be enabled explicitly on the function runtime — check the adapter's configuration, because streaming is not automatic everywhere. On Lambda-family targets that means opting into the streaming response mode explicitly; if you need it, set it before you rely on streaming anywhere in the app."
		},
		{
			"heading": "selection",
			"content": "Most serverless platforms are auto-detected when your continuous-integration runner deploys. When one is not, or you want to pin a target, choose explicitly:"
		},
		{
			"heading": "selection",
			"content": "Or set `deploy.preset` in `kwiva.config.ts` as the committed default:"
		},
		{
			"heading": "selection",
			"content": "`kwiva preview` runs any built preset locally, so you can validate the exact serverless artifact before pushing."
		},
		{
			"heading": "selection",
			"content": "> \\[!TIP]\n> Pin the preset explicitly when you deploy from your own machines or a generic runner. Auto-detection is a convenience for platforms that publish their own build pipeline signals; a committed `deploy.preset` is reproducible everywhere."
		},
		{
			"heading": "the-deploy-command-flow",
			"content": "`kwiva deploy` is a thin wrapper around the provider's deploy path:"
		},
		{
			"heading": "the-deploy-command-flow",
			"content": "It runs the built artifact through the provider's own deploy tooling (functions upload, plain artifact sync, or platform API calls)."
		},
		{
			"heading": "the-deploy-command-flow",
			"content": "It honors provider-specific credentials supplied as environment tokens to the deploy CLI."
		},
		{
			"heading": "the-deploy-command-flow",
			"content": "It prints the **artifact digest** and the deploy command it executed, so builds are traceable."
		},
		{
			"heading": "the-deploy-command-flow",
			"content": "Self-hosting is always an option: keep the build, upload the artifact yourself, and run it however your serverless host expects."
		},
		{
			"heading": "rollback",
			"content": "Keep N previous builds. Managed serverless platforms handle env-based rollback for you; self-hosters keep a tar of `.output/`. Rolling back is therefore a pointer swap, not a code change. Because each deploy is a discrete artifact rather than an in-place mutation, reverting to the previous behavior is always one repoint away."
		},
		{
			"heading": "stateless-constraints",
			"content": "Serverless functions are ephemeral and elastic. Design for these rules:"
		},
		{
			"heading": "stateless-constraints",
			"content": "**No long-lived in-memory state across requests.** Use the `cache` and `storage` APIs instead of process-level singletons."
		},
		{
			"heading": "stateless-constraints",
			"content": "**Database access goes through the model layer** over an env-defined connector — never raw sockets or connection pooling hacks in app code."
		},
		{
			"heading": "stateless-constraints",
			"content": "**Read `process.env` only at startup.** Inject via typed env and config so functions stay pure between invocations."
		},
		{
			"heading": "stateless-constraints",
			"content": "**Avoid exclusive runtime-only APIs** — prefer platform Web APIs."
		},
		{
			"heading": "stateless-constraints",
			"content": "**Multi-core is not automatic** — serverless scales out by number of instances, not cores."
		},
		{
			"heading": "stateless-constraints",
			"content": "**Loaders and handlers must be statically importable** — no dynamic imports at runtime."
		},
		{
			"heading": "stateless-constraints",
			"content": "The app kernel is **stateless by construction**: sessions, cache, queue, and storage are externalized by default. That is what makes elastic scaling safe. An instance is never assumed to survive a single request, so the fleet can grow and shrink with traffic without any correctness loss."
		},
		{
			"heading": "cold-starts-and-externalized-state",
			"content": "Functions may go idle and start cold on the next request. Mitigate in three ways:"
		},
		{
			"heading": "cold-starts-and-externalized-state",
			"content": "**Keep the function lean** — heavy initialization (like telemetry or queue transport setup) belongs in providers that run once at boot, not per request. If boot time is dominated by per-request work, move that work into the model and cache layers."
		},
		{
			"heading": "cold-starts-and-externalized-state",
			"content": "**Externalize session state** — the session store is pluggable (cookie, shared broker, or database backends). When a request lands on any instance, the session must resolve from a shared store, not instance memory."
		},
		{
			"heading": "cold-starts-and-externalized-state",
			"content": "**Externalize everything shared** — cache hits and queued jobs come from shared cache and queue infrastructure, and uploaded files live in object storage, so any instance can serve any request."
		},
		{
			"heading": "cold-starts-and-externalized-state",
			"content": "Cold starts are a platform property, not a framework property — Kwiva cannot eliminate them, but it removes every reason a cold function would behave incorrectly. A fresh instance boots, reads typed configuration, resolves a session from the shared store, and serves the request identically to a warm one."
		},
		{
			"heading": "streaming-and-connections",
			"content": "Serverless adapters support response streaming where the runtime permits it. Long-lived connections are a different story:"
		},
		{
			"heading": "streaming-and-connections",
			"content": "**WebSockets** on serverless use the channels API, backed by durable storage for stateful connections."
		},
		{
			"heading": "streaming-and-connections",
			"content": "**SSE** is available as a fallback when WebSockets are unavailable on the host."
		},
		{
			"heading": "streaming-and-connections",
			"content": "Route rules that control caching semantics (swr, static, passthrough) behave per provider — check how your platform handles cache headers and invalidation."
		},
		{
			"heading": "streaming-and-connections",
			"content": "Streaming-first SSR works on function targets as long as the platform supports streaming responses; the SSR shell streams under 50 ms on the example application, while deferred loaders resolve in the background. Verdict first, bytes later — but only on runtimes that honor the streaming contract."
		},
		{
			"heading": "edge-variants",
			"content": "Several serverless adapters target **edge runtimes**: worker-style output that runs close to the user. The edge-safe constraint set applies in full — and the payoff is route rules like per-page static and passthrough caching that behave close to CDN semantics. WebSockets on the edge use the channels pattern over durable storage."
		},
		{
			"heading": "edge-variants",
			"content": "Function vs edge"
		},
		{
			"heading": "edge-variants",
			"content": "Functions"
		},
		{
			"heading": "edge-variants",
			"content": "Edge workers"
		},
		{
			"heading": "edge-variants",
			"content": "Runtime location"
		},
		{
			"heading": "edge-variants",
			"content": "Regional datacenters"
		},
		{
			"heading": "edge-variants",
			"content": "Points of presence, close to users"
		},
		{
			"heading": "edge-variants",
			"content": "Connection model"
		},
		{
			"heading": "edge-variants",
			"content": "Request-scoped"
		},
		{
			"heading": "edge-variants",
			"content": "Request-scoped"
		},
		{
			"heading": "edge-variants",
			"content": "Caching payoff"
		},
		{
			"heading": "edge-variants",
			"content": "Route rules honored"
		},
		{
			"heading": "edge-variants",
			"content": "Route rules behave near-CDN"
		},
		{
			"heading": "edge-variants",
			"content": "WebSockets"
		},
		{
			"heading": "edge-variants",
			"content": "Channels over durable storage"
		},
		{
			"heading": "edge-variants",
			"content": "Channels over durable storage"
		},
		{
			"heading": "edge-variants",
			"content": "State allowed"
		},
		{
			"heading": "edge-variants",
			"content": "Externalized only"
		},
		{
			"heading": "edge-variants",
			"content": "Externalized only, no local storage"
		},
		{
			"heading": "edge-variants",
			"content": "Whether you deploy functions or edge workers, the constraint discipline is identical and the app code is unchanged — the adapter is the only difference."
		},
		{
			"heading": "whats-next",
			"content": "Runtime Adapters — the full adapter matrix and selection flow"
		},
		{
			"heading": "whats-next",
			"content": "Node/Bun Deployment — the always-available alternative"
		},
		{
			"heading": "whats-next",
			"content": "Container Deployment — image-based hosting with the same artifact"
		},
		{
			"heading": "whats-next",
			"content": "Production Checklist — stateless and externalized-state checks"
		},
		{
			"heading": "whats-next",
			"content": "Background Work — where queue workers and tasks run"
		}
	],
	"headings": [
		{
			"id": "overview",
			"content": "Overview"
		},
		{
			"id": "build-for-serverless",
			"content": "Build for Serverless"
		},
		{
			"id": "selection",
			"content": "Selection"
		},
		{
			"id": "the-deploy-command-flow",
			"content": "The Deploy Command Flow"
		},
		{
			"id": "rollback",
			"content": "Rollback"
		},
		{
			"id": "stateless-constraints",
			"content": "Stateless Constraints"
		},
		{
			"id": "cold-starts-and-externalized-state",
			"content": "Cold Starts and Externalized State"
		},
		{
			"id": "streaming-and-connections",
			"content": "Streaming and Connections"
		},
		{
			"id": "edge-variants",
			"content": "Edge Variants"
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
		url: "#build-for-serverless",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Build for Serverless" })
	},
	{
		depth: 3,
		url: "#selection",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Selection" })
	},
	{
		depth: 2,
		url: "#the-deploy-command-flow",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Deploy Command Flow" })
	},
	{
		depth: 3,
		url: "#rollback",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Rollback" })
	},
	{
		depth: 2,
		url: "#stateless-constraints",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Stateless Constraints" })
	},
	{
		depth: 2,
		url: "#cold-starts-and-externalized-state",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Cold Starts and Externalized State" })
	},
	{
		depth: 2,
		url: "#streaming-and-connections",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Streaming and Connections" })
	},
	{
		depth: 2,
		url: "#edge-variants",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Edge Variants" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "overview",
			children: "Overview"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Serverless adapters reinterpret the built application as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "function output" }),
			": instead of a long-lived server process, each request is handled by an ephemeral, elastically-scaled function. The same models, controllers, middleware, and pages you wrote for a Node runtime deploy to a serverless host unchanged."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva's serverless story is deliberately platform-agnostic. One build pipeline produces ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			" and the adapter shapes it for the target function runtime — with the serverless constraints baked into the docs so you know exactly what to design for."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The platform-agnosticism has a second payoff: the same artifact builds for edge runtimes (worker-style output that runs close to the user) and for classic region-based functions. Your code does not know or care which one it became — the differences live in the adapter and the constraint set." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "build-for-serverless",
			children: "Build for Serverless"
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
							children: " --preset"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " aws-lambda"
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
							children: " aws-lambda-sst"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The output is still ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			" with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "server/" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "public/" }),
			"; the adapter packages the server entry as a function. Response streaming is available but must be enabled explicitly on the function runtime — check the adapter's configuration, because streaming is not automatic everywhere. On Lambda-family targets that means opting into the streaming response mode explicitly; if you need it, set it before you rely on streaming anywhere in the app."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "selection",
			children: "Selection"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Most serverless platforms are auto-detected when your continuous-integration runner deploys. When one is not, or you want to pin a target, choose explicitly:" }),
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
							children: "                      # auto-detected in CI"
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
							children: "KWIVA_PRESET"
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
							children: "aws-lambda"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " kwiva"
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
							children: "   # forced in the build environment"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Or set ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deploy.preset" }),
			" in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
			" as the committed default:"
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
			title: "selection.ts",
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  deploy: {"
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
							children: "    preset: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'aws-lambda'"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  },"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }), " runs any built preset locally, so you can validate the exact serverless artifact before pushing."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!TIP]\nPin the preset explicitly when you deploy from your own machines or a generic runner. Auto-detection is a convenience for platforms that publish their own build pipeline signals; a committed ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deploy.preset" }),
				" is reproducible everywhere."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-deploy-command-flow",
			children: "The Deploy Command Flow"
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
						children: " deploy"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " [provider]"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy" }), " is a thin wrapper around the provider's deploy path:"] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "It runs the built artifact through the provider's own deploy tooling (functions upload, plain artifact sync, or platform API calls)." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "It honors provider-specific credentials supplied as environment tokens to the deploy CLI." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"It prints the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "artifact digest" }),
				" and the deploy command it executed, so builds are traceable."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Self-hosting is always an option: keep the build, upload the artifact yourself, and run it however your serverless host expects." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "rollback",
			children: "Rollback"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Keep N previous builds. Managed serverless platforms handle env-based rollback for you; self-hosters keep a tar of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			". Rolling back is therefore a pointer swap, not a code change. Because each deploy is a discrete artifact rather than an in-place mutation, reverting to the previous behavior is always one repoint away."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "stateless-constraints",
			children: "Stateless Constraints"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Serverless functions are ephemeral and elastic. Design for these rules:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No long-lived in-memory state across requests." }),
				" Use the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage" }),
				" APIs instead of process-level singletons."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Database access goes through the model layer" }), " over an env-defined connector — never raw sockets or connection pooling hacks in app code."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [
				"Read ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "process.env" }),
				" only at startup."
			] }), " Inject via typed env and config so functions stay pure between invocations."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Avoid exclusive runtime-only APIs" }), " — prefer platform Web APIs."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Multi-core is not automatic" }), " — serverless scales out by number of instances, not cores."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Loaders and handlers must be statically importable" }), " — no dynamic imports at runtime."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The app kernel is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "stateless by construction" }),
			": sessions, cache, queue, and storage are externalized by default. That is what makes elastic scaling safe. An instance is never assumed to survive a single request, so the fleet can grow and shrink with traffic without any correctness loss."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "cold-starts-and-externalized-state",
			children: "Cold Starts and Externalized State"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Functions may go idle and start cold on the next request. Mitigate in three ways:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Keep the function lean" }), " — heavy initialization (like telemetry or queue transport setup) belongs in providers that run once at boot, not per request. If boot time is dominated by per-request work, move that work into the model and cache layers."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Externalize session state" }), " — the session store is pluggable (cookie, shared broker, or database backends). When a request lands on any instance, the session must resolve from a shared store, not instance memory."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Externalize everything shared" }), " — cache hits and queued jobs come from shared cache and queue infrastructure, and uploaded files live in object storage, so any instance can serve any request."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Cold starts are a platform property, not a framework property — Kwiva cannot eliminate them, but it removes every reason a cold function would behave incorrectly. A fresh instance boots, reads typed configuration, resolves a session from the shared store, and serves the request identically to a warm one." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "streaming-and-connections",
			children: "Streaming and Connections"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Serverless adapters support response streaming where the runtime permits it. Long-lived connections are a different story:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "WebSockets" }), " on serverless use the channels API, backed by durable storage for stateful connections."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "SSE" }), " is available as a fallback when WebSockets are unavailable on the host."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Route rules that control caching semantics (swr, static, passthrough) behave per provider — check how your platform handles cache headers and invalidation." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Streaming-first SSR works on function targets as long as the platform supports streaming responses; the SSR shell streams under 50 ms on the example application, while deferred loaders resolve in the background. Verdict first, bytes later — but only on runtimes that honor the streaming contract." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "edge-variants",
			children: "Edge Variants"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Several serverless adapters target ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "edge runtimes" }),
			": worker-style output that runs close to the user. The edge-safe constraint set applies in full — and the payoff is route rules like per-page static and passthrough caching that behave close to CDN semantics. WebSockets on the edge use the channels pattern over durable storage."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Function vs edge" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Functions" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Edge workers" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Runtime location" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Regional datacenters" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Points of presence, close to users" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Connection model" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Request-scoped" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Request-scoped" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Caching payoff" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route rules honored" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route rules behave near-CDN" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "WebSockets" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Channels over durable storage" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Channels over durable storage" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "State allowed" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Externalized only" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Externalized only, no local storage" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Whether you deploy functions or edge workers, the constraint discipline is identical and the app code is unchanged — the adapter is the only difference." }),
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
			}), " — the full adapter matrix and selection flow"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/node-bun",
				children: "Node/Bun Deployment"
			}), " — the always-available alternative"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/containers",
				children: "Container Deployment"
			}), " — image-based hosting with the same artifact"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}), " — stateless and externalized-state checks"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work",
				children: "Background Work"
			}), " — where queue workers and tasks run"] }),
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
