# Database Commands (/docs/cli/database-commands)



# Database Commands [#database-commands]

| Command                  | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `kwiva migrate`          | Apply migrations from `src/database/migrations` |
| `kwiva migrate:status`   | Print `applied: ...` / `pending: ...`           |
| `kwiva migrate:down`     | Roll back last batch                            |
| `kwiva migrate:generate` | Generate DDL diffs from model IR                |
| `kwiva seed`             | Run all seeders (`src/database/seeders`)        |
| `kwiva seed <name>`      | Run one seeder by name                          |

## Storage [#storage]

| Command                                | Purpose                                             |
| -------------------------------------- | --------------------------------------------------- |
| `kwiva storage:sync <from> <to>`       | Copy objects between disks; `[--prune] [--dry-run]` |
| `kwiva storage:clear [disk] [--force]` | Clear a disk (S3/GCS/Azure/Blob need force)         |

## Search [#search]

`kwiva search:reindex [model]` — requires `database` section.

## MCP [#mcp]

`kwiva mcp` / `kwiva mcp:print-config` — see [AI & MCP](/docs/ai-mcp).

> \[!TIP]
> `kwiva doctor` checks all DB/search/MCP health first.
