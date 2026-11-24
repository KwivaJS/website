# Soft Deletes (/docs/data/soft-deletes)



# Soft Deletes [#soft-deletes]

```ts title="src/app/models/post.ts"
import { defineModel } from "@kwiva/data";
export const Post = defineModel("posts", (f) => ({
  id: f.id(),
  title: f.string(),
}), { softDelete: true });
```

Add `deletedAt` column. APIs on instances: `delete()` → sets `deletedAt`; `restore()`; `forceDelete()`; `withTrashed()`, `onlyTrashed()`, `trashed` flag.

Query side: default queries exclude trashed; `model.withTrashed()`, `.onlyTrashed()`.
