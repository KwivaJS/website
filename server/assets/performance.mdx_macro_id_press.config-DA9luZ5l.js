import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/advanced/performance.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Performance",
	"description": "Rust-speed static machinery, a native TypeScript runtime, streaming-first SSR, layered caching, and type-level inference with zero runtime codegen."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nPerformance in Kwiva is designed in, not bolted on. Four engineering decisions carry most of the weight: static machinery built on a Rust-speed toolchain, a native TypeScript runtime, streaming-first server rendering, and caching at three layers. On top of that, all type inference is done at the type level with zero runtime code generation, which keeps both compile-time and runtime costs low.\n\n## The Performance Story [#the-performance-story]\n\n| Pillar                      | What it does for you                                                                 |\n| --------------------------- | ------------------------------------------------------------------------------------ |\n| Rust-speed static machinery | Sub-second checks, fast cold builds, incremental builds in about two seconds         |\n| Native TypeScript runtime   | No compile step in development; native execution, fast startup, single-binary output |\n| Streaming-first SSR         | The page shell streams in under 50 ms while slow queries resolve in the background   |\n| Layered caching             | Route rules at the edge, model cache in the server, client cache in the browser      |\n| Type-level inference        | End-to-end types with zero runtime codegen                                           |\n\nThese pillars are chosen to reinforce each other rather than each taking a turn at the top of the profile. Native execution removes the dev-time compile tax, the toolchain removes the build-time tax, streaming removes the block-on-slowest-loader tax, and caching removes the repeat-request tax. The result is a system where no single stage is the habitual bottleneck.\n\n## Rust-Speed Static Machinery [#rust-speed-static-machinery]\n\nThe `kwiva` CLI is built directly on a Rust-speed toolchain — the components are native and bound into the CLI, not emulated. The bundler pipeline produces client and server production builds with code splitting and tree shaking; the TS/JSX transformer lower targets and powers upgrade codemods; the resolver serves the development module graph; the minifier shrinks production output; and the built-in linter and formatter gate every conventional rule your code must satisfy.\n\nThe CI-gated budgets on the example application:\n\n| Command                         | Budget                     |\n| ------------------------------- | -------------------------- |\n| `kwiva check` (lint and format) | Under 1 second             |\n| `kwiva build` cold              | Under 10 seconds           |\n| `kwiva build` incremental       | Under 2 seconds            |\n| Dev server boot                 | Under 500 ms to first byte |\n\nBecause the machinery is native and statically linked into the CLI, the numbers come from the compiler, not from warm caches and optimism. `kwiva check` (lint and format) runs under a second, so the convention gates can be a part of every local save, not a pre-merge ritual.\n\n## Native TypeScript Runtime [#native-typescript-runtime]\n\nKwiva's primary runtime executes TypeScript directly — no separate compile step in development. The dev server serves native modules on the fly, transforming TS and JSX only as needed and caching the result. The practical effects:\n\n* **Instant startup** — the dev server is ready in well under a second\n* **Hot module replacement** — page changes hot-swap components, controller and model changes reload routes without dropping session state, and config changes prompt a full reload\n* **Single-binary output** — `kwiva build --binary` produces a standalone artifact from the same codebase when you need it\n\nServer code is not bundled in development at all; it executes through the same pipeline that a production server runs, which means dev behavior matches prod behavior. Because there is no development-only module graph for server code, there is no class of \"works in dev, breaks in the bundle\" bugs to chase.\n\n## Streaming-First SSR [#streaming-first-ssr]\n\nPage rendering is streaming-first. Loaders run in parallel, and a loader can defer a slow promise with the stream primitive so the HTML shell streams immediately while the deferred data arrives later. The tree hydrates in place, and route-level rules let you move any page to static, ISR, or SWR output.\n\nThe result on the example application is an SSR shell that begins streaming in under 50 ms, with the slowest parts — typically comments or secondary lists — arriving as streaming chunks rather than blocking the first paint.\n\nStreaming matters more than the shell numbers suggest: it moves the performance conversation from \"how fast is the whole page\" to \"how fast is the first useful paint.\" Loaders race in parallel, deferred promises surrender their placeholder, and the shell — not the slowest query — sets the perceived latency.\n\n## Layered Caching [#layered-caching]\n\nCaching is layered by design, with each layer answering a different question:\n\n| Layer        | Controlled by                                                                                        | Answers                                                    |\n| ------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |\n| Route rules  | Route rules on paths — `cache`, `swr`, `isr`, `static`, `prerender`                                  | Is this page actually cached at the edge or in the server? |\n| Model cache  | The cache API — `cache.get`, `cache.set`, `cache.wrap`, `cache.invalidate`, TTL and tag invalidation | Can we skip the database query?                            |\n| Client cache | Data hooks — `staleTime`, `gcTime`, `refetchOnWindowFocus`, optimistic updates                       | Do we even need to refetch in the browser?                 |\n\nTags make invalidation surgical: `invalidateTags(['posts'])` evicts exactly the entries labeled for that tag, across the edges that honor it. The cache backends are configured entirely through `src/config/cache.ts`, and the same pluggable session store uses the storage mounts underneath.\n\nThe three layers compose naturally. An ISR page might serve from the route-rule layer for visitors, hit the model cache for the warm data, and no-op the client cache because hydration already received the loader data. Each layer is a check that can be skipped — the winner is whichever cache answers first.\n\n## The Response Budget [#the-response-budget]\n\nThe pipeline is budgeted at every stage, and the budgets are trace spans you can read in production:\n\n| Stage                         | Budget (p50, example application) |\n| ----------------------------- | --------------------------------- |\n| Adapter to pipeline entry     | Under 1 ms                        |\n| Session and tenant resolution | Under 2 ms on a store hit         |\n| Validation (compiled schema)  | Under 0.5 ms                      |\n| Handler (model list, 20 rows) | Under 5 ms                        |\n| Full API round-trip (local)   | Under 15 ms                       |\n| SSR shell (stream start)      | Under 50 ms                       |\n\nEvery stage is a span in the request trace, so a response that misses its budget points at its own span: adapter, session, validation, handler, or rendering. In development the overlay renders the per-request waterfall; in production the same spans flow through the observability layer.\n\n## Type-Level Inference with Zero Runtime Codegen [#type-level-inference-with-zero-runtime-codegen]\n\nShipping end-to-end types usually means running a code generator and remembering to run it again. Kwiva does the opposite: types flow through the stack at the type level, from `defineModel` through `defineController` to `@kwiva/client`, page loaders, and data hooks — no codegen for types, no manual annotations, no generated declaration files to keep fresh.\n\nThe model IR and route manifest written into `src/.kwiva/` are compiled once and reused by the client, OpenAPI, and MCP, so the type graph and the runtime artifacts agree without a second generation pass. Because types are an inference product rather than a generated file, they can never be stale — you cannot forget to run a step that does not exist.\n\n## A Production Performance Checklist [#a-production-performance-checklist]\n\nBefore you ship, walk this list:\n\n1. **Choose the right preset** — output for your target host (node, Bun, edge, static) via the engine presets; the application code does not change.\n2. **Set route rules deliberately** — decide which pages are static, ISR, or SWR; public pages that skip auth entirely should be cached early in the pipeline.\n3. **Use the query builder deliberately** — select only the columns you need, rely on indexes declared on the model, and enable `withCount` and relation loading rather than N+1 loops.\n4. **Leverage the client cache** — set sane `staleTime` values and use optimistic updates for mutations so most interactions never hit the network.\n5. **Watch the metrics** — keep an eye on request latency, model query duration, and cache hit rate via the observability layer.\n6. **Confirm the budgets** — `kwiva check` under a second, cold builds under ten, streaming shells under 50 ms.\n\nThe checklist is ordered by leverage: the preset decides the whole serving model, route rules decide how much of the fleet's traffic never reaches the server, and the query builder decides how much work each warmed-up request does. Metrics then tell you which assumption broke first.\n\n## What's Next [#whats-next]\n\n* [Streaming SSR](/docs/rendering/streaming) — Suspense-aware streaming and deferred loaders\n* [Caching Strategies](/docs/rendering/caching) — Route rules: static, ISR, SWR, prerender\n* [HTTP Caching](/docs/http/caching) — Route rules and response cache tags on the API side\n* [Metrics](/docs/observability/metrics) — Request, query, queue, and cache metrics for production\n* [Production Checklist](/docs/deployment/production-checklist) — Hardening and tuning before you deploy\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Performance in Kwiva is designed in, not bolted on. Four engineering decisions carry most of the weight: static machinery built on a Rust-speed toolchain, a native TypeScript runtime, streaming-first server rendering, and caching at three layers. On top of that, all type inference is done at the type level with zero runtime code generation, which keeps both compile-time and runtime costs low."
		},
		{
			"heading": "the-performance-story",
			"content": "Pillar"
		},
		{
			"heading": "the-performance-story",
			"content": "What it does for you"
		},
		{
			"heading": "the-performance-story",
			"content": "Rust-speed static machinery"
		},
		{
			"heading": "the-performance-story",
			"content": "Sub-second checks, fast cold builds, incremental builds in about two seconds"
		},
		{
			"heading": "the-performance-story",
			"content": "Native TypeScript runtime"
		},
		{
			"heading": "the-performance-story",
			"content": "No compile step in development; native execution, fast startup, single-binary output"
		},
		{
			"heading": "the-performance-story",
			"content": "Streaming-first SSR"
		},
		{
			"heading": "the-performance-story",
			"content": "The page shell streams in under 50 ms while slow queries resolve in the background"
		},
		{
			"heading": "the-performance-story",
			"content": "Layered caching"
		},
		{
			"heading": "the-performance-story",
			"content": "Route rules at the edge, model cache in the server, client cache in the browser"
		},
		{
			"heading": "the-performance-story",
			"content": "Type-level inference"
		},
		{
			"heading": "the-performance-story",
			"content": "End-to-end types with zero runtime codegen"
		},
		{
			"heading": "the-performance-story",
			"content": "These pillars are chosen to reinforce each other rather than each taking a turn at the top of the profile. Native execution removes the dev-time compile tax, the toolchain removes the build-time tax, streaming removes the block-on-slowest-loader tax, and caching removes the repeat-request tax. The result is a system where no single stage is the habitual bottleneck."
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "The `kwiva` CLI is built directly on a Rust-speed toolchain — the components are native and bound into the CLI, not emulated. The bundler pipeline produces client and server production builds with code splitting and tree shaking; the TS/JSX transformer lower targets and powers upgrade codemods; the resolver serves the development module graph; the minifier shrinks production output; and the built-in linter and formatter gate every conventional rule your code must satisfy."
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "The CI-gated budgets on the example application:"
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "Command"
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "Budget"
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "`kwiva check` (lint and format)"
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "Under 1 second"
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "`kwiva build` cold"
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "Under 10 seconds"
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "`kwiva build` incremental"
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "Under 2 seconds"
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "Dev server boot"
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "Under 500 ms to first byte"
		},
		{
			"heading": "rust-speed-static-machinery",
			"content": "Because the machinery is native and statically linked into the CLI, the numbers come from the compiler, not from warm caches and optimism. `kwiva check` (lint and format) runs under a second, so the convention gates can be a part of every local save, not a pre-merge ritual."
		},
		{
			"heading": "native-typescript-runtime",
			"content": "Kwiva's primary runtime executes TypeScript directly — no separate compile step in development. The dev server serves native modules on the fly, transforming TS and JSX only as needed and caching the result. The practical effects:"
		},
		{
			"heading": "native-typescript-runtime",
			"content": "**Instant startup** — the dev server is ready in well under a second"
		},
		{
			"heading": "native-typescript-runtime",
			"content": "**Hot module replacement** — page changes hot-swap components, controller and model changes reload routes without dropping session state, and config changes prompt a full reload"
		},
		{
			"heading": "native-typescript-runtime",
			"content": "**Single-binary output** — `kwiva build --binary` produces a standalone artifact from the same codebase when you need it"
		},
		{
			"heading": "native-typescript-runtime",
			"content": "Server code is not bundled in development at all; it executes through the same pipeline that a production server runs, which means dev behavior matches prod behavior. Because there is no development-only module graph for server code, there is no class of \"works in dev, breaks in the bundle\" bugs to chase."
		},
		{
			"heading": "streaming-first-ssr",
			"content": "Page rendering is streaming-first. Loaders run in parallel, and a loader can defer a slow promise with the stream primitive so the HTML shell streams immediately while the deferred data arrives later. The tree hydrates in place, and route-level rules let you move any page to static, ISR, or SWR output."
		},
		{
			"heading": "streaming-first-ssr",
			"content": "The result on the example application is an SSR shell that begins streaming in under 50 ms, with the slowest parts — typically comments or secondary lists — arriving as streaming chunks rather than blocking the first paint."
		},
		{
			"heading": "streaming-first-ssr",
			"content": "Streaming matters more than the shell numbers suggest: it moves the performance conversation from \"how fast is the whole page\" to \"how fast is the first useful paint.\" Loaders race in parallel, deferred promises surrender their placeholder, and the shell — not the slowest query — sets the perceived latency."
		},
		{
			"heading": "layered-caching",
			"content": "Caching is layered by design, with each layer answering a different question:"
		},
		{
			"heading": "layered-caching",
			"content": "Layer"
		},
		{
			"heading": "layered-caching",
			"content": "Controlled by"
		},
		{
			"heading": "layered-caching",
			"content": "Answers"
		},
		{
			"heading": "layered-caching",
			"content": "Route rules"
		},
		{
			"heading": "layered-caching",
			"content": "Route rules on paths — `cache`, `swr`, `isr`, `static`, `prerender`"
		},
		{
			"heading": "layered-caching",
			"content": "Is this page actually cached at the edge or in the server?"
		},
		{
			"heading": "layered-caching",
			"content": "Model cache"
		},
		{
			"heading": "layered-caching",
			"content": "The cache API — `cache.get`, `cache.set`, `cache.wrap`, `cache.invalidate`, TTL and tag invalidation"
		},
		{
			"heading": "layered-caching",
			"content": "Can we skip the database query?"
		},
		{
			"heading": "layered-caching",
			"content": "Client cache"
		},
		{
			"heading": "layered-caching",
			"content": "Data hooks — `staleTime`, `gcTime`, `refetchOnWindowFocus`, optimistic updates"
		},
		{
			"heading": "layered-caching",
			"content": "Do we even need to refetch in the browser?"
		},
		{
			"heading": "layered-caching",
			"content": "Tags make invalidation surgical: `invalidateTags(['posts'])` evicts exactly the entries labeled for that tag, across the edges that honor it. The cache backends are configured entirely through `src/config/cache.ts`, and the same pluggable session store uses the storage mounts underneath."
		},
		{
			"heading": "layered-caching",
			"content": "The three layers compose naturally. An ISR page might serve from the route-rule layer for visitors, hit the model cache for the warm data, and no-op the client cache because hydration already received the loader data. Each layer is a check that can be skipped — the winner is whichever cache answers first."
		},
		{
			"heading": "the-response-budget",
			"content": "The pipeline is budgeted at every stage, and the budgets are trace spans you can read in production:"
		},
		{
			"heading": "the-response-budget",
			"content": "Stage"
		},
		{
			"heading": "the-response-budget",
			"content": "Budget (p50, example application)"
		},
		{
			"heading": "the-response-budget",
			"content": "Adapter to pipeline entry"
		},
		{
			"heading": "the-response-budget",
			"content": "Under 1 ms"
		},
		{
			"heading": "the-response-budget",
			"content": "Session and tenant resolution"
		},
		{
			"heading": "the-response-budget",
			"content": "Under 2 ms on a store hit"
		},
		{
			"heading": "the-response-budget",
			"content": "Validation (compiled schema)"
		},
		{
			"heading": "the-response-budget",
			"content": "Under 0.5 ms"
		},
		{
			"heading": "the-response-budget",
			"content": "Handler (model list, 20 rows)"
		},
		{
			"heading": "the-response-budget",
			"content": "Under 5 ms"
		},
		{
			"heading": "the-response-budget",
			"content": "Full API round-trip (local)"
		},
		{
			"heading": "the-response-budget",
			"content": "Under 15 ms"
		},
		{
			"heading": "the-response-budget",
			"content": "SSR shell (stream start)"
		},
		{
			"heading": "the-response-budget",
			"content": "Under 50 ms"
		},
		{
			"heading": "the-response-budget",
			"content": "Every stage is a span in the request trace, so a response that misses its budget points at its own span: adapter, session, validation, handler, or rendering. In development the overlay renders the per-request waterfall; in production the same spans flow through the observability layer."
		},
		{
			"heading": "type-level-inference-with-zero-runtime-codegen",
			"content": "Shipping end-to-end types usually means running a code generator and remembering to run it again. Kwiva does the opposite: types flow through the stack at the type level, from `defineModel` through `defineController` to `@kwiva/client`, page loaders, and data hooks — no codegen for types, no manual annotations, no generated declaration files to keep fresh."
		},
		{
			"heading": "type-level-inference-with-zero-runtime-codegen",
			"content": "The model IR and route manifest written into `src/.kwiva/` are compiled once and reused by the client, OpenAPI, and MCP, so the type graph and the runtime artifacts agree without a second generation pass. Because types are an inference product rather than a generated file, they can never be stale — you cannot forget to run a step that does not exist."
		},
		{
			"heading": "a-production-performance-checklist",
			"content": "Before you ship, walk this list:"
		},
		{
			"heading": "a-production-performance-checklist",
			"content": "**Choose the right preset** — output for your target host (node, Bun, edge, static) via the engine presets; the application code does not change."
		},
		{
			"heading": "a-production-performance-checklist",
			"content": "**Set route rules deliberately** — decide which pages are static, ISR, or SWR; public pages that skip auth entirely should be cached early in the pipeline."
		},
		{
			"heading": "a-production-performance-checklist",
			"content": "**Use the query builder deliberately** — select only the columns you need, rely on indexes declared on the model, and enable `withCount` and relation loading rather than N+1 loops."
		},
		{
			"heading": "a-production-performance-checklist",
			"content": "**Leverage the client cache** — set sane `staleTime` values and use optimistic updates for mutations so most interactions never hit the network."
		},
		{
			"heading": "a-production-performance-checklist",
			"content": "**Watch the metrics** — keep an eye on request latency, model query duration, and cache hit rate via the observability layer."
		},
		{
			"heading": "a-production-performance-checklist",
			"content": "**Confirm the budgets** — `kwiva check` under a second, cold builds under ten, streaming shells under 50 ms."
		},
		{
			"heading": "a-production-performance-checklist",
			"content": "The checklist is ordered by leverage: the preset decides the whole serving model, route rules decide how much of the fleet's traffic never reaches the server, and the query builder decides how much work each warmed-up request does. Metrics then tell you which assumption broke first."
		},
		{
			"heading": "whats-next",
			"content": "Streaming SSR — Suspense-aware streaming and deferred loaders"
		},
		{
			"heading": "whats-next",
			"content": "Caching Strategies — Route rules: static, ISR, SWR, prerender"
		},
		{
			"heading": "whats-next",
			"content": "HTTP Caching — Route rules and response cache tags on the API side"
		},
		{
			"heading": "whats-next",
			"content": "Metrics — Request, query, queue, and cache metrics for production"
		},
		{
			"heading": "whats-next",
			"content": "Production Checklist — Hardening and tuning before you deploy"
		}
	],
	"headings": [
		{
			"id": "the-performance-story",
			"content": "The Performance Story"
		},
		{
			"id": "rust-speed-static-machinery",
			"content": "Rust-Speed Static Machinery"
		},
		{
			"id": "native-typescript-runtime",
			"content": "Native TypeScript Runtime"
		},
		{
			"id": "streaming-first-ssr",
			"content": "Streaming-First SSR"
		},
		{
			"id": "layered-caching",
			"content": "Layered Caching"
		},
		{
			"id": "the-response-budget",
			"content": "The Response Budget"
		},
		{
			"id": "type-level-inference-with-zero-runtime-codegen",
			"content": "Type-Level Inference with Zero Runtime Codegen"
		},
		{
			"id": "a-production-performance-checklist",
			"content": "A Production Performance Checklist"
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
		url: "#the-performance-story",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Performance Story" })
	},
	{
		depth: 2,
		url: "#rust-speed-static-machinery",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Rust-Speed Static Machinery" })
	},
	{
		depth: 2,
		url: "#native-typescript-runtime",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Native TypeScript Runtime" })
	},
	{
		depth: 2,
		url: "#streaming-first-ssr",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Streaming-First SSR" })
	},
	{
		depth: 2,
		url: "#layered-caching",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layered Caching" })
	},
	{
		depth: 2,
		url: "#the-response-budget",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Response Budget" })
	},
	{
		depth: 2,
		url: "#type-level-inference-with-zero-runtime-codegen",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Type-Level Inference with Zero Runtime Codegen" })
	},
	{
		depth: 2,
		url: "#a-production-performance-checklist",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "A Production Performance Checklist" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Performance in Kwiva is designed in, not bolted on. Four engineering decisions carry most of the weight: static machinery built on a Rust-speed toolchain, a native TypeScript runtime, streaming-first server rendering, and caching at three layers. On top of that, all type inference is done at the type level with zero runtime code generation, which keeps both compile-time and runtime costs low." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-performance-story",
			children: "The Performance Story"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Pillar" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it does for you" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rust-speed static machinery" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sub-second checks, fast cold builds, incremental builds in about two seconds" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Native TypeScript runtime" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "No compile step in development; native execution, fast startup, single-binary output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Streaming-first SSR" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The page shell streams in under 50 ms while slow queries resolve in the background" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Layered caching" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route rules at the edge, model cache in the server, client cache in the browser" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Type-level inference" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "End-to-end types with zero runtime codegen" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "These pillars are chosen to reinforce each other rather than each taking a turn at the top of the profile. Native execution removes the dev-time compile tax, the toolchain removes the build-time tax, streaming removes the block-on-slowest-loader tax, and caching removes the repeat-request tax. The result is a system where no single stage is the habitual bottleneck." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "rust-speed-static-machinery",
			children: "Rust-Speed Static Machinery"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva" }),
			" CLI is built directly on a Rust-speed toolchain — the components are native and bound into the CLI, not emulated. The bundler pipeline produces client and server production builds with code splitting and tree shaking; the TS/JSX transformer lower targets and powers upgrade codemods; the resolver serves the development module graph; the minifier shrinks production output; and the built-in linter and formatter gate every conventional rule your code must satisfy."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The CI-gated budgets on the example application:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Budget" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }), " (lint and format)"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 1 second" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }), " cold"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 10 seconds" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }), " incremental"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 2 seconds" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dev server boot" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 500 ms to first byte" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the machinery is native and statically linked into the CLI, the numbers come from the compiler, not from warm caches and optimism. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
			" (lint and format) runs under a second, so the convention gates can be a part of every local save, not a pre-merge ritual."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "native-typescript-runtime",
			children: "Native TypeScript Runtime"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva's primary runtime executes TypeScript directly — no separate compile step in development. The dev server serves native modules on the fly, transforming TS and JSX only as needed and caching the result. The practical effects:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Instant startup" }), " — the dev server is ready in well under a second"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Hot module replacement" }), " — page changes hot-swap components, controller and model changes reload routes without dropping session state, and config changes prompt a full reload"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Single-binary output" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --binary" }),
				" produces a standalone artifact from the same codebase when you need it"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Server code is not bundled in development at all; it executes through the same pipeline that a production server runs, which means dev behavior matches prod behavior. Because there is no development-only module graph for server code, there is no class of \"works in dev, breaks in the bundle\" bugs to chase." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "streaming-first-ssr",
			children: "Streaming-First SSR"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Page rendering is streaming-first. Loaders run in parallel, and a loader can defer a slow promise with the stream primitive so the HTML shell streams immediately while the deferred data arrives later. The tree hydrates in place, and route-level rules let you move any page to static, ISR, or SWR output." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The result on the example application is an SSR shell that begins streaming in under 50 ms, with the slowest parts — typically comments or secondary lists — arriving as streaming chunks rather than blocking the first paint." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Streaming matters more than the shell numbers suggest: it moves the performance conversation from \"how fast is the whole page\" to \"how fast is the first useful paint.\" Loaders race in parallel, deferred promises surrender their placeholder, and the shell — not the slowest query — sets the perceived latency." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layered-caching",
			children: "Layered Caching"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Caching is layered by design, with each layer answering a different question:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Layer" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Controlled by" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Answers" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route rules" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Route rules on paths — ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Is this page actually cached at the edge or in the server?" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model cache" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"The cache API — ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache.get" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache.set" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache.wrap" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache.invalidate" }),
					", TTL and tag invalidation"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Can we skip the database query?" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Client cache" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Data hooks — ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "staleTime" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "gcTime" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "refetchOnWindowFocus" }),
					", optimistic updates"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Do we even need to refetch in the browser?" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Tags make invalidation surgical: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidateTags(['posts'])" }),
			" evicts exactly the entries labeled for that tag, across the edges that honor it. The cache backends are configured entirely through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/cache.ts" }),
			", and the same pluggable session store uses the storage mounts underneath."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The three layers compose naturally. An ISR page might serve from the route-rule layer for visitors, hit the model cache for the warm data, and no-op the client cache because hydration already received the loader data. Each layer is a check that can be skipped — the winner is whichever cache answers first." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-response-budget",
			children: "The Response Budget"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pipeline is budgeted at every stage, and the budgets are trace spans you can read in production:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Stage" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Budget (p50, example application)" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Adapter to pipeline entry" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 1 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Session and tenant resolution" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 2 ms on a store hit" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Validation (compiled schema)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 0.5 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Handler (model list, 20 rows)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 5 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Full API round-trip (local)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 15 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR shell (stream start)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 50 ms" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every stage is a span in the request trace, so a response that misses its budget points at its own span: adapter, session, validation, handler, or rendering. In development the overlay renders the per-request waterfall; in production the same spans flow through the observability layer." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "type-level-inference-with-zero-runtime-codegen",
			children: "Type-Level Inference with Zero Runtime Codegen"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Shipping end-to-end types usually means running a code generator and remembering to run it again. Kwiva does the opposite: types flow through the stack at the type level, from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
			" to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }),
			", page loaders, and data hooks — no codegen for types, no manual annotations, no generated declaration files to keep fresh."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The model IR and route manifest written into ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/" }),
			" are compiled once and reused by the client, OpenAPI, and MCP, so the type graph and the runtime artifacts agree without a second generation pass. Because types are an inference product rather than a generated file, they can never be stale — you cannot forget to run a step that does not exist."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "a-production-performance-checklist",
			children: "A Production Performance Checklist"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Before you ship, walk this list:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Choose the right preset" }), " — output for your target host (node, Bun, edge, static) via the engine presets; the application code does not change."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Set route rules deliberately" }), " — decide which pages are static, ISR, or SWR; public pages that skip auth entirely should be cached early in the pipeline."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Use the query builder deliberately" }),
				" — select only the columns you need, rely on indexes declared on the model, and enable ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withCount" }),
				" and relation loading rather than N+1 loops."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Leverage the client cache" }),
				" — set sane ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "staleTime" }),
				" values and use optimistic updates for mutations so most interactions never hit the network."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Watch the metrics" }), " — keep an eye on request latency, model query duration, and cache hit rate via the observability layer."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Confirm the budgets" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				" under a second, cold builds under ten, streaming shells under 50 ms."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The checklist is ordered by leverage: the preset decides the whole serving model, route rules decide how much of the fleet's traffic never reaches the server, and the query builder decides how much work each warmed-up request does. Metrics then tell you which assumption broke first." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/streaming",
				children: "Streaming SSR"
			}), " — Suspense-aware streaming and deferred loaders"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}), " — Route rules: static, ISR, SWR, prerender"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/caching",
				children: "HTTP Caching"
			}), " — Route rules and response cache tags on the API side"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/metrics",
				children: "Metrics"
			}), " — Request, query, queue, and cache metrics for production"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}), " — Hardening and tuning before you deploy"] }),
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
