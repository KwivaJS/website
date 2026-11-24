# How do I deploy? (/guides/deploy)



# Deploy [#deploy]

## Build [#build]

```bash title="terminal"
bun install
kwiva build --out .output
```

## Targets [#targets]

* **Node/Bun standalone** (default) — `node dist/index.js`
* **Docker/Kubernetes** — minimal images (see [Containers](/docs/deployment/containers))
* **Serverless** (functions) — via adapters

## Prod checklist [#prod-checklist]

See [Production Checklist](/docs/deployment/production-checklist).

## Options [#options]

* Migrations run on boot in containers
* Multi-replica: shared stores required (Postgres for DB)
