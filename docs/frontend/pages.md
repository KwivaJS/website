# Pages (/docs/frontend/pages)



# Pages [#pages]

```ts title="src/ui/pages/todos.$id.tsx"
import { definePage } from "@kwiva/ui";

export default definePage({
  load(ctx) {
    return { id: ctx.params.id };
  },
  render({ props }) {
    return <main>Todo #{props.id}</main>;
  },
  head() {
    return { title: `Todo #${props.id}` };
  },
});
```

## DefinePage contract [#definepage-contract]

| Field           | Type                           | Notes                                                  |
| --------------- | ------------------------------ | ------------------------------------------------------ |
| `path`          | string                         | for the `(path, options)` form                         |
| `load(ctx)`     | `(ctx: HttpContext) => object` | server-side, streamed with SSR                         |
| `render(props)` | ReactElement                   | —                                                      |
| `head()`        | `PageHead`                     | `{title?, meta?, link?, canonical?, jsonLd?, robots?}` |
| `middleware`    | `Middleware[]`                 | —                                                      |

## Head options (`PageHead`) [#head-options-pagehead]

| Field       | Notes                    |
| ----------- | ------------------------ |
| `title`     | —                        |
| `meta`      | `{name?, content?}[]`    |
| `link`      | `{rel, href}[]`          |
| `canonical` | —                        |
| `jsonLd`    | JSON-LD structured data  |
| `robots`    | `robots.txt`-style rules |

## Discovery [#discovery]

Pages are discovered recursively from `src/ui/pages/**` via `pagesFromRegistry`; `derivePageRoute` maps file → route (`index.tsx` → root, `$id` → `:id`, `$` → `*`).

## `streamPage(options)` [#streampageoptions]

Streaming SSR variant: `{head, tree, seed, clientScript, extraScripts?}`.

## NotFound/Redirect [#notfoundredirect]

`redirect(path, status?)`, `notFound()` throw special classes handled by SSR.
