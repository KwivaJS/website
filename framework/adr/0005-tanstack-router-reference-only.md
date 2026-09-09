# ADR-0005 — Owned Router; TanStack Router as Reference

**Status**: Accepted (supersedes the original "Use TanStack Router" decision; amended by ADR-0016) · **Updated**: 2026-09-08

## Context

Kwiva needs file-based routing with strong typing (loaders, params, search) and SSR support. TanStack offers Router (fully client/server capable but frameworkless) and Start (Next-like, framework-owned SSR + server functions). The original decision used TanStack Router as a dependency; the reference-only pivot keeps the ergonomics while removing coupling.

## Decision

**`@kwiva/router` implements the router; TanStack Router is reference-only (zero dependency).**

- File-based route tree with typed routes: `definePage` in `src/ui/pages/**` with typed `params`, `search`, `loaderData`; route-tree types generated into `src/.kwiva/types`.
- Loader semantics: parallel loading across matches, deduplication, deferred/streaming data, `loaderDeps`, preloading (`preload="intent"`).
- `beforeLoad` guards (auth/permission redirects), `pendingComponent`/`errorComponent`/`notFoundComponent`, scroll restoration, typed `Link`/`useNavigate`.
- Kwiva owns SSR orchestration (ADR-0006): request handler, streaming render, dehydration/hydration — mirroring the documented Router SSR utility *shape* (`createRequestHandler`-style boundary), not importing it.
- TanStack Start stays documented as a second-class migration path, not the default.
- TanStack Query remains the hidden engine behind data hooks (ADR-0016) — loaders prefetch into the same cache.

## Consequences

- Full control of SSR composition (streaming, header/context/session injection) instead of inheriting Start's server-fn model.
- Lose Start's auto-server-functions; we standardize via controllers + the typed RPC client (explicit, one API authoring layer).
- Reimplementation cost: matcher + type-generation are Kwiva deliverables (scope risk R2; type tests guard correctness).
- Router ergonomics evolve upstream — adopted as ideas through ADRs; no version pin exists because there is no dependency.

**Related**: ADR-0001, ADR-0006, ADR-0016, `docs/framework/frontend/01-routing.md`, `docs/framework/frontend/02-ssr.md`, `docs/framework/research/04-tanstack-router.md`, `docs/framework/research/05-tanstack-start.md`
