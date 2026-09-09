# Research — TanStack Query (v5)

**Relevance**: **Hidden engine** (ADR-0016) — the client cache behind `@kwiva/react` data hooks. App code never imports `@tanstack/*`.

## Core Model (what the engine provides)

- Request deduplication + caching for server state; results cached by `queryKey`.
- Queries/mutations/infinite queries: `useQuery`, `useMutation`, `useInfiniteQuery`.
- Prefetching, invalidation, optimistic updates, background refetch, retries, `staleTime`/`refetchInterval`, `gcTime`.
- Granular observer model → SSR-friendly: dehydrated state rehydrated on the client.
- Devtools ecosystem.

## Kwiva Usage (the wrapping contract)

- **Data hooks are the only surface**: `useResource`, `useList`, `useMutation`, `useInfiniteList`, `useApi` (escape hatch) — full TQ option passthrough (`staleTime`, `gcTime`, `suspense`, `select`, `enabled`, …).
- **Keys derive from model identity**: model + params (+ tenant) — apps never hand-build query keys; `invalidate(Model)` clears every derived entry.
- **Typed client feeds the cache**: the RPC client (`@kwiva/client`) is the fetcher inside hooks; loaders prefetch into the same cache (no double fetch between navigate and render).
- **Hydration**: loader data + cache state dehydrate in the same SSR payload so first client render doesn't refetch (cache transfer, `frontend/02`).
- **Devtools**: `@kwiva/react/devtools` (skinned Query devtools), dev-only flag.

## Key Decisions for Kwiva

1. Loaders do the **critical-path data**; the Query cache holds **post-initial / interactive data** — shared keys + `prefetch` in loaders avoid double-fetching.
2. Optimistic updates standardized for mutations against model resources.
3. Revalidation: `onSuccess` invalidation convention across hooks (model-scoped).
4. Offline/retry config defaults exported from `@kwiva/react` (no per-app tuning needed for v1).
5. Server-action alternatives (Start-style RPC) are **not** used — mutations go through HTTP routes (single API surface, one typed client).

## Version Guidance

- v5 is current major; the engine is a peer dependency of `@kwiva/react`, pinned by compatibility ranges; upgrades ride Kwiva releases.
- Watch Query vNext for suspense/observable changes; contained by the hooks surface.

## Ecosystem Note

- Router + Query work together out of the box; strong typing on both. SWR is a viable alternative but lacks the same mutation/invalidation ergonomics set — not defaulted.
