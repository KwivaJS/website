# How do I validate input? (/guides/validate-input)



# Validate Input [#validate-input]

## 1. Field DSL (models) [#1-field-dsl-models]

```ts title="src/app/models/todo.ts"
import { defineModel } from "@kwiva/data";
export const Todo = defineModel("todos", (f) => ({
  title: f.string().validation((s) => s.min(1).max(200)),
  priority: f.integer().validation((i) => i >= 0 && i <= 10),
}));
```

## 2. Route-level validation [#2-route-level-validation]

```ts title="src/app/http/controllers/todos.ts"
api.post("/", async (ctx) => ctx.store.todos.create(ctx.input.body), {
  input: {
    body: CreateTodoBody, // Standard Schema
    params: ParamsSchema,
    query: QuerySchema,
  },
});
```

## 3. Contracts [#3-contracts]

`defineContract({request, response})` — see [Controllers](/docs/http/controllers#contract).

## Error shape [#error-shape]

```json
{
  "error": {
    "code": "VALIDATION",
    "message": "Invalid input",
    "fields": { "body.title": ["Too short"] },
    "requestId": "req_abc"
  }
}
```

> \[!TIP]
> Custom rules: `.validation((v) => new Error("Custom"))` — returns error on falsey.
