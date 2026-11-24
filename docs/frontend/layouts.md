# Layouts (/docs/frontend/layouts)



# Layouts [#layouts]

`src/ui/layouts/**` — recursive; every page gets root layout first.

## `layoutSegments(relativePath)` [#layoutsegmentsrelativepath]

| File                        | Segments                    |
| --------------------------- | --------------------------- |
| `root.tsx`                  | `[]` (root)                 |
| `admin/index.tsx`           | `["admin"]`                 |
| `admin/todos/[id]/root.tsx` | `["admin", "todos", ":id"]` |

## `layoutComponent(module, displayPath)` — → `LayoutComponent` [#layoutcomponentmodule-displaypath---layoutcomponent]

## `resolveLayouts(pathname, layouts)` [#resolvelayoutspathname-layouts]

Shallowest-first; page wraps everything (deepest wraps page first).

## Layout file shape [#layout-file-shape]

```tsx
import { layoutSegments } from "@kwiva/ui";
export default function AdminLayout({ children }) {
  return <div className="admin">{children}</div>;
}
```

> \[!TIP]
> Custom layouts via `File`/`Folder`/`Files` MDX components in docs.
