# ADR-0012 — Configuration from the Config Folder

**Status**: Accepted (amended by ADR-0020: inline overrides) · **Updated**: 2026-09-08

## Context

Configuration scatters across env vars, YAML, package.json, and framework options in most stacks, breeding drift and startup-time surprises. Laravel's `config/*.php` folder is the proven DX; Kwiva adapts it.

## Decision

**All configuration lives in the config folder**: `src/config/*.ts` modules loaded through the `kwiva.config.ts` entry.
- Each module is authored with `defineConfig('<domain>', { defaults, env })` — typed schema + defaults + env mapping (app, database, auth, session, api, queue, cache, storage, schedule, tenancy, cors, security, ui, telemetry, modules, mail).
- `kwiva.config.ts` = thin entry: `defineConfig({ load: './src/config', build, deploy, modules })`.
- Precedence: defaults → `src/config` values → **inline `defineX` options (ADR-0020)** → runtime env overrides.
- Env vars are declared exactly once (module `env` maps) — types, boot validation, and `.env.example` generation flow from them; undeclared reads fail.
- Generated artifacts (client, Studio, MCP) read from the same config + IR.
- `doctor` (v1.x) validates config against presets/runtimes; `config:cache` snapshots for cold starts.

## Consequences

- One place to discover/resolve any knob; types prevent typos; boot catches misconfig early.
- Env variance requires explicit mapping (no ambient magic) — documented in `application/04-environment.md`.
- Redis/dynamic values stay runtime-owned but always schema-typed in config.
- Inline tuning is per-construct only — the folder remains the centralizing authority (ADR-0020 rule).

**Related**: ADR-0004, ADR-0011, ADR-0020, `docs/framework/application/03-configuration.md`, `docs/framework/application/04-environment.md`
