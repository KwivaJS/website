import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/frontend/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Frontend",
	"description": "The complete frontend — pages, routing, layouts, loaders, data hooks, RPC client, and UI kit."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nThe frontend is a first-class, fully owned part of the framework. Pages, routing, layouts, loaders, data hooks, the typed RPC client, and the built-in UI kit are all part of the same `defineX` surface — one cohesive narrative instead of a stack of stitched-together libraries. Routing decisions are locked by the framework's ADRs (ADR-0005 owns the router, ADR-0006 owns SSR orchestration), so the engineering ergonomics of the reference router are implemented natively — without the dependency or the version pin.\n\nBy default every page is **server-rendered**. Loaders run on the server, the first paint arrives as HTML, and hydration transfers the loaded data into the client-side data-hook cache without a refetch. The exact same `definePage` files can run as a client-rendered single-page application in `api+spa` mode — the page code does not change. Rendering is a framework responsibility, not an add-on.\n\n## The Full-Stack Loop [#the-full-stack-loop]\n\nThe frontend sits at the end of a loop that starts in the data layer:\n\n```plaintext title=\"the-full-stack-loop.txt\"\ndefineModel → defineController → @kwiva/client → definePage loader → data hooks\n```\n\nA model declared once with `defineModel` produces its API. Controllers shape those endpoints and add custom actions. The typed client derives its call signatures from the same route manifest. Page loaders call that client. Data hooks consume the loader's results from the same cache. One type universe flows through the entire loop with **zero code generation** — types are derived at type level from the route manifest and the model IR.\n\nThe practical effect is that params, search state, loader data, and mutations are all checked at the call site. A page that reads `params.id` and calls `client.posts.get(params.id)` is validated against the real route file and the real controller before it ever ships. Loaders are lint-gated to the typed client (`no-raw-fetch-in-loaders`), so the loop cannot be bypassed by a stray `fetch`.\n\n## Ownership: Four Packages [#ownership-four-packages]\n\nThe frontend is split across four packages, each with a narrow job:\n\n| Package         | Role                                                                                  |\n| --------------- | ------------------------------------------------------------------------------------- |\n| `@kwiva/react`  | Page and component bindings — `definePage`, `Providers`, data hooks, navigation hooks |\n| `@kwiva/router` | The owned router core — route tree, matching, loaders, guards, history                |\n| `@kwiva/client` | The typed RPC client — end-to-end typed calls, SSR-safe, session-aware                |\n| `@kwiva/ui-kit` | The component layer — tokens, primitives, components, and whole-screen patterns       |\n\nThe router core is runtime-agnostic; `@kwiva/react` binds it to pages and components. The client is used by both, which is why the same call surface works in loaders, hooks, and tests. The UI kit is the only fully replaceable layer — apps may keep it, swap it, or render plain utility-first CSS, provided they maintain the token surface the Studio uses.\n\n## What the Frontend Includes [#what-the-frontend-includes]\n\n| Topic                                          | What it covers                                                                                                          |\n| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |\n| [Pages](/docs/frontend/pages)                  | `definePage` — the factory for every page: validation, loader, guards, pending/error/not-found UI, head meta, component |\n| [File-Based Routing](/docs/frontend/routing)   | The `src/ui/pages/**` file tree, dynamic segments, splats, nested folders, route context                                |\n| [Nested Layouts](/docs/frontend/layouts)       | `__root.tsx`, folder layout files, layout composition, layout-level loaders                                             |\n| [Loaders & Data](/docs/frontend/loaders)       | Parallel and streamed loaders, deferred data with `stream()`, `beforeLoad` guards, loader hydration                     |\n| [Navigation & Link](/docs/frontend/navigation) | Typed `Link`, programmatic navigation, intent preloading, scroll restoration                                            |\n| [Data Hooks](/docs/frontend/data-hooks)        | `useResource`, `useList`, `useMutation`, `useInfiniteList`, invalidation, suspense                                      |\n| [RPC Client](/docs/frontend/rpc-client)        | `createClient`, end-to-end typed calls, SSR-safe dedupe, subscriptions, testing                                         |\n| [UI Components](/docs/frontend/ui-components)  | The built-in UI kit — layout primitives, `Link`, form primitives, Studio screens                                        |\n\nEach page walks one surface in full and cross-links the others, so the set reads as a single reference rather than overlapping tutorials.\n\n## Server-Rendered by Default [#server-rendered-by-default]\n\nEvery page participates in the framework-owned rendering pipeline by default:\n\n```plaintext title=\"server-rendered-by-default.txt\"\nrequest (page route)\n  → router match (owned router)\n  → beforeLoad guards (session → login redirects)\n  → loaders execute in parallel (server-side, via the typed client, in-process)\n  → suspense-aware HTML streaming\n  → response stream (status, headers, cookies from the pipeline)\nhydration (client)\n  → state rehydrates into the data-hook cache (no refetch of loader data)\n  → router picks up at the same route with the same search state\n```\n\nRoute rules let you choose — per path — whether the response is dynamically rendered, cached for a window, revalidated, or prerendered at build time. See [Rendering](/docs/rendering) for the full pipeline and its knobs, [Loaders & Data](/docs/frontend/loaders) for the server-side data pass, and [Pages](/docs/frontend/pages) for the full `definePage` contract.\n\n## Runtime Selection [#runtime-selection]\n\nReact is the default runtime, selected once in UI configuration:\n\n```ts title=\"src/config/ui.ts\"\n// src/config/ui.ts\nexport default defineConfig('ui', {\n  defaults: { runtime: 'react', theme: 'kwiva' },\n})\n```\n\n`runtime: 'compact'` swaps in the compact runtime at build time via the framework's own transform — one config flip, mostly smaller bundles, and application code unchanged. Hydration semantics, the data-hook cache, and the render pipeline are identical across runtimes. See [Hydration](/docs/rendering/hydration) for the shared contract.\n\n## One Cache, Client and Server [#one-cache-client-and-server]\n\nLoaders and data hooks read and write the same cache. When a loader runs on the server, its results dehydrate into the page stream; on the client they rehydrate into the data-hook cache under identical keys. Navigation reuses what is already present — there is no double fetch between navigate and render. Intent preloading populates that same cache, so hovering a link warms the data the next page is about to render.\n\nKeys are derived from **model identity plus arguments**, never hand-built. `invalidate(Post)` clears every list, detail, and custom entry touching the `Post` model; `invalidateTags([...])` clears route-rule caches on the server. Client freshness and server responses stay consistent because both read from one contract. See [Data Hooks](/docs/frontend/data-hooks) and [Caching Strategies](/docs/rendering/caching).\n\n## Generated Types, No Codegen [#generated-types-no-codegen]\n\nThe route tree, its params, its search schemas, and its loader return types are compiled into generated types under `src/.kwiva/types`. The framework reads these at type level — there is no runtime codegen step, no build-time code generation, and nothing to commit. The same generated surface powers `Route.useParams()`, `Route.useSearch()`, `Route.useLoaderData()`, typed `<Link>` targets, and navigation calls. Invalid `to`, `params`, or `search` values fail **at compile time** — a broken link is a type error, not a 404 at runtime. See [File-Based Routing](/docs/frontend/routing) for the type-generation pipeline.\n\n## Getting Started [#getting-started]\n\nPage files are discovered by convention, so there is nothing to register: drop `index.tsx` into `src/ui/pages/` and the `/` route exists. Generate a typed scaffold with the CLI:\n\n```bash title=\"terminal\"\nkwiva make:page posts.$id\n```\n\nThe scaffold ships a typed stub with the provider tree, a loader wired to the typed client, and the streaming suspension points in place. [Your First Page](/docs/getting-started/first-page) walks a page end to end, and [CLI Generators](/docs/cli/generators) lists the scaffold commands.\n\n## Server and Client Execution [#server-and-client-execution]\n\n`definePage` files execute in two contexts, and both are first-class. On the server, loaders run in-process with the full request context — session, tenant, and config are the same objects HTTP handlers see, so a page can never render past an authorization boundary. On the client, the same loader runs with the provider-resolved context during navigation, and its result lands in the identical cache keys. Single-page mode is a projection of the same files, not a rewrite. See [SSR](/docs/rendering/ssr) and [Hydration](/docs/rendering/hydration).\n\n## Development Experience [#development-experience]\n\nThe dev side is part of the frontend, not an afterthought:\n\n* The dev overlay lists the route tree, loader timings, and cache state (v1.x)\n* Loader waterfalls and OTel trace ids attach to each request's rendering stages\n* `kwiva make:page posts.$id` scaffolds a full typed page in one command\n* Hydration problems surface as cache-key diagnostics, not silent mismatches\n\nSee [Observability: Dev Overlay](/docs/observability/dev-overlay) for the overlay and [CLI Generators](/docs/cli/generators) for scaffolds.\n\n## What's Next [#whats-next]\n\n1. [Pages](/docs/frontend/pages) — start with the `definePage` contract\n2. [File-Based Routing](/docs/frontend/routing) — how files become routes\n3. [Loaders & Data](/docs/frontend/loaders) — getting data into pages\n4. [Data Hooks](/docs/frontend/data-hooks) — client-side data access\n5. [Rendering](/docs/rendering) — SSR, streaming, and hydration\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The frontend is a first-class, fully owned part of the framework. Pages, routing, layouts, loaders, data hooks, the typed RPC client, and the built-in UI kit are all part of the same `defineX` surface — one cohesive narrative instead of a stack of stitched-together libraries. Routing decisions are locked by the framework's ADRs (ADR-0005 owns the router, ADR-0006 owns SSR orchestration), so the engineering ergonomics of the reference router are implemented natively — without the dependency or the version pin."
		},
		{
			"heading": void 0,
			"content": "By default every page is **server-rendered**. Loaders run on the server, the first paint arrives as HTML, and hydration transfers the loaded data into the client-side data-hook cache without a refetch. The exact same `definePage` files can run as a client-rendered single-page application in `api+spa` mode — the page code does not change. Rendering is a framework responsibility, not an add-on."
		},
		{
			"heading": "the-full-stack-loop",
			"content": "The frontend sits at the end of a loop that starts in the data layer:"
		},
		{
			"heading": "the-full-stack-loop",
			"content": "A model declared once with `defineModel` produces its API. Controllers shape those endpoints and add custom actions. The typed client derives its call signatures from the same route manifest. Page loaders call that client. Data hooks consume the loader's results from the same cache. One type universe flows through the entire loop with **zero code generation** — types are derived at type level from the route manifest and the model IR."
		},
		{
			"heading": "the-full-stack-loop",
			"content": "The practical effect is that params, search state, loader data, and mutations are all checked at the call site. A page that reads `params.id` and calls `client.posts.get(params.id)` is validated against the real route file and the real controller before it ever ships. Loaders are lint-gated to the typed client (`no-raw-fetch-in-loaders`), so the loop cannot be bypassed by a stray `fetch`."
		},
		{
			"heading": "ownership-four-packages",
			"content": "The frontend is split across four packages, each with a narrow job:"
		},
		{
			"heading": "ownership-four-packages",
			"content": "Package"
		},
		{
			"heading": "ownership-four-packages",
			"content": "Role"
		},
		{
			"heading": "ownership-four-packages",
			"content": "`@kwiva/react`"
		},
		{
			"heading": "ownership-four-packages",
			"content": "Page and component bindings — `definePage`, `Providers`, data hooks, navigation hooks"
		},
		{
			"heading": "ownership-four-packages",
			"content": "`@kwiva/router`"
		},
		{
			"heading": "ownership-four-packages",
			"content": "The owned router core — route tree, matching, loaders, guards, history"
		},
		{
			"heading": "ownership-four-packages",
			"content": "`@kwiva/client`"
		},
		{
			"heading": "ownership-four-packages",
			"content": "The typed RPC client — end-to-end typed calls, SSR-safe, session-aware"
		},
		{
			"heading": "ownership-four-packages",
			"content": "`@kwiva/ui-kit`"
		},
		{
			"heading": "ownership-four-packages",
			"content": "The component layer — tokens, primitives, components, and whole-screen patterns"
		},
		{
			"heading": "ownership-four-packages",
			"content": "The router core is runtime-agnostic; `@kwiva/react` binds it to pages and components. The client is used by both, which is why the same call surface works in loaders, hooks, and tests. The UI kit is the only fully replaceable layer — apps may keep it, swap it, or render plain utility-first CSS, provided they maintain the token surface the Studio uses."
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "Topic"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "What it covers"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "Pages"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "`definePage` — the factory for every page: validation, loader, guards, pending/error/not-found UI, head meta, component"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "File-Based Routing"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "The `src/ui/pages/**` file tree, dynamic segments, splats, nested folders, route context"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "Nested Layouts"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "`__root.tsx`, folder layout files, layout composition, layout-level loaders"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "Loaders & Data"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "Parallel and streamed loaders, deferred data with `stream()`, `beforeLoad` guards, loader hydration"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "Navigation & Link"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "Typed `Link`, programmatic navigation, intent preloading, scroll restoration"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "Data Hooks"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "`useResource`, `useList`, `useMutation`, `useInfiniteList`, invalidation, suspense"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "RPC Client"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "`createClient`, end-to-end typed calls, SSR-safe dedupe, subscriptions, testing"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "UI Components"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "The built-in UI kit — layout primitives, `Link`, form primitives, Studio screens"
		},
		{
			"heading": "what-the-frontend-includes",
			"content": "Each page walks one surface in full and cross-links the others, so the set reads as a single reference rather than overlapping tutorials."
		},
		{
			"heading": "server-rendered-by-default",
			"content": "Every page participates in the framework-owned rendering pipeline by default:"
		},
		{
			"heading": "server-rendered-by-default",
			"content": "Route rules let you choose — per path — whether the response is dynamically rendered, cached for a window, revalidated, or prerendered at build time. See Rendering for the full pipeline and its knobs, Loaders & Data for the server-side data pass, and Pages for the full `definePage` contract."
		},
		{
			"heading": "runtime-selection",
			"content": "React is the default runtime, selected once in UI configuration:"
		},
		{
			"heading": "runtime-selection",
			"content": "`runtime: 'compact'` swaps in the compact runtime at build time via the framework's own transform — one config flip, mostly smaller bundles, and application code unchanged. Hydration semantics, the data-hook cache, and the render pipeline are identical across runtimes. See Hydration for the shared contract."
		},
		{
			"heading": "one-cache-client-and-server",
			"content": "Loaders and data hooks read and write the same cache. When a loader runs on the server, its results dehydrate into the page stream; on the client they rehydrate into the data-hook cache under identical keys. Navigation reuses what is already present — there is no double fetch between navigate and render. Intent preloading populates that same cache, so hovering a link warms the data the next page is about to render."
		},
		{
			"heading": "one-cache-client-and-server",
			"content": "Keys are derived from **model identity plus arguments**, never hand-built. `invalidate(Post)` clears every list, detail, and custom entry touching the `Post` model; `invalidateTags([...])` clears route-rule caches on the server. Client freshness and server responses stay consistent because both read from one contract. See Data Hooks and Caching Strategies."
		},
		{
			"heading": "generated-types-no-codegen",
			"content": "The route tree, its params, its search schemas, and its loader return types are compiled into generated types under `src/.kwiva/types`. The framework reads these at type level — there is no runtime codegen step, no build-time code generation, and nothing to commit. The same generated surface powers `Route.useParams()`, `Route.useSearch()`, `Route.useLoaderData()`, typed `<Link>` targets, and navigation calls. Invalid `to`, `params`, or `search` values fail **at compile time** — a broken link is a type error, not a 404 at runtime. See File-Based Routing for the type-generation pipeline."
		},
		{
			"heading": "getting-started",
			"content": "Page files are discovered by convention, so there is nothing to register: drop `index.tsx` into `src/ui/pages/` and the `/` route exists. Generate a typed scaffold with the CLI:"
		},
		{
			"heading": "getting-started",
			"content": "The scaffold ships a typed stub with the provider tree, a loader wired to the typed client, and the streaming suspension points in place. Your First Page walks a page end to end, and CLI Generators lists the scaffold commands."
		},
		{
			"heading": "server-and-client-execution",
			"content": "`definePage` files execute in two contexts, and both are first-class. On the server, loaders run in-process with the full request context — session, tenant, and config are the same objects HTTP handlers see, so a page can never render past an authorization boundary. On the client, the same loader runs with the provider-resolved context during navigation, and its result lands in the identical cache keys. Single-page mode is a projection of the same files, not a rewrite. See SSR and Hydration."
		},
		{
			"heading": "development-experience",
			"content": "The dev side is part of the frontend, not an afterthought:"
		},
		{
			"heading": "development-experience",
			"content": "The dev overlay lists the route tree, loader timings, and cache state (v1.x)"
		},
		{
			"heading": "development-experience",
			"content": "Loader waterfalls and OTel trace ids attach to each request's rendering stages"
		},
		{
			"heading": "development-experience",
			"content": "`kwiva make:page posts.$id` scaffolds a full typed page in one command"
		},
		{
			"heading": "development-experience",
			"content": "Hydration problems surface as cache-key diagnostics, not silent mismatches"
		},
		{
			"heading": "development-experience",
			"content": "See Observability: Dev Overlay for the overlay and CLI Generators for scaffolds."
		},
		{
			"heading": "whats-next",
			"content": "Pages — start with the `definePage` contract"
		},
		{
			"heading": "whats-next",
			"content": "File-Based Routing — how files become routes"
		},
		{
			"heading": "whats-next",
			"content": "Loaders & Data — getting data into pages"
		},
		{
			"heading": "whats-next",
			"content": "Data Hooks — client-side data access"
		},
		{
			"heading": "whats-next",
			"content": "Rendering — SSR, streaming, and hydration"
		}
	],
	"headings": [
		{
			"id": "the-full-stack-loop",
			"content": "The Full-Stack Loop"
		},
		{
			"id": "ownership-four-packages",
			"content": "Ownership: Four Packages"
		},
		{
			"id": "what-the-frontend-includes",
			"content": "What the Frontend Includes"
		},
		{
			"id": "server-rendered-by-default",
			"content": "Server-Rendered by Default"
		},
		{
			"id": "runtime-selection",
			"content": "Runtime Selection"
		},
		{
			"id": "one-cache-client-and-server",
			"content": "One Cache, Client and Server"
		},
		{
			"id": "generated-types-no-codegen",
			"content": "Generated Types, No Codegen"
		},
		{
			"id": "getting-started",
			"content": "Getting Started"
		},
		{
			"id": "server-and-client-execution",
			"content": "Server and Client Execution"
		},
		{
			"id": "development-experience",
			"content": "Development Experience"
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
		url: "#the-full-stack-loop",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Full-Stack Loop" })
	},
	{
		depth: 2,
		url: "#ownership-four-packages",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Ownership: Four Packages" })
	},
	{
		depth: 2,
		url: "#what-the-frontend-includes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What the Frontend Includes" })
	},
	{
		depth: 2,
		url: "#server-rendered-by-default",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Server-Rendered by Default" })
	},
	{
		depth: 2,
		url: "#runtime-selection",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Runtime Selection" })
	},
	{
		depth: 2,
		url: "#one-cache-client-and-server",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One Cache, Client and Server" })
	},
	{
		depth: 2,
		url: "#generated-types-no-codegen",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generated Types, No Codegen" })
	},
	{
		depth: 2,
		url: "#getting-started",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Getting Started" })
	},
	{
		depth: 2,
		url: "#server-and-client-execution",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Server and Client Execution" })
	},
	{
		depth: 2,
		url: "#development-experience",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Development Experience" })
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
		ul: "ul",
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The frontend is a first-class, fully owned part of the framework. Pages, routing, layouts, loaders, data hooks, the typed RPC client, and the built-in UI kit are all part of the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" surface — one cohesive narrative instead of a stack of stitched-together libraries. Routing decisions are locked by the framework's ADRs (ADR-0005 owns the router, ADR-0006 owns SSR orchestration), so the engineering ergonomics of the reference router are implemented natively — without the dependency or the version pin."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"By default every page is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "server-rendered" }),
			". Loaders run on the server, the first paint arrives as HTML, and hydration transfers the loaded data into the client-side data-hook cache without a refetch. The exact same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			" files can run as a client-rendered single-page application in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }),
			" mode — the page code does not change. Rendering is a framework responsibility, not an add-on."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-full-stack-loop",
			children: "The Full-Stack Loop"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The frontend sits at the end of a loop that starts in the data layer:" }),
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
			title: "the-full-stack-loop.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineModel → defineController → @kwiva/client → definePage loader → data hooks" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A model declared once with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" produces its API. Controllers shape those endpoints and add custom actions. The typed client derives its call signatures from the same route manifest. Page loaders call that client. Data hooks consume the loader's results from the same cache. One type universe flows through the entire loop with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "zero code generation" }),
			" — types are derived at type level from the route manifest and the model IR."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The practical effect is that params, search state, loader data, and mutations are all checked at the call site. A page that reads ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params.id" }),
			" and calls ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.get(params.id)" }),
			" is validated against the real route file and the real controller before it ever ships. Loaders are lint-gated to the typed client (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-raw-fetch-in-loaders" }),
			"), so the loop cannot be bypassed by a stray ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fetch" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "ownership-four-packages",
			children: "Ownership: Four Packages"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The frontend is split across four packages, each with a narrow job:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Package" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Role" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Page and component bindings — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Providers" }),
				", data hooks, navigation hooks"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/router" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The owned router core — route tree, matching, loaders, guards, history" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The typed RPC client — end-to-end typed calls, SSR-safe, session-aware" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/ui-kit" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The component layer — tokens, primitives, components, and whole-screen patterns" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The router core is runtime-agnostic; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }),
			" binds it to pages and components. The client is used by both, which is why the same call surface works in loaders, hooks, and tests. The UI kit is the only fully replaceable layer — apps may keep it, swap it, or render plain utility-first CSS, provided they maintain the token surface the Studio uses."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-the-frontend-includes",
			children: "What the Frontend Includes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Topic" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it covers" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/pages",
				children: "Pages"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }), " — the factory for every page: validation, loader, guards, pending/error/not-found UI, head meta, component"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/routing",
				children: "File-Based Routing"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/**" }),
				" file tree, dynamic segments, splats, nested folders, route context"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/layouts",
				children: "Nested Layouts"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "__root.tsx" }), ", folder layout files, layout composition, layout-level loaders"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Parallel and streamed loaders, deferred data with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stream()" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
				" guards, loader hydration"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/navigation",
				children: "Navigation & Link"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Typed ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Link" }),
				", programmatic navigation, intent preloading, scroll restoration"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useResource" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useList" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useMutation" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useInfiniteList" }),
				", invalidation, suspense"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/rpc-client",
				children: "RPC Client"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createClient" }), ", end-to-end typed calls, SSR-safe dedupe, subscriptions, testing"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/ui-components",
				children: "UI Components"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The built-in UI kit — layout primitives, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Link" }),
				", form primitives, Studio screens"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each page walks one surface in full and cross-links the others, so the set reads as a single reference rather than overlapping tutorials." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "server-rendered-by-default",
			children: "Server-Rendered by Default"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every page participates in the framework-owned rendering pipeline by default:" }),
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
			title: "server-rendered-by-default.txt",
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
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → loaders execute in parallel (server-side, via the typed client, in-process)" })
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
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → router picks up at the same route with the same search state" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Route rules let you choose — per path — whether the response is dynamically rendered, cached for a window, revalidated, or prerendered at build time. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering",
				children: "Rendering"
			}),
			" for the full pipeline and its knobs, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}),
			" for the server-side data pass, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/pages",
				children: "Pages"
			}),
			" for the full ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			" contract."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "runtime-selection",
			children: "Runtime Selection"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "React is the default runtime, selected once in UI configuration:" }),
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
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "runtime: 'compact'" }),
			" swaps in the compact runtime at build time via the framework's own transform — one config flip, mostly smaller bundles, and application code unchanged. Hydration semantics, the data-hook cache, and the render pipeline are identical across runtimes. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/hydration",
				children: "Hydration"
			}),
			" for the shared contract."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "one-cache-client-and-server",
			children: "One Cache, Client and Server"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Loaders and data hooks read and write the same cache. When a loader runs on the server, its results dehydrate into the page stream; on the client they rehydrate into the data-hook cache under identical keys. Navigation reuses what is already present — there is no double fetch between navigate and render. Intent preloading populates that same cache, so hovering a link warms the data the next page is about to render." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Keys are derived from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "model identity plus arguments" }),
			", never hand-built. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidate(Post)" }),
			" clears every list, detail, and custom entry touching the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Post" }),
			" model; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invalidateTags([...])" }),
			" clears route-rule caches on the server. Client freshness and server responses stay consistent because both read from one contract. See ",
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
			id: "generated-types-no-codegen",
			children: "Generated Types, No Codegen"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The route tree, its params, its search schemas, and its loader return types are compiled into generated types under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/types" }),
			". The framework reads these at type level — there is no runtime codegen step, no build-time code generation, and nothing to commit. The same generated surface powers ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Route.useParams()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Route.useSearch()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Route.useLoaderData()" }),
			", typed ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "<Link>" }),
			" targets, and navigation calls. Invalid ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "to" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }),
			", or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "search" }),
			" values fail ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "at compile time" }),
			" — a broken link is a type error, not a 404 at runtime. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/routing",
				children: "File-Based Routing"
			}),
			" for the type-generation pipeline."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "getting-started",
			children: "Getting Started"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Page files are discovered by convention, so there is nothing to register: drop ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "index.tsx" }),
			" into ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/" }),
			" and the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/" }),
			" route exists. Generate a typed scaffold with the CLI:"
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
			title: "terminal",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
						children: " make:page"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " posts."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "$id"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The scaffold ships a typed stub with the provider tree, a loader wired to the typed client, and the streaming suspension points in place. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-page",
				children: "Your First Page"
			}),
			" walks a page end to end, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/generators",
				children: "CLI Generators"
			}),
			" lists the scaffold commands."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "server-and-client-execution",
			children: "Server and Client Execution"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			" files execute in two contexts, and both are first-class. On the server, loaders run in-process with the full request context — session, tenant, and config are the same objects HTTP handlers see, so a page can never render past an authorization boundary. On the client, the same loader runs with the provider-resolved context during navigation, and its result lands in the identical cache keys. Single-page mode is a projection of the same files, not a rewrite. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/ssr",
				children: "SSR"
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
			id: "development-experience",
			children: "Development Experience"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The dev side is part of the frontend, not an afterthought:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The dev overlay lists the route tree, loader timings, and cache state (v1.x)" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Loader waterfalls and OTel trace ids attach to each request's rendering stages" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:page posts.$id" }), " scaffolds a full typed page in one command"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Hydration problems surface as cache-key diagnostics, not silent mismatches" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/dev-overlay",
				children: "Observability: Dev Overlay"
			}),
			" for the overlay and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/generators",
				children: "CLI Generators"
			}),
			" for scaffolds."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/frontend/pages",
					children: "Pages"
				}),
				" — start with the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
				" contract"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/routing",
				children: "File-Based Routing"
			}), " — how files become routes"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}), " — getting data into pages"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
			}), " — client-side data access"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering",
				children: "Rendering"
			}), " — SSR, streaming, and hydration"] }),
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
