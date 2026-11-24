# How do I connect AI via MCP? (/guides/mcp)



# Connect AI via MCP [#connect-ai-via-mcp]

## Enable [#enable]

```ts title="src/config/mcp.ts"
export default defineConfig({
  enabled: true,
  route: "/mcp",
  transport: "streamable", // or "stdio"
  models: ["Todo"],
  controllers: ["TodosController"],
});
```

## Connect [#connect]

```json title="~/.cursor/mcp.json"
{
  "mcpServers": {
    "kwiva": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

For stdio mode: `{ "command": "kwiva", "args": ["mcp"] }`.

## Test [#test]

Use `kwiva mcp:print-config` for agent config, or connect to an MCP client.

## Custom tools [#custom-tools]

`defineMcpTool` — see [Tool Generation](/docs/ai-mcp/tool-generation).

> \[!TIP]
> MCP runs through the framework — the tools are policy-checked (`ability`).
