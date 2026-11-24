# How do I paginate results? (/guides/pagination)



# Paginate Results [#paginate-results]

## Offset [#offset]

```ts
await Todo.page(1, { size: 20 }).where("status", "pending").all();
```

Response envelope: `{ items, page, size, total, pages }`.

## Cursor [#cursor]

```ts
await Todo.cursor("id", "todos", { limit: 50 }).all();
```

Response: `{ items, cursor, hasMore }`.

## Client [#client]

```tsx
const { items, loadNext, hasNext } = useInfiniteList("TodosController.list");
```

## Notes [#notes]

* Use cursor for high-volume/frequently updated collections (chats, feeds).
* Offset for dashboards/admin views.
