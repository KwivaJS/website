# ADR-0003 — Framework HTTP API: Owned Pipeline, Elysia as Reference

**Status**: Accepted (supersedes the original "Elysia as the Typed HTTP Layer" decision) · **Updated**: 2026-09-08

## Context

Kwiva needs an HTTP-authoring layer with strong typing, schema-first validation, lifecycle hooks, and OpenAPI generation — hosted on the Nitro foundation without fighting it. The original decision used Elysia as a hidden engine; owning the surface outright preserves the API shape while removing version coupling and enabling the Elysia-mirroring internal structure.

## Decision

**`@kwiva/http` implements the HTTP pipeline; Elysia is reference-only (zero dependency).**

- App surface: `defineController`, `defineMiddleware`, `defineServerRoute`, `defineTask` — with the full Elysia-grade feature set: lifecycle (`onRequest → onParse → onTransform → onBeforeHandle → onAfterHandle → onResponse → onError → onStop`), guards, macros, state/decorate/resolve, body/query/params/headers/cookies validation (Standard Schema), WebSocket routes, error helpers, OpenAPI from the route manifest.
- Package internals mirror the elysiajs/elysia repo `src/` tree: flat core (`context.ts`, `compose.ts`, `cookies.ts`, `error.ts`, `manifest.ts`, `parse-query.ts`, `formats.ts`, `trace.ts`) + `adapter/`, `type-system/`, `universal/`, `ws/` (ADR-0017).
- Generated model routes (from `defineModel` IR) and hand-authored controllers mount into the same pipeline; the engine layer is reserved for infra concerns (route rules, presets).
- `compose(app)` produces the web-standard handler bound through the Nitro server entry.
- The typed RPC client (`@kwiva/client`) mirrors Eden Treaty semantics: type-level inference from the route manifest, zero codegen.

## Consequences

- One typed API path for app code; the pipeline is Kwiva's to evolve without upstream release coupling.
- Reimplementation cost: lifecycle, validation wiring, and typing internals are Kwiva deliverables (parity table in `07-feature-catalog §4`; scope risk tracked as R1).
- Elysia's evolution is tracked as a reference for ideas only — adopted through ADRs.

**Related**: ADR-0001, ADR-0002, ADR-0004, ADR-0016, ADR-0017, `docs/framework/foundation/04-framework-http.md`, `docs/framework/server/01-request-lifecycle.md`, `docs/framework/research/07-elysia.md`
