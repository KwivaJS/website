# ADR-0002 — Nitro as the Foundational Server Runtime

**Status**: Accepted · **Updated**: 2026-09-08

## Context

Kwiva needs a server foundation that can target Node, Bun, serverless providers (Netlify, Vercel, Cloudflare), and static hosts — with tasks, storage, routing, and route rules — without writing per-provider code.

## Decision

Nitro is the **foundational, portable server runtime (hidden engine)** for Kwiva:
- Presets cover Node/Bun/Netlify/Vercel/CF/Zeabur/Amplify/Firebase App Hosting/Stormkit + zero-config provider detection.
- Provides route rules (SWR/ISR/static/headers/redirect/proxy/CORS), unstorage (cache/page/storage namespaces), tasks + `scheduledTasks` cron, WebSockets via CrossWS, plugins, and the `serverEntry` composition surface — all surfaced through Kwiva APIs (`defineServerRoute`, `cache`, `storage`, `defineTask`, channels).
- The owned HTTP pipeline composes via `compose(app)` at the server entry — a web-standard `(Request) => Response` — exactly the boundary Nitro consumes.

## Consequences

- Kwiva deployments are portable by default; per-app presets remain configurable (`kwiva.config.ts > deploy.preset`).
- App code sees one API surface; deploy differences stay in the engine.
- Edge presets impose constraints (streaming, node deps) — documented per preset and surfaced by the edge constraint audit.
- Nitro is treated as the carrier with first-class features (tasks, cache, ws), never as a *transport adapter*.

**Related**: ADR-0003, ADR-0006, ADR-0007, ADR-0016, `docs/framework/foundation/05-server-foundation.md`, `docs/framework/server/*`
