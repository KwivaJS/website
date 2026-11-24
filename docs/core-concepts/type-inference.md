# Type Inference (/docs/core-concepts/type-inference)



## End-to-End Type Safety [#end-to-end-type-safety]

Kwiva's type system flows automatically from `defineX` definitions through the entire application stack. A change in a model definition updates the database table, the generated routes, the typed client methods, and the page loader types — without a codegen step, a manifest to regenerate, or a SDK to maintain.

```plaintext title="end-to-end-type-safety.txt"
defineModel → model IR → REST/RPC routes → @kwiva/client → definePage loader → data hooks
```

No codegen, no manual type annotations, one type universe. The same derivation runs for every construct: controller schemas type the client calls that hit them, and model fields type the data the client returns.

## How It Works [#how-it-works]

The pipeline that carries types has a concrete shape — definitions are statically analyzed into an intermediate representation, and everything downstream reads from that IR.

### Model → IR [#model--ir]

A model file is the source of truth for its resource. The field DSL produces both runtime schema and static types:

```ts title="src/app/models/posts.ts"
// src/app/models/posts.ts
defineModel('posts', (f) => ({
  id: f.id(),
  title: f.string().validation((s) => s.min(1).max(200)),
  body: f.text().optional(),
  status: f.enum('draft', 'published'),
  author: f.belongsTo(() => User),
}))
```

At scan time the model becomes an entry in the model IR (`src/.kwiva/model-ir.json`). The IR is the input to every derivation below — schema, routes, types, Studio screens, OpenAPI, and MCP tools — so there is a single source for all of them. See [Advanced: model IR](/docs/advanced/model-ir) and [Architecture: model derivation](/architecture/model-derivation).

### IR → REST and RPC [#ir--rest-and-rpc]

Each model produces deterministic REST routes — `list`, `get`, `create`, `update`, `delete` — plus custom controller actions. The route manifest records every route's path, method, schemas, tags, and permissions, and serves as the single input to the typed client:

```plaintext title="ir-rest-and-rpc.txt"
route manifest → @kwiva/client types
```

The client infers the full surface at the type level. `client.posts.list()` returns an array of typed post objects; `client.posts.create(body)` typechecks against the create schema; `client.posts.get(id)` narrows `id` to the declared param type. The result is a contract in the editor — valid methods and arguments surface as you type, and a misspelled field is a compile error rather than a runtime surprise. See [API: typed RPC](/docs/api/rpc) and [API: generated endpoints](/docs/api/generated-endpoints).

### Client → Page [#client--page]

Page loaders consume the same client, so their returned data is typed from the same definitions:

```tsx title="client-page.tsx"
// src/ui/pages/posts.$id.tsx
definePage({
  loader: async ({ params, client }) => {
    const post = await client.posts.get(params.id)
    // post is fully typed — title: string, body: string | null, status: 'draft' | 'published'
    return { post }
  },
  component: ({ loaderData: { post } }) => (
    <h1>{post.title}</h1>  // TypeScript knows post.title is a string
  ),
})
```

The loader's `post` type comes from the model's fields, through the route manifest, to the client method, into the loader return. Data hooks (`useResource`, `useList`, `useMutation`) reuse the same typed surface for client-side state. See [Pages](/docs/frontend/pages) and [Data hooks](/docs/frontend/data-hooks).

## What Is Typed [#what-is-typed]

The same principle applies beyond models:

* **Controller context** — `body`, `query`, `params`, `headers`, and `cookies` are typed from the route's schemas; `store`, decorated, and resolved keys are typed from `defineApp`. See [Context](/docs/core-concepts/context).
* **Config** — `config('database.url')` returns the module's declared type, and `env('DATABASE_URL')` returns its declared binding type. See [Configuration](/docs/core-concepts/configuration).
* **Errors** — the client's `res.error.code` is a discriminated union of the taxonomy codes, so error branches typecheck without string matching. See [Error Handling](/docs/core-concepts/error-handling).
* **Services, jobs, events** — all derive their payload and argument types from the constructs they touch.

## Where the Types Come From [#where-the-types-come-from]

Every typed value has a single derivation source, which is why the types never drift:

| What is typed                                                   | Derived from                               |
| --------------------------------------------------------------- | ------------------------------------------ |
| Route context (`body`, `query`, `params`, `headers`, `cookies`) | The route's schemas                        |
| Context `store`, decorated, and resolved keys                   | `defineApp` `state`, `decorate`, `resolve` |
| Client method arguments and returns                             | The route manifest built from definitions  |
| Model rows and relations                                        | `defineModel` fields                       |
| Errors (`res.error.code`)                                       | The shared taxonomy                        |
| Config and env reads                                            | `defineConfig` `defaults` and `env` maps   |

Each arrow in that table is a compile-time derivation, not a generated artifact. Editing the source edits the contract.

## Editing an Existing Resource [#editing-an-existing-resource]

The practical workflow demonstrates why the pipeline matters. Update a model field:

```ts title="editing-an-existing-resource.ts"
// before
status: f.enum('draft', 'published'),
// after
status: f.enum('draft', 'published', 'archived'),
```

From that single edit, the compiler immediately knows: the `status` column admits `archived` in the database, `client.posts.create` and `client.posts.update` accept it in their bodies, list and get responses include it in the `status` union, page loaders return it, and any `switch` over the tuple now has an unhandled arm to fix. No regeneration, no resync — the edit is the contract update.

## Zero Codegen [#zero-codegen]

Unlike codegen-based approaches, Kwiva uses TypeScript's type inference:

* Model field types are inferred from the DSL.
* Controller context types are inferred from route schemas.
* Client return types are inferred from the route manifest derived from definitions.
* Page loader data types are inferred from the client call.

The framework derives ambient types into `src/.kwiva/types`, and `createClient()` picks them up. The consequences matter operationally:

* No build step for types.
* No generated files to commit.
* Types are always in sync with the source — editing a definition updates the contract everywhere immediately.
* IDE autocompletion works everywhere the derived types flow.

Because nothing is generated and committed, there is nothing to forget to regenerate when the API changes.

## One Type Universe, In Practice [#one-type-universe-in-practice]

The practical test of the model: rename a model field and the compiler tells you exactly which client calls, loaders, and handlers reference it. Change a route's body schema and every `create` or `update` call is rechecked. That is the guarantee "one type universe" is shorthand for — type flow, not type drift.

## What's Next [#whats-next]

1. [API: typed RPC](/docs/api/rpc) — how the client derives its surface
2. [Advanced: model IR](/docs/advanced/model-ir) — the IR that powers derivation
3. [Architecture: model derivation](/architecture/model-derivation) — the pipeline from model to client
4. [Data hooks](/docs/frontend/data-hooks) — typed data fetching in pages
5. [Context](/docs/core-concepts/context) — per-route typed context assembly
