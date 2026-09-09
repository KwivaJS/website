# API Reference (/api)



This section contains the complete API reference for all Kwiva packages.

## Packages [#packages]

| Package                            | Description                                               |
| ---------------------------------- | --------------------------------------------------------- |
| [`@kwiva/core`](/api/core)         | Application kernel, context, DI, config, errors, policies |
| [`@kwiva/config`](/api/config)     | Configuration system, config folder, typed env            |
| [`@kwiva/data`](/api/data)         | Models, field DSL, query builder, transactions, relations |
| [`@kwiva/http`](/api/http)         | Controllers, middleware, server routes, lifecycle, guards |
| [`@kwiva/router`](/api/router)     | File-based router, loaders, typed navigation              |
| [`@kwiva/react`](/api/react)       | Pages, SSR, data hooks, providers                         |
| [`@kwiva/client`](/api/client)     | Typed RPC SDK, end-to-end types                           |
| [`@kwiva/auth`](/api/auth)         | Authentication, sessions, providers                       |
| [`@kwiva/queue`](/api/queue)       | Jobs, workers, retries, backoff                           |
| [`@kwiva/events`](/api/events)     | Events, listeners, broadcasting                           |
| [`@kwiva/services`](/api/services) | Services, typed injection                                 |
| [`@kwiva/cli`](/api/cli)           | CLI commands reference                                    |
| [`@kwiva/studio`](/api/studio)     | Generated admin UI                                        |
| [`@kwiva/mcp`](/api/mcp)           | MCP server, tools, transport                              |

## Stability Indicators [#stability-indicators]

| Status           | Meaning                                   |
| ---------------- | ----------------------------------------- |
| **Stable**       | Production-ready, documented capabilities |
| **Experimental** | Available but subject to change           |
| **Planned**      | Roadmap capabilities, not yet implemented |
| **Internal**     | Framework-internal, not for public use    |

## Reading Guide [#reading-guide]

* **New to Kwiva?** Start with [Getting Started](/docs/getting-started)
* **Looking for a specific API?** Use the search (Cmd/Ctrl+K)
* **Need examples?** See [Core Concepts](/docs/core-concepts)
* **Architecture deep dive?** See [Architecture](/architecture)
