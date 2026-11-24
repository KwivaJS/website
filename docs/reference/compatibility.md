# Compatibility Matrix (/docs/reference/compatibility)



# Compatibility [#compatibility]

## Bun [#bun]

`>= 1.4.0` — required for `import.meta.main`, Bun.serve, etc.

## Node [#node]

`>= 20` — API-only, supported via engines.

## Databases [#databases]

* Postgres ≥ 12 — all apps require for Postgres configs
* PGlite — dev/test only

## Transports [#transports]

| Package        | Transport                           |
| -------------- | ----------------------------------- |
| `mail-smtp`    | SMTP (Nodemailer), `pool` supported |
| `mail-resend`  | Resend API                          |
| `jobs-pg-boss` | pg-boss (durable)                   |
| `store-redis`  | ioredis (REDIS\_URL)                |
