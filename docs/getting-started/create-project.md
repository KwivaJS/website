# Create a Project (/docs/getting-started/create-project)



# Create a Project [#create-a-project]

`kwiva create <name>` scaffolds a new app directory.

## Syntax [#syntax]

```bash title="terminal"
kwiva create my-app
```

Name validation: `^[a-z][a-z0-9-]*$` (lowercase letters, digits, dashes; starts with a letter). Errors → stderr + exit 1.

## What gets scaffolded [#what-gets-scaffolded]

| Path                                                | Purpose                                |
| --------------------------------------------------- | -------------------------------------- |
| `bootstrap/app.ts`                                  | `defineApp({name})` entry              |
| `src/config/app.ts`                                 | `{port: 3000}`                         |
| `src/config/database.ts`                            | `driver: "pglite"` (in-memory default) |
| `src/config/cache.ts`, `src/config/kv.ts`           | `driver: "memory"`                     |
| `src/config/storage.ts`                             | tenant scoping enabled                 |
| `src/config/mcp.ts`                                 | `enabled: false`                       |
| `src/app/models/`                                   | empty models folder                    |
| `src/app/http/controllers/`                         | —                                      |
| `src/database/migrations/`, `src/database/seeders/` | —                                      |
| `package.json`                                      | scripts: `dev`, `build`, `test`        |

Logs `kwiva create → scaffolded <target>`.

## Next steps [#next-steps]

```bash title="terminal"
cd my-app
bun install
kwiva dev
```

`kwiva dev` serves on port 3000 with hot reload (client-only changes don't respawn the server).
