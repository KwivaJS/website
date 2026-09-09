# 07 — Feature Catalog

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

The exhaustive feature outline for Kwiva. Every feature lists its `defineX`/API surface, its **parity source** (the reference or engine whose full feature set it exposes), and its **status** (v1 = MVP · v1.x = fast-follow · v2 = later). This is the contract `engineering/06-roadmap.md` phases against and the checklist QA verifies.

Parity keys: **L** = Laravel · **E** = Elysia (reference) · **N** = Nitro · **TR** = TanStack Router (reference) · **TQ** = TanStack Query (engine) · **Q** = Questpie (reference) · **B** = Bun · **oxc** = oxc.rs toolchain · **own** = Kwiva-invented.

---

## 1. Project & CLI (`kwiva`, parity L artisan + oxc)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Project scaffold | `kwiva new [name] --mode=fullstack\|api+spa\|static\|standalone\|edge` | L | v1 |
| Dev server + HMR | `kwiva dev` (Bun.serve + oxc resolver/transformer) | oxc, L | v1 |
| Type/lint/format gate | `kwiva check` (tsc + oxlint + oxfmt) | oxc | v1 |
| Tests | `kwiva test` (bun test; `--e2e` runs Playwright) | L | v1 |
| Production build | `kwiva build [--preset] [--binary]` (rolldown + Nitro) | oxc, N | v1 |
| Deploy | `kwiva deploy [provider]` | N | v1 |
| Preview built artifact | `kwiva preview` | N | v1 |
| REPL with app context | `kwiva console` | L tinker | v1 |
| Generators | `kwiva make:model\|controller\|service\|job\|event\|command\|task\|page\|policy\|module\|test` | L | v1 |
| DB lifecycle | `kwiva db:migrate\|rollback\|seed\|reset\|studio` | L | v1 |
| Queue ops | `kwiva queue:work\|listen\|failed\|retry\|clear` | L | v1 |
| Scheduler | `kwiva schedule:run\|work\|list` | L | v1 |
| Key generation | `kwiva key:generate` | L | v1 |
| Upgrade codemods | `kwiva upgrade` (oxc transformer recipes) | oxc | v1.x |
| Migrations status/diff | `kwiva db:status\|diff` | L | v1.x |
| Addons | `kwiva add <addon>` — install + register modules/plugins/themes; `kwiva addons list\|search\|info\|remove\|update\|outdated` | L (composer-style discovery) | v1.x |

## 2. Configuration (`@kwiva/config`, parity L config + own)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Config folder | `src/config/*.ts` — one module per domain | L | v1 |
| Entry file | `kwiva.config.ts` → `defineConfig({...})` | own | v1 |
| Typed config module | `defineConfig('database', { schema, defaults, env })` | L | v1 |
| Layer precedence | defaults → `src/config` → inline `defineX` options (inline wins) | own (ADR-0020) | v1 |
| Typed env access | `env('DATABASE_URL')` validated at boot | L | v1 |
| Runtime config | per-preset runtime overrides (`NITRO_API_SECRET` pattern) | N | v1 |
| Config caching | `kwiva config:cache` (merged snapshot) | L | v1.x |

```ts
// src/config/database.ts
import { defineConfig } from '@kwiva/config'

export default defineConfig('database', {
  defaults: {
    driver: 'sqlite',
    url: 'sqlite://storage/database.db',
    pool: { max: 10 },
  },
  env: {
    url: 'DATABASE_URL',
    driver: 'DB_DRIVER',
  },
})

// consume anywhere
import { config } from '@kwiva/core'
const url = config('database.url')
```

## 3. Models & Data Plane (`@kwiva/schema` + `@kwiva/data`, parity L Eloquent + Drizzle)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Model definition | `defineModel('users', (f) => ({...}), { tenantField, permission })` per file | own (ADR-0018), Q | v1 |
| Field types | `f.id(), f.string(), f.text(), f.integer(), f.float(), f.boolean(), f.timestamp(), f.date(), f.json(), f.enum(), f.uuid(), f.ulid(), f.bytes()` | own | v1 |
| Field modifiers | `.optional(), .default(v), .unique(), .indexed(), .primaryKey(), .autoincrement(), .description(), .validation(schema)` | own | v1 |
| Relations | `f.belongsTo(() => User), f.hasMany(() => Post), f.hasOne(() => Profile), f.belongsToMany(() => Role, () => userRoles)` (lazy refs, no circular imports) | L | v1 |
| Timestamps & audit | `{ timestamps: true }` → `createdAt/updatedAt`; `{ audit: true }` → `createdBy/updatedBy` from session | L | v1 |
| Soft delete | `{ softDelete: true }` → `deletedAt` + filtered queries + `withTrashed()` | L | v1 |
| Indexes & constraints | model-level `indexes: [...]`, `uniques: [...]`, `checks: [...]`, FK actions | own | v1 |
| Query builder | `User.query().where(...).orderBy(...).limit(...).select(...).join(...)` — full Drizzle surface | Drizzle | v1 |
| Aggregates | `.count(), .sum(), .avg(), .min(), .max(), .groupBy(), .having()` | Drizzle | v1 |
| Relations loading | `.with('posts.comments'), .withCount('posts')` | L | v1 |
| Transactions | `db.transaction(async (tx) => {...})`, nested savepoints | Drizzle, L | v1 |
| Raw SQL escape hatch | `db.raw('select ...')` typed result | Drizzle | v1 |
| Cursor & offset pagination | `.page(n, size), .cursor(...)` | own | v1 |
| Validation flows from field types | field DSL types are the validation source (no duplicate schemas) | Q | v1 |
| Deterministic route shape | exactly 5 generated routes per model — predictable for docs/tooling | Q | v1 |
| Collection-level permissions | `permission` option → generated routes + Studio gated by policy namespace | Q | v1 |
| Serial derivation from one IR | resolver → client → Studio → OpenAPI → MCP all generate from the single model IR (never 3 ad-hoc generators) | Q | v1 |
| Typed REST generation | 5 routes per model: `list/get/create/update/delete` (+ custom actions) | Q | v1 |
| Migrations | model diff → SQL; `kwiva db:migrate/rollback`; migration files in `src/database/migrations/` | L | v1 |
| Seeders | `src/database/seeders/*.ts` with `defineSeeder` | L | v1 |
| Factories | `User.factory().count(10).create()` model-aware | L | v1 |
| Enum/lookup models | `f.enum()` + model-level `readonly: true` (seeded lookup tables) | own | v1.x |
| Model hooks | `{ onCreating, onCreated, onUpdating, onDeleting, ... }` | L | v1 |
| Computed/derived fields | `computed: { fullName: (row) => ... }` surfaced in API/Studio | own | v1.x |
| Multi-database | named connections via `src/config/database.ts > connections` | L | v1.x |
| Read replicas | `connections: { replica: { url, role: 'read' } }` | own | v2 |
| Schema push (dev) | `kwiva db:push` — model → DB without migration files | L | v1.x |

```ts
// src/app/models/posts.ts
import { defineModel } from '@kwiva/data'

export default defineModel('posts', (f) => ({
  id: f.id(),
  title: f.string().validation((s) => s.min(1).max(200)),
  body: f.text().optional(),
  status: f.enum('draft', 'published', 'archived').default('draft').indexed(),
  authorId: f.uuid().indexed(),
  publishedAt: f.timestamp().optional(),
  author: f.belongsTo(() => User),
  comments: f.hasMany(() => Comment),
}), {
  timestamps: true,
  uniques: [['authorId', 'title']],
  permission: 'posts',
})
```

### Questpie-derived feature set (reference-only, fully reimplemented)

Questpie's entire surface — mapped to Kwiva equivalents. **Zero runtime dependency on `@questpie/*`** (no imports, no peer deps); Kwiva ships its own implementation of every idea below.

| Questpie feature | Kwiva equivalent | Status |
|---|---|---|
| one-schema declaration (single TS source) | `defineModel` files in `src/app/models/` (ADR-0018) | v1 |
| `collection().fields(f => …)` builder | `defineModel(name, (f) => ({…}), options)` factory | v1 |
| 5 typed REST routes per collection | generated `list/get/create/update/delete` per model (+ custom actions via `defineController`) | v1 |
| typed client SDK | `@kwiva/client` typed from the same IR | v1 |
| generated Studio UI | `@kwiva/studio` schema-derived screens | v1 |
| job infrastructure aligned to collections | `defineJob` + payload types from model IR | v1 |
| MCP connector | `@kwiva/mcp` from model/controller IR | v1.x |
| OpenAPI | route manifest → OpenAPI 3.1 | v1 |
| field-type-driven validation | field DSL is the validation source (Standard Schema) | v1 |
| collection-level permissions | `permission` model option + policy gating | v1 |
| Postgres prod / SQLite dev | same connector split via `src/config/database.ts` | v1 |
| Bun-first dev | Bun primary runtime (ADR-0007) | v1 |

Explicitly **not** adopted from Questpie: its bundled products (e.g. Autopilot) and its exact DSL shape — Kwiva's DSL differs where it improves conventions (per-model files, tenancy field, audit fields, function-based form, policy integration).

## 4. HTTP API Layer (`@kwiva/http`, parity E full lifecycle + N route rules)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Controller definition | `defineController('users', (c) => ({...}), { prefix, tags, permission })` | E | v1 |
| Route handlers | `c.get/post/put/patch/delete(path, handler, schema)` | E | v1 |
| Validation | body/query/params/headers/cookies schemas (Standard Schema; Valibot default) | E | v1 |
| Typed context | `ctx.body, ctx.params, ctx.query, ctx.set.status, ctx.store` — fully inferred types | E | v1 |
| Full lifecycle | `onRequest → onParse → onTransform → onBeforeHandle → onAfterHandle → onResponse → onError → onStop` (app, controller, route scoped) | E | v1 |
| Guards | `c.guard({ schema, beforeHandle }, (g) => ...)` — applies to nested routes | E | v1 |
| State / decorate / resolve | `app.state(), app.decorate(), app.resolve()` per-request derivation | E | v1 |
| Macros | `c.macro({ auth: ... })` → route-level `auth: true` keys | E | v1 |
| Groups/prefix | controllers mount under prefix; nested groups | E | v1 |
| Error helpers | `error('NOT_FOUND', { message })` → typed status mapping | E | v1 |
| WebSockets routes | `c.ws('/ws', { open, message, close })` | E, N | v1 |
| OpenAPI generation | auto from schemas + tags + summary; `/openapi.json`, Swagger UI | E | v1 |
| Rate limiting | middleware + route rules | N, L | v1 |
| CORS / security headers | middleware presets from `src/config/cors.ts` | N, E | v1 |
| Request ID + tracing | middleware (OTel spans, `x-request-id`) | own | v1 |
| Response caching | route rules: `cache`, `swr`, `isr`, `static`, `prerender` | N | v1 |
| Redirects/proxy rules | `redirect`, `proxy`, `headers` route rules | N | v1 |
| Server routes | `defineServerRoute('uploads', ...)` — infra-level routes outside controllers | N | v1 |
| File uploads | `ctx.file()` — multipart, size/type validation | E, own | v1 |
| Streaming responses | `new Response(stream)` passthrough; SSE helper | N | v1 |
| Route manifest | typed IR of all routes (feeds client + MCP + OpenAPI) | own | v1 |

```ts
// src/app/http/controllers/posts.ts
import { defineController, guard } from '@kwiva/http'

export default defineController('posts', (c) => ({
  list: c.get('/', async ({ query }) => {
    return Post.query()
      .where('status', 'published')
      .page(query.page ?? 1, 20)
  }),

  create: c.post('/', async ({ body, session }) => {
    return Post.create({ ...body, authorId: session.user.id })
  }, {
    body: { title: 'string', body: 'string?' },
    permission: 'posts.create',
  }),

  publish: c.post('/:id/publish', async ({ params }) => {
    const post = await Post.findOrFail(params.id)
    return post.update({ status: 'published', publishedAt: new Date() })
  }, {
    permission: 'posts.publish',
  }),
}), { prefix: '/posts', tags: ['posts'] })
```

## 5. Middleware (`@kwiva/http`, parity E lifecycle + L middleware)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Middleware definition | `defineMiddleware('auth', (ctx, next) => ...)` — per-file | L, E | v1 |
| Global stack | `src/config/app.ts > middleware` ordered list | L | v1 |
| Route/controller scoping | `{ middleware: ['auth', 'tenant'] }` | L | v1 |
| Short-circuit + mutate | set headers/cookies/status before handler | E | v1 |
| Lifecycle-scoped | attach at any lifecycle event (onRequest, onTransform…) | E | v1 |
| Built-ins | requestId, session, tenant, cors, rate-limit, security-headers, compression | own | v1 |

## 6. Frontend Router (`@kwiva/router` + `@kwiva/react`, parity TR)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| File-based routing | `src/ui/pages/**` → route tree; `definePage` | TR | v1 |
| Nested layouts | `__root.tsx`, folder layout files | TR | v1 |
| Typed params & search | `Route.useParams()`, `validateSearch` schemas | TR | v1 |
| Loaders | `definePage({ loader: async ({ params }) => ... })` — parallel, streamed | TR | v1 |
| beforeLoad guards | auth/permission redirects before load | TR | v1 |
| Deferred data | `await stream(await promise)` non-blocking SSR | TR | v1 |
| Pending UI | `pendingComponent` | TR | v1 |
| Error UI | `errorComponent` per route | TR | v1 |
| 404 handling | `notFoundComponent` + typed `notFound()` | TR | v1 |
| Preloading | `<Link preload="intent">`, `router.preloadRoute()` | TR | v1 |
| Scroll restoration | per-route key + custom behavior | TR | v1 |
| Typed navigation | `<Link to="/posts/$id" params>`, `useNavigate()` | TR | v1 |
| Search param state | typed, schema-validated, `Link search` | TR | v1 |
| Route context | `createRootWithContext` — session, config, client injection | TR | v1 |

```tsx
// src/ui/pages/posts.$id.tsx
import { definePage, stream, Link } from '@kwiva/react'

export default definePage({
  validateSearch: (s) => s.object({ tab: s.optional(s.string()) }),
  loader: async ({ params, client }) => {
    const post = await client.posts.get(params.id)          // typed RPC
    return { post, comments: stream(client.comments.list({ postId: params.id })) }
  },
  pendingComponent: () => <p>Loading…</p>,
  errorComponent: ({ error }) => <p>{error.message}</p>,
  component: ({ loaderData: { post, comments } }) => (
    <article>
      <h1>{post.title}</h1>
      <Suspense fallback={<p>Comments…</p>}>
        <Comments stream={comments} />
      </Suspense>
      <Link to="/posts" preload="intent">All posts</Link>
    </article>
  ),
})
```

## 7. SSR & Rendering (`@kwiva/react`, parity TR Start/N)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Streaming SSR | suspense-aware HTML streaming (ADR-0006) | TR, N | v1 |
| Hydration | island-free full hydration; Preact-compat | own | v1 |
| Loader dehydration | loader data hydrated into data hooks | TR | v1 |
| ISR / SWR / static | route rules per page path | N | v1 |
| Prerender | `kwiva build` crawl or explicit list | N | v1 |
| SPA mode | `api+spa` scaffold; client build served | own | v1 |
| Head/meta management | `definePage({ head: {...} })` | own | v1 |
| Error boundary | root + per-route error components | TR | v1 |

## 8. Data Hooks (`@kwiva/react`, parity TQ full surface)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Single resource | `useResource(Post, id)` — read/query keyed by model identity | TQ | v1 |
| List query | `useList(Post, { where, page })` | TQ | v1 |
| Mutations | `useMutation(Post.create, { input })` — optimistic + invalidate | TQ | v1 |
| Infinite lists | `useInfiniteList(Post, { cursor })` | TQ | v1 |
| Prefetch | `client.prefetch` in loaders; `prefetchQuery` | TQ | v1 |
| Stale/gc control | `{ staleTime, gcTime, refetchOnWindowFocus }` passthrough | TQ | v1 |
| Optimistic updates | first-class helper on mutations | TQ | v1 |
| Invalidation | model-scoped: `invalidate(Post)` invalidates every derived key | TQ | v1 |
| Suspense | `useResource(..., { suspense: true })` | TQ | v1 |
| Devtools | `@kwiva/react/devtools` (Query devtools skinned) | TQ | v1 |
| Custom keys | escape hatch `useApi(key, fetcher)` | TQ | v1 |

```tsx
const { data: post, isPending } = useResource(Post, id)
const { mutate, isMutating } = useMutation(Post.update, {
  optimistic: (input, current) => ({ ...current, ...input }),
})
await mutate({ title: 'New title' })   // POST /posts/:id via typed RPC + auto-invalidation
```

## 9. RPC Client (`@kwiva/client`, parity E Eden Treaty)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| End-to-end types | `client.posts.get(id)` — types flow from `defineController`/`defineModel` at type level, zero codegen | E, Q | v1 |
| Model API client | `client.users.list({ where, page })` — typed from model IR | Q | v1 |
| Custom actions | `client.posts.publish(id)` — controller actions | own | v1 |
| Error typing | typed error responses (`{ code, message }`) | E | v1 |
| Subscriptions | `client.chat.stream(channel)` — WS/SSE subscriptions | E | v1 |
| SSR-safe | dedupes on server; hydrates into data hooks | TQ | v1 |
| Auth integration | session cookies flow automatically | own | v1 |
| Mock/testing | `createTestClient(app)` — in-process call without network | own | v1 |

```ts
import { createClient } from '@kwiva/client'
export const client = createClient()          // typed against this app's controllers + models

const { data } = await client.users.list({ page: 1 })
const user = await client.users.update(id, { name: 'Ada' })
```

## 10. Auth (`@kwiva/auth`, engine: Better Auth)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Auth definition | `defineAuth({ providers, session })` in `src/app/http/auth.ts` | own | v1 |
| Email/password | + password hashing policy | BA | v1 |
| OAuth | Google/GitHub/… configurable list | BA | v1 |
| Passkeys / WebAuthn | plugin enabled by default in v1.x | BA | v1.x |
| Magic links / email | via mail integration | BA | v1.x |
| Sessions | typed `ctx.session`, `useSession()` client hook | BA | v1 |
| MFA (TOTP) | plugin | BA | v1.x |
| Organizations | orgs/members plugin → maps to tenancy | BA | v1.x |
| Admin plugin | user management, ban/impersonate | BA | v1.x |
| Route protection | `requireAuth` middleware + `beforeLoad` page guard | own | v1 |
| Hooks | `onSignUp, onSignIn, onDeleteUser` → app handlers | BA | v1 |

## 11. Authorization & Tenancy (`@kwiva/core`)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Policy definition | `definePolicy('posts', (user, ability, resource) => ...)` per file | L | v1 |
| Permission checks | `ctx.can('posts.publish')`, `useCan()` | L | v1 |
| Roles | `role` + `permission` fields on User (RBAC) | L | v1 |
| Model enforcement | `permission` option → every generated route checks policy | own | v1 |
| Tenant strategies | domain / path / header resolution (`src/config/tenancy.ts`) | own | v1 |
| Tenant scoping | `tenantField` → all queries auto-scoped (ADR-0015) | own | v1 |
| Tenant middleware | resolves tenant, injects into context + storage keys | own | v1 |
| Per-tenant config | tenant-aware config overrides | own | v1.x |

## 12. Queue & Jobs (`@kwiva/queue`, parity L queues)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Job definition | `defineJob('send-welcome', async ({ payload }) => {...}, { queue, schema })` | L | v1 |
| Dispatch | `SendWelcome.dispatch({ userId })` / `queue.dispatch(SendWelcome, payload)` | L | v1 |
| Chaining | `queue.chain([A, B, C]).dispatch()` | L | v1.x |
| Batching | `queue.batch([...]).then(callback)` | L | v1.x |
| Retries + backoff | `{ attempts, backoff: 'exponential' }` | L, BullMQ | v1 |
| Delayed | `.delay(60)` seconds or DateTime | L | v1 |
| Priority | `{ priority: 10 }` | BullMQ | v1 |
| Rate limiting | per-job `{ rateLimit: { max, per } }` | BullMQ | v1.x |
| Dead letter queue | failed jobs → `failed_jobs` table + `kwiva queue:retry` | L | v1 |
| Idempotency | `{ idempotencyKey }` dedupe | own | v1 |
| Concurrency control | worker `{ concurrency }` | BullMQ | v1 |
| Progress | `job.progress(50)` | BullMQ | v1 |
| Queued listeners | events handled async via queue | L | v1 |
| Model-aligned job infra | jobs reference models/payloads typed from model IR | Q | v1 |
| Scheduler integration | `defineJob` + cron in `src/config/schedule.ts` | L | v1 |

## 13. Events & Listeners (`@kwiva/events`, parity L events)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Event definition | `defineEvent('user.signed-up', (f) => ({ userId: f.uuid() }))` | L | v1 |
| Listeners | `UserSignedUp.on(async (event) => ...)` queued or sync | L | v1 |
| Broadcasting | `UserSignedUp.broadcast('user.{id}')` → realtime channel | L | v1 |
| Transactional outbox | events emitted in transactions are delivered post-commit | own | v1.x |
| Wildcards | `on('user.*')` | L | v1.x |

## 14. Realtime (`@kwiva/http` channels, engine: CrossWS via Nitro)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Channels API | `channel('chat.{roomId}').on('message', ...)` | L broadcasting, E ws | v1 |
| Auth for channels | policy-checked subscribe | own | v1 |
| Presence | join/leave tracking | own | v1.x |
| Client subscription | `useChannel('chat.42')` hook | own | v1 |
| SSE fallback | `client.stream` over SSE when WS unavailable | own | v1.x |
| Model events → broadcast | `Post.onCreated → broadcast('posts')` | L | v1 |

## 15. Cache, Sessions, Storage (engine: unstorage via Nitro)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Cache API | `cache.get/set/wrap/invalidate` with TTL + tags | N | v1 |
| Cache backends | memory, redis, kv via `src/config/cache.ts` mounts | N | v1 |
| Tag invalidation | `invalidateTags(['posts'])` | N | v1 |
| Sessions store | pluggable backend (cookie/redis/db) | L, N | v1 |
| File storage | `storage.put/get/url/delete` with drivers (local, s3-compatible via Bun) | L, B | v1 |
| Signed URLs | `storage.signedUrl(path, { expiresIn })` | own | v1 |
| Public disk | `public/` static serving + uploads config | L | v1 |

## 16. Schedule & Tasks (`defineTask`, parity N tasks + L scheduler)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Task definition | `defineTask('cleanup-expired', async ({ payload }) => ...)` | N | v1 |
| Scheduled tasks | cron expressions in `src/config/schedule.ts` | L, N | v1 |
| Scheduler controls | `withoutOverlapping, onOneServer, timezone, runAt` | L | v1 |
| Manual run | `kwiva task:run cleanup-expired --payload={...}` | N | v1 |
| Task API routes | auto-exposed with secret for external cron triggers | N | v1 |

## 17. Kwiva Studio (`@kwiva/studio`)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Generated CRUD | from every model: list/filter/create/edit/delete screens | Q, own | v1 |
| Schema-derived screens | Studio derives columns/filters/forms from the model IR — no Studio-side duplication | Q | v1 |
| Policy-aware | respects `definePolicy` + `permission` | own | v1 |
| Search + filters | full-text + field filters, pagination | own | v1 |
| Bulk actions | delete/update selected | own | v1.x |
| Relations editors | pick/create related rows | own | v1.x |
| Audit trail | `{ audit: true }` models show change history | own | v1.x |
| Customization | override screens per model; extend with ui-kit | own | v1 |

## 18. AI / MCP (`@kwiva/mcp`)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| MCP server | auto-generated tools from models (list/get/create/update/delete) | Q, own | v1.x |
| Model→agent exposure | one config: models become agent-callable tools | Q | v1.x |
| Custom tools | controller actions exposed as MCP tools | own | v1.x |
| Policy enforcement | MCP tools run through policies; per-tool permissions | own | v1.x |
| Transport | stdio + streamable HTTP | own | v1.x |

## 19. Observability (`engineering/03`, engine: OTel)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Request tracing | OTel spans: request → middleware → handler → query | N, E | v1 |
| Model query spans | every query builder call traced | own | v1 |
| Structured logs | `logger` with request/tenant correlation | own | v1 |
| Metrics | OTel metrics: queue depth, cache hit rate, request latency | own | v1.x |
| Server timing | `server-timing` header in dev | E | v1.x |
| Health endpoint | `/healthz` liveness + readiness | N | v1 |

## 20. Security (`engineering/04`)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Typed input validation | everywhere (models, controllers, jobs, channels) | E | v1 |
| Security headers + CSP | defaults + per-route override | N | v1 |
| CSRF | session-based protection | L | v1 |
| Rate limiting | middleware + route rules | N, L | v1 |
| Secrets | typed env, `kwiva key:generate`, no secrets in client bundles | own | v1 |
| Lint gates | `no-engine-imports`, `no-raw-fetch-in-loaders` (oxlint) | own | v1 |
| Dependency audit | `kwiva check --audit` | oxc/Bun | v1.x |

## 21. Modules & Composition (`platform/06-07`)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Module definition | `defineModule({ models, controllers, pages, config, migrations })` | own (ADR-0010) | v1.x |
| Module registry | `kwiva.config.ts > modules` — first-party + local + npm modules | L | v1.x |
| Addon registry | `kwiva add` / `kwiva addons` CLI — install/search/info/update/remove; npm keyword conventions + curated index at kwiva.js.org | L (package discovery) | v1.x |
| App composition | `defineApp({ modules, middleware, providers })` in bootstrap | own | v1 |

## 22. Toolchain (oxc deep integration, ADR-0021)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Dev server | Bun.serve + oxc resolver/transformer; native ESM; TS on the fly | oxc, B | v1 |
| HMR | framework-aware (pages, controllers, models hot-swap) | oxc, own | v1 |
| Client build | rolldown (code splitting, tree shaking) | oxc | v1 |
| Server build | rolldown + Nitro output | oxc, N | v1 |
| Minify | oxc minifier | oxc | v1 |
| Lint | oxlint incl. Kwiva convention gates | oxc | v1 |
| Format | oxfmt | oxc | v1 |
| Typecheck | tsc/tsgo; isolated declarations for package d.ts | TS, oxc | v1 |
| Codemods | oxc transformer recipes for `kwiva upgrade` | oxc | v1.x |
| Single binary | `bun build --compile` (`kwiva build --binary`) | B | v1 |

## 23. Runtime (Bun, ADR-0007)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Native TS dev | zero-transpile dev execution | B | v1 |
| Cluster / reuse port | `kwiva dev --cluster`, prod SO_REUSEPORT | B | v1.x |
| Bun.sql / Redis / S3 | internal fast paths (DB driver, cache/storage backends) | B | v1 |
| `bun test` | test runner powering `@kwiva/testing` | B | v1 |
| Compile to binary | standalone mode artifact | B | v1 |
| Node compatibility | web-standard code; node preset output | N | v1 |

## 24. Testing (`@kwiva/testing`, `engineering/02`)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| App harness | `withApp(async (app) => ...)` boots real app on random port | L | v1 |
| In-process client | `createTestClient(app)` — typed RPC without network | own | v1 |
| Database traits | migrate/seed/transaction-per-test | L | v1 |
| Queue fake | `queue.fake()` assert dispatched jobs (Laravel-style fakes) | L | v1 |
| Storage fake | `storage.fake()` in-memory FS | L | v1 |
| HTTP fake | stub outbound `client` calls | own | v1 |
| Factories in tests | `User.factory().create()` | L | v1 |
| E2E | Playwright projects, per-mode | own | v1 |
| Coverage | bun test coverage, thresholds in CI | B | v1 |

## 25. Mail & Notifications (v1.x, parity L)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Mailer | `mail.send(template, { to, subject })` drivers (smtp, resend, ses) | L | v1.x |
| Templates | React email templates in `src/app/mail/` | own | v1.x |
| Notifications | `User.notify(new WelcomeMail())` via channels (mail, broadcast, webhook) | L | v1.x |
| Scheduled digests | queued notification batches | L | v2 |

## 26. Internationalization (v1.x)

| Feature | Surface | Parity | Status |
|---|---|---|---|
| Messages | `src/lang/*.ts` typed catalogs | L | v1.x |
| i18n hook | `useT()` + route-based locale | own | v1.x |
| Model localization | localized fields via `f.localized()` | own | v2 |

---

## Cross-cutting guarantees (verifiable)

1. **No engine leakage**: app code contains zero imports of `elysia`, `nitropack`, `drizzle-orm`, `better-auth`, `@tanstack/*`, `vite`, `viteplus` — enforced by oxlint gate `no-engine-imports`.
2. **defineX coverage**: every app-facing file type has exactly one factory (`bootstrap/app.ts` → `defineApp`; `src/config` → `defineConfig`; `src/app/models` → `defineModel`; `src/app/http/controllers` → `defineController`; `src/app/http/middleware` → `defineMiddleware`; `src/app/services` → `defineService`; `src/app/jobs` → `defineJob`; `src/app/events` → `defineEvent`; `src/app/console` → `defineCommand`; `src/app/tasks` → `defineTask`; `src/app/policies` → `definePolicy`; `src/app/http/auth.ts` → `defineAuth`; `src/ui/pages` → `definePage`).
3. **Feature parity**: sections 1–24 above enumerate the parity source per feature; gaps between catalog and reference docs are tracked as risks (`engineering/07`).
4. **Type end-to-end**: model → API → client → page loaders → hooks — one type universe, verified by the validation spike (roadmap phase 1).
