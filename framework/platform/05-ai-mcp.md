# Platform 05 — AI & MCP

**Status**: Baseline (v1.x) · **Updated**: 2026-09-08 · **Docset**: v0.3

`@kwiva/mcp` — expose the app to AI agents as MCP tools, derived from the same IR as everything else (Questpie reference: model→agent exposure; zero dependency).

## Enable

```ts
// src/config/mcp.ts
export default defineConfig('mcp', {
  defaults: {
    enabled: true,
    route: '/mcp',
    transport: 'http',                    // 'http' (streamable) | 'stdio'
    auth: 'bearer',                       // token strategy; session cookies also supported
    models: ['invoices', 'customers'],    // generate tools for these models
    controllers: ['reports'],             // expose custom actions as tools
    readOnly: false,                      // true → list/get only
  },
})
```

## Generated tools

Per opted-in model (respecting `readOnly`):

| Tool | Maps to |
|---|---|
| `invoices_list` | list route (where/page/orderBy params) |
| `invoices_get` | get route |
| `invoices_create` | create route (validated body schema → tool input schema) |
| `invoices_update` | update route |
| `invoices_delete` | delete route |

Controller actions become tools with their exact input/output types: `reports_summary` for `client.reports.summary()`.

## Semantics

- **Policy enforcement**: tools run through the same policies — the MCP bearer token identifies a user (or service principal) whose abilities apply.
- **Tenant scoping**: token-bound tenant; cross-tenant is impossible.
- **Validation**: tool input schemas are the route schemas (Standard Schema → JSON Schema for MCP).
- **Auditability**: every tool call is an OTel span + structured log (`mcp.tool`).

## Client config (agent side)

```json
{
  "mcpServers": {
    "acme": {
      "url": "https://acme.dev/mcp",
      "headers": { "authorization": "Bearer acme_token" }
    }
  }
}
```

## Auth strategies

| Strategy | Use |
|---|---|
| `bearer` (default) | service tokens with scoped abilities — minted in Studio (v1.x) |
| `session` | human-agent hybrid: browser session flows through MCP |
| `none` | local dev via `stdio` transport |

## Custom tools

```ts
// src/app/mcp/tools.ts
import { defineMcpTool } from '@kwiva/mcp'

export const draftInvoiceEmail = defineMcpTool('draft_invoice_email', {
  description: 'Draft a collection email for an overdue invoice',
  input: { invoiceId: 'uuid' },
  handler: async ({ invoiceId, session }) => {
    const invoice = await Invoice.findOrFail(invoiceId)
    return draftEmail(invoice)             // agent gets structured data, composes the text
  },
  ability: 'invoices.read',
})
```

## Beyond MCP (v2 exploration)

- Structured tool responses optimized for LLM consumption (field descriptions from the model DSL flow through).
- Rate limits + cost accounting per token (telemetry).
- Not in scope: in-app LLM features — Kwiva exposes the data plane; apps bring their own models.
