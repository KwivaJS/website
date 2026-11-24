# Routes & Routing (/docs/http/routes)



# Routes & Routing [#routes--routing]

* **Manifest**: `bootApp` → `ManifestEntry[]` (all routes from controllers).
* **Path params**: `:id` segments. Route resolution: `findRoute(entries, name)`.
* **Versioning**: `MCP v2; REST GET /api/:model` + `routeUrl(entries, "PostsController.list", { id })` — typed URLs.
* **Auto-routes**: `mountAutoRoutes` — `restRoutes` from models.
* **`defineRoute(options)`** — standalone routes for app code (non-controller).

## Five generated routes per model (REST) [#five-generated-routes-per-model-rest]

| Method          | Path               | Purpose                                  |
| --------------- | ------------------ | ---------------------------------------- |
| `GET`           | `/api/{model}`     | list (validated where/page/orderBy/with) |
| `POST`          | `/api/{model}`     | create (validated)                       |
| `GET`           | `/api/{model}/:id` | get                                      |
| `PATCH` / `PUT` | `/api/{model}/:id` | update                                   |
| `DELETE`        | `/api/{model}/:id` | remove                                   |

## Route naming [#route-naming]

* Controllers: `RouteId = "ControllerName.verb"` — verbs: `get→list`, `post→add/create`, `patch/put→update`, `delete→remove`, root `index→get`, param `:id→get`.
* `deriveRouteId(name, method, path)`.

## Middleware (named refs) [#middleware-named-refs]

Middleware can be registered as strings in `middleware: ["name"]` — `resolveMiddlewareRefs` maps names to Middleware (groups via `middlewareGroups`).

## 404 + method-not-allowed [#404--method-not-allowed]

* Unknown path → 404 response (`renderNotFound`-ish, html or JSON by Accept).
* Wrong method on a known path → Elysia 405 default.
