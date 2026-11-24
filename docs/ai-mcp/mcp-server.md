# MCP Server (/docs/ai-mcp/mcp-server)



# MCP Server [#mcp-server]

## Config (`src/config/mcp.ts`) [#config-srcconfigmcpts]

```ts
export default defineConfig({
  enabled: true,
  route: "/mcp",           // default
  transport: "streamable", // or "stdio"
  auth: "session",         // or "bearer" | "none" (none only with stdio)
  models: ["Todo"],        // model names to expose
  controllers: ["TodosController"], // controller names
  readOnly: false,
  scopes: [],
  requireTenant: false,
});
```

## Enabling [#enabling]

* `enabled: true` in `src/config/mcp.ts`
* CLI: `kwiva mcp` (stdio) and `kwiva mcp:print-config`

## Transports [#transports]

| Transport              | Notes                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| `streamable` (default) | HTTP-based, served at `route` on your app server (port 3000 by default) |
| `stdio`                | stdio for local agents; requires `auth: "none"`                         |

## Auth [#auth]

* `session` — session cookie via `requireAuth` on route
* `bearer` — Bearer token (`parseBearer`; uses `@kwiva/auth` API tokens)
* `none` — stdio only

## Client config [#client-config]

`kwiva mcp:print-config` prints:

```json
{
  "mcpServers": {
    "kwiva": {
      "url": "http://localhost:3000/mcp",
      "headers": { "authorization": "Bearer $KWIVA_MCP_TOKEN" } // bearer mode
    }
  }
}
```

For stdio: `{ "command": "kwiva", "args": ["mcp"] }`.

## Connection test [#connection-test]

From Claude Desktop/Cursor/VS Code — add server; restart the client.

> \[!TIP]
> `doctor` checks MCP config: `kwiva doctor`.
