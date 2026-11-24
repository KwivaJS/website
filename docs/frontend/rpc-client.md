# RPC Client (/docs/frontend/rpc-client)



# RPC Client [#rpc-client]

`@kwiva/client` — scoped, typed client, SSR-safe.

## `client` singleton [#client-singleton]

```ts
import { client } from "@kwiva/client";
const todos = await client.Todos.list({ query: { page: 1 } });
```

## `useResource` — hooks for lists and singles [#useresource--hooks-for-lists-and-singles]

```tsx
const { data, isLoading } = useResource("TodosController.list", { query: { page: 1 } });
```

## Subscriptions [#subscriptions]

`connectRoute(routeId, args, {reconnect?, handlers?, onEvent?})` — WS.

## Testing [#testing]

With `withApp`, `ctx.client` is the in-process typed client.

> \[!TIP]
> TanStack Query in the background; `@tanstack/react-query` is a peer dep.
