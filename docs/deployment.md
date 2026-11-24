# Deployment (/docs/deployment)



# Deployment [#deployment]

Kwiva is a build-time-only deploy: `kwiva build` produces `dist/`; deploy that. One codebase for Bun/Node/serverless/containers.

## Entry points [#entry-points]

| Topic                 | Page                                                          |
| --------------------- | ------------------------------------------------------------- |
| Runtime Adapters      | [Runtime Adapters](/docs/deployment/adapters)                 |
| Node/Bun Deployment   | [Node/Bun Deployment](/docs/deployment/node-bun)              |
| Serverless Deployment | [Serverless Deployment](/docs/deployment/serverless)          |
| Container Deployment  | [Container Deployment](/docs/deployment/containers)           |
| Production Checklist  | [Production Checklist](/docs/deployment/production-checklist) |

## TL;DR [#tldr]

```bash title="terminal"
bun run install
kwiva build --out .output
# then: bun ./dist/index.js (or node for Node targets)
```

> \[!TIP]
> For a VPS, use [Node/Bun Deployment](/docs/deployment/node-bun); for cloud, [Runtime Adapters](/docs/deployment/adapters).
