import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/modules-plugins/defining-modules.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Defining Modules",
	"description": "Define reusable capability packages with defineModule — models, controllers, pages, jobs, migrations, config, and channel policies, namespaced and versioned so they drop into any app."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nA module is a reusable capability package: a folder of contributions — models, controllers, pages, jobs, events, tasks, policies, migrations, config defaults, and channel policies — declared through the `defineModule` factory and installed into any Kwiva application as a unit. This page is the complete reference for authoring one.\n\n## The `defineModule` Factory [#the-definemodule-factory]\n\nA module is defined with the same declarative convention as everything else in Kwiva — one factory, plain serializable options, zero classes and zero decorators. The signature follows the `defineX` grammar you already know.\n\n```ts title=\"modules/chat/index.ts\"\n// modules/chat/index.ts\nimport { defineModule } from '@kwiva/core'\n\nexport default defineModule({\n  name: '@acme/chat',\n  version: '1.2.0',\n\n  // contribution points — all optional\n  models:      () => import.meta.glob('./models/*.ts'),      // rooms, messages\n  controllers: () => import.meta.glob('./controllers/*.ts'), // chat\n  middleware:  () => import.meta.glob('./middleware/*.ts'),\n  pages:       () => import.meta.glob('./pages/**/*.tsx'),   // ui additions\n  jobs:        () => import.meta.glob('./jobs/*.ts'),\n  events:      () => import.meta.glob('./events/*.ts'),\n  tasks:       () => import.meta.glob('./tasks/*.ts'),\n  policies:    () => import.meta.glob('./policies/*.ts'),\n  migrations:  './migrations',                                // applied with app migrations\n  config:      { chat: { maxMessageLength: 2000 } },          // namespaced defaults\n  channels:    { 'chat.{roomId}': { policy: 'chat.member' } },\n\n  // module lifecycle\n  boot: async ({ config, models, providers }) => { /* ... */ },\n  shutdown: async () => { /* ... */ },\n\n  // peer requirements\n  requires: { '@kwiva/core': '^1', '@kwiva/auth': '^1' },\n})\n```\n\n`name` and `version` identify the module; everything else is optional. A module that ships only pages is as valid as one that ships the full vertical stack. Every contribution lives behind a lazy glob so the framework only loads what the app actually uses.\n\n## Contribution Points [#contribution-points]\n\n| Contribution  | Shape                    | What it adds to the app                                      |\n| ------------- | ------------------------ | ------------------------------------------------------------ |\n| `models`      | Glob of model files      | Database tables, generated routes, types, Studio screens     |\n| `controllers` | Glob of controller files | HTTP routes under the module's scope                         |\n| `middleware`  | Glob of middleware files | Pipeline stages available to the app                         |\n| `pages`       | Glob of page files       | UI additions registered under the module's route scope       |\n| `jobs`        | Glob of job files        | Queueable background work                                    |\n| `events`      | Glob of event files      | Emitted and consumed events                                  |\n| `tasks`       | Glob of task files       | Scheduled background work                                    |\n| `policies`    | Glob of policy files     | Authorization rules in the module's permission namespace     |\n| `migrations`  | Directory                | Schema steps applied with the app's migrations               |\n| `config`      | Object                   | Namespaced defaults, overridable by the app                  |\n| `channels`    | Map of channel patterns  | Realtime channels plus their policies                        |\n| `boot`        | Async function           | Module startup — config, models, and providers are passed in |\n| `shutdown`    | Async function           | Module teardown, run during app shutdown                     |\n| `requires`    | Version ranges           | Declared peer requirements for `@kwiva/*` dependencies       |\n\n## How Contributions Resolve [#how-contributions-resolve]\n\nEach contribution merges into the application's existing scan:\n\n* **Models** are registered under the module's namespace. A chat module contributing `messages` registers as `chat.messages`, gets the full generated-route surface, and appears in the typed client, OpenAPI spec, Studio, and MCP tools under that name.\n* **Controllers** mount their routes under the module's declared prefix, namespaced so they cannot collide with application routes.\n* **Pages** are mounted under the module's route scope, so a UI addon keeps its URLs to itself.\n* **Config** defaults register under the module's namespace and participate in the standard precedence: defaults → `src/config` values → inline `defineX` options, inline wins.\n* **Migrations** are applied with the app's migrations — ordered **before** application migrations and versioned by module version.\n\nBecause discovery is glob-based, adding a file to a module folder is adding a capability. No registry edits exist inside a module.\n\n## Model Contributions in Depth [#model-contributions-in-depth]\n\nA module model is a normal `defineModel` file. It derives everything an application model derives — table, generated REST routes, types, and Studio screens — but namespaced to the module:\n\n```ts title=\"modules/chat/models/messages.ts\"\n// modules/chat/models/messages.ts\nimport { defineModel } from '@kwiva/data'\n\nexport default defineModel('messages', (f) => ({\n  id: f.id(),\n  roomId: f.foreignKey('rooms'),\n  body: f.text(),\n  authorId: f.foreignKey('users'),\n}), {\n  timestamps: true,\n  permission: 'chat',\n})\n```\n\nThe namespacing contract is what keeps two modules from colliding: the same file, in two different module folders, produces two disjoint resource names (`chat.messages` and `forum.messages`) that coexist in the same app.\n\n> \\[!TIP]\n> Because module config defaults register under their own namespace, an app can tighten a module's behavior without forking it. Overriding `chat.maxMessageLength` in `src/config/modules.ts` is a deep merge — the app wins, the module keeps shipping updates.\n\n## Module Scope and Boundaries [#module-scope-and-boundaries]\n\nModules follow hard contracts so that any number of them can coexist:\n\n* **Namespacing** — model and resource names are prefixed by the module scope. A chat module's models become `chat.rooms` and `chat.messages`, never bare `rooms` and `messages`.\n* **Route prefixing** — page and route paths mount under the module's declared prefix. No two modules can claim the same namespace.\n* **Config namespacing** — module defaults register under their namespaces (`chat.maxMessageLength`) and can be overridden in the app's `src/config/modules.ts` via a deep merge where the app wins — the standard precedence (defaults → `src/config` → inline, inline wins).\n* **Policy namespacing** — module policies live in the module's permission namespace (`chat.member`, not `member`).\n* **Isolation** — modules never import each other's internals. They interoperate only through published contribution points, so upgrade paths stay clean.\n* **Migration ordering** — module migrations are ordered **before** application migrations and versioned by module version, so a module can evolve independently of the app.\n\nThis port discipline is enforced mechanically: module boundary rules are part of the default lint surface, so a module that reaches into another module's internals fails the gate rather than shipping.\n\n## Co-located Assets [#co-located-assets]\n\nA module is a folder. Everything it contributes is referenced through lazy globs relative to the module entry, so the module's models, controllers, pages, and jobs stay co-located:\n\n```text title=\"co-located-assets.txt\"\nmodules/chat/\n├─ index.ts                  # defineModule entry\n├─ models/\n│  ├─ rooms.ts\n│  └─ messages.ts\n├─ controllers/chat.ts\n├─ middleware/chat-auth.ts\n├─ policies/chat.ts\n├─ pages/\n│  └─ index.tsx\n├─ jobs/send-message-notification.ts\n├─ events/message-posted.ts\n├─ tasks/archive-old-rooms.ts\n└─ migrations/\n   ├─ 0001_create_rooms.ts\n   └─ 0002_create_messages.ts\n```\n\nBecause contributions are discovered by glob, adding a file to a module folder is adding a capability — no registry edits inside the module. The standard `kwiva make:*` generators can scaffold module folders, and file placement inside a module follows the same lowercase-kebab naming rules as application files.\n\n## Lifecycle and Peer Requirements [#lifecycle-and-peer-requirements]\n\n* `boot` runs when the module joins the app, with typed access to config, models, and providers. This is where a module prepares its runtime — scheduling recurring work, seeding defaults, or warming a provider.\n* `shutdown` runs during app teardown, inverting boot order with the rest of the kernel. Providers stop, the queue drains, the engine stops — a module's teardown slots into that sequence.\n* `requires` declares compatible versions of `@kwiva/*` packages; addon tooling respects these ranges when resolving upgrades. Resolution rejects incompatible combinations rather than running them, and `kwiva addons update` will not jump outside a declared range.\n\n```ts title=\"lifecycle-and-peer-requirements.ts\"\nexport default defineModule({\n  name: '@acme/billing',\n  version: '0.4.1',\n  requires: { '@kwiva/core': '^1', '@kwiva/notifications': '^1' },\n  boot: async ({ config, jobs }) => {\n    if (config.billing.dueReminders) {\n      jobs.schedule('billing.send-reminders', '0 9 * * *')\n    }\n  },\n})\n```\n\n## Writing a Module Step by Step [#writing-a-module-step-by-step]\n\n1. **Scaffold** — `kwiva make:module analytics` creates `modules/analytics/` with slots for each contribution type.\n2. **Declare the entry** — fill in `name`, `version`, and `requires` on the `defineModule` call.\n3. **Add contributions** — drop model, controller, page, and job files into their folders; the globs pick them up.\n4. **Set config defaults** — namespaced defaults under `config`, documented so apps know what they can override.\n5. **Test against a real app** — register the module in `kwiva.config.ts` locally and exercise the routes, policies, and jobs it contributes.\n6. **Package** — `kwiva module:build` produces the distribution; publish to the registry tagged with the `kwiva-addon` keyword.\n\n## Publishing a Module [#publishing-a-module]\n\n```bash title=\"terminal\"\nkwiva module:build\n```\n\n`kwiva module:build` packages the module: a package with the contribution manifest plus a compiled distribution (bundled output plus isolated type declarations). The registry contract is a published package that\n\n* exports the `defineModule` result as its default export,\n* is tagged with the `kwiva-addon` keyword in the package registry, and\n* declares its `requires` ranges so apps resolve compatible versions.\n\nDiscoverability comes from the curated addon index behind `kwiva addons search`. See [Addons & Distribution](/docs/modules-plugins/addons) for the full workflow, and [CLI Generators](/docs/cli/generators) for `make:module` and the module build surface.\n\n## What's Next [#whats-next]\n\n* [Addons & Distribution](/docs/modules-plugins/addons) — publish, install, and version modules\n* [Application Composition](/docs/modules-plugins/composition) — see modules join the kernel\n* [Modules & Plugins](/docs/modules-plugins) — the composition model at a glance\n* [The defineX Convention](/docs/core-concepts/definex) — one grammar across every factory\n* [Data Models](/docs/data/models) — what a module's `models` contribution derives\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "A module is a reusable capability package: a folder of contributions — models, controllers, pages, jobs, events, tasks, policies, migrations, config defaults, and channel policies — declared through the `defineModule` factory and installed into any Kwiva application as a unit. This page is the complete reference for authoring one."
		},
		{
			"heading": "the-definemodule-factory",
			"content": "A module is defined with the same declarative convention as everything else in Kwiva — one factory, plain serializable options, zero classes and zero decorators. The signature follows the `defineX` grammar you already know."
		},
		{
			"heading": "the-definemodule-factory",
			"content": "`name` and `version` identify the module; everything else is optional. A module that ships only pages is as valid as one that ships the full vertical stack. Every contribution lives behind a lazy glob so the framework only loads what the app actually uses."
		},
		{
			"heading": "contribution-points",
			"content": "Contribution"
		},
		{
			"heading": "contribution-points",
			"content": "Shape"
		},
		{
			"heading": "contribution-points",
			"content": "What it adds to the app"
		},
		{
			"heading": "contribution-points",
			"content": "`models`"
		},
		{
			"heading": "contribution-points",
			"content": "Glob of model files"
		},
		{
			"heading": "contribution-points",
			"content": "Database tables, generated routes, types, Studio screens"
		},
		{
			"heading": "contribution-points",
			"content": "`controllers`"
		},
		{
			"heading": "contribution-points",
			"content": "Glob of controller files"
		},
		{
			"heading": "contribution-points",
			"content": "HTTP routes under the module's scope"
		},
		{
			"heading": "contribution-points",
			"content": "`middleware`"
		},
		{
			"heading": "contribution-points",
			"content": "Glob of middleware files"
		},
		{
			"heading": "contribution-points",
			"content": "Pipeline stages available to the app"
		},
		{
			"heading": "contribution-points",
			"content": "`pages`"
		},
		{
			"heading": "contribution-points",
			"content": "Glob of page files"
		},
		{
			"heading": "contribution-points",
			"content": "UI additions registered under the module's route scope"
		},
		{
			"heading": "contribution-points",
			"content": "`jobs`"
		},
		{
			"heading": "contribution-points",
			"content": "Glob of job files"
		},
		{
			"heading": "contribution-points",
			"content": "Queueable background work"
		},
		{
			"heading": "contribution-points",
			"content": "`events`"
		},
		{
			"heading": "contribution-points",
			"content": "Glob of event files"
		},
		{
			"heading": "contribution-points",
			"content": "Emitted and consumed events"
		},
		{
			"heading": "contribution-points",
			"content": "`tasks`"
		},
		{
			"heading": "contribution-points",
			"content": "Glob of task files"
		},
		{
			"heading": "contribution-points",
			"content": "Scheduled background work"
		},
		{
			"heading": "contribution-points",
			"content": "`policies`"
		},
		{
			"heading": "contribution-points",
			"content": "Glob of policy files"
		},
		{
			"heading": "contribution-points",
			"content": "Authorization rules in the module's permission namespace"
		},
		{
			"heading": "contribution-points",
			"content": "`migrations`"
		},
		{
			"heading": "contribution-points",
			"content": "Directory"
		},
		{
			"heading": "contribution-points",
			"content": "Schema steps applied with the app's migrations"
		},
		{
			"heading": "contribution-points",
			"content": "`config`"
		},
		{
			"heading": "contribution-points",
			"content": "Object"
		},
		{
			"heading": "contribution-points",
			"content": "Namespaced defaults, overridable by the app"
		},
		{
			"heading": "contribution-points",
			"content": "`channels`"
		},
		{
			"heading": "contribution-points",
			"content": "Map of channel patterns"
		},
		{
			"heading": "contribution-points",
			"content": "Realtime channels plus their policies"
		},
		{
			"heading": "contribution-points",
			"content": "`boot`"
		},
		{
			"heading": "contribution-points",
			"content": "Async function"
		},
		{
			"heading": "contribution-points",
			"content": "Module startup — config, models, and providers are passed in"
		},
		{
			"heading": "contribution-points",
			"content": "`shutdown`"
		},
		{
			"heading": "contribution-points",
			"content": "Async function"
		},
		{
			"heading": "contribution-points",
			"content": "Module teardown, run during app shutdown"
		},
		{
			"heading": "contribution-points",
			"content": "`requires`"
		},
		{
			"heading": "contribution-points",
			"content": "Version ranges"
		},
		{
			"heading": "contribution-points",
			"content": "Declared peer requirements for `@kwiva/*` dependencies"
		},
		{
			"heading": "how-contributions-resolve",
			"content": "Each contribution merges into the application's existing scan:"
		},
		{
			"heading": "how-contributions-resolve",
			"content": "**Models** are registered under the module's namespace. A chat module contributing `messages` registers as `chat.messages`, gets the full generated-route surface, and appears in the typed client, OpenAPI spec, Studio, and MCP tools under that name."
		},
		{
			"heading": "how-contributions-resolve",
			"content": "**Controllers** mount their routes under the module's declared prefix, namespaced so they cannot collide with application routes."
		},
		{
			"heading": "how-contributions-resolve",
			"content": "**Pages** are mounted under the module's route scope, so a UI addon keeps its URLs to itself."
		},
		{
			"heading": "how-contributions-resolve",
			"content": "**Config** defaults register under the module's namespace and participate in the standard precedence: defaults → `src/config` values → inline `defineX` options, inline wins."
		},
		{
			"heading": "how-contributions-resolve",
			"content": "**Migrations** are applied with the app's migrations — ordered **before** application migrations and versioned by module version."
		},
		{
			"heading": "how-contributions-resolve",
			"content": "Because discovery is glob-based, adding a file to a module folder is adding a capability. No registry edits exist inside a module."
		},
		{
			"heading": "model-contributions-in-depth",
			"content": "A module model is a normal `defineModel` file. It derives everything an application model derives — table, generated REST routes, types, and Studio screens — but namespaced to the module:"
		},
		{
			"heading": "model-contributions-in-depth",
			"content": "The namespacing contract is what keeps two modules from colliding: the same file, in two different module folders, produces two disjoint resource names (`chat.messages` and `forum.messages`) that coexist in the same app."
		},
		{
			"heading": "model-contributions-in-depth",
			"content": "> \\[!TIP]\n> Because module config defaults register under their own namespace, an app can tighten a module's behavior without forking it. Overriding `chat.maxMessageLength` in `src/config/modules.ts` is a deep merge — the app wins, the module keeps shipping updates."
		},
		{
			"heading": "module-scope-and-boundaries",
			"content": "Modules follow hard contracts so that any number of them can coexist:"
		},
		{
			"heading": "module-scope-and-boundaries",
			"content": "**Namespacing** — model and resource names are prefixed by the module scope. A chat module's models become `chat.rooms` and `chat.messages`, never bare `rooms` and `messages`."
		},
		{
			"heading": "module-scope-and-boundaries",
			"content": "**Route prefixing** — page and route paths mount under the module's declared prefix. No two modules can claim the same namespace."
		},
		{
			"heading": "module-scope-and-boundaries",
			"content": "**Config namespacing** — module defaults register under their namespaces (`chat.maxMessageLength`) and can be overridden in the app's `src/config/modules.ts` via a deep merge where the app wins — the standard precedence (defaults → `src/config` → inline, inline wins)."
		},
		{
			"heading": "module-scope-and-boundaries",
			"content": "**Policy namespacing** — module policies live in the module's permission namespace (`chat.member`, not `member`)."
		},
		{
			"heading": "module-scope-and-boundaries",
			"content": "**Isolation** — modules never import each other's internals. They interoperate only through published contribution points, so upgrade paths stay clean."
		},
		{
			"heading": "module-scope-and-boundaries",
			"content": "**Migration ordering** — module migrations are ordered **before** application migrations and versioned by module version, so a module can evolve independently of the app."
		},
		{
			"heading": "module-scope-and-boundaries",
			"content": "This port discipline is enforced mechanically: module boundary rules are part of the default lint surface, so a module that reaches into another module's internals fails the gate rather than shipping."
		},
		{
			"heading": "co-located-assets",
			"content": "A module is a folder. Everything it contributes is referenced through lazy globs relative to the module entry, so the module's models, controllers, pages, and jobs stay co-located:"
		},
		{
			"heading": "co-located-assets",
			"content": "Because contributions are discovered by glob, adding a file to a module folder is adding a capability — no registry edits inside the module. The standard `kwiva make:*` generators can scaffold module folders, and file placement inside a module follows the same lowercase-kebab naming rules as application files."
		},
		{
			"heading": "lifecycle-and-peer-requirements",
			"content": "`boot` runs when the module joins the app, with typed access to config, models, and providers. This is where a module prepares its runtime — scheduling recurring work, seeding defaults, or warming a provider."
		},
		{
			"heading": "lifecycle-and-peer-requirements",
			"content": "`shutdown` runs during app teardown, inverting boot order with the rest of the kernel. Providers stop, the queue drains, the engine stops — a module's teardown slots into that sequence."
		},
		{
			"heading": "lifecycle-and-peer-requirements",
			"content": "`requires` declares compatible versions of `@kwiva/*` packages; addon tooling respects these ranges when resolving upgrades. Resolution rejects incompatible combinations rather than running them, and `kwiva addons update` will not jump outside a declared range."
		},
		{
			"heading": "writing-a-module-step-by-step",
			"content": "**Scaffold** — `kwiva make:module analytics` creates `modules/analytics/` with slots for each contribution type."
		},
		{
			"heading": "writing-a-module-step-by-step",
			"content": "**Declare the entry** — fill in `name`, `version`, and `requires` on the `defineModule` call."
		},
		{
			"heading": "writing-a-module-step-by-step",
			"content": "**Add contributions** — drop model, controller, page, and job files into their folders; the globs pick them up."
		},
		{
			"heading": "writing-a-module-step-by-step",
			"content": "**Set config defaults** — namespaced defaults under `config`, documented so apps know what they can override."
		},
		{
			"heading": "writing-a-module-step-by-step",
			"content": "**Test against a real app** — register the module in `kwiva.config.ts` locally and exercise the routes, policies, and jobs it contributes."
		},
		{
			"heading": "writing-a-module-step-by-step",
			"content": "**Package** — `kwiva module:build` produces the distribution; publish to the registry tagged with the `kwiva-addon` keyword."
		},
		{
			"heading": "publishing-a-module",
			"content": "`kwiva module:build` packages the module: a package with the contribution manifest plus a compiled distribution (bundled output plus isolated type declarations). The registry contract is a published package that"
		},
		{
			"heading": "publishing-a-module",
			"content": "exports the `defineModule` result as its default export,"
		},
		{
			"heading": "publishing-a-module",
			"content": "is tagged with the `kwiva-addon` keyword in the package registry, and"
		},
		{
			"heading": "publishing-a-module",
			"content": "declares its `requires` ranges so apps resolve compatible versions."
		},
		{
			"heading": "publishing-a-module",
			"content": "Discoverability comes from the curated addon index behind `kwiva addons search`. See Addons & Distribution for the full workflow, and CLI Generators for `make:module` and the module build surface."
		},
		{
			"heading": "whats-next",
			"content": "Addons & Distribution — publish, install, and version modules"
		},
		{
			"heading": "whats-next",
			"content": "Application Composition — see modules join the kernel"
		},
		{
			"heading": "whats-next",
			"content": "Modules & Plugins — the composition model at a glance"
		},
		{
			"heading": "whats-next",
			"content": "The defineX Convention — one grammar across every factory"
		},
		{
			"heading": "whats-next",
			"content": "Data Models — what a module's `models` contribution derives"
		}
	],
	"headings": [
		{
			"id": "the-definemodule-factory",
			"content": "The `defineModule` Factory"
		},
		{
			"id": "contribution-points",
			"content": "Contribution Points"
		},
		{
			"id": "how-contributions-resolve",
			"content": "How Contributions Resolve"
		},
		{
			"id": "model-contributions-in-depth",
			"content": "Model Contributions in Depth"
		},
		{
			"id": "module-scope-and-boundaries",
			"content": "Module Scope and Boundaries"
		},
		{
			"id": "co-located-assets",
			"content": "Co-located Assets"
		},
		{
			"id": "lifecycle-and-peer-requirements",
			"content": "Lifecycle and Peer Requirements"
		},
		{
			"id": "writing-a-module-step-by-step",
			"content": "Writing a Module Step by Step"
		},
		{
			"id": "publishing-a-module",
			"content": "Publishing a Module"
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
		url: "#the-definemodule-factory",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)("code", { children: "defineModule" }),
			" Factory"
		] })
	},
	{
		depth: 2,
		url: "#contribution-points",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Contribution Points" })
	},
	{
		depth: 2,
		url: "#how-contributions-resolve",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How Contributions Resolve" })
	},
	{
		depth: 2,
		url: "#model-contributions-in-depth",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Model Contributions in Depth" })
	},
	{
		depth: 2,
		url: "#module-scope-and-boundaries",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Module Scope and Boundaries" })
	},
	{
		depth: 2,
		url: "#co-located-assets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Co-located Assets" })
	},
	{
		depth: 2,
		url: "#lifecycle-and-peer-requirements",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Lifecycle and Peer Requirements" })
	},
	{
		depth: 2,
		url: "#writing-a-module-step-by-step",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Writing a Module Step by Step" })
	},
	{
		depth: 2,
		url: "#publishing-a-module",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Publishing a Module" })
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
			"A module is a reusable capability package: a folder of contributions — models, controllers, pages, jobs, events, tasks, policies, migrations, config defaults, and channel policies — declared through the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
			" factory and installed into any Kwiva application as a unit. This page is the complete reference for authoring one."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "the-definemodule-factory",
			children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
				" Factory"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A module is defined with the same declarative convention as everything else in Kwiva — one factory, plain serializable options, zero classes and zero decorators. The signature follows the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" grammar you already know."
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
			title: "modules/chat/index.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// modules/chat/index.ts"
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
							children: " { defineModule } "
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
							children: " defineModule"
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
							children: "  name: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'@acme/chat'"
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
							children: "  version: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'1.2.0'"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // contribution points — all optional"
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
							children: "  models"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":      () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
							children: "'./models/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),      "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// rooms, messages"
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
							children: "  controllers"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
							children: "'./controllers/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "), "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// chat"
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
							children: "  middleware"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":  () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
							children: "'./middleware/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
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
							children: "  pages"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":       () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
							children: "'./pages/**/*.tsx'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// ui additions"
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
							children: "  jobs"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":        () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
							children: "'./jobs/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
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
							children: "  events"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":      () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
							children: "'./events/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
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
							children: "  tasks"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":       () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
							children: "'./tasks/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
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
							children: "  policies"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":    () "
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "meta"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "glob"
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
							children: "'./policies/*.ts'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
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
							children: "  migrations:  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'./migrations'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",                                "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// applied with app migrations"
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
							children: "  config:      { chat: { maxMessageLength: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "2000"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } },          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// namespaced defaults"
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
							children: "  channels:    { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'chat.{roomId}'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": { policy: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'chat.member'"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // module lifecycle"
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
							children: "  boot"
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
							children: "config"
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
							children: "providers"
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
							children: " { "
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  shutdown"
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
							children: " () "
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
							children: " { "
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
							children: " },"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // peer requirements"
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
							children: "  requires: { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'@kwiva/core'"
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
							children: "'^1'"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'@kwiva/auth'"
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
							children: "'^1'"
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
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "name" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "version" }),
			" identify the module; everything else is optional. A module that ships only pages is as valid as one that ships the full vertical stack. Every contribution lives behind a lazy glob so the framework only loads what the app actually uses."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "contribution-points",
			children: "Contribution Points"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Contribution" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Shape" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it adds to the app" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Glob of model files" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Database tables, generated routes, types, Studio screens" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "controllers" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Glob of controller files" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "HTTP routes under the module's scope" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "middleware" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Glob of middleware files" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pipeline stages available to the app" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pages" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Glob of page files" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "UI additions registered under the module's route scope" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "jobs" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Glob of job files" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Queueable background work" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "events" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Glob of event files" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Emitted and consumed events" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tasks" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Glob of task files" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scheduled background work" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "policies" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Glob of policy files" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authorization rules in the module's permission namespace" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "migrations" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Directory" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Schema steps applied with the app's migrations" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Object" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Namespaced defaults, overridable by the app" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "channels" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Map of channel patterns" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Realtime channels plus their policies" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "boot" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Async function" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Module startup — config, models, and providers are passed in" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "shutdown" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Async function" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Module teardown, run during app shutdown" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Version ranges" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Declared peer requirements for ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
					" dependencies"
				] })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-contributions-resolve",
			children: "How Contributions Resolve"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each contribution merges into the application's existing scan:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Models" }),
				" are registered under the module's namespace. A chat module contributing ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "messages" }),
				" registers as ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.messages" }),
				", gets the full generated-route surface, and appears in the typed client, OpenAPI spec, Studio, and MCP tools under that name."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Controllers" }), " mount their routes under the module's declared prefix, namespaced so they cannot collide with application routes."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Pages" }), " are mounted under the module's route scope, so a UI addon keeps its URLs to itself."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Config" }),
				" defaults register under the module's namespace and participate in the standard precedence: defaults → ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config" }),
				" values → inline ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" options, inline wins."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Migrations" }),
				" are applied with the app's migrations — ordered ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "before" }),
				" application migrations and versioned by module version."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because discovery is glob-based, adding a file to a module folder is adding a capability. No registry edits exist inside a module." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "model-contributions-in-depth",
			children: "Model Contributions in Depth"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A module model is a normal ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			" file. It derives everything an application model derives — table, generated REST routes, types, and Studio screens — but namespaced to the module:"
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
			title: "modules/chat/models/messages.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// modules/chat/models/messages.ts"
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
							children: "'messages'"
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
							children: "  roomId: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "foreignKey"
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
							children: "'rooms'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
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
							children: "  authorId: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "foreignKey"
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
							children: "'users'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),"
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
						children: "}), {"
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
							children: "  timestamps: "
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  permission: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'chat'"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The namespacing contract is what keeps two modules from colliding: the same file, in two different module folders, produces two disjoint resource names (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.messages" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "forum.messages" }),
			") that coexist in the same app."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!TIP]\nBecause module config defaults register under their own namespace, an app can tighten a module's behavior without forking it. Overriding ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.maxMessageLength" }),
				" in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/modules.ts" }),
				" is a deep merge — the app wins, the module keeps shipping updates."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "module-scope-and-boundaries",
			children: "Module Scope and Boundaries"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Modules follow hard contracts so that any number of them can coexist:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Namespacing" }),
				" — model and resource names are prefixed by the module scope. A chat module's models become ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.rooms" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.messages" }),
				", never bare ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rooms" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "messages" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Route prefixing" }), " — page and route paths mount under the module's declared prefix. No two modules can claim the same namespace."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Config namespacing" }),
				" — module defaults register under their namespaces (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.maxMessageLength" }),
				") and can be overridden in the app's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/modules.ts" }),
				" via a deep merge where the app wins — the standard precedence (defaults → ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config" }),
				" → inline, inline wins)."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Policy namespacing" }),
				" — module policies live in the module's permission namespace (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.member" }),
				", not ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "member" }),
				")."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Isolation" }), " — modules never import each other's internals. They interoperate only through published contribution points, so upgrade paths stay clean."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Migration ordering" }),
				" — module migrations are ordered ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "before" }),
				" application migrations and versioned by module version, so a module can evolve independently of the app."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This port discipline is enforced mechanically: module boundary rules are part of the default lint surface, so a module that reaches into another module's internals fails the gate rather than shipping." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "co-located-assets",
			children: "Co-located Assets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A module is a folder. Everything it contributes is referenced through lazy globs relative to the module entry, so the module's models, controllers, pages, and jobs stay co-located:" }),
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
			title: "co-located-assets.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "modules/chat/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ index.ts                  # defineModule entry" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ models/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  ├─ rooms.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  └─ messages.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ controllers/chat.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ middleware/chat-auth.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ policies/chat.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ pages/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "│  └─ index.tsx" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ jobs/send-message-notification.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ events/message-posted.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "├─ tasks/archive-old-rooms.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "└─ migrations/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   ├─ 0001_create_rooms.ts" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "   └─ 0002_create_messages.ts" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because contributions are discovered by glob, adding a file to a module folder is adding a capability — no registry edits inside the module. The standard ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:*" }),
			" generators can scaffold module folders, and file placement inside a module follows the same lowercase-kebab naming rules as application files."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "lifecycle-and-peer-requirements",
			children: "Lifecycle and Peer Requirements"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "boot" }), " runs when the module joins the app, with typed access to config, models, and providers. This is where a module prepares its runtime — scheduling recurring work, seeding defaults, or warming a provider."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "shutdown" }), " runs during app teardown, inverting boot order with the rest of the kernel. Providers stop, the queue drains, the engine stops — a module's teardown slots into that sequence."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
				" declares compatible versions of ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" packages; addon tooling respects these ranges when resolving upgrades. Resolution rejects incompatible combinations rather than running them, and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons update" }),
				" will not jump outside a declared range."
			] }),
			"\n"
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
			title: "lifecycle-and-peer-requirements.ts",
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
							children: " defineModule"
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
							children: "  name: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'@acme/billing'"
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
							children: "  version: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'0.4.1'"
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
							children: "  requires: { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'@kwiva/core'"
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
							children: "'^1'"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'@kwiva/notifications'"
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
							children: "'^1'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  boot"
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
							children: "config"
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
							children: "jobs"
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
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "    if"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " (config.billing.dueReminders) {"
					})]
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
							children: "      jobs."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "schedule"
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
							children: "'billing.send-reminders'"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'0 9 * * *'"
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
						children: "    }"
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
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "writing-a-module-step-by-step",
			children: "Writing a Module Step by Step"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Scaffold" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:module analytics" }),
				" creates ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "modules/analytics/" }),
				" with slots for each contribution type."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Declare the entry" }),
				" — fill in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "name" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "version" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
				" on the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
				" call."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Add contributions" }), " — drop model, controller, page, and job files into their folders; the globs pick them up."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Set config defaults" }),
				" — namespaced defaults under ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "config" }),
				", documented so apps know what they can override."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Test against a real app" }),
				" — register the module in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
				" locally and exercise the routes, policies, and jobs it contributes."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Package" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva module:build" }),
				" produces the distribution; publish to the registry tagged with the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva-addon" }),
				" keyword."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "publishing-a-module",
			children: "Publishing a Module"
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
					children: " module:build"
				})]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva module:build" }), " packages the module: a package with the contribution manifest plus a compiled distribution (bundled output plus isolated type declarations). The registry contract is a published package that"] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"exports the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
				" result as its default export,"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"is tagged with the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva-addon" }),
				" keyword in the package registry, and"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"declares its ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
				" ranges so apps resolve compatible versions."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Discoverability comes from the curated addon index behind ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva addons search" }),
			". See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/addons",
				children: "Addons & Distribution"
			}),
			" for the full workflow, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/generators",
				children: "CLI Generators"
			}),
			" for ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:module" }),
			" and the module build surface."
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
				href: "/docs/modules-plugins/addons",
				children: "Addons & Distribution"
			}), " — publish, install, and version modules"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/composition",
				children: "Application Composition"
			}), " — see modules join the kernel"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins",
				children: "Modules & Plugins"
			}), " — the composition model at a glance"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}), " — one grammar across every factory"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Data Models"
				}),
				" — what a module's ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "models" }),
				" contribution derives"
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
