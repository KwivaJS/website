# Your First Page (/docs/getting-started/first-page)



Pages are the frontend half of a Kwiva application. A page is a `definePage` factory in `src/ui/pages/` whose file path becomes the URL. Loaders fetch data on the server (or at build time for static output); the component renders it with streaming SSR; and the router, the typed client, and the data hooks are all wired by the framework.

## Create a Page [#create-a-page]

Create a new file in `src/ui/pages/`:

```tsx title="src/ui/pages/posts.tsx"
// src/ui/pages/posts.tsx
import { definePage } from '@kwiva/react'

export default definePage({
  loader: async ({ client }) => {
    const posts = await client.posts.list({ page: 1 })
    return { posts }
  },
  component: ({ loaderData: { posts } }) => (
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.data.map((post) => (
          <li key={post.id}>
            <a href={`/posts/${post.id}`}>{post.title}</a>
          </li>
        ))}
      </ul>
    </main>
  ),
})
```

The generator scaffolds a typed stub for any path:

```bash title="terminal"
kwiva make:page posts.$id
```

## File-Based Routing [#file-based-routing]

The file path determines the URL. Flat files map one-to-one; directories create nested paths:

| File                                | URL                 |
| ----------------------------------- | ------------------- |
| `src/ui/pages/index.tsx`            | `/`                 |
| `src/ui/pages/about.tsx`            | `/about`            |
| `src/ui/pages/posts.tsx`            | `/posts`            |
| `src/ui/pages/posts.index.tsx`      | `/posts`            |
| `src/ui/pages/posts.$id.tsx`        | `/posts/:id`        |
| `src/ui/pages/posts.$id.edit.tsx`   | `/posts/:id/edit`   |
| `src/ui/pages/settings/profile.tsx` | `/settings/profile` |
| `src/ui/pages/files.$.tsx`          | `/files/*` (splat)  |

Conventions: `$param` segments are dynamic params, a trailing `.$` captures a splat, `__root.tsx` is the root layout, and folders can hold nested `_layout.tsx` files. Invalid `to`, `params`, and `search` values fail at compile time — route tree types are generated into `src/.kwiva/types`.

## Dynamic Parameters [#dynamic-parameters]

Use `$param` for dynamic segments and read them from the loader and component:

```tsx title="dynamic-parameters.tsx"
// src/ui/pages/posts.$id.tsx
import { definePage } from '@kwiva/react'

export default definePage({
  loader: async ({ params, client }) => {
    const post = await client.posts.get(params.id)
    return { post }
  },
  component: ({ loaderData: { post } }) => (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  ),
})
```

## The Typed RPC Client [#the-typed-rpc-client]

The `client` injected into loaders is fully typed against your controllers and models:

```ts title="the-typed-rpc-client.ts"
const posts = await client.posts.list({ page: 1 })  // typed response
const post = await client.posts.get(params.id)       // typed params and response
```

Loader results are themselves typed: `loaderData` in the component matches the shape returned by `loader`, end to end. There are no `any` bridges between server data and the rendered markup.

## Loaders and Loader Dependencies [#loaders-and-loader-dependencies]

Loaders run before render (on the server for SSR, then hydrate on the client). `loaderDeps` narrows when a loader refetches — here it refetches only when the page changes, not on every render:

```tsx title="loaders-and-loader-dependencies.tsx"
loaderDeps: ({ search: { page } }) => ({ page }),
```

Redirects and guards go in `beforeLoad`:

```tsx title="loaders-and-loader-dependencies-2.tsx"
beforeLoad: ({ session, location }) => {
  if (!session.user) throw redirect({ to: '/login', search: { back: location.href } })
},
```

## Search Params [#search-params]

Search parameters are typed and validated per page. Declare a schema and every read is checked:

```tsx title="search-params.tsx"
import { definePage } from '@kwiva/react'

export default definePage({
  validateSearch: (s) => s.object({
    q: s.optional(s.string()),
    page: s.optional(s.number()),
  }),
  loader: async ({ search, client }) => ({
    results: await client.posts.list({ where: { q: search.q }, page: search.page ?? 1 }),
  }),
})
```

Typed navigation carries the search shape:

```tsx title="search-params-2.tsx"
navigate({ to: '/posts', search: { page: 2 } })
```

## Streaming SSR [#streaming-ssr]

Use `stream()` for deferred data that shouldn't block the initial HTML — the shell streams first, the deferred slice suspends, and the rest fills in:

```tsx title="streaming-ssr.tsx"
import { definePage, stream } from '@kwiva/react'

export default definePage({
  loader: async ({ params, client }) => {
    const post = await client.posts.get(params.id)
    const comments = stream(
      client.comments.list({ postId: params.id })
    )
    return { post, comments }
  },
  component: ({ loaderData: { post, comments } }) => (
    <article>
      <h1>{post.title}</h1>
      <Suspense fallback={<p>Loading comments...</p>}>
        <Comments data={comments} />
      </Suspense>
    </article>
  ),
})
```

## Root Layout and Nested Layouts [#root-layout-and-nested-layouts]

`__root.tsx` wraps every route with providers and an outlet:

```tsx title="src/ui/pages/__root.tsx"
// src/ui/pages/__root.tsx
import { definePage, Providers, Outlet } from '@kwiva/react'

export default definePage({
  component: () => (
    <Providers>            {/* session, query cache, i18n, theme */}
      <nav>My App</nav>
      <Outlet />
    </Providers>
  ),
})
```

The framework injects the session, the typed client, config, and the data-hook cache into context — loaders and hooks consume them without wiring.

## Navigation [#navigation]

Typed links and programmatic navigation are compile-checked:

```tsx title="navigation.tsx"
import { Link, useNavigate } from '@kwiva/react'

// typed to/params/search — invalid values fail at compile time
<Link to="/posts/$id" params={{ id: post.id }} preload="intent">
  {post.title}
</Link>

const navigate = useNavigate()
navigate({ to: '/posts', search: { page: 2 } })
navigate({ to: '..', relative: true })
```

`preload="intent"` prefetches the loader data on hover or focus into the same cache the data hooks read — no double fetch between navigation and render.

## Data Hooks [#data-hooks]

Beyond loaders, pages can call the data hooks directly for client-side data — caching, invalidation, and optimistic updates included:

```tsx title="data-hooks.tsx"
import { definePage, useList, useMutation, invalidate } from '@kwiva/react'

export default definePage({
  component: function Todos() {
    const { data, isPending } = useList(Todo, { orderBy: { createdAt: 'desc' } })
    const add = useMutation(Todo.create, { onSuccess: () => invalidate(Todo) })
    return <TodoForm onAdd={(title) => add.mutate({ title })} todos={data} loading={isPending} />
  },
})
```

## UI States [#ui-states]

Pages can provide bespoke loading, error, and not-found states:

```tsx title="ui-states.tsx"
pendingComponent: PostSkeleton,        // shown after pendingMs
pendingMs: 200, pendingMinMs: 300,     // debounce for fast loads
errorComponent: ({ error }) => <ErrorPanel error={error} />,
notFoundComponent: () => <p>No such post</p>,
```

`notFound()` can be thrown from a loader to trigger the not-found state explicitly.

## Head and Meta [#head-and-meta]

Each page declares its own document head from loader data:

```tsx title="head-and-meta.tsx"
head: ({ loaderData }) => ({
  title: loaderData.post.title,
  meta: [{ name: 'description', content: loaderData.post.excerpt }],
}),
```

## What to Read Next [#what-to-read-next]

* [Pages](/docs/frontend/pages) — the complete page reference
* [File-Based Routing](/docs/frontend/routing) — every routing convention
* [Loaders](/docs/frontend/loaders) — data loading patterns
* [Data Hooks](/docs/frontend/data-hooks) — `useResource`, `useList`, `useMutation`
* [Streaming SSR](/docs/rendering/streaming) — streaming and deferred rendering
