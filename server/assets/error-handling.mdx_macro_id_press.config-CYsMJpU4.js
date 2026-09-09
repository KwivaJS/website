import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/core-concepts/error-handling.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Error Handling",
	"description": "One error taxonomy, two renderers — the eight-code model, the error helper, typed exceptions, and client-side handling."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\n## One Taxonomy, Two Renderers [#one-taxonomy-two-renderers]\n\nKwiva has exactly one error taxonomy and two renderers: JSON for API routes and HTML for pages. Every error — wherever it is thrown — maps to a code in the taxonomy, carries a request ID for correlation, and is typed on the client. There is no second, ad-hoc way to report failures, and no path around the taxonomy.\n\n## The Taxonomy [#the-taxonomy]\n\nThe taxonomy has one success resolution and seven error codes. Every request resolution lands on exactly one of them:\n\n| Code                | HTTP | Meaning                                        | Produced by            |\n| ------------------- | ---- | ---------------------------------------------- | ---------------------- |\n| `OK`                | 200  | Success — the request was handled              | Pipeline               |\n| `UNAUTHORIZED`      | 401  | No session or invalid credentials              | Auth, guards           |\n| `FORBIDDEN`         | 403  | Policy denial                                  | Policies, `permission` |\n| `NOT_FOUND`         | 404  | Missing resource or route                      | `findOrFail`, router   |\n| `CONFLICT`          | 409  | Uniqueness or optimistic-concurrency violation | Model layer            |\n| `VALIDATION`        | 422  | Schema failures                                | Validation stage       |\n| `TOO_MANY_REQUESTS` | 429  | Rate limit tripped                             | Middleware             |\n| `INTERNAL_ERROR`    | 500  | Unhandled error                                | Catch-all              |\n\nThis is the complete contract. Success statuses are the standard set — 200, 201, 204 — and every failure maps into one of the seven error codes, with `OK` reserved for success. The same table is used by the HTTP layer ([HTTP errors](/docs/http/errors)) and the API client ([API errors](/docs/api/errors)), so a code means the same thing at every layer. On the typed client the discrimination is literal: `res.ok` is the `OK` resolution, and `res.error.code` is the failing code.\n\n## Authoring Errors [#authoring-errors]\n\nTwo styles are supported, chosen by context:\n\n```ts title=\"authoring-errors.ts\"\nimport { error, NotFoundError, ForbiddenError } from '@kwiva/http'\n\n// helper return — preferred in handlers\nreturn error('NOT_FOUND', { message: 'no such post' })\nreturn error('VALIDATION', { issues: [{ path: 'title', message: 'too long' }] })\n\n// typed exceptions — preferred in services and models\nthrow new NotFoundError('post', id)\nthrow new ForbiddenError('posts.publish')\n```\n\nThe `error` helper returns a typed error response from the handler. The typed exceptions throw, which is the right shape from deep inside a service or model where there is no return value to thread. Both end up as the same taxonomy entry, flow through the same mapping, and produce the same response envelope.\n\nUnknown errors become `INTERNAL_ERROR` in production with details hidden; in development they surface with the full stack. See [Observability: logging](/docs/observability/logging) for the correlation story.\n\n## Custom Codes [#custom-codes]\n\nThe taxonomy is fixed, but it is extensible — not skippable. Custom codes register in `src/config/app.ts > errors` with a status mapping:\n\n```ts title=\"src/config/app.ts\"\n// src/config/app.ts (excerpt)\nexport default defineConfig('app', {\n  defaults: {\n    errors: {\n      PAYMENT_REQUIRED: { status: 402 },\n      TOO_LARGE: { status: 413 },\n    },\n  },\n})\n```\n\nRegistered codes map to the matching HTTP status and flow through the same envelope, `onError` stage, and client typing as the built-in codes. Extend the taxonomy; never bypass it.\n\n## Reaching for Errors from Any Stage [#reaching-for-errors-from-any-stage]\n\nMiddleware, guards, and handlers all produce errors through the same two styles. A guard denies with a returned error; a deep service or model throws a typed exception:\n\n```ts title=\"reaching-for-errors-from-any-stage.ts\"\nimport { error } from '@kwiva/http'\n\n// in a guard's beforeHandle — return, don't throw\nbeforeHandle: ({ session, error }) => {\n  if (!session.user) return error('UNAUTHORIZED', { message: 'sign in required' })\n}\n\n// in a handler — same helper, same envelope\nif (!post) return error('NOT_FOUND', { message: 'no such post' })\n```\n\nBoth enter the `onError` stage and resolve through identical mapping. The only rule is stylistic: return the helper where a value can be returned, throw the typed exception where it cannot (deep services, model internals). The taxonomy code, envelope, and client typing are identical either way.\n\n## Response Shapes [#response-shapes]\n\nAPI errors render as JSON with the taxonomy envelope:\n\n```jsonc title=\"response-shapes.jsonc\"\n{\n  \"error\": {\n    \"code\": \"NOT_FOUND\",\n    \"message\": \"no such post\",\n    \"requestId\": \"req_...\"\n  }\n}\n```\n\nPage errors render as HTML through the route's error component or the root error boundary, themed and including the request ID. One taxonomy, two renderers — see [Rendering](/docs/rendering) for the page side.\n\nValidation failures extend the envelope with field-level issues:\n\n```jsonc title=\"response-shapes-2.jsonc\"\n{\n  \"error\": {\n    \"code\": \"VALIDATION\",\n    \"message\": \"validation failed\",\n    \"issues\": [{ \"path\": \"title\", \"message\": \"too long\" }],\n    \"requestId\": \"req_...\"\n  }\n}\n```\n\nThe `issues` array is the same shape produced by the validation stage, so clients can render field errors directly. See [Validation](/docs/http/validation).\n\n## The onError Stage [#the-onerror-stage]\n\nAny throw or `error()` return in any lifecycle stage enters the `onError` stage:\n\n* Mapping order: typed exception, registered custom code, then `INTERNAL_ERROR`.\n* `onError` hooks at app and controller scope can translate domain exceptions before mapping — for example, turning a payment-provider failure into a custom `PAYMENT` code.\n* After mapping, the trace span records the code, and metrics count per code and route.\n\nThe hooks run before taxonomy mapping, so domain translation is the place to widen the taxonomy for application-specific failures. Because mapping never runs twice on the same error, the pipeline degrades rather than loops.\n\n## Model-Layer Integration [#model-layer-integration]\n\nThe model layer throws into the same taxonomy, so handlers rarely map errors manually:\n\n* `findOrFail` throws `NOT_FOUND`.\n* Unique-constraint violations throw `CONFLICT` with the offending field.\n* Soft-deleted rows are invisible by default, so reads of a trashed row return `NOT_FOUND`, not a special deleted state.\n\nSee [Models](/docs/data/models) and [Soft deletes](/docs/data/soft-deletes).\n\n## Client-Side Typing [#client-side-typing]\n\nThe typed client returns discriminated errors with no string matching:\n\n```ts title=\"client-side-typing.ts\"\nconst res = await client.posts.get(id)\n\nif (res.ok) {\n  console.log(res.data)      // the resolved payload, fully typed\n} else {\n  switch (res.error.code) {\n    case 'NOT_FOUND':\n      // handle the missing resource\n      break\n    case 'FORBIDDEN':\n      // handle the policy denial\n      break\n    case 'TOO_MANY_REQUESTS':\n      // handle the limit\n      break\n  }\n}\n```\n\n`res.error.code` is a union drawn from the taxonomy, so the branches typecheck and a typo is a compile error. The success branch narrows to `res.data`; the failure branch narrows `error` to the taxonomy union plus any registered custom codes. See [Type Inference](/docs/core-concepts/type-inference) for how the client derives this.\n\n## Logs and Correlation [#logs-and-correlation]\n\nEvery error response carries `requestId`, the same value as the `x-request-id` header. The structured log line for an error includes `level`, `code`, `route`, `requestId`, `tenantId`, and `traceId`:\n\n```ts title=\"logs-and-correlation.ts\"\nlogger.error({ code, route, requestId, tenantId, traceId }, 'request failed')\n```\n\nProduction hides internals for `INTERNAL_ERROR`; the development overlay shows the full stack with source maps.\n\n## Failure of the Error System [#failure-of-the-error-system]\n\nThe error system degrades, never loops:\n\n* If the error handler itself throws, the request returns a plain 500 and an alert metric fires.\n* If rendering an error page throws, a minimal built-in fallback page is served.\n* Error mapping is the only code that can run after `onResponse`, and it only records span error attributes.\n\n## What's Next [#whats-next]\n\n1. [HTTP errors](/docs/http/errors) — the taxonomy at the request layer\n2. [Validation](/docs/http/validation) — the `VALIDATION` code and the issues shape\n3. [Guards](/docs/http/guards) — where `UNAUTHORIZED` and `FORBIDDEN` originate\n4. [API: errors](/docs/api/errors) — the typed error contract on the client\n5. [Observability: logging](/docs/observability/logging) — correlating errors with `requestId`\n";
var structuredData = {
	"contents": [
		{
			"heading": "one-taxonomy-two-renderers",
			"content": "Kwiva has exactly one error taxonomy and two renderers: JSON for API routes and HTML for pages. Every error — wherever it is thrown — maps to a code in the taxonomy, carries a request ID for correlation, and is typed on the client. There is no second, ad-hoc way to report failures, and no path around the taxonomy."
		},
		{
			"heading": "the-taxonomy",
			"content": "The taxonomy has one success resolution and seven error codes. Every request resolution lands on exactly one of them:"
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
			"content": "This is the complete contract. Success statuses are the standard set — 200, 201, 204 — and every failure maps into one of the seven error codes, with `OK` reserved for success. The same table is used by the HTTP layer (HTTP errors) and the API client (API errors), so a code means the same thing at every layer. On the typed client the discrimination is literal: `res.ok` is the `OK` resolution, and `res.error.code` is the failing code."
		},
		{
			"heading": "authoring-errors",
			"content": "Two styles are supported, chosen by context:"
		},
		{
			"heading": "authoring-errors",
			"content": "The `error` helper returns a typed error response from the handler. The typed exceptions throw, which is the right shape from deep inside a service or model where there is no return value to thread. Both end up as the same taxonomy entry, flow through the same mapping, and produce the same response envelope."
		},
		{
			"heading": "authoring-errors",
			"content": "Unknown errors become `INTERNAL_ERROR` in production with details hidden; in development they surface with the full stack. See Observability: logging for the correlation story."
		},
		{
			"heading": "custom-codes",
			"content": "The taxonomy is fixed, but it is extensible — not skippable. Custom codes register in `src/config/app.ts > errors` with a status mapping:"
		},
		{
			"heading": "custom-codes",
			"content": "Registered codes map to the matching HTTP status and flow through the same envelope, `onError` stage, and client typing as the built-in codes. Extend the taxonomy; never bypass it."
		},
		{
			"heading": "reaching-for-errors-from-any-stage",
			"content": "Middleware, guards, and handlers all produce errors through the same two styles. A guard denies with a returned error; a deep service or model throws a typed exception:"
		},
		{
			"heading": "reaching-for-errors-from-any-stage",
			"content": "Both enter the `onError` stage and resolve through identical mapping. The only rule is stylistic: return the helper where a value can be returned, throw the typed exception where it cannot (deep services, model internals). The taxonomy code, envelope, and client typing are identical either way."
		},
		{
			"heading": "response-shapes",
			"content": "API errors render as JSON with the taxonomy envelope:"
		},
		{
			"heading": "response-shapes",
			"content": "Page errors render as HTML through the route's error component or the root error boundary, themed and including the request ID. One taxonomy, two renderers — see Rendering for the page side."
		},
		{
			"heading": "response-shapes",
			"content": "Validation failures extend the envelope with field-level issues:"
		},
		{
			"heading": "response-shapes",
			"content": "The `issues` array is the same shape produced by the validation stage, so clients can render field errors directly. See Validation."
		},
		{
			"heading": "the-onerror-stage",
			"content": "Any throw or `error()` return in any lifecycle stage enters the `onError` stage:"
		},
		{
			"heading": "the-onerror-stage",
			"content": "Mapping order: typed exception, registered custom code, then `INTERNAL_ERROR`."
		},
		{
			"heading": "the-onerror-stage",
			"content": "`onError` hooks at app and controller scope can translate domain exceptions before mapping — for example, turning a payment-provider failure into a custom `PAYMENT` code."
		},
		{
			"heading": "the-onerror-stage",
			"content": "After mapping, the trace span records the code, and metrics count per code and route."
		},
		{
			"heading": "the-onerror-stage",
			"content": "The hooks run before taxonomy mapping, so domain translation is the place to widen the taxonomy for application-specific failures. Because mapping never runs twice on the same error, the pipeline degrades rather than loops."
		},
		{
			"heading": "model-layer-integration",
			"content": "The model layer throws into the same taxonomy, so handlers rarely map errors manually:"
		},
		{
			"heading": "model-layer-integration",
			"content": "`findOrFail` throws `NOT_FOUND`."
		},
		{
			"heading": "model-layer-integration",
			"content": "Unique-constraint violations throw `CONFLICT` with the offending field."
		},
		{
			"heading": "model-layer-integration",
			"content": "Soft-deleted rows are invisible by default, so reads of a trashed row return `NOT_FOUND`, not a special deleted state."
		},
		{
			"heading": "model-layer-integration",
			"content": "See Models and Soft deletes."
		},
		{
			"heading": "client-side-typing",
			"content": "The typed client returns discriminated errors with no string matching:"
		},
		{
			"heading": "client-side-typing",
			"content": "`res.error.code` is a union drawn from the taxonomy, so the branches typecheck and a typo is a compile error. The success branch narrows to `res.data`; the failure branch narrows `error` to the taxonomy union plus any registered custom codes. See Type Inference for how the client derives this."
		},
		{
			"heading": "logs-and-correlation",
			"content": "Every error response carries `requestId`, the same value as the `x-request-id` header. The structured log line for an error includes `level`, `code`, `route`, `requestId`, `tenantId`, and `traceId`:"
		},
		{
			"heading": "logs-and-correlation",
			"content": "Production hides internals for `INTERNAL_ERROR`; the development overlay shows the full stack with source maps."
		},
		{
			"heading": "failure-of-the-error-system",
			"content": "The error system degrades, never loops:"
		},
		{
			"heading": "failure-of-the-error-system",
			"content": "If the error handler itself throws, the request returns a plain 500 and an alert metric fires."
		},
		{
			"heading": "failure-of-the-error-system",
			"content": "If rendering an error page throws, a minimal built-in fallback page is served."
		},
		{
			"heading": "failure-of-the-error-system",
			"content": "Error mapping is the only code that can run after `onResponse`, and it only records span error attributes."
		},
		{
			"heading": "whats-next",
			"content": "HTTP errors — the taxonomy at the request layer"
		},
		{
			"heading": "whats-next",
			"content": "Validation — the `VALIDATION` code and the issues shape"
		},
		{
			"heading": "whats-next",
			"content": "Guards — where `UNAUTHORIZED` and `FORBIDDEN` originate"
		},
		{
			"heading": "whats-next",
			"content": "API: errors — the typed error contract on the client"
		},
		{
			"heading": "whats-next",
			"content": "Observability: logging — correlating errors with `requestId`"
		}
	],
	"headings": [
		{
			"id": "one-taxonomy-two-renderers",
			"content": "One Taxonomy, Two Renderers"
		},
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
			"id": "reaching-for-errors-from-any-stage",
			"content": "Reaching for Errors from Any Stage"
		},
		{
			"id": "response-shapes",
			"content": "Response Shapes"
		},
		{
			"id": "the-onerror-stage",
			"content": "The onError Stage"
		},
		{
			"id": "model-layer-integration",
			"content": "Model-Layer Integration"
		},
		{
			"id": "client-side-typing",
			"content": "Client-Side Typing"
		},
		{
			"id": "logs-and-correlation",
			"content": "Logs and Correlation"
		},
		{
			"id": "failure-of-the-error-system",
			"content": "Failure of the Error System"
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
		url: "#one-taxonomy-two-renderers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One Taxonomy, Two Renderers" })
	},
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
		url: "#reaching-for-errors-from-any-stage",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Reaching for Errors from Any Stage" })
	},
	{
		depth: 2,
		url: "#response-shapes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Response Shapes" })
	},
	{
		depth: 2,
		url: "#the-onerror-stage",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The onError Stage" })
	},
	{
		depth: 2,
		url: "#model-layer-integration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Model-Layer Integration" })
	},
	{
		depth: 2,
		url: "#client-side-typing",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Client-Side Typing" })
	},
	{
		depth: 2,
		url: "#logs-and-correlation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Logs and Correlation" })
	},
	{
		depth: 2,
		url: "#failure-of-the-error-system",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Failure of the Error System" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "one-taxonomy-two-renderers",
			children: "One Taxonomy, Two Renderers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva has exactly one error taxonomy and two renderers: JSON for API routes and HTML for pages. Every error — wherever it is thrown — maps to a code in the taxonomy, carries a request ID for correlation, and is typed on the client. There is no second, ad-hoc way to report failures, and no path around the taxonomy." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-taxonomy",
			children: "The Taxonomy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The taxonomy has one success resolution and seven error codes. Every request resolution lands on exactly one of them:" }),
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
			"This is the complete contract. Success statuses are the standard set — 200, 201, 204 — and every failure maps into one of the seven error codes, with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "OK" }),
			" reserved for success. The same table is used by the HTTP layer (",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/errors",
				children: "HTTP errors"
			}),
			") and the API client (",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/errors",
				children: "API errors"
			}),
			"), so a code means the same thing at every layer. On the typed client the discrimination is literal: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.ok" }),
			" is the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "OK" }),
			" resolution, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.error.code" }),
			" is the failing code."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "authoring-errors",
			children: "Authoring Errors"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two styles are supported, chosen by context:" }),
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
							children: " { error, NotFoundError, ForbiddenError } "
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// helper return — preferred in handlers"
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
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// typed exceptions — preferred in services and models"
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
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "error" }),
			" helper returns a typed error response from the handler. The typed exceptions throw, which is the right shape from deep inside a service or model where there is no return value to thread. Both end up as the same taxonomy entry, flow through the same mapping, and produce the same response envelope."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Unknown errors become ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "INTERNAL_ERROR" }),
			" in production with details hidden; in development they surface with the full stack. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/logging",
				children: "Observability: logging"
			}),
			" for the correlation story."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "custom-codes",
			children: "Custom Codes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The taxonomy is fixed, but it is extensible — not skippable. Custom codes register in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts > errors" }),
			" with a status mapping:"
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
						children: "// src/config/app.ts (excerpt)"
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
			"Registered codes map to the matching HTTP status and flow through the same envelope, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
			" stage, and client typing as the built-in codes. Extend the taxonomy; never bypass it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "reaching-for-errors-from-any-stage",
			children: "Reaching for Errors from Any Stage"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Middleware, guards, and handlers all produce errors through the same two styles. A guard denies with a returned error; a deep service or model throws a typed exception:" }),
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
			title: "reaching-for-errors-from-any-stage.ts",
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// in a guard's beforeHandle — return, don't throw"
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
							children: "beforeHandle"
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
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "error"
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
							children: "'UNAUTHORIZED'"
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
							children: "'sign in required'"
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
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// in a handler — same helper, same envelope"
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
							children: "if"
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
							children: "post) "
						}),
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
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Both enter the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
			" stage and resolve through identical mapping. The only rule is stylistic: return the helper where a value can be returned, throw the typed exception where it cannot (deep services, model internals). The taxonomy code, envelope, and client typing are identical either way."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "response-shapes",
			children: "Response Shapes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "API errors render as JSON with the taxonomy envelope:" }),
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
			title: "response-shapes.jsonc",
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
			"Page errors render as HTML through the route's error component or the root error boundary, themed and including the request ID. One taxonomy, two renderers — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering",
				children: "Rendering"
			}),
			" for the page side."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Validation failures extend the envelope with field-level issues:" }),
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
			title: "response-shapes-2.jsonc",
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
							children: "    \"issues\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": [{ "
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
							children: "\"too long\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }],"
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
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "issues" }),
			" array is the same shape produced by the validation stage, so clients can render field errors directly. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/validation",
				children: "Validation"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-onerror-stage",
			children: "The onError Stage"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Any throw or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "error()" }),
			" return in any lifecycle stage enters the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
			" stage:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Mapping order: typed exception, registered custom code, then ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "INTERNAL_ERROR" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
				" hooks at app and controller scope can translate domain exceptions before mapping — for example, turning a payment-provider failure into a custom ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PAYMENT" }),
				" code."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "After mapping, the trace span records the code, and metrics count per code and route." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The hooks run before taxonomy mapping, so domain translation is the place to widen the taxonomy for application-specific failures. Because mapping never runs twice on the same error, the pipeline degrades rather than loops." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "model-layer-integration",
			children: "Model-Layer Integration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The model layer throws into the same taxonomy, so handlers rarely map errors manually:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "findOrFail" }),
				" throws ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "NOT_FOUND" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Unique-constraint violations throw ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "CONFLICT" }),
				" with the offending field."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Soft-deleted rows are invisible by default, so reads of a trashed row return ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "NOT_FOUND" }),
				", not a special deleted state."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/soft-deletes",
				children: "Soft deletes"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "client-side-typing",
			children: "Client-Side Typing"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The typed client returns discriminated errors with no string matching:" }),
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
			title: "client-side-typing.ts",
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  console."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "log"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(res.data)      "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// the resolved payload, fully typed"
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
						children: "      // handle the policy denial"
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
						children: "      // handle the limit"
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
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.error.code" }),
			" is a union drawn from the taxonomy, so the branches typecheck and a typo is a compile error. The success branch narrows to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.data" }),
			"; the failure branch narrows ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "error" }),
			" to the taxonomy union plus any registered custom codes. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/type-inference",
				children: "Type Inference"
			}),
			" for how the client derives this."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "logs-and-correlation",
			children: "Logs and Correlation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every error response carries ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
			", the same value as the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-request-id" }),
			" header. The structured log line for an error includes ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "level" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "code" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "route" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantId" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "traceId" }),
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
			title: "logs-and-correlation.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "logger."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "error"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "({ code, route, requestId, tenantId, traceId }, "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: "'request failed'"
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
			"Production hides internals for ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "INTERNAL_ERROR" }),
			"; the development overlay shows the full stack with source maps."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "failure-of-the-error-system",
			children: "Failure of the Error System"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The error system degrades, never loops:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "If the error handler itself throws, the request returns a plain 500 and an alert metric fires." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "If rendering an error page throws, a minimal built-in fallback page is served." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Error mapping is the only code that can run after ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onResponse" }),
				", and it only records span error attributes."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/errors",
				children: "HTTP errors"
			}), " — the taxonomy at the request layer"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/validation",
					children: "Validation"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "VALIDATION" }),
				" code and the issues shape"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/guards",
					children: "Guards"
				}),
				" — where ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "UNAUTHORIZED" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "FORBIDDEN" }),
				" originate"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/errors",
				children: "API: errors"
			}), " — the typed error contract on the client"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/observability/logging",
					children: "Observability: logging"
				}),
				" — correlating errors with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" })
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
