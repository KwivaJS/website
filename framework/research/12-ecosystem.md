# Research — Ecosystem Landscape

**Updated**: 2026-09-08
**Relevance**: Positioning, benchmarking, and threat-awareness for Kwiva.

## Framework Landscape vs. Kwiva

| Framework | Stack | Strengths | Kwiva difference |
|---|---|---|---|
| Next.js (App Router) | React, Vercel, own server | Huge ecosystem, RSC | Closed deploy model; less typed route data; lock-in |
| Remix / React Router 7 | React, Remix server | Loaders/actions, framework mode | RR7 converging on Remix; less strongly typed data surface |
| TanStack Start | TanStack Router + server fn + Nitro | Full-stack TanStack | Kwiva = Router-grade ergonomics, owned + framework-owned SSR (control) |
| Nuxt | Vue/Nitro | Mature, modular, TS-ish | Vue not React; Kwiva is React-first |
| SvelteKit | Svelte + adapters | Small core, adapters | Different UI language |
| Hono | Edge-first HTTP | Tiny, middleware | No batteries (storage/tasks/Studio/CLI) |
| Fastify | Node HTTP | Scale-proven | No batteries; typing opt-in |
| AdonisJS | Node, TS, Laravel-inspired | Closest to Laravel-DX in TS | Node-only (no edge/binary story); less modern toolchain |
| Strapi/Keystone/AdminJS | CMS/data-admin | Autocrud/admin | Admin + headless API; not a full app framework |
| Rust/Go batteries (Actix/Labstack) | typed, fast | Performance | Not TS/React ecosystem |
| Elysia standalone | TS/HTTP | typing, lifecycle | No storage/tasks/SSR/Studio/CLI — Kwiva owns an Elysia-shaped layer and supplies the rest |

## JS-Toolkit Layer Landscape

| Concern | Leaders | Kwiva choice |
|---|---|---|
| Dev server/bundler | Vite / Turbopack / Vite+ | **oxc-native pipeline** (rolldown; Vite/Vite+ reference-only — ADR-0021) |
| Lint/format | ESLint+Prettier / Biome / Oxlint | **oxlint / oxfmt** (deep integration) |
| Test | Vitest / Jest / Bun test / Playwright | **bun test + Playwright** (Vitest reference) |
| Router | TanStack / React Router / Next | **owned router** (TanStack Router reference) |
| Server-state | TanStack Query / SWR / RTK Query | **TanStack Query (hidden engine)** |
| HTTP | Elysia / Hono / Fastify / Express | **owned `@kwiva/http`** (Elysia reference) |
| Server runtime | Nitro / Hono adapters / Node | **Nitro (hidden engine)** |
| Data/autocrud | Questpie (ref) / PostgREST / Prisma | **Kwiva model layer** (`defineModel`, own impl) |
| Auth | Better Auth / Auth.js / Clerk | **Better Auth (hidden engine)** |
| Studio (ops UI) | Questpie (ref) / Blitz / Keystone | **Kwiva Studio (`@kwiva/studio`)** |
| Realtime | CrossWS / Socket.io / PartyKit | **CrossWS (via Nitro)** |
| UI kit | Base UI / Radix / shadcn/ui | **Base UI + Tailwind v4** |
| RPC client | Eden (Elysia) / tRPC | **`@kwiva/client`** (Eden-like, from IR) |

## Strategy Implications

1. **Niche = "Laravel for the oxc/Bun/TanStack world."** No incumbent owns this slot; AdonisJS is closest but Node-only and toolchain-aging.
2. **The engine/reference split is the moat**: engines (Nitro/Drizzle/Better Auth/Query) give mature capability; references (Elysia/TanStack Router/Vite+/Laravel/Questpie) shape owned surfaces — apps get modern DX with no engine lock-in in their code.
3. **Be React-first but adapter-aware** for long-term others (Vue/Solid ports are possible but not v1).
4. **Borrow the one-schema idea, own the implementation.** Questpie validates the architectural pattern; Kwiva's data foundation is framework-owned, so apps carry no third-party data-layer roadmap risk.
5. **Enterprise hooks** (SSO, audit logs, RBAC, billing recipes) = differentiation for a paid support tier later.

## Threat & Opportunity Radar

| Item | Signal | Kwiva action |
|---|---|---|
| TanStack Start stable | Router/Start converge on SSR conventions | Keep own SSR orchestrator; adopt ideas via ADR |
| oxc component API changes | Rolldown/oxlint surface evolves | Deep integration isolated in `@kwiva/cli` (ADR-0021); upgrade ride releases |
| Vite+ GA | Unified toolchain lands | Stay reference-only; onboarding parity documented (`research/03`) |
| Questpie roadmap (as inspiration) | Pattern evolves; more adopters | Keep our implementation aligned with the durable pattern (IR-based generation), not their API |
| Better Auth organisations API | Tenant plugin maturity | Align tenancy layer |
| Bun edge support breadth | Increasing | Revisit "edge uses CF/Node runtime" assumption |
| Anthropic×Bun roadmap | Runtime consolidation | Track; no code change needed |
| Cloudflare×VoidZero | Vite+/Workers deeper coupling | Good for portability story (Nitro presets already cover) |

## Recommendation Summary

Kwiva wins by being the **only batteries-included, deploy-anywhere, type-safe React full-stack framework on the modern (oxc/Bun) toolchain**. Its competitors are either single-provider (Next), single-runtime (AdonisJS), thin-HTTP (Hono/Fastify), or data/admin-only (Strapi/Keystone). The ecosystem pieces are ready; integration quality + DX are the battleground.
