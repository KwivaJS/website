# @kwiva/http (/api/http)



# @kwiva/http [#kwivahttp]

HTTP package: controller factory, contracts, middleware, server, pipeline, SSE, WebSockets, OpenAPI.

## Controller [#controller]

```ts title="src/app/http/controllers/posts.ts"
import { defineController } from "@kwiva/http";

export const PostsController = defineController({
  prefix: "/api/posts",
  permission: "posts",
  routes(api) {
    api.get("/", () => ({ items: [] }));
    api.post("/", (ctx) => ctx.input.body);
  },
});
```

### Route builder (`api`) [#route-builder-api]

| Method                                                         | Purpose                   |
| -------------------------------------------------------------- | ------------------------- |
| `api.get(path, handler)` / `post` / `put` / `patch` / `delete` | handlers with typed `ctx` |
| `api.ws(path, options, macros?)`                               | WebSocket route           |
| `api.guard(options, setup)`                                    | scoped guard              |
| `api.group(options, setup)`                                    | scoped group              |

### `RouteDefinition` (per route) [#routedefinition-per-route]

| Field                                                                       | Type                                                                |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `input`                                                                     | `{params?, query?, body?, headers?, cookie?, authorize?, prepare?}` |
| `output`                                                                    | `{schema?, status?, transform?}`                                    |
| `contract`                                                                  | `defineContract`                                                    |
| `middleware`                                                                | `Middleware[]` (refs by name)                                       |
| `bind`                                                                      | `{from, as, list?}` (resolvers)                                     |
| `handler`                                                                   | `(ctx: HttpContext) => unknown`                                     |
| `macros`, `name`, `tags`, `summary`, `description`, `deprecated`, `openAPI` | —                                                                   |

### Handlers — `HttpContext` [#handlers--httpcontext]

| Member                                                                                      | Notes                                  |
| ------------------------------------------------------------------------------------------- | -------------------------------------- |
| `ctx.input`                                                                                 | destructured (`{params, query, body}`) |
| `ctx.headers()`, `ctx.setHeaders()`                                                         | headers                                |
| `ctx.json()`, `ctx.text()`, `ctx.noContent()`, `ctx.redirect(url, status?)`, `ctx.stream()` | responses                              |
| `ctx.waitUntil(promise)`                                                                    | —                                      |
| `ctx.session`, `ctx.user`, `ctx.can`                                                        | auth context                           |
| `ctx.bound(key)`                                                                            | resolver binding                       |

## Contract [#contract]

```ts title="src/app/http/contracts/post.ts"
import { defineContract } from "@kwiva/http";

export const CreatePostContract = defineContract({
  request: { body: PostBody },
  response: { schema: PostOutput, status: 201 },
});
```

## Middleware [#middleware]

| Factory                  | Purpose                                                                          |
| ------------------------ | -------------------------------------------------------------------------------- |
| `defineMiddleware(step)` | → `Middleware{step, preflight?}`                                                 |
| `cors(options?)`         | `CorsOptions{origin?, methods?, headers?, expose?, credentials?, maxAge?}`       |
| `csrf(options?)`         | `CsrfOptions{cookie?, header?, field?, exempt?, sameSite?}`                      |
| `rateLimit(options?)`    | `RateLimitOptions{max?, windowMs?, key?, message?}` — throws RATE\_LIMITED (429) |

## Server [#server]

| Symbol                                                                                          | Signature                                                             |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `createServer({port?})`                                                                         | → `AppServer{port, url, start, stop, handle(request), mount(plugin)}` |
| `bootApp(server, {controllers, middlewareGroups, models, macros, resolvers, appCtx, openAPI?})` | → `ManifestEntry[]`                                                   |
| `mountRoutes/mountWsRoutes/mountAutoRoutes/mountOpenAPI`                                        | —                                                                     |
| `findRoute(entries, name)` / `routeUrl(entries, name, params?, opts?)`                          | —                                                                     |

## WebSockets (`src/app/http/ws` or via `channel()`) [#websockets-srcapphttpws-or-via-channel]

```ts
import { channel, broadcast } from "@kwiva/http";

const Messages = channel("messages").policy((user) => !!user);
export const ChatController = defineController({
  prefix: "/ws",
  routes(api) {
    api.ws("/messages", { input: {...}, handler: async function* (ctx) { /* yield per message */ } });
  },
});
```

| API                                           | Notes                                                                              |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `channel(name)` / `Channel{name, policy(fn)}` | `createChannelHandle({getSession, onCleanup}).subscribe(topic)` — policy-checked   |
| `broadcast(name, payload)`                    | in-process hub; `topicCount(topic)`                                                |
| `presence(pattern)`                           | `{onJoin, onLeave, room(key), join, leave, members(key)}` + `createPresenceHandle` |
| `AsyncQueue<T>`                               | —                                                                                  |

## SSE (`stream`) [#sse-stream]

```ts
import { stream } from "@kwiva/http";
const response = stream(async (controller) => {
  controller.enqueue("hello");
  controller.close();
});
```

## Caching [#caching]

Route-level rules (`cache`, `swr`, `isr`, `static`, `prerender`) via `ctx.response` + model cache via `@kwiva/data` + client cache via `@kwiva/client`.

> \[!TIP]
> `routeUrl` is the typed URL generator — `routeUrl(entries, "PostsController.list", { id })`.
