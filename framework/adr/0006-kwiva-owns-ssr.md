# ADR-0006 — Kwiva Owns SSR Orchestration

**Status**: Accepted · **Updated**: 2026-09-08

## Context

With the owned router (ADR-0005), Kwiva decides how SSR is delivered: who renders, how hydration data flows, how streaming works, and how per-request context (session/tenant) enters the tree.

## Decision

Kwiva owns the SSR pipeline (`@kwiva/react`, engine-side Nitro):
- Renderer entry: the owned request-handler boundary (Router-reference shape) mounted at the Nitro server entry via `compose(app)`.
- Per request: loaders execute server-side with injected context (session, tenant, config, locale); hydration via a typed state payload.
- Streaming-first: Suspense-aware `renderToReadableStream` with `stream(promise)` deferreds; fallback buffered render on presets without streaming (documented per preset).
- Loader data + data-hook cache dehydrate together — hydration is a cache transfer, not a re-fetch.
- Route rules (SWR/ISR/static) combine with the renderer; session-bearing responses are never cached.
- Status/headers/redirects from `beforeLoad`/loaders honored through the handler.

## Consequences

- Kwiva owns prerendering, code splitting, and dehydration — matching Next-class behavior.
- Streaming depends on runtime support; per-preset capability documented and auto-degraded.
- Unified SSR context: same session/tenant/config in loaders, handlers, and hooks.
- More code to maintain (renderer + hydration + prerender) in exchange for full control (scope risk tracked).

**Related**: ADR-0005, ADR-0002, `docs/framework/frontend/02-ssr.md`, `docs/framework/server/01-request-lifecycle.md`
