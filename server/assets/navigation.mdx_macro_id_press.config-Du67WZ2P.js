import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/frontend/navigation.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Navigation & Link",
	"description": "Typed Link, useNavigate, route hooks, intent preloading, and scroll restoration."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nNavigation is typed end to end. Links, programmatic navigation, and the current route all share the generated route tree, so a target that does not exist — or params and search that do not match the route file — fails at compile time instead of in the browser. The route-tree types live in `src/.kwiva/types`, generated from the file tree and ambiently available; every navigation surface checks against them.\n\n## Typed Links [#typed-links]\n\n`<Link>` is the declarative way to move between routes. Its `to` target is validated against the generated route tree, and `params` and `search` are checked against the target route's shape:\n\n```tsx title=\"typed-links.tsx\"\n<Link to=\"/posts/$id\" params={{ id: post.id }} preload=\"intent\">\n  {post.title}\n</Link>\n```\n\n| Prop      | Role                                                          |\n| --------- | ------------------------------------------------------------- |\n| `to`      | Route target, typed against the generated tree                |\n| `params`  | Dynamic segments, typed per the target route file             |\n| `search`  | Search state, validated against the target's `validateSearch` |\n| `preload` | `intent` warms loader + data on hover/focus                   |\n\nA link to `posts.$id` must supply an `id`; a link to a route with required search schema must supply the required keys; anything else is a compile error. Links render as anchors, so middle-click, open-in-new-tab, and crawler behavior all keep working.\n\n### Search State on Links [#search-state-on-links]\n\nSearch state is passed the same way, schema-validated on arrival:\n\n```tsx title=\"search-state-on-links.tsx\"\n<Link to=\"/posts\" search={{ page: 2, q: 'kwiva' }}>Next page</Link>\n```\n\nThe target route's `validateSearch` runs on the incoming state, so invalid shapes are rejected before they reach the target's loaders. Because the schema is typed into link `search` props, the link and the route cannot drift — adding a required field to a route's `validateSearch` makes every link missing it a type error.\n\n## Programmatic Navigation [#programmatic-navigation]\n\n`useNavigate()` returns a typed navigation function for event handlers, effects, and flows that do not have markup:\n\n```tsx title=\"programmatic-navigation.tsx\"\nconst navigate = useNavigate()\n\nnavigate({ to: '/posts', search: { page: 2 } })\nnavigate({ to: '..', relative: true })   // relative to the current route\n```\n\nThe same compile-time guarantees apply: `to`, `params`, and `search` are validated against the real route files. Relative navigation (`'..'`, `'.'`) resolves against the current route and keeps the same guarantees.\n\n## Route Hooks [#route-hooks]\n\nThe current route exposes its state through typed hooks, generated from the same route file:\n\n```tsx title=\"route-hooks.tsx\"\nconst { id } = Route.useParams()          // dynamic segments\nconst search = Route.useSearch()          // validated search state\nconst loaderData = Route.useLoaderData()  // loader return value\n```\n\nThese are described in [File-Based Routing](/docs/frontend/routing) and [Loaders & Data](/docs/frontend/loaders). Because all three derive from one route file, a param read, a search read, and a data read inside the same component always agree with each other and with the URL.\n\n## Intent Preloading [#intent-preloading]\n\nNavigation can be proactive. Two surfaces warm the next route before the user commits to it:\n\n| Surface                   | Behavior                                                                                       |\n| ------------------------- | ---------------------------------------------------------------------------------------------- |\n| `<Link preload=\"intent\">` | Hover or focus on the link triggers the target loader and a data prefetch via the typed client |\n| `router.preloadRoute()`   | Programmatic preload of a named route, e.g. for an always-visible next-step link               |\n\nBoth populate the **same cache** the data hooks read. Because preload writes loader-identical keys, the eventual navigate and render find the data already present — there is no double fetch between preload, navigate, and display.\n\n```plaintext title=\"intent-preloading.txt\"\nhover link → preload runs loader → cache is warm\nnavigate  → render reads cache  → no refetch, instant paint\n```\n\nThe preload contract is the loader contract: the target route's loader runs with its real `params` and `search`, and its result lands under the exact keys the loaded page will read. See [Loaders & Data](/docs/frontend/loaders).\n\n## Scroll Restoration [#scroll-restoration]\n\nScroll behavior is restored per route, keyed so each route resumes where the user left it:\n\n```tsx title=\"scroll-restoration.tsx\"\nscrollRestoration: true\n```\n\nCustom behavior is available per route when a single keyed default is not enough — the same deployment that restores a long list's scroll position can start a fresh route at the top. Because restoration is keyed, revisiting a route returns to the position it was left at, independent of how many other navigations happened in between.\n\n## Active State [#active-state]\n\nThe current route is part of the navigation story. Because links know their typed target and the router exposes the active match, navigation chrome can compare a link's target against the current route to render focus and selected states — a settings nav bar lights up the section you are in without string matching. The comparison is route-aware, so nested matches (a page inside a section) light the section the same way a direct match does.\n\n## What Happens During Navigation [#what-happens-during-navigation]\n\nA navigation is a transition, not a reload. The router resolves the target against the route tree, matches the full layout chain for it, and — when the target's data is not already in the cache — runs the matched loaders in parallel across every layout and page in the chain:\n\n```plaintext title=\"what-happens-during-navigation.txt\"\nnavigate({ to: '/posts/42' })\n  → router match (route tree)\n  → cache check (data present? render immediately)\n  → else: matched loaders run in parallel\n  → pending state may commit (pendingMs / pendingMinMs)\n  → render → scroll restoration\n```\n\nThe same transition runs identically after a full page load (hydration) and after client-side navigation — the router picks up at the same route with the same search state either way. See [Server-Side Rendering](/docs/rendering/ssr) and [Hydration](/docs/rendering/hydration).\n\n## Pending UI During Navigation [#pending-ui-during-navigation]\n\nWhile a transition's loaders run, the route's `pendingComponent` governs what the user sees. Two knobs tune the flash:\n\n| Knob           | Effect                                                                      |\n| -------------- | --------------------------------------------------------------------------- |\n| `pendingMs`    | Delay showing the pending state — fast routes never flash a skeleton        |\n| `pendingMinMs` | Floor the minimum display time once shown — slow routes do not flicker away |\n\nA fast list navigation with data already cached renders without any pending flash; a genuinely slow route commits a skeleton for at least `pendingMinMs`. See [Pages](/docs/frontend/pages) for the pending-state contract.\n\n## Relative and Absolute Targets [#relative-and-absolute-targets]\n\nNavigation supports both absolute and relative targets. `navigate({ to: '/posts' })` goes from the root of the route tree; `navigate({ to: '..', relative: true })` resolves against the current route. Relative navigation keeps the same compile-time guarantees as absolute targets — the resolved route is still checked against the real route tree before the call type-checks.\n\n## Navigation and the Cache [#navigation-and-the-cache]\n\nNavigation always walks the shared cache. When the target route's data is already present — from a prior visit, a loader dehydration, or a preload — the render reads it directly and the fetch is skipped. When it is not, the loaders run in parallel across the matched chain and the render waits on the complete set. Either way the client never double-fetches what a loader or preload supplied. See [Data Hooks](/docs/frontend/data-hooks) and [Caching Strategies](/docs/rendering/caching).\n\n## Dev Ergonomics [#dev-ergonomics]\n\n* Invalid `to`, `params`, and `search` values fail at compile time via generated types in `src/.kwiva/types`\n* The dev overlay exposes the route tree and the type surface behind every link (v1.x)\n* `kwiva make:page` scaffolds pages that wire in `<Link>` and `useNavigate` stubs from the first file\n\n## What's Next [#whats-next]\n\n* [File-Based Routing](/docs/frontend/routing) — the route tree links are typed against\n* [Loaders & Data](/docs/frontend/loaders) — what preloading runs ahead of render\n* [Pages](/docs/frontend/pages) — where links and navigations point\n* [Data Hooks](/docs/frontend/data-hooks) — the cache preloading warms\n* [UI Components](/docs/frontend/ui-components) — the `Link` shipped by the kit\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Navigation is typed end to end. Links, programmatic navigation, and the current route all share the generated route tree, so a target that does not exist — or params and search that do not match the route file — fails at compile time instead of in the browser. The route-tree types live in `src/.kwiva/types`, generated from the file tree and ambiently available; every navigation surface checks against them."
		},
		{
			"heading": "typed-links",
			"content": "`<Link>` is the declarative way to move between routes. Its `to` target is validated against the generated route tree, and `params` and `search` are checked against the target route's shape:"
		},
		{
			"heading": "typed-links",
			"content": "Prop"
		},
		{
			"heading": "typed-links",
			"content": "Role"
		},
		{
			"heading": "typed-links",
			"content": "`to`"
		},
		{
			"heading": "typed-links",
			"content": "Route target, typed against the generated tree"
		},
		{
			"heading": "typed-links",
			"content": "`params`"
		},
		{
			"heading": "typed-links",
			"content": "Dynamic segments, typed per the target route file"
		},
		{
			"heading": "typed-links",
			"content": "`search`"
		},
		{
			"heading": "typed-links",
			"content": "Search state, validated against the target's `validateSearch`"
		},
		{
			"heading": "typed-links",
			"content": "`preload`"
		},
		{
			"heading": "typed-links",
			"content": "`intent` warms loader + data on hover/focus"
		},
		{
			"heading": "typed-links",
			"content": "A link to `posts.$id` must supply an `id`; a link to a route with required search schema must supply the required keys; anything else is a compile error. Links render as anchors, so middle-click, open-in-new-tab, and crawler behavior all keep working."
		},
		{
			"heading": "search-state-on-links",
			"content": "Search state is passed the same way, schema-validated on arrival:"
		},
		{
			"heading": "search-state-on-links",
			"content": "The target route's `validateSearch` runs on the incoming state, so invalid shapes are rejected before they reach the target's loaders. Because the schema is typed into link `search` props, the link and the route cannot drift — adding a required field to a route's `validateSearch` makes every link missing it a type error."
		},
		{
			"heading": "programmatic-navigation",
			"content": "`useNavigate()` returns a typed navigation function for event handlers, effects, and flows that do not have markup:"
		},
		{
			"heading": "programmatic-navigation",
			"content": "The same compile-time guarantees apply: `to`, `params`, and `search` are validated against the real route files. Relative navigation (`'..'`, `'.'`) resolves against the current route and keeps the same guarantees."
		},
		{
			"heading": "route-hooks",
			"content": "The current route exposes its state through typed hooks, generated from the same route file:"
		},
		{
			"heading": "route-hooks",
			"content": "These are described in File-Based Routing and Loaders & Data. Because all three derive from one route file, a param read, a search read, and a data read inside the same component always agree with each other and with the URL."
		},
		{
			"heading": "intent-preloading",
			"content": "Navigation can be proactive. Two surfaces warm the next route before the user commits to it:"
		},
		{
			"heading": "intent-preloading",
			"content": "Surface"
		},
		{
			"heading": "intent-preloading",
			"content": "Behavior"
		},
		{
			"heading": "intent-preloading",
			"content": "`<Link preload=\"intent\">`"
		},
		{
			"heading": "intent-preloading",
			"content": "Hover or focus on the link triggers the target loader and a data prefetch via the typed client"
		},
		{
			"heading": "intent-preloading",
			"content": "`router.preloadRoute()`"
		},
		{
			"heading": "intent-preloading",
			"content": "Programmatic preload of a named route, e.g. for an always-visible next-step link"
		},
		{
			"heading": "intent-preloading",
			"content": "Both populate the **same cache** the data hooks read. Because preload writes loader-identical keys, the eventual navigate and render find the data already present — there is no double fetch between preload, navigate, and display."
		},
		{
			"heading": "intent-preloading",
			"content": "The preload contract is the loader contract: the target route's loader runs with its real `params` and `search`, and its result lands under the exact keys the loaded page will read. See Loaders & Data."
		},
		{
			"heading": "scroll-restoration",
			"content": "Scroll behavior is restored per route, keyed so each route resumes where the user left it:"
		},
		{
			"heading": "scroll-restoration",
			"content": "Custom behavior is available per route when a single keyed default is not enough — the same deployment that restores a long list's scroll position can start a fresh route at the top. Because restoration is keyed, revisiting a route returns to the position it was left at, independent of how many other navigations happened in between."
		},
		{
			"heading": "active-state",
			"content": "The current route is part of the navigation story. Because links know their typed target and the router exposes the active match, navigation chrome can compare a link's target against the current route to render focus and selected states — a settings nav bar lights up the section you are in without string matching. The comparison is route-aware, so nested matches (a page inside a section) light the section the same way a direct match does."
		},
		{
			"heading": "what-happens-during-navigation",
			"content": "A navigation is a transition, not a reload. The router resolves the target against the route tree, matches the full layout chain for it, and — when the target's data is not already in the cache — runs the matched loaders in parallel across every layout and page in the chain:"
		},
		{
			"heading": "what-happens-during-navigation",
			"content": "The same transition runs identically after a full page load (hydration) and after client-side navigation — the router picks up at the same route with the same search state either way. See Server-Side Rendering and Hydration."
		},
		{
			"heading": "pending-ui-during-navigation",
			"content": "While a transition's loaders run, the route's `pendingComponent` governs what the user sees. Two knobs tune the flash:"
		},
		{
			"heading": "pending-ui-during-navigation",
			"content": "Knob"
		},
		{
			"heading": "pending-ui-during-navigation",
			"content": "Effect"
		},
		{
			"heading": "pending-ui-during-navigation",
			"content": "`pendingMs`"
		},
		{
			"heading": "pending-ui-during-navigation",
			"content": "Delay showing the pending state — fast routes never flash a skeleton"
		},
		{
			"heading": "pending-ui-during-navigation",
			"content": "`pendingMinMs`"
		},
		{
			"heading": "pending-ui-during-navigation",
			"content": "Floor the minimum display time once shown — slow routes do not flicker away"
		},
		{
			"heading": "pending-ui-during-navigation",
			"content": "A fast list navigation with data already cached renders without any pending flash; a genuinely slow route commits a skeleton for at least `pendingMinMs`. See Pages for the pending-state contract."
		},
		{
			"heading": "relative-and-absolute-targets",
			"content": "Navigation supports both absolute and relative targets. `navigate({ to: '/posts' })` goes from the root of the route tree; `navigate({ to: '..', relative: true })` resolves against the current route. Relative navigation keeps the same compile-time guarantees as absolute targets — the resolved route is still checked against the real route tree before the call type-checks."
		},
		{
			"heading": "navigation-and-the-cache",
			"content": "Navigation always walks the shared cache. When the target route's data is already present — from a prior visit, a loader dehydration, or a preload — the render reads it directly and the fetch is skipped. When it is not, the loaders run in parallel across the matched chain and the render waits on the complete set. Either way the client never double-fetches what a loader or preload supplied. See Data Hooks and Caching Strategies."
		},
		{
			"heading": "dev-ergonomics",
			"content": "Invalid `to`, `params`, and `search` values fail at compile time via generated types in `src/.kwiva/types`"
		},
		{
			"heading": "dev-ergonomics",
			"content": "The dev overlay exposes the route tree and the type surface behind every link (v1.x)"
		},
		{
			"heading": "dev-ergonomics",
			"content": "`kwiva make:page` scaffolds pages that wire in `<Link>` and `useNavigate` stubs from the first file"
		},
		{
			"heading": "whats-next",
			"content": "File-Based Routing — the route tree links are typed against"
		},
		{
			"heading": "whats-next",
			"content": "Loaders & Data — what preloading runs ahead of render"
		},
		{
			"heading": "whats-next",
			"content": "Pages — where links and navigations point"
		},
		{
			"heading": "whats-next",
			"content": "Data Hooks — the cache preloading warms"
		},
		{
			"heading": "whats-next",
			"content": "UI Components — the `Link` shipped by the kit"
		}
	],
	"headings": [
		{
			"id": "typed-links",
			"content": "Typed Links"
		},
		{
			"id": "search-state-on-links",
			"content": "Search State on Links"
		},
		{
			"id": "programmatic-navigation",
			"content": "Programmatic Navigation"
		},
		{
			"id": "route-hooks",
			"content": "Route Hooks"
		},
		{
			"id": "intent-preloading",
			"content": "Intent Preloading"
		},
		{
			"id": "scroll-restoration",
			"content": "Scroll Restoration"
		},
		{
			"id": "active-state",
			"content": "Active State"
		},
		{
			"id": "what-happens-during-navigation",
			"content": "What Happens During Navigation"
		},
		{
			"id": "pending-ui-during-navigation",
			"content": "Pending UI During Navigation"
		},
		{
			"id": "relative-and-absolute-targets",
			"content": "Relative and Absolute Targets"
		},
		{
			"id": "navigation-and-the-cache",
			"content": "Navigation and the Cache"
		},
		{
			"id": "dev-ergonomics",
			"content": "Dev Ergonomics"
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
		url: "#typed-links",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Typed Links" })
	},
	{
		depth: 3,
		url: "#search-state-on-links",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Search State on Links" })
	},
	{
		depth: 2,
		url: "#programmatic-navigation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Programmatic Navigation" })
	},
	{
		depth: 2,
		url: "#route-hooks",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Route Hooks" })
	},
	{
		depth: 2,
		url: "#intent-preloading",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Intent Preloading" })
	},
	{
		depth: 2,
		url: "#scroll-restoration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Scroll Restoration" })
	},
	{
		depth: 2,
		url: "#active-state",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Active State" })
	},
	{
		depth: 2,
		url: "#what-happens-during-navigation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Happens During Navigation" })
	},
	{
		depth: 2,
		url: "#pending-ui-during-navigation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Pending UI During Navigation" })
	},
	{
		depth: 2,
		url: "#relative-and-absolute-targets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Relative and Absolute Targets" })
	},
	{
		depth: 2,
		url: "#navigation-and-the-cache",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Navigation and the Cache" })
	},
	{
		depth: 2,
		url: "#dev-ergonomics",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Dev Ergonomics" })
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
			"Navigation is typed end to end. Links, programmatic navigation, and the current route all share the generated route tree, so a target that does not exist — or params and search that do not match the route file — fails at compile time instead of in the browser. The route-tree types live in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/types" }),
			", generated from the file tree and ambiently available; every navigation surface checks against them."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "typed-links",
			children: "Typed Links"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "<Link>" }),
			" is the declarative way to move between routes. Its ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "to" }),
			" target is validated against the generated route tree, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "search" }),
			" are checked against the target route's shape:"
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
			title: "typed-links.tsx",
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
							children: "Link"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " to"
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
							children: "\"/posts/$id\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " params"
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
							children: "{{ id: post.id }} "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "preload"
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
							children: "\"intent\""
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
						children: "  {post.title}"
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
							children: "</"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Link"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Prop" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Role" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "to" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route target, typed against the generated tree" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dynamic segments, typed per the target route file" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "search" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Search state, validated against the target's ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "validateSearch" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "preload" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "intent" }), " warms loader + data on hover/focus"] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A link to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.$id" }),
			" must supply an ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "id" }),
			"; a link to a route with required search schema must supply the required keys; anything else is a compile error. Links render as anchors, so middle-click, open-in-new-tab, and crawler behavior all keep working."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "search-state-on-links",
			children: "Search State on Links"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Search state is passed the same way, schema-validated on arrival:" }),
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
			title: "search-state-on-links.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
						children: "Link"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: " to"
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
						children: "\"/posts\""
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: " search"
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
						children: "{{ page: "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "2"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ", q: "
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
						children: " }}>Next page</"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "Link"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ">"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The target route's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "validateSearch" }),
			" runs on the incoming state, so invalid shapes are rejected before they reach the target's loaders. Because the schema is typed into link ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "search" }),
			" props, the link and the route cannot drift — adding a required field to a route's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "validateSearch" }),
			" makes every link missing it a type error."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "programmatic-navigation",
			children: "Programmatic Navigation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useNavigate()" }), " returns a typed navigation function for event handlers, effects, and flows that do not have markup:"] }),
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
			title: "programmatic-navigation.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
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
							children: " navigate"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " useNavigate"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "navigate"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ to: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'/posts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", search: { page: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "2"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } })"
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
							children: "navigate"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ to: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'..'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", relative: "
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
							children: " })   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// relative to the current route"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same compile-time guarantees apply: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "to" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "search" }),
			" are validated against the real route files. Relative navigation (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "'..'" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "'.'" }),
			") resolves against the current route and keeps the same guarantees."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "route-hooks",
			children: "Route Hooks"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The current route exposes its state through typed hooks, generated from the same route file:" }),
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
			title: "route-hooks.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
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
							children: "id"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " Route."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "useParams"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// dynamic segments"
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
							children: " search"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " Route."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "useSearch"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// validated search state"
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
							children: " loaderData"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " Route."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "useLoaderData"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// loader return value"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"These are described in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/routing",
				children: "File-Based Routing"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}),
			". Because all three derive from one route file, a param read, a search read, and a data read inside the same component always agree with each other and with the URL."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "intent-preloading",
			children: "Intent Preloading"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Navigation can be proactive. Two surfaces warm the next route before the user commits to it:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "<Link preload=\"intent\">" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Hover or focus on the link triggers the target loader and a data prefetch via the typed client" })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "router.preloadRoute()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Programmatic preload of a named route, e.g. for an always-visible next-step link" })] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Both populate the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "same cache" }),
			" the data hooks read. Because preload writes loader-identical keys, the eventual navigate and render find the data already present — there is no double fetch between preload, navigate, and display."
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
			title: "intent-preloading.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "hover link → preload runs loader → cache is warm" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "navigate  → render reads cache  → no refetch, instant paint" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The preload contract is the loader contract: the target route's loader runs with its real ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "search" }),
			", and its result lands under the exact keys the loaded page will read. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "scroll-restoration",
			children: "Scroll Restoration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Scroll behavior is restored per route, keyed so each route resumes where the user left it:" }),
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
			title: "scroll-restoration.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "scrollRestoration"
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
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "true"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Custom behavior is available per route when a single keyed default is not enough — the same deployment that restores a long list's scroll position can start a fresh route at the top. Because restoration is keyed, revisiting a route returns to the position it was left at, independent of how many other navigations happened in between." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "active-state",
			children: "Active State"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The current route is part of the navigation story. Because links know their typed target and the router exposes the active match, navigation chrome can compare a link's target against the current route to render focus and selected states — a settings nav bar lights up the section you are in without string matching. The comparison is route-aware, so nested matches (a page inside a section) light the section the same way a direct match does." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-happens-during-navigation",
			children: "What Happens During Navigation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A navigation is a transition, not a reload. The router resolves the target against the route tree, matches the full layout chain for it, and — when the target's data is not already in the cache — runs the matched loaders in parallel across every layout and page in the chain:" }),
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
			title: "what-happens-during-navigation.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "navigate({ to: '/posts/42' })" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → router match (route tree)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → cache check (data present? render immediately)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → else: matched loaders run in parallel" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → pending state may commit (pendingMs / pendingMinMs)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → render → scroll restoration" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same transition runs identically after a full page load (hydration) and after client-side navigation — the router picks up at the same route with the same search state either way. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/ssr",
				children: "Server-Side Rendering"
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
			id: "pending-ui-during-navigation",
			children: "Pending UI During Navigation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"While a transition's loaders run, the route's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pendingComponent" }),
			" governs what the user sees. Two knobs tune the flash:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Knob" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Effect" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pendingMs" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Delay showing the pending state — fast routes never flash a skeleton" })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pendingMinMs" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Floor the minimum display time once shown — slow routes do not flicker away" })] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A fast list navigation with data already cached renders without any pending flash; a genuinely slow route commits a skeleton for at least ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pendingMinMs" }),
			". See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/pages",
				children: "Pages"
			}),
			" for the pending-state contract."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "relative-and-absolute-targets",
			children: "Relative and Absolute Targets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Navigation supports both absolute and relative targets. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "navigate({ to: '/posts' })" }),
			" goes from the root of the route tree; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "navigate({ to: '..', relative: true })" }),
			" resolves against the current route. Relative navigation keeps the same compile-time guarantees as absolute targets — the resolved route is still checked against the real route tree before the call type-checks."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "navigation-and-the-cache",
			children: "Navigation and the Cache"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Navigation always walks the shared cache. When the target route's data is already present — from a prior visit, a loader dehydration, or a preload — the render reads it directly and the fetch is skipped. When it is not, the loaders run in parallel across the matched chain and the render waits on the complete set. Either way the client never double-fetches what a loader or preload supplied. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
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
			id: "dev-ergonomics",
			children: "Dev Ergonomics"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Invalid ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "to" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "search" }),
				" values fail at compile time via generated types in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/types" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The dev overlay exposes the route tree and the type surface behind every link (v1.x)" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:page" }),
				" scaffolds pages that wire in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "<Link>" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useNavigate" }),
				" stubs from the first file"
			] }),
			"\n"
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
				href: "/docs/frontend/routing",
				children: "File-Based Routing"
			}), " — the route tree links are typed against"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}), " — what preloading runs ahead of render"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/pages",
				children: "Pages"
			}), " — where links and navigations point"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
			}), " — the cache preloading warms"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/frontend/ui-components",
					children: "UI Components"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Link" }),
				" shipped by the kit"
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
