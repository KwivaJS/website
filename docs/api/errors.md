# API Errors (/docs/api/errors)



# API Errors [#api-errors]

## Taxonomy [#taxonomy]

8 codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `VALIDATION`, `RATE_LIMITED`, `INTERNAL` + storage/search codes. See [Errors](/docs/http/errors).

## Envelope [#envelope]

```json
{ "error": { "code", "message", "fields"?, "requestId" } }
```

## Validation [#validation]

422 `VALIDATION` with `fields: Record<string, string[]>`.

## Typed client [#typed-client]

`toClientError(status, value)` → `ClientErrorShape{code, message, status, fields?, requestId?}`.

## Storage/Search codes [#storagesearch-codes]

`STORAGE_NOT_FOUND`, `STORAGE_TENANT_REQUIRED`, `SEARCH_NOT_CONFIGURED` — see [@kwiva/storage](/api/storage), [@kwiva/search](/api/search).

> \[!TIP]
> All errors include `requestId` for tracing.
