# Validation (/docs/http/validation)



# Validation [#validation]

## Route-level input [#route-level-input]

```ts title="src/app/http/controllers/posts.ts"
api.post("/", handler, {
  input: {
    params: "/api/posts/:id",
    query: { page: NumberSchema },
    body: CreatePostSchema,
    headers: HttpSchema,
    cookie: CookieSchema,
  },
});
```

## Validation pipeline [#validation-pipeline]

`validateInput(context, route, overrides?)` → `{params, query, body, headers?, cookies?}` — parsed+validated per section.

## `parsePart(part, schema, value)` [#parsepartpart-schema-value]

Throws `ValidationError{fields: Record<string, string[]>}` on failure.

## Error shape [#error-shape]

```json title="422"
{
  "error": {
    "code": "VALIDATION",
    "message": "Invalid input",
    "fields": { "body.title": ["Too short"] },
    "requestId": "req_abc123"
  }
}
```

## Custom validation middleware [#custom-validation-middleware]

```ts title="src/app/http/middleware/tenant.ts"
import { defineMiddleware } from "@kwiva/http";
import { abort } from "@kwiva/core";

export const TenantHeader = defineMiddleware((ctx, next) => {
  const tenant = ctx.headers().get("x-tenant");
  if (!tenant) throw abort("BAD_REQUEST", "Missing x-tenant header");
  return next(ctx);
});
```

## Contracts [#contracts]

`defineContract({request, response})` — merges request + response contracts (see [Controllers](/docs/http/controllers#contract)).
