import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/testing/integration-testing.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Integration Testing",
	"description": "Boot the real application with the withApp harness, use database traits and model-aware fakes, and assert behavior across real routes."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nIntegration tests are where an application proves it works as a whole — not just that its pieces return the right values, but that routes, services, data, and infrastructure compose correctly. Kwiva's `withApp` harness boots the real application for each test, so integration tests exercise the same kernel, adapters, and generated routes that production runs, with only slow or external infrastructure swapped for in-memory equivalents.\n\n## The Harness [#the-harness]\n\nEvery integration test is a call to `withApp`:\n\n```ts title=\"the-harness.ts\"\nimport { withApp, createTestClient } from '@kwiva/testing'\n\ntest('posts CRUD', withApp(async (app) => {\n  const client = createTestClient(app)\n\n  const created = await client.posts.create({ title: 'First' })\n  expect(created.data.title).toBe('First')\n\n  const { data, total } = await client.posts.list({ where: { title: 'First' } })\n  expect(total).toBe(1)\n}))\n```\n\nInside `withApp` you receive a fully booted application. The harness does the bookkeeping that would otherwise clutter every test file:\n\n* Test-mode config and environment\n* Migrations applied against an in-memory database\n* Factories seeded so standard data is present\n* The real kernel, adapters, and middleware stack active\n\nEverything inside the callback is real code under real routing. What is fake is scope: the database is in memory, and infrastructure such as the queue and storage may be faked per test.\n\n## What the Harness Boots [#what-the-harness-boots]\n\n`withApp` boots the same kernel production boots — `defineApp` composition, module contributions, middleware stack, providers — because the composition story is part of what is under test. A route contributed by a module is integration-tested exactly where production serves it. The only substitutions are the in-memory equivalents for persistence and transport that would otherwise make a test slow or hermetic.\n\nThat means the harness doubles as a **composition test**: if module wiring, provider order, or config precedence breaks, the integration suite is where it surfaces — not in production.\n\n## The In-Process Client [#the-in-process-client]\n\nThe typed client used inside the harness is `createTestClient(app)` — the in-process client that calls the app directly, with no network hop. Types flow from controller and model definitions as they do for the production client, so integration tests get the same end-to-end type inference that the shipped RPC client enjoys, but without sockets, ports, or serialization round-trips.\n\nBecause the client is typed against this app's controllers, a change to a controller signature is caught by the test suite's typecheck before the first assertion runs.\n\n## Database Traits [#database-traits]\n\nData handling is a trait of the harness, selected by how `withApp` is configured:\n\n| Trait                | Behavior                                              | Use when                                    |\n| -------------------- | ----------------------------------------------------- | ------------------------------------------- |\n| Transaction-per-test | each test runs in a transaction rolled back afterward | the default for most tests — fast, isolated |\n| Fresh migrations     | drop and migrate for the test                         | migration-heavy or schema-switching tests   |\n\n```ts title=\"database-traits.ts\"\ntest('seeders produce the reference catalog', withApp({ db: 'fresh' }, async (app) => {\n  // migrations applied from scratch; seeders run\n}))\n```\n\nTransaction-per-test rolls back between tests, which keeps the suite fast and makes test ordering irrelevant: every test sees the same starting world. Fresh migrations are the escape hatch when the test's subject is the schema itself — a migration sequence, a seeder's output against a clean database, or a schema switch.\n\n## Request Correlation [#request-correlation]\n\nBecause the harness boots real middleware, cross-cutting behavior is real too. Request id and tracing middleware run in integration tests, so assertions about correlation behavior — a `x-request-id` header, log lines bound to the request, tenant context flowing into storage keys — are made against the actual stack, not a simulation.\n\nThis matters for two kinds of test: correctness of the observability contract, and catching regressions where request-scoped plumbing (such as the tenant key) fails to propagate to the client call.\n\n## Fakes [#fakes]\n\nFakes replace infrastructure while keeping the test in-process. Swap the real implementation for a recording double, run the flow, then assert on what was pushed, stored, or emitted.\n\n```ts title=\"fakes.ts\"\ntest('welcome email on signup', withApp(async (app) => {\n  queue.fake()\n  storage.fake()\n\n  const client = createTestClient(app)\n  await client.auth.signUp({ email: 'a@b.dev', password: 'swordfish123' })\n\n  expect(queue.assertPushed('send-welcome')).toBe(true)\n  expect(queue.assertNotPushed('invoice-paid')).toBe(true)\n}))\n```\n\n| Fake               | What it records             | Example assertion                              |\n| ------------------ | --------------------------- | ---------------------------------------------- |\n| `queue.fake()`     | pushed jobs and payloads    | `queue.assertPushed('send-welcome')`           |\n| `storage.fake()`   | stored paths and bytes      | stored file exists at the expected tenant path |\n| `http.fake()`      | outbound client calls       | stubbed response shape returned                |\n| `broadcast.fake()` | emitted channels and events | channel received the expected event            |\n\nFakes assert positive and negative effects both ways — `assertPushed` and `assertNotPushed` — so an integration test can prove that a flow dispatched the expected job and, just as importantly, did not dispatch an unwanted one.\n\n## Combining Real and Fake [#combining-real-and-fake]\n\nThe harness is designed for mixes. A test can keep the real database for rows while faking the queue so no worker runs during the test, then assert the job was pushed rather than executed. Another test can keep storage real so generated file bytes are readable, while faking broadcast to avoid realtime side effects.\n\nThe general rule: &#x2A;*fake whatever has side effects beyond the app process; keep everything else real.** In-memory engines and fakes cover the first case, and the real kernel covers the second.\n\n## Tenancy in Integration Tests [#tenancy-in-integration-tests]\n\nTenant behavior integrates cleanly because resolution runs in the harness:\n\n```ts title=\"tenancy-in-integration-tests.ts\"\nwithApp(async (app) => {\n  const acme = app.asTenant('acme')\n  const client = createTestClient(app, { tenant: acme })\n  // requests are scoped; a cross-tenant read asserts 404\n})\n```\n\nTenant context flows into storage keys, cache keys, and queue payloads the same way it does in production, so integration tests double as tenancy tests — including the isolation invariants documented in [Tenant Isolation](/docs/tenancy/isolation).\n\n## When to Reach for Integration Tests [#when-to-reach-for-integration-tests]\n\nReach for `withApp` when the subject is a composed behavior:\n\n* A multi-step flow that crosses routes, services, and data — signup to welcome job to stored artifact\n* Middleware ordering and request-scoped plumbing\n* Module contributions interacting with application code\n* Schema and seeder behavior against an in-memory database (with `db: 'fresh'`)\n* Anything where the failure mode lives in the wiring, not the logic\n\nUnit tests pin the logic; API tests pin the request contract; integration tests prove the composition. If a test needs the real kernel but none of the HTTP contract, it belongs here.\n\n## What's Next [#whats-next]\n\n* [API Testing](/docs/testing/api-testing) — asserting responses and errors through the client\n* [Unit Testing](/docs/testing/unit-testing) — the fast layer beneath integration tests\n* [Fakes in Depth](/docs/data/factories) — model-aware factories that seed the harness\n* [Tenant Isolation](/docs/tenancy/isolation) — tenancy invariants exercised in the harness\n* [Testing](/docs/testing) — where integration sits in the pyramid\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Integration tests are where an application proves it works as a whole — not just that its pieces return the right values, but that routes, services, data, and infrastructure compose correctly. Kwiva's `withApp` harness boots the real application for each test, so integration tests exercise the same kernel, adapters, and generated routes that production runs, with only slow or external infrastructure swapped for in-memory equivalents."
		},
		{
			"heading": "the-harness",
			"content": "Every integration test is a call to `withApp`:"
		},
		{
			"heading": "the-harness",
			"content": "Inside `withApp` you receive a fully booted application. The harness does the bookkeeping that would otherwise clutter every test file:"
		},
		{
			"heading": "the-harness",
			"content": "Test-mode config and environment"
		},
		{
			"heading": "the-harness",
			"content": "Migrations applied against an in-memory database"
		},
		{
			"heading": "the-harness",
			"content": "Factories seeded so standard data is present"
		},
		{
			"heading": "the-harness",
			"content": "The real kernel, adapters, and middleware stack active"
		},
		{
			"heading": "the-harness",
			"content": "Everything inside the callback is real code under real routing. What is fake is scope: the database is in memory, and infrastructure such as the queue and storage may be faked per test."
		},
		{
			"heading": "what-the-harness-boots",
			"content": "`withApp` boots the same kernel production boots — `defineApp` composition, module contributions, middleware stack, providers — because the composition story is part of what is under test. A route contributed by a module is integration-tested exactly where production serves it. The only substitutions are the in-memory equivalents for persistence and transport that would otherwise make a test slow or hermetic."
		},
		{
			"heading": "what-the-harness-boots",
			"content": "That means the harness doubles as a **composition test**: if module wiring, provider order, or config precedence breaks, the integration suite is where it surfaces — not in production."
		},
		{
			"heading": "the-in-process-client",
			"content": "The typed client used inside the harness is `createTestClient(app)` — the in-process client that calls the app directly, with no network hop. Types flow from controller and model definitions as they do for the production client, so integration tests get the same end-to-end type inference that the shipped RPC client enjoys, but without sockets, ports, or serialization round-trips."
		},
		{
			"heading": "the-in-process-client",
			"content": "Because the client is typed against this app's controllers, a change to a controller signature is caught by the test suite's typecheck before the first assertion runs."
		},
		{
			"heading": "database-traits",
			"content": "Data handling is a trait of the harness, selected by how `withApp` is configured:"
		},
		{
			"heading": "database-traits",
			"content": "Trait"
		},
		{
			"heading": "database-traits",
			"content": "Behavior"
		},
		{
			"heading": "database-traits",
			"content": "Use when"
		},
		{
			"heading": "database-traits",
			"content": "Transaction-per-test"
		},
		{
			"heading": "database-traits",
			"content": "each test runs in a transaction rolled back afterward"
		},
		{
			"heading": "database-traits",
			"content": "the default for most tests — fast, isolated"
		},
		{
			"heading": "database-traits",
			"content": "Fresh migrations"
		},
		{
			"heading": "database-traits",
			"content": "drop and migrate for the test"
		},
		{
			"heading": "database-traits",
			"content": "migration-heavy or schema-switching tests"
		},
		{
			"heading": "database-traits",
			"content": "Transaction-per-test rolls back between tests, which keeps the suite fast and makes test ordering irrelevant: every test sees the same starting world. Fresh migrations are the escape hatch when the test's subject is the schema itself — a migration sequence, a seeder's output against a clean database, or a schema switch."
		},
		{
			"heading": "request-correlation",
			"content": "Because the harness boots real middleware, cross-cutting behavior is real too. Request id and tracing middleware run in integration tests, so assertions about correlation behavior — a `x-request-id` header, log lines bound to the request, tenant context flowing into storage keys — are made against the actual stack, not a simulation."
		},
		{
			"heading": "request-correlation",
			"content": "This matters for two kinds of test: correctness of the observability contract, and catching regressions where request-scoped plumbing (such as the tenant key) fails to propagate to the client call."
		},
		{
			"heading": "fakes",
			"content": "Fakes replace infrastructure while keeping the test in-process. Swap the real implementation for a recording double, run the flow, then assert on what was pushed, stored, or emitted."
		},
		{
			"heading": "fakes",
			"content": "Fake"
		},
		{
			"heading": "fakes",
			"content": "What it records"
		},
		{
			"heading": "fakes",
			"content": "Example assertion"
		},
		{
			"heading": "fakes",
			"content": "`queue.fake()`"
		},
		{
			"heading": "fakes",
			"content": "pushed jobs and payloads"
		},
		{
			"heading": "fakes",
			"content": "`queue.assertPushed('send-welcome')`"
		},
		{
			"heading": "fakes",
			"content": "`storage.fake()`"
		},
		{
			"heading": "fakes",
			"content": "stored paths and bytes"
		},
		{
			"heading": "fakes",
			"content": "stored file exists at the expected tenant path"
		},
		{
			"heading": "fakes",
			"content": "`http.fake()`"
		},
		{
			"heading": "fakes",
			"content": "outbound client calls"
		},
		{
			"heading": "fakes",
			"content": "stubbed response shape returned"
		},
		{
			"heading": "fakes",
			"content": "`broadcast.fake()`"
		},
		{
			"heading": "fakes",
			"content": "emitted channels and events"
		},
		{
			"heading": "fakes",
			"content": "channel received the expected event"
		},
		{
			"heading": "fakes",
			"content": "Fakes assert positive and negative effects both ways — `assertPushed` and `assertNotPushed` — so an integration test can prove that a flow dispatched the expected job and, just as importantly, did not dispatch an unwanted one."
		},
		{
			"heading": "combining-real-and-fake",
			"content": "The harness is designed for mixes. A test can keep the real database for rows while faking the queue so no worker runs during the test, then assert the job was pushed rather than executed. Another test can keep storage real so generated file bytes are readable, while faking broadcast to avoid realtime side effects."
		},
		{
			"heading": "combining-real-and-fake",
			"content": "The general rule: &#x2A;*fake whatever has side effects beyond the app process; keep everything else real.** In-memory engines and fakes cover the first case, and the real kernel covers the second."
		},
		{
			"heading": "tenancy-in-integration-tests",
			"content": "Tenant behavior integrates cleanly because resolution runs in the harness:"
		},
		{
			"heading": "tenancy-in-integration-tests",
			"content": "Tenant context flows into storage keys, cache keys, and queue payloads the same way it does in production, so integration tests double as tenancy tests — including the isolation invariants documented in Tenant Isolation."
		},
		{
			"heading": "when-to-reach-for-integration-tests",
			"content": "Reach for `withApp` when the subject is a composed behavior:"
		},
		{
			"heading": "when-to-reach-for-integration-tests",
			"content": "A multi-step flow that crosses routes, services, and data — signup to welcome job to stored artifact"
		},
		{
			"heading": "when-to-reach-for-integration-tests",
			"content": "Middleware ordering and request-scoped plumbing"
		},
		{
			"heading": "when-to-reach-for-integration-tests",
			"content": "Module contributions interacting with application code"
		},
		{
			"heading": "when-to-reach-for-integration-tests",
			"content": "Schema and seeder behavior against an in-memory database (with `db: 'fresh'`)"
		},
		{
			"heading": "when-to-reach-for-integration-tests",
			"content": "Anything where the failure mode lives in the wiring, not the logic"
		},
		{
			"heading": "when-to-reach-for-integration-tests",
			"content": "Unit tests pin the logic; API tests pin the request contract; integration tests prove the composition. If a test needs the real kernel but none of the HTTP contract, it belongs here."
		},
		{
			"heading": "whats-next",
			"content": "API Testing — asserting responses and errors through the client"
		},
		{
			"heading": "whats-next",
			"content": "Unit Testing — the fast layer beneath integration tests"
		},
		{
			"heading": "whats-next",
			"content": "Fakes in Depth — model-aware factories that seed the harness"
		},
		{
			"heading": "whats-next",
			"content": "Tenant Isolation — tenancy invariants exercised in the harness"
		},
		{
			"heading": "whats-next",
			"content": "Testing — where integration sits in the pyramid"
		}
	],
	"headings": [
		{
			"id": "the-harness",
			"content": "The Harness"
		},
		{
			"id": "what-the-harness-boots",
			"content": "What the Harness Boots"
		},
		{
			"id": "the-in-process-client",
			"content": "The In-Process Client"
		},
		{
			"id": "database-traits",
			"content": "Database Traits"
		},
		{
			"id": "request-correlation",
			"content": "Request Correlation"
		},
		{
			"id": "fakes",
			"content": "Fakes"
		},
		{
			"id": "combining-real-and-fake",
			"content": "Combining Real and Fake"
		},
		{
			"id": "tenancy-in-integration-tests",
			"content": "Tenancy in Integration Tests"
		},
		{
			"id": "when-to-reach-for-integration-tests",
			"content": "When to Reach for Integration Tests"
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
		url: "#the-harness",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Harness" })
	},
	{
		depth: 2,
		url: "#what-the-harness-boots",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What the Harness Boots" })
	},
	{
		depth: 2,
		url: "#the-in-process-client",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The In-Process Client" })
	},
	{
		depth: 2,
		url: "#database-traits",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Database Traits" })
	},
	{
		depth: 2,
		url: "#request-correlation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Request Correlation" })
	},
	{
		depth: 2,
		url: "#fakes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Fakes" })
	},
	{
		depth: 2,
		url: "#combining-real-and-fake",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Combining Real and Fake" })
	},
	{
		depth: 2,
		url: "#tenancy-in-integration-tests",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Tenancy in Integration Tests" })
	},
	{
		depth: 2,
		url: "#when-to-reach-for-integration-tests",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When to Reach for Integration Tests" })
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
			"Integration tests are where an application proves it works as a whole — not just that its pieces return the right values, but that routes, services, data, and infrastructure compose correctly. Kwiva's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" }),
			" harness boots the real application for each test, so integration tests exercise the same kernel, adapters, and generated routes that production runs, with only slow or external infrastructure swapped for in-memory equivalents."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-harness",
			children: "The Harness"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every integration test is a call to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" }),
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
			title: "the-harness.ts",
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
							children: " { withApp, createTestClient } "
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
							children: " '@kwiva/testing'"
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
							children: "test"
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
							children: "'posts CRUD'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "withApp"
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
							children: "app"
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
							children: "  const"
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
							children: "  const"
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
							children: "'First'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  expect"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(created.data.title)."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "toBe"
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
							children: "'First'"
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
							children: "  const"
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
							children: "({ where: { title: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'First'"
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
							children: "  expect"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(total)."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "toBe"
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
							children: ")"
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
						children: "}))"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Inside ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" }),
			" you receive a fully booted application. The harness does the bookkeeping that would otherwise clutter every test file:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Test-mode config and environment" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Migrations applied against an in-memory database" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Factories seeded so standard data is present" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The real kernel, adapters, and middleware stack active" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Everything inside the callback is real code under real routing. What is fake is scope: the database is in memory, and infrastructure such as the queue and storage may be faked per test." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-the-harness-boots",
			children: "What the Harness Boots"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" }),
			" boots the same kernel production boots — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
			" composition, module contributions, middleware stack, providers — because the composition story is part of what is under test. A route contributed by a module is integration-tested exactly where production serves it. The only substitutions are the in-memory equivalents for persistence and transport that would otherwise make a test slow or hermetic."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"That means the harness doubles as a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "composition test" }),
			": if module wiring, provider order, or config precedence breaks, the integration suite is where it surfaces — not in production."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-in-process-client",
			children: "The In-Process Client"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The typed client used inside the harness is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createTestClient(app)" }),
			" — the in-process client that calls the app directly, with no network hop. Types flow from controller and model definitions as they do for the production client, so integration tests get the same end-to-end type inference that the shipped RPC client enjoys, but without sockets, ports, or serialization round-trips."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the client is typed against this app's controllers, a change to a controller signature is caught by the test suite's typecheck before the first assertion runs." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "database-traits",
			children: "Database Traits"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Data handling is a trait of the harness, selected by how ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" }),
			" is configured:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Trait" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Use when" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Transaction-per-test" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "each test runs in a transaction rolled back afterward" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "the default for most tests — fast, isolated" })
		] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Fresh migrations" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "drop and migrate for the test" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "migration-heavy or schema-switching tests" })
		] })] })] }),
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
			title: "database-traits.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "test"
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
							children: "'seeders produce the reference catalog'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "withApp"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ db: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'fresh'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }, "
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
							children: "app"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // migrations applied from scratch; seeders run"
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
						children: "}))"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Transaction-per-test rolls back between tests, which keeps the suite fast and makes test ordering irrelevant: every test sees the same starting world. Fresh migrations are the escape hatch when the test's subject is the schema itself — a migration sequence, a seeder's output against a clean database, or a schema switch." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "request-correlation",
			children: "Request Correlation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the harness boots real middleware, cross-cutting behavior is real too. Request id and tracing middleware run in integration tests, so assertions about correlation behavior — a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-request-id" }),
			" header, log lines bound to the request, tenant context flowing into storage keys — are made against the actual stack, not a simulation."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This matters for two kinds of test: correctness of the observability contract, and catching regressions where request-scoped plumbing (such as the tenant key) fails to propagate to the client call." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "fakes",
			children: "Fakes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Fakes replace infrastructure while keeping the test in-process. Swap the real implementation for a recording double, run the flow, then assert on what was pushed, stored, or emitted." }),
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
			title: "fakes.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "test"
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
							children: "'welcome email on signup'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "withApp"
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
							children: "app"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  queue."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "fake"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  storage."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "fake"
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
							children: "  const"
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
							children: "  await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " client.auth."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "signUp"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ email: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'a@b.dev'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", password: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'swordfish123'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  expect"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(queue."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "assertPushed"
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
							children: "'send-welcome'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "))."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "toBe"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  expect"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(queue."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "assertNotPushed"
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
							children: "'invoice-paid'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "))."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "toBe"
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
							children: ")"
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
						children: "}))"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Fake" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it records" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example assertion" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.fake()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "pushed jobs and payloads" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.assertPushed('send-welcome')" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage.fake()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "stored paths and bytes" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "stored file exists at the expected tenant path" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http.fake()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "outbound client calls" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "stubbed response shape returned" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "broadcast.fake()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "emitted channels and events" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "channel received the expected event" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Fakes assert positive and negative effects both ways — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "assertPushed" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "assertNotPushed" }),
			" — so an integration test can prove that a flow dispatched the expected job and, just as importantly, did not dispatch an unwanted one."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "combining-real-and-fake",
			children: "Combining Real and Fake"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The harness is designed for mixes. A test can keep the real database for rows while faking the queue so no worker runs during the test, then assert the job was pushed rather than executed. Another test can keep storage real so generated file bytes are readable, while faking broadcast to avoid realtime side effects." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The general rule: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "fake whatever has side effects beyond the app process; keep everything else real." }),
			" In-memory engines and fakes cover the first case, and the real kernel covers the second."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "tenancy-in-integration-tests",
			children: "Tenancy in Integration Tests"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tenant behavior integrates cleanly because resolution runs in the harness:" }),
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
			title: "tenancy-in-integration-tests.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "withApp"
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
							children: "app"
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
							children: "  const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " acme"
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
							children: " app."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "asTenant"
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
							children: "'acme'"
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
							children: "  const"
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
							children: " createTestClient"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(app, { tenant: acme })"
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
						children: "  // requests are scoped; a cross-tenant read asserts 404"
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
			"Tenant context flows into storage keys, cache keys, and queue payloads the same way it does in production, so integration tests double as tenancy tests — including the isolation invariants documented in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Tenant Isolation"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-to-reach-for-integration-tests",
			children: "When to Reach for Integration Tests"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Reach for ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" }),
			" when the subject is a composed behavior:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "A multi-step flow that crosses routes, services, and data — signup to welcome job to stored artifact" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Middleware ordering and request-scoped plumbing" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Module contributions interacting with application code" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Schema and seeder behavior against an in-memory database (with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db: 'fresh'" }),
				")"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Anything where the failure mode lives in the wiring, not the logic" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Unit tests pin the logic; API tests pin the request contract; integration tests prove the composition. If a test needs the real kernel but none of the HTTP contract, it belongs here." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/api-testing",
				children: "API Testing"
			}), " — asserting responses and errors through the client"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/unit-testing",
				children: "Unit Testing"
			}), " — the fast layer beneath integration tests"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/factories",
				children: "Fakes in Depth"
			}), " — model-aware factories that seed the harness"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Tenant Isolation"
			}), " — tenancy invariants exercised in the harness"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing",
				children: "Testing"
			}), " — where integration sits in the pyramid"] }),
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
