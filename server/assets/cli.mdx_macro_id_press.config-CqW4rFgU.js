import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/api/cli.mdx?macro_id=press.config.tsx%23apiRef
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "CLI",
	"description": "@kwiva/cli — the kwiva binary. One command surface for scaffolding, development, testing, building, deploying, and operating a Kwiva application."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\n`kwiva` is the single CLI for the entire application lifecycle. It's built on the Rust-speed toolchain, so every command — dev server, build, check, generators, database, queue, and schedule — runs fast and consistently. Commands are discovered from built-ins first, then application console commands (`src/app/console/`), then modules.\n\n## Project & Lifecycle [#project--lifecycle]\n\n| Command                                      | Action                                                                                |\n| -------------------------------------------- | ------------------------------------------------------------------------------------- |\n| `kwiva new <name> --mode=<mode>`             | Scaffold an app (modes: `fullstack`, `api+spa`, `static`, `standalone`, `edge`)       |\n| `kwiva dev [--port] [--cluster]`             | Start the dev server with HMR                                                         |\n| `kwiva build [--preset] [--binary] [--docs]` | Production build (client + server)                                                    |\n| `kwiva preview`                              | Serve the built output locally                                                        |\n| `kwiva deploy [provider]`                    | Build then run the provider's deploy path                                             |\n| `kwiva check [--fix] [--audit]`              | Format, lint, and typecheck; `--fix` auto-fixes, `--audit` checks dependencies (v1.x) |\n| `kwiva test [--e2e] [--watch] [filter]`      | Run tests; `--e2e` runs end-to-end tests                                              |\n| `kwiva console`                              | REPL with the app context (config, models, client)                                    |\n| `kwiva upgrade`                              | Run codemod recipes and dependency bumps                                              |\n| `kwiva key:generate`                         | Generate `APP_KEY` into `.env`                                                        |\n| `kwiva doctor`                               | Environment/runtime/dependency diagnostics (v1.x)                                     |\n\n## Generators (`kwiva make:*`) [#generators-kwiva-make]\n\n| Command                  | Creates                                          |\n| ------------------------ | ------------------------------------------------ |\n| `make:model <name>`      | `src/app/models/<name>.ts` + migration + factory |\n| `make:controller <name>` | `src/app/http/controllers/<name>.ts`             |\n| `make:middleware <name>` | `src/app/http/middleware/<name>.ts`              |\n| `make:auth`              | `src/app/http/auth.ts` + users model check       |\n| `make:service <name>`    | `src/app/services/<name>.ts`                     |\n| `make:job <name>`        | `src/app/jobs/<name>.ts`                         |\n| `make:event <name>`      | `src/app/events/<name>.ts`                       |\n| `make:policy <name>`     | `src/app/policies/<name>.ts`                     |\n| `make:task <name>`       | `src/app/tasks/<name>.ts`                        |\n| `make:command <name>`    | `src/app/console/<name>.ts`                      |\n| `make:page <path>`       | `src/ui/pages/<path>.tsx`                        |\n| `make:seeder <name>`     | `src/database/seeders/<name>.ts`                 |\n| `make:module <name>`     | `modules/<name>/` scaffold                       |\n| `make:test <name>`       | Matching test file                               |\n\nAll generators follow the naming conventions (lowercase, kebab-case) and emit typed stubs that pass `kwiva check`.\n\n## Database [#database]\n\n| Command                                | Action                                                            |\n| -------------------------------------- | ----------------------------------------------------------------- |\n| `db:migrate` / `db:rollback --steps=n` | Apply or revert migrations                                        |\n| `db:status` / `db:diff`                | Show applied/pending migrations; propose a model-vs-database diff |\n| `db:seed [--seeder]`                   | Run seeders                                                       |\n| `db:reset`                             | Drop → migrate → seed                                             |\n| `db:push`                              | Push the schema to dev without migration files (v1.x)             |\n| `db:browse`                            | Data browser (v1.x)                                               |\n\n## Queue & Schedule [#queue--schedule]\n\n| Command                                                        | Action                             |\n| -------------------------------------------------------------- | ---------------------------------- |\n| `queue:work --queue=... --concurrency=n`                       | Run workers                        |\n| `queue:listen`                                                 | Verbose worker for development     |\n| `queue:failed` / `queue:retry <id\\|--all>` / `queue:clear <q>` | Dead-letter queue management       |\n| `schedule:list [--json]`                                       | List scheduled tasks and next runs |\n| `schedule:work` / `schedule:run`                               | Foreground scheduler / single tick |\n| `task:run <name> [--payload]`                                  | Run one task manually              |\n\n## Config & Addons [#config--addons]\n\n| Command                 | Action                                                      |\n| ----------------------- | ----------------------------------------------------------- |\n| `config:cache` (v1.x)   | Snapshot the merged configuration                           |\n| `module:build`          | Package a module for distribution                           |\n| `add <addon>`           | Install and register an addon in one step                   |\n| `addons list`           | List installed addons (name, version, contribution summary) |\n| `addons search [query]` | Search the addon registry (v1.x)                            |\n| `addons info <addon>`   | Description, contributions, requirements, changelog         |\n| `addons remove <addon>` | Unregister and uninstall (migrations left intact, flagged)  |\n| `addons update [addon]` | Update within the compatibility range                       |\n| `addons outdated`       | List addons with newer compatible versions                  |\n\n## App-Defined Commands [#app-defined-commands]\n\nApplications define their own commands with `defineCommand`, auto-discovered from `src/app/console/`:\n\n```ts title=\"src/app/console/import-legacy.ts\"\n// src/app/console/import-legacy.ts\nimport { defineCommand } from '@kwiva/cli'\n\nexport default defineCommand('import:legacy', {\n  description: 'Import users from the legacy export',\n  signature: 'import:legacy {file} {--dry-run}',\n  handle: async ({ input, output, models, config }) => {\n    const file = input.argument('file')\n    const dry = input.option('dry-run')\n    const bar = output.progress(rows.length)\n    for (const row of rows) {\n      // process...\n      bar.tick()\n    }\n    output.info(`imported ${n} users`)\n  },\n})\n```\n\nCommand signatures use the standard `{arg}` / `{--flag}` form. Helpers include progress bars, tables, and styled output. Run it as:\n\n```bash title=\"terminal\"\nkwiva import:legacy export.csv --dry-run\n```\n\n## Global Flags [#global-flags]\n\n`--env <file>` · `--no-color` · `--json` (machine-readable where sensible) · `--verbose`\n\n## What to Read Next [#what-to-read-next]\n\n* [Project Commands](/docs/cli/project-commands) — Lifecycle commands in detail\n* [Generators](/docs/cli/generators) — The `make:*` commands\n* [Database Commands](/docs/cli/database-commands) — Migration and seed workflows\n* [Addon Commands](/docs/cli/addon-commands) — Installing and managing addons\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "`kwiva` is the single CLI for the entire application lifecycle. It's built on the Rust-speed toolchain, so every command — dev server, build, check, generators, database, queue, and schedule — runs fast and consistently. Commands are discovered from built-ins first, then application console commands (`src/app/console/`), then modules."
		},
		{
			"heading": "project--lifecycle",
			"content": "Command"
		},
		{
			"heading": "project--lifecycle",
			"content": "Action"
		},
		{
			"heading": "project--lifecycle",
			"content": "`kwiva new <name> --mode=<mode>`"
		},
		{
			"heading": "project--lifecycle",
			"content": "Scaffold an app (modes: `fullstack`, `api+spa`, `static`, `standalone`, `edge`)"
		},
		{
			"heading": "project--lifecycle",
			"content": "`kwiva dev [--port] [--cluster]`"
		},
		{
			"heading": "project--lifecycle",
			"content": "Start the dev server with HMR"
		},
		{
			"heading": "project--lifecycle",
			"content": "`kwiva build [--preset] [--binary] [--docs]`"
		},
		{
			"heading": "project--lifecycle",
			"content": "Production build (client + server)"
		},
		{
			"heading": "project--lifecycle",
			"content": "`kwiva preview`"
		},
		{
			"heading": "project--lifecycle",
			"content": "Serve the built output locally"
		},
		{
			"heading": "project--lifecycle",
			"content": "`kwiva deploy [provider]`"
		},
		{
			"heading": "project--lifecycle",
			"content": "Build then run the provider's deploy path"
		},
		{
			"heading": "project--lifecycle",
			"content": "`kwiva check [--fix] [--audit]`"
		},
		{
			"heading": "project--lifecycle",
			"content": "Format, lint, and typecheck; `--fix` auto-fixes, `--audit` checks dependencies (v1.x)"
		},
		{
			"heading": "project--lifecycle",
			"content": "`kwiva test [--e2e] [--watch] [filter]`"
		},
		{
			"heading": "project--lifecycle",
			"content": "Run tests; `--e2e` runs end-to-end tests"
		},
		{
			"heading": "project--lifecycle",
			"content": "`kwiva console`"
		},
		{
			"heading": "project--lifecycle",
			"content": "REPL with the app context (config, models, client)"
		},
		{
			"heading": "project--lifecycle",
			"content": "`kwiva upgrade`"
		},
		{
			"heading": "project--lifecycle",
			"content": "Run codemod recipes and dependency bumps"
		},
		{
			"heading": "project--lifecycle",
			"content": "`kwiva key:generate`"
		},
		{
			"heading": "project--lifecycle",
			"content": "Generate `APP_KEY` into `.env`"
		},
		{
			"heading": "project--lifecycle",
			"content": "`kwiva doctor`"
		},
		{
			"heading": "project--lifecycle",
			"content": "Environment/runtime/dependency diagnostics (v1.x)"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "Command"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "Creates"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:model <name>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`src/app/models/<name>.ts` + migration + factory"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:controller <name>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`src/app/http/controllers/<name>.ts`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:middleware <name>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`src/app/http/middleware/<name>.ts`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:auth`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`src/app/http/auth.ts` + users model check"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:service <name>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`src/app/services/<name>.ts`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:job <name>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`src/app/jobs/<name>.ts`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:event <name>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`src/app/events/<name>.ts`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:policy <name>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`src/app/policies/<name>.ts`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:task <name>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`src/app/tasks/<name>.ts`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:command <name>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`src/app/console/<name>.ts`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:page <path>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`src/ui/pages/<path>.tsx`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:seeder <name>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`src/database/seeders/<name>.ts`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:module <name>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`modules/<name>/` scaffold"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "`make:test <name>`"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "Matching test file"
		},
		{
			"heading": "generators-kwiva-make",
			"content": "All generators follow the naming conventions (lowercase, kebab-case) and emit typed stubs that pass `kwiva check`."
		},
		{
			"heading": "database",
			"content": "Command"
		},
		{
			"heading": "database",
			"content": "Action"
		},
		{
			"heading": "database",
			"content": "`db:migrate` / `db:rollback --steps=n`"
		},
		{
			"heading": "database",
			"content": "Apply or revert migrations"
		},
		{
			"heading": "database",
			"content": "`db:status` / `db:diff`"
		},
		{
			"heading": "database",
			"content": "Show applied/pending migrations; propose a model-vs-database diff"
		},
		{
			"heading": "database",
			"content": "`db:seed [--seeder]`"
		},
		{
			"heading": "database",
			"content": "Run seeders"
		},
		{
			"heading": "database",
			"content": "`db:reset`"
		},
		{
			"heading": "database",
			"content": "Drop → migrate → seed"
		},
		{
			"heading": "database",
			"content": "`db:push`"
		},
		{
			"heading": "database",
			"content": "Push the schema to dev without migration files (v1.x)"
		},
		{
			"heading": "database",
			"content": "`db:browse`"
		},
		{
			"heading": "database",
			"content": "Data browser (v1.x)"
		},
		{
			"heading": "queue--schedule",
			"content": "Command"
		},
		{
			"heading": "queue--schedule",
			"content": "Action"
		},
		{
			"heading": "queue--schedule",
			"content": "`queue:work --queue=... --concurrency=n`"
		},
		{
			"heading": "queue--schedule",
			"content": "Run workers"
		},
		{
			"heading": "queue--schedule",
			"content": "`queue:listen`"
		},
		{
			"heading": "queue--schedule",
			"content": "Verbose worker for development"
		},
		{
			"heading": "queue--schedule",
			"content": "`queue:failed` / `queue:retry <id\\|--all>` / `queue:clear <q>`"
		},
		{
			"heading": "queue--schedule",
			"content": "Dead-letter queue management"
		},
		{
			"heading": "queue--schedule",
			"content": "`schedule:list [--json]`"
		},
		{
			"heading": "queue--schedule",
			"content": "List scheduled tasks and next runs"
		},
		{
			"heading": "queue--schedule",
			"content": "`schedule:work` / `schedule:run`"
		},
		{
			"heading": "queue--schedule",
			"content": "Foreground scheduler / single tick"
		},
		{
			"heading": "queue--schedule",
			"content": "`task:run <name> [--payload]`"
		},
		{
			"heading": "queue--schedule",
			"content": "Run one task manually"
		},
		{
			"heading": "config--addons",
			"content": "Command"
		},
		{
			"heading": "config--addons",
			"content": "Action"
		},
		{
			"heading": "config--addons",
			"content": "`config:cache` (v1.x)"
		},
		{
			"heading": "config--addons",
			"content": "Snapshot the merged configuration"
		},
		{
			"heading": "config--addons",
			"content": "`module:build`"
		},
		{
			"heading": "config--addons",
			"content": "Package a module for distribution"
		},
		{
			"heading": "config--addons",
			"content": "`add <addon>`"
		},
		{
			"heading": "config--addons",
			"content": "Install and register an addon in one step"
		},
		{
			"heading": "config--addons",
			"content": "`addons list`"
		},
		{
			"heading": "config--addons",
			"content": "List installed addons (name, version, contribution summary)"
		},
		{
			"heading": "config--addons",
			"content": "`addons search [query]`"
		},
		{
			"heading": "config--addons",
			"content": "Search the addon registry (v1.x)"
		},
		{
			"heading": "config--addons",
			"content": "`addons info <addon>`"
		},
		{
			"heading": "config--addons",
			"content": "Description, contributions, requirements, changelog"
		},
		{
			"heading": "config--addons",
			"content": "`addons remove <addon>`"
		},
		{
			"heading": "config--addons",
			"content": "Unregister and uninstall (migrations left intact, flagged)"
		},
		{
			"heading": "config--addons",
			"content": "`addons update [addon]`"
		},
		{
			"heading": "config--addons",
			"content": "Update within the compatibility range"
		},
		{
			"heading": "config--addons",
			"content": "`addons outdated`"
		},
		{
			"heading": "config--addons",
			"content": "List addons with newer compatible versions"
		},
		{
			"heading": "app-defined-commands",
			"content": "Applications define their own commands with `defineCommand`, auto-discovered from `src/app/console/`:"
		},
		{
			"heading": "app-defined-commands",
			"content": "Command signatures use the standard `{arg}` / `{--flag}` form. Helpers include progress bars, tables, and styled output. Run it as:"
		},
		{
			"heading": "global-flags",
			"content": "`--env <file>` · `--no-color` · `--json` (machine-readable where sensible) · `--verbose`"
		},
		{
			"heading": "what-to-read-next",
			"content": "Project Commands — Lifecycle commands in detail"
		},
		{
			"heading": "what-to-read-next",
			"content": "Generators — The `make:*` commands"
		},
		{
			"heading": "what-to-read-next",
			"content": "Database Commands — Migration and seed workflows"
		},
		{
			"heading": "what-to-read-next",
			"content": "Addon Commands — Installing and managing addons"
		}
	],
	"headings": [
		{
			"id": "project--lifecycle",
			"content": "Project & Lifecycle"
		},
		{
			"id": "generators-kwiva-make",
			"content": "Generators (`kwiva make:*`)"
		},
		{
			"id": "database",
			"content": "Database"
		},
		{
			"id": "queue--schedule",
			"content": "Queue & Schedule"
		},
		{
			"id": "config--addons",
			"content": "Config & Addons"
		},
		{
			"id": "app-defined-commands",
			"content": "App-Defined Commands"
		},
		{
			"id": "global-flags",
			"content": "Global Flags"
		},
		{
			"id": "what-to-read-next",
			"content": "What to Read Next"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#project--lifecycle",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Project & Lifecycle" })
	},
	{
		depth: 2,
		url: "#generators-kwiva-make",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
			"Generators (",
			(0, import_jsx_runtime_react_server.jsx)("code", { children: "kwiva make:*" }),
			")"
		] })
	},
	{
		depth: 2,
		url: "#database",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Database" })
	},
	{
		depth: 2,
		url: "#queue--schedule",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Queue & Schedule" })
	},
	{
		depth: 2,
		url: "#config--addons",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Config & Addons" })
	},
	{
		depth: 2,
		url: "#app-defined-commands",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "App-Defined Commands" })
	},
	{
		depth: 2,
		url: "#global-flags",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Global Flags" })
	},
	{
		depth: 2,
		url: "#what-to-read-next",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What to Read Next" })
	}
];
function _createMdxContent(props) {
	const _components = {
		a: "a",
		code: "code",
		h2: "h2",
		li: "li",
		p: "p",
		pre: "pre",
		span: "span",
		table: "table",
		tbody: "tbody",
		td: "td",
		th: "th",
		thead: "thead",
		tr: "tr",
		ul: "ul",
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva" }),
			" is the single CLI for the entire application lifecycle. It's built on the Rust-speed toolchain, so every command — dev server, build, check, generators, database, queue, and schedule — runs fast and consistently. Commands are discovered from built-ins first, then application console commands (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/console/" }),
			"), then modules."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "project--lifecycle",
			children: "Project & Lifecycle"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Action" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva new <name> --mode=<mode>" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Scaffold an app (modes: ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }),
				")"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev [--port] [--cluster]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Start the dev server with HMR" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build [--preset] [--binary] [--docs]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Production build (client + server)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Serve the built output locally" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy [provider]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build then run the provider's deploy path" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check [--fix] [--audit]" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Format, lint, and typecheck; ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--fix" }),
				" auto-fixes, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--audit" }),
				" checks dependencies (v1.x)"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test [--e2e] [--watch] [filter]" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Run tests; ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--e2e" }),
				" runs end-to-end tests"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva console" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "REPL with the app context (config, models, client)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva upgrade" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run codemod recipes and dependency bumps" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva key:generate" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Generate ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "APP_KEY" }),
				" into ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env" })
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva doctor" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Environment/runtime/dependency diagnostics (v1.x)" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "generators-kwiva-make",
			children: [
				"Generators (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:*" }),
				")"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Creates" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:model <name>" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/<name>.ts" }), " + migration + factory"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:controller <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/controllers/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:middleware <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/middleware/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:auth" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/auth.ts" }), " + users model check"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:service <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/services/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:job <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:event <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/events/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:policy <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/policies/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:task <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/tasks/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:command <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/console/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:page <path>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/<path>.tsx" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:seeder <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/database/seeders/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:module <name>" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "modules/<name>/" }), " scaffold"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:test <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Matching test file" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"All generators follow the naming conventions (lowercase, kebab-case) and emit typed stubs that pass ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "database",
			children: "Database"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Action" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:migrate" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:rollback --steps=n" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Apply or revert migrations" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:status" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:diff" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Show applied/pending migrations; propose a model-vs-database diff" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:seed [--seeder]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run seeders" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:reset" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Drop → migrate → seed" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:push" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Push the schema to dev without migration files (v1.x)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:browse" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Data browser (v1.x)" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "queue--schedule",
			children: "Queue & Schedule"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Action" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue:work --queue=... --concurrency=n" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run workers" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue:listen" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Verbose worker for development" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue:failed" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue:retry <id|--all>" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue:clear <q>" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dead-letter queue management" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schedule:list [--json]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "List scheduled tasks and next runs" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schedule:work" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schedule:run" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Foreground scheduler / single tick" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task:run <name> [--payload]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run one task manually" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "config--addons",
			children: "Config & Addons"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Action" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config:cache" }), " (v1.x)"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Snapshot the merged configuration" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "module:build" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Package a module for distribution" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "add <addon>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Install and register an addon in one step" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons list" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "List installed addons (name, version, contribution summary)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons search [query]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Search the addon registry (v1.x)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons info <addon>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Description, contributions, requirements, changelog" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons remove <addon>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Unregister and uninstall (migrations left intact, flagged)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons update [addon]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Update within the compatibility range" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons outdated" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "List addons with newer compatible versions" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "app-defined-commands",
			children: "App-Defined Commands"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Applications define their own commands with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineCommand" }),
			", auto-discovered from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/console/" }),
			":"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "src/app/console/import-legacy.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/console/import-legacy.ts"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { defineCommand } "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "from"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " '@kwiva/cli'"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "export"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " default"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " defineCommand"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'import:legacy'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", {"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  description: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Import users from the legacy export'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  signature: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'import:legacy {file} {--dry-run}'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  handle"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "async"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "input"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "output"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "models"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "config"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }) "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "=>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " {"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "    const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " file"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " ="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " input."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "argument"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'file'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "    const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " dry"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " ="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " input."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "option"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'dry-run'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "    const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " bar"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " ="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " output."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "progress"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(rows."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "length"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "    for"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " row"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " of"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " rows) {"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "      // process..."
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "      bar."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "tick"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "    }"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "    output."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "info"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "`imported ${"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "n"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "} users`"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  },"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Command signatures use the standard ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{arg}" }),
			" / ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{--flag}" }),
			" form. Helpers include progress bars, tables, and styled output. Run it as:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "terminal",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "kwiva"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " import:legacy"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " export.csv"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: " --dry-run"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "global-flags",
			children: "Global Flags"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--env <file>" }),
			" · ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--no-color" }),
			" · ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--json" }),
			" (machine-readable where sensible) · ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--verbose" })
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-to-read-next",
			children: "What to Read Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/project-commands",
				children: "Project Commands"
			}), " — Lifecycle commands in detail"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/cli/generators",
					children: "Generators"
				}),
				" — The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:*" }),
				" commands"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/database-commands",
				children: "Database Commands"
			}), " — Migration and seed workflows"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/addon-commands",
				children: "Addon Commands"
			}), " — Installing and managing addons"] }),
			"\n"
		] })
	] });
}
function MDXContent(props = {}) {
	const { wrapper: MDXLayout } = props.components || {};
	return MDXLayout ? (0, import_jsx_runtime_react_server.jsx)(MDXLayout, {
		...props,
		children: (0, import_jsx_runtime_react_server.jsx)(_createMdxContent, { ...props })
	}) : _createMdxContent(props);
}
//#endregion
export { _markdown, MDXContent as default, frontmatter, lastModified, structuredData, toc };
