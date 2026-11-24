# Data Hooks (/docs/frontend/data-hooks)



# Data Hooks [#data-hooks]

From `@kwiva/client` — TanStack Query based.

## Hooks [#hooks]

| Hook                                        | Purpose                            |
| ------------------------------------------- | ---------------------------------- |
| `useResource(routeId, args?, options?)`     | generic query                      |
| `useList(routeId, args?, options?)`         | list queries                       |
| `useMutation(routeId, options?)`            | mutations (with auto-invalidation) |
| `useUpload(routeId, options?)`              | file upload mutations              |
| `useInfiniteList(routeId, args?, options?)` | infinite scroll                    |
| `useForm(initial, options?)`                | form state + submit                |
| `connectRoute(routeId, args?, opts?)`       | WS connection                      |

## Mutations [#mutations]

```ts
const [mutate, state] = useMutation("TodosController.create");
await mutate({ title: "Buy milk" });
```

## Invalidation [#invalidation]

`routeFamily("TodosController.list")` — returns the family for auto-invalidation.

## Cache [#cache]

`enableCachePersistence({storage, key, maxAge})` — persisted QueryClient cache.

## QueryClient [#queryclient]

`createQueryClient()`, `getQueryClient()`, `resetQueryClient()`, `dehydrateClient(client)`, `ClientProvider({children, client?, dehydratedState?})`.

## Optimistic updates (M2+) [#optimistic-updates-m2]

Use `useMutation` + `queryClient.setQueryData` patterns — via typed routes.

> \[!TIP]
> For SSR-safe cache transfer, see [Cache & KV](/docs/data/cache).
