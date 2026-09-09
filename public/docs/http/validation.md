# Validation (/docs/http/validation)



Validation in Kwiva is schema-driven and appears everywhere the same way: models, controllers, jobs, and realtime channels all validate against schemas, resolved by one validation runtime. For HTTP routes that means every part of the request — body, query, params, headers, cookies — can be validated before your handler runs.

Because one runtime validates every boundary, the behavior is consistent: the same error envelope, the same field-mapped issues, and the same typed guarantees whether the input crossed a controller route, a model write, a job dispatch, or a channel message.

## Per-Route Schemas [#per-route-schemas]

Each route accepts a schema option object. Values missing from the schema are not silently accepted; the schema is the contract for that route:

```ts title="per-route-schemas.ts"
c.post('/', async ({ body, session }) =>
  Post.create({ ...body, authorId: session.user.id })
, {
  body: { title: 'string', body: 'string?' },
  query: { draft: 'string?' },
  permission: 'posts.create',
})
```

Here `title` is required and `body` is optional. The handler's `body` type is inferred from the schema — a misread of `body.title` fails typechecking.

## The Validation Surface [#the-validation-surface]

Five request regions can be schema'd independently:

| Option    | Validates       | Example                                |
| --------- | --------------- | -------------------------------------- |
| `body`    | Request body    | `{ title: 'string', body: 'string?' }` |
| `query`   | Query string    | `{ page: 'string', q: 'string?' }`     |
| `params`  | Path parameters | `{ id: 'string' }`                     |
| `headers` | Request headers | `{ authorization: 'string' }`          |
| `cookies` | Request cookies | `{ theme: 'string' }`                  |

Schemas compose across regions in one route:

```ts title="the-validation-surface.ts"
c.patch('/posts/:id', async ({ params, body }) => {
  const post = await Post.findOrFail(params.id)
  return post.update(body)
}, {
  params: { id: 'string' },
  body: { title: 'string?', body: 'string?' },
})
```

A route can validate any subset of these regions. The schemas also define the handler's context types: `params.id` is `string`, `body` matches the body schema exactly, and headers and cookies arrive typed as declared.

## When Validation Runs [#when-validation-runs]

Validation is a pipeline stage, sandwiched between `onTransform` and `onBeforeHandle`:

```plaintext title="when-validation-runs.txt"
onParse → onTransform → validation → onBeforeHandle (guards) → handler
```

The ordering is a guarantee: guards see validated values. A guard's policy check can therefore rely on `body`, `query`, and `params` already matching their schemas. See [Request Lifecycle](/docs/http/lifecycle).

## Field Types as the Validation Source [#field-types-as-the-validation-source]

For models, the field DSL is the validation source — no duplicate schemas exist. Field types and their validation chaining generate the schema that guards generated endpoints and Studio screens:

```ts title="src/app/models/posts.ts"
// src/app/models/posts.ts
import { defineModel } from '@kwiva/data'

export default defineModel('posts', (f) => ({
  id: f.id(),
  title: f.string().validation((s) => s.min(1).max(200)),
  body: f.text().optional(),
  status: f.enum('draft', 'published', 'archived').default('draft'),
  author: f.belongsTo(() => User),
}), {
  timestamps: true,
  permission: 'posts',
})
```

The model's fields drive the schemas of its five generated routes, the typed client, and the validation runtime. See [Data: validation](/docs/data/validation) and [Models](/docs/data/models).

## Controller Schemas [#controller-schemas]

Controllers declare the same Standard Schema-compatible shape the rest of the runtime understands. Object-field notation is available for the common cases, and full Standard Schema objects compose with it on one route:

```ts title="controller-schemas.ts"
c.post('/', handler, {
  body: v.object({ title: v.string().min(1), body: v.optional(v.string()) }),
  query: v.object({ draft: v.optional(v.string()) }),
})
```

The `v` builder is the Standard Schema validator — Valibot by default, switchable in `src/config/app.ts` under the `validator` key, without changing route code. When a route needs richer rules — cross-field checks, refined messages, branded types — use the standard objects directly inside the same option object. The shorthand and the full objects coexist.

> \[!NOTE]
> Schemas are compiled once, not interpreted per request. The validation stage runs against a compiled validator built from the route's schema at boot, which is why the stage budget is under 0.5 ms even for nested object bodies.

## Validated Query on Generated Routes [#validated-query-on-generated-routes]

The generated model endpoints validate their query too:

* `where` is schema-checked against the model — unknown fields return a 422.
* `with` accepts only declared relations.
* `page`, `limit`, `orderBy`, and `q` are validated against the pagination contract.

An invalid `where` field fails before the query builder ever sees it. Callers cannot ask the query engine to read columns that do not exist or load relations the model does not expose. See [Generated Endpoints](/docs/api/generated-endpoints) and [Data: pagination](/docs/data/pagination).

## Friendly Field-Mapped Errors [#friendly-field-mapped-errors]

A validation failure returns a 422 with the error taxonomy code and a machine-readable issues list:

```json title="friendly-field-mapped-errors.json"
{
  "error": {
    "code": "VALIDATION",
    "message": "input validation failed",
    "requestId": "req_...",
    "issues": [
      { "path": "title", "message": "too long" }
    ]
  }
}
```

Each issue carries the exact `path` of the offending field and a human-readable message. UI forms map issues to fields directly, and the typed client surfaces them as a discriminated union — see [Error Handling](/docs/http/errors).

## Schema-Driven Validation Everywhere [#schema-driven-validation-everywhere]

The same schema-driven approach protects every input boundary:

* **Controllers** — per-route body, query, params, headers, cookies
* **Models** — field DSL as the source of truth for generated endpoints and Studio
* **Jobs** — payload schemas validated before dispatch and before execution
* **Channels** — realtime message payloads validated before handlers run
* **Search and params** — typed, schema-validated route state on the client

One validation runtime, consistent error shape, typechecking at every boundary. See [Security: input validation](/docs/security/input-validation) for the security posture this provides.

### Validation and the generated surfaces [#validation-and-the-generated-surfaces]

Because schemas are part of the route manifest, they are not only enforced at runtime — they are published. The OpenAPI spec derives model and controller schemas from the same definitions that validate requests, and Studio renders forms from the field DSL without a second schema definition. A validation rule written once appears in enforcement, in the spec, in the admin screens, and in the client types. See [API: OpenAPI](/docs/api/openapi) and [Studio](/docs/studio).

### File upload constraints [#file-upload-constraints]

Uploads validate with the same runtime. A route that declares a `file` schema — `maxSize` and `types` — enforces both during the parse stage, before the handler runs, and reports oversized or wrong-type uploads as field-mapped validation issues. See [File Uploads](/docs/http/file-uploads).

## Coercion and Low-Level Types [#coercion-and-low-level-types]

Query strings and headers arrive as strings; cookies likewise. Schemas that declare a numeric or boolean field parse the raw value before validation, and the parsed value is what guards and the handler see. The compiled schema handles the conversion, so a `?page=3` query declared as a number arrives typed as `number`, and a missing cookie declared with a default is filled before `onBeforeHandle`.

## The Validation Stage and Errors [#the-validation-stage-and-errors]

Validation runs as a dedicated stage between transform and guards. A failure short-circuits the pipeline the same way a guard denial does — the handler never runs, and the 422 response carries the field-mapped `issues` list. Because the stage is fixed, the failure behavior is identical for `body`, `query`, `params`, `headers`, and `cookies`. See [Error Handling](/docs/http/errors).

## What's Next [#whats-next]

1. [Controllers](/docs/http/controllers) — attaching schemas to route handlers
2. [Error Handling](/docs/http/errors) — the `VALIDATION` code and issues shape
3. [API: errors](/docs/api/errors) — error contracts on the typed client
4. [Data: validation](/docs/data/validation) — field-types as the validation source
5. [Security: input validation](/docs/security/input-validation) — validation as a security boundary
