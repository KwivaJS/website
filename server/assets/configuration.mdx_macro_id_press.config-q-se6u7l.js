import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/core-concepts/configuration.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Configuration",
	"description": "One config folder, one precedence chain, typed access everywhere — how Kwiva handles configuration, environment binding, and inline overrides."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\n## Configuration Architecture [#configuration-architecture]\n\nKwiva's configuration system is built on three principles:\n\n1. **Typed** — every config value is typechecked from its module's `defaults` and schema; there is no `any` config.\n2. **Layered** — a fixed precedence chain runs from defaults to config-folder values to inline options to environment overrides.\n3. **Single source** — all configuration resolves through `src/config/`; nothing is configured from a second, ad-hoc place like a YAML file or package.json flags.\n\nThe result: you can discover every knob in one folder, typos fail at compile time, and misconfiguration fails at boot instead of on the first request.\n\n## The Entry File [#the-entry-file]\n\n`kwiva.config.ts` at the project root is the thin entry point. It points at the config folder and carries build, deploy, and module composition:\n\n```ts title=\"kwiva.config.ts\"\n// kwiva.config.ts\nimport { defineConfig } from '@kwiva/config'\n\nexport default defineConfig({\n  load: './src/config',          // the config folder\n  deploy: { preset: 'node_server' },\n  build: {\n    // full inline build options (the toolchain's surface, exposed as an escape hatch)\n    // sourcemap: true, target: 'es2022', ...\n  },\n  modules: [],\n})\n```\n\nRuntime configuration lives in the folder; build-time configuration (preset, module list, build options) lives in this file.\n\n## The Config Folder [#the-config-folder]\n\nEach domain owns one module under `src/config/`, authored with `defineConfig`:\n\n```ts title=\"src/config/database.ts\"\n// src/config/database.ts\nimport { defineConfig } from '@kwiva/config'\n\nexport default defineConfig('database', {\n  defaults: {\n    driver: 'sqlite',\n    url: 'sqlite://storage/database.db',\n    pool: { max: 10 },\n    migrations: { table: 'kwiva_migrations' },\n  },\n  env: {\n    url: 'DATABASE_URL',          // env var → config key mapping (typed + validated)\n    driver: 'DB_DRIVER',\n  },\n})\n```\n\nThe scaffolding ships a standard set of modules:\n\n| Module           | Owns                                                  | Key keys (excerpt)                   |\n| ---------------- | ----------------------------------------------------- | ------------------------------------ |\n| `app.ts`         | app identity, mode, middleware stack, timezone/locale | `name`, `env`, `url`, `middleware[]` |\n| `database.ts`    | connections, pool, migrations                         | `driver`, `url`, `connections{}`     |\n| `auth.ts`        | providers, session, password policy                   | `providers`, `session{}`             |\n| `session.ts`     | session store and cookie shape                        | `driver`, `cookie{}`                 |\n| `api.ts`         | API surface, versioning, rate limits, docs            | `prefix`, `rateLimit`, `docs`        |\n| `queue.ts`       | connections, retries, DLQ                             | `driver` (redis/db), `default`       |\n| `cache.ts`       | mounts, TTLs, tag strategy                            | `mounts{}`, `defaultTtl`             |\n| `storage.ts`     | storage disks and drivers, signed URLs                | `disks{ local, s3 }`                 |\n| `schedule.ts`    | timezone, task cron table                             | `tz`, `tasks{}`                      |\n| `tenancy.ts`     | tenancy mode, resolution, tenant field                | `mode`, `tenantField`                |\n| `cors.ts`        | CORS policy                                           | `origins`, `methods`, `headers`      |\n| `security.ts`    | headers, CSP, CSRF                                    | `csp`, `csrf`                        |\n| `ui.ts`          | renderer, theme, i18n                                 | `runtime`, `theme`                   |\n| `telemetry.ts`   | OTel exporters, sampling                              | `exporter`, `sampleRate`             |\n| `modules.ts`     | module registry                                       | `modules[]`                          |\n| `mail.ts` (v1.x) | mailers, from-address                                 | `mailers{}`                          |\n\nEach module is a `defineX` file, so it also accepts inline options and its values are typed. Custom domains are supported — a module is just a namespaced `defineConfig` call.\n\n## Precedence Rules [#precedence-rules]\n\nConfiguration follows one strict precedence chain, low to high:\n\n```plaintext title=\"precedence-rules.txt\"\ndefineConfig defaults  →  src/config/*.ts module values  →  defineX inline options  →  env (runtime overrides)\n```\n\nLater values override earlier ones. In particular:\n\n* `defaults` are the floor for every module.\n* Config-folder values mutate the defaults.\n* Inline `defineX` options are per-construct and always win over the folder — but only for that construct.\n* Env bindings apply at runtime and also override the folder.\n\nNothing can be configured from a third place. Redis-dependent and other dynamic values stay runtime-owned, but they are always schema-typed in config.\n\n## Reading Configuration Anywhere [#reading-configuration-anywhere]\n\nThe typed reader comes from `@kwiva/core`:\n\n```ts title=\"reading-configuration-anywhere.ts\"\nimport { config } from '@kwiva/core'\n\nconst url = config('database.url')          // typed: string\nconst pool = config('database.pool.max')    // typed: number\n```\n\nTypes flow from each module's `defaults` plus its schema, so a misspelled path or a wrong access fails compilation.\n\n## Inline Overrides in defineX [#inline-overrides-in-definex]\n\nBecause every `defineX` factory accepts full inline options, per-construct tuning lives next to the construct:\n\n```ts title=\"inline-overrides-in-definex.ts\"\nexport default defineModel('posts', (f) => ({ /* ... */ }), {\n  cache: { ttl: 120, tags: ['posts'] },       // overrides src/config/cache.ts defaults for this model\n  rateLimit: { max: 100, per: 60 },           // overrides api defaults for generated routes\n})\n\nexport default defineController('reports', (c) => ({ /* ... */ }), {\n  prefix: '/reports',\n  cors: { origins: ['https://acme.dev'] },    // inline beats the folder\n})\n\nexport default defineJob('cleanup', handler, {\n  queue: 'maintenance',                       // routes to a queue declared in src/config/queue.ts\n  attempts: 3,\n})\n```\n\nRule of thumb: the folder centralizes and defaults; inline tunes per construct. Inline options never move the folder's role as the centralizing authority.\n\n## Typed Env Access [#typed-env-access]\n\nEnv vars are declared exactly once — in the module's `env` map — and everything flows from that declaration: types, boot validation, and the generated `.env.example`. Application code reads through the typed helper:\n\n```ts title=\"typed-env-access.ts\"\nimport { env } from '@kwiva/core'\n\nconst dbUrl = env('DATABASE_URL')              // string — declared in database.ts env map\n// env('NOT_DECLARED') → compile-time error, plus a boot-time error\n```\n\nEnv is validated at boot, fail-fast, with a table of missing variables. Undeclared reads fail at compile time and at boot, so ambient magic is impossible. Client-safe values are the exception: only variables under the `KWIVA_PUBLIC_` prefix ever flow into client bundles. See [Getting Started: Configuration](/docs/getting-started/configuration) for env setup.\n\n## Runtime vs Build-Time [#runtime-vs-build-time]\n\n| Layer      | Values                                                        | Notes                                       |\n| ---------- | ------------------------------------------------------------- | ------------------------------------------- |\n| Build-time | `kwiva.config.ts` — build options, deploy preset, module list | resolved when you build                     |\n| Runtime    | everything in `src/config/`, overridable by env               | snapshotted into the runtime config channel |\n\nFor production cold starts, `kwiva config:cache` merges and snapshots the folder so a zero-IO process can load it. The planned `doctor` command (v1.x) validates config against presets and runtimes. Both are CLI-level conveniences on top of the same typed model.\n\n## Anti-Patterns (Rejected by Design) [#anti-patterns-rejected-by-design]\n\nThese are not warnings but blocks:\n\n* **Scattering config as the primary home** — configuring constructs widely and ad-hoc instead of centralizing in the folder.\n* **Untyped `process.env` reads in app code** — lint-gated; use `env()` after declaring the variable.\n* **Baking env values into client bundles** — only `KWIVA_PUBLIC_*` values may reach the client.\n\n> \\[!WARNING]\n> If you find yourself reading `process.env` directly, reaching for config outside the folder, or looking up a value that was never declared in a module's `env` map, you are fighting the system — the framework will fail loudly rather than guess.\n\n## What's Next [#whats-next]\n\n1. [Getting Started: Configuration](/docs/getting-started/configuration) — day-one setup of the config folder\n2. [The defineX Convention](/docs/core-concepts/definex) — `defineConfig` as one of the seventeen factories\n3. [Applications](/docs/core-concepts/applications) — how the kernel loads and validates config at boot\n4. [Data: database config](/docs/data/database-config) — connection, pool, and migration settings\n5. [Deployment: adapters](/docs/deployment/adapters) — presets and runtime overrides per target\n";
var structuredData = {
	"contents": [
		{
			"heading": "configuration-architecture",
			"content": "Kwiva's configuration system is built on three principles:"
		},
		{
			"heading": "configuration-architecture",
			"content": "**Typed** — every config value is typechecked from its module's `defaults` and schema; there is no `any` config."
		},
		{
			"heading": "configuration-architecture",
			"content": "**Layered** — a fixed precedence chain runs from defaults to config-folder values to inline options to environment overrides."
		},
		{
			"heading": "configuration-architecture",
			"content": "**Single source** — all configuration resolves through `src/config/`; nothing is configured from a second, ad-hoc place like a YAML file or package.json flags."
		},
		{
			"heading": "configuration-architecture",
			"content": "The result: you can discover every knob in one folder, typos fail at compile time, and misconfiguration fails at boot instead of on the first request."
		},
		{
			"heading": "the-entry-file",
			"content": "`kwiva.config.ts` at the project root is the thin entry point. It points at the config folder and carries build, deploy, and module composition:"
		},
		{
			"heading": "the-entry-file",
			"content": "Runtime configuration lives in the folder; build-time configuration (preset, module list, build options) lives in this file."
		},
		{
			"heading": "the-config-folder",
			"content": "Each domain owns one module under `src/config/`, authored with `defineConfig`:"
		},
		{
			"heading": "the-config-folder",
			"content": "The scaffolding ships a standard set of modules:"
		},
		{
			"heading": "the-config-folder",
			"content": "Module"
		},
		{
			"heading": "the-config-folder",
			"content": "Owns"
		},
		{
			"heading": "the-config-folder",
			"content": "Key keys (excerpt)"
		},
		{
			"heading": "the-config-folder",
			"content": "`app.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "app identity, mode, middleware stack, timezone/locale"
		},
		{
			"heading": "the-config-folder",
			"content": "`name`, `env`, `url`, `middleware[]`"
		},
		{
			"heading": "the-config-folder",
			"content": "`database.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "connections, pool, migrations"
		},
		{
			"heading": "the-config-folder",
			"content": "`driver`, `url`, `connections{}`"
		},
		{
			"heading": "the-config-folder",
			"content": "`auth.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "providers, session, password policy"
		},
		{
			"heading": "the-config-folder",
			"content": "`providers`, `session{}`"
		},
		{
			"heading": "the-config-folder",
			"content": "`session.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "session store and cookie shape"
		},
		{
			"heading": "the-config-folder",
			"content": "`driver`, `cookie{}`"
		},
		{
			"heading": "the-config-folder",
			"content": "`api.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "API surface, versioning, rate limits, docs"
		},
		{
			"heading": "the-config-folder",
			"content": "`prefix`, `rateLimit`, `docs`"
		},
		{
			"heading": "the-config-folder",
			"content": "`queue.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "connections, retries, DLQ"
		},
		{
			"heading": "the-config-folder",
			"content": "`driver` (redis/db), `default`"
		},
		{
			"heading": "the-config-folder",
			"content": "`cache.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "mounts, TTLs, tag strategy"
		},
		{
			"heading": "the-config-folder",
			"content": "`mounts{}`, `defaultTtl`"
		},
		{
			"heading": "the-config-folder",
			"content": "`storage.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "storage disks and drivers, signed URLs"
		},
		{
			"heading": "the-config-folder",
			"content": "`disks{ local, s3 }`"
		},
		{
			"heading": "the-config-folder",
			"content": "`schedule.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "timezone, task cron table"
		},
		{
			"heading": "the-config-folder",
			"content": "`tz`, `tasks{}`"
		},
		{
			"heading": "the-config-folder",
			"content": "`tenancy.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "tenancy mode, resolution, tenant field"
		},
		{
			"heading": "the-config-folder",
			"content": "`mode`, `tenantField`"
		},
		{
			"heading": "the-config-folder",
			"content": "`cors.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "CORS policy"
		},
		{
			"heading": "the-config-folder",
			"content": "`origins`, `methods`, `headers`"
		},
		{
			"heading": "the-config-folder",
			"content": "`security.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "headers, CSP, CSRF"
		},
		{
			"heading": "the-config-folder",
			"content": "`csp`, `csrf`"
		},
		{
			"heading": "the-config-folder",
			"content": "`ui.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "renderer, theme, i18n"
		},
		{
			"heading": "the-config-folder",
			"content": "`runtime`, `theme`"
		},
		{
			"heading": "the-config-folder",
			"content": "`telemetry.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "OTel exporters, sampling"
		},
		{
			"heading": "the-config-folder",
			"content": "`exporter`, `sampleRate`"
		},
		{
			"heading": "the-config-folder",
			"content": "`modules.ts`"
		},
		{
			"heading": "the-config-folder",
			"content": "module registry"
		},
		{
			"heading": "the-config-folder",
			"content": "`modules[]`"
		},
		{
			"heading": "the-config-folder",
			"content": "`mail.ts` (v1.x)"
		},
		{
			"heading": "the-config-folder",
			"content": "mailers, from-address"
		},
		{
			"heading": "the-config-folder",
			"content": "`mailers{}`"
		},
		{
			"heading": "the-config-folder",
			"content": "Each module is a `defineX` file, so it also accepts inline options and its values are typed. Custom domains are supported — a module is just a namespaced `defineConfig` call."
		},
		{
			"heading": "precedence-rules",
			"content": "Configuration follows one strict precedence chain, low to high:"
		},
		{
			"heading": "precedence-rules",
			"content": "Later values override earlier ones. In particular:"
		},
		{
			"heading": "precedence-rules",
			"content": "`defaults` are the floor for every module."
		},
		{
			"heading": "precedence-rules",
			"content": "Config-folder values mutate the defaults."
		},
		{
			"heading": "precedence-rules",
			"content": "Inline `defineX` options are per-construct and always win over the folder — but only for that construct."
		},
		{
			"heading": "precedence-rules",
			"content": "Env bindings apply at runtime and also override the folder."
		},
		{
			"heading": "precedence-rules",
			"content": "Nothing can be configured from a third place. Redis-dependent and other dynamic values stay runtime-owned, but they are always schema-typed in config."
		},
		{
			"heading": "reading-configuration-anywhere",
			"content": "The typed reader comes from `@kwiva/core`:"
		},
		{
			"heading": "reading-configuration-anywhere",
			"content": "Types flow from each module's `defaults` plus its schema, so a misspelled path or a wrong access fails compilation."
		},
		{
			"heading": "inline-overrides-in-definex",
			"content": "Because every `defineX` factory accepts full inline options, per-construct tuning lives next to the construct:"
		},
		{
			"heading": "inline-overrides-in-definex",
			"content": "Rule of thumb: the folder centralizes and defaults; inline tunes per construct. Inline options never move the folder's role as the centralizing authority."
		},
		{
			"heading": "typed-env-access",
			"content": "Env vars are declared exactly once — in the module's `env` map — and everything flows from that declaration: types, boot validation, and the generated `.env.example`. Application code reads through the typed helper:"
		},
		{
			"heading": "typed-env-access",
			"content": "Env is validated at boot, fail-fast, with a table of missing variables. Undeclared reads fail at compile time and at boot, so ambient magic is impossible. Client-safe values are the exception: only variables under the `KWIVA_PUBLIC_` prefix ever flow into client bundles. See Getting Started: Configuration for env setup."
		},
		{
			"heading": "runtime-vs-build-time",
			"content": "Layer"
		},
		{
			"heading": "runtime-vs-build-time",
			"content": "Values"
		},
		{
			"heading": "runtime-vs-build-time",
			"content": "Notes"
		},
		{
			"heading": "runtime-vs-build-time",
			"content": "Build-time"
		},
		{
			"heading": "runtime-vs-build-time",
			"content": "`kwiva.config.ts` — build options, deploy preset, module list"
		},
		{
			"heading": "runtime-vs-build-time",
			"content": "resolved when you build"
		},
		{
			"heading": "runtime-vs-build-time",
			"content": "Runtime"
		},
		{
			"heading": "runtime-vs-build-time",
			"content": "everything in `src/config/`, overridable by env"
		},
		{
			"heading": "runtime-vs-build-time",
			"content": "snapshotted into the runtime config channel"
		},
		{
			"heading": "runtime-vs-build-time",
			"content": "For production cold starts, `kwiva config:cache` merges and snapshots the folder so a zero-IO process can load it. The planned `doctor` command (v1.x) validates config against presets and runtimes. Both are CLI-level conveniences on top of the same typed model."
		},
		{
			"heading": "anti-patterns-rejected-by-design",
			"content": "These are not warnings but blocks:"
		},
		{
			"heading": "anti-patterns-rejected-by-design",
			"content": "**Scattering config as the primary home** — configuring constructs widely and ad-hoc instead of centralizing in the folder."
		},
		{
			"heading": "anti-patterns-rejected-by-design",
			"content": "**Untyped `process.env` reads in app code** — lint-gated; use `env()` after declaring the variable."
		},
		{
			"heading": "anti-patterns-rejected-by-design",
			"content": "**Baking env values into client bundles** — only `KWIVA_PUBLIC_*` values may reach the client."
		},
		{
			"heading": "anti-patterns-rejected-by-design",
			"content": "> \\[!WARNING]\n> If you find yourself reading `process.env` directly, reaching for config outside the folder, or looking up a value that was never declared in a module's `env` map, you are fighting the system — the framework will fail loudly rather than guess."
		},
		{
			"heading": "whats-next",
			"content": "Getting Started: Configuration — day-one setup of the config folder"
		},
		{
			"heading": "whats-next",
			"content": "The defineX Convention — `defineConfig` as one of the seventeen factories"
		},
		{
			"heading": "whats-next",
			"content": "Applications — how the kernel loads and validates config at boot"
		},
		{
			"heading": "whats-next",
			"content": "Data: database config — connection, pool, and migration settings"
		},
		{
			"heading": "whats-next",
			"content": "Deployment: adapters — presets and runtime overrides per target"
		}
	],
	"headings": [
		{
			"id": "configuration-architecture",
			"content": "Configuration Architecture"
		},
		{
			"id": "the-entry-file",
			"content": "The Entry File"
		},
		{
			"id": "the-config-folder",
			"content": "The Config Folder"
		},
		{
			"id": "precedence-rules",
			"content": "Precedence Rules"
		},
		{
			"id": "reading-configuration-anywhere",
			"content": "Reading Configuration Anywhere"
		},
		{
			"id": "inline-overrides-in-definex",
			"content": "Inline Overrides in defineX"
		},
		{
			"id": "typed-env-access",
			"content": "Typed Env Access"
		},
		{
			"id": "runtime-vs-build-time",
			"content": "Runtime vs Build-Time"
		},
		{
			"id": "anti-patterns-rejected-by-design",
			"content": "Anti-Patterns (Rejected by Design)"
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
		url: "#configuration-architecture",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Configuration Architecture" })
	},
	{
		depth: 2,
		url: "#the-entry-file",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Entry File" })
	},
	{
		depth: 2,
		url: "#the-config-folder",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Config Folder" })
	},
	{
		depth: 2,
		url: "#precedence-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Precedence Rules" })
	},
	{
		depth: 2,
		url: "#reading-configuration-anywhere",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Reading Configuration Anywhere" })
	},
	{
		depth: 2,
		url: "#inline-overrides-in-definex",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Inline Overrides in defineX" })
	},
	{
		depth: 2,
		url: "#typed-env-access",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Typed Env Access" })
	},
	{
		depth: 2,
		url: "#runtime-vs-build-time",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Runtime vs Build-Time" })
	},
	{
		depth: 2,
		url: "#anti-patterns-rejected-by-design",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Anti-Patterns (Rejected by Design)" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "configuration-architecture",
			children: "Configuration Architecture"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva's configuration system is built on three principles:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Typed" }),
				" — every config value is typechecked from its module's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defaults" }),
				" and schema; there is no ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "any" }),
				" config."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Layered" }), " — a fixed precedence chain runs from defaults to config-folder values to inline options to environment overrides."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Single source" }),
				" — all configuration resolves through ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/" }),
				"; nothing is configured from a second, ad-hoc place like a YAML file or package.json flags."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The result: you can discover every knob in one folder, typos fail at compile time, and misconfiguration fails at boot instead of on the first request." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-entry-file",
			children: "The Entry File"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }), " at the project root is the thin entry point. It points at the config folder and carries build, deploy, and module composition:"] }),
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
			title: "kwiva.config.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// kwiva.config.ts"
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
							children: " { defineConfig } "
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
							children: " '@kwiva/config'"
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
							children: " defineConfig"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({"
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
							children: "  load: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./src/config'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// the config folder"
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
							children: "  deploy: { preset: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'node_server'"
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
						children: "  build: {"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "    // full inline build options (the toolchain's surface, exposed as an escape hatch)"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "    // sourcemap: true, target: 'es2022', ..."
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
						children: "  modules: [],"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Runtime configuration lives in the folder; build-time configuration (preset, module list, build options) lives in this file." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-config-folder",
			children: "The Config Folder"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each domain owns one module under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/" }),
			", authored with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
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
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { defineConfig } "
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
							children: " '@kwiva/config'"
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
							children: "    migrations: { table: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'kwiva_migrations'"
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
						children: "  env: {"
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
							children: "    url: "
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
							children: ",          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// env var → config key mapping (typed + validated)"
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
							children: "    driver: "
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The scaffolding ships a standard set of modules:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Module" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Owns" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Key keys (excerpt)" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "app.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "app identity, mode, middleware stack, timezone/locale" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "name" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "url" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "middleware[]" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "database.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "connections, pool, migrations" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "driver" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "url" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "connections{}" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "providers, session, password policy" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "providers" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session{}" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "session store and cookie shape" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "driver" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookie{}" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API surface, versioning, rate limits, docs" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prefix" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rateLimit" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "docs" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "connections, retries, DLQ" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "driver" }),
					" (redis/db), ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "default" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "mounts, TTLs, tag strategy" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "mounts{}" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defaultTtl" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "storage.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "storage disks and drivers, signed URLs" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "disks{ local, s3 }" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "schedule.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "timezone, task cron table" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tz" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tasks{}" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenancy.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "tenancy mode, resolution, tenant field" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "mode" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tenantField" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "CORS policy" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "origins" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "methods" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "headers" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "security.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "headers, CSP, CSRF" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "csp" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "csrf" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ui.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "renderer, theme, i18n" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "runtime" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "theme" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "telemetry.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "OTel exporters, sampling" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "exporter" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sampleRate" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "modules.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "module registry" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "modules[]" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "mail.ts" }), " (v1.x)"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "mailers, from-address" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "mailers{}" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each module is a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" file, so it also accepts inline options and its values are typed. Custom domains are supported — a module is just a namespaced ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
			" call."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "precedence-rules",
			children: "Precedence Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Configuration follows one strict precedence chain, low to high:" }),
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
			title: "precedence-rules.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineConfig defaults  →  src/config/*.ts module values  →  defineX inline options  →  env (runtime overrides)" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Later values override earlier ones. In particular:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defaults" }), " are the floor for every module."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Config-folder values mutate the defaults." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Inline ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" options are per-construct and always win over the folder — but only for that construct."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Env bindings apply at runtime and also override the folder." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Nothing can be configured from a third place. Redis-dependent and other dynamic values stay runtime-owned, but they are always schema-typed in config." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "reading-configuration-anywhere",
			children: "Reading Configuration Anywhere"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The typed reader comes from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }),
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
			title: "reading-configuration-anywhere.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
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
							children: " { config } "
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
							children: " '@kwiva/core'"
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " url"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " config"
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
							children: "'database.url'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// typed: string"
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " pool"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " config"
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
							children: "'database.pool.max'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")    "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// typed: number"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Types flow from each module's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defaults" }),
			" plus its schema, so a misspelled path or a wrong access fails compilation."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "inline-overrides-in-definex",
			children: "Inline Overrides in defineX"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because every ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factory accepts full inline options, per-construct tuning lives next to the construct:"
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
			title: "inline-overrides-in-definex.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
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
							children: " defineModel"
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
							children: "'posts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "f"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ") "
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
							children: " ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "/* ... */"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }), {"
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
							children: "  cache: { ttl: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "120"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", tags: ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'posts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "] },       "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// overrides src/config/cache.ts defaults for this model"
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
							children: "  rateLimit: { max: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "100"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", per: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "60"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " },           "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// overrides api defaults for generated routes"
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
						children: "})"
					})
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
							children: " defineController"
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
							children: "'reports'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "c"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ") "
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
							children: " ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "/* ... */"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }), {"
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
							children: "  prefix: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'/reports'"
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
							children: "  cors: { origins: ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'https://acme.dev'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "] },    "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// inline beats the folder"
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
						children: "})"
					})
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
							children: " defineJob"
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
							children: "'cleanup'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", handler, {"
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
							children: "  queue: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'maintenance'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",                       "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// routes to a queue declared in src/config/queue.ts"
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
							children: "  attempts: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "3"
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
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Rule of thumb: the folder centralizes and defaults; inline tunes per construct. Inline options never move the folder's role as the centralizing authority." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "typed-env-access",
			children: "Typed Env Access"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Env vars are declared exactly once — in the module's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }),
			" map — and everything flows from that declaration: types, boot validation, and the generated ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env.example" }),
			". Application code reads through the typed helper:"
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
			title: "typed-env-access.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
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
							children: " { env } "
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
							children: " '@kwiva/core'"
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
							children: "const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " dbUrl"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " env"
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
							children: ")              "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// string — declared in database.ts env map"
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
						children: "// env('NOT_DECLARED') → compile-time error, plus a boot-time error"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Env is validated at boot, fail-fast, with a table of missing variables. Undeclared reads fail at compile time and at boot, so ambient magic is impossible. Client-safe values are the exception: only variables under the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_PUBLIC_" }),
			" prefix ever flow into client bundles. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/configuration",
				children: "Getting Started: Configuration"
			}),
			" for env setup."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "runtime-vs-build-time",
			children: "Runtime vs Build-Time"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Layer" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Values" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Notes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build-time" }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }), " — build options, deploy preset, module list"] }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "resolved when you build" })
		] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Runtime" }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"everything in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/" }),
				", overridable by env"
			] }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "snapshotted into the runtime config channel" })
		] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For production cold starts, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva config:cache" }),
			" merges and snapshots the folder so a zero-IO process can load it. The planned ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "doctor" }),
			" command (v1.x) validates config against presets and runtimes. Both are CLI-level conveniences on top of the same typed model."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "anti-patterns-rejected-by-design",
			children: "Anti-Patterns (Rejected by Design)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "These are not warnings but blocks:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Scattering config as the primary home" }), " — configuring constructs widely and ad-hoc instead of centralizing in the folder."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [
					"Untyped ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "process.env" }),
					" reads in app code"
				] }),
				" — lint-gated; use ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env()" }),
				" after declaring the variable."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Baking env values into client bundles" }),
				" — only ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_PUBLIC_*" }),
				" values may reach the client."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!WARNING]\nIf you find yourself reading ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "process.env" }),
				" directly, reaching for config outside the folder, or looking up a value that was never declared in a module's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }),
				" map, you are fighting the system — the framework will fail loudly rather than guess."
			] }),
			"\n"
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
				href: "/docs/getting-started/configuration",
				children: "Getting Started: Configuration"
			}), " — day-one setup of the config folder"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/definex",
					children: "The defineX Convention"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
				" as one of the seventeen factories"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}), " — how the kernel loads and validates config at boot"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/database-config",
				children: "Data: database config"
			}), " — connection, pool, and migration settings"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/adapters",
				children: "Deployment: adapters"
			}), " — presets and runtime overrides per target"] }),
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
