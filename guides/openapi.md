# How do I generate OpenAPI docs? (/guides/openapi)



Kwiva derives your OpenAPI 3 specification automatically from the route manifest, so the spec you ship always matches the routes you expose.

## Prerequisites [#prerequisites]

* A Kwiva project with at least one [model](/docs/data/models) or [controller](/docs/http/controllers)
* The development server running (`bun run dev`) on `http://localhost:3000`

## Serve the spec at /openapi.json [#serve-the-spec-at-openapijson]

At boot, Kwiva renders the whole spec from the route manifest — the single source of truth for your API surface:

```bash title="terminal"
curl http://localhost:3000/openapi.json
```

The spec includes generated model routes (5 per model), custom controller routes, and the schemas, enums, relations, pagination, and error responses derived from the same manifest. Interactive documentation renders in Swagger UI at `/docs` when enabled.

## Document models [#document-models]

Every field on a model contributes its type, validation rules, enums, and relations to the spec as schema components. Add a `description()` to any field to flow human-readable detail into the generated schema:

```ts title="document-models.ts"
import { defineModel } from '@kwiva/data'

export default defineModel('posts', (f) => ({
  id: f.id(),
  title: f.string().validation((s) => s.min(1).max(200))
    .description('The post title shown in listings.'),
  status: f.enum('draft', 'published', 'archived')
    .description('Current publication state.'),
}))
```

## Document controller actions [#document-controller-actions]

Every controller action accepts `tags`, `summary`, and `description` options that flow straight into the generated operation:

```ts title="document-controller-actions.ts"
import { defineController } from '@kwiva/http'
import { Post } from '../models/posts'

export default defineController('posts', (c) => ({
  list: c.get('/', async ({ query }) => {
    return Post.query().page(query.page ?? 1, 20)
  }, {
    tags: ['posts'],
    summary: 'List posts',
    description: 'Paginated list of posts, newest first.',
  }),
  publish: c.post('/:id/publish', async ({ params }) => {
    const post = await Post.findOrFail(params.id)
    return post.update({ status: 'published' })
  }, {
    tags: ['posts'],
    summary: 'Publish a post',
    permission: 'posts.update',
  }),
}), {
  prefix: '/posts',
  tags: ['posts'],
})
```

Tags group related operations in Swagger UI, so custom actions like `publish` stay grouped with their generated model routes.

## Verify it works [#verify-it-works]

1. Fetch the spec:
   ```bash
   curl -s http://localhost:3000/openapi.json
   ```
2. Look for `/api/posts` paths and matching entries under `components/schemas`.
3. Confirm the publish action appears with its summary and `posts` tag.
4. Open [http://localhost:3000/docs](http://localhost:3000/docs) and send a test request from Swagger UI.
5. For external consumers, emit a spec artifact with `kwiva build --docs`.

## Related Documentation [#related-documentation]

* [OpenAPI](/docs/api/openapi) — Endpoint reference
* [Routes & Routing](/docs/http/routes) — URL conventions and the route manifest
* [Controllers](/docs/http/controllers) — The options that shape the spec
* [Models](/docs/data/models) — How model fields become schema components
* [Validation](/docs/http/validation) — Request schemas reflected in the spec
