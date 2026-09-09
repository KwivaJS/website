# Server 03 — API Design

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

REST conventions, validation, OpenAPI, and the typed RPC contract. The generated + authored API surface is one system: deterministic model routes, custom controller actions, and a client that never drifts.

## URL conventions

```
/api                        # API prefix (src/config/api.ts)
/api/{model}                # generated: posts → /api/posts
/api/{model}/:id
/api/{model}/:id/{action}   # custom (controller-defined)
/api/{controller}/...       # controller prefix
/openapi.json               # spec
/docs                       # swagger ui (optional)
/mcp                        # MCP endpoint (optional)
/healthz · /readyz           # health
```

Naming: lowercase plural models; kebab-case custom segments; no verbs in paths (verbs = actions on the resource).

## Generated model routes (deterministic — 5 per model)

| Method | Path | Query/body | Response |
|---|---|---|---|
| GET | `/api/posts` | `where`, `page`, `limit`, `orderBy`, `with`, `q` | `{ data: Post[], total, page, lastPage }` |
| GET | `/api/posts/:id` | — | `Post` |
| POST | `/api/posts` | validated body | `Post` (201) |
| PATCH | `/api/posts/:id` | validated partial body | `Post` |
| DELETE | `/api/posts/:id` | — | 204 |

- `where` is schema-checked against the model (unknown fields → 422).
- `with` accepts only declared relations.
- Policy: each route requires `{permission}.read/create/update/delete` unless `permission: false`.

## Validation

- Field DSL is the source; controllers add Standard Schema (Valibot default) per route:

```ts
c.post('/', handler, {
  body: v.object({ title: v.string().min(1), body: v.optional(v.string()) }),
  query: v.object({ draft: v.optional(v.string()) }),
})
```

- Validation errors → 422 `{ code: 'VALIDATION', issues: [{ path, message }] }` — field-mapped by UI forms.
- Headers/cookies/params can also be schema'd.

## Status codes

| Code | When |
|---|---|
| 200/201/204 | success |
| 401 | unauthenticated (session missing) |
| 403 | policy denial (FORBIDDEN) |
| 404 | not found (findOrFail + notFound()) |
| 409 | conflicts (unique violation, version) |
| 422 | validation |
| 429 | rate limit |
| 500 | unhandled (sanitized in prod) |

## Typed RPC contract (the Eden-like client)

Controllers + models emit a **route manifest** (IR): path, method, schemas, response type, permission, tags. The client derives methods:

```ts
client.posts.list({ page: 2 })                    // GET /api/posts
client.posts.get('pst_123')                       // GET /api/posts/pst_123
client.posts.create({ title: 'Hi' })              // POST /api/posts
client.posts.publish('pst_123')                   // POST /api/posts/pst_123/publish (custom)
client.reports.get('prj_9')                       // controller route
```

- Types are inferred end-to-end at the type level (ambient types in `src/.kwiva/types`) — zero codegen step, zero drift.
- Errors are discriminated: `{ ok: false, error: { code, message, issues? } }`.
- Client works server-side (in-process, no network) and browser (fetch + session).

## Versioning

- URL versioning: `src/config/api.ts > versioning: { strategy: 'url', default: 'v1' }` → `/api/v1/...`.
- Deprecation headers via route rules; breaking changes require a new version + ADR.

## OpenAPI

- Rendered from the route manifest at boot (not a plugin visit per route): `/openapi.json`, optional Swagger UI at `/docs`.
- Model schemas, enums, relations, pagination, error responses all derive from the IR.
- `kwiva build --docs` emits the spec as a build artifact for external consumers.

## Documentation conventions

- Every controller action: `summary`, `tags`, `description` options (flow to OpenAPI).
- Every model: field `description()` flows to schema descriptions.

## Pagination contract

```
GET /api/posts?page=3&limit=20
→ { data: [...], total: 142, page: 3, lastPage: 8 }
```

Cursor mode (v1.x): `?cursor=...` with `nextCursor` in the response — matches `useInfiniteList`.
