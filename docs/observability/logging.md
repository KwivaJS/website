# Logging (/docs/observability/logging)



# Logging [#logging]

## `@kwiva/core` logger [#kwivacore-logger]

```ts
import { getLogger } from "@kwiva/core";
const logger = getLogger("posts");
logger.info("todo.created", { id: 1, userId: 42 });
```

* Structured: `{level, message, timestamp, correlationId, data}`
* Default sink: JSON to stdout in prod
* Dev sink: pretty console in dev

## Correlation IDs [#correlation-ids]

Set `correlationId` on the logger; chained spans via `child(logger)`.

## Where used [#where-used]

* HTTP: `ctx.logger.info("request.done", { method, url })`
* Jobs: `JobContext.logger`
* Worker: `startWorker({logger})`

## Dev overlay [#dev-overlay]

`createLogger` + watch logs in terminal during `kwiva dev`.

## Export [#export]

Canonical OTel-style: `withTrace`, `span()` etc. — advanced, see tracing.

> \[!TIP]
> `bun:test` + logger = free observability for dev.
