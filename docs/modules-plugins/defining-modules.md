# Defining Modules (/docs/modules-plugins/defining-modules)



# Defining Modules [#defining-modules]

```ts
import { defineModule } from "@kwiva/core";

export const TodosModule = defineModule({
  name: "todos",
  models: [Todo, Task],
  policies: [TodoPolicy],
  controllers: [TodosController],
  tasks: [CleanupTask],
});
```

## API [#api]

| Field                | Type    | Notes                   |
| -------------------- | ------- | ----------------------- |
| `name`               | string  | module name (namespace) |
| `models`             | `any[]` | models to include       |
| `controllers`        | `any[]` | HTTP controllers        |
| `policies` / `gates` | `any[]` | auth policies           |
| `jobs`               | `any[]` | jobs                    |
| `events`             | `any[]` | events                  |
| `services`           | `any[]` | services                |
| `tasks`              | `any[]` | tasks                   |
| `commands`           | `any[]` | app commands            |
| `middleware`         | `any[]` | http middleware         |

## Discovery [#discovery]

Modules are discovered from `src/app/**` (see [Auto-Discovery](/docs/core-concepts/auto-discovery)). Modules can also be passed explicitly via `defineApp({modules: [TodosModule, ...]})`.

> \[!TIP]
> For the "app code" pattern, see examples/todo-app-m4-m7.
