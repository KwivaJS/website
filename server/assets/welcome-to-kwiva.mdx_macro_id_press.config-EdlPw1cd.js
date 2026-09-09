import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/blog/welcome-to-kwiva.mdx?macro_id=press.config.tsx%23blog
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Welcome to Kwiva",
	"description": "Kwiva v0.3 is here — the batteries-included TypeScript framework that replaces the stitched-together stack.",
	"tags": ["announcement", "framework"]
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva is the batteries-included TypeScript framework that replaces the stitched-together stack. Instead of assembling a dozen libraries — a router, a data layer, auth, a build tool, a client, an admin UI — your application talks to one coherent framework: a framework-owned `@kwiva/*` API surface, a single configuration model, one CLI, and a Rust-speed toolchain for instant feedback.\n\nToday we're opening up the documentation for **v0.3**, the first full picture of the framework's surface.\n\n## What Kwiva ships [#what-kwiva-ships]\n\n* **Models as the single source of truth.** One `defineModel` declaration derives your database schema, migrations, seeders, REST API, typed RPC client, admin UI, OpenAPI spec, and MCP tools. No drift, no duplicate schemas.\n* **An owned HTTP layer.** Controllers, middleware, guards, validation, and a full request lifecycle — with types flowing end to end.\n* **A typed file-based frontend.** `definePage` with loaders, streaming SSR, deferred data, hydration, and data hooks over a shared client cache.\n* **Platform primitives built in.** Auth, authorization policies, tenancy, background jobs, scheduled tasks, events, realtime channels, and a generated Studio.\n* **Deploy anywhere, zero lock-in.** One codebase builds for servers, edge functions, serverless providers, static output, and single-binary artifacts — the target is a build-time choice.\n\n## The one-grammar idea [#the-one-grammar-idea]\n\nEvery app-facing construct is a `defineX` factory. Models, controllers, pages, jobs, events, tasks, policies — they all follow the same shape. Learn one, and you've learned them all. It's the reason a Kwiva codebase reads like a product description instead of a wiring diagram.\n\n## Where to start [#where-to-start]\n\n* **[Get Started](/docs/getting-started)** — install Kwiva and create your first project\n* **[The defineX Convention](/docs/core-concepts/definex)** — the grammar behind everything\n* **[Architecture](/architecture)** — the layered design in detail\n* **[API Reference](/api)** — every package, signature, and example\n\nThe documentation will keep growing. If something's missing or confusing, the framework's GitHub issues are the fastest way to tell us.\n\nWelcome to Kwiva.\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva is the batteries-included TypeScript framework that replaces the stitched-together stack. Instead of assembling a dozen libraries — a router, a data layer, auth, a build tool, a client, an admin UI — your application talks to one coherent framework: a framework-owned `@kwiva/*` API surface, a single configuration model, one CLI, and a Rust-speed toolchain for instant feedback."
		},
		{
			"heading": void 0,
			"content": "Today we're opening up the documentation for **v0.3**, the first full picture of the framework's surface."
		},
		{
			"heading": "what-kwiva-ships",
			"content": "**Models as the single source of truth.** One `defineModel` declaration derives your database schema, migrations, seeders, REST API, typed RPC client, admin UI, OpenAPI spec, and MCP tools. No drift, no duplicate schemas."
		},
		{
			"heading": "what-kwiva-ships",
			"content": "**An owned HTTP layer.** Controllers, middleware, guards, validation, and a full request lifecycle — with types flowing end to end."
		},
		{
			"heading": "what-kwiva-ships",
			"content": "**A typed file-based frontend.** `definePage` with loaders, streaming SSR, deferred data, hydration, and data hooks over a shared client cache."
		},
		{
			"heading": "what-kwiva-ships",
			"content": "**Platform primitives built in.** Auth, authorization policies, tenancy, background jobs, scheduled tasks, events, realtime channels, and a generated Studio."
		},
		{
			"heading": "what-kwiva-ships",
			"content": "**Deploy anywhere, zero lock-in.** One codebase builds for servers, edge functions, serverless providers, static output, and single-binary artifacts — the target is a build-time choice."
		},
		{
			"heading": "the-one-grammar-idea",
			"content": "Every app-facing construct is a `defineX` factory. Models, controllers, pages, jobs, events, tasks, policies — they all follow the same shape. Learn one, and you've learned them all. It's the reason a Kwiva codebase reads like a product description instead of a wiring diagram."
		},
		{
			"heading": "where-to-start",
			"content": "**Get Started** — install Kwiva and create your first project"
		},
		{
			"heading": "where-to-start",
			"content": "**The defineX Convention** — the grammar behind everything"
		},
		{
			"heading": "where-to-start",
			"content": "**Architecture** — the layered design in detail"
		},
		{
			"heading": "where-to-start",
			"content": "**API Reference** — every package, signature, and example"
		},
		{
			"heading": "where-to-start",
			"content": "The documentation will keep growing. If something's missing or confusing, the framework's GitHub issues are the fastest way to tell us."
		},
		{
			"heading": "where-to-start",
			"content": "Welcome to Kwiva."
		}
	],
	"headings": [
		{
			"id": "what-kwiva-ships",
			"content": "What Kwiva ships"
		},
		{
			"id": "the-one-grammar-idea",
			"content": "The one-grammar idea"
		},
		{
			"id": "where-to-start",
			"content": "Where to start"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#what-kwiva-ships",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Kwiva ships" })
	},
	{
		depth: 2,
		url: "#the-one-grammar-idea",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The one-grammar idea" })
	},
	{
		depth: 2,
		url: "#where-to-start",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where to start" })
	}
];
function _createMdxContent(props) {
	const _components = {
		a: "a",
		code: "code",
		h2: "h2",
		li: "li",
		p: "p",
		strong: "strong",
		ul: "ul",
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva is the batteries-included TypeScript framework that replaces the stitched-together stack. Instead of assembling a dozen libraries — a router, a data layer, auth, a build tool, a client, an admin UI — your application talks to one coherent framework: a framework-owned ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
			" API surface, a single configuration model, one CLI, and a Rust-speed toolchain for instant feedback."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Today we're opening up the documentation for ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "v0.3" }),
			", the first full picture of the framework's surface."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-kwiva-ships",
			children: "What Kwiva ships"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Models as the single source of truth." }),
				" One ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				" declaration derives your database schema, migrations, seeders, REST API, typed RPC client, admin UI, OpenAPI spec, and MCP tools. No drift, no duplicate schemas."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "An owned HTTP layer." }), " Controllers, middleware, guards, validation, and a full request lifecycle — with types flowing end to end."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "A typed file-based frontend." }),
				" ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
				" with loaders, streaming SSR, deferred data, hydration, and data hooks over a shared client cache."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Platform primitives built in." }), " Auth, authorization policies, tenancy, background jobs, scheduled tasks, events, realtime channels, and a generated Studio."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Deploy anywhere, zero lock-in." }), " One codebase builds for servers, edge functions, serverless providers, static output, and single-binary artifacts — the target is a build-time choice."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-one-grammar-idea",
			children: "The one-grammar idea"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every app-facing construct is a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factory. Models, controllers, pages, jobs, events, tasks, policies — they all follow the same shape. Learn one, and you've learned them all. It's the reason a Kwiva codebase reads like a product description instead of a wiring diagram."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-to-start",
			children: "Where to start"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started",
				children: "Get Started"
			}) }), " — install Kwiva and create your first project"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}) }), " — the grammar behind everything"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture",
				children: "Architecture"
			}) }), " — the layered design in detail"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/api",
				children: "API Reference"
			}) }), " — every package, signature, and example"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The documentation will keep growing. If something's missing or confusing, the framework's GitHub issues are the fastest way to tell us." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Welcome to Kwiva." })
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
