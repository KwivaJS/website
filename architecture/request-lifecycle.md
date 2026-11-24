# Request Lifecycle (/architecture/request-lifecycle)



# Request Lifecycle [#request-lifecycle]

See [HTTP Lifecycle](/docs/http/lifecycle) + [Advanced Request Lifecycle](/docs/advanced/request-lifecycle).

## Step list (high-level) [#step-list-high-level]

1. Request arrives → Elysia
2. `buildCtx` (input parsing)
3. Input validation
4. Middleware stack (global → controller → group → route)
5. Handler
6. Output validation
7. Error mapping
8. Response (optional `waitUntil`, WS bridge)

## Guarantees [#guarantees]

* Ordered execution
* Tracing spans per step (via evlog)
* Request IDs in errors
* No retries unless configured

> \[!TIP]
> Advanced version: [Advanced Request Lifecycle](/docs/advanced/request-lifecycle).
