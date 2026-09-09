import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/frontend/layouts.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Nested Layouts",
	"description": "__root.tsx, folder layouts, layout composition, layout loaders and guards."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nLayouts are pages. A layout file is an ordinary `definePage` whose component renders an `<Outlet />` — the place where matched child routes appear. Because layouts are pages, they get everything pages get: loaders, guards, pending and error UI, head meta, and search validation. Composition falls out of the file tree rather than from a routing table.\n\nThis is the same model as the framework-owned router everywhere else: a matched URL is rendered through the chain of layouts that owns it, each level providing its own chrome and data without coupling to its children.\n\n## The Root Layout [#the-root-layout]\n\nEvery application has a root layout at `src/ui/pages/__root.tsx`. It establishes the provider tree and the single outlet that the whole application renders through:\n\n```tsx title=\"the-root-layout.tsx\"\nimport { definePage, Providers, Outlet } from '@kwiva/react'\n\nexport default definePage({\n  component: () => (\n    <Providers theme=\"kwiva\">\n      <Layout>\n        <Outlet />\n      </Layout>\n    </Providers>\n  ),\n})\n```\n\n`Providers` injects session state, the typed client, the data-hook cache, internationalization, and theming into context. Anything mounted here (a sidebar, a topbar, a provider tree) wraps every route in the app. The root layout is also the natural home for a root-level `errorComponent`, because uncaught errors bubble up to it — plus a root-level loader for app-wide data every route needs.\n\n## Folder Layouts [#folder-layouts]\n\nNested layouts live in folders using a `_layout.tsx` file. Routes inside the folder render into that layout's outlet:\n\n```plaintext title=\"folder-layouts.txt\"\nsrc/ui/pages/\n├─ settings/\n│  ├─ _layout.tsx          # /settings shell — sidebar, heading, outlet\n│  ├─ profile.tsx          # /settings/profile\n│  └─ security.tsx         # /settings/security\n```\n\n```tsx title=\"src/ui/pages/settings/_layout.tsx\"\n// src/ui/pages/settings/_layout.tsx\nimport { definePage, Outlet } from '@kwiva/react'\n\nexport default definePage({\n  component: () => (\n    <SettingsShell>\n      <Outlet />\n    </SettingsShell>\n  ),\n})\n```\n\n`/settings/profile` now renders inside `<SettingsShell />`, which itself renders inside the root layout. Each level contributes its own chrome without coupling. The file moved the navigation from a shared component into a section — it did not restructure the router.\n\n## Composition [#composition]\n\nLayouts and pages collapse in a predictable way: a matched URL is rendered through the layout chain that owns it, root first, leaf last:\n\n```plaintext title=\"composition.txt\"\nrequest: /settings/profile\n  └─ __root.tsx           → renders <Providers><Layout><Outlet/>\n       └─ settings/_layout.tsx  → renders <SettingsShell><Outlet/>\n            └─ settings/profile.tsx → renders the page\n```\n\nAnything a parent layout renders around its outlet is inherited by every descendant — deciding to move a nav bar from the root into the `settings` layout is a file move, not a refactor. Each layout participates in the router match, so the chain that renders a URL is always the chain the score chose — see [File-Based Routing](/docs/frontend/routing) for matching rules.\n\n## Layouts and the URL [#layouts-and-the-url]\n\nLayout files contribute the URL prefix their folder owns. `settings/_layout.tsx` makes `/settings` the anchor of every route inside `settings/` — the same way `posts.$id.tsx` owns `/posts/:id`, a folder layout owns its directory:\n\n```plaintext title=\"layouts-and-the-url.txt\"\nsrc/ui/pages/account/        → URL prefix /account\n├─ _layout.tsx               # /account shell\n├─ billing.tsx               # /account/billing\n└─ invoices.tsx              # /account/invoices\n```\n\nThe file tree is the URL tree: routes and layouts read the same naming rules, and the score-based matcher resolves both. Because paths are stable this way, moving a section under a layout is an organizing change — the routes that render into it are untouched.\n\n## Nested Layout Chains [#nested-layout-chains]\n\nFolders nest freely, and each level composes its own chrome. A two-level section needs two layout files, each owning its prefix:\n\n```plaintext title=\"nested-layout-chains.txt\"\nsrc/ui/pages/account/\n├─ _layout.tsx              # /account shell\n├─ settings/\n│  ├─ _layout.tsx           # /account/settings shell\n│  ├─ profile.tsx           # /account/settings/profile\n│  └─ security.tsx          # /account/settings/security\n```\n\n`/account/settings/profile` renders through three layouts — root, account, account/settings — each contributing its own nav, heading, or data. Loaders across the whole chain run in parallel and deduplicate shared dependencies, so the deeper the chain, the more lookups collapse into existing cache entries rather than multiplying.\n\n## When to Reach for a Layout [#when-to-reach-for-a-layout]\n\nLayouts are the right tool when a group of routes shares behavior. Common triggers:\n\n| Situation                                     | Layout move                                         |\n| --------------------------------------------- | --------------------------------------------------- |\n| A section reuses chrome (nav, heading, shell) | Folder `_layout.tsx`                                |\n| A section requires auth or a permission       | `beforeLoad` guard on the layout                    |\n| Section-wide data every child renders         | Layout loader                                       |\n| Shared error or pending UI                    | `errorComponent` / `pendingComponent` on the layout |\n| Document meta for the whole section           | `head` on the layout                                |\n\nThe opposite also holds: a route that shares nothing does not need a layout file. Because layouts are pages, starting without one and adding `_layout.tsx` later never changes the child route files — composition is additive.\n\n## Layout-Level Loaders [#layout-level-loaders]\n\nLayouts participate in data loading like any page. A layout loader runs in parallel with the loaders of every other matched route, and its results are typed into the layout's children through the same loader-data mechanism:\n\n```tsx title=\"src/ui/pages/settings/_layout-2.tsx\"\n// src/ui/pages/settings/_layout.tsx\nexport default definePage({\n  loader: async ({ client }) => ({\n    workspaces: await client.workspaces.list(),\n  }),\n  component: ({ loaderData }) => (\n    <SettingsShell workspaces={loaderData.workspaces}>\n      <Outlet />\n    </SettingsShell>\n  ),\n})\n```\n\nLoaders across all matched routes execute in parallel and are deduplicated per request — a shared dependency is fetched once even when several layouts query it. On the server this happens in-process with no network hop; on the client navigation walks the same cached entries. Seen from the client, the whole layout chain composes into a single fast navigation. See [Loaders & Data](/docs/frontend/loaders) for the parallel execution contract.\n\n## Guards at the Layout Level [#guards-at-the-layout-level]\n\nBecause layouts are pages, `beforeLoad` belongs here too. Protecting an entire section becomes one declaration in the folder's `_layout.tsx` instead of a repeated check in every child page:\n\n```tsx title=\"guards-at-the-layout-level.tsx\"\nbeforeLoad: ({ session }) => {\n  if (!session.user) throw redirect({ to: '/login' })\n}\n```\n\n```plaintext title=\"guards-at-the-layout-level-2.txt\"\nSettings section\n  └─ beforeLoad guard on settings/_layout.tsx\n       └─ children never run their loaders when the guard throws\n```\n\nA guard that throws stops every loader in the chain beneath it — nothing in the section runs, no data leaks, no flash of unauthorized content. This is the same guarantee pages get individually, promoted to a whole subtree. See [Protecting Routes](/docs/auth/protecting-routes) and [Pages](/docs/frontend/pages).\n\n## Loading, Error, and Meta in Layouts [#loading-error-and-meta-in-layouts]\n\nSince layouts are pages, they also take the full UI-state surface:\n\n| Surface                      | Layout use                                                   |\n| ---------------------------- | ------------------------------------------------------------ |\n| `pendingComponent`           | Section-wide loading skeleton while the layout's loaders run |\n| `pendingMs` / `pendingMinMs` | Debounce and floor for that skeleton                         |\n| `errorComponent`             | Shared error panel for the whole section                     |\n| `notFoundComponent`          | Section-scoped not-found UI                                  |\n| `head`                       | Document meta applied to every child route                   |\n| `loaderDeps`                 | Scope the layout loader to a slice of search state           |\n\nA section-wide loading skeleton, a shared error panel, or document meta applied to every child route is defined once in the layout instead of repeated per page. Deferred data (`stream()`) works here too — a layout can block its chrome on one value and stream a supplementary panel behind a suspense boundary.\n\n## Nesting Depth [#nesting-depth]\n\nLayering is not limited: root, folders, nested folders, and route files can compose arbitrarily deep, and matching scores the layout chain that best fits the URL. Deep nesting stays cheap because loaders run in parallel and the router reuses the same cache across levels — on the server, shared dependencies are deduplicated per request; on the client, navigation walks the same cached entries.\n\nThere is no artificial ceiling on depth. What keeps deep trees fast is the loader contract, not the nesting itself: every matched loader across the chain resolves in parallel, deduplicated per request, and dehydrated into the same page stream. See [Loaders & Data](/docs/frontend/loaders) and [Hydration](/docs/rendering/hydration).\n\n## What's Next [#whats-next]\n\n* [File-Based Routing](/docs/frontend/routing) — the file conventions that create layouts\n* [Pages](/docs/frontend/pages) — the `definePage` contract layouts use\n* [Loaders & Data](/docs/frontend/loaders) — parallel loading across layout chains\n* [Data Hooks](/docs/frontend/data-hooks) — consuming layout data on the client\n* [Server-Side Rendering](/docs/rendering/ssr) — how the layout chain renders a request\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Layouts are pages. A layout file is an ordinary `definePage` whose component renders an `<Outlet />` — the place where matched child routes appear. Because layouts are pages, they get everything pages get: loaders, guards, pending and error UI, head meta, and search validation. Composition falls out of the file tree rather than from a routing table."
		},
		{
			"heading": void 0,
			"content": "This is the same model as the framework-owned router everywhere else: a matched URL is rendered through the chain of layouts that owns it, each level providing its own chrome and data without coupling to its children."
		},
		{
			"heading": "the-root-layout",
			"content": "Every application has a root layout at `src/ui/pages/__root.tsx`. It establishes the provider tree and the single outlet that the whole application renders through:"
		},
		{
			"heading": "the-root-layout",
			"content": "`Providers` injects session state, the typed client, the data-hook cache, internationalization, and theming into context. Anything mounted here (a sidebar, a topbar, a provider tree) wraps every route in the app. The root layout is also the natural home for a root-level `errorComponent`, because uncaught errors bubble up to it — plus a root-level loader for app-wide data every route needs."
		},
		{
			"heading": "folder-layouts",
			"content": "Nested layouts live in folders using a `_layout.tsx` file. Routes inside the folder render into that layout's outlet:"
		},
		{
			"heading": "folder-layouts",
			"content": "`/settings/profile` now renders inside `<SettingsShell />`, which itself renders inside the root layout. Each level contributes its own chrome without coupling. The file moved the navigation from a shared component into a section — it did not restructure the router."
		},
		{
			"heading": "composition",
			"content": "Layouts and pages collapse in a predictable way: a matched URL is rendered through the layout chain that owns it, root first, leaf last:"
		},
		{
			"heading": "composition",
			"content": "Anything a parent layout renders around its outlet is inherited by every descendant — deciding to move a nav bar from the root into the `settings` layout is a file move, not a refactor. Each layout participates in the router match, so the chain that renders a URL is always the chain the score chose — see File-Based Routing for matching rules."
		},
		{
			"heading": "layouts-and-the-url",
			"content": "Layout files contribute the URL prefix their folder owns. `settings/_layout.tsx` makes `/settings` the anchor of every route inside `settings/` — the same way `posts.$id.tsx` owns `/posts/:id`, a folder layout owns its directory:"
		},
		{
			"heading": "layouts-and-the-url",
			"content": "The file tree is the URL tree: routes and layouts read the same naming rules, and the score-based matcher resolves both. Because paths are stable this way, moving a section under a layout is an organizing change — the routes that render into it are untouched."
		},
		{
			"heading": "nested-layout-chains",
			"content": "Folders nest freely, and each level composes its own chrome. A two-level section needs two layout files, each owning its prefix:"
		},
		{
			"heading": "nested-layout-chains",
			"content": "`/account/settings/profile` renders through three layouts — root, account, account/settings — each contributing its own nav, heading, or data. Loaders across the whole chain run in parallel and deduplicate shared dependencies, so the deeper the chain, the more lookups collapse into existing cache entries rather than multiplying."
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "Layouts are the right tool when a group of routes shares behavior. Common triggers:"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "Situation"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "Layout move"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "A section reuses chrome (nav, heading, shell)"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "Folder `_layout.tsx`"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "A section requires auth or a permission"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "`beforeLoad` guard on the layout"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "Section-wide data every child renders"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "Layout loader"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "Shared error or pending UI"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "`errorComponent` / `pendingComponent` on the layout"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "Document meta for the whole section"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "`head` on the layout"
		},
		{
			"heading": "when-to-reach-for-a-layout",
			"content": "The opposite also holds: a route that shares nothing does not need a layout file. Because layouts are pages, starting without one and adding `_layout.tsx` later never changes the child route files — composition is additive."
		},
		{
			"heading": "layout-level-loaders",
			"content": "Layouts participate in data loading like any page. A layout loader runs in parallel with the loaders of every other matched route, and its results are typed into the layout's children through the same loader-data mechanism:"
		},
		{
			"heading": "layout-level-loaders",
			"content": "Loaders across all matched routes execute in parallel and are deduplicated per request — a shared dependency is fetched once even when several layouts query it. On the server this happens in-process with no network hop; on the client navigation walks the same cached entries. Seen from the client, the whole layout chain composes into a single fast navigation. See Loaders & Data for the parallel execution contract."
		},
		{
			"heading": "guards-at-the-layout-level",
			"content": "Because layouts are pages, `beforeLoad` belongs here too. Protecting an entire section becomes one declaration in the folder's `_layout.tsx` instead of a repeated check in every child page:"
		},
		{
			"heading": "guards-at-the-layout-level",
			"content": "A guard that throws stops every loader in the chain beneath it — nothing in the section runs, no data leaks, no flash of unauthorized content. This is the same guarantee pages get individually, promoted to a whole subtree. See Protecting Routes and Pages."
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "Since layouts are pages, they also take the full UI-state surface:"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "Surface"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "Layout use"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "`pendingComponent`"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "Section-wide loading skeleton while the layout's loaders run"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "`pendingMs` / `pendingMinMs`"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "Debounce and floor for that skeleton"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "`errorComponent`"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "Shared error panel for the whole section"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "`notFoundComponent`"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "Section-scoped not-found UI"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "`head`"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "Document meta applied to every child route"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "`loaderDeps`"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "Scope the layout loader to a slice of search state"
		},
		{
			"heading": "loading-error-and-meta-in-layouts",
			"content": "A section-wide loading skeleton, a shared error panel, or document meta applied to every child route is defined once in the layout instead of repeated per page. Deferred data (`stream()`) works here too — a layout can block its chrome on one value and stream a supplementary panel behind a suspense boundary."
		},
		{
			"heading": "nesting-depth",
			"content": "Layering is not limited: root, folders, nested folders, and route files can compose arbitrarily deep, and matching scores the layout chain that best fits the URL. Deep nesting stays cheap because loaders run in parallel and the router reuses the same cache across levels — on the server, shared dependencies are deduplicated per request; on the client, navigation walks the same cached entries."
		},
		{
			"heading": "nesting-depth",
			"content": "There is no artificial ceiling on depth. What keeps deep trees fast is the loader contract, not the nesting itself: every matched loader across the chain resolves in parallel, deduplicated per request, and dehydrated into the same page stream. See Loaders & Data and Hydration."
		},
		{
			"heading": "whats-next",
			"content": "File-Based Routing — the file conventions that create layouts"
		},
		{
			"heading": "whats-next",
			"content": "Pages — the `definePage` contract layouts use"
		},
		{
			"heading": "whats-next",
			"content": "Loaders & Data — parallel loading across layout chains"
		},
		{
			"heading": "whats-next",
			"content": "Data Hooks — consuming layout data on the client"
		},
		{
			"heading": "whats-next",
			"content": "Server-Side Rendering — how the layout chain renders a request"
		}
	],
	"headings": [
		{
			"id": "the-root-layout",
			"content": "The Root Layout"
		},
		{
			"id": "folder-layouts",
			"content": "Folder Layouts"
		},
		{
			"id": "composition",
			"content": "Composition"
		},
		{
			"id": "layouts-and-the-url",
			"content": "Layouts and the URL"
		},
		{
			"id": "nested-layout-chains",
			"content": "Nested Layout Chains"
		},
		{
			"id": "when-to-reach-for-a-layout",
			"content": "When to Reach for a Layout"
		},
		{
			"id": "layout-level-loaders",
			"content": "Layout-Level Loaders"
		},
		{
			"id": "guards-at-the-layout-level",
			"content": "Guards at the Layout Level"
		},
		{
			"id": "loading-error-and-meta-in-layouts",
			"content": "Loading, Error, and Meta in Layouts"
		},
		{
			"id": "nesting-depth",
			"content": "Nesting Depth"
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
		url: "#the-root-layout",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Root Layout" })
	},
	{
		depth: 2,
		url: "#folder-layouts",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Folder Layouts" })
	},
	{
		depth: 2,
		url: "#composition",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Composition" })
	},
	{
		depth: 2,
		url: "#layouts-and-the-url",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layouts and the URL" })
	},
	{
		depth: 2,
		url: "#nested-layout-chains",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Nested Layout Chains" })
	},
	{
		depth: 2,
		url: "#when-to-reach-for-a-layout",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When to Reach for a Layout" })
	},
	{
		depth: 2,
		url: "#layout-level-loaders",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Layout-Level Loaders" })
	},
	{
		depth: 2,
		url: "#guards-at-the-layout-level",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Guards at the Layout Level" })
	},
	{
		depth: 2,
		url: "#loading-error-and-meta-in-layouts",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Loading, Error, and Meta in Layouts" })
	},
	{
		depth: 2,
		url: "#nesting-depth",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Nesting Depth" })
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
			"Layouts are pages. A layout file is an ordinary ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			" whose component renders an ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "<Outlet />" }),
			" — the place where matched child routes appear. Because layouts are pages, they get everything pages get: loaders, guards, pending and error UI, head meta, and search validation. Composition falls out of the file tree rather than from a routing table."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This is the same model as the framework-owned router everywhere else: a matched URL is rendered through the chain of layouts that owns it, each level providing its own chrome and data without coupling to its children." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-root-layout",
			children: "The Root Layout"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every application has a root layout at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/__root.tsx" }),
			". It establishes the provider tree and the single outlet that the whole application renders through:"
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
			title: "the-root-layout.tsx",
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
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { definePage, Providers, Outlet } "
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
							children: " '@kwiva/react'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " definePage"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({"
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
							children: "  component"
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
							children: "    <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Providers"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " theme"
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
							children: "\"kwiva\""
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
							children: "      <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Layout"
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
							children: "        <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Outlet"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " />"
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
							children: "      </"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Layout"
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
							children: "    </"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Providers"
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
						children: "  ),"
					})
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
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Providers" }),
			" injects session state, the typed client, the data-hook cache, internationalization, and theming into context. Anything mounted here (a sidebar, a topbar, a provider tree) wraps every route in the app. The root layout is also the natural home for a root-level ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "errorComponent" }),
			", because uncaught errors bubble up to it — plus a root-level loader for app-wide data every route needs."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "folder-layouts",
			children: "Folder Layouts"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Nested layouts live in folders using a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "_layout.tsx" }),
			" file. Routes inside the folder render into that layout's outlet:"
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
			title: "folder-layouts.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/ui/pages/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ settings/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ _layout.tsx          # /settings shell — sidebar, heading, outlet" })
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
				})
			] })
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
			title: "src/ui/pages/settings/_layout.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/ui/pages/settings/_layout.tsx"
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
							children: " { definePage, Outlet } "
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
							children: " '@kwiva/react'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " definePage"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({"
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
							children: "  component"
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
							children: "    <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "SettingsShell"
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
							children: "      <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Outlet"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " />"
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
							children: "SettingsShell"
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
						children: "  ),"
					})
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
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/settings/profile" }),
			" now renders inside ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "<SettingsShell />" }),
			", which itself renders inside the root layout. Each level contributes its own chrome without coupling. The file moved the navigation from a shared component into a section — it did not restructure the router."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "composition",
			children: "Composition"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Layouts and pages collapse in a predictable way: a matched URL is rendered through the layout chain that owns it, root first, leaf last:" }),
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
			title: "composition.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "request: /settings/profile" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  └─ __root.tsx           → renders <Providers><Layout><Outlet/>" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       └─ settings/_layout.tsx  → renders <SettingsShell><Outlet/>" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "            └─ settings/profile.tsx → renders the page" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Anything a parent layout renders around its outlet is inherited by every descendant — deciding to move a nav bar from the root into the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "settings" }),
			" layout is a file move, not a refactor. Each layout participates in the router match, so the chain that renders a URL is always the chain the score chose — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/routing",
				children: "File-Based Routing"
			}),
			" for matching rules."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layouts-and-the-url",
			children: "Layouts and the URL"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Layout files contribute the URL prefix their folder owns. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "settings/_layout.tsx" }),
			" makes ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/settings" }),
			" the anchor of every route inside ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "settings/" }),
			" — the same way ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.$id.tsx" }),
			" owns ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/posts/:id" }),
			", a folder layout owns its directory:"
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
			title: "layouts-and-the-url.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/ui/pages/account/        → URL prefix /account" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ _layout.tsx               # /account shell" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ billing.tsx               # /account/billing" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "└─ invoices.tsx              # /account/invoices" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The file tree is the URL tree: routes and layouts read the same naming rules, and the score-based matcher resolves both. Because paths are stable this way, moving a section under a layout is an organizing change — the routes that render into it are untouched." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "nested-layout-chains",
			children: "Nested Layout Chains"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Folders nest freely, and each level composes its own chrome. A two-level section needs two layout files, each owning its prefix:" }),
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
			title: "nested-layout-chains.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/ui/pages/account/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ _layout.tsx              # /account shell" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ settings/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ _layout.tsx           # /account/settings shell" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ profile.tsx           # /account/settings/profile" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  └─ security.tsx          # /account/settings/security" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/account/settings/profile" }), " renders through three layouts — root, account, account/settings — each contributing its own nav, heading, or data. Loaders across the whole chain run in parallel and deduplicate shared dependencies, so the deeper the chain, the more lookups collapse into existing cache entries rather than multiplying."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-to-reach-for-a-layout",
			children: "When to Reach for a Layout"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Layouts are the right tool when a group of routes shares behavior. Common triggers:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Situation" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Layout move" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A section reuses chrome (nav, heading, shell)" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Folder ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "_layout.tsx" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A section requires auth or a permission" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }), " guard on the layout"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Section-wide data every child renders" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Layout loader" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Shared error or pending UI" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "errorComponent" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pendingComponent" }),
				" on the layout"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Document meta for the whole section" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "head" }), " on the layout"] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The opposite also holds: a route that shares nothing does not need a layout file. Because layouts are pages, starting without one and adding ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "_layout.tsx" }),
			" later never changes the child route files — composition is additive."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "layout-level-loaders",
			children: "Layout-Level Loaders"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Layouts participate in data loading like any page. A layout loader runs in parallel with the loaders of every other matched route, and its results are typed into the layout's children through the same loader-data mechanism:" }),
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
			title: "src/ui/pages/settings/_layout-2.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/ui/pages/settings/_layout.tsx"
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
							children: " definePage"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({"
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
							children: "  loader"
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
							children: "    workspaces: "
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
							children: " client.workspaces."
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
							children: "(),"
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
						children: "  }),"
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
							children: "  component"
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
							children: "    <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "SettingsShell"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " workspaces"
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
							children: "{loaderData.workspaces}>"
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
							children: "Outlet"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " />"
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
							children: "SettingsShell"
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
						children: "  ),"
					})
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
			"Loaders across all matched routes execute in parallel and are deduplicated per request — a shared dependency is fetched once even when several layouts query it. On the server this happens in-process with no network hop; on the client navigation walks the same cached entries. Seen from the client, the whole layout chain composes into a single fast navigation. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}),
			" for the parallel execution contract."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "guards-at-the-layout-level",
			children: "Guards at the Layout Level"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because layouts are pages, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
			" belongs here too. Protecting an entire section becomes one declaration in the folder's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "_layout.tsx" }),
			" instead of a repeated check in every child page:"
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
			title: "guards-at-the-layout-level.tsx",
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
							children: "beforeLoad"
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
							children: "session"
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
							children: " {"
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
							children: "  if"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "!"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "session.user) "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "throw"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " redirect"
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
							children: "'/login'"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "}"
					})
				})
			] })
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
			title: "guards-at-the-layout-level-2.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Settings section" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  └─ beforeLoad guard on settings/_layout.tsx" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       └─ children never run their loaders when the guard throws" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A guard that throws stops every loader in the chain beneath it — nothing in the section runs, no data leaks, no flash of unauthorized content. This is the same guarantee pages get individually, promoted to a whole subtree. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/protecting-routes",
				children: "Protecting Routes"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/pages",
				children: "Pages"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "loading-error-and-meta-in-layouts",
			children: "Loading, Error, and Meta in Layouts"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Since layouts are pages, they also take the full UI-state surface:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Layout use" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pendingComponent" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Section-wide loading skeleton while the layout's loaders run" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pendingMs" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pendingMinMs" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Debounce and floor for that skeleton" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "errorComponent" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Shared error panel for the whole section" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "notFoundComponent" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Section-scoped not-found UI" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "head" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Document meta applied to every child route" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "loaderDeps" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scope the layout loader to a slice of search state" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A section-wide loading skeleton, a shared error panel, or document meta applied to every child route is defined once in the layout instead of repeated per page. Deferred data (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stream()" }),
			") works here too — a layout can block its chrome on one value and stream a supplementary panel behind a suspense boundary."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "nesting-depth",
			children: "Nesting Depth"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Layering is not limited: root, folders, nested folders, and route files can compose arbitrarily deep, and matching scores the layout chain that best fits the URL. Deep nesting stays cheap because loaders run in parallel and the router reuses the same cache across levels — on the server, shared dependencies are deduplicated per request; on the client, navigation walks the same cached entries." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"There is no artificial ceiling on depth. What keeps deep trees fast is the loader contract, not the nesting itself: every matched loader across the chain resolves in parallel, deduplicated per request, and dehydrated into the same page stream. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
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
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/routing",
				children: "File-Based Routing"
			}), " — the file conventions that create layouts"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/frontend/pages",
					children: "Pages"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
				" contract layouts use"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}), " — parallel loading across layout chains"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data Hooks"
			}), " — consuming layout data on the client"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/ssr",
				children: "Server-Side Rendering"
			}), " — how the layout chain renders a request"] }),
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
