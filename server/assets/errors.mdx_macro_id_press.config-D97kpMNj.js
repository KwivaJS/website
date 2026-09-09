import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/api/errors.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "API Errors",
	"description": "The error taxonomy, envelope shape, validation issues, custom codes, and client-side typed handling."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nKwiva has one error taxonomy with two renderers: JSON for API responses and HTML for pages. The same taxonomy surfaces on the client as a typed, discriminated union, so error handling never relies on string matching.\n\nEverything that can go wrong in a request resolves to one of eight codes. API consumers learn one taxonomy, one envelope, and one typing model — then apply them to every endpoint in the system.\n\n## The Taxonomy [#the-taxonomy]\n\nEvery resolution is a code; seven are error codes, and one is the success resolution:\n\n| Code                | HTTP | Meaning                                        | Produced by            |\n| ------------------- | ---- | ---------------------------------------------- | ---------------------- |\n| `OK`                | 200  | Success — the request was handled              | Pipeline               |\n| `UNAUTHORIZED`      | 401  | No session or invalid credentials              | Auth, guards           |\n| `FORBIDDEN`         | 403  | Policy denial                                  | Policies, `permission` |\n| `NOT_FOUND`         | 404  | Missing resource or route                      | `findOrFail`, router   |\n| `CONFLICT`          | 409  | Uniqueness or optimistic-concurrency violation | Model layer            |\n| `VALIDATION`        | 422  | Schema failures                                | Validation stage       |\n| `TOO_MANY_REQUESTS` | 429  | Rate limit tripped                             | Middleware             |\n| `INTERNAL_ERROR`    | 500  | Unhandled error                                | Catch-all              |\n\nOn the client this is not a convention you memorize — it is the literal type. `res.ok` narrows to the success payload; `res.error.code` narrows to the failure codes.\n\n## Authoring Errors [#authoring-errors]\n\nHandlers prefer the `error` helper — a return value, not a throw:\n\n```ts title=\"authoring-errors.ts\"\nimport { error } from '@kwiva/http'\n\nreturn error('NOT_FOUND', { message: 'no such post' })\nreturn error('VALIDATION', { issues: [{ path: 'title', message: 'too long' }] })\n```\n\nServices and models use typed exceptions:\n\n```ts title=\"authoring-errors-2.ts\"\nimport { NotFoundError, ForbiddenError } from '@kwiva/http'\n\nthrow new NotFoundError('post', id)\nthrow new ForbiddenError('posts.publish')\n```\n\nUnknown errors map to `INTERNAL_ERROR`: details are hidden in production and the full stack is shown in development.\n\n## Custom Codes [#custom-codes]\n\nThe taxonomy is extensible from configuration — extend it, never bypass it:\n\n```ts title=\"src/config/app.ts\"\n// src/config/app.ts\nexport default defineConfig('app', {\n  defaults: {\n    errors: {\n      PAYMENT_REQUIRED: { status: 402 },\n      TOO_LARGE: { status: 413 },\n    },\n  },\n})\n```\n\nRegistered custom codes join the client's discriminated union, so a `PAYMENT_REQUIRED` response is as type-safe as a built-in code.\n\nIn-scope `onError` hooks can translate domain exceptions into custom codes before mapping — for example a payment failure mapped to the `PAYMENT_REQUIRED` code. See [Error Handling](/docs/http/errors) for the full `onError` stage.\n\n## The Response Envelope [#the-response-envelope]\n\n```json title=\"the-response-envelope.json\"\n{\n  \"error\": {\n    \"code\": \"NOT_FOUND\",\n    \"message\": \"no such post\",\n    \"requestId\": \"req_...\"\n  }\n}\n```\n\n`requestId` always equals the `x-request-id` header, so any reported error can be correlated back to its request.\n\n## Validation Errors [#validation-errors]\n\nValidation failures add field-mapped `issues`:\n\n```json title=\"validation-errors.json\"\n{\n  \"error\": {\n    \"code\": \"VALIDATION\",\n    \"message\": \"validation failed\",\n    \"requestId\": \"req_...\",\n    \"issues\": [\n      { \"path\": \"title\", \"message\": \"must be at least 1 character\" }\n    ]\n  }\n}\n```\n\nForms can render these directly — `path` names the field and `message` is user-facing. The `issues` array carries one entry per offending field, so a single request surfaces every problem instead of stopping at the first.\n\n## The Error Path [#the-error-path]\n\nAny throw in any lifecycle stage enters the `onError` stage:\n\n1. Mapping order: typed exception → registered custom code → `INTERNAL_ERROR`.\n2. `onError` hooks (app- or controller-scoped) translate domain exceptions first.\n3. The mapped code records a trace span and counts a metric per code and route.\n4. The response renders as JSON for API routes or the error page otherwise.\n\nThe pipeline degrades, never loops: if the error handler itself throws, the response is a plain 500; if an error page render throws, a minimal built-in fallback page is used.\n\n## Model-Layer Integration [#model-layer-integration]\n\nCommon database cases map automatically:\n\n| Situation                                    | Result                              |\n| -------------------------------------------- | ----------------------------------- |\n| `findOrFail`                                 | `NOT_FOUND`                         |\n| unique constraint violation                  | `CONFLICT` with the offending field |\n| soft-deleted row accessed by a default query | `NOT_FOUND`                         |\n\nHandlers rarely map errors manually because the layer below already speaks the taxonomy. See [Models](/docs/data/models) and [Data: soft deletes](/docs/data/soft-deletes).\n\n## Client-Side Handling [#client-side-handling]\n\nThe client returns the discriminated union, so branches are checked at compile time:\n\n```ts title=\"client-side-handling.ts\"\nconst res = await client.posts.get(id)\n\nif (res.ok) {\n  // res.data is the fully typed payload\n} else {\n  switch (res.error.code) {\n    case 'NOT_FOUND':\n      // render a missing-resource state\n      break\n    case 'FORBIDDEN':\n      // render an access-denied state\n      break\n    case 'TOO_MANY_REQUESTS':\n      // render a retry-later state\n      break\n  }\n}\n```\n\nBecause the union derives from the taxonomy, a new custom code extends the switch options the compiler knows about — there is no string matching to miss.\n\n## Correlation and Logs [#correlation-and-logs]\n\nEvery error response carries `requestId`, and the structured log line includes `code`, `route`, `requestId`, and `tenantId` (when tenancy is in use). You can move from a customer report to the failing span in one hop. See [Observability](/docs/observability).\n\n## Message Copy [#message-copy]\n\n`message` is the user-visible text. Write it for a person reading an error log, a support ticket, or a form. `issues[].message` is the field-level copy forms display. Keep both short and specific — \"no such post\" is actionable, and the code is machine-readable regardless.\n\n## Production Sanitization [#production-sanitization]\n\nFor `INTERNAL_ERROR`, production replaces internals with a generic message while full detail goes to logs and traces. Development surfaces the full stack. The two modes share the same envelope, so client code branches on codes, never on stack text. See [Error Handling](/docs/http/errors).\n\n## Correlation With Tenancy [#correlation-with-tenancy]\n\nWhen tenancy is enabled, `tenantId` rides the structured log line and trace attributes alongside `requestId`. Support can move from a tenant report to the failing request to the trace — and back — without string guessing. See [Tenancy](/docs/tenancy) and [Observability](/docs/observability).\n\n## Failures Beyond the Handler [#failures-beyond-the-handler]\n\nThe `onError` stage catches throws from middleware, guards, parsing, and validation — not just handler bodies. A rate-limit short-circuit, a rejected upgrade, or a malformed multipart body all resolve through the same mapping. See [Request Lifecycle](/docs/http/lifecycle).\n\n## Differences From HTTP Pages [#differences-from-http-pages]\n\nThe same taxonomy drives HTML error pages on the navigation side, so a `NOT_FOUND` renders as the 404 page and a `FORBIDDEN` as the 403 page. The difference is the renderer only: API routes return the `error` envelope, non-API routes return HTML. Codes and mapping are shared. See [Error Handling](/docs/http/errors).\n\n## Errors in Development [#errors-in-development]\n\nIn development, `INTERNAL_ERROR` includes the stack trace, and the request ID links to the trace timeline in the dev overlay. `VALIDATION` responses show the schema that produced the issue, and custom codes are listed with their registered status. The goal: an error reported during development is fixable from the error screen alone.\n\n## Rate Limiting and the 429 Path [#rate-limiting-and-the-429-path]\n\n`TOO_MANY_REQUESTS` carries the retry-after guidance the limiter configured, and the typed client exposes it. The limiter keys by identity when available and by IP otherwise, so shared egress does not exhaust a tenant's budget. See [Rate Limiting](/docs/http/routes).\n\n## What's Next [#whats-next]\n\n* [Error Handling](/docs/http/errors) — the lifecycle `onError` stage in depth\n* [Typed RPC](/docs/api/rpc) — the typed result contract\n* [Observability](/docs/observability) — tracing, logs, and metrics\n* [Validation](/docs/http/validation) — where `VALIDATION` comes from\n* [Policies](/docs/authorization/policies) — where `FORBIDDEN` comes from\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva has one error taxonomy with two renderers: JSON for API responses and HTML for pages. The same taxonomy surfaces on the client as a typed, discriminated union, so error handling never relies on string matching."
		},
		{
			"heading": void 0,
			"content": "Everything that can go wrong in a request resolves to one of eight codes. API consumers learn one taxonomy, one envelope, and one typing model — then apply them to every endpoint in the system."
		},
		{
			"heading": "the-taxonomy",
			"content": "Every resolution is a code; seven are error codes, and one is the success resolution:"
		},
		{
			"heading": "the-taxonomy",
			"content": "Code"
		},
		{
			"heading": "the-taxonomy",
			"content": "HTTP"
		},
		{
			"heading": "the-taxonomy",
			"content": "Meaning"
		},
		{
			"heading": "the-taxonomy",
			"content": "Produced by"
		},
		{
			"heading": "the-taxonomy",
			"content": "`OK`"
		},
		{
			"heading": "the-taxonomy",
			"content": "200"
		},
		{
			"heading": "the-taxonomy",
			"content": "Success — the request was handled"
		},
		{
			"heading": "the-taxonomy",
			"content": "Pipeline"
		},
		{
			"heading": "the-taxonomy",
			"content": "`UNAUTHORIZED`"
		},
		{
			"heading": "the-taxonomy",
			"content": "401"
		},
		{
			"heading": "the-taxonomy",
			"content": "No session or invalid credentials"
		},
		{
			"heading": "the-taxonomy",
			"content": "Auth, guards"
		},
		{
			"heading": "the-taxonomy",
			"content": "`FORBIDDEN`"
		},
		{
			"heading": "the-taxonomy",
			"content": "403"
		},
		{
			"heading": "the-taxonomy",
			"content": "Policy denial"
		},
		{
			"heading": "the-taxonomy",
			"content": "Policies, `permission`"
		},
		{
			"heading": "the-taxonomy",
			"content": "`NOT_FOUND`"
		},
		{
			"heading": "the-taxonomy",
			"content": "404"
		},
		{
			"heading": "the-taxonomy",
			"content": "Missing resource or route"
		},
		{
			"heading": "the-taxonomy",
			"content": "`findOrFail`, router"
		},
		{
			"heading": "the-taxonomy",
			"content": "`CONFLICT`"
		},
		{
			"heading": "the-taxonomy",
			"content": "409"
		},
		{
			"heading": "the-taxonomy",
			"content": "Uniqueness or optimistic-concurrency violation"
		},
		{
			"heading": "the-taxonomy",
			"content": "Model layer"
		},
		{
			"heading": "the-taxonomy",
			"content": "`VALIDATION`"
		},
		{
			"heading": "the-taxonomy",
			"content": "422"
		},
		{
			"heading": "the-taxonomy",
			"content": "Schema failures"
		},
		{
			"heading": "the-taxonomy",
			"content": "Validation stage"
		},
		{
			"heading": "the-taxonomy",
			"content": "`TOO_MANY_REQUESTS`"
		},
		{
			"heading": "the-taxonomy",
			"content": "429"
		},
		{
			"heading": "the-taxonomy",
			"content": "Rate limit tripped"
		},
		{
			"heading": "the-taxonomy",
			"content": "Middleware"
		},
		{
			"heading": "the-taxonomy",
			"content": "`INTERNAL_ERROR`"
		},
		{
			"heading": "the-taxonomy",
			"content": "500"
		},
		{
			"heading": "the-taxonomy",
			"content": "Unhandled error"
		},
		{
			"heading": "the-taxonomy",
			"content": "Catch-all"
		},
		{
			"heading": "the-taxonomy",
			"content": "On the client this is not a convention you memorize — it is the literal type. `res.ok` narrows to the success payload; `res.error.code` narrows to the failure codes."
		},
		{
			"heading": "authoring-errors",
			"content": "Handlers prefer the `error` helper — a return value, not a throw:"
		},
		{
			"heading": "authoring-errors",
			"content": "Services and models use typed exceptions:"
		},
		{
			"heading": "authoring-errors",
			"content": "Unknown errors map to `INTERNAL_ERROR`: details are hidden in production and the full stack is shown in development."
		},
		{
			"heading": "custom-codes",
			"content": "The taxonomy is extensible from configuration — extend it, never bypass it:"
		},
		{
			"heading": "custom-codes",
			"content": "Registered custom codes join the client's discriminated union, so a `PAYMENT_REQUIRED` response is as type-safe as a built-in code."
		},
		{
			"heading": "custom-codes",
			"content": "In-scope `onError` hooks can translate domain exceptions into custom codes before mapping — for example a payment failure mapped to the `PAYMENT_REQUIRED` code. See Error Handling for the full `onError` stage."
		},
		{
			"heading": "the-response-envelope",
			"content": "`requestId` always equals the `x-request-id` header, so any reported error can be correlated back to its request."
		},
		{
			"heading": "validation-errors",
			"content": "Validation failures add field-mapped `issues`:"
		},
		{
			"heading": "validation-errors",
			"content": "Forms can render these directly — `path` names the field and `message` is user-facing. The `issues` array carries one entry per offending field, so a single request surfaces every problem instead of stopping at the first."
		},
		{
			"heading": "the-error-path",
			"content": "Any throw in any lifecycle stage enters the `onError` stage:"
		},
		{
			"heading": "the-error-path",
			"content": "Mapping order: typed exception → registered custom code → `INTERNAL_ERROR`."
		},
		{
			"heading": "the-error-path",
			"content": "`onError` hooks (app- or controller-scoped) translate domain exceptions first."
		},
		{
			"heading": "the-error-path",
			"content": "The mapped code records a trace span and counts a metric per code and route."
		},
		{
			"heading": "the-error-path",
			"content": "The response renders as JSON for API routes or the error page otherwise."
		},
		{
			"heading": "the-error-path",
			"content": "The pipeline degrades, never loops: if the error handler itself throws, the response is a plain 500; if an error page render throws, a minimal built-in fallback page is used."
		},
		{
			"heading": "model-layer-integration",
			"content": "Common database cases map automatically:"
		},
		{
			"heading": "model-layer-integration",
			"content": "Situation"
		},
		{
			"heading": "model-layer-integration",
			"content": "Result"
		},
		{
			"heading": "model-layer-integration",
			"content": "`findOrFail`"
		},
		{
			"heading": "model-layer-integration",
			"content": "`NOT_FOUND`"
		},
		{
			"heading": "model-layer-integration",
			"content": "unique constraint violation"
		},
		{
			"heading": "model-layer-integration",
			"content": "`CONFLICT` with the offending field"
		},
		{
			"heading": "model-layer-integration",
			"content": "soft-deleted row accessed by a default query"
		},
		{
			"heading": "model-layer-integration",
			"content": "`NOT_FOUND`"
		},
		{
			"heading": "model-layer-integration",
			"content": "Handlers rarely map errors manually because the layer below already speaks the taxonomy. See Models and Data: soft deletes."
		},
		{
			"heading": "client-side-handling",
			"content": "The client returns the discriminated union, so branches are checked at compile time:"
		},
		{
			"heading": "client-side-handling",
			"content": "Because the union derives from the taxonomy, a new custom code extends the switch options the compiler knows about — there is no string matching to miss."
		},
		{
			"heading": "correlation-and-logs",
			"content": "Every error response carries `requestId`, and the structured log line includes `code`, `route`, `requestId`, and `tenantId` (when tenancy is in use). You can move from a customer report to the failing span in one hop. See Observability."
		},
		{
			"heading": "message-copy",
			"content": "`message` is the user-visible text. Write it for a person reading an error log, a support ticket, or a form. `issues[].message` is the field-level copy forms display. Keep both short and specific — \"no such post\" is actionable, and the code is machine-readable regardless."
		},
		{
			"heading": "production-sanitization",
			"content": "For `INTERNAL_ERROR`, production replaces internals with a generic message while full detail goes to logs and traces. Development surfaces the full stack. The two modes share the same envelope, so client code branches on codes, never on stack text. See Error Handling."
		},
		{
			"heading": "correlation-with-tenancy",
			"content": "When tenancy is enabled, `tenantId` rides the structured log line and trace attributes alongside `requestId`. Support can move from a tenant report to the failing request to the trace — and back — without string guessing. See Tenancy and Observability."
		},
		{
			"heading": "failures-beyond-the-handler",
			"content": "The `onError` stage catches throws from middleware, guards, parsing, and validation — not just handler bodies. A rate-limit short-circuit, a rejected upgrade, or a malformed multipart body all resolve through the same mapping. See Request Lifecycle."
		},
		{
			"heading": "differences-from-http-pages",
			"content": "The same taxonomy drives HTML error pages on the navigation side, so a `NOT_FOUND` renders as the 404 page and a `FORBIDDEN` as the 403 page. The difference is the renderer only: API routes return the `error` envelope, non-API routes return HTML. Codes and mapping are shared. See Error Handling."
		},
		{
			"heading": "errors-in-development",
			"content": "In development, `INTERNAL_ERROR` includes the stack trace, and the request ID links to the trace timeline in the dev overlay. `VALIDATION` responses show the schema that produced the issue, and custom codes are listed with their registered status. The goal: an error reported during development is fixable from the error screen alone."
		},
		{
			"heading": "rate-limiting-and-the-429-path",
			"content": "`TOO_MANY_REQUESTS` carries the retry-after guidance the limiter configured, and the typed client exposes it. The limiter keys by identity when available and by IP otherwise, so shared egress does not exhaust a tenant's budget. See Rate Limiting."
		},
		{
			"heading": "whats-next",
			"content": "Error Handling — the lifecycle `onError` stage in depth"
		},
		{
			"heading": "whats-next",
			"content": "Typed RPC — the typed result contract"
		},
		{
			"heading": "whats-next",
			"content": "Observability — tracing, logs, and metrics"
		},
		{
			"heading": "whats-next",
			"content": "Validation — where `VALIDATION` comes from"
		},
		{
			"heading": "whats-next",
			"content": "Policies — where `FORBIDDEN` comes from"
		}
	],
	"headings": [
		{
			"id": "the-taxonomy",
			"content": "The Taxonomy"
		},
		{
			"id": "authoring-errors",
			"content": "Authoring Errors"
		},
		{
			"id": "custom-codes",
			"content": "Custom Codes"
		},
		{
			"id": "the-response-envelope",
			"content": "The Response Envelope"
		},
		{
			"id": "validation-errors",
			"content": "Validation Errors"
		},
		{
			"id": "the-error-path",
			"content": "The Error Path"
		},
		{
			"id": "model-layer-integration",
			"content": "Model-Layer Integration"
		},
		{
			"id": "client-side-handling",
			"content": "Client-Side Handling"
		},
		{
			"id": "correlation-and-logs",
			"content": "Correlation and Logs"
		},
		{
			"id": "message-copy",
			"content": "Message Copy"
		},
		{
			"id": "production-sanitization",
			"content": "Production Sanitization"
		},
		{
			"id": "correlation-with-tenancy",
			"content": "Correlation With Tenancy"
		},
		{
			"id": "failures-beyond-the-handler",
			"content": "Failures Beyond the Handler"
		},
		{
			"id": "differences-from-http-pages",
			"content": "Differences From HTTP Pages"
		},
		{
			"id": "errors-in-development",
			"content": "Errors in Development"
		},
		{
			"id": "rate-limiting-and-the-429-path",
			"content": "Rate Limiting and the 429 Path"
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
		url: "#the-taxonomy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Taxonomy" })
	},
	{
		depth: 2,
		url: "#authoring-errors",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Authoring Errors" })
	},
	{
		depth: 2,
		url: "#custom-codes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Custom Codes" })
	},
	{
		depth: 2,
		url: "#the-response-envelope",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Response Envelope" })
	},
	{
		depth: 2,
		url: "#validation-errors",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Validation Errors" })
	},
	{
		depth: 2,
		url: "#the-error-path",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Error Path" })
	},
	{
		depth: 2,
		url: "#model-layer-integration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Model-Layer Integration" })
	},
	{
		depth: 2,
		url: "#client-side-handling",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Client-Side Handling" })
	},
	{
		depth: 2,
		url: "#correlation-and-logs",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Correlation and Logs" })
	},
	{
		depth: 2,
		url: "#message-copy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Message Copy" })
	},
	{
		depth: 2,
		url: "#production-sanitization",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Production Sanitization" })
	},
	{
		depth: 2,
		url: "#correlation-with-tenancy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Correlation With Tenancy" })
	},
	{
		depth: 2,
		url: "#failures-beyond-the-handler",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Failures Beyond the Handler" })
	},
	{
		depth: 2,
		url: "#differences-from-http-pages",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Differences From HTTP Pages" })
	},
	{
		depth: 2,
		url: "#errors-in-development",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Errors in Development" })
	},
	{
		depth: 2,
		url: "#rate-limiting-and-the-429-path",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Rate Limiting and the 429 Path" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva has one error taxonomy with two renderers: JSON for API responses and HTML for pages. The same taxonomy surfaces on the client as a typed, discriminated union, so error handling never relies on string matching." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Everything that can go wrong in a request resolves to one of eight codes. API consumers learn one taxonomy, one envelope, and one typing model — then apply them to every endpoint in the system." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-taxonomy",
			children: "The Taxonomy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every resolution is a code; seven are error codes, and one is the success resolution:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Code" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "HTTP" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Produced by" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "OK" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "200" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Success — the request was handled" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pipeline" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "UNAUTHORIZED" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "401" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "No session or invalid credentials" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Auth, guards" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "FORBIDDEN" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "403" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Policy denial" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Policies, ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "NOT_FOUND" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "404" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Missing resource or route" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "findOrFail" }), ", router"] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "CONFLICT" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "409" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Uniqueness or optimistic-concurrency violation" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model layer" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "VALIDATION" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "422" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Schema failures" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Validation stage" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "TOO_MANY_REQUESTS" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "429" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rate limit tripped" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Middleware" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "INTERNAL_ERROR" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "500" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Unhandled error" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Catch-all" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"On the client this is not a convention you memorize — it is the literal type. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.ok" }),
			" narrows to the success payload; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.error.code" }),
			" narrows to the failure codes."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "authoring-errors",
			children: "Authoring Errors"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Handlers prefer the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "error" }),
			" helper — a return value, not a throw:"
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
			title: "authoring-errors.ts",
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
							children: " { error } "
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
							children: "return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " error"
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
							children: "'NOT_FOUND'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { message: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'no such post'"
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
							children: "return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " error"
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
							children: "'VALIDATION'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { issues: [{ path: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'title'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", message: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'too long'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }] })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Services and models use typed exceptions:" }),
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
			title: "authoring-errors-2.ts",
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
							children: " { NotFoundError, ForbiddenError } "
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
							children: "throw"
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
							children: " NotFoundError"
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
							children: "'post'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", id)"
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
							children: "throw"
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
							children: " ForbiddenError"
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
							children: "'posts.publish'"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Unknown errors map to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "INTERNAL_ERROR" }),
			": details are hidden in production and the full stack is shown in development."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "custom-codes",
			children: "Custom Codes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The taxonomy is extensible from configuration — extend it, never bypass it:" }),
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
			title: "src/config/app.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/app.ts"
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
							children: "'app'"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  defaults: {"
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
						children: "    errors: {"
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
							children: "      PAYMENT_REQUIRED: { status: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "402"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "      TOO_LARGE: { status: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "413"
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
						children: "    },"
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
						children: "  },"
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
			"Registered custom codes join the client's discriminated union, so a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PAYMENT_REQUIRED" }),
			" response is as type-safe as a built-in code."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"In-scope ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
			" hooks can translate domain exceptions into custom codes before mapping — for example a payment failure mapped to the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PAYMENT_REQUIRED" }),
			" code. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/errors",
				children: "Error Handling"
			}),
			" for the full ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
			" stage."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-response-envelope",
			children: "The Response Envelope"
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
			title: "the-response-envelope.json",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "{"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "  \"error\""
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": {"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "    \"code\""
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"NOT_FOUND\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "    \"message\""
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"no such post\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "    \"requestId\""
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"req_...\""
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
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
			" always equals the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-request-id" }),
			" header, so any reported error can be correlated back to its request."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "validation-errors",
			children: "Validation Errors"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Validation failures add field-mapped ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "issues" }),
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
			title: "validation-errors.json",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "{"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "  \"error\""
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": {"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "    \"code\""
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"VALIDATION\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "    \"message\""
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"validation failed\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "    \"requestId\""
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"req_...\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "    \"issues\""
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": ["
					})]
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
							children: "      { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "\"path\""
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"title\""
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
							children: "\"message\""
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"must be at least 1 character\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }"
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
						children: "    ]"
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
			"Forms can render these directly — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "path" }),
			" names the field and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "message" }),
			" is user-facing. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "issues" }),
			" array carries one entry per offending field, so a single request surfaces every problem instead of stopping at the first."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-error-path",
			children: "The Error Path"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Any throw in any lifecycle stage enters the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
			" stage:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Mapping order: typed exception → registered custom code → ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "INTERNAL_ERROR" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }), " hooks (app- or controller-scoped) translate domain exceptions first."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The mapped code records a trace span and counts a metric per code and route." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The response renders as JSON for API routes or the error page otherwise." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pipeline degrades, never loops: if the error handler itself throws, the response is a plain 500; if an error page render throws, a minimal built-in fallback page is used." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "model-layer-integration",
			children: "Model-Layer Integration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Common database cases map automatically:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Situation" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Result" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "findOrFail" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "NOT_FOUND" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "unique constraint violation" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "CONFLICT" }), " with the offending field"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "soft-deleted row accessed by a default query" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "NOT_FOUND" }) })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Handlers rarely map errors manually because the layer below already speaks the taxonomy. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/soft-deletes",
				children: "Data: soft deletes"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "client-side-handling",
			children: "Client-Side Handling"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The client returns the discriminated union, so branches are checked at compile time:" }),
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
			title: "client-side-handling.ts",
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
						children: " (res.ok) {"
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
						children: "  // res.data is the fully typed payload"
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
							children: "} "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "else"
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
						children: "      // render a missing-resource state"
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
						children: "      // render an access-denied state"
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
							children: " 'TOO_MANY_REQUESTS'"
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
						children: "      // render a retry-later state"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the union derives from the taxonomy, a new custom code extends the switch options the compiler knows about — there is no string matching to miss." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "correlation-and-logs",
			children: "Correlation and Logs"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every error response carries ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
			", and the structured log line includes ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "code" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "route" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
			" (when tenancy is in use). You can move from a customer report to the failing span in one hop. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "message-copy",
			children: "Message Copy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "message" }),
			" is the user-visible text. Write it for a person reading an error log, a support ticket, or a form. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "issues[].message" }),
			" is the field-level copy forms display. Keep both short and specific — \"no such post\" is actionable, and the code is machine-readable regardless."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "production-sanitization",
			children: "Production Sanitization"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "INTERNAL_ERROR" }),
			", production replaces internals with a generic message while full detail goes to logs and traces. Development surfaces the full stack. The two modes share the same envelope, so client code branches on codes, never on stack text. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/errors",
				children: "Error Handling"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "correlation-with-tenancy",
			children: "Correlation With Tenancy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"When tenancy is enabled, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
			" rides the structured log line and trace attributes alongside ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
			". Support can move from a tenant report to the failing request to the trace — and back — without string guessing. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy",
				children: "Tenancy"
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
			id: "failures-beyond-the-handler",
			children: "Failures Beyond the Handler"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
			" stage catches throws from middleware, guards, parsing, and validation — not just handler bodies. A rate-limit short-circuit, a rejected upgrade, or a malformed multipart body all resolve through the same mapping. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Request Lifecycle"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "differences-from-http-pages",
			children: "Differences From HTTP Pages"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same taxonomy drives HTML error pages on the navigation side, so a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "NOT_FOUND" }),
			" renders as the 404 page and a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "FORBIDDEN" }),
			" as the 403 page. The difference is the renderer only: API routes return the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "error" }),
			" envelope, non-API routes return HTML. Codes and mapping are shared. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/errors",
				children: "Error Handling"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "errors-in-development",
			children: "Errors in Development"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"In development, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "INTERNAL_ERROR" }),
			" includes the stack trace, and the request ID links to the trace timeline in the dev overlay. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "VALIDATION" }),
			" responses show the schema that produced the issue, and custom codes are listed with their registered status. The goal: an error reported during development is fixable from the error screen alone."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "rate-limiting-and-the-429-path",
			children: "Rate Limiting and the 429 Path"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "TOO_MANY_REQUESTS" }),
			" carries the retry-after guidance the limiter configured, and the typed client exposes it. The limiter keys by identity when available and by IP otherwise, so shared egress does not exhaust a tenant's budget. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/routes",
				children: "Rate Limiting"
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
					href: "/docs/http/errors",
					children: "Error Handling"
				}),
				" — the lifecycle ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
				" stage in depth"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rpc",
				children: "Typed RPC"
			}), " — the typed result contract"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}), " — tracing, logs, and metrics"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/validation",
					children: "Validation"
				}),
				" — where ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "VALIDATION" }),
				" comes from"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/authorization/policies",
					children: "Policies"
				}),
				" — where ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "FORBIDDEN" }),
				" comes from"
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
