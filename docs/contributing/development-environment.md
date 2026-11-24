# Development Environment (/docs/contributing/development-environment)



# Development Environment [#development-environment]

## Prereqs [#prereqs]

* **Bun** ≥ 1.4.0 (`engines`)
* Git
* Editor with TS support (VSCode/Cursor; oxlint for lint)

## Setup [#setup]

```bash title="terminal"
git clone https://github.com/kwiva/kwiva
cd kwiva
bun install
bun test
bun run typecheck
```

## Tools [#tools]

* **oxlint** — lint (`oxlint src`)
* **tsc** — types via `bun run typecheck`
* **bunx tsc --noEmit\`**
* **croner** (jobs), etc.

## IDE [#ide]

VSCode + TypeScript, TS 5.7/5.9; strict mode on.

## Getting started [#getting-started]

Try building an example:

```bash
bun run examples/todo-app-m3
cd examples/todo-app-m3
bun run dev
```
