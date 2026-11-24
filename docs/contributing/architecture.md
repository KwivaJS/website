# Architecture (/docs/contributing/architecture)



# Architecture for Contributors [#architecture-for-contributors]

See [Package Boundaries](/docs/advanced/package-boundaries) for the full map.

## Core rules [#core-rules]

* App code imports only `@kwiva/*`
* Engines sealed (oxlint `no-engine-imports` gate)
* Package graph acyclic

## Adding a new factory [#adding-a-new-factory]

1. Add factory to `@kwiva/<pkg>`
2. Register in discover.ts if app-facing
3. Update definex.mdx (documented)
4. Add API page (api/\*.mdx)
5. Test it

## Coding standards [#coding-standards]

* strict TS, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`
* oxlint + tsc + eslint parity

## Tests [#tests]

Run: `bun test` in package dir; add colocated tests (`*.test.ts`).
