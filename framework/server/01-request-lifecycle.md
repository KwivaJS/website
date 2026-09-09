# Server 01 — Request Lifecycle

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

One request, end to end, across every layer. The ordered contract that middleware, guards, and handlers rely on.

## The full sequence

```
 1. client request
 2. preset adapter (engine)              → Web Request normalization
 3. kwiva/http pipeline entry
    3.1  requestId assigned              (x-request-id: set/forwarded)
    3.2  OTel server span begins         (http {method, route})
    3.3  onRequest middleware            (security headers, rate limit, CORS)
 4. routing
    4.1  route manifest match            (generated model routes, controllers, server routes)
    4.2  route rules apply               (cache hit? → serve + bypass pipeline)
 5. context assembly
    5.1  parse-query / parse body        (json, form, multipart)
    5.2  cookies decode, session load    (auth engine, database/redis store)
    5.3  tenant resolution               (domain/path/header → ctx.tenant)
    5.4  state/decorate/resolve          (typed app context)
 6. onTransform middleware               (mutate parsed values)
 7. validation                           (body/query/params/headers/cookies schemas)
 8. onBeforeHandle                       (guards: requireAuth, policy check)
 9. handler
    ├─ API route      → controller action (service → model query → response object)
    └─ page route     → SSR render (beforeLoad → loaders → stream)
10. onAfterHandle                       (response shaping, cache tags set)
11. error path (any throw)               → taxonomy mapping → error response/error page
12. onResponse                           (final headers, span close, metrics)
13. engine writes response               (preset adapter)
```

## Timing budget (p50 targets, example app)

| Stage | Budget |
|---|---|
| adapter → pipeline entry | < 1ms |
| session + tenant resolve | < 2ms (db/redis hit) |
| validation | < 0.5ms (schema compiled) |
| handler (model list, 20 rows) | < 5ms |
| full API round-trip (local) | < 15ms |
| SSR shell (stream start) | < 50ms |

Each stage is an OTel span — `kwiva dev` shows the waterfall in the overlay (v1.x).

## Ordering guarantees

- Middleware run in `src/config/app.ts > middleware[]` order, **before** guards.
- Guard `beforeHandle` runs after validation (validated body available for policy checks).
- Cache/rules short-circuit **before** session load (public ISR pages skip auth entirely).
- Error mapping is the only code that can run after `onResponse` (span error attributes).

## Session & tenant propagation

- Session id (cookie) → engine-agnostic session store → `ctx.session` (typed).
- Tenant resolution strategies (`src/config/tenancy.ts`): `subdomain`, `path`, `header`, `fixed` (single-tenant). Resolved tenant injected into: model query scoping, cache keys, storage prefixes, queue payloads, log/trace attributes.

## Background work after response

- Event emission + queue dispatch happen inside handlers (transaction-aware) but acknowledge in-band.
- `waitUntil` (edge-safe) for post-response tasks — exposed as `ctx.waitUntil(promise)`.
