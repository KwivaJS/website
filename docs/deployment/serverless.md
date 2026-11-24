# Serverless Deployment (/docs/deployment/serverless)



# Serverless Deployment [#serverless-deployment]

Kwiva supports serverless deployment via runtime adapters:

* AWS Lambda
* Vercel Functions (JS runtime)
* Cloudflare Workers (custom adapter — see research gaps, planned)

## Constraints [#constraints]

* Apps run stateless; external DB (Postgres) recommended
* No long-running dev-mode jobs; use queues + workers
* Streaming SSE limited by platform timeouts

## Setup [#setup]

Wrap `createServer().handle(request)` in your platform adapter.

> \[!TIP]
> `getElysia(server)` abstracts HTTP layer for all adapters.
