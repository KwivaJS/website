# Research — TanStack Router (v1)

**Source**: https://tanstack.com/router (docs), live research 2026-09-08
**Relevance**: **Reference only** (ADR-0005, ADR-0016) — the ergonomics model for `@kwiva/router` (owned, zero dependency).

## Why Router (not Start)

TanStack Router is the fully client+server routing library. **TanStack Start** is a full-stack framework on top. Kwiva deliberately implements **Router-grade ergonomics in its own router + Kwiva-owned SSR** (ADR-0005, ADR-0006) to keep deployment and SSR orchestration under Kwiva's control via Nitro, rather than any Vite-plugin flow.

## Core Concepts (what we mirror)

- File-based routing with `createFileRoute` + generated `routeTree.gen`; code-based routing also supported. → Kwiva: file-based `definePage` + generated route-tree types in `src/.kwiva/types`.
- **Fully typed** routes: typed paths, params, search params, all `loaderData` — type-safety end-to-end.
- Loaders: parallel loading, `preload` (link-hover based), defer/streaming data, caching (`maxAge/staleTime`), invalidators, optimistic updates.
- Route tree nesting = layout components + route-level rendering.
- Middleware (route/global) for auth, tenant scoping, logging.
- `RouterProvider`/`RouterClient` for code-based vs file-based.
- Integrations: TanStack Query, tRPC — Kwiva standardizes typed-client equivalents instead.

## SSR Primitives (documented — the pattern our renderer mirrors)

The SSR utility shape (`createRequestHandler`, `defaultRenderHandler`, `defaultStreamHandler`, `renderRouterToStream`, `RouterClient` hydration) is the reference for `@kwiva/react`'s SSR orchestration:

- `createRequestHandler` takes a **web-standard Request**, returns a web-standard Response promise — the exact boundary our owned HTTP pipeline provides.
- Streaming dehydration/hydration for late data (stream data alongside markup) — mirrored by our `stream(promise)` deferreds.
- Loader data auto-dehydrated/rehydrated — mirrored by our cache-transfer hydration.
- Server history auto-switches to memory history.
- Serialization beyond JSON: `undefined`, `Date`, `Error`, `FormData` out of the box; `Map`/`Set`/`BigInt` need custom serializers — our typed reviver follows the same model.

Kwiva implements these natively so upstream API drift is contained (the library is not in the dependency tree at all).

## Router Features We Mirror (catalog §6 parity table)

- `authenticated routes` guards before loader execution → `beforeLoad`.
- `deferred data` for slow third-party sections → `stream()`.
- Location masking, scroll restoration, view transitions, navigation blocking.
- Typed `Link`/`useNavigate` with compile-checked `to/params/search`.
- `validateSearch` schema validation.
- Preloading (`preload="intent"`) feeding the same cache the hooks read.

## Gaps Kwiva Fills (beyond the reference)

- **Loader → server data conventions**: no "one right way" in Router; Kwiva prescribes the typed RPC client, tenancy, auth in loaders (lint-gated).
- **Layout/dir conventions**: `src/ui/pages/` dotted-file conventions standardized by Kwiva (`frontend/01-routing.md`).
- **Env separation**: Router docs assume manual env wiring; Kwiva provides typed env/config derived for the client.

## Version Tracking

Track Router v1 ergonomics each release (as a reference) — adopt good ideas into `@kwiva/router` through ADRs; no version pin exists because there is no dependency.
