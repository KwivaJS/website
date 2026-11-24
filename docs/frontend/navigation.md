# Navigation (/docs/frontend/navigation)



# Navigation [#navigation]

## `Link` (soft navigation) [#link-soft-navigation]

```tsx
import { Link } from "@kwiva/ui";
<Link href="/about" prefetch={true}>About</Link>
```

## `useRouter` — `visit(url, {replace?, preserveState?})`, `reload()`, `back()`, `on("start"|"finish"|"error")` [#userouter--visiturl-replace-preservestate-reload-back-onstartfinisherror]

## `usePage` — `{url, component, props, session}` [#usepage--url-component-props-session]

## `hydrateApp({pages, layouts?, events?})` — hydrate on client load [#hydrateapppages-layouts-events--hydrate-on-client-load]

## Prefetch [#prefetch]

`setLinkPrefetcher(fn)` — custom fetcher for prefetches (via fetchEnvelope).

## Scroll restoration [#scroll-restoration]

`installScrollRestoration(events, options?)` → disposer.

> \[!TIP]
> `fetchEnvelope(url)` returns `{component, url, props}` for soft-nav assets.
