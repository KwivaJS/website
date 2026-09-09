import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/ai-mcp/tool-generation.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Tool Generation",
	"description": "How models generate list, get, create, update, and delete tools; how controller actions become tools; custom tools; and how model IR shapes their schemas."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nThe MCP server's tool list is derived, not authored. Every opted-in model contributes a standard set of CRUD tools, every opted-in controller contributes one tool per action, and `defineMcpTool` adds anything the route surface cannot express. All of it inherits the schemas and descriptions already present in your model IR and route manifest.\n\nThere are exactly three ways a tool comes into existence:\n\n1. **From a model** — five standard tools per opted-in model\n2. **From a controller action** — one tool per action on an opted-in controller\n3. **From `defineMcpTool`** — an explicit custom tool declaration\n\nEverything an agent can call is one of these three. That trivially answers the questions operations people actually ask — what can an agent do, and where did that tool come from? — because every tool points back at a model, a controller, or a deliberate declaration in code.\n\n## From Model to Tools [#from-model-to-tools]\n\nEach model listed in the `models` config generates five tools. For an `invoices` model the surface is:\n\n| Tool              | Maps to          | Tool input                                         |\n| ----------------- | ---------------- | -------------------------------------------------- |\n| `invoices_list`   | The list route   | `where`, `page`, `orderBy` parameters              |\n| `invoices_get`    | The get route    | Record identifier                                  |\n| `invoices_create` | The create route | The validated body schema as the tool input schema |\n| `invoices_update` | The update route | Identifier plus the validated update body          |\n| `invoices_delete` | The delete route | Record identifier                                  |\n\nThe names are deterministic — `{model}_{action}` — which makes the tool list predictable for agents and for the tooling that documents it. The deterministic five-route shape your models already have in the REST API is exactly what the agent sees, so there is no separate convention to learn on the MCP side.\n\nThe full surface is generated only when both conditions hold: the model is in the `models` allowlist, and `readOnly` is `false`. With `readOnly: true`, only the read tools are generated:\n\n| Tool            | Maps to        |\n| --------------- | -------------- |\n| `invoices_list` | The list route |\n| `invoices_get`  | The get route  |\n\nEvery other tool is withheld, even though the underlying routes exist. `readOnly` is a surface-level throttle on your entire agent exposure, independent of per-tool abilities — a model can be read-only for every token without touching a single policy.\n\n## The List Tool's Shape [#the-list-tools-shape]\n\n`invoices_list` is the richest tool of the family because it inherits the query surface of the list route. The agent can filter, page, and order the same way an HTTP client can:\n\n```ts title=\"the-list-tool-s-shape.ts\"\n// invoices_list — the tool input the agent sees\n{\n  where: {\n    status: { equals: 'overdue' },\n    total: { greaterThan: 1000 },\n  },\n  page: 1,\n  orderBy: { dueDate: 'desc' },\n}\n```\n\nThe `where` shape is the same filter grammar the list route accepts, so agents can ask precise questions — \"list overdue invoices above 1000\" — instead of fetching and filtering client-side. Because the grammar is the route's grammar, the answer is the route's answer: same scoping, same pagination, same field rules.\n\n## Controller Actions as Tools [#controller-actions-as-tools]\n\nCustom controller actions become tools with their exact input and output types. If a controller exposes a summary action, the agent gets a `reports_summary` tool that accepts the action's typed inputs and returns its typed output:\n\n```ts title=\"src/app/http/controllers/reports.ts\"\n// src/app/http/controllers/reports.ts\nexport default defineController('reports', (c) => ({\n  summary: c.get('/summary', async ({ query }) => {\n    return { totals: await Invoice.summarize(query.period) }\n  }, {\n    query: { period: 'string' },\n    permission: 'reports.summary',\n  }),\n}))\n```\n\nThe `controllers` option in the MCP config opts this controller in:\n\n```ts title=\"controller-actions-as-tools.ts\"\ndefaults: {\n  models: ['invoices', 'customers'],\n  controllers: ['reports'],   // → reports_summary tool\n}\n```\n\nBecause the tool reuses the controller's own types, an agent can discover the summary's input shape and expected return without any additional documentation. The tool name is `{controller}_{action}` — `reports` plus `summary` — mirroring the model convention, so the agent's registry reads uniformly.\n\nController action tools are how a generated surface stays small while still expressing real business operations. A model tool mutates rows; an action tool runs the business logic you wrote — recomputing a total, triggering a workflow, calling a provider — with the action's permission and the caller's session intact.\n\n## Custom Tools [#custom-tools]\n\nFor behavior that does not map to a route — composing data, calling out to a provider, generating content — define a tool directly:\n\n```ts title=\"src/app/mcp/tools.ts\"\n// src/app/mcp/tools.ts\nimport { defineMcpTool } from '@kwiva/mcp'\n\nexport const draftInvoiceEmail = defineMcpTool('draft_invoice_email', {\n  description: 'Draft a collection email for an overdue invoice',\n  input: { invoiceId: 'uuid' },\n  handler: async ({ invoiceId, session }) => {\n    const invoice = await Invoice.findOrFail(invoiceId)\n    return draftEmail(invoice)             // agent gets structured data, composes the text\n  },\n  ability: 'invoices.read',\n})\n```\n\nCustom tools follow the same `defineX` conventions as everything else — one tool per file, discovered by location, typed inputs, and an explicit ability. The `ability` optionally narrows which policies must approve the call, and the handler receives the authenticated session so it can act as the calling identity.\n\nCustom tools are where the \"agent reads, human writes\" division of labor is expressed in code. The tool returns structured data the agent composes; the mutating act stays a controller action or a model tool, which carries the same audit and policy weight as an API call. Design custom tools to hand agents data, not delegation.\n\n## Schemas and Descriptions from the Model IR [#schemas-and-descriptions-from-the-model-ir]\n\nEvery generated tool's input schema comes from the route schemas, converted from the framework's standard validation schema into the JSON Schema form MCP expects. There is no second schema written for the agent:\n\n* For generated model tools, the create and update inputs are the model's field-level validation — defaults, optionality, and constraints — with no duplication.\n* For controller-action tools, the body, query, and params schemas defined on the route become the tool's input schema.\n* Field descriptions declared on the model DSL flow through the IR into structured tool responses, so an agent gets meaningful descriptions rather than bare field names.\n\nThe same derivation pipeline that feeds the REST API, typed client, Studio, and OpenAPI feeds the tools. When a validation chain changes on a model, the tool input schema changes with it in the same build. An agent that sends a malformed body learns precisely which field failed and why — the same field-mapped validation errors your API would return.\n\n## Permissions on Tools [#permissions-on-tools]\n\nTools stay inside the framework's authorization model. Model tools inherit the collection-level `permission` option declared on the model, so the same policy namespace that gates the generated routes gates the agent's calls. Controller-action tools carry their route's `permission`. Custom tools declare an `ability` explicitly, which routes the call through the corresponding policy check. A token with abilities that do not cover a tool simply cannot invoke it.\n\nThis is the third and deepest layer of the defense in depth described on [MCP Server](/docs/ai-mcp/mcp-server): the allowlist decides whether a tool exists, `readOnly` decides whether it can mutate, and abilities decide whether a given identity can call it at all.\n\n## Generated Tool Checklist [#generated-tool-checklist]\n\nA quick way to reason about the surface your config produces:\n\n| Source                      | Tool registration                     | Schema source           | Permission source  |\n| --------------------------- | ------------------------------------- | ----------------------- | ------------------ |\n| Model in `models`           | `{model}_{action}` × 5                | Model / route schemas   | Model `permission` |\n| Controller in `controllers` | `{controller}_{action}` × actions     | Route body/query/params | Route `permission` |\n| `defineMcpTool` export      | Declared name                         | Declared `input`        | Declared `ability` |\n| `readOnly: true`            | Only `{model}_list` and `{model}_get` | —                       | Model `permission` |\n\nIf a tool appears in the agent's discovery that you did not expect, one of these four rows explains it — and each row is a one-line config or code change upstream.\n\n## What's Next [#whats-next]\n\n* [MCP Server](/docs/ai-mcp/mcp-server) — Enable the server and choose transports and auth\n* [Agent Integration](/docs/ai-mcp/agent-integration) — How policies, tenants, and errors shape what an agent experiences\n* [Model IR](/docs/advanced/model-ir) — The single IR every tool is derived from\n* [Models](/docs/data/models) — The definitions that produce the CRUD tool surface\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The MCP server's tool list is derived, not authored. Every opted-in model contributes a standard set of CRUD tools, every opted-in controller contributes one tool per action, and `defineMcpTool` adds anything the route surface cannot express. All of it inherits the schemas and descriptions already present in your model IR and route manifest."
		},
		{
			"heading": void 0,
			"content": "There are exactly three ways a tool comes into existence:"
		},
		{
			"heading": void 0,
			"content": "**From a model** — five standard tools per opted-in model"
		},
		{
			"heading": void 0,
			"content": "**From a controller action** — one tool per action on an opted-in controller"
		},
		{
			"heading": void 0,
			"content": "**From `defineMcpTool`** — an explicit custom tool declaration"
		},
		{
			"heading": void 0,
			"content": "Everything an agent can call is one of these three. That trivially answers the questions operations people actually ask — what can an agent do, and where did that tool come from? — because every tool points back at a model, a controller, or a deliberate declaration in code."
		},
		{
			"heading": "from-model-to-tools",
			"content": "Each model listed in the `models` config generates five tools. For an `invoices` model the surface is:"
		},
		{
			"heading": "from-model-to-tools",
			"content": "Tool"
		},
		{
			"heading": "from-model-to-tools",
			"content": "Maps to"
		},
		{
			"heading": "from-model-to-tools",
			"content": "Tool input"
		},
		{
			"heading": "from-model-to-tools",
			"content": "`invoices_list`"
		},
		{
			"heading": "from-model-to-tools",
			"content": "The list route"
		},
		{
			"heading": "from-model-to-tools",
			"content": "`where`, `page`, `orderBy` parameters"
		},
		{
			"heading": "from-model-to-tools",
			"content": "`invoices_get`"
		},
		{
			"heading": "from-model-to-tools",
			"content": "The get route"
		},
		{
			"heading": "from-model-to-tools",
			"content": "Record identifier"
		},
		{
			"heading": "from-model-to-tools",
			"content": "`invoices_create`"
		},
		{
			"heading": "from-model-to-tools",
			"content": "The create route"
		},
		{
			"heading": "from-model-to-tools",
			"content": "The validated body schema as the tool input schema"
		},
		{
			"heading": "from-model-to-tools",
			"content": "`invoices_update`"
		},
		{
			"heading": "from-model-to-tools",
			"content": "The update route"
		},
		{
			"heading": "from-model-to-tools",
			"content": "Identifier plus the validated update body"
		},
		{
			"heading": "from-model-to-tools",
			"content": "`invoices_delete`"
		},
		{
			"heading": "from-model-to-tools",
			"content": "The delete route"
		},
		{
			"heading": "from-model-to-tools",
			"content": "Record identifier"
		},
		{
			"heading": "from-model-to-tools",
			"content": "The names are deterministic — `{model}_{action}` — which makes the tool list predictable for agents and for the tooling that documents it. The deterministic five-route shape your models already have in the REST API is exactly what the agent sees, so there is no separate convention to learn on the MCP side."
		},
		{
			"heading": "from-model-to-tools",
			"content": "The full surface is generated only when both conditions hold: the model is in the `models` allowlist, and `readOnly` is `false`. With `readOnly: true`, only the read tools are generated:"
		},
		{
			"heading": "from-model-to-tools",
			"content": "Tool"
		},
		{
			"heading": "from-model-to-tools",
			"content": "Maps to"
		},
		{
			"heading": "from-model-to-tools",
			"content": "`invoices_list`"
		},
		{
			"heading": "from-model-to-tools",
			"content": "The list route"
		},
		{
			"heading": "from-model-to-tools",
			"content": "`invoices_get`"
		},
		{
			"heading": "from-model-to-tools",
			"content": "The get route"
		},
		{
			"heading": "from-model-to-tools",
			"content": "Every other tool is withheld, even though the underlying routes exist. `readOnly` is a surface-level throttle on your entire agent exposure, independent of per-tool abilities — a model can be read-only for every token without touching a single policy."
		},
		{
			"heading": "the-list-tools-shape",
			"content": "`invoices_list` is the richest tool of the family because it inherits the query surface of the list route. The agent can filter, page, and order the same way an HTTP client can:"
		},
		{
			"heading": "the-list-tools-shape",
			"content": "The `where` shape is the same filter grammar the list route accepts, so agents can ask precise questions — \"list overdue invoices above 1000\" — instead of fetching and filtering client-side. Because the grammar is the route's grammar, the answer is the route's answer: same scoping, same pagination, same field rules."
		},
		{
			"heading": "controller-actions-as-tools",
			"content": "Custom controller actions become tools with their exact input and output types. If a controller exposes a summary action, the agent gets a `reports_summary` tool that accepts the action's typed inputs and returns its typed output:"
		},
		{
			"heading": "controller-actions-as-tools",
			"content": "The `controllers` option in the MCP config opts this controller in:"
		},
		{
			"heading": "controller-actions-as-tools",
			"content": "Because the tool reuses the controller's own types, an agent can discover the summary's input shape and expected return without any additional documentation. The tool name is `{controller}_{action}` — `reports` plus `summary` — mirroring the model convention, so the agent's registry reads uniformly."
		},
		{
			"heading": "controller-actions-as-tools",
			"content": "Controller action tools are how a generated surface stays small while still expressing real business operations. A model tool mutates rows; an action tool runs the business logic you wrote — recomputing a total, triggering a workflow, calling a provider — with the action's permission and the caller's session intact."
		},
		{
			"heading": "custom-tools",
			"content": "For behavior that does not map to a route — composing data, calling out to a provider, generating content — define a tool directly:"
		},
		{
			"heading": "custom-tools",
			"content": "Custom tools follow the same `defineX` conventions as everything else — one tool per file, discovered by location, typed inputs, and an explicit ability. The `ability` optionally narrows which policies must approve the call, and the handler receives the authenticated session so it can act as the calling identity."
		},
		{
			"heading": "custom-tools",
			"content": "Custom tools are where the \"agent reads, human writes\" division of labor is expressed in code. The tool returns structured data the agent composes; the mutating act stays a controller action or a model tool, which carries the same audit and policy weight as an API call. Design custom tools to hand agents data, not delegation."
		},
		{
			"heading": "schemas-and-descriptions-from-the-model-ir",
			"content": "Every generated tool's input schema comes from the route schemas, converted from the framework's standard validation schema into the JSON Schema form MCP expects. There is no second schema written for the agent:"
		},
		{
			"heading": "schemas-and-descriptions-from-the-model-ir",
			"content": "For generated model tools, the create and update inputs are the model's field-level validation — defaults, optionality, and constraints — with no duplication."
		},
		{
			"heading": "schemas-and-descriptions-from-the-model-ir",
			"content": "For controller-action tools, the body, query, and params schemas defined on the route become the tool's input schema."
		},
		{
			"heading": "schemas-and-descriptions-from-the-model-ir",
			"content": "Field descriptions declared on the model DSL flow through the IR into structured tool responses, so an agent gets meaningful descriptions rather than bare field names."
		},
		{
			"heading": "schemas-and-descriptions-from-the-model-ir",
			"content": "The same derivation pipeline that feeds the REST API, typed client, Studio, and OpenAPI feeds the tools. When a validation chain changes on a model, the tool input schema changes with it in the same build. An agent that sends a malformed body learns precisely which field failed and why — the same field-mapped validation errors your API would return."
		},
		{
			"heading": "permissions-on-tools",
			"content": "Tools stay inside the framework's authorization model. Model tools inherit the collection-level `permission` option declared on the model, so the same policy namespace that gates the generated routes gates the agent's calls. Controller-action tools carry their route's `permission`. Custom tools declare an `ability` explicitly, which routes the call through the corresponding policy check. A token with abilities that do not cover a tool simply cannot invoke it."
		},
		{
			"heading": "permissions-on-tools",
			"content": "This is the third and deepest layer of the defense in depth described on MCP Server: the allowlist decides whether a tool exists, `readOnly` decides whether it can mutate, and abilities decide whether a given identity can call it at all."
		},
		{
			"heading": "generated-tool-checklist",
			"content": "A quick way to reason about the surface your config produces:"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Source"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Tool registration"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Schema source"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Permission source"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Model in `models`"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "`{model}_{action}` × 5"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Model / route schemas"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Model `permission`"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Controller in `controllers`"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "`{controller}_{action}` × actions"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Route body/query/params"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Route `permission`"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "`defineMcpTool` export"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Declared name"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Declared `input`"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Declared `ability`"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "`readOnly: true`"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Only `{model}_list` and `{model}_get`"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "—"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "Model `permission`"
		},
		{
			"heading": "generated-tool-checklist",
			"content": "If a tool appears in the agent's discovery that you did not expect, one of these four rows explains it — and each row is a one-line config or code change upstream."
		},
		{
			"heading": "whats-next",
			"content": "MCP Server — Enable the server and choose transports and auth"
		},
		{
			"heading": "whats-next",
			"content": "Agent Integration — How policies, tenants, and errors shape what an agent experiences"
		},
		{
			"heading": "whats-next",
			"content": "Model IR — The single IR every tool is derived from"
		},
		{
			"heading": "whats-next",
			"content": "Models — The definitions that produce the CRUD tool surface"
		}
	],
	"headings": [
		{
			"id": "from-model-to-tools",
			"content": "From Model to Tools"
		},
		{
			"id": "the-list-tools-shape",
			"content": "The List Tool's Shape"
		},
		{
			"id": "controller-actions-as-tools",
			"content": "Controller Actions as Tools"
		},
		{
			"id": "custom-tools",
			"content": "Custom Tools"
		},
		{
			"id": "schemas-and-descriptions-from-the-model-ir",
			"content": "Schemas and Descriptions from the Model IR"
		},
		{
			"id": "permissions-on-tools",
			"content": "Permissions on Tools"
		},
		{
			"id": "generated-tool-checklist",
			"content": "Generated Tool Checklist"
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
		url: "#from-model-to-tools",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "From Model to Tools" })
	},
	{
		depth: 2,
		url: "#the-list-tools-shape",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The List Tool's Shape" })
	},
	{
		depth: 2,
		url: "#controller-actions-as-tools",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Controller Actions as Tools" })
	},
	{
		depth: 2,
		url: "#custom-tools",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Custom Tools" })
	},
	{
		depth: 2,
		url: "#schemas-and-descriptions-from-the-model-ir",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Schemas and Descriptions from the Model IR" })
	},
	{
		depth: 2,
		url: "#permissions-on-tools",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Permissions on Tools" })
	},
	{
		depth: 2,
		url: "#generated-tool-checklist",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generated Tool Checklist" })
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
			"The MCP server's tool list is derived, not authored. Every opted-in model contributes a standard set of CRUD tools, every opted-in controller contributes one tool per action, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMcpTool" }),
			" adds anything the route surface cannot express. All of it inherits the schemas and descriptions already present in your model IR and route manifest."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "There are exactly three ways a tool comes into existence:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "From a model" }), " — five standard tools per opted-in model"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "From a controller action" }), " — one tool per action on an opted-in controller"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: ["From ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMcpTool" })] }), " — an explicit custom tool declaration"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Everything an agent can call is one of these three. That trivially answers the questions operations people actually ask — what can an agent do, and where did that tool come from? — because every tool points back at a model, a controller, or a deliberate declaration in code." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "from-model-to-tools",
			children: "From Model to Tools"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each model listed in the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" }),
			" config generates five tools. For an ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices" }),
			" model the surface is:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Tool" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Maps to" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Tool input" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_list" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The list route" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "page" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "orderBy" }),
					" parameters"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_get" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The get route" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Record identifier" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_create" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The create route" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The validated body schema as the tool input schema" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_update" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The update route" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Identifier plus the validated update body" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_delete" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The delete route" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Record identifier" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The names are deterministic — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{model}_{action}" }),
			" — which makes the tool list predictable for agents and for the tooling that documents it. The deterministic five-route shape your models already have in the REST API is exactly what the agent sees, so there is no separate convention to learn on the MCP side."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The full surface is generated only when both conditions hold: the model is in the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" }),
			" allowlist, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readOnly" }),
			" is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "false" }),
			". With ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readOnly: true" }),
			", only the read tools are generated:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Tool" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Maps to" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_list" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The list route" })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_get" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The get route" })] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every other tool is withheld, even though the underlying routes exist. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readOnly" }),
			" is a surface-level throttle on your entire agent exposure, independent of per-tool abilities — a model can be read-only for every token without touching a single policy."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-list-tools-shape",
			children: "The List Tool's Shape"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_list" }), " is the richest tool of the family because it inherits the query surface of the list route. The agent can filter, page, and order the same way an HTTP client can:"] }),
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
			title: "the-list-tool-s-shape.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// invoices_list — the tool input the agent sees"
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
						children: "{"
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
						children: "  where"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "    status"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "equals"
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
							children: "'overdue'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "    total"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "greaterThan"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "1000"
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
							children: "  page"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  orderBy"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "dueDate"
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
							children: "'desc'"
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
						children: "}"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
			" shape is the same filter grammar the list route accepts, so agents can ask precise questions — \"list overdue invoices above 1000\" — instead of fetching and filtering client-side. Because the grammar is the route's grammar, the answer is the route's answer: same scoping, same pagination, same field rules."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "controller-actions-as-tools",
			children: "Controller Actions as Tools"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Custom controller actions become tools with their exact input and output types. If a controller exposes a summary action, the agent gets a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "reports_summary" }),
			" tool that accepts the action's typed inputs and returns its typed output:"
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
			title: "src/app/http/controllers/reports.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/http/controllers/reports.ts"
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
							children: "'reports'"
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
							children: "  summary: c."
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
							children: "'/summary'"
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
							children: "query"
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
							children: "    return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { totals: "
						}),
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
							children: " Invoice."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "summarize"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(query.period) }"
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
						children: "  }, {"
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
							children: "    query: { period: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'string'"
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
							children: "    permission: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'reports.summary'"
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
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "controllers" }),
			" option in the MCP config opts this controller in:"
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
			title: "controller-actions-as-tools.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "defaults"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  models"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'invoices'"
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
							children: "'customers'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "],"
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
							children: "  controllers"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'reports'"
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
							children: "// → reports_summary tool"
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
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the tool reuses the controller's own types, an agent can discover the summary's input shape and expected return without any additional documentation. The tool name is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{controller}_{action}" }),
			" — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "reports" }),
			" plus ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "summary" }),
			" — mirroring the model convention, so the agent's registry reads uniformly."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Controller action tools are how a generated surface stays small while still expressing real business operations. A model tool mutates rows; an action tool runs the business logic you wrote — recomputing a total, triggering a workflow, calling a provider — with the action's permission and the caller's session intact." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "custom-tools",
			children: "Custom Tools"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "For behavior that does not map to a route — composing data, calling out to a provider, generating content — define a tool directly:" }),
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
			title: "src/app/mcp/tools.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/mcp/tools.ts"
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
							children: " { defineMcpTool } "
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
							children: " '@kwiva/mcp'"
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
							children: " draftInvoiceEmail"
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
							children: " defineMcpTool"
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
							children: "'draft_invoice_email'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  description: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Draft a collection email for an overdue invoice'"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  input: { invoiceId: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'uuid'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  handler"
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
							children: "invoiceId"
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
							children: "    const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " invoice"
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
							children: " Invoice."
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
							children: "(invoiceId)"
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
							children: "    return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " draftEmail"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(invoice)             "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// agent gets structured data, composes the text"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  ability: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'invoices.read'"
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
			"Custom tools follow the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" conventions as everything else — one tool per file, discovered by location, typed inputs, and an explicit ability. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ability" }),
			" optionally narrows which policies must approve the call, and the handler receives the authenticated session so it can act as the calling identity."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Custom tools are where the \"agent reads, human writes\" division of labor is expressed in code. The tool returns structured data the agent composes; the mutating act stays a controller action or a model tool, which carries the same audit and policy weight as an API call. Design custom tools to hand agents data, not delegation." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "schemas-and-descriptions-from-the-model-ir",
			children: "Schemas and Descriptions from the Model IR"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every generated tool's input schema comes from the route schemas, converted from the framework's standard validation schema into the JSON Schema form MCP expects. There is no second schema written for the agent:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "For generated model tools, the create and update inputs are the model's field-level validation — defaults, optionality, and constraints — with no duplication." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "For controller-action tools, the body, query, and params schemas defined on the route become the tool's input schema." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Field descriptions declared on the model DSL flow through the IR into structured tool responses, so an agent gets meaningful descriptions rather than bare field names." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The same derivation pipeline that feeds the REST API, typed client, Studio, and OpenAPI feeds the tools. When a validation chain changes on a model, the tool input schema changes with it in the same build. An agent that sends a malformed body learns precisely which field failed and why — the same field-mapped validation errors your API would return." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "permissions-on-tools",
			children: "Permissions on Tools"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Tools stay inside the framework's authorization model. Model tools inherit the collection-level ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" option declared on the model, so the same policy namespace that gates the generated routes gates the agent's calls. Controller-action tools carry their route's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			". Custom tools declare an ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ability" }),
			" explicitly, which routes the call through the corresponding policy check. A token with abilities that do not cover a tool simply cannot invoke it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This is the third and deepest layer of the defense in depth described on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/ai-mcp/mcp-server",
				children: "MCP Server"
			}),
			": the allowlist decides whether a tool exists, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readOnly" }),
			" decides whether it can mutate, and abilities decide whether a given identity can call it at all."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generated-tool-checklist",
			children: "Generated Tool Checklist"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A quick way to reason about the surface your config produces:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Source" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Tool registration" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Schema source" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Permission source" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Model in ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" })] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{model}_{action}" }), " × 5"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model / route schemas" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Model ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Controller in ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "controllers" })] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{controller}_{action}" }), " × actions"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route body/query/params" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Route ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMcpTool" }), " export"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Declared name" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Declared ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "input" })] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Declared ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ability" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readOnly: true" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Only ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{model}_list" }),
					" and ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{model}_get" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "—" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Model ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" })] })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "If a tool appears in the agent's discovery that you did not expect, one of these four rows explains it — and each row is a one-line config or code change upstream." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/ai-mcp/mcp-server",
				children: "MCP Server"
			}), " — Enable the server and choose transports and auth"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/ai-mcp/agent-integration",
				children: "Agent Integration"
			}), " — How policies, tenants, and errors shape what an agent experiences"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/model-ir",
				children: "Model IR"
			}), " — The single IR every tool is derived from"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}), " — The definitions that produce the CRUD tool surface"] }),
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
