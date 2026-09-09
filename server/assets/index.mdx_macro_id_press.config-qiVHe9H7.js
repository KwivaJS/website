import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/getting-started/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Installation",
	"description": "Install Bun, scaffold a Kwiva project, and start the development server in minutes — one framework for data, APIs, auth, frontend, jobs, realtime and deploy."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nGetting a Kwiva application running is a two-step process: install the runtime, then scaffold a project. Kwiva runs on [Bun](https://bun.sh) as its primary runtime, which executes TypeScript natively — no compile step, fast startup, and a single runtime for both your server and your tools.\n\n## Prerequisites [#prerequisites]\n\n| Requirement | Version        | Notes                                                              |\n| ----------- | -------------- | ------------------------------------------------------------------ |\n| **Bun**     | 1.2 or later   | Primary runtime — required for the CLI, the dev server, and builds |\n| **Node.js** | 18+ (optional) | For `node_server` compatibility presets and legacy integrations    |\n| **Git**     | any (optional) | For version control and addon installs from git                    |\n\nInstall or upgrade Bun:\n\n```bash title=\"terminal\"\ncurl -fsSL https://bun.sh/install | bash\nbun --version\n```\n\n> \\[!NOTE]\n> Kwiva is *not* a library layered on top of an existing app. The scaffold creates a complete project with its own configuration, directory conventions, and CLI — you don't wire pieces together afterwards.\n\n## Create a Project [#create-a-project]\n\nThe fastest way to start a Kwiva project is a single scaffold command:\n\n<Tabs items=\"['Bun (recommended)', 'Direct CLI']\">\n  <Tab value=\"Bun (recommended)\">\n    ```bash\n    bun create kwiva my-app\n    ```\n  </Tab>\n\n  <Tab value=\"Direct CLI\">\n    ```bash\n    bunx kwiva new my-app\n    ```\n  </Tab>\n</Tabs>\n\nThis is equivalent to `kwiva new my-app`. It creates a new project in `my-app/` with the default **fullstack** mode — a complete application with SSR frontend pages, API routes, and everything configured with sensible defaults. The scaffold installs dependencies, generates `kwiva.config.ts`, and prepares empty directories for models, controllers, and pages.\n\n### Project Modes [#project-modes]\n\nChoose a mode that matches how your application will run. The mode is set once at scaffold time and stays baked into the project's defaults.\n\n```bash title=\"terminal\"\n# Specify a mode\nbun create kwiva my-app --mode=api+spa\n```\n\n| Mode         | Description                                   | Deploy default                     |\n| ------------ | --------------------------------------------- | ---------------------------------- |\n| `fullstack`  | SSR pages + API routes (default)              | `node_server`, auto-detected in CI |\n| `api+spa`    | API server + single-page app frontend         | `node_server` + client build       |\n| `static`     | Static site generation — prerender everything | `static`                           |\n| `standalone` | API-only, single-file binary output           | `bun-server` + compiled binary     |\n| `edge`       | Optimized for edge runtimes                   | `cloudflare_worker`                |\n\nEach mode is a trimmed profile of the same framework; switching to a richer mode later is a matter of adding the directories the mode omits. See [Create a Project](/docs/getting-started/create-project) for a full comparison.\n\n## What You Can Build [#what-you-can-build]\n\nThe same conventions carry you from a static site to a high-scale platform. A useful roster of examples:\n\n| From                  | To                                                      | What you add                                               |\n| --------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |\n| Static marketing site | [Static site + blog](/docs/getting-started/first-model) | A read-only model, file-based pages, prerendering          |\n| CRUD app              | Classic todo-style app                                  | One `defineModel` derives the REST API, client, and Studio |\n| SaaS                  | Dashboard with auth + RBAC                              | `defineAuth`, policies, guards, Studio screens             |\n| Realtime              | Multi-tenant chat                                       | Tenancy config, events, channels, jobs                     |\n| API-only              | Backend for a mobile client                             | Controllers, OpenAPI, rate limits, API keys                |\n| AI ops                | Internal tool with MCP exposure                         | Kwiva Studio over models, MCP tools                        |\n| Platform              | Edge + ISR + worker split                               | Route rules, transactional outbox, deploy presets          |\n\nWhatever the shape, the stack is the same: models as the single source of truth, controllers for the API, pages for the UI, and one config model connecting them.\n\n## A First Tour of the CLI [#a-first-tour-of-the-cli]\n\nEverything you do with a Kwiva project goes through one `kwiva` binary (run through `bun run` in your project):\n\n| Command             | Purpose                                              |\n| ------------------- | ---------------------------------------------------- |\n| `kwiva dev`         | Development server with hot module replacement       |\n| `kwiva check`       | Format + lint + typecheck in one pass                |\n| `kwiva test`        | Run the test suite (unit, integration, API, and e2e) |\n| `kwiva build`       | Production build for the target runtime              |\n| `kwiva deploy`      | Build and deploy to a provider                       |\n| `kwiva console`     | REPL with the full app context loaded                |\n| `kwiva make:*`      | Generators — one command per construct type          |\n| `kwiva db:*`        | Database lifecycle — migrations, seeding, reset      |\n| `kwiva add <addon>` | Install and register a module, plugin, or theme      |\n| `kwiva upgrade`     | Codemod recipes + dependency bumps across releases   |\n\nYou'll use `kwiva make:model`, `kwiva db:migrate`, and `kwiva dev` heavily in the tutorials that follow. The CLI is described in full at [CLI](/docs/cli).\n\n## Start the Development Server [#start-the-development-server]\n\n```bash title=\"terminal\"\ncd my-app\nbun run dev\n```\n\nThe development server starts at `http://localhost:3000` and gives you:\n\n* **Native TypeScript execution** — Bun runs `.ts` files directly, no compile step between edit and reload\n* **Hot module replacement (HMR)** — pages, controllers, and middleware update in place\n* **Auto-discovery** — models, controllers, middleware, and pages in the conventional directories are picked up automatically\n* **Typed configuration** — your config folder and environment variables load and validate at boot\n* **Friendly errors** — missing environment variables, type errors, and runtime failures are surfaced with context instead of raw stack dumps\n\n> \\[!TIP]\n> Open `http://localhost:3000` right after scaffolding — the default fullstack project ships with a working home page backed by the whole pipeline. See [Development Server](/docs/getting-started/development-server) for what happens under the hood.\n\n## The First Five Minutes [#the-first-five-minutes]\n\nA fast first loop that exercises the whole stack:\n\n```bash title=\"terminal\"\nbun create kwiva my-app && cd my-app\nbun run dev                     # home page at localhost:3000\nkwiva make:model post           # model + migration + factory stub\nkwiva db:migrate                # apply it\nkwiva make:page posts.$id       # a typed page stub\n```\n\nFrom here you have a data model serving a page — with types flowing from model to database to API to UI. The rest of this guide deepens each step.\n\n## FAQ [#faq]\n\n<Accordions type=\"single\">\n  <Accordion title=\"Is Kwiva a library I add to an existing app?\">\n    No. The scaffold creates a complete project with its own configuration, directory conventions, and CLI. You build on the framework, not alongside it — there is no wiring step afterwards.\n  </Accordion>\n\n  <Accordion title=\"Which runtimes does Kwiva support?\">\n    Bun is the primary runtime. Node-compatible output is available through deployment presets, and the `edge` mode targets edge runtimes with a documented constraint set. Deploying to a target is a build-time choice.\n  </Accordion>\n\n  <Accordion title=\"Which project mode should I choose?\">\n    Start with the default `fullstack` mode. Choose `static` for a marketing site, `api+spa` when you want a separate client, `standalone` for a single binary, or `edge` for edge runtimes. Modes are trimmed profiles of the same layout — you can add the omitted directories later.\n  </Accordion>\n\n  <Accordion title=\"What does the scaffold actually include?\">\n    A working home page, `kwiva.config.ts`, the typed config folder, and conventional directories for models, controllers, middleware, pages, jobs, and events — plus the CLI wired up. The first model you define is served by a full pipeline, not a stub.\n  </Accordion>\n</Accordions>\n\n## What's Next [#whats-next]\n\nAfter installation, follow the getting-started sequence to build your first real feature:\n\n1. [Understand the project structure](/docs/getting-started/project-structure) — where every kind of file lives\n2. [Configure your application](/docs/getting-started/configuration) — typed config modules and env bindings\n3. [Create your first model](/docs/getting-started/first-model) — the single source of truth for your data\n4. [Create your first API](/docs/getting-started/first-api) — controllers, validation, and typed context\n5. [Create your first page](/docs/getting-started/first-page) — server-rendered UI with typed loaders\n6. [Deploy your first app](/docs/getting-started/first-deployment) — build once, deploy anywhere\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Getting a Kwiva application running is a two-step process: install the runtime, then scaffold a project. Kwiva runs on Bun as its primary runtime, which executes TypeScript natively — no compile step, fast startup, and a single runtime for both your server and your tools."
		},
		{
			"heading": "prerequisites",
			"content": "Requirement"
		},
		{
			"heading": "prerequisites",
			"content": "Version"
		},
		{
			"heading": "prerequisites",
			"content": "Notes"
		},
		{
			"heading": "prerequisites",
			"content": "**Bun**"
		},
		{
			"heading": "prerequisites",
			"content": "1.2 or later"
		},
		{
			"heading": "prerequisites",
			"content": "Primary runtime — required for the CLI, the dev server, and builds"
		},
		{
			"heading": "prerequisites",
			"content": "**Node.js**"
		},
		{
			"heading": "prerequisites",
			"content": "18+ (optional)"
		},
		{
			"heading": "prerequisites",
			"content": "For `node_server` compatibility presets and legacy integrations"
		},
		{
			"heading": "prerequisites",
			"content": "**Git**"
		},
		{
			"heading": "prerequisites",
			"content": "any (optional)"
		},
		{
			"heading": "prerequisites",
			"content": "For version control and addon installs from git"
		},
		{
			"heading": "prerequisites",
			"content": "Install or upgrade Bun:"
		},
		{
			"heading": "prerequisites",
			"content": "> \\[!NOTE]\n> Kwiva is *not* a library layered on top of an existing app. The scaffold creates a complete project with its own configuration, directory conventions, and CLI — you don't wire pieces together afterwards."
		},
		{
			"heading": "create-a-project",
			"content": "The fastest way to start a Kwiva project is a single scaffold command:"
		},
		{
			"heading": "create-a-project",
			"content": "This is equivalent to `kwiva new my-app`. It creates a new project in `my-app/` with the default **fullstack** mode — a complete application with SSR frontend pages, API routes, and everything configured with sensible defaults. The scaffold installs dependencies, generates `kwiva.config.ts`, and prepares empty directories for models, controllers, and pages."
		},
		{
			"heading": "project-modes",
			"content": "Choose a mode that matches how your application will run. The mode is set once at scaffold time and stays baked into the project's defaults."
		},
		{
			"heading": "project-modes",
			"content": "Mode"
		},
		{
			"heading": "project-modes",
			"content": "Description"
		},
		{
			"heading": "project-modes",
			"content": "Deploy default"
		},
		{
			"heading": "project-modes",
			"content": "`fullstack`"
		},
		{
			"heading": "project-modes",
			"content": "SSR pages + API routes (default)"
		},
		{
			"heading": "project-modes",
			"content": "`node_server`, auto-detected in CI"
		},
		{
			"heading": "project-modes",
			"content": "`api+spa`"
		},
		{
			"heading": "project-modes",
			"content": "API server + single-page app frontend"
		},
		{
			"heading": "project-modes",
			"content": "`node_server` + client build"
		},
		{
			"heading": "project-modes",
			"content": "`static`"
		},
		{
			"heading": "project-modes",
			"content": "Static site generation — prerender everything"
		},
		{
			"heading": "project-modes",
			"content": "`static`"
		},
		{
			"heading": "project-modes",
			"content": "`standalone`"
		},
		{
			"heading": "project-modes",
			"content": "API-only, single-file binary output"
		},
		{
			"heading": "project-modes",
			"content": "`bun-server` + compiled binary"
		},
		{
			"heading": "project-modes",
			"content": "`edge`"
		},
		{
			"heading": "project-modes",
			"content": "Optimized for edge runtimes"
		},
		{
			"heading": "project-modes",
			"content": "`cloudflare_worker`"
		},
		{
			"heading": "project-modes",
			"content": "Each mode is a trimmed profile of the same framework; switching to a richer mode later is a matter of adding the directories the mode omits. See Create a Project for a full comparison."
		},
		{
			"heading": "what-you-can-build",
			"content": "The same conventions carry you from a static site to a high-scale platform. A useful roster of examples:"
		},
		{
			"heading": "what-you-can-build",
			"content": "From"
		},
		{
			"heading": "what-you-can-build",
			"content": "To"
		},
		{
			"heading": "what-you-can-build",
			"content": "What you add"
		},
		{
			"heading": "what-you-can-build",
			"content": "Static marketing site"
		},
		{
			"heading": "what-you-can-build",
			"content": "Static site + blog"
		},
		{
			"heading": "what-you-can-build",
			"content": "A read-only model, file-based pages, prerendering"
		},
		{
			"heading": "what-you-can-build",
			"content": "CRUD app"
		},
		{
			"heading": "what-you-can-build",
			"content": "Classic todo-style app"
		},
		{
			"heading": "what-you-can-build",
			"content": "One `defineModel` derives the REST API, client, and Studio"
		},
		{
			"heading": "what-you-can-build",
			"content": "SaaS"
		},
		{
			"heading": "what-you-can-build",
			"content": "Dashboard with auth + RBAC"
		},
		{
			"heading": "what-you-can-build",
			"content": "`defineAuth`, policies, guards, Studio screens"
		},
		{
			"heading": "what-you-can-build",
			"content": "Realtime"
		},
		{
			"heading": "what-you-can-build",
			"content": "Multi-tenant chat"
		},
		{
			"heading": "what-you-can-build",
			"content": "Tenancy config, events, channels, jobs"
		},
		{
			"heading": "what-you-can-build",
			"content": "API-only"
		},
		{
			"heading": "what-you-can-build",
			"content": "Backend for a mobile client"
		},
		{
			"heading": "what-you-can-build",
			"content": "Controllers, OpenAPI, rate limits, API keys"
		},
		{
			"heading": "what-you-can-build",
			"content": "AI ops"
		},
		{
			"heading": "what-you-can-build",
			"content": "Internal tool with MCP exposure"
		},
		{
			"heading": "what-you-can-build",
			"content": "Kwiva Studio over models, MCP tools"
		},
		{
			"heading": "what-you-can-build",
			"content": "Platform"
		},
		{
			"heading": "what-you-can-build",
			"content": "Edge + ISR + worker split"
		},
		{
			"heading": "what-you-can-build",
			"content": "Route rules, transactional outbox, deploy presets"
		},
		{
			"heading": "what-you-can-build",
			"content": "Whatever the shape, the stack is the same: models as the single source of truth, controllers for the API, pages for the UI, and one config model connecting them."
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "Everything you do with a Kwiva project goes through one `kwiva` binary (run through `bun run` in your project):"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "Command"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "Purpose"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "`kwiva dev`"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "Development server with hot module replacement"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "`kwiva check`"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "Format + lint + typecheck in one pass"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "`kwiva test`"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "Run the test suite (unit, integration, API, and e2e)"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "`kwiva build`"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "Production build for the target runtime"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "`kwiva deploy`"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "Build and deploy to a provider"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "`kwiva console`"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "REPL with the full app context loaded"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "`kwiva make:*`"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "Generators — one command per construct type"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "`kwiva db:*`"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "Database lifecycle — migrations, seeding, reset"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "`kwiva add <addon>`"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "Install and register a module, plugin, or theme"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "`kwiva upgrade`"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "Codemod recipes + dependency bumps across releases"
		},
		{
			"heading": "a-first-tour-of-the-cli",
			"content": "You'll use `kwiva make:model`, `kwiva db:migrate`, and `kwiva dev` heavily in the tutorials that follow. The CLI is described in full at CLI."
		},
		{
			"heading": "start-the-development-server",
			"content": "The development server starts at `http://localhost:3000` and gives you:"
		},
		{
			"heading": "start-the-development-server",
			"content": "**Native TypeScript execution** — Bun runs `.ts` files directly, no compile step between edit and reload"
		},
		{
			"heading": "start-the-development-server",
			"content": "**Hot module replacement (HMR)** — pages, controllers, and middleware update in place"
		},
		{
			"heading": "start-the-development-server",
			"content": "**Auto-discovery** — models, controllers, middleware, and pages in the conventional directories are picked up automatically"
		},
		{
			"heading": "start-the-development-server",
			"content": "**Typed configuration** — your config folder and environment variables load and validate at boot"
		},
		{
			"heading": "start-the-development-server",
			"content": "**Friendly errors** — missing environment variables, type errors, and runtime failures are surfaced with context instead of raw stack dumps"
		},
		{
			"heading": "start-the-development-server",
			"content": "> \\[!TIP]\n> Open `http://localhost:3000` right after scaffolding — the default fullstack project ships with a working home page backed by the whole pipeline. See Development Server for what happens under the hood."
		},
		{
			"heading": "the-first-five-minutes",
			"content": "A fast first loop that exercises the whole stack:"
		},
		{
			"heading": "the-first-five-minutes",
			"content": "From here you have a data model serving a page — with types flowing from model to database to API to UI. The rest of this guide deepens each step."
		},
		{
			"heading": "faq",
			"content": "No. The scaffold creates a complete project with its own configuration, directory conventions, and CLI. You build on the framework, not alongside it — there is no wiring step afterwards."
		},
		{
			"heading": "faq",
			"content": "Bun is the primary runtime. Node-compatible output is available through deployment presets, and the `edge` mode targets edge runtimes with a documented constraint set. Deploying to a target is a build-time choice."
		},
		{
			"heading": "faq",
			"content": "Start with the default `fullstack` mode. Choose `static` for a marketing site, `api+spa` when you want a separate client, `standalone` for a single binary, or `edge` for edge runtimes. Modes are trimmed profiles of the same layout — you can add the omitted directories later."
		},
		{
			"heading": "faq",
			"content": "A working home page, `kwiva.config.ts`, the typed config folder, and conventional directories for models, controllers, middleware, pages, jobs, and events — plus the CLI wired up. The first model you define is served by a full pipeline, not a stub."
		},
		{
			"heading": "whats-next",
			"content": "After installation, follow the getting-started sequence to build your first real feature:"
		},
		{
			"heading": "whats-next",
			"content": "Understand the project structure — where every kind of file lives"
		},
		{
			"heading": "whats-next",
			"content": "Configure your application — typed config modules and env bindings"
		},
		{
			"heading": "whats-next",
			"content": "Create your first model — the single source of truth for your data"
		},
		{
			"heading": "whats-next",
			"content": "Create your first API — controllers, validation, and typed context"
		},
		{
			"heading": "whats-next",
			"content": "Create your first page — server-rendered UI with typed loaders"
		},
		{
			"heading": "whats-next",
			"content": "Deploy your first app — build once, deploy anywhere"
		}
	],
	"headings": [
		{
			"id": "prerequisites",
			"content": "Prerequisites"
		},
		{
			"id": "create-a-project",
			"content": "Create a Project"
		},
		{
			"id": "project-modes",
			"content": "Project Modes"
		},
		{
			"id": "what-you-can-build",
			"content": "What You Can Build"
		},
		{
			"id": "a-first-tour-of-the-cli",
			"content": "A First Tour of the CLI"
		},
		{
			"id": "start-the-development-server",
			"content": "Start the Development Server"
		},
		{
			"id": "the-first-five-minutes",
			"content": "The First Five Minutes"
		},
		{
			"id": "faq",
			"content": "FAQ"
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
		url: "#prerequisites",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Prerequisites" })
	},
	{
		depth: 2,
		url: "#create-a-project",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Create a Project" })
	},
	{
		depth: 3,
		url: "#project-modes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Project Modes" })
	},
	{
		depth: 2,
		url: "#what-you-can-build",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What You Can Build" })
	},
	{
		depth: 2,
		url: "#a-first-tour-of-the-cli",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "A First Tour of the CLI" })
	},
	{
		depth: 2,
		url: "#start-the-development-server",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Start the Development Server" })
	},
	{
		depth: 2,
		url: "#the-first-five-minutes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The First Five Minutes" })
	},
	{
		depth: 2,
		url: "#faq",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "FAQ" })
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
		em: "em",
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
	}, { Accordion, Accordions, Tab, Tabs } = _components;
	if (!Accordion) _missingMdxReference("Accordion", true);
	if (!Accordions) _missingMdxReference("Accordions", true);
	if (!Tab) _missingMdxReference("Tab", true);
	if (!Tabs) _missingMdxReference("Tabs", true);
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Getting a Kwiva application running is a two-step process: install the runtime, then scaffold a project. Kwiva runs on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "https://bun.sh",
				children: "Bun"
			}),
			" as its primary runtime, which executes TypeScript natively — no compile step, fast startup, and a single runtime for both your server and your tools."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "prerequisites",
			children: "Prerequisites"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Requirement" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Version" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Notes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Bun" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "1.2 or later" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Primary runtime — required for the CLI, the dev server, and builds" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Node.js" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "18+ (optional)" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"For ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }),
					" compatibility presets and legacy integrations"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Git" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "any (optional)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "For version control and addon installs from git" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Install or upgrade Bun:" }),
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
							children: "curl"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " -fsSL"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " https://bun.sh/install"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " |"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " bash"
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
						children: "bun"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: " --version"
					})]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nKwiva is ",
				(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "not" }),
				" a library layered on top of an existing app. The scaffold creates a complete project with its own configuration, directory conventions, and CLI — you don't wire pieces together afterwards."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "create-a-project",
			children: "Create a Project"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The fastest way to start a Kwiva project is a single scaffold command:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(Tabs, {
			items: ["Bun (recommended)", "Direct CLI"],
			children: [(0, import_jsx_runtime_react_server.jsx)(Tab, {
				value: "Bun (recommended)",
				children: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
					className: "shiki shiki-themes github-light github-dark",
					style: {
						"--shiki-light": "#24292e",
						"--shiki-dark": "#e1e4e8",
						"--shiki-light-bg": "#fff",
						"--shiki-dark-bg": "#24292e"
					},
					tabIndex: "0",
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
								children: " create"
							}),
							(0, import_jsx_runtime_react_server.jsx)(_components.span, {
								style: {
									"--shiki-light": "#032F62",
									"--shiki-dark": "#9ECBFF"
								},
								children: " kwiva"
							}),
							(0, import_jsx_runtime_react_server.jsx)(_components.span, {
								style: {
									"--shiki-light": "#032F62",
									"--shiki-dark": "#9ECBFF"
								},
								children: " my-app"
							})
						]
					}) })
				}) })
			}), (0, import_jsx_runtime_react_server.jsx)(Tab, {
				value: "Direct CLI",
				children: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
					className: "shiki shiki-themes github-light github-dark",
					style: {
						"--shiki-light": "#24292e",
						"--shiki-dark": "#e1e4e8",
						"--shiki-light-bg": "#fff",
						"--shiki-dark-bg": "#24292e"
					},
					tabIndex: "0",
					icon: "<svg viewBox=\"0 0 24 24\"><path d=\"m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z\" fill=\"currentColor\" /></svg>",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
						className: "line",
						children: [
							(0, import_jsx_runtime_react_server.jsx)(_components.span, {
								style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								},
								children: "bunx"
							}),
							(0, import_jsx_runtime_react_server.jsx)(_components.span, {
								style: {
									"--shiki-light": "#032F62",
									"--shiki-dark": "#9ECBFF"
								},
								children: " kwiva"
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
					}) })
				}) })
			})]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This is equivalent to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva new my-app" }),
			". It creates a new project in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "my-app/" }),
			" with the default ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "fullstack" }),
			" mode — a complete application with SSR frontend pages, API routes, and everything configured with sensible defaults. The scaffold installs dependencies, generates ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
			", and prepares empty directories for models, controllers, and pages."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "project-modes",
			children: "Project Modes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Choose a mode that matches how your application will run. The mode is set once at scaffold time and stays baked into the project's defaults." }),
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "# Specify a mode"
					})
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
							children: " create"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " kwiva"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Description" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Deploy default" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR pages + API routes (default)" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }), ", auto-detected in CI"] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API server + single-page app frontend" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }), " + client build"] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Static site generation — prerender everything" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API-only, single-file binary output" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun-server" }), " + compiled binary"] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Optimized for edge runtimes" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cloudflare_worker" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each mode is a trimmed profile of the same framework; switching to a richer mode later is a matter of adding the directories the mode omits. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/create-project",
				children: "Create a Project"
			}),
			" for a full comparison."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-you-can-build",
			children: "What You Can Build"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The same conventions carry you from a static site to a high-scale platform. A useful roster of examples:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "From" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "To" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What you add" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Static marketing site" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/getting-started/first-model",
					children: "Static site + blog"
				}) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A read-only model, file-based pages, prerendering" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "CRUD app" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Classic todo-style app" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"One ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
					" derives the REST API, client, and Studio"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SaaS" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Dashboard with auth + RBAC" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }), ", policies, guards, Studio screens"] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Realtime" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Multi-tenant chat" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Tenancy config, events, channels, jobs" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API-only" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Backend for a mobile client" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controllers, OpenAPI, rate limits, API keys" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "AI ops" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Internal tool with MCP exposure" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Kwiva Studio over models, MCP tools" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Platform" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge + ISR + worker split" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route rules, transactional outbox, deploy presets" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Whatever the shape, the stack is the same: models as the single source of truth, controllers for the API, pages for the UI, and one config model connecting them." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "a-first-tour-of-the-cli",
			children: "A First Tour of the CLI"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Everything you do with a Kwiva project goes through one ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva" }),
			" binary (run through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun run" }),
			" in your project):"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Development server with hot module replacement" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Format + lint + typecheck in one pass" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva test" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Run the test suite (unit, integration, API, and e2e)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Production build for the target runtime" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build and deploy to a provider" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva console" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "REPL with the full app context loaded" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:*" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generators — one command per construct type" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:*" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Database lifecycle — migrations, seeding, reset" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva add <addon>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Install and register a module, plugin, or theme" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva upgrade" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Codemod recipes + dependency bumps across releases" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"You'll use ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:model" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" heavily in the tutorials that follow. The CLI is described in full at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli",
				children: "CLI"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "start-the-development-server",
			children: "Start the Development Server"
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
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "cd"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " my-app"
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
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The development server starts at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http://localhost:3000" }),
			" and gives you:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Native TypeScript execution" }),
				" — Bun runs ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".ts" }),
				" files directly, no compile step between edit and reload"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Hot module replacement (HMR)" }), " — pages, controllers, and middleware update in place"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Auto-discovery" }), " — models, controllers, middleware, and pages in the conventional directories are picked up automatically"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Typed configuration" }), " — your config folder and environment variables load and validate at boot"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Friendly errors" }), " — missing environment variables, type errors, and runtime failures are surfaced with context instead of raw stack dumps"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!TIP]\nOpen ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "http://localhost:3000" }),
				" right after scaffolding — the default fullstack project ships with a working home page backed by the whole pipeline. See ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/getting-started/development-server",
					children: "Development Server"
				}),
				" for what happens under the hood."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-first-five-minutes",
			children: "The First Five Minutes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A fast first loop that exercises the whole stack:" }),
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
							children: "bun"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " create"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " kwiva"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " && "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "cd"
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
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "                     # home page at localhost:3000"
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
							children: " make:model"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " post"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "           # model + migration + factory stub"
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
							children: "                # apply it"
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
							children: " make:page"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " posts."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "$id       "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "# a typed page stub"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "From here you have a data model serving a page — with types flowing from model to database to API to UI. The rest of this guide deepens each step." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "faq",
			children: "FAQ"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(Accordions, {
			type: "single",
			children: [
				(0, import_jsx_runtime_react_server.jsx)(Accordion, {
					title: "Is Kwiva a library I add to an existing app?",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "No. The scaffold creates a complete project with its own configuration, directory conventions, and CLI. You build on the framework, not alongside it — there is no wiring step afterwards." })
				}),
				(0, import_jsx_runtime_react_server.jsx)(Accordion, {
					title: "Which runtimes does Kwiva support?",
					children: (0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
						"Bun is the primary runtime. Node-compatible output is available through deployment presets, and the ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }),
						" mode targets edge runtimes with a documented constraint set. Deploying to a target is a build-time choice."
					] })
				}),
				(0, import_jsx_runtime_react_server.jsx)(Accordion, {
					title: "Which project mode should I choose?",
					children: (0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
						"Start with the default ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }),
						" mode. Choose ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
						" for a marketing site, ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }),
						" when you want a separate client, ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }),
						" for a single binary, or ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }),
						" for edge runtimes. Modes are trimmed profiles of the same layout — you can add the omitted directories later."
					] })
				}),
				(0, import_jsx_runtime_react_server.jsx)(Accordion, {
					title: "What does the scaffold actually include?",
					children: (0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
						"A working home page, ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
						", the typed config folder, and conventional directories for models, controllers, middleware, pages, jobs, and events — plus the CLI wired up. The first model you define is served by a full pipeline, not a stub."
					] })
				})
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "After installation, follow the getting-started sequence to build your first real feature:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/project-structure",
				children: "Understand the project structure"
			}), " — where every kind of file lives"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/configuration",
				children: "Configure your application"
			}), " — typed config modules and env bindings"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-model",
				children: "Create your first model"
			}), " — the single source of truth for your data"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-api",
				children: "Create your first API"
			}), " — controllers, validation, and typed context"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-page",
				children: "Create your first page"
			}), " — server-rendered UI with typed loaders"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-deployment",
				children: "Deploy your first app"
			}), " — build once, deploy anywhere"] }),
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
function _missingMdxReference(id, component) {
	throw new Error("Expected " + (component ? "component" : "object") + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
}
//#endregion
export { _markdown, MDXContent as default, frontmatter, lastModified, structuredData, toc };
