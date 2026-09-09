# Server 04 — Error Handling

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

One taxonomy, two renderers (JSON for API, HTML for pages), typed on the client.

## The taxonomy

| Code | HTTP | Meaning | Thrown by |
|---|---|---|---|
| `BAD_REQUEST` | 400 | malformed input that isn't schema-validatable | framework |
| `UNAUTHORIZED` | 401 | no session / invalid credentials | auth, guards |
| `FORBIDDEN` | 403 | policy denial | policies, `permission` |
| `NOT_FOUND` | 404 | missing resource / route | `findOrFail`, router |
| `CONFLICT` | 409 | uniqueness/optimistic-concurrency violations | model layer |
| `VALIDATION` | 422 | schema failures | validation stage |
| `RATE_LIMITED` | 429 | rate limit tripped | middleware |
| `INTERNAL` | 500 | unhandled | catch-all |

## Authoring errors

```ts
import { error, NotFoundError, ForbiddenError } from '@kwiva/http'

// helper return (preferred in handlers)
return error('NOT_FOUND', { message: 'no such post' })
return error('VALIDATION', { issues: [{ path: 'title', message: 'too long' }] })

// typed exceptions (preferred in services/models)
throw new NotFoundError('post', id)
throw new ForbiddenError('posts.publish')

// unknown errors → INTERNAL in production (details hidden), full stack in dev
```

Custom codes: registered in `src/config/app.ts > errors` with a status mapping — extend the taxonomy, never bypass it.

## Response shapes

```jsonc
// API (json)
{ "error": { "code": "NOT_FOUND", "message": "no such post", "requestId": "req_..." } }

// Pages (html)
// errorComponent per route (frontend/01) or root ErrorBoundary — themed, includes requestId
```

## Handling stages

- Any throw/`error()` return in any lifecycle stage enters the **onError** stage.
- Mapping order: typed exception → registered custom → INTERNAL.
- `onError` hooks (app/controller-scoped) can translate domain exceptions before mapping (e.g. `StripeError → 'PAYMENT'` custom).
- After mapping: OTel span records the code; metrics count per code+route.

## Model-layer integration

- `findOrFail` → `NOT_FOUND`.
- Unique constraint violations → `CONFLICT` with the offending field.
- Soft-delete mismatch → `NOT_FOUND` (trashed rows are invisible by default).

## Client-side typing

```ts
const res = await client.posts.get(id)
if (res.error) {
  switch (res.error.code) {
    case 'NOT_FOUND': …
    case 'FORBIDDEN': …
  }
}
```

The discriminated union comes from the taxonomy — no string matching.

## Logs & correlation

- Every error response carries `requestId` (= `x-request-id` header).
- Structured log line: `{ level, code, route, requestId, tenantId, traceId, stack? }`.
- Production hides internals for `INTERNAL`; dev overlay shows the full stack + source (oxc sourcemaps).

## Failure of the error system itself

- Error-handler throws → plain 500 + alert metric; the pipeline degrades never loops.
- Rendering an error page throws → minimal built-in fallback page.
