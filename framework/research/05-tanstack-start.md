# Research — TanStack Start (v1)

**Source**: https://tanstack.com/start (docs), live research 2026-09-08
**Relevance**: Evaluated and rejected as the default full-stack layer (ADR-0005); useful as an integration benchmark and migration path for existing Start apps.

## What It Is

TanStack Start is a full-stack framework layered on TanStack Router: Vite-based, with `createServerFn` for RPC, loaders run on server, and Nitro deployment adaptations.

## Onboarding Options (current)

- **TanStack Builder**: AI-first scaffold.
- **CLI**: `npx @tanstack/cli@latest create` (choose pkg manager; Tailwind/ESLint add-ons).
- **Examples**: start-basic, start-basic-auth, start-basic-react-query, start-counter, start-clerk-basic, start-convex-trellaux, start-supabase-basic, start-trellaux, start-workos, start-material-ui. (Rsbuild variant exists.)
- **Manual**: "build from scratch".
- **Migrations**: from Next.js documented; Remix/React Router 7 "coming soon".

## Why Kwiva Defaults to Router-Ergonomics, Owned (not Start)

| Criterion | Kwiva (owned router) | Start |
|---|---|---|
| SSR control | Full (we own handler + renderer) | Vite plugin flow abstracts it |
| Deploy targets | Any Nitro preset, incl. static/binary | Nitro presets via adapter but start-specific |
| Framework footprint | Thin — data layer is ours | Ships its own server-fn/RPC conventions |
| Escalation path | Escape hatch to SPA mode | Calls Kwiva conventions into question |
| Type derivation | Router-style + our IR glue | start-specific `createServerFn` sigils all over app code |
| Migration for users | From Next/RR7 documented | Start users: our migration doc covers `createServerFn` → controllers + typed client |

A **Start migration guide** is kept (v1.x) for teams already on Start; a bridge package is second-class if demand appears.

## Kwiva Interactions

- Start users migrating: rewrite `createServerFn` calls onto `defineController` routes + the typed RPC client.
- Start's router+query patterns (raw Router SSR utilities) transfer conceptually 1:1 — both approaches sit on typed routers; ours is reimplemented.
- Deployment: Kwiva gives migrated Start apps the same Nitro preset story (edge, binary, static).
- Our SSR renderer mirrors the same request-handler/stream-handler shape (see `04-tanstack-router.md`), so Start patterns port cleanly.

## Version Tracking

Track Start stable milestone as a benchmark: if Start converges on conventions Kwiva lacks, adopt the *ideas* through ADRs (not the package). Kwiva keeps its own renderer regardless (ADR-0006), so upstream risk is contained.
