# Your First API (/docs/getting-started/first-api)



Kwiva gives you two ways to expose an API. The first is free: every model you create gets deterministic `list`, `get`, `create`, `update`, and `delete` routes with validation, policy checks, and pagination built in — zero hand-written endpoints. The second is a controller: a `defineController` factory that defines resource endpoints and custom actions with typed context, per-route schemas, and guards. This page walks through both.

## The Free API From Your Model [#the-free-api-from-your-model]

With the `posts` model from [Your First Model](/docs/getting-started/first-model) in place, these routes already exist under the API prefix:

| Method   | Path             | Purpose                                                     |
| -------- | ---------------- | ----------------------------------------------------------- |
| `GET`    | `/api/posts`     | List, with validated `where`, `page`, `orderBy`, and `with` |
| `GET`    | `/api/posts/:id` | Get a single post                                           |
| `POST`   | `/api/posts`     | Create a post (body validated, hooks run)                   |
| `PATCH`  | `/api/posts/:id` | Update a post (policy-checked)                              |
| `DELETE` | `/api/posts/:id` | Delete a post (respects soft delete)                        |

```plaintext title="the-free-api-from-your-model.txt"
/api/{model}              ← generated model routes
/api/{controller}/{...}   ← controller routes under their prefix
/api/{controller}/:id     ← resource routes
/api/{controller}/:id/{action}  ← custom actions
```

Try it against the dev server:

```bash title="terminal"
# List posts
curl http://localhost:3000/api/posts

# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello World", "body": "My first post"}'
```

## The Anatomy of a Controller [#the-anatomy-of-a-controller]

```ts title="the-anatomy-of-a-controller.ts"
defineController(name, (c) => ({ ... }), options)
```

The name (`'posts'`) drives discovery, route identity, and the namespace the route appears under in the typed client. The builder receives the route builder `c` and returns a map of named routes. The options object sets the prefix, OpenAPI tags, CORS, and other inline overrides — inline always beats the config folder.

## A Complete Controller [#a-complete-controller]

```ts title="src/app/http/controllers/posts.ts"
// src/app/http/controllers/posts.ts
import { defineController } from '@kwiva/http'
import { Post } from '../models/posts'

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
    body: { title: 'string?', body: 'string?', status: 'string?' },
    permission: 'posts.update',
  }),

  remove: c.delete('/:id', async ({ params }) => {
    const post = await Post.findOrFail(params.id)
    await post.delete()
    return { deleted: true }
  }, {
    permission: 'posts.delete',
  }),

  publish: c.post('/:id/publish', async ({ params }) => {
    const post = await Post.findOrFail(params.id)
    return post.update({ status: 'published', publishedAt: new Date() })
  }, { permission: 'posts.publish' }),
}), {
  prefix: '/posts',
  tags: ['posts'],
})
```

### Route Builder Methods [#route-builder-methods]

| Method     | Usage                                   | Typical purpose               |
| ---------- | --------------------------------------- | ----------------------------- |
| `c.get`    | `c.get('/:id', handler, schema?)`       | Read a resource or collection |
| `c.post`   | `c.post('/', handler, schema?)`         | Create, or a custom action    |
| `c.put`    | `c.put('/:id', handler, schema?)`       | Replace a resource            |
| `c.patch`  | `c.patch('/:id', handler, schema?)`     | Partial update                |
| `c.delete` | `c.delete('/:id', handler, schema?)`    | Remove a resource             |
| `c.ws`     | `c.ws('/ws', { open, message, close })` | WebSocket endpoint            |

Route declarations are declarative: the handler runs only after validation and authorization have passed, and every return value is serialized into a response by the pipeline.

## Typed Context [#typed-context]

Every handler receives a fully typed context. Types are inferred from the route's schemas, so `params.id` is `string`, `body` matches the body schema exactly, and `store` carries the shapes declared by the application:

| Property              | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `params`              | Typed URL parameters                                   |
| `query`               | Typed query-string values                              |
| `body`                | Typed request body                                     |
| `headers` / `cookies` | Typed inbound headers and cookies                      |
| `session`             | The current session (if authenticated)                 |
| `store`               | App-level state, decorations, and per-request resolves |
| `set`                 | Response controls — status, headers, cookies           |
| `error`               | Return a structured error response                     |

```ts title="typed-context.ts"
handler: async ({ params, query, body, session, set, error }) => {
  set.status = 201
  set.headers['x-cache'] = 'miss'
  return { id: params.id, ...body }
}
```

Returning a plain object or array serializes to JSON; returning a web `Response` passes through unchanged.

## Per-Route Validation [#per-route-validation]

Any route accepts an option object validated against the route's method. Schemas can target each part of the request:

```ts title="per-route-validation.ts"
c.post('/', handler, {
  body: { title: 'string', body: 'string?' },
  query: { draft: 'string?' },
  params: { id: 'string' },
  headers: { authorization: 'string' },
  cookies: { theme: 'string' },
  permission: 'posts.create',
  summary: 'Create a post',
})
```

* `summary`, `tags`, and `description` flow into OpenAPI
* `permission` gates the route through the policy system — the handler never runs unless the policy passes
* Validation failures return field-mapped 422 responses shaped by the error taxonomy

## Guards [#guards]

A guard scopes a shared requirement — middleware, a schema, or a `beforeHandle` check — to a group of routes:

```ts title="guards.ts"
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

## Errors [#errors]

Kwiva maps errors to HTTP through a small taxonomy of error codes:

```ts title="errors.ts"
import { error } from '@kwiva/http'

return error('NOT_FOUND')                       // 404 { code: 'NOT_FOUND' }
return error('UNAUTHORIZED')                    // 401
return error('FORBIDDEN', { message: 'no' })    // 403
return error('VALIDATION', { message, issues }) // 422
```

## Calling the API From Code [#calling-the-api-from-code]

The typed client mirrors your controllers and models exactly:

```ts title="calling-the-api-from-code.ts"
const posts = await client.posts.list({ page: 1 })       // typed response
const post = await client.posts.get('pst_123')           // typed params and response
await client.posts.publish('pst_123')                    // custom action, typed
```

`client.posts.publish` maps to `POST /api/posts/pst_123/publish`. Every controller route appears in the client with end-to-end types — see [API: RPC client](/docs/api/rpc) for details.

## What to Read Next [#what-to-read-next]

* [Controllers](/docs/http/controllers) — the complete controller reference
* [Routes](/docs/http/routes) — route conventions and the route manifest
* [Validation](/docs/http/validation) — input validation with Standard Schema
* [Guards](/docs/http/guards) — scoping middleware and checks to routes
* [API: REST conventions](/docs/api/rest) — URL and status-code conventions
* [API: RPC client](/docs/api/rpc) — the fully typed client surface
