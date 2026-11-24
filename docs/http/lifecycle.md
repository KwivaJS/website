# Request Lifecycle (/docs/http/lifecycle)



# Request Lifecycle [#request-lifecycle]

## Standard pipeline [#standard-pipeline]

```
1. Elysia → WebHandler
2. buildCtx — parse input (params/query/body/headers/cookies)
3. validateInput — per-route sections via Standard Schema → VALIDATION (422) on failure
4. compileBeforeHandle — run middleware stack (global → group → controller → route)
5. wrapHandler — handler via `ctx.input`, produce result
6. validateOutput — response schema via contract
7. toErrorResponse — error mapping (STORAGE_* → storage 404s; SEARCH_NOT_CONFIGURED → search 404)
8. Response returned (or afterHandle + waitUntil)
```

## Pipeline details (for advanced users) [#pipeline-details-for-advanced-users]

```ts
const body = resolveBody(part.value, route, overrides);
const partResult = splitInput(input); // {params, query, body, headers, cookies}
validateInput → {params, query, body, headers?, cookies?}

runMiddleware(steps, ctx); // preflight + controller + route
handler → result
validateOutput → value
```

## Error mapping [#error-mapping]

`toErrorResponse(error, requestId?)`:

| KwivaError code    | HTTP |
| ------------------ | ---- |
| BAD\_REQUEST       | 400  |
| UNAUTHORIZED       | 401  |
| FORBIDDEN          | 403  |
| NOT\_FOUND         | 404  |
| CONFLICT           | 409  |
| VALIDATION         | 422  |
| RATE\_LIMITED      | 429  |
| INTERNAL (default) | 500  |

`ctx.requestId` added to errors.

## WebSocket lifecycle [#websocket-lifecycle]

```
Elysia ws upgrade → policy check (channels) → subscribe
```

## Special cases [#special-cases]

* `ctx.waitUntil()` — after-response tasks (see [@kwiva/core async](/api/core#asyncclass-asyncmiddleware-afterresponse-onresponse-tasks-handler-types))
* Streaming: `ctx.stream()`, `stream(setup, {heartbeatMs, event})` — SSE.
* `Content-Type` handling for multipart (file uploads).

> \[!TIP]
> Custom error → use `ctx.error(code, msg, data)` in handler — appears in `errorResponse`.
