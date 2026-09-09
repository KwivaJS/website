import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/security/input-validation.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Input Validation",
	"description": "Typed validation at every boundary — models, controllers, jobs, events, channels, MCP tools, uploads, and search params."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nKwiva's model is that **input is validated where input enters**, and every executor type ships with a schema slot for its inputs. There is no conventional \"unvalidated code path\": a value that reaches a model write, a job payload, or a channel handler has already passed a schema, so the code that receives it is allowed to trust its shape.\n\n## Validation Is a Default [#validation-is-a-default]\n\nValidation is not an opt-in middleware you remember to apply. Every boundary validates by construction:\n\n* Controllers validate the route schema before the handler runs\n* Models validate typed field definitions before writes, and dynamic path/lookup validation up front\n* Job payloads, event payloads, channel messages, MCP tool inputs, uploads, and search params each have their own schema slot\n\nThe symmetry is deliberate: inputs are dense inside work items and sparse across web boundaries, and Kwiva validates at the exact point the data arrives rather than deferring the check to when it is used.\n\n## Standard Schema [#standard-schema]\n\nKwiva's validation functions are **Standard Schema compliant**, which means the ecosystem of Standard Schema adapters is interchangeable — Valibot, Zod, and any other compliant library can be dropped into any boundary without friction. The framework does not transport bespoke validation; it transports the shared contract.\n\n```ts title=\"standard-schema.ts\"\n// which adapter doesn't matter — every boundary accepts a Standard Schema\nimport { x } from 'valibot'\n\nexport default defineValidation('createPost', {\n  body: {\n    title: x.string(x.minLength(1), x.maxLength(200)),\n    published: x.optional(x.boolean(), false),\n  },\n})\n```\n\nThe practical benefit: your team's schema library, wherever it lives, plugs into controllers, models, jobs, channels, and MCP tools alike, with the same error mapping in every surface.\n\n## Field-DSL Derived Schemas [#field-dsl-derived-schemas]\n\nModels define their types with a typed field DSL, and the field definitions generate the schema that validates every operation. This is the tightest loop in the framework: the schema and the model cannot disagree, because one is derived from the other.\n\n```ts title=\"field-dsl-derived-schemas.ts\"\nexport default defineModel('post', {\n  fields: {\n    title: f.string().validation((s) => s.min(1).max(200)),\n    id: f.string().cuid2(),\n  },\n})\n```\n\nDynamic validation functions like `validation((s) => s.min(1).max(200))` operate on the framework's string schema surface, so the constraints live in one place and apply to every write path — controllers, seeders, and application code all converge on the same rules.\n\n## Validation at the Model Boundary [#validation-at-the-model-boundary]\n\nModel operations validate before they write. `.create()` and `.update()` validate typed field definitions against the data, and dynamic path and lookup parameters are validated up front:\n\n```ts title=\"validation-at-the-model-boundary.ts\"\nawait Post.create({ title: '' })  // throws: title must satisfy min(1)\n```\n\nType-level and runtime checks compose — the typed layer catches the shape at compile time and the validation layer catches the values at runtime. This is where the model, controller, job, and channel boundaries all agree: anything that writes validated, and anything that writes validly is already typed.\n\n## Validation at the Controller Boundary [#validation-at-the-controller-boundary]\n\nControllers validate the route schema before the handler runs. The request body is checked against the schema, and search params and headers are validated when declared:\n\n```ts title=\"validation-at-the-controller-boundary.ts\"\nimport { defineController } from '@kwiva/http'\n\nexport default defineController('posts', (c) => ({\n  list: c.get('/', {\n    schema: {\n      searchParams: { page: x.numeric() },\n      headers: { 'x-session-id': x.string() },\n    },\n    run: async ({ body, searchParams }) => {\n      return await Post.all({ limit: 20 })\n    },\n  }),\n}))\n```\n\nValidation failures become **field-mapped 422 responses** — the response shape indicates which fields failed and why — and never reach the handler. Repeating the same checks by hand inside the handler is redundant work the schema already did.\n\n## What Counts as Input [#what-counts-as-input]\n\nThe boundary model earns its name by being exhaustive about what can enter. In a Kwiva application, input is:\n\n* The **request body, search params, and declared headers** of a controller route\n* The **typed field values** written through model operations\n* The **payload** of a job or event, however it arrives\n* A **channel message** before broadcast\n* The **arguments and results** of an MCP tool call\n* **Uploaded files** and **search parameters** on their own schemas\n\nAnything that did not originate inside your own validated code is input, and everything in that list has a schema slot by default. The converse is what makes the model comfortable: once a value has crossed a validated boundary, application code treats it as trustworthy, because trusting untested shape is precisely what the schema layer exists to prevent.\n\n## Beyond Requests [#beyond-requests]\n\nThe other boundaries follow the same rule with their own schema slots:\n\n| Boundary      | What is validated                                                             |\n| ------------- | ----------------------------------------------------------------------------- |\n| Jobs          | The job's payload against its declared schema before the payload is processed |\n| Events        | The event payload against its schema for each listener                        |\n| Channels      | The message content before it is broadcast                                    |\n| MCP tools     | Tool input and output against their schemas                                   |\n| Uploads       | File type and size against the upload definition                              |\n| Search params | Route search parameters when declared in the route schema                     |\n\nThe consistency is the point: an event emitted by a controller and consumed by a listener already validated both sides of the hop, and an MCP tool invocation is validated before any side effect, the same as a controller route.\n\n## Server-Side and Client-Side Alignment [#server-side-and-client-side-alignment]\n\nBecause the same schema definition is shared across server and client boundaries, the validation contract is one artifact. The client can preview constraints without re-implementing the rules, and the server remains the authority that enforces them. The framework never treats client-side checks as adequate — validation is always re-run server-side at the real boundary.\n\n## Best Practices by Boundary Kind [#best-practices-by-boundary-kind]\n\nThe general rule — validate at the boundary, trust inside the executor — produces different habits per surface:\n\n* **Controllers**: declare body, search params, and headers; let 422 mapping be your API contract\n* **Models**: put the constraint in the field DSL once; never write a second, divergent check at the write site\n* **Jobs and events**: schema the payload, because the sender and consumer may live in different code that autoload independently\n* **MCP tools**: validate input and output — the tool contract is a feature of the MCP surface, not an afterthought\n\nUnicode and max-length normalization is a constant across database-facing boundaries, ensuring cross-platform input never wedges persistence.\n\n## What's Next [#whats-next]\n\n* [Default Protections](/docs/security/default-protections) — how typed validation composes with the rest of the posture\n* [HTTP Validation](/docs/http/validation) — schemas, errors, and field-mapped 422 responses\n* [Data Validation](/docs/data/validation) — model-level rules, unicode checks, and best practices\n* [Jobs](/docs/background-work/jobs) — payload validation inside queued work\n* [Realtime Channels](/docs/realtime/channels) — validation before broadcast\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva's model is that **input is validated where input enters**, and every executor type ships with a schema slot for its inputs. There is no conventional \"unvalidated code path\": a value that reaches a model write, a job payload, or a channel handler has already passed a schema, so the code that receives it is allowed to trust its shape."
		},
		{
			"heading": "validation-is-a-default",
			"content": "Validation is not an opt-in middleware you remember to apply. Every boundary validates by construction:"
		},
		{
			"heading": "validation-is-a-default",
			"content": "Controllers validate the route schema before the handler runs"
		},
		{
			"heading": "validation-is-a-default",
			"content": "Models validate typed field definitions before writes, and dynamic path/lookup validation up front"
		},
		{
			"heading": "validation-is-a-default",
			"content": "Job payloads, event payloads, channel messages, MCP tool inputs, uploads, and search params each have their own schema slot"
		},
		{
			"heading": "validation-is-a-default",
			"content": "The symmetry is deliberate: inputs are dense inside work items and sparse across web boundaries, and Kwiva validates at the exact point the data arrives rather than deferring the check to when it is used."
		},
		{
			"heading": "standard-schema",
			"content": "Kwiva's validation functions are **Standard Schema compliant**, which means the ecosystem of Standard Schema adapters is interchangeable — Valibot, Zod, and any other compliant library can be dropped into any boundary without friction. The framework does not transport bespoke validation; it transports the shared contract."
		},
		{
			"heading": "standard-schema",
			"content": "The practical benefit: your team's schema library, wherever it lives, plugs into controllers, models, jobs, channels, and MCP tools alike, with the same error mapping in every surface."
		},
		{
			"heading": "field-dsl-derived-schemas",
			"content": "Models define their types with a typed field DSL, and the field definitions generate the schema that validates every operation. This is the tightest loop in the framework: the schema and the model cannot disagree, because one is derived from the other."
		},
		{
			"heading": "field-dsl-derived-schemas",
			"content": "Dynamic validation functions like `validation((s) => s.min(1).max(200))` operate on the framework's string schema surface, so the constraints live in one place and apply to every write path — controllers, seeders, and application code all converge on the same rules."
		},
		{
			"heading": "validation-at-the-model-boundary",
			"content": "Model operations validate before they write. `.create()` and `.update()` validate typed field definitions against the data, and dynamic path and lookup parameters are validated up front:"
		},
		{
			"heading": "validation-at-the-model-boundary",
			"content": "Type-level and runtime checks compose — the typed layer catches the shape at compile time and the validation layer catches the values at runtime. This is where the model, controller, job, and channel boundaries all agree: anything that writes validated, and anything that writes validly is already typed."
		},
		{
			"heading": "validation-at-the-controller-boundary",
			"content": "Controllers validate the route schema before the handler runs. The request body is checked against the schema, and search params and headers are validated when declared:"
		},
		{
			"heading": "validation-at-the-controller-boundary",
			"content": "Validation failures become **field-mapped 422 responses** — the response shape indicates which fields failed and why — and never reach the handler. Repeating the same checks by hand inside the handler is redundant work the schema already did."
		},
		{
			"heading": "what-counts-as-input",
			"content": "The boundary model earns its name by being exhaustive about what can enter. In a Kwiva application, input is:"
		},
		{
			"heading": "what-counts-as-input",
			"content": "The **request body, search params, and declared headers** of a controller route"
		},
		{
			"heading": "what-counts-as-input",
			"content": "The **typed field values** written through model operations"
		},
		{
			"heading": "what-counts-as-input",
			"content": "The **payload** of a job or event, however it arrives"
		},
		{
			"heading": "what-counts-as-input",
			"content": "A **channel message** before broadcast"
		},
		{
			"heading": "what-counts-as-input",
			"content": "The **arguments and results** of an MCP tool call"
		},
		{
			"heading": "what-counts-as-input",
			"content": "**Uploaded files** and **search parameters** on their own schemas"
		},
		{
			"heading": "what-counts-as-input",
			"content": "Anything that did not originate inside your own validated code is input, and everything in that list has a schema slot by default. The converse is what makes the model comfortable: once a value has crossed a validated boundary, application code treats it as trustworthy, because trusting untested shape is precisely what the schema layer exists to prevent."
		},
		{
			"heading": "beyond-requests",
			"content": "The other boundaries follow the same rule with their own schema slots:"
		},
		{
			"heading": "beyond-requests",
			"content": "Boundary"
		},
		{
			"heading": "beyond-requests",
			"content": "What is validated"
		},
		{
			"heading": "beyond-requests",
			"content": "Jobs"
		},
		{
			"heading": "beyond-requests",
			"content": "The job's payload against its declared schema before the payload is processed"
		},
		{
			"heading": "beyond-requests",
			"content": "Events"
		},
		{
			"heading": "beyond-requests",
			"content": "The event payload against its schema for each listener"
		},
		{
			"heading": "beyond-requests",
			"content": "Channels"
		},
		{
			"heading": "beyond-requests",
			"content": "The message content before it is broadcast"
		},
		{
			"heading": "beyond-requests",
			"content": "MCP tools"
		},
		{
			"heading": "beyond-requests",
			"content": "Tool input and output against their schemas"
		},
		{
			"heading": "beyond-requests",
			"content": "Uploads"
		},
		{
			"heading": "beyond-requests",
			"content": "File type and size against the upload definition"
		},
		{
			"heading": "beyond-requests",
			"content": "Search params"
		},
		{
			"heading": "beyond-requests",
			"content": "Route search parameters when declared in the route schema"
		},
		{
			"heading": "beyond-requests",
			"content": "The consistency is the point: an event emitted by a controller and consumed by a listener already validated both sides of the hop, and an MCP tool invocation is validated before any side effect, the same as a controller route."
		},
		{
			"heading": "server-side-and-client-side-alignment",
			"content": "Because the same schema definition is shared across server and client boundaries, the validation contract is one artifact. The client can preview constraints without re-implementing the rules, and the server remains the authority that enforces them. The framework never treats client-side checks as adequate — validation is always re-run server-side at the real boundary."
		},
		{
			"heading": "best-practices-by-boundary-kind",
			"content": "The general rule — validate at the boundary, trust inside the executor — produces different habits per surface:"
		},
		{
			"heading": "best-practices-by-boundary-kind",
			"content": "**Controllers**: declare body, search params, and headers; let 422 mapping be your API contract"
		},
		{
			"heading": "best-practices-by-boundary-kind",
			"content": "**Models**: put the constraint in the field DSL once; never write a second, divergent check at the write site"
		},
		{
			"heading": "best-practices-by-boundary-kind",
			"content": "**Jobs and events**: schema the payload, because the sender and consumer may live in different code that autoload independently"
		},
		{
			"heading": "best-practices-by-boundary-kind",
			"content": "**MCP tools**: validate input and output — the tool contract is a feature of the MCP surface, not an afterthought"
		},
		{
			"heading": "best-practices-by-boundary-kind",
			"content": "Unicode and max-length normalization is a constant across database-facing boundaries, ensuring cross-platform input never wedges persistence."
		},
		{
			"heading": "whats-next",
			"content": "Default Protections — how typed validation composes with the rest of the posture"
		},
		{
			"heading": "whats-next",
			"content": "HTTP Validation — schemas, errors, and field-mapped 422 responses"
		},
		{
			"heading": "whats-next",
			"content": "Data Validation — model-level rules, unicode checks, and best practices"
		},
		{
			"heading": "whats-next",
			"content": "Jobs — payload validation inside queued work"
		},
		{
			"heading": "whats-next",
			"content": "Realtime Channels — validation before broadcast"
		}
	],
	"headings": [
		{
			"id": "validation-is-a-default",
			"content": "Validation Is a Default"
		},
		{
			"id": "standard-schema",
			"content": "Standard Schema"
		},
		{
			"id": "field-dsl-derived-schemas",
			"content": "Field-DSL Derived Schemas"
		},
		{
			"id": "validation-at-the-model-boundary",
			"content": "Validation at the Model Boundary"
		},
		{
			"id": "validation-at-the-controller-boundary",
			"content": "Validation at the Controller Boundary"
		},
		{
			"id": "what-counts-as-input",
			"content": "What Counts as Input"
		},
		{
			"id": "beyond-requests",
			"content": "Beyond Requests"
		},
		{
			"id": "server-side-and-client-side-alignment",
			"content": "Server-Side and Client-Side Alignment"
		},
		{
			"id": "best-practices-by-boundary-kind",
			"content": "Best Practices by Boundary Kind"
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
		url: "#validation-is-a-default",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Validation Is a Default" })
	},
	{
		depth: 2,
		url: "#standard-schema",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Standard Schema" })
	},
	{
		depth: 2,
		url: "#field-dsl-derived-schemas",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Field-DSL Derived Schemas" })
	},
	{
		depth: 2,
		url: "#validation-at-the-model-boundary",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Validation at the Model Boundary" })
	},
	{
		depth: 2,
		url: "#validation-at-the-controller-boundary",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Validation at the Controller Boundary" })
	},
	{
		depth: 2,
		url: "#what-counts-as-input",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Counts as Input" })
	},
	{
		depth: 2,
		url: "#beyond-requests",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Beyond Requests" })
	},
	{
		depth: 2,
		url: "#server-side-and-client-side-alignment",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Server-Side and Client-Side Alignment" })
	},
	{
		depth: 2,
		url: "#best-practices-by-boundary-kind",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Best Practices by Boundary Kind" })
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
			"Kwiva's model is that ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "input is validated where input enters" }),
			", and every executor type ships with a schema slot for its inputs. There is no conventional \"unvalidated code path\": a value that reaches a model write, a job payload, or a channel handler has already passed a schema, so the code that receives it is allowed to trust its shape."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "validation-is-a-default",
			children: "Validation Is a Default"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Validation is not an opt-in middleware you remember to apply. Every boundary validates by construction:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Controllers validate the route schema before the handler runs" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Models validate typed field definitions before writes, and dynamic path/lookup validation up front" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Job payloads, event payloads, channel messages, MCP tool inputs, uploads, and search params each have their own schema slot" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The symmetry is deliberate: inputs are dense inside work items and sparse across web boundaries, and Kwiva validates at the exact point the data arrives rather than deferring the check to when it is used." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "standard-schema",
			children: "Standard Schema"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva's validation functions are ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Standard Schema compliant" }),
			", which means the ecosystem of Standard Schema adapters is interchangeable — Valibot, Zod, and any other compliant library can be dropped into any boundary without friction. The framework does not transport bespoke validation; it transports the shared contract."
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
			title: "standard-schema.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// which adapter doesn't matter — every boundary accepts a Standard Schema"
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
							children: " { x } "
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
							children: " 'valibot'"
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
							children: " defineValidation"
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
							children: "'createPost'"
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
						children: "  body: {"
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
							children: "    title: x."
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
							children: "(x."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "minLength"
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
							children: "), x."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "maxLength"
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
							children: "    published: x."
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
							children: "(x."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "boolean"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(), "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "false"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The practical benefit: your team's schema library, wherever it lives, plugs into controllers, models, jobs, channels, and MCP tools alike, with the same error mapping in every surface." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "field-dsl-derived-schemas",
			children: "Field-DSL Derived Schemas"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Models define their types with a typed field DSL, and the field definitions generate the schema that validates every operation. This is the tightest loop in the framework: the schema and the model cannot disagree, because one is derived from the other." }),
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
			title: "field-dsl-derived-schemas.ts",
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
							children: "'post'"
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
						children: "  fields: {"
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
							children: "    title: f."
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
							children: "    id: f."
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
							children: "cuid2"
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
			"Dynamic validation functions like ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "validation((s) => s.min(1).max(200))" }),
			" operate on the framework's string schema surface, so the constraints live in one place and apply to every write path — controllers, seeders, and application code all converge on the same rules."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "validation-at-the-model-boundary",
			children: "Validation at the Model Boundary"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Model operations validate before they write. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".create()" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".update()" }),
			" validate typed field definitions against the data, and dynamic path and lookup parameters are validated up front:"
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
			title: "validation-at-the-model-boundary.ts",
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
						children: " Post."
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
						children: "''"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " })  "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// throws: title must satisfy min(1)"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Type-level and runtime checks compose — the typed layer catches the shape at compile time and the validation layer catches the values at runtime. This is where the model, controller, job, and channel boundaries all agree: anything that writes validated, and anything that writes validly is already typed." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "validation-at-the-controller-boundary",
			children: "Validation at the Controller Boundary"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Controllers validate the route schema before the handler runs. The request body is checked against the schema, and search params and headers are validated when declared:" }),
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
			title: "validation-at-the-controller-boundary.ts",
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
							children: "  list: c."
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
							children: "'/'"
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
						children: "    schema: {"
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
							children: "      searchParams: { page: x."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "numeric"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "() },"
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
							children: "      headers: { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'x-session-id'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": x."
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
							children: "() },"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "    run"
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
							children: "body"
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
							children: "searchParams"
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
							children: "      return"
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
							children: "all"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ limit: "
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
						children: "  }),"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Validation failures become ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "field-mapped 422 responses" }),
			" — the response shape indicates which fields failed and why — and never reach the handler. Repeating the same checks by hand inside the handler is redundant work the schema already did."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-counts-as-input",
			children: "What Counts as Input"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The boundary model earns its name by being exhaustive about what can enter. In a Kwiva application, input is:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "request body, search params, and declared headers" }),
				" of a controller route"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "typed field values" }),
				" written through model operations"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "payload" }),
				" of a job or event, however it arrives"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "channel message" }),
				" before broadcast"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "arguments and results" }),
				" of an MCP tool call"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Uploaded files" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "search parameters" }),
				" on their own schemas"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Anything that did not originate inside your own validated code is input, and everything in that list has a schema slot by default. The converse is what makes the model comfortable: once a value has crossed a validated boundary, application code treats it as trustworthy, because trusting untested shape is precisely what the schema layer exists to prevent." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "beyond-requests",
			children: "Beyond Requests"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The other boundaries follow the same rule with their own schema slots:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Boundary" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What is validated" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Jobs" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The job's payload against its declared schema before the payload is processed" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Events" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The event payload against its schema for each listener" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Channels" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The message content before it is broadcast" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP tools" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tool input and output against their schemas" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Uploads" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "File type and size against the upload definition" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Search params" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route search parameters when declared in the route schema" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The consistency is the point: an event emitted by a controller and consumed by a listener already validated both sides of the hop, and an MCP tool invocation is validated before any side effect, the same as a controller route." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "server-side-and-client-side-alignment",
			children: "Server-Side and Client-Side Alignment"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the same schema definition is shared across server and client boundaries, the validation contract is one artifact. The client can preview constraints without re-implementing the rules, and the server remains the authority that enforces them. The framework never treats client-side checks as adequate — validation is always re-run server-side at the real boundary." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "best-practices-by-boundary-kind",
			children: "Best Practices by Boundary Kind"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The general rule — validate at the boundary, trust inside the executor — produces different habits per surface:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Controllers" }), ": declare body, search params, and headers; let 422 mapping be your API contract"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Models" }), ": put the constraint in the field DSL once; never write a second, divergent check at the write site"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Jobs and events" }), ": schema the payload, because the sender and consumer may live in different code that autoload independently"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "MCP tools" }), ": validate input and output — the tool contract is a feature of the MCP surface, not an afterthought"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Unicode and max-length normalization is a constant across database-facing boundaries, ensuring cross-platform input never wedges persistence." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/default-protections",
				children: "Default Protections"
			}), " — how typed validation composes with the rest of the posture"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/validation",
				children: "HTTP Validation"
			}), " — schemas, errors, and field-mapped 422 responses"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/validation",
				children: "Data Validation"
			}), " — model-level rules, unicode checks, and best practices"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/jobs",
				children: "Jobs"
			}), " — payload validation inside queued work"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/channels",
				children: "Realtime Channels"
			}), " — validation before broadcast"] }),
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
