# Foundation 04 — Framework HTTP

**Status**: Locked (ADR-0003) · **Updated**: 2026-09-08 · **Docset**: v0.3

`@kwiva/http` — the framework's **owned** HTTP API. Elysia is the reference: its lifecycle, guards, macros, and typed context shape our API; its repo tree shapes the package internals (`application/02`). Zero runtime dependency on `elysia`.

## The factories

| Factory | File | Purpose |
|---|---|---|
| `defineController` | `src/app/http/controllers/*.ts` | resource endpoints + custom actions |
| `defineMiddleware` | `src/app/http/middleware/*.ts` | pipeline stages |
| `defineServerRoute` | `src/routes/*.ts` | infra routes + route rules (engine mapping) |
| `defineTask` | `src/app/tasks/*.ts` | background tasks (Nitro engine) |

## defineController — full surface

```ts
import { defineController, guard, error, ws } from '@kwiva/http'

export default defineController('posts', (c) => c
  .guard({                                     // scoped to everything below
    middleware: ['auth', 'tenant'],
    beforeHandle: ({ session }) => {
      if (!session.user) return error('UNAUTHORIZED')
    },
  }, (g) => ({
  // REST handlers
  list:    g.get('/', listHandler, { query: ListQuery, permission: 'posts.read' }),
  get:     g.get('/:id', getHandler),
  create:  g.post('/', createHandler, { body: CreateBody }),
  update:  g.patch('/:id', updateHandler, { body: UpdateBody }),
  remove:  g.delete('/:id', removeHandler),

  // custom action
  publish: g.post('/:id/publish', publishHandler, { permission: 'posts.publish' }),

  // websocket endpoint
  feed:    g.ws('/feed', {
             open: (ws) => channel(`posts`).subscribe(ws),
             message: (ws, msg) => ...,
             close: (ws) => ...,
           }),
})), { prefix: '/posts', tags: ['posts'], cors: { origins: ['https://acme.dev'] } })
```

## Typed context

```ts
handler: async ({ params, query, body, headers, cookies, session, tenant, store, set, error }) => {
  set.status = 201
  set.headers['x-cache'] = 'miss'
  return { id: params.id, ...body }
}
```

Types are inferred from the route's schemas — `params.id` is `string`, `body` matches `CreateBody` (statically checked). Store types flow from `defineApp` state/decorations.

## Lifecycle (Elysia-parity, reimplemented)

```
request
  → onRequest      (middleware: request-id, rate limit, security headers)
  → onParse        (body parsing: json/form/multipart)
  → onTransform    (mutation of parsed values)
  → [validation]   (body/query/params/headers/cookies against schemas)
  → onBeforeHandle (guards: auth, tenant, policy checks)
  → handler
  → onAfterHandle  (response shaping, caching rules)
  → onResponse     (headers finalization, OTel span close)
onError             (any stage throw → error taxonomy mapping)
onStop              (server shutdown hooks)
```

Scopes: app-wide (`defineApp`), controller-wide (`defineController` options), route-level (handler options). Middleware = named, reusable lifecycle stages.

## Guards, macros, state

- **guard** — apply schema/middleware/beforeHandle to a group of routes (nestable).
- **macro** — reusable route-level keys:

```ts
// macro declared on the app
defineApp({
  macros: {
    auth: (options: boolean, { beforeHandle }) => {
      if (options) beforeHandle.push(requireAuth)
    },
    cache: (seconds: number, { afterHandle }) => afterHandle.push(setCache(seconds)),
  },
})

// route usage
c.get('/:id', handler, { auth: true, cache: 60 })
```

- **state/decorate/resolve** — app-level typed context injection (session, tenant, logger):

```ts
export default defineApp({
  state: { config: appConfig },
  decorate: { client: createClient() },
  resolve: async ({ headers }) => ({ tenant: await resolveTenant(headers) }),
})
```

## defineServerRoute — engine-grade route rules

```ts
// src/routes/rules.ts
import { defineServerRoute } from '@kwiva/http'

export default [
  defineServerRoute('/products/**', { isr: 300, cache: { tags: ['catalog'] } }),
  defineServerRoute('/pricing/**', { static: true }),
  defineServerRoute('/legacy/**',  { redirect: { to: '/new/**', status: 308 } }),
  defineServerRoute('/api/**',     { cors: true, rateLimit: { max: 600, per: 60 } }),
  defineServerRoute('/proxy/img',  { proxy: 'https://img.acme.dev/**' }),
  defineServerRoute('/healthz',    { handler: () => new Response('ok') }),
]
```

Full Nitro route-rules parity: `cache`, `swr`, `isr`, `static`, `prerender`, `redirect`, `proxy`, `headers`, `cors`, `rateLimit` — mapped by the framework onto the engine.

## defineTask

```ts
// src/app/tasks/cleanup.ts
import { defineTask } from '@kwiva/http'

export default defineTask('cleanup-expired', async ({ payload, logger }) => {
  const n = await Session.query().where('expiresAt', '<', new Date()).delete()
  logger.info({ deleted: n }, 'cleanup done')
  return { deleted: n }
}, { timeout: 30_000 })
```

Runs via scheduler (`src/config/schedule.ts`), manual CLI (`kwiva task:run`), or the auto-exposed task route (secret-protected).

## Error model

```ts
import { error } from '@kwiva/http'
return error('NOT_FOUND')                       // 404 { code: 'NOT_FOUND' }
return error('VALIDATION', { message, issues }) // 422
throw new ForbiddenError()                      // typed exceptions map via taxonomy
```

Taxonomy + HTTP mapping: `server/04-error-handling.md`.

## OpenAPI + manifest

Every controller/model route contributes to the **route manifest** (IR): path, method, schemas, tags, permissions. `@kwiva/http` renders OpenAPI 3.1 from the manifest (served at `/openapi.json`, optional Swagger UI at `/docs`); the same manifest feeds `@kwiva/client` types and `@kwiva/mcp` tools.

## Package internals (Elysia-mirroring tree)

See `application/02-package-architecture.md`: `context.ts`, `compose.ts`, `dynamic-handle.ts`, `manifest.ts`, `schema.ts`, `error.ts`, `cookies.ts`, `parse-query.ts`, `formats.ts`, `trace.ts`, plus `controller/`, `middleware/`, `routes/`, `tasks/`, `ws/`, `type-system/`, `universal/`, `adapter/{bun,web-standard,cloudflare-worker}`.
