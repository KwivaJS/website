import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/rendering/streaming.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Streaming SSR",
	"description": "Suspense-aware HTML streaming, deferred data with stream(), shell-first rendering."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nStreaming SSR ships the shell of a page the moment it can render, and streams the rest in as its data resolves. The streaming is **suspense-aware**: the rendering runtime flushes each suspense boundary the instant the deferred segment behind it is ready. The user sees a real page start paint at shell time — not after every loader on the route has finished.\n\nStreaming is the default mechanism of the framework-owned SSR pipeline (ADR-0006): the engine serves, the framework renders with `renderToReadableStream`, and Suspense boundaries flush as deferred data resolves. On runtimes without streaming support, the pipeline degrades to a buffered render — capability is auto-detected and documented per preset.\n\n## The Shell-First Contract [#the-shell-first-contract]\n\nA page loader can split its work into blocking and deferred:\n\n```tsx title=\"the-shell-first-contract.tsx\"\nloader: async ({ params, client }) => ({\n  post: await client.posts.get(params.id),                        // blocking\n  comments: stream(client.comments.list({ postId: params.id })),  // streams in\n}),\n```\n\n* Values awaited directly in the loader (the `post`) hold back the shell. Nothing on the route renders until every blocking value across all matched loaders resolves.\n* Values wrapped in `stream()` (the `comments`) defer the segment. The page renders as soon as the blocking data is ready; the deferred value streams into its suspense boundary when it arrives.\n\nThe page marks where each deferred piece lands:\n\n```tsx title=\"the-shell-first-contract-2.tsx\"\ncomponent: ({ loaderData: { post, comments } }) => (\n  <article>\n    <h1>{post.title}</h1>\n    <Suspense fallback={<p>Comments…</p>}>\n      <Comments stream={comments} />\n    </Suspense>\n  </article>\n),\n```\n\nThe shell flushes fully rendered — the correct `head` included — with the deferred regions in their fallback state. Streaming is not partial HTML sent before the page is structured; it is whole regions shipped as they complete.\n\n## Render in Parallel with Data [#render-in-parallel-with-data]\n\nStreaming is not merely progressive enhancement — it lets rendering and data run concurrently. While the server renders the blocking content and flushes it, the deferred queries continue in the background and flush as they complete. On a comment-heavy post, the headline and body reach first paint while the comment query is still running; comments then stream in without a second navigation.\n\n```plaintext title=\"render-in-parallel-with-data.txt\"\nt0   blocking data resolves → shell flushes\nt0.. deferred query runs in parallel with rendering\ntN   deferred chunk resolves → suspense boundary flushes\n```\n\nThis mirrors the parallel loader contract: all matched loaders run concurrently, and deferred lookups ride the same execution. See [Loaders & Data](/docs/frontend/loaders).\n\n## Streaming and Suspense Data Hooks [#streaming-and-suspense-data-hooks]\n\nStreamed loader data and suspense-enabled data hooks share one boundary model. A hook with `suspense: true` throws to the nearest suspense boundary while pending — the same boundary that renders a streamed `loaderData` segment — so a page can mix a blocking loader value, a deferred value, and a client-only query under the same boundary tree:\n\n```tsx title=\"streaming-and-suspense-data-hooks.tsx\"\n<Suspense fallback={<p>Loading…</p>}>\n  <StreamedSegment stream={comments} />   // deferred loader value\n  <UserPanel />                           // suspense-enabled hook, fetches on client\n</Suspense>\n```\n\nThe deferred loader value streams in from the server; the hook's query runs on the client and resolves into the same cache. Either way the boundary governs its own lifecycle, and errors stay scoped to the region. See [Data Hooks](/docs/frontend/data-hooks).\n\n## The Timing Budget [#the-timing-budget]\n\nStreaming exists to hold the shell-time budget. The framework's reference timing targets shape the split:\n\n| Stage                | Budget (p50, reference app)      |\n| -------------------- | -------------------------------- |\n| Shell (stream start) | \\< 50ms                          |\n| Deferred chunk flush | as data resolves                 |\n| Full stream complete | blocked data + remaining queries |\n| Hydration            | after shell paint                |\n\nThe loader split is what protects the shell budget: only direct `await`s in loaders hold up the `< 50ms` target, so the rule is to keep the blocking set minimal and defer everything else. The dev overlay shows the loader waterfall per request — see [Observability](/docs/observability/dev-overlay).\n\n## What Streaming Changes on the Client [#what-streaming-changes-on-the-client]\n\nThe client treats streamed segments the same way it treats any suspense boundary. The shell hydrates immediately, the deferred region is hydrated when its chunk arrives, and the router stays on the same route and search state throughout. There is no page reload and no duplicated fetch — each chunk carries its own loader data keyed identically to the client cache.\n\n```plaintext title=\"what-streaming-changes-on-the-client.txt\"\nshell → hydrates immediately\nchunk → hydrates its boundary as it arrives\nrouter → stays on the same route and search state throughout\n```\n\nBecause each chunk dehydrates under loader-identical cache keys, a streamed segment that the client already has (from an earlier visit or a preload) hydrates without refetch. See [Hydration](/docs/rendering/hydration).\n\n## Streaming and Route Rules [#streaming-and-route-rules]\n\nStreaming composes with response caching. Route rules operate on the full stream:\n\n| Rule       | Behavior with streaming                                                |\n| ---------- | ---------------------------------------------------------------------- |\n| `cache: n` | The composed response is cached for `n` seconds                        |\n| `swr: n`   | Stale stream is served while the background revalidates a fresh one    |\n| `isr: n`   | The complete stream is cached and regenerated on interval or on demand |\n\nA streamed page is cached as a whole, not piecemeal — the shell and its deferred segments revalidate together, so a stale shell never matches fresh fragments. See [Caching Strategies](/docs/rendering/caching).\n\n## Errors in Streamed Segments [#errors-in-streamed-segments]\n\nDeferred values that reject after the shell has streamed cannot reset the page. Instead, the failing suspense boundary falls back to its error state with a retry — the shell stays intact and the region governs its own recovery. During development the overlay surfaces the loader stack and trace id for the rejected segment. On the server the rejection is logged against the request's span; the client never sees an uncaught stream error take down the page. See [Observability](/docs/observability).\n\n## When to Stream, When to Block [#when-to-stream-when-to-block]\n\nDecide per value, in the loader:\n\n| Value                                                    | Decision   | Rationale                                    |\n| -------------------------------------------------------- | ---------- | -------------------------------------------- |\n| The record the frame repeats (article title, layout nav) | **Block**  | A meaningful first paint needs it            |\n| Below-the-fold lists (comments, related items)           | **Stream** | Natural async, renders fine on arrival       |\n| Aggregated panels (counts, summaries)                    | **Stream** | Non-critical by latency                      |\n| Anything whose absence breaks the shell                  | **Block**  | A missing frame value wastes the whole shell |\n\nThe rule of thumb: if a missing value would leave the shell useless, block it. Otherwise defer it and let the user watch the page fill in.\n\n## Streaming, Hydration, and Caching Together [#streaming-hydration-and-caching-together]\n\nStreaming, hydration, and caching share one result model: the full streamed response. The shell and its deferred chunks dehydrate into the same state payload, rehydrate into the same cache keys, and cache as one composed response. Their interaction:\n\n```plaintext title=\"streaming-hydration-and-caching-together.txt\"\nshell + deferred chunks → one response\n  → dehydrated into the state payload\n  → cached whole under route rules\n  → client rehydrates each region under identical keys\n```\n\nThis is why combining a streamed loader, a suspense-enabled data hook, and an `isr` rule stays correct — every stage agrees on what the response is. See [Hydration](/docs/rendering/hydration) and [Caching Strategies](/docs/rendering/caching).\n\n## Observability [#observability]\n\nStreaming adds two spans to the render pass: time-to-first-byte of the stream (shell time) and the flush schedule of deferred boundaries. Together with total SSR wall time and client hydration time, they make streaming behavior measurable rather than anecdotal. See [Observability](/docs/observability/metrics).\n\n## What's Next [#whats-next]\n\n* [Server-Side Rendering](/docs/rendering/ssr) — the pipeline streaming is part of\n* [Hydration](/docs/rendering/hydration) — how streamed chunks become client state\n* [Loaders & Data](/docs/frontend/loaders) — where deferred data is declared\n* [Caching Strategies](/docs/rendering/caching) — caching the full stream per route\n* [Frontend](/docs/frontend) — the page surface that declares deferred values\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Streaming SSR ships the shell of a page the moment it can render, and streams the rest in as its data resolves. The streaming is **suspense-aware**: the rendering runtime flushes each suspense boundary the instant the deferred segment behind it is ready. The user sees a real page start paint at shell time — not after every loader on the route has finished."
		},
		{
			"heading": void 0,
			"content": "Streaming is the default mechanism of the framework-owned SSR pipeline (ADR-0006): the engine serves, the framework renders with `renderToReadableStream`, and Suspense boundaries flush as deferred data resolves. On runtimes without streaming support, the pipeline degrades to a buffered render — capability is auto-detected and documented per preset."
		},
		{
			"heading": "the-shell-first-contract",
			"content": "A page loader can split its work into blocking and deferred:"
		},
		{
			"heading": "the-shell-first-contract",
			"content": "Values awaited directly in the loader (the `post`) hold back the shell. Nothing on the route renders until every blocking value across all matched loaders resolves."
		},
		{
			"heading": "the-shell-first-contract",
			"content": "Values wrapped in `stream()` (the `comments`) defer the segment. The page renders as soon as the blocking data is ready; the deferred value streams into its suspense boundary when it arrives."
		},
		{
			"heading": "the-shell-first-contract",
			"content": "The page marks where each deferred piece lands:"
		},
		{
			"heading": "the-shell-first-contract",
			"content": "The shell flushes fully rendered — the correct `head` included — with the deferred regions in their fallback state. Streaming is not partial HTML sent before the page is structured; it is whole regions shipped as they complete."
		},
		{
			"heading": "render-in-parallel-with-data",
			"content": "Streaming is not merely progressive enhancement — it lets rendering and data run concurrently. While the server renders the blocking content and flushes it, the deferred queries continue in the background and flush as they complete. On a comment-heavy post, the headline and body reach first paint while the comment query is still running; comments then stream in without a second navigation."
		},
		{
			"heading": "render-in-parallel-with-data",
			"content": "This mirrors the parallel loader contract: all matched loaders run concurrently, and deferred lookups ride the same execution. See Loaders & Data."
		},
		{
			"heading": "streaming-and-suspense-data-hooks",
			"content": "Streamed loader data and suspense-enabled data hooks share one boundary model. A hook with `suspense: true` throws to the nearest suspense boundary while pending — the same boundary that renders a streamed `loaderData` segment — so a page can mix a blocking loader value, a deferred value, and a client-only query under the same boundary tree:"
		},
		{
			"heading": "streaming-and-suspense-data-hooks",
			"content": "The deferred loader value streams in from the server; the hook's query runs on the client and resolves into the same cache. Either way the boundary governs its own lifecycle, and errors stay scoped to the region. See Data Hooks."
		},
		{
			"heading": "the-timing-budget",
			"content": "Streaming exists to hold the shell-time budget. The framework's reference timing targets shape the split:"
		},
		{
			"heading": "the-timing-budget",
			"content": "Stage"
		},
		{
			"heading": "the-timing-budget",
			"content": "Budget (p50, reference app)"
		},
		{
			"heading": "the-timing-budget",
			"content": "Shell (stream start)"
		},
		{
			"heading": "the-timing-budget",
			"content": "\\< 50ms"
		},
		{
			"heading": "the-timing-budget",
			"content": "Deferred chunk flush"
		},
		{
			"heading": "the-timing-budget",
			"content": "as data resolves"
		},
		{
			"heading": "the-timing-budget",
			"content": "Full stream complete"
		},
		{
			"heading": "the-timing-budget",
			"content": "blocked data + remaining queries"
		},
		{
			"heading": "the-timing-budget",
			"content": "Hydration"
		},
		{
			"heading": "the-timing-budget",
			"content": "after shell paint"
		},
		{
			"heading": "the-timing-budget",
			"content": "The loader split is what protects the shell budget: only direct `await`s in loaders hold up the `< 50ms` target, so the rule is to keep the blocking set minimal and defer everything else. The dev overlay shows the loader waterfall per request — see Observability."
		},
		{
			"heading": "what-streaming-changes-on-the-client",
			"content": "The client treats streamed segments the same way it treats any suspense boundary. The shell hydrates immediately, the deferred region is hydrated when its chunk arrives, and the router stays on the same route and search state throughout. There is no page reload and no duplicated fetch — each chunk carries its own loader data keyed identically to the client cache."
		},
		{
			"heading": "what-streaming-changes-on-the-client",
			"content": "Because each chunk dehydrates under loader-identical cache keys, a streamed segment that the client already has (from an earlier visit or a preload) hydrates without refetch. See Hydration."
		},
		{
			"heading": "streaming-and-route-rules",
			"content": "Streaming composes with response caching. Route rules operate on the full stream:"
		},
		{
			"heading": "streaming-and-route-rules",
			"content": "Rule"
		},
		{
			"heading": "streaming-and-route-rules",
			"content": "Behavior with streaming"
		},
		{
			"heading": "streaming-and-route-rules",
			"content": "`cache: n`"
		},
		{
			"heading": "streaming-and-route-rules",
			"content": "The composed response is cached for `n` seconds"
		},
		{
			"heading": "streaming-and-route-rules",
			"content": "`swr: n`"
		},
		{
			"heading": "streaming-and-route-rules",
			"content": "Stale stream is served while the background revalidates a fresh one"
		},
		{
			"heading": "streaming-and-route-rules",
			"content": "`isr: n`"
		},
		{
			"heading": "streaming-and-route-rules",
			"content": "The complete stream is cached and regenerated on interval or on demand"
		},
		{
			"heading": "streaming-and-route-rules",
			"content": "A streamed page is cached as a whole, not piecemeal — the shell and its deferred segments revalidate together, so a stale shell never matches fresh fragments. See Caching Strategies."
		},
		{
			"heading": "errors-in-streamed-segments",
			"content": "Deferred values that reject after the shell has streamed cannot reset the page. Instead, the failing suspense boundary falls back to its error state with a retry — the shell stays intact and the region governs its own recovery. During development the overlay surfaces the loader stack and trace id for the rejected segment. On the server the rejection is logged against the request's span; the client never sees an uncaught stream error take down the page. See Observability."
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "Decide per value, in the loader:"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "Value"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "Decision"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "Rationale"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "The record the frame repeats (article title, layout nav)"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "**Block**"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "A meaningful first paint needs it"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "Below-the-fold lists (comments, related items)"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "**Stream**"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "Natural async, renders fine on arrival"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "Aggregated panels (counts, summaries)"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "**Stream**"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "Non-critical by latency"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "Anything whose absence breaks the shell"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "**Block**"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "A missing frame value wastes the whole shell"
		},
		{
			"heading": "when-to-stream-when-to-block",
			"content": "The rule of thumb: if a missing value would leave the shell useless, block it. Otherwise defer it and let the user watch the page fill in."
		},
		{
			"heading": "streaming-hydration-and-caching-together",
			"content": "Streaming, hydration, and caching share one result model: the full streamed response. The shell and its deferred chunks dehydrate into the same state payload, rehydrate into the same cache keys, and cache as one composed response. Their interaction:"
		},
		{
			"heading": "streaming-hydration-and-caching-together",
			"content": "This is why combining a streamed loader, a suspense-enabled data hook, and an `isr` rule stays correct — every stage agrees on what the response is. See Hydration and Caching Strategies."
		},
		{
			"heading": "observability",
			"content": "Streaming adds two spans to the render pass: time-to-first-byte of the stream (shell time) and the flush schedule of deferred boundaries. Together with total SSR wall time and client hydration time, they make streaming behavior measurable rather than anecdotal. See Observability."
		},
		{
			"heading": "whats-next",
			"content": "Server-Side Rendering — the pipeline streaming is part of"
		},
		{
			"heading": "whats-next",
			"content": "Hydration — how streamed chunks become client state"
		},
		{
			"heading": "whats-next",
			"content": "Loaders & Data — where deferred data is declared"
		},
		{
			"heading": "whats-next",
			"content": "Caching Strategies — caching the full stream per route"
		},
		{
			"heading": "whats-next",
			"content": "Frontend — the page surface that declares deferred values"
		}
	],
	"headings": [
		{
			"id": "the-shell-first-contract",
			"content": "The Shell-First Contract"
		},
		{
			"id": "render-in-parallel-with-data",
			"content": "Render in Parallel with Data"
		},
		{
			"id": "streaming-and-suspense-data-hooks",
			"content": "Streaming and Suspense Data Hooks"
		},
		{
			"id": "the-timing-budget",
			"content": "The Timing Budget"
		},
		{
			"id": "what-streaming-changes-on-the-client",
			"content": "What Streaming Changes on the Client"
		},
		{
			"id": "streaming-and-route-rules",
			"content": "Streaming and Route Rules"
		},
		{
			"id": "errors-in-streamed-segments",
			"content": "Errors in Streamed Segments"
		},
		{
			"id": "when-to-stream-when-to-block",
			"content": "When to Stream, When to Block"
		},
		{
			"id": "streaming-hydration-and-caching-together",
			"content": "Streaming, Hydration, and Caching Together"
		},
		{
			"id": "observability",
			"content": "Observability"
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
		url: "#the-shell-first-contract",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Shell-First Contract" })
	},
	{
		depth: 2,
		url: "#render-in-parallel-with-data",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Render in Parallel with Data" })
	},
	{
		depth: 2,
		url: "#streaming-and-suspense-data-hooks",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Streaming and Suspense Data Hooks" })
	},
	{
		depth: 2,
		url: "#the-timing-budget",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Timing Budget" })
	},
	{
		depth: 2,
		url: "#what-streaming-changes-on-the-client",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Streaming Changes on the Client" })
	},
	{
		depth: 2,
		url: "#streaming-and-route-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Streaming and Route Rules" })
	},
	{
		depth: 2,
		url: "#errors-in-streamed-segments",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Errors in Streamed Segments" })
	},
	{
		depth: 2,
		url: "#when-to-stream-when-to-block",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When to Stream, When to Block" })
	},
	{
		depth: 2,
		url: "#streaming-hydration-and-caching-together",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Streaming, Hydration, and Caching Together" })
	},
	{
		depth: 2,
		url: "#observability",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Observability" })
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Streaming SSR ships the shell of a page the moment it can render, and streams the rest in as its data resolves. The streaming is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "suspense-aware" }),
			": the rendering runtime flushes each suspense boundary the instant the deferred segment behind it is ready. The user sees a real page start paint at shell time — not after every loader on the route has finished."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Streaming is the default mechanism of the framework-owned SSR pipeline (ADR-0006): the engine serves, the framework renders with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "renderToReadableStream" }),
			", and Suspense boundaries flush as deferred data resolves. On runtimes without streaming support, the pipeline degrades to a buffered render — capability is auto-detected and documented per preset."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-shell-first-contract",
			children: "The Shell-First Contract"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A page loader can split its work into blocking and deferred:" }),
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
			title: "the-shell-first-contract.tsx",
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
							children: "(params.id),                        "
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
							children: "({ postId: params.id })),  "
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
						children: "}),"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Values awaited directly in the loader (the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "post" }),
				") hold back the shell. Nothing on the route renders until every blocking value across all matched loaders resolves."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Values wrapped in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stream()" }),
				" (the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "comments" }),
				") defer the segment. The page renders as soon as the blocking data is ready; the deferred value streams into its suspense boundary when it arrives."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The page marks where each deferred piece lands:" }),
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
			title: "the-shell-first-contract-2.tsx",
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
							children: "component"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "loaderData"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "post"
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
							children: "comments"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } }) "
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
							children: " ("
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
							children: "  <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#22863A",
								"--shiki-dark": "#85E89D"
							},
							children: "article"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">"
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
							children: "    <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#22863A",
								"--shiki-dark": "#85E89D"
							},
							children: "h1"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">{post.title}</"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#22863A",
								"--shiki-dark": "#85E89D"
							},
							children: "h1"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">"
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
							children: "    <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Suspense"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " fallback"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "{<"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#22863A",
								"--shiki-dark": "#85E89D"
							},
							children: "p"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">Comments…</"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#22863A",
								"--shiki-dark": "#85E89D"
							},
							children: "p"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">}>"
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
							children: "      <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Comments"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " stream"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "{comments} />"
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
							children: "    </"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Suspense"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">"
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
							children: "  </"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#22863A",
								"--shiki-dark": "#85E89D"
							},
							children: "article"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">"
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
						children: "),"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The shell flushes fully rendered — the correct ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "head" }),
			" included — with the deferred regions in their fallback state. Streaming is not partial HTML sent before the page is structured; it is whole regions shipped as they complete."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "render-in-parallel-with-data",
			children: "Render in Parallel with Data"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Streaming is not merely progressive enhancement — it lets rendering and data run concurrently. While the server renders the blocking content and flushes it, the deferred queries continue in the background and flush as they complete. On a comment-heavy post, the headline and body reach first paint while the comment query is still running; comments then stream in without a second navigation." }),
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
			title: "render-in-parallel-with-data.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "t0   blocking data resolves → shell flushes" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "t0.. deferred query runs in parallel with rendering" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "tN   deferred chunk resolves → suspense boundary flushes" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This mirrors the parallel loader contract: all matched loaders run concurrently, and deferred lookups ride the same execution. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "streaming-and-suspense-data-hooks",
			children: "Streaming and Suspense Data Hooks"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Streamed loader data and suspense-enabled data hooks share one boundary model. A hook with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "suspense: true" }),
			" throws to the nearest suspense boundary while pending — the same boundary that renders a streamed ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "loaderData" }),
			" segment — so a page can mix a blocking loader value, a deferred value, and a client-only query under the same boundary tree:"
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
			title: "streaming-and-suspense-data-hooks.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "<"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Suspense"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " fallback"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "{<"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#22863A",
								"--shiki-dark": "#85E89D"
							},
							children: "p"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">Loading…</"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#22863A",
								"--shiki-dark": "#85E89D"
							},
							children: "p"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">}>"
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
							children: "  <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "StreamedSegment"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " stream"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "{comments} />   // deferred loader value"
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
							children: "  <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "UserPanel"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " />                           // suspense-enabled hook, fetches on client"
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
							children: "</"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Suspense"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The deferred loader value streams in from the server; the hook's query runs on the client and resolves into the same cache. Either way the boundary governs its own lifecycle, and errors stay scoped to the region. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-timing-budget",
			children: "The Timing Budget"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Streaming exists to hold the shell-time budget. The framework's reference timing targets shape the split:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Stage" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Budget (p50, reference app)" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Shell (stream start)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "< 50ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Deferred chunk flush" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "as data resolves" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Full stream complete" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "blocked data + remaining queries" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Hydration" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "after shell paint" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The loader split is what protects the shell budget: only direct ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "await" }),
			"s in loaders hold up the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "< 50ms" }),
			" target, so the rule is to keep the blocking set minimal and defer everything else. The dev overlay shows the loader waterfall per request — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/dev-overlay",
				children: "Observability"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-streaming-changes-on-the-client",
			children: "What Streaming Changes on the Client"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The client treats streamed segments the same way it treats any suspense boundary. The shell hydrates immediately, the deferred region is hydrated when its chunk arrives, and the router stays on the same route and search state throughout. There is no page reload and no duplicated fetch — each chunk carries its own loader data keyed identically to the client cache." }),
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
			title: "what-streaming-changes-on-the-client.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "shell → hydrates immediately" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "chunk → hydrates its boundary as it arrives" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "router → stays on the same route and search state throughout" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because each chunk dehydrates under loader-identical cache keys, a streamed segment that the client already has (from an earlier visit or a preload) hydrates without refetch. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/hydration",
				children: "Hydration"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "streaming-and-route-rules",
			children: "Streaming and Route Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Streaming composes with response caching. Route rules operate on the full stream:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Rule" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior with streaming" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache: n" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The composed response is cached for ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "n" }),
				" seconds"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr: n" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Stale stream is served while the background revalidates a fresh one" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr: n" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The complete stream is cached and regenerated on interval or on demand" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A streamed page is cached as a whole, not piecemeal — the shell and its deferred segments revalidate together, so a stale shell never matches fresh fragments. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "errors-in-streamed-segments",
			children: "Errors in Streamed Segments"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Deferred values that reject after the shell has streamed cannot reset the page. Instead, the failing suspense boundary falls back to its error state with a retry — the shell stays intact and the region governs its own recovery. During development the overlay surfaces the loader stack and trace id for the rejected segment. On the server the rejection is logged against the request's span; the client never sees an uncaught stream error take down the page. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-to-stream-when-to-block",
			children: "When to Stream, When to Block"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Decide per value, in the loader:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Value" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Decision" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Rationale" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The record the frame repeats (article title, layout nav)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Block" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A meaningful first paint needs it" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Below-the-fold lists (comments, related items)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Stream" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Natural async, renders fine on arrival" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Aggregated panels (counts, summaries)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Stream" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Non-critical by latency" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Anything whose absence breaks the shell" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Block" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A missing frame value wastes the whole shell" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The rule of thumb: if a missing value would leave the shell useless, block it. Otherwise defer it and let the user watch the page fill in." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "streaming-hydration-and-caching-together",
			children: "Streaming, Hydration, and Caching Together"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Streaming, hydration, and caching share one result model: the full streamed response. The shell and its deferred chunks dehydrate into the same state payload, rehydrate into the same cache keys, and cache as one composed response. Their interaction:" }),
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
			title: "streaming-hydration-and-caching-together.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "shell + deferred chunks → one response" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → dehydrated into the state payload" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → cached whole under route rules" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → client rehydrates each region under identical keys" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This is why combining a streamed loader, a suspense-enabled data hook, and an ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr" }),
			" rule stays correct — every stage agrees on what the response is. See ",
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
			id: "observability",
			children: "Observability"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Streaming adds two spans to the render pass: time-to-first-byte of the stream (shell time) and the flush schedule of deferred boundaries. Together with total SSR wall time and client hydration time, they make streaming behavior measurable rather than anecdotal. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/metrics",
				children: "Observability"
			}),
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
				href: "/docs/rendering/ssr",
				children: "Server-Side Rendering"
			}), " — the pipeline streaming is part of"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/hydration",
				children: "Hydration"
			}), " — how streamed chunks become client state"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}), " — where deferred data is declared"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}), " — caching the full stream per route"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend",
				children: "Frontend"
			}), " — the page surface that declares deferred values"] }),
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
