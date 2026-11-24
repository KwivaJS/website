# Troubleshooting (/docs/reference/troubleshooting)



# Troubleshooting [#troubleshooting]

## `bun install` fails [#bun-install-fails]

* Check `engines.bun` — update Bun first.

## `kwiva dev` won't start [#kwiva-dev-wont-start]

* Run `kwiva doctor` — checks storage/search/mcp
* Check `src/config` for invalid sections (`bunx tsc --noEmit`)

## `kwiva migrate` errors [#kwiva-migrate-errors]

* Run `kwiva migrate:status` first
* Look for timestamped names, `.d.ts`

## DB not found [#db-not-found]

* `dataDir` for pglite; `database` config via `kwiva dev`

## Test hangs [#test-hangs]

* `setupTestDb` + `teardownTestDb` in beforeEach/afterEach

> \[!TIP]
> For deeper issues, see [observability/dev-overlay](/docs/observability/dev-overlay).
