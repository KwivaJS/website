# Unit Testing (/docs/testing/unit-testing)



# Unit Testing [#unit-testing]

```ts title="src/app/policies/post.test.ts"
import { describe, it, expect } from "bun:test";
import { can } from "@kwiva/auth";
import { PostPolicy } from "./post";
import { defineModel } from "@kwiva/data";
import { setupTestDb, teardownTestDb, syncSchema, registerFixtures, truncateAll } from "@kwiva/data/testing";

describe("PostPolicy", () => {
  it("allows owner delete", () => {
    const user = { id: 1, role: "member" };
    const post = { authorId: 1 };
    expect(can(PostPolicy, user, "delete", post)).toBe(true);
  });
});
```

## DB lifecycle (data/testing) [#db-lifecycle-datatesting]

| API                                 | Notes                         |
| ----------------------------------- | ----------------------------- |
| `setupTestDb(models)`               | fresh in-memory PGLite + sync |
| `syncSchema()`                      | CREATE TABLE + FKs + indexes  |
| `teardownTestDb()`                  | close + reset                 |
| `truncateAll()`                     | truncate tables               |
| `registerFixtures({name, model}[])` | reset + register fixtures     |

## Testing withApp [#testing-withapp]

```ts
import { withApp } from "@kwiva/testing";
await withApp(async ({ server, handler, client }) => {
  // write tests here
});
```

## Jobs [#jobs]

`fakeQueue()` from @kwiva/jobs — `assertDispatched`.

## Events [#events]

`fakeEvents(...)` from @kwiva/events — `assertEmitted`.

## Mail [#mail]

`MemoryTransport` from @kwiva/mail — `assertSent` (sent\[]).
