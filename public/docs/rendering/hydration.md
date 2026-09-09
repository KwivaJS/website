# Hydration (/docs/rendering/hydration)



Hydration is how the server-rendered page becomes a live application. Kwiva hydrates the **whole page** — there are no islands and no per-widget bootstrapping. The server's rendering state crosses the gap as a **cache transfer**: loader data and deferred values serialize into the stream and rehydrate into the client's data-hook cache under identical keys, so the client never refetches what the server already computed.

Because rendering is framework-owned end to end (ADR-0006), the hydration contract is part of the same design as the loader and the cache — not a bridge between two different stacks.

## The Hydration Contract [#the-hydration-contract]

The pipeline carries state in three moves:

```plaintext title="the-hydration-contract.txt"
server: loaders run → results dehydrated into a state script at the stream tail
client: the state script rehydrates into the data-hook cache (no refetch)
router: resumes at the same route with the same search state
```

Because the cache is keyed identically on both sides, hydration is a cache transfer, not a data fetch. The first interactive frame reads the exact entries the server filled. In streaming mode, loader data and deferred promises dehydrate together into one state payload at the stream tail — the shell has already painted, but the state script carries the complete result. See [Streaming SSR](/docs/rendering/streaming).

## What the State Script Carries [#what-the-state-script-carries]

The dehydrated payload in the document is the cache, in the same shape the hooks read:

```plaintext title="what-the-state-script-carries.txt"
server state script
  ├─ loader results (keyed by route + params + search)
  ├─ deferred promises (keyed identically, resolved when the chunk arrives)
  └─ typed reviver markers (dates, model rows)
```

It is not a snapshot of the rendered HTML — it is the cache entries themselves. When the server rendered `useResource(Post, id)`, the client hydrates that exact entry; there is no reconstruction and no reconciliation pass over JSON blobs. That is what makes the first interactive frame and the server-rendered frame agree on data.

## Full Hydration, No Islands [#full-hydration-no-islands]

Every matched route — layout, page, deferred boundary — hydrates. There is no manual choice about which component "wakes up"; the tree that rendered on the server is the tree that hydrates on the client. This keeps render and navigation behavior identical across server and client, which is what makes the same `definePage` files run in server-rendered and single-page modes without changes:

| Property                 | Value                                     |
| ------------------------ | ----------------------------------------- |
| Hydration scope          | The whole document, layout chain included |
| Per-widget bootstrapping | None — no islands, no opt-in              |
| Server/client parity     | Same tree, same data, same route          |
| Streamed boundaries      | Hydrate with their chunk when it arrives  |

The trade-off of full hydration — a larger client-tree cost than island approaches — buys behavioral identity. A page behaves on the client exactly as it rendered on the server, and the mode projection (`fullstack` → `api+spa` → `static`) does not change page code.

## Loader Data, Already Warm [#loader-data-already-warm]

The practical consequence is that data hooks start warm. A page whose loader fetched a post hydrates into a state where `useResource(Post, id)` resolves the same record instantly; a list whose loader used `stream()` hydrates its deferred chunk when that chunk arrives. Client-side navigation later reuses the same entries, and mutations invalidate exactly what they touch. See [Data Hooks](/docs/frontend/data-hooks).

```plaintext title="loader-data-already-warm.txt"
hydration → useResource(Post, id) resolves immediately
         → no isPending flash
         → invalidation refreshes from the server on change
```

## The Typed Reviver [#the-typed-reviver]

Serialized loader data is restored with a typed reviver, so structured values survive the trip with their identity intact:

* **Dates** deserialize as real date values, not strings
* **Class instances such as model rows** restore their shape and methods consistently with how the server rendered them

The same reviver is used on server and client, so a date rendered server-side and the identical date read from a hook after hydration agree down to the timezone. This is what lets model rows passed through loaders keep their method surface on the client.

## Avoiding Serialization Surprises [#avoiding-serialization-surprises]

A few practices keep hydration deterministic:

* Return loader data that is JSON-compatible plus the documented reviver types (dates, model rows)
* Do not rely on functions or runtime handles in loader output — they cannot cross the stream
* Keep secrets out of loader data — everything a loader returns is serialized into the HTML the client receives. Client bundles and pages must never carry secrets (enforced by the build)
* Prefer plain, serializable shapes; idiosyncratic structures are where serialization surprises start, and the loader is where they are diagnosed

See [Pages](/docs/frontend/pages) for the loader return contract and [Security: Production](/docs/security/production) for the secret-handling counterpart.

## Hydration-Safe Rendering [#hydration-safe-rendering]

Hydration stays safe when the server and client render the same tree from the same data. Streaming preserves that discipline: deferred chunks arrive as complete regions and hydrate into their boundaries, rather than patching text fragments.

```plaintext title="hydration-safe-rendering.txt"
server tree == client tree
   └─ suspense boundaries hydrate with their streamed chunk
   └─ deferred values that reject → boundary error state with retry
   └─ personalization → session-scoped hooks load client-side on top of a cached shell
```

Because the tree shape is generated from the same `definePage` files on both sides, the only source of drift is data — and the cache transfer makes the data identical by construction.

## Personalization After Hydration [#personalization-after-hydration]

The hydration split is also the personalization boundary. Public shells can be cached with incremental regeneration, while session-specific fragments load after hydration through data hooks — `useResource` reading session-scoped endpoints that are never cached. The page skeleton is stale-safe and public; the private content is fresh per user and fetched client-side.

```plaintext title="personalization-after-hydration.txt"
isr cached shell          → hydrates for every visitor from the same HTML
session-scoped fragments  → load after hydration, keyed per user, never cached
```

The framework refuses to cache responses that set `Set-Cookie`, so the shell stays public by contract and the private part stays client-side by construction. See [Caching Strategies](/docs/rendering/caching) and [Response Caching](/docs/http/caching).

## Compact Runtime Mode [#compact-runtime-mode]

A compact compatibility runtime ships the same pipeline with a smaller bundle, selected in the UI configuration. Hydration semantics — cache transfer, island-free boot, the typed reviver — are unchanged; app code does not differ between runtimes.

```ts title="src/config/ui.ts"
// src/config/ui.ts
export default defineConfig('ui', {
  defaults: { runtime: 'react', theme: 'kwiva' },   // 'compact' for the compact runtime
})
```

See [Frontend](/docs/frontend) for runtime selection and [SSR](/docs/rendering/ssr) for the streaming pipeline that feeds hydration.

## Live Data After Hydration [#live-data-after-hydration]

Hydration transfers the server's snapshot; live data arrives after. Realtime subscriptions — channels, events — connect on top of the hydrated cache and update the same entries a loader or hook populated, so a page that hydrates with an event stream already attached renders the server snapshot and then live-updates in place. See [Real-Time Data on the Client](/docs/realtime/client-usage) and [Events](/docs/realtime/events).

## Debugging Hydration [#debugging-hydration]

The dev overlay surfaces the hydration contract: the cache entries the state script carried, which keys hydrated cleanly, and any reviver warnings for values that could not round-trip. Hydration problems are usually data-shape problems, and the overlay points at the exact key. See [Observability: Dev Overlay](/docs/observability/dev-overlay).

## Hydration and the Request Timeline [#hydration-and-the-request-timeline]

Hydration closes the timeline that starts at the request: the server streams, the shell paints, the state script transfers the cache, and the client hydrates — all within the spans emitted for SSR wall time, time-to-first-byte, and hydration time. See [Request Lifecycle](/docs/http/lifecycle) and [Observability](/docs/observability).

## What's Next [#whats-next]

* [Server-Side Rendering](/docs/rendering/ssr) — what the server hands to hydration
* [Streaming SSR](/docs/rendering/streaming) — how streamed chunks hydrate
* [Data Hooks](/docs/frontend/data-hooks) — the cache hydration fills
* [Caching Strategies](/docs/rendering/caching) — the personalization split after hydration
* [Frontend](/docs/frontend) — the page surface that produces the hydrated tree
