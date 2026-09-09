# Engineering 01 — CLI Reference

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

The `kwiva` binary — one CLI for the whole lifecycle, built on the oxc toolchain (ADR-0021) + Bun. Reference: Laravel Artisan (command shape, generators, DB/queue/schedule verbs) and Vite+ (pipeline shape).

## Commands

### Project & lifecycle

| Command | Action |
|---|---|
| `kwiva new <name> --mode=<mode>` | scaffold app (modes: fullstack, api+spa, static, standalone, edge) |
| `kwiva dev [--port] [--cluster]` | dev server + HMR (Bun.serve + oxc) |
| `kwiva build [--preset] [--binary] [--docs]` | production build (rolldown + Nitro) |
| `kwiva preview` | serve built output locally |
| `kwiva deploy [provider]` | build + provider deploy |
| `kwiva check [--fix] [--audit]` | oxfmt + oxlint (+ fix) + typecheck (+ deps audit v1.x) |
| `kwiva test [--e2e] [--watch] [filter]` | bun test (+ Playwright with --e2e) |
| `kwiva console` | REPL with app context (config, models, client) |
| `kwiva upgrade` | codemod recipes (oxc transformer) + dep bumps |
| `kwiva key:generate` | APP_KEY → `.env` |
| `kwiva doctor` | env/runtime/deps diagnostics (v1.x) |

### Generators (`kwiva make:*`)

| Command | Creates |
|---|---|
| `make:model <name>` | `src/app/models/<name>.ts` + migration + factory |
| `make:controller <name>` | `src/app/http/controllers/<name>.ts` |
| `make:middleware <name>` | `src/app/http/middleware/<name>.ts` |
| `make:auth` | `src/app/http/auth.ts` + users model check |
| `make:service <name>` | `src/app/services/<name>.ts` |
| `make:job <name>` | `src/app/jobs/<name>.ts` |
| `make:event <name>` | `src/app/events/<name>.ts` |
| `make:policy <name>` | `src/app/policies/<name>.ts` |
| `make:task <name>` | `src/app/tasks/<name>.ts` |
| `make:command <name>` | `src/app/console/<name>.ts` |
| `make:page <path>` | `src/ui/pages/<path>.tsx` |
| `make:seeder <name>` | `src/database/seeders/<name>.ts` |
| `make:module <name>` | `modules/<name>/` scaffold |
| `make:test <name>` | matching test file |

All generators follow the naming conventions (lowercase kebab) and emit typed stubs that pass `kwiva check`.

### Database

| Command | Action |
|---|---|
| `db:migrate` / `db:rollback --steps=n` | apply/revert migrations |
| `db:status` / `db:diff` | applied/pending; model-vs-DB diff proposal |
| `db:seed [--seeder]` | run seeders |
| `db:reset` | drop → migrate → seed |
| `db:push` | dev schema push without migration files (v1.x) |
| `db:browse` | data browser (v1.x) |

### Queue & schedule

| Command | Action |
|---|---|
| `queue:work --queue=... --concurrency=n` | run workers |
| `queue:listen` | verbose worker (dev) |
| `queue:failed` / `queue:retry <id\|--all>` / `queue:clear <q>` | DLQ management |
| `schedule:list [--json]` | table + next runs |
| `schedule:work` / `schedule:run` | foreground scheduler / single tick |
| `task:run <name> [--payload]` | run one task |

### Config & misc

| Command | Action |
|---|---|
| `config:cache` (v1.x) | snapshot merged config |
| `module:build` | package a module |
| `add <addon>` | install + register an addon |

### Addons

Addons are installable capability packages — the umbrella for modules, plugins, and themes. Installed from npm (or a local path) and registered in `kwiva.config.ts > modules` in one step.

| Command | Action |
|---|---|
| `kwiva add <addon>` | install + register (npm install, config entry, migrations check) — e.g. `kwiva add @kwiva/blog` |
| `kwiva add <addon> --path ./addons/analytics` | install a local addon from a path |
| `kwiva add <addon> --version 1.2.0` | pin a version |
| `kwiva addons list` | installed addons (name, version, contribution summary) |
| `kwiva addons search [query]` | search the registry (npm `kwiva-addon` keyword conventions; curated index at kwiva.js.org, v1.x) |
| `kwiva addons info <addon>` | description, contributions (models/controllers/pages/config), requirements, changelog |
| `kwiva addons remove <addon>` | unregister + uninstall (migrations left intact, flagged) |
| `kwiva addons update [addon]` | update within compatibility range (`requires` semver check) |
| `kwiva addons outdated` | list addons with newer compatible versions |

Add-on authoring is `defineModule` / `definePlugin` / theme packages — `kwiva module:build` + npm publish with the `kwiva-addon` keyword makes a package discoverable by `addons search`.

## App-defined commands (`defineCommand`)

```ts
// src/app/console/import-legacy.ts
import { defineCommand } from '@kwiva/cli'

export default defineCommand('import:legacy', {
  description: 'Import users from the legacy export',
  signature: 'import:legacy {file} {--dry-run}',
  handle: async ({ input, output, models, config }) => {
    const file = input.argument('file')
    const dry = input.option('dry-run')
    const bar = output.progress(rows.length)
    for (const row of rows) { ...; bar.tick() }
    output.info(`imported ${n} users`)
  },
})
```

Artisan-style signature parsing (`{arg} {--flag}`), progress bars, tables, styled output; auto-discovered from `src/app/console/`; run as `kwiva import:legacy export.csv --dry-run`.

## Global flags

`--env <file>` · `--no-color` · `--json` (machine-readable where sensible) · `--verbose`

## Implementation notes

- CLI binary: Bun-executed TS; heavy lifting via oxc napi bindings (rolldown/transformer/resolver/lint) — see `foundation/02`.
- `kwiva` reads `kwiva.config.ts` for every command; mode/presets flow from it.
- Command resolution: built-ins first, then app console commands, then modules.
