import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/getting-started/development-server.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Development Server",
	"description": "Run the Kwiva development server with native TypeScript execution, hot module replacement, and boot-time validation of your config and environment."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nThe development server is where you spend most of your time: it starts fast, hot-reloads your changes, and validates your environment and configuration every time it boots.\n\n## Starting the Server [#starting-the-server]\n\n```bash title=\"terminal\"\nbun run dev\n```\n\n`bun run dev` is the project alias for `kwiva dev`. The server starts at `http://localhost:3000` with HMR enabled and the full application pipeline — SSR pages, API routes, and middleware — live.\n\n### Options [#options]\n\n| Flag         | Purpose                                              |\n| ------------ | ---------------------------------------------------- |\n| `--port <n>` | Run on a specific port, e.g. `kwiva dev --port 4000` |\n| `--cluster`  | Start a cluster across available cores               |\n\n```bash title=\"terminal\"\nbun run dev --port 4000\n```\n\n> \\[!TIP]\n> You can define the middleware stack, default port, and app identity in `src/config/app.ts`, so most projects never need to pass flags.\n\n## What Happens Under the Hood [#what-happens-under-the-hood]\n\n`kwiva dev` does the following at startup:\n\n1. **Loads configuration** — reads `kwiva.config.ts` and the `src/config/` modules\n2. **Loads the environment** — applies `.env`, then `.env.local` for developer overrides\n3. **Validates the environment** — checks every declared env var; missing required vars fail fast with a readable table\n4. **Discovers constructs** — scans the conventional directories for models, controllers, middleware, pages, jobs, and events\n5. **Regenerates artifacts** — rebuilds `src/.kwiva/` (ambient types, the route manifest, the model IR) that power the typed client and editor\n6. **Starts the server** — a Bun-native HTTP server with hot module replacement\n7. **Transforms TypeScript on the fly** — no separate compile step between edit and reload\n\n### Boot-Time Validation [#boot-time-validation]\n\nEnvironment problems surface immediately instead of at request time. A missing required variable produces a clear error:\n\n```plaintext title=\"boot-time-validation.txt\"\n✗ Missing required environment variables:\n    DATABASE_URL   (declared in src/config/database.ts)\n```\n\nOptional variables declare defaults in their config module; secrets have no defaults. `kwiva key:generate` writes the `APP_KEY` signing secret to `.env`, and secrets are never printed by the CLI.\n\n## Environment Files [#environment-files]\n\nProduction and test also have dedicated files, keeping secrets out of the default dev environment:\n\n| File              | Loaded                         | Committed       |\n| ----------------- | ------------------------------ | --------------- |\n| `.env`            | Always (dev)                   | No              |\n| `.env.local`      | Developer overrides            | No (gitignored) |\n| `.env.example`    | Template of every declared var | Yes             |\n| `.env.production` | Production builds              | No              |\n\nVariables are declared exactly once — in the `env` map of a `src/config/*.ts` module — and that declaration is the source for types, boot validation, and `.env.example` generation. Only `KWIVA_PUBLIC_*` variables are safe to expose to the client.\n\n## Hot Module Replacement [#hot-module-replacement]\n\nThe dev server watches your source tree and applies changes in place:\n\n* **Pages** — edit a page, re-render instantly, preserve client state\n* **Controllers and routes** — API handlers update without a server restart\n* **Models** — schema changes regenerate the model IR and flow through to types\n* **Middleware** — lifecycle changes apply to subsequent requests\n* **Configuration** — most config changes reload without a restart\n\nBatch operations work too: run `kwiva db:migrate` in a second terminal and the dev server picks up the schema change without a restart.\n\n## Request Handling in Dev [#request-handling-in-dev]\n\nRequests flow through the same pipeline they will in production, so what you see locally is what you get in prod:\n\n1. Framework middleware runs in the order declared in `src/config/app.ts` — request id, security headers, rate limiting, CORS — before any guard\n2. The route manifest is matched (generated model routes, controllers, server routes); route rules apply, including cache short-circuits\n3. Context is assembled — body/query parsing, cookies and session load, tenant resolution, and typed app state\n4. Schema validation runs, then guards (`beforeHandle`), then the handler\n5. Responses are shaped, cache tags set, and telemetry spans close\n6. Any throw maps through the error taxonomy to the right status code\n\nIndividual stages complete in single-digit milliseconds on local hardware (the request is fully formed by the time the handler runs), and each stage is an observable span — the dev overlay can show the per-stage waterfall (v1.x).\n\n## Development Commands [#development-commands]\n\nThe `kwiva` CLI covers the rest of the inner loop:\n\n| Command                                     | Purpose                                                               |\n| ------------------------------------------- | --------------------------------------------------------------------- |\n| `kwiva check`                               | Format + lint + typecheck in one pass (with `--fix` to auto-correct)  |\n| `kwiva test`                                | Run tests; `--watch` re-runs on change, `--e2e` adds end-to-end specs |\n| `kwiva console`                             | A REPL with the full app context (config, models, client)             |\n| `kwiva make:*`                              | Scaffold a model, controller, page, job, and more                     |\n| `kwiva db:migrate` / `db:seed` / `db:reset` | Move the database forward                                             |\n\nA typical loop looks like:\n\n```bash title=\"terminal\"\nkwiva make:model post\nkwiva db:migrate\nbun run dev\n# edit src/app/models/post.ts → HMR → repeat\n```\n\n## Environment Modes [#environment-modes]\n\nThe dev server runs in `development` mode by default. The three environment modes affect behavior across the whole toolchain:\n\n| Mode          | Set by        | Effect                                              |\n| ------------- | ------------- | --------------------------------------------------- |\n| `development` | default       | Dev server, verbose errors, seed-on-boot option     |\n| `production`  | `kwiva build` | Minified output, telemetry on, terse errors         |\n| `test`        | `kwiva test`  | In-memory adapters where possible, factories seeded |\n\n`config('app.env')` is the canonical read; `NODE_ENV` maps onto it.\n\n## The Dev Overlay [#the-dev-overlay]\n\nKwiva's dev server includes an overlay that surfaces route trees, loader timings, and cache state while you develop (v1.x — being expanded). Friendly errors — did-you-mean suggestions for typos, field-mapped validation failures, and request correlation ids — appear in the terminal and in forwarded headers, so you can trace a failing request end to end.\n\n## What to Read Next [#what-to-read-next]\n\n* [Your First Model](/docs/getting-started/first-model) — create your first data model\n* [Your First API](/docs/getting-started/first-api) — create your first API endpoint\n* [Your First Page](/docs/getting-started/first-page) — render your first server-rendered page\n* [Observability: Dev Overlay](/docs/observability/dev-overlay) — debugging with the dev overlay\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "The development server is where you spend most of your time: it starts fast, hot-reloads your changes, and validates your environment and configuration every time it boots."
		},
		{
			"heading": "starting-the-server",
			"content": "`bun run dev` is the project alias for `kwiva dev`. The server starts at `http://localhost:3000` with HMR enabled and the full application pipeline — SSR pages, API routes, and middleware — live."
		},
		{
			"heading": "options",
			"content": "Flag"
		},
		{
			"heading": "options",
			"content": "Purpose"
		},
		{
			"heading": "options",
			"content": "`--port <n>`"
		},
		{
			"heading": "options",
			"content": "Run on a specific port, e.g. `kwiva dev --port 4000`"
		},
		{
			"heading": "options",
			"content": "`--cluster`"
		},
		{
			"heading": "options",
			"content": "Start a cluster across available cores"
		},
		{
			"heading": "options",
			"content": "> \\[!TIP]\n> You can define the middleware stack, default port, and app identity in `src/config/app.ts`, so most projects never need to pass flags."
		},
		{
			"heading": "what-happens-under-the-hood",
			"content": "`kwiva dev` does the following at startup:"
		},
		{
			"heading": "what-happens-under-the-hood",
			"content": "**Loads configuration** — reads `kwiva.config.ts` and the `src/config/` modules"
		},
		{
			"heading": "what-happens-under-the-hood",
			"content": "**Loads the environment** — applies `.env`, then `.env.local` for developer overrides"
		},
		{
			"heading": "what-happens-under-the-hood",
			"content": "**Validates the environment** — checks every declared env var; missing required vars fail fast with a readable table"
		},
		{
			"heading": "what-happens-under-the-hood",
			"content": "**Discovers constructs** — scans the conventional directories for models, controllers, middleware, pages, jobs, and events"
		},
		{
			"heading": "what-happens-under-the-hood",
			"content": "**Regenerates artifacts** — rebuilds `src/.kwiva/` (ambient types, the route manifest, the model IR) that power the typed client and editor"
		},
		{
			"heading": "what-happens-under-the-hood",
			"content": "**Starts the server** — a Bun-native HTTP server with hot module replacement"
		},
		{
			"heading": "what-happens-under-the-hood",
			"content": "**Transforms TypeScript on the fly** — no separate compile step between edit and reload"
		},
		{
			"heading": "boot-time-validation",
			"content": "Environment problems surface immediately instead of at request time. A missing required variable produces a clear error:"
		},
		{
			"heading": "boot-time-validation",
			"content": "Optional variables declare defaults in their config module; secrets have no defaults. `kwiva key:generate` writes the `APP_KEY` signing secret to `.env`, and secrets are never printed by the CLI."
		},
		{
			"heading": "environment-files",
			"content": "Production and test also have dedicated files, keeping secrets out of the default dev environment:"
		},
		{
			"heading": "environment-files",
			"content": "File"
		},
		{
			"heading": "environment-files",
			"content": "Loaded"
		},
		{
			"heading": "environment-files",
			"content": "Committed"
		},
		{
			"heading": "environment-files",
			"content": "`.env`"
		},
		{
			"heading": "environment-files",
			"content": "Always (dev)"
		},
		{
			"heading": "environment-files",
			"content": "No"
		},
		{
			"heading": "environment-files",
			"content": "`.env.local`"
		},
		{
			"heading": "environment-files",
			"content": "Developer overrides"
		},
		{
			"heading": "environment-files",
			"content": "No (gitignored)"
		},
		{
			"heading": "environment-files",
			"content": "`.env.example`"
		},
		{
			"heading": "environment-files",
			"content": "Template of every declared var"
		},
		{
			"heading": "environment-files",
			"content": "Yes"
		},
		{
			"heading": "environment-files",
			"content": "`.env.production`"
		},
		{
			"heading": "environment-files",
			"content": "Production builds"
		},
		{
			"heading": "environment-files",
			"content": "No"
		},
		{
			"heading": "environment-files",
			"content": "Variables are declared exactly once — in the `env` map of a `src/config/*.ts` module — and that declaration is the source for types, boot validation, and `.env.example` generation. Only `KWIVA_PUBLIC_*` variables are safe to expose to the client."
		},
		{
			"heading": "hot-module-replacement",
			"content": "The dev server watches your source tree and applies changes in place:"
		},
		{
			"heading": "hot-module-replacement",
			"content": "**Pages** — edit a page, re-render instantly, preserve client state"
		},
		{
			"heading": "hot-module-replacement",
			"content": "**Controllers and routes** — API handlers update without a server restart"
		},
		{
			"heading": "hot-module-replacement",
			"content": "**Models** — schema changes regenerate the model IR and flow through to types"
		},
		{
			"heading": "hot-module-replacement",
			"content": "**Middleware** — lifecycle changes apply to subsequent requests"
		},
		{
			"heading": "hot-module-replacement",
			"content": "**Configuration** — most config changes reload without a restart"
		},
		{
			"heading": "hot-module-replacement",
			"content": "Batch operations work too: run `kwiva db:migrate` in a second terminal and the dev server picks up the schema change without a restart."
		},
		{
			"heading": "request-handling-in-dev",
			"content": "Requests flow through the same pipeline they will in production, so what you see locally is what you get in prod:"
		},
		{
			"heading": "request-handling-in-dev",
			"content": "Framework middleware runs in the order declared in `src/config/app.ts` — request id, security headers, rate limiting, CORS — before any guard"
		},
		{
			"heading": "request-handling-in-dev",
			"content": "The route manifest is matched (generated model routes, controllers, server routes); route rules apply, including cache short-circuits"
		},
		{
			"heading": "request-handling-in-dev",
			"content": "Context is assembled — body/query parsing, cookies and session load, tenant resolution, and typed app state"
		},
		{
			"heading": "request-handling-in-dev",
			"content": "Schema validation runs, then guards (`beforeHandle`), then the handler"
		},
		{
			"heading": "request-handling-in-dev",
			"content": "Responses are shaped, cache tags set, and telemetry spans close"
		},
		{
			"heading": "request-handling-in-dev",
			"content": "Any throw maps through the error taxonomy to the right status code"
		},
		{
			"heading": "request-handling-in-dev",
			"content": "Individual stages complete in single-digit milliseconds on local hardware (the request is fully formed by the time the handler runs), and each stage is an observable span — the dev overlay can show the per-stage waterfall (v1.x)."
		},
		{
			"heading": "development-commands",
			"content": "The `kwiva` CLI covers the rest of the inner loop:"
		},
		{
			"heading": "development-commands",
			"content": "Command"
		},
		{
			"heading": "development-commands",
			"content": "Purpose"
		},
		{
			"heading": "development-commands",
			"content": "`kwiva check`"
		},
		{
			"heading": "development-commands",
			"content": "Format + lint + typecheck in one pass (with `--fix` to auto-correct)"
		},
		{
			"heading": "development-commands",
			"content": "`kwiva test`"
		},
		{
			"heading": "development-commands",
			"content": "Run tests; `--watch` re-runs on change, `--e2e` adds end-to-end specs"
		},
		{
			"heading": "development-commands",
			"content": "`kwiva console`"
		},
		{
			"heading": "development-commands",
			"content": "A REPL with the full app context (config, models, client)"
		},
		{
			"heading": "development-commands",
			"content": "`kwiva make:*`"
		},
		{
			"heading": "development-commands",
			"content": "Scaffold a model, controller, page, job, and more"
		},
		{
			"heading": "development-commands",
			"content": "`kwiva db:migrate` / `db:seed` / `db:reset`"
		},
		{
			"heading": "development-commands",
			"content": "Move the database forward"
		},
		{
			"heading": "development-commands",
			"content": "A typical loop looks like:"
		},
		{
			"heading": "environment-modes",
			"content": "The dev server runs in `development` mode by default. The three environment modes affect behavior across the whole toolchain:"
		},
		{
			"heading": "environment-modes",
			"content": "Mode"
		},
		{
			"heading": "environment-modes",
			"content": "Set by"
		},
		{
			"heading": "environment-modes",
			"content": "Effect"
		},
		{
			"heading": "environment-modes",
			"content": "`development`"
		},
		{
			"heading": "environment-modes",
			"content": "default"
		},
		{
			"heading": "environment-modes",
			"content": "Dev server, verbose errors, seed-on-boot option"
		},
		{
			"heading": "environment-modes",
			"content": "`production`"
		},
		{
			"heading": "environment-modes",
			"content": "`kwiva build`"
		},
		{
			"heading": "environment-modes",
			"content": "Minified output, telemetry on, terse errors"
		},
		{
			"heading": "environment-modes",
			"content": "`test`"
		},
		{
			"heading": "environment-modes",
			"content": "`kwiva test`"
		},
		{
			"heading": "environment-modes",
			"content": "In-memory adapters where possible, factories seeded"
		},
		{
			"heading": "environment-modes",
			"content": "`config('app.env')` is the canonical read; `NODE_ENV` maps onto it."
		},
		{
			"heading": "the-dev-overlay",
			"content": "Kwiva's dev server includes an overlay that surfaces route trees, loader timings, and cache state while you develop (v1.x — being expanded). Friendly errors — did-you-mean suggestions for typos, field-mapped validation failures, and request correlation ids — appear in the terminal and in forwarded headers, so you can trace a failing request end to end."
		},
		{
			"heading": "what-to-read-next",
			"content": "Your First Model — create your first data model"
		},
		{
			"heading": "what-to-read-next",
			"content": "Your First API — create your first API endpoint"
		},
		{
			"heading": "what-to-read-next",
			"content": "Your First Page — render your first server-rendered page"
		},
		{
			"heading": "what-to-read-next",
			"content": "Observability: Dev Overlay — debugging with the dev overlay"
		}
	],
	"headings": [
		{
			"id": "starting-the-server",
			"content": "Starting the Server"
		},
		{
			"id": "options",
			"content": "Options"
		},
		{
			"id": "what-happens-under-the-hood",
			"content": "What Happens Under the Hood"
		},
		{
			"id": "boot-time-validation",
			"content": "Boot-Time Validation"
		},
		{
			"id": "environment-files",
			"content": "Environment Files"
		},
		{
			"id": "hot-module-replacement",
			"content": "Hot Module Replacement"
		},
		{
			"id": "request-handling-in-dev",
			"content": "Request Handling in Dev"
		},
		{
			"id": "development-commands",
			"content": "Development Commands"
		},
		{
			"id": "environment-modes",
			"content": "Environment Modes"
		},
		{
			"id": "the-dev-overlay",
			"content": "The Dev Overlay"
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
		url: "#starting-the-server",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Starting the Server" })
	},
	{
		depth: 3,
		url: "#options",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Options" })
	},
	{
		depth: 2,
		url: "#what-happens-under-the-hood",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Happens Under the Hood" })
	},
	{
		depth: 3,
		url: "#boot-time-validation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Boot-Time Validation" })
	},
	{
		depth: 2,
		url: "#environment-files",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Environment Files" })
	},
	{
		depth: 2,
		url: "#hot-module-replacement",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Hot Module Replacement" })
	},
	{
		depth: 2,
		url: "#request-handling-in-dev",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Request Handling in Dev" })
	},
	{
		depth: 2,
		url: "#development-commands",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Development Commands" })
	},
	{
		depth: 2,
		url: "#environment-modes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Environment Modes" })
	},
	{
		depth: 2,
		url: "#the-dev-overlay",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Dev Overlay" })
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
		blockquote: "blockquote",
		code: "code",
		h2: "h2",
		h3: "h3",
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The development server is where you spend most of your time: it starts fast, hot-reloads your changes, and validates your environment and configuration every time it boots." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "starting-the-server",
			children: "Starting the Server"
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
						children: "bun"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " run"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " dev"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun run dev" }),
			" is the project alias for ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			". The server starts at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http://localhost:3000" }),
			" with HMR enabled and the full application pipeline — SSR pages, API routes, and middleware — live."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "options",
			children: "Options"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Flag" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--port <n>" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Run on a specific port, e.g. ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev --port 4000" })] })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--cluster" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Start a cluster across available cores" })] })] })] }),
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
						children: "bun"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " run"
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
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!TIP]\nYou can define the middleware stack, default port, and app identity in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts" }),
				", so most projects never need to pass flags."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-happens-under-the-hood",
			children: "What Happens Under the Hood"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }), " does the following at startup:"] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Loads configuration" }),
				" — reads ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
				" and the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/" }),
				" modules"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Loads the environment" }),
				" — applies ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env" }),
				", then ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env.local" }),
				" for developer overrides"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Validates the environment" }), " — checks every declared env var; missing required vars fail fast with a readable table"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Discovers constructs" }), " — scans the conventional directories for models, controllers, middleware, pages, jobs, and events"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Regenerates artifacts" }),
				" — rebuilds ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/" }),
				" (ambient types, the route manifest, the model IR) that power the typed client and editor"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Starts the server" }), " — a Bun-native HTTP server with hot module replacement"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Transforms TypeScript on the fly" }), " — no separate compile step between edit and reload"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "boot-time-validation",
			children: "Boot-Time Validation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Environment problems surface immediately instead of at request time. A missing required variable produces a clear error:" }),
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
			title: "boot-time-validation.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "✗ Missing required environment variables:" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    DATABASE_URL   (declared in src/config/database.ts)" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Optional variables declare defaults in their config module; secrets have no defaults. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva key:generate" }),
			" writes the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "APP_KEY" }),
			" signing secret to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env" }),
			", and secrets are never printed by the CLI."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "environment-files",
			children: "Environment Files"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Production and test also have dedicated files, keeping secrets out of the default dev environment:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "File" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Loaded" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Committed" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Always (dev)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "No" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env.local" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Developer overrides" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "No (gitignored)" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env.example" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Template of every declared var" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Yes" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env.production" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Production builds" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "No" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Variables are declared exactly once — in the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }),
			" map of a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/*.ts" }),
			" module — and that declaration is the source for types, boot validation, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".env.example" }),
			" generation. Only ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_PUBLIC_*" }),
			" variables are safe to expose to the client."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "hot-module-replacement",
			children: "Hot Module Replacement"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The dev server watches your source tree and applies changes in place:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Pages" }), " — edit a page, re-render instantly, preserve client state"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Controllers and routes" }), " — API handlers update without a server restart"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Models" }), " — schema changes regenerate the model IR and flow through to types"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Middleware" }), " — lifecycle changes apply to subsequent requests"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Configuration" }), " — most config changes reload without a restart"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Batch operations work too: run ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
			" in a second terminal and the dev server picks up the schema change without a restart."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "request-handling-in-dev",
			children: "Request Handling in Dev"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Requests flow through the same pipeline they will in production, so what you see locally is what you get in prod:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Framework middleware runs in the order declared in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts" }),
				" — request id, security headers, rate limiting, CORS — before any guard"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The route manifest is matched (generated model routes, controllers, server routes); route rules apply, including cache short-circuits" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Context is assembled — body/query parsing, cookies and session load, tenant resolution, and typed app state" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Schema validation runs, then guards (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeHandle" }),
				"), then the handler"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Responses are shaped, cache tags set, and telemetry spans close" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Any throw maps through the error taxonomy to the right status code" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Individual stages complete in single-digit milliseconds on local hardware (the request is fully formed by the time the handler runs), and each stage is an observable span — the dev overlay can show the per-stage waterfall (v1.x)." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "development-commands",
			children: "Development Commands"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva" }),
			" CLI covers the rest of the inner loop:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Format + lint + typecheck in one pass (with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--fix" }),
				" to auto-correct)"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Run tests; ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--watch" }),
				" re-runs on change, ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--e2e" }),
				" adds end-to-end specs"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva console" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A REPL with the full app context (config, models, client)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:*" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scaffold a model, controller, page, job, and more" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:seed" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "db:reset" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Move the database forward" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A typical loop looks like:" }),
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
							children: " make:model"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " post"
						})
					]
				}),
				"\n",
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
						children: " db:migrate"
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
							children: "bun"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " run"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " dev"
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
						children: "# edit src/app/models/post.ts → HMR → repeat"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "environment-modes",
			children: "Environment Modes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The dev server runs in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "development" }),
			" mode by default. The three environment modes affect behavior across the whole toolchain:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Set by" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Effect" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "development" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "default" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dev server, verbose errors, seed-on-boot option" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "production" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Minified output, telemetry on, terse errors" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "test" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "In-memory adapters where possible, factories seeded" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config('app.env')" }),
			" is the canonical read; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "NODE_ENV" }),
			" maps onto it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-dev-overlay",
			children: "The Dev Overlay"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva's dev server includes an overlay that surfaces route trees, loader timings, and cache state while you develop (v1.x — being expanded). Friendly errors — did-you-mean suggestions for typos, field-mapped validation failures, and request correlation ids — appear in the terminal and in forwarded headers, so you can trace a failing request end to end." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-to-read-next",
			children: "What to Read Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-model",
				children: "Your First Model"
			}), " — create your first data model"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-api",
				children: "Your First API"
			}), " — create your first API endpoint"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-page",
				children: "Your First Page"
			}), " — render your first server-rendered page"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/dev-overlay",
				children: "Observability: Dev Overlay"
			}), " — debugging with the dev overlay"] }),
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
