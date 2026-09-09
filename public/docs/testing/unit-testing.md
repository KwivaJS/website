# Unit Testing (/docs/testing/unit-testing)



The base of the test pyramid is unit testing: services, policies, jobs, and pure helper logic exercised in isolation. No app boot, no HTTP, no database commit — just the function under test and its inputs. Unit tests are where you get the most signal per millisecond, and Kwiva's structure makes them easy to write because business logic lives in plain, testable definitions.

## What Belongs in a Unit Test [#what-belongs-in-a-unit-test]

The `defineX` convention keeps app behavior in discrete, importable units. Each one is a candidate for a unit test:

| Unit           | What you assert                                                     |
| -------------- | ------------------------------------------------------------------- |
| Services       | orchestration, transformations, and invariants the service enforces |
| Policies       | ability decisions across roles, owners, and resources               |
| Jobs           | payload handling and side-effect ordering                           |
| Helpers        | pure functions, formatters, and validators                          |
| Config modules | defaults, env mapping, and precedence                               |

Handlers that only glue HTTP to a service are covered better by integration and API tests. Unit tests target the logic — the part with branching and consequences.

## A Policy Test [#a-policy-test]

Policies are pure functions, which makes them the easiest high-value unit test in an app:

```ts title="a-policy-test.ts"
import { test, expect } from 'bun:test'
import postsPolicy from '../src/app/policies/posts'

test('admin can do anything', () => {
  const user = { id: 'u1', role: 'admin' }
  expect(postsPolicy(user, 'delete', { authorId: 'someone-else' })).toBe(true)
})

test('author can update their own post', () => {
  const user = { id: 'u1', role: 'editor' }
  expect(postsPolicy(user, 'update', { authorId: 'u1' })).toBe(true)
})

test('author cannot publish', () => {
  const user = { id: 'u1', role: 'writer' }
  expect(postsPolicy(user, 'publish')).toBe(false)
})
```

A policy's signature is `(user, ability, resource?)` returning a boolean or a promise. That contract is exactly what a unit test exercises: construct the subject, choose the ability, supply the resource, assert the decision. The decision logic — role branches, ownership comparisons, resource states — gets pinned down without any framework machinery around it.

Policy tests are also the cheapest documentation of the authorization contract: the role-ability matrix reads off the test file, so a new role knows what it can and cannot do.

## A Service Test [#a-service-test]

Services sit between routes and data. Unit tests drive them with plain input and inspect plain output, replacing the data layer with the same fakes the integration layer uses:

```ts title="a-service-test.ts"
import { test, expect } from 'bun:test'

test('reports only active subscriptions to billing', async () => {
  const reports = await billingService.collectReports()
  expect(reports).toHaveLength(1)
  expect(reports[0].status).toBe('active')
})
```

Because services are declared values — plain functions closed over their dependencies — constructing the service and passing a stubbed dependency is ordinary code, not framework ceremony. The control-inversion that makes this possible is the same property that makes `kwiva make:service` output trivially testable: the service does not import the world, it is given it.

## Job Tests [#job-tests]

Jobs are pure units of background work. A job test constructs a payload and inspects the handler logic with it — without a worker, without a queue connection:

```ts title="job-tests.ts"
import { test, expect } from 'bun:test'

test('welcome payload builds the expected message', () => {
  const payload = { userId: 'usr_1', email: 'a@b.dev' }
  const message = buildWelcomeMessage(payload)
  expect(message).toContain('a@b.dev')
})
```

When a job is dispatched, its payload is validated against its declared schema before the worker runs. Unit-testing the handler logic separately means you can pin the behavior down quickly and leave dispatch-path coverage to the integration layer, where `queue.assertPushed` observes the real dispatch. This mirrors the framework's own guidance for jobs — handlers (which touch infrastructure) are integration-tested, while the pure decisions inside them are unit-tested.

## They Can Be Less Isolated Than You Expect [#they-can-be-less-isolated-than-you-expect]

Unit tests are isolated from the framework, but they can still use real small units where convenient. A policy test can import the real model definitions; a job test can pass a real payload object. The point is that nothing external boots — no server, no queue worker, no storage mount. State that would otherwise need infrastructure is represented by the values you pass in.

This is a deliberate middle ground: the test stays fast and deterministic, but it exercises the same definitions production runs against, so a change to a model's field types is reflected in the unit test's world the moment it is made.

## Model Factories in Unit Tests [#model-factories-in-unit-tests]

Factories are useful far beyond integration tests. Any test that needs a plausible row on hand — a post with an owner, a user with a role, a comment thread — can build it without a database:

```ts title="model-factories-in-unit-tests.ts"
const post = await User.factory().create({ role: 'editor' })
```

The factory surface comes from the model:

| Expression                                   | Behavior                    |
| -------------------------------------------- | --------------------------- |
| `User.factory().create(overrides)`           | creates and returns one row |
| `User.factory().count(10).create(overrides)` | creates a batch of 10       |
| `User.factory().make(overrides)`             | returns an unsaved instance |

In a unit test, `make()` is enough — you need a value that looks like a user, not a row committed to a database. Overrides let each test describe exactly the case under test:

```ts title="model-factories-in-unit-tests-2.ts"
test('only the author can delete the draft', () => {
  const author = User.factory().make({ id: 'u1', role: 'writer' })
  const draft = Post.factory().make({ authorId: author.id })

  expect(postsPolicy(author, 'delete', draft)).toBe(true)
})
```

Factories are model-aware, so the fields they produce match the field DSL — enums produce valid enum values, relations produce plausible related ids — and overrides are familiar object spread. See [Factories](/docs/data/factories) for the full API.

## Fast Feedback [#fast-feedback]

Unit tests run in milliseconds for a reason: they never boot the app, never open a connection, and never schedule a job. That speed is what makes them the appropriate default for most of your test suite. The message is loud when a unit test is slow — it is likely no longer a unit test and belongs one layer up.

The same build discipline applies: unit tests run under the same single command as the rest of the suite, so there is no separate tool or ceremony to keep them healthy.

```bash title="terminal"
kwiva test                 # unit + integration together
kwiva test --watch posts   # watch the unit tests matching "posts"
```

## Designing for Testability [#designing-for-testability]

The framework's structure makes testability a property of where code lives, not a discipline you bolt on:

* Logic that branches (policies, validators, formatters) belongs in a unit that a unit test can pin down.
* Orchestration (services) is declared as plain functions over dependencies, so the dependencies can be substituted at construction.
* I/O at the leaves (controllers, jobs, helpers that touch infrastructure) is exercised by the integration and API layers, which can fake or boot the machinery.

Bound the unit layer to that shape and the rest of the suite stays cheap too — integration tests spend their time on composition, not on re-asserting what the units already proved.

## What's Next [#whats-next]

* [Integration Testing](/docs/testing/integration-testing) — when a test needs a real boot
* [Factories](/docs/data/factories) — the model-aware factory API used across layers
* [Services](/docs/core-concepts/services) — the service shape unit tests exercise
* [Policies](/docs/authorization/policies) — the policy contract unit tests pin down
* [Testing](/docs/testing) — where unit tests sit in the pyramid
