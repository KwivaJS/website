# Development Server (/docs/getting-started/development-server)



The development server is where you spend most of your time: it starts fast, hot-reloads your changes, and validates your environment and configuration every time it boots.

## Starting the Server [#starting-the-server]

```bash title="terminal"
bun run dev
```

`bun run dev` is the project alias for `kwiva dev`. The server starts at `http://localhost:3000` with HMR enabled and the full application pipeline — SSR pages, API routes, and middleware — live.

### Options [#options]

| Flag         | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| `--port <n>` | Run on a specific port, e.g. `kwiva dev --port 4000` |
| `--cluster`  | Start a cluster across available cores               |

```bash title="terminal"
bun run dev --port 4000
```

> \[!TIP]
> You can define the middleware stack, default port, and app identity in `src/config/app.ts`, so most projects never need to pass flags.

## What Happens Under the Hood [#what-happens-under-the-hood]

`kwiva dev` does the following at startup:

1. **Loads configuration** — reads `kwiva.config.ts` and the `src/config/` modules
2. **Loads the environment** — applies `.env`, then `.env.local` for developer overrides
3. **Validates the environment** — checks every declared env var; missing required vars fail fast with a readable table
4. **Discovers constructs** — scans the conventional directories for models, controllers, middleware, pages, jobs, and events
5. **Regenerates artifacts** — rebuilds `src/.kwiva/` (ambient types, the route manifest, the model IR) that power the typed client and editor
6. **Starts the server** — a Bun-native HTTP server with hot module replacement
7. **Transforms TypeScript on the fly** — no separate compile step between edit and reload

### Boot-Time Validation [#boot-time-validation]

Environment problems surface immediately instead of at request time. A missing required variable produces a clear error:

```plaintext title="boot-time-validation.txt"
✗ Missing required environment variables:
    DATABASE_URL   (declared in src/config/database.ts)
```

Optional variables declare defaults in their config module; secrets have no defaults. `kwiva key:generate` writes the `APP_KEY` signing secret to `.env`, and secrets are never printed by the CLI.

## Environment Files [#environment-files]

Production and test also have dedicated files, keeping secrets out of the default dev environment:

| File              | Loaded                         | Committed       |
| ----------------- | ------------------------------ | --------------- |
| `.env`            | Always (dev)                   | No              |
| `.env.local`      | Developer overrides            | No (gitignored) |
| `.env.example`    | Template of every declared var | Yes             |
| `.env.production` | Production builds              | No              |

Variables are declared exactly once — in the `env` map of a `src/config/*.ts` module — and that declaration is the source for types, boot validation, and `.env.example` generation. Only `KWIVA_PUBLIC_*` variables are safe to expose to the client.

## Hot Module Replacement [#hot-module-replacement]

The dev server watches your source tree and applies changes in place:

* **Pages** — edit a page, re-render instantly, preserve client state
* **Controllers and routes** — API handlers update without a server restart
* **Models** — schema changes regenerate the model IR and flow through to types
* **Middleware** — lifecycle changes apply to subsequent requests
* **Configuration** — most config changes reload without a restart

Batch operations work too: run `kwiva db:migrate` in a second terminal and the dev server picks up the schema change without a restart.

## Request Handling in Dev [#request-handling-in-dev]

Requests flow through the same pipeline they will in production, so what you see locally is what you get in prod:

1. Framework middleware runs in the order declared in `src/config/app.ts` — request id, security headers, rate limiting, CORS — before any guard
2. The route manifest is matched (generated model routes, controllers, server routes); route rules apply, including cache short-circuits
3. Context is assembled — body/query parsing, cookies and session load, tenant resolution, and typed app state
4. Schema validation runs, then guards (`beforeHandle`), then the handler
5. Responses are shaped, cache tags set, and telemetry spans close
6. Any throw maps through the error taxonomy to the right status code

Individual stages complete in single-digit milliseconds on local hardware (the request is fully formed by the time the handler runs), and each stage is an observable span — the dev overlay can show the per-stage waterfall (v1.x).

## Development Commands [#development-commands]

The `kwiva` CLI covers the rest of the inner loop:

| Command                                     | Purpose                                                               |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `kwiva check`                               | Format + lint + typecheck in one pass (with `--fix` to auto-correct)  |
| `kwiva test`                                | Run tests; `--watch` re-runs on change, `--e2e` adds end-to-end specs |
| `kwiva console`                             | A REPL with the full app context (config, models, client)             |
| `kwiva make:*`                              | Scaffold a model, controller, page, job, and more                     |
| `kwiva db:migrate` / `db:seed` / `db:reset` | Move the database forward                                             |

A typical loop looks like:

```bash title="terminal"
kwiva make:model post
kwiva db:migrate
bun run dev
# edit src/app/models/post.ts → HMR → repeat
```

## Environment Modes [#environment-modes]

The dev server runs in `development` mode by default. The three environment modes affect behavior across the whole toolchain:

| Mode          | Set by        | Effect                                              |
| ------------- | ------------- | --------------------------------------------------- |
| `development` | default       | Dev server, verbose errors, seed-on-boot option     |
| `production`  | `kwiva build` | Minified output, telemetry on, terse errors         |
| `test`        | `kwiva test`  | In-memory adapters where possible, factories seeded |

`config('app.env')` is the canonical read; `NODE_ENV` maps onto it.

## The Dev Overlay [#the-dev-overlay]

Kwiva's dev server includes an overlay that surfaces route trees, loader timings, and cache state while you develop (v1.x — being expanded). Friendly errors — did-you-mean suggestions for typos, field-mapped validation failures, and request correlation ids — appear in the terminal and in forwarded headers, so you can trace a failing request end to end.

## What to Read Next [#what-to-read-next]

* [Your First Model](/docs/getting-started/first-model) — create your first data model
* [Your First API](/docs/getting-started/first-api) — create your first API endpoint
* [Your First Page](/docs/getting-started/first-page) — render your first server-rendered page
* [Observability: Dev Overlay](/docs/observability/dev-overlay) — debugging with the dev overlay
