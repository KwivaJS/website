# Runtime Adapters (/docs/deployment/adapters)



# Runtime Adapters [#runtime-adapters]

## Concepts [#concepts]

* **Adapters** — `getElysia(server)` returns an Elysia instance tuned per runtime.
* **Presets** — deployment presets for major targets.
* Target: Bun (primary), Node, serverless (API-only), containers.

## Usage [#usage]

No adapter config needed for default targets.

```ts
// src/index.ts (app entry — kwiva dev uses this)
export default await createServer({ port: 3000 }).start();
```

## Platform targets [#platform-targets]

| Platform              | Target shape                                              | Notes         |
| --------------------- | --------------------------------------------------------- | ------------- |
| Node/Bun (standalone) | `bun dist/index.js` or `bun start`                        | primary       |
| Docker/Kubernetes     | `bun src/index.ts` + Dockerfile                           | containers    |
| Vercel/Netlify        | serverless                                                | API-only mode |
| Cloudflare Workers    | via user wrapper (custom integration — see research gaps) | —             |

## Supported platforms [#supported-platforms]

* Local (Windows/macOS/Linux)
* VPS/bare-metal
* Docker/K8s
* Node + Bun standalone

Serverless in principle via adapters.
