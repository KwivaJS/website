# Error Handling (/docs/core-concepts/error-handling)



# Error Handling [#error-handling]

## Taxonomy [#taxonomy]

8-code enum (see [Errors](/docs/http/errors)) — `KwivaError` + subclasses.

## Helpers [#helpers]

* `error(code, msg, fields?)` — construct
* `try/catch` + rethrow

## Renderers [#renderers]

* HTTP: `toErrorResponse(error)` — auto-maps codes to status + body shape
* Client: `toClientError(status, value)` in `@kwiva/client`

## Custom codes [#custom-codes]

Extend `ErrorCode` via `KwivaError` — throw with custom messages.

## Logging [#logging]

Structured via `ctx.logger`/`createContextLogger`.

> \[!TIP]
> See [HTTP Errors](/docs/http/errors) for full taxonomy table.
