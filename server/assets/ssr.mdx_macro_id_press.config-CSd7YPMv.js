import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/rendering/ssr.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Server-Side Rendering",
	"description": "Kwiva-owned SSR orchestration, the render pipeline, streaming-first, and route rules."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nKwiva renders pages on the server by default. Loading, guarding, and rendering are orchestrated by the framework: the owned router matches the request, loaders run server-side, HTML streams to the client, and the first paint is complete before any client-side data fetch. The client hydrates the same state instead of rebuilding it.\n\nSSR orchestration is a locked framework decision (ADR-0006). The framework's server engine serves the request; the framework renders the page. That split gives Kwiva full control of streaming composition, header and cookie injection, and per-request context (session and tenant) entering the tree — matching modern fullstack-framework behavior without a third-party server-functions model.\n\n## The Render Pipeline [#the-render-pipeline]\n\nA page request moves through a fixed pipeline:\n\n```plaintext title=\"the-render-pipeline.txt\"\nrequest (page route)\n  → router match (owned router)\n  → beforeLoad guards (session → login redirects)\n  → loaders execute in parallel (server-side, via the typed client — in-process)\n  → the rendering runtime streams the tree (suspense-aware)\n  → response stream (http status, headers, set-cookies from the pipeline)\nhydration (client)\n  → state rehydrates into the data-hook cache (no refetch of loader data)\n  → router picks up at the same route with same search state\n```\n\nThe same ordered contract appears at the HTTP layer — middleware, routing, and caching stages are shared with API routes. See [Request Lifecycle](/docs/http/lifecycle) for the full sequence and [Frontend](/docs/frontend) for the page surface that feeds it.\n\n## What Runs Server-Side [#what-runs-server-side]\n\nEvery step that needs authority or infrastructure runs before the first byte of HTML:\n\n| Stage            | Server behavior                                                                                                                       |\n| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |\n| Router match     | The owned router resolves the URL against the generated route tree                                                                    |\n| `beforeLoad`     | Guards run with real session state — unauthorized navigations redirect before any data loads                                          |\n| Loaders          | Execute in parallel across all matched routes, via the typed client running **in process** — no network hop, deduplicated per request |\n| Rendering        | Streaming HTML with suspense boundaries flushing as deferred data resolves                                                            |\n| Head & meta      | Per-route `head` is serialized into the document from loader data                                                                     |\n| Cookies & status | Pipeline-set cookies and status codes attach to the response                                                                          |\n\nBecause loaders run in process, server rendering pays no HTTP round-trip for data that lives in the same process — the request is answered, typed, and gated in one pass. Guards see the same `session` and `tenant` objects the API handlers see, so a page can never render past an authorization boundary. See [Loaders & Data](/docs/frontend/loaders) and [Protecting Routes](/docs/auth/protecting-routes).\n\n## No Client Round-Trip for First Paint [#no-client-round-trip-for-first-paint]\n\nThe first paint does not wait on the network from the browser:\n\n```plaintext title=\"no-client-round-trip-for-first-paint.txt\"\nserver: loader data → HTML stream → <head> from loader data\nclient: render from streamed HTML → hydrates → cache already warm\n```\n\nThe client does not refetch what the server loaded: loader results are dehydrated into the stream and rehydrated into the data-hook cache, so the first interactive frame uses the exact data the server computed. See [Hydration](/docs/rendering/hydration).\n\n## Streaming-First by Default [#streaming-first-by-default]\n\nSSR is streaming-first: the shell flushes the moment blocking data across all matched loaders resolves, and deferred segments stream into their suspense boundaries as they complete. A comment-heavy post reaches first paint with its headline and body while the comment query is still running; comments then stream in without another navigation.\n\nFailed deferred segments cannot reset the page — the boundary falls back to its error state with a retry while the shell stays intact. For runtimes without streaming support, the pipeline degrades to a buffered render; capability is documented per preset. See [Streaming SSR](/docs/rendering/streaming).\n\n## SSR and Route Rules [#ssr-and-route-rules]\n\nSSR is the dynamic default; route rules override it per path. The full stream, or the built page, is what the rules operate on:\n\n| Rule              | Behavior                                                               |\n| ----------------- | ---------------------------------------------------------------------- |\n| (default)         | Dynamic SSR each request                                               |\n| `cache: n`        | Full response cached `n` seconds                                       |\n| `swr: n`          | Stale-while-revalidate (purge-in-background)                           |\n| `isr: n`          | Static page regenerated on interval (or on-demand via `revalidateTag`) |\n| `static`          | Built once at `kwiva build` (prerender)                                |\n| `prerender: true` | Crawl/prerender at build                                               |\n\nRoute rules are declared on server routes:\n\n```ts title=\"src/routes/rules.ts\"\n// src/routes/rules.ts\ndefineServerRoute('/products/**', { isr: 300, cache: { tags: ['catalog'] } })\n```\n\nOn-demand invalidation reaches cached responses from anywhere with server authority — jobs, tasks, event handlers:\n\n```ts title=\"ssr-and-route-rules.ts\"\ninvalidateTags(['catalog'])\n```\n\nThe framework calls the engine's purge; the next request re-renders. Because route rules apply before context assembly, a cached page skips session loading entirely — public ISR pages skip auth by design. See [Caching Strategies](/docs/rendering/caching) and [Response Caching](/docs/http/caching).\n\n## Personalization with Cached Shells [#personalization-with-cached-shells]\n\nSSR and caching compose with personalization. A public shell can be cached (`isr`), while user-specific fragments load client-side via data hooks (`useResource`) from session-scoped endpoints — keyed per user, never cached:\n\n```plaintext title=\"personalization-with-cached-shells.txt\"\n/products/**  isr cached shell   → same for every visitor\n                └─ useResource on session-scoped endpoint → fresh per user\n```\n\nSession-bearing responses are never cached — the framework refuses to cache a response that sets `Set-Cookie`. The `head` serializes per route, so cached pages keep correct SEO tags from loader data without re-rendering.\n\n## Error Handling During SSR [#error-handling-during-ssr]\n\nLoaders and guards that throw during the server pass land in the route's `errorComponent`, or the root boundary when no closer boundary exists. Deferred segments that reject after the shell has streamed settle into their own boundary with a retry. During development, the overlay attaches the loader stack and the OTel trace id, so failures are traceable to the exact stage. See [Pages](/docs/frontend/pages) and [Observability](/docs/observability).\n\n## SPA Fallback [#spa-fallback]\n\nIn `api+spa` mode, pages render client-only from the same `definePage` files; the server serves the shell plus the API. The page files do not change — the same named exports drive server rendering and single-page rendering alike, which is what makes the mode a projection of the same codebase rather than a rewrite. Route rules still apply to the API surface; the client build is what the host serves. See [Static Generation](/docs/rendering/prerendering).\n\n## Observability [#observability]\n\nThe server pass emits spans for the pieces that matter: total SSR wall time, time-to-first-byte of the stream, shell time, and hydration time. Correlation ties a request's rendering stages together with its trace id, and the dev overlay shows the loader waterfall per request. See [Observability](/docs/observability) and [Tracing](/docs/observability/tracing).\n\n## When SSR Fits [#when-ssr-fits]\n\nFull SSR is the right default for most of an application's surface. Reach for it when:\n\n* **First paint matters** — the user sees meaningful content immediately, without a loading spinner\n* **SEO matters** — the document carries real content and per-route `head` meta from the very first response\n* **Session and tenancy matter** — guards and loaders run with server-side authority, so nothing sensitive waits for a client round-trip to be confirmed\n* **Read paths dominate** — most screen time is browsing data the server already holds\n\nHeavy, personal, frequently-churning fragments belong in the client path — session-scoped data loaded via data hooks on top of a cached shell. See [Caching Strategies](/docs/rendering/caching) for the hybrid pattern.\n\n## What's Next [#whats-next]\n\n* [Streaming SSR](/docs/rendering/streaming) — how suspense-aware segments stream in\n* [Hydration](/docs/rendering/hydration) — how server state becomes client state\n* [Caching Strategies](/docs/rendering/caching) — route rules per path\n* [Loaders & Data](/docs/frontend/loaders) — what runs in the server-side pass\n* [Frontend](/docs/frontend) — the page surface SSR renders\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva renders pages on the server by default. Loading, guarding, and rendering are orchestrated by the framework: the owned router matches the request, loaders run server-side, HTML streams to the client, and the first paint is complete before any client-side data fetch. The client hydrates the same state instead of rebuilding it."
		},
		{
			"heading": void 0,
			"content": "SSR orchestration is a locked framework decision (ADR-0006). The framework's server engine serves the request; the framework renders the page. That split gives Kwiva full control of streaming composition, header and cookie injection, and per-request context (session and tenant) entering the tree — matching modern fullstack-framework behavior without a third-party server-functions model."
		},
		{
			"heading": "the-render-pipeline",
			"content": "A page request moves through a fixed pipeline:"
		},
		{
			"heading": "the-render-pipeline",
			"content": "The same ordered contract appears at the HTTP layer — middleware, routing, and caching stages are shared with API routes. See Request Lifecycle for the full sequence and Frontend for the page surface that feeds it."
		},
		{
			"heading": "what-runs-server-side",
			"content": "Every step that needs authority or infrastructure runs before the first byte of HTML:"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Stage"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Server behavior"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Router match"
		},
		{
			"heading": "what-runs-server-side",
			"content": "The owned router resolves the URL against the generated route tree"
		},
		{
			"heading": "what-runs-server-side",
			"content": "`beforeLoad`"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Guards run with real session state — unauthorized navigations redirect before any data loads"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Loaders"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Execute in parallel across all matched routes, via the typed client running **in process** — no network hop, deduplicated per request"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Rendering"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Streaming HTML with suspense boundaries flushing as deferred data resolves"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Head & meta"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Per-route `head` is serialized into the document from loader data"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Cookies & status"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Pipeline-set cookies and status codes attach to the response"
		},
		{
			"heading": "what-runs-server-side",
			"content": "Because loaders run in process, server rendering pays no HTTP round-trip for data that lives in the same process — the request is answered, typed, and gated in one pass. Guards see the same `session` and `tenant` objects the API handlers see, so a page can never render past an authorization boundary. See Loaders & Data and Protecting Routes."
		},
		{
			"heading": "no-client-round-trip-for-first-paint",
			"content": "The first paint does not wait on the network from the browser:"
		},
		{
			"heading": "no-client-round-trip-for-first-paint",
			"content": "The client does not refetch what the server loaded: loader results are dehydrated into the stream and rehydrated into the data-hook cache, so the first interactive frame uses the exact data the server computed. See Hydration."
		},
		{
			"heading": "streaming-first-by-default",
			"content": "SSR is streaming-first: the shell flushes the moment blocking data across all matched loaders resolves, and deferred segments stream into their suspense boundaries as they complete. A comment-heavy post reaches first paint with its headline and body while the comment query is still running; comments then stream in without another navigation."
		},
		{
			"heading": "streaming-first-by-default",
			"content": "Failed deferred segments cannot reset the page — the boundary falls back to its error state with a retry while the shell stays intact. For runtimes without streaming support, the pipeline degrades to a buffered render; capability is documented per preset. See Streaming SSR."
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "SSR is the dynamic default; route rules override it per path. The full stream, or the built page, is what the rules operate on:"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "Rule"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "Behavior"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "(default)"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "Dynamic SSR each request"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "`cache: n`"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "Full response cached `n` seconds"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "`swr: n`"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "Stale-while-revalidate (purge-in-background)"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "`isr: n`"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "Static page regenerated on interval (or on-demand via `revalidateTag`)"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "`static`"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "Built once at `kwiva build` (prerender)"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "`prerender: true`"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "Crawl/prerender at build"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "Route rules are declared on server routes:"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "On-demand invalidation reaches cached responses from anywhere with server authority — jobs, tasks, event handlers:"
		},
		{
			"heading": "ssr-and-route-rules",
			"content": "The framework calls the engine's purge; the next request re-renders. Because route rules apply before context assembly, a cached page skips session loading entirely — public ISR pages skip auth by design. See Caching Strategies and Response Caching."
		},
		{
			"heading": "personalization-with-cached-shells",
			"content": "SSR and caching compose with personalization. A public shell can be cached (`isr`), while user-specific fragments load client-side via data hooks (`useResource`) from session-scoped endpoints — keyed per user, never cached:"
		},
		{
			"heading": "personalization-with-cached-shells",
			"content": "Session-bearing responses are never cached — the framework refuses to cache a response that sets `Set-Cookie`. The `head` serializes per route, so cached pages keep correct SEO tags from loader data without re-rendering."
		},
		{
			"heading": "error-handling-during-ssr",
			"content": "Loaders and guards that throw during the server pass land in the route's `errorComponent`, or the root boundary when no closer boundary exists. Deferred segments that reject after the shell has streamed settle into their own boundary with a retry. During development, the overlay attaches the loader stack and the OTel trace id, so failures are traceable to the exact stage. See Pages and Observability."
		},
		{
			"heading": "spa-fallback",
			"content": "In `api+spa` mode, pages render client-only from the same `definePage` files; the server serves the shell plus the API. The page files do not change — the same named exports drive server rendering and single-page rendering alike, which is what makes the mode a projection of the same codebase rather than a rewrite. Route rules still apply to the API surface; the client build is what the host serves. See Static Generation."
		},
		{
			"heading": "observability",
			"content": "The server pass emits spans for the pieces that matter: total SSR wall time, time-to-first-byte of the stream, shell time, and hydration time. Correlation ties a request's rendering stages together with its trace id, and the dev overlay shows the loader waterfall per request. See Observability and Tracing."
		},
		{
			"heading": "when-ssr-fits",
			"content": "Full SSR is the right default for most of an application's surface. Reach for it when:"
		},
		{
			"heading": "when-ssr-fits",
			"content": "**First paint matters** — the user sees meaningful content immediately, without a loading spinner"
		},
		{
			"heading": "when-ssr-fits",
			"content": "**SEO matters** — the document carries real content and per-route `head` meta from the very first response"
		},
		{
			"heading": "when-ssr-fits",
			"content": "**Session and tenancy matter** — guards and loaders run with server-side authority, so nothing sensitive waits for a client round-trip to be confirmed"
		},
		{
			"heading": "when-ssr-fits",
			"content": "**Read paths dominate** — most screen time is browsing data the server already holds"
		},
		{
			"heading": "when-ssr-fits",
			"content": "Heavy, personal, frequently-churning fragments belong in the client path — session-scoped data loaded via data hooks on top of a cached shell. See Caching Strategies for the hybrid pattern."
		},
		{
			"heading": "whats-next",
			"content": "Streaming SSR — how suspense-aware segments stream in"
		},
		{
			"heading": "whats-next",
			"content": "Hydration — how server state becomes client state"
		},
		{
			"heading": "whats-next",
			"content": "Caching Strategies — route rules per path"
		},
		{
			"heading": "whats-next",
			"content": "Loaders & Data — what runs in the server-side pass"
		},
		{
			"heading": "whats-next",
			"content": "Frontend — the page surface SSR renders"
		}
	],
	"headings": [
		{
			"id": "the-render-pipeline",
			"content": "The Render Pipeline"
		},
		{
			"id": "what-runs-server-side",
			"content": "What Runs Server-Side"
		},
		{
			"id": "no-client-round-trip-for-first-paint",
			"content": "No Client Round-Trip for First Paint"
		},
		{
			"id": "streaming-first-by-default",
			"content": "Streaming-First by Default"
		},
		{
			"id": "ssr-and-route-rules",
			"content": "SSR and Route Rules"
		},
		{
			"id": "personalization-with-cached-shells",
			"content": "Personalization with Cached Shells"
		},
		{
			"id": "error-handling-during-ssr",
			"content": "Error Handling During SSR"
		},
		{
			"id": "spa-fallback",
			"content": "SPA Fallback"
		},
		{
			"id": "observability",
			"content": "Observability"
		},
		{
			"id": "when-ssr-fits",
			"content": "When SSR Fits"
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
		url: "#the-render-pipeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Render Pipeline" })
	},
	{
		depth: 2,
		url: "#what-runs-server-side",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Runs Server-Side" })
	},
	{
		depth: 2,
		url: "#no-client-round-trip-for-first-paint",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "No Client Round-Trip for First Paint" })
	},
	{
		depth: 2,
		url: "#streaming-first-by-default",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Streaming-First by Default" })
	},
	{
		depth: 2,
		url: "#ssr-and-route-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "SSR and Route Rules" })
	},
	{
		depth: 2,
		url: "#personalization-with-cached-shells",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Personalization with Cached Shells" })
	},
	{
		depth: 2,
		url: "#error-handling-during-ssr",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Error Handling During SSR" })
	},
	{
		depth: 2,
		url: "#spa-fallback",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "SPA Fallback" })
	},
	{
		depth: 2,
		url: "#observability",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Observability" })
	},
	{
		depth: 2,
		url: "#when-ssr-fits",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When SSR Fits" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva renders pages on the server by default. Loading, guarding, and rendering are orchestrated by the framework: the owned router matches the request, loaders run server-side, HTML streams to the client, and the first paint is complete before any client-side data fetch. The client hydrates the same state instead of rebuilding it." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "SSR orchestration is a locked framework decision (ADR-0006). The framework's server engine serves the request; the framework renders the page. That split gives Kwiva full control of streaming composition, header and cookie injection, and per-request context (session and tenant) entering the tree — matching modern fullstack-framework behavior without a third-party server-functions model." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-render-pipeline",
			children: "The Render Pipeline"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A page request moves through a fixed pipeline:" }),
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
			title: "the-render-pipeline.txt",
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
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → the rendering runtime streams the tree (suspense-aware)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → response stream (http status, headers, set-cookies from the pipeline)" })
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
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → router picks up at the same route with same search state" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same ordered contract appears at the HTTP layer — middleware, routing, and caching stages are shared with API routes. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Request Lifecycle"
			}),
			" for the full sequence and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend",
				children: "Frontend"
			}),
			" for the page surface that feeds it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-runs-server-side",
			children: "What Runs Server-Side"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every step that needs authority or infrastructure runs before the first byte of HTML:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Stage" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Server behavior" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Router match" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The owned router resolves the URL against the generated route tree" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Guards run with real session state — unauthorized navigations redirect before any data loads" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Loaders" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Execute in parallel across all matched routes, via the typed client running ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "in process" }),
				" — no network hop, deduplicated per request"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rendering" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Streaming HTML with suspense boundaries flushing as deferred data resolves" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Head & meta" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Per-route ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "head" }),
				" is serialized into the document from loader data"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cookies & status" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pipeline-set cookies and status codes attach to the response" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because loaders run in process, server rendering pays no HTTP round-trip for data that lives in the same process — the request is answered, typed, and gated in one pass. Guards see the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenant" }),
			" objects the API handlers see, so a page can never render past an authorization boundary. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/protecting-routes",
				children: "Protecting Routes"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "no-client-round-trip-for-first-paint",
			children: "No Client Round-Trip for First Paint"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The first paint does not wait on the network from the browser:" }),
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
			title: "no-client-round-trip-for-first-paint.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "server: loader data → HTML stream → <head> from loader data" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "client: render from streamed HTML → hydrates → cache already warm" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The client does not refetch what the server loaded: loader results are dehydrated into the stream and rehydrated into the data-hook cache, so the first interactive frame uses the exact data the server computed. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/hydration",
				children: "Hydration"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "streaming-first-by-default",
			children: "Streaming-First by Default"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "SSR is streaming-first: the shell flushes the moment blocking data across all matched loaders resolves, and deferred segments stream into their suspense boundaries as they complete. A comment-heavy post reaches first paint with its headline and body while the comment query is still running; comments then stream in without another navigation." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Failed deferred segments cannot reset the page — the boundary falls back to its error state with a retry while the shell stays intact. For runtimes without streaming support, the pipeline degrades to a buffered render; capability is documented per preset. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/streaming",
				children: "Streaming SSR"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "ssr-and-route-rules",
			children: "SSR and Route Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "SSR is the dynamic default; route rules override it per path. The full stream, or the built page, is what the rules operate on:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Rule" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "(default)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dynamic SSR each request" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache: n" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Full response cached ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "n" }),
				" seconds"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr: n" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Stale-while-revalidate (purge-in-background)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr: n" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Static page regenerated on interval (or on-demand via ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "revalidateTag" }),
				")"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Built once at ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }),
				" (prerender)"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender: true" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Crawl/prerender at build" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Route rules are declared on server routes:" }),
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
			title: "src/routes/rules.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/routes/rules.ts"
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
							children: "defineServerRoute"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'/products/**'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { isr: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "300"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", cache: { tags: ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'catalog'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "] } })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "On-demand invalidation reaches cached responses from anywhere with server authority — jobs, tasks, event handlers:" }),
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
			title: "ssr-and-route-rules.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "invalidateTags"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "(["
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: "'catalog'"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "])"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The framework calls the engine's purge; the next request re-renders. Because route rules apply before context assembly, a cached page skips session loading entirely — public ISR pages skip auth by design. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/caching",
				children: "Response Caching"
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
			"SSR and caching compose with personalization. A public shell can be cached (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr" }),
			"), while user-specific fragments load client-side via data hooks (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useResource" }),
			") from session-scoped endpoints — keyed per user, never cached:"
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
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                └─ useResource on session-scoped endpoint → fresh per user" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Session-bearing responses are never cached — the framework refuses to cache a response that sets ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Set-Cookie" }),
			". The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "head" }),
			" serializes per route, so cached pages keep correct SEO tags from loader data without re-rendering."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "error-handling-during-ssr",
			children: "Error Handling During SSR"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Loaders and guards that throw during the server pass land in the route's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "errorComponent" }),
			", or the root boundary when no closer boundary exists. Deferred segments that reject after the shell has streamed settle into their own boundary with a retry. During development, the overlay attaches the loader stack and the OTel trace id, so failures are traceable to the exact stage. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/pages",
				children: "Pages"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "spa-fallback",
			children: "SPA Fallback"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"In ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }),
			" mode, pages render client-only from the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			" files; the server serves the shell plus the API. The page files do not change — the same named exports drive server rendering and single-page rendering alike, which is what makes the mode a projection of the same codebase rather than a rewrite. Route rules still apply to the API surface; the client build is what the host serves. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/prerendering",
				children: "Static Generation"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "observability",
			children: "Observability"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The server pass emits spans for the pieces that matter: total SSR wall time, time-to-first-byte of the stream, shell time, and hydration time. Correlation ties a request's rendering stages together with its trace id, and the dev overlay shows the loader waterfall per request. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Tracing"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-ssr-fits",
			children: "When SSR Fits"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Full SSR is the right default for most of an application's surface. Reach for it when:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "First paint matters" }), " — the user sees meaningful content immediately, without a loading spinner"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "SEO matters" }),
				" — the document carries real content and per-route ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "head" }),
				" meta from the very first response"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Session and tenancy matter" }), " — guards and loaders run with server-side authority, so nothing sensitive waits for a client round-trip to be confirmed"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Read paths dominate" }), " — most screen time is browsing data the server already holds"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Heavy, personal, frequently-churning fragments belong in the client path — session-scoped data loaded via data hooks on top of a cached shell. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}),
			" for the hybrid pattern."
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
				href: "/docs/rendering/streaming",
				children: "Streaming SSR"
			}), " — how suspense-aware segments stream in"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/hydration",
				children: "Hydration"
			}), " — how server state becomes client state"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}), " — route rules per path"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}), " — what runs in the server-side pass"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend",
				children: "Frontend"
			}), " — the page surface SSR renders"] }),
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
