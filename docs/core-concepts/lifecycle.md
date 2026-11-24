# Lifecycle (/docs/core-concepts/lifecycle)



# Lifecycle [#lifecycle]

## Boot [#boot]

1. `kwiva dev` / `bun src/index.ts` — entry starts server
2. `loadConfig` (src/config) + section validators
3. `configureDatabase` (database section)
4. `assembleApp` — discover + register policies
5. `createServer` + `bootApp` — mount controllers/routes/WS/OpenAPI
6. `start()`

## Request (14 steps) [#request-14-steps]

See [HTTP Lifecycle](/docs/http/lifecycle).

## Shutdown [#shutdown]

`await server.stop()` — afterResponse flush, DB close, worker stop.
