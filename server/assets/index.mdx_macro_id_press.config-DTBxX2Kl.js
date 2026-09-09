import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/cli/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "CLI",
	"description": "The kwiva binary — project scaffolding, generators, database, queue, schedule, and addon commands in one tool."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nThe `kwiva` binary is one CLI for the entire application lifecycle, built on the Rust-speed toolchain and the Bun runtime. Scaffold a project, generate typed files, run the type/lint/format gate, migrate and seed the database, start queue workers, drive the scheduler, and install addons — all from one command surface with one set of conventions.\n\nThis page is the map. Each command group has its own reference page, and the sections below explain the design rules every command follows — so once you learn one command, the rest are variations on the same grammar.\n\n## One CLI for the Whole Lifecycle [#one-cli-for-the-whole-lifecycle]\n\nFrameworks that spread their operations across several tools force you to learn several conventions. Kwiva deliberately does not: project scaffolding, development, verification, database operations, background work, deployment, and addon management are all `kwiva` commands. The CLI also reads `kwiva.config.ts` for every command, so mode and presets flow from configuration — there is no second configuration format to keep in sync.\n\nCommand resolution is deterministic — built-ins first, then your app's console commands, then module commands. If your application defines `import:legacy` and a module defines the same name, the app's command wins; the resolver never has to guess.\n\n```bash title=\"terminal\"\nkwiva new helpdesk          # scaffold\nkwiva dev                   # develop\nkwiva check                 # gate\nkwiva test                  # verify behavior\nkwiva db:migrate            # schema\nkwiva build && kwiva deploy # ship\n```\n\n## Command Surface [#command-surface]\n\n| Group                                             | Commands                                                                                                                                 | What they do                                       |\n| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |\n| [Project & lifecycle](/docs/cli/project-commands) | `new`, `dev`, `check`, `test`, `build`, `preview`, `deploy`, `console`, `key:generate`, `upgrade`, `config:cache`                        | Scaffold, develop, verify, build, and ship the app |\n| [Generators](/docs/cli/generators)                | `make:model`, `make:controller`, `make:job`, and the rest of `make:*`                                                                    | Emit typed, convention-compliant files             |\n| [Database](/docs/cli/database-commands)           | `db:migrate`, `db:rollback`, `db:seed`, `db:reset`, `db:studio`, `db:status`, `db:diff`, `db:push`                                       | Own migrations, seeders, and schema                |\n| Queue & schedule                                  | `queue:work`, `queue:listen`, `queue:failed`, `queue:retry`, `queue:clear`, `schedule:list`, `schedule:work`, `schedule:run`, `task:run` | Run workers and drive the scheduler                |\n| Addons                                            | `add`, `addons search`, `addons list`, `addons info`, `addons remove`, `addons update`, `addons outdated`                                | Install and manage capabilities                    |\n| Config & misc                                     | `config:cache`, `module:build`, `doctor`                                                                                                 | Cache config, package modules, diagnose            |\n\n## Quick Reference [#quick-reference]\n\n| Command                             | One-line description                     |\n| ----------------------------------- | ---------------------------------------- |\n| `kwiva new <name> --mode=<mode>`    | Scaffold an app skeleton                 |\n| `kwiva dev`                         | Start the dev server with HMR            |\n| `kwiva check`                       | Run the exec/lint/format gate            |\n| `kwiva test [--e2e]`                | Run tests, optionally end-to-end         |\n| `kwiva build [--preset] [--binary]` | Produce the production build             |\n| `kwiva console`                     | Open a REPL with app context             |\n| `kwiva make:model post`             | Generate a model, migration, and factory |\n| `kwiva db:migrate`                  | Apply pending migrations                 |\n| `kwiva queue:work --concurrency=5`  | Start the built-in queue worker          |\n| `kwiva schedule:work`               | Run the foreground scheduler             |\n| `kwiva add <addon>`                 | Install and register an addon            |\n\n## What Every Command Shares [#what-every-command-shares]\n\nThree rules make the surface predictable:\n\n* **Conventions are enforced, not assumed.** Generators emit lowercase, kebab-named files with typed stubs that pass `kwiva check`; database commands operate on model-derived migrations; anything that violates a convention is rejected at creation time rather than failing the gate later.\n* **Configuration is central.** Every command reads `kwiva.config.ts` and the typed config folder. The same `src/config/database.ts` that the application uses at runtime is what `db:migrate` reads — what the CLI touches is exactly what the app connects to.\n* **Output is scriptable.** Global flags such as `--json` make command output machine-readable where sensible, so the CLI slots into shell scripts and CI pipelines, not just interactive terminals.\n\nInteractive prompts fill in omitted arguments — run `kwiva new` with no name and you are asked — while supplying all arguments runs the command non-interactively for scripts. Colors appear only in TTY sessions, `NO_COLOR` is respected, and errors include did-you-mean suggestions for mistyped commands.\n\n## Finding the Command You Need [#finding-the-command-you-need]\n\n* **I want to start working** — `kwiva new`, then `kwiva dev`.\n* **I need a file generated** — anything starting with `make:`; it maps one-to-one to the [defineX convention](/docs/core-concepts/definex).\n* **I changed a model** — run `kwiva check` for types and lint, then `kwiva db:diff` to preview the schema change.\n* **Work should happen later** — `kwiva make:job` for queue work, `kwiva make:task` plus `src/config/schedule.ts` for cron work.\n* **I'm unsure about the environment** — `kwiva doctor` (v1.x) diagnoses runtime, environment, and dependency health.\n* **I want to ship** — `kwiva build`, `kwiva preview` to inspect, then `kwiva deploy`.\n\n## App-Defined Commands [#app-defined-commands]\n\nThe CLI is extensible from the application itself. Commands in `src/app/console/` are auto-discovered and join the built-in surface under their own names:\n\n```ts title=\"src/app/console/import-legacy.ts\"\n// src/app/console/import-legacy.ts\nimport { defineCommand } from '@kwiva/cli'\n\nexport default defineCommand('import:legacy', {\n  description: 'Import users from the legacy export',\n  signature: 'import:legacy {file} {--dry-run}',\n  handle: async ({ input, output, models, config }) => {\n    const file = input.argument('file')\n    const dry = input.option('dry-run')\n    const bar = output.progress(rows.length)\n    for (const row of rows) { ...; bar.tick() }\n    output.info(`imported ${n} users`)\n  },\n})\n```\n\nSignature-based parsing, progress bars, tables, and styled output come built in. The `handle` receives typed access to application state — `models`, `config`, and anything else the app resolves — so an app-defined command is just code with the framework's context. Run it exactly like a built-in:\n\n```bash title=\"terminal\"\nkwiva import:legacy export.csv --dry-run\n```\n\nThe signature grammar mirrors the rest of the surface: `{file}` declares a positional argument, `{--dry-run}` declares a boolean flag. See [The defineX Convention](/docs/core-concepts/definex) for how auto-discovery picks files up.\n\n## Global Flags [#global-flags]\n\nEvery command accepts the same global flags:\n\n| Flag           | Effect                                 |\n| -------------- | -------------------------------------- |\n| `--env <file>` | Load a specific environment file       |\n| `--no-color`   | Disable styled output                  |\n| `--json`       | Machine-readable output where sensible |\n| `--verbose`    | Extended logging                       |\n\n`--env` lets a script point any command at a specific environment file without touching the working directory's default. `--json` is the scripting hook — schedule listings, addon inventories, and status tables are available as structured data where a consumer would want them.\n\n## Generators, Database, and Addons [#generators-database-and-addons]\n\nThe three command families you will reach for constantly each have their own reference page:\n\n| Page                                                       | Covers                                                                                                                |\n| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |\n| [Generators](/docs/cli/generators)                         | The full `make:*` surface — model, controller, service, job, event, policy, task, command, page, seeder, module, test |\n| [Database Commands](/docs/cli/database-commands)           | Migrations, rollback, seed, reset, status, diff, push, Studio                                                         |\n| [Addon Commands](/docs/cli/addon-commands)                 | `add`, `addons list/search/info/remove/update/outdated`                                                               |\n| [Project & Lifecycle Commands](/docs/cli/project-commands) | The full arc from `new` to `deploy`                                                                                   |\n\n## What's Next [#whats-next]\n\n* [Project & Lifecycle Commands](/docs/cli/project-commands) — scaffold, develop, check, build, deploy\n* [Generators](/docs/cli/generators) — the full `make:*` surface\n* [Database Commands](/docs/cli/database-commands) — migrations, seeders, and schema\n* [Addon Commands](/docs/cli/addon-commands) — install and manage capabilities\n* [The defineX Convention](/docs/core-concepts/definex) — the pattern every generator emits\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The `kwiva` binary is one CLI for the entire application lifecycle, built on the Rust-speed toolchain and the Bun runtime. Scaffold a project, generate typed files, run the type/lint/format gate, migrate and seed the database, start queue workers, drive the scheduler, and install addons — all from one command surface with one set of conventions."
		},
		{
			"heading": void 0,
			"content": "This page is the map. Each command group has its own reference page, and the sections below explain the design rules every command follows — so once you learn one command, the rest are variations on the same grammar."
		},
		{
			"heading": "one-cli-for-the-whole-lifecycle",
			"content": "Frameworks that spread their operations across several tools force you to learn several conventions. Kwiva deliberately does not: project scaffolding, development, verification, database operations, background work, deployment, and addon management are all `kwiva` commands. The CLI also reads `kwiva.config.ts` for every command, so mode and presets flow from configuration — there is no second configuration format to keep in sync."
		},
		{
			"heading": "one-cli-for-the-whole-lifecycle",
			"content": "Command resolution is deterministic — built-ins first, then your app's console commands, then module commands. If your application defines `import:legacy` and a module defines the same name, the app's command wins; the resolver never has to guess."
		},
		{
			"heading": "command-surface",
			"content": "Group"
		},
		{
			"heading": "command-surface",
			"content": "Commands"
		},
		{
			"heading": "command-surface",
			"content": "What they do"
		},
		{
			"heading": "command-surface",
			"content": "Project & lifecycle"
		},
		{
			"heading": "command-surface",
			"content": "`new`, `dev`, `check`, `test`, `build`, `preview`, `deploy`, `console`, `key:generate`, `upgrade`, `config:cache`"
		},
		{
			"heading": "command-surface",
			"content": "Scaffold, develop, verify, build, and ship the app"
		},
		{
			"heading": "command-surface",
			"content": "Generators"
		},
		{
			"heading": "command-surface",
			"content": "`make:model`, `make:controller`, `make:job`, and the rest of `make:*`"
		},
		{
			"heading": "command-surface",
			"content": "Emit typed, convention-compliant files"
		},
		{
			"heading": "command-surface",
			"content": "Database"
		},
		{
			"heading": "command-surface",
			"content": "`db:migrate`, `db:rollback`, `db:seed`, `db:reset`, `db:studio`, `db:status`, `db:diff`, `db:push`"
		},
		{
			"heading": "command-surface",
			"content": "Own migrations, seeders, and schema"
		},
		{
			"heading": "command-surface",
			"content": "Queue & schedule"
		},
		{
			"heading": "command-surface",
			"content": "`queue:work`, `queue:listen`, `queue:failed`, `queue:retry`, `queue:clear`, `schedule:list`, `schedule:work`, `schedule:run`, `task:run`"
		},
		{
			"heading": "command-surface",
			"content": "Run workers and drive the scheduler"
		},
		{
			"heading": "command-surface",
			"content": "Addons"
		},
		{
			"heading": "command-surface",
			"content": "`add`, `addons search`, `addons list`, `addons info`, `addons remove`, `addons update`, `addons outdated`"
		},
		{
			"heading": "command-surface",
			"content": "Install and manage capabilities"
		},
		{
			"heading": "command-surface",
			"content": "Config & misc"
		},
		{
			"heading": "command-surface",
			"content": "`config:cache`, `module:build`, `doctor`"
		},
		{
			"heading": "command-surface",
			"content": "Cache config, package modules, diagnose"
		},
		{
			"heading": "quick-reference",
			"content": "Command"
		},
		{
			"heading": "quick-reference",
			"content": "One-line description"
		},
		{
			"heading": "quick-reference",
			"content": "`kwiva new <name> --mode=<mode>`"
		},
		{
			"heading": "quick-reference",
			"content": "Scaffold an app skeleton"
		},
		{
			"heading": "quick-reference",
			"content": "`kwiva dev`"
		},
		{
			"heading": "quick-reference",
			"content": "Start the dev server with HMR"
		},
		{
			"heading": "quick-reference",
			"content": "`kwiva check`"
		},
		{
			"heading": "quick-reference",
			"content": "Run the exec/lint/format gate"
		},
		{
			"heading": "quick-reference",
			"content": "`kwiva test [--e2e]`"
		},
		{
			"heading": "quick-reference",
			"content": "Run tests, optionally end-to-end"
		},
		{
			"heading": "quick-reference",
			"content": "`kwiva build [--preset] [--binary]`"
		},
		{
			"heading": "quick-reference",
			"content": "Produce the production build"
		},
		{
			"heading": "quick-reference",
			"content": "`kwiva console`"
		},
		{
			"heading": "quick-reference",
			"content": "Open a REPL with app context"
		},
		{
			"heading": "quick-reference",
			"content": "`kwiva make:model post`"
		},
		{
			"heading": "quick-reference",
			"content": "Generate a model, migration, and factory"
		},
		{
			"heading": "quick-reference",
			"content": "`kwiva db:migrate`"
		},
		{
			"heading": "quick-reference",
			"content": "Apply pending migrations"
		},
		{
			"heading": "quick-reference",
			"content": "`kwiva queue:work --concurrency=5`"
		},
		{
			"heading": "quick-reference",
			"content": "Start the built-in queue worker"
		},
		{
			"heading": "quick-reference",
			"content": "`kwiva schedule:work`"
		},
		{
			"heading": "quick-reference",
			"content": "Run the foreground scheduler"
		},
		{
			"heading": "quick-reference",
			"content": "`kwiva add <addon>`"
		},
		{
			"heading": "quick-reference",
			"content": "Install and register an addon"
		},
		{
			"heading": "what-every-command-shares",
			"content": "Three rules make the surface predictable:"
		},
		{
			"heading": "what-every-command-shares",
			"content": "**Conventions are enforced, not assumed.** Generators emit lowercase, kebab-named files with typed stubs that pass `kwiva check`; database commands operate on model-derived migrations; anything that violates a convention is rejected at creation time rather than failing the gate later."
		},
		{
			"heading": "what-every-command-shares",
			"content": "**Configuration is central.** Every command reads `kwiva.config.ts` and the typed config folder. The same `src/config/database.ts` that the application uses at runtime is what `db:migrate` reads — what the CLI touches is exactly what the app connects to."
		},
		{
			"heading": "what-every-command-shares",
			"content": "**Output is scriptable.** Global flags such as `--json` make command output machine-readable where sensible, so the CLI slots into shell scripts and CI pipelines, not just interactive terminals."
		},
		{
			"heading": "what-every-command-shares",
			"content": "Interactive prompts fill in omitted arguments — run `kwiva new` with no name and you are asked — while supplying all arguments runs the command non-interactively for scripts. Colors appear only in TTY sessions, `NO_COLOR` is respected, and errors include did-you-mean suggestions for mistyped commands."
		},
		{
			"heading": "finding-the-command-you-need",
			"content": "**I want to start working** — `kwiva new`, then `kwiva dev`."
		},
		{
			"heading": "finding-the-command-you-need",
			"content": "**I need a file generated** — anything starting with `make:`; it maps one-to-one to the defineX convention."
		},
		{
			"heading": "finding-the-command-you-need",
			"content": "**I changed a model** — run `kwiva check` for types and lint, then `kwiva db:diff` to preview the schema change."
		},
		{
			"heading": "finding-the-command-you-need",
			"content": "**Work should happen later** — `kwiva make:job` for queue work, `kwiva make:task` plus `src/config/schedule.ts` for cron work."
		},
		{
			"heading": "finding-the-command-you-need",
			"content": "**I'm unsure about the environment** — `kwiva doctor` (v1.x) diagnoses runtime, environment, and dependency health."
		},
		{
			"heading": "finding-the-command-you-need",
			"content": "**I want to ship** — `kwiva build`, `kwiva preview` to inspect, then `kwiva deploy`."
		},
		{
			"heading": "app-defined-commands",
			"content": "The CLI is extensible from the application itself. Commands in `src/app/console/` are auto-discovered and join the built-in surface under their own names:"
		},
		{
			"heading": "app-defined-commands",
			"content": "Signature-based parsing, progress bars, tables, and styled output come built in. The `handle` receives typed access to application state — `models`, `config`, and anything else the app resolves — so an app-defined command is just code with the framework's context. Run it exactly like a built-in:"
		},
		{
			"heading": "app-defined-commands",
			"content": "The signature grammar mirrors the rest of the surface: `{file}` declares a positional argument, `{--dry-run}` declares a boolean flag. See The defineX Convention for how auto-discovery picks files up."
		},
		{
			"heading": "global-flags",
			"content": "Every command accepts the same global flags:"
		},
		{
			"heading": "global-flags",
			"content": "Flag"
		},
		{
			"heading": "global-flags",
			"content": "Effect"
		},
		{
			"heading": "global-flags",
			"content": "`--env <file>`"
		},
		{
			"heading": "global-flags",
			"content": "Load a specific environment file"
		},
		{
			"heading": "global-flags",
			"content": "`--no-color`"
		},
		{
			"heading": "global-flags",
			"content": "Disable styled output"
		},
		{
			"heading": "global-flags",
			"content": "`--json`"
		},
		{
			"heading": "global-flags",
			"content": "Machine-readable output where sensible"
		},
		{
			"heading": "global-flags",
			"content": "`--verbose`"
		},
		{
			"heading": "global-flags",
			"content": "Extended logging"
		},
		{
			"heading": "global-flags",
			"content": "`--env` lets a script point any command at a specific environment file without touching the working directory's default. `--json` is the scripting hook — schedule listings, addon inventories, and status tables are available as structured data where a consumer would want them."
		},
		{
			"heading": "generators-database-and-addons",
			"content": "The three command families you will reach for constantly each have their own reference page:"
		},
		{
			"heading": "generators-database-and-addons",
			"content": "Page"
		},
		{
			"heading": "generators-database-and-addons",
			"content": "Covers"
		},
		{
			"heading": "generators-database-and-addons",
			"content": "Generators"
		},
		{
			"heading": "generators-database-and-addons",
			"content": "The full `make:*` surface — model, controller, service, job, event, policy, task, command, page, seeder, module, test"
		},
		{
			"heading": "generators-database-and-addons",
			"content": "Database Commands"
		},
		{
			"heading": "generators-database-and-addons",
			"content": "Migrations, rollback, seed, reset, status, diff, push, Studio"
		},
		{
			"heading": "generators-database-and-addons",
			"content": "Addon Commands"
		},
		{
			"heading": "generators-database-and-addons",
			"content": "`add`, `addons list/search/info/remove/update/outdated`"
		},
		{
			"heading": "generators-database-and-addons",
			"content": "Project & Lifecycle Commands"
		},
		{
			"heading": "generators-database-and-addons",
			"content": "The full arc from `new` to `deploy`"
		},
		{
			"heading": "whats-next",
			"content": "Project & Lifecycle Commands — scaffold, develop, check, build, deploy"
		},
		{
			"heading": "whats-next",
			"content": "Generators — the full `make:*` surface"
		},
		{
			"heading": "whats-next",
			"content": "Database Commands — migrations, seeders, and schema"
		},
		{
			"heading": "whats-next",
			"content": "Addon Commands — install and manage capabilities"
		},
		{
			"heading": "whats-next",
			"content": "The defineX Convention — the pattern every generator emits"
		}
	],
	"headings": [
		{
			"id": "one-cli-for-the-whole-lifecycle",
			"content": "One CLI for the Whole Lifecycle"
		},
		{
			"id": "command-surface",
			"content": "Command Surface"
		},
		{
			"id": "quick-reference",
			"content": "Quick Reference"
		},
		{
			"id": "what-every-command-shares",
			"content": "What Every Command Shares"
		},
		{
			"id": "finding-the-command-you-need",
			"content": "Finding the Command You Need"
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
			"id": "generators-database-and-addons",
			"content": "Generators, Database, and Addons"
		},
		{
			"id": "whats-next",
			"content": "What's Next"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#one-cli-for-the-whole-lifecycle",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One CLI for the Whole Lifecycle" })
	},
	{
		depth: 2,
		url: "#command-surface",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Command Surface" })
	},
	{
		depth: 2,
		url: "#quick-reference",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Quick Reference" })
	},
	{
		depth: 2,
		url: "#what-every-command-shares",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Every Command Shares" })
	},
	{
		depth: 2,
		url: "#finding-the-command-you-need",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Finding the Command You Need" })
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
		url: "#generators-database-and-addons",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generators, Database, and Addons" })
	},
	{
		depth: 2,
		url: "#whats-next",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What's Next" })
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
		strong: "strong",
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
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva" }),
			" binary is one CLI for the entire application lifecycle, built on the Rust-speed toolchain and the Bun runtime. Scaffold a project, generate typed files, run the type/lint/format gate, migrate and seed the database, start queue workers, drive the scheduler, and install addons — all from one command surface with one set of conventions."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This page is the map. Each command group has its own reference page, and the sections below explain the design rules every command follows — so once you learn one command, the rest are variations on the same grammar." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "one-cli-for-the-whole-lifecycle",
			children: "One CLI for the Whole Lifecycle"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Frameworks that spread their operations across several tools force you to learn several conventions. Kwiva deliberately does not: project scaffolding, development, verification, database operations, background work, deployment, and addon management are all ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva" }),
			" commands. The CLI also reads ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
			" for every command, so mode and presets flow from configuration — there is no second configuration format to keep in sync."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Command resolution is deterministic — built-ins first, then your app's console commands, then module commands. If your application defines ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "import:legacy" }),
			" and a module defines the same name, the app's command wins; the resolver never has to guess."
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
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
							children: " new"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " helpdesk"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "          # scaffold"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " dev"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                   # develop"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " check"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                 # gate"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " test"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                  # verify behavior"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " db:migrate"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "            # schema"
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
							children: "kwiva"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " build"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " && "
						}),
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
							children: " deploy"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: " # ship"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "command-surface",
			children: "Command Surface"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Group" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Commands" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What they do" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/cli/project-commands",
					children: "Project & lifecycle"
				}) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "new" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "dev" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "check" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "test" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "build" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "preview" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deploy" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "console" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "key:generate" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "upgrade" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config:cache" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scaffold, develop, verify, build, and ship the app" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/cli/generators",
					children: "Generators"
				}) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:model" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:controller" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:job" }),
					", and the rest of ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:*" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Emit typed, convention-compliant files" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/cli/database-commands",
					children: "Database"
				}) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:migrate" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:rollback" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:seed" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:reset" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:studio" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:status" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:diff" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:push" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Own migrations, seeders, and schema" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Queue & schedule" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue:work" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue:listen" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue:failed" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue:retry" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue:clear" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schedule:list" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schedule:work" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schedule:run" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "task:run" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run workers and drive the scheduler" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Addons" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "add" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons search" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons list" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons info" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons remove" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons update" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons outdated" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Install and manage capabilities" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Config & misc" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config:cache" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "module:build" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "doctor" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Cache config, package modules, diagnose" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "quick-reference",
			children: "Quick Reference"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "One-line description" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva new <name> --mode=<mode>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scaffold an app skeleton" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Start the dev server with HMR" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run the exec/lint/format gate" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test [--e2e]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run tests, optionally end-to-end" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build [--preset] [--binary]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Produce the production build" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva console" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Open a REPL with app context" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:model post" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generate a model, migration, and factory" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Apply pending migrations" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva queue:work --concurrency=5" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Start the built-in queue worker" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva schedule:work" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run the foreground scheduler" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add <addon>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Install and register an addon" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-every-command-shares",
			children: "What Every Command Shares"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Three rules make the surface predictable:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Conventions are enforced, not assumed." }),
				" Generators emit lowercase, kebab-named files with typed stubs that pass ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				"; database commands operate on model-derived migrations; anything that violates a convention is rejected at creation time rather than failing the gate later."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Configuration is central." }),
				" Every command reads ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
				" and the typed config folder. The same ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/database.ts" }),
				" that the application uses at runtime is what ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:migrate" }),
				" reads — what the CLI touches is exactly what the app connects to."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Output is scriptable." }),
				" Global flags such as ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--json" }),
				" make command output machine-readable where sensible, so the CLI slots into shell scripts and CI pipelines, not just interactive terminals."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Interactive prompts fill in omitted arguments — run ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva new" }),
			" with no name and you are asked — while supplying all arguments runs the command non-interactively for scripts. Colors appear only in TTY sessions, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "NO_COLOR" }),
			" is respected, and errors include did-you-mean suggestions for mistyped commands."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "finding-the-command-you-need",
			children: "Finding the Command You Need"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "I want to start working" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva new" }),
				", then ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "I need a file generated" }),
				" — anything starting with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:" }),
				"; it maps one-to-one to the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/definex",
					children: "defineX convention"
				}),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "I changed a model" }),
				" — run ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				" for types and lint, then ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:diff" }),
				" to preview the schema change."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Work should happen later" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:job" }),
				" for queue work, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:task" }),
				" plus ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/schedule.ts" }),
				" for cron work."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "I'm unsure about the environment" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva doctor" }),
				" (v1.x) diagnoses runtime, environment, and dependency health."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "I want to ship" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }),
				" to inspect, then ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy" }),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "app-defined-commands",
			children: "App-Defined Commands"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The CLI is extensible from the application itself. Commands in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/console/" }),
			" are auto-discovered and join the built-in surface under their own names:"
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
							children: " rows) { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "..."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "; bar."
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
							children: "() }"
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
			"Signature-based parsing, progress bars, tables, and styled output come built in. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "handle" }),
			" receives typed access to application state — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config" }),
			", and anything else the app resolves — so an app-defined command is just code with the framework's context. Run it exactly like a built-in:"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The signature grammar mirrors the rest of the surface: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{file}" }),
			" declares a positional argument, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "{--dry-run}" }),
			" declares a boolean flag. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}),
			" for how auto-discovery picks files up."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "global-flags",
			children: "Global Flags"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every command accepts the same global flags:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Flag" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Effect" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--env <file>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Load a specific environment file" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--no-color" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Disable styled output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--json" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Machine-readable output where sensible" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--verbose" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Extended logging" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--env" }),
			" lets a script point any command at a specific environment file without touching the working directory's default. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--json" }),
			" is the scripting hook — schedule listings, addon inventories, and status tables are available as structured data where a consumer would want them."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generators-database-and-addons",
			children: "Generators, Database, and Addons"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The three command families you will reach for constantly each have their own reference page:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Page" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Covers" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/generators",
				children: "Generators"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The full ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:*" }),
				" surface — model, controller, service, job, event, policy, task, command, page, seeder, module, test"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/database-commands",
				children: "Database Commands"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Migrations, rollback, seed, reset, status, diff, push, Studio" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/addon-commands",
				children: "Addon Commands"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "add" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "addons list/search/info/remove/update/outdated" })
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/project-commands",
				children: "Project & Lifecycle Commands"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The full arc from ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "new" }),
				" to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deploy" })
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/project-commands",
				children: "Project & Lifecycle Commands"
			}), " — scaffold, develop, check, build, deploy"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/cli/generators",
					children: "Generators"
				}),
				" — the full ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:*" }),
				" surface"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/database-commands",
				children: "Database Commands"
			}), " — migrations, seeders, and schema"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/addon-commands",
				children: "Addon Commands"
			}), " — install and manage capabilities"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}), " — the pattern every generator emits"] }),
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
