# Agent Integration (/docs/ai-mcp/agent-integration)



# Agent Integration [#agent-integration]

## Enforcement [#enforcement]

Tool calls pass through `executeToolCall` — rate limit → input validation → ability check (`can(policy, user, action, resource)`) → tenant guard (`requireTenant`) → handler → audit log.

## Errors [#errors]

`toolError(code, message?, fields?)` — tools return errors as results; invalid → 400 VALIDATION with fields.

## Audit [#audit]

Every tool call logs: `{tool, name, input, user, tenantId, durationMs, status}` via core logger.

> \[!TIP]
> Use `@kwiva/auth` policies (`ability: "todos.read"`) — same registry as routes.
