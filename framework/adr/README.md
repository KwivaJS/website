# Architecture Decision Records (ADR)

**Status**: Living · **Updated**: 2026-09-08

## Purpose

ADRs capture architectural decisions for Kwiva and their rationale. Each record is immutable after implementation begins; changes create a new ADR (or an addendum). Rules per ADR format (based on Mark Richards/Nygard lightweight format):

```
# ADR-XXXX — Title
Status: Accepted (Proposed | Accepted | Superseded by ADR-YYYY)
Context: Why we face this decision.
Decision: What we decided.
Consequences: Trade-offs, follow-on effects.
```

## Index

| ID | Title | Status |
|---|---|---|
| ADR-0001 | Canonical Stack | Accepted (amended by 0016, 0021) |
| ADR-0002 | Nitro as the Foundational Server Runtime | Accepted |
| ADR-0003 | Framework HTTP API: Owned Pipeline, Elysia as Reference | Accepted |
| ADR-0004 | Model Layer: `defineModel` (Questpie-Inspired, Independent) | Accepted |
| ADR-0005 | Owned Router; TanStack Router as Reference | Accepted |
| ADR-0006 | Kwiva Owns SSR Orchestration | Accepted |
| ADR-0007 | Bun as the Primary Runtime (Node/Hosted Compatible) | Accepted |
| ADR-0008 | Vite+ as the Toolchain | Superseded by ADR-0021 |
| ADR-0009 | Better Auth for Authentication | Accepted |
| ADR-0010 | Modules as Package-Level Composition | Accepted |
| ADR-0011 | CLI-First Developer Experience | Accepted |
| ADR-0012 | Configuration from the Config Folder | Accepted (amended by 0020) |
| ADR-0013 | Convention Enforcement via Lint Gates (Oxlint) | Accepted |
| ADR-0014 | OpenTelemetry-First Observability | Accepted |
| ADR-0015 | Tenancy-First Data Access | Accepted |
| ADR-0016 | Engines Hidden, References Zero-Dependency | Accepted |
| ADR-0017 | Elysia-Style Repo & Package Structure; Many Equal Packages | Accepted |
| ADR-0018 | Function-Based Model DSL (`defineModel`) | Accepted |
| ADR-0019 | The `defineX` Convention | Accepted |
| ADR-0020 | Config Folder + Full Inline Overrides | Accepted |
| ADR-0021 | oxc Toolchain, Deeply Integrated; Vite+ Reference-Only | Accepted |

## Amend Process

- New decision → draft ADR (Proposed) → team review → Accepted.
- Superseding: mark old `Superseded by`, link new ADR, summarize change.
- Record adjacency: each ADR lists related docs/ADRs.
