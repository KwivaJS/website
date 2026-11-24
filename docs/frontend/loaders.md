# Loaders (/docs/frontend/loaders)



# Loaders [#loaders]

`definePage` has `load(ctx)` — the loader.

## Loader API [#loader-api]

* `ctx.params` / `ctx.query`
* `ctx.waitUntil(promise)` — defer until response sent
* Deps via `loaderDeps` — n/a for Kwiva (caching per request)

## Streaming [#streaming]

`streamPage` for partial HTML with Suspense; defer via `defer()` segments.

## Example [#example]

```tsx
export default definePage({
  load(ctx) {
    return { id: ctx.params.id };
  },
  render({ props, ctx }) {
    return <article>{props.id}</article>;
  },
});
```

> \[!TIP]
> Loaders are awaited (no async iterator today); see [Streaming SSR](/docs/rendering/streaming).
