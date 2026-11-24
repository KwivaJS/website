# Transactions (/docs/data/transactions)



# Transactions [#transactions]

```ts
import { db } from "@kwiva/data";

await db.transaction(async () => {
  await Post.create({ title: "x" });
  await db.execute("UPDATE counters SET n = n + 1");
});
```

## Nested transactions (savepoints) [#nested-transactions-savepoints]

Inner `db.transaction` → SAVEPOINT; inner failure rolls back to savepoint (outer continues).

## Transactional outbox (for events/jobs) [#transactional-outbox-for-eventsjobs]

```ts
// inside a transaction:
import { enqueueOutbox } from "@kwiva/jobs";
await enqueueOutbox(SendWelcomeJob, { userId: 1 });

// inside the same tx:
import { enqueueOutbox as enqueueEvent } from "@kwiva/events"; // broadcast metadata + outbox
await enqueueEvent(UserSignedUp, { id: 1 });

// after commit:
drainOutbox(); // dispatches from outbox
```

> \[!TIP]
> See [Events → broadcast metadata](/docs/realtime/events) and [@kwiva/jobs outbox](/api/jobs#outbox).
