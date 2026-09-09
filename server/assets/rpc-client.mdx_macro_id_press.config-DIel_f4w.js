import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/frontend/rpc-client.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "RPC Client",
	"description": "createClient — typed model and controller calls, SSR-safe dedupe, subscriptions, and testing."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nThe RPC client is how the frontend talks to the API — with zero codegen. Types flow from `defineController` and `defineModel` at the type level, so every call, every body, and every error is checked against the actual route manifest of this application. The client works identically on the server and in the browser, and it is the only transport the data hooks use.\n\nBecause the client derives its surface from the same route manifest the API derives its routes from, a controller change is instantly visible to every consumer — there is no generated client to regenerate and no version to drift.\n\n## The Scoped Client [#the-scoped-client]\n\nApplications scaffold a single client from `@kwiva/client`:\n\n```ts title=\"src/client.ts\"\n// src/client.ts — types derive from THIS app's controllers and models\nimport { createClient } from '@kwiva/client'\nexport const client = createClient()\n```\n\n`createClient()` is ambiently typed against the app's route manifest. There is no configuration file enumerating endpoints — the client is the manifest, as types. The route manifest itself is produced by [Auto-Discovery](/docs/core-concepts/auto-discovery): every `defineModel` and `defineController` contributes its routes, and the client sees exactly that set.\n\n## Model API [#model-api]\n\nEvery model's five generated routes are available as typed methods:\n\n```ts title=\"model-api.ts\"\nconst { data, total } = await client.users.list({ where: { role: 'admin' }, page: 1 })\nconst ada = await client.users.get('usr_01...')\nconst updated = await client.users.update('usr_01...', { name: 'Ada L.' })\nawait client.users.delete('usr_01...')\n```\n\n| Call                            | Endpoint                   |\n| ------------------------------- | -------------------------- |\n| `client.users.list(query)`      | list — filtered, paginated |\n| `client.users.get(id)`          | single record              |\n| `client.users.create(body)`     | create                     |\n| `client.users.update(id, body)` | update                     |\n| `client.users.delete(id)`       | delete                     |\n\nEach method's arguments are typed from the model IR — `where` values are checked against the model's fields, `body` against field types and validation. See [Generated Endpoints](/docs/api/generated-endpoints) for the five-route shape and [Models](/docs/data/models) for the IR they are derived from.\n\n## Custom Actions [#custom-actions]\n\nController actions attach to the same client surface:\n\n```ts title=\"custom-actions.ts\"\nawait client.posts.publish('pst_01...')\n```\n\nHandlers declared on `defineController` become methods on the matching namespace, typed from the handler's schemas and return shape. Anything the API exposes, the client already knows — resource routes and custom actions present under the same namespace, with no distinction in how they are called. See [RPC & Integration](/docs/api/rpc) and [Controllers](/docs/http/controllers).\n\n## Namespaces [#namespaces]\n\nThe client surface mirrors the route manifest exactly. Model routes and controller routes each get a namespace:\n\n| Manifest source                  | Client namespace | Example                             |\n| -------------------------------- | ---------------- | ----------------------------------- |\n| `defineModel('users', ...)`      | `client.users`   | `client.users.list({ page: 1 })`    |\n| `defineController('posts', ...)` | `client.posts`   | `client.posts.publish('pst_01...')` |\n| Realtime channel handlers        | Async iterable   | `client.chat.stream({ roomId })`    |\n\nA namespace appears because the manifest produced it — there is no hand-registration. Remind every call: the method, the arguments, and the return type are all derived, never declared twice.\n\n## Typed Errors [#typed-errors]\n\nCalls resolve into discriminated unions on failure — shape and status are part of the type system:\n\n```ts title=\"typed-errors.ts\"\nconst { error, data } = await client.users.get(id)\n\nif (error) {\n  // { code: 'NOT_FOUND' } or { code: 'VALIDATION', issues }\n}\n```\n\nErrors carry `code` and `message`, with structured `issues` on validation failures — mapped by the framework's error taxonomy. Because the union is discriminated on `code`, narrowing is exhaustive: every failure branch is checked against the codes the API can actually emit. See [Errors](/docs/api/errors) for the server side of the contract and [Error Handling](/docs/core-concepts/error-handling) for the taxonomy.\n\n## SSR-Safe Calls [#ssr-safe-calls]\n\nOn the server, client calls run **in process** — no network hop — and are deduplicated per request. Two loaders calling the same endpoint share one execution. Results dehydrate into the page stream and rehydrate into the data-hook cache; a navigation that renders the same data reads what the request already produced.\n\n```plaintext title=\"ssr-safe-calls.txt\"\nserver: client.posts.list()      → in-process, deduped per request\nclient: hydrated into hooks      → no refetch of loader data\n```\n\nServer-side calls carry the current request's session, tenant, and config, so controllers see the same `ctx.session` they would from an HTTP client — the in-process call is not a shortcut that skips context. See [Request Lifecycle](/docs/http/lifecycle) for what a call traverses.\n\nThe deduplication contract is per request: two loaders calling the same endpoint share one execution, so a page whose layout and content both read the same workspace performs one query, not two. On the client the same dedupe happens through the shared data-hook cache — a loader's result and a hook's read of the same model land on the same entry. See [Loaders & Data](/docs/frontend/loaders).\n\n## Type Flow, No Codegen [#type-flow-no-codegen]\n\nThe client is ambiently typed from `src/.kwiva/types` — generated once from the route manifest and model IR. Nothing is emitted at build or runtime; the typed surface exists as TypeScript types only:\n\n```plaintext title=\"type-flow-no-codegen.txt\"\ndefineModel / defineController → route manifest → @kwiva/client ambient types\n                            └→ client.users.list(...) type-checks against the manifest\n```\n\nThat is why the client and the API cannot drift. The route manifest is one artifact; both the server routes and the client surface derive from it. Changing a controller schema updates the client's method signature in the same commit it updates the handler, with no regeneration step.\n\n## Session-Aware [#session-aware]\n\nSession cookies flow automatically, and the CSRF token is handled by the provider. In the browser the client carries credentials per the session; on the server the current request's session and tenant context are attached — controllers see the same `ctx.session` they would from an HTTP client. There is no per-call auth configuration: the client inherits the request's identity in both contexts.\n\n## Subscriptions [#subscriptions]\n\nThe client subscribes to realtime channels as an async iterable of typed events:\n\n```ts title=\"subscriptions.ts\"\nconst stream = client.chat.stream({ roomId })\nfor await (const event of stream) { ... }\n```\n\nChannel subscriptions are policy-checked on subscribe, and fall back to server-sent events when a bidirectional connection is unavailable. Events are typed from the channel's message schema, so a consumer pattern-matches against the exact shapes the channel declares. See [Channels](/docs/realtime/channels) and [Real-Time Data on the Client](/docs/realtime/client-usage).\n\n## Streaming Responses [#streaming-responses]\n\nFor long-running actions — large exports, generated reports — the typed client passes the response through unchanged, so streams and event sources work identically whether called in-process or over the network. Consume them with the standard reader interface, or with the async-iterable subscription surface for channels. See [Streaming & SSE](/docs/http/streaming).\n\n## Testing [#testing]\n\nThe same client surface operates against an in-process app harness:\n\n```ts title=\"testing.ts\"\nimport { createTestClient } from '@kwiva/client'\nimport { app } from '../bootstrap/app'\n\nconst testClient = createTestClient(app)\nconst { data } = await testClient.users.list({ page: 1 })   // no network\n```\n\n`createTestClient(app)` boots the real app's routing, validation, and policies in process — tests exercise the same code path a browser would, without a running server. Because the client is the manifest, a test file types itself: the test client derives from the same route manifest as the production client. See [Testing](/docs/testing) for the full harness.\n\n## Conventions [#conventions]\n\n* Loaders and hooks use the typed client — never raw `fetch` (enforced by lint gates)\n* One `createClient()` per app, ambiently typed from the route manifest\n* Calls are session-aware and SSR-safe by default; no per-call configuration\n* No codegen — types flow from the manifest at type level\n\n## What's Next [#whats-next]\n\n* [Data Hooks](/docs/frontend/data-hooks) — the client behind `useResource`, `useList`, and `useMutation`\n* [RPC & Integration](/docs/api/rpc) — the API surface the client is typed from\n* [Error Handling](/docs/api/errors) — the typed error contract\n* [Generated Endpoints](/docs/api/generated-endpoints) — the five routes per model\n* [Channels](/docs/realtime/channels) — subscribing client-side\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The RPC client is how the frontend talks to the API — with zero codegen. Types flow from `defineController` and `defineModel` at the type level, so every call, every body, and every error is checked against the actual route manifest of this application. The client works identically on the server and in the browser, and it is the only transport the data hooks use."
		},
		{
			"heading": void 0,
			"content": "Because the client derives its surface from the same route manifest the API derives its routes from, a controller change is instantly visible to every consumer — there is no generated client to regenerate and no version to drift."
		},
		{
			"heading": "the-scoped-client",
			"content": "Applications scaffold a single client from `@kwiva/client`:"
		},
		{
			"heading": "the-scoped-client",
			"content": "`createClient()` is ambiently typed against the app's route manifest. There is no configuration file enumerating endpoints — the client is the manifest, as types. The route manifest itself is produced by Auto-Discovery: every `defineModel` and `defineController` contributes its routes, and the client sees exactly that set."
		},
		{
			"heading": "model-api",
			"content": "Every model's five generated routes are available as typed methods:"
		},
		{
			"heading": "model-api",
			"content": "Call"
		},
		{
			"heading": "model-api",
			"content": "Endpoint"
		},
		{
			"heading": "model-api",
			"content": "`client.users.list(query)`"
		},
		{
			"heading": "model-api",
			"content": "list — filtered, paginated"
		},
		{
			"heading": "model-api",
			"content": "`client.users.get(id)`"
		},
		{
			"heading": "model-api",
			"content": "single record"
		},
		{
			"heading": "model-api",
			"content": "`client.users.create(body)`"
		},
		{
			"heading": "model-api",
			"content": "create"
		},
		{
			"heading": "model-api",
			"content": "`client.users.update(id, body)`"
		},
		{
			"heading": "model-api",
			"content": "update"
		},
		{
			"heading": "model-api",
			"content": "`client.users.delete(id)`"
		},
		{
			"heading": "model-api",
			"content": "delete"
		},
		{
			"heading": "model-api",
			"content": "Each method's arguments are typed from the model IR — `where` values are checked against the model's fields, `body` against field types and validation. See Generated Endpoints for the five-route shape and Models for the IR they are derived from."
		},
		{
			"heading": "custom-actions",
			"content": "Controller actions attach to the same client surface:"
		},
		{
			"heading": "custom-actions",
			"content": "Handlers declared on `defineController` become methods on the matching namespace, typed from the handler's schemas and return shape. Anything the API exposes, the client already knows — resource routes and custom actions present under the same namespace, with no distinction in how they are called. See RPC & Integration and Controllers."
		},
		{
			"heading": "namespaces",
			"content": "The client surface mirrors the route manifest exactly. Model routes and controller routes each get a namespace:"
		},
		{
			"heading": "namespaces",
			"content": "Manifest source"
		},
		{
			"heading": "namespaces",
			"content": "Client namespace"
		},
		{
			"heading": "namespaces",
			"content": "Example"
		},
		{
			"heading": "namespaces",
			"content": "`defineModel('users', ...)`"
		},
		{
			"heading": "namespaces",
			"content": "`client.users`"
		},
		{
			"heading": "namespaces",
			"content": "`client.users.list({ page: 1 })`"
		},
		{
			"heading": "namespaces",
			"content": "`defineController('posts', ...)`"
		},
		{
			"heading": "namespaces",
			"content": "`client.posts`"
		},
		{
			"heading": "namespaces",
			"content": "`client.posts.publish('pst_01...')`"
		},
		{
			"heading": "namespaces",
			"content": "Realtime channel handlers"
		},
		{
			"heading": "namespaces",
			"content": "Async iterable"
		},
		{
			"heading": "namespaces",
			"content": "`client.chat.stream({ roomId })`"
		},
		{
			"heading": "namespaces",
			"content": "A namespace appears because the manifest produced it — there is no hand-registration. Remind every call: the method, the arguments, and the return type are all derived, never declared twice."
		},
		{
			"heading": "typed-errors",
			"content": "Calls resolve into discriminated unions on failure — shape and status are part of the type system:"
		},
		{
			"heading": "typed-errors",
			"content": "Errors carry `code` and `message`, with structured `issues` on validation failures — mapped by the framework's error taxonomy. Because the union is discriminated on `code`, narrowing is exhaustive: every failure branch is checked against the codes the API can actually emit. See Errors for the server side of the contract and Error Handling for the taxonomy."
		},
		{
			"heading": "ssr-safe-calls",
			"content": "On the server, client calls run **in process** — no network hop — and are deduplicated per request. Two loaders calling the same endpoint share one execution. Results dehydrate into the page stream and rehydrate into the data-hook cache; a navigation that renders the same data reads what the request already produced."
		},
		{
			"heading": "ssr-safe-calls",
			"content": "Server-side calls carry the current request's session, tenant, and config, so controllers see the same `ctx.session` they would from an HTTP client — the in-process call is not a shortcut that skips context. See Request Lifecycle for what a call traverses."
		},
		{
			"heading": "ssr-safe-calls",
			"content": "The deduplication contract is per request: two loaders calling the same endpoint share one execution, so a page whose layout and content both read the same workspace performs one query, not two. On the client the same dedupe happens through the shared data-hook cache — a loader's result and a hook's read of the same model land on the same entry. See Loaders & Data."
		},
		{
			"heading": "type-flow-no-codegen",
			"content": "The client is ambiently typed from `src/.kwiva/types` — generated once from the route manifest and model IR. Nothing is emitted at build or runtime; the typed surface exists as TypeScript types only:"
		},
		{
			"heading": "type-flow-no-codegen",
			"content": "That is why the client and the API cannot drift. The route manifest is one artifact; both the server routes and the client surface derive from it. Changing a controller schema updates the client's method signature in the same commit it updates the handler, with no regeneration step."
		},
		{
			"heading": "session-aware",
			"content": "Session cookies flow automatically, and the CSRF token is handled by the provider. In the browser the client carries credentials per the session; on the server the current request's session and tenant context are attached — controllers see the same `ctx.session` they would from an HTTP client. There is no per-call auth configuration: the client inherits the request's identity in both contexts."
		},
		{
			"heading": "subscriptions",
			"content": "The client subscribes to realtime channels as an async iterable of typed events:"
		},
		{
			"heading": "subscriptions",
			"content": "Channel subscriptions are policy-checked on subscribe, and fall back to server-sent events when a bidirectional connection is unavailable. Events are typed from the channel's message schema, so a consumer pattern-matches against the exact shapes the channel declares. See Channels and Real-Time Data on the Client."
		},
		{
			"heading": "streaming-responses",
			"content": "For long-running actions — large exports, generated reports — the typed client passes the response through unchanged, so streams and event sources work identically whether called in-process or over the network. Consume them with the standard reader interface, or with the async-iterable subscription surface for channels. See Streaming & SSE."
		},
		{
			"heading": "testing",
			"content": "The same client surface operates against an in-process app harness:"
		},
		{
			"heading": "testing",
			"content": "`createTestClient(app)` boots the real app's routing, validation, and policies in process — tests exercise the same code path a browser would, without a running server. Because the client is the manifest, a test file types itself: the test client derives from the same route manifest as the production client. See Testing for the full harness."
		},
		{
			"heading": "conventions",
			"content": "Loaders and hooks use the typed client — never raw `fetch` (enforced by lint gates)"
		},
		{
			"heading": "conventions",
			"content": "One `createClient()` per app, ambiently typed from the route manifest"
		},
		{
			"heading": "conventions",
			"content": "Calls are session-aware and SSR-safe by default; no per-call configuration"
		},
		{
			"heading": "conventions",
			"content": "No codegen — types flow from the manifest at type level"
		},
		{
			"heading": "whats-next",
			"content": "Data Hooks — the client behind `useResource`, `useList`, and `useMutation`"
		},
		{
			"heading": "whats-next",
			"content": "RPC & Integration — the API surface the client is typed from"
		},
		{
			"heading": "whats-next",
			"content": "Error Handling — the typed error contract"
		},
		{
			"heading": "whats-next",
			"content": "Generated Endpoints — the five routes per model"
		},
		{
			"heading": "whats-next",
			"content": "Channels — subscribing client-side"
		}
	],
	"headings": [
		{
			"id": "the-scoped-client",
			"content": "The Scoped Client"
		},
		{
			"id": "model-api",
			"content": "Model API"
		},
		{
			"id": "custom-actions",
			"content": "Custom Actions"
		},
		{
			"id": "namespaces",
			"content": "Namespaces"
		},
		{
			"id": "typed-errors",
			"content": "Typed Errors"
		},
		{
			"id": "ssr-safe-calls",
			"content": "SSR-Safe Calls"
		},
		{
			"id": "type-flow-no-codegen",
			"content": "Type Flow, No Codegen"
		},
		{
			"id": "session-aware",
			"content": "Session-Aware"
		},
		{
			"id": "subscriptions",
			"content": "Subscriptions"
		},
		{
			"id": "streaming-responses",
			"content": "Streaming Responses"
		},
		{
			"id": "testing",
			"content": "Testing"
		},
		{
			"id": "conventions",
			"content": "Conventions"
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
		url: "#the-scoped-client",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Scoped Client" })
	},
	{
		depth: 2,
		url: "#model-api",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Model API" })
	},
	{
		depth: 2,
		url: "#custom-actions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Custom Actions" })
	},
	{
		depth: 2,
		url: "#namespaces",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Namespaces" })
	},
	{
		depth: 2,
		url: "#typed-errors",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Typed Errors" })
	},
	{
		depth: 2,
		url: "#ssr-safe-calls",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "SSR-Safe Calls" })
	},
	{
		depth: 2,
		url: "#type-flow-no-codegen",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Type Flow, No Codegen" })
	},
	{
		depth: 2,
		url: "#session-aware",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Session-Aware" })
	},
	{
		depth: 2,
		url: "#subscriptions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Subscriptions" })
	},
	{
		depth: 2,
		url: "#streaming-responses",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Streaming Responses" })
	},
	{
		depth: 2,
		url: "#testing",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Testing" })
	},
	{
		depth: 2,
		url: "#conventions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Conventions" })
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
			"The RPC client is how the frontend talks to the API — with zero codegen. Types flow from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" at the type level, so every call, every body, and every error is checked against the actual route manifest of this application. The client works identically on the server and in the browser, and it is the only transport the data hooks use."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the client derives its surface from the same route manifest the API derives its routes from, a controller change is instantly visible to every consumer — there is no generated client to regenerate and no version to drift." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-scoped-client",
			children: "The Scoped Client"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Applications scaffold a single client from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/client" }),
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
			title: "src/client.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/client.ts — types derive from THIS app's controllers and models"
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
							children: " { createClient } "
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
							children: " '@kwiva/client'"
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
							children: "export"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " client"
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
							children: " createClient"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createClient()" }),
			" is ambiently typed against the app's route manifest. There is no configuration file enumerating endpoints — the client is the manifest, as types. The route manifest itself is produced by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/auto-discovery",
				children: "Auto-Discovery"
			}),
			": every ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
			" contributes its routes, and the client sees exactly that set."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "model-api",
			children: "Model API"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every model's five generated routes are available as typed methods:" }),
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
			title: "model-api.ts",
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
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "total"
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
							children: " client.users."
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
							children: "({ where: { role: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'admin'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }, page: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "1"
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " ada"
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
							children: " client.users."
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
							children: "'usr_01...'"
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
							children: " updated"
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
							children: " client.users."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "update"
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
							children: "'usr_01...'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { name: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Ada L.'"
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
							children: " client.users."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "delete"
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
							children: "'usr_01...'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Call" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Endpoint" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.users.list(query)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "list — filtered, paginated" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.users.get(id)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "single record" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.users.create(body)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "create" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.users.update(id, body)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "update" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.users.delete(id)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "delete" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each method's arguments are typed from the model IR — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
			" values are checked against the model's fields, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "body" }),
			" against field types and validation. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "Generated Endpoints"
			}),
			" for the five-route shape and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}),
			" for the IR they are derived from."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "custom-actions",
			children: "Custom Actions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Controller actions attach to the same client surface:" }),
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
			title: "custom-actions.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
						children: " client.posts."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "publish"
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
						children: "'pst_01...'"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ")"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Handlers declared on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
			" become methods on the matching namespace, typed from the handler's schemas and return shape. Anything the API exposes, the client already knows — resource routes and custom actions present under the same namespace, with no distinction in how they are called. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rpc",
				children: "RPC & Integration"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/controllers",
				children: "Controllers"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "namespaces",
			children: "Namespaces"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The client surface mirrors the route manifest exactly. Model routes and controller routes each get a namespace:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Manifest source" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Client namespace" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel('users', ...)" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.users" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.users.list({ page: 1 })" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController('posts', ...)" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.publish('pst_01...')" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Realtime channel handlers" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Async iterable" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.chat.stream({ roomId })" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A namespace appears because the manifest produced it — there is no hand-registration. Remind every call: the method, the arguments, and the return type are all derived, never declared twice." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "typed-errors",
			children: "Typed Errors"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Calls resolve into discriminated unions on failure — shape and status are part of the type system:" }),
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
			title: "typed-errors.ts",
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
							children: "error"
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
							children: " client.users."
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
							children: "(id)"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "if"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " (error) {"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // { code: 'NOT_FOUND' } or { code: 'VALIDATION', issues }"
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
						children: "}"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Errors carry ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "code" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "message" }),
			", with structured ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "issues" }),
			" on validation failures — mapped by the framework's error taxonomy. Because the union is discriminated on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "code" }),
			", narrowing is exhaustive: every failure branch is checked against the codes the API can actually emit. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/errors",
				children: "Errors"
			}),
			" for the server side of the contract and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/error-handling",
				children: "Error Handling"
			}),
			" for the taxonomy."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "ssr-safe-calls",
			children: "SSR-Safe Calls"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"On the server, client calls run ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "in process" }),
			" — no network hop — and are deduplicated per request. Two loaders calling the same endpoint share one execution. Results dehydrate into the page stream and rehydrate into the data-hook cache; a navigation that renders the same data reads what the request already produced."
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
			title: "ssr-safe-calls.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "server: client.posts.list()      → in-process, deduped per request" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "client: hydrated into hooks      → no refetch of loader data" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Server-side calls carry the current request's session, tenant, and config, so controllers see the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" they would from an HTTP client — the in-process call is not a shortcut that skips context. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Request Lifecycle"
			}),
			" for what a call traverses."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The deduplication contract is per request: two loaders calling the same endpoint share one execution, so a page whose layout and content both read the same workspace performs one query, not two. On the client the same dedupe happens through the shared data-hook cache — a loader's result and a hook's read of the same model land on the same entry. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/loaders",
				children: "Loaders & Data"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "type-flow-no-codegen",
			children: "Type Flow, No Codegen"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The client is ambiently typed from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/types" }),
			" — generated once from the route manifest and model IR. Nothing is emitted at build or runtime; the typed surface exists as TypeScript types only:"
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
			title: "type-flow-no-codegen.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineModel / defineController → route manifest → @kwiva/client ambient types" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "                            └→ client.users.list(...) type-checks against the manifest" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "That is why the client and the API cannot drift. The route manifest is one artifact; both the server routes and the client surface derive from it. Changing a controller schema updates the client's method signature in the same commit it updates the handler, with no regeneration step." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "session-aware",
			children: "Session-Aware"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Session cookies flow automatically, and the CSRF token is handled by the provider. In the browser the client carries credentials per the session; on the server the current request's session and tenant context are attached — controllers see the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" they would from an HTTP client. There is no per-call auth configuration: the client inherits the request's identity in both contexts."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "subscriptions",
			children: "Subscriptions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The client subscribes to realtime channels as an async iterable of typed events:" }),
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
			title: "subscriptions.ts",
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " stream"
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
							children: " client.chat."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "stream"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ roomId })"
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
							children: "for"
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
							children: " ("
						}),
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
							children: " event"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " of"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " stream) { "
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
							children: " }"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Channel subscriptions are policy-checked on subscribe, and fall back to server-sent events when a bidirectional connection is unavailable. Events are typed from the channel's message schema, so a consumer pattern-matches against the exact shapes the channel declares. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/channels",
				children: "Channels"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/client-usage",
				children: "Real-Time Data on the Client"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "streaming-responses",
			children: "Streaming Responses"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For long-running actions — large exports, generated reports — the typed client passes the response through unchanged, so streams and event sources work identically whether called in-process or over the network. Consume them with the standard reader interface, or with the async-iterable subscription surface for channels. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/streaming",
				children: "Streaming & SSE"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "testing",
			children: "Testing"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The same client surface operates against an in-process app harness:" }),
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
			title: "testing.ts",
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
							children: " { createTestClient } "
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
							children: " '@kwiva/client'"
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
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { app } "
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
							children: " '../bootstrap/app'"
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
							children: " testClient"
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
							children: " createTestClient"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(app)"
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
							children: " testClient.users."
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
							children: "({ page: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "1"
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
							children: "// no network"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createTestClient(app)" }),
			" boots the real app's routing, validation, and policies in process — tests exercise the same code path a browser would, without a running server. Because the client is the manifest, a test file types itself: the test client derives from the same route manifest as the production client. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing",
				children: "Testing"
			}),
			" for the full harness."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "conventions",
			children: "Conventions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Loaders and hooks use the typed client — never raw ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fetch" }),
				" (enforced by lint gates)"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"One ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createClient()" }),
				" per app, ambiently typed from the route manifest"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Calls are session-aware and SSR-safe by default; no per-call configuration" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "No codegen — types flow from the manifest at type level" }),
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
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/frontend/data-hooks",
					children: "Data Hooks"
				}),
				" — the client behind ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useResource" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useList" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useMutation" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rpc",
				children: "RPC & Integration"
			}), " — the API surface the client is typed from"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/errors",
				children: "Error Handling"
			}), " — the typed error contract"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "Generated Endpoints"
			}), " — the five routes per model"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/channels",
				children: "Channels"
			}), " — subscribing client-side"] }),
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
