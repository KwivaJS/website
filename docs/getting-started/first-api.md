# Your First API (/docs/getting-started/first-api)



# Your First API [#your-first-api]

## The Free API from your model [#the-free-api-from-your-model]

Every `defineModel` gets 5 generated routes (REST per model):

```plaintext title="free-api.txt"
GET    /api/todos
POST   /api/todos
GET    /api/todos/:id
PATCH  /api/todos/:id
DELETE /api/todos/:id
```

## Controllers [#controllers]

```ts title="src/app/http/controllers/todos.ts"
import { defineController } from "@kwiva/http";
import { requireAuth } from "@kwiva/auth";
import { authorize } from "@kwiva/auth";

export const TodosController = defineController({
  prefix: "/api/todos",
  permission: "todos",
  middleware: [requireAuth()],
  routes(api) {
    api.get("/", async (ctx) => {
      return ctx.store.todos.where("status", "pending").all();
    });

    api.post("/", (ctx) => {
      authorize(TodoPolicy, ctx.user, "create");
      return ctx.store.todos.create(ctx.input.body).toJSON();
    }, { name: "create" });
  },
});
```

## A complete controller with contracts [#a-complete-controller-with-contracts]

```ts title="src/app/http/controllers/posts.ts"
import { defineController } from "@kwiva/http";
import { validateTodoInput } from "../validators";

export const PostsController = defineController({
  prefix: "/api/todos",
  routes(api) {
    api.get("/", () => ({ items: [] }));
    api.get("/:id", () => ({ id: 1 }));
    api.post("/", (ctx) => ctx.input.body, {
      name: "create",
      input: { body: CreateTodoBody },
      output: { schema: TodoJson, status: 201 },
    });
  },
});
```

## How it wires [#how-it-wires]

```plaintext
GET /api/todos/
├── parser.parse() → ctx.input
├── input.validate() (Standard Schema) → 400 VALIDATION on failure
├── middleware → 401/403
├── handler → result
└── output.transform() → json
```

## What to read next [#what-to-read-next]

* [REST conventions](/docs/api/rest)
* [Generated endpoints](/docs/api/generated-endpoints)
* [Typed RPC](/docs/api/rpc)
* [Client SDK](/docs/api/client)
