# ADR-0020 — Config Folder + Full Inline Overrides

**Status**: Accepted (amends ADR-0012) · **Updated**: 2026-09-08

## Context

ADR-0012 centralized configuration in the config folder. During design review, per-construct tuning surfaced as a real need (cache TTLs per model, rate limits per controller, queue per job) — centralizing every knob would bloat the folder and defeat per-resource intent. The question: does `defineX` accept config, and who wins on conflict?

## Decision

**The folder centralizes and defaults; `defineX` accepts full inline config; inline wins.**

- Precedence: `defineConfig` defaults → `src/config/*.ts` module values → `defineX` inline options → runtime env overrides.
- Inline options mirror the domain config schema (typed, validated) — any option settable in the folder is settable inline for that construct:

```ts
defineModel('posts', f => ({...}), { cache: { ttl: 120, tags: ['posts'] } })      // overrides cache defaults
defineController('reports', c => ({...}), { cors: { origins: ['https://acme.dev'] } })
defineJob('cleanup', handler, { queue: 'maintenance', attempts: 3 })
```

- Rules: the folder is the **authority for what exists** (domains, connections, queues, mounts); inline tunes **per-construct behavior**. Nothing configurable from a third place.
- Conflicts (same key set in both) are intentional — inline wins by design, documented here; error messages surface the winning source when debugging config.
- Secrets/env never inline (typed env only — `application/04`).

## Consequences

- Developers tune resources where they define them — locality of intent.
- The folder stays a readable map of the app's operational shape without per-resource noise.
- Config resolution is deterministic and explainable (one rule).

**Related**: ADR-0012, ADR-0019, `docs/framework/application/03-configuration.md`
