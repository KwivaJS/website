# Frontend 01 — Routing

**Status**: Locked (ADR-0005) · **Updated**: 2026-09-08 · **Docset**: v0.3

The **owned router** (`@kwiva/router` core + `@kwiva/react` bindings). TanStack Router is the reference: its ergonomics are implemented natively; the library is not a dependency.

## File-based routes

```
src/ui/pages/
├─ __root.tsx              # root layout + providers + outlet
├─ index.tsx               # /
├─ about.tsx               # /about
├─ posts.index.tsx         # /posts
├─ posts.$id.tsx           # /posts/:id
├─ posts.$id.edit.tsx      # /posts/:id/edit
├─ settings/
│  ├─ profile.tsx          # /settings/profile
│  └─ security.tsx         # /settings/security
└─ files.$.tsx             # splat: /files/*
```

Conventions: flat + dotted paths, `$param` segments, `$` splat, `__root` root layout, folder for nested layouts (`settings/` can hold `_layout.tsx`).

## definePage — full surface (TanStack-parity)

```tsx
import { definePage, Link, useNavigate, notFound, stream } from '@kwiva/react'

export default definePage({
  // validation
  validateSearch: (s) => s.object({ q: s.optional(s.string()), page: s.optional(s.number()) }),

  // data
  loader: async ({ params, search, client }) => ({
    post: await client.posts.get(params.id),
    comments: stream(client.comments.list({ postId: params.id })),   // deferred
  }),
  loaderDeps: ({ search: { page } }) => ({ page }),                   // refetch only on page change

  // guards
  beforeLoad: ({ session, location }) => {
    if (!session.user) throw redirect({ to: '/login', search: { back: location.href } })
  },

  // UI states
  pendingComponent: PostSkeleton,
  pendingMs: 200, pendingMinMs: 300,
  errorComponent: ({ error }) => <ErrorPanel error={error} />,
  notFoundComponent: () => <p>No such post</p>,

  // meta
  head: ({ loaderData }) => ({
    title: loaderData.post.title,
    meta: [{ name: 'description', content: loaderData.post.excerpt }],
  }),

  // the component
  component: PostPage,
})
```

## Navigation

```tsx
// typed links — to/params/search are compile-checked
<Link to="/posts/$id" params={{ id: post.id }} preload="intent">
  {post.title}
</Link>

// programmatic
const navigate = useNavigate()
navigate({ to: '/posts', search: { page: 2 } })
navigate({ to: '..', relative: true })

// hooks
const { id } = Route.useParams()
const search = Route.useSearch()            // typed by validateSearch
const loaderData = Route.useLoaderData()    // typed by loader
```

Invalid `to`/`params`/`search` values fail **at compile time** — route tree types are generated into `src/.kwiva/types`.

## Router core features

| Feature | API | Reference (TR) |
|---|---|---|
| Route tree | generated from files | route tree codegen |
| Matching | score-based, splat, layouts | matcher |
| Loaders | async, parallel across matches, deduped | loader |
| Deferred/streamed | `stream(promise)` + Suspense | deferred |
| beforeLoad | guards with redirect/throw | beforeLoad |
| Search params | typed + validated, `Link search` | search middleware |
| Preload | `preload="intent"` on Link; `router.preloadRoute()` | preloading |
| Scroll restoration | per-key, `scrollRestoration: true` | scroll |
| Route context | `createRootWithContext({ session, client, config })` | context |
| History | browser, hash, memory (testing) | history |
| 404 | `notFound()` throw + `notFoundComponent` | not-found |

## Router context (SSR + client)

```tsx
// __root.tsx
import { definePage, Providers, Outlet } from '@kwiva/react'

export default definePage({
  component: () => (
    <Providers>            {/* session, query cache, i18n, theme */}
      <Layout>
        <Outlet />
      </Layout>
    </Providers>
  ),
})
```

The framework injects session, typed client, config, and the data-hook cache into context — loaders and hooks consume them without wiring.

## Preloading contract

- `<Link preload="intent">` — hover/focus triggers loader + data prefetch (via the typed client).
- Loader prefetch populates the **same cache** the data hooks read — no double fetch between navigate and render.

## Dev ergonomics

- Dev overlay lists route tree, loader timings, and cache state (v1.x).
- `kwiva make:page posts.$id` scaffolds with typed stub.
