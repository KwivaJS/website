# Application 04 — Environment

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

Env, secrets, and typed environment access. Companion to [03-configuration.md](03-configuration.md).

## Files

```
.env                  # loaded always (dev)
.env.local            # developer overrides, gitignored
.env.example          # committed template with every var the app declares
.env.production       # loaded in production builds (never committed)
```

## Declaration → typing

Env vars are declared exactly once: in the `env` map of a `src/config/*.ts` module. That declaration is the source for types, boot validation, and `.env.example` generation.

```ts
// src/config/database.ts
export default defineConfig('database', {
  env: { url: 'DATABASE_URL', driver: 'DB_DRIVER' },
  ...
})
```

```ts
import { env } from '@kwiva/core'
env('DATABASE_URL')   // string — typed because database.ts declared it
```

Undeclared reads fail at compile time (ambient types) and at boot (validation).

## Boot validation

`kwiva dev` / `kwiva build` / server start validate declared env:

```
✗ Missing required environment variables:
    DATABASE_URL   (declared in src/config/database.ts)
    REDIS_URL      (declared in src/config/queue.ts)
```

Optional vars declare defaults in the module; secrets have no defaults.

## Conventions

| Prefix | Meaning |
|---|---|
| `KWIVA_*` | framework-level knobs (tenant mode, cache url) |
| `KWIVA_PUBLIC_*` | safe to embed in client bundles (exposed via `env.public`) |
| `DATABASE_URL`, `REDIS_URL`, `S3_*` | common service vars, mapped by config modules |
| `NITRO_*` | engine-level deployment knobs (preset, baseURL) — build-time only |

## Client-safe exposure

```tsx
import { env } from '@kwiva/react'

const stripeKey = env.public('KWIVA_PUBLIC_STRIPE_KEY')
```

Non-public vars referenced from `src/ui/**` are a **lint error** (oxlint gate `no-secrets-in-client`).

## Secrets handling

- `kwiva key:generate` writes `APP_KEY` (cookie/signing secret) to `.env`.
- Secrets are never printed by the CLI; `kwiva console` masks them.
- Production: platform secret stores (Vercel/Cloudflare/Railway env) → runtime env → config module mapping. No `.env` files in images.
- Rotation guidance lives in `engineering/04-security.md`.

## Environment modes

| Mode | Set by | Effect |
|---|---|---|
| `development` | default | dev server, verbose errors, seed-on-boot option |
| `production` | `kwiva build` | minified, OTel on, terse errors |
| `test` | `kwiva test` | in-memory adapters where possible, factories seeded |

`config('app.env')` is the canonical read; `NODE_ENV` is mapped onto it.
