# Controllers (/docs/http/controllers)



# Controllers [#controllers]

```ts title="src/app/http/controllers/posts.ts"
import { defineController } from "@kwiva/http";

export const PostsController = defineController({
  prefix: "/api/posts",
  permission: "posts",
  routes(api) {
    api.get("/", (ctx) => ctx.store.posts.where("status", "pending").all());
    api.get("/:id", (ctx) => ctx.store.posts.find(ctx.params.id));
    api.post("/", (ctx) => ctx.store.posts.create(ctx.input.body), {
      name: "create",
      input: { body: CreatePostContract },
    });
  },
});
```

## Route builder methods [#route-builder-methods]

| Method                                                                   | Purpose                           |
| ------------------------------------------------------------------------ | --------------------------------- |
| `api.get(path, handler, options?)` / `post` / `put` / `patch` / `delete` | handler + options                 |
| `api.ws(path, { input?, handler(ctx): AsyncGenerator }, macros?)`        | WebSocket route                   |
| `api.guard(scope, setup?)`                                               | guard middleware scope            |
| `api.group(options, setup?)`                                             | scoped middleware + route builder |

### Route options (2nd arg) [#route-options-2nd-arg]

| Option                                                    | Type                                          | Notes                                                 |
| --------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| `input`                                                   | `{params?, query?, body?, headers?, cookie?}` | sections with Standard Schema                         |
| `output`                                                  | `{schema?, status?, transform?}`              | response contract                                     |
| `contract`                                                | `Contract`                                    | merged contract (`defineContract`)                    |
| `middleware`                                              | `Middleware[]`                                | route-level                                           |
| `bind`                                                    | `{from, as, list?}`                           | resolvers (see [Middleware](/docs/http/middleware))   |
| `handler`                                                 | `fn`                                          | —                                                     |
| `name`                                                    | string                                        | unique route id suffix                                |
| `namePrefix`                                              | string                                        | —                                                     |
| `tags`, `summary`, `description`, `openAPI`, `deprecated` | —                                             | OpenAPI metadata                                      |
| `permission`                                              | string                                        | policy namespace for the route (overrides controller) |
| `beforeHandle`, `afterHandle`                             | `Middleware[]`                                | —                                                     |
| `macros`                                                  | `Record<string, MacroDefinition>`             | —                                                     |

## Controller options [#controller-options]

| Option             | Notes                            |
| ------------------ | -------------------------------- |
| `prefix`           | route path prefix (`/api/posts`) |
| `middleware`       | controller-level middleware      |
| `middlewareGroups` | named refs to global middleware  |
| `routes(api)`      | builder callback                 |
| `tags`             | OpenAPI tags                     |

## Typed context — `ctx` [#typed-context--ctx]

| Member                                                  | Notes                                                  |
| ------------------------------------------------------- | ------------------------------------------------------ |
| `ctx.input`                                             | destructured `{params, query, body, headers, cookies}` |
| `ctx.params` / `ctx.query` / `ctx.body`                 | raw sections                                           |
| `ctx.headers()` / `ctx.setHeaders()`                    | response headers                                       |
| `ctx.json()` / `ctx.text()` / `ctx.noContent()`         | response                                               |
| `ctx.redirect(url, status?)` / `ctx.away(url, status?)` | ambient helpers                                        |
| `ctx.waitUntil(promise)`                                | —                                                      |
| `ctx.session` / `ctx.user` / `ctx.can`                  | auth context                                           |
| `ctx.bound(key)`                                        | resolver result                                        |

## Mounting [#mounting]

`bootApp(server, {controllers, middlewareGroups, models, macros, resolvers, appCtx, openAPI})` → `bindRouteIds` per controller → routes + manifest + OpenAPI mount. `findRoute(entries, name)`, `routeUrl(entries, name, params?)`.

> \[!TIP]
> 404s for unknown routes use the 404 handler in `ctx.error`; controller returns; nothing throws.
