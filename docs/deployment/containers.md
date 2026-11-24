# Container Deployment (/docs/deployment/containers)



# Container Deployment [#container-deployment]

## Dockerfile (Node/Bun base) [#dockerfile-nodebun-base]

```dockerfile
FROM oven/bun:1.4
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build
EXPOSE 3000
ENV PORT=3000
CMD ["bun", "dist/index.js"]
```

## Migrations on boot [#migrations-on-boot]

Container startup runs `kwiva migrate` before starting server.

## Stateless rules [#stateless-rules]

* External DB (Postgres)
* External cache (Redis/postgres)
* External jobs (pg-boss or memory queue + scheduler)

## Scaling [#scaling]

* Multi-replica via load balancer; Kwiva is stateless by default
* Shared stores required for chat/presence

> \[!TIP]
> Common pitfall: keeping in-memory jobs — they won't persist.
