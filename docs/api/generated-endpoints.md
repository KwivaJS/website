# Generated Endpoints (/docs/api/generated-endpoints)



# Generated Endpoints [#generated-endpoints]

`defineModel` → 5 REST routes via `restRoutes(model)` → `restBasePath(name)`.

| Method    | Path               | Description                              |
| --------- | ------------------ | ---------------------------------------- |
| GET       | `/api/{model}`     | List (validated where/page/orderBy/with) |
| POST      | `/api/{model}`     | Create                                   |
| GET       | `/api/{model}/:id` | Get                                      |
| PATCH/PUT | `/api/{model}/:id` | Update                                   |
| DELETE    | `/api/{model}/:id` | Remove                                   |

## Contracts [#contracts]

Auto-generated per route; `ctx.input.body` typed via `InputOf<Model>`.

## Permissions [#permissions]

`model.options.permission` + `routes: true` → gates routes via `ctx.can`.

## Client [#client]

`client.Todos.list()`, `client.Todos.create(data)`, `client.Todos.get(1)`, `client.Todos.update(1, data)`, `client.Todos.delete(1)` — see [Client SDK](/docs/api/client).
