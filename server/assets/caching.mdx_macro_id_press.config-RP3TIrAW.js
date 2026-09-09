import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/rendering/caching.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Caching Strategies",
	"description": "Route rules for cache, SWR, ISR, static, prerender — plus model cache and client cache layers."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nCaching in Kwiva is **per route, declared once, and layered**. Route rules shape the HTTP response cache for a path or pattern; a server-side model cache holds derived values with TTL and tags; and the client's data-hook cache keeps the browser in sync. The three layers compose, and invalidation flows down the stack. The cache engine is framework-owned (hidden behind the route-rule surface); what you interact with is the rule surface, the `cache` API, and the tag invalidation contract.\n\n## The Layers [#the-layers]\n\n| Layer        | Answers                                 | Surface                                      |\n| ------------ | --------------------------------------- | -------------------------------------------- |\n| Route rules  | \"How old may the response be?\"          | `cache`, `swr`, `isr`, `static`, `prerender` |\n| Model cache  | \"How long may this derived value live?\" | `defineModel` `cache` option, `cache` API    |\n| Client cache | \"When should the browser re-pull?\"      | data-hook `staleTime` / `gcTime`             |\n\nEach layer answers a different question, and they compose: a route rule can cache a page while its model cache makes repeated reads cheap and its client cache keeps data fresh for interactive users.\n\n## Route Rules [#route-rules]\n\nRoute rules are declared on server routes and apply to every page under the path:\n\n```ts title=\"src/routes/rules.ts\"\n// src/routes/rules.ts\nimport { defineServerRoute } from '@kwiva/http'\n\nexport default [\n  defineServerRoute('/products/**', { isr: 300, cache: { tags: ['catalog'] } }),\n  defineServerRoute('/pricing/**', { static: true }),\n  defineServerRoute('/legacy/**',  { redirect: { to: '/new/**', status: 308 } }),\n  defineServerRoute('/api/**',     { cors: true, rateLimit: { max: 600, per: 60 } }),\n  defineServerRoute('/healthz',    { handler: () => new Response('ok') }),\n]\n```\n\nThe full rule surface — caching, static, prerender, redirect, proxy, headers, cors, rate limiting — maps onto the framework-owned server engine. This page covers the caching rules; the rest of the surface lives under [Routes & Routing](/docs/http/routes).\n\n## The Cache Rules [#the-cache-rules]\n\n| Rule              | Behavior                                                      | Fits when                                         |\n| ----------------- | ------------------------------------------------------------- | ------------------------------------------------- |\n| none (default)    | Dynamic SSR on every request                                  | Session-scoped or volatile content                |\n| `cache: n`        | Full response cached for `n` seconds                          | Public payloads on a known window                 |\n| `swr: n`          | Serve cached (`n` seconds), then revalidate in the background | Read-heavy, mutable data that tolerates staleness |\n| `isr: n`          | Static page regenerated on interval — or on demand            | Public pages that change slowly                   |\n| `static`          | Built once at `kwiva build`                                   | Content fixed at build time                       |\n| `prerender: true` | Crawled and prerendered at build                              | Every route the crawler can reach                 |\n\nRules apply **before** context assembly — a cache hit serves the response and bypasses the pipeline, including session loading. That makes cached routes fast even under load, and it means only public, non-personalized routes belong here. The framework refuses to cache responses that set `Set-Cookie`. See [Static Generation](/docs/rendering/prerendering) for `static` and `prerender` at build time.\n\n## Per-Path Configuration [#per-path-configuration]\n\nRules are path-scoped, so the same application mixes strategies: a marketing site renders statically, product pages regenerate incrementally, and an account section is always dynamic.\n\n```plaintext title=\"per-path-configuration.txt\"\n/products/**   → isr: 300            (regenerate every 5 minutes)\n/pricing/**    → static: true        (built once)\n/account/**    → (no rule)           (dynamic SSR per request)\n```\n\nGlob patterns cover families of pages with a single declaration, and more specific rules win over broader ones.\n\n## Layer 1 — Route Rules (HTTP) [#layer-1--route-rules-http]\n\nThis layer decides what the response cache stores, and for how long. On-demand invalidation reaches into it from anywhere with server authority — jobs, tasks, event handlers:\n\n```ts title=\"layer-1-route-rules-http.ts\"\ninvalidateTags(['catalog'])\n```\n\npurging the cached responses tagged `catalog`. Head and meta serialize per route inside these responses, so cached pages keep correct SEO tags without re-rendering. Because the cached unit is the **full response** — shell and streamed segments together — a cached page's parts can never drift. See [Streaming SSR](/docs/rendering/streaming).\n\n## Layer 2 — Model Cache (Server Values) [#layer-2--model-cache-server-values]\n\nBelow HTTP responses, the model cache stores computed values with TTL and tags. Models can declare caching directly — list and get responses cached per query signature:\n\n```ts title=\"layer-2-model-cache-server-values.ts\"\ndefineModel('products', (f) => ({ ... }), {\n  cache: { ttl: 120, tags: ['catalog'], swr: true },\n})\n```\n\nThe cache key combines the model, the query signature, and the tenant. Model writes — create, update, delete — invalidate the model's keys automatically, so reads never go stale after a write on the same model. See [Models](/docs/data/models).\n\nThe explicit cache API covers keyed values no other layer owns:\n\n```ts title=\"layer-2-model-cache-server-values-2.ts\"\nimport { cache } from '@kwiva/core'\n\nconst summary = await cache.wrap('dashboard.summary', () => computeSummary(), { ttl: 60 })\n\nawait cache.set('key', value, { ttl: 30 })\nawait cache.get('key')\nawait cache.invalidate('key')\nawait invalidateTags(['posts'])\n```\n\n* `set` stores a value with TTL and tags\n* `get` reads a value\n* `wrap` memoizes a computation — on a miss, runs it, stores it, returns it\n* `invalidateTags` purges every tagged entry across layers\n\nBackends are mounted in `src/config/cache.ts`: memory in development, a shared store in production, a distributed key-value mount on the edge. See [Response Caching](/docs/http/caching) for the API-layer view.\n\n## Layer 3 — Client Cache (Data Hooks) [#layer-3--client-cache-data-hooks]\n\nOn the browser, data hooks manage freshness with `staleTime` (how long a value is considered current) and `gcTime` (how long unused entries are retained):\n\n```tsx title=\"layer-3-client-cache-data-hooks.tsx\"\nconst { data } = useList(Post, { where: { status: 'published' }, staleTime: 30_000 })\n```\n\nLoader-dehydrated values enter this cache on hydration, and `invalidate(Model)` refreshes every key derived from the model. See [Data Hooks](/docs/frontend/data-hooks) and [Hydration](/docs/rendering/hydration).\n\n## Invalidation [#invalidation]\n\nInvalidation is the contract that keeps layers consistent:\n\n| Trigger                           | Effect                                                                   |\n| --------------------------------- | ------------------------------------------------------------------------ |\n| Model write (automatic)           | Purges that model's cache keys                                           |\n| `invalidateTags([...])`           | Purges tagged keys and tagged route-rule caches (calls the engine purge) |\n| `invalidate(Model)` on the client | Refreshes data-hook queries for the model                                |\n| Deploy                            | Build ID busts static assets                                             |\n\nSame-named tags connect the layers: a model update tags its route responses and cache values, and a single invalidation reaches both the server's response store and the browser's next refetch. The two invalidation directions are separate — hooks refresh the client cache, tags purge server caches — and both are covered in [Data Hooks](/docs/frontend/data-hooks).\n\n## Personalization with Cached Shells [#personalization-with-cached-shells]\n\nCaching does not have to exclude logged-in users. The split pattern keeps the public shell cacheable and the private content fresh:\n\n```plaintext title=\"personalization-with-cached-shells.txt\"\n/products/** isr cached shell        → same for every visitor\nsession-scoped fragments            → loaded client-side via useResource\n                                     → keyed per user, never cached\n```\n\nThe shell regenerates on interval; personal fragments hydrate per session from session-scoped endpoints. Session-dependence is what always forces a route back to dynamic SSR — and the framework enforces it by refusing to cache `Set-Cookie` responses. See [Hydration](/docs/rendering/hydration).\n\n## Development Behavior [#development-behavior]\n\n* Dev default: no route caching; model cache logs each decision (`cache:miss` / `cache:hit`)\n* `kwiva dev --cache` simulates production caching locally\n* The dev overlay shows per-request cache decisions (v1.x)\n\n## Metrics [#metrics]\n\nEvery layer reports into observability: hit and miss ratios per layer, invalidation counts, and purge latency. See [Observability: Metrics](/docs/observability/metrics).\n\n## Deciding Between Layers [#deciding-between-layers]\n\n| Situation                               | Reach for                                    |\n| --------------------------------------- | -------------------------------------------- |\n| Entire page rarely changes              | `static` or `isr` at the route               |\n| Page changes frequently, reads dominate | `swr`                                        |\n| Session-dependent regions               | dynamic SSR + client-side hooks              |\n| Expensive derived values                | model cache with TTL and tags                |\n| Client freshness                        | data-hook `staleTime` and model invalidation |\n\n## What's Next [#whats-next]\n\n* [Static Generation](/docs/rendering/prerendering) — build-time output vs cache rules\n* [HTTP Caching](/docs/http/caching) — response caching at the API layer\n* [Server Routes](/docs/http/routes) — where route rules are declared\n* [Data Hooks](/docs/frontend/data-hooks) — the client cache layer\n* [SSR](/docs/rendering/ssr) — what happens when no rule matches\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Caching in Kwiva is **per route, declared once, and layered**. Route rules shape the HTTP response cache for a path or pattern; a server-side model cache holds derived values with TTL and tags; and the client's data-hook cache keeps the browser in sync. The three layers compose, and invalidation flows down the stack. The cache engine is framework-owned (hidden behind the route-rule surface); what you interact with is the rule surface, the `cache` API, and the tag invalidation contract."
		},
		{
			"heading": "the-layers",
			"content": "Layer"
		},
		{
			"heading": "the-layers",
			"content": "Answers"
		},
		{
			"heading": "the-layers",
			"content": "Surface"
		},
		{
			"heading": "the-layers",
			"content": "Route rules"
		},
		{
			"heading": "the-layers",
			"content": "\"How old may the response be?\""
		},
		{
			"heading": "the-layers",
			"content": "`cache`, `swr`, `isr`, `static`, `prerender`"
		},
		{
			"heading": "the-layers",
			"content": "Model cache"
		},
		{
			"heading": "the-layers",
			"content": "\"How long may this derived value live?\""
		},
		{
			"heading": "the-layers",
			"content": "`defineModel` `cache` option, `cache` API"
		},
		{
			"heading": "the-layers",
			"content": "Client cache"
		},
		{
			"heading": "the-layers",
			"content": "\"When should the browser re-pull?\""
		},
		{
			"heading": "the-layers",
			"content": "data-hook `staleTime` / `gcTime`"
		},
		{
			"heading": "the-layers",
			"content": "Each layer answers a different question, and they compose: a route rule can cache a page while its model cache makes repeated reads cheap and its client cache keeps data fresh for interactive users."
		},
		{
			"heading": "route-rules",
			"content": "Route rules are declared on server routes and apply to every page under the path:"
		},
		{
			"heading": "route-rules",
			"content": "The full rule surface — caching, static, prerender, redirect, proxy, headers, cors, rate limiting — maps onto the framework-owned server engine. This page covers the caching rules; the rest of the surface lives under Routes & Routing."
		},
		{
			"heading": "the-cache-rules",
			"content": "Rule"
		},
		{
			"heading": "the-cache-rules",
			"content": "Behavior"
		},
		{
			"heading": "the-cache-rules",
			"content": "Fits when"
		},
		{
			"heading": "the-cache-rules",
			"content": "none (default)"
		},
		{
			"heading": "the-cache-rules",
			"content": "Dynamic SSR on every request"
		},
		{
			"heading": "the-cache-rules",
			"content": "Session-scoped or volatile content"
		},
		{
			"heading": "the-cache-rules",
			"content": "`cache: n`"
		},
		{
			"heading": "the-cache-rules",
			"content": "Full response cached for `n` seconds"
		},
		{
			"heading": "the-cache-rules",
			"content": "Public payloads on a known window"
		},
		{
			"heading": "the-cache-rules",
			"content": "`swr: n`"
		},
		{
			"heading": "the-cache-rules",
			"content": "Serve cached (`n` seconds), then revalidate in the background"
		},
		{
			"heading": "the-cache-rules",
			"content": "Read-heavy, mutable data that tolerates staleness"
		},
		{
			"heading": "the-cache-rules",
			"content": "`isr: n`"
		},
		{
			"heading": "the-cache-rules",
			"content": "Static page regenerated on interval — or on demand"
		},
		{
			"heading": "the-cache-rules",
			"content": "Public pages that change slowly"
		},
		{
			"heading": "the-cache-rules",
			"content": "`static`"
		},
		{
			"heading": "the-cache-rules",
			"content": "Built once at `kwiva build`"
		},
		{
			"heading": "the-cache-rules",
			"content": "Content fixed at build time"
		},
		{
			"heading": "the-cache-rules",
			"content": "`prerender: true`"
		},
		{
			"heading": "the-cache-rules",
			"content": "Crawled and prerendered at build"
		},
		{
			"heading": "the-cache-rules",
			"content": "Every route the crawler can reach"
		},
		{
			"heading": "the-cache-rules",
			"content": "Rules apply **before** context assembly — a cache hit serves the response and bypasses the pipeline, including session loading. That makes cached routes fast even under load, and it means only public, non-personalized routes belong here. The framework refuses to cache responses that set `Set-Cookie`. See Static Generation for `static` and `prerender` at build time."
		},
		{
			"heading": "per-path-configuration",
			"content": "Rules are path-scoped, so the same application mixes strategies: a marketing site renders statically, product pages regenerate incrementally, and an account section is always dynamic."
		},
		{
			"heading": "per-path-configuration",
			"content": "Glob patterns cover families of pages with a single declaration, and more specific rules win over broader ones."
		},
		{
			"heading": "layer-1--route-rules-http",
			"content": "This layer decides what the response cache stores, and for how long. On-demand invalidation reaches into it from anywhere with server authority — jobs, tasks, event handlers:"
		},
		{
			"heading": "layer-1--route-rules-http",
			"content": "purging the cached responses tagged `catalog`. Head and meta serialize per route inside these responses, so cached pages keep correct SEO tags without re-rendering. Because the cached unit is the **full response** — shell and streamed segments together — a cached page's parts can never drift. See Streaming SSR."
		},
		{
			"heading": "layer-2--model-cache-server-values",
			"content": "Below HTTP responses, the model cache stores computed values with TTL and tags. Models can declare caching directly — list and get responses cached per query signature:"
		},
		{
			"heading": "layer-2--model-cache-server-values",
			"content": "The cache key combines the model, the query signature, and the tenant. Model writes — create, update, delete — invalidate the model's keys automatically, so reads never go stale after a write on the same model. See Models."
		},
		{
			"heading": "layer-2--model-cache-server-values",
			"content": "The explicit cache API covers keyed values no other layer owns:"
		},
		{
			"heading": "layer-2--model-cache-server-values",
			"content": "`set` stores a value with TTL and tags"
		},
		{
			"heading": "layer-2--model-cache-server-values",
			"content": "`get` reads a value"
		},
		{
			"heading": "layer-2--model-cache-server-values",
			"content": "`wrap` memoizes a computation — on a miss, runs it, stores it, returns it"
		},
		{
			"heading": "layer-2--model-cache-server-values",
			"content": "`invalidateTags` purges every tagged entry across layers"
		},
		{
			"heading": "layer-2--model-cache-server-values",
			"content": "Backends are mounted in `src/config/cache.ts`: memory in development, a shared store in production, a distributed key-value mount on the edge. See Response Caching for the API-layer view."
		},
		{
			"heading": "layer-3--client-cache-data-hooks",
			"content": "On the browser, data hooks manage freshness with `staleTime` (how long a value is considered current) and `gcTime` (how long unused entries are retained):"
		},
		{
			"heading": "layer-3--client-cache-data-hooks",
			"content": "Loader-dehydrated values enter this cache on hydration, and `invalidate(Model)` refreshes every key derived from the model. See Data Hooks and Hydration."
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
			"content": "Purges that model's cache keys"
		},
		{
			"heading": "invalidation",
			"content": "`invalidateTags([...])`"
		},
		{
			"heading": "invalidation",
			"content": "Purges tagged keys and tagged route-rule caches (calls the engine purge)"
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
			"content": "Same-named tags connect the layers: a model update tags its route responses and cache values, and a single invalidation reaches both the server's response store and the browser's next refetch. The two invalidation directions are separate — hooks refresh the client cache, tags purge server caches — and both are covered in Data Hooks."
		},
		{
			"heading": "personalization-with-cached-shells",
			"content": "Caching does not have to exclude logged-in users. The split pattern keeps the public shell cacheable and the private content fresh:"
		},
		{
			"heading": "personalization-with-cached-shells",
			"content": "The shell regenerates on interval; personal fragments hydrate per session from session-scoped endpoints. Session-dependence is what always forces a route back to dynamic SSR — and the framework enforces it by refusing to cache `Set-Cookie` responses. See Hydration."
		},
		{
			"heading": "development-behavior",
			"content": "Dev default: no route caching; model cache logs each decision (`cache:miss` / `cache:hit`)"
		},
		{
			"heading": "development-behavior",
			"content": "`kwiva dev --cache` simulates production caching locally"
		},
		{
			"heading": "development-behavior",
			"content": "The dev overlay shows per-request cache decisions (v1.x)"
		},
		{
			"heading": "metrics",
			"content": "Every layer reports into observability: hit and miss ratios per layer, invalidation counts, and purge latency. See Observability: Metrics."
		},
		{
			"heading": "deciding-between-layers",
			"content": "Situation"
		},
		{
			"heading": "deciding-between-layers",
			"content": "Reach for"
		},
		{
			"heading": "deciding-between-layers",
			"content": "Entire page rarely changes"
		},
		{
			"heading": "deciding-between-layers",
			"content": "`static` or `isr` at the route"
		},
		{
			"heading": "deciding-between-layers",
			"content": "Page changes frequently, reads dominate"
		},
		{
			"heading": "deciding-between-layers",
			"content": "`swr`"
		},
		{
			"heading": "deciding-between-layers",
			"content": "Session-dependent regions"
		},
		{
			"heading": "deciding-between-layers",
			"content": "dynamic SSR + client-side hooks"
		},
		{
			"heading": "deciding-between-layers",
			"content": "Expensive derived values"
		},
		{
			"heading": "deciding-between-layers",
			"content": "model cache with TTL and tags"
		},
		{
			"heading": "deciding-between-layers",
			"content": "Client freshness"
		},
		{
			"heading": "deciding-between-layers",
			"content": "data-hook `staleTime` and model invalidation"
		},
		{
			"heading": "whats-next",
			"content": "Static Generation — build-time output vs cache rules"
		},
		{
			"heading": "whats-next",
			"content": "HTTP Caching — response caching at the API layer"
		},
		{
			"heading": "whats-next",
			"content": "Server Routes — where route rules are declared"
		},
		{
			"heading": "whats-next",
			"content": "Data Hooks — the client cache layer"
		},
		{
			"heading": "whats-next",
			"content": "SSR — what happens when no rule matches"
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
			"id": "the-cache-rules",
			"content": "The Cache Rules"
		},
		{
			"id": "per-path-configuration",
			"content": "Per-Path Configuration"
		},
		{
			"id": "layer-1--route-rules-http",
			"content": "Layer 1 — Route Rules (HTTP)"
		},
		{
			"id": "layer-2--model-cache-server-values",
			"content": "Layer 2 — Model Cache (Server Values)"
		},
		{
			"id": "layer-3--client-cache-data-hooks",
			"content": "Layer 3 — Client Cache (Data Hooks)"
		},
		{
			"id": "invalidation",
			"content": "Invalidation"
		},
		{
			"id": "personalization-with-cached-shells",
			"content": "Personalization with Cached Shells"
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
			"id": "deciding-between-layers",
			"content": "Deciding Between Layers"
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
		url: "#the-cache-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Cache Rules" })
	},
	{
		depth: 2,
		url: "#per-path-configuration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Per-Path Configuration" })
	},
	{
		depth: 2,
		url: "#layer-1--route-rules-http",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layer 1 — Route Rules (HTTP)" })
	},
	{
		depth: 2,
		url: "#layer-2--model-cache-server-values",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layer 2 — Model Cache (Server Values)" })
	},
	{
		depth: 2,
		url: "#layer-3--client-cache-data-hooks",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layer 3 — Client Cache (Data Hooks)" })
	},
	{
		depth: 2,
		url: "#invalidation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Invalidation" })
	},
	{
		depth: 2,
		url: "#personalization-with-cached-shells",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Personalization with Cached Shells" })
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
		url: "#deciding-between-layers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Deciding Between Layers" })
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
			"Caching in Kwiva is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "per route, declared once, and layered" }),
			". Route rules shape the HTTP response cache for a path or pattern; a server-side model cache holds derived values with TTL and tags; and the client's data-hook cache keeps the browser in sync. The three layers compose, and invalidation flows down the stack. The cache engine is framework-owned (hidden behind the route-rule surface); what you interact with is the rule surface, the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
			" API, and the tag invalidation contract."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-layers",
			children: "The Layers"
		}),
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
					" ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
					" option, ",
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each layer answers a different question, and they compose: a route rule can cache a page while its model cache makes repeated reads cheap and its client cache keeps data fresh for interactive users." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "route-rules",
			children: "Route Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Route rules are declared on server routes and apply to every page under the path:" }),
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
							children: " { defineServerRoute } "
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
							children: " '@kwiva/http'"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ["
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
							children: "  defineServerRoute"
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
							children: "] } }),"
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
							children: "  defineServerRoute"
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
							children: ", { static: "
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
							children: " }),"
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
							children: "  defineServerRoute"
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
							children: "'/legacy/**'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",  { redirect: { to: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'/new/**'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", status: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "308"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } }),"
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
							children: "  defineServerRoute"
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
							children: "'/api/**'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",     { cors: "
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
							children: ", rateLimit: { max: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "600"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", per: "
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
							children: " } }),"
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
							children: "  defineServerRoute"
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
							children: "'/healthz'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",    { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "handler"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " new"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " Response"
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
							children: "'ok'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ") }),"
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
						children: "]"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The full rule surface — caching, static, prerender, redirect, proxy, headers, cors, rate limiting — maps onto the framework-owned server engine. This page covers the caching rules; the rest of the surface lives under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/routes",
				children: "Routes & Routing"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-cache-rules",
			children: "The Cache Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Rule" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Fits when" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "none (default)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dynamic SSR on every request" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Session-scoped or volatile content" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache: n" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Full response cached for ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "n" }),
					" seconds"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Public payloads on a known window" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr: n" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Serve cached (",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "n" }),
					" seconds), then revalidate in the background"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Read-heavy, mutable data that tolerates staleness" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr: n" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Static page regenerated on interval — or on demand" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Public pages that change slowly" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Built once at ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" })] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Content fixed at build time" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender: true" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Crawled and prerendered at build" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Every route the crawler can reach" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Rules apply ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "before" }),
			" context assembly — a cache hit serves the response and bypasses the pipeline, including session loading. That makes cached routes fast even under load, and it means only public, non-personalized routes belong here. The framework refuses to cache responses that set ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Set-Cookie" }),
			". See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/prerendering",
				children: "Static Generation"
			}),
			" for ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prerender" }),
			" at build time."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "per-path-configuration",
			children: "Per-Path Configuration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Rules are path-scoped, so the same application mixes strategies: a marketing site renders statically, product pages regenerate incrementally, and an account section is always dynamic." }),
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
			title: "per-path-configuration.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/products/**   → isr: 300            (regenerate every 5 minutes)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/pricing/**    → static: true        (built once)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/account/**    → (no rule)           (dynamic SSR per request)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Glob patterns cover families of pages with a single declaration, and more specific rules win over broader ones." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layer-1--route-rules-http",
			children: "Layer 1 — Route Rules (HTTP)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This layer decides what the response cache stores, and for how long. On-demand invalidation reaches into it from anywhere with server authority — jobs, tasks, event handlers:" }),
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
			title: "layer-1-route-rules-http.ts",
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
			"purging the cached responses tagged ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "catalog" }),
			". Head and meta serialize per route inside these responses, so cached pages keep correct SEO tags without re-rendering. Because the cached unit is the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "full response" }),
			" — shell and streamed segments together — a cached page's parts can never drift. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/streaming",
				children: "Streaming SSR"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layer-2--model-cache-server-values",
			children: "Layer 2 — Model Cache (Server Values)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Below HTTP responses, the model cache stores computed values with TTL and tags. Models can declare caching directly — list and get responses cached per query signature:" }),
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
			title: "layer-2-model-cache-server-values.ts",
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
			"The cache key combines the model, the query signature, and the tenant. Model writes — create, update, delete — invalidate the model's keys automatically, so reads never go stale after a write on the same model. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The explicit cache API covers keyed values no other layer owns:" }),
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
			title: "layer-2-model-cache-server-values-2.ts",
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " summary"
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
							children: "'dashboard.summary'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", () "
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
							children: " computeSummary"
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
							children: "'key'"
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
							children: "30"
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
							children: "'key'"
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
							children: "invalidate"
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
							children: "'key'"
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
							children: "await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " invalidateTags"
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
							children: "'posts'"
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
			": memory in development, a shared store in production, a distributed key-value mount on the edge. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/caching",
				children: "Response Caching"
			}),
			" for the API-layer view."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layer-3--client-cache-data-hooks",
			children: "Layer 3 — Client Cache (Data Hooks)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"On the browser, data hooks manage freshness with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "staleTime" }),
			" (how long a value is considered current) and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "gcTime" }),
			" (how long unused entries are retained):"
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
			title: "layer-3-client-cache-data-hooks.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " { "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "data"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " } "
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
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: " useList"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "(Post, { where: { status: "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: "'published'"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " }, staleTime: "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "30_000"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " })"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Loader-dehydrated values enter this cache on hydration, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidate(Model)" }),
			" refreshes every key derived from the model. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/hydration",
				children: "Hydration"
			}),
			"."
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
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model write (automatic)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Purges that model's cache keys" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidateTags([...])" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Purges tagged keys and tagged route-rule caches (calls the engine purge)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidate(Model)" }), " on the client"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Refreshes data-hook queries for the model" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Deploy" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build ID busts static assets" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Same-named tags connect the layers: a model update tags its route responses and cache values, and a single invalidation reaches both the server's response store and the browser's next refetch. The two invalidation directions are separate — hooks refresh the client cache, tags purge server caches — and both are covered in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "personalization-with-cached-shells",
			children: "Personalization with Cached Shells"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Caching does not have to exclude logged-in users. The split pattern keeps the public shell cacheable and the private content fresh:" }),
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
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "/products/** isr cached shell        → same for every visitor" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "session-scoped fragments            → loaded client-side via useResource" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                                     → keyed per user, never cached" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The shell regenerates on interval; personal fragments hydrate per session from session-scoped endpoints. Session-dependence is what always forces a route back to dynamic SSR — and the framework enforces it by refusing to cache ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Set-Cookie" }),
			" responses. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/hydration",
				children: "Hydration"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "development-behavior",
			children: "Development Behavior"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Dev default: no route caching; model cache logs each decision (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache:miss" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache:hit" }),
				")"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev --cache" }), " simulates production caching locally"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The dev overlay shows per-request cache decisions (v1.x)" }),
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
				children: "Observability: Metrics"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "deciding-between-layers",
			children: "Deciding Between Layers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Situation" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Reach for" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Entire page rarely changes" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
				" or ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isr" }),
				" at the route"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Page changes frequently, reads dominate" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "swr" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Session-dependent regions" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "dynamic SSR + client-side hooks" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Expensive derived values" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "model cache with TTL and tags" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Client freshness" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"data-hook ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "staleTime" }),
				" and model invalidation"
			] })] })
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
				href: "/docs/rendering/prerendering",
				children: "Static Generation"
			}), " — build-time output vs cache rules"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/caching",
				children: "HTTP Caching"
			}), " — response caching at the API layer"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/routes",
				children: "Server Routes"
			}), " — where route rules are declared"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
			}), " — the client cache layer"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/ssr",
				children: "SSR"
			}), " — what happens when no rule matches"] }),
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
