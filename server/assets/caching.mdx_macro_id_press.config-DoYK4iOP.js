import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/http/caching.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Response Caching",
	"description": "Route rules for cache, SWR, ISR, static, and prerender — plus model caches, the cache API, and invalidation."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nCaching in Kwiva is layered. At the HTTP layer, route rules cache whole responses; below that, model caches reuse query results; and the explicit cache API handles keyed values. All layers share one invalidation model built on tags and model identity.\n\nThe decisions combine into a rule of thumb: the closer the cache sits to the client, the bigger the win and the more public it must be. A route rule can make a marketing page serve like a static file; the model cache removes repeated database reads; the cache API stores derived values that no query layer produces.\n\n## The Layers [#the-layers]\n\n```plaintext title=\"the-layers.txt\"\nroute rules   whole responses: default / cache / swr / isr / static / prerender\nmodel cache   query results per model, TTL + tags\ndata hooks    client cache, keyed by model and query\ncache API     explicit key/value with TTL + tags\n```\n\nEach layer answers a different question. Route rules make a public page or endpoint fast; the model cache makes repeated reads cheap; the cache API stores derived values; the client cache keeps data fresh for interactive users. See [Frontend: data hooks](/docs/frontend/data-hooks) for the client layer.\n\n## Route Rules [#route-rules]\n\nRoute rules are declared on server routes in `src/routes/rules.ts`:\n\n```ts title=\"src/routes/rules.ts\"\n// src/routes/rules.ts\ndefineServerRoute('/products/**', { isr: 300, cache: { tags: ['catalog'] } })\ndefineServerRoute('/pricing/**',  { static: true })\ndefineServerRoute('/news/**',     { swr: 60 })\n```\n\n| Rule        | Behavior                                              |\n| ----------- | ----------------------------------------------------- |\n| `default`   | Dynamic — always fresh, no cache layer involved       |\n| `cache: n`  | Serve the cached response for `n` seconds             |\n| `swr: n`    | Stale-while-revalidate — serve, refresh in background |\n| `isr: n`    | Regenerate the static page on an interval             |\n| `static`    | Build-time output, never regenerated at runtime       |\n| `prerender` | Crawled and rendered at build time                    |\n\n`default` is the implicit behavior of any path without a rule: fully dynamic. Choosing a caching rule is therefore an explicit act — every matched path either declares its freshness contract or stays fresh by default.\n\nRules apply **before** context assembly — a cache hit serves the response and bypasses the pipeline, including session loading. That makes cached routes fast even under load, and it means only public, non-personalized routes belong here. The framework refuses to cache responses that set `Set-Cookie`.\n\n> \\[!WARNING]\n> A route rule bypasses middleware, guards, and session loading. Only paths deliberately public — public pages, public endpoints, shared assets — should carry a caching rule. Anything that varies per user must stay `default`.\n\n## Cache Tags on Rules [#cache-tags-on-rules]\n\nRules can attach tags to their cached output:\n\n```ts title=\"cache-tags-on-rules.ts\"\ndefineServerRoute('/products/**', { cache: { tags: ['catalog'] } })\n```\n\nA later `invalidateTags(['catalog'])` purges these tagged caches along with any tagged model and cache-API entries. See the invalidation table below.\n\n## Model Cache [#model-cache]\n\nModels declare caching per model — list and get responses are cached per query signature:\n\n```ts title=\"model-cache.ts\"\ndefineModel('products', (f) => ({ ... }), {\n  cache: { ttl: 120, tags: ['catalog'], swr: true },\n})\n```\n\nThe cache key combines the model, the query signature, and the tenant. Model writes — create, update, delete — invalidate the model's keys automatically, so reads never go stale after a write on the same model. Tenancy folds into the key, so two tenants reading the same model never share cached rows. See [Models](/docs/data/models).\n\n## The Cache API [#the-cache-api]\n\nThe explicit cache API handles keyed values that no other layer covers:\n\n```ts title=\"the-cache-api.ts\"\nimport { cache } from '@kwiva/core'\n\nawait cache.set('stats:overview', value, { ttl: 300, tags: ['stats'] })\nconst cached = await cache.get('stats:overview')\nconst fresh = await cache.wrap('stats:overview', async () => compute(), { ttl: 300 })\n\nawait cache.invalidateTags(['stats'])\n```\n\n* `set` stores a value with TTL and tags\n* `get` reads a value\n* `wrap` memoizes a computation — on a miss, runs it, stores it, returns it\n* `invalidateTags` purges every tagged entry across layers\n\nBackends are mounted in `src/config/cache.ts`: memory in development, a shared store in production, and a distributed key-value mount on the edge.\n\n## Invalidation [#invalidation]\n\nInvalidation is the contract that keeps layers consistent:\n\n| Trigger                           | Effect                                          |\n| --------------------------------- | ----------------------------------------------- |\n| Model write (automatic)           | Purges that model's keys                        |\n| `invalidateTags([...])`           | Purges tagged keys and tagged route-rule caches |\n| `invalidate(Model)` on the client | Refreshes data-hook queries for the model       |\n| Deploy                            | Build ID busts static assets                    |\n\nModel writes purge without manual calls. Tags offer cross-layer coordination — one tag can connect a route-rule cache, a model cache, and explicit cache entries. Client-side invalidation refreshes the data hooks the user is actively viewing. See [Frontend: data hooks](/docs/frontend/data-hooks).\n\n### On-demand invalidation [#on-demand-invalidation]\n\n`invalidateTags` is the on-demand lever. It calls the route-rule purge in the same breath as the model and cache-API purges, so publishing a catalog update can refresh a server-cached product grid, a cached catalog query, and derived analytics in one call:\n\n```ts title=\"on-demand-invalidation.ts\"\n// after a product publish or price change\nawait cache.invalidateTags(['catalog'])\n```\n\nThis is the bridge between the layers: one tag, one call, and every layer that declared it is coherent again.\n\n## Choosing Between Rules [#choosing-between-rules]\n\nThe rule you pick trades freshness for cost:\n\n| Situation                                           | Rule                               |\n| --------------------------------------------------- | ---------------------------------- |\n| Content changes rarely, latency matters             | `static` or `prerender`            |\n| Content changes on a schedule or at publish time    | `isr` with a regeneration interval |\n| Content may go stale briefly, availability matters  | `swr`                              |\n| Content changes and you want a strict TTL           | `cache`                            |\n| Personal, session-dependent, or frequently changing | `default`                          |\n\nISR and SWR both serve stale content while refreshing; the difference is the trigger. SWR refreshes on demand when a request arrives, ISR regenerates on an interval regardless of traffic. `static` and `prerender` are build-time: `static` writes known output, `prerender` crawls and renders routes during the build.\n\n## Streaming Routes Stay Dynamic [#streaming-routes-stay-dynamic]\n\nA route that returns a stream cannot be served from a whole-response cache — the cached body would be a buffered snapshot, not a live stream. Streaming routes therefore behave as `default`, and the framework does not attempt to cache them. See [Streaming & SSE](/docs/http/streaming).\n\n## Caching and Tenancy [#caching-and-tenancy]\n\nThe model cache folds the tenant into its key, so cross-tenant reads never collide. Route-rule caches are tenant-agnostic by design: they serve public, non-personalized content only. For tenant-scoped data, cache through the model layer or the cache API with per-tenant keys rather than a public route rule. See [Tenancy](/docs/tenancy).\n\n## Session and Personalization Rules [#session-and-personalization-rules]\n\nTwo rules keep personalization correct:\n\n* Session-dependent responses stay dynamic. A cached public shell plus `useResource`-driven private fragments is the supported pattern.\n* The framework refuses to cache responses carrying `Set-Cookie`, so a cached page can never leak a session cookie to another user.\n\n## Development Behavior [#development-behavior]\n\nIn development, route caching is disabled by default and the model cache logs each decision:\n\n* `cache:miss` and `cache:hit` are logged per model query\n* `kwiva dev --cache` simulates production caching locally\n* The development overlay shows per-request cache decisions\n\n## Metrics [#metrics]\n\nEvery layer reports into observability: hit and miss ratios per layer, invalidation counts, and purge latency. See [Observability: metrics](/docs/observability/metrics).\n\n## What's Next [#whats-next]\n\n1. [Rendering: caching](/docs/rendering/caching) — page-level caching and ISR\n2. [Rendering: prerendering](/docs/rendering/prerendering) — build-time output and crawling\n3. [Routes & Routing](/docs/http/routes) — where route rules are declared\n4. [Models](/docs/data/models) — the `cache` model option\n5. [Frontend: data hooks](/docs/frontend/data-hooks) — client-scope caching and invalidation\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Caching in Kwiva is layered. At the HTTP layer, route rules cache whole responses; below that, model caches reuse query results; and the explicit cache API handles keyed values. All layers share one invalidation model built on tags and model identity."
		},
		{
			"heading": void 0,
			"content": "The decisions combine into a rule of thumb: the closer the cache sits to the client, the bigger the win and the more public it must be. A route rule can make a marketing page serve like a static file; the model cache removes repeated database reads; the cache API stores derived values that no query layer produces."
		},
		{
			"heading": "the-layers",
			"content": "Each layer answers a different question. Route rules make a public page or endpoint fast; the model cache makes repeated reads cheap; the cache API stores derived values; the client cache keeps data fresh for interactive users. See Frontend: data hooks for the client layer."
		},
		{
			"heading": "route-rules",
			"content": "Route rules are declared on server routes in `src/routes/rules.ts`:"
		},
		{
			"heading": "route-rules",
			"content": "Rule"
		},
		{
			"heading": "route-rules",
			"content": "Behavior"
		},
		{
			"heading": "route-rules",
			"content": "`default`"
		},
		{
			"heading": "route-rules",
			"content": "Dynamic — always fresh, no cache layer involved"
		},
		{
			"heading": "route-rules",
			"content": "`cache: n`"
		},
		{
			"heading": "route-rules",
			"content": "Serve the cached response for `n` seconds"
		},
		{
			"heading": "route-rules",
			"content": "`swr: n`"
		},
		{
			"heading": "route-rules",
			"content": "Stale-while-revalidate — serve, refresh in background"
		},
		{
			"heading": "route-rules",
			"content": "`isr: n`"
		},
		{
			"heading": "route-rules",
			"content": "Regenerate the static page on an interval"
		},
		{
			"heading": "route-rules",
			"content": "`static`"
		},
		{
			"heading": "route-rules",
			"content": "Build-time output, never regenerated at runtime"
		},
		{
			"heading": "route-rules",
			"content": "`prerender`"
		},
		{
			"heading": "route-rules",
			"content": "Crawled and rendered at build time"
		},
		{
			"heading": "route-rules",
			"content": "`default` is the implicit behavior of any path without a rule: fully dynamic. Choosing a caching rule is therefore an explicit act — every matched path either declares its freshness contract or stays fresh by default."
		},
		{
			"heading": "route-rules",
			"content": "Rules apply **before** context assembly — a cache hit serves the response and bypasses the pipeline, including session loading. That makes cached routes fast even under load, and it means only public, non-personalized routes belong here. The framework refuses to cache responses that set `Set-Cookie`."
		},
		{
			"heading": "route-rules",
			"content": "> \\[!WARNING]\n> A route rule bypasses middleware, guards, and session loading. Only paths deliberately public — public pages, public endpoints, shared assets — should carry a caching rule. Anything that varies per user must stay `default`."
		},
		{
			"heading": "cache-tags-on-rules",
			"content": "Rules can attach tags to their cached output:"
		},
		{
			"heading": "cache-tags-on-rules",
			"content": "A later `invalidateTags(['catalog'])` purges these tagged caches along with any tagged model and cache-API entries. See the invalidation table below."
		},
		{
			"heading": "model-cache",
			"content": "Models declare caching per model — list and get responses are cached per query signature:"
		},
		{
			"heading": "model-cache",
			"content": "The cache key combines the model, the query signature, and the tenant. Model writes — create, update, delete — invalidate the model's keys automatically, so reads never go stale after a write on the same model. Tenancy folds into the key, so two tenants reading the same model never share cached rows. See Models."
		},
		{
			"heading": "the-cache-api",
			"content": "The explicit cache API handles keyed values that no other layer covers:"
		},
		{
			"heading": "the-cache-api",
			"content": "`set` stores a value with TTL and tags"
		},
		{
			"heading": "the-cache-api",
			"content": "`get` reads a value"
		},
		{
			"heading": "the-cache-api",
			"content": "`wrap` memoizes a computation — on a miss, runs it, stores it, returns it"
		},
		{
			"heading": "the-cache-api",
			"content": "`invalidateTags` purges every tagged entry across layers"
		},
		{
			"heading": "the-cache-api",
			"content": "Backends are mounted in `src/config/cache.ts`: memory in development, a shared store in production, and a distributed key-value mount on the edge."
		},
		{
			"heading": "invalidation",
			"content": "Invalidation is the contract that keeps layers consistent:"
		},
		{
			"heading": "invalidation",
			"content": "Trigger"
		},
		{
			"heading": "invalidation",
			"content": "Effect"
		},
		{
			"heading": "invalidation",
			"content": "Model write (automatic)"
		},
		{
			"heading": "invalidation",
			"content": "Purges that model's keys"
		},
		{
			"heading": "invalidation",
			"content": "`invalidateTags([...])`"
		},
		{
			"heading": "invalidation",
			"content": "Purges tagged keys and tagged route-rule caches"
		},
		{
			"heading": "invalidation",
			"content": "`invalidate(Model)` on the client"
		},
		{
			"heading": "invalidation",
			"content": "Refreshes data-hook queries for the model"
		},
		{
			"heading": "invalidation",
			"content": "Deploy"
		},
		{
			"heading": "invalidation",
			"content": "Build ID busts static assets"
		},
		{
			"heading": "invalidation",
			"content": "Model writes purge without manual calls. Tags offer cross-layer coordination — one tag can connect a route-rule cache, a model cache, and explicit cache entries. Client-side invalidation refreshes the data hooks the user is actively viewing. See Frontend: data hooks."
		},
		{
			"heading": "on-demand-invalidation",
			"content": "`invalidateTags` is the on-demand lever. It calls the route-rule purge in the same breath as the model and cache-API purges, so publishing a catalog update can refresh a server-cached product grid, a cached catalog query, and derived analytics in one call:"
		},
		{
			"heading": "on-demand-invalidation",
			"content": "This is the bridge between the layers: one tag, one call, and every layer that declared it is coherent again."
		},
		{
			"heading": "choosing-between-rules",
			"content": "The rule you pick trades freshness for cost:"
		},
		{
			"heading": "choosing-between-rules",
			"content": "Situation"
		},
		{
			"heading": "choosing-between-rules",
			"content": "Rule"
		},
		{
			"heading": "choosing-between-rules",
			"content": "Content changes rarely, latency matters"
		},
		{
			"heading": "choosing-between-rules",
			"content": "`static` or `prerender`"
		},
		{
			"heading": "choosing-between-rules",
			"content": "Content changes on a schedule or at publish time"
		},
		{
			"heading": "choosing-between-rules",
			"content": "`isr` with a regeneration interval"
		},
		{
			"heading": "choosing-between-rules",
			"content": "Content may go stale briefly, availability matters"
		},
		{
			"heading": "choosing-between-rules",
			"content": "`swr`"
		},
		{
			"heading": "choosing-between-rules",
			"content": "Content changes and you want a strict TTL"
		},
		{
			"heading": "choosing-between-rules",
			"content": "`cache`"
		},
		{
			"heading": "choosing-between-rules",
			"content": "Personal, session-dependent, or frequently changing"
		},
		{
			"heading": "choosing-between-rules",
			"content": "`default`"
		},
		{
			"heading": "choosing-between-rules",
			"content": "ISR and SWR both serve stale content while refreshing; the difference is the trigger. SWR refreshes on demand when a request arrives, ISR regenerates on an interval regardless of traffic. `static` and `prerender` are build-time: `static` writes known output, `prerender` crawls and renders routes during the build."
		},
		{
			"heading": "streaming-routes-stay-dynamic",
			"content": "A route that returns a stream cannot be served from a whole-response cache — the cached body would be a buffered snapshot, not a live stream. Streaming routes therefore behave as `default`, and the framework does not attempt to cache them. See Streaming & SSE."
		},
		{
			"heading": "caching-and-tenancy",
			"content": "The model cache folds the tenant into its key, so cross-tenant reads never collide. Route-rule caches are tenant-agnostic by design: they serve public, non-personalized content only. For tenant-scoped data, cache through the model layer or the cache API with per-tenant keys rather than a public route rule. See Tenancy."
		},
		{
			"heading": "session-and-personalization-rules",
			"content": "Two rules keep personalization correct:"
		},
		{
			"heading": "session-and-personalization-rules",
			"content": "Session-dependent responses stay dynamic. A cached public shell plus `useResource`-driven private fragments is the supported pattern."
		},
		{
			"heading": "session-and-personalization-rules",
			"content": "The framework refuses to cache responses carrying `Set-Cookie`, so a cached page can never leak a session cookie to another user."
		},
		{
			"heading": "development-behavior",
			"content": "In development, route caching is disabled by default and the model cache logs each decision:"
		},
		{
			"heading": "development-behavior",
			"content": "`cache:miss` and `cache:hit` are logged per model query"
		},
		{
			"heading": "development-behavior",
			"content": "`kwiva dev --cache` simulates production caching locally"
		},
		{
			"heading": "development-behavior",
			"content": "The development overlay shows per-request cache decisions"
		},
		{
			"heading": "metrics",
			"content": "Every layer reports into observability: hit and miss ratios per layer, invalidation counts, and purge latency. See Observability: metrics."
		},
		{
			"heading": "whats-next",
			"content": "Rendering: caching — page-level caching and ISR"
		},
		{
			"heading": "whats-next",
			"content": "Rendering: prerendering — build-time output and crawling"
		},
		{
			"heading": "whats-next",
			"content": "Routes & Routing — where route rules are declared"
		},
		{
			"heading": "whats-next",
			"content": "Models — the `cache` model option"
		},
		{
			"heading": "whats-next",
			"content": "Frontend: data hooks — client-scope caching and invalidation"
		}
	],
	"headings": [
		{
			"id": "the-layers",
			"content": "The Layers"
		},
		{
			"id": "route-rules",
			"content": "Route Rules"
		},
		{
			"id": "cache-tags-on-rules",
			"content": "Cache Tags on Rules"
		},
		{
			"id": "model-cache",
			"content": "Model Cache"
		},
		{
			"id": "the-cache-api",
			"content": "The Cache API"
		},
		{
			"id": "invalidation",
			"content": "Invalidation"
		},
		{
			"id": "on-demand-invalidation",
			"content": "On-demand invalidation"
		},
		{
			"id": "choosing-between-rules",
			"content": "Choosing Between Rules"
		},
		{
			"id": "streaming-routes-stay-dynamic",
			"content": "Streaming Routes Stay Dynamic"
		},
		{
			"id": "caching-and-tenancy",
			"content": "Caching and Tenancy"
		},
		{
			"id": "session-and-personalization-rules",
			"content": "Session and Personalization Rules"
		},
		{
			"id": "development-behavior",
			"content": "Development Behavior"
		},
		{
			"id": "metrics",
			"content": "Metrics"
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
		url: "#the-layers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Layers" })
	},
	{
		depth: 2,
		url: "#route-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Route Rules" })
	},
	{
		depth: 2,
		url: "#cache-tags-on-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Cache Tags on Rules" })
	},
	{
		depth: 2,
		url: "#model-cache",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Model Cache" })
	},
	{
		depth: 2,
		url: "#the-cache-api",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Cache API" })
	},
	{
		depth: 2,
		url: "#invalidation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Invalidation" })
	},
	{
		depth: 3,
		url: "#on-demand-invalidation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "On-demand invalidation" })
	},
	{
		depth: 2,
		url: "#choosing-between-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Choosing Between Rules" })
	},
	{
		depth: 2,
		url: "#streaming-routes-stay-dynamic",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Streaming Routes Stay Dynamic" })
	},
	{
		depth: 2,
		url: "#caching-and-tenancy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Caching and Tenancy" })
	},
	{
		depth: 2,
		url: "#session-and-personalization-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Session and Personalization Rules" })
	},
	{
		depth: 2,
		url: "#development-behavior",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Development Behavior" })
	},
	{
		depth: 2,
		url: "#metrics",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Metrics" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Caching in Kwiva is layered. At the HTTP layer, route rules cache whole responses; below that, model caches reuse query results; and the explicit cache API handles keyed values. All layers share one invalidation model built on tags and model identity." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The decisions combine into a rule of thumb: the closer the cache sits to the client, the bigger the win and the more public it must be. A route rule can make a marketing page serve like a static file; the model cache removes repeated database reads; the cache API stores derived values that no query layer produces." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-layers",
			children: "The Layers"
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
			title: "the-layers.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "route rules   whole responses: default / cache / swr / isr / static / prerender" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "model cache   query results per model, TTL + tags" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "data hooks    client cache, keyed by model and query" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "cache API     explicit key/value with TTL + tags" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each layer answers a different question. Route rules make a public page or endpoint fast; the model cache makes repeated reads cheap; the cache API stores derived values; the client cache keeps data fresh for interactive users. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Frontend: data hooks"
			}),
			" for the client layer."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "route-rules",
			children: "Route Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Route rules are declared on server routes in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/routes/rules.ts" }),
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
							children: "'/pricing/**'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",  { static: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "true"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })"
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
							children: "'/news/**'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",     { swr: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "60"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Rule" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "default" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dynamic — always fresh, no cache layer involved" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache: n" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Serve the cached response for ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "n" }),
				" seconds"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr: n" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Stale-while-revalidate — serve, refresh in background" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr: n" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Regenerate the static page on an interval" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build-time output, never regenerated at runtime" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Crawled and rendered at build time" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "default" }), " is the implicit behavior of any path without a rule: fully dynamic. Choosing a caching rule is therefore an explicit act — every matched path either declares its freshness contract or stays fresh by default."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Rules apply ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "before" }),
			" context assembly — a cache hit serves the response and bypasses the pipeline, including session loading. That makes cached routes fast even under load, and it means only public, non-personalized routes belong here. The framework refuses to cache responses that set ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Set-Cookie" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!WARNING]\nA route rule bypasses middleware, guards, and session loading. Only paths deliberately public — public pages, public endpoints, shared assets — should carry a caching rule. Anything that varies per user must stay ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "default" }),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "cache-tags-on-rules",
			children: "Cache Tags on Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Rules can attach tags to their cached output:" }),
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
			title: "cache-tags-on-rules.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
						children: ", { cache: { tags: ["
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
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A later ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidateTags(['catalog'])" }),
			" purges these tagged caches along with any tagged model and cache-API entries. See the invalidation table below."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "model-cache",
			children: "Model Cache"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Models declare caching per model — list and get responses are cached per query signature:" }),
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
			title: "model-cache.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "defineModel"
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
							children: "'products'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "f"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ") "
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
							children: " ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "..."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }), {"
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
							children: "  cache: { ttl: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "120"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", tags: ["
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
							children: "], swr: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "true"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The cache key combines the model, the query signature, and the tenant. Model writes — create, update, delete — invalidate the model's keys automatically, so reads never go stale after a write on the same model. Tenancy folds into the key, so two tenants reading the same model never share cached rows. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-cache-api",
			children: "The Cache API"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The explicit cache API handles keyed values that no other layer covers:" }),
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
			title: "the-cache-api.ts",
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
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { cache } "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "from"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " '@kwiva/core'"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
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
							children: " cache."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "set"
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
							children: "'stats:overview'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", value, { ttl: "
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
							children: ", tags: ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'stats'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "] })"
						})
					]
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " cached"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " ="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " cache."
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
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'stats:overview'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " fresh"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " ="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " cache."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "wrap"
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
							children: "'stats:overview'"
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
							children: " () "
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " compute"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(), { ttl: "
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
							children: " })"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
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
							children: " cache."
						}),
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
							children: "'stats'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "])"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "set" }), " stores a value with TTL and tags"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "get" }), " reads a value"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "wrap" }), " memoizes a computation — on a miss, runs it, stores it, returns it"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidateTags" }), " purges every tagged entry across layers"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Backends are mounted in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/cache.ts" }),
			": memory in development, a shared store in production, and a distributed key-value mount on the edge."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "invalidation",
			children: "Invalidation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Invalidation is the contract that keeps layers consistent:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Trigger" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Effect" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model write (automatic)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Purges that model's keys" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidateTags([...])" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Purges tagged keys and tagged route-rule caches" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidate(Model)" }), " on the client"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Refreshes data-hook queries for the model" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Deploy" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build ID busts static assets" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Model writes purge without manual calls. Tags offer cross-layer coordination — one tag can connect a route-rule cache, a model cache, and explicit cache entries. Client-side invalidation refreshes the data hooks the user is actively viewing. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Frontend: data hooks"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "on-demand-invalidation",
			children: "On-demand invalidation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidateTags" }), " is the on-demand lever. It calls the route-rule purge in the same breath as the model and cache-API purges, so publishing a catalog update can refresh a server-cached product grid, a cached catalog query, and derived analytics in one call:"] }),
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
			title: "on-demand-invalidation.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// after a product publish or price change"
					})
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
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " cache."
						}),
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
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This is the bridge between the layers: one tag, one call, and every layer that declared it is coherent again." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "choosing-between-rules",
			children: "Choosing Between Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The rule you pick trades freshness for cost:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Situation" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Rule" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Content changes rarely, latency matters" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
				" or ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender" })
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Content changes on a schedule or at publish time" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr" }), " with a regeneration interval"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Content may go stale briefly, availability matters" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Content changes and you want a strict TTL" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Personal, session-dependent, or frequently changing" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "default" }) })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"ISR and SWR both serve stale content while refreshing; the difference is the trigger. SWR refreshes on demand when a request arrives, ISR regenerates on an interval regardless of traffic. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender" }),
			" are build-time: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			" writes known output, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender" }),
			" crawls and renders routes during the build."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "streaming-routes-stay-dynamic",
			children: "Streaming Routes Stay Dynamic"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A route that returns a stream cannot be served from a whole-response cache — the cached body would be a buffered snapshot, not a live stream. Streaming routes therefore behave as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "default" }),
			", and the framework does not attempt to cache them. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/streaming",
				children: "Streaming & SSE"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "caching-and-tenancy",
			children: "Caching and Tenancy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The model cache folds the tenant into its key, so cross-tenant reads never collide. Route-rule caches are tenant-agnostic by design: they serve public, non-personalized content only. For tenant-scoped data, cache through the model layer or the cache API with per-tenant keys rather than a public route rule. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy",
				children: "Tenancy"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "session-and-personalization-rules",
			children: "Session and Personalization Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two rules keep personalization correct:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Session-dependent responses stay dynamic. A cached public shell plus ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useResource" }),
				"-driven private fragments is the supported pattern."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The framework refuses to cache responses carrying ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Set-Cookie" }),
				", so a cached page can never leak a session cookie to another user."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "development-behavior",
			children: "Development Behavior"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "In development, route caching is disabled by default and the model cache logs each decision:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache:miss" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache:hit" }),
				" are logged per model query"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev --cache" }), " simulates production caching locally"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The development overlay shows per-request cache decisions" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "metrics",
			children: "Metrics"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every layer reports into observability: hit and miss ratios per layer, invalidation counts, and purge latency. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/metrics",
				children: "Observability: metrics"
			}),
			"."
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
				href: "/docs/rendering/caching",
				children: "Rendering: caching"
			}), " — page-level caching and ISR"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/prerendering",
				children: "Rendering: prerendering"
			}), " — build-time output and crawling"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/routes",
				children: "Routes & Routing"
			}), " — where route rules are declared"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Models"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
				" model option"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Frontend: data hooks"
			}), " — client-scope caching and invalidation"] }),
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
