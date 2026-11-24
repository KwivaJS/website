# @kwiva/ui (/api/ui)



# @kwiva/ui [#kwivaui]

The frontend package: pages, layouts, routing, SSR, islands, navigation, and SEO. (Formerly separate `@kwiva/react` and `@kwiva/router` package pages — merged into this page.)

## Exports map [#exports-map]

| Subpath    | Target                                   | Symbols                                    |
| ---------- | ---------------------------------------- | ------------------------------------------ |
| `.`        | `src/index.ts`                           | all below                                  |
| `./server` | `src/server.ts` → `src/render/server.ts` | `createPagesController`, `discoverLayouts` |

## Pages — `definePage` [#pages--definepage]

| Symbol                                   | Kind      | Signature                                                     |
| ---------------------------------------- | --------- | ------------------------------------------------------------- |
| `definePage(options \| path, options)`   | function  | `Page{kind:"page", path?, load?, render, head?, middleware?}` |
| `Page` type                              | type      | `{kind, path?, load, render, head, middleware[]}`             |
| `redirect(path, status?)` / `notFound()` | functions | throw `PageRedirect`/`PageNotFound`                           |
| `resolveHead(page, props)`               | function  | → `PageHead`                                                  |
| `pagesFromRegistry(units)`               | function  | → `DiscoveredPage[]`                                          |
| `PageNotFound`, `PageRedirect`           | classes   | —                                                             |
| `PageHead` type                          | type      | `{title?, meta?, link?, canonical?, jsonLd?, robots?}`        |

## Layouts [#layouts]

| Symbol                                 | Kind     | Signature                                                        |
| -------------------------------------- | -------- | ---------------------------------------------------------------- |
| `layoutSegments(relativePath)`         | function | e.g. `["@b]+layout"` → `[]`; `routes/$id` → `["routes", "$id"]`  |
| `layoutComponent(module, displayPath)` | function | → `LayoutComponent`                                              |
| `matchPath(pattern, pathname)`         | function | → `{id}` params or `null` (`:param`, `*`)                        |
| `resolveLayouts(pathname, layouts)`    | function | → `ResolvedLayout[]` (shallowest-first, page wrapped by deepest) |

## Server rendering — `./server` [#server-rendering--server]

| Symbol                                   | Kind     | Signature                                 |
| ---------------------------------------- | -------- | ----------------------------------------- |
| `createPagesController(pages, options?)` | function | → `Controller` (one GET per page pattern) |
| `discoverLayouts(root?)`                 | function | → `DiscoveredLayout[]`                    |

## Render domain (main barrel) [#render-domain-main-barrel]

| Symbol                                       | Kind      | Signature                                                                              |
| -------------------------------------------- | --------- | -------------------------------------------------------------------------------------- |
| `renderPage(page, ctx, options?)`            | function  | → `Response` (JSON envelope if `Accept: application/json`: `{component, url, props}`)  |
| `renderNotFound(url)`                        | function  | → 404 Response                                                                         |
| `renderErrorPage(status, message, options?)` | function  | minimal HTML error doc                                                                 |
| `streamPage(options)`                        | function  | → `Response` (streaming SSR document)                                                  |
| `defineIsland(component, options)`           | function  | → `Island`                                                                             |
| `renderIsland(island, props?)`               | function  | `data-kwiva-island` + `data-kwiva-hydrate` markers                                     |
| `hydrateIslands(registry, options?)`         | function  | → count                                                                                |
| Asset helpers                                | functions | `assetUrl(manifest, name)`, `assetTags(manifest, entry?)`, `parseAssetManifest(value)` |

## Navigation [#navigation]

| Symbol                                       | Kind      | Signature                                     |
| -------------------------------------------- | --------- | --------------------------------------------- |
| `hydrateApp({pages, layouts?, events?})`     | function  | hydrateRoot + soft-nav; returns unmount       |
| `Link`                                       | component | soft-navigating anchor                        |
| `setLinkPrefetcher(fn?)`                     | function  | —                                             |
| `installScrollRestoration(events, options?)` | function  | → disposer                                    |
| `usePage()`, `useRouter()`, `RouterEvents`   | functions | `usePage(): {url, component, props, session}` |
| `resolvePage(pathname, pages)`               | function  | —                                             |
| `fetchEnvelope(url)`                         | function  | —                                             |

## SEO [#seo]

| Symbol                                               | Kind      | Signature                                                |
| ---------------------------------------------------- | --------- | -------------------------------------------------------- |
| `sitemap(entries, {origin})`, `sitemapResponse(...)` | functions | `SitemapEntry{path, lastmod?, changefreq?, priority?}`   |
| `robotsTxt(options?)`, `robotsResponse(...)`         | functions | `RobotsOptions{userAgent?, allow?, disallow?, sitemap?}` |

## Usage [#usage]

```ts title="src/ui/pages/posts.$id.tsx"
import { definePage } from "@kwiva/ui";
import { notFound } from "@kwiva/ui";

export default definePage({
  load(ctx) {
    return { id: ctx.params.id };
  },
  render({ props }) {
    return <main>{props.id}</main>;
  },
});
```

> \[!TIP]
> Pages are auto-discovered from `src/ui/pages` (recursive, `$param`/`*` routes). Layouts from `src/ui/layouts`.
