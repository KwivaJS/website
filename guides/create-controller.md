# How do I create a controller? (/guides/create-controller)



This guide shows how to expose an HTTP API with `defineController`. A controller groups typed handlers — `get`, `post`, `put`, `delete` — under a single prefix, with per-route validation and permissions.

## Prerequisites [#prerequisites]

* A Kwiva project with the `@kwiva/http` package installed
* A model to operate on (see [create a model](/guides/create-model))
* The dev server available on `http://localhost:3000`

## Generate the controller [#generate-the-controller]

`kwiva make:controller` scaffolds a controller file:

```bash title="terminal"
kwiva make:controller posts
```

This creates `src/app/http/controllers/posts.ts`.

## Define handlers [#define-handlers]

Open the generated file and define your handlers. Each handler receives a typed context with `body`, `params`, `query`, and `session`:

```ts title="src/app/http/controllers/posts.ts"
// src/app/http/controllers/posts.ts
import { defineController } from '@kwiva/http'
import { Post } from '../models/posts'

export default defineController('posts', (c) => ({
  list: c.get('/', async ({ query }) => {
    return Post.query()
      .where('status', 'published')
      .page(query.page ?? 1, 20)
  }),

  get: c.get('/:id', async ({ params }) => {
    return Post.findOrFail(params.id)
  }),

  create: c.post('/', async ({ body, session }) => {
    return Post.create({
      ...body,
      authorId: session.user.id,
    })
  }, {
    body: { title: 'string', body: 'string?', status: 'string?' },
    permission: 'posts.create',
  }),

  update: c.put('/:id', async ({ params, body }) => {
    const post = await Post.findOrFail(params.id)
    return post.update(body)
  }, {
    body: { title: 'string?', body: 'string?', status: 'string?' },
    permission: 'posts.update',
  }),

  delete: c.delete('/:id', async ({ params }) => {
    const post = await Post.findOrFail(params.id)
    await post.delete()
    return { deleted: true }
  }, {
    permission: 'posts.delete',
  }),
}), {
  prefix: '/posts',
  tags: ['posts'],
})
```

## Route options [#route-options]

The third argument configures the route group: `prefix` mounts the controller at `/posts`, and `tags` flows into the OpenAPI spec. The per-route `permission` option gates each handler by policy — a missing session returns 401, a denied policy returns 403.

For custom actions beyond the resource verbs, add a handler on a sub-path:

```ts title="route-options.ts"
c.post('/:id/publish', async ({ params }) => {
  const post = await Post.findOrFail(params.id)
  return post.update({ status: 'published' })
}, { permission: 'posts.publish' })
```

## Verify it works [#verify-it-works]

With the dev server running, exercise the routes:

```bash title="terminal"
curl http://localhost:3000/posts

curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello World", "body": "My first post"}'

curl http://localhost:3000/posts/pst_123
```

The create call returns the new record, and the list handler returns a paginated page of published posts. The routes also appear under `/openapi.json`.

## Related Documentation [#related-documentation]

* [Controllers](/docs/http/controllers) — The `defineController` reference
* [Your First API](/docs/getting-started/first-api) — Controller walkthrough
* [Routes](/docs/http/routes) — Route conventions and generated endpoints
* [Validation](/docs/http/validation) — Per-route Standard Schema
* [Guards](/docs/http/guards) — `c.guard()` for route protection
