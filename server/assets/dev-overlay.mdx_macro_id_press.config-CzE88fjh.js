import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/observability/dev-overlay.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Dev Overlay",
	"description": "Requests, latency, errors, server timing, and the query list — live telemetry visible while you develop."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nThe development overlay turns the telemetry that Kwiva already records into a live, in-flight view of your application. While you develop, the same spans, logs, and metrics that would normally sit in a collector are rendered next to your app, so a slow page, a failing query, or a validation misfire shows up in place instead of in a separate tool.\n\n## What You See During Development [#what-you-see-during-development]\n\nThe overlay surfaces five things:\n\n* **Request timeline** — every request your dev server handles, with method, route, status, and total duration.\n* **Span waterfall** — the full tree for any request: middleware, validation, controller, model queries, cache lookups, and response.\n* **Errors** — validation failures and exceptions, each carrying its `requestId` for follow-up.\n* **Query list** — every model query executed, with model, operation, normalized SQL, and duration.\n* **Cache decisions** — which responses and queries were served from cache versus computed, and which tags invalidated them.\n\nRequests are always sampled in development, so the timeline is complete — nothing is probabilistically skipped while you are debugging.\n\n## How It Surfaces [#how-it-surfaces]\n\nThe overlay is part of the development server, not a separate dashboard process. `kwiva dev` renders it alongside the running app, and because the pipeline is the same tracing runtime used by production, the overlay requires no extra wiring and adds nothing to the request path when it is closed. Data is derived from the same spans and logs that exporters would carry — the overlay reads from the shared runtime, so what you debug locally is exactly what your collector would receive in production.\n\n## The Request Timeline [#the-request-timeline]\n\nEach row corresponds one-to-one with a request your dev server handled. Clicking a request expands it into its span waterfall, mirroring the shape telemetry would export in production:\n\n```text title=\"the-request-timeline.txt\"\nhttp GET /api/posts (server)\n ├─ middleware.request-id\n ├─ middleware.session\n ├─ middleware.tenant\n ├─ validation (route schema)\n ├─ controller posts.list\n │   └─ model posts.query (sql + params normalized)\n └─ http.response (status, size)\n```\n\nRead the waterfall top to bottom to find where time went: a request that took 900 milliseconds total with 800 of it inside one model query is a query problem, not a routing problem. The overlay makes that distinction obvious at a glance.\n\n## Server Timing [#server-timing]\n\nEvery dev response also carries a `server-timing` header, which frames the same timing information on the wire. This means you can inspect request timing directly from browser developer tools — the network tab shows the handler's staged timings without switching back to the terminal:\n\n```text title=\"server-timing.txt\"\nserver-timing: middleware;dur=0.4, validation;dur=0.2, controller;dur=8.1, model;dur=7.6, total;dur=9.0\n```\n\nThe header and the overlay read from the same span data, so the numbers always agree. Matching them is fast, too: find the row in the overlay for the request you are inspecting and the network tab shows the same stages.\n\n## The Query List [#the-query-list]\n\nThe query list is where most performance debugging actually happens. Every query builder call run during development appears with:\n\n* The model and operation (list, get, create, update, delete, aggregate)\n* Normalized SQL with redacted parameters\n* Duration in milliseconds\n\nSpotting a missing index is often a matter of scrolling the list, finding the query that dominates every request it touches, and reading its SQL. Because spans and the query list share the tracing runtime, each query in the list links back to the request that triggered it.\n\nThe list is also the fastest education in what the framework actually issued: a route that produces a surprising number of queries for its code — an unexpected relation traversal, a where clause that parsed differently than intended — announces itself here before it becomes a production latency chart.\n\n## Errors [#errors]\n\nWhen a handler throws or a schema rejects input, the overlay surfaces it inline:\n\n* **Validation failures** — the field and reason for each rejected input, mirroring field-mapped validation errors.\n* **Exceptions** — the error message and stack, tagged with the request's `requestId`.\n\nEvery error row carries its correlation ID, so a failure you leave behind in the terminal can be cross-referenced with browser behavior later.\n\nThe overlay is also where non-blocking findings from the verification gate show up while you work — diagnostics that do not block are surfaced next to the app instead of failing the run, so warnings stay visible without interrupting the dev loop.\n\n## The Console [#the-console]\n\nThe same data is available programmatically in the `kwiva console` REPL:\n\n```text title=\"the-console.txt\"\napp.trace.last()      // the most recent span tree\napp.logs.tail(20)     // the last 20 log lines\n```\n\nThis is useful for scripting assertions while developing — assert a request produced no failed spans, or assert a specific log line exists after a test call.\n\nThe console and the overlay read the same in-memory buffers, so neither can drift from the other: a request visible in the overlay is the same request `app.trace.last()` returns, in the same shape.\n\n## The Investigative Loop [#the-investigative-loop]\n\nThe overlay is built for a specific working rhythm, and the surfaces line up with the order you investigate:\n\n1. Watch the **request timeline** as you reproduce the problem — the failing or slow request is right there\n2. Open its **span waterfall** and see which stage owns the time\n3. Read the **query list** for the accountable model query, and read its normalized SQL\n4. If the failure is an error, copy the `requestId` from the error row and follow it through logs\n\nBecause every surface reads from one span tree, the loop never requires switching tools mid-investigation. A slow request, its slow query, and its error row are three views of the same event, not three separate records to reconcile.\n\n## What the Overlay Replaces [#what-the-overlay-replaces]\n\nBefore you wire up a collector, the overlay answers the three questions that dominate early development: \"which request is slow,\" \"which query is slow,\" and \"what failed.\" By the time you add exporters for production, the span data the overlay rendered is already flowing through the same runtime — nothing extra needs to be implemented to graduate from local debugging to distributed tracing.\n\nThe overlay is deliberately dev-only. It renders telemetry in development; it is not a production dashboard, and production doesn't pay its rendering cost. The surface it shows is a window onto the same data your collector will receive.\n\n## What's Next [#whats-next]\n\n* [Tracing](/docs/observability/tracing) — the span tree the overlay renders\n* [Logging](/docs/observability/logging) — the log lines behind the error rows\n* [Metrics](/docs/observability/metrics) — the counters and series measured alongside spans\n* [Lifecycle](/docs/http/lifecycle) — the middleware and validation stages shown in the waterfall\n* [Getting Started](/docs/getting-started) — run `kwiva dev` and open the overlay\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The development overlay turns the telemetry that Kwiva already records into a live, in-flight view of your application. While you develop, the same spans, logs, and metrics that would normally sit in a collector are rendered next to your app, so a slow page, a failing query, or a validation misfire shows up in place instead of in a separate tool."
		},
		{
			"heading": "what-you-see-during-development",
			"content": "The overlay surfaces five things:"
		},
		{
			"heading": "what-you-see-during-development",
			"content": "**Request timeline** — every request your dev server handles, with method, route, status, and total duration."
		},
		{
			"heading": "what-you-see-during-development",
			"content": "**Span waterfall** — the full tree for any request: middleware, validation, controller, model queries, cache lookups, and response."
		},
		{
			"heading": "what-you-see-during-development",
			"content": "**Errors** — validation failures and exceptions, each carrying its `requestId` for follow-up."
		},
		{
			"heading": "what-you-see-during-development",
			"content": "**Query list** — every model query executed, with model, operation, normalized SQL, and duration."
		},
		{
			"heading": "what-you-see-during-development",
			"content": "**Cache decisions** — which responses and queries were served from cache versus computed, and which tags invalidated them."
		},
		{
			"heading": "what-you-see-during-development",
			"content": "Requests are always sampled in development, so the timeline is complete — nothing is probabilistically skipped while you are debugging."
		},
		{
			"heading": "how-it-surfaces",
			"content": "The overlay is part of the development server, not a separate dashboard process. `kwiva dev` renders it alongside the running app, and because the pipeline is the same tracing runtime used by production, the overlay requires no extra wiring and adds nothing to the request path when it is closed. Data is derived from the same spans and logs that exporters would carry — the overlay reads from the shared runtime, so what you debug locally is exactly what your collector would receive in production."
		},
		{
			"heading": "the-request-timeline",
			"content": "Each row corresponds one-to-one with a request your dev server handled. Clicking a request expands it into its span waterfall, mirroring the shape telemetry would export in production:"
		},
		{
			"heading": "the-request-timeline",
			"content": "Read the waterfall top to bottom to find where time went: a request that took 900 milliseconds total with 800 of it inside one model query is a query problem, not a routing problem. The overlay makes that distinction obvious at a glance."
		},
		{
			"heading": "server-timing",
			"content": "Every dev response also carries a `server-timing` header, which frames the same timing information on the wire. This means you can inspect request timing directly from browser developer tools — the network tab shows the handler's staged timings without switching back to the terminal:"
		},
		{
			"heading": "server-timing",
			"content": "The header and the overlay read from the same span data, so the numbers always agree. Matching them is fast, too: find the row in the overlay for the request you are inspecting and the network tab shows the same stages."
		},
		{
			"heading": "the-query-list",
			"content": "The query list is where most performance debugging actually happens. Every query builder call run during development appears with:"
		},
		{
			"heading": "the-query-list",
			"content": "The model and operation (list, get, create, update, delete, aggregate)"
		},
		{
			"heading": "the-query-list",
			"content": "Normalized SQL with redacted parameters"
		},
		{
			"heading": "the-query-list",
			"content": "Duration in milliseconds"
		},
		{
			"heading": "the-query-list",
			"content": "Spotting a missing index is often a matter of scrolling the list, finding the query that dominates every request it touches, and reading its SQL. Because spans and the query list share the tracing runtime, each query in the list links back to the request that triggered it."
		},
		{
			"heading": "the-query-list",
			"content": "The list is also the fastest education in what the framework actually issued: a route that produces a surprising number of queries for its code — an unexpected relation traversal, a where clause that parsed differently than intended — announces itself here before it becomes a production latency chart."
		},
		{
			"heading": "errors",
			"content": "When a handler throws or a schema rejects input, the overlay surfaces it inline:"
		},
		{
			"heading": "errors",
			"content": "**Validation failures** — the field and reason for each rejected input, mirroring field-mapped validation errors."
		},
		{
			"heading": "errors",
			"content": "**Exceptions** — the error message and stack, tagged with the request's `requestId`."
		},
		{
			"heading": "errors",
			"content": "Every error row carries its correlation ID, so a failure you leave behind in the terminal can be cross-referenced with browser behavior later."
		},
		{
			"heading": "errors",
			"content": "The overlay is also where non-blocking findings from the verification gate show up while you work — diagnostics that do not block are surfaced next to the app instead of failing the run, so warnings stay visible without interrupting the dev loop."
		},
		{
			"heading": "the-console",
			"content": "The same data is available programmatically in the `kwiva console` REPL:"
		},
		{
			"heading": "the-console",
			"content": "This is useful for scripting assertions while developing — assert a request produced no failed spans, or assert a specific log line exists after a test call."
		},
		{
			"heading": "the-console",
			"content": "The console and the overlay read the same in-memory buffers, so neither can drift from the other: a request visible in the overlay is the same request `app.trace.last()` returns, in the same shape."
		},
		{
			"heading": "the-investigative-loop",
			"content": "The overlay is built for a specific working rhythm, and the surfaces line up with the order you investigate:"
		},
		{
			"heading": "the-investigative-loop",
			"content": "Watch the **request timeline** as you reproduce the problem — the failing or slow request is right there"
		},
		{
			"heading": "the-investigative-loop",
			"content": "Open its **span waterfall** and see which stage owns the time"
		},
		{
			"heading": "the-investigative-loop",
			"content": "Read the **query list** for the accountable model query, and read its normalized SQL"
		},
		{
			"heading": "the-investigative-loop",
			"content": "If the failure is an error, copy the `requestId` from the error row and follow it through logs"
		},
		{
			"heading": "the-investigative-loop",
			"content": "Because every surface reads from one span tree, the loop never requires switching tools mid-investigation. A slow request, its slow query, and its error row are three views of the same event, not three separate records to reconcile."
		},
		{
			"heading": "what-the-overlay-replaces",
			"content": "Before you wire up a collector, the overlay answers the three questions that dominate early development: \"which request is slow,\" \"which query is slow,\" and \"what failed.\" By the time you add exporters for production, the span data the overlay rendered is already flowing through the same runtime — nothing extra needs to be implemented to graduate from local debugging to distributed tracing."
		},
		{
			"heading": "what-the-overlay-replaces",
			"content": "The overlay is deliberately dev-only. It renders telemetry in development; it is not a production dashboard, and production doesn't pay its rendering cost. The surface it shows is a window onto the same data your collector will receive."
		},
		{
			"heading": "whats-next",
			"content": "Tracing — the span tree the overlay renders"
		},
		{
			"heading": "whats-next",
			"content": "Logging — the log lines behind the error rows"
		},
		{
			"heading": "whats-next",
			"content": "Metrics — the counters and series measured alongside spans"
		},
		{
			"heading": "whats-next",
			"content": "Lifecycle — the middleware and validation stages shown in the waterfall"
		},
		{
			"heading": "whats-next",
			"content": "Getting Started — run `kwiva dev` and open the overlay"
		}
	],
	"headings": [
		{
			"id": "what-you-see-during-development",
			"content": "What You See During Development"
		},
		{
			"id": "how-it-surfaces",
			"content": "How It Surfaces"
		},
		{
			"id": "the-request-timeline",
			"content": "The Request Timeline"
		},
		{
			"id": "server-timing",
			"content": "Server Timing"
		},
		{
			"id": "the-query-list",
			"content": "The Query List"
		},
		{
			"id": "errors",
			"content": "Errors"
		},
		{
			"id": "the-console",
			"content": "The Console"
		},
		{
			"id": "the-investigative-loop",
			"content": "The Investigative Loop"
		},
		{
			"id": "what-the-overlay-replaces",
			"content": "What the Overlay Replaces"
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
		url: "#what-you-see-during-development",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What You See During Development" })
	},
	{
		depth: 2,
		url: "#how-it-surfaces",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How It Surfaces" })
	},
	{
		depth: 2,
		url: "#the-request-timeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Request Timeline" })
	},
	{
		depth: 2,
		url: "#server-timing",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Server Timing" })
	},
	{
		depth: 2,
		url: "#the-query-list",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Query List" })
	},
	{
		depth: 2,
		url: "#errors",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Errors" })
	},
	{
		depth: 2,
		url: "#the-console",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Console" })
	},
	{
		depth: 2,
		url: "#the-investigative-loop",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Investigative Loop" })
	},
	{
		depth: 2,
		url: "#what-the-overlay-replaces",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What the Overlay Replaces" })
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
		ul: "ul",
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The development overlay turns the telemetry that Kwiva already records into a live, in-flight view of your application. While you develop, the same spans, logs, and metrics that would normally sit in a collector are rendered next to your app, so a slow page, a failing query, or a validation misfire shows up in place instead of in a separate tool." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-you-see-during-development",
			children: "What You See During Development"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The overlay surfaces five things:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Request timeline" }), " — every request your dev server handles, with method, route, status, and total duration."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Span waterfall" }), " — the full tree for any request: middleware, validation, controller, model queries, cache lookups, and response."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Errors" }),
				" — validation failures and exceptions, each carrying its ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
				" for follow-up."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Query list" }), " — every model query executed, with model, operation, normalized SQL, and duration."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Cache decisions" }), " — which responses and queries were served from cache versus computed, and which tags invalidated them."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Requests are always sampled in development, so the timeline is complete — nothing is probabilistically skipped while you are debugging." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-it-surfaces",
			children: "How It Surfaces"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The overlay is part of the development server, not a separate dashboard process. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" renders it alongside the running app, and because the pipeline is the same tracing runtime used by production, the overlay requires no extra wiring and adds nothing to the request path when it is closed. Data is derived from the same spans and logs that exporters would carry — the overlay reads from the shared runtime, so what you debug locally is exactly what your collector would receive in production."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-request-timeline",
			children: "The Request Timeline"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each row corresponds one-to-one with a request your dev server handled. Clicking a request expands it into its span waterfall, mirroring the shape telemetry would export in production:" }),
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
			title: "the-request-timeline.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "http GET /api/posts (server)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ middleware.request-id" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ middleware.session" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ middleware.tenant" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ validation (route schema)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ controller posts.list" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " │   └─ model posts.query (sql + params normalized)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " └─ http.response (status, size)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Read the waterfall top to bottom to find where time went: a request that took 900 milliseconds total with 800 of it inside one model query is a query problem, not a routing problem. The overlay makes that distinction obvious at a glance." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "server-timing",
			children: "Server Timing"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every dev response also carries a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "server-timing" }),
			" header, which frames the same timing information on the wire. This means you can inspect request timing directly from browser developer tools — the network tab shows the handler's staged timings without switching back to the terminal:"
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
			title: "server-timing.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "server-timing: middleware;dur=0.4, validation;dur=0.2, controller;dur=8.1, model;dur=7.6, total;dur=9.0" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The header and the overlay read from the same span data, so the numbers always agree. Matching them is fast, too: find the row in the overlay for the request you are inspecting and the network tab shows the same stages." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-query-list",
			children: "The Query List"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The query list is where most performance debugging actually happens. Every query builder call run during development appears with:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The model and operation (list, get, create, update, delete, aggregate)" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Normalized SQL with redacted parameters" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Duration in milliseconds" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Spotting a missing index is often a matter of scrolling the list, finding the query that dominates every request it touches, and reading its SQL. Because spans and the query list share the tracing runtime, each query in the list links back to the request that triggered it." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The list is also the fastest education in what the framework actually issued: a route that produces a surprising number of queries for its code — an unexpected relation traversal, a where clause that parsed differently than intended — announces itself here before it becomes a production latency chart." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "errors",
			children: "Errors"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "When a handler throws or a schema rejects input, the overlay surfaces it inline:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Validation failures" }), " — the field and reason for each rejected input, mirroring field-mapped validation errors."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Exceptions" }),
				" — the error message and stack, tagged with the request's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every error row carries its correlation ID, so a failure you leave behind in the terminal can be cross-referenced with browser behavior later." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The overlay is also where non-blocking findings from the verification gate show up while you work — diagnostics that do not block are surfaced next to the app instead of failing the run, so warnings stay visible without interrupting the dev loop." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-console",
			children: "The Console"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same data is available programmatically in the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva console" }),
			" REPL:"
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
			title: "the-console.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "app.trace.last()      // the most recent span tree" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "app.logs.tail(20)     // the last 20 log lines" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This is useful for scripting assertions while developing — assert a request produced no failed spans, or assert a specific log line exists after a test call." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The console and the overlay read the same in-memory buffers, so neither can drift from the other: a request visible in the overlay is the same request ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "app.trace.last()" }),
			" returns, in the same shape."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-investigative-loop",
			children: "The Investigative Loop"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The overlay is built for a specific working rhythm, and the surfaces line up with the order you investigate:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Watch the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "request timeline" }),
				" as you reproduce the problem — the failing or slow request is right there"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Open its ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "span waterfall" }),
				" and see which stage owns the time"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Read the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "query list" }),
				" for the accountable model query, and read its normalized SQL"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"If the failure is an error, copy the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
				" from the error row and follow it through logs"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because every surface reads from one span tree, the loop never requires switching tools mid-investigation. A slow request, its slow query, and its error row are three views of the same event, not three separate records to reconcile." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-the-overlay-replaces",
			children: "What the Overlay Replaces"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Before you wire up a collector, the overlay answers the three questions that dominate early development: \"which request is slow,\" \"which query is slow,\" and \"what failed.\" By the time you add exporters for production, the span data the overlay rendered is already flowing through the same runtime — nothing extra needs to be implemented to graduate from local debugging to distributed tracing." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The overlay is deliberately dev-only. It renders telemetry in development; it is not a production dashboard, and production doesn't pay its rendering cost. The surface it shows is a window onto the same data your collector will receive." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Tracing"
			}), " — the span tree the overlay renders"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/logging",
				children: "Logging"
			}), " — the log lines behind the error rows"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/metrics",
				children: "Metrics"
			}), " — the counters and series measured alongside spans"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Lifecycle"
			}), " — the middleware and validation stages shown in the waterfall"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/getting-started",
					children: "Getting Started"
				}),
				" — run ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
				" and open the overlay"
			] }),
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
