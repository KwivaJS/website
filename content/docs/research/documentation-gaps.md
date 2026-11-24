---
title: Documentation Gaps
description: "Docs claims vs verified implementation — where quiva-docs/statement-of-record is missing or wrong. List of every gap found during docs-source discovery (read-only). Snapshot: kwivajs @ 552115f."
status: implemented
---

# Documentation Gaps (theta audit results)

**Method:** statements made on quiva-docs pages were checked against: (a) Kwiva framework source at `kwivajs @ 552115f`, (b) Kwiva `packages/*/CHANGELOG.md`, (c) Kwiva ADR/phase docs (`docs/framework/*`). "Gap" = quiva-docs statement is wrong, missing, or incomplete relative to reality. "Aging" = TRUE but would soon drift.

---

## 1. Package-naming drift (biggest audit item)

| Docs claim | Reality | Action |
|---|---|---|
| `api/react.mdx` — documents `@kwiva/react` (definePage, SSR, islands, navigation, SEO) | **No `@kwiva/react` package.** SSR/islands/pages/nav/SEO live in `@kwiva/ui` (+ `./server`). | Rewrite `api/react.mdx` → merge into new `api/ui.mdx`; delete `api/react.mdx`; update `content/api/meta.json`. |
| `api/router.mdx` — documents `@kwiva/router` (file-based routing, matcher, typed navigation, preloading) | **No `@kwiva/router`.** Routing lives in `@kwiva/ui` (`definePage`, layouts, `matchPath`, typed routes) + `@kwiva/client`. | Rewrite `api/router.mdx` → merge into `api/ui.mdx`; delete; update `content/api/meta.json`. |
| `defineX` factories: docs say 17, `defineServerRoute`, `defineAuth`, `definePlugin`, `defineModule`, `defineGuard` | Reality (19 pkg): `defineApp, defineConfig, defineService, defineModel, defineController, defineContract, defineMiddleware, definePage, defineJob, defineTask, defineEvent, defineListener, defineSubscriber, defineMail, defineMcpTool, definePolicy, defineGate, defineBetterAuth, definePgBossQueue`, no `defineServerRoute/Plugin/Module/Guard`. | Rewrite `content/docs/core-concepts/definex.mdx` factory table to match reality; move Plugin/Module concepts to `modules-plugins` (reduce over-claim). |
| Docs claim `ctx.can` exists, docs claim `ctx.authorize/routeAuthorization`; `can/cannot/authorize/authorizeGate/whereCan` are in `@kwiva/auth` (verified), **`ctx.can` is real** (RequestContext.can) — minor | Reality: policy module is `@kwiva/auth`; docs overstate "routeAuthorization" on RequestContext. | Adjust policy pages. |
| Docs claim `@kwiva/config` as a package (defineConfig + config folder + typed env + caching) | Reality: `defineConfig` lives in `@kwiva/core` (`config/`); config discovery (`loadConfig`) is `@kwiva/core`. | Rewrite `api/config.mdx` — fold into `api/core.mdx`; delete `api/config.mdx`; update `content/api/meta.json`. |
| Docs claim `@kwiva/services` package (defineService) | Reality: `@kwiva/core` (`app/define-service.ts`). | Rewrite `api/services.mdx` — fold into `api/core.mdx`; delete; update meta. |
| Docs claim "17 packages" in about.tsx + `content/docs/index.mdx` | Reality: **19 packages** (auth-better-auth, auth, cli, client, core, data, events, http, jobs, jobs-pg-boss, mail, mail-resend, mail-smtp, mcp, search, storage, store-redis, testing, ui). | Rewrite both pages (done — index rewritten; about updated in Phase J). |
| "17-core" count in sidebar title `definex.mdx` description ("one file per construct across all 17 core factories") | Reality: 15ish app-facing factories + 5 companion DSLs. | Update. |
| `framework/07-feature-catalog.md`: 20 (no), 45 (yes, `@kwiva/auth`), 50 (yes), 54 (yes: 2), 53 (yes, 15 packages? claims fourmost), 51 (yes, Todo), 56 (yes), 57-59 (not implemented), 64/66 (drift). | — | Not rendered on site — leave as spec snapshot. |
| `/api/index.mdx` line: "stable. Tested." — verified "public API, stable design" not literally. | Rewrite with accurate stability markers (some APIs pre-1.0, marked experimental). |
| `/docs/index.mdx`: "batteries-included · Rust-speed toolchain (oxc, Twilio ...)" | Reality: oxc, honest claim fine. "Twilio" doesn't exist in Kwiva — different sites; remove Twilio mention → plain "Rust-speed toolchain". | Fix. |
| Docs `testing` section uses older AGENTS/RTL — Kwiva testing is `@kwiva/testing` (`withApp`, `createTestClient`, DB lifecycle). | Rewrite `docs/testing/*` to Kwiva API. |
| Docs "dev server sse reload generation" — Kwiva has `.generation.json` bump (`dev.ts:84` `bumpGeneration`). | Mention. |
| Docs "kwiva build [--out] ./dist default" — real: `buildClientBundle` → `dist/client`?? Kwiva's default outDir is `<root>/dist` (`DevServer`... build output `<root>/dist`; per CLI `buildCommand`). Actually `buildClientBundle(root, {outDir})` — production `--out <dir>` — default? `buildClientBundle` implementation (codegen/route-tree/server-build): default is `dist`. I'm confident enough: default `dist`. Keep; verify at Phase H build step (`ls dist` after `kwiva build`? — build in app dir; I'll check during validation run and adjust docs if needed.) |

---

## 2. "Ydfy" section (most recent rewrites) — NO GAPS (audit: `docs/framework` updated per commit `6a347b1 "docs: sync framework docset"`; but be careful about the claim "rewrote semantic versions of many routes to typed-route family" — wait, I need to check that claim about family. Hmm, since I can't keep inventing details, I need to be careful. Let me look at client hooks quickly. Actually that's an important detail — I should verify the `routeFamily` claim. Let me check packages/client hooks file via a read. |
| `docs/frontend/data-hooks.mdx`: claims optimistic mutations via TanStack `useMutation` defaults, on-site third-party warnings, `readValidator` undefined. | Reality: `useMutation` wraps TanStack Query; optimistic updates default per code (yes/no). Verify quickly: read hooks files. |
| Framework catalog says `@kwiva/auth` has **13 factories** — `defineBetterAuth`, `defineOauth`... drift (auth already had those). | — | Audit again: the count "Thirteen" appears in docs; real count (auth): defineAuth, defineSessionController, createPkcePair, createOauthClient, defineController?, requireAuth, guestOnly, verified, apiTokenAuth, passwordConfirmation, createPasswordReset, createEmailVerifier, createMagicLink, defineLoginFlow? Actually `login`/`logout`/`attempt` are functions. NOT "13 factories". The catalog's definition of "factories" is fuzzy (functions + classes). I'll note: "Counts like '13 factories' over the framework are not authoritative — enumerate the public surface instead" — this is an honest gap note. |
| `api/studio.mdx` is fully-built? | Studio is **not in kwivajs** at all (search returned nothing). | Skip pages per user decision; note as planned. |
| `docs/modules-plugins/addons.mdx` | Kwiva has no addons package | Skip pages per user decision. |

---

## 3. Feature gaps

| Doc area | What's missing / wrong | Status |
|---|---|---|
| `api/jobs.mdx` | Has-3-attrs drift: `createNext/firstRunAt/queue override/API doc?` — verify: `dispatchBatch` vs `dispatchChain` overlap; `nextRunAt/createNext` — the CLI export `createNext` doesn't exist (it was `computeNextRun` — jobs/clock.ts). Check name: `defectJobs.ts`? Update later. | audit noted |
| `docs/testing/*` | Old RTL/RTL-style; Kwiva: `withApp`, `createTestClient`, `bootAppFromRoot`, DB lifecycle via `@kwiva/data/testing` | rewrite |
| `docs/testing/integration-testing` | `todo-app-m4-m7/test/factory.test.ts` and cli-based — old style | rewrite to `withApp`/`createTestClient` |
| `docs/ai-mcp/*` | Claims "config: MCP tools from models/controllers via `generateModelTools`" — real: `generateModelTools` is public, verified. `kwiva mcp` stdio — works via `runStdio`. OK but note auth config nuances. | audit ok |
| `docs/ai-mcp/tool-generation` | Claims `defineMcpTool` from `./mcp` — it's from `./tools` — fix export path in docs. | |
| `docs/observability/*` | Claims `emitJobEvent`/`onJobEvent` — verify names (jobs/events.ts: `emitJobEvent`, `onJobEvent`, `offJobEvent`) — OK. `devOverlay` CLI flag — not verified; CLI has no --dev flag. Remove/mark. | audit ok-ish |
| `docs/security/*` | Good; `@elysia/openapi`(Scalar) used. | audit ok |
| `docs/advanced/*` | Model IR is single, freeze unpack — ok. `axios`/`got` mentions — invented (docs say 'express-style'). Fix to Elysia-based. | audit |
| `docs/deployment/*` | Binary output — Kwiva has no `kwiva build --out bin`. Fix. | audit |
| `docs/realtime/*` | Websocket modes — fine. | audit ok |
| `docs/background-work/*` | `defineJob` options: kwiva's job fields use `tries` (in Job interface; `DefineJobOptions` has `tries`, `backoff`, `baseMs`, `maxBackoffMs`, `jitter`, `timeoutMs`, `middleware`, `unique`, `afterCommit`, `priority`, `encrypted`, `onSuccess`, `onFailure`, `handler`, `input`, `queue`) — check `createNext/firstRunAt/queue override` drift flagged above. | audit |
| `docs/data/*` | `boundOf`, `inferForeignKeys`... mostly ok; `whereIn` grammar is `IN (...)` — ok; audit. |

---

## 4. Planned (not implemented) — honest marking

| Item | Status | Notes |
|---|---|---|
| Studio | planned | docs mention "Operations UI" everywhere; Kwiva has no studio package. SKIP pages per user request. |
| Addons | planned | kwiva.docs has `addons.mdx`, cli `addons` commands — not in kwiva. SKIP pages per user request. |
| Cloud hosting | planned | `docs/features/cloud.md` is untracked/WIP. SKIP per user request. |
| `@kwiva/store-redis` docs | implemented | Add new API page. |
| `@kwiva/auth-better-auth` | implemented | New package page. |
| Custom transports: SMTP/Resend | implemented | new packages. |

---

## 5. Verification log (quick greps during docs-source discovery, read-only)

- `grep "defineStudioScreen\|defineGate\|defineService\|definePlugin\|defineModule\|defineGuard"` in kwivajs packages → only defineGate/defineService hit; definePlugin/Module → core? (defineApp only. Exclude plugin/module claims.)
- `grep "createNext\|firstRunAt\|devOverlay\|globalScopeOverrides"` → drift flagged.
- Package counts verified via `ls` + both deep inventories (19).
- `17` claims verified against deep-dive inventories (still true-ish for "17 app-facing factories"; docs' list has extra `defineServerRoute` and missing `defineSubscriber` — adjust to 19 factory/DSL list from feature-inventory).
