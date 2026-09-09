# Engineering 02 — Testing

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

Bun-native test stack: `bun test` runner + `@kwiva/testing` harness + Playwright e2e. Vitest is a DX reference, not a dependency.

## The pyramid

```
e2e (Playwright)            — real browser, built app
integration (bun test)      — withApp: real kernel + adapters, in-memory engines where possible
unit (bun test)             — services, policies, jobs, pure logic
type tests (tsc/expect-type)— end-to-end type inference guarantees
```

## The harness

```ts
import { withApp, createTestClient, queue, storage, factory } from '@kwiva/testing'

test('posts CRUD', withApp(async (app) => {
  const client = createTestClient(app)                 // in-process, typed

  const created = await client.posts.create({ title: 'First' })
  expect(created.data.title).toBe('First')

  const { data, total } = await client.posts.list({ where: { title: 'First' } })
  expect(total).toBe(1)
}))
```

`withApp` per-test: config + env test mode, migrations applied (SQLite in-memory), factories seeded.

## Fakes (Laravel-style)

```ts
test('welcome email on signup', withApp(async (app) => {
  queue.fake()
  storage.fake()

  const client = createTestClient(app)
  await client.auth.signUp({ email: 'a@b.dev', password: 'swordfish123' })

  expect(queue.assertPushed('send-welcome')).toBe(true)
  expect(queue.assertNotPushed('invoice-paid')).toBe(true)
}))
```

| Fake | Asserts |
|---|---|
| `queue.fake()` | pushed jobs + payloads |
| `storage.fake()` | stored paths/bytes |
| `http.fake()` | outbound client calls (stubs) |
| `broadcast.fake()` | emitted channels/events |

## Factories

```ts
const post = await factory(Post).create({ title: 'Pinned' })
const batch = await factory(Post).count(10).create({ authorId: user.id })
const user = await factory(User).make()        // unsaved instance
```

## Database traits

- Default: transaction-per-test (rolled back) — fast, isolated.
- `withApp({ db: 'fresh' })` — drop + migrate for migration-heavy tests.
- Tenant tests: `createTestClient(app, { tenant: await tenants.create() })`.

## E2E (Playwright)

```ts
// tests/e2e/posts.spec.ts
import { test, expect } from '@kwiva/testing/playwright'

test('publish a post', async ({ page }) => {
  await page.goto('/posts')
  await page.getByRole('button', { name: 'New post' }).click()
  await page.getByLabel('Title').fill('Hello')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page.getByText('Hello')).toBeVisible()
})
```

Fixtures seed through the harness API (same factories as integration tests); runs against `kwiva dev` or `kwiva preview`.

## Type tests

```ts
import { expectTypeOf } from 'expect-type'

expectTypeOf(client.posts.list({})).resolves.toMatchTypeOf<{ data: Post[]; total: number }>()
expectTypeOf(client.users.get('x')).resolves.toMatchTypeOf<{ data: User } | { error: ApiError }>()
```

Guard the end-to-end inference (model → route → client) in CI — `test/types`.

## Commands

```bash
kwiva test                      # unit + integration
kwiva test --e2e                # + Playwright
kwiva test --watch posts        # watch filter
kwiva test --coverage           # bun test coverage (CI thresholds)
```

## CI shape

```
lint+format (oxc) → typecheck (tsc) → type tests → unit+integration (bun test, SQLite) →
build (rolldown+Nitro, 2 presets: node_server + cloudflare_worker) → smoke tests → e2e (Playwright)
```

## Philosophy

- The framework is testable by construction: every surface has an in-process entry (test client, fake queue/storage/broadcast, harness kernel).
- Apps should reach high coverage on services/policies/jobs with fast tests; e2e covers the critical paths only.
