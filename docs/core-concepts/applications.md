# Applications (/docs/core-concepts/applications)



# Applications [#applications]

```ts title="bootstrap/app.ts"
import { defineApp } from "@kwiva/core";

export default defineApp({
  name: "my-app",
  // additive:
  models: [], controllers: [], policies: [], pages: [],
  jobs: [], events: [], tasks: [], commands: [],
});
```

## API [#api]

| API                       | Notes                                          |
| ------------------------- | ---------------------------------------------- |
| `defineApp(options)`      | returns `AppDefinition`; no classes/decorators |
| `assembleApp(app, root?)` | → `UnitRegistry` — discovery + merge           |

## Composition [#composition]

`defineApp` is additive — multiple arrays merge without duplicates (throws on name conflicts).

## Boot [#boot]

1. `kwiva create` — writes `bootstrap/app.ts`
2. `kwiva dev`/`bun src/index.ts` — imports `bootstrap/app.ts`
3. `assembleApp` — registers everything

## Modules [#modules]

`modules: [TodosModule]` — see [Modules](/docs/modules-plugins/defining-modules).
