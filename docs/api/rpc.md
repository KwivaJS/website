# Typed RPC (/docs/api/rpc)



# Typed RPC [#typed-rpc]

Zero-codegen typed client from `src/.kwiva/types/route-tree.gen.ts`.

## `client` singleton [#client-singleton]

```ts
import { client } from "@kwiva/client";
const todos = await client.Todos.list({ query: { page: 1 } });
const todo = await client.Todos.get({ params: { id: 42 } });
```

## `initClient` / `resetClient` / `getClientSnapshot` [#initclient--resetclient--getclientsnapshot]

```ts
import { initClient, resetClient } from "@kwiva/client";
initClient({ baseUrl: "https://api.example.com", credentials: "include" });
```

## `callRoute` [#callroute]

```ts
import { callRoute } from "@kwiva/client";
await callRoute("TodosController.list");
```

## Typed `RouteTree` [#typed-routetree]

`ClientRegister{routes}` — from `src/.kwiva/types/route-tree.gen.ts`; `TypedClient<R>` wraps Eden Treaty with typed method access.

## SSR/Test [#ssrtest]

`getClientSnapshot()` for SSR; `@kwiva/testing` `withApp()` returns `ctx.client`.

> \[!TIP]
> Handlers register by route id — `findRoute(entries, name)` at runtime.
