# CLI (/docs/cli)



# CLI [#cli]

## Overview [#overview]

`kwiva` is THE CLI for Kwiva. Commands are centralized in `@kwiva/cli`.

## Framework commands [#framework-commands]

| Command                                                      | Description                 |
| ------------------------------------------------------------ | --------------------------- |
| `kwiva create <name>`                                        | Scaffold new app            |
| `kwiva dev [--port <n>]`                                     | Dev server                  |
| `kwiva build [--out <dir>]`                                  | Bundle + route-tree codegen |
| `kwiva test`                                                 | `bun test` wrapper          |
| `kwiva migrate`                                              | Apply migrations            |
| `kwiva migrate:status` / `migrate:down` / `migrate:generate` | Migration ops               |
| `kwiva seed [name]`                                          | Seed (all/one seeder)       |
| `kwiva task <name>`                                          | Run a task                  |
| `kwiva route:list`                                           | List routes                 |
| `kwiva key:generate`                                         | Generate APP\_KEY           |
| `kwiva storage:sync <from> <to>`                             | Storage migration           |
| `kwiva storage:clear [disk]`                                 | Clear disk                  |
| `kwiva search:reindex [model]`                               | Reindex FTS                 |
| `kwiva mcp` / `kwiva mcp:print-config`                       | MCP server + config         |
| `kwiva doctor`                                               | Health checks               |

## Generators [#generators]

`kwiva make:<kind> <Name>` — 19 kinds. See [Generators](/docs/cli/generators).

## App commands [#app-commands]

`defineCommand` — `loadAppCommands`/`dispatchAppCommand`. See [DefineCommand](/api/cli#definecommand--app-commands).

## Related pages [#related-pages]

* [Project Commands](/docs/cli/project-commands)
* [Generators](/docs/cli/generators)
* [Database Commands](/docs/cli/database-commands)
* [Addon Commands](/docs/cli/addon-commands) — addons not implemented; kept for parity? — see [modules-plugins](/docs/modules-plugins).

> \[!TIP]
> For a command not found, check `kwiva --help`.
