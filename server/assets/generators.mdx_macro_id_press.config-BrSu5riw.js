import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/cli/generators.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Generators",
	"description": "kwiva make:* — model, controller, middleware, auth, service, job, event, policy, task, command, page, seeder, module, and test stubs."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nGenerators are how new code enters a Kwiva project the right way. Every `kwiva make:*` command writes a file — or a set of files — following the framework's conventions: lowercase names, correct placement, and typed stubs that pass `kwiva check` before you write a single line. Generators are not snippets dropped on the filesystem; each maps one-to-one to a `defineX` construct, so the generated file is a faithful starting point for the real thing.\n\n## Full Reference [#full-reference]\n\n| Command                        | Creates                                               |\n| ------------------------------ | ----------------------------------------------------- |\n| `kwiva make:model <name>`      | `src/app/models/<name>.ts` plus migration and factory |\n| `kwiva make:controller <name>` | `src/app/http/controllers/<name>.ts`                  |\n| `kwiva make:middleware <name>` | `src/app/http/middleware/<name>.ts`                   |\n| `kwiva make:auth`              | `src/app/http/auth.ts` plus a users-model check       |\n| `kwiva make:service <name>`    | `src/app/services/<name>.ts`                          |\n| `kwiva make:job <name>`        | `src/app/jobs/<name>.ts`                              |\n| `kwiva make:event <name>`      | `src/app/events/<name>.ts`                            |\n| `kwiva make:policy <name>`     | `src/app/policies/<name>.ts`                          |\n| `kwiva make:task <name>`       | `src/app/tasks/<name>.ts`                             |\n| `kwiva make:command <name>`    | `src/app/console/<name>.ts`                           |\n| `kwiva make:page <path>`       | `src/ui/pages/<path>.tsx`                             |\n| `kwiva make:seeder <name>`     | `src/database/seeders/<name>.ts`                      |\n| `kwiva make:module <name>`     | `modules/<name>/` scaffold                            |\n| `kwiva make:test <name>`       | Matching test file                                    |\n\n## How Generators Work [#how-generators-work]\n\nGenerators share one pipeline. The `kwiva` CLI resolves the requested name, validates it against the naming conventions, computes the target path from the file type's home directory, and writes a typed stub. The stub imports from the correct `@kwiva/*` package, declares the expected `defineX` call, and wires options with sensible defaults. Because the output is typed and convention-shaped, a freshly generated file compiles and lints immediately — you extend it rather than fix it.\n\nThe placement rules mirror the [defineX convention](/docs/core-concepts/definex):\n\n```text title=\"how-generators-work.txt\"\nsrc/app/models/posts.ts            ← defineModel, singular filename\nsrc/app/http/controllers/posts.ts  ← defineController, plural filename\nsrc/app/jobs/send-welcome.ts       ← defineJob, kebab-case filename\nsrc/ui/pages/posts.$id.tsx         ← definePage, dot.route filename\n```\n\nTwo properties make the pipeline deterministic: the target path is always derived from the file type's home directory, and every generator runs through the same validation step before writing anything. Interrupted a generation halfway? Rerun it — the output is identical, because generators are idempotent.\n\n## Naming Rules [#naming-rules]\n\nGenerator arguments follow the naming conventions, and the CLI enforces them:\n\n* All lowercase, kebab-case: `make:job send-welcome`, not `SendWelcome`.\n* Models and policies use singular names (`post`, `user`); controllers use plural (`posts`, `users`).\n* Pages use the dot-route form (`posts.$id`, `settings.profile`) and land under `src/ui/pages/`.\n* The generated file name determines discoverability — the framework scans directories by name, so a correctly named file is automatically registered.\n\nNames that violate the conventions are rejected by the generator rather than producing a file that will fail the gate later. This is the mechanical edge of the framework's conventions: the folder structure, the keep, and the naming are not guidance, they are the surface the framework scans.\n\n## The Generators in Detail [#the-generators-in-detail]\n\n### Model — `make:model` [#model--makemodel]\n\n```bash title=\"terminal\"\nkwiva make:model post\n```\n\nGenerates the model file plus a model-diff migration and a factory:\n\n```ts title=\"src/app/models/posts.ts\"\n// src/app/models/posts.ts\nimport { defineModel } from '@kwiva/data'\n\nexport default defineModel('posts', (f) => ({\n  id: f.id(),\n  // add fields with the field DSL\n}), {\n  timestamps: true,\n})\n```\n\nThe migration is derived from the model definition — add fields to the model and regenerate. The factory gives you `Post.factory().count(10).create()` in tests and seeders. Because the model is the single source of truth, everything derived — routes, types, Studio screens, OpenAPI, and the typed client — recomputes from the DSL as you extend it. See [Models](/docs/data/models), [Migrations](/docs/data/migrations), and [Factories](/docs/data/factories).\n\n### Controller — `make:controller` [#controller--makecontroller]\n\n```bash title=\"terminal\"\nkwiva make:controller post\n```\n\nGenerates `src/app/http/controllers/posts.ts` with a `defineController` scaffold — resource handler stubs ready to be filled with `c.get`, `c.post`, and friends. The scaffold includes the controller options block (`prefix`, `tags`, `permission`), so a generated controller is already discoverable, documented, and gated before you add a handler. See [Controllers](/docs/http/controllers).\n\n### Middleware and Auth — `make:middleware` / `make:auth` [#middleware-and-auth--makemiddleware--makeauth]\n\n`make:middleware auth` writes `src/app/http/middleware/auth.ts` with a `defineMiddleware` scaffold. `make:auth` sets up the auth surface in `src/app/http/auth.ts` and checks that a users model exists to back sessions. Together they are the fastest path from a fresh scaffold to authenticated pages. See [Middleware](/docs/http/middleware) and [Authentication](/docs/auth/).\n\n### Service — `make:service` [#service--makeservice]\n\n```bash title=\"terminal\"\nkwiva make:service billing\n```\n\nGenerates `src/app/services/billing.ts` with a `defineService` scaffold for business logic that does not belong in a controller. Services are declared values — plain functions closed over their dependencies — so the generated shape is trivially unit-testable. See [Services](/docs/core-concepts/services).\n\n### Job and Event — `make:job` / `make:event` [#job-and-event--makejob--makeevent]\n\n```bash title=\"terminal\"\nkwiva make:job send-welcome\nkwiva make:event user-signed-up\n```\n\nJob stubs include the handler context, payload schema, and options block — `queue`, `attempts`, `backoff`, and so on — ready to configure. Event stubs declare the event's payload shape through the field DSL, so validation flows from field types at emit time. See [Jobs](/docs/background-work/jobs) and [Realtime Events](/docs/realtime/events).\n\n### Policy — `make:policy` [#policy--makepolicy]\n\n```bash title=\"terminal\"\nkwiva make:policy post\n```\n\nGenerates `src/app/policies/posts.ts` with a `definePolicy` scaffold. The policy namespace matches the model's `permission` option, so generated routes and screens enforce it immediately — write the ability checks, and the routes that reference the namespace inherit them. See [Authorization](/docs/authorization/).\n\n### Task — `make:task` [#task--maketask]\n\n```bash title=\"terminal\"\nkwiva make:task cleanup-sessions\n```\n\nGenerates `src/app/tasks/cleanup.ts` with a `defineTask` scaffold — handler, `timeout`, and `retries`. Register its cadence later in `src/config/schedule.ts`. See [Scheduled Tasks](/docs/background-work/scheduling).\n\n### Command — `make:command` [#command--makecommand]\n\n```bash title=\"terminal\"\nkwiva make:command import-legacy\n```\n\nGenerates `src/app/console/import-legacy.ts` with a `defineCommand` scaffold including `signature`, `description`, and `handle`. The command joins the CLI surface automatically under its signature. See [CLI](/docs/cli/).\n\n### Page — `make:page` [#page--makepage]\n\n```bash title=\"terminal\"\nkwiva make:page posts.$id\n```\n\nGenerates `src/ui/pages/posts.$id.tsx` — a `definePage` with `loader`, `component`, and error scaffolding. The dot-route filename determines the URL: `posts.$id` expresses a page under the `posts` route with an `id` parameter. See [Pages](/docs/frontend/pages).\n\n### Seeder — `make:seeder` [#seeder--makeseeder]\n\n```bash title=\"terminal\"\nkwiva make:seeder posts\n```\n\nGenerates `src/database/seeders/posts.ts` with a `defineSeeder` scaffold for idempotent, ordered data seeding. See [Seeders](/docs/data/seeders).\n\n### Module — `make:module` [#module--makemodule]\n\n```bash title=\"terminal\"\nkwiva make:module analytics\n```\n\nScaffolds `modules/analytics/` — an installable, composable unit with slots for its own models, controllers, pages, config, and migrations. The scaffold includes a `defineModule` entry with `name`, `version`, and `requires` slots, so a generated module is immediately composable and publishable. See [Modules](/docs/modules-plugins/defining-modules).\n\n### Test — `make:test` [#test--maketest]\n\n```bash title=\"terminal\"\nkwiva make:test post\n```\n\nGenerates a matching test file for the named construct, placed alongside the test suite layout for unit and integration tests. See [Testing](/docs/testing/).\n\n## Generators Upstream of the Details [#generators-upstream-of-the-details]\n\nThe one pattern to remember across every generator: **each `make:*` maps to one `defineX` construct**, and the generated file is the best wiring the framework knows for that construct. When a generator creates multiple files — `make:model` emits model + migration + factory — those files stay in sync by construction because they derive from the same definition as you extend it.\n\n## What's Next [#whats-next]\n\n* [Project & Lifecycle Commands](/docs/cli/project-commands) — run the gate on generated output\n* [The defineX Convention](/docs/core-concepts/definex) — the grammar every generator emits\n* [Models](/docs/data/models) — extend a generated model with the field DSL\n* [Controllers](/docs/http/controllers) — extend a generated controller with routes\n* [Addon Commands](/docs/cli/addon-commands) — install capabilities that bring their own files\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Generators are how new code enters a Kwiva project the right way. Every `kwiva make:*` command writes a file — or a set of files — following the framework's conventions: lowercase names, correct placement, and typed stubs that pass `kwiva check` before you write a single line. Generators are not snippets dropped on the filesystem; each maps one-to-one to a `defineX` construct, so the generated file is a faithful starting point for the real thing."
		},
		{
			"heading": "full-reference",
			"content": "Command"
		},
		{
			"heading": "full-reference",
			"content": "Creates"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:model <name>`"
		},
		{
			"heading": "full-reference",
			"content": "`src/app/models/<name>.ts` plus migration and factory"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:controller <name>`"
		},
		{
			"heading": "full-reference",
			"content": "`src/app/http/controllers/<name>.ts`"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:middleware <name>`"
		},
		{
			"heading": "full-reference",
			"content": "`src/app/http/middleware/<name>.ts`"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:auth`"
		},
		{
			"heading": "full-reference",
			"content": "`src/app/http/auth.ts` plus a users-model check"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:service <name>`"
		},
		{
			"heading": "full-reference",
			"content": "`src/app/services/<name>.ts`"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:job <name>`"
		},
		{
			"heading": "full-reference",
			"content": "`src/app/jobs/<name>.ts`"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:event <name>`"
		},
		{
			"heading": "full-reference",
			"content": "`src/app/events/<name>.ts`"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:policy <name>`"
		},
		{
			"heading": "full-reference",
			"content": "`src/app/policies/<name>.ts`"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:task <name>`"
		},
		{
			"heading": "full-reference",
			"content": "`src/app/tasks/<name>.ts`"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:command <name>`"
		},
		{
			"heading": "full-reference",
			"content": "`src/app/console/<name>.ts`"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:page <path>`"
		},
		{
			"heading": "full-reference",
			"content": "`src/ui/pages/<path>.tsx`"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:seeder <name>`"
		},
		{
			"heading": "full-reference",
			"content": "`src/database/seeders/<name>.ts`"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:module <name>`"
		},
		{
			"heading": "full-reference",
			"content": "`modules/<name>/` scaffold"
		},
		{
			"heading": "full-reference",
			"content": "`kwiva make:test <name>`"
		},
		{
			"heading": "full-reference",
			"content": "Matching test file"
		},
		{
			"heading": "how-generators-work",
			"content": "Generators share one pipeline. The `kwiva` CLI resolves the requested name, validates it against the naming conventions, computes the target path from the file type's home directory, and writes a typed stub. The stub imports from the correct `@kwiva/*` package, declares the expected `defineX` call, and wires options with sensible defaults. Because the output is typed and convention-shaped, a freshly generated file compiles and lints immediately — you extend it rather than fix it."
		},
		{
			"heading": "how-generators-work",
			"content": "The placement rules mirror the defineX convention:"
		},
		{
			"heading": "how-generators-work",
			"content": "Two properties make the pipeline deterministic: the target path is always derived from the file type's home directory, and every generator runs through the same validation step before writing anything. Interrupted a generation halfway? Rerun it — the output is identical, because generators are idempotent."
		},
		{
			"heading": "naming-rules",
			"content": "Generator arguments follow the naming conventions, and the CLI enforces them:"
		},
		{
			"heading": "naming-rules",
			"content": "All lowercase, kebab-case: `make:job send-welcome`, not `SendWelcome`."
		},
		{
			"heading": "naming-rules",
			"content": "Models and policies use singular names (`post`, `user`); controllers use plural (`posts`, `users`)."
		},
		{
			"heading": "naming-rules",
			"content": "Pages use the dot-route form (`posts.$id`, `settings.profile`) and land under `src/ui/pages/`."
		},
		{
			"heading": "naming-rules",
			"content": "The generated file name determines discoverability — the framework scans directories by name, so a correctly named file is automatically registered."
		},
		{
			"heading": "naming-rules",
			"content": "Names that violate the conventions are rejected by the generator rather than producing a file that will fail the gate later. This is the mechanical edge of the framework's conventions: the folder structure, the keep, and the naming are not guidance, they are the surface the framework scans."
		},
		{
			"heading": "model--makemodel",
			"content": "Generates the model file plus a model-diff migration and a factory:"
		},
		{
			"heading": "model--makemodel",
			"content": "The migration is derived from the model definition — add fields to the model and regenerate. The factory gives you `Post.factory().count(10).create()` in tests and seeders. Because the model is the single source of truth, everything derived — routes, types, Studio screens, OpenAPI, and the typed client — recomputes from the DSL as you extend it. See Models, Migrations, and Factories."
		},
		{
			"heading": "controller--makecontroller",
			"content": "Generates `src/app/http/controllers/posts.ts` with a `defineController` scaffold — resource handler stubs ready to be filled with `c.get`, `c.post`, and friends. The scaffold includes the controller options block (`prefix`, `tags`, `permission`), so a generated controller is already discoverable, documented, and gated before you add a handler. See Controllers."
		},
		{
			"heading": "middleware-and-auth--makemiddleware--makeauth",
			"content": "`make:middleware auth` writes `src/app/http/middleware/auth.ts` with a `defineMiddleware` scaffold. `make:auth` sets up the auth surface in `src/app/http/auth.ts` and checks that a users model exists to back sessions. Together they are the fastest path from a fresh scaffold to authenticated pages. See Middleware and Authentication."
		},
		{
			"heading": "service--makeservice",
			"content": "Generates `src/app/services/billing.ts` with a `defineService` scaffold for business logic that does not belong in a controller. Services are declared values — plain functions closed over their dependencies — so the generated shape is trivially unit-testable. See Services."
		},
		{
			"heading": "job-and-event--makejob--makeevent",
			"content": "Job stubs include the handler context, payload schema, and options block — `queue`, `attempts`, `backoff`, and so on — ready to configure. Event stubs declare the event's payload shape through the field DSL, so validation flows from field types at emit time. See Jobs and Realtime Events."
		},
		{
			"heading": "policy--makepolicy",
			"content": "Generates `src/app/policies/posts.ts` with a `definePolicy` scaffold. The policy namespace matches the model's `permission` option, so generated routes and screens enforce it immediately — write the ability checks, and the routes that reference the namespace inherit them. See Authorization."
		},
		{
			"heading": "task--maketask",
			"content": "Generates `src/app/tasks/cleanup.ts` with a `defineTask` scaffold — handler, `timeout`, and `retries`. Register its cadence later in `src/config/schedule.ts`. See Scheduled Tasks."
		},
		{
			"heading": "command--makecommand",
			"content": "Generates `src/app/console/import-legacy.ts` with a `defineCommand` scaffold including `signature`, `description`, and `handle`. The command joins the CLI surface automatically under its signature. See CLI."
		},
		{
			"heading": "page--makepage",
			"content": "Generates `src/ui/pages/posts.$id.tsx` — a `definePage` with `loader`, `component`, and error scaffolding. The dot-route filename determines the URL: `posts.$id` expresses a page under the `posts` route with an `id` parameter. See Pages."
		},
		{
			"heading": "seeder--makeseeder",
			"content": "Generates `src/database/seeders/posts.ts` with a `defineSeeder` scaffold for idempotent, ordered data seeding. See Seeders."
		},
		{
			"heading": "module--makemodule",
			"content": "Scaffolds `modules/analytics/` — an installable, composable unit with slots for its own models, controllers, pages, config, and migrations. The scaffold includes a `defineModule` entry with `name`, `version`, and `requires` slots, so a generated module is immediately composable and publishable. See Modules."
		},
		{
			"heading": "test--maketest",
			"content": "Generates a matching test file for the named construct, placed alongside the test suite layout for unit and integration tests. See Testing."
		},
		{
			"heading": "generators-upstream-of-the-details",
			"content": "The one pattern to remember across every generator: **each `make:*` maps to one `defineX` construct**, and the generated file is the best wiring the framework knows for that construct. When a generator creates multiple files — `make:model` emits model + migration + factory — those files stay in sync by construction because they derive from the same definition as you extend it."
		},
		{
			"heading": "whats-next",
			"content": "Project & Lifecycle Commands — run the gate on generated output"
		},
		{
			"heading": "whats-next",
			"content": "The defineX Convention — the grammar every generator emits"
		},
		{
			"heading": "whats-next",
			"content": "Models — extend a generated model with the field DSL"
		},
		{
			"heading": "whats-next",
			"content": "Controllers — extend a generated controller with routes"
		},
		{
			"heading": "whats-next",
			"content": "Addon Commands — install capabilities that bring their own files"
		}
	],
	"headings": [
		{
			"id": "full-reference",
			"content": "Full Reference"
		},
		{
			"id": "how-generators-work",
			"content": "How Generators Work"
		},
		{
			"id": "naming-rules",
			"content": "Naming Rules"
		},
		{
			"id": "the-generators-in-detail",
			"content": "The Generators in Detail"
		},
		{
			"id": "model--makemodel",
			"content": "Model — `make:model`"
		},
		{
			"id": "controller--makecontroller",
			"content": "Controller — `make:controller`"
		},
		{
			"id": "middleware-and-auth--makemiddleware--makeauth",
			"content": "Middleware and Auth — `make:middleware` / `make:auth`"
		},
		{
			"id": "service--makeservice",
			"content": "Service — `make:service`"
		},
		{
			"id": "job-and-event--makejob--makeevent",
			"content": "Job and Event — `make:job` / `make:event`"
		},
		{
			"id": "policy--makepolicy",
			"content": "Policy — `make:policy`"
		},
		{
			"id": "task--maketask",
			"content": "Task — `make:task`"
		},
		{
			"id": "command--makecommand",
			"content": "Command — `make:command`"
		},
		{
			"id": "page--makepage",
			"content": "Page — `make:page`"
		},
		{
			"id": "seeder--makeseeder",
			"content": "Seeder — `make:seeder`"
		},
		{
			"id": "module--makemodule",
			"content": "Module — `make:module`"
		},
		{
			"id": "test--maketest",
			"content": "Test — `make:test`"
		},
		{
			"id": "generators-upstream-of-the-details",
			"content": "Generators Upstream of the Details"
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
		url: "#how-generators-work",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How Generators Work" })
	},
	{
		depth: 2,
		url: "#naming-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Naming Rules" })
	},
	{
		depth: 2,
		url: "#the-generators-in-detail",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Generators in Detail" })
	},
	{
		depth: 3,
		url: "#model--makemodel",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Model — ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "make:model" })] })
	},
	{
		depth: 3,
		url: "#controller--makecontroller",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Controller — ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "make:controller" })] })
	},
	{
		depth: 3,
		url: "#middleware-and-auth--makemiddleware--makeauth",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
			"Middleware and Auth — ",
			(0, import_jsx_runtime_react_server.jsx)("code", { children: "make:middleware" }),
			" / ",
			(0, import_jsx_runtime_react_server.jsx)("code", { children: "make:auth" })
		] })
	},
	{
		depth: 3,
		url: "#service--makeservice",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Service — ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "make:service" })] })
	},
	{
		depth: 3,
		url: "#job-and-event--makejob--makeevent",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
			"Job and Event — ",
			(0, import_jsx_runtime_react_server.jsx)("code", { children: "make:job" }),
			" / ",
			(0, import_jsx_runtime_react_server.jsx)("code", { children: "make:event" })
		] })
	},
	{
		depth: 3,
		url: "#policy--makepolicy",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Policy — ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "make:policy" })] })
	},
	{
		depth: 3,
		url: "#task--maketask",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Task — ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "make:task" })] })
	},
	{
		depth: 3,
		url: "#command--makecommand",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Command — ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "make:command" })] })
	},
	{
		depth: 3,
		url: "#page--makepage",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Page — ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "make:page" })] })
	},
	{
		depth: 3,
		url: "#seeder--makeseeder",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Seeder — ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "make:seeder" })] })
	},
	{
		depth: 3,
		url: "#module--makemodule",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Module — ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "make:module" })] })
	},
	{
		depth: 3,
		url: "#test--maketest",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: ["Test — ", (0, import_jsx_runtime_react_server.jsx)("code", { children: "make:test" })] })
	},
	{
		depth: 2,
		url: "#generators-upstream-of-the-details",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generators Upstream of the Details" })
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
		h3: "h3",
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
			"Generators are how new code enters a Kwiva project the right way. Every ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:*" }),
			" command writes a file — or a set of files — following the framework's conventions: lowercase names, correct placement, and typed stubs that pass ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
			" before you write a single line. Generators are not snippets dropped on the filesystem; each maps one-to-one to a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" construct, so the generated file is a faithful starting point for the real thing."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "full-reference",
			children: "Full Reference"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Command" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Creates" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:model <name>" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/<name>.ts" }), " plus migration and factory"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:controller <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/controllers/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:middleware <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/middleware/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:auth" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/auth.ts" }), " plus a users-model check"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:service <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/services/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:job <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:event <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/events/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:policy <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/policies/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:task <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/tasks/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:command <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/console/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:page <path>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/<path>.tsx" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:seeder <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/database/seeders/<name>.ts" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:module <name>" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "modules/<name>/" }), " scaffold"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:test <name>" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Matching test file" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-generators-work",
			children: "How Generators Work"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Generators share one pipeline. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva" }),
			" CLI resolves the requested name, validates it against the naming conventions, computes the target path from the file type's home directory, and writes a typed stub. The stub imports from the correct ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
			" package, declares the expected ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" call, and wires options with sensible defaults. Because the output is typed and convention-shaped, a freshly generated file compiles and lints immediately — you extend it rather than fix it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The placement rules mirror the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "defineX convention"
			}),
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
			title: "how-generators-work.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/models/posts.ts            ← defineModel, singular filename" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/http/controllers/posts.ts  ← defineController, plural filename" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/jobs/send-welcome.ts       ← defineJob, kebab-case filename" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/ui/pages/posts.$id.tsx         ← definePage, dot.route filename" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two properties make the pipeline deterministic: the target path is always derived from the file type's home directory, and every generator runs through the same validation step before writing anything. Interrupted a generation halfway? Rerun it — the output is identical, because generators are idempotent." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "naming-rules",
			children: "Naming Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Generator arguments follow the naming conventions, and the CLI enforces them:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"All lowercase, kebab-case: ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:job send-welcome" }),
				", not ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "SendWelcome" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Models and policies use singular names (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "post" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user" }),
				"); controllers use plural (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "users" }),
				")."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Pages use the dot-route form (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.$id" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "settings.profile" }),
				") and land under ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The generated file name determines discoverability — the framework scans directories by name, so a correctly named file is automatically registered." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Names that violate the conventions are rejected by the generator rather than producing a file that will fail the gate later. This is the mechanical edge of the framework's conventions: the folder structure, the keep, and the naming are not guidance, they are the surface the framework scans." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-generators-in-detail",
			children: "The Generators in Detail"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "model--makemodel",
			children: ["Model — ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:model" })]
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
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Generates the model file plus a model-diff migration and a factory:" }),
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
			title: "src/app/models/posts.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/models/posts.ts"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // add fields with the field DSL"
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
			"The migration is derived from the model definition — add fields to the model and regenerate. The factory gives you ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Post.factory().count(10).create()" }),
			" in tests and seeders. Because the model is the single source of truth, everything derived — routes, types, Studio screens, OpenAPI, and the typed client — recomputes from the DSL as you extend it. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/migrations",
				children: "Migrations"
			}),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/factories",
				children: "Factories"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "controller--makecontroller",
			children: ["Controller — ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:controller" })]
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
						children: " make:controller"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " post"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Generates ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/controllers/posts.ts" }),
			" with a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
			" scaffold — resource handler stubs ready to be filled with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "c.get" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "c.post" }),
			", and friends. The scaffold includes the controller options block (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "prefix" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "tags" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			"), so a generated controller is already discoverable, documented, and gated before you add a handler. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/controllers",
				children: "Controllers"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "middleware-and-auth--makemiddleware--makeauth",
			children: [
				"Middleware and Auth — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:middleware" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:auth" })
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:middleware auth" }),
			" writes ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/middleware/auth.ts" }),
			" with a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMiddleware" }),
			" scaffold. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:auth" }),
			" sets up the auth surface in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/auth.ts" }),
			" and checks that a users model exists to back sessions. Together they are the fastest path from a fresh scaffold to authenticated pages. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/middleware",
				children: "Middleware"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/",
				children: "Authentication"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "service--makeservice",
			children: ["Service — ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:service" })]
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
						children: " make:service"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " billing"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Generates ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/services/billing.ts" }),
			" with a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineService" }),
			" scaffold for business logic that does not belong in a controller. Services are declared values — plain functions closed over their dependencies — so the generated shape is trivially unit-testable. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/services",
				children: "Services"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "job-and-event--makejob--makeevent",
			children: [
				"Job and Event — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:job" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:event" })
			]
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
							children: " make:job"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " send-welcome"
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
							children: " make:event"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " user-signed-up"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Job stubs include the handler context, payload schema, and options block — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queue" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "attempts" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "backoff" }),
			", and so on — ready to configure. Event stubs declare the event's payload shape through the field DSL, so validation flows from field types at emit time. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/jobs",
				children: "Jobs"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/events",
				children: "Realtime Events"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "policy--makepolicy",
			children: ["Policy — ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:policy" })]
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
						children: " make:policy"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " post"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Generates ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/policies/posts.ts" }),
			" with a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			" scaffold. The policy namespace matches the model's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission" }),
			" option, so generated routes and screens enforce it immediately — write the ability checks, and the routes that reference the namespace inherit them. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/",
				children: "Authorization"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "task--maketask",
			children: ["Task — ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:task" })]
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
						children: " make:task"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " cleanup-sessions"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Generates ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/tasks/cleanup.ts" }),
			" with a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }),
			" scaffold — handler, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "timeout" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "retries" }),
			". Register its cadence later in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/schedule.ts" }),
			". See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/scheduling",
				children: "Scheduled Tasks"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "command--makecommand",
			children: ["Command — ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:command" })]
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
						children: " make:command"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " import-legacy"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Generates ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/console/import-legacy.ts" }),
			" with a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineCommand" }),
			" scaffold including ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "signature" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "description" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "handle" }),
			". The command joins the CLI surface automatically under its signature. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/",
				children: "CLI"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "page--makepage",
			children: ["Page — ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:page" })]
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
						children: "$id"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Generates ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/posts.$id.tsx" }),
			" — a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			" with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "loader" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "component" }),
			", and error scaffolding. The dot-route filename determines the URL: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.$id" }),
			" expresses a page under the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
			" route with an ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "id" }),
			" parameter. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/pages",
				children: "Pages"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "seeder--makeseeder",
			children: ["Seeder — ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:seeder" })]
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
						children: " make:seeder"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " posts"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Generates ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/database/seeders/posts.ts" }),
			" with a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineSeeder" }),
			" scaffold for idempotent, ordered data seeding. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/seeders",
				children: "Seeders"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "module--makemodule",
			children: ["Module — ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:module" })]
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
						children: " make:module"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " analytics"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Scaffolds ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "modules/analytics/" }),
			" — an installable, composable unit with slots for its own models, controllers, pages, config, and migrations. The scaffold includes a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
			" entry with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "name" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "version" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requires" }),
			" slots, so a generated module is immediately composable and publishable. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/modules-plugins/defining-modules",
				children: "Modules"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h3, {
			id: "test--maketest",
			children: ["Test — ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:test" })]
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
						children: " make:test"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " post"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Generates a matching test file for the named construct, placed alongside the test suite layout for unit and integration tests. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/testing/",
				children: "Testing"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generators-upstream-of-the-details",
			children: "Generators Upstream of the Details"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The one pattern to remember across every generator: ",
			(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [
				"each ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:*" }),
				" maps to one ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" construct"
			] }),
			", and the generated file is the best wiring the framework knows for that construct. When a generator creates multiple files — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:model" }),
			" emits model + migration + factory — those files stay in sync by construction because they derive from the same definition as you extend it."
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
				href: "/docs/cli/project-commands",
				children: "Project & Lifecycle Commands"
			}), " — run the gate on generated output"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}), " — the grammar every generator emits"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/models",
				children: "Models"
			}), " — extend a generated model with the field DSL"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/controllers",
				children: "Controllers"
			}), " — extend a generated controller with routes"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/addon-commands",
				children: "Addon Commands"
			}), " — install capabilities that bring their own files"] }),
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
