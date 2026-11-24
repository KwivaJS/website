# Welcome to Kwiva (/blog/welcome-to-kwiva)



Kwiva is here. The batteries-included TypeScript application framework: one defineX grammar for every construct, a framework-owned `@kwiva/*` API surface, a single config folder, one CLI, and zero runtime codegen.

Try it:

```bash title="terminal"
bun install
kwiva create my-app
cd my-app
kwiva dev
```

## Highlights [#highlights]

| Package                                   | Role                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| `@kwiva/core`                             | App kernel, config, context/ALS, errors, logger, model IR, cache, KV, store |
| `@kwiva/data`                             | Models, query, migrations, seeders, factories, FTS search                   |
| `@kwiva/http`                             | Controllers, contracts, middleware, routing, SSE, WebSockets, OpenAPI       |
| `@kwiva/ui`                               | Pages, layouts, SSR, islands, navigation, SEO                               |
| `@kwiva/client`                           | Typed RPC, hooks, cache, WS                                                 |
| `@kwiva/auth` + `@kwiva/auth-better-auth` | Auth, policies, gates, identity                                             |
| `@kwiva/jobs`                             | Queues, workers, middleware, outbox, scheduler                              |
| `@kwiva/events`                           | Events, broadcast metadata, subscribers                                     |
| `@kwiva/mail`                             | Mail, templates, transports                                                 |
| `@kwiva/mcp`                              | MCP v2 — model/controller tools, server                                     |

> \[!TIP]
> See [what's new since 0.2.0](/docs/research/public-api-inventory) — full inventory.

**Docs:** [Getting Started](/docs/getting-started) — now covering 19 packages + the new features (MCP v2, storage, search, cache, testing).
