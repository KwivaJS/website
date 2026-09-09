import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/core-concepts/auto-discovery.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Auto-Discovery",
	"description": "Kwiva scans the standard directory tree at boot and registers every defineX file it finds — adding a capability means adding a file, never editing a registry."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\n## How Auto-Discovery Works [#how-auto-discovery-works]\n\nKwiva registers application constructs by scanning conventional directories at boot time and registering every `defineX` file it finds. There is no central registry, no manual import list, and no config entry to add a new model, controller, or job. A capability exists because its file exists.\n\nThe scan is the framework's own mirror of [application composition](/docs/core-concepts/applications): the kernel discovers constructs, merges module contributions, and registers routes and workloads — in that order, at boot. Because definitions are plain data and functions (the [defineX convention](/docs/core-concepts/definex)), the scanner can read them statically and turn them into the route manifest and model IR without executing side effects.\n\n## The Discovery Map [#the-discovery-map]\n\n| Directory                       | Factory                                              | Registration                                           |\n| ------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ |\n| `src/app/models/*.ts`           | `defineModel`                                        | Model + generated routes                               |\n| `src/app/http/controllers/*.ts` | `defineController`                                   | HTTP routes                                            |\n| `src/app/http/middleware/*.ts`  | `defineMiddleware`                                   | Available middleware                                   |\n| `src/app/http/auth.ts`          | `defineAuth`                                         | Auth surface wired into the pipeline                   |\n| `src/app/services/*.ts`         | `defineService`                                      | Service container                                      |\n| `src/app/jobs/*.ts`             | `defineJob`                                          | Job registry                                           |\n| `src/app/events/*.ts`           | `defineEvent`                                        | Event registry                                         |\n| `src/app/policies/*.ts`         | `definePolicy`                                       | Policy registry                                        |\n| `src/app/tasks/*.ts`            | `defineTask`                                         | Task registry                                          |\n| `src/app/console/*.ts`          | `defineCommand`                                      | CLI commands                                           |\n| `src/app/mcp/*.ts`              | `defineMcpTool`                                      | MCP tools                                              |\n| `src/app/studio/*.tsx`          | `defineStudioScreen`                                 | Studio screens                                         |\n| `src/routes/*.ts`               | `defineServerRoute`                                  | Infrastructure routes + route rules                    |\n| `src/ui/pages/**/*.tsx`         | `definePage`                                         | Route tree                                             |\n| `src/database/**`               | `defineSeeder` / `defineFactory` / `defineMigration` | Database tooling                                       |\n| `src/config/*.ts`               | `defineConfig`                                       | Config values (load order-driven, not scan-registered) |\n\nTwo notes on scope:\n\n* `src/config/*.ts` modules are loaded by the config entry (`kwiva.config.ts > load`) rather than registered as constructs — but they still follow the one-file-per-domain convention.\n* Module and plugin contributions come from their own folders inside a package, referenced by [module](/docs/core-concepts/modules) entry globs rather than the app's directories.\n\n> \\[!NOTE]\n> The scanner operates on the standard tree only. A `defineModel` file placed anywhere else is not discovered — it is simply dead code, which the lint gate flags.\n\n## Adding a Construct [#adding-a-construct]\n\nTo add a new model, create the file:\n\n```ts title=\"src/app/models/comments.ts\"\n// src/app/models/comments.ts — auto-discovered at boot\nimport { defineModel } from '@kwiva/data'\n\nexport default defineModel('comments', (f) => ({\n  id: f.id(),\n  body: f.text(),\n  postId: f.uuid().indexed(),\n  authorId: f.uuid().indexed(),\n  post: f.belongsTo(() => Post),\n  author: f.belongsTo(() => User),\n}))\n```\n\nNo import anywhere, no registration, no config edit. At the next boot the model contributes its table definition, generated REST routes, client types, and Studio screens through the derivation pipeline (see [Model IR](/docs/advanced/model-ir) and [Type Inference](/docs/core-concepts/type-inference)).\n\nThe same rule holds for every construct. Creating `src/app/jobs/send-welcome.ts` makes a job; creating `src/app/http/controllers/reports.ts` adds an API surface.\n\n## What Registration Produces [#what-registration-produces]\n\n\"Registering\" is not symbolic — each construct type produces a concrete, observable result the moment the kernel composes:\n\n| Construct    | Registration result                                                           |\n| ------------ | ----------------------------------------------------------------------------- |\n| Model        | Table definition, generated REST routes, client types, Studio screens         |\n| Controller   | Routes mounted under its prefix, namespaced on the typed client               |\n| Middleware   | A named pipeline stage available to the stack and guards                      |\n| Service      | An injectable entry in the service container                                  |\n| Job / Event  | An entry in the job and event registries                                      |\n| Task         | A schedulable task for cron or manual runs                                    |\n| Policy       | A rule in the permission namespace                                            |\n| Command      | A CLI command under its signature                                             |\n| Page         | A route in the frontend route tree                                            |\n| Server route | Infrastructure handling (redirects, caching rules, proxies) for path patterns |\n\nBecause definitions are plain data and functions, registration is side-effect free: the scanner reads the definition statically and the kernel mounts whatever the definition declares. Nothing executes at scan time, which keeps discovery deterministic and inspectable.\n\n## Registration Conventions [#registration-conventions]\n\nDiscovery works because files follow a small set of conventions:\n\n1. **One construct per file** — a file declares exactly one `defineX` construct (with the exception of grouped server-route files, which may export an array of rule objects).\n2. **Default export** — the `defineX` definition is the module's default export, so the scanner picks up the typed value directly.\n3. **Lowercase names** — filenames are lowercase and kebab-case (or follow the per-construct singular/plural rules), which keeps URLs, client methods, and import paths predictable. When a discovered file exports named values, those exports are PascalCase; the construct itself remains the default export.\n4. **Correct placement** — the directory is the declaration of what the file is; placement determines registration, so moving a file changes what it registers.\n5. **Explicit override possible** — for full control, the bootstrap file can pass discovered construct groups to `defineApp` explicitly, replacing scan-based registration for that group.\n\nThese conventions are enforced, not suggested: the lint gate rejects constructs registered from the wrong directory or by signal other than the placement and export shape, so a file cannot quietly half-register.\n\n## Discovery Depth and Timing [#discovery-depth-and-timing]\n\n* Discovery is **boot-time**: the scan runs every time the kernel composes, so new files apply on restart. In development, the dev server watches the tree and re-scans on change.\n* Discovery is **shallow for files, recursive for pages**: most directories scan one level of `*.ts` files, while pages live in a recursive tree (`src/ui/pages/**/*.tsx`) because page files encode route paths.\n* Discovery is **static**: a file that is not present when the scan runs is not registered, and files outside the standard directories are ignored.\n\n## The CLI Connection [#the-cli-connection]\n\nBecause placement and naming are enforced conventions, generators produce discoverable files by construction. `kwiva make:model post` writes `src/app/models/posts.ts`, `kwiva make:controller post` writes `src/app/http/controllers/posts.ts`, and so on. The generator refuses names that violate naming rules, so generated code is immediately discoverable. See [Generators](/docs/cli/generators).\n\n## What's Next [#whats-next]\n\n* [The defineX Convention](/docs/core-concepts/definex) — the grammar behind every discovered file\n* [Applications](/docs/core-concepts/applications) — how the kernel uses discovery during boot\n* [Modules](/docs/core-concepts/modules) — how feature packages contribute outside the app tree\n* [CLI Generators](/docs/cli/generators) — files that are discoverable by construction\n* [Project Structure](/docs/getting-started/project-structure) — the complete standard tree\n";
var structuredData = {
	"contents": [
		{
			"heading": "how-auto-discovery-works",
			"content": "Kwiva registers application constructs by scanning conventional directories at boot time and registering every `defineX` file it finds. There is no central registry, no manual import list, and no config entry to add a new model, controller, or job. A capability exists because its file exists."
		},
		{
			"heading": "how-auto-discovery-works",
			"content": "The scan is the framework's own mirror of application composition: the kernel discovers constructs, merges module contributions, and registers routes and workloads — in that order, at boot. Because definitions are plain data and functions (the defineX convention), the scanner can read them statically and turn them into the route manifest and model IR without executing side effects."
		},
		{
			"heading": "the-discovery-map",
			"content": "Directory"
		},
		{
			"heading": "the-discovery-map",
			"content": "Factory"
		},
		{
			"heading": "the-discovery-map",
			"content": "Registration"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/app/models/*.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineModel`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Model + generated routes"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/app/http/controllers/*.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineController`"
		},
		{
			"heading": "the-discovery-map",
			"content": "HTTP routes"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/app/http/middleware/*.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineMiddleware`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Available middleware"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/app/http/auth.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineAuth`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Auth surface wired into the pipeline"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/app/services/*.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineService`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Service container"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/app/jobs/*.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineJob`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Job registry"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/app/events/*.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineEvent`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Event registry"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/app/policies/*.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`definePolicy`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Policy registry"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/app/tasks/*.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineTask`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Task registry"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/app/console/*.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineCommand`"
		},
		{
			"heading": "the-discovery-map",
			"content": "CLI commands"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/app/mcp/*.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineMcpTool`"
		},
		{
			"heading": "the-discovery-map",
			"content": "MCP tools"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/app/studio/*.tsx`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineStudioScreen`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Studio screens"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/routes/*.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineServerRoute`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Infrastructure routes + route rules"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/ui/pages/**/*.tsx`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`definePage`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Route tree"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/database/**`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineSeeder` / `defineFactory` / `defineMigration`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Database tooling"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/config/*.ts`"
		},
		{
			"heading": "the-discovery-map",
			"content": "`defineConfig`"
		},
		{
			"heading": "the-discovery-map",
			"content": "Config values (load order-driven, not scan-registered)"
		},
		{
			"heading": "the-discovery-map",
			"content": "Two notes on scope:"
		},
		{
			"heading": "the-discovery-map",
			"content": "`src/config/*.ts` modules are loaded by the config entry (`kwiva.config.ts > load`) rather than registered as constructs — but they still follow the one-file-per-domain convention."
		},
		{
			"heading": "the-discovery-map",
			"content": "Module and plugin contributions come from their own folders inside a package, referenced by module entry globs rather than the app's directories."
		},
		{
			"heading": "the-discovery-map",
			"content": "> \\[!NOTE]\n> The scanner operates on the standard tree only. A `defineModel` file placed anywhere else is not discovered — it is simply dead code, which the lint gate flags."
		},
		{
			"heading": "adding-a-construct",
			"content": "To add a new model, create the file:"
		},
		{
			"heading": "adding-a-construct",
			"content": "No import anywhere, no registration, no config edit. At the next boot the model contributes its table definition, generated REST routes, client types, and Studio screens through the derivation pipeline (see Model IR and Type Inference)."
		},
		{
			"heading": "adding-a-construct",
			"content": "The same rule holds for every construct. Creating `src/app/jobs/send-welcome.ts` makes a job; creating `src/app/http/controllers/reports.ts` adds an API surface."
		},
		{
			"heading": "what-registration-produces",
			"content": "\"Registering\" is not symbolic — each construct type produces a concrete, observable result the moment the kernel composes:"
		},
		{
			"heading": "what-registration-produces",
			"content": "Construct"
		},
		{
			"heading": "what-registration-produces",
			"content": "Registration result"
		},
		{
			"heading": "what-registration-produces",
			"content": "Model"
		},
		{
			"heading": "what-registration-produces",
			"content": "Table definition, generated REST routes, client types, Studio screens"
		},
		{
			"heading": "what-registration-produces",
			"content": "Controller"
		},
		{
			"heading": "what-registration-produces",
			"content": "Routes mounted under its prefix, namespaced on the typed client"
		},
		{
			"heading": "what-registration-produces",
			"content": "Middleware"
		},
		{
			"heading": "what-registration-produces",
			"content": "A named pipeline stage available to the stack and guards"
		},
		{
			"heading": "what-registration-produces",
			"content": "Service"
		},
		{
			"heading": "what-registration-produces",
			"content": "An injectable entry in the service container"
		},
		{
			"heading": "what-registration-produces",
			"content": "Job / Event"
		},
		{
			"heading": "what-registration-produces",
			"content": "An entry in the job and event registries"
		},
		{
			"heading": "what-registration-produces",
			"content": "Task"
		},
		{
			"heading": "what-registration-produces",
			"content": "A schedulable task for cron or manual runs"
		},
		{
			"heading": "what-registration-produces",
			"content": "Policy"
		},
		{
			"heading": "what-registration-produces",
			"content": "A rule in the permission namespace"
		},
		{
			"heading": "what-registration-produces",
			"content": "Command"
		},
		{
			"heading": "what-registration-produces",
			"content": "A CLI command under its signature"
		},
		{
			"heading": "what-registration-produces",
			"content": "Page"
		},
		{
			"heading": "what-registration-produces",
			"content": "A route in the frontend route tree"
		},
		{
			"heading": "what-registration-produces",
			"content": "Server route"
		},
		{
			"heading": "what-registration-produces",
			"content": "Infrastructure handling (redirects, caching rules, proxies) for path patterns"
		},
		{
			"heading": "what-registration-produces",
			"content": "Because definitions are plain data and functions, registration is side-effect free: the scanner reads the definition statically and the kernel mounts whatever the definition declares. Nothing executes at scan time, which keeps discovery deterministic and inspectable."
		},
		{
			"heading": "registration-conventions",
			"content": "Discovery works because files follow a small set of conventions:"
		},
		{
			"heading": "registration-conventions",
			"content": "**One construct per file** — a file declares exactly one `defineX` construct (with the exception of grouped server-route files, which may export an array of rule objects)."
		},
		{
			"heading": "registration-conventions",
			"content": "**Default export** — the `defineX` definition is the module's default export, so the scanner picks up the typed value directly."
		},
		{
			"heading": "registration-conventions",
			"content": "**Lowercase names** — filenames are lowercase and kebab-case (or follow the per-construct singular/plural rules), which keeps URLs, client methods, and import paths predictable. When a discovered file exports named values, those exports are PascalCase; the construct itself remains the default export."
		},
		{
			"heading": "registration-conventions",
			"content": "**Correct placement** — the directory is the declaration of what the file is; placement determines registration, so moving a file changes what it registers."
		},
		{
			"heading": "registration-conventions",
			"content": "**Explicit override possible** — for full control, the bootstrap file can pass discovered construct groups to `defineApp` explicitly, replacing scan-based registration for that group."
		},
		{
			"heading": "registration-conventions",
			"content": "These conventions are enforced, not suggested: the lint gate rejects constructs registered from the wrong directory or by signal other than the placement and export shape, so a file cannot quietly half-register."
		},
		{
			"heading": "discovery-depth-and-timing",
			"content": "Discovery is **boot-time**: the scan runs every time the kernel composes, so new files apply on restart. In development, the dev server watches the tree and re-scans on change."
		},
		{
			"heading": "discovery-depth-and-timing",
			"content": "Discovery is **shallow for files, recursive for pages**: most directories scan one level of `*.ts` files, while pages live in a recursive tree (`src/ui/pages/**/*.tsx`) because page files encode route paths."
		},
		{
			"heading": "discovery-depth-and-timing",
			"content": "Discovery is **static**: a file that is not present when the scan runs is not registered, and files outside the standard directories are ignored."
		},
		{
			"heading": "the-cli-connection",
			"content": "Because placement and naming are enforced conventions, generators produce discoverable files by construction. `kwiva make:model post` writes `src/app/models/posts.ts`, `kwiva make:controller post` writes `src/app/http/controllers/posts.ts`, and so on. The generator refuses names that violate naming rules, so generated code is immediately discoverable. See Generators."
		},
		{
			"heading": "whats-next",
			"content": "The defineX Convention — the grammar behind every discovered file"
		},
		{
			"heading": "whats-next",
			"content": "Applications — how the kernel uses discovery during boot"
		},
		{
			"heading": "whats-next",
			"content": "Modules — how feature packages contribute outside the app tree"
		},
		{
			"heading": "whats-next",
			"content": "CLI Generators — files that are discoverable by construction"
		},
		{
			"heading": "whats-next",
			"content": "Project Structure — the complete standard tree"
		}
	],
	"headings": [
		{
			"id": "how-auto-discovery-works",
			"content": "How Auto-Discovery Works"
		},
		{
			"id": "the-discovery-map",
			"content": "The Discovery Map"
		},
		{
			"id": "adding-a-construct",
			"content": "Adding a Construct"
		},
		{
			"id": "what-registration-produces",
			"content": "What Registration Produces"
		},
		{
			"id": "registration-conventions",
			"content": "Registration Conventions"
		},
		{
			"id": "discovery-depth-and-timing",
			"content": "Discovery Depth and Timing"
		},
		{
			"id": "the-cli-connection",
			"content": "The CLI Connection"
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
		url: "#how-auto-discovery-works",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How Auto-Discovery Works" })
	},
	{
		depth: 2,
		url: "#the-discovery-map",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Discovery Map" })
	},
	{
		depth: 2,
		url: "#adding-a-construct",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Adding a Construct" })
	},
	{
		depth: 2,
		url: "#what-registration-produces",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Registration Produces" })
	},
	{
		depth: 2,
		url: "#registration-conventions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Registration Conventions" })
	},
	{
		depth: 2,
		url: "#discovery-depth-and-timing",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Discovery Depth and Timing" })
	},
	{
		depth: 2,
		url: "#the-cli-connection",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The CLI Connection" })
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
			id: "how-auto-discovery-works",
			children: "How Auto-Discovery Works"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva registers application constructs by scanning conventional directories at boot time and registering every ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" file it finds. There is no central registry, no manual import list, and no config entry to add a new model, controller, or job. A capability exists because its file exists."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The scan is the framework's own mirror of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "application composition"
			}),
			": the kernel discovers constructs, merges module contributions, and registers routes and workloads — in that order, at boot. Because definitions are plain data and functions (the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "defineX convention"
			}),
			"), the scanner can read them statically and turn them into the route manifest and model IR without executing side effects."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-discovery-map",
			children: "The Discovery Map"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Directory" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Factory" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Registration" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model + generated routes" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/controllers/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "HTTP routes" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/middleware/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMiddleware" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Available middleware" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/auth.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Auth surface wired into the pipeline" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/services/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineService" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Service container" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Job registry" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/events/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Event registry" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/policies/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Policy registry" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/tasks/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Task registry" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/console/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineCommand" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "CLI commands" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/mcp/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMcpTool" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP tools" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/studio/*.tsx" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Studio screens" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/routes/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineServerRoute" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Infrastructure routes + route rules" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/**/*.tsx" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Route tree" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/database/**" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineSeeder" }),
					" / ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineFactory" }),
					" / ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMigration" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Database tooling" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Config values (load order-driven, not scan-registered)" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two notes on scope:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/*.ts" }),
				" modules are loaded by the config entry (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts > load" }),
				") rather than registered as constructs — but they still follow the one-file-per-domain convention."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Module and plugin contributions come from their own folders inside a package, referenced by ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/modules",
					children: "module"
				}),
				" entry globs rather than the app's directories."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nThe scanner operates on the standard tree only. A ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				" file placed anywhere else is not discovered — it is simply dead code, which the lint gate flags."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "adding-a-construct",
			children: "Adding a Construct"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "To add a new model, create the file:" }),
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
			title: "src/app/models/comments.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/models/comments.ts — auto-discovered at boot"
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
							children: " { defineModel } "
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
							children: " '@kwiva/data'"
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
							children: "'comments'"
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
							children: " ({"
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
							children: "  id: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "id"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),"
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
							children: "  body: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "text"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),"
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
							children: "  postId: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "uuid"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "indexed"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),"
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
							children: "  authorId: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "uuid"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "indexed"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),"
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
							children: "  post: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "belongsTo"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(() "
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
							children: " Post),"
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
							children: "  author: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "belongsTo"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(() "
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
							children: " User),"
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
						children: "}))"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"No import anywhere, no registration, no config edit. At the next boot the model contributes its table definition, generated REST routes, client types, and Studio screens through the derivation pipeline (see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/advanced/model-ir",
				children: "Model IR"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/type-inference",
				children: "Type Inference"
			}),
			")."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same rule holds for every construct. Creating ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/send-welcome.ts" }),
			" makes a job; creating ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/controllers/reports.ts" }),
			" adds an API surface."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-registration-produces",
			children: "What Registration Produces"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "\"Registering\" is not symbolic — each construct type produces a concrete, observable result the moment the kernel composes:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Construct" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Registration result" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Table definition, generated REST routes, client types, Studio screens" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controller" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Routes mounted under its prefix, namespaced on the typed client" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Middleware" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A named pipeline stage available to the stack and guards" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Service" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "An injectable entry in the service container" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Job / Event" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "An entry in the job and event registries" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Task" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A schedulable task for cron or manual runs" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Policy" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A rule in the permission namespace" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A CLI command under its signature" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Page" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A route in the frontend route tree" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server route" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Infrastructure handling (redirects, caching rules, proxies) for path patterns" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because definitions are plain data and functions, registration is side-effect free: the scanner reads the definition statically and the kernel mounts whatever the definition declares. Nothing executes at scan time, which keeps discovery deterministic and inspectable." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "registration-conventions",
			children: "Registration Conventions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Discovery works because files follow a small set of conventions:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "One construct per file" }),
				" — a file declares exactly one ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" construct (with the exception of grouped server-route files, which may export an array of rule objects)."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Default export" }),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" definition is the module's default export, so the scanner picks up the typed value directly."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Lowercase names" }), " — filenames are lowercase and kebab-case (or follow the per-construct singular/plural rules), which keeps URLs, client methods, and import paths predictable. When a discovered file exports named values, those exports are PascalCase; the construct itself remains the default export."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Correct placement" }), " — the directory is the declaration of what the file is; placement determines registration, so moving a file changes what it registers."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Explicit override possible" }),
				" — for full control, the bootstrap file can pass discovered construct groups to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
				" explicitly, replacing scan-based registration for that group."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "These conventions are enforced, not suggested: the lint gate rejects constructs registered from the wrong directory or by signal other than the placement and export shape, so a file cannot quietly half-register." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "discovery-depth-and-timing",
			children: "Discovery Depth and Timing"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Discovery is ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "boot-time" }),
				": the scan runs every time the kernel composes, so new files apply on restart. In development, the dev server watches the tree and re-scans on change."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Discovery is ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "shallow for files, recursive for pages" }),
				": most directories scan one level of ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "*.ts" }),
				" files, while pages live in a recursive tree (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/**/*.tsx" }),
				") because page files encode route paths."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Discovery is ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "static" }),
				": a file that is not present when the scan runs is not registered, and files outside the standard directories are ignored."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-cli-connection",
			children: "The CLI Connection"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because placement and naming are enforced conventions, generators produce discoverable files by construction. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:model post" }),
			" writes ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/posts.ts" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:controller post" }),
			" writes ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/controllers/posts.ts" }),
			", and so on. The generator refuses names that violate naming rules, so generated code is immediately discoverable. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/generators",
				children: "Generators"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}), " — the grammar behind every discovered file"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Applications"
			}), " — how the kernel uses discovery during boot"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/modules",
				children: "Modules"
			}), " — how feature packages contribute outside the app tree"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/generators",
				children: "CLI Generators"
			}), " — files that are discoverable by construction"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/project-structure",
				children: "Project Structure"
			}), " — the complete standard tree"] }),
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
