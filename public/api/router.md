# @kwiva/router (/api/router)



`@kwiva/router` is Kwiva's owned, type-safe file-based router. Routes are declared as files under `src/ui/pages/`, compiled into a typed route tree, and served by a score-based matcher. It implements loaders, deferred data, guards, search-param validation, and typed navigation natively — no third-party router is involved. The core runtime lives in `@kwiva/router`; the React surface (`definePage`, `Link`, `useNavigate`, `stream`, `notFound`, `redirect`, `Outlet`) is bound and re-exported by [`@kwiva/react`](/api/react).

## Package Layout [#package-layout]

| Export surface                                                                               | Package         | Description                            |
| -------------------------------------------------------------------------------------------- | --------------- | -------------------------------------- |
| Route tree codegen, matcher, history adapters, context                                       | `@kwiva/router` | Core routing runtime, no UI dependency |
| `definePage`, `Link`, `useNavigate`, `stream`, `notFound`, `redirect`, `Outlet`, route hooks | `@kwiva/react`  | React bindings and page definition     |

Every page file is created with `definePage` from `@kwiva/react` and default-exported; the router reads the resulting definition from the route tree types it generates into `src/.kwiva/types`.

## Route Conventions [#route-conventions]

Routes map one-to-one to files under `src/ui/pages/`. The router supports flat plus dotted paths, `$param` segments, `$` splat segments, a `__root` layout file, and folders for nested layouts.

```plaintext title="route-conventions.txt"
src/ui/pages/
├─ __root.tsx              # root layout + providers + outlet
├─ index.tsx               # /
├─ about.tsx               # /about
├─ posts.index.tsx         # /posts
├─ posts.$id.tsx           # /posts/:id
├─ posts.$id.edit.tsx      # /posts/:id/edit
├─ settings/
│  ├─ profile.tsx          # /settings/profile
│  ├─ security.tsx         # /settings/security
│  └─ _layout.tsx          # nested layout around /settings/**
└─ files.$.tsx             # splat: /files/*
```

| File                   | Route               | Notes                                             |
| ---------------------- | ------------------- | ------------------------------------------------- |
| `__root.tsx`           | Root layout         | Wraps every route; holds providers and the outlet |
| `index.tsx`            | `/`                 | Directory index                                   |
| `about.tsx`            | `/about`            | Static segment                                    |
| `posts.index.tsx`      | `/posts`            | Index for the `posts` branch                      |
| `posts.$id.tsx`        | `/posts/:id`        | Dynamic `$param` segment                          |
| `posts.$id.edit.tsx`   | `/posts/:id/edit`   | Nested dynamic segment                            |
| `settings/profile.tsx` | `/settings/profile` | Folder organization, no layout                    |
| `settings/_layout.tsx` | `/settings/**`      | Folder layout, applies to children                |
| `files.$.tsx`          | `/files/*`          | `$` splat captures the rest of the path           |

Conventions at a glance: dots separate path segments within one file name, `$name` marks a dynamic segment, a trailing `$` marks a splat, `__root` is the root layout, and folders may hold `_layout.tsx` files that wrap their nested routes.

## Route Tree Generation [#route-tree-generation]

The router scans `src/ui/pages/**` and derives a typed route tree for your app.

* The route tree and its types are generated into `src/.kwiva/types`.
* Invalid `to`, `params`, and `search` values fail at **compile time** — the types encode every legal path, its `$param` names, and its validated search schema.
* No runtime codegen step: types flow from the generated tree, and the tree itself is what the matcher executes against.

```tsx title="route-tree-generation.tsx"
<Link to="/posts/$id" params={{ id: post.id }} />
```

## Matching [#matching]

Requests resolve against the generated route tree with a score-based matcher:

* Static segments score highest, then `$param` segments, then `$` splats, so `/posts/latest` wins over `/posts/$id` when both match.
* Layout files (`__root`, folder `_layout.tsx`) match structurally and wrap their child routes — a nested route renders through every layout above it.
* Loaders and guards for every matched route participate in a request; the deepest match owns the component.
* A path that matches no route falls through to the not-found handling of the enclosing layout.

## Loaders [#loaders]

`definePage({ loader })` is the single data-fetching surface for a page. Loaders run server-side during SSR and client-side during navigation, execute **in parallel across all matched routes**, and are deduplicated per request so a shared fetch is not repeated.

```tsx title="loaders.tsx"
import { definePage, stream } from '@kwiva/react'

export default definePage({
  loader: async ({ params, search, client }) => ({
    post: await client.posts.get(params.id),
    comments: stream(client.comments.list({ postId: params.id, page: search.page })),
  }),
})
```

| Loader context | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `params`       | Typed `$param` values for the matched route                  |
| `search`       | Typed, validated search params (see `validateSearch`)        |
| `client`       | The typed RPC client for this app, injected by the framework |

Loader results are typed from the returned object, become `loaderData` in the component and `head`, and are shared with the data-hook cache — a later render consumes the same entry instead of fetching again.

### Deferred data with `stream` [#deferred-data-with-stream]

A promise wrapped in `stream()` is deferred rather than awaited:

* The blocking shell renders immediately with whatever the loader awaited.
* Deferred values stream into their `Suspense` boundary as they resolve, on both SSR and the client.
* In the loader you return the promise as-is; downstream components read it through the loader data.

```tsx title="deferred-data-with-stream.tsx"
import { definePage, stream } from '@kwiva/react'

export default definePage({
  loader: async ({ params, client }) => ({
    post: await client.posts.get(params.id),
    comments: stream(client.comments.list({ postId: params.id })),
  }),
  component: ({ loaderData }) => (
    <article>
      <h1>{loaderData.post.title}</h1>
      <Suspense fallback={<p>Comments…</p>}>
        <CommentsLoader comments={loaderData.comments} />
      </Suspense>
    </article>
  ),
})
```

### Refetch scoping with `loaderDeps` [#refetch-scoping-with-loaderdeps]

`loaderDeps` narrows when a loader refetches after navigation. It receives the current route state and returns a dependency object; only changes to the returned fields trigger a new load.

```tsx title="refetch-scoping-with-loaderdeps.tsx"
export default definePage({
  validateSearch: (s) => s.object({ page: s.optional(s.number()) }),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ params, client, search }) => {
    const { data } = await client.posts.list({ postId: params.id, page: search.page })
    return { data }
  },
})
```

Here navigating from `/posts/123?page=2` to `/posts/123?page=3` refetches, while a search param not listed in `loaderDeps` does not.

## beforeLoad Guards [#beforeload-guards]

`beforeLoad` runs before loaders for every matched route and is the place to enforce auth and permission redirects. Throwing `redirect` or `notFound` aborts the load and short-circuits the pipeline.

```tsx title="beforeload-guards.tsx"
import { definePage, redirect } from '@kwiva/react'

export default definePage({
  beforeLoad: ({ session, location }) => {
    if (!session.user) {
      throw redirect({ to: '/login', search: { back: location.href } })
    }
  },
})
```

| beforeLoad context | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `session`          | Current session and typed user, injected by the framework |
| `location`         | The incoming location (`href` etc.)                       |

Guard semantics:

| Throw                      | Effect                                                                 |
| -------------------------- | ---------------------------------------------------------------------- |
| `redirect({ to, search })` | Issues a navigation to the target route; `search` carries query params |
| `notFound()`               | Renders the nearest `notFoundComponent`                                |
| any `Error`                | Renders the nearest `errorComponent`                                   |

## Search Params & Validation [#search-params--validation]

`validateSearch` declares the route's search schema with a Standard Schema validator builder. The schema drives three things: compile-time types for `search` and `Link`/`useNavigate` calls, runtime validation of incoming URLs, and refetch scoping via `loaderDeps`.

```tsx title="search-params-validation.tsx"
import { definePage } from '@kwiva/react'

export default definePage({
  validateSearch: (s) =>
    s.object({
      q: s.optional(s.string()),
      page: s.optional(s.number()),
      tab: s.optional(s.string()),
    }),
})
```

Invalid `search` values passed to `Link` or `useNavigate` are compile-time errors because the route tree types encode the schema.

## Typed Navigation [#typed-navigation]

### `<Link>` [#link]

`<Link>` is the declarative navigation primitive. `to`, `params`, and `search` are checked against the generated route tree.

```tsx title="link.tsx"
import { Link } from '@kwiva/react'

<Link to="/posts/$id" params={{ id: post.id }}>Read</Link>
<Link to="/posts/$id" params={{ id: post.id }} search={{ page: 2 }}>Page 2</Link>
<Link to="/posts/$id" params={{ id: post.id }} preload="intent">Hover to preload</Link>
```

| Link prop | Type          | Description                                                   |
| --------- | ------------- | ------------------------------------------------------------- |
| `to`      | Route path    | Target route, compiled against the route tree                 |
| `params`  | Route params  | Values for `$param` segments; required when the route has any |
| `search`  | Search object | Validated by the target route's `validateSearch`              |
| `preload` | `'intent'`    | Prefetch the target's loader on hover/focus (see Preloading)  |

### `useNavigate()` [#usenavigate]

Programmatic navigation uses the same typed target as `Link`.

```tsx title="usenavigate.tsx"
import { useNavigate } from '@kwiva/react'

const navigate = useNavigate()

navigate({ to: '/posts', search: { page: 2 } })
navigate({ to: '/posts/$id', params: { id: post.id } })
navigate({ to: '..', relative: true })
```

| Option     | Type          | Description                                                            |
| ---------- | ------------- | ---------------------------------------------------------------------- |
| `to`       | Route path    | Absolute path, or a relative target with `relative: true`              |
| `params`   | Route params  | Values for the target's `$param` segments                              |
| `search`   | Search object | Validated against the target route schema                              |
| `relative` | `boolean`     | Treats `to` as relative to the current route (`'..'` walks up a level) |

### Route-scoped hooks [#route-scoped-hooks]

Within a page, typed state is available through hooks on the generated `Route`:

```tsx title="route-scoped-hooks.tsx"
const { id } = Route.useParams()
const search = Route.useSearch()
const loaderData = Route.useLoaderData()
```

`useParams` is typed by the route's segments, `useSearch` by its `validateSearch` schema, and `useLoaderData` by its `loader` return type.

## Preloading [#preloading]

Preloading runs a route's loader before navigation and stores the result in the same cache the data hooks read, so navigating never double-fetches.

```tsx title="preloading.tsx"
<Link to="/posts/$id" params={{ id: post.id }} preload="intent">{post.title}</Link>
```

* `preload="intent"` triggers on hover and focus — the loader executes and its data lands in the shared cache.
* Programmatic preloading is available via `router.preloadRoute()`.
* Because the loader runs through the typed client and writes to the shared cache, render after navigation is a cache hit, not a re-request.

## Scroll Restoration [#scroll-restoration]

Scroll restoration is opt-in per router and keyed per route:

| Option              | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| `scrollRestoration` | `true` restores scroll position per route key on back/forward navigation |

| Behavior            | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| Default             | Scroll resets to top on navigation                          |
| Per-key restoration | Position is remembered per route key and restored on return |
| Custom              | Route-level behavior can replace the default restore        |

## Route Context [#route-context]

The router's context is created with `createRootWithContext`, which carries the objects every loader, guard, and hook consumes — session, client, and config — so nothing is threaded by hand.

```ts title="route-context.ts"
createRootWithContext({
  session: initialSession,
  client: appClient,
  config: appConfig,
})
```

On the root layout, the context is mounted through `Providers`, which injects session, the typed client, the data-hook cache, i18n, and theme for every route below it:

```tsx title="route-context-2.tsx"
import { definePage, Providers, Outlet } from '@kwiva/react'

export default definePage({
  component: () => (
    <Providers>
      <Layout>
        <Outlet />
      </Layout>
    </Providers>
  ),
})
```

## History Modes [#history-modes]

The router ships three history adapters:

| Mode      | Purpose                                                        |
| --------- | -------------------------------------------------------------- |
| `browser` | Default. Uses the History API for clean URLs                   |
| `hash`    | Hash-based history for hosts without server-side route support |
| `memory`  | In-memory history for tests and non-DOM environments           |

Memory history is what the test harnesses use — the router runs headless with full loader, guard, and validation behavior but no real location.

## Not-Found Handling [#not-found-handling]

404s are expressed as a typed `notFound()` throw, rendered by the nearest `notFoundComponent`:

```tsx title="not-found-handling.tsx"
import { definePage, notFound } from '@kwiva/react'

export default definePage({
  loader: async ({ params, client }) => {
    const { data: post, error } = await client.posts.get(params.id)
    if (error) throw notFound()
    return { post }
  },
  notFoundComponent: () => <p>No such post</p>,
})
```

| Surface             | Description                                                                            |
| ------------------- | -------------------------------------------------------------------------------------- |
| `notFound()`        | Thrown from a loader or guard to signal a missing resource                             |
| `notFoundComponent` | Rendered when `notFound()` is thrown or no route matches                               |
| Layout boundaries   | Each layout may supply its own `notFoundComponent`; the root one is the final fallback |

## Dev Ergonomics [#dev-ergonomics]

* The dev overlay lists the route tree, loader timings, and cache state for the current request (v1.x).
* `kwiva make:page posts.$id` scaffolds a route file with typed stubs, ready to extend.

## What to Read Next [#what-to-read-next]

* [Pages](/docs/frontend/pages) — `definePage` in practice
* [Routing](/docs/frontend/routing) — File-to-route mapping
* [Navigation & Link](/docs/frontend/navigation) — `<Link>`, `useNavigate`, preloading
* [Loaders & Data](/docs/frontend/loaders) — Loader pattern and deferred data
* [Nested Layouts](/docs/frontend/layouts) — `__root.tsx` and folder layouts
* [SSR](/docs/rendering/ssr) — How the router composes with the renderer
* [`@kwiva/react`](/api/react) — Full `definePage` contract and hooks
