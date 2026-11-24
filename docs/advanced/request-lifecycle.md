# Request Lifecycle (/docs/advanced/request-lifecycle)



# Request Lifecycle (Advanced) [#request-lifecycle-advanced]

See [HTTP Request Lifecycle](/docs/http/lifecycle) for the simplified view.

## Detailed sequence [#detailed-sequence]

1. Elysia server → dispatcher
2. `buildCtx` — parse cookies/params/query/body
3. `validateInput` — Standard Schema, field-mapped errors
4. `compileBeforeHandle` — middleware stack (global→group→route)
5. `wrapHandler` — handler, produce result
6. `validateOutput` — output schema
7. `compileAfterHandle`
8. Error mapping (`toErrorResponse`)
9. Response (optional `waitUntil`, streaming)

## Context propagation [#context-propagation]

`runWithRequest`/`runWithAuth`/`runWithTenant` around handler execution.

## Hooks [#hooks]

* Middleware preflight/main
* Controller hooks (`beforeHandle`, `afterHandle`)
* Route-level `input`/`output` validation

## Timing [#timing]

Auto via logger `ctx.logger` (correlation IDs + durations).
