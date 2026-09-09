import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/blog/why-definex.mdx?macro_id=press.config.tsx%23blog
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Why one defineX grammar",
	"description": "The defineX convention isn't a stylistic choice — it's the mechanism that keeps a full-stack framework coherent. Here's the reasoning.",
	"tags": ["architecture", "definex"]
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nEvery app-facing construct in Kwiva is a `defineX` factory. `defineModel`, `defineController`, `definePage`, `defineJob`, `defineEvent`, `defineTask`, `definePolicy`, `defineModule` — the list keeps growing, but the shape never changes. Some people assume this is a branding tic. It isn't. The one-grammar rule is the mechanism that keeps a full-stack framework coherent.\n\n## The problem with different grammars [#the-problem-with-different-grammars]\n\nConsider the alternative: models as classes, controllers as route objects, pages as component exports, jobs as bare functions. Each construct gets its own \"natural\" syntax. That works fine in a library. In a framework that spans data, HTTP, frontend, and platform concerns, it compounds into real costs:\n\n* **Two mental models.** Every file type you touch asks you to re-learn a convention.\n* **Two tooling surfaces.** Generators, lint rules, and IDE support must be written per-shape.\n* **Two error surfaces.** \"Why does my class look different from my function?\" is a real question developers ask.\n* **Two testing habits.** Patterns don't transfer between constructs.\n\nNone of these are fatal on their own. Together, they turn onboarding into a small tax you pay forever.\n\n## One grammar, everywhere [#one-grammar-everywhere]\n\nThe `defineX` convention collapses that tax:\n\n```ts title=\"src/app/models/posts.ts\"\n// src/app/models/posts.ts\nexport default defineModel('posts', (f) => ({ ... }), { timestamps: true })\n\n// src/app/http/controllers/posts.ts\nexport default defineController('posts', (c) => ({ ... }), { prefix: '/posts' })\n\n// src/app/jobs/send-welcome.ts\nexport default defineJob('send-welcome', async ({ payload }) => { ... }, { queue: 'mail' })\n```\n\nSame shape, different domain. Once you understand `defineModel`, you already know how `defineJob` works — the arguments differ, the contract doesn't.\n\n## It enables the tooling [#it-enables-the-tooling]\n\nBecause every construct shares a grammar, the framework can build tooling that covers all of them at once:\n\n* **Generators.** `kwiva make:*` scaffolds every construct from one template engine.\n* **Lint gates.** One rule can enforce conventions across models, controllers, pages, and jobs.\n* **Auto-discovery.** Files are found by directory, so nothing needs manual registration.\n* **Type inference.** Types flow through the whole stack from a single source — no codegen step, no duplicate type definitions.\n\n## It makes reading the app possible [#it-makes-reading-the-app-possible]\n\nHere's the quiet payoff. When every file follows the same shape, reading a codebase becomes reading a product description:\n\n> \"The app has a `posts` model with title, body, and status. It has a controller exposing five actions. It has a `send-welcome` job on the mail queue. When a user signs up, the `user.signed-up` event dispatches it.\"\n\nThat's not a summary written after the fact — it's the code, rendered flat. One grammar is the difference between a codebase you navigate and a codebase you read.\n\n## The boundary it draws [#the-boundary-it-draws]\n\nThere's a second, subtler reason. The `defineX` convention draws a hard line between what's framework and what's application. App code imports only `@kwiva/*` and writes only `defineX(...)`. Everything underneath — the internal engines, the toolchain — is framework-owned. One grammar makes that boundary legible: if it's not a `defineX`, it isn't app code.\n\n## The tradeoff [#the-tradeoff]\n\nUniformity has a cost: some constructs *could* be more concise in a bespoke syntax. A single-action controller is more ceremonious than a bare function. But the framework's position is deliberate — consistency compounds, cleverness doesn't. The small ceremony of a factory call buys coherence across every concern, every package, and every developer who joins later.\n\nThat's why the grammar is one of the four design pillars. It's not decoration — it's the architecture.\n\n## Read more [#read-more]\n\n* **[The defineX Convention](/docs/core-concepts/definex)** — the full factory surface\n* **[Design Principles](/architecture/design-principles)** — the four pillars\n* **[Model Derivation](/architecture/model-derivation)** — what a single declaration can produce\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Every app-facing construct in Kwiva is a `defineX` factory. `defineModel`, `defineController`, `definePage`, `defineJob`, `defineEvent`, `defineTask`, `definePolicy`, `defineModule` — the list keeps growing, but the shape never changes. Some people assume this is a branding tic. It isn't. The one-grammar rule is the mechanism that keeps a full-stack framework coherent."
		},
		{
			"heading": "the-problem-with-different-grammars",
			"content": "Consider the alternative: models as classes, controllers as route objects, pages as component exports, jobs as bare functions. Each construct gets its own \"natural\" syntax. That works fine in a library. In a framework that spans data, HTTP, frontend, and platform concerns, it compounds into real costs:"
		},
		{
			"heading": "the-problem-with-different-grammars",
			"content": "**Two mental models.** Every file type you touch asks you to re-learn a convention."
		},
		{
			"heading": "the-problem-with-different-grammars",
			"content": "**Two tooling surfaces.** Generators, lint rules, and IDE support must be written per-shape."
		},
		{
			"heading": "the-problem-with-different-grammars",
			"content": "**Two error surfaces.** \"Why does my class look different from my function?\" is a real question developers ask."
		},
		{
			"heading": "the-problem-with-different-grammars",
			"content": "**Two testing habits.** Patterns don't transfer between constructs."
		},
		{
			"heading": "the-problem-with-different-grammars",
			"content": "None of these are fatal on their own. Together, they turn onboarding into a small tax you pay forever."
		},
		{
			"heading": "one-grammar-everywhere",
			"content": "The `defineX` convention collapses that tax:"
		},
		{
			"heading": "one-grammar-everywhere",
			"content": "Same shape, different domain. Once you understand `defineModel`, you already know how `defineJob` works — the arguments differ, the contract doesn't."
		},
		{
			"heading": "it-enables-the-tooling",
			"content": "Because every construct shares a grammar, the framework can build tooling that covers all of them at once:"
		},
		{
			"heading": "it-enables-the-tooling",
			"content": "**Generators.** `kwiva make:*` scaffolds every construct from one template engine."
		},
		{
			"heading": "it-enables-the-tooling",
			"content": "**Lint gates.** One rule can enforce conventions across models, controllers, pages, and jobs."
		},
		{
			"heading": "it-enables-the-tooling",
			"content": "**Auto-discovery.** Files are found by directory, so nothing needs manual registration."
		},
		{
			"heading": "it-enables-the-tooling",
			"content": "**Type inference.** Types flow through the whole stack from a single source — no codegen step, no duplicate type definitions."
		},
		{
			"heading": "it-makes-reading-the-app-possible",
			"content": "Here's the quiet payoff. When every file follows the same shape, reading a codebase becomes reading a product description:"
		},
		{
			"heading": "it-makes-reading-the-app-possible",
			"content": "> \"The app has a `posts` model with title, body, and status. It has a controller exposing five actions. It has a `send-welcome` job on the mail queue. When a user signs up, the `user.signed-up` event dispatches it.\""
		},
		{
			"heading": "it-makes-reading-the-app-possible",
			"content": "That's not a summary written after the fact — it's the code, rendered flat. One grammar is the difference between a codebase you navigate and a codebase you read."
		},
		{
			"heading": "the-boundary-it-draws",
			"content": "There's a second, subtler reason. The `defineX` convention draws a hard line between what's framework and what's application. App code imports only `@kwiva/*` and writes only `defineX(...)`. Everything underneath — the internal engines, the toolchain — is framework-owned. One grammar makes that boundary legible: if it's not a `defineX`, it isn't app code."
		},
		{
			"heading": "the-tradeoff",
			"content": "Uniformity has a cost: some constructs *could* be more concise in a bespoke syntax. A single-action controller is more ceremonious than a bare function. But the framework's position is deliberate — consistency compounds, cleverness doesn't. The small ceremony of a factory call buys coherence across every concern, every package, and every developer who joins later."
		},
		{
			"heading": "the-tradeoff",
			"content": "That's why the grammar is one of the four design pillars. It's not decoration — it's the architecture."
		},
		{
			"heading": "read-more",
			"content": "**The defineX Convention** — the full factory surface"
		},
		{
			"heading": "read-more",
			"content": "**Design Principles** — the four pillars"
		},
		{
			"heading": "read-more",
			"content": "**Model Derivation** — what a single declaration can produce"
		}
	],
	"headings": [
		{
			"id": "the-problem-with-different-grammars",
			"content": "The problem with different grammars"
		},
		{
			"id": "one-grammar-everywhere",
			"content": "One grammar, everywhere"
		},
		{
			"id": "it-enables-the-tooling",
			"content": "It enables the tooling"
		},
		{
			"id": "it-makes-reading-the-app-possible",
			"content": "It makes reading the app possible"
		},
		{
			"id": "the-boundary-it-draws",
			"content": "The boundary it draws"
		},
		{
			"id": "the-tradeoff",
			"content": "The tradeoff"
		},
		{
			"id": "read-more",
			"content": "Read more"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#the-problem-with-different-grammars",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The problem with different grammars" })
	},
	{
		depth: 2,
		url: "#one-grammar-everywhere",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One grammar, everywhere" })
	},
	{
		depth: 2,
		url: "#it-enables-the-tooling",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "It enables the tooling" })
	},
	{
		depth: 2,
		url: "#it-makes-reading-the-app-possible",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "It makes reading the app possible" })
	},
	{
		depth: 2,
		url: "#the-boundary-it-draws",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The boundary it draws" })
	},
	{
		depth: 2,
		url: "#the-tradeoff",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The tradeoff" })
	},
	{
		depth: 2,
		url: "#read-more",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Read more" })
	}
];
function _createMdxContent(props) {
	const _components = {
		a: "a",
		blockquote: "blockquote",
		code: "code",
		em: "em",
		h2: "h2",
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
			"Every app-facing construct in Kwiva is a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factory. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
			" — the list keeps growing, but the shape never changes. Some people assume this is a branding tic. It isn't. The one-grammar rule is the mechanism that keeps a full-stack framework coherent."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-problem-with-different-grammars",
			children: "The problem with different grammars"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Consider the alternative: models as classes, controllers as route objects, pages as component exports, jobs as bare functions. Each construct gets its own \"natural\" syntax. That works fine in a library. In a framework that spans data, HTTP, frontend, and platform concerns, it compounds into real costs:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Two mental models." }), " Every file type you touch asks you to re-learn a convention."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Two tooling surfaces." }), " Generators, lint rules, and IDE support must be written per-shape."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Two error surfaces." }), " \"Why does my class look different from my function?\" is a real question developers ask."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Two testing habits." }), " Patterns don't transfer between constructs."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "None of these are fatal on their own. Together, they turn onboarding into a small tax you pay forever." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "one-grammar-everywhere",
			children: "One grammar, everywhere"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" convention collapses that tax:"
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
			title: "src/app/models/posts.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/models/posts.ts"
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
							children: " defineModel"
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
							children: "'posts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "f"
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
							children: " ({ "
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
							children: " }), { timestamps: "
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
							children: ", ("
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
							children: " ({ "
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
							children: " }), { prefix: "
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
						children: "// src/app/jobs/send-welcome.ts"
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
							children: " defineJob"
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
							children: "payload"
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
							children: " { "
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
							children: " }, { queue: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'mail'"
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
			"Same shape, different domain. Once you understand ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			", you already know how ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }),
			" works — the arguments differ, the contract doesn't."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "it-enables-the-tooling",
			children: "It enables the tooling"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because every construct shares a grammar, the framework can build tooling that covers all of them at once:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Generators." }),
				" ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:*" }),
				" scaffolds every construct from one template engine."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Lint gates." }), " One rule can enforce conventions across models, controllers, pages, and jobs."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Auto-discovery." }), " Files are found by directory, so nothing needs manual registration."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Type inference." }), " Types flow through the whole stack from a single source — no codegen step, no duplicate type definitions."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "it-makes-reading-the-app-possible",
			children: "It makes reading the app possible"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Here's the quiet payoff. When every file follows the same shape, reading a codebase becomes reading a product description:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"\"The app has a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
				" model with title, body, and status. It has a controller exposing five actions. It has a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "send-welcome" }),
				" job on the mail queue. When a user signs up, the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user.signed-up" }),
				" event dispatches it.\""
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "That's not a summary written after the fact — it's the code, rendered flat. One grammar is the difference between a codebase you navigate and a codebase you read." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-boundary-it-draws",
			children: "The boundary it draws"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"There's a second, subtler reason. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" convention draws a hard line between what's framework and what's application. App code imports only ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
			" and writes only ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX(...)" }),
			". Everything underneath — the internal engines, the toolchain — is framework-owned. One grammar makes that boundary legible: if it's not a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			", it isn't app code."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-tradeoff",
			children: "The tradeoff"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Uniformity has a cost: some constructs ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "could" }),
			" be more concise in a bespoke syntax. A single-action controller is more ceremonious than a bare function. But the framework's position is deliberate — consistency compounds, cleverness doesn't. The small ceremony of a factory call buys coherence across every concern, every package, and every developer who joins later."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "That's why the grammar is one of the four design pillars. It's not decoration — it's the architecture." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "read-more",
			children: "Read more"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}) }), " — the full factory surface"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/design-principles",
				children: "Design Principles"
			}) }), " — the four pillars"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/model-derivation",
				children: "Model Derivation"
			}) }), " — what a single declaration can produce"] }),
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
