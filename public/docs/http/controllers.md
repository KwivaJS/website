# Controllers (/docs/http/controllers)



Controllers define the API surface of an application. A controller is a `defineX` factory: one controller per file in `src/app/http/controllers/`, mounted automatically by convention. It groups resource endpoints and custom actions under a prefix and composes guards, middleware, schemas, and permissions for every route inside it.

Controllers are the authored half of the API surface. The generated half — the five deterministic routes per model — is produced by `defineModel` in `src/app/models/`. Both halves compile into the same route manifest, so a custom action and a generated route appear identically to the typed client, OpenAPI, Studio, and MCP tools.

## Anatomy of a Controller [#anatomy-of-a-controller]

```ts title="anatomy-of-a-controller.ts"
defineController(name, (c) => ({...}), options)
```

The first argument is the controller name, used for discovery, route identity, and the typed client method namespace. The second is a builder function that receives the route builder `c` and returns a map of named routes. The third is an inline options object that overrides config values — inline options always win over the config folder.

| Option       | Purpose                                                          |
| ------------ | ---------------------------------------------------------------- |
| `prefix`     | Path prefix the routes mount under                               |
| `tags`       | OpenAPI grouping for the controller's routes                     |
| `permission` | Policy namespace that gates the controller's routes              |
| `cors`       | Per-controller origin policy, overriding the global preset       |
| `middleware` | Named middleware stages applied to every route in the controller |

The options object is the controller-level counterpart of the per-route option object: anything you can assert on a single route — middleware, schemas, permissions — can be asserted once at the controller level and inherited by every route inside it.

## Route Handlers [#route-handlers]

The builder exposes one method per HTTP verb, plus `ws` for WebSocket endpoints:

| Method     | Usage                                   | Typical purpose               |
| ---------- | --------------------------------------- | ----------------------------- |
| `c.get`    | `c.get('/:id', handler, schema)`        | Read a resource or collection |
| `c.post`   | `c.post('/', handler, schema)`          | Create or run a custom action |
| `c.put`    | `c.put('/:id', handler, schema)`        | Replace a resource            |
| `c.patch`  | `c.patch('/:id', handler, schema)`      | Partial update                |
| `c.delete` | `c.delete('/:id', handler, schema)`     | Remove a resource             |
| `c.ws`     | `c.ws('/ws', { open, message, close })` | WebSocket endpoint            |

Each handler receives the typed context. Schemas are passed as the third argument to the method and validate the matching part of the request before the handler runs.

## A Complete Controller [#a-complete-controller]

This controller follows the five-route pattern per resource and adds a custom action:

```ts title="src/app/http/controllers/posts.ts"
// src/app/http/controllers/posts.ts
import { defineController } from '@kwiva/http'

export default defineController('posts', (c) => ({
  list: c.get('/', async ({ query }) =>
    Post.query()
      .where('status', 'published')
      .page(query.page ?? 1, 20)
  ),

  get: c.get('/:id', async ({ params }) =>
    Post.findOrFail(params.id)
  ),

  create: c.post('/', async ({ body, session }) =>
    Post.create({ ...body, authorId: session.user.id })
  , {
    body: { title: 'string', body: 'string?' },
    permission: 'posts.create',
  }),

  update: c.put('/:id', async ({ params, body }) => {
    const post = await Post.findOrFail(params.id)
    return post.update(body)
  }, {
    body: { title: 'string', body: 'string?', status: 'string' },
    permission: 'posts.update',
  }),

  remove: c.delete('/:id', async ({ params }) =>
    Post.query().where('id', params.id).delete()
  , { permission: 'posts.delete' }),

  publish: c.post('/:id/publish', async ({ params }) => {
    const post = await Post.findOrFail(params.id)
    return post.update({ status: 'published', publishedAt: new Date() })
  }, { permission: 'posts.publish' }),
}), {
  prefix: '/posts',
  tags: ['posts'],
})
```

Routes are declared declaratively: the handler runs only after validation and authorization have passed, and every return value is serialized into a response by the pipeline.

## Typed Handlers [#typed-handlers]

Context types flow entirely from the route. `params.id` is typed as the string declared in the schema, `body` matches the body schema exactly, and `store` carries the shapes declared in `defineApp`:

```ts title="typed-handlers.ts"
handler: async ({ params, query, body, headers, cookies, session, tenant, store, set, error }) => {
  set.status = 201
  set.headers['x-cache'] = 'miss'
  return { id: params.id, ...body }
}
```

Setting the status, headers, or cookies on `set` after returning a value produces a fully formed response. Returning a plain object or array serializes to JSON; returning a web `Response` passes through unchanged.

> \[!TIP]
> The context's `set` surface is the same object middleware mutate after `next()`. Assigning headers in a handler and in an `onAfterHandle` stage composes without conflict — the final headers are assembled at the response stage.

## Per-Route Options [#per-route-options]

Each route accepts an option object that is typechecked against the route's method:

```ts title="per-route-options.ts"
c.post('/', handler, {
  body: { title: 'string' },
  query: { draft: 'string?' },
  params: { id: 'string' },
  headers: { authorization: 'string' },
  cookies: { theme: 'string' },
  permission: 'posts.create',
  summary: 'Create a post',
})
```

| Option                           | Validates or documents                 |
| -------------------------------- | -------------------------------------- |
| `body`                           | Request body schema                    |
| `query`                          | Query-string schema                    |
| `params`                         | Path-parameter schema                  |
| `headers`                        | Request-header schema                  |
| `cookies`                        | Request-cookie schema                  |
| `permission`                     | Policy gate for the route              |
| `summary`, `tags`, `description` | OpenAPI metadata                       |
| `middleware`                     | Route-level middleware stages          |
| `file`                           | Upload constraints: `maxSize`, `types` |
| `cors`                           | Per-route origin policy                |
| `macros`                         | Declared-on-app reusable route keys    |

Any of `body`, `query`, `params`, `headers`, and `cookies` can be validated per route. `summary`, `tags`, and `description` flow into OpenAPI, so the metadata you write for a handler becomes the documentation others read — there is no separate spec file. `permission` gates the route through the policy system; the framework refuses to run the handler until the policy passes.

## Guards Inside Controllers [#guards-inside-controllers]

A guard scopes a shared requirement — a route schema, middleware, or a `beforeHandle` check — to everything declared inside it:

```ts title="guards-inside-controllers.ts"
defineController('admin', (c) => c.guard({
  middleware: ['auth'],
  beforeHandle: ({ session, error }) => {
    if (session.user?.role !== 'admin') return error('FORBIDDEN')
  },
}, (g) => ({
  dashboard: g.get('/dashboard', dashboardHandler),
  settings:  g.get('/settings', settingsHandler),
})))
```

Guards nest and compose, and each applies its schema, middleware, and check to all nested routes. The guarded builder `g` does not expose the unprotected surface — anything a guard protects must be declared through it. See [Guards](/docs/http/guards) for the full detail.

## Custom Actions [#custom-actions]

Any route can be a custom action. Custom actions follow REST conventions — no verbs in paths — and appear in the typed client under the controller name:

```ts title="custom-actions.ts"
client.posts.publish('pst_123')
```

The custom action maps to `POST /api/posts/pst_123/publish` — the fifth and sixth routes in the generated shape: the deterministic `list`, `get`, `create`, `update`, `delete`, then any controller-defined actions. Custom actions validate their inputs exactly like generated routes and contribute identical manifest entries.

## Mounting and Groups [#mounting-and-groups]

Controllers mount under their `prefix`, which concatenates with the API prefix from `src/config/api.ts`:

```plaintext title="mounting-and-groups.txt"
/api/{model}                 ← generated model routes
/api/{controller}/{...}      ← controller routes under prefix
/api/{controller}/:id        ← resource routes
/api/{controller}/:id/{action}
```

With URL versioning enabled, the version segment slots in front of the controller prefix, producing `/api/v1/posts/...`.

Groups are formed by composition: shared prefixes, repeated guards, and route-level middleware. Route declaration is flat and explicit — nesting is achieved through guards rather than nested controller objects.

## WebSocket Routes [#websocket-routes]

A `c.ws` route is a route like any other: it lives under the controller prefix, inherits controller middleware and guards, and appears in the route manifest. Its three callbacks cover the connection lifecycle:

```ts title="websocket-routes.ts"
chat: c.ws('/chat', {
  open: (ws) => channels.subscribe(ws),
  message: (ws, { data }) => channels.publish(data),
  close: (ws) => channels.unsubscribe(ws),
})
```

A mounted guard runs its checks during the handshake, so unauthenticated clients are rejected before the upgrade completes. See [WebSockets](/docs/http/websockets) and [Realtime](/docs/realtime).

## Macros [#macros]

Macros turn reusable route-level keys into typechecked options. They are declared once on `defineApp` and consumed per route:

```ts title="macros.ts"
defineApp({
  macros: {
    auth: (required: boolean, { beforeHandle }) => {
      if (required) beforeHandle.push(requireAuth)
    },
    cache: (seconds: number, { afterHandle }) => afterHandle.push(setCache(seconds)),
  },
})

// per route, typechecked against the macro signature
c.get('/:id', handler, { auth: true, cache: 60 })
```

The macro receives the route's hook buckets — `beforeHandle`, `afterHandle` — and installs behavior at the right stage, so a one-word route option can expand into full pipeline logic without scattering code across the controller.

## What's Next [#whats-next]

1. [Routes & Routing](/docs/http/routes) — paths, params, and the route manifest
2. [Validation](/docs/http/validation) — per-route input schemas
3. [Guards](/docs/http/guards) — scoping middleware and checks to groups of routes
4. [API: REST conventions](/docs/api/rest) — URL and status-code conventions
5. [API: RPC client](/docs/api/rpc) — calling controllers with full type safety
