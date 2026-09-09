import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/frontend/routing.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "File-Based Routing",
	"description": "dotted paths, $param segments, splat, nested layouts, matching rules, and route context."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nRouting is owned by the framework. `@kwiva/router` provides the core — route tree, matching, loaders, guards, history — and `@kwiva/react` binds it to pages and components. The route tree is **generated from the file system**: there is no central route configuration file and nothing to keep in sync. The router core is a Kwiva deliverable (ADR-0005) whose ergonomics follow a file-based reference router; the library itself is not a dependency, so there is no version pin and no upstream surface to import.\n\n## The Page Tree [#the-page-tree]\n\nAll routes live under `src/ui/pages/`:\n\n```plaintext title=\"the-page-tree.txt\"\nsrc/ui/pages/\n├─ __root.tsx              # root layout + providers + outlet\n├─ index.tsx               # /\n├─ about.tsx               # /about\n├─ posts.index.tsx         # /posts\n├─ posts.$id.tsx           # /posts/:id\n├─ posts.$id.edit.tsx      # /posts/:id/edit\n├─ settings/\n│  ├─ profile.tsx          # /settings/profile\n│  └─ security.tsx         # /settings/security\n└─ files.$.tsx             # splat: /files/*\n```\n\nFour conventions cover the entire tree:\n\n| Convention          | Meaning                       | Example                            |\n| ------------------- | ----------------------------- | ---------------------------------- |\n| Flat + dotted paths | Dots become path separators   | `posts.index.tsx` → `/posts`       |\n| `$param` segments   | Dynamic path segment          | `posts.$id.tsx` → `/posts/:id`     |\n| `$` splat           | Catch-all remainder           | `files.$.tsx` → `/files/*`         |\n| `__root.tsx`        | Root layout for the whole app | hosts providers + outlet           |\n| Folder layout files | `_layout.tsx` inside a folder | composes routes inside that folder |\n\nFiles and folders nest arbitrarily deep, and each level contributes either a route or a layout — never both. A folder with a `_layout.tsx` groups routes that share chrome; a folder without one is just namespacing.\n\n## Dynamic Segments [#dynamic-segments]\n\nA `$` prefix marks a file segment as dynamic. `posts.$id.tsx` matches `/posts/1a2b3c`, `/posts/anything` — and nothing else. The matched value is available as typed params:\n\n```tsx title=\"dynamic-segments.tsx\"\nconst { id } = Route.useParams()\n```\n\nParams are string-typed per the segment, and code that reads a param that the route file does not define fails at compile time. Multiple dynamic segments work the same way: `posts.$id.edit.tsx` declares `$id` and matches two-segment `posts/:id/edit` paths.\n\n### Splats [#splats]\n\nThe bare `$` matches the whole remainder of the path, including multiple segments. `files.$.tsx` matches `/files/a`, `/files/a/b`, and `/files/a/b/c.txt`. Splats are useful for catch-all surfaces (file views, docs trees) where the shape of the tail is unknown at authoring time.\n\n## Typed Search Params [#typed-search-params]\n\nSearch state is validated per route with `validateSearch`, and the resulting shape flows to `Route.useSearch()`, to link `search` props, and into navigation calls:\n\n```tsx title=\"typed-search-params.tsx\"\nvalidateSearch: (s) => s.object({ q: s.optional(s.string()), page: s.optional(s.number()) })\n```\n\n```tsx title=\"typed-search-params-2.tsx\"\nconst search = Route.useSearch()   // typed by validateSearch\nconst { q, page } = search\n```\n\nValidation runs before the route is even accepted, on both server and client. Invalid `to`, `params`, or `search` values fail **at compile time** — the route tree types are generated into `src/.kwiva/types` and ambiently available to every file. A `search` object that does not satisfy the target route's schema is a type error.\n\n## Matching Rules [#matching-rules]\n\nRoutes are matched by score, not by declaration order:\n\n* A literal segment always beats a `$param` segment at the same position\n* A `$param` segment beats the `$` splat\n* The splat matches any remainder, including multi-segment ones\n* Layouts participate in the match: a request resolves against the layout chain that can render the URL\n\nBecause matching is deterministic, `/posts/readme` resolves to `posts.$id.tsx` (literal score wins among equal shapes), while `/files/a/b/c.txt` resolves to the `$` splat. The same request always resolves to the same route — the behavior is scored, not order-dependent.\n\n## Nested Folders [#nested-folders]\n\nFolders nest both routes and layouts. Files inside `settings/` share the folder's layout file:\n\n```plaintext title=\"nested-folders.txt\"\nsrc/ui/pages/settings/\n├─ _layout.tsx             # /settings shell\n├─ profile.tsx             # /settings/profile\n└─ security.tsx            # /settings/security\n```\n\nEach route renders into the nearest enclosing layout's outlet, composing arbitrary depth. A matched URL is rendered through the chain of layouts that owns it, root first, leaf last. See [Nested Layouts](/docs/frontend/layouts) for composition rules and layout-level loaders.\n\n## Loaders and Match [#loaders-and-match]\n\nThe router runs loaders for **every matched route** — the layouts and the page together — in parallel, deduplicated per request. Loader results are keyed identically on server and client, so navigation reuses what already exists. `loaderDeps` scopes re-execution to a slice of the search state, and `beforeLoad` guards run before any loader in the chain. See [Loaders & Data](/docs/frontend/loaders).\n\n## Route Context [#route-context]\n\nThe router carries a typed context available to loaders, guards, and components. The root route provides it — session, typed client, config, and the data-hook cache are injected without manual wiring:\n\n```tsx title=\"route-context.tsx\"\ncreateRootWithContext({ session, client, config })\n```\n\nAnything declared here is available in every loader's argument and in every page component, so pages never construct infrastructure themselves. Loaders receive `params`, `search`, `client`, `session`, `config`, and `location`; guards receive the same surface plus the URL being navigated to. No import, no context typing ceremony — the route file declares what it needs.\n\n## History Modes [#history-modes]\n\nThe router supports the three standard history modes, selected per use case:\n\n| Mode            | Fits when                                                       |\n| --------------- | --------------------------------------------------------------- |\n| Browser history | Default web apps — clean URLs, server renders the initial route |\n| Hash history    | Static hosts that cannot rewrite unknown paths                  |\n| Memory history  | Tests and embedded environments without a real URL              |\n\nThe same matching, loader, and type surface applies in every mode, which is what lets one file render server-side, client-side, and inside a test harness without changes.\n\n## Type Generation [#type-generation]\n\nThe route tree, its params, its search schemas, and its loader return types are all compiled into generated types under `src/.kwiva/types`. The framework reads these at type level — there is no runtime codegen step, no generated JavaScript, and nothing to commit. The same generated surface powers `Route.useParams()`, `Route.useSearch()`, `Route.useLoaderData()`, typed `<Link>` targets, and navigation calls. You notice the output only as autocomplete and compiler errors.\n\n## Code Splitting [#code-splitting]\n\nBecause routes are the unit of navigation, they are also the unit of client code. The framework owns code splitting and dehydration (ADR-0006): each route's component, loader, and hooks load with the navigation that needs them, on both the server-rendered and single-page paths. Splitting follows the route automatically — there is no manual `lazy()` wiring per page, because the route boundary *is* the code boundary. A settings page's components never ship to a user who visits only the homepage.\n\n## 404 and Not Found [#404-and-not-found]\n\nA route that matches the tree but cannot resolve its data can throw the typed `notFound()` from a guard or loader. The router renders the nearest `notFoundComponent`, or the root boundary when none exists closer. Because `404` is a data outcome, it participates in the same loader/type flow as every other result. See [Pages](/docs/frontend/pages).\n\n## Dev Ergonomics [#dev-ergonomics]\n\n* `kwiva make:page posts.$id` scaffolds a route file with a typed stub, providers, and a loader\n* The dev overlay lists the route tree, loader timings, and cache state (v1.x)\n* OTel spans per match: the dev overlay shows the loader waterfall for each request\n\n## What's Next [#whats-next]\n\n* [Pages](/docs/frontend/pages) — what goes inside a route file\n* [Nested Layouts](/docs/frontend/layouts) — composing the tree with layout files\n* [Navigation & Link](/docs/frontend/navigation) — moving between routes with type safety\n* [Loaders & Data](/docs/frontend/loaders) — how each matched route loads data\n* [Server-Side Rendering](/docs/rendering/ssr) — how the route tree serves a request\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Routing is owned by the framework. `@kwiva/router` provides the core — route tree, matching, loaders, guards, history — and `@kwiva/react` binds it to pages and components. The route tree is **generated from the file system**: there is no central route configuration file and nothing to keep in sync. The router core is a Kwiva deliverable (ADR-0005) whose ergonomics follow a file-based reference router; the library itself is not a dependency, so there is no version pin and no upstream surface to import."
		},
		{
			"heading": "the-page-tree",
			"content": "All routes live under `src/ui/pages/`:"
		},
		{
			"heading": "the-page-tree",
			"content": "Four conventions cover the entire tree:"
		},
		{
			"heading": "the-page-tree",
			"content": "Convention"
		},
		{
			"heading": "the-page-tree",
			"content": "Meaning"
		},
		{
			"heading": "the-page-tree",
			"content": "Example"
		},
		{
			"heading": "the-page-tree",
			"content": "Flat + dotted paths"
		},
		{
			"heading": "the-page-tree",
			"content": "Dots become path separators"
		},
		{
			"heading": "the-page-tree",
			"content": "`posts.index.tsx` → `/posts`"
		},
		{
			"heading": "the-page-tree",
			"content": "`$param` segments"
		},
		{
			"heading": "the-page-tree",
			"content": "Dynamic path segment"
		},
		{
			"heading": "the-page-tree",
			"content": "`posts.$id.tsx` → `/posts/:id`"
		},
		{
			"heading": "the-page-tree",
			"content": "`$` splat"
		},
		{
			"heading": "the-page-tree",
			"content": "Catch-all remainder"
		},
		{
			"heading": "the-page-tree",
			"content": "`files.$.tsx` → `/files/*`"
		},
		{
			"heading": "the-page-tree",
			"content": "`__root.tsx`"
		},
		{
			"heading": "the-page-tree",
			"content": "Root layout for the whole app"
		},
		{
			"heading": "the-page-tree",
			"content": "hosts providers + outlet"
		},
		{
			"heading": "the-page-tree",
			"content": "Folder layout files"
		},
		{
			"heading": "the-page-tree",
			"content": "`_layout.tsx` inside a folder"
		},
		{
			"heading": "the-page-tree",
			"content": "composes routes inside that folder"
		},
		{
			"heading": "the-page-tree",
			"content": "Files and folders nest arbitrarily deep, and each level contributes either a route or a layout — never both. A folder with a `_layout.tsx` groups routes that share chrome; a folder without one is just namespacing."
		},
		{
			"heading": "dynamic-segments",
			"content": "A `$` prefix marks a file segment as dynamic. `posts.$id.tsx` matches `/posts/1a2b3c`, `/posts/anything` — and nothing else. The matched value is available as typed params:"
		},
		{
			"heading": "dynamic-segments",
			"content": "Params are string-typed per the segment, and code that reads a param that the route file does not define fails at compile time. Multiple dynamic segments work the same way: `posts.$id.edit.tsx` declares `$id` and matches two-segment `posts/:id/edit` paths."
		},
		{
			"heading": "splats",
			"content": "The bare `$` matches the whole remainder of the path, including multiple segments. `files.$.tsx` matches `/files/a`, `/files/a/b`, and `/files/a/b/c.txt`. Splats are useful for catch-all surfaces (file views, docs trees) where the shape of the tail is unknown at authoring time."
		},
		{
			"heading": "typed-search-params",
			"content": "Search state is validated per route with `validateSearch`, and the resulting shape flows to `Route.useSearch()`, to link `search` props, and into navigation calls:"
		},
		{
			"heading": "typed-search-params",
			"content": "Validation runs before the route is even accepted, on both server and client. Invalid `to`, `params`, or `search` values fail **at compile time** — the route tree types are generated into `src/.kwiva/types` and ambiently available to every file. A `search` object that does not satisfy the target route's schema is a type error."
		},
		{
			"heading": "matching-rules",
			"content": "Routes are matched by score, not by declaration order:"
		},
		{
			"heading": "matching-rules",
			"content": "A literal segment always beats a `$param` segment at the same position"
		},
		{
			"heading": "matching-rules",
			"content": "A `$param` segment beats the `$` splat"
		},
		{
			"heading": "matching-rules",
			"content": "The splat matches any remainder, including multi-segment ones"
		},
		{
			"heading": "matching-rules",
			"content": "Layouts participate in the match: a request resolves against the layout chain that can render the URL"
		},
		{
			"heading": "matching-rules",
			"content": "Because matching is deterministic, `/posts/readme` resolves to `posts.$id.tsx` (literal score wins among equal shapes), while `/files/a/b/c.txt` resolves to the `$` splat. The same request always resolves to the same route — the behavior is scored, not order-dependent."
		},
		{
			"heading": "nested-folders",
			"content": "Folders nest both routes and layouts. Files inside `settings/` share the folder's layout file:"
		},
		{
			"heading": "nested-folders",
			"content": "Each route renders into the nearest enclosing layout's outlet, composing arbitrary depth. A matched URL is rendered through the chain of layouts that owns it, root first, leaf last. See Nested Layouts for composition rules and layout-level loaders."
		},
		{
			"heading": "loaders-and-match",
			"content": "The router runs loaders for **every matched route** — the layouts and the page together — in parallel, deduplicated per request. Loader results are keyed identically on server and client, so navigation reuses what already exists. `loaderDeps` scopes re-execution to a slice of the search state, and `beforeLoad` guards run before any loader in the chain. See Loaders & Data."
		},
		{
			"heading": "route-context",
			"content": "The router carries a typed context available to loaders, guards, and components. The root route provides it — session, typed client, config, and the data-hook cache are injected without manual wiring:"
		},
		{
			"heading": "route-context",
			"content": "Anything declared here is available in every loader's argument and in every page component, so pages never construct infrastructure themselves. Loaders receive `params`, `search`, `client`, `session`, `config`, and `location`; guards receive the same surface plus the URL being navigated to. No import, no context typing ceremony — the route file declares what it needs."
		},
		{
			"heading": "history-modes",
			"content": "The router supports the three standard history modes, selected per use case:"
		},
		{
			"heading": "history-modes",
			"content": "Mode"
		},
		{
			"heading": "history-modes",
			"content": "Fits when"
		},
		{
			"heading": "history-modes",
			"content": "Browser history"
		},
		{
			"heading": "history-modes",
			"content": "Default web apps — clean URLs, server renders the initial route"
		},
		{
			"heading": "history-modes",
			"content": "Hash history"
		},
		{
			"heading": "history-modes",
			"content": "Static hosts that cannot rewrite unknown paths"
		},
		{
			"heading": "history-modes",
			"content": "Memory history"
		},
		{
			"heading": "history-modes",
			"content": "Tests and embedded environments without a real URL"
		},
		{
			"heading": "history-modes",
			"content": "The same matching, loader, and type surface applies in every mode, which is what lets one file render server-side, client-side, and inside a test harness without changes."
		},
		{
			"heading": "type-generation",
			"content": "The route tree, its params, its search schemas, and its loader return types are all compiled into generated types under `src/.kwiva/types`. The framework reads these at type level — there is no runtime codegen step, no generated JavaScript, and nothing to commit. The same generated surface powers `Route.useParams()`, `Route.useSearch()`, `Route.useLoaderData()`, typed `<Link>` targets, and navigation calls. You notice the output only as autocomplete and compiler errors."
		},
		{
			"heading": "code-splitting",
			"content": "Because routes are the unit of navigation, they are also the unit of client code. The framework owns code splitting and dehydration (ADR-0006): each route's component, loader, and hooks load with the navigation that needs them, on both the server-rendered and single-page paths. Splitting follows the route automatically — there is no manual `lazy()` wiring per page, because the route boundary *is* the code boundary. A settings page's components never ship to a user who visits only the homepage."
		},
		{
			"heading": "404-and-not-found",
			"content": "A route that matches the tree but cannot resolve its data can throw the typed `notFound()` from a guard or loader. The router renders the nearest `notFoundComponent`, or the root boundary when none exists closer. Because `404` is a data outcome, it participates in the same loader/type flow as every other result. See Pages."
		},
		{
			"heading": "dev-ergonomics",
			"content": "`kwiva make:page posts.$id` scaffolds a route file with a typed stub, providers, and a loader"
		},
		{
			"heading": "dev-ergonomics",
			"content": "The dev overlay lists the route tree, loader timings, and cache state (v1.x)"
		},
		{
			"heading": "dev-ergonomics",
			"content": "OTel spans per match: the dev overlay shows the loader waterfall for each request"
		},
		{
			"heading": "whats-next",
			"content": "Pages — what goes inside a route file"
		},
		{
			"heading": "whats-next",
			"content": "Nested Layouts — composing the tree with layout files"
		},
		{
			"heading": "whats-next",
			"content": "Navigation & Link — moving between routes with type safety"
		},
		{
			"heading": "whats-next",
			"content": "Loaders & Data — how each matched route loads data"
		},
		{
			"heading": "whats-next",
			"content": "Server-Side Rendering — how the route tree serves a request"
		}
	],
	"headings": [
		{
			"id": "the-page-tree",
			"content": "The Page Tree"
		},
		{
			"id": "dynamic-segments",
			"content": "Dynamic Segments"
		},
		{
			"id": "splats",
			"content": "Splats"
		},
		{
			"id": "typed-search-params",
			"content": "Typed Search Params"
		},
		{
			"id": "matching-rules",
			"content": "Matching Rules"
		},
		{
			"id": "nested-folders",
			"content": "Nested Folders"
		},
		{
			"id": "loaders-and-match",
			"content": "Loaders and Match"
		},
		{
			"id": "route-context",
			"content": "Route Context"
		},
		{
			"id": "history-modes",
			"content": "History Modes"
		},
		{
			"id": "type-generation",
			"content": "Type Generation"
		},
		{
			"id": "code-splitting",
			"content": "Code Splitting"
		},
		{
			"id": "404-and-not-found",
			"content": "404 and Not Found"
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
		url: "#the-page-tree",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Page Tree" })
	},
	{
		depth: 2,
		url: "#dynamic-segments",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Dynamic Segments" })
	},
	{
		depth: 3,
		url: "#splats",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Splats" })
	},
	{
		depth: 2,
		url: "#typed-search-params",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Typed Search Params" })
	},
	{
		depth: 2,
		url: "#matching-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Matching Rules" })
	},
	{
		depth: 2,
		url: "#nested-folders",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Nested Folders" })
	},
	{
		depth: 2,
		url: "#loaders-and-match",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Loaders and Match" })
	},
	{
		depth: 2,
		url: "#route-context",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Route Context" })
	},
	{
		depth: 2,
		url: "#history-modes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "History Modes" })
	},
	{
		depth: 2,
		url: "#type-generation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Type Generation" })
	},
	{
		depth: 2,
		url: "#code-splitting",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Code Splitting" })
	},
	{
		depth: 2,
		url: "#404-and-not-found",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "404 and Not Found" })
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
		em: "em",
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
			"Routing is owned by the framework. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/router" }),
			" provides the core — route tree, matching, loaders, guards, history — and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }),
			" binds it to pages and components. The route tree is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "generated from the file system" }),
			": there is no central route configuration file and nothing to keep in sync. The router core is a Kwiva deliverable (ADR-0005) whose ergonomics follow a file-based reference router; the library itself is not a dependency, so there is no version pin and no upstream surface to import."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-page-tree",
			children: "The Page Tree"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"All routes live under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/" }),
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
			title: "the-page-tree.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/ui/pages/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ __root.tsx              # root layout + providers + outlet" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ index.tsx               # /" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ about.tsx               # /about" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ posts.index.tsx         # /posts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ posts.$id.tsx           # /posts/:id" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ posts.$id.edit.tsx      # /posts/:id/edit" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ settings/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ profile.tsx          # /settings/profile" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  └─ security.tsx         # /settings/security" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "└─ files.$.tsx             # splat: /files/*" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Four conventions cover the entire tree:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Convention" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Flat + dotted paths" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dots become path separators" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.index.tsx" }),
					" → ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/posts" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "$param" }), " segments"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dynamic path segment" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.$id.tsx" }),
					" → ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/posts/:id" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "$" }), " splat"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Catch-all remainder" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "files.$.tsx" }),
					" → ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/files/*" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "__root.tsx" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Root layout for the whole app" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "hosts providers + outlet" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Folder layout files" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "_layout.tsx" }), " inside a folder"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "composes routes inside that folder" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Files and folders nest arbitrarily deep, and each level contributes either a route or a layout — never both. A folder with a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "_layout.tsx" }),
			" groups routes that share chrome; a folder without one is just namespacing."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "dynamic-segments",
			children: "Dynamic Segments"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "$" }),
			" prefix marks a file segment as dynamic. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.$id.tsx" }),
			" matches ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/posts/1a2b3c" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/posts/anything" }),
			" — and nothing else. The matched value is available as typed params:"
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
			title: "dynamic-segments.tsx",
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
						children: "()"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Params are string-typed per the segment, and code that reads a param that the route file does not define fails at compile time. Multiple dynamic segments work the same way: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.$id.edit.tsx" }),
			" declares ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "$id" }),
			" and matches two-segment ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts/:id/edit" }),
			" paths."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "splats",
			children: "Splats"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The bare ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "$" }),
			" matches the whole remainder of the path, including multiple segments. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "files.$.tsx" }),
			" matches ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/files/a" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/files/a/b" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/files/a/b/c.txt" }),
			". Splats are useful for catch-all surfaces (file views, docs trees) where the shape of the tail is unknown at authoring time."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "typed-search-params",
			children: "Typed Search Params"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Search state is validated per route with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "validateSearch" }),
			", and the resulting shape flows to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Route.useSearch()" }),
			", to link ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "search" }),
			" props, and into navigation calls:"
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
			title: "typed-search-params.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "validateSearch"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": ("
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#E36209",
							"--shiki-dark": "#FFAB70"
						},
						children: "s"
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
						children: " s."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "object"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "({ q: s."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "optional"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "(s."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "string"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "()), page: s."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "optional"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "(s."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "number"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "()) })"
					})
				]
			}) })
		}) }),
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
			title: "typed-search-params-2.tsx",
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
							children: "()   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// typed by validateSearch"
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
							children: "q"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "page"
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
							children: " search"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Validation runs before the route is even accepted, on both server and client. Invalid ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "to" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }),
			", or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "search" }),
			" values fail ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "at compile time" }),
			" — the route tree types are generated into ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/types" }),
			" and ambiently available to every file. A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "search" }),
			" object that does not satisfy the target route's schema is a type error."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "matching-rules",
			children: "Matching Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Routes are matched by score, not by declaration order:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A literal segment always beats a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "$param" }),
				" segment at the same position"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "$param" }),
				" segment beats the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "$" }),
				" splat"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The splat matches any remainder, including multi-segment ones" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Layouts participate in the match: a request resolves against the layout chain that can render the URL" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because matching is deterministic, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/posts/readme" }),
			" resolves to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.$id.tsx" }),
			" (literal score wins among equal shapes), while ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/files/a/b/c.txt" }),
			" resolves to the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "$" }),
			" splat. The same request always resolves to the same route — the behavior is scored, not order-dependent."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "nested-folders",
			children: "Nested Folders"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Folders nest both routes and layouts. Files inside ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "settings/" }),
			" share the folder's layout file:"
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
			title: "nested-folders.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/ui/pages/settings/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ _layout.tsx             # /settings shell" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ profile.tsx             # /settings/profile" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "└─ security.tsx            # /settings/security" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each route renders into the nearest enclosing layout's outlet, composing arbitrary depth. A matched URL is rendered through the chain of layouts that owns it, root first, leaf last. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/layouts",
				children: "Nested Layouts"
			}),
			" for composition rules and layout-level loaders."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "loaders-and-match",
			children: "Loaders and Match"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The router runs loaders for ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "every matched route" }),
			" — the layouts and the page together — in parallel, deduplicated per request. Loader results are keyed identically on server and client, so navigation reuses what already exists. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "loaderDeps" }),
			" scopes re-execution to a slice of the search state, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
			" guards run before any loader in the chain. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "route-context",
			children: "Route Context"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The router carries a typed context available to loaders, guards, and components. The root route provides it — session, typed client, config, and the data-hook cache are injected without manual wiring:" }),
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
			title: "route-context.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					},
					children: "createRootWithContext"
				}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					},
					children: "({ session, client, config })"
				})]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Anything declared here is available in every loader's argument and in every page component, so pages never construct infrastructure themselves. Loaders receive ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "search" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "location" }),
			"; guards receive the same surface plus the URL being navigated to. No import, no context typing ceremony — the route file declares what it needs."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "history-modes",
			children: "History Modes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The router supports the three standard history modes, selected per use case:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Fits when" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Browser history" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Default web apps — clean URLs, server renders the initial route" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Hash history" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Static hosts that cannot rewrite unknown paths" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Memory history" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tests and embedded environments without a real URL" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The same matching, loader, and type surface applies in every mode, which is what lets one file render server-side, client-side, and inside a test harness without changes." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "type-generation",
			children: "Type Generation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The route tree, its params, its search schemas, and its loader return types are all compiled into generated types under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/types" }),
			". The framework reads these at type level — there is no runtime codegen step, no generated JavaScript, and nothing to commit. The same generated surface powers ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Route.useParams()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Route.useSearch()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Route.useLoaderData()" }),
			", typed ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "<Link>" }),
			" targets, and navigation calls. You notice the output only as autocomplete and compiler errors."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "code-splitting",
			children: "Code Splitting"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because routes are the unit of navigation, they are also the unit of client code. The framework owns code splitting and dehydration (ADR-0006): each route's component, loader, and hooks load with the navigation that needs them, on both the server-rendered and single-page paths. Splitting follows the route automatically — there is no manual ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "lazy()" }),
			" wiring per page, because the route boundary ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "is" }),
			" the code boundary. A settings page's components never ship to a user who visits only the homepage."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "404-and-not-found",
			children: "404 and Not Found"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A route that matches the tree but cannot resolve its data can throw the typed ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "notFound()" }),
			" from a guard or loader. The router renders the nearest ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "notFoundComponent" }),
			", or the root boundary when none exists closer. Because ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "404" }),
			" is a data outcome, it participates in the same loader/type flow as every other result. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/pages",
				children: "Pages"
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
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:page posts.$id" }), " scaffolds a route file with a typed stub, providers, and a loader"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The dev overlay lists the route tree, loader timings, and cache state (v1.x)" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "OTel spans per match: the dev overlay shows the loader waterfall for each request" }),
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
				href: "/docs/frontend/pages",
				children: "Pages"
			}), " — what goes inside a route file"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/layouts",
				children: "Nested Layouts"
			}), " — composing the tree with layout files"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/navigation",
				children: "Navigation & Link"
			}), " — moving between routes with type safety"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}), " — how each matched route loads data"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/ssr",
				children: "Server-Side Rendering"
			}), " — how the route tree serves a request"] }),
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
