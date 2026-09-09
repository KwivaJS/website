# ADR-0015 — Tenancy-First Data Access

**Status**: Accepted · **Updated**: 2026-09-08

## Context

Multi-tenant SaaS data leakage is a catastrophic failure class. Kwiva must make tenancy safe by default — not an afterthought flag.

## Decision

Tenancy is a **first-class data access concern**:
- Tenant-scoped models declare `tenantField: 'tenantId'` (model option; or globally via `src/config/tenancy.ts`); the model layer **injects** `tenantId` scoping into every query/write from the request's tenant context (no manual where-spread).
- Tenant context is derived per request (subdomain/path/header resolution order, configurable) and required for tenant-scoped ops (missing → integrity error).
- Cross-tenant write attempts → `CONFLICT` (409); reads physically scoped at SQL level; cross-tenant reads indistinguishable from 404s.
- Row-level (single DB) is default; db-per-tenant mode documented for compliance-heavy cases (never bypasses row checks).
- Multi-instance/edge: cache keys, storage paths, realtime topics, and job payloads all carry tenantId.
- Invariant test suite (`kwiva test --tenancy`) seeds two tenants and asserts isolation end-to-end.

## Consequences

- Tenant isolation is secure-by-construction at the data layer rather than convention-by-handlers.
- Adds schema requirement (`tenantField` declaration) and context plumbing — cost is small relative to the safety win.
- Requires discipline in escape-hatch code (raw SQL labeled/audited).

**Related**: ADR-0004, ADR-0009, `docs/framework/platform/03-tenancy.md`, `docs/framework/platform/02-authorization.md`
