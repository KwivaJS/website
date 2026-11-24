# Frontend Architecture (/architecture/frontend-architecture)



# Frontend Architecture [#frontend-architecture]

Kwiva owns SSR (ADR-0006):

```
GET /path
├── resolveRoute
├── layout.resolveLayouts
├── page.load (SSR)
└── renderPage → document
```

## Data flow [#data-flow]

`page.load` → props → `renderPage` → tree → hydrateApp.

## Types [#types]

Typed via `src/.kwiva/types/route-tree.gen.ts`.

## Next [#next]

See [Frontend](/docs/frontend/), [Rendering](/docs/rendering/).
