# Server 02 — Server Capabilities

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

Middleware, guards, macros, plugins, WebSockets — everything between routing and handler.

## Middleware (`defineMiddleware`)

```ts
// src/app/http/middleware/request-id.ts
import { defineMiddleware } from '@kwiva/http'

export default defineMiddleware('request-id', async (ctx, next) => {
  const id = ctx.headers['x-request-id'] ?? crypto.randomUUID()
  ctx.set.headers['x-request-id'] = id
  ctx.store.requestId = id            // typed via app state declaration
  return next()
})
```

- **Scoping**: global (stack in `src/config/app.ts`), controller-level (`middleware: [...]`), route-level.
- **Order**: config array order; runs before guards.
- **Short-circuit**: return a response instead of `next()` (auth failures, rate limits).
- **Lifecycle-scoped variants**: `defineMiddleware.on('onTransform', fn)` / `'onAfterHandle'` etc.
- **Built-ins** (no code needed): `request-id`, `security-headers`, `cors`, `rate-limit`, `compression`, `session`, `tenant`, `csrf` (form routes).

## Guards

```ts
defineController('admin', (c) => c.guard({
  middleware: ['auth'],
  beforeHandle: ({ session, error }) => {
    if (session.user?.role !== 'admin') return error('FORBIDDEN')
  },
}, (g) => ({ ... })))
```

Guards nest and compose — each applies schema + middleware + beforeHandle to everything inside.

## Macros

Reusable route-level keys (Elysia-parity):

```ts
// declared in defineApp
defineApp({
  macros: {
    auth: (required: boolean, { beforeHandle }) => { if (required) beforeHandle.push(requireAuth) },
    cache: (seconds: number, { afterHandle }) => afterHandle.push(setCache(seconds)),
    rateLimit: (opts: { max: number; per: number }, route) => route.setRule('rateLimit', opts),
  },
})

// consumed per route — typechecked against the macro signature
c.get('/:id', handler, { auth: true, cache: 60, rateLimit: { max: 100, per: 60 } })
```

## State, decoration, resolution

```ts
export default defineApp({
  state: { startTime: Date.now() },            // app-wide mutable store types
  decorate: { client: createClient() },        // singletons, available on ctx
  resolve: [
    ['tenant', async ({ headers }) => resolveTenant(headers)],   // per-request async
    ['logger', ({ store }) => logger.child({ requestId: store.requestId })],
  ],
})
```

Typed context flows: handlers see `ctx.tenant`, `ctx.logger` with correct types.

## WebSockets & channels

```ts
// controller route
c.ws('/feed', {
  open: (ws) => posts.subscribe(ws),
  message: (ws, { data }) => ...,
  close: (ws) => posts.unsubscribe(ws),
})

// channel API (policy-checked)
import { channel } from '@kwiva/http'

const posts = channel('posts')
  .policy(({ session }) => session.user !== null)
  .on('message', (msg, ws) => broadcast(msg))

// client
const feed = useChannel('posts')
```

Engine: CrossWS (via Nitro) — Bun, Node, Cloudflare (Durable Objects) all covered. SSE fallback in v1.x.

## Rate limiting, CORS, compression

```ts
// src/config/api.ts
export default defineConfig('api', {
  defaults: {
    rateLimit: { max: 600, per: 60, store: 'redis' },
  },
})
// src/config/cors.ts
export default defineConfig('cors', {
  defaults: { origins: ['https://acme.dev'], methods: ['GET', 'POST'], credentials: true },
})
```

Per-route inline overrides win (ADR-0020). Route-rule parity: `rateLimit`, `cors`, `headers` map to engine rules.

## Plugins (`definePlugin`)

Framework-level capability packages (used by modules, not apps directly):

```ts
import { definePlugin } from '@kwiva/core'

export const openapi = definePlugin('openapi', (app) => {
  app.decorate('openapi', () => renderSpec(app.manifest))
})
```

First-party plugins: `openapi`, `studio`, `mcp`, `telemetry`, `cors`, `rate-limit`, `static` (public/ serving).

## File uploads

```ts
c.post('/avatar', async ({ file, session }) => {
  const { filename, bytes, type } = await file()        // multipart, size/type validated
  return storage.put(`avatars/${session.user.id}`, bytes, { contentType: type })
}, { file: { maxSize: '2mb', types: ['image/*'] } })
```

Stored via the storage API (disk driver from config) — never raw `fs`.
