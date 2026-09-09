import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/ai-mcp/mcp-server.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "MCP Server",
	"description": "Running the generated MCP server — enable config, stdio and streamable HTTP transports, auth strategies, and connecting a client or agent."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\n`@kwiva/mcp` exposes your application to AI agents as a Model Context Protocol server. Because the server is generated from your model and controller IR, there is no protocol code to write and no tool registry to maintain — you configure, and it serves.\n\nThe server is a thin, derived artifact: it mounts at a route you choose, speaks the transport you select, authenticates the caller, and lists the tools your opted-in models, controllers, and custom tool files produce. Everything else — schemas, permissions, tenant scoping, validation, audit — belongs to the framework and is inherited unchanged.\n\n## Enabling the Server [#enabling-the-server]\n\nEnablement lives in one config module. Add it to `src/config/` and the server mounts automatically:\n\n```ts title=\"src/config/mcp.ts\"\n// src/config/mcp.ts\nimport { defineConfig } from '@kwiva/config'\n\nexport default defineConfig('mcp', {\n  defaults: {\n    enabled: true,\n    route: '/mcp',\n    transport: 'http',                 // 'http' (streamable) | 'stdio'\n    auth: 'bearer',                    // token strategy; session cookies also supported\n    models: ['invoices', 'customers'], // generate tools for these models\n    controllers: ['reports'],          // expose custom actions as tools\n    readOnly: false,                   // true → list/get only\n  },\n})\n```\n\nThe config follows the framework's normal shape: plain defaults in a config module, overridable per environment through the typed environment binding.\n\n| Option        | Meaning                                                                  |\n| ------------- | ------------------------------------------------------------------------ |\n| `enabled`     | Whether the MCP server is mounted at all                                 |\n| `route`       | The HTTP path the server is served at                                    |\n| `transport`   | `http` (streamable) or `stdio`                                           |\n| `auth`        | The authentication strategy for the server                               |\n| `models`      | Which models generate tools — an allowlist, not an all-or-nothing switch |\n| `controllers` | Which controllers expose their actions as tools                          |\n| `readOnly`    | When true, only `list` and `get` tools are generated                     |\n\nThe `env` binding works like any other config module, so environments can differ the same way they do for the rest of the stack: a local config may enable `stdio` with auth off, while a production config enables streamable HTTP with `bearer` and a stricter `readOnly`. See [Configuration](/docs/core-concepts/configuration) for precedence rules.\n\n## The Allowlist and the Read-Only Throttle [#the-allowlist-and-the-read-only-throttle]\n\nTwo options shape what the agent sees before abilities even come into play:\n\n* `models` and `controllers` are **allowlists** — a model or controller that is not listed generates no tools at all. Nothing is exposed by implication.\n* `readOnly: true` **throttles the entire surface** to `list` and `get` tools regardless of what the underlying routes allow. It is a blunt instrument on purpose: one switch that guarantees an agent can inspect but never mutate, and the natural first configuration for teams letting agents loose on production data.\n\nCombined, they form the defense in depth that most integrations never ship: the allowlist controls what exists, the read-only switch controls what the agent can do, and per-tool abilities control what a given identity may do — see [Agent Integration](/docs/ai-mcp/agent-integration).\n\n## Transports [#transports]\n\nThe server supports two transports, selected with the `transport` option:\n\n| Transport           | Use when                                                                               |\n| ------------------- | -------------------------------------------------------------------------------------- |\n| `stdio`             | The agent runs the server as a local subprocess — local development and desktop agents |\n| `http` (streamable) | The server is a remote endpoint — deployed applications and hosted agents              |\n\nWith `stdio`, the agent process spawns the server and communicates over standard input and output; no network exposure is involved. This is the local-development shape: an agent on your machine talks to your app without opening a socket. It suits `none` or `session` auth because the transport itself is the trust boundary.\n\nWith streamable HTTP, the server is served at the configured `route` — `/mcp` by default — and uses streaming responses, which fits server-rendered and long-running tool execution. This is the production shape: a deployed endpoint that hosted agents reach over the network, protected by bearer auth and the tenant binding that comes with it.\n\nChoosing a transport implies an auth posture. `stdio` is a local trust boundary; `http` reaches the network and should carry `bearer` or `session`. There is no transport that makes a public endpoint private.\n\n## Authentication Strategies [#authentication-strategies]\n\nThe `auth` option selects how tool callers prove who they are:\n\n| Strategy  | Use                                                                                                 |\n| --------- | --------------------------------------------------------------------------------------------------- |\n| `bearer`  | Service tokens with scoped abilities — the default, and the right choice for most production agents |\n| `session` | A human-agent hybrid where browser session cookies flow through the MCP surface                     |\n| `none`    | Local development over `stdio`, where the transport itself is the trust boundary                    |\n\nThe bearer token matters beyond transport security: it is what identity is attributed to the call. Every tool invocation runs through policies for that identity, and the tenant bound to the token scopes every query — so one token can never reach another tenant's rows.\n\nMint tokens narrowly. A token for a sales-reporting agent needs `invoices` read abilities and nothing else; a blanket admin token defeats the point of carrying abilities on the tool surface. Scoping tokens to the minimal set the agent's task requires keeps the MCP surface as constrained as it looks. See [Permissions](/docs/authorization/permissions) and [Policies](/docs/authorization/policies) for the ability model behind them.\n\n## Connecting a Client or Agent [#connecting-a-client-or-agent]\n\nFrom the agent side, the server is just another MCP server to register. For a remote deployment over streamable HTTP:\n\n```json title=\"connecting-a-client-or-agent.json\"\n{\n  \"mcpServers\": {\n    \"acme\": {\n      \"url\": \"https://acme.dev/mcp\",\n      \"headers\": { \"authorization\": \"Bearer acme_token\" }\n    }\n  }\n}\n```\n\nFor local development, register the server as a `stdio` command and the agent connects to your generated surface directly:\n\n```json title=\"connecting-a-client-or-agent-2.json\"\n{\n  \"mcpServers\": {\n    \"acme-local\": {\n      \"command\": \"kwiva\",\n      \"args\": [\"mcp\", \"serve\"]\n    }\n  }\n}\n```\n\nThe agent then discovers the tool list — `invoices_list`, `invoices_get`, `invoices_create`, `invoices_update`, `invoices_delete`, plus any controller actions and custom tools — with input schemas already attached. There is no separate registration of each tool; the server reports what the IR produces.\n\nIf your agent client supports `isolationScope: 'local'`, use it for the stdio configuration so the server is instantiated per agent session and test runs do not share state. For desktop agents that prompt for a URL, point them at the streamable HTTP endpoint and pass the bearer token via the client's authorization header.\n\n## Building and Verifying [#building-and-verifying]\n\nThe server and its tool list are derived from the IR that every build already produces. To verify your configuration:\n\n1. Run `kwiva dev` or a build so the model IR and route manifest are written to `src/.kwiva/`.\n2. Confirm the MCP server is enabled and the transport matches where you run it.\n3. Connect a client with the configuration above and inspect the offered tools.\n4. If a model is missing, check that its name is in the `models` list or that it is spelled exactly as defined.\n\nBecause the server is generated, fixing a typo in a model name or a config value is all you ever do — there is no separate server codebase to deploy.\n\n## Deploying the Server [#deploying-the-server]\n\nStreamable HTTP mounts inside your application, so deployment is deployment: the server rides the same process and route as everything else, inherits the same session and tenancy resolution, and needs no extra entry point. `kwiva deploy` ships it like any other HTTP surface. For local and CI workflows, the `stdio` transport means an agent can test against the real app without a running server — `kwiva mcp serve` under the agent's process is the whole story. See [Deployment](/docs/deployment/).\n\n## What's Next [#whats-next]\n\n* [Tool Generation](/docs/ai-mcp/tool-generation) — Which tools your models and controllers produce, and how schemas are derived\n* [Agent Integration](/docs/ai-mcp/agent-integration) — Policies, permissions, and tenant scoping on tool calls\n* [Configuration](/docs/core-concepts/configuration) — The config folder and precedence rules this module uses\n* [Policies](/docs/authorization/policies) — The ability model behind each bearer token\n* [AI & MCP](/docs/ai-mcp) — The integration at a glance\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "`@kwiva/mcp` exposes your application to AI agents as a Model Context Protocol server. Because the server is generated from your model and controller IR, there is no protocol code to write and no tool registry to maintain — you configure, and it serves."
		},
		{
			"heading": void 0,
			"content": "The server is a thin, derived artifact: it mounts at a route you choose, speaks the transport you select, authenticates the caller, and lists the tools your opted-in models, controllers, and custom tool files produce. Everything else — schemas, permissions, tenant scoping, validation, audit — belongs to the framework and is inherited unchanged."
		},
		{
			"heading": "enabling-the-server",
			"content": "Enablement lives in one config module. Add it to `src/config/` and the server mounts automatically:"
		},
		{
			"heading": "enabling-the-server",
			"content": "The config follows the framework's normal shape: plain defaults in a config module, overridable per environment through the typed environment binding."
		},
		{
			"heading": "enabling-the-server",
			"content": "Option"
		},
		{
			"heading": "enabling-the-server",
			"content": "Meaning"
		},
		{
			"heading": "enabling-the-server",
			"content": "`enabled`"
		},
		{
			"heading": "enabling-the-server",
			"content": "Whether the MCP server is mounted at all"
		},
		{
			"heading": "enabling-the-server",
			"content": "`route`"
		},
		{
			"heading": "enabling-the-server",
			"content": "The HTTP path the server is served at"
		},
		{
			"heading": "enabling-the-server",
			"content": "`transport`"
		},
		{
			"heading": "enabling-the-server",
			"content": "`http` (streamable) or `stdio`"
		},
		{
			"heading": "enabling-the-server",
			"content": "`auth`"
		},
		{
			"heading": "enabling-the-server",
			"content": "The authentication strategy for the server"
		},
		{
			"heading": "enabling-the-server",
			"content": "`models`"
		},
		{
			"heading": "enabling-the-server",
			"content": "Which models generate tools — an allowlist, not an all-or-nothing switch"
		},
		{
			"heading": "enabling-the-server",
			"content": "`controllers`"
		},
		{
			"heading": "enabling-the-server",
			"content": "Which controllers expose their actions as tools"
		},
		{
			"heading": "enabling-the-server",
			"content": "`readOnly`"
		},
		{
			"heading": "enabling-the-server",
			"content": "When true, only `list` and `get` tools are generated"
		},
		{
			"heading": "enabling-the-server",
			"content": "The `env` binding works like any other config module, so environments can differ the same way they do for the rest of the stack: a local config may enable `stdio` with auth off, while a production config enables streamable HTTP with `bearer` and a stricter `readOnly`. See Configuration for precedence rules."
		},
		{
			"heading": "the-allowlist-and-the-read-only-throttle",
			"content": "Two options shape what the agent sees before abilities even come into play:"
		},
		{
			"heading": "the-allowlist-and-the-read-only-throttle",
			"content": "`models` and `controllers` are **allowlists** — a model or controller that is not listed generates no tools at all. Nothing is exposed by implication."
		},
		{
			"heading": "the-allowlist-and-the-read-only-throttle",
			"content": "`readOnly: true` **throttles the entire surface** to `list` and `get` tools regardless of what the underlying routes allow. It is a blunt instrument on purpose: one switch that guarantees an agent can inspect but never mutate, and the natural first configuration for teams letting agents loose on production data."
		},
		{
			"heading": "the-allowlist-and-the-read-only-throttle",
			"content": "Combined, they form the defense in depth that most integrations never ship: the allowlist controls what exists, the read-only switch controls what the agent can do, and per-tool abilities control what a given identity may do — see Agent Integration."
		},
		{
			"heading": "transports",
			"content": "The server supports two transports, selected with the `transport` option:"
		},
		{
			"heading": "transports",
			"content": "Transport"
		},
		{
			"heading": "transports",
			"content": "Use when"
		},
		{
			"heading": "transports",
			"content": "`stdio`"
		},
		{
			"heading": "transports",
			"content": "The agent runs the server as a local subprocess — local development and desktop agents"
		},
		{
			"heading": "transports",
			"content": "`http` (streamable)"
		},
		{
			"heading": "transports",
			"content": "The server is a remote endpoint — deployed applications and hosted agents"
		},
		{
			"heading": "transports",
			"content": "With `stdio`, the agent process spawns the server and communicates over standard input and output; no network exposure is involved. This is the local-development shape: an agent on your machine talks to your app without opening a socket. It suits `none` or `session` auth because the transport itself is the trust boundary."
		},
		{
			"heading": "transports",
			"content": "With streamable HTTP, the server is served at the configured `route` — `/mcp` by default — and uses streaming responses, which fits server-rendered and long-running tool execution. This is the production shape: a deployed endpoint that hosted agents reach over the network, protected by bearer auth and the tenant binding that comes with it."
		},
		{
			"heading": "transports",
			"content": "Choosing a transport implies an auth posture. `stdio` is a local trust boundary; `http` reaches the network and should carry `bearer` or `session`. There is no transport that makes a public endpoint private."
		},
		{
			"heading": "authentication-strategies",
			"content": "The `auth` option selects how tool callers prove who they are:"
		},
		{
			"heading": "authentication-strategies",
			"content": "Strategy"
		},
		{
			"heading": "authentication-strategies",
			"content": "Use"
		},
		{
			"heading": "authentication-strategies",
			"content": "`bearer`"
		},
		{
			"heading": "authentication-strategies",
			"content": "Service tokens with scoped abilities — the default, and the right choice for most production agents"
		},
		{
			"heading": "authentication-strategies",
			"content": "`session`"
		},
		{
			"heading": "authentication-strategies",
			"content": "A human-agent hybrid where browser session cookies flow through the MCP surface"
		},
		{
			"heading": "authentication-strategies",
			"content": "`none`"
		},
		{
			"heading": "authentication-strategies",
			"content": "Local development over `stdio`, where the transport itself is the trust boundary"
		},
		{
			"heading": "authentication-strategies",
			"content": "The bearer token matters beyond transport security: it is what identity is attributed to the call. Every tool invocation runs through policies for that identity, and the tenant bound to the token scopes every query — so one token can never reach another tenant's rows."
		},
		{
			"heading": "authentication-strategies",
			"content": "Mint tokens narrowly. A token for a sales-reporting agent needs `invoices` read abilities and nothing else; a blanket admin token defeats the point of carrying abilities on the tool surface. Scoping tokens to the minimal set the agent's task requires keeps the MCP surface as constrained as it looks. See Permissions and Policies for the ability model behind them."
		},
		{
			"heading": "connecting-a-client-or-agent",
			"content": "From the agent side, the server is just another MCP server to register. For a remote deployment over streamable HTTP:"
		},
		{
			"heading": "connecting-a-client-or-agent",
			"content": "For local development, register the server as a `stdio` command and the agent connects to your generated surface directly:"
		},
		{
			"heading": "connecting-a-client-or-agent",
			"content": "The agent then discovers the tool list — `invoices_list`, `invoices_get`, `invoices_create`, `invoices_update`, `invoices_delete`, plus any controller actions and custom tools — with input schemas already attached. There is no separate registration of each tool; the server reports what the IR produces."
		},
		{
			"heading": "connecting-a-client-or-agent",
			"content": "If your agent client supports `isolationScope: 'local'`, use it for the stdio configuration so the server is instantiated per agent session and test runs do not share state. For desktop agents that prompt for a URL, point them at the streamable HTTP endpoint and pass the bearer token via the client's authorization header."
		},
		{
			"heading": "building-and-verifying",
			"content": "The server and its tool list are derived from the IR that every build already produces. To verify your configuration:"
		},
		{
			"heading": "building-and-verifying",
			"content": "Run `kwiva dev` or a build so the model IR and route manifest are written to `src/.kwiva/`."
		},
		{
			"heading": "building-and-verifying",
			"content": "Confirm the MCP server is enabled and the transport matches where you run it."
		},
		{
			"heading": "building-and-verifying",
			"content": "Connect a client with the configuration above and inspect the offered tools."
		},
		{
			"heading": "building-and-verifying",
			"content": "If a model is missing, check that its name is in the `models` list or that it is spelled exactly as defined."
		},
		{
			"heading": "building-and-verifying",
			"content": "Because the server is generated, fixing a typo in a model name or a config value is all you ever do — there is no separate server codebase to deploy."
		},
		{
			"heading": "deploying-the-server",
			"content": "Streamable HTTP mounts inside your application, so deployment is deployment: the server rides the same process and route as everything else, inherits the same session and tenancy resolution, and needs no extra entry point. `kwiva deploy` ships it like any other HTTP surface. For local and CI workflows, the `stdio` transport means an agent can test against the real app without a running server — `kwiva mcp serve` under the agent's process is the whole story. See Deployment."
		},
		{
			"heading": "whats-next",
			"content": "Tool Generation — Which tools your models and controllers produce, and how schemas are derived"
		},
		{
			"heading": "whats-next",
			"content": "Agent Integration — Policies, permissions, and tenant scoping on tool calls"
		},
		{
			"heading": "whats-next",
			"content": "Configuration — The config folder and precedence rules this module uses"
		},
		{
			"heading": "whats-next",
			"content": "Policies — The ability model behind each bearer token"
		},
		{
			"heading": "whats-next",
			"content": "AI & MCP — The integration at a glance"
		}
	],
	"headings": [
		{
			"id": "enabling-the-server",
			"content": "Enabling the Server"
		},
		{
			"id": "the-allowlist-and-the-read-only-throttle",
			"content": "The Allowlist and the Read-Only Throttle"
		},
		{
			"id": "transports",
			"content": "Transports"
		},
		{
			"id": "authentication-strategies",
			"content": "Authentication Strategies"
		},
		{
			"id": "connecting-a-client-or-agent",
			"content": "Connecting a Client or Agent"
		},
		{
			"id": "building-and-verifying",
			"content": "Building and Verifying"
		},
		{
			"id": "deploying-the-server",
			"content": "Deploying the Server"
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
		url: "#enabling-the-server",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Enabling the Server" })
	},
	{
		depth: 2,
		url: "#the-allowlist-and-the-read-only-throttle",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Allowlist and the Read-Only Throttle" })
	},
	{
		depth: 2,
		url: "#transports",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Transports" })
	},
	{
		depth: 2,
		url: "#authentication-strategies",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Authentication Strategies" })
	},
	{
		depth: 2,
		url: "#connecting-a-client-or-agent",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Connecting a Client or Agent" })
	},
	{
		depth: 2,
		url: "#building-and-verifying",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Building and Verifying" })
	},
	{
		depth: 2,
		url: "#deploying-the-server",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Deploying the Server" })
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/mcp" }), " exposes your application to AI agents as a Model Context Protocol server. Because the server is generated from your model and controller IR, there is no protocol code to write and no tool registry to maintain — you configure, and it serves."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The server is a thin, derived artifact: it mounts at a route you choose, speaks the transport you select, authenticates the caller, and lists the tools your opted-in models, controllers, and custom tool files produce. Everything else — schemas, permissions, tenant scoping, validation, audit — belongs to the framework and is inherited unchanged." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "enabling-the-server",
			children: "Enabling the Server"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Enablement lives in one config module. Add it to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/" }),
			" and the server mounts automatically:"
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
			title: "src/config/mcp.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/mcp.ts"
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
							children: " { defineConfig } "
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
							children: " '@kwiva/config'"
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
							children: "'mcp'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "    enabled: "
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
							children: "    route: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'/mcp'"
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
							children: "    transport: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'http'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",                 "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// 'http' (streamable) | 'stdio'"
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
							children: "    auth: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'bearer'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",                    "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// token strategy; session cookies also supported"
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
							children: "    models: ["
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
							children: "], "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// generate tools for these models"
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
							children: "    controllers: ["
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
							children: "],          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// expose custom actions as tools"
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
							children: "    readOnly: "
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
							children: ",                   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// true → list/get only"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The config follows the framework's normal shape: plain defaults in a config module, overridable per environment through the typed environment binding." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Option" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "enabled" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Whether the MCP server is mounted at all" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "route" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The HTTP path the server is served at" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "transport" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http" }),
				" (streamable) or ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stdio" })
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The authentication strategy for the server" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Which models generate tools — an allowlist, not an all-or-nothing switch" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "controllers" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Which controllers expose their actions as tools" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readOnly" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"When true, only ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "list" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "get" }),
				" tools are generated"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }),
			" binding works like any other config module, so environments can differ the same way they do for the rest of the stack: a local config may enable ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stdio" }),
			" with auth off, while a production config enables streamable HTTP with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bearer" }),
			" and a stricter ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readOnly" }),
			". See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/configuration",
				children: "Configuration"
			}),
			" for precedence rules."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-allowlist-and-the-read-only-throttle",
			children: "The Allowlist and the Read-Only Throttle"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two options shape what the agent sees before abilities even come into play:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "controllers" }),
				" are ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "allowlists" }),
				" — a model or controller that is not listed generates no tools at all. Nothing is exposed by implication."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readOnly: true" }),
				" ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "throttles the entire surface" }),
				" to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "list" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "get" }),
				" tools regardless of what the underlying routes allow. It is a blunt instrument on purpose: one switch that guarantees an agent can inspect but never mutate, and the natural first configuration for teams letting agents loose on production data."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Combined, they form the defense in depth that most integrations never ship: the allowlist controls what exists, the read-only switch controls what the agent can do, and per-tool abilities control what a given identity may do — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/ai-mcp/agent-integration",
				children: "Agent Integration"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "transports",
			children: "Transports"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The server supports two transports, selected with the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "transport" }),
			" option:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Transport" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Use when" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stdio" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The agent runs the server as a local subprocess — local development and desktop agents" })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http" }), " (streamable)"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The server is a remote endpoint — deployed applications and hosted agents" })] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"With ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stdio" }),
			", the agent process spawns the server and communicates over standard input and output; no network exposure is involved. This is the local-development shape: an agent on your machine talks to your app without opening a socket. It suits ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "none" }),
			" or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session" }),
			" auth because the transport itself is the trust boundary."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"With streamable HTTP, the server is served at the configured ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "route" }),
			" — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/mcp" }),
			" by default — and uses streaming responses, which fits server-rendered and long-running tool execution. This is the production shape: a deployed endpoint that hosted agents reach over the network, protected by bearer auth and the tenant binding that comes with it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Choosing a transport implies an auth posture. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stdio" }),
			" is a local trust boundary; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http" }),
			" reaches the network and should carry ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bearer" }),
			" or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session" }),
			". There is no transport that makes a public endpoint private."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "authentication-strategies",
			children: "Authentication Strategies"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }),
			" option selects how tool callers prove who they are:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Strategy" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Use" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bearer" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Service tokens with scoped abilities — the default, and the right choice for most production agents" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A human-agent hybrid where browser session cookies flow through the MCP surface" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "none" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Local development over ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stdio" }),
				", where the transport itself is the trust boundary"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The bearer token matters beyond transport security: it is what identity is attributed to the call. Every tool invocation runs through policies for that identity, and the tenant bound to the token scopes every query — so one token can never reach another tenant's rows." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Mint tokens narrowly. A token for a sales-reporting agent needs ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices" }),
			" read abilities and nothing else; a blanket admin token defeats the point of carrying abilities on the tool surface. Scoping tokens to the minimal set the agent's task requires keeps the MCP surface as constrained as it looks. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/permissions",
				children: "Permissions"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/policies",
				children: "Policies"
			}),
			" for the ability model behind them."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "connecting-a-client-or-agent",
			children: "Connecting a Client or Agent"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "From the agent side, the server is just another MCP server to register. For a remote deployment over streamable HTTP:" }),
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
			title: "connecting-a-client-or-agent.json",
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For local development, register the server as a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stdio" }),
			" command and the agent connects to your generated surface directly:"
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
			title: "connecting-a-client-or-agent-2.json",
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
						children: "    \"acme-local\""
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
							children: "      \"command\""
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
							children: "\"kwiva\""
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
							children: "      \"args\""
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
							children: "\"mcp\""
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
							children: "\"serve\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "]"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The agent then discovers the tool list — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_list" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_get" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_create" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_update" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "invoices_delete" }),
			", plus any controller actions and custom tools — with input schemas already attached. There is no separate registration of each tool; the server reports what the IR produces."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"If your agent client supports ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isolationScope: 'local'" }),
			", use it for the stdio configuration so the server is instantiated per agent session and test runs do not share state. For desktop agents that prompt for a URL, point them at the streamable HTTP endpoint and pass the bearer token via the client's authorization header."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "building-and-verifying",
			children: "Building and Verifying"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The server and its tool list are derived from the IR that every build already produces. To verify your configuration:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Run ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
				" or a build so the model IR and route manifest are written to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Confirm the MCP server is enabled and the transport matches where you run it." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Connect a client with the configuration above and inspect the offered tools." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"If a model is missing, check that its name is in the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" }),
				" list or that it is spelled exactly as defined."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the server is generated, fixing a typo in a model name or a config value is all you ever do — there is no separate server codebase to deploy." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "deploying-the-server",
			children: "Deploying the Server"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Streamable HTTP mounts inside your application, so deployment is deployment: the server rides the same process and route as everything else, inherits the same session and tenancy resolution, and needs no extra entry point. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy" }),
			" ships it like any other HTTP surface. For local and CI workflows, the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stdio" }),
			" transport means an agent can test against the real app without a running server — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva mcp serve" }),
			" under the agent's process is the whole story. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/",
				children: "Deployment"
			}),
			"."
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
				href: "/docs/ai-mcp/tool-generation",
				children: "Tool Generation"
			}), " — Which tools your models and controllers produce, and how schemas are derived"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/ai-mcp/agent-integration",
				children: "Agent Integration"
			}), " — Policies, permissions, and tenant scoping on tool calls"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/configuration",
				children: "Configuration"
			}), " — The config folder and precedence rules this module uses"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/policies",
				children: "Policies"
			}), " — The ability model behind each bearer token"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/ai-mcp",
				children: "AI & MCP"
			}), " — The integration at a glance"] }),
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
