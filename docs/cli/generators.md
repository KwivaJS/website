# Generators (/docs/cli/generators)



# Generators [#generators]

`kwiva make:<kind> <Name>` — one per construct. Each writes to its conventional folder.

## Full list [#full-list]

| Kind         | Target                     | Suffix              |
| ------------ | -------------------------- | ------------------- |
| `config`     | `src/config`               | —                   |
| `service`    | `src/app/services`         | `Service`           |
| `model`      | `src/app/models`           | —                   |
| `controller` | `src/app/http/controllers` | `Controller`        |
| `middleware` | `src/app/http/middleware`  | `Middleware`        |
| `contract`   | `src/app/http/contracts`   | `Contract`          |
| `policy`     | `src/app/policies`         | `Policy`            |
| `gate`       | `src/app/policies`         | `Gate`              |
| `job`        | `src/app/jobs`             | `Job`               |
| `task`       | `src/app/tasks`            | `Task`              |
| `event`      | `src/app/events`           | `Event`             |
| `listener`   | `src/app/events`           | `Listener`          |
| `mail`       | `src/app/mail`             | `Mail`              |
| `factory`    | `src/database/factories`   | `Factory`           |
| `migration`  | `src/database/migrations`  | `Migration` (dated) |
| `seeder`     | `src/database/seeders`     | `Seeder`            |
| `page`       | `src/ui/pages`             | `Page`              |
| `mcp-tool`   | `src/app/mcp/tools`        | `Tool`              |
| `command`    | `src/app/commands`         | `Command`           |

Examples:

```bash title="terminal"
kwiva make:model Todo
kwiva make:controller Todos
kwiva make:policy Posts
kwiva make:job SendWelcome
kwiva make:migration 20260101000000_create_posts
```

## Output shape [#output-shape]

Generator writes minimal valid `defineX` file — e.g.:

```ts title="src/app/jobs/send-welcome.ts"
import { defineJob } from "@kwiva/jobs";
export const SendWelcomeJob = defineJob({
  handler: async (input) => { /* work */ },
});
```

> \[!TIP]
> Run generators before diving into the app — they're the canonical starting points.
