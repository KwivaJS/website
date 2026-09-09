import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/rendering/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Rendering",
	"description": "SSR, streaming, hydration, caching, static generation — the full rendering pipeline."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nThe framework owns the entire rendering pipeline — the server renders, the client hydrates, and everything in between is orchestrated by `@kwiva/react`. Because rendering is part of the framework surface rather than an external add-on, pages, loaders, data hooks, and the response cache share one design: the same cache, the same types, the same story from request to pixel. SSR orchestration is a locked decision (ADR-0006): the framework composes the request handler, streaming render, and dehydration instead of inheriting a third-party server-functions model.\n\nEvery page defaults to **full server-side rendering**: loaders run on the server, HTML streams to the client, and hydration transfers data without a refetch. From there, route rules let you choose — per path — whether a response is dynamically rendered, cached, revalidated, or prerendered at build time. Rendering is not one switch for the whole app; it is decided per route and composes with the data hooks on the client.\n\n## What Rendering Includes [#what-rendering-includes]\n\n| Topic                                             | What it covers                                                                   |\n| ------------------------------------------------- | -------------------------------------------------------------------------------- |\n| [Server-Side Rendering](/docs/rendering/ssr)      | The full SSR pipeline — router match, guards, parallel loaders, HTML, head/meta  |\n| [Streaming SSR](/docs/rendering/streaming)        | Suspense-aware HTML streaming, deferred segments with `stream()`                 |\n| [Hydration](/docs/rendering/hydration)            | Island-free full hydration, loader data handed to the client cache               |\n| [Caching Strategies](/docs/rendering/caching)     | Route rules — `cache`, `swr`, `isr`, `static`, `prerender` — and layered caching |\n| [Static Generation](/docs/rendering/prerendering) | Build-time crawling or explicit lists for static output                          |\n\n## The Server-Side Pipeline [#the-server-side-pipeline]\n\nEvery page participates in the same pipeline, whether it renders dynamically, from a cache, or at build time:\n\n```plaintext title=\"the-server-side-pipeline.txt\"\nrequest (page route)\n  → router match (owned router)\n  → route rules apply (cache hit? serve + bypass pipeline)\n  → beforeLoad guards (session → login redirects)\n  → loaders execute in parallel (server-side, via the typed client — in-process)\n  → suspense-aware HTML streaming\n  → response stream (status, headers, cookies from the pipeline)\nhydration (client)\n  → state rehydrates into the data-hook cache (no refetch of loader data)\n  → router resumes at the same route and search state\n```\n\nRoute rules short-circuit **before** context assembly — a cache hit serves the stored response and bypasses the pipeline, including session loading. That is what makes cached public pages fast: the request never reaches the render stage. See [Request Lifecycle](/docs/http/lifecycle) for the full ordering contract.\n\n## Choosing a Strategy per Route [#choosing-a-strategy-per-route]\n\nRendering is not one switch for the whole app — it is decided per route via route rules, and it composes with the data hooks on the client:\n\n| Strategy                 | Route rule                   | Fits when                                                    |\n| ------------------------ | ---------------------------- | ------------------------------------------------------------ |\n| Dynamic SSR              | (default)                    | Personalized, session-dependent, frequently changing content |\n| Cached response          | `cache: n`                   | Public payloads that change on a known window                |\n| Stale-while-revalidate   | `swr: n`                     | Read-heavy, mutable data that tolerates staleness            |\n| Incremental regeneration | `isr: n`                     | Public pages that change slowly, built on demand             |\n| Static at build          | `static` / `prerender: true` | Content fixed at build time — docs, marketing, static apps   |\n\nThe same application mixes strategies: a marketing site renders statically, product pages regenerate incrementally, and an account section is always dynamic. Route rules are declared per path on server routes, and are covered in full under [Caching Strategies](/docs/rendering/caching).\n\n## Streaming & Deferred Data [#streaming--deferred-data]\n\nStreaming SSR ships the shell of a page the moment blocking data resolves, and streams the rest in as its data resolves. Loaders split their work explicitly — awaited values block, `stream()`-wrapped promises defer:\n\n```tsx title=\"streaming-deferred-data.tsx\"\nloader: async ({ params, client }) => ({\n  post: await client.posts.get(params.id),                          // blocking\n  comments: stream(client.comments.list({ postId: params.id })),    // streams in\n})\n```\n\nThe rendering runtime flushes each suspense boundary the instant the deferred segment behind it is ready. Route rules operate on the **full stream** — a streamed page is cached as a whole, not piecemeal. See [Streaming SSR](/docs/rendering/streaming).\n\n## Hydration: A Cache Transfer [#hydration-a-cache-transfer]\n\nHydration is how the server-rendered page becomes a live application. Kwiva hydrates the **whole page** — island-free, no per-widget bootstrapping — and the server's state crosses the gap as a **cache transfer**: loader data and deferred values serialize into the stream and rehydrate into the client's data-hook cache under identical keys. The first interactive frame reads exactly what the server computed; nothing is refetched. See [Hydration](/docs/rendering/hydration).\n\n## Layered Caching [#layered-caching]\n\nCaching operates on three layers that compose:\n\n```plaintext title=\"layered-caching.txt\"\nroute rules   → HTTP response cache (cache / swr / isr / static)\nmodel cache   → server-side value cache with TTL and tags\nclient cache  → data-hook cache (staleTime / gcTime)\n```\n\n| Layer        | Answers                                 | Surface                                      |\n| ------------ | --------------------------------------- | -------------------------------------------- |\n| Route rules  | \"How old may the response be?\"          | `cache`, `swr`, `isr`, `static`, `prerender` |\n| Model cache  | \"How long may this derived value live?\" | `defineModel` cache option, `cache` API      |\n| Client cache | \"When should the browser re-pull?\"      | data-hook `staleTime` / `gcTime`             |\n\nInvalidation flows down the stack — `invalidateTags` purges route rules and server values carrying those tags, and `invalidate(Model)` refreshes client queries for the model. Each layer is covered in depth under [Caching Strategies](/docs/rendering/caching).\n\n## Personalization with Cached Shells [#personalization-with-cached-shells]\n\nCaching does not exclude logged-in users. The split pattern keeps a public shell cacheable (via `isr` or `static`) while user-specific fragments load client-side through data hooks from session-scoped endpoints — keyed per user, never cached:\n\n```plaintext title=\"personalization-with-cached-shells.txt\"\n/products/**  isr cached shell   → same for every visitor\n                └─ session-scoped fragments → loaded client-side, never cached\n```\n\nThe framework refuses to cache responses that set `Set-Cookie`, so a cached page can never leak a session to another user. Session-bearing responses stay dynamic by force of contract. See [Hydration](/docs/rendering/hydration) and [Caching Strategies](/docs/rendering/caching).\n\n## Static Generation [#static-generation]\n\nThe strongest strategy is no server at all. `static` and `prerender` routes render once at `kwiva build` and emit HTML, assets, and JSON that a static host serves directly. Static and ISR share one artifact model — a page that is `static` today can be promoted to `isr: n` when content starts changing. See [Static Generation](/docs/rendering/prerendering).\n\n## The Same Files, Every Mode [#the-same-files-every-mode]\n\nThe projection modes — `fullstack`, `api+spa`, `static`, `standalone`, `edge` — reuse the same `definePage` files. In `api+spa` the pages render client-only from those exact files while the server serves the shell plus the API; in `fullstack` the full SSR pipeline runs; in `static` the same pipeline runs once at build. The codebase ships as a full SSR application, a static site, or a single-page app — the mode and route rules decide, the files do not. See [Static Generation](/docs/rendering/prerendering).\n\n## Observability of Rendering [#observability-of-rendering]\n\nEvery rendering stage is measurable. The server pass emits spans for total SSR wall time, time-to-first-byte of the stream, shell time, and hydration time — correlated to the request's trace id. The dev overlay shows the loader waterfall per request and the cache decisions behind it. See [Observability](/docs/observability) and [Metrics](/docs/observability/metrics).\n\nThe rendering knobs upstream are shared: route rules, guards, and loaders run under the same span tree as the HTTP pipeline, so a slow page traces back to the exact stage — middleware, session, loader, or render. See [Request Lifecycle](/docs/http/lifecycle) for the stage ordering that holds across rendering and API routes alike.\n\n## What's Next [#whats-next]\n\n1. [Server-Side Rendering](/docs/rendering/ssr) — what runs on the server\n2. [Streaming SSR](/docs/rendering/streaming) — deferred data on the wire\n3. [Hydration](/docs/rendering/hydration) — how state crosses to the client\n4. [Caching Strategies](/docs/rendering/caching) — route rules per path\n5. [Static Generation](/docs/rendering/prerendering) — build-time output\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The framework owns the entire rendering pipeline — the server renders, the client hydrates, and everything in between is orchestrated by `@kwiva/react`. Because rendering is part of the framework surface rather than an external add-on, pages, loaders, data hooks, and the response cache share one design: the same cache, the same types, the same story from request to pixel. SSR orchestration is a locked decision (ADR-0006): the framework composes the request handler, streaming render, and dehydration instead of inheriting a third-party server-functions model."
		},
		{
			"heading": void 0,
			"content": "Every page defaults to **full server-side rendering**: loaders run on the server, HTML streams to the client, and hydration transfers data without a refetch. From there, route rules let you choose — per path — whether a response is dynamically rendered, cached, revalidated, or prerendered at build time. Rendering is not one switch for the whole app; it is decided per route and composes with the data hooks on the client."
		},
		{
			"heading": "what-rendering-includes",
			"content": "Topic"
		},
		{
			"heading": "what-rendering-includes",
			"content": "What it covers"
		},
		{
			"heading": "what-rendering-includes",
			"content": "Server-Side Rendering"
		},
		{
			"heading": "what-rendering-includes",
			"content": "The full SSR pipeline — router match, guards, parallel loaders, HTML, head/meta"
		},
		{
			"heading": "what-rendering-includes",
			"content": "Streaming SSR"
		},
		{
			"heading": "what-rendering-includes",
			"content": "Suspense-aware HTML streaming, deferred segments with `stream()`"
		},
		{
			"heading": "what-rendering-includes",
			"content": "Hydration"
		},
		{
			"heading": "what-rendering-includes",
			"content": "Island-free full hydration, loader data handed to the client cache"
		},
		{
			"heading": "what-rendering-includes",
			"content": "Caching Strategies"
		},
		{
			"heading": "what-rendering-includes",
			"content": "Route rules — `cache`, `swr`, `isr`, `static`, `prerender` — and layered caching"
		},
		{
			"heading": "what-rendering-includes",
			"content": "Static Generation"
		},
		{
			"heading": "what-rendering-includes",
			"content": "Build-time crawling or explicit lists for static output"
		},
		{
			"heading": "the-server-side-pipeline",
			"content": "Every page participates in the same pipeline, whether it renders dynamically, from a cache, or at build time:"
		},
		{
			"heading": "the-server-side-pipeline",
			"content": "Route rules short-circuit **before** context assembly — a cache hit serves the stored response and bypasses the pipeline, including session loading. That is what makes cached public pages fast: the request never reaches the render stage. See Request Lifecycle for the full ordering contract."
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Rendering is not one switch for the whole app — it is decided per route via route rules, and it composes with the data hooks on the client:"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Strategy"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Route rule"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Fits when"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Dynamic SSR"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "(default)"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Personalized, session-dependent, frequently changing content"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Cached response"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "`cache: n`"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Public payloads that change on a known window"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Stale-while-revalidate"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "`swr: n`"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Read-heavy, mutable data that tolerates staleness"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Incremental regeneration"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "`isr: n`"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Public pages that change slowly, built on demand"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Static at build"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "`static` / `prerender: true`"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "Content fixed at build time — docs, marketing, static apps"
		},
		{
			"heading": "choosing-a-strategy-per-route",
			"content": "The same application mixes strategies: a marketing site renders statically, product pages regenerate incrementally, and an account section is always dynamic. Route rules are declared per path on server routes, and are covered in full under Caching Strategies."
		},
		{
			"heading": "streaming--deferred-data",
			"content": "Streaming SSR ships the shell of a page the moment blocking data resolves, and streams the rest in as its data resolves. Loaders split their work explicitly — awaited values block, `stream()`-wrapped promises defer:"
		},
		{
			"heading": "streaming--deferred-data",
			"content": "The rendering runtime flushes each suspense boundary the instant the deferred segment behind it is ready. Route rules operate on the **full stream** — a streamed page is cached as a whole, not piecemeal. See Streaming SSR."
		},
		{
			"heading": "hydration-a-cache-transfer",
			"content": "Hydration is how the server-rendered page becomes a live application. Kwiva hydrates the **whole page** — island-free, no per-widget bootstrapping — and the server's state crosses the gap as a **cache transfer**: loader data and deferred values serialize into the stream and rehydrate into the client's data-hook cache under identical keys. The first interactive frame reads exactly what the server computed; nothing is refetched. See Hydration."
		},
		{
			"heading": "layered-caching",
			"content": "Caching operates on three layers that compose:"
		},
		{
			"heading": "layered-caching",
			"content": "Layer"
		},
		{
			"heading": "layered-caching",
			"content": "Answers"
		},
		{
			"heading": "layered-caching",
			"content": "Surface"
		},
		{
			"heading": "layered-caching",
			"content": "Route rules"
		},
		{
			"heading": "layered-caching",
			"content": "\"How old may the response be?\""
		},
		{
			"heading": "layered-caching",
			"content": "`cache`, `swr`, `isr`, `static`, `prerender`"
		},
		{
			"heading": "layered-caching",
			"content": "Model cache"
		},
		{
			"heading": "layered-caching",
			"content": "\"How long may this derived value live?\""
		},
		{
			"heading": "layered-caching",
			"content": "`defineModel` cache option, `cache` API"
		},
		{
			"heading": "layered-caching",
			"content": "Client cache"
		},
		{
			"heading": "layered-caching",
			"content": "\"When should the browser re-pull?\""
		},
		{
			"heading": "layered-caching",
			"content": "data-hook `staleTime` / `gcTime`"
		},
		{
			"heading": "layered-caching",
			"content": "Invalidation flows down the stack — `invalidateTags` purges route rules and server values carrying those tags, and `invalidate(Model)` refreshes client queries for the model. Each layer is covered in depth under Caching Strategies."
		},
		{
			"heading": "personalization-with-cached-shells",
			"content": "Caching does not exclude logged-in users. The split pattern keeps a public shell cacheable (via `isr` or `static`) while user-specific fragments load client-side through data hooks from session-scoped endpoints — keyed per user, never cached:"
		},
		{
			"heading": "personalization-with-cached-shells",
			"content": "The framework refuses to cache responses that set `Set-Cookie`, so a cached page can never leak a session to another user. Session-bearing responses stay dynamic by force of contract. See Hydration and Caching Strategies."
		},
		{
			"heading": "static-generation",
			"content": "The strongest strategy is no server at all. `static` and `prerender` routes render once at `kwiva build` and emit HTML, assets, and JSON that a static host serves directly. Static and ISR share one artifact model — a page that is `static` today can be promoted to `isr: n` when content starts changing. See Static Generation."
		},
		{
			"heading": "the-same-files-every-mode",
			"content": "The projection modes — `fullstack`, `api+spa`, `static`, `standalone`, `edge` — reuse the same `definePage` files. In `api+spa` the pages render client-only from those exact files while the server serves the shell plus the API; in `fullstack` the full SSR pipeline runs; in `static` the same pipeline runs once at build. The codebase ships as a full SSR application, a static site, or a single-page app — the mode and route rules decide, the files do not. See Static Generation."
		},
		{
			"heading": "observability-of-rendering",
			"content": "Every rendering stage is measurable. The server pass emits spans for total SSR wall time, time-to-first-byte of the stream, shell time, and hydration time — correlated to the request's trace id. The dev overlay shows the loader waterfall per request and the cache decisions behind it. See Observability and Metrics."
		},
		{
			"heading": "observability-of-rendering",
			"content": "The rendering knobs upstream are shared: route rules, guards, and loaders run under the same span tree as the HTTP pipeline, so a slow page traces back to the exact stage — middleware, session, loader, or render. See Request Lifecycle for the stage ordering that holds across rendering and API routes alike."
		},
		{
			"heading": "whats-next",
			"content": "Server-Side Rendering — what runs on the server"
		},
		{
			"heading": "whats-next",
			"content": "Streaming SSR — deferred data on the wire"
		},
		{
			"heading": "whats-next",
			"content": "Hydration — how state crosses to the client"
		},
		{
			"heading": "whats-next",
			"content": "Caching Strategies — route rules per path"
		},
		{
			"heading": "whats-next",
			"content": "Static Generation — build-time output"
		}
	],
	"headings": [
		{
			"id": "what-rendering-includes",
			"content": "What Rendering Includes"
		},
		{
			"id": "the-server-side-pipeline",
			"content": "The Server-Side Pipeline"
		},
		{
			"id": "choosing-a-strategy-per-route",
			"content": "Choosing a Strategy per Route"
		},
		{
			"id": "streaming--deferred-data",
			"content": "Streaming & Deferred Data"
		},
		{
			"id": "hydration-a-cache-transfer",
			"content": "Hydration: A Cache Transfer"
		},
		{
			"id": "layered-caching",
			"content": "Layered Caching"
		},
		{
			"id": "personalization-with-cached-shells",
			"content": "Personalization with Cached Shells"
		},
		{
			"id": "static-generation",
			"content": "Static Generation"
		},
		{
			"id": "the-same-files-every-mode",
			"content": "The Same Files, Every Mode"
		},
		{
			"id": "observability-of-rendering",
			"content": "Observability of Rendering"
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
		url: "#what-rendering-includes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Rendering Includes" })
	},
	{
		depth: 2,
		url: "#the-server-side-pipeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Server-Side Pipeline" })
	},
	{
		depth: 2,
		url: "#choosing-a-strategy-per-route",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Choosing a Strategy per Route" })
	},
	{
		depth: 2,
		url: "#streaming--deferred-data",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Streaming & Deferred Data" })
	},
	{
		depth: 2,
		url: "#hydration-a-cache-transfer",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Hydration: A Cache Transfer" })
	},
	{
		depth: 2,
		url: "#layered-caching",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layered Caching" })
	},
	{
		depth: 2,
		url: "#personalization-with-cached-shells",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Personalization with Cached Shells" })
	},
	{
		depth: 2,
		url: "#static-generation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Static Generation" })
	},
	{
		depth: 2,
		url: "#the-same-files-every-mode",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Same Files, Every Mode" })
	},
	{
		depth: 2,
		url: "#observability-of-rendering",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Observability of Rendering" })
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
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The framework owns the entire rendering pipeline — the server renders, the client hydrates, and everything in between is orchestrated by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }),
			". Because rendering is part of the framework surface rather than an external add-on, pages, loaders, data hooks, and the response cache share one design: the same cache, the same types, the same story from request to pixel. SSR orchestration is a locked decision (ADR-0006): the framework composes the request handler, streaming render, and dehydration instead of inheriting a third-party server-functions model."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every page defaults to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "full server-side rendering" }),
			": loaders run on the server, HTML streams to the client, and hydration transfers data without a refetch. From there, route rules let you choose — per path — whether a response is dynamically rendered, cached, revalidated, or prerendered at build time. Rendering is not one switch for the whole app; it is decided per route and composes with the data hooks on the client."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-rendering-includes",
			children: "What Rendering Includes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Topic" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it covers" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/ssr",
				children: "Server-Side Rendering"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The full SSR pipeline — router match, guards, parallel loaders, HTML, head/meta" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/streaming",
				children: "Streaming SSR"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Suspense-aware HTML streaming, deferred segments with ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stream()" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/hydration",
				children: "Hydration"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Island-free full hydration, loader data handed to the client cache" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Route rules — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender" }),
				" — and layered caching"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/prerendering",
				children: "Static Generation"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build-time crawling or explicit lists for static output" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-server-side-pipeline",
			children: "The Server-Side Pipeline"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every page participates in the same pipeline, whether it renders dynamically, from a cache, or at build time:" }),
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
			title: "the-server-side-pipeline.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "request (page route)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → router match (owned router)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → route rules apply (cache hit? serve + bypass pipeline)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → beforeLoad guards (session → login redirects)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → loaders execute in parallel (server-side, via the typed client — in-process)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → suspense-aware HTML streaming" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → response stream (status, headers, cookies from the pipeline)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "hydration (client)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → state rehydrates into the data-hook cache (no refetch of loader data)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → router resumes at the same route and search state" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Route rules short-circuit ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "before" }),
			" context assembly — a cache hit serves the stored response and bypasses the pipeline, including session loading. That is what makes cached public pages fast: the request never reaches the render stage. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Request Lifecycle"
			}),
			" for the full ordering contract."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "choosing-a-strategy-per-route",
			children: "Choosing a Strategy per Route"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Rendering is not one switch for the whole app — it is decided per route via route rules, and it composes with the data hooks on the client:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Strategy" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Route rule" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Fits when" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dynamic SSR" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "(default)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Personalized, session-dependent, frequently changing content" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cached response" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache: n" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Public payloads that change on a known window" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Stale-while-revalidate" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr: n" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Read-heavy, mutable data that tolerates staleness" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Incremental regeneration" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr: n" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Public pages that change slowly, built on demand" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Static at build" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
					" / ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender: true" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Content fixed at build time — docs, marketing, static apps" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same application mixes strategies: a marketing site renders statically, product pages regenerate incrementally, and an account section is always dynamic. Route rules are declared per path on server routes, and are covered in full under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "streaming--deferred-data",
			children: "Streaming & Deferred Data"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Streaming SSR ships the shell of a page the moment blocking data resolves, and streams the rest in as its data resolves. Loaders split their work explicitly — awaited values block, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stream()" }),
			"-wrapped promises defer:"
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
			title: "streaming-deferred-data.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "loader"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
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
							children: "params"
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
							children: "client"
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
							children: " ({"
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
							children: "  post: "
						}),
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
							children: " client.posts."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "get"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(params.id),                          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// blocking"
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
							children: "  comments: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "stream"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(client.comments."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "list"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ postId: params.id })),    "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// streams in"
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
			"The rendering runtime flushes each suspense boundary the instant the deferred segment behind it is ready. Route rules operate on the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "full stream" }),
			" — a streamed page is cached as a whole, not piecemeal. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/streaming",
				children: "Streaming SSR"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "hydration-a-cache-transfer",
			children: "Hydration: A Cache Transfer"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Hydration is how the server-rendered page becomes a live application. Kwiva hydrates the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "whole page" }),
			" — island-free, no per-widget bootstrapping — and the server's state crosses the gap as a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "cache transfer" }),
			": loader data and deferred values serialize into the stream and rehydrate into the client's data-hook cache under identical keys. The first interactive frame reads exactly what the server computed; nothing is refetched. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/hydration",
				children: "Hydration"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layered-caching",
			children: "Layered Caching"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Caching operates on three layers that compose:" }),
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
			title: "layered-caching.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "route rules   → HTTP response cache (cache / swr / isr / static)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "model cache   → server-side value cache with TTL and tags" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "client cache  → data-hook cache (staleTime / gcTime)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Layer" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Answers" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route rules" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "\"How old may the response be?\"" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model cache" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "\"How long may this derived value live?\"" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
					" cache option, ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
					" API"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Client cache" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "\"When should the browser re-pull?\"" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"data-hook ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "staleTime" }),
					" / ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "gcTime" })
				] })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Invalidation flows down the stack — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidateTags" }),
			" purges route rules and server values carrying those tags, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidate(Model)" }),
			" refreshes client queries for the model. Each layer is covered in depth under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "personalization-with-cached-shells",
			children: "Personalization with Cached Shells"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Caching does not exclude logged-in users. The split pattern keeps a public shell cacheable (via ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr" }),
			" or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			") while user-specific fragments load client-side through data hooks from session-scoped endpoints — keyed per user, never cached:"
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
			title: "personalization-with-cached-shells.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/products/**  isr cached shell   → same for every visitor" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                └─ session-scoped fragments → loaded client-side, never cached" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The framework refuses to cache responses that set ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Set-Cookie" }),
			", so a cached page can never leak a session to another user. Session-bearing responses stay dynamic by force of contract. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/hydration",
				children: "Hydration"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "static-generation",
			children: "Static Generation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The strongest strategy is no server at all. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender" }),
			" routes render once at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }),
			" and emit HTML, assets, and JSON that a static host serves directly. Static and ISR share one artifact model — a page that is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			" today can be promoted to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr: n" }),
			" when content starts changing. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/prerendering",
				children: "Static Generation"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-same-files-every-mode",
			children: "The Same Files, Every Mode"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The projection modes — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }),
			" — reuse the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			" files. In ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }),
			" the pages render client-only from those exact files while the server serves the shell plus the API; in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }),
			" the full SSR pipeline runs; in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			" the same pipeline runs once at build. The codebase ships as a full SSR application, a static site, or a single-page app — the mode and route rules decide, the files do not. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/prerendering",
				children: "Static Generation"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "observability-of-rendering",
			children: "Observability of Rendering"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every rendering stage is measurable. The server pass emits spans for total SSR wall time, time-to-first-byte of the stream, shell time, and hydration time — correlated to the request's trace id. The dev overlay shows the loader waterfall per request and the cache decisions behind it. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/metrics",
				children: "Metrics"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The rendering knobs upstream are shared: route rules, guards, and loaders run under the same span tree as the HTTP pipeline, so a slow page traces back to the exact stage — middleware, session, loader, or render. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Request Lifecycle"
			}),
			" for the stage ordering that holds across rendering and API routes alike."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/ssr",
				children: "Server-Side Rendering"
			}), " — what runs on the server"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/streaming",
				children: "Streaming SSR"
			}), " — deferred data on the wire"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/hydration",
				children: "Hydration"
			}), " — how state crosses to the client"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}), " — route rules per path"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/prerendering",
				children: "Static Generation"
			}), " — build-time output"] }),
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
