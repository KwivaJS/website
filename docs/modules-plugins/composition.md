# Application Composition (/docs/modules-plugins/composition)



# Application Composition [#application-composition]

`defineApp(options)` — the app is the composition root:

```ts title="bootstrap/app.ts"
import { defineApp } from "@kwiva/core";
import { TodosModule } from "@app/modules/todos";

export default defineApp({
  name: "my-app",
  modules: [TodosModule],
  policies: [...], // additive
  state: { counter: 0 },
  resolve: [["api", () => apiClient()]],
});
```

## DefineApp options [#defineapp-options]

| Field                                                                                                          | Type                                                             |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `name`                                                                                                         | string (required)                                                |
| `models`, `controllers`, `middleware`, `services`, `policies`, `pages`, `jobs`, `events`, `commands`, `macros` | arrays (additive)                                                |
| `state`                                                                                                        | object (app state)                                               |
| `decorate`                                                                                                     | `(app) => AppContext`                                            |
| `resolve`                                                                                                      | `Array<[string, Resolver]>` — DI-like (n `[key, () => service]`) |
| `state`                                                                                                        | shared state                                                     |

## Discovery + assembly [#discovery--assembly]

`assembleApp(app, root)` — discovers units, merges additive, registers policies/pages.

## Shutdown [#shutdown]

`await server.stop()` — flush afterResponse, cancel workers, close DB.

> \[!TIP]
> For shutdown hooks, see [Observability](/docs/observability/dev-overlay) or app bootstrap.
