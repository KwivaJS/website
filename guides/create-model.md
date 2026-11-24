# How do I create a model? (/guides/create-model)



# Create a Model [#create-a-model]

## Step 1: generate [#step-1-generate]

```bash title="terminal"
kwiva make:model Todo
```

Writes `src/app/models/todo.ts` (class).

## Step 2: author (or generator template) [#step-2-author-or-generator-template]

```ts title="src/app/models/todo.ts"
import { defineModel } from "@kwiva/data";

export const Todo = defineModel("todos", (f) => ({
  id: f.id(),
  title: f.string().validation((s) => s.min(1).max(200)),
  status: f.enum("pending", "done"),
  createdAt: f.dateTime(),
}), {
  timestamps: true,
  routes: true,
  fillable: ["title", "status"],
  permission: "todos",
});
```

## Step 3: migrate + verify [#step-3-migrate--verify]

```bash title="terminal"
kwiva migrate
kwiva route:list | grep todos
```

## Extra: policies [#extra-policies]

Add `src/app/policies/todo.ts` — discovered automatically.

> \[!TIP]
> For one-off: `kwiva db:diff --check` — drifts list.
