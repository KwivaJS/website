# ADR-0011 — CLI-First Developer Experience

**Status**: Accepted · **Updated**: 2026-09-08

## Context

Kwiva's promise is Laravel-class DX: apps usable within minutes, common tasks as typed commands, generated code mentally repayable. We must decide how the toolchain is delivered.

## Decision

CLI-first (command **`kwiva`**, built on the oxc toolchain — ADR-0021):
- One surface covering scaffold (`new`), lifecycle (`dev`, `build`, `check`, `test`, `preview`, `deploy`, `console`), generators (`make:model`, `make:controller`, `make:service`, `make:job`, `make:event`, `make:policy`, `make:task`, `make:command`, `make:page`, `make:module`, `make:seeder`, `make:test`), data ops (`db:migrate`, `db:rollback`, `db:seed`, `db:diff`, `db:status`, `db:reset`, `db:browse`), runtime ops (`queue:*`, `schedule:*`, `task:run`, `config:cache`), addons (`add <addon>`, `addons list/search/info/remove/update/outdated`), and maintenance (`upgrade`, `key:generate`, `doctor`).
- Deterministic regenerable artifacts (IR generation idempotent, `--check` gates CI); interactive prompts when args omitted; `--json` for scripting.
- No shell dependency — `bunx @kwiva/cli`; standalone binary recipe for global installs.
- Terminal UX rules: colors only in TTY, `NO_COLOR` respected, friendly errors with did-you-mean suggestions.
- App-defined commands (`defineCommand` in `src/app/console/`) extend the CLI with Artisan-style signatures.

## Consequences

- Strong onboarding and a consistent mechanical-refactoring surface.
- CLI builds are ongoing work; surface-bloat risk managed by grouping/aliases and the "every feature ships its CLI story" DoD rule (roadmap).
- The tinker-style command is named `kwiva console` to avoid trademark collision.

**Related**: ADR-0008, ADR-0012, ADR-0021, `docs/framework/engineering/01-cli.md`, `docs/framework/engineering/06-roadmap.md`
