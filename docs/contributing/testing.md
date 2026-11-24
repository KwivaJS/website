# Testing Standards (/docs/contributing/testing)



# Testing Standards [#testing-standards]

## Tests live [#tests-live]

`packages/*/src/**/*.test.ts` (colocated).

## Stack [#stack]

* `bun:test`
* `@kwiva/testing` harness
* `@electric-sql/pglite` (dev)

## Quality gates [#quality-gates]

* `bun test` per package (in-repo)
* `bun run ci` (typecheck + test + build + functionality)

See also [@kwiva/testing docs](/api/testing).
