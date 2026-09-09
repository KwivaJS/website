import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/core-concepts/type-inference.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Type Inference",
	"description": "How types flow end-to-end from models through the route manifest to the client and pages — zero codegen, one type universe."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\n## End-to-End Type Safety [#end-to-end-type-safety]\n\nKwiva's type system flows automatically from `defineX` definitions through the entire application stack. A change in a model definition updates the database table, the generated routes, the typed client methods, and the page loader types — without a codegen step, a manifest to regenerate, or a SDK to maintain.\n\n```plaintext title=\"end-to-end-type-safety.txt\"\ndefineModel → model IR → REST/RPC routes → @kwiva/client → definePage loader → data hooks\n```\n\nNo codegen, no manual type annotations, one type universe. The same derivation runs for every construct: controller schemas type the client calls that hit them, and model fields type the data the client returns.\n\n## How It Works [#how-it-works]\n\nThe pipeline that carries types has a concrete shape — definitions are statically analyzed into an intermediate representation, and everything downstream reads from that IR.\n\n### Model → IR [#model--ir]\n\nA model file is the source of truth for its resource. The field DSL produces both runtime schema and static types:\n\n```ts title=\"src/app/models/posts.ts\"\n// src/app/models/posts.ts\ndefineModel('posts', (f) => ({\n  id: f.id(),\n  title: f.string().validation((s) => s.min(1).max(200)),\n  body: f.text().optional(),\n  status: f.enum('draft', 'published'),\n  author: f.belongsTo(() => User),\n}))\n```\n\nAt scan time the model becomes an entry in the model IR (`src/.kwiva/model-ir.json`). The IR is the input to every derivation below — schema, routes, types, Studio screens, OpenAPI, and MCP tools — so there is a single source for all of them. See [Advanced: model IR](/docs/advanced/model-ir) and [Architecture: model derivation](/architecture/model-derivation).\n\n### IR → REST and RPC [#ir--rest-and-rpc]\n\nEach model produces deterministic REST routes — `list`, `get`, `create`, `update`, `delete` — plus custom controller actions. The route manifest records every route's path, method, schemas, tags, and permissions, and serves as the single input to the typed client:\n\n```plaintext title=\"ir-rest-and-rpc.txt\"\nroute manifest → @kwiva/client types\n```\n\nThe client infers the full surface at the type level. `client.posts.list()` returns an array of typed post objects; `client.posts.create(body)` typechecks against the create schema; `client.posts.get(id)` narrows `id` to the declared param type. The result is a contract in the editor — valid methods and arguments surface as you type, and a misspelled field is a compile error rather than a runtime surprise. See [API: typed RPC](/docs/api/rpc) and [API: generated endpoints](/docs/api/generated-endpoints).\n\n### Client → Page [#client--page]\n\nPage loaders consume the same client, so their returned data is typed from the same definitions:\n\n```tsx title=\"client-page.tsx\"\n// src/ui/pages/posts.$id.tsx\ndefinePage({\n  loader: async ({ params, client }) => {\n    const post = await client.posts.get(params.id)\n    // post is fully typed — title: string, body: string | null, status: 'draft' | 'published'\n    return { post }\n  },\n  component: ({ loaderData: { post } }) => (\n    <h1>{post.title}</h1>  // TypeScript knows post.title is a string\n  ),\n})\n```\n\nThe loader's `post` type comes from the model's fields, through the route manifest, to the client method, into the loader return. Data hooks (`useResource`, `useList`, `useMutation`) reuse the same typed surface for client-side state. See [Pages](/docs/frontend/pages) and [Data hooks](/docs/frontend/data-hooks).\n\n## What Is Typed [#what-is-typed]\n\nThe same principle applies beyond models:\n\n* **Controller context** — `body`, `query`, `params`, `headers`, and `cookies` are typed from the route's schemas; `store`, decorated, and resolved keys are typed from `defineApp`. See [Context](/docs/core-concepts/context).\n* **Config** — `config('database.url')` returns the module's declared type, and `env('DATABASE_URL')` returns its declared binding type. See [Configuration](/docs/core-concepts/configuration).\n* **Errors** — the client's `res.error.code` is a discriminated union of the taxonomy codes, so error branches typecheck without string matching. See [Error Handling](/docs/core-concepts/error-handling).\n* **Services, jobs, events** — all derive their payload and argument types from the constructs they touch.\n\n## Where the Types Come From [#where-the-types-come-from]\n\nEvery typed value has a single derivation source, which is why the types never drift:\n\n| What is typed                                                   | Derived from                               |\n| --------------------------------------------------------------- | ------------------------------------------ |\n| Route context (`body`, `query`, `params`, `headers`, `cookies`) | The route's schemas                        |\n| Context `store`, decorated, and resolved keys                   | `defineApp` `state`, `decorate`, `resolve` |\n| Client method arguments and returns                             | The route manifest built from definitions  |\n| Model rows and relations                                        | `defineModel` fields                       |\n| Errors (`res.error.code`)                                       | The shared taxonomy                        |\n| Config and env reads                                            | `defineConfig` `defaults` and `env` maps   |\n\nEach arrow in that table is a compile-time derivation, not a generated artifact. Editing the source edits the contract.\n\n## Editing an Existing Resource [#editing-an-existing-resource]\n\nThe practical workflow demonstrates why the pipeline matters. Update a model field:\n\n```ts title=\"editing-an-existing-resource.ts\"\n// before\nstatus: f.enum('draft', 'published'),\n// after\nstatus: f.enum('draft', 'published', 'archived'),\n```\n\nFrom that single edit, the compiler immediately knows: the `status` column admits `archived` in the database, `client.posts.create` and `client.posts.update` accept it in their bodies, list and get responses include it in the `status` union, page loaders return it, and any `switch` over the tuple now has an unhandled arm to fix. No regeneration, no resync — the edit is the contract update.\n\n## Zero Codegen [#zero-codegen]\n\nUnlike codegen-based approaches, Kwiva uses TypeScript's type inference:\n\n* Model field types are inferred from the DSL.\n* Controller context types are inferred from route schemas.\n* Client return types are inferred from the route manifest derived from definitions.\n* Page loader data types are inferred from the client call.\n\nThe framework derives ambient types into `src/.kwiva/types`, and `createClient()` picks them up. The consequences matter operationally:\n\n* No build step for types.\n* No generated files to commit.\n* Types are always in sync with the source — editing a definition updates the contract everywhere immediately.\n* IDE autocompletion works everywhere the derived types flow.\n\nBecause nothing is generated and committed, there is nothing to forget to regenerate when the API changes.\n\n## One Type Universe, In Practice [#one-type-universe-in-practice]\n\nThe practical test of the model: rename a model field and the compiler tells you exactly which client calls, loaders, and handlers reference it. Change a route's body schema and every `create` or `update` call is rechecked. That is the guarantee \"one type universe\" is shorthand for — type flow, not type drift.\n\n## What's Next [#whats-next]\n\n1. [API: typed RPC](/docs/api/rpc) — how the client derives its surface\n2. [Advanced: model IR](/docs/advanced/model-ir) — the IR that powers derivation\n3. [Architecture: model derivation](/architecture/model-derivation) — the pipeline from model to client\n4. [Data hooks](/docs/frontend/data-hooks) — typed data fetching in pages\n5. [Context](/docs/core-concepts/context) — per-route typed context assembly\n";
var structuredData = {
	"contents": [
		{
			"heading": "end-to-end-type-safety",
			"content": "Kwiva's type system flows automatically from `defineX` definitions through the entire application stack. A change in a model definition updates the database table, the generated routes, the typed client methods, and the page loader types — without a codegen step, a manifest to regenerate, or a SDK to maintain."
		},
		{
			"heading": "end-to-end-type-safety",
			"content": "No codegen, no manual type annotations, one type universe. The same derivation runs for every construct: controller schemas type the client calls that hit them, and model fields type the data the client returns."
		},
		{
			"heading": "how-it-works",
			"content": "The pipeline that carries types has a concrete shape — definitions are statically analyzed into an intermediate representation, and everything downstream reads from that IR."
		},
		{
			"heading": "model--ir",
			"content": "A model file is the source of truth for its resource. The field DSL produces both runtime schema and static types:"
		},
		{
			"heading": "model--ir",
			"content": "At scan time the model becomes an entry in the model IR (`src/.kwiva/model-ir.json`). The IR is the input to every derivation below — schema, routes, types, Studio screens, OpenAPI, and MCP tools — so there is a single source for all of them. See Advanced: model IR and Architecture: model derivation."
		},
		{
			"heading": "ir--rest-and-rpc",
			"content": "Each model produces deterministic REST routes — `list`, `get`, `create`, `update`, `delete` — plus custom controller actions. The route manifest records every route's path, method, schemas, tags, and permissions, and serves as the single input to the typed client:"
		},
		{
			"heading": "ir--rest-and-rpc",
			"content": "The client infers the full surface at the type level. `client.posts.list()` returns an array of typed post objects; `client.posts.create(body)` typechecks against the create schema; `client.posts.get(id)` narrows `id` to the declared param type. The result is a contract in the editor — valid methods and arguments surface as you type, and a misspelled field is a compile error rather than a runtime surprise. See API: typed RPC and API: generated endpoints."
		},
		{
			"heading": "client--page",
			"content": "Page loaders consume the same client, so their returned data is typed from the same definitions:"
		},
		{
			"heading": "client--page",
			"content": "The loader's `post` type comes from the model's fields, through the route manifest, to the client method, into the loader return. Data hooks (`useResource`, `useList`, `useMutation`) reuse the same typed surface for client-side state. See Pages and Data hooks."
		},
		{
			"heading": "what-is-typed",
			"content": "The same principle applies beyond models:"
		},
		{
			"heading": "what-is-typed",
			"content": "**Controller context** — `body`, `query`, `params`, `headers`, and `cookies` are typed from the route's schemas; `store`, decorated, and resolved keys are typed from `defineApp`. See Context."
		},
		{
			"heading": "what-is-typed",
			"content": "**Config** — `config('database.url')` returns the module's declared type, and `env('DATABASE_URL')` returns its declared binding type. See Configuration."
		},
		{
			"heading": "what-is-typed",
			"content": "**Errors** — the client's `res.error.code` is a discriminated union of the taxonomy codes, so error branches typecheck without string matching. See Error Handling."
		},
		{
			"heading": "what-is-typed",
			"content": "**Services, jobs, events** — all derive their payload and argument types from the constructs they touch."
		},
		{
			"heading": "where-the-types-come-from",
			"content": "Every typed value has a single derivation source, which is why the types never drift:"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "What is typed"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "Derived from"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "Route context (`body`, `query`, `params`, `headers`, `cookies`)"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "The route's schemas"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "Context `store`, decorated, and resolved keys"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "`defineApp` `state`, `decorate`, `resolve`"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "Client method arguments and returns"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "The route manifest built from definitions"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "Model rows and relations"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "`defineModel` fields"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "Errors (`res.error.code`)"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "The shared taxonomy"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "Config and env reads"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "`defineConfig` `defaults` and `env` maps"
		},
		{
			"heading": "where-the-types-come-from",
			"content": "Each arrow in that table is a compile-time derivation, not a generated artifact. Editing the source edits the contract."
		},
		{
			"heading": "editing-an-existing-resource",
			"content": "The practical workflow demonstrates why the pipeline matters. Update a model field:"
		},
		{
			"heading": "editing-an-existing-resource",
			"content": "From that single edit, the compiler immediately knows: the `status` column admits `archived` in the database, `client.posts.create` and `client.posts.update` accept it in their bodies, list and get responses include it in the `status` union, page loaders return it, and any `switch` over the tuple now has an unhandled arm to fix. No regeneration, no resync — the edit is the contract update."
		},
		{
			"heading": "zero-codegen",
			"content": "Unlike codegen-based approaches, Kwiva uses TypeScript's type inference:"
		},
		{
			"heading": "zero-codegen",
			"content": "Model field types are inferred from the DSL."
		},
		{
			"heading": "zero-codegen",
			"content": "Controller context types are inferred from route schemas."
		},
		{
			"heading": "zero-codegen",
			"content": "Client return types are inferred from the route manifest derived from definitions."
		},
		{
			"heading": "zero-codegen",
			"content": "Page loader data types are inferred from the client call."
		},
		{
			"heading": "zero-codegen",
			"content": "The framework derives ambient types into `src/.kwiva/types`, and `createClient()` picks them up. The consequences matter operationally:"
		},
		{
			"heading": "zero-codegen",
			"content": "No build step for types."
		},
		{
			"heading": "zero-codegen",
			"content": "No generated files to commit."
		},
		{
			"heading": "zero-codegen",
			"content": "Types are always in sync with the source — editing a definition updates the contract everywhere immediately."
		},
		{
			"heading": "zero-codegen",
			"content": "IDE autocompletion works everywhere the derived types flow."
		},
		{
			"heading": "zero-codegen",
			"content": "Because nothing is generated and committed, there is nothing to forget to regenerate when the API changes."
		},
		{
			"heading": "one-type-universe-in-practice",
			"content": "The practical test of the model: rename a model field and the compiler tells you exactly which client calls, loaders, and handlers reference it. Change a route's body schema and every `create` or `update` call is rechecked. That is the guarantee \"one type universe\" is shorthand for — type flow, not type drift."
		},
		{
			"heading": "whats-next",
			"content": "API: typed RPC — how the client derives its surface"
		},
		{
			"heading": "whats-next",
			"content": "Advanced: model IR — the IR that powers derivation"
		},
		{
			"heading": "whats-next",
			"content": "Architecture: model derivation — the pipeline from model to client"
		},
		{
			"heading": "whats-next",
			"content": "Data hooks — typed data fetching in pages"
		},
		{
			"heading": "whats-next",
			"content": "Context — per-route typed context assembly"
		}
	],
	"headings": [
		{
			"id": "end-to-end-type-safety",
			"content": "End-to-End Type Safety"
		},
		{
			"id": "how-it-works",
			"content": "How It Works"
		},
		{
			"id": "model--ir",
			"content": "Model → IR"
		},
		{
			"id": "ir--rest-and-rpc",
			"content": "IR → REST and RPC"
		},
		{
			"id": "client--page",
			"content": "Client → Page"
		},
		{
			"id": "what-is-typed",
			"content": "What Is Typed"
		},
		{
			"id": "where-the-types-come-from",
			"content": "Where the Types Come From"
		},
		{
			"id": "editing-an-existing-resource",
			"content": "Editing an Existing Resource"
		},
		{
			"id": "zero-codegen",
			"content": "Zero Codegen"
		},
		{
			"id": "one-type-universe-in-practice",
			"content": "One Type Universe, In Practice"
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
		url: "#end-to-end-type-safety",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "End-to-End Type Safety" })
	},
	{
		depth: 2,
		url: "#how-it-works",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How It Works" })
	},
	{
		depth: 3,
		url: "#model--ir",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Model → IR" })
	},
	{
		depth: 3,
		url: "#ir--rest-and-rpc",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "IR → REST and RPC" })
	},
	{
		depth: 3,
		url: "#client--page",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Client → Page" })
	},
	{
		depth: 2,
		url: "#what-is-typed",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Is Typed" })
	},
	{
		depth: 2,
		url: "#where-the-types-come-from",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where the Types Come From" })
	},
	{
		depth: 2,
		url: "#editing-an-existing-resource",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Editing an Existing Resource" })
	},
	{
		depth: 2,
		url: "#zero-codegen",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Zero Codegen" })
	},
	{
		depth: 2,
		url: "#one-type-universe-in-practice",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One Type Universe, In Practice" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "end-to-end-type-safety",
			children: "End-to-End Type Safety"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva's type system flows automatically from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" definitions through the entire application stack. A change in a model definition updates the database table, the generated routes, the typed client methods, and the page loader types — without a codegen step, a manifest to regenerate, or a SDK to maintain."
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
			title: "end-to-end-type-safety.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineModel → model IR → REST/RPC routes → @kwiva/client → definePage loader → data hooks" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "No codegen, no manual type annotations, one type universe. The same derivation runs for every construct: controller schemas type the client calls that hit them, and model fields type the data the client returns." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-it-works",
			children: "How It Works"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pipeline that carries types has a concrete shape — definitions are statically analyzed into an intermediate representation, and everything downstream reads from that IR." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "model--ir",
			children: "Model → IR"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A model file is the source of truth for its resource. The field DSL produces both runtime schema and static types:" }),
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "defineModel"
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
							children: "  id: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "id"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),"
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
							children: "  title: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "string"
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
							children: "validation"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "s"
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
							children: " s."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "min"
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
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "max"
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
							children: "200"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")),"
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
							children: "  body: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "text"
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
							children: "optional"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),"
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
							children: "  status: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "enum"
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
							children: "'draft'"
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
							children: "'published'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
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
							children: "  author: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "belongsTo"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(() "
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
							children: " User),"
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
			"At scan time the model becomes an entry in the model IR (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/model-ir.json" }),
			"). The IR is the input to every derivation below — schema, routes, types, Studio screens, OpenAPI, and MCP tools — so there is a single source for all of them. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/model-ir",
				children: "Advanced: model IR"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/model-derivation",
				children: "Architecture: model derivation"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "ir--rest-and-rpc",
			children: "IR → REST and RPC"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each model produces deterministic REST routes — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "list" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "get" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "create" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "update" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "delete" }),
			" — plus custom controller actions. The route manifest records every route's path, method, schemas, tags, and permissions, and serves as the single input to the typed client:"
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
			title: "ir-rest-and-rpc.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "route manifest → @kwiva/client types" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The client infers the full surface at the type level. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.list()" }),
			" returns an array of typed post objects; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.create(body)" }),
			" typechecks against the create schema; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.get(id)" }),
			" narrows ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "id" }),
			" to the declared param type. The result is a contract in the editor — valid methods and arguments surface as you type, and a misspelled field is a compile error rather than a runtime surprise. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rpc",
				children: "API: typed RPC"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "API: generated endpoints"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "client--page",
			children: "Client → Page"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Page loaders consume the same client, so their returned data is typed from the same definitions:" }),
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
			title: "client-page.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/ui/pages/posts.$id.tsx"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "definePage"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "({"
					})]
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
							children: "  loader"
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
							children: "client"
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
							children: "    const"
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
							children: "(params.id)"
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
						children: "    // post is fully typed — title: string, body: string | null, status: 'draft' | 'published'"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "    return"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " { post }"
					})]
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  component"
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
							children: "loaderData"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "post"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } }) "
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
							children: " ("
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
							children: "    <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#22863A",
								"--shiki-dark": "#85E89D"
							},
							children: "h1"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">{post.title}</"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#22863A",
								"--shiki-dark": "#85E89D"
							},
							children: "h1"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ">  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// TypeScript knows post.title is a string"
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
						children: "  ),"
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
			"The loader's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "post" }),
			" type comes from the model's fields, through the route manifest, to the client method, into the loader return. Data hooks (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useResource" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useList" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useMutation" }),
			") reuse the same typed surface for client-side state. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/pages",
				children: "Pages"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data hooks"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-is-typed",
			children: "What Is Typed"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The same principle applies beyond models:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Controller context" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "body" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "query" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "headers" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookies" }),
				" are typed from the route's schemas; ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "store" }),
				", decorated, and resolved keys are typed from ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
				". See ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/context",
					children: "Context"
				}),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Config" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config('database.url')" }),
				" returns the module's declared type, and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env('DATABASE_URL')" }),
				" returns its declared binding type. See ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/configuration",
					children: "Configuration"
				}),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Errors" }),
				" — the client's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.error.code" }),
				" is a discriminated union of the taxonomy codes, so error branches typecheck without string matching. See ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/error-handling",
					children: "Error Handling"
				}),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Services, jobs, events" }), " — all derive their payload and argument types from the constructs they touch."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-the-types-come-from",
			children: "Where the Types Come From"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every typed value has a single derivation source, which is why the types never drift:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What is typed" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Derived from" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Route context (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "body" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "query" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "headers" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookies" }),
				")"
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The route's schemas" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Context ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "store" }),
				", decorated, and resolved keys"
			] }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
				" ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "state" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "decorate" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "resolve" })
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Client method arguments and returns" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The route manifest built from definitions" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model rows and relations" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }), " fields"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Errors (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.error.code" }),
				")"
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The shared taxonomy" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Config and env reads" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
				" ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defaults" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }),
				" maps"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each arrow in that table is a compile-time derivation, not a generated artifact. Editing the source edits the contract." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "editing-an-existing-resource",
			children: "Editing an Existing Resource"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The practical workflow demonstrates why the pipeline matters. Update a model field:" }),
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
			title: "editing-an-existing-resource.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// before"
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
							children: "status"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "enum"
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
							children: "'draft'"
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
							children: "'published'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
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
						children: "// after"
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
							children: "status"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "enum"
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
							children: "'draft'"
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
							children: "'published'"
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
							children: "'archived'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"From that single edit, the compiler immediately knows: the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "status" }),
			" column admits ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "archived" }),
			" in the database, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.create" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "client.posts.update" }),
			" accept it in their bodies, list and get responses include it in the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "status" }),
			" union, page loaders return it, and any ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "switch" }),
			" over the tuple now has an unhandled arm to fix. No regeneration, no resync — the edit is the contract update."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "zero-codegen",
			children: "Zero Codegen"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Unlike codegen-based approaches, Kwiva uses TypeScript's type inference:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Model field types are inferred from the DSL." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Controller context types are inferred from route schemas." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Client return types are inferred from the route manifest derived from definitions." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Page loader data types are inferred from the client call." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The framework derives ambient types into ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/types" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createClient()" }),
			" picks them up. The consequences matter operationally:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "No build step for types." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "No generated files to commit." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Types are always in sync with the source — editing a definition updates the contract everywhere immediately." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "IDE autocompletion works everywhere the derived types flow." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because nothing is generated and committed, there is nothing to forget to regenerate when the API changes." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "one-type-universe-in-practice",
			children: "One Type Universe, In Practice"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The practical test of the model: rename a model field and the compiler tells you exactly which client calls, loaders, and handlers reference it. Change a route's body schema and every ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "create" }),
			" or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "update" }),
			" call is rechecked. That is the guarantee \"one type universe\" is shorthand for — type flow, not type drift."
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
				href: "/docs/api/rpc",
				children: "API: typed RPC"
			}), " — how the client derives its surface"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/model-ir",
				children: "Advanced: model IR"
			}), " — the IR that powers derivation"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/model-derivation",
				children: "Architecture: model derivation"
			}), " — the pipeline from model to client"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/data-hooks",
				children: "Data hooks"
			}), " — typed data fetching in pages"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/context",
				children: "Context"
			}), " — per-route typed context assembly"] }),
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
