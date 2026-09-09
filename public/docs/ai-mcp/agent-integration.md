# Agent Integration (/docs/ai-mcp/agent-integration)



An agent connected to your Kwiva application is able to do exactly as much as the application's own policy and tenancy machinery allows — no more. Tool calls run through the same policies, the same per-tool abilities, the same tenant scoping, and the same validation as any HTTP request, and every call leaves a trace span and a structured log line behind.

The framing matters: the MCP surface is not a new application. It is a new door into the application you already built, and it opens with the same keys. This page is about what happens after an agent invokes a tool — how identity, permission, tenancy, validation, and error reporting shape the experience.

## Wiring an Agent [#wiring-an-agent]

An agent connects to the generated server over one of two transports. For a remote deployment, register the streamable HTTP endpoint with a bearer token:

```json title="wiring-an-agent.json"
{
  "mcpServers": {
    "acme": {
      "url": "https://acme.dev/mcp",
      "headers": { "authorization": "Bearer acme_token" }
    }
  }
}
```

For local work, register the server as a stdio command and the agent starts it as a subprocess. Either way, the agent discovers the same tool list — derived from your opted-in models, controllers, and custom tools — and, on invoking a tool, becomes a caller in your application's identity model.

The bearer token is not a credential the server merely checks and discards. It is how the call is **attributed**: the identity behind the token is the identity the policy checks evaluate, the tenant scope resolves, and the audit trail records.

## Policy Enforcement [#policy-enforcement]

MCP tools are not a side channel that bypasses security; they are a front door with the same locks. Every tool call runs through the same policies as the equivalent route. The bearer token identifies a user or a service principal, and the abilities attached to that identity are what the policy checks evaluate.

The result is that a token scoped to read invoices can list and get invoices through the tools but cannot create, update, or delete them, and cannot touch a tool whose ability it lacks. Set policies once, in `definePolicy`, and they apply to the agent surface automatically because the tools derive from the same IR the routes derive from.

Policy checks happen per call, not per session. An agent that keeps a session open does not cache its way around a policy that changes mid-flight; the check is part of invocation, which is part of why the same code path that protects your routes protects your tools.

## Per-Tool Permissions [#per-tool-permissions]

Permissions layer at three points:

| Surface                 | Permission                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Generated model tools   | The model's collection-level `permission` option gates the whole tool family         |
| Controller-action tools | The action's own `permission` option                                                 |
| Custom tools            | An explicit `ability` on `defineMcpTool` routes the call through the matching policy |

`readOnly: true` in the MCP config adds a blunt safety throttle — only `list` and `get` tools are generated at all — which is useful when a human wants an agent to inspect, not mutate, even before abilities are considered.

The three layers compose: the allowlist decides whether a tool exists, `readOnly` decides whether it can mutate, and abilities decide whether this identity can call it. A read-only surface still runs policy checks, so a token without the read ability learns that a read is forbidden even on a surface built for reading.

## Tenant Scoping [#tenant-scoping]

The bearer token binds a tenant. Every query a tool performs is injected with that tenant's scope — the model resolver enforces the tenant field on every query, so cross-tenant access is impossible even if the agent constructs arguments that would cross boundaries. The same tenant-scoped value flows into cache keys, storage prefixes, queue payloads, and trace and log attributes, so a tool call's side effects stay inside the tenant's slice of the system.

This is the guarantee that makes agents safe on multi-tenant deployments: an agent operating under one tenant's token cannot inspect, mutate, or even observe another tenant's data, no matter how it phrases its tool arguments. The tenant bound to the identity constrains every downstream effect — not just the query result, but the cache it writes and the job it enqueues.

## Validation and Input Shaping [#validation-and-input-shaping]

Tool input schemas are the route schemas, converted to the JSON Schema form MCP requires. When an agent supplies invalid input, the tool call fails with the same field-mapped validation errors your API would return, attributed to the same ability and tenant context. An agent that sends a malformed body learns precisely which field failed and why.

The validation lifecycle is worth making explicit, because it is where agents most often misbehave:

1. The **tool discovery** step already tells the agent its input shape — the JSON Schema derived from the route schemas, including defaults, optionality, and constraints.
2. On **invocation**, the arguments are validated against that same schema before the handler runs.
3. On **failure**, the returned error names the field and the rule, so a well-behaved agent can correct its next call rather than retrying blindly.

Agents that respect discovery produce valid calls on the first try; agents that hallucinate inputs are caught by the same validation an API consumer would hit.

## Error Shapes an Agent Sees [#error-shapes-an-agent-sees]

Agents surface whatever a tool returns, so the shape of tool failures matters. Kwiva tools return failures consistent with the rest of the framework: a typed error object carrying a code and a message, mapped from the same 8-code taxonomy that your REST API uses. A forbidden call returns the permission error; a missing record returns the not-found error; invalid input returns a validation error with field details.

Two things are true for agents because they are true for the framework generally:

1. The error is structured and typed — an agent can branch on the code rather than parsing prose.
2. The error has identity context — request, trace, span, and tenant IDs attach to every log of a failed call, so a human can pull up exactly what the agent attempted.

Your own [error handling](/docs/core-concepts/error-handling) and [request lifecycle](/docs/advanced/request-lifecycle) docs describe the taxonomy in detail; the MCP surface inherits it without modification.

For an agent-facing staple, a **structured, typed failure is the difference between a recoverable call and a stuck agent**. An agent that receives `permission_denied` can stop and ask instead of re-trying; an agent that receives prose can guess. The framework's taxonomy gives agents the former.

## Auditability [#auditability]

Every tool call is a distributed trace span and a structured log entry. The span covers the call from authorization through handler and query, and the log line carries the token's attributed identity, the tenant, the tool name, and the outcome. Correlate a suspicious agent action back to the exact call that caused it using the request and trace IDs — the same correlation your HTTP traffic already provides.

The audit story is complete because the call is first-class: the same identity resolution, tenant binding, and tracing that make your HTTP requests explainable apply to tool calls. When an operator asks "what did that agent do?" the answer is in the same tracing and logging surfaces they already use, keyed by the tool's attributed identity.

## Operational Guidance [#operational-guidance]

A few patterns that keep agent access safe at scale:

1. **Start read-only.** Let agents read before you let them mutate, and flip `readOnly` off only after the tool surface is audited.
2. **Scope tokens narrowly.** Mint per-agent tokens with the minimal ability set the task requires, not a blanket admin token.
3. **Monitor tool traffic.** Alert on failed-permission tool calls and on unusual read volumes — both already surface in metrics and structured logs.
4. **Keep the surface explicit.** Opt in only the models and controllers a task actually needs; the config allowlist is the first line of defense.

The guidance generalizes to an operational rule: &#x2A;*an agent should be provisioned like a cautious employee, not a superuser.** The tool allowlist is its job description, the token is its badge, and the read-only switch is the training wheels you remove deliberately.

## What's Next [#whats-next]

* [MCP Server](/docs/ai-mcp/mcp-server) — Transports, auth strategies, and client configuration
* [Tool Generation](/docs/ai-mcp/tool-generation) — The full tool surface your models and controllers produce
* [Policies](/docs/authorization/policies) — The policy definitions every tool call runs through
* [Tenant Scoping](/docs/tenancy/scoping) — How the tenant field constrains every query
* [Logging](/docs/observability/logging) — The structured log lines every tool call emits
