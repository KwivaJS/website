# Validation (/docs/data/validation)



# Validation [#validation]

## 1. Field DSL validation (write-time) [#1-field-dsl-validation-write-time]

Fields with `.validation(v => v)` use Standard Schema (`@standard-schema/utils`). Issues → `ValidationError` with `fields: Record<string, string[]>`.

```ts title="src/app/models/post.ts"
export const Post = defineModel("posts", (f) => ({
  title: f.string().validation((s) => s.min(1).max(200)),
  email: f.string().validation((v) => (v.trim() ? true : "email is required")),
}));
```

## 2. Route-level validation (input) [#2-route-level-validation-input]

Every route input entry is validated via Standard Schema (params, query, body, headers, cookies).

```ts title="src/app/http/controllers/posts.ts"
api.post("/", handler, {
  input: { body: CreatePostBody },
  // or query/params/headers/cookie entries
});
```

## 3. Contracts [#3-contracts]

`defineContract({request, response})` — typed, generated OpenAPI + zod validation.

## Error shape [#error-shape]

```json title="422 response"
{
  "error": {
    "code": "VALIDATION",
    "message": "Invalid input",
    "fields": { "body.title": ["Too short"], "body.email": ["Required"] },
    "requestId": "req_abc123"
  }
}
```

> \[!TIP]
> Validation runs before middleware on write paths; GET-side validation on query/params.
