# MCP Server (/docs/ai-mcp/mcp-server)



`@kwiva/mcp` exposes your application to AI agents as a Model Context Protocol server. Because the server is generated from your model and controller IR, there is no protocol code to write and no tool registry to maintain — you configure, and it serves.

The server is a thin, derived artifact: it mounts at a route you choose, speaks the transport you select, authenticates the caller, and lists the tools your opted-in models, controllers, and custom tool files produce. Everything else — schemas, permissions, tenant scoping, validation, audit — belongs to the framework and is inherited unchanged.

## Enabling the Server [#enabling-the-server]

Enablement lives in one config module. Add it to `src/config/` and the server mounts automatically:

```ts title="src/config/mcp.ts"
// src/config/mcp.ts
import { defineConfig } from '@kwiva/config'

export default defineConfig('mcp', {
  defaults: {
    enabled: true,
    route: '/mcp',
    transport: 'http',                 // 'http' (streamable) | 'stdio'
    auth: 'bearer',                    // token strategy; session cookies also supported
    models: ['invoices', 'customers'], // generate tools for these models
    controllers: ['reports'],          // expose custom actions as tools
    readOnly: false,                   // true → list/get only
  },
})
```

The config follows the framework's normal shape: plain defaults in a config module, overridable per environment through the typed environment binding.

| Option        | Meaning                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `enabled`     | Whether the MCP server is mounted at all                                 |
| `route`       | The HTTP path the server is served at                                    |
| `transport`   | `http` (streamable) or `stdio`                                           |
| `auth`        | The authentication strategy for the server                               |
| `models`      | Which models generate tools — an allowlist, not an all-or-nothing switch |
| `controllers` | Which controllers expose their actions as tools                          |
| `readOnly`    | When true, only `list` and `get` tools are generated                     |

The `env` binding works like any other config module, so environments can differ the same way they do for the rest of the stack: a local config may enable `stdio` with auth off, while a production config enables streamable HTTP with `bearer` and a stricter `readOnly`. See [Configuration](/docs/core-concepts/configuration) for precedence rules.

## The Allowlist and the Read-Only Throttle [#the-allowlist-and-the-read-only-throttle]

Two options shape what the agent sees before abilities even come into play:

* `models` and `controllers` are **allowlists** — a model or controller that is not listed generates no tools at all. Nothing is exposed by implication.
* `readOnly: true` **throttles the entire surface** to `list` and `get` tools regardless of what the underlying routes allow. It is a blunt instrument on purpose: one switch that guarantees an agent can inspect but never mutate, and the natural first configuration for teams letting agents loose on production data.

Combined, they form the defense in depth that most integrations never ship: the allowlist controls what exists, the read-only switch controls what the agent can do, and per-tool abilities control what a given identity may do — see [Agent Integration](/docs/ai-mcp/agent-integration).

## Transports [#transports]

The server supports two transports, selected with the `transport` option:

| Transport           | Use when                                                                               |
| ------------------- | -------------------------------------------------------------------------------------- |
| `stdio`             | The agent runs the server as a local subprocess — local development and desktop agents |
| `http` (streamable) | The server is a remote endpoint — deployed applications and hosted agents              |

With `stdio`, the agent process spawns the server and communicates over standard input and output; no network exposure is involved. This is the local-development shape: an agent on your machine talks to your app without opening a socket. It suits `none` or `session` auth because the transport itself is the trust boundary.

With streamable HTTP, the server is served at the configured `route` — `/mcp` by default — and uses streaming responses, which fits server-rendered and long-running tool execution. This is the production shape: a deployed endpoint that hosted agents reach over the network, protected by bearer auth and the tenant binding that comes with it.

Choosing a transport implies an auth posture. `stdio` is a local trust boundary; `http` reaches the network and should carry `bearer` or `session`. There is no transport that makes a public endpoint private.

## Authentication Strategies [#authentication-strategies]

The `auth` option selects how tool callers prove who they are:

| Strategy  | Use                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------- |
| `bearer`  | Service tokens with scoped abilities — the default, and the right choice for most production agents |
| `session` | A human-agent hybrid where browser session cookies flow through the MCP surface                     |
| `none`    | Local development over `stdio`, where the transport itself is the trust boundary                    |

The bearer token matters beyond transport security: it is what identity is attributed to the call. Every tool invocation runs through policies for that identity, and the tenant bound to the token scopes every query — so one token can never reach another tenant's rows.

Mint tokens narrowly. A token for a sales-reporting agent needs `invoices` read abilities and nothing else; a blanket admin token defeats the point of carrying abilities on the tool surface. Scoping tokens to the minimal set the agent's task requires keeps the MCP surface as constrained as it looks. See [Permissions](/docs/authorization/permissions) and [Policies](/docs/authorization/policies) for the ability model behind them.

## Connecting a Client or Agent [#connecting-a-client-or-agent]

From the agent side, the server is just another MCP server to register. For a remote deployment over streamable HTTP:

```json title="connecting-a-client-or-agent.json"
{
  "mcpServers": {
    "acme": {
      "url": "https://acme.dev/mcp",
      "headers": { "authorization": "Bearer acme_token" }
    }
  }
}
```

For local development, register the server as a `stdio` command and the agent connects to your generated surface directly:

```json title="connecting-a-client-or-agent-2.json"
{
  "mcpServers": {
    "acme-local": {
      "command": "kwiva",
      "args": ["mcp", "serve"]
    }
  }
}
```

The agent then discovers the tool list — `invoices_list`, `invoices_get`, `invoices_create`, `invoices_update`, `invoices_delete`, plus any controller actions and custom tools — with input schemas already attached. There is no separate registration of each tool; the server reports what the IR produces.

If your agent client supports `isolationScope: 'local'`, use it for the stdio configuration so the server is instantiated per agent session and test runs do not share state. For desktop agents that prompt for a URL, point them at the streamable HTTP endpoint and pass the bearer token via the client's authorization header.

## Building and Verifying [#building-and-verifying]

The server and its tool list are derived from the IR that every build already produces. To verify your configuration:

1. Run `kwiva dev` or a build so the model IR and route manifest are written to `src/.kwiva/`.
2. Confirm the MCP server is enabled and the transport matches where you run it.
3. Connect a client with the configuration above and inspect the offered tools.
4. If a model is missing, check that its name is in the `models` list or that it is spelled exactly as defined.

Because the server is generated, fixing a typo in a model name or a config value is all you ever do — there is no separate server codebase to deploy.

## Deploying the Server [#deploying-the-server]

Streamable HTTP mounts inside your application, so deployment is deployment: the server rides the same process and route as everything else, inherits the same session and tenancy resolution, and needs no extra entry point. `kwiva deploy` ships it like any other HTTP surface. For local and CI workflows, the `stdio` transport means an agent can test against the real app without a running server — `kwiva mcp serve` under the agent's process is the whole story. See [Deployment](/docs/deployment/).

## What's Next [#whats-next]

* [Tool Generation](/docs/ai-mcp/tool-generation) — Which tools your models and controllers produce, and how schemas are derived
* [Agent Integration](/docs/ai-mcp/agent-integration) — Policies, permissions, and tenant scoping on tool calls
* [Configuration](/docs/core-concepts/configuration) — The config folder and precedence rules this module uses
* [Policies](/docs/authorization/policies) — The ability model behind each bearer token
* [AI & MCP](/docs/ai-mcp) — The integration at a glance
