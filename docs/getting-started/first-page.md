# Your First Page (/docs/getting-started/first-page)



# Your First Page [#your-first-page]

```tsx title="src/ui/pages/index.tsx"
import { definePage } from "@kwiva/ui";

export default definePage({
  load(ctx) {
    const todos = await ctx.store.todos.all();
    return { todos };
  },
  render({ props }) {
    return <main><ul>{props.todos.map((t) => <li>{t.title}</li>)}</ul></main>;
  },
  head() {
    return { title: "My App — Todos" };
  },
});
```

## definePage contract [#definepage-contract]

| Field           | Type                           | Notes                                                  |
| --------------- | ------------------------------ | ------------------------------------------------------ |
| `load(ctx)`     | `(ctx: HttpContext) => object` | server-side, SSR-only data                             |
| `render(props)` | `ReactElement`                 | —                                                      |
| `head()`        | `PageHead`                     | `{title?, meta?, link?, canonical?, jsonLd?, robots?}` |
| `middleware`    | `Middleware[]`                 | —                                                      |
| `path`          | string                         | when using `definePage(path, options)` form            |

## Routing [#routing]

`src/ui/pages/**` files map to routes:

| File                           | Route        |
| ------------------------------ | ------------ |
| `src/ui/pages/index.tsx`       | `/`          |
| `src/ui/pages/todos.$id.tsx`   | `/todos/:id` |
| `src/ui/pages/todos/index.tsx` | `/todos`     |

`$param` → `:param`, `$` → `*` (splat). Layouts in `src/ui/layouts/` wrap pages (`root.tsx` is the root layout).

## How SSR works [#how-ssr-works]

```plaintext
GET /todos/$id
├── resolveRoute(pathname) → page module
├── page.load(ctx) → props (server, streaming)
├── layout.render(props, ctx)
└── document → Response
```

## What to read next [#what-to-read-next]

* [UI Components](/docs/frontend/ui-components)
* [Routing](/docs/frontend/routing)
* [Data Hooks](/docs/frontend/data-hooks)
* [Streaming SSR](/docs/rendering/streaming)
