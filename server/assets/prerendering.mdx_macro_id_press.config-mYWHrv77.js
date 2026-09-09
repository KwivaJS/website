import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/rendering/prerendering.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Static Generation",
	"description": "Build-time prerendering — kwiva build output, static routes, ISR, and the SPA fallback."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nStatic generation turns routes into **build-time artifacts**: HTML, assets, and JSON that a static host can serve directly — no server round-trip at request time. It is the strongest caching strategy a route can have, and it composes with incremental regeneration for routes that change after the build.\n\nBecause the build runs the real pipeline — router match, guards, loaders, rendering — the artifacts are identical to what a server would have streamed, minus the server. The same pipeline that serves dynamic SSR also produces the static files; only the schedule changes.\n\n## What Static Generation Produces [#what-static-generation-produces]\n\nAt `kwiva build`, routes marked for static output are rendered once and emitted as files:\n\n```plaintext title=\"what-static-generation-produces.txt\"\ndist/\n├─ index.html\n├─ about.html\n├─ posts/\n│  ├─ index.html\n│  └─ widget-1.html ...\n└─ assets/...\n```\n\nA static host serves these directly. Head and meta are serialized per route during the build pass, so a statically generated site ships the same SEO tags a server-rendered one would. See [Pages](/docs/frontend/pages) for the `head` contract.\n\n## Build-Time Crawl or Explicit List [#build-time-crawl-or-explicit-list]\n\nStatic output is decided per route, two ways:\n\n| Declaration       | Behavior                                                                  |\n| ----------------- | ------------------------------------------------------------------------- |\n| `static: true`    | The exact route is built once; dynamic segments are enumerated explicitly |\n| `prerender: true` | The build crawls reachable routes and prerenders every one it finds       |\n\nFor a path with dynamic segments — `posts/$id` — the build needs the concrete set: declare them explicitly or let the crawler discover links from the pages it already renders:\n\n```plaintext title=\"build-time-crawl-or-explicit-list.txt\"\nstatic: true            → build writes these exact paths once\nprerender: true         → crawl from the route tree, prerender everything reachable\n```\n\nThe crawler follows the same links users would: a list page that links to detail routes seeds the detail set for the build pass. Anything not reachable by crawling — or not listed explicitly — stays out of the static output.\n\n### Crawl Mechanics [#crawl-mechanics]\n\nThe crawl is driven by the route tree and the rendered pages themselves:\n\n```plaintext title=\"crawl-mechanics.txt\"\nbuild start\n  → static: true routes render once (exact paths)\n  → prerender: true routes crawl from the route tree\n  → each rendered page yields its links → more routes enter the set\n  → all discovered pages render → artifacts written to dist/\n```\n\nFor data-driven paths such as `posts/$id`, the page set is whatever the crawler reaches plus whatever is enumerated explicitly. Content that is not linked from any rendered page — an orphaned draft, an unlisted detail page — must be listed explicitly or it will not be built.\n\n## The Build Pass [#the-build-pass]\n\nStatic output is produced by the same pipeline that serves SSR, run once at build:\n\n```plaintext title=\"the-build-pass.txt\"\nrequest (page route)                      kwiva build\n  → router match                             → the same pipeline,\n  → beforeLoad guards                         but once per static page,\n  → loaders run (in-process)                  at build time\n  → suspense-aware HTML\n  → head serialized per route\n```\n\nGuards run during the build pass too — a static page behind `beforeLoad` renders whatever the guard path produces at build time. That is why genuinely private routes do not belong in static output; keep static generation for public content, and keep session-dependent regions on client-side hooks with cached shells. See [Caching Strategies](/docs/rendering/caching).\n\n## Modes [#modes]\n\nStatic output flows from the project mode chosen at scaffold time:\n\n| Mode         | Meaning for rendering               |\n| ------------ | ----------------------------------- |\n| `fullstack`  | SSR pages + API routes              |\n| `api+spa`    | API server + single-page client app |\n| `static`     | Static site generation only         |\n| `standalone` | API-only, no frontend               |\n| `edge`       | Optimized for edge runtimes         |\n\nIn `static` mode the whole site is output to prerendered files and the API, if present, is served separately. In `fullstack` mode, static and ISR rules apply per route on top of the default SSR pipeline. The mode is a projection of the same codebase — see [Deployment](/docs/deployment) for how each mode ships.\n\n## Client-Only Fallback [#client-only-fallback]\n\n`api+spa` mode renders differently: pages render **client-only** from the same `definePage` files, and the server serves the app shell plus the API. The page files do not change — the same named exports drive server rendering and single-page rendering alike. Route rules still apply to the API surface; the client build is what the host serves.\n\n```plaintext title=\"client-only-fallback.txt\"\napi+spa\n  server → app shell + API\n  client → same definePage files, rendered client-side\n```\n\nBecause hydration is island-free full hydration, the SPA mode exercises the same component tree, the same data hooks, and the same cache as SSR — the renderer is the only difference. See [Hydration](/docs/rendering/hydration).\n\n## Static Generation vs Caching [#static-generation-vs-caching]\n\nStatic and cache rules are often confused; the difference is when work happens:\n\n| Strategy               | When rendering happens                                   | Request behavior                       |\n| ---------------------- | -------------------------------------------------------- | -------------------------------------- |\n| `static` / `prerender` | At build time                                            | Serves a file, zero rendering          |\n| `isr: n`               | First request, then regenerated on interval or on demand | Serves cached page while regenerating  |\n| `swr: n`               | First request; refreshed in background                   | Serves cached page, refreshes after    |\n| `cache: n`             | Every cache miss                                         | Cached response, re-rendered on expiry |\n| (default)              | Every request                                            | Fully dynamic                          |\n\nChoose static when content is fixed at build time (docs, marketing, a changelog). Choose ISR when content changes rarely but cannot be frozen at build (a catalog, a blog feed). Choose SWR or cache when pages mutate more frequently but tolerantly. See [Caching Strategies](/docs/rendering/caching) for the full comparison.\n\n## Static + Incremental Regeneration [#static--incremental-regeneration]\n\nStatic and ISR share one artifact model: a page that is `static` today can be promoted to `isr: n` when its content starts changing — the same route, now regenerated on an interval or on demand via `invalidateTags`. Either way the host keeps serving files; the difference is who does the rendering and when.\n\n```plaintext title=\"static-incremental-regeneration.txt\"\nstatic: true    → host serves files, never regenerated\nisr: 300        → host serves files, regenerated every 5 minutes (or on invalidateTags)\n```\n\nOn-demand invalidation reaches ISR pages from any job, task, or event handler with server authority — the next request re-renders the page regardless of the interval. See [Caching Strategies](/docs/rendering/caching) for tag invalidation.\n\n## Getting Static Output [#getting-static-output]\n\n```bash title=\"terminal\"\nkwiva build        # renders static + prerender routes, bundles the client\nkwiva preview      # verifies the built artifacts locally\nkwiva deploy       # ships to the configured host\n```\n\nDeploys bust static assets with a new build ID, so a redeploy never serves a stale asset set against fresh HTML. See [Deployment](/docs/deployment) and [First Deployment](/docs/getting-started/first-deployment).\n\n## The Same Codebase, Every Projection [#the-same-codebase-every-projection]\n\nThe same codebase ships as a full SSR application, a static site, or a single-page app — the mode and route rules decide, the files do not:\n\n| Want                                     | Choose       |\n| ---------------------------------------- | ------------ |\n| Fully dynamic SSR with per-route caching | `fullstack`  |\n| Static site, no server                   | `static`     |\n| SPA over an API                          | `api+spa`    |\n| API only                                 | `standalone` |\n\n## What's Next [#whats-next]\n\n* [Caching Strategies](/docs/rendering/caching) — cache rules beside static output\n* [Server-Side Rendering](/docs/rendering/ssr) — the pipeline static generation runs at build\n* [Deployment](/docs/deployment) — hosting the built artifacts\n* [First Deployment](/docs/getting-started/first-deployment) — ship a generated site end to end\n* [Frontend](/docs/frontend) — the page files that produce static output\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Static generation turns routes into **build-time artifacts**: HTML, assets, and JSON that a static host can serve directly — no server round-trip at request time. It is the strongest caching strategy a route can have, and it composes with incremental regeneration for routes that change after the build."
		},
		{
			"heading": void 0,
			"content": "Because the build runs the real pipeline — router match, guards, loaders, rendering — the artifacts are identical to what a server would have streamed, minus the server. The same pipeline that serves dynamic SSR also produces the static files; only the schedule changes."
		},
		{
			"heading": "what-static-generation-produces",
			"content": "At `kwiva build`, routes marked for static output are rendered once and emitted as files:"
		},
		{
			"heading": "what-static-generation-produces",
			"content": "A static host serves these directly. Head and meta are serialized per route during the build pass, so a statically generated site ships the same SEO tags a server-rendered one would. See Pages for the `head` contract."
		},
		{
			"heading": "build-time-crawl-or-explicit-list",
			"content": "Static output is decided per route, two ways:"
		},
		{
			"heading": "build-time-crawl-or-explicit-list",
			"content": "Declaration"
		},
		{
			"heading": "build-time-crawl-or-explicit-list",
			"content": "Behavior"
		},
		{
			"heading": "build-time-crawl-or-explicit-list",
			"content": "`static: true`"
		},
		{
			"heading": "build-time-crawl-or-explicit-list",
			"content": "The exact route is built once; dynamic segments are enumerated explicitly"
		},
		{
			"heading": "build-time-crawl-or-explicit-list",
			"content": "`prerender: true`"
		},
		{
			"heading": "build-time-crawl-or-explicit-list",
			"content": "The build crawls reachable routes and prerenders every one it finds"
		},
		{
			"heading": "build-time-crawl-or-explicit-list",
			"content": "For a path with dynamic segments — `posts/$id` — the build needs the concrete set: declare them explicitly or let the crawler discover links from the pages it already renders:"
		},
		{
			"heading": "build-time-crawl-or-explicit-list",
			"content": "The crawler follows the same links users would: a list page that links to detail routes seeds the detail set for the build pass. Anything not reachable by crawling — or not listed explicitly — stays out of the static output."
		},
		{
			"heading": "crawl-mechanics",
			"content": "The crawl is driven by the route tree and the rendered pages themselves:"
		},
		{
			"heading": "crawl-mechanics",
			"content": "For data-driven paths such as `posts/$id`, the page set is whatever the crawler reaches plus whatever is enumerated explicitly. Content that is not linked from any rendered page — an orphaned draft, an unlisted detail page — must be listed explicitly or it will not be built."
		},
		{
			"heading": "the-build-pass",
			"content": "Static output is produced by the same pipeline that serves SSR, run once at build:"
		},
		{
			"heading": "the-build-pass",
			"content": "Guards run during the build pass too — a static page behind `beforeLoad` renders whatever the guard path produces at build time. That is why genuinely private routes do not belong in static output; keep static generation for public content, and keep session-dependent regions on client-side hooks with cached shells. See Caching Strategies."
		},
		{
			"heading": "modes",
			"content": "Static output flows from the project mode chosen at scaffold time:"
		},
		{
			"heading": "modes",
			"content": "Mode"
		},
		{
			"heading": "modes",
			"content": "Meaning for rendering"
		},
		{
			"heading": "modes",
			"content": "`fullstack`"
		},
		{
			"heading": "modes",
			"content": "SSR pages + API routes"
		},
		{
			"heading": "modes",
			"content": "`api+spa`"
		},
		{
			"heading": "modes",
			"content": "API server + single-page client app"
		},
		{
			"heading": "modes",
			"content": "`static`"
		},
		{
			"heading": "modes",
			"content": "Static site generation only"
		},
		{
			"heading": "modes",
			"content": "`standalone`"
		},
		{
			"heading": "modes",
			"content": "API-only, no frontend"
		},
		{
			"heading": "modes",
			"content": "`edge`"
		},
		{
			"heading": "modes",
			"content": "Optimized for edge runtimes"
		},
		{
			"heading": "modes",
			"content": "In `static` mode the whole site is output to prerendered files and the API, if present, is served separately. In `fullstack` mode, static and ISR rules apply per route on top of the default SSR pipeline. The mode is a projection of the same codebase — see Deployment for how each mode ships."
		},
		{
			"heading": "client-only-fallback",
			"content": "`api+spa` mode renders differently: pages render **client-only** from the same `definePage` files, and the server serves the app shell plus the API. The page files do not change — the same named exports drive server rendering and single-page rendering alike. Route rules still apply to the API surface; the client build is what the host serves."
		},
		{
			"heading": "client-only-fallback",
			"content": "Because hydration is island-free full hydration, the SPA mode exercises the same component tree, the same data hooks, and the same cache as SSR — the renderer is the only difference. See Hydration."
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "Static and cache rules are often confused; the difference is when work happens:"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "Strategy"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "When rendering happens"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "Request behavior"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "`static` / `prerender`"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "At build time"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "Serves a file, zero rendering"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "`isr: n`"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "First request, then regenerated on interval or on demand"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "Serves cached page while regenerating"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "`swr: n`"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "First request; refreshed in background"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "Serves cached page, refreshes after"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "`cache: n`"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "Every cache miss"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "Cached response, re-rendered on expiry"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "(default)"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "Every request"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "Fully dynamic"
		},
		{
			"heading": "static-generation-vs-caching",
			"content": "Choose static when content is fixed at build time (docs, marketing, a changelog). Choose ISR when content changes rarely but cannot be frozen at build (a catalog, a blog feed). Choose SWR or cache when pages mutate more frequently but tolerantly. See Caching Strategies for the full comparison."
		},
		{
			"heading": "static--incremental-regeneration",
			"content": "Static and ISR share one artifact model: a page that is `static` today can be promoted to `isr: n` when its content starts changing — the same route, now regenerated on an interval or on demand via `invalidateTags`. Either way the host keeps serving files; the difference is who does the rendering and when."
		},
		{
			"heading": "static--incremental-regeneration",
			"content": "On-demand invalidation reaches ISR pages from any job, task, or event handler with server authority — the next request re-renders the page regardless of the interval. See Caching Strategies for tag invalidation."
		},
		{
			"heading": "getting-static-output",
			"content": "Deploys bust static assets with a new build ID, so a redeploy never serves a stale asset set against fresh HTML. See Deployment and First Deployment."
		},
		{
			"heading": "the-same-codebase-every-projection",
			"content": "The same codebase ships as a full SSR application, a static site, or a single-page app — the mode and route rules decide, the files do not:"
		},
		{
			"heading": "the-same-codebase-every-projection",
			"content": "Want"
		},
		{
			"heading": "the-same-codebase-every-projection",
			"content": "Choose"
		},
		{
			"heading": "the-same-codebase-every-projection",
			"content": "Fully dynamic SSR with per-route caching"
		},
		{
			"heading": "the-same-codebase-every-projection",
			"content": "`fullstack`"
		},
		{
			"heading": "the-same-codebase-every-projection",
			"content": "Static site, no server"
		},
		{
			"heading": "the-same-codebase-every-projection",
			"content": "`static`"
		},
		{
			"heading": "the-same-codebase-every-projection",
			"content": "SPA over an API"
		},
		{
			"heading": "the-same-codebase-every-projection",
			"content": "`api+spa`"
		},
		{
			"heading": "the-same-codebase-every-projection",
			"content": "API only"
		},
		{
			"heading": "the-same-codebase-every-projection",
			"content": "`standalone`"
		},
		{
			"heading": "whats-next",
			"content": "Caching Strategies — cache rules beside static output"
		},
		{
			"heading": "whats-next",
			"content": "Server-Side Rendering — the pipeline static generation runs at build"
		},
		{
			"heading": "whats-next",
			"content": "Deployment — hosting the built artifacts"
		},
		{
			"heading": "whats-next",
			"content": "First Deployment — ship a generated site end to end"
		},
		{
			"heading": "whats-next",
			"content": "Frontend — the page files that produce static output"
		}
	],
	"headings": [
		{
			"id": "what-static-generation-produces",
			"content": "What Static Generation Produces"
		},
		{
			"id": "build-time-crawl-or-explicit-list",
			"content": "Build-Time Crawl or Explicit List"
		},
		{
			"id": "crawl-mechanics",
			"content": "Crawl Mechanics"
		},
		{
			"id": "the-build-pass",
			"content": "The Build Pass"
		},
		{
			"id": "modes",
			"content": "Modes"
		},
		{
			"id": "client-only-fallback",
			"content": "Client-Only Fallback"
		},
		{
			"id": "static-generation-vs-caching",
			"content": "Static Generation vs Caching"
		},
		{
			"id": "static--incremental-regeneration",
			"content": "Static + Incremental Regeneration"
		},
		{
			"id": "getting-static-output",
			"content": "Getting Static Output"
		},
		{
			"id": "the-same-codebase-every-projection",
			"content": "The Same Codebase, Every Projection"
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
		url: "#what-static-generation-produces",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Static Generation Produces" })
	},
	{
		depth: 2,
		url: "#build-time-crawl-or-explicit-list",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Build-Time Crawl or Explicit List" })
	},
	{
		depth: 3,
		url: "#crawl-mechanics",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Crawl Mechanics" })
	},
	{
		depth: 2,
		url: "#the-build-pass",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Build Pass" })
	},
	{
		depth: 2,
		url: "#modes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Modes" })
	},
	{
		depth: 2,
		url: "#client-only-fallback",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Client-Only Fallback" })
	},
	{
		depth: 2,
		url: "#static-generation-vs-caching",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Static Generation vs Caching" })
	},
	{
		depth: 2,
		url: "#static--incremental-regeneration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Static + Incremental Regeneration" })
	},
	{
		depth: 2,
		url: "#getting-static-output",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Getting Static Output" })
	},
	{
		depth: 2,
		url: "#the-same-codebase-every-projection",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Same Codebase, Every Projection" })
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
		h3: "h3",
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
			"Static generation turns routes into ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "build-time artifacts" }),
			": HTML, assets, and JSON that a static host can serve directly — no server round-trip at request time. It is the strongest caching strategy a route can have, and it composes with incremental regeneration for routes that change after the build."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the build runs the real pipeline — router match, guards, loaders, rendering — the artifacts are identical to what a server would have streamed, minus the server. The same pipeline that serves dynamic SSR also produces the static files; only the schedule changes." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-static-generation-produces",
			children: "What Static Generation Produces"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"At ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }),
			", routes marked for static output are rendered once and emitted as files:"
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
			title: "what-static-generation-produces.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "dist/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ index.html" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ about.html" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ posts/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ index.html" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  └─ widget-1.html ..." })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "└─ assets/..." })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A static host serves these directly. Head and meta are serialized per route during the build pass, so a statically generated site ships the same SEO tags a server-rendered one would. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/pages",
				children: "Pages"
			}),
			" for the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "head" }),
			" contract."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "build-time-crawl-or-explicit-list",
			children: "Build-Time Crawl or Explicit List"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Static output is decided per route, two ways:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Declaration" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static: true" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The exact route is built once; dynamic segments are enumerated explicitly" })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender: true" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The build crawls reachable routes and prerenders every one it finds" })] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For a path with dynamic segments — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts/$id" }),
			" — the build needs the concrete set: declare them explicitly or let the crawler discover links from the pages it already renders:"
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
			title: "build-time-crawl-or-explicit-list.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "static: true            → build writes these exact paths once" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "prerender: true         → crawl from the route tree, prerender everything reachable" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The crawler follows the same links users would: a list page that links to detail routes seeds the detail set for the build pass. Anything not reachable by crawling — or not listed explicitly — stays out of the static output." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "crawl-mechanics",
			children: "Crawl Mechanics"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The crawl is driven by the route tree and the rendered pages themselves:" }),
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
			title: "crawl-mechanics.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "build start" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → static: true routes render once (exact paths)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → prerender: true routes crawl from the route tree" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → each rendered page yields its links → more routes enter the set" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → all discovered pages render → artifacts written to dist/" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For data-driven paths such as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts/$id" }),
			", the page set is whatever the crawler reaches plus whatever is enumerated explicitly. Content that is not linked from any rendered page — an orphaned draft, an unlisted detail page — must be listed explicitly or it will not be built."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-build-pass",
			children: "The Build Pass"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Static output is produced by the same pipeline that serves SSR, run once at build:" }),
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
			title: "the-build-pass.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "request (page route)                      kwiva build" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → router match                             → the same pipeline," })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → beforeLoad guards                         but once per static page," })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → loaders run (in-process)                  at build time" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → suspense-aware HTML" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → head serialized per route" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Guards run during the build pass too — a static page behind ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
			" renders whatever the guard path produces at build time. That is why genuinely private routes do not belong in static output; keep static generation for public content, and keep session-dependent regions on client-side hooks with cached shells. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "modes",
			children: "Modes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Static output flows from the project mode chosen at scaffold time:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning for rendering" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR pages + API routes" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API server + single-page client app" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Static site generation only" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API-only, no frontend" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Optimized for edge runtimes" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"In ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			" mode the whole site is output to prerendered files and the API, if present, is served separately. In ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }),
			" mode, static and ISR rules apply per route on top of the default SSR pipeline. The mode is a projection of the same codebase — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment",
				children: "Deployment"
			}),
			" for how each mode ships."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "client-only-fallback",
			children: "Client-Only Fallback"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }),
			" mode renders differently: pages render ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "client-only" }),
			" from the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			" files, and the server serves the app shell plus the API. The page files do not change — the same named exports drive server rendering and single-page rendering alike. Route rules still apply to the API surface; the client build is what the host serves."
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
			title: "client-only-fallback.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "api+spa" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  server → app shell + API" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  client → same definePage files, rendered client-side" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because hydration is island-free full hydration, the SPA mode exercises the same component tree, the same data hooks, and the same cache as SSR — the renderer is the only difference. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/hydration",
				children: "Hydration"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "static-generation-vs-caching",
			children: "Static Generation vs Caching"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Static and cache rules are often confused; the difference is when work happens:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Strategy" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "When rendering happens" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Request behavior" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
					" / ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "At build time" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Serves a file, zero rendering" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr: n" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "First request, then regenerated on interval or on demand" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Serves cached page while regenerating" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr: n" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "First request; refreshed in background" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Serves cached page, refreshes after" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache: n" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Every cache miss" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cached response, re-rendered on expiry" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "(default)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Every request" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Fully dynamic" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Choose static when content is fixed at build time (docs, marketing, a changelog). Choose ISR when content changes rarely but cannot be frozen at build (a catalog, a blog feed). Choose SWR or cache when pages mutate more frequently but tolerantly. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}),
			" for the full comparison."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "static--incremental-regeneration",
			children: "Static + Incremental Regeneration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Static and ISR share one artifact model: a page that is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			" today can be promoted to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr: n" }),
			" when its content starts changing — the same route, now regenerated on an interval or on demand via ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidateTags" }),
			". Either way the host keeps serving files; the difference is who does the rendering and when."
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
			title: "static-incremental-regeneration.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "static: true    → host serves files, never regenerated" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "isr: 300        → host serves files, regenerated every 5 minutes (or on invalidateTags)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"On-demand invalidation reaches ISR pages from any job, task, or event handler with server authority — the next request re-renders the page regardless of the interval. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}),
			" for tag invalidation."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "getting-static-output",
			children: "Getting Static Output"
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
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "        # renders static + prerender routes, bundles the client"
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
							children: "      # verifies the built artifacts locally"
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
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "       # ships to the configured host"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Deploys bust static assets with a new build ID, so a redeploy never serves a stale asset set against fresh HTML. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment",
				children: "Deployment"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-deployment",
				children: "First Deployment"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-same-codebase-every-projection",
			children: "The Same Codebase, Every Projection"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The same codebase ships as a full SSR application, a static site, or a single-page app — the mode and route rules decide, the files do not:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Want" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Choose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Fully dynamic SSR with per-route caching" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Static site, no server" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SPA over an API" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API only" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}), " — cache rules beside static output"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/ssr",
				children: "Server-Side Rendering"
			}), " — the pipeline static generation runs at build"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment",
				children: "Deployment"
			}), " — hosting the built artifacts"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-deployment",
				children: "First Deployment"
			}), " — ship a generated site end to end"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend",
				children: "Frontend"
			}), " — the page files that produce static output"] }),
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
