# E2E Testing (/docs/testing/e2e-testing)



# E2E Testing [#e2e-testing]

Kwiva includes a browser runner (via `@elysia/openapi`+`playwright` — external dep? — see research). For CI: run against `kwiva dev` or `kwiva start` server, fixtures via `withApp` + `bootAppFromRoot`.

## Fixtures [#fixtures]

* `registerFixtures` from @kwiva/data/testing
* seeders via `kwiva seed` in CI step

## CI placement [#ci-placement]

* `kwiva dev` for local E2E; `bun run build` + `start` for CI.

> \[!TIP]
> Fixture lifecycle via `setupTestDb/teardownTestDb`.
