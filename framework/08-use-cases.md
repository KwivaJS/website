# 08 — Use Cases

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

End-to-end scenarios, **simple → complex**. Each shows what you build, the code you write, and which catalog features it exercises (section numbers refer to [07-feature-catalog.md](07-feature-catalog.md)). All code is app-level: `defineX` + `@kwiva/*` only.

---

## UC-1: Static marketing + blog site

**Complexity**: minimal. **Mode**: `static`. **Features**: §1, §6, §7, §16(no), §22.

```bash
kwiva new acme-site --mode=static
kwiva make:page home
kwiva make:page blog.$slug
```

Content as data — a read-only model, no server deployed:

```ts
// src/app/models/posts.ts
import { defineModel } from '@kwiva/data'

export default defineModel('posts', (f) => ({
  slug: f.string().unique(),
  title: f.string(),
  body: f.text(),
  publishedAt: f.date(),
}), { timestamps: true, permission: 'posts' })
```

```tsx
// src/ui/pages/blog.$slug.tsx
import { definePage } from '@kwiva/react'

export default definePage({
  loader: async ({ params, client }) => ({ post: await client.posts.list({ where: { slug: params.slug }, limit: 1 }).then(r => r.data[0]) }),
  head: ({ loaderData }) => ({ title: loaderData.post.title }),
  component: ({ loaderData: { post } }) => (
    <article>
      <h1>{post.title}</h1>
      <time>{post.publishedAt.toISOString().slice(0, 10)}</time>
      <div>{post.body}</div>
    </article>
  ),
})
```

`kwiva build` → prerendered HTML in `.output/public` (route rules `static`). Deploy to any static host. No DB server required at runtime (SQLite build-time content or seed from markdown).

---

## UC-2: Todo app (classic CRUD)

**Complexity**: low. **Mode**: `fullstack`. **Features**: §2, §3, §4, §6, §8, §9, §24.

One model + zero hand-written endpoints. The model derives REST routes, the typed client, and Studio screens.

```ts
// src/app/models/todos.ts
import { defineModel } from '@kwiva/data'

export default defineModel('todos', (f) => ({
  title: f.string().validation(s => s.min(1).max(120)),
  done: f.boolean().default(false),
  dueAt: f.date().optional(),
}), { timestamps: true })
```

Generated routes: `GET /api/todos`, `GET /api/todos/:id`, `POST /api/todos`, `PATCH /api/todos/:id`, `DELETE /api/todos/:id` (validation + pagination built in).

The UI is data hooks over the typed RPC client:

```tsx
// src/ui/pages/index.tsx
import { definePage, useList, useMutation, invalidate } from '@kwiva/react'
import { Todo } from '@kwiva/data'

export default definePage({
  component: function Todos() {
    const { data, isPending } = useList(Todo, { orderBy: { createdAt: 'desc' } })
    const add = useMutation(Todo.create, { onSuccess: () => invalidate(Todo) })
    return (
      <main>
        <form onSubmit={e => { e.preventDefault()
          const input = new FormData(e.currentTarget)
          add.mutate({ title: String(input.get('title')) }) }}>
          <input name="title" /> <button>Add</button>
        </form>
        <ul>{isPending ? '…' : data.map(t => (
          <li key={t.id} style={{ opacity: t.done ? 0.5 : 1 }}>{t.title}</li>
        ))}</ul>
      </main>
    )
  },
})
```

Config lives in the folder; everything already works with defaults. Test it:

```ts
// tests/todos.test.ts
import { withApp, createTestClient, Todo } from '@kwiva/testing'

test('create + list a todo', withApp(async (app) => {
  const client = createTestClient(app)
  await client.todos.create({ title: 'Ship v1' })
  const { data } = await client.todos.list()
  expect(data[0].title).toBe('Ship v1')
}))
```

---

## UC-3: SaaS dashboard (auth, RBAC, Studio)

**Complexity**: medium. **Mode**: `fullstack`. **Features**: §2, §3, §4, §5, §10, §11, §17, §9.

```ts
// src/app/http/auth.ts
import { defineAuth } from '@kwiva/auth'

export default defineAuth({
  providers: {
    password: { enabled: true },
    oauth: { google: true, github: true },
  },
  session: { strategy: 'database', expiresIn: 60 * 60 * 24 * 7 },
})
```

```ts
// src/app/models/projects.ts
import { defineModel } from '@kwiva/data'

export default defineModel('projects', (f) => ({
  name: f.string(),
  ownerId: f.uuid(),
  status: f.enum('active', 'paused').default('active'),
  owner: f.belongsTo(() => User),
}), { timestamps: true, tenantField: 'ownerId', permission: 'projects' })
```

```ts
// src/app/policies/projects.ts
import { definePolicy } from '@kwiva/core'

export default definePolicy('projects', (user, ability, resource) => {
  if (user.role === 'admin') return true
  if (ability.startsWith('read')) return true
  return resource ? resource.ownerId === user.id : true
})
```

Every generated route + Studio screen is now policy-checked. A custom controller for an aggregate endpoint:

```ts
// src/app/http/controllers/reports.ts
import { defineController, guard, error } from '@kwiva/http'

export default defineController('reports', (c) => c.guard({
  beforeHandle: ({ session }) => { if (!session.user) return error('UNAUTHORIZED') },
}, (g) => ({
  summary: g.get('/:projectId', async ({ params, session }) => {
    const project = await Project.findOrFail(params.projectId)
    if (project.ownerId !== session.user.id && session.user.role !== 'admin')
      return error('FORBIDDEN', { message: 'not your project' })
    return { tasks: await Task.query().where('projectId', project.id).count() }
  }),
})), { prefix: '/reports' })
```

Dashboard page uses the typed client + suspense:

```tsx
export default definePage({
  loader: ({ client }) => ({ projects: client.projects.list() }),
  component: ({ loaderData: { projects } }) =>
    <ProjectGrid data={projects} />,
})
```

Kwiva Studio at `/studio` — generated CRUD over all models, respecting the same policies.

---

## UC-4: Multi-tenant realtime chat

**Complexity**: high. **Mode**: `fullstack`. **Features**: §3, §11, §13, §14, §12, §15, §10, §6.

Tenant resolution by subdomain (`src/config/tenancy.ts`), scoped models, events broadcast to channels, webhooks via jobs:

```ts
// src/config/tenancy.ts
export default defineConfig('tenancy', {
  defaults: { mode: 'domain', tenantField: 'tenantId' },
})
```

```ts
// src/app/models/messages.ts
export default defineModel('messages', (f) => ({
  roomId: f.uuid().indexed(),
  authorId: f.uuid(),
  body: f.text(),
}), { tenantField: 'tenantId', timestamps: true })
```

```ts
// src/app/events/message-posted.ts
import { defineEvent } from '@kwiva/events'

export const MessagePosted = defineEvent('message.posted', (f) => ({
  roomId: f.uuid(),
  messageId: f.uuid(),
}), {
  broadcast: (e) => `chat.${e.roomId}`,   // → channel, policy-checked
  listeners: ['send-webhook'],            // queued listener
})
```

```ts
// src/app/jobs/send-webhook.ts
import { defineJob } from '@kwiva/queue'

export default defineJob('send-webhook', async ({ payload, job }) => {
  const tenant = await Tenant.find(payload.tenantId)
  await http.post(tenant.webhookUrl, payload)
  job.progress(100)
}, { attempts: 5, backoff: 'exponential', queue: 'webhooks' })
```

Controller + page:

```ts
export default defineController('chat', (c) => ({
  post: c.post('/rooms/:roomId/messages', async ({ params, body, session }) => {
    const message = await Message.create({ roomId: params.roomId, authorId: session.user.id, body: body.body })
    await MessagePosted.emit({ roomId: params.roomId, messageId: message.id })
    return message
  }, { body: { body: 'string' } }),
}), { prefix: '/chat', middleware: ['auth', 'tenant'] })
```

```tsx
// src/ui/pages/rooms.$roomId.tsx
import { definePage, useChannel, useMutation } from '@kwiva/react'

export default definePage({
  component: ({ params }) => {
    const messages = useChannel(`chat.${params.roomId}`)   // live, policy-checked
    const send = useMutation(Message.create)
    return <ChatWindow messages={messages} onSend={body => send.mutate({ roomId: params.roomId, body })} />
  },
})
```

Everything is tenant-scoped automatically: queries, cache keys, storage prefixes, queue payloads.

---

## UC-5: API-only backend for a mobile client

**Complexity**: medium. **Mode**: `api+spa` (skip UI, or pure API). **Features**: §3, §4, §9, §10, §19, §20.

```bash
kwiva new acme-api --mode=api+spa --no-ui
```

- Models + controllers exactly as above; no `src/ui`.
- OpenAPI served at `/openapi.json` for the mobile team.
- Mobile teams can consume REST directly; web/internal tools consume the typed RPC client.
- Rate limiting + API keys:

```ts
// src/app/http/middleware/api-key.ts
import { defineMiddleware, error } from '@kwiva/http'

export default defineMiddleware('api-key', async (ctx, next) => {
  const key = ctx.headers['x-api-key']
  if (!key) return error('UNAUTHORIZED')
  ctx.state.apiKey = await ApiKey.verify(key)
  return next()
})
```

```ts
// src/config/api.ts
export default defineConfig('api', {
  defaults: { prefix: '/api', rateLimit: { max: 600, per: 60 } },
})
```

---

## UC-6: Internal ops tool with MCP exposure

**Complexity**: medium. **Features**: §17, §18, §11.

Ops dashboard = Kwiva Studio over models; agents get the same powers through MCP, policy-checked:

```ts
// src/config/mcp.ts
export default defineConfig('mcp', {
  defaults: {
    enabled: true,
    transport: 'http',                    // /mcp endpoint
    models: ['invoices', 'customers'],    // tools generated from these
    readOnly: false,
  },
})
```

```json
// agent config
{ "mcpServers": { "ops": { "url": "https://ops.acme.dev/mcp", "headers": { "authorization": "Bearer ..." } } } }
```

"Look up overdue invoices for Acme and draft emails" — the agent calls `invoices.list({ where: { overdue: true } })`, `customers.get(id)`; drafting happens in the agent; sends go through the queued `send-email` job tool.

---

## UC-7: High-scale platform (edge + ISR + outbox)

**Complexity**: maximal. **Features**: §4 (route rules), §7 (ISR), §13 (outbox), §16, §19, §22, §23, [06-adapter-matrix](06-adapter-matrix.md).

- Public pages on the edge: `cloudflare_worker` preset; product pages `isr: 300` (regenerate every 5 min); pricing page `static`.
- Writes hit the API (regional), events go through the **transactional outbox** so a DB commit never loses an event.
- Hot data cached with tags; catalog invalidation = one call `invalidateTags(['catalog'])`.
- Queue workers deployed separately (`kwiva deploy --preset node_cluster` for the worker entry).
- Backups/single-binary internal tools: `kwiva build --binary` → scp one file.

```ts
// src/routes/rules.ts — server routes with Nitro-grade rules, inline config allowed
import { defineServerRoute } from '@kwiva/http'

export default defineServerRoute('/products/**', { isr: 300, cache: { tags: ['catalog'] } })
export default defineServerRoute('/pricing/**', { static: true })
```

---

## UC-8: Module ecosystem (build once, compose many apps)

**Complexity**: architectural. **Features**: §21.

Extract the chat capability from UC-4 into a reusable module:

```ts
// modules/chat/index.ts
import { defineModule } from '@kwiva/core'

export default defineModule({
  name: '@acme/chat',
  models: () => import('./models/*.ts'),
  controllers: () => import('./controllers/*.ts'),
  events: () => import('./events/*.ts'),
  config: { chat: { maxMessageLength: 2000 } },
  migrations: ['./migrations'],
})
```

```ts
// kwiva.config.ts
export default defineConfig({
  modules: ['@kwiva/auth-kit', '@acme/chat', './modules/billing'],
})
```

Any app composes the same capabilities; the module's models/controllers/events appear as if written locally (policy + tenant aware). Installing a published addon is one command:

```bash
kwiva add @acme/chat          # install + register + migrations check
kwiva addons list             # see what it contributes
```

---

## Complexity ladder (summary)

| UC | Stack depth | New concepts introduced |
|---|---|---|
| 1 | static | model, page, prerender |
| 2 | CRUD | generated REST, RPC client, data hooks, tests |
| 3 | SaaS | auth, policies, Studio, guards |
| 4 | realtime SaaS | tenancy, events, channels, jobs, broadcasting |
| 5 | API only | OpenAPI, middleware, rate limits, api keys |
| 6 | AI ops | Studio, MCP tools |
| 7 | scale | route rules, ISR, outbox, worker split, presets |
| 8 | ecosystem | modules, composition |
