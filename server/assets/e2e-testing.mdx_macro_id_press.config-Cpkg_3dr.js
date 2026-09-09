import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/testing/e2e-testing.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "E2E Testing",
	"description": "Browser-level tests through real UI and a real API — projects per app mode, harness-seeded fixtures, and where E2E belongs in CI."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nThe top of the test pyramid is E2E: a real browser drives the real UI against the real API. E2E is the only layer that proves the shipped experience — pages render, loaders stream, mutations reflect, navigation holds — and it is also the slowest and most environment-sensitive layer. Kwiva treats it as a focused instrument: projects per app mode, fixtures seeded through the same harness as integration tests, and a CI slot that runs after everything that is faster has said yes.\n\n## The Browser Test Runner [#the-browser-test-runner]\n\nE2E tests use the browser test runner bound for Kwiva apps:\n\n```ts title=\"tests/e2e/posts.spec.ts\"\n// tests/e2e/posts.spec.ts\nimport { test, expect } from '@kwiva/testing/playwright'\n\ntest('publish a post', async ({ page }) => {\n  await page.goto('/posts')\n  await page.getByRole('button', { name: 'New post' }).click()\n  await page.getByLabel('Title').fill('Hello')\n  await page.getByRole('button', { name: 'Create' }).click()\n  await expect(page.getByText('Hello')).toBeVisible()\n})\n```\n\nThe runner opens a real browser, navigates real URLs, and asserts against the rendered page. The test reads like the user's journey — reach the screen, fill the form, submit, and see the result appear. The `test` and `expect` surface matches the unit and integration layers, so moving a test between layers means moving the code, not re-learning an API.\n\n## Projects Per App Mode [#projects-per-app-mode]\n\nThe runner configures browser projects per application mode, because each mode serves the user a different shape:\n\n| App mode     | What E2E exercises                                     |\n| ------------ | ------------------------------------------------------ |\n| `fullstack`  | SSR-rendered pages, loaders, streaming, and navigation |\n| `api+spa`    | the built client bundle against the API                |\n| `static`     | prerendered output and client-side hydration           |\n| `standalone` | the API-only surface                                   |\n| `edge`       | the edge-optimized artifact                            |\n\nThe same `kwiva test --e2e` command runs the suite through each relevant project, so a mode change cannot silently break the browser experience without a test telling you.\n\n## Flows Through Real UI and Real API [#flows-through-real-ui-and-real-api]\n\nThe defining property of an E2E test is that nothing on the request path is faked. The browser fetches real pages, the pages call the real API, the API runs real middleware, validation, policies, and tenant scoping, and the UI renders what actually came back.\n\nThat makes E2E the place to assert the properties that lower layers cannot see:\n\n* Loader-driven data reaches the page — SSR markup, streamed sections, and deferred data resolve where the user expects\n* Optimistic mutations reflect on screen and settle to server truth\n* Pending and error components appear under real latency and failures\n* Navigation, search params, and scroll restoration behave in a real browser\n* The tenant experience — a logged-in operator sees only their tenant's screens and data\n\n## Fixtures Seed Through the Harness [#fixtures-seed-through-the-harness]\n\nTest data is seeded the same way integration tests seed theirs — through the harness API and the same factories:\n\n```ts title=\"tests/e2e/posts.spec-2.ts\"\n// tests/e2e/posts.spec.ts\ntest('a seeded dashboard renders', async ({ page }) => {\n  await User.factory().count(5).create()\n  await page.goto('/dashboard')\n  await expect(page.getByText('5 users')).toBeVisible()\n})\n```\n\nReusing the integration harness for fixtures has two effects:\n\n1. **One way to make data** — factories, tenancy, and seeding behave identically across layer boundaries\n2. **No brittle UI-dependent setup** — fixtures are created through the typed data layer, not by clicking through the browser to reach the state under test\n\nThat second property is why E2E stays maintainable: the setup for a flow is a typed factory call, and only the flow itself — the part worth a browser — lives in the browser test.\n\n## Runs Against Real Built Output [#runs-against-real-built-output]\n\nE2E runs against a real server, not mocked routes. The two supported targets match the development and production loops:\n\n```bash title=\"terminal\"\nkwiva test --e2e                # dev server\nkwiva test --e2e --server=preview   # the built artifact\n```\n\nRunning against the built artifact (`kwiva preview`) is the closer-to-production option: it proves the compiled output serves the same experience the browser tests passed in development. Smoke tests against the build run before the E2E stage in CI so that gross breakage stops the pipeline before the expensive browser stage starts.\n\n> \\[!TIP]\n> Develop E2E in the dev loop, but let the deployment pipeline's final gate run `kwiva test --e2e --server=preview`. A hydration mismatch or a streamed-section regression only ever shows up against the built artifact.\n\n## When E2E Pays Off [#when-e2e-pays-off]\n\nE2E is the right tool for a narrow but crucial set of paths:\n\n* The signup-to-first-value journey — registration, tenant provisioning, first screen\n* Checkout and payment flows where every hop matters\n* Tenant onboarding and identity-critical screens\n* Cross-page workflows that span navigation boundaries\n\nE2E pays off wherever the cost of a broken flow is highest and the lower layers structurally cannot see the bug — a loader that returns the wrong data to the UI, a hydration mismatch, a button that renders but does not dispatch.\n\nIt is the wrong tool for the long tail of behaviors the lower layers cover cheaply. The framework philosophy is explicit: applications should reach high coverage on services, policies, and jobs with fast tests, and E2E covers the critical paths only. When an E2E test duplicates assertions that pass in-process, move the assertion down and keep the browser test for the flow itself.\n\n## Keeping E2E Stable [#keeping-e2e-stable]\n\nBrowser tests are the most environment-sensitive layer. The habits that keep them reliable mirror the harness design:\n\n* **Seed through the harness, not the UI** — fixtures are typed factory calls, deterministic per run\n* **Assert user-visible state** — role and label queries against rendered behavior, not internal selectors\n* **Bound the flows to critical paths** — the fewer browser tests, the less surface for environment flakiness to touch\n* **Isolate the environment** — run E2E against the built artifact in CI, where the server target and port are explicit\n\n## CI Ordering [#ci-ordering]\n\nThe E2E stage runs last, behind every faster signal, so a regression is caught at its cheapest. The pipeline a Kwiva project ships in CI:\n\n```text title=\"ci-ordering.txt\"\nlint + format → typecheck → type tests → unit + integration (in-memory) →\nbuild (multiple presets) → smoke tests → e2e (browser projects)\n```\n\nEach stage gates the next:\n\n* **Lint, format, and typecheck** stop convention and type drift instantly\n* **Type tests** guard the end-to-end inference — model to route to client — at compile time\n* **Unit and integration** prove behavior against the in-memory database in seconds\n* **Build and smoke** verify the artifact for the deployed presets\n* **E2E** runs the browser projects against the built output as the final human-shaped gate\n\nOrdering e2e last is deliberate: it is the slowest stage, and by the time it runs, the only failures it should find are the ones only a real browser can catch.\n\n## What's Next [#whats-next]\n\n* [API Testing](/docs/testing/api-testing) — the in-process layer beneath every flow\n* [Integration Testing](/docs/testing/integration-testing) — harness and fixtures shared with E2E\n* [SSR and Rendering](/docs/rendering/ssr) — the streaming surface E2E observes\n* [Project Modes](/docs/getting-started) — the app modes E2E projects target\n* [Testing](/docs/testing) — where E2E belongs in the pyramid\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The top of the test pyramid is E2E: a real browser drives the real UI against the real API. E2E is the only layer that proves the shipped experience — pages render, loaders stream, mutations reflect, navigation holds — and it is also the slowest and most environment-sensitive layer. Kwiva treats it as a focused instrument: projects per app mode, fixtures seeded through the same harness as integration tests, and a CI slot that runs after everything that is faster has said yes."
		},
		{
			"heading": "the-browser-test-runner",
			"content": "E2E tests use the browser test runner bound for Kwiva apps:"
		},
		{
			"heading": "the-browser-test-runner",
			"content": "The runner opens a real browser, navigates real URLs, and asserts against the rendered page. The test reads like the user's journey — reach the screen, fill the form, submit, and see the result appear. The `test` and `expect` surface matches the unit and integration layers, so moving a test between layers means moving the code, not re-learning an API."
		},
		{
			"heading": "projects-per-app-mode",
			"content": "The runner configures browser projects per application mode, because each mode serves the user a different shape:"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "App mode"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "What E2E exercises"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "`fullstack`"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "SSR-rendered pages, loaders, streaming, and navigation"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "`api+spa`"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "the built client bundle against the API"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "`static`"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "prerendered output and client-side hydration"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "`standalone`"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "the API-only surface"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "`edge`"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "the edge-optimized artifact"
		},
		{
			"heading": "projects-per-app-mode",
			"content": "The same `kwiva test --e2e` command runs the suite through each relevant project, so a mode change cannot silently break the browser experience without a test telling you."
		},
		{
			"heading": "flows-through-real-ui-and-real-api",
			"content": "The defining property of an E2E test is that nothing on the request path is faked. The browser fetches real pages, the pages call the real API, the API runs real middleware, validation, policies, and tenant scoping, and the UI renders what actually came back."
		},
		{
			"heading": "flows-through-real-ui-and-real-api",
			"content": "That makes E2E the place to assert the properties that lower layers cannot see:"
		},
		{
			"heading": "flows-through-real-ui-and-real-api",
			"content": "Loader-driven data reaches the page — SSR markup, streamed sections, and deferred data resolve where the user expects"
		},
		{
			"heading": "flows-through-real-ui-and-real-api",
			"content": "Optimistic mutations reflect on screen and settle to server truth"
		},
		{
			"heading": "flows-through-real-ui-and-real-api",
			"content": "Pending and error components appear under real latency and failures"
		},
		{
			"heading": "flows-through-real-ui-and-real-api",
			"content": "Navigation, search params, and scroll restoration behave in a real browser"
		},
		{
			"heading": "flows-through-real-ui-and-real-api",
			"content": "The tenant experience — a logged-in operator sees only their tenant's screens and data"
		},
		{
			"heading": "fixtures-seed-through-the-harness",
			"content": "Test data is seeded the same way integration tests seed theirs — through the harness API and the same factories:"
		},
		{
			"heading": "fixtures-seed-through-the-harness",
			"content": "Reusing the integration harness for fixtures has two effects:"
		},
		{
			"heading": "fixtures-seed-through-the-harness",
			"content": "**One way to make data** — factories, tenancy, and seeding behave identically across layer boundaries"
		},
		{
			"heading": "fixtures-seed-through-the-harness",
			"content": "**No brittle UI-dependent setup** — fixtures are created through the typed data layer, not by clicking through the browser to reach the state under test"
		},
		{
			"heading": "fixtures-seed-through-the-harness",
			"content": "That second property is why E2E stays maintainable: the setup for a flow is a typed factory call, and only the flow itself — the part worth a browser — lives in the browser test."
		},
		{
			"heading": "runs-against-real-built-output",
			"content": "E2E runs against a real server, not mocked routes. The two supported targets match the development and production loops:"
		},
		{
			"heading": "runs-against-real-built-output",
			"content": "Running against the built artifact (`kwiva preview`) is the closer-to-production option: it proves the compiled output serves the same experience the browser tests passed in development. Smoke tests against the build run before the E2E stage in CI so that gross breakage stops the pipeline before the expensive browser stage starts."
		},
		{
			"heading": "runs-against-real-built-output",
			"content": "> \\[!TIP]\n> Develop E2E in the dev loop, but let the deployment pipeline's final gate run `kwiva test --e2e --server=preview`. A hydration mismatch or a streamed-section regression only ever shows up against the built artifact."
		},
		{
			"heading": "when-e2e-pays-off",
			"content": "E2E is the right tool for a narrow but crucial set of paths:"
		},
		{
			"heading": "when-e2e-pays-off",
			"content": "The signup-to-first-value journey — registration, tenant provisioning, first screen"
		},
		{
			"heading": "when-e2e-pays-off",
			"content": "Checkout and payment flows where every hop matters"
		},
		{
			"heading": "when-e2e-pays-off",
			"content": "Tenant onboarding and identity-critical screens"
		},
		{
			"heading": "when-e2e-pays-off",
			"content": "Cross-page workflows that span navigation boundaries"
		},
		{
			"heading": "when-e2e-pays-off",
			"content": "E2E pays off wherever the cost of a broken flow is highest and the lower layers structurally cannot see the bug — a loader that returns the wrong data to the UI, a hydration mismatch, a button that renders but does not dispatch."
		},
		{
			"heading": "when-e2e-pays-off",
			"content": "It is the wrong tool for the long tail of behaviors the lower layers cover cheaply. The framework philosophy is explicit: applications should reach high coverage on services, policies, and jobs with fast tests, and E2E covers the critical paths only. When an E2E test duplicates assertions that pass in-process, move the assertion down and keep the browser test for the flow itself."
		},
		{
			"heading": "keeping-e2e-stable",
			"content": "Browser tests are the most environment-sensitive layer. The habits that keep them reliable mirror the harness design:"
		},
		{
			"heading": "keeping-e2e-stable",
			"content": "**Seed through the harness, not the UI** — fixtures are typed factory calls, deterministic per run"
		},
		{
			"heading": "keeping-e2e-stable",
			"content": "**Assert user-visible state** — role and label queries against rendered behavior, not internal selectors"
		},
		{
			"heading": "keeping-e2e-stable",
			"content": "**Bound the flows to critical paths** — the fewer browser tests, the less surface for environment flakiness to touch"
		},
		{
			"heading": "keeping-e2e-stable",
			"content": "**Isolate the environment** — run E2E against the built artifact in CI, where the server target and port are explicit"
		},
		{
			"heading": "ci-ordering",
			"content": "The E2E stage runs last, behind every faster signal, so a regression is caught at its cheapest. The pipeline a Kwiva project ships in CI:"
		},
		{
			"heading": "ci-ordering",
			"content": "Each stage gates the next:"
		},
		{
			"heading": "ci-ordering",
			"content": "**Lint, format, and typecheck** stop convention and type drift instantly"
		},
		{
			"heading": "ci-ordering",
			"content": "**Type tests** guard the end-to-end inference — model to route to client — at compile time"
		},
		{
			"heading": "ci-ordering",
			"content": "**Unit and integration** prove behavior against the in-memory database in seconds"
		},
		{
			"heading": "ci-ordering",
			"content": "**Build and smoke** verify the artifact for the deployed presets"
		},
		{
			"heading": "ci-ordering",
			"content": "**E2E** runs the browser projects against the built output as the final human-shaped gate"
		},
		{
			"heading": "ci-ordering",
			"content": "Ordering e2e last is deliberate: it is the slowest stage, and by the time it runs, the only failures it should find are the ones only a real browser can catch."
		},
		{
			"heading": "whats-next",
			"content": "API Testing — the in-process layer beneath every flow"
		},
		{
			"heading": "whats-next",
			"content": "Integration Testing — harness and fixtures shared with E2E"
		},
		{
			"heading": "whats-next",
			"content": "SSR and Rendering — the streaming surface E2E observes"
		},
		{
			"heading": "whats-next",
			"content": "Project Modes — the app modes E2E projects target"
		},
		{
			"heading": "whats-next",
			"content": "Testing — where E2E belongs in the pyramid"
		}
	],
	"headings": [
		{
			"id": "the-browser-test-runner",
			"content": "The Browser Test Runner"
		},
		{
			"id": "projects-per-app-mode",
			"content": "Projects Per App Mode"
		},
		{
			"id": "flows-through-real-ui-and-real-api",
			"content": "Flows Through Real UI and Real API"
		},
		{
			"id": "fixtures-seed-through-the-harness",
			"content": "Fixtures Seed Through the Harness"
		},
		{
			"id": "runs-against-real-built-output",
			"content": "Runs Against Real Built Output"
		},
		{
			"id": "when-e2e-pays-off",
			"content": "When E2E Pays Off"
		},
		{
			"id": "keeping-e2e-stable",
			"content": "Keeping E2E Stable"
		},
		{
			"id": "ci-ordering",
			"content": "CI Ordering"
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
		url: "#the-browser-test-runner",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Browser Test Runner" })
	},
	{
		depth: 2,
		url: "#projects-per-app-mode",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Projects Per App Mode" })
	},
	{
		depth: 2,
		url: "#flows-through-real-ui-and-real-api",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Flows Through Real UI and Real API" })
	},
	{
		depth: 2,
		url: "#fixtures-seed-through-the-harness",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Fixtures Seed Through the Harness" })
	},
	{
		depth: 2,
		url: "#runs-against-real-built-output",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Runs Against Real Built Output" })
	},
	{
		depth: 2,
		url: "#when-e2e-pays-off",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When E2E Pays Off" })
	},
	{
		depth: 2,
		url: "#keeping-e2e-stable",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Keeping E2E Stable" })
	},
	{
		depth: 2,
		url: "#ci-ordering",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "CI Ordering" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The top of the test pyramid is E2E: a real browser drives the real UI against the real API. E2E is the only layer that proves the shipped experience — pages render, loaders stream, mutations reflect, navigation holds — and it is also the slowest and most environment-sensitive layer. Kwiva treats it as a focused instrument: projects per app mode, fixtures seeded through the same harness as integration tests, and a CI slot that runs after everything that is faster has said yes." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-browser-test-runner",
			children: "The Browser Test Runner"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "E2E tests use the browser test runner bound for Kwiva apps:" }),
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
			title: "tests/e2e/posts.spec.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// tests/e2e/posts.spec.ts"
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
							children: " { test, expect } "
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
							children: " '@kwiva/testing/playwright'"
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
							children: "'publish a post'"
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
							children: "page"
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
							children: "  await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " page."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "goto"
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
							children: "'/posts'"
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
							children: "  await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " page."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "getByRole"
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
							children: "'button'"
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
							children: "'New post'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "click"
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
							children: " page."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "getByLabel"
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
							children: "'Title'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "fill"
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
							children: "'Hello'"
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
							children: "  await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " page."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "getByRole"
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
							children: "'button'"
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
							children: "'Create'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " })."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "click"
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "  await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " expect"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(page."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "getByText"
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
							children: "'Hello'"
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
							children: "toBeVisible"
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
			"The runner opens a real browser, navigates real URLs, and asserts against the rendered page. The test reads like the user's journey — reach the screen, fill the form, submit, and see the result appear. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "test" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "expect" }),
			" surface matches the unit and integration layers, so moving a test between layers means moving the code, not re-learning an API."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "projects-per-app-mode",
			children: "Projects Per App Mode"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The runner configures browser projects per application mode, because each mode serves the user a different shape:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "App mode" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What E2E exercises" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR-rendered pages, loaders, streaming, and navigation" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "the built client bundle against the API" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "prerendered output and client-side hydration" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "the API-only surface" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "the edge-optimized artifact" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test --e2e" }),
			" command runs the suite through each relevant project, so a mode change cannot silently break the browser experience without a test telling you."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "flows-through-real-ui-and-real-api",
			children: "Flows Through Real UI and Real API"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The defining property of an E2E test is that nothing on the request path is faked. The browser fetches real pages, the pages call the real API, the API runs real middleware, validation, policies, and tenant scoping, and the UI renders what actually came back." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "That makes E2E the place to assert the properties that lower layers cannot see:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Loader-driven data reaches the page — SSR markup, streamed sections, and deferred data resolve where the user expects" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Optimistic mutations reflect on screen and settle to server truth" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Pending and error components appear under real latency and failures" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Navigation, search params, and scroll restoration behave in a real browser" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The tenant experience — a logged-in operator sees only their tenant's screens and data" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "fixtures-seed-through-the-harness",
			children: "Fixtures Seed Through the Harness"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Test data is seeded the same way integration tests seed theirs — through the harness API and the same factories:" }),
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
			title: "tests/e2e/posts.spec-2.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// tests/e2e/posts.spec.ts"
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
							children: "'a seeded dashboard renders'"
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
							children: "page"
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
							children: "  await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " User."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "factory"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "count"
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
							children: "5"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
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
							children: " page."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "goto"
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
							children: "'/dashboard'"
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
							children: "  await"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " expect"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(page."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "getByText"
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
							children: "'5 users'"
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
							children: "toBeVisible"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Reusing the integration harness for fixtures has two effects:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "One way to make data" }), " — factories, tenancy, and seeding behave identically across layer boundaries"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No brittle UI-dependent setup" }), " — fixtures are created through the typed data layer, not by clicking through the browser to reach the state under test"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "That second property is why E2E stays maintainable: the setup for a flow is a typed factory call, and only the flow itself — the part worth a browser — lives in the browser test." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "runs-against-real-built-output",
			children: "Runs Against Real Built Output"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "E2E runs against a real server, not mocked routes. The two supported targets match the development and production loops:" }),
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
							children: "                # dev server"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --server=preview"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "   # the built artifact"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Running against the built artifact (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }),
			") is the closer-to-production option: it proves the compiled output serves the same experience the browser tests passed in development. Smoke tests against the build run before the E2E stage in CI so that gross breakage stops the pipeline before the expensive browser stage starts."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!TIP]\nDevelop E2E in the dev loop, but let the deployment pipeline's final gate run ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test --e2e --server=preview" }),
				". A hydration mismatch or a streamed-section regression only ever shows up against the built artifact."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-e2e-pays-off",
			children: "When E2E Pays Off"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "E2E is the right tool for a narrow but crucial set of paths:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The signup-to-first-value journey — registration, tenant provisioning, first screen" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Checkout and payment flows where every hop matters" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Tenant onboarding and identity-critical screens" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Cross-page workflows that span navigation boundaries" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "E2E pays off wherever the cost of a broken flow is highest and the lower layers structurally cannot see the bug — a loader that returns the wrong data to the UI, a hydration mismatch, a button that renders but does not dispatch." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "It is the wrong tool for the long tail of behaviors the lower layers cover cheaply. The framework philosophy is explicit: applications should reach high coverage on services, policies, and jobs with fast tests, and E2E covers the critical paths only. When an E2E test duplicates assertions that pass in-process, move the assertion down and keep the browser test for the flow itself." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "keeping-e2e-stable",
			children: "Keeping E2E Stable"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Browser tests are the most environment-sensitive layer. The habits that keep them reliable mirror the harness design:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Seed through the harness, not the UI" }), " — fixtures are typed factory calls, deterministic per run"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Assert user-visible state" }), " — role and label queries against rendered behavior, not internal selectors"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Bound the flows to critical paths" }), " — the fewer browser tests, the less surface for environment flakiness to touch"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Isolate the environment" }), " — run E2E against the built artifact in CI, where the server target and port are explicit"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "ci-ordering",
			children: "CI Ordering"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The E2E stage runs last, behind every faster signal, so a regression is caught at its cheapest. The pipeline a Kwiva project ships in CI:" }),
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
			title: "ci-ordering.txt",
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each stage gates the next:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Lint, format, and typecheck" }), " stop convention and type drift instantly"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Type tests" }), " guard the end-to-end inference — model to route to client — at compile time"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Unit and integration" }), " prove behavior against the in-memory database in seconds"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Build and smoke" }), " verify the artifact for the deployed presets"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "E2E" }), " runs the browser projects against the built output as the final human-shaped gate"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Ordering e2e last is deliberate: it is the slowest stage, and by the time it runs, the only failures it should find are the ones only a real browser can catch." }),
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
			}), " — the in-process layer beneath every flow"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/integration-testing",
				children: "Integration Testing"
			}), " — harness and fixtures shared with E2E"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/rendering/ssr",
				children: "SSR and Rendering"
			}), " — the streaming surface E2E observes"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started",
				children: "Project Modes"
			}), " — the app modes E2E projects target"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing",
				children: "Testing"
			}), " — where E2E belongs in the pyramid"] }),
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
