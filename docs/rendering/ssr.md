# Server-Side Rendering (/docs/rendering/ssr)



# SSR [#ssr]

## `renderPage(page, ctx, options?)` [#renderpagepage-ctx-options]

`Response` — for `Accept: application/json` → `{component, url, props}` envelope.

## `streamPage(options)` [#streampageoptions]

Streaming document variant.

## Hydration [#hydration]

`hydrateApp(options)` — reads `window.__KWIVA__`, hydrates via `hydrateRoot`.

## Errors [#errors]

`redirect(path, status?)`, `notFound()` in `renderPage`.

## Document [#document]

`renderDocument({head, body, seed, clientScript})`; `AssetManifest{entry, files, css}` + `assetTags`.
