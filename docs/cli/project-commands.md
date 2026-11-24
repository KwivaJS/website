# Project Commands (/docs/cli/project-commands)



# Project Commands [#project-commands]

## `kwiva create <name>` [#kwiva-create-name]

`kwiva create my-app` — scaffolds `bootstrap/`, `src/config/{app,database,cache,kv,storage,mcp}.ts`, `src/app/models/`, `src/app/http/controllers/`, `src/database/{migrations,seeders}/`, `package.json` scripts. Logs `kwiva create → scaffolded <target>`.

## `kwiva dev [--port <n>]` [#kwiva-dev---port-n]

Development server. Default port 3000. Hot-reload of client changes.

## `kwiva build [--out <dir>]` [#kwiva-build---out-dir]

Bundles + route-tree codegen. Default out: `dist`.

## `kwiva test` [#kwiva-test]

`bun test` wrapper.

## Related [#related]

* [Generators](/docs/cli/generators)
* [Database Commands](/docs/cli/database-commands)
