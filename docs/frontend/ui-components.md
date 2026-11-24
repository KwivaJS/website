# UI Components (/docs/frontend/ui-components)



# UI Components [#ui-components]

Kwiva ships its own minimal UI kit built on Base UI + Tailwind v4.

## Theme (kwiva tokens) [#theme-kwiva-tokens]

From `src/app.css` — Kwiva design tokens (`--color-kwiva-*`), CSS utilities.

## Primitives [#primitives]

* **Pages/Layouts** — `definePage`, `layoutSegments`, `resolveLayouts`
* **Islands** — `defineIsland`, `renderIsland`
* **SSR** — `renderPage`, `streamPage`, `assetTags`, `hydrateApp`, `Link`, `setLinkPrefetcher`, `installScrollRestoration`
* **ErrorBoundary** — class, `fallback` + `onError`

## Utilities [#utilities]

`deterministicHash`, `useClickOutside`, `flattenMenu`, `dragStateResolver` (builder), `constrainDraggable`, `sanitizeStyleQuery`, `cn`, `extractSegmentClasses`, `mergeClassName`, `convertToDataTabs`, `toSectionNav` — internal.

## Rendering entry points [#rendering-entry-points]

From `@kwiva/ui/server` — `renderPage`, `discoverLayouts`, etc.

## Patterns [#patterns]

* **DataTable** — via `useResource` + Islands for interactivity
* **Forms** — `useForm` + Islands for validation
* **Modals** — via `PageRedirect`/`notFound` + Islands

> \[!TIP]
> UI is optional — apps can use any UI framework. Kwiva's built-in kit is minimal and typed.
