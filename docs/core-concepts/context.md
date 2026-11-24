# Context (/docs/core-concepts/context)



# Context [#context]

## `ctx` (`HttpContext`) [#ctx-httpcontext]

```ts
ctx.input        // {params, query, body, headers, cookies}
ctx.headers()    // headers
ctx.setHeaders() // set response headers
ctx.json()/ctx.text()/ctx.noContent()/ctx.redirect()/ctx.stream()
ctx.session      // via requireAuth
ctx.user         // via requireAuth
ctx.can          // ambient ability check
ctx.waitUntil(p) // after-response
ctx.store        // app store access
```

## ALS scopes (context + ALS) [#als-scopes-context--als]

* `runWithRequest` / `currentRequest`
* `runWithAuth` / `currentAuth` — `{user, policies?}`
* `runWithTenant` / `currentTenant`
* `runInTransaction` / `onTransactionCommit/Rollback`

## Session lifecycle [#session-lifecycle]

* Session created via `requireAuth` → cookie via `commitSession`.
* `ctx.user` attach — policy checks via `ctx.can`.
