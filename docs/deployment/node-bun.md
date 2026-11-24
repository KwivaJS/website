# Node/Bun Deployment (/docs/deployment/node-bun)



# Node/Bun Deployment [#nodebun-deployment]

## Default entry [#default-entry]

`src/index.ts` — main entry that starts the app server on port 3000.

## Run [#run]

```bash title="terminal"
# Bun
bun dist/index.js

# Node (ESM)
node dist/index.js
```

## Environment [#environment]

* `PORT` — default 3000
* `APP_KEY` — required
* `AUTH_SESSION_SECRET` — from `defineConfig` auth
* `BASE_URL` — via `env()` config or CLI

## Health [#health]

`GET /api/health` — framework endpoint.

## Process management [#process-management]

Use systemd/supervisor; Kwiva has no built-in supervisor.

## Notes [#notes]

* Bun is primary: `bun --version >= 1.4.0`
* Node compatible for API-only
* `ENGINE=bun` — primary. Node-only for API deployments.
