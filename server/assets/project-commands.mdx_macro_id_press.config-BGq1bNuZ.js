import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/cli/project-commands.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Project & Lifecycle Commands",
	"description": "Scaffolding, the dev server, the exec/lint/format gate, tests, builds, preview, deploy, the REPL, key generation, upgrade codemods, and config caching."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nThe project and lifecycle commands cover the whole arc of an application: create it, develop it, verify it, build it, and ship it. They are the commands you will run most, and the ones that encode the framework's conventions — lowercase files, typed configuration, and one toolchain from dev to deploy.\n\n## Full Reference [#full-reference]\n\n| Command                                      | Action                                        |\n| -------------------------------------------- | --------------------------------------------- |\n| `kwiva new <name> --mode=<mode>`             | Scaffold a new application                    |\n| `kwiva dev [--port] [--cluster]`             | Dev server with HMR                           |\n| `kwiva build [--preset] [--binary] [--docs]` | Production build                              |\n| `kwiva preview`                              | Serve the built output locally                |\n| `kwiva deploy [provider]`                    | Build and deploy to a provider                |\n| `kwiva check [--fix] [--audit]`              | Format, lint, and typecheck gate              |\n| `kwiva test [--e2e] [--watch] [filter]`      | Run the test suite                            |\n| `kwiva console`                              | REPL with app context                         |\n| `kwiva upgrade`                              | Codemod recipes plus dependency bumps         |\n| `kwiva key:generate`                         | Generate `APP_KEY` into `.env`                |\n| `kwiva config:cache`                         | Snapshot merged config (v1.x)                 |\n| `kwiva doctor`                               | Environment and dependency diagnostics (v1.x) |\n\n## The Arc of a Project [#the-arc-of-a-project]\n\nThe commands line up with the way a project actually lives:\n\n```bash title=\"terminal\"\nkwiva new my-app            # 1. scaffold\nkwiva dev                   # 2. develop\nkwiva check                 # 3. keep the gate green\nkwiva test                  # 4. verify behavior\nkwiva build                 # 5. produce the artifact\nkwiva preview               # 6. inspect the built output\nkwiva deploy                # 7. ship\n```\n\nEach step feeds the next: generated files must pass `check`, `check` and `test` must pass before a `build` you trust, and `preview` validates the exact artifact `deploy` will ship.\n\n## Scaffolding: `kwiva new` [#scaffolding-kwiva-new]\n\n```bash title=\"terminal\"\nkwiva new my-app\nkwiva new my-app --mode=api+spa\n```\n\n`kwiva new` scaffolds a complete project tree — `kwiva.config.ts`, `src/`, `public/`, `storage/`, environment files, and a typed config folder covering app, database, auth, session, api, queue, cache, storage, schedule, tenancy, cors, security, ui, telemetry, modules, and mail. The `--mode` flag selects the application shape:\n\n| Mode         | Description                               |\n| ------------ | ----------------------------------------- |\n| `fullstack`  | SSR pages plus API routes (default)       |\n| `api+spa`    | API server with a single-page application |\n| `static`     | Static site generation only               |\n| `standalone` | API-only, single-binary output            |\n| `edge`       | Optimized for edge runtimes               |\n\nOmitting the name triggers an interactive prompt; supplying it runs non-interactively for scripts. Once scaffolded, the project is a runnable app: `kwiva dev` starts it, `kwiva check` passes on the generated files, and the folder structure is enforced thereafter by the CLI and the exec/lint/format gate.\n\n## Development: `kwiva dev` [#development-kwiva-dev]\n\n```bash title=\"terminal\"\nkwiva dev\nkwiva dev --port 4000\nkwiva dev --cluster      # v1.x multi-process dev\n```\n\n`kwiva dev` starts the development server with hot module replacement. TypeScript runs natively through the runtime with no compile step, and pages, controllers, and models hot-swap as the framework re-resolves them. `--port` overrides the listening port. `--cluster` (v1.x) runs the dev server across processes with port reuse for cluster-shaped workloads.\n\nWhile you work, the development overlay renders the same telemetry the framework records for production — request timeline, span waterfall, errors, and the query list — beside the app. See [Development Server](/docs/getting-started/development-server) and [Dev Overlay](/docs/observability/dev-overlay).\n\n## The Gate: `kwiva check` [#the-gate-kwiva-check]\n\n```bash title=\"terminal\"\nkwiva check\nkwiva check --fix       # apply lint + format fixes\nkwiva check --audit     # dependency audit (v1.x)\n```\n\n`kwiva check` is the exec/lint/format gate — one command that runs the formatter, the linter (including the framework's convention rules such as `no-engine-imports` and `no-raw-fetch-in-loaders`), and a full typecheck. It is the single verification command a project runs before anything merges, and it is built on the Rust-speed toolchain, so it runs fast enough to be the constant companion of a dev loop rather than a slow pre-deploy ritual.\n\n* `--fix` applies automatic formatting and lint fixes. The rare rule that refuses auto-fix is reported with a pointer to the offending line.\n* `--audit` (v1.x) checks dependency health against locked versions, surfacing advisories so they resolve to a controlled upgrade path.\n\nGenerated output — and any code you write by hand — is expected to pass `kwiva check`. Diagnostic findings that do not block, such as style warnings without an auto-fix, are reported without failing the gate.\n\n## Tests: `kwiva test` [#tests-kwiva-test]\n\n```bash title=\"terminal\"\nkwiva test\nkwiva test --watch\nkwiva test --e2e\nkwiva test users\n```\n\n`kwiva test` runs the unit and integration suite through the runtime's test runner. `--watch` re-runs on change; a positional filter narrows to matching tests; `--coverage` reports coverage against CI thresholds. `--e2e` runs the end-to-end suite, which launches the built app and drives it through browser flows. The full command surface — including the `--server` target for E2E against the built artifact — is documented on [Testing](/docs/testing/).\n\n## Build: `kwiva build` [#build-kwiva-build]\n\n```bash title=\"terminal\"\nkwiva build\nkwiva build --preset node_server\nkwiva build --binary\nkwiva build --docs\n```\n\n`kwiva build` produces the production artifact using the Rust-speed toolchain — tree shaking, code splitting, and minification — and the framework-owned engine presets. Because the build is deterministic and idempotent, the same source produces the same artifact: exactly what `kwiva preview` and `kwiva deploy` consume. Key flags:\n\n| Flag                | Effect                                                                  |\n| ------------------- | ----------------------------------------------------------------------- |\n| `--preset <preset>` | Target a deployment shape; presets flow from `kwiva.config.ts > deploy` |\n| `--binary`          | Compile to a single standalone binary                                   |\n| `--docs`            | Build the generated route documentation                                 |\n\nThe build config surface lives in `kwiva.config.ts > build`, where deployment presets are declared alongside the rest of the project configuration. See [Deployment](/docs/deployment/) for presets.\n\n## Preview and Deploy [#preview-and-deploy]\n\n```bash title=\"terminal\"\nkwiva preview            # serve the built artifact locally\nkwiva deploy             # build + deploy to the configured provider\nkwiva deploy cloudflare  # or a specific provider\n```\n\n`kwiva preview` runs the finished build exactly as the output was produced, so you validate the artifact before it ships. `kwiva deploy [provider]` builds and pushes in one step; provider presets come from configuration, and worker deploy is available via `kwiva deploy --entry worker` for queue workers. See [Deployment](/docs/deployment/).\n\n## The REPL: `kwiva console` [#the-repl-kwiva-console]\n\n```bash title=\"terminal\"\nkwiva console\n```\n\n`kwiva console` opens an interactive REPL with the full application context loaded — configuration, models, the typed client, and services are all available. It is the fastest way to exercise a model query, test a service, or check what a config value resolves to without running the server.\n\nThe REPL doubles as an observability surface:\n\n```text title=\"the-repl-kwiva-console.txt\"\napp.trace.last()      // the most recent span tree\napp.logs.tail(20)     // the last 20 log lines\n```\n\nModel queries, worker logic, and telemetry inspection all share the same context, which makes the console the debugging tool that sits between a unit test and a deployed environment.\n\n## Key Generation [#key-generation]\n\n```bash title=\"terminal\"\nkwiva key:generate\n```\n\n`kwiva key:generate` writes a fresh `APP_KEY` into the environment file. The key signs sessions and application secrets; it should be generated once per environment and rotated deliberately. Rotation is a first-class operation — `kwiva key:generate --rotate` writes a new key and invalidates existing sessions, which makes it the revoke step in an incident runbook rather than a risky maintenance task.\n\n## Upgrade: `kwiva upgrade` [#upgrade-kwiva-upgrade]\n\n```bash title=\"terminal\"\nkwiva upgrade\n```\n\n`kwiva upgrade` moves an existing project to a newer framework version. It runs codemod recipes over the codebase — transforming files to the new conventions automatically — then bumps dependencies to their new compatible versions. Codemods are transformer-based, so the upgrade is fast and applied consistently across the repo, and convention rules are kept in sync with the recipes rather than drifting. After an upgrade, `kwiva check` is the verification step: if the codemod missed a site, the gate finds it.\n\n## Config Caching: `kwiva config:cache` [#config-caching-kwiva-configcache]\n\n```bash title=\"terminal\"\nkwiva config:cache       # v1.x\n```\n\n`config:cache` merges `src/config/*` with defaults and snapshots the result for zero-IO cold starts. After caching, booting reads the merged snapshot instead of re-evaluating every module. Run it after config changes in production; the config folder itself remains the source of truth — the snapshot is an optimization, not a second configuration source. See [Configuration](/docs/core-concepts/configuration).\n\n## Diagnostics: `kwiva doctor` [#diagnostics-kwiva-doctor]\n\n`kwiva doctor` (v1.x) diagnoses environment, runtime, and dependency health. It validates the environment against the declared env maps, checks runtime compatibility, and flags rule overrides that would weaken the gates — the \"am I set up correctly\" check you reach for when a fresh checkout misbehaves.\n\n## What's Next [#whats-next]\n\n* [Generators](/docs/cli/generators) — the `make:*` surface for new files\n* [Database Commands](/docs/cli/database-commands) — migrations and seeders\n* [Configuration](/docs/core-concepts/configuration) — how `kwiva.config.ts` and `src/config` shape every command\n* [Deployment](/docs/deployment/) — presets, providers, and production builds\n* [Getting Started](/docs/getting-started/create-project) — scaffold your first app\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The project and lifecycle commands cover the whole arc of an application: create it, develop it, verify it, build it, and ship it. They are the commands you will run most, and the ones that encode the framework's conventions — lowercase files, typed configuration, and one toolchain from dev to deploy."
		},
		{
			"heading": "full-reference",
			"content": "Command"
		},
		{
			"heading": "full-reference",
			"content": "Action"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva new <name> --mode=<mode>`"
		},
		{
			"heading": "full-reference",
			"content": "Scaffold a new application"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva dev [--port] [--cluster]`"
		},
		{
			"heading": "full-reference",
			"content": "Dev server with HMR"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva build [--preset] [--binary] [--docs]`"
		},
		{
			"heading": "full-reference",
			"content": "Production build"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva preview`"
		},
		{
			"heading": "full-reference",
			"content": "Serve the built output locally"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva deploy [provider]`"
		},
		{
			"heading": "full-reference",
			"content": "Build and deploy to a provider"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva check [--fix] [--audit]`"
		},
		{
			"heading": "full-reference",
			"content": "Format, lint, and typecheck gate"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva test [--e2e] [--watch] [filter]`"
		},
		{
			"heading": "full-reference",
			"content": "Run the test suite"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva console`"
		},
		{
			"heading": "full-reference",
			"content": "REPL with app context"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva upgrade`"
		},
		{
			"heading": "full-reference",
			"content": "Codemod recipes plus dependency bumps"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva key:generate`"
		},
		{
			"heading": "full-reference",
			"content": "Generate `APP_KEY` into `.env`"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva config:cache`"
		},
		{
			"heading": "full-reference",
			"content": "Snapshot merged config (v1.x)"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva doctor`"
		},
		{
			"heading": "full-reference",
			"content": "Environment and dependency diagnostics (v1.x)"
		},
		{
			"heading": "the-arc-of-a-project",
			"content": "The commands line up with the way a project actually lives:"
		},
		{
			"heading": "the-arc-of-a-project",
			"content": "Each step feeds the next: generated files must pass `check`, `check` and `test` must pass before a `build` you trust, and `preview` validates the exact artifact `deploy` will ship."
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "`kwiva new` scaffolds a complete project tree — `kwiva.config.ts`, `src/`, `public/`, `storage/`, environment files, and a typed config folder covering app, database, auth, session, api, queue, cache, storage, schedule, tenancy, cors, security, ui, telemetry, modules, and mail. The `--mode` flag selects the application shape:"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "Mode"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "Description"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "`fullstack`"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "SSR pages plus API routes (default)"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "`api+spa`"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "API server with a single-page application"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "`static`"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "Static site generation only"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "`standalone`"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "API-only, single-binary output"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "`edge`"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "Optimized for edge runtimes"
		},
		{
			"heading": "scaffolding-kwiva-new",
			"content": "Omitting the name triggers an interactive prompt; supplying it runs non-interactively for scripts. Once scaffolded, the project is a runnable app: `kwiva dev` starts it, `kwiva check` passes on the generated files, and the folder structure is enforced thereafter by the CLI and the exec/lint/format gate."
		},
		{
			"heading": "development-kwiva-dev",
			"content": "`kwiva dev` starts the development server with hot module replacement. TypeScript runs natively through the runtime with no compile step, and pages, controllers, and models hot-swap as the framework re-resolves them. `--port` overrides the listening port. `--cluster` (v1.x) runs the dev server across processes with port reuse for cluster-shaped workloads."
		},
		{
			"heading": "development-kwiva-dev",
			"content": "While you work, the development overlay renders the same telemetry the framework records for production — request timeline, span waterfall, errors, and the query list — beside the app. See Development Server and Dev Overlay."
		},
		{
			"heading": "the-gate-kwiva-check",
			"content": "`kwiva check` is the exec/lint/format gate — one command that runs the formatter, the linter (including the framework's convention rules such as `no-engine-imports` and `no-raw-fetch-in-loaders`), and a full typecheck. It is the single verification command a project runs before anything merges, and it is built on the Rust-speed toolchain, so it runs fast enough to be the constant companion of a dev loop rather than a slow pre-deploy ritual."
		},
		{
			"heading": "the-gate-kwiva-check",
			"content": "`--fix` applies automatic formatting and lint fixes. The rare rule that refuses auto-fix is reported with a pointer to the offending line."
		},
		{
			"heading": "the-gate-kwiva-check",
			"content": "`--audit` (v1.x) checks dependency health against locked versions, surfacing advisories so they resolve to a controlled upgrade path."
		},
		{
			"heading": "the-gate-kwiva-check",
			"content": "Generated output — and any code you write by hand — is expected to pass `kwiva check`. Diagnostic findings that do not block, such as style warnings without an auto-fix, are reported without failing the gate."
		},
		{
			"heading": "tests-kwiva-test",
			"content": "`kwiva test` runs the unit and integration suite through the runtime's test runner. `--watch` re-runs on change; a positional filter narrows to matching tests; `--coverage` reports coverage against CI thresholds. `--e2e` runs the end-to-end suite, which launches the built app and drives it through browser flows. The full command surface — including the `--server` target for E2E against the built artifact — is documented on Testing."
		},
		{
			"heading": "build-kwiva-build",
			"content": "`kwiva build` produces the production artifact using the Rust-speed toolchain — tree shaking, code splitting, and minification — and the framework-owned engine presets. Because the build is deterministic and idempotent, the same source produces the same artifact: exactly what `kwiva preview` and `kwiva deploy` consume. Key flags:"
		},
		{
			"heading": "build-kwiva-build",
			"content": "Flag"
		},
		{
			"heading": "build-kwiva-build",
			"content": "Effect"
		},
		{
			"heading": "build-kwiva-build",
			"content": "`--preset <preset>`"
		},
		{
			"heading": "build-kwiva-build",
			"content": "Target a deployment shape; presets flow from `kwiva.config.ts > deploy`"
		},
		{
			"heading": "build-kwiva-build",
			"content": "`--binary`"
		},
		{
			"heading": "build-kwiva-build",
			"content": "Compile to a single standalone binary"
		},
		{
			"heading": "build-kwiva-build",
			"content": "`--docs`"
		},
		{
			"heading": "build-kwiva-build",
			"content": "Build the generated route documentation"
		},
		{
			"heading": "build-kwiva-build",
			"content": "The build config surface lives in `kwiva.config.ts > build`, where deployment presets are declared alongside the rest of the project configuration. See Deployment for presets."
		},
		{
			"heading": "preview-and-deploy",
			"content": "`kwiva preview` runs the finished build exactly as the output was produced, so you validate the artifact before it ships. `kwiva deploy [provider]` builds and pushes in one step; provider presets come from configuration, and worker deploy is available via `kwiva deploy --entry worker` for queue workers. See Deployment."
		},
		{
			"heading": "the-repl-kwiva-console",
			"content": "`kwiva console` opens an interactive REPL with the full application context loaded — configuration, models, the typed client, and services are all available. It is the fastest way to exercise a model query, test a service, or check what a config value resolves to without running the server."
		},
		{
			"heading": "the-repl-kwiva-console",
			"content": "The REPL doubles as an observability surface:"
		},
		{
			"heading": "the-repl-kwiva-console",
			"content": "Model queries, worker logic, and telemetry inspection all share the same context, which makes the console the debugging tool that sits between a unit test and a deployed environment."
		},
		{
			"heading": "key-generation",
			"content": "`kwiva key:generate` writes a fresh `APP_KEY` into the environment file. The key signs sessions and application secrets; it should be generated once per environment and rotated deliberately. Rotation is a first-class operation — `kwiva key:generate --rotate` writes a new key and invalidates existing sessions, which makes it the revoke step in an incident runbook rather than a risky maintenance task."
		},
		{
			"heading": "upgrade-kwiva-upgrade",
			"content": "`kwiva upgrade` moves an existing project to a newer framework version. It runs codemod recipes over the codebase — transforming files to the new conventions automatically — then bumps dependencies to their new compatible versions. Codemods are transformer-based, so the upgrade is fast and applied consistently across the repo, and convention rules are kept in sync with the recipes rather than drifting. After an upgrade, `kwiva check` is the verification step: if the codemod missed a site, the gate finds it."
		},
		{
			"heading": "config-caching-kwiva-configcache",
			"content": "`config:cache` merges `src/config/*` with defaults and snapshots the result for zero-IO cold starts. After caching, booting reads the merged snapshot instead of re-evaluating every module. Run it after config changes in production; the config folder itself remains the source of truth — the snapshot is an optimization, not a second configuration source. See Configuration."
		},
		{
			"heading": "diagnostics-kwiva-doctor",
			"content": "`kwiva doctor` (v1.x) diagnoses environment, runtime, and dependency health. It validates the environment against the declared env maps, checks runtime compatibility, and flags rule overrides that would weaken the gates — the \"am I set up correctly\" check you reach for when a fresh checkout misbehaves."
		},
		{
			"heading": "whats-next",
			"content": "Generators — the `make:*` surface for new files"
		},
		{
			"heading": "whats-next",
			"content": "Database Commands — migrations and seeders"
		},
		{
			"heading": "whats-next",
			"content": "Configuration — how `kwiva.config.ts` and `src/config` shape every command"
		},
		{
			"heading": "whats-next",
			"content": "Deployment — presets, providers, and production builds"
		},
		{
			"heading": "whats-next",
			"content": "Getting Started — scaffold your first app"
		}
	],
	"headings": [
		{
			"id": "full-reference",
			"content": "Full Reference"
		},
		{
			"id": "the-arc-of-a-project",
			"content": "The Arc of a Project"
		},
		{
			"id": "scaffolding-kwiva-new",
			"content": "Scaffolding: `kwiva new`"
		},
		{
			"id": "development-kwiva-dev",
			"content": "Development: `kwiva dev`"
		},
		{
			"id": "the-gate-kwiva-check",
			"content": "The Gate: `kwiva check`"
		},
		{
			"id": "tests-kwiva-test",
			"content": "Tests: `kwiva test`"
		},
		{
			"id": "build-kwiva-build",
			"content": "Build: `kwiva build`"
		},
		{
			"id": "preview-and-deploy",
			"content": "Preview and Deploy"
		},
		{
			"id": "the-repl-kwiva-console",
			"content": "The REPL: `kwiva console`"
		},
		{
			"id": "key-generation",
			"content": "Key Generation"
		},
		{
			"id": "upgrade-kwiva-upgrade",
			"content": "Upgrade: `kwiva upgrade`"
		},
		{
			"id": "config-caching-kwiva-configcache",
			"content": "Config Caching: `kwiva config:cache`"
		},
		{
			"id": "diagnostics-kwiva-doctor",
			"content": "Diagnostics: `kwiva doctor`"
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
		url: "#full-reference",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Full Reference" })
	},
	{
		depth: 2,
		url: "#the-arc-of-a-project",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Arc of a Project" })
	},
	{
		depth: 2,
		url: "#scaffolding-kwiva-new",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Scaffolding: ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "kwiva new" })] })
	},
	{
		depth: 2,
		url: "#development-kwiva-dev",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Development: ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "kwiva dev" })] })
	},
	{
		depth: 2,
		url: "#the-gate-kwiva-check",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["The Gate: ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "kwiva check" })] })
	},
	{
		depth: 2,
		url: "#tests-kwiva-test",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Tests: ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "kwiva test" })] })
	},
	{
		depth: 2,
		url: "#build-kwiva-build",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Build: ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "kwiva build" })] })
	},
	{
		depth: 2,
		url: "#preview-and-deploy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Preview and Deploy" })
	},
	{
		depth: 2,
		url: "#the-repl-kwiva-console",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["The REPL: ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "kwiva console" })] })
	},
	{
		depth: 2,
		url: "#key-generation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Key Generation" })
	},
	{
		depth: 2,
		url: "#upgrade-kwiva-upgrade",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Upgrade: ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "kwiva upgrade" })] })
	},
	{
		depth: 2,
		url: "#config-caching-kwiva-configcache",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Config Caching: ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "kwiva config:cache" })] })
	},
	{
		depth: 2,
		url: "#diagnostics-kwiva-doctor",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Diagnostics: ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "kwiva doctor" })] })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The project and lifecycle commands cover the whole arc of an application: create it, develop it, verify it, build it, and ship it. They are the commands you will run most, and the ones that encode the framework's conventions — lowercase files, typed configuration, and one toolchain from dev to deploy." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "full-reference",
			children: "Full Reference"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Action" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva new <name> --mode=<mode>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scaffold a new application" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev [--port] [--cluster]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dev server with HMR" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build [--preset] [--binary] [--docs]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Production build" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Serve the built output locally" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy [provider]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build and deploy to a provider" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check [--fix] [--audit]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Format, lint, and typecheck gate" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test [--e2e] [--watch] [filter]" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run the test suite" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva console" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "REPL with app context" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva upgrade" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Codemod recipes plus dependency bumps" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva key:generate" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Generate ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "APP_KEY" }),
				" into ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env" })
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva config:cache" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Snapshot merged config (v1.x)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva doctor" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Environment and dependency diagnostics (v1.x)" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-arc-of-a-project",
			children: "The Arc of a Project"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The commands line up with the way a project actually lives:" }),
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
							children: " my-app"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "            # 1. scaffold"
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
							children: "                   # 2. develop"
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
							children: "                 # 3. keep the gate green"
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
							children: "                  # 4. verify behavior"
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
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                 # 5. produce the artifact"
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
							children: " preview"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "               # 6. inspect the built output"
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
							children: " deploy"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                # 7. ship"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each step feeds the next: generated files must pass ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "check" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "check" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "test" }),
			" must pass before a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "build" }),
			" you trust, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "preview" }),
			" validates the exact artifact ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deploy" }),
			" will ship."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "scaffolding-kwiva-new",
			children: ["Scaffolding: ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva new" })]
		}),
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
							children: " my-app"
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
							children: " new"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " my-app"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --mode=api+spa"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva new" }),
			" scaffolds a complete project tree — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "public/" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage/" }),
			", environment files, and a typed config folder covering app, database, auth, session, api, queue, cache, storage, schedule, tenancy, cors, security, ui, telemetry, modules, and mail. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--mode" }),
			" flag selects the application shape:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Description" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR pages plus API routes (default)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API server with a single-page application" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Static site generation only" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API-only, single-binary output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Optimized for edge runtimes" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Omitting the name triggers an interactive prompt; supplying it runs non-interactively for scripts. Once scaffolded, the project is a runnable app: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" starts it, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
			" passes on the generated files, and the folder structure is enforced thereafter by the CLI and the exec/lint/format gate."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "development-kwiva-dev",
			children: ["Development: ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" })]
		}),
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
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "kwiva"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " dev"
					})]
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --port"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " 4000"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --cluster"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "      # v1.x multi-process dev"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" starts the development server with hot module replacement. TypeScript runs natively through the runtime with no compile step, and pages, controllers, and models hot-swap as the framework re-resolves them. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--port" }),
			" overrides the listening port. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--cluster" }),
			" (v1.x) runs the dev server across processes with port reuse for cluster-shaped workloads."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"While you work, the development overlay renders the same telemetry the framework records for production — request timeline, span waterfall, errors, and the query list — beside the app. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/development-server",
				children: "Development Server"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/dev-overlay",
				children: "Dev Overlay"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "the-gate-kwiva-check",
			children: ["The Gate: ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" })]
		}),
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
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "kwiva"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " check"
					})]
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --fix"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "       # apply lint + format fixes"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --audit"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "     # dependency audit (v1.x)"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
			" is the exec/lint/format gate — one command that runs the formatter, the linter (including the framework's convention rules such as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-engine-imports" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "no-raw-fetch-in-loaders" }),
			"), and a full typecheck. It is the single verification command a project runs before anything merges, and it is built on the Rust-speed toolchain, so it runs fast enough to be the constant companion of a dev loop rather than a slow pre-deploy ritual."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--fix" }), " applies automatic formatting and lint fixes. The rare rule that refuses auto-fix is reported with a pointer to the offending line."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--audit" }), " (v1.x) checks dependency health against locked versions, surfacing advisories so they resolve to a controlled upgrade path."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Generated output — and any code you write by hand — is expected to pass ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
			". Diagnostic findings that do not block, such as style warnings without an auto-fix, are reported without failing the gate."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "tests-kwiva-test",
			children: ["Tests: ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test" })]
		}),
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
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "kwiva"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " test"
					})]
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --watch"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --e2e"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " users"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test" }),
			" runs the unit and integration suite through the runtime's test runner. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--watch" }),
			" re-runs on change; a positional filter narrows to matching tests; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--coverage" }),
			" reports coverage against CI thresholds. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--e2e" }),
			" runs the end-to-end suite, which launches the built app and drives it through browser flows. The full command surface — including the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--server" }),
			" target for E2E against the built artifact — is documented on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/",
				children: "Testing"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "build-kwiva-build",
			children: ["Build: ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" })]
		}),
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
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "kwiva"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " build"
					})]
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --preset"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " node_server"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --binary"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --docs"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }),
			" produces the production artifact using the Rust-speed toolchain — tree shaking, code splitting, and minification — and the framework-owned engine presets. Because the build is deterministic and idempotent, the same source produces the same artifact: exactly what ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy" }),
			" consume. Key flags:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Flag" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Effect" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--preset <preset>" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Target a deployment shape; presets flow from ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts > deploy" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--binary" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Compile to a single standalone binary" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--docs" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build the generated route documentation" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The build config surface lives in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts > build" }),
			", where deployment presets are declared alongside the rest of the project configuration. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/",
				children: "Deployment"
			}),
			" for presets."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "preview-and-deploy",
			children: "Preview and Deploy"
		}),
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
							children: " preview"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "            # serve the built artifact locally"
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
							children: " deploy"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "             # build + deploy to the configured provider"
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
							children: " deploy"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " cloudflare"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "  # or a specific provider"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }),
			" runs the finished build exactly as the output was produced, so you validate the artifact before it ships. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy [provider]" }),
			" builds and pushes in one step; provider presets come from configuration, and worker deploy is available via ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy --entry worker" }),
			" for queue workers. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/",
				children: "Deployment"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "the-repl-kwiva-console",
			children: ["The REPL: ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva console" })]
		}),
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
				children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					},
					children: "kwiva"
				}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					},
					children: " console"
				})]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva console" }), " opens an interactive REPL with the full application context loaded — configuration, models, the typed client, and services are all available. It is the fastest way to exercise a model query, test a service, or check what a config value resolves to without running the server."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The REPL doubles as an observability surface:" }),
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
			title: "the-repl-kwiva-console.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "app.trace.last()      // the most recent span tree" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "app.logs.tail(20)     // the last 20 log lines" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Model queries, worker logic, and telemetry inspection all share the same context, which makes the console the debugging tool that sits between a unit test and a deployed environment." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "key-generation",
			children: "Key Generation"
		}),
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
				children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					},
					children: "kwiva"
				}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					},
					children: " key:generate"
				})]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva key:generate" }),
			" writes a fresh ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "APP_KEY" }),
			" into the environment file. The key signs sessions and application secrets; it should be generated once per environment and rotated deliberately. Rotation is a first-class operation — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva key:generate --rotate" }),
			" writes a new key and invalidates existing sessions, which makes it the revoke step in an incident runbook rather than a risky maintenance task."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "upgrade-kwiva-upgrade",
			children: ["Upgrade: ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva upgrade" })]
		}),
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
				children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					},
					children: "kwiva"
				}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					},
					children: " upgrade"
				})]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva upgrade" }),
			" moves an existing project to a newer framework version. It runs codemod recipes over the codebase — transforming files to the new conventions automatically — then bumps dependencies to their new compatible versions. Codemods are transformer-based, so the upgrade is fast and applied consistently across the repo, and convention rules are kept in sync with the recipes rather than drifting. After an upgrade, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
			" is the verification step: if the codemod missed a site, the gate finds it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "config-caching-kwiva-configcache",
			children: ["Config Caching: ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva config:cache" })]
		}),
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
						children: " config:cache"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "       # v1.x"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config:cache" }),
			" merges ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/*" }),
			" with defaults and snapshots the result for zero-IO cold starts. After caching, booting reads the merged snapshot instead of re-evaluating every module. Run it after config changes in production; the config folder itself remains the source of truth — the snapshot is an optimization, not a second configuration source. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/configuration",
				children: "Configuration"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "diagnostics-kwiva-doctor",
			children: ["Diagnostics: ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva doctor" })]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva doctor" }), " (v1.x) diagnoses environment, runtime, and dependency health. It validates the environment against the declared env maps, checks runtime compatibility, and flags rule overrides that would weaken the gates — the \"am I set up correctly\" check you reach for when a fresh checkout misbehaves."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/cli/generators",
					children: "Generators"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:*" }),
				" surface for new files"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/database-commands",
				children: "Database Commands"
			}), " — migrations and seeders"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/configuration",
					children: "Configuration"
				}),
				" — how ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config" }),
				" shape every command"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/",
				children: "Deployment"
			}), " — presets, providers, and production builds"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/create-project",
				children: "Getting Started"
			}), " — scaffold your first app"] }),
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
