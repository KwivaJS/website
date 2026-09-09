import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/testing/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Testing",
	"description": "A layered test stack — unit, integration, API, and E2E — powered by the @kwiva/testing harness, in-process client, and model-aware fakes."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nKwiva is testable by construction. Every surface has an in-process entry point — an app harness that boots the real application, a typed test client that calls it without a network hop, and fakes that replace the queue, storage, HTTP, and broadcast layers. The result is a test stack where fast tests cover most of the behavior and browser-level E2E covers only the paths that need it.\n\n## The Test Pyramid for Kwiva Apps [#the-test-pyramid-for-kwiva-apps]\n\n```plaintext title=\"the-test-pyramid-for-kwiva-apps.txt\"\ne2e                            — real browser against the built app\nintegration                    — withApp: real kernel + adapters, in-memory engines where possible\napi                            — typed in-process client against the real request path\nunit                           — services, policies, jobs, pure logic\ntype tests                     — end-to-end type inference guarantees\n```\n\nThe pyramid is the contract for how you spend test time:\n\n* **Unit tests** pin down services, policies, jobs, and helper logic in isolation — no boot, milliseconds each\n* **Integration tests** boot the real application through `withApp` and exercise real routes backed by in-memory engines\n* **API tests** drive the in-process typed client against a real app instance and assert responses, errors, permissions, and tenant behavior\n* **E2E tests** run a real browser against a real UI and API for the critical flows\n* **Type tests** guard end-to-end type inference — model to route to client — at compile time\n\nFramework philosophy sandboxes it clearly: applications should reach high coverage on services, policies, and jobs with fast tests; E2E covers the critical paths only.\n\n## The Harness [#the-harness]\n\n`@kwiva/testing` provides the harness primitives used across the middle of the pyramid:\n\n```ts title=\"the-harness.ts\"\nimport { withApp, createTestClient, queue, storage } from '@kwiva/testing'\n\ntest('posts CRUD', withApp(async (app) => {\n  const client = createTestClient(app)\n\n  const created = await client.posts.create({ title: 'First' })\n  expect(created.data.title).toBe('First')\n\n  const { data, total } = await client.posts.list({ where: { title: 'First' } })\n  expect(total).toBe(1)\n}))\n```\n\n`withApp` wraps each test with a booted application — test-mode config and environment, migrations applied on an in-memory database, and factories seeded — so a test starts from a known, isolated state. What runs inside the callback is the real kernel: real middleware, real validation, real generated routes, real policies.\n\n## Test Isolation [#test-isolation]\n\nPer-test isolation is a design decision of the harness, not an accident of the runner:\n\n* The default database trait is **transaction-per-test** — each test runs in a transaction rolled back afterward, so tests are fast, side-effect-free, and order-independent.\n* Migration-heavy tests opt into **fresh migrations** (`withApp({ db: 'fresh' })`), which drop and migrate for the test.\n* Infrastructure such as the queue and storage is faked per test where side effects beyond the app process would otherwise leak between tests.\n\nEvery test sees the same starting world, which is what makes the suite deterministic in CI and on a laptop.\n\n## Fakes [#fakes]\n\nFakes replace infrastructure without changing application code:\n\n| Fake               | Replaces              | Asserts                        |\n| ------------------ | --------------------- | ------------------------------ |\n| `queue.fake()`     | the job queue         | pushed jobs and their payloads |\n| `storage.fake()`   | the storage disk      | stored paths and bytes         |\n| `http.fake()`      | outbound client calls | stubbed responses              |\n| `broadcast.fake()` | the realtime layer    | emitted channels and events    |\n\n```ts title=\"fakes.ts\"\ntest('welcome email on signup', withApp(async (app) => {\n  queue.fake()\n  storage.fake()\n\n  const client = createTestClient(app)\n  await client.auth.signUp({ email: 'a@b.dev', password: 'swordfish123' })\n\n  expect(queue.assertPushed('send-welcome')).toBe(true)\n  expect(queue.assertNotPushed('invoice-paid')).toBe(true)\n}))\n```\n\nFakes assert positive and negative effects both ways — `assertPushed` and `assertNotPushed` — so a test can prove that a flow dispatched the expected job and, just as importantly, did not dispatch an unwanted one.\n\n## The Test Runner [#the-test-runner]\n\nThe test runner is built into the framework — no separate tool to install, configure, or keep in version alignment. The same runtime that executes the app executes the tests, with `test` and `expect` built in. Test files live under `tests/`, and `kwiva make:test <name>` scaffolds a matching test file for a construct in the right place.\n\nTest layout mirrors the layers, so a reader knows where a test belongs by path:\n\n```text title=\"the-test-runner.txt\"\ntests/\n├─ unit/          # services, policies, jobs, helpers — no boot\n├─ integration/   # withApp: real kernel, in-memory engines\n├─ api/           # createTestClient against the real request path\n├─ e2e/           # browser projects per app mode\n└─ types/         # inference assertions, guarded at compile time\n```\n\nLayering by directory keeps the layers obvious and lets the commands stay simple: `kwiva test` runs the in-process layers by default, and `--e2e` adds the browser projects on top.\n\n## Running Tests [#running-tests]\n\nAll levels run through one CLI:\n\n```bash title=\"terminal\"\nkwiva test                # unit + integration\nkwiva test --e2e          # add the browser-level projects\nkwiva test --watch posts  # watch a filter\nkwiva test --coverage     # test coverage, with CI thresholds\n```\n\nA positional filter narrows to matching tests; `--watch` re-runs on change. `--e2e` runs the browser projects, which launch the built app and drive it through browser flows, optionally against the built artifact with a server target.\n\n## Type Tests [#type-tests]\n\nType tests sit at the base of the pyramid at compile time. They assert the inference contract — the shape a model's routes produce, the responses a controller declares, the union a client call resolves to — so a change to a definition fails the typecheck before a single assertion runs. They are shipped in the suite layout and run as part of the same gate.\n\n## Coverage [#coverage]\n\nCoverage runs through the same command surface (`kwiva test --coverage`), reporting per-layer coverage with thresholds CI enforces. The framework's guidance follows the pyramid: high coverage on services, policies, and jobs with fast tests; explicit critical-path coverage on E2E.\n\n## Testing in CI [#testing-in-ci]\n\nThe full verification gate runs on the Rust-speed toolchain the CLI is built on:\n\n```text title=\"testing-in-ci.txt\"\nlint + format → typecheck → type tests → unit + integration (in-memory) →\nbuild (multiple presets) → smoke tests → e2e (browser projects)\n```\n\nEach stage gates the next, and the E2E stage runs last — by the time the browser tests start, every cheaper signal has already said yes. See [E2E Testing](/docs/testing/e2e-testing) for the ordering rationale.\n\n## Key Components [#key-components]\n\n| Component                                                | Description                                                       |\n| -------------------------------------------------------- | ----------------------------------------------------------------- |\n| [Unit Testing](/docs/testing/unit-testing)               | Services, policies, jobs, and helpers in isolation with factories |\n| [Integration Testing](/docs/testing/integration-testing) | The `withApp` harness, database traits, and fakes                 |\n| [API Testing](/docs/testing/api-testing)                 | The typed in-process client and assertion patterns                |\n| [E2E Testing](/docs/testing/e2e-testing)                 | Browser projects per app mode and CI ordering                     |\n\n## What's Next [#whats-next]\n\n* [Unit Testing](/docs/testing/unit-testing) — fast, isolated tests for pure logic\n* [Integration Testing](/docs/testing/integration-testing) — booting the real app with `withApp`\n* [API Testing](/docs/testing/api-testing) — typed in-process client assertions\n* [E2E Testing](/docs/testing/e2e-testing) — browser projects and pipelines\n* [Factories](/docs/data/factories) — model-aware factories used across every layer\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva is testable by construction. Every surface has an in-process entry point — an app harness that boots the real application, a typed test client that calls it without a network hop, and fakes that replace the queue, storage, HTTP, and broadcast layers. The result is a test stack where fast tests cover most of the behavior and browser-level E2E covers only the paths that need it."
		},
		{
			"heading": "the-test-pyramid-for-kwiva-apps",
			"content": "The pyramid is the contract for how you spend test time:"
		},
		{
			"heading": "the-test-pyramid-for-kwiva-apps",
			"content": "**Unit tests** pin down services, policies, jobs, and helper logic in isolation — no boot, milliseconds each"
		},
		{
			"heading": "the-test-pyramid-for-kwiva-apps",
			"content": "**Integration tests** boot the real application through `withApp` and exercise real routes backed by in-memory engines"
		},
		{
			"heading": "the-test-pyramid-for-kwiva-apps",
			"content": "**API tests** drive the in-process typed client against a real app instance and assert responses, errors, permissions, and tenant behavior"
		},
		{
			"heading": "the-test-pyramid-for-kwiva-apps",
			"content": "**E2E tests** run a real browser against a real UI and API for the critical flows"
		},
		{
			"heading": "the-test-pyramid-for-kwiva-apps",
			"content": "**Type tests** guard end-to-end type inference — model to route to client — at compile time"
		},
		{
			"heading": "the-test-pyramid-for-kwiva-apps",
			"content": "Framework philosophy sandboxes it clearly: applications should reach high coverage on services, policies, and jobs with fast tests; E2E covers the critical paths only."
		},
		{
			"heading": "the-harness",
			"content": "`@kwiva/testing` provides the harness primitives used across the middle of the pyramid:"
		},
		{
			"heading": "the-harness",
			"content": "`withApp` wraps each test with a booted application — test-mode config and environment, migrations applied on an in-memory database, and factories seeded — so a test starts from a known, isolated state. What runs inside the callback is the real kernel: real middleware, real validation, real generated routes, real policies."
		},
		{
			"heading": "test-isolation",
			"content": "Per-test isolation is a design decision of the harness, not an accident of the runner:"
		},
		{
			"heading": "test-isolation",
			"content": "The default database trait is **transaction-per-test** — each test runs in a transaction rolled back afterward, so tests are fast, side-effect-free, and order-independent."
		},
		{
			"heading": "test-isolation",
			"content": "Migration-heavy tests opt into **fresh migrations** (`withApp({ db: 'fresh' })`), which drop and migrate for the test."
		},
		{
			"heading": "test-isolation",
			"content": "Infrastructure such as the queue and storage is faked per test where side effects beyond the app process would otherwise leak between tests."
		},
		{
			"heading": "test-isolation",
			"content": "Every test sees the same starting world, which is what makes the suite deterministic in CI and on a laptop."
		},
		{
			"heading": "fakes",
			"content": "Fakes replace infrastructure without changing application code:"
		},
		{
			"heading": "fakes",
			"content": "Fake"
		},
		{
			"heading": "fakes",
			"content": "Replaces"
		},
		{
			"heading": "fakes",
			"content": "Asserts"
		},
		{
			"heading": "fakes",
			"content": "`queue.fake()`"
		},
		{
			"heading": "fakes",
			"content": "the job queue"
		},
		{
			"heading": "fakes",
			"content": "pushed jobs and their payloads"
		},
		{
			"heading": "fakes",
			"content": "`storage.fake()`"
		},
		{
			"heading": "fakes",
			"content": "the storage disk"
		},
		{
			"heading": "fakes",
			"content": "stored paths and bytes"
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
			"content": "stubbed responses"
		},
		{
			"heading": "fakes",
			"content": "`broadcast.fake()`"
		},
		{
			"heading": "fakes",
			"content": "the realtime layer"
		},
		{
			"heading": "fakes",
			"content": "emitted channels and events"
		},
		{
			"heading": "fakes",
			"content": "Fakes assert positive and negative effects both ways — `assertPushed` and `assertNotPushed` — so a test can prove that a flow dispatched the expected job and, just as importantly, did not dispatch an unwanted one."
		},
		{
			"heading": "the-test-runner",
			"content": "The test runner is built into the framework — no separate tool to install, configure, or keep in version alignment. The same runtime that executes the app executes the tests, with `test` and `expect` built in. Test files live under `tests/`, and `kwiva make:test <name>` scaffolds a matching test file for a construct in the right place."
		},
		{
			"heading": "the-test-runner",
			"content": "Test layout mirrors the layers, so a reader knows where a test belongs by path:"
		},
		{
			"heading": "the-test-runner",
			"content": "Layering by directory keeps the layers obvious and lets the commands stay simple: `kwiva test` runs the in-process layers by default, and `--e2e` adds the browser projects on top."
		},
		{
			"heading": "running-tests",
			"content": "All levels run through one CLI:"
		},
		{
			"heading": "running-tests",
			"content": "A positional filter narrows to matching tests; `--watch` re-runs on change. `--e2e` runs the browser projects, which launch the built app and drive it through browser flows, optionally against the built artifact with a server target."
		},
		{
			"heading": "type-tests",
			"content": "Type tests sit at the base of the pyramid at compile time. They assert the inference contract — the shape a model's routes produce, the responses a controller declares, the union a client call resolves to — so a change to a definition fails the typecheck before a single assertion runs. They are shipped in the suite layout and run as part of the same gate."
		},
		{
			"heading": "coverage",
			"content": "Coverage runs through the same command surface (`kwiva test --coverage`), reporting per-layer coverage with thresholds CI enforces. The framework's guidance follows the pyramid: high coverage on services, policies, and jobs with fast tests; explicit critical-path coverage on E2E."
		},
		{
			"heading": "testing-in-ci",
			"content": "The full verification gate runs on the Rust-speed toolchain the CLI is built on:"
		},
		{
			"heading": "testing-in-ci",
			"content": "Each stage gates the next, and the E2E stage runs last — by the time the browser tests start, every cheaper signal has already said yes. See E2E Testing for the ordering rationale."
		},
		{
			"heading": "key-components",
			"content": "Component"
		},
		{
			"heading": "key-components",
			"content": "Description"
		},
		{
			"heading": "key-components",
			"content": "Unit Testing"
		},
		{
			"heading": "key-components",
			"content": "Services, policies, jobs, and helpers in isolation with factories"
		},
		{
			"heading": "key-components",
			"content": "Integration Testing"
		},
		{
			"heading": "key-components",
			"content": "The `withApp` harness, database traits, and fakes"
		},
		{
			"heading": "key-components",
			"content": "API Testing"
		},
		{
			"heading": "key-components",
			"content": "The typed in-process client and assertion patterns"
		},
		{
			"heading": "key-components",
			"content": "E2E Testing"
		},
		{
			"heading": "key-components",
			"content": "Browser projects per app mode and CI ordering"
		},
		{
			"heading": "whats-next",
			"content": "Unit Testing — fast, isolated tests for pure logic"
		},
		{
			"heading": "whats-next",
			"content": "Integration Testing — booting the real app with `withApp`"
		},
		{
			"heading": "whats-next",
			"content": "API Testing — typed in-process client assertions"
		},
		{
			"heading": "whats-next",
			"content": "E2E Testing — browser projects and pipelines"
		},
		{
			"heading": "whats-next",
			"content": "Factories — model-aware factories used across every layer"
		}
	],
	"headings": [
		{
			"id": "the-test-pyramid-for-kwiva-apps",
			"content": "The Test Pyramid for Kwiva Apps"
		},
		{
			"id": "the-harness",
			"content": "The Harness"
		},
		{
			"id": "test-isolation",
			"content": "Test Isolation"
		},
		{
			"id": "fakes",
			"content": "Fakes"
		},
		{
			"id": "the-test-runner",
			"content": "The Test Runner"
		},
		{
			"id": "running-tests",
			"content": "Running Tests"
		},
		{
			"id": "type-tests",
			"content": "Type Tests"
		},
		{
			"id": "coverage",
			"content": "Coverage"
		},
		{
			"id": "testing-in-ci",
			"content": "Testing in CI"
		},
		{
			"id": "key-components",
			"content": "Key Components"
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
		url: "#the-test-pyramid-for-kwiva-apps",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Test Pyramid for Kwiva Apps" })
	},
	{
		depth: 2,
		url: "#the-harness",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Harness" })
	},
	{
		depth: 2,
		url: "#test-isolation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Test Isolation" })
	},
	{
		depth: 2,
		url: "#fakes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Fakes" })
	},
	{
		depth: 2,
		url: "#the-test-runner",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Test Runner" })
	},
	{
		depth: 2,
		url: "#running-tests",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Running Tests" })
	},
	{
		depth: 2,
		url: "#type-tests",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Type Tests" })
	},
	{
		depth: 2,
		url: "#coverage",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Coverage" })
	},
	{
		depth: 2,
		url: "#testing-in-ci",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Testing in CI" })
	},
	{
		depth: 2,
		url: "#key-components",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Key Components" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva is testable by construction. Every surface has an in-process entry point — an app harness that boots the real application, a typed test client that calls it without a network hop, and fakes that replace the queue, storage, HTTP, and broadcast layers. The result is a test stack where fast tests cover most of the behavior and browser-level E2E covers only the paths that need it." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-test-pyramid-for-kwiva-apps",
			children: "The Test Pyramid for Kwiva Apps"
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
			title: "the-test-pyramid-for-kwiva-apps.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "e2e                            — real browser against the built app" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "integration                    — withApp: real kernel + adapters, in-memory engines where possible" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "api                            — typed in-process client against the real request path" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "unit                           — services, policies, jobs, pure logic" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "type tests                     — end-to-end type inference guarantees" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pyramid is the contract for how you spend test time:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Unit tests" }), " pin down services, policies, jobs, and helper logic in isolation — no boot, milliseconds each"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Integration tests" }),
				" boot the real application through ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" }),
				" and exercise real routes backed by in-memory engines"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "API tests" }), " drive the in-process typed client against a real app instance and assert responses, errors, permissions, and tenant behavior"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "E2E tests" }), " run a real browser against a real UI and API for the critical flows"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Type tests" }), " guard end-to-end type inference — model to route to client — at compile time"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Framework philosophy sandboxes it clearly: applications should reach high coverage on services, policies, and jobs with fast tests; E2E covers the critical paths only." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-harness",
			children: "The Harness"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/testing" }), " provides the harness primitives used across the middle of the pyramid:"] }),
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
							children: " { withApp, createTestClient, queue, storage } "
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" }), " wraps each test with a booted application — test-mode config and environment, migrations applied on an in-memory database, and factories seeded — so a test starts from a known, isolated state. What runs inside the callback is the real kernel: real middleware, real validation, real generated routes, real policies."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "test-isolation",
			children: "Test Isolation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Per-test isolation is a design decision of the harness, not an accident of the runner:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The default database trait is ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "transaction-per-test" }),
				" — each test runs in a transaction rolled back afterward, so tests are fast, side-effect-free, and order-independent."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Migration-heavy tests opt into ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "fresh migrations" }),
				" (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp({ db: 'fresh' })" }),
				"), which drop and migrate for the test."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Infrastructure such as the queue and storage is faked per test where side effects beyond the app process would otherwise leak between tests." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every test sees the same starting world, which is what makes the suite deterministic in CI and on a laptop." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "fakes",
			children: "Fakes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Fakes replace infrastructure without changing application code:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Fake" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Replaces" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Asserts" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.fake()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "the job queue" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "pushed jobs and their payloads" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage.fake()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "the storage disk" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "stored paths and bytes" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http.fake()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "outbound client calls" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "stubbed responses" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "broadcast.fake()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "the realtime layer" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "emitted channels and events" })
			] })
		] })] }),
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Fakes assert positive and negative effects both ways — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "assertPushed" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "assertNotPushed" }),
			" — so a test can prove that a flow dispatched the expected job and, just as importantly, did not dispatch an unwanted one."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-test-runner",
			children: "The Test Runner"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The test runner is built into the framework — no separate tool to install, configure, or keep in version alignment. The same runtime that executes the app executes the tests, with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "test" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "expect" }),
			" built in. Test files live under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tests/" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:test <name>" }),
			" scaffolds a matching test file for a construct in the right place."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Test layout mirrors the layers, so a reader knows where a test belongs by path:" }),
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
			title: "the-test-runner.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "tests/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ unit/          # services, policies, jobs, helpers — no boot" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ integration/   # withApp: real kernel, in-memory engines" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ api/           # createTestClient against the real request path" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ e2e/           # browser projects per app mode" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "└─ types/         # inference assertions, guarded at compile time" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Layering by directory keeps the layers obvious and lets the commands stay simple: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test" }),
			" runs the in-process layers by default, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--e2e" }),
			" adds the browser projects on top."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "running-tests",
			children: "Running Tests"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "All levels run through one CLI:" }),
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
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
							children: " test"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                # unit + integration"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " test"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --e2e"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "          # add the browser-level projects"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " test"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --watch"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " posts"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "  # watch a filter"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " test"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --coverage"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "     # test coverage, with CI thresholds"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A positional filter narrows to matching tests; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--watch" }),
			" re-runs on change. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--e2e" }),
			" runs the browser projects, which launch the built app and drive it through browser flows, optionally against the built artifact with a server target."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "type-tests",
			children: "Type Tests"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Type tests sit at the base of the pyramid at compile time. They assert the inference contract — the shape a model's routes produce, the responses a controller declares, the union a client call resolves to — so a change to a definition fails the typecheck before a single assertion runs. They are shipped in the suite layout and run as part of the same gate." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "coverage",
			children: "Coverage"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Coverage runs through the same command surface (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test --coverage" }),
			"), reporting per-layer coverage with thresholds CI enforces. The framework's guidance follows the pyramid: high coverage on services, policies, and jobs with fast tests; explicit critical-path coverage on E2E."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "testing-in-ci",
			children: "Testing in CI"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The full verification gate runs on the Rust-speed toolchain the CLI is built on:" }),
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
			title: "testing-in-ci.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "lint + format → typecheck → type tests → unit + integration (in-memory) →" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "build (multiple presets) → smoke tests → e2e (browser projects)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each stage gates the next, and the E2E stage runs last — by the time the browser tests start, every cheaper signal has already said yes. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/e2e-testing",
				children: "E2E Testing"
			}),
			" for the ordering rationale."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "key-components",
			children: "Key Components"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Component" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Description" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/unit-testing",
				children: "Unit Testing"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Services, policies, jobs, and helpers in isolation with factories" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/integration-testing",
				children: "Integration Testing"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" }),
				" harness, database traits, and fakes"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/api-testing",
				children: "API Testing"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The typed in-process client and assertion patterns" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/e2e-testing",
				children: "E2E Testing"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Browser projects per app mode and CI ordering" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/unit-testing",
				children: "Unit Testing"
			}), " — fast, isolated tests for pure logic"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/testing/integration-testing",
					children: "Integration Testing"
				}),
				" — booting the real app with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "withApp" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/api-testing",
				children: "API Testing"
			}), " — typed in-process client assertions"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/e2e-testing",
				children: "E2E Testing"
			}), " — browser projects and pipelines"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/factories",
				children: "Factories"
			}), " — model-aware factories used across every layer"] }),
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
