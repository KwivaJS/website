import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/data/database-config.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Database Configuration",
	"description": "Connections, pooling, drivers, logging, and the read-replica path — everything in src/config/database.ts."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nThe database layer is configured from `src/config/database.ts`, one file that describes connections, pooling, logging, and environment mapping. The sensible default pairing is **SQLite for development, Postgres for production** — the same model files, migrations, and queries run against both, so the low-friction default does not fork your code.\n\n## The Config File [#the-config-file]\n\n```ts title=\"src/config/database.ts\"\n// src/config/database.ts\nexport default defineConfig('database', {\n  defaults: {\n    driver: 'sqlite',                          // dev default\n    url: 'sqlite://storage/database.db',\n    pool: { max: 10, idleTimeout: 30_000 },\n    logging: false,\n  },\n  env: { url: 'DATABASE_URL', driver: 'DB_DRIVER' },\n  connections: {\n    primary: { url: env('DATABASE_URL'), pool: { max: 20 } },\n    // replica: { url: env('READ_REPLICA_URL'), pool: { max: 10 }, readOnly: true }, // v2\n  },\n})\n```\n\n| Block         | Role                                                                              |\n| ------------- | --------------------------------------------------------------------------------- |\n| `defaults`    | Base settings for every connection                                                |\n| `env`         | Which environment variables override which settings                               |\n| `connections` | Named connections for the multi-connection surface (`v1.x`), read replicas (`v2`) |\n\n## Drivers [#drivers]\n\n| Driver     | Typical use             | Notes                                                   |\n| ---------- | ----------------------- | ------------------------------------------------------- |\n| `sqlite`   | Local development       | File-backed; zero setup; `sqlite://path`                |\n| `postgres` | Production default      | Primary production driver; the team's reference runtime |\n| `mysql`    | Existing infrastructure | Supported driver for migrations continuing on MySQL     |\n\nThe driver is a single string per connection. `DB_DRIVER` lets each environment pick its own without editing the file.\n\n| Environment    | Driver                 | URL                                  |\n| -------------- | ---------------------- | ------------------------------------ |\n| Local dev      | `sqlite`               | `sqlite://storage/database.db`       |\n| CI             | `sqlite` or `postgres` | ephemeral file / `DATABASE_URL`      |\n| Production     | `postgres`             | `postgres://user:pass@host:5432/app` |\n| Existing MySQL | `mysql`                | driver-native DSN                    |\n\n```ts title=\"drivers.ts\"\nurl: 'sqlite://storage/database.db'        // sqlite file\nurl: env('DATABASE_URL')                    // standard postgres/mysql DSN via env\n```\n\n## Environment Variables [#environment-variables]\n\n`env` maps config keys to environment variables, and environment values always win over hard-coded defaults:\n\n| Config entry | Env var        | Precedence                                              |\n| ------------ | -------------- | ------------------------------------------------------- |\n| `url`        | `DATABASE_URL` | Set env var = override; missing = use `defaults.url`    |\n| `driver`     | `DB_DRIVER`    | Set env var = override; missing = use `defaults.driver` |\n\nThis is the same pattern as every config folder — see [Getting Started: Configuration](/docs/getting-started/configuration) for `defineConfig` semantics.\n\n## Connection URLs [#connection-urls]\n\nConnection strings follow the driver's native DSN style:\n\n```bash title=\"terminal\"\nDATABASE_URL=postgres://user:pass@host:5432/app\nDB_DRIVER=postgres\n```\n\n`kwiva make:model`, `db:diff`, `db:migrate`, and `db:seed` all read the same config and env, so the CLI is always operating on the same database your app uses.\n\n## Pooling [#pooling]\n\n| Option             | Default | Meaning                                     |\n| ------------------ | ------- | ------------------------------------------- |\n| `pool.max`         | `10`    | Maximum concurrent connections              |\n| `pool.idleTimeout` | `30000` | Milliseconds an idle connection is retained |\n\nTune `pool.max` for expected concurrency: small for local, larger for production workers (each worker holding a connection per in-flight operation). Excess connections exhaust the Postgres connection budget faster than they add throughput — raise only against measured demand.\n\nSizing heuristics:\n\n| Workload                                          | `pool.max`                                                                |\n| ------------------------------------------------- | ------------------------------------------------------------------------- |\n| Local dev, one process                            | `10` (default)                                                            |\n| Single instance, moderate latency-sensitive reads | `20`                                                                      |\n| Multiple workers / high concurrency               | `workers × in-flight per worker`, capped by the server's connection limit |\n\nPool exhaustion shows up as connection timeouts under load rather than SQL errors — if you see them, the first question is \"how many concurrent transactions do we actually need\", not \"how many connections can the pool hold\".\n\n## Logging and Slow Queries [#logging-and-slow-queries]\n\n| Option               | Default | Meaning                                             |\n| -------------------- | ------- | --------------------------------------------------- |\n| `logging`            | `false` | Emit query logging for development                  |\n| `slowQueryThreshold` | `500`   | Milliseconds above which a query is flagged as slow |\n\n```ts title=\"logging-and-slow-queries.ts\"\ndefaults: {\n  logging: true,\n  slowQueryThreshold: 250,\n}\n```\n\nWith `logging: true`, queries log with trace correlation — each log line ties back to the request span, so a slow statement is traceable to the tenant and endpoint that caused it. The slow-query threshold also feeds the telemetry pipeline (see [Observability: Logging](/docs/observability/logging)).\n\n## Named Connections and Read Replicas [#named-connections-and-read-replicas]\n\n* **Named connections (`v1.x`)**: declare multiple connections under `connections` and target them from application code — separate databases for reporting, audit, or per-module schemas.\n* **Read replicas (`v2`)**: a `readOnly: true` connection routes read traffic while writes stay on `primary`.\n\nUntil those land, the single configured connection serves everything — keep the config file minimal and rely on the driver split for environment differences.\n\n## Troubleshooting [#troubleshooting]\n\n| Symptom                        | Likely cause                                  | Fix                                                    |\n| ------------------------------ | --------------------------------------------- | ------------------------------------------------------ |\n| `DATABASE_URL` ignored         | Env not loaded, or key mismatch in `env` map  | Confirm the var name in `env` and that env loading ran |\n| Connection timeouts under load | `pool.max` too low for concurrency            | Measure concurrent transactions, size the pool         |\n| Slow queries not logged        | `logging: false` or threshold too high        | Enable `logging`, lower `slowQueryThreshold`           |\n| Wrong database for CLI         | `kwiva db:migrate` in one env, app in another | Check `DB_DRIVER` / `DATABASE_URL` per environment     |\n\nBecause the CLI, migrations, seeders, and the app all read the same `src/config/database.ts`, a misconfiguration shows up identically in every entry point — the fix is always in this one file.\n\n> \\[!TIP]\n> The dev/prod driver split is configuration, not code. Keep migrations and queries driver-portable (the `sql` migration tag is dialect-aware) so switching environments never involves rewriting SQL.\n\n## Observability [#observability]\n\nEvery query emits an OTel span with normalized SQL text, duration, and row count; slow queries surface through `slowQueryThreshold`. Combined with transaction spans, the data layer is fully observable from one trace — see [Observability: Tracing](/docs/observability/tracing).\n\n## What's Next [#whats-next]\n\n1. [Migrations](/docs/data/migrations) — evolving the schema on these connections\n2. [Queries](/docs/data/queries) — the runtime query plane\n3. [Models](/docs/data/models) — the model IR these connections serve\n4. [Configuration](/docs/getting-started/configuration) — the config folder and `defineConfig`\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The database layer is configured from `src/config/database.ts`, one file that describes connections, pooling, logging, and environment mapping. The sensible default pairing is **SQLite for development, Postgres for production** — the same model files, migrations, and queries run against both, so the low-friction default does not fork your code."
		},
		{
			"heading": "the-config-file",
			"content": "Block"
		},
		{
			"heading": "the-config-file",
			"content": "Role"
		},
		{
			"heading": "the-config-file",
			"content": "`defaults`"
		},
		{
			"heading": "the-config-file",
			"content": "Base settings for every connection"
		},
		{
			"heading": "the-config-file",
			"content": "`env`"
		},
		{
			"heading": "the-config-file",
			"content": "Which environment variables override which settings"
		},
		{
			"heading": "the-config-file",
			"content": "`connections`"
		},
		{
			"heading": "the-config-file",
			"content": "Named connections for the multi-connection surface (`v1.x`), read replicas (`v2`)"
		},
		{
			"heading": "drivers",
			"content": "Driver"
		},
		{
			"heading": "drivers",
			"content": "Typical use"
		},
		{
			"heading": "drivers",
			"content": "Notes"
		},
		{
			"heading": "drivers",
			"content": "`sqlite`"
		},
		{
			"heading": "drivers",
			"content": "Local development"
		},
		{
			"heading": "drivers",
			"content": "File-backed; zero setup; `sqlite://path`"
		},
		{
			"heading": "drivers",
			"content": "`postgres`"
		},
		{
			"heading": "drivers",
			"content": "Production default"
		},
		{
			"heading": "drivers",
			"content": "Primary production driver; the team's reference runtime"
		},
		{
			"heading": "drivers",
			"content": "`mysql`"
		},
		{
			"heading": "drivers",
			"content": "Existing infrastructure"
		},
		{
			"heading": "drivers",
			"content": "Supported driver for migrations continuing on MySQL"
		},
		{
			"heading": "drivers",
			"content": "The driver is a single string per connection. `DB_DRIVER` lets each environment pick its own without editing the file."
		},
		{
			"heading": "drivers",
			"content": "Environment"
		},
		{
			"heading": "drivers",
			"content": "Driver"
		},
		{
			"heading": "drivers",
			"content": "URL"
		},
		{
			"heading": "drivers",
			"content": "Local dev"
		},
		{
			"heading": "drivers",
			"content": "`sqlite`"
		},
		{
			"heading": "drivers",
			"content": "`sqlite://storage/database.db`"
		},
		{
			"heading": "drivers",
			"content": "CI"
		},
		{
			"heading": "drivers",
			"content": "`sqlite` or `postgres`"
		},
		{
			"heading": "drivers",
			"content": "ephemeral file / `DATABASE_URL`"
		},
		{
			"heading": "drivers",
			"content": "Production"
		},
		{
			"heading": "drivers",
			"content": "`postgres`"
		},
		{
			"heading": "drivers",
			"content": "`postgres://user:pass@host:5432/app`"
		},
		{
			"heading": "drivers",
			"content": "Existing MySQL"
		},
		{
			"heading": "drivers",
			"content": "`mysql`"
		},
		{
			"heading": "drivers",
			"content": "driver-native DSN"
		},
		{
			"heading": "environment-variables",
			"content": "`env` maps config keys to environment variables, and environment values always win over hard-coded defaults:"
		},
		{
			"heading": "environment-variables",
			"content": "Config entry"
		},
		{
			"heading": "environment-variables",
			"content": "Env var"
		},
		{
			"heading": "environment-variables",
			"content": "Precedence"
		},
		{
			"heading": "environment-variables",
			"content": "`url`"
		},
		{
			"heading": "environment-variables",
			"content": "`DATABASE_URL`"
		},
		{
			"heading": "environment-variables",
			"content": "Set env var = override; missing = use `defaults.url`"
		},
		{
			"heading": "environment-variables",
			"content": "`driver`"
		},
		{
			"heading": "environment-variables",
			"content": "`DB_DRIVER`"
		},
		{
			"heading": "environment-variables",
			"content": "Set env var = override; missing = use `defaults.driver`"
		},
		{
			"heading": "environment-variables",
			"content": "This is the same pattern as every config folder — see Getting Started: Configuration for `defineConfig` semantics."
		},
		{
			"heading": "connection-urls",
			"content": "Connection strings follow the driver's native DSN style:"
		},
		{
			"heading": "connection-urls",
			"content": "`kwiva make:model`, `db:diff`, `db:migrate`, and `db:seed` all read the same config and env, so the CLI is always operating on the same database your app uses."
		},
		{
			"heading": "pooling",
			"content": "Option"
		},
		{
			"heading": "pooling",
			"content": "Default"
		},
		{
			"heading": "pooling",
			"content": "Meaning"
		},
		{
			"heading": "pooling",
			"content": "`pool.max`"
		},
		{
			"heading": "pooling",
			"content": "`10`"
		},
		{
			"heading": "pooling",
			"content": "Maximum concurrent connections"
		},
		{
			"heading": "pooling",
			"content": "`pool.idleTimeout`"
		},
		{
			"heading": "pooling",
			"content": "`30000`"
		},
		{
			"heading": "pooling",
			"content": "Milliseconds an idle connection is retained"
		},
		{
			"heading": "pooling",
			"content": "Tune `pool.max` for expected concurrency: small for local, larger for production workers (each worker holding a connection per in-flight operation). Excess connections exhaust the Postgres connection budget faster than they add throughput — raise only against measured demand."
		},
		{
			"heading": "pooling",
			"content": "Sizing heuristics:"
		},
		{
			"heading": "pooling",
			"content": "Workload"
		},
		{
			"heading": "pooling",
			"content": "`pool.max`"
		},
		{
			"heading": "pooling",
			"content": "Local dev, one process"
		},
		{
			"heading": "pooling",
			"content": "`10` (default)"
		},
		{
			"heading": "pooling",
			"content": "Single instance, moderate latency-sensitive reads"
		},
		{
			"heading": "pooling",
			"content": "`20`"
		},
		{
			"heading": "pooling",
			"content": "Multiple workers / high concurrency"
		},
		{
			"heading": "pooling",
			"content": "`workers × in-flight per worker`, capped by the server's connection limit"
		},
		{
			"heading": "pooling",
			"content": "Pool exhaustion shows up as connection timeouts under load rather than SQL errors — if you see them, the first question is \"how many concurrent transactions do we actually need\", not \"how many connections can the pool hold\"."
		},
		{
			"heading": "logging-and-slow-queries",
			"content": "Option"
		},
		{
			"heading": "logging-and-slow-queries",
			"content": "Default"
		},
		{
			"heading": "logging-and-slow-queries",
			"content": "Meaning"
		},
		{
			"heading": "logging-and-slow-queries",
			"content": "`logging`"
		},
		{
			"heading": "logging-and-slow-queries",
			"content": "`false`"
		},
		{
			"heading": "logging-and-slow-queries",
			"content": "Emit query logging for development"
		},
		{
			"heading": "logging-and-slow-queries",
			"content": "`slowQueryThreshold`"
		},
		{
			"heading": "logging-and-slow-queries",
			"content": "`500`"
		},
		{
			"heading": "logging-and-slow-queries",
			"content": "Milliseconds above which a query is flagged as slow"
		},
		{
			"heading": "logging-and-slow-queries",
			"content": "With `logging: true`, queries log with trace correlation — each log line ties back to the request span, so a slow statement is traceable to the tenant and endpoint that caused it. The slow-query threshold also feeds the telemetry pipeline (see Observability: Logging)."
		},
		{
			"heading": "named-connections-and-read-replicas",
			"content": "**Named connections (`v1.x`)**: declare multiple connections under `connections` and target them from application code — separate databases for reporting, audit, or per-module schemas."
		},
		{
			"heading": "named-connections-and-read-replicas",
			"content": "**Read replicas (`v2`)**: a `readOnly: true` connection routes read traffic while writes stay on `primary`."
		},
		{
			"heading": "named-connections-and-read-replicas",
			"content": "Until those land, the single configured connection serves everything — keep the config file minimal and rely on the driver split for environment differences."
		},
		{
			"heading": "troubleshooting",
			"content": "Symptom"
		},
		{
			"heading": "troubleshooting",
			"content": "Likely cause"
		},
		{
			"heading": "troubleshooting",
			"content": "Fix"
		},
		{
			"heading": "troubleshooting",
			"content": "`DATABASE_URL` ignored"
		},
		{
			"heading": "troubleshooting",
			"content": "Env not loaded, or key mismatch in `env` map"
		},
		{
			"heading": "troubleshooting",
			"content": "Confirm the var name in `env` and that env loading ran"
		},
		{
			"heading": "troubleshooting",
			"content": "Connection timeouts under load"
		},
		{
			"heading": "troubleshooting",
			"content": "`pool.max` too low for concurrency"
		},
		{
			"heading": "troubleshooting",
			"content": "Measure concurrent transactions, size the pool"
		},
		{
			"heading": "troubleshooting",
			"content": "Slow queries not logged"
		},
		{
			"heading": "troubleshooting",
			"content": "`logging: false` or threshold too high"
		},
		{
			"heading": "troubleshooting",
			"content": "Enable `logging`, lower `slowQueryThreshold`"
		},
		{
			"heading": "troubleshooting",
			"content": "Wrong database for CLI"
		},
		{
			"heading": "troubleshooting",
			"content": "`kwiva db:migrate` in one env, app in another"
		},
		{
			"heading": "troubleshooting",
			"content": "Check `DB_DRIVER` / `DATABASE_URL` per environment"
		},
		{
			"heading": "troubleshooting",
			"content": "Because the CLI, migrations, seeders, and the app all read the same `src/config/database.ts`, a misconfiguration shows up identically in every entry point — the fix is always in this one file."
		},
		{
			"heading": "troubleshooting",
			"content": "> \\[!TIP]\n> The dev/prod driver split is configuration, not code. Keep migrations and queries driver-portable (the `sql` migration tag is dialect-aware) so switching environments never involves rewriting SQL."
		},
		{
			"heading": "observability",
			"content": "Every query emits an OTel span with normalized SQL text, duration, and row count; slow queries surface through `slowQueryThreshold`. Combined with transaction spans, the data layer is fully observable from one trace — see Observability: Tracing."
		},
		{
			"heading": "whats-next",
			"content": "Migrations — evolving the schema on these connections"
		},
		{
			"heading": "whats-next",
			"content": "Queries — the runtime query plane"
		},
		{
			"heading": "whats-next",
			"content": "Models — the model IR these connections serve"
		},
		{
			"heading": "whats-next",
			"content": "Configuration — the config folder and `defineConfig`"
		}
	],
	"headings": [
		{
			"id": "the-config-file",
			"content": "The Config File"
		},
		{
			"id": "drivers",
			"content": "Drivers"
		},
		{
			"id": "environment-variables",
			"content": "Environment Variables"
		},
		{
			"id": "connection-urls",
			"content": "Connection URLs"
		},
		{
			"id": "pooling",
			"content": "Pooling"
		},
		{
			"id": "logging-and-slow-queries",
			"content": "Logging and Slow Queries"
		},
		{
			"id": "named-connections-and-read-replicas",
			"content": "Named Connections and Read Replicas"
		},
		{
			"id": "troubleshooting",
			"content": "Troubleshooting"
		},
		{
			"id": "observability",
			"content": "Observability"
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
		url: "#the-config-file",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Config File" })
	},
	{
		depth: 2,
		url: "#drivers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Drivers" })
	},
	{
		depth: 2,
		url: "#environment-variables",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Environment Variables" })
	},
	{
		depth: 2,
		url: "#connection-urls",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Connection URLs" })
	},
	{
		depth: 2,
		url: "#pooling",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Pooling" })
	},
	{
		depth: 2,
		url: "#logging-and-slow-queries",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Logging and Slow Queries" })
	},
	{
		depth: 2,
		url: "#named-connections-and-read-replicas",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Named Connections and Read Replicas" })
	},
	{
		depth: 2,
		url: "#troubleshooting",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Troubleshooting" })
	},
	{
		depth: 2,
		url: "#observability",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Observability" })
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
		blockquote: "blockquote",
		code: "code",
		h2: "h2",
		li: "li",
		ol: "ol",
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
			"The database layer is configured from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/database.ts" }),
			", one file that describes connections, pooling, logging, and environment mapping. The sensible default pairing is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "SQLite for development, Postgres for production" }),
			" — the same model files, migrations, and queries run against both, so the low-friction default does not fork your code."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-config-file",
			children: "The Config File"
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
			title: "src/config/database.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/database.ts"
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
							children: " defineConfig"
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
							children: "'database'"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  defaults: {"
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
							children: "    driver: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'sqlite'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",                          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// dev default"
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
							children: "    url: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'sqlite://storage/database.db'"
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
							children: "    pool: { max: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "10"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", idleTimeout: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "30_000"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " },"
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
							children: "    logging: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "false"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  env: { url: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'DATABASE_URL'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", driver: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'DB_DRIVER'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " },"
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
						children: "  connections: {"
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
							children: "    primary: { url: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "env"
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
							children: "'DATABASE_URL'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "), pool: { max: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "20"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } },"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "    // replica: { url: env('READ_REPLICA_URL'), pool: { max: 10 }, readOnly: true },"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: " // v2"
					})]
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Block" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Role" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defaults" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Base settings for every connection" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Which environment variables override which settings" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "connections" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Named connections for the multi-connection surface (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "v1.x" }),
				"), read replicas (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "v2" }),
				")"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "drivers",
			children: "Drivers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Driver" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Typical use" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Notes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sqlite" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Local development" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["File-backed; zero setup; ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sqlite://path" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "postgres" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Production default" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Primary production driver; the team's reference runtime" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "mysql" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Existing infrastructure" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Supported driver for migrations continuing on MySQL" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The driver is a single string per connection. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DB_DRIVER" }),
			" lets each environment pick its own without editing the file."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Environment" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Driver" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "URL" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Local dev" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sqlite" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sqlite://storage/database.db" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "CI" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sqlite" }),
					" or ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "postgres" })
				] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["ephemeral file / ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DATABASE_URL" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Production" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "postgres" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "postgres://user:pass@host:5432/app" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Existing MySQL" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "mysql" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "driver-native DSN" })
			] })
		] })] }),
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
			title: "drivers.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "url"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'sqlite://storage/database.db'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "        // sqlite file"
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
							children: "url"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "env"
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
							children: "'DATABASE_URL'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")                    "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// standard postgres/mysql DSN via env"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "environment-variables",
			children: "Environment Variables"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }), " maps config keys to environment variables, and environment values always win over hard-coded defaults:"] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Config entry" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Env var" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Precedence" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "url" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DATABASE_URL" }) }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Set env var = override; missing = use ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defaults.url" })] })
		] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "driver" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DB_DRIVER" }) }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Set env var = override; missing = use ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defaults.driver" })] })
		] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This is the same pattern as every config folder — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/configuration",
				children: "Getting Started: Configuration"
			}),
			" for ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
			" semantics."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "connection-urls",
			children: "Connection URLs"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Connection strings follow the driver's native DSN style:" }),
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "DATABASE_URL"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "postgres://user:pass@host:5432/app"
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
							children: "DB_DRIVER"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "="
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "postgres"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:model" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:diff" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:migrate" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:seed" }),
			" all read the same config and env, so the CLI is always operating on the same database your app uses."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "pooling",
			children: "Pooling"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Option" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Default" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pool.max" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "10" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Maximum concurrent connections" })
		] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pool.idleTimeout" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "30000" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Milliseconds an idle connection is retained" })
		] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Tune ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pool.max" }),
			" for expected concurrency: small for local, larger for production workers (each worker holding a connection per in-flight operation). Excess connections exhaust the Postgres connection budget faster than they add throughput — raise only against measured demand."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Sizing heuristics:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Workload" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pool.max" }) })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Local dev, one process" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "10" }), " (default)"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Single instance, moderate latency-sensitive reads" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "20" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Multiple workers / high concurrency" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "workers × in-flight per worker" }), ", capped by the server's connection limit"] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Pool exhaustion shows up as connection timeouts under load rather than SQL errors — if you see them, the first question is \"how many concurrent transactions do we actually need\", not \"how many connections can the pool hold\"." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "logging-and-slow-queries",
			children: "Logging and Slow Queries"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Option" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Default" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "logging" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "false" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Emit query logging for development" })
		] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "slowQueryThreshold" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "500" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Milliseconds above which a query is flagged as slow" })
		] })] })] }),
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
			title: "logging-and-slow-queries.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "defaults"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": {"
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
							children: "  logging"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "true"
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
							children: "  slowQueryThreshold"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "250"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "}"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"With ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "logging: true" }),
			", queries log with trace correlation — each log line ties back to the request span, so a slow statement is traceable to the tenant and endpoint that caused it. The slow-query threshold also feeds the telemetry pipeline (see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/logging",
				children: "Observability: Logging"
			}),
			")."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "named-connections-and-read-replicas",
			children: "Named Connections and Read Replicas"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [
					"Named connections (",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "v1.x" }),
					")"
				] }),
				": declare multiple connections under ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "connections" }),
				" and target them from application code — separate databases for reporting, audit, or per-module schemas."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [
					"Read replicas (",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "v2" }),
					")"
				] }),
				": a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "readOnly: true" }),
				" connection routes read traffic while writes stay on ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "primary" }),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Until those land, the single configured connection serves everything — keep the config file minimal and rely on the driver split for environment differences." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "troubleshooting",
			children: "Troubleshooting"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Symptom" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Likely cause" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Fix" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DATABASE_URL" }), " ignored"] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Env not loaded, or key mismatch in ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }),
					" map"
				] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Confirm the var name in ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }),
					" and that env loading ran"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Connection timeouts under load" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pool.max" }), " too low for concurrency"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Measure concurrent transactions, size the pool" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Slow queries not logged" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "logging: false" }), " or threshold too high"] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Enable ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "logging" }),
					", lower ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "slowQueryThreshold" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Wrong database for CLI" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }), " in one env, app in another"] }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Check ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DB_DRIVER" }),
					" / ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DATABASE_URL" }),
					" per environment"
				] })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the CLI, migrations, seeders, and the app all read the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/database.ts" }),
			", a misconfiguration shows up identically in every entry point — the fix is always in this one file."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!TIP]\nThe dev/prod driver split is configuration, not code. Keep migrations and queries driver-portable (the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sql" }),
				" migration tag is dialect-aware) so switching environments never involves rewriting SQL."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "observability",
			children: "Observability"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every query emits an OTel span with normalized SQL text, duration, and row count; slow queries surface through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "slowQueryThreshold" }),
			". Combined with transaction spans, the data layer is fully observable from one trace — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Observability: Tracing"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/migrations",
				children: "Migrations"
			}), " — evolving the schema on these connections"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/queries",
				children: "Queries"
			}), " — the runtime query plane"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}), " — the model IR these connections serve"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/getting-started/configuration",
					children: "Configuration"
				}),
				" — the config folder and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" })
			] }),
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
