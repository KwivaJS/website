# Type Inference (/docs/core-concepts/type-inference)



# Type Inference [#type-inference]

Types derive end-to-end via route-tree:

```
Model fields → Model Definition → RouteTree
                                                  ↓
Client hooks + server handlers fully typed
```

## Examples [#examples]

```ts
const todo = await client.Todos.create({ title: "x" });
// todo: { id: number; title: string; status: "pending" | "done"; ... }
```

## `ClientRegister` [#clientregister]

Route map from `src/.kwiva/types/route-tree.gen.ts`.
