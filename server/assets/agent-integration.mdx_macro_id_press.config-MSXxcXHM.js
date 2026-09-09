import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/ai-mcp/agent-integration.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Agent Integration",
	"description": "Wiring agents to Kwiva MCP tools — policy enforcement, per-tool permissions, tenant scoping, validation, and the error shapes an agent sees."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nAn agent connected to your Kwiva application is able to do exactly as much as the application's own policy and tenancy machinery allows — no more. Tool calls run through the same policies, the same per-tool abilities, the same tenant scoping, and the same validation as any HTTP request, and every call leaves a trace span and a structured log line behind.\n\nThe framing matters: the MCP surface is not a new application. It is a new door into the application you already built, and it opens with the same keys. This page is about what happens after an agent invokes a tool — how identity, permission, tenancy, validation, and error reporting shape the experience.\n\n## Wiring an Agent [#wiring-an-agent]\n\nAn agent connects to the generated server over one of two transports. For a remote deployment, register the streamable HTTP endpoint with a bearer token:\n\n```json title=\"wiring-an-agent.json\"\n{\n  \"mcpServers\": {\n    \"acme\": {\n      \"url\": \"https://acme.dev/mcp\",\n      \"headers\": { \"authorization\": \"Bearer acme_token\" }\n    }\n  }\n}\n```\n\nFor local work, register the server as a stdio command and the agent starts it as a subprocess. Either way, the agent discovers the same tool list — derived from your opted-in models, controllers, and custom tools — and, on invoking a tool, becomes a caller in your application's identity model.\n\nThe bearer token is not a credential the server merely checks and discards. It is how the call is **attributed**: the identity behind the token is the identity the policy checks evaluate, the tenant scope resolves, and the audit trail records.\n\n## Policy Enforcement [#policy-enforcement]\n\nMCP tools are not a side channel that bypasses security; they are a front door with the same locks. Every tool call runs through the same policies as the equivalent route. The bearer token identifies a user or a service principal, and the abilities attached to that identity are what the policy checks evaluate.\n\nThe result is that a token scoped to read invoices can list and get invoices through the tools but cannot create, update, or delete them, and cannot touch a tool whose ability it lacks. Set policies once, in `definePolicy`, and they apply to the agent surface automatically because the tools derive from the same IR the routes derive from.\n\nPolicy checks happen per call, not per session. An agent that keeps a session open does not cache its way around a policy that changes mid-flight; the check is part of invocation, which is part of why the same code path that protects your routes protects your tools.\n\n## Per-Tool Permissions [#per-tool-permissions]\n\nPermissions layer at three points:\n\n| Surface                 | Permission                                                                           |\n| ----------------------- | ------------------------------------------------------------------------------------ |\n| Generated model tools   | The model's collection-level `permission` option gates the whole tool family         |\n| Controller-action tools | The action's own `permission` option                                                 |\n| Custom tools            | An explicit `ability` on `defineMcpTool` routes the call through the matching policy |\n\n`readOnly: true` in the MCP config adds a blunt safety throttle — only `list` and `get` tools are generated at all — which is useful when a human wants an agent to inspect, not mutate, even before abilities are considered.\n\nThe three layers compose: the allowlist decides whether a tool exists, `readOnly` decides whether it can mutate, and abilities decide whether this identity can call it. A read-only surface still runs policy checks, so a token without the read ability learns that a read is forbidden even on a surface built for reading.\n\n## Tenant Scoping [#tenant-scoping]\n\nThe bearer token binds a tenant. Every query a tool performs is injected with that tenant's scope — the model resolver enforces the tenant field on every query, so cross-tenant access is impossible even if the agent constructs arguments that would cross boundaries. The same tenant-scoped value flows into cache keys, storage prefixes, queue payloads, and trace and log attributes, so a tool call's side effects stay inside the tenant's slice of the system.\n\nThis is the guarantee that makes agents safe on multi-tenant deployments: an agent operating under one tenant's token cannot inspect, mutate, or even observe another tenant's data, no matter how it phrases its tool arguments. The tenant bound to the identity constrains every downstream effect — not just the query result, but the cache it writes and the job it enqueues.\n\n## Validation and Input Shaping [#validation-and-input-shaping]\n\nTool input schemas are the route schemas, converted to the JSON Schema form MCP requires. When an agent supplies invalid input, the tool call fails with the same field-mapped validation errors your API would return, attributed to the same ability and tenant context. An agent that sends a malformed body learns precisely which field failed and why.\n\nThe validation lifecycle is worth making explicit, because it is where agents most often misbehave:\n\n1. The **tool discovery** step already tells the agent its input shape — the JSON Schema derived from the route schemas, including defaults, optionality, and constraints.\n2. On **invocation**, the arguments are validated against that same schema before the handler runs.\n3. On **failure**, the returned error names the field and the rule, so a well-behaved agent can correct its next call rather than retrying blindly.\n\nAgents that respect discovery produce valid calls on the first try; agents that hallucinate inputs are caught by the same validation an API consumer would hit.\n\n## Error Shapes an Agent Sees [#error-shapes-an-agent-sees]\n\nAgents surface whatever a tool returns, so the shape of tool failures matters. Kwiva tools return failures consistent with the rest of the framework: a typed error object carrying a code and a message, mapped from the same 8-code taxonomy that your REST API uses. A forbidden call returns the permission error; a missing record returns the not-found error; invalid input returns a validation error with field details.\n\nTwo things are true for agents because they are true for the framework generally:\n\n1. The error is structured and typed — an agent can branch on the code rather than parsing prose.\n2. The error has identity context — request, trace, span, and tenant IDs attach to every log of a failed call, so a human can pull up exactly what the agent attempted.\n\nYour own [error handling](/docs/core-concepts/error-handling) and [request lifecycle](/docs/advanced/request-lifecycle) docs describe the taxonomy in detail; the MCP surface inherits it without modification.\n\nFor an agent-facing staple, a **structured, typed failure is the difference between a recoverable call and a stuck agent**. An agent that receives `permission_denied` can stop and ask instead of re-trying; an agent that receives prose can guess. The framework's taxonomy gives agents the former.\n\n## Auditability [#auditability]\n\nEvery tool call is a distributed trace span and a structured log entry. The span covers the call from authorization through handler and query, and the log line carries the token's attributed identity, the tenant, the tool name, and the outcome. Correlate a suspicious agent action back to the exact call that caused it using the request and trace IDs — the same correlation your HTTP traffic already provides.\n\nThe audit story is complete because the call is first-class: the same identity resolution, tenant binding, and tracing that make your HTTP requests explainable apply to tool calls. When an operator asks \"what did that agent do?\" the answer is in the same tracing and logging surfaces they already use, keyed by the tool's attributed identity.\n\n## Operational Guidance [#operational-guidance]\n\nA few patterns that keep agent access safe at scale:\n\n1. **Start read-only.** Let agents read before you let them mutate, and flip `readOnly` off only after the tool surface is audited.\n2. **Scope tokens narrowly.** Mint per-agent tokens with the minimal ability set the task requires, not a blanket admin token.\n3. **Monitor tool traffic.** Alert on failed-permission tool calls and on unusual read volumes — both already surface in metrics and structured logs.\n4. **Keep the surface explicit.** Opt in only the models and controllers a task actually needs; the config allowlist is the first line of defense.\n\nThe guidance generalizes to an operational rule: &#x2A;*an agent should be provisioned like a cautious employee, not a superuser.** The tool allowlist is its job description, the token is its badge, and the read-only switch is the training wheels you remove deliberately.\n\n## What's Next [#whats-next]\n\n* [MCP Server](/docs/ai-mcp/mcp-server) — Transports, auth strategies, and client configuration\n* [Tool Generation](/docs/ai-mcp/tool-generation) — The full tool surface your models and controllers produce\n* [Policies](/docs/authorization/policies) — The policy definitions every tool call runs through\n* [Tenant Scoping](/docs/tenancy/scoping) — How the tenant field constrains every query\n* [Logging](/docs/observability/logging) — The structured log lines every tool call emits\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "An agent connected to your Kwiva application is able to do exactly as much as the application's own policy and tenancy machinery allows — no more. Tool calls run through the same policies, the same per-tool abilities, the same tenant scoping, and the same validation as any HTTP request, and every call leaves a trace span and a structured log line behind."
		},
		{
			"heading": void 0,
			"content": "The framing matters: the MCP surface is not a new application. It is a new door into the application you already built, and it opens with the same keys. This page is about what happens after an agent invokes a tool — how identity, permission, tenancy, validation, and error reporting shape the experience."
		},
		{
			"heading": "wiring-an-agent",
			"content": "An agent connects to the generated server over one of two transports. For a remote deployment, register the streamable HTTP endpoint with a bearer token:"
		},
		{
			"heading": "wiring-an-agent",
			"content": "For local work, register the server as a stdio command and the agent starts it as a subprocess. Either way, the agent discovers the same tool list — derived from your opted-in models, controllers, and custom tools — and, on invoking a tool, becomes a caller in your application's identity model."
		},
		{
			"heading": "wiring-an-agent",
			"content": "The bearer token is not a credential the server merely checks and discards. It is how the call is **attributed**: the identity behind the token is the identity the policy checks evaluate, the tenant scope resolves, and the audit trail records."
		},
		{
			"heading": "policy-enforcement",
			"content": "MCP tools are not a side channel that bypasses security; they are a front door with the same locks. Every tool call runs through the same policies as the equivalent route. The bearer token identifies a user or a service principal, and the abilities attached to that identity are what the policy checks evaluate."
		},
		{
			"heading": "policy-enforcement",
			"content": "The result is that a token scoped to read invoices can list and get invoices through the tools but cannot create, update, or delete them, and cannot touch a tool whose ability it lacks. Set policies once, in `definePolicy`, and they apply to the agent surface automatically because the tools derive from the same IR the routes derive from."
		},
		{
			"heading": "policy-enforcement",
			"content": "Policy checks happen per call, not per session. An agent that keeps a session open does not cache its way around a policy that changes mid-flight; the check is part of invocation, which is part of why the same code path that protects your routes protects your tools."
		},
		{
			"heading": "per-tool-permissions",
			"content": "Permissions layer at three points:"
		},
		{
			"heading": "per-tool-permissions",
			"content": "Surface"
		},
		{
			"heading": "per-tool-permissions",
			"content": "Permission"
		},
		{
			"heading": "per-tool-permissions",
			"content": "Generated model tools"
		},
		{
			"heading": "per-tool-permissions",
			"content": "The model's collection-level `permission` option gates the whole tool family"
		},
		{
			"heading": "per-tool-permissions",
			"content": "Controller-action tools"
		},
		{
			"heading": "per-tool-permissions",
			"content": "The action's own `permission` option"
		},
		{
			"heading": "per-tool-permissions",
			"content": "Custom tools"
		},
		{
			"heading": "per-tool-permissions",
			"content": "An explicit `ability` on `defineMcpTool` routes the call through the matching policy"
		},
		{
			"heading": "per-tool-permissions",
			"content": "`readOnly: true` in the MCP config adds a blunt safety throttle — only `list` and `get` tools are generated at all — which is useful when a human wants an agent to inspect, not mutate, even before abilities are considered."
		},
		{
			"heading": "per-tool-permissions",
			"content": "The three layers compose: the allowlist decides whether a tool exists, `readOnly` decides whether it can mutate, and abilities decide whether this identity can call it. A read-only surface still runs policy checks, so a token without the read ability learns that a read is forbidden even on a surface built for reading."
		},
		{
			"heading": "tenant-scoping",
			"content": "The bearer token binds a tenant. Every query a tool performs is injected with that tenant's scope — the model resolver enforces the tenant field on every query, so cross-tenant access is impossible even if the agent constructs arguments that would cross boundaries. The same tenant-scoped value flows into cache keys, storage prefixes, queue payloads, and trace and log attributes, so a tool call's side effects stay inside the tenant's slice of the system."
		},
		{
			"heading": "tenant-scoping",
			"content": "This is the guarantee that makes agents safe on multi-tenant deployments: an agent operating under one tenant's token cannot inspect, mutate, or even observe another tenant's data, no matter how it phrases its tool arguments. The tenant bound to the identity constrains every downstream effect — not just the query result, but the cache it writes and the job it enqueues."
		},
		{
			"heading": "validation-and-input-shaping",
			"content": "Tool input schemas are the route schemas, converted to the JSON Schema form MCP requires. When an agent supplies invalid input, the tool call fails with the same field-mapped validation errors your API would return, attributed to the same ability and tenant context. An agent that sends a malformed body learns precisely which field failed and why."
		},
		{
			"heading": "validation-and-input-shaping",
			"content": "The validation lifecycle is worth making explicit, because it is where agents most often misbehave:"
		},
		{
			"heading": "validation-and-input-shaping",
			"content": "The **tool discovery** step already tells the agent its input shape — the JSON Schema derived from the route schemas, including defaults, optionality, and constraints."
		},
		{
			"heading": "validation-and-input-shaping",
			"content": "On **invocation**, the arguments are validated against that same schema before the handler runs."
		},
		{
			"heading": "validation-and-input-shaping",
			"content": "On **failure**, the returned error names the field and the rule, so a well-behaved agent can correct its next call rather than retrying blindly."
		},
		{
			"heading": "validation-and-input-shaping",
			"content": "Agents that respect discovery produce valid calls on the first try; agents that hallucinate inputs are caught by the same validation an API consumer would hit."
		},
		{
			"heading": "error-shapes-an-agent-sees",
			"content": "Agents surface whatever a tool returns, so the shape of tool failures matters. Kwiva tools return failures consistent with the rest of the framework: a typed error object carrying a code and a message, mapped from the same 8-code taxonomy that your REST API uses. A forbidden call returns the permission error; a missing record returns the not-found error; invalid input returns a validation error with field details."
		},
		{
			"heading": "error-shapes-an-agent-sees",
			"content": "Two things are true for agents because they are true for the framework generally:"
		},
		{
			"heading": "error-shapes-an-agent-sees",
			"content": "The error is structured and typed — an agent can branch on the code rather than parsing prose."
		},
		{
			"heading": "error-shapes-an-agent-sees",
			"content": "The error has identity context — request, trace, span, and tenant IDs attach to every log of a failed call, so a human can pull up exactly what the agent attempted."
		},
		{
			"heading": "error-shapes-an-agent-sees",
			"content": "Your own error handling and request lifecycle docs describe the taxonomy in detail; the MCP surface inherits it without modification."
		},
		{
			"heading": "error-shapes-an-agent-sees",
			"content": "For an agent-facing staple, a **structured, typed failure is the difference between a recoverable call and a stuck agent**. An agent that receives `permission_denied` can stop and ask instead of re-trying; an agent that receives prose can guess. The framework's taxonomy gives agents the former."
		},
		{
			"heading": "auditability",
			"content": "Every tool call is a distributed trace span and a structured log entry. The span covers the call from authorization through handler and query, and the log line carries the token's attributed identity, the tenant, the tool name, and the outcome. Correlate a suspicious agent action back to the exact call that caused it using the request and trace IDs — the same correlation your HTTP traffic already provides."
		},
		{
			"heading": "auditability",
			"content": "The audit story is complete because the call is first-class: the same identity resolution, tenant binding, and tracing that make your HTTP requests explainable apply to tool calls. When an operator asks \"what did that agent do?\" the answer is in the same tracing and logging surfaces they already use, keyed by the tool's attributed identity."
		},
		{
			"heading": "operational-guidance",
			"content": "A few patterns that keep agent access safe at scale:"
		},
		{
			"heading": "operational-guidance",
			"content": "**Start read-only.** Let agents read before you let them mutate, and flip `readOnly` off only after the tool surface is audited."
		},
		{
			"heading": "operational-guidance",
			"content": "**Scope tokens narrowly.** Mint per-agent tokens with the minimal ability set the task requires, not a blanket admin token."
		},
		{
			"heading": "operational-guidance",
			"content": "**Monitor tool traffic.** Alert on failed-permission tool calls and on unusual read volumes — both already surface in metrics and structured logs."
		},
		{
			"heading": "operational-guidance",
			"content": "**Keep the surface explicit.** Opt in only the models and controllers a task actually needs; the config allowlist is the first line of defense."
		},
		{
			"heading": "operational-guidance",
			"content": "The guidance generalizes to an operational rule: &#x2A;*an agent should be provisioned like a cautious employee, not a superuser.** The tool allowlist is its job description, the token is its badge, and the read-only switch is the training wheels you remove deliberately."
		},
		{
			"heading": "whats-next",
			"content": "MCP Server — Transports, auth strategies, and client configuration"
		},
		{
			"heading": "whats-next",
			"content": "Tool Generation — The full tool surface your models and controllers produce"
		},
		{
			"heading": "whats-next",
			"content": "Policies — The policy definitions every tool call runs through"
		},
		{
			"heading": "whats-next",
			"content": "Tenant Scoping — How the tenant field constrains every query"
		},
		{
			"heading": "whats-next",
			"content": "Logging — The structured log lines every tool call emits"
		}
	],
	"headings": [
		{
			"id": "wiring-an-agent",
			"content": "Wiring an Agent"
		},
		{
			"id": "policy-enforcement",
			"content": "Policy Enforcement"
		},
		{
			"id": "per-tool-permissions",
			"content": "Per-Tool Permissions"
		},
		{
			"id": "tenant-scoping",
			"content": "Tenant Scoping"
		},
		{
			"id": "validation-and-input-shaping",
			"content": "Validation and Input Shaping"
		},
		{
			"id": "error-shapes-an-agent-sees",
			"content": "Error Shapes an Agent Sees"
		},
		{
			"id": "auditability",
			"content": "Auditability"
		},
		{
			"id": "operational-guidance",
			"content": "Operational Guidance"
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
		url: "#wiring-an-agent",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Wiring an Agent" })
	},
	{
		depth: 2,
		url: "#policy-enforcement",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Policy Enforcement" })
	},
	{
		depth: 2,
		url: "#per-tool-permissions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Per-Tool Permissions" })
	},
	{
		depth: 2,
		url: "#tenant-scoping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Tenant Scoping" })
	},
	{
		depth: 2,
		url: "#validation-and-input-shaping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Validation and Input Shaping" })
	},
	{
		depth: 2,
		url: "#error-shapes-an-agent-sees",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Error Shapes an Agent Sees" })
	},
	{
		depth: 2,
		url: "#auditability",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Auditability" })
	},
	{
		depth: 2,
		url: "#operational-guidance",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Operational Guidance" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "An agent connected to your Kwiva application is able to do exactly as much as the application's own policy and tenancy machinery allows — no more. Tool calls run through the same policies, the same per-tool abilities, the same tenant scoping, and the same validation as any HTTP request, and every call leaves a trace span and a structured log line behind." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The framing matters: the MCP surface is not a new application. It is a new door into the application you already built, and it opens with the same keys. This page is about what happens after an agent invokes a tool — how identity, permission, tenancy, validation, and error reporting shape the experience." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "wiring-an-agent",
			children: "Wiring an Agent"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "An agent connects to the generated server over one of two transports. For a remote deployment, register the streamable HTTP endpoint with a bearer token:" }),
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
			title: "wiring-an-agent.json",
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
						children: "  \"mcpServers\""
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
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "    \"acme\""
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
							children: "      \"url\""
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
							children: "\"https://acme.dev/mcp\""
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
							children: "      \"headers\""
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "\"authorization\""
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
							children: "\"Bearer acme_token\""
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
						children: "    }"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "For local work, register the server as a stdio command and the agent starts it as a subprocess. Either way, the agent discovers the same tool list — derived from your opted-in models, controllers, and custom tools — and, on invoking a tool, becomes a caller in your application's identity model." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The bearer token is not a credential the server merely checks and discards. It is how the call is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "attributed" }),
			": the identity behind the token is the identity the policy checks evaluate, the tenant scope resolves, and the audit trail records."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "policy-enforcement",
			children: "Policy Enforcement"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "MCP tools are not a side channel that bypasses security; they are a front door with the same locks. Every tool call runs through the same policies as the equivalent route. The bearer token identifies a user or a service principal, and the abilities attached to that identity are what the policy checks evaluate." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The result is that a token scoped to read invoices can list and get invoices through the tools but cannot create, update, or delete them, and cannot touch a tool whose ability it lacks. Set policies once, in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			", and they apply to the agent surface automatically because the tools derive from the same IR the routes derive from."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Policy checks happen per call, not per session. An agent that keeps a session open does not cache its way around a policy that changes mid-flight; the check is part of invocation, which is part of why the same code path that protects your routes protects your tools." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "per-tool-permissions",
			children: "Per-Tool Permissions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Permissions layer at three points:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Permission" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generated model tools" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The model's collection-level ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" option gates the whole tool family"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controller-action tools" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The action's own ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
				" option"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Custom tools" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"An explicit ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ability" }),
				" on ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMcpTool" }),
				" routes the call through the matching policy"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readOnly: true" }),
			" in the MCP config adds a blunt safety throttle — only ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "list" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "get" }),
			" tools are generated at all — which is useful when a human wants an agent to inspect, not mutate, even before abilities are considered."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The three layers compose: the allowlist decides whether a tool exists, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readOnly" }),
			" decides whether it can mutate, and abilities decide whether this identity can call it. A read-only surface still runs policy checks, so a token without the read ability learns that a read is forbidden even on a surface built for reading."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "tenant-scoping",
			children: "Tenant Scoping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The bearer token binds a tenant. Every query a tool performs is injected with that tenant's scope — the model resolver enforces the tenant field on every query, so cross-tenant access is impossible even if the agent constructs arguments that would cross boundaries. The same tenant-scoped value flows into cache keys, storage prefixes, queue payloads, and trace and log attributes, so a tool call's side effects stay inside the tenant's slice of the system." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This is the guarantee that makes agents safe on multi-tenant deployments: an agent operating under one tenant's token cannot inspect, mutate, or even observe another tenant's data, no matter how it phrases its tool arguments. The tenant bound to the identity constrains every downstream effect — not just the query result, but the cache it writes and the job it enqueues." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "validation-and-input-shaping",
			children: "Validation and Input Shaping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tool input schemas are the route schemas, converted to the JSON Schema form MCP requires. When an agent supplies invalid input, the tool call fails with the same field-mapped validation errors your API would return, attributed to the same ability and tenant context. An agent that sends a malformed body learns precisely which field failed and why." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The validation lifecycle is worth making explicit, because it is where agents most often misbehave:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "tool discovery" }),
				" step already tells the agent its input shape — the JSON Schema derived from the route schemas, including defaults, optionality, and constraints."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"On ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "invocation" }),
				", the arguments are validated against that same schema before the handler runs."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"On ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "failure" }),
				", the returned error names the field and the rule, so a well-behaved agent can correct its next call rather than retrying blindly."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Agents that respect discovery produce valid calls on the first try; agents that hallucinate inputs are caught by the same validation an API consumer would hit." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "error-shapes-an-agent-sees",
			children: "Error Shapes an Agent Sees"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Agents surface whatever a tool returns, so the shape of tool failures matters. Kwiva tools return failures consistent with the rest of the framework: a typed error object carrying a code and a message, mapped from the same 8-code taxonomy that your REST API uses. A forbidden call returns the permission error; a missing record returns the not-found error; invalid input returns a validation error with field details." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two things are true for agents because they are true for the framework generally:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The error is structured and typed — an agent can branch on the code rather than parsing prose." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The error has identity context — request, trace, span, and tenant IDs attach to every log of a failed call, so a human can pull up exactly what the agent attempted." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Your own ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/error-handling",
				children: "error handling"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/request-lifecycle",
				children: "request lifecycle"
			}),
			" docs describe the taxonomy in detail; the MCP surface inherits it without modification."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For an agent-facing staple, a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "structured, typed failure is the difference between a recoverable call and a stuck agent" }),
			". An agent that receives ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission_denied" }),
			" can stop and ask instead of re-trying; an agent that receives prose can guess. The framework's taxonomy gives agents the former."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "auditability",
			children: "Auditability"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every tool call is a distributed trace span and a structured log entry. The span covers the call from authorization through handler and query, and the log line carries the token's attributed identity, the tenant, the tool name, and the outcome. Correlate a suspicious agent action back to the exact call that caused it using the request and trace IDs — the same correlation your HTTP traffic already provides." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The audit story is complete because the call is first-class: the same identity resolution, tenant binding, and tracing that make your HTTP requests explainable apply to tool calls. When an operator asks \"what did that agent do?\" the answer is in the same tracing and logging surfaces they already use, keyed by the tool's attributed identity." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "operational-guidance",
			children: "Operational Guidance"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A few patterns that keep agent access safe at scale:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Start read-only." }),
				" Let agents read before you let them mutate, and flip ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readOnly" }),
				" off only after the tool surface is audited."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Scope tokens narrowly." }), " Mint per-agent tokens with the minimal ability set the task requires, not a blanket admin token."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Monitor tool traffic." }), " Alert on failed-permission tool calls and on unusual read volumes — both already surface in metrics and structured logs."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Keep the surface explicit." }), " Opt in only the models and controllers a task actually needs; the config allowlist is the first line of defense."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The guidance generalizes to an operational rule: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "an agent should be provisioned like a cautious employee, not a superuser." }),
			" The tool allowlist is its job description, the token is its badge, and the read-only switch is the training wheels you remove deliberately."
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
				href: "/docs/ai-mcp/mcp-server",
				children: "MCP Server"
			}), " — Transports, auth strategies, and client configuration"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/ai-mcp/tool-generation",
				children: "Tool Generation"
			}), " — The full tool surface your models and controllers produce"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/policies",
				children: "Policies"
			}), " — The policy definitions every tool call runs through"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/scoping",
				children: "Tenant Scoping"
			}), " — How the tenant field constrains every query"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/logging",
				children: "Logging"
			}), " — The structured log lines every tool call emits"] }),
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
