# API Testing (/docs/testing/api-testing)



API tests sit between integration and E2E: they exercise the real request path — middleware, validation, policies, tenant scoping, generated routes, and custom controllers — through a typed client that never touches a socket. This is the layer where you prove the contract your frontend and third parties depend on.

## The In-Process Client [#the-in-process-client]

API tests are built on `createTestClient(app)`:

```ts title="the-in-process-client.ts"
import { withApp, createTestClient } from '@kwiva/testing'

test('creates and lists a post', withApp(async (app) => {
  const client = createTestClient(app)

  const created = await client.posts.create({ title: 'First' })
  expect(created.data.title).toBe('First')

  const { data, total } = await client.posts.list({ where: { title: 'First' } })
  expect(total).toBe(1)
}))
```

Three properties make the test client the right tool for API assertions:

1. **In-process** — the call goes straight into the application; no server port, no network, no serialization round trip
2. **Typed** — request arguments and response shapes are inferred from the controller and model definitions, so the test fails the typecheck, not just the assertion, when the API changes
3. **Real** — every middleware and policy in the request path runs, because it is the actual application handling the call

## Endpoint Contracts [#endpoint-contracts]

The generated surface and the authored surface are both under test. A generated model route — `client.posts.list` or `client.posts.create` — is a route the IR derived from the model definition; a custom controller action — `client.posts.archive` — is a route you wrote. API tests pin both, because both are consumed identically by the frontend and by third parties.

```ts title="endpoint-contracts.ts"
test('custom action matches its contract', withApp(async (app) => {
  const client = createTestClient(app)
  const post = await client.posts.create({ title: 'Draft' })

  const archived = await client.posts.archive(post.data.id)
  expect(archived.data.status).toBe('archived')
}))
```

Because the client is built from the same IR as the shipped client, an API test is simultaneously a test of the client contract. If it type-checks here, it type-checks for consumers.

## Asserting Responses [#asserting-responses]

The client mirrors the production RPC surface. List responses carry both `data` and `total`:

```ts title="asserting-responses.ts"
const { data, total } = await client.posts.list({ page: 1 })
expect(total).toBe(3)
expect(data).toHaveLength(3)
```

Typed reads and writes follow the same shape, and the full builder surface is available through the client — where clauses, pagination, relation loading, and custom controller actions:

```ts title="asserting-responses-2.ts"
const archived = await client.posts.archive(postId)
expect(archived.data.status).toBe('archived')
```

## Asserting Errors [#asserting-errors]

Errors flow back typed — `{ code, message }` — and assertions target the contract:

```ts title="asserting-errors.ts"
test('returns a typed not-found error', withApp(async (app) => {
  const client = createTestClient(app)

  const missing = await client.posts.get('does-not-exist')
  expect(missing.error.code).toBe('NOT_FOUND')
}))
```

Status mapping follows the framework error helpers, so `error('NOT_FOUND', { message })` surfaces through the client as a typed error with the expected status. Validation failures return field-mapped errors, and the test can assert which field failed and why:

```ts title="asserting-errors-2.ts"
const bad = await client.posts.create({ title: '' })
expect(bad.error.code).toBe('VALIDATION_ERROR')
```

The error taxonomy is a contract in its own right, shared across generated routes, controllers, and the client. The codes your app uses surface through `{ code, message }` on both the production and the test client, so an API test can assert the exact code a client branch will switch on:

| Case             | Code your test should see |
| ---------------- | ------------------------- |
| Missing resource | `NOT_FOUND`               |
| Malformed input  | `VALIDATION_ERROR`        |
| Policy denial    | `FORBIDDEN`               |
| Unauthenticated  | `UNAUTHORIZED`            |

The discipline to keep: assert on the error contract, not just that something threw. The typed union — success data or `{ error }` — makes the both-branches style natural and exhaustive.

## Permissions and Tenant Behavior [#permissions-and-tenant-behavior]

Because policies and tenant scoping run on every request, API tests are the definitive place to pin them down:

```ts title="permissions-and-tenant-behavior.ts"
test('a writer cannot publish a post', withApp(async (app) => {
  const writer = await client.auth.signUp({ email: 'writer@dev.test', password: 'swordfish123' })
  const post = await client.posts.create({ title: 'Draft' })

  // post belongs to the writer's user, so publish is denied for this role
  const denied = await client.posts.publish(post.data.id)
  expect(denied.error.code).toBe('FORBIDDEN')
}))
```

Tenant behavior asserts the scoping invariant directly:

```ts title="permissions-and-tenant-behavior-2.ts"
withApp(async (app) => {
  const acme = app.asTenant('acme')
  const globex = app.asTenant('globex')
  const acmeClient = createTestClient(app, { tenant: acme })

  const project = await acmeClient.projects.create({ name: 'Acme' })

  const globexClient = createTestClient(app, { tenant: globex })
  const foreign = await globexClient.projects.get(project.data.id)
  expect(foreign.error.code).toBe('NOT_FOUND')   // indistinguishable from missing
})
```

The cross-tenant read returns the same code as a genuinely missing row — testing that both branches produce the same shape is exactly how you guard against the existence leak. See [Tenant Isolation](/docs/tenancy/isolation).

## Auth State [#auth-state]

Authentication runs through the real auth surface. Tests establish state the way a user would — through `client.auth.signUp` — or carry a prepared identity where the flow under test assumes a signed-in actor.

```ts title="auth-state.ts"
test('session flows through the typed client', withApp(async (app) => {
  const client = createTestClient(app)
  const user = await client.auth.signUp({ email: 'a@b.dev', password: 'swordfish123' })

  const me = await client.users.get('me')
  expect(me.data.email).toBe('a@b.dev')
}))
```

Because sessions are handled by the client automatically, an API test that signs up a user then calls authed routes exercises the full session path — the same path the production client uses.

## Middleware Behavior [#middleware-behavior]

Because the real middleware stack runs in API tests, the cross-cutting surfaces are assertable through the client:

* Request correlation — an `x-request-id` assigned and propagated through handler log lines
* Headers — `security-headers` defaults, per-route overrides, CORS behavior against the resolved origin
* Rate limiting — a route that exceeds its configured limit for the test actor returns the expected rejection

These are contract assertions for clients that consume the same responses, and they are deterministic in a way browser-side header checks are not.

## When to Use API Tests [#when-to-use-api-tests]

Reach for API tests when the subject is the request surface itself:

* Route shapes and response contracts — every generated and custom route
* Middleware behavior — auth, tenant, rate limiting, headers
* Policy enforcement per route and role
* Validation and typed error responses
* Tenant scoping invariants
* Auth flows and session handling

Prefer them over E2E for these cases; they are in-process, fast, typed, and deterministic in a way browser tests are not. Keep E2E for the flows that genuinely need a real browser.

## What's Next [#whats-next]

* [Integration Testing](/docs/testing/integration-testing) — the harness and client foundations
* [Policies](/docs/authorization/policies) — the abilities API tests assert
* [RPC Client](/docs/frontend/rpc-client) — the client shape API tests mirror
* [Multi-Tenancy](/docs/tenancy) — scoping invariants exercised per request
* [Controllers](/docs/http/controllers) — custom actions and errors under test
