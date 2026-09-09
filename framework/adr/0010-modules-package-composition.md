# ADR-0010 — Modules as Package-Level Composition

**Status**: Accepted (v1.x delivery) · **Updated**: 2026-09-08

## Context

Kwiva apps grow beyond a single project; teams want bounded feature composition (models + controllers + pages + jobs + config) without building a bespoke plugin framework.

## Decision

Modules are **package-level composition**:
- `defineModule({ models, controllers, pages, middleware, jobs, events, tasks, policies, migrations, config, channels, boot, shutdown })` — a module = self-contained package (`modules/*` locally or `@scope/*` from npm).
- Contribution points merge into the app scan with namespacing (model names, route prefixes, config namespaces).
- Cannot reach into other modules' internals; interaction only via exposed ports (published models, typed event bus, RPC client, config objects).
- Why: typed, tree-shakable, no runtime plugin VM; build-time DAG validates no cycles.
- Registered via `kwiva.config.ts > modules` (`kwiva add <addon>` installs + registers — addons are the distribution umbrella for modules, plugins, and themes; `kwiva addons list/search/info/update/remove` manages them).
- A module can declare `extensions` to augment a model without forking code.

## Consequences

- Composition stays static and debuggable, preserving type-safety and bundle output.
- Registry/marketplace (`kwiva add` / `kwiva addons` for npm addons; curated index at kwiva.js.org) lands v1.x; local + vendored modules first-class.
- Port discipline enforced by module boundary lint (ADR-0013).

**Related**: ADR-0011, ADR-0012, ADR-0017, `docs/framework/platform/06-modules.md`, `docs/framework/platform/07-application-composition.md`
