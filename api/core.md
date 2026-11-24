# @kwiva/core (/api/core)



`@kwiva/core` is the foundation package every Kwiva application imports. It provides the application kernel (`defineApp`), the typed request context, the dependency-injection container, the `config()` and `env()` accessors, the error taxonomy with the `error()` helper, authorization policies (`definePolicy`), and the two composition primitives for reusable capability packages (`defineModule` and `definePlugin`).

## Exports [#exports]

| Export         | Purpose                                                  | Stability    |
| -------------- | -------------------------------------------------------- | ------------ |
| `defineApp`    | Compose the application kernel                           | Stable       |
| `config()`     | Read typed configuration from any module                 | Stable       |
| `env()`        | Read typed, declared environment variables               | Stable       |
| `resolve()`    | Resolve typed services and singletons from the container | Stable       |
| `error()`      | Construct a typed error from the 8-code taxonomy         | Stable       |
| `definePolicy` | Authorize a resource namespace                           | Stable       |
| `defineGate`   | One-off reusable ability check                           | Stable       |
| `defineModule` | Package-level composition for reusable capabilities      | Experimental |
| `definePlugin` | Framework-level capability extension                     | Stable       |

## `defineApp` [#defineapp]

`defineApp` is the application kernel. It lives in `src/bootstrap/app.ts` and wires together your config, models, controllers, middleware, services, and modules into one runnable application.

```ts title="defineapp.ts"
import { defineApp } from '@kwiva/core'
import auth from '../app/http/auth'

export default defineApp({
  auth,

  modules: [],
  middleware: ['request-id', 'session', 'tenant', 'cors', 'security-headers'],
  providers: [queueProvider, storageProvider, telemetryProvider],

  state: { startTime: Date.now() },
  decorate: { version: '1.0.0' },
  resolve: async (ctx) => ({ startTime: Date.now() }),

  macros: {
    auth: (required: boolean, { beforeHandle }) => {
      if (required) beforeHandle.push(requireAuth)
    },
    cache: (seconds: number, { afterHandle }) => afterHandle.push(setCache(seconds)),
  },
})
```

### Signature [#signature]

```ts title="signature.ts"
defineApp(options: AppOptions): App
```

`defineApp` takes a single options object and returns a configured `App` instance. The application boots from this object; nothing is registered elsewhere.

### Options [#options]

| Option       | Type                                              | Description                                                              |
| ------------ | ------------------------------------------------- | ------------------------------------------------------------------------ |
| `auth`       | `AuthDefinition`                                  | Optional `defineAuth` result mounted into the kernel                     |
| `modules`    | `Array<string \| Module>`                         | Module registry entries — first-party, npm, or local path modules        |
| `middleware` | `string[]`                                        | Ordered global middleware stack by name                                  |
| `providers`  | `Provider[]`                                      | Boot/shutdown hooks for services and engines (telemetry, queue, storage) |
| `state`      | `object`                                          | App-wide mutable store; its type is projected onto every request context |
| `decorate`   | `object`                                          | Immutable singletons added to the context (available on `ctx`)           |
| `resolve`    | `(ctx) => object \| Array<[key, (ctx) => value]>` | Per-request computed values; async derivation                            |
| `macros`     | `Record<string, Macro>`                           | Reusable route-level keys, typechecked against the macro signature       |

### App Composition [#app-composition]

The app composes by adding `defineX` files to the standard tree. There is no manual registration step for framework construct types — discovery plus config does it:

```plaintext title="app-composition.txt"
Adding src/app/models/posts.ts            → Model registered
Adding src/app/http/controllers/posts.ts  → Controller registered
Adding src/app/http/middleware/auth.ts    → Middleware available
Adding src/app/jobs/send-email.ts         → Job registered
Adding src/app/policies/posts.ts          → Policy registered
```

### Boot Lifecycle [#boot-lifecycle]

When the application starts, the kernel runs in a fixed order:

1. Load configuration from `src/config/` and validate declared environment variables (fail-fast)
2. Merge module contributions (models, config, migrations)
3. Scan models, derive the model IR, and run a migrations drift check (dev warning)
4. Register routes: generated model routes, controllers, server routes, and module routes
5. Assemble the middleware stack in config order
6. Boot providers (telemetry, queue, storage, custom services)
7. Initialize engines (storage mounts, cache, task scheduler, WebSockets)
8. Listen on the deploy preset adapter

Shutdown inverts the order: providers stop, the queue drains, then engines stop.

### Return Value [#return-value]

The returned `App` is the bootable kernel. In tests, `withApp` boots the real kernel on a random port with in-memory adapters where possible, and `createTestClient(app)` speaks to it in-process — tests compose exactly like production.

## The Typed Context [#the-typed-context]

Every middleware, controller handler, guard, and page loader receives the same typed context. Its properties are inferred from your `defineX` definitions and from `defineApp`:

| Property      | Type Source                                         |
| ------------- | --------------------------------------------------- |
| `ctx.body`    | Validation schema in the route definition           |
| `ctx.params`  | URL parameter patterns                              |
| `ctx.query`   | Query validation schema                             |
| `ctx.headers` | Incoming request headers                            |
| `ctx.session` | Auth configuration and resolved session             |
| `ctx.tenant`  | Tenancy configuration and resolved tenant           |
| `ctx.store`   | Per-request store; types flow from `state`          |
| `ctx.<key>`   | Decorated fields (e.g. `ctx.client`, `ctx.version`) |
| `ctx.can()`   | Policy ability check (with or without a resource)   |
| `ctx.set`     | Response controls (`set.status`, `set.headers`)     |

### State, Decorate, Resolve [#state-decorate-resolve]

Three mechanisms extend the context from the kernel:

* **`state`** — shared mutable state across the request
* **`decorate`** — immutable additions to the context (singletons)
* **`resolve`** — per-request computed values, synchronous or async

```ts title="state-decorate-resolve.ts"
export default defineApp({
  state: { startTime: 0 },
  decorate: { client: createClient() },
  resolve: [
    ['tenant', async ({ headers }) => resolveTenant(headers)],
    ['permissions', async ({ session }) => loadPermissions(session?.user?.id)],
  ],
})
```

Handlers then see fully typed fields:

```ts title="state-decorate-resolve-2.ts"
defineController('posts', (c) => ({
  create: c.post('/', async (ctx) => {
    const post = await Post.create({
      ...ctx.body,
      authorId: ctx.session.user.id,
      tenantId: ctx.tenant.id,
    })
    return post
  }),
}))
```

### Macros [#macros]

Macros are reusable route-level keys declared once on the kernel and consumed per route with full typechecking against their signature:

```ts title="macros.ts"
export default defineApp({
  macros: {
    auth: (required: boolean, { beforeHandle }) => {
      if (required) beforeHandle.push(requireAuth)
    },
    rateLimit: (opts: { max: number; per: number }, route) => {
      route.setRule('rateLimit', opts)
    },
  },
})
```

```ts title="macros-2.ts"
defineController('posts', (c) => ({
  show: c.get('/:id', handler, { auth: true, rateLimit: { max: 100, per: 60 } }),
}))
```

## `config()` [#config]

All application configuration lives in the config folder and is read through a single typed accessor. The key is a dotted path into the merged configuration; the value type is inferred from the module's `defaults` and schema — there is no `any` config.

```ts title="config.ts"
import { config } from '@kwiva/core'

const url = config('database.url')
const maxConnections = config('database.pool.max')
const environment = config('app.env')
```

### Signature [#signature-1]

```ts title="signature-2.ts"
config<T extends ConfigKey>(key: T): ConfigValue<T>
```

Every key you can pass is statically known from the config folder plus module contributions. Types flow from each `defineConfig` module's `defaults` and `env` declarations.

## `env()` [#env]

Environment variables are declared exactly once — in the `env` map of a `src/config/*.ts` module. That declaration is the source for typing, boot validation, and `.env.example` generation. Read them through `env()`:

```ts title="env.ts"
import { env } from '@kwiva/core'

const dbUrl = env('DATABASE_URL')
```

### Signature [#signature-2]

```ts title="signature-3.ts"
env<K extends DeclaredEnvKey>(key: K): string
```

Reads of undeclared variables fail at compile time (ambient types) and at boot (validation). `kwiva dev`, `kwiva build`, and server start validate declared environment variables and fail fast with a table of missing ones. See the [config reference](/api/config) for the full module contract and precedence model.

## Dependency Injection [#dependency-injection]

The container is the process-wide home for typed services and singletons. Service objects are created with `defineService` from `@kwiva/services` and resolved anywhere in the application through `resolve()`:

```ts title="dependency-injection.ts"
import { resolve } from '@kwiva/core'
import EmailService from '../app/services/email'

const email = resolve(EmailService)
await email.sendWelcome(user)
```

`resolve()` takes the typed `defineService` result (the default export of a service file) and returns the same typed object from the container. Values added through `defineApp({ decorate })` resolve the same way and carry their declared types.

## Error Taxonomy [#error-taxonomy]

Kwiva uses a typed, closed 8-code taxonomy. Every code maps to one HTTP status and every thrown error carries a stable `code` the client can switch on.

| Code                | HTTP Status | Meaning                                        | Raised by              |
| ------------------- | ----------- | ---------------------------------------------- | ---------------------- |
| `BAD_REQUEST`       | 400         | Malformed input that isn't schema-validatable  | Framework              |
| `UNAUTHORIZED`      | 401         | No session or invalid credentials              | Auth, guards           |
| `FORBIDDEN`         | 403         | Policy denial                                  | Policies, `permission` |
| `NOT_FOUND`         | 404         | Missing resource or route                      | `findOrFail`, router   |
| `CONFLICT`          | 409         | Uniqueness or optimistic-concurrency violation | Model layer            |
| `UNPROCESSABLE`     | 422         | Schema validation failure                      | Validation stage       |
| `TOO_MANY_REQUESTS` | 429         | Rate limit tripped                             | Rate-limit middleware  |
| `INTERNAL`          | 500         | Unhandled error                                | Catch-all              |

Custom codes can be registered in `src/config/app.ts` with a status mapping — extend the taxonomy, never bypass it. Unknown errors map to `INTERNAL` in production (details hidden) with the full stack shown in development.

## `error()` [#error]

`error()` constructs a typed error from the taxonomy. Throw it, or return it from lifecycle stages to short-circuit the pipeline.

```ts title="error.ts"
import { error } from '@kwiva/core'

defineController('posts', (c) => ({
  show: c.get('/:id', async ({ params }) => {
    const post = await Post.find(params.id)
    if (!post) {
      throw error('NOT_FOUND', { message: 'Post not found' })
    }
    return post
  }),

  update: c.patch('/:id', async ({ params, body, session }) => {
    const post = await Post.find(params.id)
    if (!post) return error('NOT_FOUND', { message: 'Post not found' })
    if (post.authorId !== session.user.id) {
      return error('FORBIDDEN', { message: 'Not your post' })
    }
    return post.update(body)
  }),
}))
```

### Signature [#signature-3]

```ts title="signature-4.ts"
error(code: ErrorCode, details?: { message?: string; issues?: Issue[] }): AppError
```

Errors serialize to a JSON response the typed RPC client understands as a discriminated union on `code`:

```json title="signature-2.json"
{
  "code": "NOT_FOUND",
  "message": "Post not found",
  "requestId": "req_abc123"
}
```

Validation failures include field-level detail:

```json title="signature-3.json"
{
  "code": "UNPROCESSABLE",
  "message": "Validation failed",
  "errors": {
    "title": "Title is required"
  }
}
```

Every error response carries `requestId`, which matches the `x-request-id` header, so client reports and server logs correlate.

## `definePolicy` [#definepolicy]

Policies authorize a resource namespace. One file per namespace, registered by convention from `src/app/policies/*.ts`:

```ts title="definepolicy.ts"
import { definePolicy } from '@kwiva/core'

export default definePolicy('posts', (user, ability, resource) => {
  if (user.role === 'admin') return true
  switch (ability) {
    case 'read': return true
    case 'create': return user.id != null
    case 'update':
    case 'delete': return resource ? resource.authorId === user.id : false
    case 'publish': return user.role === 'editor'
    default: return false
  }
})
```

### Signature [#signature-4]

```ts title="signature-5.ts"
definePolicy(namespace: string, handler: PolicyHandler): Policy

type PolicyHandler = (
  user: User,
  ability: string,
  resource?: unknown,
) => boolean | Promise<boolean>
```

### Checking Abilities [#checking-abilities]

Abilities are named `{namespace}.{action}` where `action` is one of `read | create | update | delete` plus any custom action (`publish`, `archive`) registered by controller definitions.

```ts title="checking-abilities.ts"
ctx.can('posts.publish')
ctx.can('posts.update', post)
await authorize('posts.update', post)
```

`authorize()` throws a `FORBIDDEN` error on denial. Policies are pure logic with no HTTP concerns — they run identically in routes, Studio screens, channel subscriptions, seeders, tasks, and MCP tools. The `permission` model option points every generated route at its policy namespace, checked in the `onBeforeHandle` lifecycle stage.

### `defineGate` [#definegate]

Gates are single-purpose, reusable ability checks:

```ts title="definegate.ts"
import { defineGate } from '@kwiva/core'

export const onlyEditors = defineGate((user) => user.role === 'editor')
export const tenantOwner = defineGate((user, tenant) => tenant.ownerId === user.id)
```

Gates compose onto routes and pages with a `gate:` key.

## `defineModule` [#definemodule]

Modules are package-level capability bundles — models, controllers, pages, jobs, events, policies, config, and migrations that drop into any Kwiva application. Every contribution point is optional:

```ts title="definemodule.ts"
import { defineModule } from '@kwiva/core'

export default defineModule({
  name: '@acme/chat',
  version: '1.2.0',

  models: () => import.meta.glob('./models/*.ts'),
  controllers: () => import.meta.glob('./controllers/*.ts'),
  middleware: () => import.meta.glob('./middleware/*.ts'),
  pages: () => import.meta.glob('./pages/**/*.tsx'),
  jobs: () => import.meta.glob('./jobs/*.ts'),
  events: () => import.meta.glob('./events/*.ts'),
  tasks: () => import.meta.glob('./tasks/*.ts'),
  policies: () => import.meta.glob('./policies/*.ts'),
  migrations: './migrations',
  config: { chat: { maxMessageLength: 2000 } },

  boot: async ({ config, models, providers }) => {},
  shutdown: async () => {},
  requires: { '@kwiva/core': '^1', '@kwiva/auth': '^1' },
})
```

### Signature [#signature-5]

```ts title="signature-6.ts"
defineModule(options: ModuleOptions): Module
```

### Options [#options-1]

| Option                      | Type                     | Description                                        |
| --------------------------- | ------------------------ | -------------------------------------------------- |
| `name`                      | `string`                 | Package name (`@scope/name`), used for namespacing |
| `version`                   | `string`                 | Semantic version of the module                     |
| `models` / `controllers`    | `() => ImportGlob`       | Contribution globs, all optional                   |
| `middleware`                | `() => ImportGlob`       | Middleware contributions                           |
| `pages`                     | `() => ImportGlob`       | UI page contributions                              |
| `jobs` / `events` / `tasks` | `() => ImportGlob`       | Background work contributions                      |
| `policies`                  | `() => ImportGlob`       | Policy contributions                               |
| `migrations`                | `string`                 | Migration folder, applied with app migrations      |
| `config`                    | `object`                 | Namespaced default configuration                   |
| `channels`                  | `object`                 | Realtime channel definitions with policies         |
| `boot`                      | `(ctx) => void`          | Module lifecycle boot hook                         |
| `shutdown`                  | `() => void`             | Module lifecycle shutdown hook                     |
| `requires`                  | `Record<string, string>` | Peer compatibility ranges                          |

Modules register in `kwiva.config.ts` and their contributions merge into the app scan — models, controllers, and pages appear as if local, namespaced by module scope:

```ts title="options.ts"
import { defineConfig } from '@kwiva/config'

export default defineConfig({
  modules: ['@kwiva/auth-kit', '@acme/chat', './modules/billing'],
})
```

## `definePlugin` [#defineplugin]

Plugins extend the framework itself. They are consumed by modules and addons rather than imported directly by application code:

```ts title="defineplugin.ts"
import { definePlugin } from '@kwiva/core'

export const openapi = definePlugin('openapi', (app) => {
  app.decorate('openapi', () => renderSpec(app.manifest))
})
```

### Signature [#signature-6]

```ts title="signature-7.ts"
definePlugin(name: string, install: (app: App) => void | App): Plugin
```

The install callback receives the kernel and can decorate context, register middleware, and read the route manifest. First-party plugins include `openapi`, `studio`, `mcp`, `telemetry`, `cors`, `rate-limit`, and `static`.

## What to Read Next [#what-to-read-next]

* [Applications](/docs/core-concepts/applications) — The kernel in practice
* [Context](/docs/core-concepts/context) — State, decorate, and resolve
* [Error Handling](/docs/core-concepts/error-handling) — Taxonomy and client typing
* [Services](/docs/core-concepts/services) — `defineService` and typed injection
* [Config Reference](/api/config) — The config folder, precedence, and `env()`
* [Defining Modules](/docs/modules-plugins/defining-modules) — Package-level composition
* [Addons & Distribution](/docs/modules-plugins/addons) — Installing capability packages
