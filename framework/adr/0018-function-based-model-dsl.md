# ADR-0018 — Function-Based Model DSL (`defineModel`)

**Status**: Accepted · **Updated**: 2026-09-08

## Context

The model DSL defines every app's data foundation. Two authoring shapes were candidates: class-based (Eloquent-style `class User extends Model`) and function-based (a factory returning a plain definition). TypeScript's structural typing favors factories: full inference of the field map, no decorator/reflect-metadata machinery, no `this` binding pitfalls, and trivially serializable definitions (the IR needs plain data).

## Decision

**`defineModel` is a function-based factory, one model per file.**

```ts
// src/app/models/posts.ts
export default defineModel('posts', (f) => ({
  id: f.id(),
  title: f.string().validation(s => s.min(1).max(200)),
  author: f.belongsTo(() => User),        // lazy refs — no circular imports
}), { timestamps: true, tenantField: 'tenantId', permission: 'posts' })
```

- Field factory `(f) => ({...})` — the returned object literal is the field map; its types flow end-to-end (query builder, REST validation, client, Studio, forms).
- Relations use **lazy references** (`() => User`) so models compose without circular imports; the scanner resolves them at boot.
- Model options (third argument): `timestamps`, `softDelete`, `audit`, `tenantField`, `permission`, `uniques`, `indexes`, `hooks`, `cache`, `computed`, `routes`.
- Per-model files in `src/app/models/` auto-discovered; `kwiva make:model` scaffolds model + migration + factory.
- Same convention everywhere: every app-facing construct is a `defineX` factory (ADR-0019) — models set the pattern.

## Consequences

- Zero decorators, zero reflect-metadata, zero class-`this` pitfalls; definitions are plain data — IR generation is trivial and type-exact.
- Runtime model objects (query/static APIs) are produced by the framework from the definition, not by subclassing.
- Users coming from Eloquent lose class inheritance conventions — replaced by options + hooks (documented mapping in `research/11-laravel.md`).

**Related**: ADR-0004, ADR-0019, `docs/framework/foundation/03-data-layer-models.md`
