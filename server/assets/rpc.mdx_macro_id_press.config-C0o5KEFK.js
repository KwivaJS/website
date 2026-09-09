import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/api/rpc.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Typed RPC",
	"description": "Typed end-to-end RPC — the entire API as type-checked calls, zero codegen."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nKwiva's typed RPC client exposes the entire API as type-checked method calls. `client.posts.get(id)` knows the exact argument and response types of `GET /api/posts/:id`, because those types come from the controller and model definitions — not from a separately maintained SDK.\n\nCalling the API is indistinguishable from calling code. Args are validated against schemas at compile time, results arrive typed, and errors are discriminated. If the route is wrong, the call does not compile.\n\n## Zero Codegen, One Type Universe [#zero-codegen-one-type-universe]\n\nThe client infers everything at the type level. The framework derives ambient types from your definitions into `src/.kwiva/types`, and `createClient()` picks them up. No code generation step runs, nothing is committed to the repo, and there is nothing to regenerate when the API changes.\n\n```plaintext title=\"zero-codegen-one-type-universe.txt\"\ndefineModel ──► defineController ──► route manifest ──► @kwiva/client types\n```\n\n### The contract in the editor [#the-contract-in-the-editor]\n\nBecause the contract lives at the type level, the editor knows the full surface of your API the moment `createClient()` runs. Valid methods and their arguments are surfaced as you type, and a misspelled field is a compile error rather than a runtime surprise. This is the same guarantee the rest of the framework relies on: types flow from definition to call site with no intermediate artifact to keep fresh.\n\n## Reading [#reading]\n\n```ts title=\"reading.ts\"\nimport { createClient } from '@kwiva/client'\n\nexport const client = createClient()\n\nconst { data } = await client.posts.list({ page: 2 })              // GET /api/posts\nconst post = await client.posts.get('pst_123')                     // GET /api/posts/pst_123\nconst users = await client.users.list({ where: { role: 'admin' }, page: 1 })\n```\n\n`where`, `page`, `limit`, and friends are validated against the model — typo a field name and the call fails to compile.\n\n## Mutating [#mutating]\n\n```ts title=\"mutating.ts\"\nconst created = await client.posts.create({ title: 'Hello' })       // POST /api/posts\nconst updated = await client.posts.update(id, { title: 'New title' }) // PATCH /api/posts/:id\nawait client.posts.remove(id)                                       // DELETE /api/posts/:id\n```\n\nWrite operations mirror the REST contract: `create` sends a validated body, `update` patches, `remove` deletes. Each method name maps one-to-one to the generated route it calls.\n\n## Custom Actions [#custom-actions]\n\nController actions appear on the same client object as first-class methods:\n\n```ts title=\"custom-actions.ts\"\nawait client.posts.publish('pst_123')     // POST /api/posts/pst_123/publish\n```\n\nController-managed resources mount under their prefix:\n\n```ts title=\"custom-actions-2.ts\"\nconst report = await client.reports.get('prj_9')\n```\n\nA custom action's option schema becomes the method's argument types, so an optional `body` becomes an optional argument and a required `permission` is enforced server-side while the call remains fully typed client-side.\n\n## Typed Errors [#typed-errors]\n\nErrors are discriminated on the result object — the client returns a union you can branch on without string matching. On success, `res.data` holds the fully typed payload of that route, so reads need no narrowing; on failure, `res.error` describes the problem with a typed `code` and `message`:\n\n```ts title=\"typed-errors.ts\"\nconst res = await client.posts.get(id)\n\nif (res.error) {\n  switch (res.error.code) {\n    case 'NOT_FOUND':\n      // handle the missing resource\n      break\n    case 'FORBIDDEN':\n      // handle policy denial\n      break\n  }\n}\n```\n\n`res.error` carries `code` and `message`, plus optional `issues` for validation failures. See [API Errors](/docs/api/errors) for the taxonomy behind the union.\n\n## Subscriptions [#subscriptions]\n\nRealtime endpoints stream through the same client:\n\n```ts title=\"subscriptions.ts\"\nconst stream = await client.chat.stream('general')\n```\n\nChannel subscriptions establish over WebSocket with an automatic SSE fallback when a WebSocket connection is unavailable. See [Realtime](/docs/realtime) for channels and client hooks.\n\n## SSR-Safe by Design [#ssr-safe-by-design]\n\nThe same client instance works on the server and in the browser:\n\n* **Server** — calls execute in-process with no network round-trip.\n* **Browser** — calls become fetch requests authenticated by session cookies automatically.\n* **Deduplication** — identical calls during a render are coalesced.\n* **Hydration** — results deduped on the server dehydrate into data hooks on the client.\n\nThe client targets the API prefix and version from configuration, so versioned routes such as `/api/v1/posts` are reached without hard-coded paths in application code. Loaders and data hooks reuse the same typed surface, so a single type universe runs from model through page render. See [Client SDK](/docs/api/client) for setup and usage.\n\n> \\[!NOTE]\n> The server-side client path is the same code path as the browser — no separate server client, no serialization boundary. In-process calls hit the same handlers, validation, and policies as network calls, which is what makes integration tests and `createTestClient` faithful.\n\n## The Result Object [#the-result-object]\n\nEvery call resolves to a result object, never a bare value:\n\n* `res.ok` — true on success; `res.data` holds the typed payload\n* `res.error` — the discriminated error with `code`, `message`, and optional `issues`\n\nBecause the shape is uniform, an error path is always visible at the call site and never smuggled through a null. See [API Errors](/docs/api/errors).\n\n## In-Process Parity [#in-process-parity]\n\nOn the server, a call hits the same controllers, validation, policies, and handlers as a browser call — there is no stub and no mock. That parity is what makes `createTestClient` faithful and what makes server-rendered loaders trustworthy. See [Client SDK](/docs/api/client).\n\n## Streaming and Large Results [#streaming-and-large-results]\n\nStreaming routes pass through the client unchanged, so an NDJSON export and an event stream work in-process and over the network. For large collections the ordinary list contract paginates, and the RPC client types `page`, `limit`, and `where` arguments to match. See [Streaming & SSE](/docs/http/streaming).\n\n## The Client Typed From the Manifest [#the-client-typed-from-the-manifest]\n\nThe ambient types in `src/.kwiva/types` are the boundary: `createClient()` reads them and exposes the typed surface. Because these types derive from the same route manifest that feeds OpenAPI and MCP, a method, a spec path, and an agent tool can never disagree about the shape of a route. See [OpenAPI](/docs/api/openapi).\n\n## Failed Compilation Is the SDK [#failed-compilation-is-the-sdk]\n\nWhen the server changes, the client's type errors are the changelog: every call site that no longer compiles is a call site that must change. Renaming an action, adding a required field, or removing a route all surface at compile time rather than at runtime.\n\n## Arguments Are Schema-Shaped [#arguments-are-schema-shaped]\n\nRoute options define the argument shape per action — params, body, and permissions — and the client's method signatures mirror them. If an action declares `body: { title, publishedAt }` and `permission: 'posts.publish'`, the client method requires exactly those fields at compile time and the result type reflects the route's success and error codes. Skipping a required input or handling an impossible code both fail type-checking. See [Generated Endpoints](/docs/api/generated-endpoints).\n\n## Why Not Plain Functions [#why-not-plain-functions]\n\nPlain function calls give you exceptions, not results; the RPC surface deliberately returns results so error handling is explicit at every call site. The result union also carries the route's documented codes, so a caller branches per code rather than catch-all. This matches the framework's contract that every resolution has an explicit shape. See [API Errors](/docs/api/errors).\n\n## RPC Over WebSockets [#rpc-over-websockets]\n\nControllers can expose RPC-style actions over a socket channel with the same typed results crossing the socket. The server validates the invocation the same way it validates an HTTP call, and the client's typed send mirrors the method surface. See [Realtime: channels](/docs/realtime/channels).\n\n## What's Next [#whats-next]\n\n* [Client SDK](/docs/api/client) — `createClient`, SSR behavior, and testing\n* [Generated Endpoints](/docs/api/generated-endpoints) — the routes behind these calls\n* [Data Hooks](/docs/frontend/data-hooks) — `useResource`, `useList`, `useMutation`\n* [RPC Client in the Frontend](/docs/frontend/rpc-client) — client patterns on the page\n* [API Errors](/docs/api/errors) — the typed error contract\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva's typed RPC client exposes the entire API as type-checked method calls. `client.posts.get(id)` knows the exact argument and response types of `GET /api/posts/:id`, because those types come from the controller and model definitions — not from a separately maintained SDK."
		},
		{
			"heading": void 0,
			"content": "Calling the API is indistinguishable from calling code. Args are validated against schemas at compile time, results arrive typed, and errors are discriminated. If the route is wrong, the call does not compile."
		},
		{
			"heading": "zero-codegen-one-type-universe",
			"content": "The client infers everything at the type level. The framework derives ambient types from your definitions into `src/.kwiva/types`, and `createClient()` picks them up. No code generation step runs, nothing is committed to the repo, and there is nothing to regenerate when the API changes."
		},
		{
			"heading": "the-contract-in-the-editor",
			"content": "Because the contract lives at the type level, the editor knows the full surface of your API the moment `createClient()` runs. Valid methods and their arguments are surfaced as you type, and a misspelled field is a compile error rather than a runtime surprise. This is the same guarantee the rest of the framework relies on: types flow from definition to call site with no intermediate artifact to keep fresh."
		},
		{
			"heading": "reading",
			"content": "`where`, `page`, `limit`, and friends are validated against the model — typo a field name and the call fails to compile."
		},
		{
			"heading": "mutating",
			"content": "Write operations mirror the REST contract: `create` sends a validated body, `update` patches, `remove` deletes. Each method name maps one-to-one to the generated route it calls."
		},
		{
			"heading": "custom-actions",
			"content": "Controller actions appear on the same client object as first-class methods:"
		},
		{
			"heading": "custom-actions",
			"content": "Controller-managed resources mount under their prefix:"
		},
		{
			"heading": "custom-actions",
			"content": "A custom action's option schema becomes the method's argument types, so an optional `body` becomes an optional argument and a required `permission` is enforced server-side while the call remains fully typed client-side."
		},
		{
			"heading": "typed-errors",
			"content": "Errors are discriminated on the result object — the client returns a union you can branch on without string matching. On success, `res.data` holds the fully typed payload of that route, so reads need no narrowing; on failure, `res.error` describes the problem with a typed `code` and `message`:"
		},
		{
			"heading": "typed-errors",
			"content": "`res.error` carries `code` and `message`, plus optional `issues` for validation failures. See API Errors for the taxonomy behind the union."
		},
		{
			"heading": "subscriptions",
			"content": "Realtime endpoints stream through the same client:"
		},
		{
			"heading": "subscriptions",
			"content": "Channel subscriptions establish over WebSocket with an automatic SSE fallback when a WebSocket connection is unavailable. See Realtime for channels and client hooks."
		},
		{
			"heading": "ssr-safe-by-design",
			"content": "The same client instance works on the server and in the browser:"
		},
		{
			"heading": "ssr-safe-by-design",
			"content": "**Server** — calls execute in-process with no network round-trip."
		},
		{
			"heading": "ssr-safe-by-design",
			"content": "**Browser** — calls become fetch requests authenticated by session cookies automatically."
		},
		{
			"heading": "ssr-safe-by-design",
			"content": "**Deduplication** — identical calls during a render are coalesced."
		},
		{
			"heading": "ssr-safe-by-design",
			"content": "**Hydration** — results deduped on the server dehydrate into data hooks on the client."
		},
		{
			"heading": "ssr-safe-by-design",
			"content": "The client targets the API prefix and version from configuration, so versioned routes such as `/api/v1/posts` are reached without hard-coded paths in application code. Loaders and data hooks reuse the same typed surface, so a single type universe runs from model through page render. See Client SDK for setup and usage."
		},
		{
			"heading": "ssr-safe-by-design",
			"content": "> \\[!NOTE]\n> The server-side client path is the same code path as the browser — no separate server client, no serialization boundary. In-process calls hit the same handlers, validation, and policies as network calls, which is what makes integration tests and `createTestClient` faithful."
		},
		{
			"heading": "the-result-object",
			"content": "Every call resolves to a result object, never a bare value:"
		},
		{
			"heading": "the-result-object",
			"content": "`res.ok` — true on success; `res.data` holds the typed payload"
		},
		{
			"heading": "the-result-object",
			"content": "`res.error` — the discriminated error with `code`, `message`, and optional `issues`"
		},
		{
			"heading": "the-result-object",
			"content": "Because the shape is uniform, an error path is always visible at the call site and never smuggled through a null. See API Errors."
		},
		{
			"heading": "in-process-parity",
			"content": "On the server, a call hits the same controllers, validation, policies, and handlers as a browser call — there is no stub and no mock. That parity is what makes `createTestClient` faithful and what makes server-rendered loaders trustworthy. See Client SDK."
		},
		{
			"heading": "streaming-and-large-results",
			"content": "Streaming routes pass through the client unchanged, so an NDJSON export and an event stream work in-process and over the network. For large collections the ordinary list contract paginates, and the RPC client types `page`, `limit`, and `where` arguments to match. See Streaming & SSE."
		},
		{
			"heading": "the-client-typed-from-the-manifest",
			"content": "The ambient types in `src/.kwiva/types` are the boundary: `createClient()` reads them and exposes the typed surface. Because these types derive from the same route manifest that feeds OpenAPI and MCP, a method, a spec path, and an agent tool can never disagree about the shape of a route. See OpenAPI."
		},
		{
			"heading": "failed-compilation-is-the-sdk",
			"content": "When the server changes, the client's type errors are the changelog: every call site that no longer compiles is a call site that must change. Renaming an action, adding a required field, or removing a route all surface at compile time rather than at runtime."
		},
		{
			"heading": "arguments-are-schema-shaped",
			"content": "Route options define the argument shape per action — params, body, and permissions — and the client's method signatures mirror them. If an action declares `body: { title, publishedAt }` and `permission: 'posts.publish'`, the client method requires exactly those fields at compile time and the result type reflects the route's success and error codes. Skipping a required input or handling an impossible code both fail type-checking. See Generated Endpoints."
		},
		{
			"heading": "why-not-plain-functions",
			"content": "Plain function calls give you exceptions, not results; the RPC surface deliberately returns results so error handling is explicit at every call site. The result union also carries the route's documented codes, so a caller branches per code rather than catch-all. This matches the framework's contract that every resolution has an explicit shape. See API Errors."
		},
		{
			"heading": "rpc-over-websockets",
			"content": "Controllers can expose RPC-style actions over a socket channel with the same typed results crossing the socket. The server validates the invocation the same way it validates an HTTP call, and the client's typed send mirrors the method surface. See Realtime: channels."
		},
		{
			"heading": "whats-next",
			"content": "Client SDK — `createClient`, SSR behavior, and testing"
		},
		{
			"heading": "whats-next",
			"content": "Generated Endpoints — the routes behind these calls"
		},
		{
			"heading": "whats-next",
			"content": "Data Hooks — `useResource`, `useList`, `useMutation`"
		},
		{
			"heading": "whats-next",
			"content": "RPC Client in the Frontend — client patterns on the page"
		},
		{
			"heading": "whats-next",
			"content": "API Errors — the typed error contract"
		}
	],
	"headings": [
		{
			"id": "zero-codegen-one-type-universe",
			"content": "Zero Codegen, One Type Universe"
		},
		{
			"id": "the-contract-in-the-editor",
			"content": "The contract in the editor"
		},
		{
			"id": "reading",
			"content": "Reading"
		},
		{
			"id": "mutating",
			"content": "Mutating"
		},
		{
			"id": "custom-actions",
			"content": "Custom Actions"
		},
		{
			"id": "typed-errors",
			"content": "Typed Errors"
		},
		{
			"id": "subscriptions",
			"content": "Subscriptions"
		},
		{
			"id": "ssr-safe-by-design",
			"content": "SSR-Safe by Design"
		},
		{
			"id": "the-result-object",
			"content": "The Result Object"
		},
		{
			"id": "in-process-parity",
			"content": "In-Process Parity"
		},
		{
			"id": "streaming-and-large-results",
			"content": "Streaming and Large Results"
		},
		{
			"id": "the-client-typed-from-the-manifest",
			"content": "The Client Typed From the Manifest"
		},
		{
			"id": "failed-compilation-is-the-sdk",
			"content": "Failed Compilation Is the SDK"
		},
		{
			"id": "arguments-are-schema-shaped",
			"content": "Arguments Are Schema-Shaped"
		},
		{
			"id": "why-not-plain-functions",
			"content": "Why Not Plain Functions"
		},
		{
			"id": "rpc-over-websockets",
			"content": "RPC Over WebSockets"
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
		url: "#zero-codegen-one-type-universe",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Zero Codegen, One Type Universe" })
	},
	{
		depth: 3,
		url: "#the-contract-in-the-editor",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The contract in the editor" })
	},
	{
		depth: 2,
		url: "#reading",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Reading" })
	},
	{
		depth: 2,
		url: "#mutating",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Mutating" })
	},
	{
		depth: 2,
		url: "#custom-actions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Custom Actions" })
	},
	{
		depth: 2,
		url: "#typed-errors",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Typed Errors" })
	},
	{
		depth: 2,
		url: "#subscriptions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Subscriptions" })
	},
	{
		depth: 2,
		url: "#ssr-safe-by-design",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "SSR-Safe by Design" })
	},
	{
		depth: 2,
		url: "#the-result-object",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Result Object" })
	},
	{
		depth: 2,
		url: "#in-process-parity",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "In-Process Parity" })
	},
	{
		depth: 2,
		url: "#streaming-and-large-results",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Streaming and Large Results" })
	},
	{
		depth: 2,
		url: "#the-client-typed-from-the-manifest",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Client Typed From the Manifest" })
	},
	{
		depth: 2,
		url: "#failed-compilation-is-the-sdk",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Failed Compilation Is the SDK" })
	},
	{
		depth: 2,
		url: "#arguments-are-schema-shaped",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Arguments Are Schema-Shaped" })
	},
	{
		depth: 2,
		url: "#why-not-plain-functions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Why Not Plain Functions" })
	},
	{
		depth: 2,
		url: "#rpc-over-websockets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "RPC Over WebSockets" })
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
		p: "p",
		pre: "pre",
		span: "span",
		strong: "strong",
		ul: "ul",
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva's typed RPC client exposes the entire API as type-checked method calls. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.get(id)" }),
			" knows the exact argument and response types of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET /api/posts/:id" }),
			", because those types come from the controller and model definitions — not from a separately maintained SDK."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Calling the API is indistinguishable from calling code. Args are validated against schemas at compile time, results arrive typed, and errors are discriminated. If the route is wrong, the call does not compile." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "zero-codegen-one-type-universe",
			children: "Zero Codegen, One Type Universe"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The client infers everything at the type level. The framework derives ambient types from your definitions into ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/types" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createClient()" }),
			" picks them up. No code generation step runs, nothing is committed to the repo, and there is nothing to regenerate when the API changes."
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
			title: "zero-codegen-one-type-universe.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineModel ──► defineController ──► route manifest ──► @kwiva/client types" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "the-contract-in-the-editor",
			children: "The contract in the editor"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the contract lives at the type level, the editor knows the full surface of your API the moment ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createClient()" }),
			" runs. Valid methods and their arguments are surfaced as you type, and a misspelled field is a compile error rather than a runtime surprise. This is the same guarantee the rest of the framework relies on: types flow from definition to call site with no intermediate artifact to keep fresh."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "reading",
			children: "Reading"
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
			title: "reading.ts",
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
							children: " client.posts."
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
							children: "2"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })              "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// GET /api/posts"
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
							children: " post"
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
							children: " client.posts."
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
							children: "'pst_123'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")                     "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// GET /api/posts/pst_123"
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
							children: " users"
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
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "page" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "limit" }),
			", and friends are validated against the model — typo a field name and the call fails to compile."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "mutating",
			children: "Mutating"
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
			title: "mutating.ts",
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
							children: " created"
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
							children: " client.posts."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "create"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ title: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Hello'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })       "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// POST /api/posts"
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
							children: " client.posts."
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
							children: "(id, { title: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'New title'"
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
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// PATCH /api/posts/:id"
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
							children: " client.posts."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "remove"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(id)                                       "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// DELETE /api/posts/:id"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Write operations mirror the REST contract: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "create" }),
			" sends a validated body, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "update" }),
			" patches, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "remove" }),
			" deletes. Each method name maps one-to-one to the generated route it calls."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "custom-actions",
			children: "Custom Actions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Controller actions appear on the same client object as first-class methods:" }),
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
						children: "'pst_123'"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ")     "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// POST /api/posts/pst_123/publish"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Controller-managed resources mount under their prefix:" }),
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
			title: "custom-actions-2.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
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
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: " report"
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
						children: " client.reports."
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
						children: "'prj_9'"
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
			"A custom action's option schema becomes the method's argument types, so an optional ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "body" }),
			" becomes an optional argument and a required ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" is enforced server-side while the call remains fully typed client-side."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "typed-errors",
			children: "Typed Errors"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Errors are discriminated on the result object — the client returns a union you can branch on without string matching. On success, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.data" }),
			" holds the fully typed payload of that route, so reads need no narrowing; on failure, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.error" }),
			" describes the problem with a typed ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "code" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "message" }),
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " res"
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
							children: " client.posts."
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
						children: " (res.error) {"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "  switch"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " (res.error.code) {"
					})]
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
							children: "    case"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " 'NOT_FOUND'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "      // handle the missing resource"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "      break"
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
							children: "    case"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " 'FORBIDDEN'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "      // handle policy denial"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "      break"
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
						children: "  }"
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
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.error" }),
			" carries ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "code" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "message" }),
			", plus optional ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "issues" }),
			" for validation failures. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/errors",
				children: "API Errors"
			}),
			" for the taxonomy behind the union."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "subscriptions",
			children: "Subscriptions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Realtime endpoints stream through the same client:" }),
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
						children: "("
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: "'general'"
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
			"Channel subscriptions establish over WebSocket with an automatic SSE fallback when a WebSocket connection is unavailable. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime",
				children: "Realtime"
			}),
			" for channels and client hooks."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "ssr-safe-by-design",
			children: "SSR-Safe by Design"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The same client instance works on the server and in the browser:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Server" }), " — calls execute in-process with no network round-trip."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Browser" }), " — calls become fetch requests authenticated by session cookies automatically."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Deduplication" }), " — identical calls during a render are coalesced."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Hydration" }), " — results deduped on the server dehydrate into data hooks on the client."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The client targets the API prefix and version from configuration, so versioned routes such as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/v1/posts" }),
			" are reached without hard-coded paths in application code. Loaders and data hooks reuse the same typed surface, so a single type universe runs from model through page render. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/client",
				children: "Client SDK"
			}),
			" for setup and usage."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nThe server-side client path is the same code path as the browser — no separate server client, no serialization boundary. In-process calls hit the same handlers, validation, and policies as network calls, which is what makes integration tests and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createTestClient" }),
				" faithful."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-result-object",
			children: "The Result Object"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every call resolves to a result object, never a bare value:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.ok" }),
				" — true on success; ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.data" }),
				" holds the typed payload"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.error" }),
				" — the discriminated error with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "code" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "message" }),
				", and optional ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "issues" })
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the shape is uniform, an error path is always visible at the call site and never smuggled through a null. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/errors",
				children: "API Errors"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "in-process-parity",
			children: "In-Process Parity"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"On the server, a call hits the same controllers, validation, policies, and handlers as a browser call — there is no stub and no mock. That parity is what makes ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createTestClient" }),
			" faithful and what makes server-rendered loaders trustworthy. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/client",
				children: "Client SDK"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "streaming-and-large-results",
			children: "Streaming and Large Results"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Streaming routes pass through the client unchanged, so an NDJSON export and an event stream work in-process and over the network. For large collections the ordinary list contract paginates, and the RPC client types ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "page" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "limit" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
			" arguments to match. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/streaming",
				children: "Streaming & SSE"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-client-typed-from-the-manifest",
			children: "The Client Typed From the Manifest"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ambient types in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/types" }),
			" are the boundary: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createClient()" }),
			" reads them and exposes the typed surface. Because these types derive from the same route manifest that feeds OpenAPI and MCP, a method, a spec path, and an agent tool can never disagree about the shape of a route. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/openapi",
				children: "OpenAPI"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "failed-compilation-is-the-sdk",
			children: "Failed Compilation Is the SDK"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "When the server changes, the client's type errors are the changelog: every call site that no longer compiles is a call site that must change. Renaming an action, adding a required field, or removing a route all surface at compile time rather than at runtime." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "arguments-are-schema-shaped",
			children: "Arguments Are Schema-Shaped"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Route options define the argument shape per action — params, body, and permissions — and the client's method signatures mirror them. If an action declares ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "body: { title, publishedAt }" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission: 'posts.publish'" }),
			", the client method requires exactly those fields at compile time and the result type reflects the route's success and error codes. Skipping a required input or handling an impossible code both fail type-checking. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "Generated Endpoints"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "why-not-plain-functions",
			children: "Why Not Plain Functions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Plain function calls give you exceptions, not results; the RPC surface deliberately returns results so error handling is explicit at every call site. The result union also carries the route's documented codes, so a caller branches per code rather than catch-all. This matches the framework's contract that every resolution has an explicit shape. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/errors",
				children: "API Errors"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "rpc-over-websockets",
			children: "RPC Over WebSockets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Controllers can expose RPC-style actions over a socket channel with the same typed results crossing the socket. The server validates the invocation the same way it validates an HTTP call, and the client's typed send mirrors the method surface. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/channels",
				children: "Realtime: channels"
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
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/api/client",
					children: "Client SDK"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createClient" }),
				", SSR behavior, and testing"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "Generated Endpoints"
			}), " — the routes behind these calls"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/frontend/data-hooks",
					children: "Data Hooks"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useResource" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useList" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useMutation" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/rpc-client",
				children: "RPC Client in the Frontend"
			}), " — client patterns on the page"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/errors",
				children: "API Errors"
			}), " — the typed error contract"] }),
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
