# Integration Testing (/docs/testing/integration-testing)



# Integration Testing [#integration-testing]

```ts title="src/app/http/controllers/posts.test.ts"
import { withApp } from "@kwiva/testing";

await withApp(async ({ server, client, registry }) => {
  // 1. client calls hit real controllers
  const todos = await client.Todos.create({ title: "Integration" });
  // 2. db asserts via client or PGlite
  // 3. jobs via fakeQueue (dispatch sync)
  // 4. events via fakeEvents
});
```

## Utilities [#utilities]

* `bootAppFromRoot` — in-process server
* `createTestClient(server)` — in-process typed client
* `withApp` — manage lifecycle

> \[!TIP]
> Use `setupTestDb` for DB-level integration, `withApp` for request-level.
