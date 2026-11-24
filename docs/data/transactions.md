# Transactions (/docs/data/transactions)



Transactions give you atomic, consistent, isolated, durable writes — the guarantee that a block of statements either all commit or all roll back. Kwiva's `db.transaction` wraps a callback with the active connection, supports nesting (mapped to savepoints), accepts isolation and retry options, and integrates with the event system through the **outbox pattern** so that events and jobs are never lost when the surrounding write succeeds.

## Basic Transactions [#basic-transactions]

```ts title="basic-transactions.ts"
await db.transaction(async (tx) => {
  const order = await Order.create(payload, { tx })
  await OrderItem.createMany(items, { tx })
  await Inventory.decrement(productId, quantity, { tx })
})
```

Every write inside the callback receives `tx` — either as the second argument to a static call or as a `{ tx }` option — so it executes on the same connection and joins the same transaction. If any statement throws, the framework rolls the entire block back and rethrows; nothing is persisted on the way out of a failed transaction.

| Element   | Detail                                                 |
| --------- | ------------------------------------------------------ |
| Scope     | One callback = one transaction                         |
| Threading | `{ tx }` or `(attrs, { tx })` opts into the connection |
| Failure   | Any throw rolls back everything and rethrows           |
| Success   | Return value of the callback is returned after commit  |

## Nested Transactions and Savepoints [#nested-transactions-and-savepoints]

Transactions nest. An inner `db.transaction` inside an outer one becomes a **savepoint** rather than a real nested transaction:

```ts title="nested-transactions-and-savepoints.ts"
await db.transaction(async (tx) => {
  const order = await Order.create(payload, { tx })

  await tx.savepoint('create_items', async (sp) => {
    await OrderItem.createMany(items, { tx })
  })

  await tx.savepoint('ship', async (sp) => {
    await Shipment.create(plan, { tx })
  })
})
```

| Pattern                  | Behavior                                                  |
| ------------------------ | --------------------------------------------------------- |
| Nested `db.transaction`  | Savepoint on the outer transaction                        |
| `tx.savepoint(name, cb)` | Explicit named savepoint                                  |
| Inner failure            | Rolls back only to the savepoint; the outer work survives |

This is what makes partial rollback practical: a genuinely optional sub-operation can fail without forfeiting the whole unit of work.

## Isolation and Retries [#isolation-and-retries]

`db.transaction` accepts options for correctness-sensitive workloads:

```ts title="isolation-and-retries.ts"
const result = await db.transaction(async (tx) => {
  // read-modify-write critical section
}, { retries: 3, isolation: 'serializable' })
```

| Option      | Effect                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------- |
| `isolation` | The transaction's isolation level; `serializable` for read-modify-write critical sections |
| `retries`   | Automatic retry count for transient conflicts (serialization failures, deadlocks)         |

**Retry caveat**: the callback may run more than once, so it must be idempotent. Pair retries with the outbox pattern below so re-running a callback cannot duplicate events.

## The Read-Modify-Write Pattern [#the-read-modify-write-pattern]

Transactions are the correct tool whenever you read a value, decide, and write based on that decision. Combine the builder's row locks with a transaction so the read and the write cannot interleave with other workers:

```ts title="the-read-modify-write-pattern.ts"
await db.transaction(async (tx) => {
  const seat = await Seat.query().where('flightId', flightId).forUpdate().first()
  if (!seat || seat.isTaken) throw new Error('flight_full')
  await seat.update({ isTaken: true }, { tx })
})
```

| Piece           | Guarantee it provides                                              |
| --------------- | ------------------------------------------------------------------ |
| `forUpdate()`   | Locks the row until commit; concurrent writers block, not corrupt  |
| The transaction | The lock-and-write is one atomic unit, released together           |
| The guard check | Re-evaluated under lock, so two requests cannot book the same seat |

Keep this pattern short: hold the lock for the smallest critical section you can, then commit. Long transactions hold connections and locks, throttling everything behind them.

## Connection and Concurrency Semantics [#connection-and-concurrency-semantics]

A transaction is pinned to one connection for its lifetime — the pooled connection is `begin`'ed, used by every statement, and returned to the pool on commit or rollback. Implications:

* Nested transactions and savepoints share that connection by construction, so partial rollback is always consistent.
* Retry re-runs the callback on a fresh transaction (same borrowed connection or a new one) and re-begins.
* A transaction that stays open during slow application work holds a pooled connection — keep callbacks tight, or size `pool.max` for the expected number of concurrent transactions (see [Database Config](/docs/data/database-config)).

## The Outbox Pattern [#the-outbox-pattern]

Events emitted **inside** a transaction are the classic correctness trap: if you emit before commit, events fire for work that rolled back; if you emit after commit, a crash between write and emit loses the event. Kwiva solves this with a transactional outbox:

```ts title="the-outbox-pattern.ts"
await db.transaction(async (tx) => {
  const order = await Order.create(payload, { tx })
  await OrderPlaced.emit({ orderId: order.id }, { tx })
})
```

| Timeline               | What happens                                                          |
| ---------------------- | --------------------------------------------------------------------- |
| Inside the transaction | The event row is written to the outbox table atomically with `orders` |
| Post-commit            | The framework delivers the buffered event to listeners and the queue  |
| On rollback            | The outbox row rolls back with everything else — no phantom events    |

Because the emit is staged on the same transaction, the "lost emit" failure mode disappears: commit implies the event exists, and delivery is retried from the outbox independent of your request lifecycle.

## Transactions and Jobs [#transactions-and-jobs]

The same staging applies to queued work. A job dispatched inside `db.transaction` is held until commit and released afterward, so a queue worker can never observe state that the transaction later rolled back:

```ts title="transactions-and-jobs.ts"
await db.transaction(async (tx) => {
  await Account.create(payload, { tx })
  await SendWelcome.dispatch({ accountId: account.id }, { tx })
})
```

This mirrors the outbox mechanism end to end — see [Background Work: Jobs](/docs/background-work/jobs) and [Background Work: Queues](/docs/background-work/queues) for the dispatch pipeline.

## Raw Statements in Transactions [#raw-statements-in-transactions]

The escape hatch participates in the same transaction. Raw and builder statements executed against `tx` join the unit of work:

```ts title="raw-statements-in-transactions.ts"
await db.transaction(async (tx) => {
  const rows = await db.raw<{ total: number }>('select sum(amount) total from payments', { tx })
  await db.execute('update payments set settled = true', [], { tx })
})
```

Every write to the same transaction is atomic regardless of whether it went through a model, the builder, or raw SQL.

## Testing Transactions [#testing-transactions]

In integration tests, running each test inside a transaction that you roll back at the end keeps the database pristine and tests isolated without per-test cleanup. The same outbox guarantee applies: events emitted inside the test transaction are not delivered until commit, so assertions see a consistent world. See [Testing: Integration](/docs/testing/integration-testing) for the harness and the tenancy invariant suite.

## Observability [#observability]

Transactions emit spans covering open, statements, and commit/rollback, with duration and outcome. A slow or deadlocked transaction appears in tracing with its full statement trail — see [Observability: Tracing](/docs/observability/tracing).

## What's Next [#whats-next]

1. [Queries](/docs/data/queries) — building statements to run inside transactions
2. [Background Work: Jobs](/docs/background-work/jobs) — transaction-aware dispatch
3. [Realtime: Events](/docs/realtime/events) — the outbox-delivered events system
4. [Testing: Integration](/docs/testing/integration-testing) — transaction-backed test isolation
