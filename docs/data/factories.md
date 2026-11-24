# Factories (/docs/data/factories)



# Factories [#factories]

```ts title="src/database/factories/post-factory.ts"
import { defineFactory } from "@kwiva/data";
import { Post } from "../models/post";

export const PostFactory = defineFactory(Post, (f) => ({
  title: `Random Post ${f.integer()}`,
}));

// in tests:
const p1 = PostFactory.make();
const many = PostFactory.makeMany(5);
const saved = await PostFactory.create();
```

Factory API: `{make, makeMany, create, createMany, resetSequences}`. Factory fields via `FactoryApi{sequence, lorem, date, uuid, pick, integer, boolean, faker-lite}`.
