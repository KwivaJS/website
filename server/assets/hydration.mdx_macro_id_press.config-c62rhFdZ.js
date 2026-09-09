import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/rendering/hydration.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Hydration",
	"description": "Island-free full hydration, the typed reviver, and cache transfer from server to client."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nHydration is how the server-rendered page becomes a live application. Kwiva hydrates the **whole page** — there are no islands and no per-widget bootstrapping. The server's rendering state crosses the gap as a **cache transfer**: loader data and deferred values serialize into the stream and rehydrate into the client's data-hook cache under identical keys, so the client never refetches what the server already computed.\n\nBecause rendering is framework-owned end to end (ADR-0006), the hydration contract is part of the same design as the loader and the cache — not a bridge between two different stacks.\n\n## The Hydration Contract [#the-hydration-contract]\n\nThe pipeline carries state in three moves:\n\n```plaintext title=\"the-hydration-contract.txt\"\nserver: loaders run → results dehydrated into a state script at the stream tail\nclient: the state script rehydrates into the data-hook cache (no refetch)\nrouter: resumes at the same route with the same search state\n```\n\nBecause the cache is keyed identically on both sides, hydration is a cache transfer, not a data fetch. The first interactive frame reads the exact entries the server filled. In streaming mode, loader data and deferred promises dehydrate together into one state payload at the stream tail — the shell has already painted, but the state script carries the complete result. See [Streaming SSR](/docs/rendering/streaming).\n\n## What the State Script Carries [#what-the-state-script-carries]\n\nThe dehydrated payload in the document is the cache, in the same shape the hooks read:\n\n```plaintext title=\"what-the-state-script-carries.txt\"\nserver state script\n  ├─ loader results (keyed by route + params + search)\n  ├─ deferred promises (keyed identically, resolved when the chunk arrives)\n  └─ typed reviver markers (dates, model rows)\n```\n\nIt is not a snapshot of the rendered HTML — it is the cache entries themselves. When the server rendered `useResource(Post, id)`, the client hydrates that exact entry; there is no reconstruction and no reconciliation pass over JSON blobs. That is what makes the first interactive frame and the server-rendered frame agree on data.\n\n## Full Hydration, No Islands [#full-hydration-no-islands]\n\nEvery matched route — layout, page, deferred boundary — hydrates. There is no manual choice about which component \"wakes up\"; the tree that rendered on the server is the tree that hydrates on the client. This keeps render and navigation behavior identical across server and client, which is what makes the same `definePage` files run in server-rendered and single-page modes without changes:\n\n| Property                 | Value                                     |\n| ------------------------ | ----------------------------------------- |\n| Hydration scope          | The whole document, layout chain included |\n| Per-widget bootstrapping | None — no islands, no opt-in              |\n| Server/client parity     | Same tree, same data, same route          |\n| Streamed boundaries      | Hydrate with their chunk when it arrives  |\n\nThe trade-off of full hydration — a larger client-tree cost than island approaches — buys behavioral identity. A page behaves on the client exactly as it rendered on the server, and the mode projection (`fullstack` → `api+spa` → `static`) does not change page code.\n\n## Loader Data, Already Warm [#loader-data-already-warm]\n\nThe practical consequence is that data hooks start warm. A page whose loader fetched a post hydrates into a state where `useResource(Post, id)` resolves the same record instantly; a list whose loader used `stream()` hydrates its deferred chunk when that chunk arrives. Client-side navigation later reuses the same entries, and mutations invalidate exactly what they touch. See [Data Hooks](/docs/frontend/data-hooks).\n\n```plaintext title=\"loader-data-already-warm.txt\"\nhydration → useResource(Post, id) resolves immediately\n         → no isPending flash\n         → invalidation refreshes from the server on change\n```\n\n## The Typed Reviver [#the-typed-reviver]\n\nSerialized loader data is restored with a typed reviver, so structured values survive the trip with their identity intact:\n\n* **Dates** deserialize as real date values, not strings\n* **Class instances such as model rows** restore their shape and methods consistently with how the server rendered them\n\nThe same reviver is used on server and client, so a date rendered server-side and the identical date read from a hook after hydration agree down to the timezone. This is what lets model rows passed through loaders keep their method surface on the client.\n\n## Avoiding Serialization Surprises [#avoiding-serialization-surprises]\n\nA few practices keep hydration deterministic:\n\n* Return loader data that is JSON-compatible plus the documented reviver types (dates, model rows)\n* Do not rely on functions or runtime handles in loader output — they cannot cross the stream\n* Keep secrets out of loader data — everything a loader returns is serialized into the HTML the client receives. Client bundles and pages must never carry secrets (enforced by the build)\n* Prefer plain, serializable shapes; idiosyncratic structures are where serialization surprises start, and the loader is where they are diagnosed\n\nSee [Pages](/docs/frontend/pages) for the loader return contract and [Security: Production](/docs/security/production) for the secret-handling counterpart.\n\n## Hydration-Safe Rendering [#hydration-safe-rendering]\n\nHydration stays safe when the server and client render the same tree from the same data. Streaming preserves that discipline: deferred chunks arrive as complete regions and hydrate into their boundaries, rather than patching text fragments.\n\n```plaintext title=\"hydration-safe-rendering.txt\"\nserver tree == client tree\n   └─ suspense boundaries hydrate with their streamed chunk\n   └─ deferred values that reject → boundary error state with retry\n   └─ personalization → session-scoped hooks load client-side on top of a cached shell\n```\n\nBecause the tree shape is generated from the same `definePage` files on both sides, the only source of drift is data — and the cache transfer makes the data identical by construction.\n\n## Personalization After Hydration [#personalization-after-hydration]\n\nThe hydration split is also the personalization boundary. Public shells can be cached with incremental regeneration, while session-specific fragments load after hydration through data hooks — `useResource` reading session-scoped endpoints that are never cached. The page skeleton is stale-safe and public; the private content is fresh per user and fetched client-side.\n\n```plaintext title=\"personalization-after-hydration.txt\"\nisr cached shell          → hydrates for every visitor from the same HTML\nsession-scoped fragments  → load after hydration, keyed per user, never cached\n```\n\nThe framework refuses to cache responses that set `Set-Cookie`, so the shell stays public by contract and the private part stays client-side by construction. See [Caching Strategies](/docs/rendering/caching) and [Response Caching](/docs/http/caching).\n\n## Compact Runtime Mode [#compact-runtime-mode]\n\nA compact compatibility runtime ships the same pipeline with a smaller bundle, selected in the UI configuration. Hydration semantics — cache transfer, island-free boot, the typed reviver — are unchanged; app code does not differ between runtimes.\n\n```ts title=\"src/config/ui.ts\"\n// src/config/ui.ts\nexport default defineConfig('ui', {\n  defaults: { runtime: 'react', theme: 'kwiva' },   // 'compact' for the compact runtime\n})\n```\n\nSee [Frontend](/docs/frontend) for runtime selection and [SSR](/docs/rendering/ssr) for the streaming pipeline that feeds hydration.\n\n## Live Data After Hydration [#live-data-after-hydration]\n\nHydration transfers the server's snapshot; live data arrives after. Realtime subscriptions — channels, events — connect on top of the hydrated cache and update the same entries a loader or hook populated, so a page that hydrates with an event stream already attached renders the server snapshot and then live-updates in place. See [Real-Time Data on the Client](/docs/realtime/client-usage) and [Events](/docs/realtime/events).\n\n## Debugging Hydration [#debugging-hydration]\n\nThe dev overlay surfaces the hydration contract: the cache entries the state script carried, which keys hydrated cleanly, and any reviver warnings for values that could not round-trip. Hydration problems are usually data-shape problems, and the overlay points at the exact key. See [Observability: Dev Overlay](/docs/observability/dev-overlay).\n\n## Hydration and the Request Timeline [#hydration-and-the-request-timeline]\n\nHydration closes the timeline that starts at the request: the server streams, the shell paints, the state script transfers the cache, and the client hydrates — all within the spans emitted for SSR wall time, time-to-first-byte, and hydration time. See [Request Lifecycle](/docs/http/lifecycle) and [Observability](/docs/observability).\n\n## What's Next [#whats-next]\n\n* [Server-Side Rendering](/docs/rendering/ssr) — what the server hands to hydration\n* [Streaming SSR](/docs/rendering/streaming) — how streamed chunks hydrate\n* [Data Hooks](/docs/frontend/data-hooks) — the cache hydration fills\n* [Caching Strategies](/docs/rendering/caching) — the personalization split after hydration\n* [Frontend](/docs/frontend) — the page surface that produces the hydrated tree\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Hydration is how the server-rendered page becomes a live application. Kwiva hydrates the **whole page** — there are no islands and no per-widget bootstrapping. The server's rendering state crosses the gap as a **cache transfer**: loader data and deferred values serialize into the stream and rehydrate into the client's data-hook cache under identical keys, so the client never refetches what the server already computed."
		},
		{
			"heading": void 0,
			"content": "Because rendering is framework-owned end to end (ADR-0006), the hydration contract is part of the same design as the loader and the cache — not a bridge between two different stacks."
		},
		{
			"heading": "the-hydration-contract",
			"content": "The pipeline carries state in three moves:"
		},
		{
			"heading": "the-hydration-contract",
			"content": "Because the cache is keyed identically on both sides, hydration is a cache transfer, not a data fetch. The first interactive frame reads the exact entries the server filled. In streaming mode, loader data and deferred promises dehydrate together into one state payload at the stream tail — the shell has already painted, but the state script carries the complete result. See Streaming SSR."
		},
		{
			"heading": "what-the-state-script-carries",
			"content": "The dehydrated payload in the document is the cache, in the same shape the hooks read:"
		},
		{
			"heading": "what-the-state-script-carries",
			"content": "It is not a snapshot of the rendered HTML — it is the cache entries themselves. When the server rendered `useResource(Post, id)`, the client hydrates that exact entry; there is no reconstruction and no reconciliation pass over JSON blobs. That is what makes the first interactive frame and the server-rendered frame agree on data."
		},
		{
			"heading": "full-hydration-no-islands",
			"content": "Every matched route — layout, page, deferred boundary — hydrates. There is no manual choice about which component \"wakes up\"; the tree that rendered on the server is the tree that hydrates on the client. This keeps render and navigation behavior identical across server and client, which is what makes the same `definePage` files run in server-rendered and single-page modes without changes:"
		},
		{
			"heading": "full-hydration-no-islands",
			"content": "Property"
		},
		{
			"heading": "full-hydration-no-islands",
			"content": "Value"
		},
		{
			"heading": "full-hydration-no-islands",
			"content": "Hydration scope"
		},
		{
			"heading": "full-hydration-no-islands",
			"content": "The whole document, layout chain included"
		},
		{
			"heading": "full-hydration-no-islands",
			"content": "Per-widget bootstrapping"
		},
		{
			"heading": "full-hydration-no-islands",
			"content": "None — no islands, no opt-in"
		},
		{
			"heading": "full-hydration-no-islands",
			"content": "Server/client parity"
		},
		{
			"heading": "full-hydration-no-islands",
			"content": "Same tree, same data, same route"
		},
		{
			"heading": "full-hydration-no-islands",
			"content": "Streamed boundaries"
		},
		{
			"heading": "full-hydration-no-islands",
			"content": "Hydrate with their chunk when it arrives"
		},
		{
			"heading": "full-hydration-no-islands",
			"content": "The trade-off of full hydration — a larger client-tree cost than island approaches — buys behavioral identity. A page behaves on the client exactly as it rendered on the server, and the mode projection (`fullstack` → `api+spa` → `static`) does not change page code."
		},
		{
			"heading": "loader-data-already-warm",
			"content": "The practical consequence is that data hooks start warm. A page whose loader fetched a post hydrates into a state where `useResource(Post, id)` resolves the same record instantly; a list whose loader used `stream()` hydrates its deferred chunk when that chunk arrives. Client-side navigation later reuses the same entries, and mutations invalidate exactly what they touch. See Data Hooks."
		},
		{
			"heading": "the-typed-reviver",
			"content": "Serialized loader data is restored with a typed reviver, so structured values survive the trip with their identity intact:"
		},
		{
			"heading": "the-typed-reviver",
			"content": "**Dates** deserialize as real date values, not strings"
		},
		{
			"heading": "the-typed-reviver",
			"content": "**Class instances such as model rows** restore their shape and methods consistently with how the server rendered them"
		},
		{
			"heading": "the-typed-reviver",
			"content": "The same reviver is used on server and client, so a date rendered server-side and the identical date read from a hook after hydration agree down to the timezone. This is what lets model rows passed through loaders keep their method surface on the client."
		},
		{
			"heading": "avoiding-serialization-surprises",
			"content": "A few practices keep hydration deterministic:"
		},
		{
			"heading": "avoiding-serialization-surprises",
			"content": "Return loader data that is JSON-compatible plus the documented reviver types (dates, model rows)"
		},
		{
			"heading": "avoiding-serialization-surprises",
			"content": "Do not rely on functions or runtime handles in loader output — they cannot cross the stream"
		},
		{
			"heading": "avoiding-serialization-surprises",
			"content": "Keep secrets out of loader data — everything a loader returns is serialized into the HTML the client receives. Client bundles and pages must never carry secrets (enforced by the build)"
		},
		{
			"heading": "avoiding-serialization-surprises",
			"content": "Prefer plain, serializable shapes; idiosyncratic structures are where serialization surprises start, and the loader is where they are diagnosed"
		},
		{
			"heading": "avoiding-serialization-surprises",
			"content": "See Pages for the loader return contract and Security: Production for the secret-handling counterpart."
		},
		{
			"heading": "hydration-safe-rendering",
			"content": "Hydration stays safe when the server and client render the same tree from the same data. Streaming preserves that discipline: deferred chunks arrive as complete regions and hydrate into their boundaries, rather than patching text fragments."
		},
		{
			"heading": "hydration-safe-rendering",
			"content": "Because the tree shape is generated from the same `definePage` files on both sides, the only source of drift is data — and the cache transfer makes the data identical by construction."
		},
		{
			"heading": "personalization-after-hydration",
			"content": "The hydration split is also the personalization boundary. Public shells can be cached with incremental regeneration, while session-specific fragments load after hydration through data hooks — `useResource` reading session-scoped endpoints that are never cached. The page skeleton is stale-safe and public; the private content is fresh per user and fetched client-side."
		},
		{
			"heading": "personalization-after-hydration",
			"content": "The framework refuses to cache responses that set `Set-Cookie`, so the shell stays public by contract and the private part stays client-side by construction. See Caching Strategies and Response Caching."
		},
		{
			"heading": "compact-runtime-mode",
			"content": "A compact compatibility runtime ships the same pipeline with a smaller bundle, selected in the UI configuration. Hydration semantics — cache transfer, island-free boot, the typed reviver — are unchanged; app code does not differ between runtimes."
		},
		{
			"heading": "compact-runtime-mode",
			"content": "See Frontend for runtime selection and SSR for the streaming pipeline that feeds hydration."
		},
		{
			"heading": "live-data-after-hydration",
			"content": "Hydration transfers the server's snapshot; live data arrives after. Realtime subscriptions — channels, events — connect on top of the hydrated cache and update the same entries a loader or hook populated, so a page that hydrates with an event stream already attached renders the server snapshot and then live-updates in place. See Real-Time Data on the Client and Events."
		},
		{
			"heading": "debugging-hydration",
			"content": "The dev overlay surfaces the hydration contract: the cache entries the state script carried, which keys hydrated cleanly, and any reviver warnings for values that could not round-trip. Hydration problems are usually data-shape problems, and the overlay points at the exact key. See Observability: Dev Overlay."
		},
		{
			"heading": "hydration-and-the-request-timeline",
			"content": "Hydration closes the timeline that starts at the request: the server streams, the shell paints, the state script transfers the cache, and the client hydrates — all within the spans emitted for SSR wall time, time-to-first-byte, and hydration time. See Request Lifecycle and Observability."
		},
		{
			"heading": "whats-next",
			"content": "Server-Side Rendering — what the server hands to hydration"
		},
		{
			"heading": "whats-next",
			"content": "Streaming SSR — how streamed chunks hydrate"
		},
		{
			"heading": "whats-next",
			"content": "Data Hooks — the cache hydration fills"
		},
		{
			"heading": "whats-next",
			"content": "Caching Strategies — the personalization split after hydration"
		},
		{
			"heading": "whats-next",
			"content": "Frontend — the page surface that produces the hydrated tree"
		}
	],
	"headings": [
		{
			"id": "the-hydration-contract",
			"content": "The Hydration Contract"
		},
		{
			"id": "what-the-state-script-carries",
			"content": "What the State Script Carries"
		},
		{
			"id": "full-hydration-no-islands",
			"content": "Full Hydration, No Islands"
		},
		{
			"id": "loader-data-already-warm",
			"content": "Loader Data, Already Warm"
		},
		{
			"id": "the-typed-reviver",
			"content": "The Typed Reviver"
		},
		{
			"id": "avoiding-serialization-surprises",
			"content": "Avoiding Serialization Surprises"
		},
		{
			"id": "hydration-safe-rendering",
			"content": "Hydration-Safe Rendering"
		},
		{
			"id": "personalization-after-hydration",
			"content": "Personalization After Hydration"
		},
		{
			"id": "compact-runtime-mode",
			"content": "Compact Runtime Mode"
		},
		{
			"id": "live-data-after-hydration",
			"content": "Live Data After Hydration"
		},
		{
			"id": "debugging-hydration",
			"content": "Debugging Hydration"
		},
		{
			"id": "hydration-and-the-request-timeline",
			"content": "Hydration and the Request Timeline"
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
		url: "#the-hydration-contract",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Hydration Contract" })
	},
	{
		depth: 2,
		url: "#what-the-state-script-carries",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What the State Script Carries" })
	},
	{
		depth: 2,
		url: "#full-hydration-no-islands",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Full Hydration, No Islands" })
	},
	{
		depth: 2,
		url: "#loader-data-already-warm",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Loader Data, Already Warm" })
	},
	{
		depth: 2,
		url: "#the-typed-reviver",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Typed Reviver" })
	},
	{
		depth: 2,
		url: "#avoiding-serialization-surprises",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Avoiding Serialization Surprises" })
	},
	{
		depth: 2,
		url: "#hydration-safe-rendering",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Hydration-Safe Rendering" })
	},
	{
		depth: 2,
		url: "#personalization-after-hydration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Personalization After Hydration" })
	},
	{
		depth: 2,
		url: "#compact-runtime-mode",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Compact Runtime Mode" })
	},
	{
		depth: 2,
		url: "#live-data-after-hydration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Live Data After Hydration" })
	},
	{
		depth: 2,
		url: "#debugging-hydration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Debugging Hydration" })
	},
	{
		depth: 2,
		url: "#hydration-and-the-request-timeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Hydration and the Request Timeline" })
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
			"Hydration is how the server-rendered page becomes a live application. Kwiva hydrates the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "whole page" }),
			" — there are no islands and no per-widget bootstrapping. The server's rendering state crosses the gap as a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "cache transfer" }),
			": loader data and deferred values serialize into the stream and rehydrate into the client's data-hook cache under identical keys, so the client never refetches what the server already computed."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because rendering is framework-owned end to end (ADR-0006), the hydration contract is part of the same design as the loader and the cache — not a bridge between two different stacks." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-hydration-contract",
			children: "The Hydration Contract"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pipeline carries state in three moves:" }),
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
			title: "the-hydration-contract.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "server: loaders run → results dehydrated into a state script at the stream tail" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "client: the state script rehydrates into the data-hook cache (no refetch)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "router: resumes at the same route with the same search state" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the cache is keyed identically on both sides, hydration is a cache transfer, not a data fetch. The first interactive frame reads the exact entries the server filled. In streaming mode, loader data and deferred promises dehydrate together into one state payload at the stream tail — the shell has already painted, but the state script carries the complete result. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/streaming",
				children: "Streaming SSR"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-the-state-script-carries",
			children: "What the State Script Carries"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The dehydrated payload in the document is the cache, in the same shape the hooks read:" }),
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
			title: "what-the-state-script-carries.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "server state script" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─ loader results (keyed by route + params + search)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  ├─ deferred promises (keyed identically, resolved when the chunk arrives)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  └─ typed reviver markers (dates, model rows)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"It is not a snapshot of the rendered HTML — it is the cache entries themselves. When the server rendered ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useResource(Post, id)" }),
			", the client hydrates that exact entry; there is no reconstruction and no reconciliation pass over JSON blobs. That is what makes the first interactive frame and the server-rendered frame agree on data."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "full-hydration-no-islands",
			children: "Full Hydration, No Islands"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every matched route — layout, page, deferred boundary — hydrates. There is no manual choice about which component \"wakes up\"; the tree that rendered on the server is the tree that hydrates on the client. This keeps render and navigation behavior identical across server and client, which is what makes the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			" files run in server-rendered and single-page modes without changes:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Property" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Value" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Hydration scope" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The whole document, layout chain included" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Per-widget bootstrapping" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "None — no islands, no opt-in" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server/client parity" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Same tree, same data, same route" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Streamed boundaries" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Hydrate with their chunk when it arrives" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The trade-off of full hydration — a larger client-tree cost than island approaches — buys behavioral identity. A page behaves on the client exactly as it rendered on the server, and the mode projection (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }),
			" → ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }),
			" → ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			") does not change page code."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "loader-data-already-warm",
			children: "Loader Data, Already Warm"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The practical consequence is that data hooks start warm. A page whose loader fetched a post hydrates into a state where ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useResource(Post, id)" }),
			" resolves the same record instantly; a list whose loader used ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stream()" }),
			" hydrates its deferred chunk when that chunk arrives. Client-side navigation later reuses the same entries, and mutations invalidate exactly what they touch. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
			}),
			"."
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
			title: "loader-data-already-warm.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "hydration → useResource(Post, id) resolves immediately" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "         → no isPending flash" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "         → invalidation refreshes from the server on change" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-typed-reviver",
			children: "The Typed Reviver"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Serialized loader data is restored with a typed reviver, so structured values survive the trip with their identity intact:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Dates" }), " deserialize as real date values, not strings"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Class instances such as model rows" }), " restore their shape and methods consistently with how the server rendered them"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The same reviver is used on server and client, so a date rendered server-side and the identical date read from a hook after hydration agree down to the timezone. This is what lets model rows passed through loaders keep their method surface on the client." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "avoiding-serialization-surprises",
			children: "Avoiding Serialization Surprises"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A few practices keep hydration deterministic:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Return loader data that is JSON-compatible plus the documented reviver types (dates, model rows)" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Do not rely on functions or runtime handles in loader output — they cannot cross the stream" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Keep secrets out of loader data — everything a loader returns is serialized into the HTML the client receives. Client bundles and pages must never carry secrets (enforced by the build)" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Prefer plain, serializable shapes; idiosyncratic structures are where serialization surprises start, and the loader is where they are diagnosed" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/pages",
				children: "Pages"
			}),
			" for the loader return contract and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/production",
				children: "Security: Production"
			}),
			" for the secret-handling counterpart."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "hydration-safe-rendering",
			children: "Hydration-Safe Rendering"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Hydration stays safe when the server and client render the same tree from the same data. Streaming preserves that discipline: deferred chunks arrive as complete regions and hydrate into their boundaries, rather than patching text fragments." }),
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
			title: "hydration-safe-rendering.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "server tree == client tree" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   └─ suspense boundaries hydrate with their streamed chunk" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   └─ deferred values that reject → boundary error state with retry" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   └─ personalization → session-scoped hooks load client-side on top of a cached shell" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the tree shape is generated from the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			" files on both sides, the only source of drift is data — and the cache transfer makes the data identical by construction."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "personalization-after-hydration",
			children: "Personalization After Hydration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The hydration split is also the personalization boundary. Public shells can be cached with incremental regeneration, while session-specific fragments load after hydration through data hooks — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useResource" }),
			" reading session-scoped endpoints that are never cached. The page skeleton is stale-safe and public; the private content is fresh per user and fetched client-side."
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
			title: "personalization-after-hydration.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "isr cached shell          → hydrates for every visitor from the same HTML" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "session-scoped fragments  → load after hydration, keyed per user, never cached" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The framework refuses to cache responses that set ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Set-Cookie" }),
			", so the shell stays public by contract and the private part stays client-side by construction. See ",
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
			id: "compact-runtime-mode",
			children: "Compact Runtime Mode"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A compact compatibility runtime ships the same pipeline with a smaller bundle, selected in the UI configuration. Hydration semantics — cache transfer, island-free boot, the typed reviver — are unchanged; app code does not differ between runtimes." }),
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
			title: "src/config/ui.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/ui.ts"
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
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'ui'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", {"
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
							children: "  defaults: { runtime: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'react'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", theme: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'kwiva'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " },   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// 'compact' for the compact runtime"
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
			"See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend",
				children: "Frontend"
			}),
			" for runtime selection and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/ssr",
				children: "SSR"
			}),
			" for the streaming pipeline that feeds hydration."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "live-data-after-hydration",
			children: "Live Data After Hydration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Hydration transfers the server's snapshot; live data arrives after. Realtime subscriptions — channels, events — connect on top of the hydrated cache and update the same entries a loader or hook populated, so a page that hydrates with an event stream already attached renders the server snapshot and then live-updates in place. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/client-usage",
				children: "Real-Time Data on the Client"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/events",
				children: "Events"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "debugging-hydration",
			children: "Debugging Hydration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The dev overlay surfaces the hydration contract: the cache entries the state script carried, which keys hydrated cleanly, and any reviver warnings for values that could not round-trip. Hydration problems are usually data-shape problems, and the overlay points at the exact key. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/dev-overlay",
				children: "Observability: Dev Overlay"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "hydration-and-the-request-timeline",
			children: "Hydration and the Request Timeline"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Hydration closes the timeline that starts at the request: the server streams, the shell paints, the state script transfers the cache, and the client hydrates — all within the spans emitted for SSR wall time, time-to-first-byte, and hydration time. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Request Lifecycle"
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
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/ssr",
				children: "Server-Side Rendering"
			}), " — what the server hands to hydration"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/streaming",
				children: "Streaming SSR"
			}), " — how streamed chunks hydrate"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
			}), " — the cache hydration fills"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/caching",
				children: "Caching Strategies"
			}), " — the personalization split after hydration"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend",
				children: "Frontend"
			}), " — the page surface that produces the hydrated tree"] }),
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
