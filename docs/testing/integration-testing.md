# Integration Testing (/docs/testing/integration-testing)



Integration tests are where an application proves it works as a whole — not just that its pieces return the right values, but that routes, services, data, and infrastructure compose correctly. Kwiva's `withApp` harness boots the real application for each test, so integration tests exercise the same kernel, adapters, and generated routes that production runs, with only slow or external infrastructure swapped for in-memory equivalents.

## The Harness [#the-harness]

Every integration test is a call to `withApp`:

```ts title="the-harness.ts"
import { withApp, createTestClient } from '@kwiva/testing'

test('posts CRUD', withApp(async (app) => {
  const client = createTestClient(app)

  const created = await client.posts.create({ title: 'First' })
  expect(created.data.title).toBe('First')

  const { data, total } = await client.posts.list({ where: { title: 'First' } })
  expect(total).toBe(1)
}))
```

Inside `withApp` you receive a fully booted application. The harness does the bookkeeping that would otherwise clutter every test file:

* Test-mode config and environment
* Migrations applied against an in-memory database
* Factories seeded so standard data is present
* The real kernel, adapters, and middleware stack active

Everything inside the callback is real code under real routing. What is fake is scope: the database is in memory, and infrastructure such as the queue and storage may be faked per test.

## What the Harness Boots [#what-the-harness-boots]

`withApp` boots the same kernel production boots — `defineApp` composition, module contributions, middleware stack, providers — because the composition story is part of what is under test. A route contributed by a module is integration-tested exactly where production serves it. The only substitutions are the in-memory equivalents for persistence and transport that would otherwise make a test slow or hermetic.

That means the harness doubles as a **composition test**: if module wiring, provider order, or config precedence breaks, the integration suite is where it surfaces — not in production.

## The In-Process Client [#the-in-process-client]

The typed client used inside the harness is `createTestClient(app)` — the in-process client that calls the app directly, with no network hop. Types flow from controller and model definitions as they do for the production client, so integration tests get the same end-to-end type inference that the shipped RPC client enjoys, but without sockets, ports, or serialization round-trips.

Because the client is typed against this app's controllers, a change to a controller signature is caught by the test suite's typecheck before the first assertion runs.

## Database Traits [#database-traits]

Data handling is a trait of the harness, selected by how `withApp` is configured:

| Trait                | Behavior                                              | Use when                                    |
| -------------------- | ----------------------------------------------------- | ------------------------------------------- |
| Transaction-per-test | each test runs in a transaction rolled back afterward | the default for most tests — fast, isolated |
| Fresh migrations     | drop and migrate for the test                         | migration-heavy or schema-switching tests   |

```ts title="database-traits.ts"
test('seeders produce the reference catalog', withApp({ db: 'fresh' }, async (app) => {
  // migrations applied from scratch; seeders run
}))
```

Transaction-per-test rolls back between tests, which keeps the suite fast and makes test ordering irrelevant: every test sees the same starting world. Fresh migrations are the escape hatch when the test's subject is the schema itself — a migration sequence, a seeder's output against a clean database, or a schema switch.

## Request Correlation [#request-correlation]

Because the harness boots real middleware, cross-cutting behavior is real too. Request id and tracing middleware run in integration tests, so assertions about correlation behavior — a `x-request-id` header, log lines bound to the request, tenant context flowing into storage keys — are made against the actual stack, not a simulation.

This matters for two kinds of test: correctness of the observability contract, and catching regressions where request-scoped plumbing (such as the tenant key) fails to propagate to the client call.

## Fakes [#fakes]

Fakes replace infrastructure while keeping the test in-process. Swap the real implementation for a recording double, run the flow, then assert on what was pushed, stored, or emitted.

```ts title="fakes.ts"
test('welcome email on signup', withApp(async (app) => {
  queue.fake()
  storage.fake()

  const client = createTestClient(app)
  await client.auth.signUp({ email: 'a@b.dev', password: 'swordfish123' })

  expect(queue.assertPushed('send-welcome')).toBe(true)
  expect(queue.assertNotPushed('invoice-paid')).toBe(true)
}))
```

| Fake               | What it records             | Example assertion                              |
| ------------------ | --------------------------- | ---------------------------------------------- |
| `queue.fake()`     | pushed jobs and payloads    | `queue.assertPushed('send-welcome')`           |
| `storage.fake()`   | stored paths and bytes      | stored file exists at the expected tenant path |
| `http.fake()`      | outbound client calls       | stubbed response shape returned                |
| `broadcast.fake()` | emitted channels and events | channel received the expected event            |

Fakes assert positive and negative effects both ways — `assertPushed` and `assertNotPushed` — so an integration test can prove that a flow dispatched the expected job and, just as importantly, did not dispatch an unwanted one.

## Combining Real and Fake [#combining-real-and-fake]

The harness is designed for mixes. A test can keep the real database for rows while faking the queue so no worker runs during the test, then assert the job was pushed rather than executed. Another test can keep storage real so generated file bytes are readable, while faking broadcast to avoid realtime side effects.

The general rule: &#x2A;*fake whatever has side effects beyond the app process; keep everything else real.** In-memory engines and fakes cover the first case, and the real kernel covers the second.

## Tenancy in Integration Tests [#tenancy-in-integration-tests]

Tenant behavior integrates cleanly because resolution runs in the harness:

```ts title="tenancy-in-integration-tests.ts"
withApp(async (app) => {
  const acme = app.asTenant('acme')
  const client = createTestClient(app, { tenant: acme })
  // requests are scoped; a cross-tenant read asserts 404
})
```

Tenant context flows into storage keys, cache keys, and queue payloads the same way it does in production, so integration tests double as tenancy tests — including the isolation invariants documented in [Tenant Isolation](/docs/tenancy/isolation).

## When to Reach for Integration Tests [#when-to-reach-for-integration-tests]

Reach for `withApp` when the subject is a composed behavior:

* A multi-step flow that crosses routes, services, and data — signup to welcome job to stored artifact
* Middleware ordering and request-scoped plumbing
* Module contributions interacting with application code
* Schema and seeder behavior against an in-memory database (with `db: 'fresh'`)
* Anything where the failure mode lives in the wiring, not the logic

Unit tests pin the logic; API tests pin the request contract; integration tests prove the composition. If a test needs the real kernel but none of the HTTP contract, it belongs here.

## What's Next [#whats-next]

* [API Testing](/docs/testing/api-testing) — asserting responses and errors through the client
* [Unit Testing](/docs/testing/unit-testing) — the fast layer beneath integration tests
* [Fakes in Depth](/docs/data/factories) — model-aware factories that seed the harness
* [Tenant Isolation](/docs/tenancy/isolation) — tenancy invariants exercised in the harness
* [Testing](/docs/testing) — where integration sits in the pyramid
