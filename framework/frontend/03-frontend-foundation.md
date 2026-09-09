# Frontend 03 — Frontend Foundation: React, Data Hooks, RPC

**Status**: Locked · **Updated**: 2026-09-08 · **Docset**: v0.3

`@kwiva/react` — React bindings: providers, data hooks (TanStack Query engine, hidden), and the typed RPC client integration (Eden-like). React by default; Preact via `preact/compat`.

## Runtime selection

```ts
// src/config/ui.ts
export default defineConfig('ui', {
  defaults: { runtime: 'react', theme: 'kwiva' },
})
```

`runtime: 'preact'` aliases react → preact/compat at build (oxc transform aliasing). One config flip; app code unchanged.

## The typed RPC client (Eden-parity)

```ts
// src/client.ts (scaffolded) — types derive from THIS app's controllers/models
import { createClient } from '@kwiva/client'
export const client = createClient()
```

```ts
// model API — typed from model IR
const { data, total } = await client.users.list({ where: { role: 'admin' }, page: 1 })
const ada = await client.users.get('usr_01...')
const updated = await client.users.update('usr_01...', { name: 'Ada L.' })
await client.users.delete('usr_01...')

// custom controller actions — typed from defineController
await client.posts.publish('pst_01...')

// subscriptions (WS/SSE)
const stream = client.chat.stream({ roomId })   // async iterable of typed events
```

Properties (parity with Elysia's Eden Treaty):
- **Zero codegen**: types flow at type level from the route manifest + model IR (ambient types in `src/.kwiva/types`).
- **Typed errors**: failures return `{ error: { code, message, issues? } }` discriminated unions.
- **SSR-safe**: server-side calls run in-process (no network) and dedupe per request.
- **Session-aware**: cookies flow automatically; CSRF token handled by the provider.

## Data hooks (TanStack Query-parity, hidden engine)

```tsx
import { useResource, useList, useMutation, useInfiniteList, invalidate, useApi } from '@kwiva/react'
import { Post } from '@kwiva/data'

// single
const { data, isPending, error } = useResource(Post, id)

// list
const { data, isFetching } = useList(Post, {
  where: { status: 'published' },
  orderBy: { createdAt: 'desc' },
  staleTime: 30_000,                    // TQ options passthrough
})

// mutation with optimistic update + auto-invalidation
const save = useMutation(Post.update, {
  optimistic: (input, current) => ({ ...current, ...input }),
  onSuccess: () => invalidate(Post),    // model-scoped invalidation
})

// infinite
const feed = useInfiniteList(Post, { cursor: 'createdAt', limit: 20 })

// escape hatch: custom query with RPC fetcher
const report = useApi(['report', id], () => client.reports.get(id))
```

Hooks consume loaders' results after navigation (same cache — no double fetch), and the full Query feature set is passed through: `staleTime, gcTime, refetchOnWindowFocus, refetchInterval, suspense, retry, select, placeholderData, enabled`. Devtools: `@kwiva/react/devtools` (skinned Query devtools).

Invalidation model: keys derive from **model identity + params**, so `invalidate(Post)` clears every list/detail/custom-key entry touching posts; `invalidateTags` clears route-rule caches.

## Providers

```tsx
// __root.tsx
import { Providers } from '@kwiva/react'

<Providers theme="kwiva" i18n={catalog}>   {/* injects session, client, cache, i18n, theme */}
  <App />
</Providers>
```

- `useSession()` — auth state, typed user, sign-in/out helpers.
- `useConfig('ui.theme')` — typed client config reads (`KWIVA_PUBLIC_*` only).
- `useT()` — i18n (v1.x).
- `useCan('posts.publish')` — policy checks mirrored client-side.

## Conventions (lint-gated)

- Loaders use the typed client — never raw `fetch` (`no-raw-fetch-in-loaders`).
- Components use data hooks over model identity — no hand-built query keys.
- No engine imports (`@tanstack/*` is internal).

## Forms & mutations (v1.x)

`useForm(Post.create)` — schema-driven fields (from model validation), server-side error mapping per field, submit → mutation pipeline. Built on the same cache; no separate form library required.
