# How do I create a controller? (/guides/create-controller)



# Create a Controller [#create-a-controller]

```bash title="terminal"
kwiva make:controller Todos
```

Writes `src/app/http/controllers/todos.ts`.

## Example [#example]

```ts title="src/app/http/controllers/todos.ts"
import { defineController } from "@kwiva/http";
import { requireAuth } from "@kwiva/auth";

export const TodosController = defineController({
  prefix: "/api/todos",
  middleware: [requireAuth()],
  routes(api) {
    api.get("/", async (ctx) => {
      return ctx.store.todos.all().all();
    });
    api.get("/:id", (ctx) => ctx.store.todos.get(ctx.params.id));
    api.post("/", (ctx) => ctx.store.todos.create(ctx.input.body), {
      name: "create",
      input: { body: CreateTodoContract },
    });
  },
});
```

## Verify with curl [#verify-with-curl]

```bash title="terminal"
curl http://localhost:3000/api/todos
curl -X POST http://localhost:3000/api/todos -d '{"title":"hello"}'
```

## Guards + permissions [#guards--permissions]

```ts
api.get("/stats", async (ctx) => {
  authorize(StatsPolicy, ctx.user, "read");
});
```

> \[!TIP]
> Custom actions: `api.get("/:id/actions/...")` — createJob.
