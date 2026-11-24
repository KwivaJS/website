# Package Boundaries (/docs/advanced/package-boundaries)



# Package Boundaries [#package-boundaries]

## Graph [#graph]

```
core ──► (all packages depend on it)
├── http → {core, data, events}
├── ui   → {core, http}
├── client → {core, http}
├── auth → {core, http}
├── jobs → {core}
├── events → {core}
├── mail → {core}
├── search → {core, data}
├── storage → {core}
└── testing → {auth, client, core, data, events, http, jobs, mail, ui}
```

## Sealed engines [#sealed-engines]

* `kysely`, `elysia`, `marked`, `better-auth`, `devalue`, `croner`, `ioredis`, `files-sdk`, `nodemailer`, `resend`, `pg-boss`, `@modelcontextprotocol/server`, `evlog`, `keyv`, `@valibot/to-json-schema`, `@elysia/openapi`

See research/dependency-inventory.md.

## Enforcement [#enforcement]

* `test/functionality/engine-imports.test.ts`
* oxlint `no-engine-imports` gate

> \[!TIP]
> App code: only `@kwiva/*`. Engines: framework only.
