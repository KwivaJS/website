# Model IR (/docs/advanced/model-ir)



# Model IR [#model-ir]

## IR structure (frozen) [#ir-structure-frozen]

```ts
ModelDefinition{
  irVersion: 1,
  fields: Record<string, FieldDefinition>,
  relations: Record<string, RelationDefinition>,
  indexes: IndexDefinition[],
  options: ModelOptions,
  hooks: HookDefinition[],
  scopes: ScopeDefinition[],
}
```

Fields: `{name, column, kind, nullable, hasDefault, default?, unique, indexed, primaryKey, enumValues?, description?}`
Relations: `{name, type, target, nullable, through?, foreignKey?, localKey?, onDelete?, morphName?...}`

## Derivation pipeline [#derivation-pipeline]

`defineModel` → `compileIR` → stored in `.kwiva/types/route-tree.gen.ts` + DB artifacts.

## No-drift guarantee [#no-drift-guarantee]

* Types and database never drift: model = source of truth
* `kwiva migrate` diffs schema against IR
* Client typed by route tree

## .kwiva artifacts [#kwiva-artifacts]

* `src/.kwiva/types/route-tree.gen.ts` — typed client/nav
* `src/.kwiva/entry.client.tsx` — browser entry
* `dist/` — built app

> \[!TIP]
> See [Architecture Internals](/docs/advanced/architecture-internals).
