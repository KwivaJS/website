import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/advanced/request-lifecycle.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Request Lifecycle",
	"description": "The full request pipeline from onRequest to onStop, hook scoping, context assembly, error mapping, and correlation with distributed tracing."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nEvery request a Kwiva application serves travels the same ordered pipeline. Middleware, guards, and handlers all depend on this contract, so the sequence is worth knowing precisely before attaching anything to it. This page walks all fourteen steps, then the hooks, scoping, context assembly, handler branches, error path, and the tracing waterfall that makes it observable.\n\n## The Pipeline, Step by Step [#the-pipeline-step-by-step]\n\n```plaintext title=\"the-pipeline-step-by-step.txt\"\n  1. client request\n  2. preset adapter                     → Web Request normalization\n  3. pipeline entry\n       request ID assigned              (x-request-id: set or forwarded)\n       server span begins               (http method, route)\n       onRequest middleware             (security headers, rate limit, CORS)\n  4. route manifest match               (generated model routes, controllers, server routes)\n  5. route rules apply                  (cache hit → serve + bypass pipeline)\n  6. context assembly\n       parse query / parse body         (json, form, multipart)\n       cookies decode, session load     (session store)\n       tenant resolution                (domain/path/header → ctx.tenant)\n       state / decorate / resolve       (typed app context)\n  7. onTransform                        → mutate parsed values\n  8. validation                         → body/query/params/headers/cookies\n  9. onBeforeHandle                     → guards: requireAuth, policy check\n 10. handler\n       ├─ API route   → controller action (service → model query → response)\n       └─ page route  → SSR render (beforeLoad → loaders → stream)\n 11. onAfterHandle                      → response shaping, cache tags\n 12. error path (any throw)             → taxonomy mapping → error response or error page\n 13. onResponse                         → final headers, span close, metrics\n 14. engine writes response             → preset adapter\n```\n\nSteps 3 through 13 run inside `@kwiva/http`; steps 2 and 14 happen at the adapter boundary that normalizes the incoming request and writes the final response. Whatever runtime you deploy on — the local dev server, a Node or Bun host, an edge worker — the normalization contract is identical: a Web `Request` in, a Web `Response` out.\n\nEvery numbered step is a trace span, so the waterfall carries one line per stage and a missed budget points at its stage.\n\n## The Lifecycle Hooks [#the-lifecycle-hooks]\n\nThe ordered hook surface is `onRequest → onParse → onTransform → onBeforeHandle → onAfterHandle → onResponse → onError → onStop`. Each hook is a place you can attach behavior — middleware, guards, or custom processing:\n\n| Hook             | When it runs                                | What to do there                                                                                 |\n| ---------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |\n| `onRequest`      | Pipeline entry, before routing is finalized | Security headers, rate limiting, CORS, request ID, early rejects                                 |\n| `onParse`        | Context assembly, body and query parsing    | Customize or redirect parsing of json, form, and multipart bodies                                |\n| `onTransform`    | After parse, before validation              | Mutate or normalize parsed values before schemas run                                             |\n| `onBeforeHandle` | After validation                            | Guards: `requireAuth`, policy checks, tenant derivation, any check that needs the validated body |\n| `onAfterHandle`  | After the handler returns                   | Response shaping, cache tags, custom headers                                                     |\n| `onResponse`     | Just before the response is written         | Final headers, span and metric bookkeeping                                                       |\n| `onError`        | Any throw in the pipeline                   | Error taxonomy mapping, error pages, structured logging                                          |\n| `onStop`         | Server shutdown                             | Cleanup and post-response bookkeeping                                                            |\n\nThe first six hooks run in order for every request. `onError` runs only when a stage throws or returns an error. `onStop` fires when the server shuts down, not per request — it is the hook that mirrors the boot sequence in reverse.\n\n## Hook Scoping: App, Controller, Route [#hook-scoping-app-controller-route]\n\nEvery hook can be attached at three scopes, and the scopes compose:\n\n* **App scope** — runs for every request in the application. This is where framework middleware like request ID, tracing, cookies, session, and tenancy live.\n* **Controller scope** — runs for every route served by a controller, and is the right place for resource-wide guards or a shared input normalization step.\n* **Route scope** — runs only for one specific route.\n\n```ts title=\"src/app/http/controllers/posts.ts\"\n// src/app/http/controllers/posts.ts\nimport { defineController } from '@kwiva/http'\n\nexport default defineController(\n  'posts',\n  (c) => ({\n    publish: c.post('/:id/publish', async ({ params, session }) => {\n      const post = await Post.findOrFail(params.id)\n      return post.update({ status: 'published', publishedAt: new Date() })\n    }, {\n      middleware: ['auth', 'tenant'],   // route-scoped middleware\n      permission: 'posts.publish',      // checked in onBeforeHandle\n    }),\n  }),\n  { prefix: '/posts', tags: ['posts'] },\n)\n```\n\nOrdering is strict: middleware runs in `src/config/app.ts > middleware[]` order and always before guards; a guard's `beforeHandle` runs after validation, so policy checks can read the validated body. Route and cache rules that short-circuit — like a public ISR page — do so before session load, which is how public pages skip authentication entirely.\n\n## Context Assembly [#context-assembly]\n\nBy the time the handler runs, the request has already surrendered everything you need into a typed context:\n\n| Member                                | What it holds                                   |\n| ------------------------------------- | ----------------------------------------------- |\n| `ctx.body`, `ctx.params`, `ctx.query` | Validated, typed input                          |\n| `ctx.set.status`                      | Response status of the current request          |\n| `ctx.store`                           | The shared typed store                          |\n| `ctx.session`                         | The typed session from the auth layer           |\n| `ctx.can`                             | Ability checks against policies                 |\n| `ctx.file`                            | Multipart file access with size and type checks |\n| `ctx.tenant`                          | The resolved tenant for tenancy-aware requests  |\n| `ctx.waitUntil`                       | Schedule edge-safe work after the response      |\n\nContext assembly runs in a fixed order: parse query and body, decode cookies and load the session, resolve the tenant (subdomain, path, header, or fixed single-tenant strategy), then run `state`, `decorate`, and `resolve` for per-request derivation.\n\n```ts title=\"src/bootstrap/app.ts\"\n// src/bootstrap/app.ts\nimport { defineApp } from '@kwiva/core'\n\nconst app = defineApp({ ... })\n\n// shared, typed state\napp.state({ locale: 'en', defaultPageSize: 20 })\n\n// decorate adds values to the context once\napp.decorate('slugs', () => slugs)\n\n// resolve derives a value per request — available to guards and handlers\napp.resolve('sessionUser', async (ctx) => {\n  return ctx.session?.user ?? null\n})\n```\n\nBecause resolution happens per request, derived values respect tenancy and session state instead of leaking across requests. Assembly happens once, in step 6, so every later stage reads the same assembled result.\n\n## The Handler Branch [#the-handler-branch]\n\nThe handler is one of two shapes depending on what the route matched:\n\n* An **API route** dispatches to a controller action — validation has already passed — which calls services and model queries and returns a response object.\n* A **page route** renders through SSR: `beforeLoad` guards, parallel loaders, then a streamed React tree.\n\nOn page routes, loaders may defer data so the shell streams while slower queries finish in the background.\n\n### The model and RPC view of the same branch [#the-model-and-rpc-view-of-the-same-branch]\n\nA typed RPC request from the client resolves to an API route and crosses the pipeline exactly like any other request:\n\n```plaintext title=\"the-model-and-rpc-view-of-the-same-branch.txt\"\nclient.posts.get(id)\n  → POST /api/posts/:id            (typed client → route)\n  → route manifest match           (step 4)\n  → context assembly + validation  (steps 6–8)\n  → controller action onBeforeHandle → permission check (step 9)\n  → Post.findOrFail(params.id)     (handler → model query, step 10)\n  → JSON response                  (steps 13–14)\n```\n\nBecause the client call, the route, and the model query all derive from the same IR, the RPC call is no separate protocol — it is the same pipeline, typed end to end.\n\n## The Error Path [#the-error-path]\n\nAny throw anywhere in the pipeline enters the error path. Errors are mapped to the framework's 8-code taxonomy and returned either as typed error responses for API calls or as error pages for page routes. This mapping is the only code that is allowed to run after `onResponse` — it records failure attributes on the already-open span and then closes the request. `onError` is where you add custom logging or error shaping before the mapped response goes out.\n\nAnything you attach to `onError` must tolerate a partially streamed SSR response and must never throw itself — an error in the error path would otherwise be unrecoverable.\n\n## Correlating with Distributed Tracing [#correlating-with-distributed-tracing]\n\nEvery stage above is a span in the distributed trace tree, so a single request produces a readable waterfall:\n\n```plaintext title=\"correlating-with-distributed-tracing.txt\"\nhttp GET /api/posts (server)\n ├─ middleware.request-id\n ├─ middleware.session\n ├─ middleware.tenant\n ├─ validation (route schema)\n ├─ controller posts.list\n │   └─ model posts.query (sql + params normalized)\n ├─ cache.get posts:...\n └─ http.response (status, size)\n```\n\nThe request ID flows out in the `x-request-id` header and is stamped onto every log line in scope, alongside the trace and span IDs. In development, `kwiva dev` shows the span waterfall and cache decisions in its overlay, and `server-timing` headers expose stage timing to the browser.\n\nThe timing budget shows why the stages matter — these are p50 targets on the example application:\n\n| Stage                         | Budget                         |\n| ----------------------------- | ------------------------------ |\n| Adapter to pipeline entry     | Under 1 ms                     |\n| Session and tenant resolution | Under 2 ms on a store hit      |\n| Validation                    | Under 0.5 ms (compiled schema) |\n| Handler (model list, 20 rows) | Under 5 ms                     |\n| Full API round-trip (local)   | Under 15 ms                    |\n| SSR shell (stream start)      | Under 50 ms                    |\n\nEach budget is a span by the same name, so a handler drifting from \"under 5 ms\" to \"under 30 ms\" shows in the trace before it reaches users.\n\n## Background Work After the Response [#background-work-after-the-response]\n\nEvents and queue dispatches happen inside handlers transaction-aware and acknowledge in-band. Use `ctx.waitUntil(promise)` for cleanup, metrics flushing, and best-effort work that must outlive the response but stay bounded and edge-safe. Durable, retried work belongs in the queue layer — see [Background Work](/docs/background-work) — not in post-response promises.\n\n## What's Next [#whats-next]\n\n* [Middleware](/docs/http/middleware) — Where middleware attaches in the pipeline\n* [Guards](/docs/http/guards) — The `onBeforeHandle` checkpoints and `requireAuth`\n* [Context](/docs/core-concepts/context) — The typed context, state, decorators, and resolution\n* [Tracing](/docs/observability/tracing) — The span tree that descends from every stage\n* [HTTP Lifecycle](/docs/http/lifecycle) — The same sequence summarized for controller authors\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Every request a Kwiva application serves travels the same ordered pipeline. Middleware, guards, and handlers all depend on this contract, so the sequence is worth knowing precisely before attaching anything to it. This page walks all fourteen steps, then the hooks, scoping, context assembly, handler branches, error path, and the tracing waterfall that makes it observable."
		},
		{
			"heading": "the-pipeline-step-by-step",
			"content": "Steps 3 through 13 run inside `@kwiva/http`; steps 2 and 14 happen at the adapter boundary that normalizes the incoming request and writes the final response. Whatever runtime you deploy on — the local dev server, a Node or Bun host, an edge worker — the normalization contract is identical: a Web `Request` in, a Web `Response` out."
		},
		{
			"heading": "the-pipeline-step-by-step",
			"content": "Every numbered step is a trace span, so the waterfall carries one line per stage and a missed budget points at its stage."
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "The ordered hook surface is `onRequest → onParse → onTransform → onBeforeHandle → onAfterHandle → onResponse → onError → onStop`. Each hook is a place you can attach behavior — middleware, guards, or custom processing:"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Hook"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "When it runs"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "What to do there"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "`onRequest`"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Pipeline entry, before routing is finalized"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Security headers, rate limiting, CORS, request ID, early rejects"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "`onParse`"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Context assembly, body and query parsing"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Customize or redirect parsing of json, form, and multipart bodies"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "`onTransform`"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "After parse, before validation"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Mutate or normalize parsed values before schemas run"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "`onBeforeHandle`"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "After validation"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Guards: `requireAuth`, policy checks, tenant derivation, any check that needs the validated body"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "`onAfterHandle`"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "After the handler returns"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Response shaping, cache tags, custom headers"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "`onResponse`"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Just before the response is written"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Final headers, span and metric bookkeeping"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "`onError`"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Any throw in the pipeline"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Error taxonomy mapping, error pages, structured logging"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "`onStop`"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Server shutdown"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "Cleanup and post-response bookkeeping"
		},
		{
			"heading": "the-lifecycle-hooks",
			"content": "The first six hooks run in order for every request. `onError` runs only when a stage throws or returns an error. `onStop` fires when the server shuts down, not per request — it is the hook that mirrors the boot sequence in reverse."
		},
		{
			"heading": "hook-scoping-app-controller-route",
			"content": "Every hook can be attached at three scopes, and the scopes compose:"
		},
		{
			"heading": "hook-scoping-app-controller-route",
			"content": "**App scope** — runs for every request in the application. This is where framework middleware like request ID, tracing, cookies, session, and tenancy live."
		},
		{
			"heading": "hook-scoping-app-controller-route",
			"content": "**Controller scope** — runs for every route served by a controller, and is the right place for resource-wide guards or a shared input normalization step."
		},
		{
			"heading": "hook-scoping-app-controller-route",
			"content": "**Route scope** — runs only for one specific route."
		},
		{
			"heading": "hook-scoping-app-controller-route",
			"content": "Ordering is strict: middleware runs in `src/config/app.ts > middleware[]` order and always before guards; a guard's `beforeHandle` runs after validation, so policy checks can read the validated body. Route and cache rules that short-circuit — like a public ISR page — do so before session load, which is how public pages skip authentication entirely."
		},
		{
			"heading": "context-assembly",
			"content": "By the time the handler runs, the request has already surrendered everything you need into a typed context:"
		},
		{
			"heading": "context-assembly",
			"content": "Member"
		},
		{
			"heading": "context-assembly",
			"content": "What it holds"
		},
		{
			"heading": "context-assembly",
			"content": "`ctx.body`, `ctx.params`, `ctx.query`"
		},
		{
			"heading": "context-assembly",
			"content": "Validated, typed input"
		},
		{
			"heading": "context-assembly",
			"content": "`ctx.set.status`"
		},
		{
			"heading": "context-assembly",
			"content": "Response status of the current request"
		},
		{
			"heading": "context-assembly",
			"content": "`ctx.store`"
		},
		{
			"heading": "context-assembly",
			"content": "The shared typed store"
		},
		{
			"heading": "context-assembly",
			"content": "`ctx.session`"
		},
		{
			"heading": "context-assembly",
			"content": "The typed session from the auth layer"
		},
		{
			"heading": "context-assembly",
			"content": "`ctx.can`"
		},
		{
			"heading": "context-assembly",
			"content": "Ability checks against policies"
		},
		{
			"heading": "context-assembly",
			"content": "`ctx.file`"
		},
		{
			"heading": "context-assembly",
			"content": "Multipart file access with size and type checks"
		},
		{
			"heading": "context-assembly",
			"content": "`ctx.tenant`"
		},
		{
			"heading": "context-assembly",
			"content": "The resolved tenant for tenancy-aware requests"
		},
		{
			"heading": "context-assembly",
			"content": "`ctx.waitUntil`"
		},
		{
			"heading": "context-assembly",
			"content": "Schedule edge-safe work after the response"
		},
		{
			"heading": "context-assembly",
			"content": "Context assembly runs in a fixed order: parse query and body, decode cookies and load the session, resolve the tenant (subdomain, path, header, or fixed single-tenant strategy), then run `state`, `decorate`, and `resolve` for per-request derivation."
		},
		{
			"heading": "context-assembly",
			"content": "Because resolution happens per request, derived values respect tenancy and session state instead of leaking across requests. Assembly happens once, in step 6, so every later stage reads the same assembled result."
		},
		{
			"heading": "the-handler-branch",
			"content": "The handler is one of two shapes depending on what the route matched:"
		},
		{
			"heading": "the-handler-branch",
			"content": "An **API route** dispatches to a controller action — validation has already passed — which calls services and model queries and returns a response object."
		},
		{
			"heading": "the-handler-branch",
			"content": "A **page route** renders through SSR: `beforeLoad` guards, parallel loaders, then a streamed React tree."
		},
		{
			"heading": "the-handler-branch",
			"content": "On page routes, loaders may defer data so the shell streams while slower queries finish in the background."
		},
		{
			"heading": "the-model-and-rpc-view-of-the-same-branch",
			"content": "A typed RPC request from the client resolves to an API route and crosses the pipeline exactly like any other request:"
		},
		{
			"heading": "the-model-and-rpc-view-of-the-same-branch",
			"content": "Because the client call, the route, and the model query all derive from the same IR, the RPC call is no separate protocol — it is the same pipeline, typed end to end."
		},
		{
			"heading": "the-error-path",
			"content": "Any throw anywhere in the pipeline enters the error path. Errors are mapped to the framework's 8-code taxonomy and returned either as typed error responses for API calls or as error pages for page routes. This mapping is the only code that is allowed to run after `onResponse` — it records failure attributes on the already-open span and then closes the request. `onError` is where you add custom logging or error shaping before the mapped response goes out."
		},
		{
			"heading": "the-error-path",
			"content": "Anything you attach to `onError` must tolerate a partially streamed SSR response and must never throw itself — an error in the error path would otherwise be unrecoverable."
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Every stage above is a span in the distributed trace tree, so a single request produces a readable waterfall:"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "The request ID flows out in the `x-request-id` header and is stamped onto every log line in scope, alongside the trace and span IDs. In development, `kwiva dev` shows the span waterfall and cache decisions in its overlay, and `server-timing` headers expose stage timing to the browser."
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "The timing budget shows why the stages matter — these are p50 targets on the example application:"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Stage"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Budget"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Adapter to pipeline entry"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Under 1 ms"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Session and tenant resolution"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Under 2 ms on a store hit"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Validation"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Under 0.5 ms (compiled schema)"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Handler (model list, 20 rows)"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Under 5 ms"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Full API round-trip (local)"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Under 15 ms"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "SSR shell (stream start)"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Under 50 ms"
		},
		{
			"heading": "correlating-with-distributed-tracing",
			"content": "Each budget is a span by the same name, so a handler drifting from \"under 5 ms\" to \"under 30 ms\" shows in the trace before it reaches users."
		},
		{
			"heading": "background-work-after-the-response",
			"content": "Events and queue dispatches happen inside handlers transaction-aware and acknowledge in-band. Use `ctx.waitUntil(promise)` for cleanup, metrics flushing, and best-effort work that must outlive the response but stay bounded and edge-safe. Durable, retried work belongs in the queue layer — see Background Work — not in post-response promises."
		},
		{
			"heading": "whats-next",
			"content": "Middleware — Where middleware attaches in the pipeline"
		},
		{
			"heading": "whats-next",
			"content": "Guards — The `onBeforeHandle` checkpoints and `requireAuth`"
		},
		{
			"heading": "whats-next",
			"content": "Context — The typed context, state, decorators, and resolution"
		},
		{
			"heading": "whats-next",
			"content": "Tracing — The span tree that descends from every stage"
		},
		{
			"heading": "whats-next",
			"content": "HTTP Lifecycle — The same sequence summarized for controller authors"
		}
	],
	"headings": [
		{
			"id": "the-pipeline-step-by-step",
			"content": "The Pipeline, Step by Step"
		},
		{
			"id": "the-lifecycle-hooks",
			"content": "The Lifecycle Hooks"
		},
		{
			"id": "hook-scoping-app-controller-route",
			"content": "Hook Scoping: App, Controller, Route"
		},
		{
			"id": "context-assembly",
			"content": "Context Assembly"
		},
		{
			"id": "the-handler-branch",
			"content": "The Handler Branch"
		},
		{
			"id": "the-model-and-rpc-view-of-the-same-branch",
			"content": "The model and RPC view of the same branch"
		},
		{
			"id": "the-error-path",
			"content": "The Error Path"
		},
		{
			"id": "correlating-with-distributed-tracing",
			"content": "Correlating with Distributed Tracing"
		},
		{
			"id": "background-work-after-the-response",
			"content": "Background Work After the Response"
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
		url: "#the-pipeline-step-by-step",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Pipeline, Step by Step" })
	},
	{
		depth: 2,
		url: "#the-lifecycle-hooks",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Lifecycle Hooks" })
	},
	{
		depth: 2,
		url: "#hook-scoping-app-controller-route",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Hook Scoping: App, Controller, Route" })
	},
	{
		depth: 2,
		url: "#context-assembly",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Context Assembly" })
	},
	{
		depth: 2,
		url: "#the-handler-branch",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Handler Branch" })
	},
	{
		depth: 3,
		url: "#the-model-and-rpc-view-of-the-same-branch",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The model and RPC view of the same branch" })
	},
	{
		depth: 2,
		url: "#the-error-path",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Error Path" })
	},
	{
		depth: 2,
		url: "#correlating-with-distributed-tracing",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Correlating with Distributed Tracing" })
	},
	{
		depth: 2,
		url: "#background-work-after-the-response",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Background Work After the Response" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every request a Kwiva application serves travels the same ordered pipeline. Middleware, guards, and handlers all depend on this contract, so the sequence is worth knowing precisely before attaching anything to it. This page walks all fourteen steps, then the hooks, scoping, context assembly, handler branches, error path, and the tracing waterfall that makes it observable." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-pipeline-step-by-step",
			children: "The Pipeline, Step by Step"
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
			title: "the-pipeline-step-by-step.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  1. client request" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  2. preset adapter                     → Web Request normalization" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  3. pipeline entry" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       request ID assigned              (x-request-id: set or forwarded)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       server span begins               (http method, route)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       onRequest middleware             (security headers, rate limit, CORS)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  4. route manifest match               (generated model routes, controllers, server routes)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  5. route rules apply                  (cache hit → serve + bypass pipeline)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  6. context assembly" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       parse query / parse body         (json, form, multipart)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       cookies decode, session load     (session store)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       tenant resolution                (domain/path/header → ctx.tenant)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       state / decorate / resolve       (typed app context)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  7. onTransform                        → mutate parsed values" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  8. validation                         → body/query/params/headers/cookies" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  9. onBeforeHandle                     → guards: requireAuth, policy check" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 10. handler" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       ├─ API route   → controller action (service → model query → response)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "       └─ page route  → SSR render (beforeLoad → loaders → stream)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 11. onAfterHandle                      → response shaping, cache tags" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 12. error path (any throw)             → taxonomy mapping → error response or error page" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 13. onResponse                         → final headers, span close, metrics" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " 14. engine writes response             → preset adapter" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Steps 3 through 13 run inside ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
			"; steps 2 and 14 happen at the adapter boundary that normalizes the incoming request and writes the final response. Whatever runtime you deploy on — the local dev server, a Node or Bun host, an edge worker — the normalization contract is identical: a Web ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Request" }),
			" in, a Web ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Response" }),
			" out."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every numbered step is a trace span, so the waterfall carries one line per stage and a missed budget points at its stage." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-lifecycle-hooks",
			children: "The Lifecycle Hooks"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ordered hook surface is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onRequest → onParse → onTransform → onBeforeHandle → onAfterHandle → onResponse → onError → onStop" }),
			". Each hook is a place you can attach behavior — middleware, guards, or custom processing:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Hook" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "When it runs" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What to do there" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onRequest" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pipeline entry, before routing is finalized" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Security headers, rate limiting, CORS, request ID, early rejects" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onParse" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Context assembly, body and query parsing" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Customize or redirect parsing of json, form, and multipart bodies" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onTransform" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "After parse, before validation" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Mutate or normalize parsed values before schemas run" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onBeforeHandle" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "After validation" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Guards: ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requireAuth" }),
					", policy checks, tenant derivation, any check that needs the validated body"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onAfterHandle" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "After the handler returns" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Response shaping, cache tags, custom headers" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onResponse" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Just before the response is written" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Final headers, span and metric bookkeeping" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Any throw in the pipeline" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Error taxonomy mapping, error pages, structured logging" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onStop" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server shutdown" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cleanup and post-response bookkeeping" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The first six hooks run in order for every request. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
			" runs only when a stage throws or returns an error. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onStop" }),
			" fires when the server shuts down, not per request — it is the hook that mirrors the boot sequence in reverse."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "hook-scoping-app-controller-route",
			children: "Hook Scoping: App, Controller, Route"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every hook can be attached at three scopes, and the scopes compose:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "App scope" }), " — runs for every request in the application. This is where framework middleware like request ID, tracing, cookies, session, and tenancy live."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Controller scope" }), " — runs for every route served by a controller, and is the right place for resource-wide guards or a shared input normalization step."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Route scope" }), " — runs only for one specific route."] }),
			"\n"
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
			title: "src/app/http/controllers/posts.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/http/controllers/posts.ts"
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
							children: " { defineController } "
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
							children: " defineController"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: "  'posts'"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ","
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
							children: "  ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "c"
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
							children: "    publish: c."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "post"
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
							children: "'/:id/publish'"
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
							children: "params"
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
							children: "      const"
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
							children: " Post."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "findOrFail"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(params.id)"
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
							children: "      return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " post."
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
							children: "({ status: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'published'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", publishedAt: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "new"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " Date"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "() })"
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
						children: "    }, {"
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
							children: "      middleware: ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'auth'"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'tenant'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "],   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// route-scoped middleware"
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
							children: "      permission: "
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
							children: ",      "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// checked in onBeforeHandle"
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
						children: "    }),"
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
						children: "  }),"
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
							children: "  { prefix: "
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
							children: ", tags: ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'posts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "] },"
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
						children: ")"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Ordering is strict: middleware runs in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts > middleware[]" }),
			" order and always before guards; a guard's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeHandle" }),
			" runs after validation, so policy checks can read the validated body. Route and cache rules that short-circuit — like a public ISR page — do so before session load, which is how public pages skip authentication entirely."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "context-assembly",
			children: "Context Assembly"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "By the time the handler runs, the request has already surrendered everything you need into a typed context:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Member" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it holds" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.body" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.params" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.query" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Validated, typed input" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.set.status" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Response status of the current request" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.store" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The shared typed store" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The typed session from the auth layer" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.can" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Ability checks against policies" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.file" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Multipart file access with size and type checks" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.tenant" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The resolved tenant for tenancy-aware requests" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.waitUntil" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Schedule edge-safe work after the response" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Context assembly runs in a fixed order: parse query and body, decode cookies and load the session, resolve the tenant (subdomain, path, header, or fixed single-tenant strategy), then run ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "state" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "decorate" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "resolve" }),
			" for per-request derivation."
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
			title: "src/bootstrap/app.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/bootstrap/app.ts"
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
							children: " { defineApp } "
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
							children: " '@kwiva/core'"
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
							children: " app"
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
							children: " defineApp"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ "
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
							children: " })"
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
						children: "// shared, typed state"
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
							children: "app."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "state"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ locale: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'en'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", defaultPageSize: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "20"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// decorate adds values to the context once"
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
							children: "app."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "decorate"
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
							children: "'slugs'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", () "
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
							children: " slugs)"
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
						children: "// resolve derives a value per request — available to guards and handlers"
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
							children: "app."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "resolve"
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
							children: "'sessionUser'"
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
							children: " ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "ctx"
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
							children: "  return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ctx.session?.user "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "??"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " null"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because resolution happens per request, derived values respect tenancy and session state instead of leaking across requests. Assembly happens once, in step 6, so every later stage reads the same assembled result." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-handler-branch",
			children: "The Handler Branch"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The handler is one of two shapes depending on what the route matched:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"An ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "API route" }),
				" dispatches to a controller action — validation has already passed — which calls services and model queries and returns a response object."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "page route" }),
				" renders through SSR: ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
				" guards, parallel loaders, then a streamed React tree."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "On page routes, loaders may defer data so the shell streams while slower queries finish in the background." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "the-model-and-rpc-view-of-the-same-branch",
			children: "The model and RPC view of the same branch"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A typed RPC request from the client resolves to an API route and crosses the pipeline exactly like any other request:" }),
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
			title: "the-model-and-rpc-view-of-the-same-branch.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "client.posts.get(id)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → POST /api/posts/:id            (typed client → route)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → route manifest match           (step 4)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → context assembly + validation  (steps 6–8)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → controller action onBeforeHandle → permission check (step 9)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → Post.findOrFail(params.id)     (handler → model query, step 10)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → JSON response                  (steps 13–14)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the client call, the route, and the model query all derive from the same IR, the RPC call is no separate protocol — it is the same pipeline, typed end to end." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-error-path",
			children: "The Error Path"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Any throw anywhere in the pipeline enters the error path. Errors are mapped to the framework's 8-code taxonomy and returned either as typed error responses for API calls or as error pages for page routes. This mapping is the only code that is allowed to run after ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onResponse" }),
			" — it records failure attributes on the already-open span and then closes the request. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
			" is where you add custom logging or error shaping before the mapped response goes out."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Anything you attach to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onError" }),
			" must tolerate a partially streamed SSR response and must never throw itself — an error in the error path would otherwise be unrecoverable."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "correlating-with-distributed-tracing",
			children: "Correlating with Distributed Tracing"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every stage above is a span in the distributed trace tree, so a single request produces a readable waterfall:" }),
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
			title: "correlating-with-distributed-tracing.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "http GET /api/posts (server)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ middleware.request-id" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ middleware.session" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ middleware.tenant" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ validation (route schema)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ controller posts.list" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " │   └─ model posts.query (sql + params normalized)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " ├─ cache.get posts:..." })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: " └─ http.response (status, size)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The request ID flows out in the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-request-id" }),
			" header and is stamped onto every log line in scope, alongside the trace and span IDs. In development, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" shows the span waterfall and cache decisions in its overlay, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "server-timing" }),
			" headers expose stage timing to the browser."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The timing budget shows why the stages matter — these are p50 targets on the example application:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Stage" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Budget" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Adapter to pipeline entry" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 1 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Session and tenant resolution" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 2 ms on a store hit" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Validation" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 0.5 ms (compiled schema)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Handler (model list, 20 rows)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 5 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Full API round-trip (local)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 15 ms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR shell (stream start)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Under 50 ms" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each budget is a span by the same name, so a handler drifting from \"under 5 ms\" to \"under 30 ms\" shows in the trace before it reaches users." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "background-work-after-the-response",
			children: "Background Work After the Response"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Events and queue dispatches happen inside handlers transaction-aware and acknowledge in-band. Use ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.waitUntil(promise)" }),
			" for cleanup, metrics flushing, and best-effort work that must outlive the response but stay bounded and edge-safe. Durable, retried work belongs in the queue layer — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work",
				children: "Background Work"
			}),
			" — not in post-response promises."
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
				href: "/docs/http/middleware",
				children: "Middleware"
			}), " — Where middleware attaches in the pipeline"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/guards",
					children: "Guards"
				}),
				" — The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onBeforeHandle" }),
				" checkpoints and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requireAuth" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/context",
				children: "Context"
			}), " — The typed context, state, decorators, and resolution"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Tracing"
			}), " — The span tree that descends from every stage"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "HTTP Lifecycle"
			}), " — The same sequence summarized for controller authors"] }),
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
