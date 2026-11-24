# Your First Deployment (/docs/getting-started/first-deployment)



# Your First Deployment [#your-first-deployment]

```bash title="terminal"
bun install
kwiva dev --port 4000
kwiva build
```

## Build output [#build-output]

`kwiva build`:

1. Regenerates route tree (`src/.kwiva/types/route-tree.gen.ts`) + client bundle (`src/.kwiva/entry.client.tsx`).
2. Writes `<out>/client` — default out dir is `dist` (there's no separate prod-bundle flag needed).

## Runtime modes [#runtime-modes]

| Mode          | Target                                                                                                             | Notes |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | ----- |
| Bun (default) | `bun src/index.ts` — actually `bun src/.kwiva/serve.gen.ts` per dev — production: `bun dist/`...                   | —     |
| Node          | `bun build --target=node` via `--preset=node`? — kwiva build has no preset; use `.output/server/index.mjs`? — skip |       |
| Serverless    | API-only output — adapters                                                                                         | —     |

> \[!TIP]
> Kwiva's main supported deploy targets: standalone servers (Bun/Node), serverless (API-only), containers (Docker). Edge presets exist in principle but apps route to presets per target (`--target`).

## Production checklist [#production-checklist]

```plaintext
[ ] bun install — lockfile
[ ] kwiva migrate — apply pending migrations
[ ] kwiva seed — seed data
[ ] APP_KEY set — `kwiva key:generate`
[ ] MCP_ROUTE on (only if needed)
```

## What to read next [#what-to-read-next]

* [Runtime Adapters](/docs/deployment/adapters)
* [Node/Bun Deployment](/docs/deployment/node-bun)
* [Serverless](/docs/deployment/serverless)
* [Containers](/docs/deployment/containers)
* [Production Checklist](/docs/deployment/production-checklist)
