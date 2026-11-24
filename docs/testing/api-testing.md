# API Testing (/docs/testing/api-testing)



# API Testing [#api-testing]

```ts title="src/app/http/controllers/todos.test.ts"
import { withApp, createTestClient } from "@kwiva/testing";

describe("GET /api/todos", () => {
  it("lists todos", async () => {
    await withApp(async ({ server }) => {
      const client = await createTestClient(server);
      const res = await client.Todos.list();
      expect(Array.isArray(res.data)).toBe(true);
    });
  });
});
```

## Contracts [#contracts]

Check `res.data`, `res.status`.

## Errors [#errors]

Check `error.code` (BAD\_REQUEST/VALIDATION/...).

## Auth [#auth]

Mock `ctx.user` via request context or use real `requireAuth`.

## Permissions [#permissions]

Assert via `ctx.can` in middleware, or `requireAuth` + policies.

> \[!TIP]
> For 401s: use `requireAuth` without session, assert `UNAUTHORIZED`.
