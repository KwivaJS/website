# Client SDK (/docs/api/client)



# Client SDK [#client-sdk]

Typed client (Eden + TanStack Query).

## Config [#config]

```ts title="src/config/client.ts"
export default defineConfig({
  baseUrl: "https://api.example.com",
  credentials: "include",
  headers: { "x-app": "kwiva" },
  websocket: { url: "wss://api.example.com/ws" },
});
```

## Singleton [#singleton]

| Symbol                                      | Signature                                            |
| ------------------------------------------- | ---------------------------------------------------- |
| `client`                                    | Proxy — `client.Todos.list()`                        |
| `initClient(config)`                        | → `TypedClient`                                      |
| `resetClient()`                             | —                                                    |
| `getClientSnapshot()`                       | → `{baseUrl, wsUrl, routes, reconnect}`              |
| `callRoute(routeId, args?, opts?)`          | → `Promise<unknown>`                                 |
| `toClientError(status, value)`              | → `ClientErrorShape{code, message, status, fields?}` |
| `substitutePath(template, params, routeId)` | → segments                                           |

## Data hooks [#data-hooks]

| Hook                                        | Signature                                                            |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `useResource(routeId, args?, options?)`     | TanStack Query wrapper                                               |
| `useList(routeId, args?, options?)`         | —                                                                    |
| `useMutation(routeId, options?)`            | → `{mutateAsync, routeFamily, invalidate}`                           |
| `useUpload(routeId, options?)`              | multipart mutations                                                  |
| `useInfiniteList(routeId, args?, options?)` | → `{items, loadNext, hasNext}`                                       |
| `useForm(initial, options?)`                | `{data, setData, errors, processing, submit, post/patch/put/delete}` |
| `routeKey(routeId, args?)`                  | → `["kwiva", controller, method, args?]`                             |

## Cache persistence [#cache-persistence]

`enableCachePersistence({storage, maxAge, throttleMs})` → disposer; `clearPersistedCache()`.

## Token refresh [#token-refresh]

`createTokenRefreshFetch(options)` — retries once on 401.

## WS hooks [#ws-hooks]

`connectRoute(routeId, args?, {reconnect?})`, `useWsSubscription`, `useConnectionState`.

> \[!TIP]
> Built on `@elysia/eden` (Eden) + `@tanstack/react-query`.
