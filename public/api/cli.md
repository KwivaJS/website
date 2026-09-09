# CLI (/api/cli)



`kwiva` is the single CLI for the entire application lifecycle. It's built on the Rust-speed toolchain, so every command — dev server, build, check, generators, database, queue, and schedule — runs fast and consistently. Commands are discovered from built-ins first, then application console commands (`src/app/console/`), then modules.

## Project & Lifecycle [#project--lifecycle]

| Command                                      | Action                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| `kwiva new <name> --mode=<mode>`             | Scaffold an app (modes: `fullstack`, `api+spa`, `static`, `standalone`, `edge`)       |
| `kwiva dev [--port] [--cluster]`             | Start the dev server with HMR                                                         |
| `kwiva build [--preset] [--binary] [--docs]` | Production build (client + server)                                                    |
| `kwiva preview`                              | Serve the built output locally                                                        |
| `kwiva deploy [provider]`                    | Build then run the provider's deploy path                                             |
| `kwiva check [--fix] [--audit]`              | Format, lint, and typecheck; `--fix` auto-fixes, `--audit` checks dependencies (v1.x) |
| `kwiva test [--e2e] [--watch] [filter]`      | Run tests; `--e2e` runs end-to-end tests                                              |
| `kwiva console`                              | REPL with the app context (config, models, client)                                    |
| `kwiva upgrade`                              | Run codemod recipes and dependency bumps                                              |
| `kwiva key:generate`                         | Generate `APP_KEY` into `.env`                                                        |
| `kwiva doctor`                               | Environment/runtime/dependency diagnostics (v1.x)                                     |

## Generators (`kwiva make:*`) [#generators-kwiva-make]

| Command                  | Creates                                          |
| ------------------------ | ------------------------------------------------ |
| `make:model <name>`      | `src/app/models/<name>.ts` + migration + factory |
| `make:controller <name>` | `src/app/http/controllers/<name>.ts`             |
| `make:middleware <name>` | `src/app/http/middleware/<name>.ts`              |
| `make:auth`              | `src/app/http/auth.ts` + users model check       |
| `make:service <name>`    | `src/app/services/<name>.ts`                     |
| `make:job <name>`        | `src/app/jobs/<name>.ts`                         |
| `make:event <name>`      | `src/app/events/<name>.ts`                       |
| `make:policy <name>`     | `src/app/policies/<name>.ts`                     |
| `make:task <name>`       | `src/app/tasks/<name>.ts`                        |
| `make:command <name>`    | `src/app/console/<name>.ts`                      |
| `make:page <path>`       | `src/ui/pages/<path>.tsx`                        |
| `make:seeder <name>`     | `src/database/seeders/<name>.ts`                 |
| `make:module <name>`     | `modules/<name>/` scaffold                       |
| `make:test <name>`       | Matching test file                               |

All generators follow the naming conventions (lowercase, kebab-case) and emit typed stubs that pass `kwiva check`.

## Database [#database]

| Command                                | Action                                                            |
| -------------------------------------- | ----------------------------------------------------------------- |
| `db:migrate` / `db:rollback --steps=n` | Apply or revert migrations                                        |
| `db:status` / `db:diff`                | Show applied/pending migrations; propose a model-vs-database diff |
| `db:seed [--seeder]`                   | Run seeders                                                       |
| `db:reset`                             | Drop → migrate → seed                                             |
| `db:push`                              | Push the schema to dev without migration files (v1.x)             |
| `db:browse`                            | Data browser (v1.x)                                               |

## Queue & Schedule [#queue--schedule]

| Command                                                        | Action                             |
| -------------------------------------------------------------- | ---------------------------------- |
| `queue:work --queue=... --concurrency=n`                       | Run workers                        |
| `queue:listen`                                                 | Verbose worker for development     |
| `queue:failed` / `queue:retry <id\|--all>` / `queue:clear <q>` | Dead-letter queue management       |
| `schedule:list [--json]`                                       | List scheduled tasks and next runs |
| `schedule:work` / `schedule:run`                               | Foreground scheduler / single tick |
| `task:run <name> [--payload]`                                  | Run one task manually              |

## Config & Addons [#config--addons]

| Command                 | Action                                                      |
| ----------------------- | ----------------------------------------------------------- |
| `config:cache` (v1.x)   | Snapshot the merged configuration                           |
| `module:build`          | Package a module for distribution                           |
| `add <addon>`           | Install and register an addon in one step                   |
| `addons list`           | List installed addons (name, version, contribution summary) |
| `addons search [query]` | Search the addon registry (v1.x)                            |
| `addons info <addon>`   | Description, contributions, requirements, changelog         |
| `addons remove <addon>` | Unregister and uninstall (migrations left intact, flagged)  |
| `addons update [addon]` | Update within the compatibility range                       |
| `addons outdated`       | List addons with newer compatible versions                  |

## App-Defined Commands [#app-defined-commands]

Applications define their own commands with `defineCommand`, auto-discovered from `src/app/console/`:

```ts title="src/app/console/import-legacy.ts"
// src/app/console/import-legacy.ts
import { defineCommand } from '@kwiva/cli'

export default defineCommand('import:legacy', {
  description: 'Import users from the legacy export',
  signature: 'import:legacy {file} {--dry-run}',
  handle: async ({ input, output, models, config }) => {
    const file = input.argument('file')
    const dry = input.option('dry-run')
    const bar = output.progress(rows.length)
    for (const row of rows) {
      // process...
      bar.tick()
    }
    output.info(`imported ${n} users`)
  },
})
```

Command signatures use the standard `{arg}` / `{--flag}` form. Helpers include progress bars, tables, and styled output. Run it as:

```bash title="terminal"
kwiva import:legacy export.csv --dry-run
```

## Global Flags [#global-flags]

`--env <file>` · `--no-color` · `--json` (machine-readable where sensible) · `--verbose`

## What to Read Next [#what-to-read-next]

* [Project Commands](/docs/cli/project-commands) — Lifecycle commands in detail
* [Generators](/docs/cli/generators) — The `make:*` commands
* [Database Commands](/docs/cli/database-commands) — Migration and seed workflows
* [Addon Commands](/docs/cli/addon-commands) — Installing and managing addons
