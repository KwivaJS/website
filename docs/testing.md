# Testing (/docs/testing)



# Testing [#testing]

Kwiva ships its own harness: `@kwiva/testing`.

## Entry points [#entry-points]

| Topic               | Page                                                     |
| ------------------- | -------------------------------------------------------- |
| Unit Testing        | [Unit Testing](/docs/testing/unit-testing)               |
| Integration Testing | [Integration Testing](/docs/testing/integration-testing) |
| API Testing         | [API Testing](/docs/testing/api-testing)                 |
| E2E Testing         | [E2E Testing](/docs/testing/e2e-testing)                 |

## Basic usage [#basic-usage]

```ts
import { withApp, createTestClient } from "@kwiva/testing";

// Async pattern — boots real app
await withApp(async ({ client }) => {
  const res = await client.Todos.create({ title: "Test" });
});

// Sync pattern — synchronous-style with manual teardown
```

## `bootAppFromRoot` [#bootappfromroot]

See [@kwiva/testing docs](/api/testing#bootappfromroot).
